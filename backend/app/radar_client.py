import logging
import time
from typing import Any

import httpx

from app.config import settings

RADAR_BASE_URL = "https://api.cloudflare.com/client/v4/radar"

logger = logging.getLogger("radar_client")


class RadarAPIError(Exception):
    def __init__(self, status_code: int, detail: Any):
        self.status_code = status_code
        self.detail = detail
        super().__init__(f"Radar API error {status_code}: {detail}")


class _TTLCache:
    """Cache muito simples em memória para evitar bater no rate limit da Radar API."""

    def __init__(self, ttl_seconds: int):
        self.ttl = ttl_seconds
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.time() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (time.time() + self.ttl, value)


_cache = _TTLCache(settings.cache_ttl_seconds)


class RadarClient:
    """
    Wrapper fino sobre a Cloudflare Radar API (v4).
    Documentação: https://developers.cloudflare.com/radar/
    """

    def __init__(self, token: str | None = None):
        self.token = token or settings.cloudflare_api_token
        if not self.token:
            raise RuntimeError(
                "CLOUDFLARE_API_TOKEN não está definido. "
                "Cria um token com scope 'Radar:Read' e coloca-o no ficheiro .env"
            )

    async def get(self, path: str, params: dict[str, Any] | None = None) -> dict:
        """
        Faz um GET a um endpoint da Radar API, ex: path='/attacks/layer3/timeseries'.
        Usa cache em memória por (path, params) durante cache_ttl_seconds.
        """
        params = params or {}
        cache_key = f"{path}?{sorted(params.items())}"
        cached = _cache.get(cache_key)
        if cached is not None:
            return cached

        url = f"{RADAR_BASE_URL}{path}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=headers, params=params)

        if resp.status_code != 200:
            # O corpo da resposta de erro da Cloudflare fica só no log do servidor.
            # Nunca o devolvemos tal e qual ao cliente: pode conter detalhes internos
            # (ex. mensagens que confirmam se um token é válido/inválido, scopes, etc.)
            # que são úteis a um atacante a fazer reconhecimento contra este backend.
            logger.warning("Radar API respondeu %s para %s: %s", resp.status_code, path, resp.text)
            raise RadarAPIError(resp.status_code, "A Radar API rejeitou o pedido.")

        data = resp.json()
        _cache.set(cache_key, data)
        return data


radar_client = RadarClient()
