"""
Django settings for DjangoTemplate26 project.
Base settings shared across all environments.
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-this-in-production')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Local apps
    'users',
    'core',
    'game_content',
    'appstore',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    # Local dev: WebVersion dist (no copy needed). Production: static/game (committed, copied by npm run build).
    ('game'),
]
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Login/Logout URLs
LOGIN_URL = 'login'
LOGIN_REDIRECT_URL = 'admin:index'
LOGOUT_REDIRECT_URL = 'landing'

# App Store Server Integration
# Download Apple root CA certs (DER format) from https://www.apple.com/certificateauthority/
# and list their absolute paths here.
APPSTORE_ROOT_CA_PATHS: list[str] = [
    p for p in [
        os.environ.get("APPSTORE_ROOT_CA_G3_PATH", ""),
        os.environ.get("APPSTORE_ROOT_CA_G2_PATH", ""),
    ] if p
]
APPSTORE_BUNDLE_ID = os.environ.get("APPSTORE_BUNDLE_ID", "uk.co.tawfiq.getawayrun")
APPSTORE_APP_APPLE_ID: int | None = (
    int(v) if (v := os.environ.get("APPSTORE_APP_APPLE_ID")) else None
)
APPSTORE_ENVIRONMENT = os.environ.get("APPSTORE_ENVIRONMENT", "Sandbox")
APPSTORE_ENABLE_ONLINE_CHECKS = os.environ.get("APPSTORE_ENABLE_ONLINE_CHECKS", "true").lower() == "true"
APPSTORE_SUBSCRIPTION_PRODUCT_IDS = ["plus.standard", "plus.premium"]
# Allow Xcode StoreKit Testing tokens (self-signed, no Apple chain).
# MUST be False in production — only enable for local development.
APPSTORE_ALLOW_XCODE_STOREKIT = os.environ.get("APPSTORE_ALLOW_XCODE_STOREKIT", "false").lower() == "true"

