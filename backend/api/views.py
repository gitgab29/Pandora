from datetime import timedelta

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import User, Asset, Accessory, TransactionLog
from .serializers import (
    UserSerializer, AssetSerializer,
    AccessorySerializer, TransactionLogSerializer,
)

# Statuses that represent a temporary, "abnormal" state. Transitioning *into*
# one of these saves the prior status into `previous_status` so it can be
# restored later. Transitioning *out* (back to AVAILABLE/DEPLOYED) must NOT
# overwrite `previous_status` — that would lose the original state.
_ABNORMAL_STATUSES = frozenset({
    'IN_REPAIR', 'IN_MAINTENANCE', 'TO_AUDIT', 'LOST',
})

# Maps Asset.Status → the specific TransactionType for status-change events
_STATUS_TX_TYPE = {
    Asset.Status.IN_REPAIR:      TransactionLog.TransactionType.STATUS_IN_REPAIR,
    Asset.Status.IN_MAINTENANCE: TransactionLog.TransactionType.STATUS_IN_MAINTENANCE,
    Asset.Status.LOST:           TransactionLog.TransactionType.STATUS_LOST,
    Asset.Status.TO_AUDIT:       TransactionLog.TransactionType.STATUS_TO_AUDIT,
    Asset.Status.AVAILABLE:      TransactionLog.TransactionType.STATUS_AVAILABLE,
    Asset.Status.DEPLOYED:       TransactionLog.TransactionType.STATUS_DEPLOYED,
}

_STATUS_DESC = {
    Asset.Status.IN_REPAIR:      'set to In Repair',
    Asset.Status.IN_MAINTENANCE: 'set to In Maintenance',
    Asset.Status.LOST:           'marked as Lost',
    Asset.Status.TO_AUDIT:       'flagged for Audit',
    Asset.Status.AVAILABLE:      'marked as Available',
    Asset.Status.DEPLOYED:       'set to Deployed',
}


# ── Shared archive helpers ────────────────────────────────────────────────────

def _do_archive(obj, performed_by, reason, notes=''):
    obj.is_archived    = True
    obj.archive_reason = reason
    obj.archived_at    = timezone.now()
    obj.archived_by    = performed_by
    obj.archive_notes  = notes
    obj.save()


def _do_restore(obj):
    obj.is_archived    = False
    obj.archive_reason = ''
    obj.archived_at    = None
    obj.archived_by    = None
    obj.archive_notes  = ''
    obj.save()


