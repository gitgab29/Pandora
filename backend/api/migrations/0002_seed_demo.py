"""
Historical no-op.

Originally ran the `seed_demo` management command to populate a fresh DB
with dummy data. That command has been removed; this migration is kept
(and kept named `0002_seed_demo`) because later migrations declare it as
a dependency and existing databases already have it recorded as applied.
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(migrations.RunPython.noop, migrations.RunPython.noop),
    ]
