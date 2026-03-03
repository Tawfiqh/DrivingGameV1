from __future__ import annotations

from dataclasses import dataclass
import json
import time
from typing import Any, Optional

from django.http import JsonResponse, HttpRequest, HttpResponse
from django.views.decorators.http import require_GET

from .models import GameContent

DEBUG_LOG_PATH = "/Users/tawfiq/Documents/Programs/Web/CarDriveDash/.cursor/debug-8ec022.log"


def _debug_log(*, message: str, data: dict[str, Any], hypothesis_id: str) -> None:
    """
    Append a single NDJSON log line for this debug session.
    """
    payload = {
        "sessionId": "8ec022",
        "runId": "run1",
        "hypothesisId": hypothesis_id,
        "location": "game_content/views.py",
        "message": message,
        "data": data,
        "timestamp": int(time.time() * 1000),
    }
    try:
        with open(DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except OSError:
        # Logging failures must not break the endpoint.
        pass


@dataclass
class PremiumCheckResult:
    has_premium: bool
    reason: Optional[str] = None


def _extract_entitlement_token(request: HttpRequest) -> Optional[str]:
    """
    Extract the proof-of-purchase / entitlement token sent by the iOS app.

    For the initial implementation we keep this simple and look in:
    - `X-App-Store-Token` header, or
    - `token` query parameter.

    This can later be expanded to accept a full StoreKit transaction JWS in
    the request body when the App Store Server API integration is wired up.
    """
    header_token = request.headers.get("X-App-Store-Token")
    if header_token:
        return header_token
    return request.GET.get("token") or None


def _verify_premium_entitlement(token: Optional[str]) -> PremiumCheckResult:
    """
    Verify that the caller has an active premium entitlement.

    In production this should:
    - Call the App Store Server API with the StoreKit transaction / JWS.
    - Validate signatures, product IDs and expiration.
    - Cache results as appropriate.

    For now we treat any non-empty token as "has premium" so that the
    end-to-end flow can be exercised from the iOS app without requiring
    a live App Store Server integration.
    """
    if not token:
        return PremiumCheckResult(has_premium=False, reason="missing_token")
    # TODO: Replace this stub with real App Store Server API validation.
    return PremiumCheckResult(has_premium=True, reason="stubbed_true")


@require_GET
def game_content_detail(request: HttpRequest, slug: str) -> HttpResponse:
    """
    Premium-gated GameContent detail endpoint.

    - Always returns `name` and `display_name`.
    - Only returns `json_config` when the caller has a valid premium entitlement.
    """
    # #region agent log
    _debug_log(
        message="game_content_detail called",
        data={"slug": slug},
        hypothesis_id="H1",
    )
    # #endregion
    try:
        content = GameContent.objects.get(name=slug)
    except GameContent.DoesNotExist:
        # #region agent log
        _debug_log(
            message="GameContent not found",
            data={"slug": slug},
            hypothesis_id="H1",
        )
        # #endregion
        return JsonResponse({"detail": "Not found."}, status=404)

    token = _extract_entitlement_token(request)
    entitlement = _verify_premium_entitlement(token)

    response_data: dict[str, Any] = {
        "name": content.name,
        "display_name": content.display_name,
    }

    if entitlement.has_premium:
        response_data["json_config"] = content.json_config
    else:
        # Intentionally omit the full config for non-premium callers.
        response_data["json_config"] = None

    return JsonResponse(response_data)


@require_GET
def game_content_list(request: HttpRequest) -> HttpResponse:
    """
    List all available GameContent entries (metadata only).
    """
    contents = GameContent.objects.all().only("name", "display_name")
    data: list[dict[str, Any]] = [
        {"name": c.name, "display_name": c.display_name} for c in contents
    ]
    # #region agent log
    _debug_log(
        message="game_content_list called",
        data={"count": len(data)},
        hypothesis_id="H2",
    )
    # #endregion
    return JsonResponse(data, safe=False)

