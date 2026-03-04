from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from django.conf import settings
from django.utils import timezone as django_tz

from appstoreserverlibrary.models.Environment import Environment
from appstoreserverlibrary.models.JWSTransactionDecodedPayload import (
    JWSTransactionDecodedPayload,
)
from appstoreserverlibrary.signed_data_verifier import (
    SignedDataVerifier,
    VerificationException,
)

from .models import AppStoreSubscription

logger = logging.getLogger(__name__)

_verifier: Optional[SignedDataVerifier] = None


def _get_environment() -> Environment:
    env_str = getattr(settings, "APPSTORE_ENVIRONMENT", "Sandbox")
    if env_str == "Production":
        return Environment.PRODUCTION
    return Environment.SANDBOX


def get_verifier() -> SignedDataVerifier:
    """
    Lazily build and cache a SignedDataVerifier instance.

    Requires ``APPSTORE_ROOT_CA_PATHS`` (list of file paths to Apple root CA
    certs in DER format) and ``APPSTORE_BUNDLE_ID`` in Django settings.  For
    production, ``APPSTORE_APP_APPLE_ID`` (int) must also be set.
    """
    global _verifier
    if _verifier is not None:
        return _verifier

    root_cert_paths: list[str] = getattr(settings, "APPSTORE_ROOT_CA_PATHS", [])
    root_certificates: list[bytes] = []
    for path in root_cert_paths:
        with open(path, "rb") as f:
            root_certificates.append(f.read())

    environment = _get_environment()
    bundle_id: str = settings.APPSTORE_BUNDLE_ID
    app_apple_id: Optional[int] = getattr(settings, "APPSTORE_APP_APPLE_ID", None)
    enable_online_checks: bool = getattr(
        settings, "APPSTORE_ENABLE_ONLINE_CHECKS", True,
    )

    _verifier = SignedDataVerifier(
        root_certificates=root_certificates,
        enable_online_checks=enable_online_checks,
        environment=environment,
        bundle_id=bundle_id,
        app_apple_id=app_apple_id,
    )
    return _verifier


def verify_transaction_jws(
    signed_transaction: str,
) -> Optional[JWSTransactionDecodedPayload]:
    """
    Verify a signed transaction JWS sent by the iOS client and return the
    decoded payload, or ``None`` if verification fails.
    """
    try:
        verifier = get_verifier()
        return verifier.verify_and_decode_signed_transaction(signed_transaction)
    except VerificationException:
        logger.warning("JWS transaction verification failed", exc_info=True)
        return None
    except Exception:
        logger.exception("Unexpected error during JWS transaction verification")
        return None


def _ms_to_datetime(ms: Optional[int]) -> Optional[datetime]:
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc)


def is_subscription_product(product_id: Optional[str]) -> bool:
    allowed: list[str] = getattr(
        settings, "APPSTORE_SUBSCRIPTION_PRODUCT_IDS", [],
    )
    return product_id in allowed


def check_transaction_is_active_subscription(
    txn: JWSTransactionDecodedPayload,
) -> bool:
    """
    Given a decoded transaction, return True if it represents a currently-
    active subscription to one of our recognised product IDs.
    """
    if not is_subscription_product(txn.productId):
        return False

    if txn.revocationDate is not None:
        return False

    if txn.expiresDate is not None:
        expires = _ms_to_datetime(txn.expiresDate)
        if expires is not None and expires <= django_tz.now():
            return False

    return True


def check_subscription_active_in_db(
    original_transaction_id: str,
) -> Optional[bool]:
    """
    Look up the subscription in the local DB (populated by App Store Server
    Notifications).  Returns True/False if a record exists, or None if no
    record is found (caller should fall back to JWS-only check).
    """
    try:
        sub = AppStoreSubscription.objects.get(
            original_transaction_id=original_transaction_id,
        )
        return sub.is_active
    except AppStoreSubscription.DoesNotExist:
        return None
