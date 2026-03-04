"""
Development settings for DjangoTemplate26 project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Accept Xcode StoreKit Testing JWS tokens (self-signed, short cert chain).
APPSTORE_ALLOW_XCODE_STOREKIT = True

# Development-specific settings
if DEBUG:
    INSTALLED_APPS += ['django_extensions'] if 'django_extensions' in globals() else []

# Verbose console logging for local development so we can see
# App Store / premium entitlement flows clearly.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        # Root logger: keep fairly quiet by default.
        "": {
            "handlers": ["console"],
            "level": "WARNING",
        },
        # Our premium / App Store related code paths.
        "appstore": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "game_content": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
