"""Simulateur de capteurs — envoie des événements dans Redpanda."""

from __future__ import annotations

import argparse
import json
import random
import time
import uuid
from datetime import datetime, timezone

from kafka import KafkaProducer

from python.config import get_settings
from python.sensors import SENSORS


def build_event(
    sensor,
    *,
    force_value: float | None = None,
    force_invalid: bool = False,
) -> dict:
    if force_invalid:
        return {
            "event_id": str(uuid.uuid4()),
            "sensor_id": None,
            "zone": sensor.zone,
            "metric": sensor.metric,
            "value": random.uniform(sensor.normal_min, sensor.normal_max),
            "unit": sensor.unit,
            "measured_at": datetime.now(timezone.utc).isoformat(),
            "source": "simulated_sensor",
        }

    if force_value is not None:
        value = force_value
    else:
        center = (sensor.normal_min + sensor.normal_max) / 2
        spread = (sensor.normal_max - sensor.normal_min) / 2
        value = round(random.gauss(center, spread * 0.2), 2)

    return {
        "event_id": str(uuid.uuid4()),
        "sensor_id": sensor.sensor_id,
        "zone": sensor.zone,
        "metric": sensor.metric,
        "value": value,
        "unit": sensor.unit,
        "measured_at": datetime.now(timezone.utc).isoformat(),
        "source": "simulated_sensor",
    }


def create_producer(bootstrap_servers: str) -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=bootstrap_servers,
        value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        key_serializer=lambda key: key.encode("utf-8") if key else None,
        acks="all",
        retries=3,
    )


def run_producer(*, count: int | None = None, interval: float | None = None) -> None:
    settings = get_settings()
    producer = create_producer(settings.redpanda_bootstrap)
    tick = 0
    sent = 0

    print(f"Producer démarré — topic={settings.redpanda_topic}, bootstrap={settings.redpanda_bootstrap}")

    try:
        while count is None or sent < count:
            tick += 1
            for sensor in SENSORS:
                force_invalid = tick % 17 == 0 and sensor.sensor_id == "CAVE_01_TEMP"
                force_anomaly = tick % 11 == 0 and sensor.sensor_id == "FRIGO_LAIT_TEMP"
                force_value = 9.8 if force_anomaly else None

                event = build_event(
                    sensor,
                    force_value=force_value,
                    force_invalid=force_invalid,
                )
                producer.send(
                    settings.redpanda_topic,
                    key=event.get("sensor_id") or "invalid",
                    value=event,
                )
                sent += 1
                label = event.get("sensor_id") or "INVALID"
                print(f"[producer] {label} -> {event.get('value')}")

            producer.flush()
            sleep_for = interval if interval is not None else settings.producer_interval_seconds
            time.sleep(sleep_for)
    except KeyboardInterrupt:
        print("Producer arrêté.")
    finally:
        producer.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Simulateur de capteurs Redpanda")
    parser.add_argument("--count", type=int, default=None, help="Nombre de cycles à envoyer")
    parser.add_argument("--interval", type=float, default=None, help="Intervalle entre cycles (s)")
    args = parser.parse_args()
    run_producer(count=args.count, interval=args.interval)


if __name__ == "__main__":
    main()
