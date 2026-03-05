from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from appstoreserverlibrary.models.NotificationTypeV2 import NotificationTypeV2
from appstoreserverlibrary.signed_data_verifier import VerificationException

from .models import AppStoreSubscription
from .verification import get_verifier

logger = logging.getLogger(__name__)

DEACTIVATING_NOTIFICATION_TYPES = {
    NotificationTypeV2.EXPIRED,
    NotificationTypeV2.REVOKE,
    NotificationTypeV2.REFUND,
    NotificationTypeV2.GRACE_PERIOD_EXPIRED,
}

ACTIVATING_NOTIFICATION_TYPES = {
    NotificationTypeV2.SUBSCRIBED,
    NotificationTypeV2.DID_RENEW,
    NotificationTypeV2.OFFER_REDEEMED,
    NotificationTypeV2.RENEWAL_EXTENDED,
    NotificationTypeV2.REFUND_REVERSED,
}


def _ms_to_datetime(ms: Optional[int]) -> Optional[datetime]:
    if ms is None:
        return None
    return datetime.fromtimestamp(ms / 1000.0, tz=timezone.utc)


@csrf_exempt
@require_POST
def appstore_webhook(request: HttpRequest) -> HttpResponse:
    """
    Receive and process App Store Server Notifications V2.

    Apple POSTs ``{"signedPayload": "<JWS>"}`` to this endpoint whenever
    a subscription event occurs (purchase, renewal, expiry, refund, etc.).
    """
    logger.info(
        "🔒 App Store webhook called path=%s method=%s remote_addr=%s user_agent=%s",
        request.path,
        request.method,
        request.META.get("REMOTE_ADDR"),
        request.META.get("HTTP_USER_AGENT"),
    )
    try:
        body = json.loads(request.body)
        logger.info(
            "🔒 Parsed webhook JSON body successfully has_signedPayload=%s keys=%s",
            "signedPayload" in body,
            list(body.keys()),
        )
    except (json.JSONDecodeError, ValueError):
        logger.warning("🔒 Invalid JSON body for App Store webhook")
        return JsonResponse({"detail": "Invalid JSON."}, status=400)

    signed_payload = body.get("signedPayload")
    if not signed_payload:
        logger.warning("🔒 Missing signedPayload in App Store webhook body")
        return JsonResponse(
            {"detail": "Missing signedPayload."}, status=400,
        )

    token_preview = signed_payload[:32]
    token_length = len(signed_payload)

    try:
        logger.info(
            "🔒 Verifying App Store notification JWS token_length=%s token_prefix=%s",
            token_length,
            token_preview,
        )
        verifier = get_verifier()
        notification = verifier.verify_and_decode_notification(signed_payload)
        logger.info(
            "🔑 Notification JWS verification succeeded",
        )
    except VerificationException as exc:
        logger.warning(
            "🔒 Notification JWS verification failed token_length=%s token_prefix=%s "
            "error_type=%s",
            token_length,
            token_preview,
            type(exc).__name__,
            exc_info=True,
        )
        return JsonResponse({"detail": "Verification failed."}, status=403)
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "🔒 Unexpected error verifying notification token_length=%s token_prefix=%s "
            "error_type=%s",
            token_length,
            token_preview,
            type(exc).__name__,
        )
        return JsonResponse({"detail": "Server error."}, status=500)

    notification_type = notification.notificationType
    subtype = notification.subtype

    logger.info(
        "🔒 Decoded App Store notification notification_type=%s subtype=%s",
        notification_type,
        subtype,
    )

    if notification_type == NotificationTypeV2.TEST:
        logger.info("🔑 Received App Store TEST notification")
        return JsonResponse({"status": "ok"})

    data = notification.data
    if data is None:
        logger.info(
            "🔒 Notification has no data payload (e.g. summary); ignoring "
            "notification_type=%s",
            notification_type,
        )
        return JsonResponse({"status": "ok"})

    signed_transaction_info = data.signedTransactionInfo
    if not signed_transaction_info:
        logger.warning(
            "🔒 Notification missing signedTransactionInfo notification_type=%s",
            notification_type,
        )
        return JsonResponse({"status": "ok"})

    try:
        logger.info(
            "🔒 Verifying transaction JWS inside notification "
            "token_length=%s token_prefix=%s",
            len(signed_transaction_info),
            signed_transaction_info[:32],
        )
        txn = verifier.verify_and_decode_signed_transaction(
            signed_transaction_info,
        )
        logger.info(
            "🔑 Transaction JWS inside notification verified "
            "transactionId=%s originalTransactionId=%s productId=%s",
            getattr(txn, "transactionId", None),
            getattr(txn, "originalTransactionId", None),
            getattr(txn, "productId", None),
        )
    except VerificationException as exc:
        logger.warning(
            "🔒 Transaction JWS inside notification failed verification "
            "error_type=%s",
            type(exc).__name__,
            exc_info=True,
        )
        return JsonResponse({"detail": "Transaction verification failed."}, status=403)

    if not txn.originalTransactionId:
        logger.warning(
            "🔒 Transaction missing originalTransactionId transactionId=%s productId=%s",
            getattr(txn, "transactionId", None),
            getattr(txn, "productId", None),
        )
        return JsonResponse({"status": "ok"})

    is_active = notification_type not in DEACTIVATING_NOTIFICATION_TYPES

    logger.info(
        "🔒 Derived subscription active state notification_type=%s is_active=%s",
        notification_type,
        is_active,
    )

    defaults = {
        "transaction_id": txn.transactionId or "",
        "product_id": txn.productId or "",
        "bundle_id": txn.bundleId or "",
        "environment": txn.rawEnvironment or "",
        "expires_date": _ms_to_datetime(txn.expiresDate),
        "is_active": is_active,
        "last_notification_type": str(notification_type.value) if notification_type else "",
        "last_notification_subtype": str(subtype.value) if subtype else "",
        "original_purchase_date": _ms_to_datetime(txn.originalPurchaseDate),
    }

    logger.info(
        "🔒 Upserting AppStoreSubscription originalTransactionId=%s transaction_id=%s "
        "product_id=%s bundle_id=%s environment=%s expires_date=%s is_active=%s "
        "last_notification_type=%s last_notification_subtype=%s original_purchase_date=%s",
        txn.originalTransactionId,
        defaults["transaction_id"],
        defaults["product_id"],
        defaults["bundle_id"],
        defaults["environment"],
        defaults["expires_date"],
        defaults["is_active"],
        defaults["last_notification_type"],
        defaults["last_notification_subtype"],
        defaults["original_purchase_date"],
    )

    AppStoreSubscription.objects.update_or_create(
        original_transaction_id=txn.originalTransactionId,
        defaults=defaults,
    )

    logger.info(
        "🔑 Processed notification notification_type=%s subtype=%s "
        "originalTransactionId=%s productId=%s is_active=%s",
        notification_type,
        subtype,
        txn.originalTransactionId,
        txn.productId,
        is_active,
    )

    return JsonResponse({"status": "ok"})
