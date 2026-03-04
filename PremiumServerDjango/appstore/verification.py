from __future__ import annotations

import base64
import json
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

try:
    import cattrs
    from appstoreserverlibrary.models.LibraryUtility import _get_cattrs_converter
except ImportError:
    _get_cattrs_converter = None

from .models import AppStoreSubscription

logger = logging.getLogger(__name__)

_verifier: Optional[SignedDataVerifier] = None


def _get_environment() -> Environment:
    env_str = getattr(settings, "APPSTORE_ENVIRONMENT", "Sandbox")
    logger.info("⚒️🔒 App Store environment setting resolved env_str=%s", env_str)
    if env_str == "Production":
        logger.info("⚒️🔒 Using App Store PRODUCTION environment")
        return Environment.PRODUCTION
    logger.info("⚒️🔒 Using App Store SANDBOX environment")
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
        logger.debug("⚒️🔒 Reusing cached App Store SignedDataVerifier instance")
        return _verifier

    root_cert_paths: list[str] = getattr(settings, "APPSTORE_ROOT_CA_PATHS", [])
    logger.info(
        "⚒️🔒 Building new App Store SignedDataVerifier num_root_cert_paths=%s paths=%s",
        len(root_cert_paths),
        root_cert_paths,
    )
    root_certificates: list[bytes] = []
    for path in root_cert_paths:
        logger.debug("⚒️🔒 Loading App Store root certificate path=%s", path)
        with open(path, "rb") as f:
            root_certificates.append(f.read())

    environment = _get_environment()
    bundle_id: str = settings.APPSTORE_BUNDLE_ID
    app_apple_id: Optional[int] = getattr(settings, "APPSTORE_APP_APPLE_ID", None)
    enable_online_checks: bool = getattr(
        settings, "APPSTORE_ENABLE_ONLINE_CHECKS", True,
    )

    logger.info(
        "⚒️🔒 Initialising SignedDataVerifier env=%s bundle_id=%s has_app_apple_id=%s "
        "enable_online_checks=%s num_root_certificates=%s",
        environment.name,
        bundle_id,
        app_apple_id is not None,
        enable_online_checks,
        len(root_certificates),
    )

    _verifier = SignedDataVerifier(
        root_certificates=root_certificates,
        enable_online_checks=enable_online_checks,
        environment=environment,
        bundle_id=bundle_id,
        app_apple_id=app_apple_id,
    )
    return _verifier


def _is_xcode_storekit_token(signed_transaction: str) -> bool:
    """Return True if the JWS was signed by Xcode's local StoreKit testing."""
    try:
        header_b64 = signed_transaction.split(".")[0]
        padding = 4 - len(header_b64) % 4
        header_json = base64.urlsafe_b64decode(header_b64 + "=" * padding)
        header = json.loads(header_json)
        return header.get("kid") == "Apple_Xcode_Key"
    except Exception:
        return False


def _decode_xcode_storekit_transaction(
    signed_transaction: str,
) -> Optional[JWSTransactionDecodedPayload]:
    """
    Decode an Xcode StoreKit testing JWS **without** certificate chain
    verification.  Xcode signs with a single self-signed cert that the Apple
    library rejects (INVALID_CHAIN_LENGTH).  This is safe because:
    - It only runs when ``APPSTORE_ALLOW_XCODE_STOREKIT`` is True (dev only)
    - The ``kid`` in the header must be ``Apple_Xcode_Key``
    """
    try:
        payload_b64 = signed_transaction.split(".")[1]
        padding = 4 - len(payload_b64) % 4
        payload_json = base64.urlsafe_b64decode(payload_b64 + "=" * padding)
        payload_dict = json.loads(payload_json)

        if _get_cattrs_converter is not None:
            return _get_cattrs_converter(JWSTransactionDecodedPayload).structure(
                payload_dict, JWSTransactionDecodedPayload,
            )

        return JWSTransactionDecodedPayload(**payload_dict)
    except Exception:
        logger.exception("⚒️🔒 Failed to decode Xcode StoreKit testing JWS")
        return None


