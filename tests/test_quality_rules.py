from datetime import datetime, timezone

from python.schemas import evaluate_alert, validate_business_rules
from python.schemas import SensorEvent


def _event(sensor_id: str, value: float) -> SensorEvent:
    zones = {
        "FRIGO_LAIT_TEMP": "frigo_lait",
        "CAVE_01_TEMP": "cave_affinage_1",
        "CAVE_01_HUM": "cave_affinage_1",
    }
    metrics = {
        "FRIGO_LAIT_TEMP": "temperature",
        "CAVE_01_TEMP": "temperature",
        "CAVE_01_HUM": "humidity",
    }
    units = {
        "FRIGO_LAIT_TEMP": "celsius",
        "CAVE_01_TEMP": "celsius",
        "CAVE_01_HUM": "percent",
    }
    return SensorEvent(
        event_id="evt-test",
        sensor_id=sensor_id,
        zone=zones[sensor_id],
        metric=metrics[sensor_id],
        value=value,
        unit=units[sensor_id],
        measured_at=datetime.now(timezone.utc),
    )


def test_normal_frigo_temperature_no_alert():
    event = _event("FRIGO_LAIT_TEMP", 3.2)
    assert validate_business_rules(event) is None
    assert evaluate_alert(event) == (None, None, None)


def test_hot_frigo_triggers_critical_alert():
    event = _event("FRIGO_LAIT_TEMP", 9.8)
    threshold, severity, message = evaluate_alert(event)
    assert threshold == "above_max"
    assert severity == "critical"
    assert "FRIGO_LAIT_TEMP" in message


def test_impossible_humidity_rejected():
    event = _event("CAVE_01_HUM", 180)
    assert validate_business_rules(event) == "humidity out of physical range: 180.0"
