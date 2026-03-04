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
    if header_token:
        return header_token
    return request.GET.get("token") or None


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
        return PremiumCheckResult(has_premium=False, reason="missing_token")

    txn = verify_transaction_jws(token)
    if txn is None:
        return PremiumCheckResult(has_premium=False, reason="jws_verification_failed")

    if not check_transaction_is_active_subscription(txn):
        return PremiumCheckResult(has_premium=False, reason="inactive_subscription")

    if txn.originalTransactionId:
        db_active = check_subscription_active_in_db(txn.originalTransactionId)
        if db_active is False:
            return PremiumCheckResult(
                has_premium=False, reason="revoked_via_notification",
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
    token = _extract_entitlement_token(request)
    entitlement = _verify_premium_entitlement(token)

    if not entitlement.has_premium:
        return JsonResponse(
            {"detail": "Valid subscription required.", "reason": entitlement.reason},
            status=401,
        )

    try:
        content = GameContent.objects.get(name=slug)
    except GameContent.DoesNotExist:
        return JsonResponse({"detail": "Not found."}, status=404)

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
