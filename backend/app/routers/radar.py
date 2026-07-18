from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.radar_client import RadarAPIError, radar_client

router = APIRouter(prefix="/api", tags=["radar"])


def _loc(location: str | None) -> str:
    return location or settings.default_location


async def _safe_get(path: str, params: dict) -> dict:
    try:
        return await radar_client.get(path, params)
    except RadarAPIError as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.get("/attacks/layer3/timeseries")
async def layer3_timeseries(location: str = Query(default=None), date_range: str = "7d"):
    """Série temporal de ataques de camada 3 (volumétricos/DDoS de rede)."""
    return await _safe_get(
        "/attacks/layer3/timeseries",
        {"location": _loc(location), "dateRange": date_range, "format": "json"},
    )


@router.get("/attacks/layer7/timeseries")
async def layer7_timeseries(location: str = Query(default=None), date_range: str = "7d"):
    """Série temporal de ataques de camada 7 (aplicacional/HTTP)."""
    return await _safe_get(
        "/attacks/layer7/timeseries",
        {"location": _loc(location), "dateRange": date_range, "format": "json"},
    )


@router.get("/attacks/layer3/top-origins")
async def layer3_top_origins(location: str = Query(default=None), date_range: str = "7d", limit: int = 8):
    """Top países de origem dos ataques de camada 3 dirigidos a `location`."""
    return await _safe_get(
        "/attacks/layer3/top/locations/origin",
        {"location": _loc(location), "dateRange": date_range, "limit": limit, "format": "json"},
    )


@router.get("/attacks/layer7/top-origins")
async def layer7_top_origins(location: str = Query(default=None), date_range: str = "7d", limit: int = 8):
    """Top países de origem dos ataques de camada 7 dirigidos a `location`."""
    return await _safe_get(
        "/attacks/layer7/top/locations/origin",
        {"location": _loc(location), "dateRange": date_range, "limit": limit, "format": "json"},
    )


@router.get("/http/bot-class")
async def http_bot_class(location: str = Query(default=None), date_range: str = "7d"):
    """Percentagem de tráfego HTTP humano vs. automatizado (bots)."""
    return await _safe_get(
        "/http/summary/bot_class",
        {"location": _loc(location), "dateRange": date_range, "format": "json"},
    )


@router.get("/http/ip-version")
async def http_ip_version(location: str = Query(default=None), date_range: str = "7d"):
    """Distribuição de tráfego HTTP por IPv4 vs. IPv6."""
    return await _safe_get(
        "/http/summary/ip_version",
        {"location": _loc(location), "dateRange": date_range, "format": "json"},
    )


@router.get("/anomalies")
async def anomalies(location: str = Query(default=None), date_range: str = "7d", limit: int = 10):
    """Anomalias de tráfego / possíveis outages detetados pela Cloudflare."""
    return await _safe_get(
        "/annotations",
        {"location": _loc(location), "dateRange": date_range, "limit": limit, "format": "json"},
    )
