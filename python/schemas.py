from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, ValidationError, field_validator

from python.sensors import SENSOR_BY_ID


class SensorEvent(BaseModel):
    event_id: str
    sensor_id: str
    zone: str
    metric: str
    value: float
    unit: str
    measured_at: datetime
    source: str = "simulated_sensor"

    @field_validator("sensor_id")
    @classmethod
    def sensor_id_not_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("sensor_id is required")
        return value.strip()

    @field_validator("measured_at")
    @classmethod
    def measured_at_timezone_aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)


def parse_event(payload: dict[str, Any]) -> tuple[SensorEvent | None, str | None]:
    try:
        return SensorEvent.model_validate(payload), None
    except ValidationError as exc:
        return None, str(exc.errors()[0]["msg"])


def validate_business_rules(
    event: SensorEvent,
    sensor_lookup: dict[str, Any] | None = None,
) -> str | None:
    lookup = sensor_lookup or SENSOR_BY_ID
    sensor = lookup.get(event.sensor_id)
    if sensor is None:
        return f"unknown sensor_id: {event.sensor_id}"

    if event.metric != sensor.metric:
        return f"metric mismatch for {event.sensor_id}: expected {sensor.metric}, got {event.metric}"

    if event.unit != sensor.unit:
        return f"unit mismatch for {event.sensor_id}: expected {sensor.unit}, got {event.unit}"

    if event.zone != sensor.zone:
        return f"zone mismatch for {event.sensor_id}: expected {sensor.zone}, got {event.zone}"

    if event.metric == "temperature" and not (-30 <= event.value <= 60):
        return f"temperature out of physical range: {event.value}"

    if event.metric == "humidity" and not (0 <= event.value <= 100):
        return f"humidity out of physical range: {event.value}"

    return None


def evaluate_alert(event: SensorEvent) -> tuple[str | None, str | None, str | None]:
    sensor = SENSOR_BY_ID.get(event.sensor_id)
    if sensor is None:
        return None, None, None

    if event.value < sensor.normal_min:
        severity = "critical" if event.value < sensor.normal_min - 1 else "watch"
        return (
            "below_min",
            severity,
            f"{event.sensor_id}: {event.value}{event.unit} sous le seuil ({sensor.normal_min})",
        )

    if event.value > sensor.normal_max:
        severity = "critical" if event.value > sensor.normal_max + 1 else "watch"
        return (
            "above_max",
            severity,
            f"{event.sensor_id}: {event.value}{event.unit} au-dessus du seuil ({sensor.normal_max})",
        )

    return None, None, None
