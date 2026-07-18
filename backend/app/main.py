from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.radar import router as radar_router

app = FastAPI(
    title="Radar PT — Threat Landscape API",
    description="Proxy local à Cloudflare Radar API, com cache, para o dashboard Radar PT.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(radar_router)


@app.get("/health")
async def health():
    return {"status": "ok", "default_location": settings.default_location}
