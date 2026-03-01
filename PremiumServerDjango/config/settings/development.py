"""
Development settings for DjangoTemplate26 project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Development-specific settings
if DEBUG:
    INSTALLED_APPS += ['django_extensions'] if 'django_extensions' in globals() else []
