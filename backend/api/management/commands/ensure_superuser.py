"""
Idempotent superuser bootstrap for deployments.

Reads DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD from the env
(falling back to the project defaults). On every run, ensures a user
with that email exists, has the supplied password, and has admin/staff
flags set. Safe to run on every build.
"""
import os
from django.core.management.base import BaseCommand

from api.models import User


DEFAULT_EMAIL = 'admin@esilicontech.com'
DEFAULT_PASSWORD = 'admin123'


class Command(BaseCommand):
    help = 'Create or update the superuser using DJANGO_SUPERUSER_EMAIL/PASSWORD env vars.'

    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', DEFAULT_EMAIL).strip().lower()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', DEFAULT_PASSWORD)
        first_name = os.environ.get('DJANGO_SUPERUSER_FIRST_NAME', 'Admin')
        last_name = os.environ.get('DJANGO_SUPERUSER_LAST_NAME', 'User')

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            self.stdout.write(self.style.SUCCESS(f'Created superuser {email}'))
            return

        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.role = User.Role.ADMIN
        if not user.first_name:
            user.first_name = first_name
        if not user.last_name:
            user.last_name = last_name
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Updated superuser {email}'))
