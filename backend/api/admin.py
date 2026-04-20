from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Asset, Accessory, TransactionLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'business_group', 'is_active', 'is_archived', 'archive_reason')
    list_filter = ('role', 'is_active', 'business_group', 'is_archived', 'archive_reason')
    search_fields = ('email', 'first_name', 'last_name', 'badge_number')
    ordering = ('last_name', 'first_name')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'title', 'location', 'badge_number')}),
        ('Organisation', {'fields': ('business_group', 'supervisor', 'role')}),
        ('Notes', {'fields': ('notes',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('asset_tag', 'category', 'status', 'assigned_to', 'model', 'is_archived', 'archive_reason')
    list_filter = ('category', 'status', 'is_archived', 'archive_reason')
    search_fields = ('asset_tag', 'serial_number', 'manufacturer', 'model')


@admin.register(Accessory)
class AccessoryAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'category', 'quantity_available', 'min_quantity', 'location', 'is_archived', 'archive_reason')
    list_filter = ('category', 'is_archived', 'archive_reason')
    search_fields = ('item_name', 'model_number')


@admin.register(TransactionLog)
class TransactionLogAdmin(admin.ModelAdmin):
    list_display = ('transaction_type', 'performed_by', 'asset', 'accessory', 'transaction_date')
    list_filter = ('transaction_type',)
    search_fields = ('event_description', 'notes')
    readonly_fields = ('created_at',)
