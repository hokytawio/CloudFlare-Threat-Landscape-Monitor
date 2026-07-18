from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configurações da aplicação, lidas do ficheiro .env.

    CLOUDFLARE_API_TOKEN: token com scope "Radar:Read" criado em
    https://dash.cloudflare.com/profile/api-tokens
    """

    cloudflare_api_token: str = ""
    default_location: str = "PT"
    cache_ttl_seconds: int = 60
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
