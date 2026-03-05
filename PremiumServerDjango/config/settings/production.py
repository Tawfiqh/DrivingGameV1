"""
Production settings for DjangoTemplate26 project.
"""

from .base import *
import os

import dj_database_url

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Persistent database (required in production so data survives redeploys)
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable must be set in production. "
        "Add a PostgreSQL service in Railway and link it to this app."
    )
DATABASES = {
    'default': dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    ),
}

ALLOWED_HOSTS = [h for h in os.environ.get('ALLOWED_HOSTS', '').split(',') if h]

CSRF_TRUSTED_ORIGINS = [
    f"https://{host}" for host in ALLOWED_HOSTS if host
]
# Security settings for production
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'False') == 'True'
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Use environment variable for secret key in production
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set in production")

# WhiteNoise for static file serving without nginx
MIDDLEWARE.insert(
    MIDDLEWARE.index('django.middleware.security.SecurityMiddleware') + 1,
    'whitenoise.middleware.WhiteNoiseMiddleware',
)
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Production: static/ includes static/game/ (WebVersion JS built via npm run build (or ./run.sh should go in here)).
STATICFILES_DIRS = [BASE_DIR / 'static']

# Logging: be reasonably verbose in production, but avoid debug noise.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        # Root logger – INFO and above to console.
        "": {
            "handlers": ["console"],
            "level": "INFO",
        },
        # App Store / premium flows – explicitly INFO so entitlement logs appear.
        "appstore": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "game_content": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
