"""
Management command: seed_demo
Wipes and reseeds the database with the dummy data that used to live in the
frontend TypeScript files. Idempotent — safe to run multiple times.

Usage:
    python manage.py seed_demo
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import User, Asset, Accessory, TransactionLog


# ── Raw dummy data (ported from frontend TS) ────────────────────────────────

PEOPLE_DATA = [
    # (idx, first, last, email, title, business_group, supervisor_idx, location, badge, role, notes)
    (1,  'Maria',   'Santos',    'maria.santos@embeddedsilicon.com',    'Chief Executive Officer', 'Executive Leadership', None, 'HQ - Office 100', 'ES-B-001', 'ADMIN', ''),
    (2,  'Carlos',  'Reyes',     'carlos.reyes@embeddedsilicon.com',    'Chief Technology Officer','Engineering',          1,    'HQ - Office 101', 'ES-B-002', 'ADMIN', ''),
    (3,  'Gabriel', 'Limbo',     'gabriel.limbo@embeddedsilicon.com',   'IT Manager',              'IT',                   2,    'HQ - IT Room',    'ES-B-003', 'ADMIN', 'Primary IT admin. Handles hardware procurement and asset management.'),
    (4,  'James',   'Chen',      'james.chen@embeddedsilicon.com',      'Senior Engineer',         'Engineering',          2,    'HQ - Lab A',      'ES-B-004', 'STAFF', ''),
    (5,  'Sarah',   'Kim',       'sarah.kim@embeddedsilicon.com',       'Software Engineer',       'Engineering',          4,    'HQ - Lab A',      'ES-B-005', 'STAFF', ''),
    (6,  'Sam',     'Okafor',    'sam.okafor@embeddedsilicon.com',      'Hardware Engineer',       'Engineering',          4,    'HQ - Lab B',      'ES-B-006', 'STAFF', ''),
    (7,  'Tyler',   'Brooks',    'tyler.brooks@embeddedsilicon.com',    'IT Specialist',           'IT',                   3,    'HQ - IT Room',    'ES-B-007', 'STAFF', ''),
    (8,  'Priya',   'Nair',      'priya.nair@embeddedsilicon.com',      'Product Manager',         'Product',              1,    'HQ - Office 202', 'ES-B-008', 'STAFF', ''),
    (9,  'Ronald',  'MacDonald', 'ronald.macdonald@embeddedsilicon.com','QA Engineer',             'Engineering',          2,    'HQ - Lab A',      'ES-B-009', 'STAFF', ''),
    (10, 'Lebron',  'Jeymz',     'lebron.jeymz@embeddedsilicon.com',    'Operations Lead',         'Operations',           1,    'HQ - Office 150', 'ES-B-010', 'STAFF', ''),
    (11, 'Stephen', 'Carry',     'stephen.carry@embeddedsilicon.com',   'Finance Manager',         'Finance',              1,    'HQ - Office 120', 'ES-B-011', 'STAFF', ''),
    (12, 'Chioma',  'Obi',       'chioma.obi@embeddedsilicon.com',      'HR Manager',              'Human Resources',      1,    'HQ - Office 110', 'ES-B-012', 'STAFF', ''),
    (13, 'Wei',     'Zhang',     'wei.zhang@embeddedsilicon.com',       'Data Analyst',            'Engineering',          2,    'HQ - Lab A',      'ES-B-013', 'STAFF', ''),
    (14, 'Yuki',    'Nakamura',  'yuki.nakamura@embeddedsilicon.com',   'UX Designer',             'Product',              8,    'HQ - Studio',     'ES-B-014', 'STAFF', ''),
    (15, 'Kola',    'Adeyemi',   'kola.adeyemi@embeddedsilicon.com',    'System Administrator',    'IT',                   3,    'HQ - IT Room',    'ES-B-015', 'STAFF', 'Secondary IT admin. Handles server maintenance and network configuration.'),
    (16, 'Maria',   'Chen',      'maria.chen@embeddedsilicon.com',      'Operations Analyst',      'Operations',           10,   'HQ - Office 155', 'ES-B-016', 'STAFF', ''),
]

# (asset_tag, category, status, serial_number, assigned_to_name or None)
# "Retired" in the dummy data → "LOST" (closest ERD equivalent)
ASSETS_DATA = [
    ('ES-001', 'Laptop', 'AVAILABLE',  'q13411234ldsf',   None),
    ('ES-002', 'Laptop', 'DEPLOYED',   '412345dsfq',       'Lebron Jeymz'),
    ('ES-003', 'Phone',  'AVAILABLE',  '14231asdfgasd',    None),
    ('ES-004', 'Phone',  'DEPLOYED',   'q131dsf13s',       'Stephen Carry'),
    ('ES-005', 'Laptop', 'AVAILABLE',  'asd13241dgjwe',    None),
    ('ES-006', 'Laptop', 'DEPLOYED',   '12345y0jf',        'Ronald MacDonald'),
    ('ES-007', 'PC',     'AVAILABLE',  '14234568978f9gr',  None),
    ('ES-008', 'Phone',  'AVAILABLE',  'qerjqkhwekjq',     None),
    ('ES-009', 'Laptop', 'AVAILABLE',  '14321ksdafadfd',   None),
    ('ES-010', 'Tablet', 'DEPLOYED',   'ipad2024xpro12',   'Maria Chen'),
    ('ES-011', 'Tablet', 'AVAILABLE',  'surf9pro2024ab',   None),
    ('ES-012', 'Laptop', 'IN_REPAIR',  'tpx1c2024q1',      None),
    ('ES-013', 'Laptop', 'AVAILABLE',  'hpelite840g9x',    None),
    ('ES-014', 'PC',     'DEPLOYED',   'macpro2024m2u',    'Tyler Brooks'),
    ('ES-015', 'Phone',  'AVAILABLE',  'ip14pro2024bb',    None),
    ('ES-016', 'Laptop', 'AVAILABLE',  'dlat5540x2024',    None),
    ('ES-017', 'Laptop', 'DEPLOYED',   'mbp16m3pro2024',   'Priya Nair'),
    ('ES-018', 'Phone',  'LOST',       'sgs23u2022ret',    None),
    ('ES-019', 'Laptop', 'AVAILABLE',  'zenbookux482024',  None),
    ('ES-020', 'Laptop', 'IN_REPAIR',  'hpspec360x2024',   None),
    ('ES-021', 'Phone',  'AVAILABLE',  'ip152024stdx',     None),
    ('ES-022', 'Tablet', 'DEPLOYED',   'ipadair52024s',    'Sam Okafor'),
    ('ES-023', 'Laptop', 'AVAILABLE',  'lenovoidea5i24',   None),
    ('ES-024', 'Phone',  'TO_AUDIT',   'pixel7a2023chk',   None),
    ('ES-025', 'PC',     'AVAILABLE',  'dellprec3680x',    None),
]

ACCESSORIES_DATA = [
    # (item_name, category, qty, min_qty, model_number, manufacturer, supplier, location, business_group, unit_cost)
    ('USB-C Cable 2m',        'Cable',        24,  10, 'ANK-USB2M',    'Anker',        'Amazon Business', 'Storeroom A, Shelf 1', 'IT',         12.99),
    ('HDMI Cable 1.5m',       'Cable',         3,   8, 'HDMI-1M5-BK', 'Belkin',        'CDW',             'Storeroom A, Shelf 1', 'IT',          9.99),
    ('USB-C to HDMI Adapter', 'Adapter',       0,   5, 'UCA-HDMI-4K', 'Anker',         'Amazon Business', 'Storeroom A, Shelf 2', 'IT',         18.99),
    ('Wireless Keyboard',     'Keyboard',      9,   4, 'MX-KEYS-BLK', 'Logitech',      'Insight',         'Storeroom B, Shelf 1', 'IT',         89.99),
    ('Wireless Mouse',        'Mouse',        11,   4, 'MX-MASTER-3S','Logitech',       'Insight',         'Storeroom B, Shelf 1', 'IT',         74.99),
    ('USB-A Hub 7-Port',      'Adapter',       2,   3, 'ANK-HUB7-A',  'Anker',         'Amazon Business', 'Storeroom A, Shelf 2', 'IT',         29.99),
    ('Laptop Stand',          'Other',        15,   5, 'BSTAND-ALU',  'Brydge',        'B&H Photo',       'Storeroom B, Shelf 2', 'Operations', 39.99),
    ('Noise-Cancel Headset',  'Headset',       7,   3, 'BOSE-700-BLK','Bose',           'CDW',             'Storeroom C, Shelf 1', 'IT',        299.99),
    ('65W USB-C Charger',     'Power Supply',  0,   6, 'ANK-65W-GAN', 'Anker',         'Amazon Business', 'Storeroom A, Shelf 3', 'IT',         22.99),
    ('Thunderbolt 4 Dock',    'Adapter',       4,   2, 'CAL-TB4-DOCK','CalDigit',       'B&H Photo',       'Storeroom A, Shelf 2', 'IT',        249.99),
    ('512 GB SSD',            'Storage',       6,   4, 'SAM-870-512', 'Samsung',        'CDW',             'Storeroom C, Shelf 2', 'IT',         54.99),
    ('16 GB DDR5 RAM',        'RAM',           8,   4, 'COR-16G-DDR5','Corsair',        'Newegg',          'Storeroom C, Shelf 2', 'IT',         44.99),
    ('27" Monitor',           'Monitor',       2,   2, 'LG-27-4K-UHD','LG',             'Insight',         'Storeroom B, Shelf 3', 'IT',        349.99),
    ('USB-C Cable 1m',        'Cable',        30,  10, 'ANK-USB1M',   'Anker',         'Amazon Business', 'Storeroom A, Shelf 1', 'IT',          8.99),
    ('VESA Monitor Mount',    'Other',         1,   2, 'ERG-MNT-V1',  'Ergotron',      'CDW',             'Storeroom B, Shelf 3', 'Operations', 79.99),
    ('Ethernet Cable 5m',     'Cable',        18,   5, 'PATCH-5M-BLU','Tripp Lite',     'CDW',             'Storeroom A, Shelf 1', 'IT',          6.99),
    ('Surge Protector 6-Way', 'Power Supply',  5,   3, 'APC-6W-SURGE','APC',            'Insight',         'Storeroom A, Shelf 3', 'Operations', 34.99),
    ('Laptop Backpack',       'Other',         0,   3, 'TOMTOC-BP-15','Tomtoc',         'Amazon Business', 'Storeroom B, Shelf 2', 'Operations', 49.99),
    ('Webcam 4K',             'Other',         4,   2, 'LOG-BRIO-4K', 'Logitech',      'B&H Photo',       'Storeroom C, Shelf 1', 'IT',        149.99),
    ('Display Port Cable',    'Cable',         1,   5, 'DP-1M4-BLK',  'Cable Matters', 'Amazon Business', 'Storeroom A, Shelf 1', 'IT',         11.99),
]


class Command(BaseCommand):
    help = 'Wipe and reseed the database with demo data.'

    def handle(self, *args, **options):
        self.stdout.write('Wiping existing data...')
        TransactionLog.objects.all().delete()
        Asset.objects.all().delete()
        Accessory.objects.all().delete()
        User.objects.all().delete()

        # ── 1. Create users (pass 1: no supervisors yet) ────────────────────
        self.stdout.write('Seeding users...')
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

        # Pass 2: wire supervisors
        for row in PEOPLE_DATA:
            idx, *_, sup_idx, _loc, _badge, _role, _notes = row
            if sup_idx is not None:
                user = idx_to_user[idx]
                user.supervisor = idx_to_user[sup_idx]
                user.save(update_fields=['supervisor'])

        # Admin account for easy dev login
        admin_email = 'admin@embeddedsilicon.com'
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_user(
                email=admin_email,
                password='admin',
                first_name='Admin',
                last_name='User',
                role='ADMIN',
                is_staff=True,
                is_superuser=True,
            )
        self.stdout.write(f'  Created {len(PEOPLE_DATA)} users + admin account')

        # Name → user lookup (for asset assigned_to)
        name_to_user: dict[str, User] = {
            f'{u.first_name} {u.last_name}': u
            for u in idx_to_user.values()
        }

        # ── 2. Create assets ────────────────────────────────────────────────
        self.stdout.write('Seeding assets...')
        assets: list[Asset] = []
        for tag, cat, stat, serial, assigned_name in ASSETS_DATA:
            assigned = name_to_user.get(assigned_name) if assigned_name else None
            asset = Asset.objects.create(
                asset_tag=tag,
                category=cat,
                status=stat,
                serial_number=serial,
                assigned_to=assigned,
            )
            assets.append(asset)
        self.stdout.write(f'  Created {len(assets)} assets')

        # ── 3. Create accessories ───────────────────────────────────────────
        self.stdout.write('Seeding accessories...')
        accessories: list[Accessory] = []
        for row in ACCESSORIES_DATA:
            name, cat, qty, min_qty, model, mfr, supplier, location, bg, cost = row
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
        self.stdout.write(f'  Created {len(accessories)} accessories')

        # ── 4. Create synthetic transaction logs ────────────────────────────
        self.stdout.write('Seeding transaction logs...')
        admin_user = idx_to_user[3]  # Gabriel Limbo, IT Manager
        deployed_assets = [a for a in assets if a.status == 'DEPLOYED']
        transaction_types = [
            TransactionLog.TransactionType.CHECK_OUT,
            TransactionLog.TransactionType.CHECK_IN,
            TransactionLog.TransactionType.ADJUSTMENT,
        ]
        all_users = list(idx_to_user.values())
        logs_created = 0

        for i, asset in enumerate(deployed_assets):
            to_user = asset.assigned_to
            TransactionLog.objects.create(
                performed_by=admin_user,
                transaction_type=TransactionLog.TransactionType.CHECK_OUT,
                asset=asset,
                to_user=to_user,
                event_description=f'{asset.asset_tag} checked out to {to_user.first_name} {to_user.last_name}',
                transaction_date=timezone.now() - timedelta(days=random.randint(5, 90)),
            )
            logs_created += 1

        for i in range(20):
            asset = random.choice(assets)
            t_type = random.choice(transaction_types)
            to_user = random.choice(all_users) if t_type == TransactionLog.TransactionType.CHECK_OUT else None
            TransactionLog.objects.create(
                performed_by=admin_user,
                transaction_type=t_type,
                asset=asset,
                to_user=to_user,
                event_description=f'{asset.asset_tag} — {t_type.replace("_", " ").title()}',
                transaction_date=timezone.now() - timedelta(days=random.randint(1, 120)),
            )
            logs_created += 1

        for acc in random.sample(accessories, min(8, len(accessories))):
            to_user = random.choice(all_users)
            TransactionLog.objects.create(
                performed_by=admin_user,
                transaction_type=TransactionLog.TransactionType.CHECK_OUT,
                accessory=acc,
                to_user=to_user,
                quantity=random.randint(1, 3),
                event_description=f'{acc.item_name} checked out to {to_user.first_name} {to_user.last_name}',
                transaction_date=timezone.now() - timedelta(days=random.randint(1, 60)),
            )
            logs_created += 1

        self.stdout.write(f'  Created {logs_created} transaction log entries')
        self.stdout.write(self.style.SUCCESS(
            '\nDone! Login: admin@embeddedsilicon.com / admin\n'
            'Staff logins: <email from PEOPLE_DATA> / password123'
        ))
