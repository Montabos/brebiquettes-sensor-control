from datetime import datetime, timezone

from python.schemas import parse_event, validate_business_rules


def test_valid_event_parses():
    payload = {
        "event_id": "evt-1",
        "sensor_id": "FRIGO_LAIT_TEMP",
        "zone": "frigo_lait",
        "metric": "temperature",
        "value": 3.2,
        "unit": "celsius",
        "measured_at": datetime.now(timezone.utc).isoformat(),
    }
    event, error = parse_event(payload)
    assert error is None
    assert event is not None
    assert event.sensor_id == "FRIGO_LAIT_TEMP"


def test_missing_sensor_id_rejected():
    payload = {
        "event_id": "evt-2",
        "sensor_id": None,
        "zone": "frigo_lait",
        "metric": "temperature",
        "value": 3.2,
        "unit": "celsius",
        "measured_at": datetime.now(timezone.utc).isoformat(),
    }
    event, error = parse_event(payload)
    assert event is None
    assert error is not None


def test_business_rule_unknown_sensor():
    payload = {
        "event_id": "evt-3",
        "sensor_id": "UNKNOWN",
        "zone": "frigo_lait",
        "metric": "temperature",
        "value": 3.2,
        "unit": "celsius",
        "measured_at": datetime.now(timezone.utc).isoformat(),
    }
    event, _ = parse_event(payload)
    assert event is not None
    assert validate_business_rules(event, None) == "unknown sensor_id: UNKNOWN"
