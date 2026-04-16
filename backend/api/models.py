import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class User(AbstractUser, TimeStampedModel):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        STAFF = 'STAFF', 'Staff'

    username = None
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    title = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    business_group = models.CharField(max_length=100, blank=True)
    supervisor = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reports'
    )
    notes = models.TextField(blank=True)
    badge_number = models.CharField(max_length=50, blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.first_name} {self.last_name} <{self.email}>'


class Asset(TimeStampedModel):
    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        DEPLOYED = 'DEPLOYED', 'Deployed'
        IN_REPAIR = 'IN_REPAIR', 'In Repair'
        IN_MAINTENANCE = 'IN_MAINTENANCE', 'In Maintenance'
        LOST = 'LOST', 'Lost'
        TO_AUDIT = 'TO_AUDIT', 'To Audit'

    class Category(models.TextChoices):
        LAPTOP = 'Laptop', 'Laptop'
        PHONE = 'Phone', 'Phone'
        TABLET = 'Tablet', 'Tablet'
        PC = 'PC', 'PC'
        MONITOR = 'Monitor', 'Monitor'
        ACCESSORY = 'Accessory', 'Accessory'
        OTHER = 'Other', 'Other'

    class Group(models.TextChoices):
        PRODUCT = 'PRODUCT', 'Product'
        PARTS = 'PARTS', 'Parts'

    class SSDEncryption(models.TextChoices):
        ENABLED = 'ENABLED', 'Enabled'
        DISABLED = 'DISABLED', 'Disabled'
        NA = 'N/A', 'N/A'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    image_url = models.CharField(max_length=255, blank=True)
    asset_tag = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=Category.choices, default=Category.OTHER)
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.AVAILABLE)
    serial_number = models.CharField(max_length=255, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    end_of_life = models.DateField(null=True, blank=True)
    order_number = models.CharField(max_length=100, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    depreciation_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)
    supplier = models.CharField(max_length=100, blank=True)
    business_group = models.CharField(max_length=100, blank=True)
    assigned_to = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assets'
    )
    notes = models.TextField(blank=True)
    group = models.CharField(max_length=20, choices=Group.choices, blank=True)
    imei_number = models.CharField(max_length=20, blank=True)
    ssd_encryption_status = models.CharField(
        max_length=20, choices=SSDEncryption.choices, blank=True
    )
    connectivity = models.CharField(max_length=100, blank=True)
    cpu = models.CharField(max_length=100, blank=True)
    gpu = models.CharField(max_length=100, blank=True)
    operating_system = models.CharField(max_length=100, blank=True)
    ram = models.CharField(max_length=50, blank=True)
    screen_size = models.CharField(max_length=10, blank=True)
    storage_size = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['asset_tag']

    def __str__(self):
        return self.asset_tag


class Accessory(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item_name = models.CharField(max_length=255)
    image_url = models.CharField(max_length=255, blank=True)
    quantity_available = models.IntegerField(default=0)
    model_number = models.CharField(max_length=100, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    order_number = models.CharField(max_length=100, blank=True)
    min_quantity = models.IntegerField(default=0)
    category = models.CharField(max_length=50, blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)
    supplier = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    business_group = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['item_name']
        verbose_name_plural = 'accessories'

    def __str__(self):
        return self.item_name


class TransactionLog(models.Model):
    class TransactionType(models.TextChoices):
        CHECK_OUT = 'CHECK_OUT', 'Check Out'
        CHECK_IN = 'CHECK_IN', 'Check In'
        TRANSFER = 'TRANSFER', 'Transfer'
        ADJUSTMENT = 'ADJUSTMENT', 'Adjustment'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_date = models.DateTimeField(default=timezone.now)
    performed_by = models.ForeignKey(
        User, on_delete=models.PROTECT,
        related_name='performed_transactions'
    )
    transaction_type = models.CharField(max_length=30, choices=TransactionType.choices)
    event_description = models.TextField(blank=True)
    asset = models.ForeignKey(
        Asset, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='transaction_logs'
    )
    accessory = models.ForeignKey(
        Accessory, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='transaction_logs'
    )
    to_user = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='incoming_transactions'
    )
    from_user = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='outgoing_transactions'
    )
    quantity = models.IntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-transaction_date']

    def __str__(self):
        return f'{self.transaction_type} — {self.transaction_date:%Y-%m-%d %H:%M}'
