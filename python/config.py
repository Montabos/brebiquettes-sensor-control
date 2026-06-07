import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()
load_dotenv(".env.local", override=True)


@dataclass(frozen=True)
class Settings:
    redpanda_bootstrap: str
    redpanda_topic: str
    supabase_url: str
    supabase_service_role_key: str
    producer_interval_seconds: float
    consumer_batch_size: int
    consumer_timeout_seconds: float
    freshness_threshold_minutes: int


def get_settings() -> Settings:
    return Settings(
        redpanda_bootstrap=os.getenv("REDPANDA_BOOTSTRAP", "localhost:19092"),
        redpanda_topic=os.getenv("REDPANDA_TOPIC", "sensor_readings"),
        supabase_url=os.getenv("SUPABASE_URL", ""),
        supabase_service_role_key=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
        producer_interval_seconds=float(os.getenv("PRODUCER_INTERVAL_SECONDS", "5")),
        consumer_batch_size=int(os.getenv("CONSUMER_BATCH_SIZE", "100")),
        consumer_timeout_seconds=float(os.getenv("CONSUMER_TIMEOUT_SECONDS", "1.0")),
        freshness_threshold_minutes=int(os.getenv("FRESHNESS_THRESHOLD_MINUTES", "15")),
    )