def verify_transaction_jws(
    signed_transaction: str,
) -> Optional[JWSTransactionDecodedPayload]:
    """
    Verify a signed transaction JWS sent by the iOS client and return the
    decoded payload, or ``None`` if verification fails.

    When ``APPSTORE_ALLOW_XCODE_STOREKIT`` is True (development only), tokens
    signed by Xcode's local StoreKit testing (``kid: Apple_Xcode_Key``) are
    decoded without full chain verification.
    """
    token_preview = signed_transaction[:32] if signed_transaction else ""
    token_length = len(signed_transaction) if signed_transaction else 0

    allow_xcode = getattr(settings, "APPSTORE_ALLOW_XCODE_STOREKIT", False)
    if allow_xcode and _is_xcode_storekit_token(signed_transaction):
        logger.info(
            "⚒️🔒 Xcode StoreKit testing token detected — decoding without "
            "chain verification token_length=%s",
            token_length,
        )
        return _decode_xcode_storekit_transaction(signed_transaction)

    try:
        logger.info(
            "⚒️🔒 Verifying App Store transaction JWS token_length=%s token_prefix=%s",
            token_length,
            token_preview,
        )
        verifier = get_verifier()
        payload = verifier.verify_and_decode_signed_transaction(signed_transaction)
        logger.info(
            "⚒️🔑 JWS verification succeeded product_id=%s original_transaction_id=%s "
            "expires_date_ms=%s",
            getattr(payload, "productId", None),
            getattr(payload, "originalTransactionId", None),
            getattr(payload, "expiresDate", None),
        )
        return payload
    except VerificationException as exc:
        logger.warning(
            "⚒️🔒 JWS transaction verification failed token_length=%s token_prefix=%s "
            "error_type=%s",
            token_length,
            token_preview,
            type(exc).__name__,
            exc_info=True,
        )
        return None
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "⚒️🔒 Unexpected error during JWS transaction verification token_length=%s "
            "token_prefix=%s error_type=%s",
            token_length,
            token_preview,
            type(exc).__name__,
        )
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
    logger.info(
        "\n\n⚒️🔒 Checking transaction for active subscription product_id=%s "
        "original_transaction_id=%s revocation_date_ms=%s expires_date_ms=%s",
        txn.productId,
        txn.originalTransactionId,
        txn.revocationDate,
        txn.expiresDate,
    )

    if not is_subscription_product(txn.productId):
        logger.info(
            "⚒️🔒 Transaction product ID is not a recognised subscription product_id=%s",
            txn.productId,
        )
        return False

    if txn.revocationDate is not None:
        logger.info(
            "⚒️🔒 Transaction has revocation date; treating as inactive "
            "revocation_date_ms=%s",
            txn.revocationDate,
        )
        return False

    if txn.expiresDate is not None:
        expires = _ms_to_datetime(txn.expiresDate)
        if expires is not None and expires <= django_tz.now():
            logger.info(
                "⚒️🔒 Transaction subscription has expired expires_at=%s now=%s",
                expires.isoformat(),
                django_tz.now().isoformat(),
            )
            return False

    logger.info("⚒️🔑 Transaction considered an active subscription")
    return True


def check_subscription_active_in_db(
    original_transaction_id: str,
) -> Optional[bool]:
    """
    Look up the subscription in the local DB (populated by App Store Server
    Notifications).  Returns True/False if a record exists, or None if no
    record is found (caller should fall back to JWS-only check).
    """
    logger.info(
        "⚒️🔒 Checking subscription activity in local DB original_transaction_id=%s",
        original_transaction_id,
    )
    try:
        sub = AppStoreSubscription.objects.get(
            original_transaction_id=original_transaction_id,
        )
        logger.info(
            "⚒️🔑 Found subscription in DB original_transaction_id=%s is_active=%s",
            original_transaction_id,
            sub.is_active,
        )
        return sub.is_active
    except AppStoreSubscription.DoesNotExist:
        logger.info(
            "⚒️🔒 No subscription record found in DB original_transaction_id=%s",
            original_transaction_id,
        )
        return None
