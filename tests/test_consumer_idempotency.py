from python.schemas import parse_event


def test_duplicate_event_id_detectable():
    payload = {
        "event_id": "duplicate-evt",
        "sensor_id": "LABO_TEMP",
        "zone": "laboratoire",
        "metric": "temperature",
        "value": 18.0,
        "unit": "celsius",
        "measured_at": "2026-06-07T10:00:00+00:00",
    }
    event_a, err_a = parse_event(payload)
    event_b, err_b = parse_event(payload)
    assert err_a is None and err_b is None
    assert event_a is not None and event_b is not None
    assert event_a.event_id == event_b.event_id
