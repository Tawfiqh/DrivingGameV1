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
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"detail": "Invalid JSON."}, status=400)

    signed_payload = body.get("signedPayload")
    if not signed_payload:
        return JsonResponse(
            {"detail": "Missing signedPayload."}, status=400,
        )

    try:
        verifier = get_verifier()
        notification = verifier.verify_and_decode_notification(signed_payload)
    except VerificationException:
        logger.warning("Notification JWS verification failed", exc_info=True)
        return JsonResponse({"detail": "Verification failed."}, status=403)
    except Exception:
        logger.exception("Unexpected error verifying notification")
        return JsonResponse({"detail": "Server error."}, status=500)

    notification_type = notification.notificationType
    subtype = notification.subtype

    if notification_type == NotificationTypeV2.TEST:
        logger.info("Received App Store TEST notification")
        return JsonResponse({"status": "ok"})

    data = notification.data
    if data is None:
        logger.info(
            "Notification %s has no data payload (e.g. summary); ignoring.",
            notification_type,
        )
        return JsonResponse({"status": "ok"})

    signed_transaction_info = data.signedTransactionInfo
    if not signed_transaction_info:
        logger.warning(
            "Notification %s missing signedTransactionInfo", notification_type,
        )
        return JsonResponse({"status": "ok"})

    try:
        txn = verifier.verify_and_decode_signed_transaction(
            signed_transaction_info,
        )
    except VerificationException:
        logger.warning(
            "Transaction JWS inside notification failed verification",
            exc_info=True,
        )
        return JsonResponse({"detail": "Transaction verification failed."}, status=403)

    if not txn.originalTransactionId:
        logger.warning("Transaction missing originalTransactionId")
        return JsonResponse({"status": "ok"})

    is_active = notification_type not in DEACTIVATING_NOTIFICATION_TYPES

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

    AppStoreSubscription.objects.update_or_create(
        original_transaction_id=txn.originalTransactionId,
        defaults=defaults,
    )

    logger.info(
        "Processed %s/%s for originalTransactionId=%s productId=%s is_active=%s",
        notification_type,
        subtype,
        txn.originalTransactionId,
        txn.productId,
        is_active,
    )

    return JsonResponse({"status": "ok"})
