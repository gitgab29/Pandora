from rest_framework import serializers
from .models import User, Asset, Accessory, TransactionLog


class UserMinimalSerializer(serializers.ModelSerializer):
    """Lightweight read-only nested representation for FK display fields."""
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')


class UserSerializer(serializers.ModelSerializer):
    supervisor_detail = UserMinimalSerializer(source='supervisor', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'first_name', 'last_name', 'email', 'password',
            'title', 'location', 'business_group', 'supervisor', 'supervisor_detail',
            'badge_number', 'image_url', 'role', 'notes', 'is_active',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AssetSerializer(serializers.ModelSerializer):
    assigned_to_detail = UserMinimalSerializer(source='assigned_to', read_only=True)

    class Meta:
        model = Asset
        fields = (
            'id', 'image_url', 'asset_tag', 'category', 'status',
            'serial_number', 'warranty_expiry', 'end_of_life',
            'order_number', 'purchase_date', 'purchase_cost', 'depreciation_value',
            'manufacturer', 'supplier', 'business_group',
            'assigned_to', 'assigned_to_detail',
            'notes', 'group', 'imei_number', 'ssd_encryption_status',
            'connectivity', 'cpu', 'gpu', 'operating_system',
            'ram', 'screen_size', 'storage_size', 'metadata',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class AccessorySerializer(serializers.ModelSerializer):
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Accessory
        fields = (
            'id', 'item_name', 'image_url', 'quantity_available', 'model_number',
            'purchase_date', 'unit_cost', 'total_cost', 'order_number',
            'min_quantity', 'category', 'manufacturer', 'supplier',
            'location', 'business_group', 'notes',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_total_cost(self, obj):
        if obj.unit_cost is not None and obj.quantity_available is not None:
            return float(obj.unit_cost * obj.quantity_available)
        return None


class TransactionLogSerializer(serializers.ModelSerializer):
    performed_by_detail = UserMinimalSerializer(source='performed_by', read_only=True)
    to_user_detail = UserMinimalSerializer(source='to_user', read_only=True)
    from_user_detail = UserMinimalSerializer(source='from_user', read_only=True)
    asset_detail = serializers.SerializerMethodField()
    accessory_detail = serializers.SerializerMethodField()

    class Meta:
        model = TransactionLog
        fields = (
            'id', 'transaction_date',
            'performed_by', 'performed_by_detail',
            'transaction_type', 'event_description',
            'asset', 'asset_detail',
            'accessory', 'accessory_detail',
            'to_user', 'to_user_detail',
            'from_user', 'from_user_detail',
            'quantity', 'notes', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def get_asset_detail(self, obj):
        if obj.asset:
            return {'id': str(obj.asset.id), 'asset_tag': obj.asset.asset_tag, 'category': obj.asset.category}
        return None

    def get_accessory_detail(self, obj):
        if obj.accessory:
            return {'id': str(obj.accessory.id), 'item_name': obj.accessory.item_name}
        return None
