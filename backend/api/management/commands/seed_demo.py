"""
Management command: seed_demo
Wipes and reseeds the database with realistic dummy data.

Usage:
    python manage.py seed_demo           # no-op if data already exists
    python manage.py seed_demo --reset   # wipe (non-superusers only) + reseed
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Asset, Accessory, TransactionLog

SENTINEL_TAG = 'ES-001'  # If this asset exists, data is already seeded.

# ── People ──────────────────────────────────────────────────────────────────
# (idx, first, last, email, title, business_group, supervisor_idx, location, badge, role, notes)
PEOPLE_DATA = [
    (1,  'Maria',   'Santos',    'maria.santos@esilicontech.com',    'Chief Executive Officer',  'Executive Leadership', None, 'HQ - Office 100', 'ES-B-001', 'ADMIN', ''),
    (2,  'Carlos',  'Reyes',     'carlos.reyes@esilicontech.com',    'Chief Technology Officer', 'Engineering',          1,    'HQ - Office 101', 'ES-B-002', 'ADMIN', ''),
    (3,  'Gabriel', 'Limbo',     'gabriel.limbo@esilicontech.com',   'IT Manager',               'IT',                   2,    'HQ - IT Room',    'ES-B-003', 'ADMIN', 'Primary IT admin. Handles hardware procurement and asset management.'),
    (4,  'James',   'Chen',      'james.chen@esilicontech.com',      'Senior Engineer',          'Engineering',          2,    'HQ - Lab A',      'ES-B-004', 'STAFF', ''),
    (5,  'Sarah',   'Kim',       'sarah.kim@esilicontech.com',       'Software Engineer',        'Engineering',          4,    'HQ - Lab A',      'ES-B-005', 'STAFF', ''),
    (6,  'Sam',     'Okafor',    'sam.okafor@esilicontech.com',      'Hardware Engineer',        'Engineering',          4,    'HQ - Lab B',      'ES-B-006', 'STAFF', ''),
    (7,  'Tyler',   'Brooks',    'tyler.brooks@esilicontech.com',    'IT Specialist',            'IT',                   3,    'HQ - IT Room',    'ES-B-007', 'STAFF', ''),
    (8,  'Priya',   'Nair',      'priya.nair@esilicontech.com',      'Product Manager',          'Product',              1,    'HQ - Office 202', 'ES-B-008', 'STAFF', ''),
    (9,  'Ronald',  'MacDonald', 'ronald.macdonald@esilicontech.com','QA Engineer',              'Engineering',          2,    'HQ - Lab A',      'ES-B-009', 'STAFF', ''),
    (10, 'Lebron',  'Jeymz',     'lebron.jeymz@esilicontech.com',    'Operations Lead',          'Operations',           1,    'HQ - Office 150', 'ES-B-010', 'STAFF', ''),
    (11, 'Stephen', 'Carry',     'stephen.carry@esilicontech.com',   'Finance Manager',          'Finance',              1,    'HQ - Office 120', 'ES-B-011', 'STAFF', ''),
    (12, 'Chioma',  'Obi',       'chioma.obi@esilicontech.com',      'HR Manager',               'Human Resources',      1,    'HQ - Office 110', 'ES-B-012', 'STAFF', ''),
    (13, 'Wei',     'Zhang',     'wei.zhang@esilicontech.com',       'Data Analyst',             'Engineering',          2,    'HQ - Lab A',      'ES-B-013', 'STAFF', ''),
    (14, 'Yuki',    'Nakamura',  'yuki.nakamura@esilicontech.com',   'UX Designer',              'Product',              8,    'HQ - Studio',     'ES-B-014', 'STAFF', ''),
    (15, 'Kola',    'Adeyemi',   'kola.adeyemi@esilicontech.com',    'System Administrator',     'IT',                   3,    'HQ - IT Room',    'ES-B-015', 'STAFF', 'Secondary IT admin. Handles server maintenance and network configuration.'),
    (16, 'Maria',   'Chen',      'maria.chen@esilicontech.com',      'Operations Analyst',       'Operations',           10,   'HQ - Office 155', 'ES-B-016', 'STAFF', ''),
]

# ── Assets ───────────────────────────────────────────────────────────────────
# assigned_to_name must match "first_name last_name" from PEOPLE_DATA above.
ASSETS_DATA = [
    # Laptops
    {
        'asset_tag': 'ES-001', 'category': 'Laptop', 'status': 'AVAILABLE',
        'serial_number': 'DLTG5540-001', 'manufacturer': 'Dell', 'supplier': 'CDW',
        'purchase_date': date(2023, 4, 10), 'purchase_cost': 1349.00,
        'warranty_expiry': date(2026, 4, 10),
        'cpu': 'Intel Core i7-1355U', 'ram': '16 GB', 'storage_size': '512 GB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-002', 'category': 'Laptop', 'status': 'DEPLOYED',
        'serial_number': 'DLTG5540-002', 'manufacturer': 'Dell', 'supplier': 'CDW',
        'purchase_date': date(2023, 4, 10), 'purchase_cost': 1349.00,
        'warranty_expiry': date(2026, 4, 10),
        'cpu': 'Intel Core i7-1355U', 'ram': '16 GB', 'storage_size': '512 GB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'Operations', 'assigned_to_name': 'Lebron Jeymz',
    },
    {
        'asset_tag': 'ES-005', 'category': 'Laptop', 'status': 'AVAILABLE',
        'serial_number': 'MBP16M3-001', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 9, 20), 'purchase_cost': 2499.00,
        'warranty_expiry': date(2025, 9, 20),
        'cpu': 'Apple M3 Pro', 'ram': '18 GB', 'storage_size': '512 GB SSD',
        'operating_system': 'macOS Sonoma', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-006', 'category': 'Laptop', 'status': 'DEPLOYED',
        'serial_number': 'TPX1C5GEN-001', 'manufacturer': 'Lenovo', 'supplier': 'Insight',
        'purchase_date': date(2023, 6, 1), 'purchase_cost': 1599.00,
        'warranty_expiry': date(2026, 6, 1),
        'cpu': 'Intel Core i7-1365U', 'ram': '16 GB', 'storage_size': '256 GB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'Engineering', 'assigned_to_name': 'Ronald MacDonald',
    },
    {
        'asset_tag': 'ES-009', 'category': 'Laptop', 'status': 'AVAILABLE',
        'serial_number': 'HPELITEX360-001', 'manufacturer': 'HP', 'supplier': 'CDW',
        'purchase_date': date(2022, 11, 14), 'purchase_cost': 1199.00,
        'warranty_expiry': date(2025, 11, 14),
        'cpu': 'Intel Core i5-1235U', 'ram': '8 GB', 'storage_size': '256 GB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-012', 'category': 'Laptop', 'status': 'IN_REPAIR',
        'serial_number': 'TPX1C5GEN-002', 'manufacturer': 'Lenovo', 'supplier': 'Insight',
        'purchase_date': date(2022, 8, 5), 'purchase_cost': 1499.00,
        'warranty_expiry': date(2025, 8, 5),
        'cpu': 'Intel Core i7-1260P', 'ram': '16 GB', 'storage_size': '512 GB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'DISABLED',
        'business_group': 'Engineering', 'assigned_to_name': None,
        'notes': 'Sent to vendor for display replacement. ETA 2 weeks.',
    },
    {
        'asset_tag': 'ES-013', 'category': 'Laptop', 'status': 'AVAILABLE',
        'serial_number': 'ZENBOOKPRO-001', 'manufacturer': 'ASUS', 'supplier': 'Amazon Business',
        'purchase_date': date(2023, 2, 22), 'purchase_cost': 1099.00,
        'warranty_expiry': date(2025, 2, 22),
        'cpu': 'Intel Core i5-1340P', 'ram': '16 GB', 'storage_size': '512 GB SSD',
        'operating_system': 'Windows 11 Home', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-016', 'category': 'Laptop', 'status': 'AVAILABLE',
        'serial_number': 'SURFACE-PRO9-001', 'manufacturer': 'Microsoft', 'supplier': 'Microsoft Store',
        'purchase_date': date(2023, 1, 10), 'purchase_cost': 1799.00,
        'warranty_expiry': date(2025, 1, 10),
        'cpu': 'Intel Core i7-1255U', 'ram': '16 GB', 'storage_size': '256 GB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'Product', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-017', 'category': 'Laptop', 'status': 'DEPLOYED',
        'serial_number': 'MBP16M3-002', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 10, 5), 'purchase_cost': 2499.00,
        'warranty_expiry': date(2025, 10, 5),
        'cpu': 'Apple M3 Pro', 'ram': '18 GB', 'storage_size': '1 TB SSD',
        'operating_system': 'macOS Sonoma', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'Product', 'assigned_to_name': 'Priya Nair',
    },
    {
        'asset_tag': 'ES-019', 'category': 'Laptop', 'status': 'AVAILABLE',
        'serial_number': 'HPSPEC360-001', 'manufacturer': 'HP', 'supplier': 'Insight',
        'purchase_date': date(2022, 7, 18), 'purchase_cost': 1249.00,
        'warranty_expiry': date(2025, 7, 18),
        'cpu': 'Intel Core i7-1260P', 'ram': '32 GB', 'storage_size': '1 TB SSD',
        'operating_system': 'Windows 11 Pro', 'ssd_encryption_status': 'ENABLED',
        'business_group': 'Engineering', 'assigned_to_name': None,
    },
    # Phones
    {
        'asset_tag': 'ES-003', 'category': 'Phone', 'status': 'AVAILABLE',
        'serial_number': 'IP15PRO-001', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 9, 25), 'purchase_cost': 999.00,
        'warranty_expiry': date(2025, 9, 25),
        'imei_number': '356938035643809', 'connectivity': '5G',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-004', 'category': 'Phone', 'status': 'DEPLOYED',
        'serial_number': 'GS24-001', 'manufacturer': 'Samsung', 'supplier': 'CDW',
        'purchase_date': date(2024, 1, 20), 'purchase_cost': 799.00,
        'warranty_expiry': date(2026, 1, 20),
        'imei_number': '490154203237518', 'connectivity': '5G',
        'business_group': 'Finance', 'assigned_to_name': 'Stephen Carry',
    },
    {
        'asset_tag': 'ES-008', 'category': 'Phone', 'status': 'AVAILABLE',
        'serial_number': 'IP15PRO-002', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 9, 25), 'purchase_cost': 999.00,
        'warranty_expiry': date(2025, 9, 25),
        'imei_number': '356938035643810', 'connectivity': '5G',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-015', 'category': 'Phone', 'status': 'AVAILABLE',
        'serial_number': 'GS24-002', 'manufacturer': 'Samsung', 'supplier': 'CDW',
        'purchase_date': date(2024, 1, 20), 'purchase_cost': 799.00,
        'warranty_expiry': date(2026, 1, 20),
        'imei_number': '490154203237519', 'connectivity': '5G',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-018', 'category': 'Phone', 'status': 'LOST',
        'serial_number': 'GS23U-001', 'manufacturer': 'Samsung', 'supplier': 'CDW',
        'purchase_date': date(2022, 3, 10), 'purchase_cost': 749.00,
        'warranty_expiry': date(2024, 3, 10),
        'imei_number': '356938035643811', 'connectivity': '5G',
        'business_group': 'Operations', 'assigned_to_name': None,
        'notes': 'Reported lost during offsite in Q4 2023. Police report filed.',
    },
    {
        'asset_tag': 'ES-021', 'category': 'Phone', 'status': 'AVAILABLE',
        'serial_number': 'IP15-001', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 9, 25), 'purchase_cost': 799.00,
        'warranty_expiry': date(2025, 9, 25),
        'imei_number': '356938035643812', 'connectivity': '5G',
        'business_group': 'IT', 'assigned_to_name': None,
    },
    # Tablets
    {
        'asset_tag': 'ES-010', 'category': 'Tablet', 'status': 'DEPLOYED',
        'serial_number': 'IPADPRO12-001', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 5, 3), 'purchase_cost': 1099.00,
        'warranty_expiry': date(2025, 5, 3),
        'business_group': 'Operations', 'assigned_to_name': 'Maria Chen',
    },
    {
        'asset_tag': 'ES-011', 'category': 'Tablet', 'status': 'AVAILABLE',
        'serial_number': 'SURFPRO9-001', 'manufacturer': 'Microsoft', 'supplier': 'Microsoft Store',
        'purchase_date': date(2023, 3, 12), 'purchase_cost': 1399.00,
        'warranty_expiry': date(2025, 3, 12),
        'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-022', 'category': 'Tablet', 'status': 'DEPLOYED',
        'serial_number': 'IPADAIR5-001', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 7, 14), 'purchase_cost': 749.00,
        'warranty_expiry': date(2025, 7, 14),
        'business_group': 'Engineering', 'assigned_to_name': 'Sam Okafor',
    },
    # Monitors
    {
        'asset_tag': 'ES-MON-001', 'category': 'Monitor', 'status': 'DEPLOYED',
        'serial_number': 'LGUL27-001', 'manufacturer': 'LG', 'supplier': 'Insight',
        'purchase_date': date(2022, 10, 1), 'purchase_cost': 349.00,
        'warranty_expiry': date(2025, 10, 1),
        'screen_size': '27"', 'business_group': 'Engineering', 'assigned_to_name': 'James Chen',
    },
    {
        'asset_tag': 'ES-MON-002', 'category': 'Monitor', 'status': 'AVAILABLE',
        'serial_number': 'DELU2722D-001', 'manufacturer': 'Dell', 'supplier': 'CDW',
        'purchase_date': date(2023, 1, 5), 'purchase_cost': 399.00,
        'warranty_expiry': date(2026, 1, 5),
        'screen_size': '27"', 'business_group': 'IT', 'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-MON-003', 'category': 'Monitor', 'status': 'IN_MAINTENANCE',
        'serial_number': 'LGUL32-001', 'manufacturer': 'LG', 'supplier': 'Insight',
        'purchase_date': date(2021, 8, 20), 'purchase_cost': 599.00,
        'warranty_expiry': date(2024, 8, 20),
        'screen_size': '32"', 'business_group': 'IT', 'assigned_to_name': None,
        'notes': 'Backlight flickering. Scheduled for RMA.',
    },
    # PCs
    {
        'asset_tag': 'ES-007', 'category': 'PC', 'status': 'AVAILABLE',
        'serial_number': 'DELLPREC3680-001', 'manufacturer': 'Dell', 'supplier': 'CDW',
        'purchase_date': date(2023, 5, 10), 'purchase_cost': 1899.00,
        'warranty_expiry': date(2026, 5, 10),
        'cpu': 'Intel Core i9-13900', 'gpu': 'NVIDIA RTX 4070', 'ram': '32 GB',
        'storage_size': '1 TB SSD', 'operating_system': 'Windows 11 Pro',
        'ssd_encryption_status': 'ENABLED', 'business_group': 'Engineering',
        'assigned_to_name': None,
    },
    {
        'asset_tag': 'ES-014', 'category': 'PC', 'status': 'DEPLOYED',
        'serial_number': 'MACPROM2-001', 'manufacturer': 'Apple', 'supplier': 'Apple Store',
        'purchase_date': date(2023, 11, 3), 'purchase_cost': 3999.00,
        'warranty_expiry': date(2025, 11, 3),
        'cpu': 'Apple M2 Ultra', 'gpu': 'Apple M2 Ultra GPU', 'ram': '64 GB',
        'storage_size': '2 TB SSD', 'operating_system': 'macOS Sonoma',
        'ssd_encryption_status': 'ENABLED', 'business_group': 'IT',
        'assigned_to_name': 'Tyler Brooks',
    },
    # Other
    {
        'asset_tag': 'ES-024', 'category': 'Other', 'status': 'TO_AUDIT',
        'serial_number': 'PIXEL7A-001', 'manufacturer': 'Google', 'supplier': 'CDW',
        'purchase_date': date(2022, 6, 5), 'purchase_cost': 499.00,
        'warranty_expiry': date(2024, 6, 5),
        'business_group': 'IT', 'assigned_to_name': None,
        'notes': 'Location unconfirmed. Due for physical audit.',
    },
    {
        'asset_tag': 'ES-025', 'category': 'PC', 'status': 'AVAILABLE',
        'serial_number': 'DELLPREC3680-002', 'manufacturer': 'Dell', 'supplier': 'CDW',
        'purchase_date': date(2023, 5, 10), 'purchase_cost': 1899.00,
        'warranty_expiry': date(2026, 5, 10),
        'cpu': 'Intel Core i9-13900', 'gpu': 'NVIDIA RTX 4060', 'ram': '32 GB',
        'storage_size': '1 TB SSD', 'operating_system': 'Windows 11 Pro',
        'ssd_encryption_status': 'ENABLED', 'business_group': 'Engineering',
        'assigned_to_name': None,
    },
]

# ── Accessories ──────────────────────────────────────────────────────────────
ACCESSORIES_DATA = [
    # (item_name, category, qty, min_qty, model_number, manufacturer, supplier, location, business_group, unit_cost)
    ('USB-C Cable 2m',        'Cable',        24,  10, 'ANK-USB2M',    'Anker',         'Amazon Business', 'Storeroom A, Shelf 1', 'IT',          12.99),
    ('HDMI Cable 1.5m',       'Cable',         3,   8, 'HDMI-1M5-BK', 'Belkin',         'CDW',             'Storeroom A, Shelf 1', 'IT',           9.99),
    ('USB-C to HDMI Adapter', 'Adapter',       0,   5, 'UCA-HDMI-4K', 'Anker',          'Amazon Business', 'Storeroom A, Shelf 2', 'IT',          18.99),
    ('Wireless Keyboard',     'Keyboard',      9,   4, 'MX-KEYS-BLK', 'Logitech',       'Insight',         'Storeroom B, Shelf 1', 'IT',          89.99),
    ('Wireless Mouse',        'Mouse',        11,   4, 'MX-MASTER-3S','Logitech',        'Insight',         'Storeroom B, Shelf 1', 'IT',          74.99),
    ('USB-A Hub 7-Port',      'Adapter',       2,   3, 'ANK-HUB7-A',  'Anker',          'Amazon Business', 'Storeroom A, Shelf 2', 'IT',          29.99),
    ('Laptop Stand',          'Other',        15,   5, 'BSTAND-ALU',  'Brydge',         'B&H Photo',       'Storeroom B, Shelf 2', 'Operations',  39.99),
    ('Noise-Cancel Headset',  'Headset',       7,   3, 'BOSE-700-BLK','Bose',            'CDW',             'Storeroom C, Shelf 1', 'IT',         299.99),
    ('65W USB-C Charger',     'Power Supply',  0,   6, 'ANK-65W-GAN', 'Anker',          'Amazon Business', 'Storeroom A, Shelf 3', 'IT',          22.99),
    ('Thunderbolt 4 Dock',    'Adapter',       4,   2, 'CAL-TB4-DOCK','CalDigit',        'B&H Photo',       'Storeroom A, Shelf 2', 'IT',         249.99),
    ('512 GB SSD',            'Storage',       6,   4, 'SAM-870-512', 'Samsung',         'CDW',             'Storeroom C, Shelf 2', 'IT',          54.99),
    ('16 GB DDR5 RAM',        'RAM',           8,   4, 'COR-16G-DDR5','Corsair',         'Newegg',          'Storeroom C, Shelf 2', 'IT',          44.99),
    ('27" Monitor',           'Monitor',       2,   2, 'LG-27-4K-UHD','LG',              'Insight',         'Storeroom B, Shelf 3', 'IT',         349.99),
    ('USB-C Cable 1m',        'Cable',        30,  10, 'ANK-USB1M',   'Anker',          'Amazon Business', 'Storeroom A, Shelf 1', 'IT',           8.99),
    ('VESA Monitor Mount',    'Other',         1,   2, 'ERG-MNT-V1',  'Ergotron',       'CDW',             'Storeroom B, Shelf 3', 'Operations',  79.99),
    ('Ethernet Cable 5m',     'Cable',        18,   5, 'PATCH-5M-BLU','Tripp Lite',      'CDW',             'Storeroom A, Shelf 1', 'IT',           6.99),
    ('Surge Protector 6-Way', 'Power Supply',  5,   3, 'APC-6W-SURGE','APC',             'Insight',         'Storeroom A, Shelf 3', 'Operations',  34.99),
    ('Laptop Backpack',       'Other',         0,   3, 'TOMTOC-BP-15','Tomtoc',          'Amazon Business', 'Storeroom B, Shelf 2', 'Operations',  49.99),
    ('Webcam 4K',             'Other',         4,   2, 'LOG-BRIO-4K', 'Logitech',       'B&H Photo',       'Storeroom C, Shelf 1', 'IT',         149.99),
    ('Display Port Cable',    'Cable',         1,   5, 'DP-1M4-BLK',  'Cable Matters',  'Amazon Business', 'Storeroom A, Shelf 1', 'IT',          11.99),
]


def _seed(stdout=None):
    """Core seeding logic — assumes the DB is already cleared (or empty)."""
    def log(msg):
        if stdout:
            stdout.write(msg)

    # ── 1. Users ─────────────────────────────────────────────────────────────
    log('Seeding users...')
    idx_to_user: dict[int, User] = {}
    for row in PEOPLE_DATA:
        idx, first, last, email, title, bg, sup_idx, location, badge, role, notes = row
        user = User.objects.create_user(
            email=email,
            password='password123',
            first_name=first,
            last_name=last,
            title=title,
            business_group=bg,
            location=location,
            badge_number=badge,
            role=role,
            notes=notes,
        )
        idx_to_user[idx] = user

    # Wire supervisors in a second pass (all users must exist first)
    for row in PEOPLE_DATA:
        idx, first, last, email, title, bg, sup_idx, location, badge, role, notes = row
        if sup_idx is not None:
            user = idx_to_user[idx]
            user.supervisor = idx_to_user[sup_idx]
            user.save(update_fields=['supervisor'])

    log(f'  Created {len(PEOPLE_DATA)} users')

    name_to_user: dict[str, User] = {
        f'{u.first_name} {u.last_name}': u
        for u in idx_to_user.values()
    }
    admin_user = idx_to_user[3]  # Gabriel Limbo, IT Manager

    # ── 2. Assets ─────────────────────────────────────────────────────────────
    log('Seeding assets...')
    assets: list[Asset] = []
    all_users = list(idx_to_user.values())
    for row in ASSETS_DATA:
        assigned = name_to_user.get(row.get('assigned_to_name')) if row.get('assigned_to_name') else None
        asset = Asset.objects.create(
            asset_tag=row['asset_tag'],
            category=row['category'],
            status=row['status'],
            serial_number=row.get('serial_number', ''),
            manufacturer=row.get('manufacturer', ''),
            supplier=row.get('supplier', ''),
            purchase_date=row.get('purchase_date'),
            purchase_cost=row.get('purchase_cost'),
            warranty_expiry=row.get('warranty_expiry'),
            cpu=row.get('cpu', ''),
            gpu=row.get('gpu', ''),
            ram=row.get('ram', ''),
            storage_size=row.get('storage_size', ''),
            operating_system=row.get('operating_system', ''),
            ssd_encryption_status=row.get('ssd_encryption_status', ''),
            imei_number=row.get('imei_number', ''),
            connectivity=row.get('connectivity', ''),
            screen_size=row.get('screen_size', ''),
            business_group=row.get('business_group', ''),
            assigned_to=assigned,
            notes=row.get('notes', ''),
        )
        assets.append(asset)
    log(f'  Created {len(assets)} assets')

    # ── 3. Accessories ────────────────────────────────────────────────────────
    log('Seeding accessories...')
    accessories: list[Accessory] = []
    for name, cat, qty, min_qty, model, mfr, supplier, location, bg, cost in ACCESSORIES_DATA:
        acc = Accessory.objects.create(
            item_name=name,
            category=cat,
            quantity_available=qty,
            min_quantity=min_qty,
            model_number=model,
            manufacturer=mfr,
            supplier=supplier,
            location=location,
            business_group=bg,
            unit_cost=cost,
        )
        accessories.append(acc)
    log(f'  Created {len(accessories)} accessories')

    # ── 4. Transaction logs ───────────────────────────────────────────────────
    log('Seeding transaction logs...')
    logs_created = 0

    # CHECK_OUT for each currently deployed asset
    deployed_assets = [a for a in assets if a.status == 'DEPLOYED']
    for asset in deployed_assets:
        to_user = asset.assigned_to
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            asset=asset,
            to_user=to_user,
            event_description=f'{asset.asset_tag} checked out to {to_user.first_name} {to_user.last_name}.',
            transaction_date=timezone.now() - timedelta(days=random.randint(10, 90)),
        )
        logs_created += 1

    # Historical CHECK_INs (assets no longer deployed)
    available_assets = [a for a in assets if a.status == 'AVAILABLE']
    for asset in random.sample(available_assets, min(8, len(available_assets))):
        past_holder = random.choice(all_users)
        # Simulated prior checkout
        checkout_date = timezone.now() - timedelta(days=random.randint(40, 120))
        checkin_date = checkout_date + timedelta(days=random.randint(5, 30))
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            asset=asset,
            to_user=past_holder,
            event_description=f'{asset.asset_tag} checked out to {past_holder.first_name} {past_holder.last_name}.',
            transaction_date=checkout_date,
        )
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            asset=asset,
            from_user=past_holder,
            event_description=f'{asset.asset_tag} returned by {past_holder.first_name} {past_holder.last_name}.',
            transaction_date=checkin_date,
        )
        logs_created += 2

    # TRANSFER entries
    for _ in range(3):
        asset = random.choice(deployed_assets)
        from_u = random.choice(all_users)
        to_u = random.choice([u for u in all_users if u != from_u])
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.TRANSFER,
            asset=asset,
            from_user=from_u,
            to_user=to_u,
            event_description=f'{asset.asset_tag} transferred from {from_u.first_name} {from_u.last_name} to {to_u.first_name} {to_u.last_name}.',
            transaction_date=timezone.now() - timedelta(days=random.randint(5, 60)),
        )
        logs_created += 1

    # Accessory CHECK_OUTs
    for acc in random.sample(accessories, min(10, len(accessories))):
        to_user = random.choice(all_users)
        qty = random.randint(1, 3)
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.CHECK_OUT,
            accessory=acc,
            to_user=to_user,
            quantity=qty,
            event_description=f'{qty}x {acc.item_name} checked out to {to_user.first_name} {to_user.last_name}.',
            transaction_date=timezone.now() - timedelta(days=random.randint(1, 60)),
        )
        logs_created += 1

    # Accessory CHECK_INs
    for acc in random.sample(accessories, min(4, len(accessories))):
        from_u = random.choice(all_users)
        qty = random.randint(1, 2)
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.CHECK_IN,
            accessory=acc,
            from_user=from_u,
            quantity=qty,
            event_description=f'{qty}x {acc.item_name} returned by {from_u.first_name} {from_u.last_name}.',
            transaction_date=timezone.now() - timedelta(days=random.randint(1, 30)),
        )
        logs_created += 1

    # Accessory ADJUSTMENT entries (stock reconciliation)
    for acc in random.sample(accessories, min(3, len(accessories))):
        TransactionLog.objects.create(
            performed_by=admin_user,
            transaction_type=TransactionLog.TransactionType.ADJUSTMENT,
            accessory=acc,
            quantity=random.choice([-1, 1, 2]),
            event_description=f'Stock adjustment for {acc.item_name} after physical count.',
            transaction_date=timezone.now() - timedelta(days=random.randint(10, 45)),
        )
        logs_created += 1

    log(f'  Created {logs_created} transaction log entries')


class Command(BaseCommand):
    help = 'Seed the database with demo data. Add --reset to wipe existing data first.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Wipe Assets, Accessories, TransactionLogs, and non-superuser Users before seeding.',
        )

    def handle(self, *args, **options):
        if not options['reset']:
            if Asset.objects.filter(asset_tag=SENTINEL_TAG).exists():
                self.stdout.write('Seed data already present — skipping. Use --reset to reseed.')
                return

        if options['reset']:
            self.stdout.write('Resetting data (superusers preserved)...')
            TransactionLog.objects.all().delete()
            Asset.objects.all().delete()
            Accessory.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()

        _seed(stdout=self.stdout)

        self.stdout.write(self.style.SUCCESS(
            '\nDone!\n'
            'Staff logins: <email from list above> / password123\n'
            'Example: gabriel.limbo@esilicontech.com / password123'
        ))