# ── ViewSets ──────────────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'business_group', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'badge_number', 'business_group']
    ordering_fields = ['last_name', 'first_name', 'business_group', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_queryset(self):
        act = getattr(self, 'action', None)
        qs = User.objects.select_related('supervisor', 'archived_by')

        if act in ('restore', 'hard_delete'):
            return qs.filter(is_archived=True)

        include_archived = self.request.query_params.get('include_archived', '0')
        archived_only    = self.request.query_params.get('archived_only',    '0')
        archive_reason   = self.request.query_params.get('archive_reason',    '')

        if archived_only == '1':
            qs = qs.filter(is_archived=True)
        elif include_archived != '1':
            qs = qs.filter(is_archived=False)

        if archive_reason:
            qs = qs.filter(archive_reason=archive_reason)
        return qs

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        user  = self.get_object()
        notes = request.data.get('notes', '')
        # Auto check-in all assets held by this user
        for asset in Asset.objects.filter(assigned_to=user, is_archived=False):
            prev = asset.assigned_to
            asset.assigned_to = None
            asset.status = Asset.Status.AVAILABLE
            asset.save()
            TransactionLog.objects.create(
                performed_by=request.user,
                transaction_type=TransactionLog.TransactionType.CHECK_IN,
                asset=asset,
                from_user=prev,
                event_description=f'Asset {asset.asset_tag} auto-checked in — holder removed from system',
            )
        user.is_active = False
        _do_archive(user, request.user, 'DELETED', notes)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ARCHIVE,
            to_user=user,
            event_description=f'User {user.first_name} {user.last_name} ({user.email}) removed from system',
            notes=notes,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def retire(self, request, pk=None):
        user  = self.get_object()
        notes = request.data.get('archive_notes', '')
        for asset in Asset.objects.filter(assigned_to=user, is_archived=False):
            prev = asset.assigned_to
            asset.assigned_to = None
            asset.status = Asset.Status.AVAILABLE
            asset.save()
            TransactionLog.objects.create(
                performed_by=request.user,
                transaction_type=TransactionLog.TransactionType.CHECK_IN,
                asset=asset,
                from_user=prev,
                event_description=f'Asset {asset.asset_tag} auto-checked in — holder retired',
            )
        user.is_active = False
        _do_archive(user, request.user, 'RETIRED', notes)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ARCHIVE,
            to_user=user,
            event_description=f'User {user.first_name} {user.last_name} ({user.email}) marked as retired',
            notes=notes,
        )
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def restore(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        _do_restore(user)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.RESTORE,
            to_user=user,
            event_description=f'User {user.first_name} {user.last_name} ({user.email}) restored and reactivated',
        )
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['delete'], url_path='hard_delete')
    def hard_delete(self, request, pk=None):
        user = self.get_object()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'group', 'assigned_to']
    search_fields = ['asset_tag', 'serial_number', 'manufacturer', 'supplier']
    ordering_fields = ['asset_tag', 'category', 'status', 'purchase_date', 'created_at']
    ordering = ['asset_tag']

    def get_queryset(self):
        act = getattr(self, 'action', None)
        qs = Asset.objects.select_related('assigned_to', 'archived_by')

        if act in ('restore', 'hard_delete'):
            return qs.filter(is_archived=True)

        include_archived = self.request.query_params.get('include_archived', '0')
        archived_only    = self.request.query_params.get('archived_only',    '0')
        archive_reason   = self.request.query_params.get('archive_reason',    '')

        if archived_only == '1':
            qs = qs.filter(is_archived=True)
        elif include_archived != '1':
            qs = qs.filter(is_archived=False)

        if archive_reason:
            qs = qs.filter(archive_reason=archive_reason)
        return qs

    def _auto_checkin(self, asset, performed_by, reason_suffix='archiving'):
        if not asset.assigned_to:
            return
        prev = asset.assigned_to
        asset.assigned_to = None
        asset.status = Asset.Status.AVAILABLE
        asset.save()
        TransactionLog.objects.create(
            performed_by=performed_by,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            asset=asset,
            from_user=prev,
            event_description=f'Asset {asset.asset_tag} auto-checked in before {reason_suffix}',
        )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        asset = self.get_object()
        notes = request.data.get('notes', '')
        self._auto_checkin(asset, request.user, 'archiving')
        _do_archive(asset, request.user, 'DELETED', notes)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ARCHIVE,
            asset=asset,
            event_description=f'Asset {asset.asset_tag} moved to archive (permanently deleted)',
            notes=notes,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def retire(self, request, pk=None):
        asset = self.get_object()
        notes = request.data.get('archive_notes', '')
        self._auto_checkin(asset, request.user, 'retiring')
        _do_archive(asset, request.user, 'RETIRED', notes)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ARCHIVE,
            asset=asset,
            event_description=f'Asset {asset.asset_tag} retired and archived',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def restore(self, request, pk=None):
        asset = self.get_object()
        _do_restore(asset)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.RESTORE,
            asset=asset,
            event_description=f'Asset {asset.asset_tag} restored from archive',
        )
        return Response(AssetSerializer(asset).data)

    @action(detail=True, methods=['delete'], url_path='hard_delete')
    def hard_delete(self, request, pk=None):
        asset = self.get_object()
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='auto_archive_eol')
    @transaction.atomic
    def auto_archive_eol(self, request):
        today = timezone.now().date()
        assets = Asset.objects.filter(is_archived=False, end_of_life__lte=today)
        count = 0
        for asset in assets:
            self._auto_checkin(asset, request.user, 'EOL auto-archiving')
            _do_archive(asset, request.user, 'RETIRED', 'Auto-archived: end of life date passed')
            TransactionLog.objects.create(
                performed_by=request.user,
                transaction_type=TransactionLog.TransactionType.ARCHIVE,
                asset=asset,
                event_description=f'Asset {asset.asset_tag} automatically retired — end of life date reached ({asset.end_of_life})',
                notes='Auto-archived: end of life date passed',
            )
            count += 1
        return Response({'archived_count': count})

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def check_out(self, request, pk=None):
        user_id = request.data.get('user_id')
        notes   = request.data.get('notes', '')
        if not user_id:
            return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            to_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Lock the row to prevent two users from checking out the same asset simultaneously.
        asset = self.get_queryset().select_for_update().get(pk=pk)
        from_user = asset.assigned_to
        asset.assigned_to = to_user
        if asset.status not in _ABNORMAL_STATUSES:
            asset.previous_status = asset.status
        asset.status = Asset.Status.DEPLOYED
        asset.save()

        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            asset=asset,
            to_user=to_user,
            from_user=from_user,
            event_description=f'Asset {asset.asset_tag} checked out to {to_user.first_name} {to_user.last_name}',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def check_in(self, request, pk=None):
        notes = request.data.get('notes', '')
        asset = self.get_queryset().select_for_update().get(pk=pk)
        from_user = asset.assigned_to
        asset.assigned_to = None
        if asset.status not in _ABNORMAL_STATUSES:
            asset.previous_status = asset.status
        asset.status = Asset.Status.AVAILABLE
        asset.save()

        holder_name = f' from {from_user.first_name} {from_user.last_name}' if from_user else ''
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            asset=asset,
            from_user=from_user,
            event_description=f'Asset {asset.asset_tag} checked in{holder_name}',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def change_status(self, request, pk=None):
        new_status = request.data.get('status')
        notes      = request.data.get('notes', '')
        if new_status not in Asset.Status.values:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        asset = self.get_queryset().select_for_update().get(pk=pk)
        # Only save previous_status when entering an abnormal state from a normal one;
        # going abnormal→abnormal would otherwise lose the original normal status,
        # and normal→normal transitions don't need a restore point.
        if new_status in _ABNORMAL_STATUSES and asset.status not in _ABNORMAL_STATUSES:
            asset.previous_status = asset.status
        asset.status = new_status
        asset.save()
        tx_type = _STATUS_TX_TYPE.get(new_status, TransactionLog.TransactionType.ADJUSTMENT)
        desc    = _STATUS_DESC.get(new_status, f'status changed to {new_status}')
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=tx_type,
            asset=asset,
            event_description=f'Asset {asset.asset_tag} {desc}',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)


    @transaction.atomic
    def perform_update(self, serializer):
        serializer.save()
        asset = serializer.instance
        TransactionLog.objects.create(
            performed_by=self.request.user,
            transaction_type=TransactionLog.TransactionType.ADJUSTMENT,
            asset=asset,
            event_description=f'Asset {asset.asset_tag} details updated',
        )


