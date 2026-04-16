"""
Data migration: seed_demo
Runs the demo seeder on a fresh database (no-op if data already exists).
"""
from django.db import migrations
from django.core.management import call_command


def seed_forward(apps, schema_editor):
    call_command('seed_demo')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_forward, migrations.RunPython.noop),
    ]
