from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Optional

from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.http import require_GET

from appstore.verification import (
    check_subscription_active_in_db,
    check_transaction_is_active_subscription,
    verify_transaction_jws,
)

from .models import GameContent

logger = logging.getLogger(__name__)


@dataclass
class PremiumCheckResult:
    has_premium: bool
    reason: Optional[str] = None


def _extract_entitlement_token(request: HttpRequest) -> Optional[str]:
    """
    Extract the signed transaction JWS sent by the iOS app.

    Accepted in:
      - ``X-App-Store-Token`` request header, or
      - ``token`` query parameter.
    """
    header_token = request.headers.get("X-App-Store-Token")
    query_token = request.GET.get("token")

    if header_token:
        logger.info(
            "🖼️🔒 Extracted entitlement token from header token_length=%s token_prefix=%s",
            len(header_token),
            header_token[:32],
        )
        return header_token

    if query_token:
        logger.info(
            "🖼️🔒 Extracted entitlement token from query parameter "
            "token_length=%s token_prefix=%s",
            len(query_token),
            query_token[:32],
        )
        return query_token

    logger.info(
        "🖼️🔒 No entitlement token found on request has_header=%s has_query_token=%s",
        "X-App-Store-Token" in request.headers,
        "token" in request.GET,
    )
    return None


def _verify_premium_entitlement(token: Optional[str]) -> PremiumCheckResult:
    """
    Verify that the caller has an active premium subscription.

    1. Verify the JWS signature and decode the transaction.
    2. Check the decoded transaction for a recognised subscription product ID
       and a non-expired expiry date.
    3. Cross-check against the local DB (populated by App Store Server
       Notifications) to catch revocations/refunds that happened after the
       JWS was signed.
    """
    if not token:
        logger.info("🖼️🔒 Premium entitlement check failed: missing token reason=%s", "missing_token")
        return PremiumCheckResult(has_premium=False, reason="missing_token")

    logger.info(
        "🖼️🔒 Starting premium entitlement verification token_length=%s token_prefix=%s",
        len(token),
        token[:32],
    )

    txn = verify_transaction_jws(token)
    if txn is None:
        logger.info(
            "🖼️🔒 Premium entitlement check failed: JWS verification failed reason=%s",
            "jws_verification_failed",
        )
        return PremiumCheckResult(
            has_premium=False,
            reason="jws_verification_failed",
        )

    logger.info(
        "🖼️🔑 Decoded JWS transaction payload product_id=%s original_transaction_id=%s "
        "expires_date_ms=%s revocation_date_ms=%s",
        getattr(txn, "productId", None),
        getattr(txn, "originalTransactionId", None),
        getattr(txn, "expiresDate", None),
        getattr(txn, "revocationDate", None),
    )

    if not check_transaction_is_active_subscription(txn):
        logger.info(
            "🔒 Premium entitlement check failed: inactive subscription "
            "reason=%s product_id=%s",
            "inactive_subscription",
            getattr(txn, "productId", None),
        )
        return PremiumCheckResult(
            has_premium=False,
            reason="inactive_subscription",
        )

    if txn.originalTransactionId:
        db_active = check_subscription_active_in_db(txn.originalTransactionId)
        if db_active is False:
            logger.info(
                "🖼️🔒 Premium entitlement check failed: revoked via notification "
                "reason=%s original_transaction_id=%s",
                "revoked_via_notification",
                txn.originalTransactionId,
            )
            return PremiumCheckResult(
                has_premium=False,
                reason="revoked_via_notification",
            )
        logger.info(
            "🖼️🔑 DB subscription check did not block entitlement db_active=%s "
            "original_transaction_id=%s",
            db_active,
            txn.originalTransactionId,
        )

    logger.info(
        "🖼️🔑 Premium entitlement successfully verified reason=%s product_id=%s "
        "original_transaction_id=%s",
        "verified",
        getattr(txn, "productId", None),
        getattr(txn, "originalTransactionId", None),
    )
    return PremiumCheckResult(has_premium=True, reason="verified")


@require_GET
def game_content_detail(request: HttpRequest, slug: str) -> HttpResponse:
    """
    Premium-gated GameContent detail endpoint.

    - Always returns ``name`` and ``display_name``.
    - Only returns ``json_config`` when the caller has a valid premium
      entitlement.
    """
    logger.info(
        "🖼️🔒 GameContent detail endpoint called slug=%s path=%s method=%s "
        "remote_addr=%s user_agent=%s",
        slug,
        request.path,
        request.method,
        request.META.get("REMOTE_ADDR"),
        request.META.get("HTTP_USER_AGENT"),
    )
    token = _extract_entitlement_token(request)
    entitlement = _verify_premium_entitlement(token)

    logger.info(
        "🖼️🔑 Entitlement check completed for game content detail slug=%s "
        "has_premium=%s reason=%s",
        slug,
        entitlement.has_premium,
        entitlement.reason,
    )

    if not entitlement.has_premium:
        logger.warning(
            "🖼️🔒 Rejecting game content detail request due to missing premium "
            "entitlement slug=%s reason=%s status_code=%s",
            slug,
            entitlement.reason,
            401,
        )
        return JsonResponse(
            {"detail": "Valid subscription required.", "reason": entitlement.reason},
            status=401,
        )

    try:
        content = GameContent.objects.get(name=slug)
    except GameContent.DoesNotExist:
        logger.warning(
            "🖼️🔒 GameContent not found slug=%s status_code=%s",
            slug,
            404,
        )
        return JsonResponse({"detail": "Not found."}, status=404)

    logger.info(
        "🖼️🔑 Returning premium game content detail slug=%s name=%s display_name=%s",
        slug,
        content.name,
        content.display_name,
    )

    return JsonResponse({
        "name": content.name,
        "display_name": content.display_name,
        "json_config": content.json_config,
    })


@require_GET
def game_content_list(request: HttpRequest) -> HttpResponse:
    """
    List all available GameContent entries (metadata only).
    """
    contents = GameContent.objects.all().only("name", "display_name")
    data: list[dict[str, Any]] = [
        {"name": c.name, "display_name": c.display_name} for c in contents
    ]
    return JsonResponse(data, safe=False)