class AccessoryViewSet(viewsets.ModelViewSet):
    serializer_class = AccessorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['item_name', 'model_number', 'manufacturer', 'supplier']
    ordering_fields = ['item_name', 'quantity_available', 'created_at']
    ordering = ['item_name']

    def get_queryset(self):
        act = getattr(self, 'action', None)
        qs = Accessory.objects.select_related('archived_by')

        if act in ('restore', 'hard_delete'):
            return qs.filter(is_archived=True)

        include_archived = self.request.query_params.get('include_archived', '0')
        archived_only    = self.request.query_params.get('archived_only',    '0')
        archive_reason   = self.request.query_params.get('archive_reason',    '')

        if archived_only == '1':
            qs = qs.filter(is_archived=True)
        elif include_archived != '1':
            qs = qs.filter(is_archived=False)

        if archive_reason:
            qs = qs.filter(archive_reason=archive_reason)
        return qs

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        accessory = self.get_object()
        notes     = request.data.get('notes', '')
        _do_archive(accessory, request.user, 'DELETED', notes)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ARCHIVE,
            accessory=accessory,
            event_description=f'{accessory.item_name} moved to archive (permanently deleted)',
            notes=notes,
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def retire(self, request, pk=None):
        accessory = self.get_object()
        notes     = request.data.get('archive_notes', '')
        _do_archive(accessory, request.user, 'RETIRED', notes)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ARCHIVE,
            accessory=accessory,
            event_description=f'{accessory.item_name} retired and archived',
            notes=notes,
        )
        return Response(AccessorySerializer(accessory).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def restore(self, request, pk=None):
        accessory = self.get_object()
        _do_restore(accessory)
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.RESTORE,
            accessory=accessory,
            event_description=f'{accessory.item_name} restored from archive',
        )
        return Response(AccessorySerializer(accessory).data)

    @transaction.atomic
    def perform_update(self, serializer):
        serializer.save()
        accessory = serializer.instance
        TransactionLog.objects.create(
            performed_by=self.request.user,
            transaction_type=TransactionLog.TransactionType.ADJUSTMENT,
            accessory=accessory,
            event_description=f'{accessory.item_name} details updated',
        )

    @action(detail=True, methods=['delete'], url_path='hard_delete')
    def hard_delete(self, request, pk=None):
        accessory = self.get_object()
        accessory.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def holders(self, request, pk=None):
        accessory = self.get_object()
        # Net quantity per user = sum(check_out qty as recipient) − sum(check_in qty as returner).
        # Compute via SQL aggregation rather than a Python loop.
        TX = TransactionLog.TransactionType
        out_rows = (
            TransactionLog.objects
            .filter(accessory=accessory, transaction_type=TX.CHECK_OUT, to_user__isnull=False)
            .values('to_user').annotate(qty=Sum('quantity'))
        )
        in_rows = (
            TransactionLog.objects
            .filter(accessory=accessory, transaction_type=TX.CHECK_IN, from_user__isnull=False)
            .values('from_user').annotate(qty=Sum('quantity'))
        )
        net = {}
        for row in out_rows:
            net[row['to_user']] = net.get(row['to_user'], 0) + (row['qty'] or 0)
        for row in in_rows:
            net[row['from_user']] = net.get(row['from_user'], 0) - (row['qty'] or 0)

        active_uids = [uid for uid, qty in net.items() if qty > 0]
        users = {u.id: u for u in User.objects.filter(pk__in=active_uids)}
        result = [
            {
                'id': str(users[uid].id),
                'first_name': users[uid].first_name,
                'last_name': users[uid].last_name,
                'quantity': net[uid],
            }
            for uid in active_uids if uid in users
        ]
        return Response(result)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def check_out(self, request, pk=None):
        qty     = int(request.data.get('quantity', 1))
        user_id = request.data.get('user_id')
        notes   = request.data.get('notes', '')
        to_user = None
        if user_id:
            try:
                to_user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Lock the accessory row to serialize concurrent quantity decrements.
        accessory = self.get_queryset().select_for_update().get(pk=pk)
        if accessory.quantity_available < qty:
            return Response({'detail': 'Insufficient quantity.'}, status=status.HTTP_400_BAD_REQUEST)
        accessory.quantity_available -= qty
        accessory.save()
        recipient = f' to {to_user.first_name} {to_user.last_name}' if to_user else ''
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            accessory=accessory,
            to_user=to_user,
            quantity=qty,
            event_description=f'{qty}x {accessory.item_name} checked out{recipient}',
            notes=notes,
        )
        return Response(AccessorySerializer(accessory).data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def check_in(self, request, pk=None):
        qty     = int(request.data.get('quantity', 1))
        notes   = request.data.get('notes', '')
        user_id = request.data.get('user_id')
        from_user = None
        if user_id:
            try:
                from_user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        accessory = self.get_queryset().select_for_update().get(pk=pk)
        accessory.quantity_available += qty
        accessory.save()
        returner = f' returned by {from_user.first_name} {from_user.last_name}' if from_user else ' checked in to inventory'
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            accessory=accessory,
            from_user=from_user,
            quantity=qty,
            event_description=f'{qty}x {accessory.item_name}{returner}',
            notes=notes,
        )
        return Response(AccessorySerializer(accessory).data)


class TransactionLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionLogSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'to_user']
    search_fields = ['event_description', 'notes', 'performed_by__first_name', 'performed_by__last_name']
    ordering_fields = ['transaction_date', 'created_at']
    ordering = ['-transaction_date']

    def get_queryset(self):
        qs = TransactionLog.objects.select_related(
            'performed_by', 'to_user', 'from_user', 'asset', 'accessory'
        )
        older_than_days  = self.request.query_params.get('older_than_days')
        within_last_days = self.request.query_params.get('within_last_days')
        if older_than_days:
            cutoff = timezone.now() - timedelta(days=int(older_than_days))
            qs = qs.filter(transaction_date__lt=cutoff)
        elif within_last_days:
            cutoff = timezone.now() - timedelta(days=int(within_last_days))
            qs = qs.filter(transaction_date__gte=cutoff)
        return qs
