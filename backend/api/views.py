from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import User, Asset, Accessory, TransactionLog
from .serializers import (
    UserSerializer, AssetSerializer,
    AccessorySerializer, TransactionLogSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'business_group', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'badge_number', 'business_group']
    ordering_fields = ['last_name', 'first_name', 'business_group', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_queryset(self):
        include_archived = self.request.query_params.get('include_archived', '0')
        qs = User.objects.select_related('supervisor')
        if include_archived != '1':
            qs = qs.filter(is_active=True)
        return qs


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('assigned_to').all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'group', 'assigned_to']
    search_fields = ['asset_tag', 'serial_number', 'manufacturer', 'supplier']
    ordering_fields = ['asset_tag', 'category', 'status', 'purchase_date', 'created_at']
    ordering = ['asset_tag']

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        asset = self.get_object()
        user_id = request.data.get('user_id')
        notes = request.data.get('notes', '')
        if not user_id:
            return Response({'detail': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            to_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        from_user = asset.assigned_to
        asset.assigned_to = to_user
        asset.status = Asset.Status.DEPLOYED
        asset.save()

        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            asset=asset,
            to_user=to_user,
            from_user=from_user,
            event_description=f'{asset.asset_tag} checked out to {to_user.first_name} {to_user.last_name}',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)

    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        asset = self.get_object()
        notes = request.data.get('notes', '')
        from_user = asset.assigned_to
        asset.assigned_to = None
        asset.status = Asset.Status.AVAILABLE
        asset.save()

        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            asset=asset,
            from_user=from_user,
            event_description=f'{asset.asset_tag} checked in',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        asset = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        if new_status not in Asset.Status.values:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        asset.status = new_status
        asset.save()
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.ADJUSTMENT,
            asset=asset,
            event_description=f'{asset.asset_tag} status changed to {new_status}',
            notes=notes,
        )
        return Response(AssetSerializer(asset).data)


class AccessoryViewSet(viewsets.ModelViewSet):
    queryset = Accessory.objects.all()
    serializer_class = AccessorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['item_name', 'model_number', 'manufacturer', 'supplier']
    ordering_fields = ['item_name', 'quantity_available', 'created_at']
    ordering = ['item_name']

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        accessory = self.get_object()
        qty = int(request.data.get('quantity', 1))
        user_id = request.data.get('user_id')
        notes = request.data.get('notes', '')
        if accessory.quantity_available < qty:
            return Response({'detail': 'Insufficient quantity.'}, status=status.HTTP_400_BAD_REQUEST)
        to_user = None
        if user_id:
            try:
                to_user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        accessory.quantity_available -= qty
        accessory.save()
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            accessory=accessory,
            to_user=to_user,
            quantity=qty,
            event_description=f'{qty}x {accessory.item_name} checked out',
            notes=notes,
        )
        return Response(AccessorySerializer(accessory).data)

    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        accessory = self.get_object()
        qty = int(request.data.get('quantity', 1))
        notes = request.data.get('notes', '')
        accessory.quantity_available += qty
        accessory.save()
        TransactionLog.objects.create(
            performed_by=request.user,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            accessory=accessory,
            quantity=qty,
            event_description=f'{qty}x {accessory.item_name} checked in',
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
        return TransactionLog.objects.select_related(
            'performed_by', 'to_user', 'from_user', 'asset', 'accessory'
        ).all()
