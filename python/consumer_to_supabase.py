"""Consumer Redpanda -> Supabase avec validation, dead-letter et alertes."""

from __future__ import annotations

import argparse
import json
import signal
import sys
import time
from datetime import datetime, timezone
from typing import Any

from kafka import KafkaConsumer
from supabase import Client, create_client

from python.config import Settings, get_settings
from python.schemas import evaluate_alert, parse_event, validate_business_rules
from python.sensors import SENSOR_BY_ID


class PipelineConsumer:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.supabase = self._create_supabase_client(settings)
        self.consumer = KafkaConsumer(
            settings.redpanda_topic,
            bootstrap_servers=settings.redpanda_bootstrap,
            group_id="brebiquettes-sensor-consumer",
            enable_auto_commit=False,
            auto_offset_reset="earliest",
            value_deserializer=lambda raw: json.loads(raw.decode("utf-8")),
            consumer_timeout_ms=int(settings.consumer_timeout_seconds * 1000),
        )
        self.running = True
        self.run_id: str | None = None
        self.stats = {
            "records_read": 0,
            "records_inserted": 0,
            "records_rejected": 0,
            "errors_count": 0,
        }

    @staticmethod
    def _create_supabase_client(settings: Settings) -> Client:
        if not settings.supabase_url or not settings.supabase_service_role_key:
            raise RuntimeError("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis")
        return create_client(settings.supabase_url, settings.supabase_service_role_key)

    def start_run(self) -> None:
        response = (
            self.supabase.table("pipeline_runs")
            .insert({"run_type": "consumer", "status": "running"})
            .execute()
        )
        self.run_id = response.data[0]["run_id"]

    def finish_run(self, status: str, error_message: str | None = None) -> None:
        if not self.run_id:
            return
        payload: dict[str, Any] = {
            "finished_at": datetime.now(timezone.utc).isoformat(),
            "status": status,
            "records_read": self.stats["records_read"],
            "records_inserted": self.stats["records_inserted"],
            "records_rejected": self.stats["records_rejected"],
            "errors_count": self.stats["errors_count"],
            "error_message": error_message,
        }
        self.supabase.table("pipeline_runs").update(payload).eq("run_id", self.run_id).execute()

    def store_dead_letter(
        self,
        payload: dict[str, Any],
        reason: str,
        *,
        topic: str,
        event_id: str | None = None,
    ) -> None:
        self.supabase.table("dead_letter_events").insert(
            {
                "event_id": event_id,
                "topic": topic,
                "payload": payload,
                "rejection_reason": reason,
            }
        ).execute()
        self.stats["records_rejected"] += 1

    def event_exists(self, event_id: str) -> bool:
        response = (
            self.supabase.table("raw_sensor_events")
            .select("event_id")
            .eq("event_id", event_id)
            .limit(1)
            .execute()
        )
        return bool(response.data)

    def process_message(self, message) -> None:
        self.stats["records_read"] += 1
        payload = message.value
        topic = message.topic
        event_id = payload.get("event_id")

        event, schema_error = parse_event(payload)
        if event is None:
            self.store_dead_letter(payload, f"schema: {schema_error}", topic=topic, event_id=event_id)
            return

        business_error = validate_business_rules(event)
        if business_error:
            self.store_dead_letter(payload, f"business: {business_error}", topic=topic, event_id=event.event_id)
            return

        if self.event_exists(event.event_id):
            return

        self.supabase.table("raw_sensor_events").insert(
            {
                "event_id": event.event_id,
                "topic": topic,
                "partition_id": message.partition,
                "offset_id": message.offset,
                "payload": payload,
            }
        ).execute()

        reading = {
            "event_id": event.event_id,
            "sensor_id": event.sensor_id,
            "zone_code": event.zone,
            "metric": event.metric,
            "value": event.value,
            "unit": event.unit,
            "measured_at": event.measured_at.isoformat(),
            "source": event.source,
        }
        self.supabase.table("stg_sensor_readings").insert(reading).execute()
        self.supabase.table("fact_sensor_readings").insert(reading).execute()
        self.stats["records_inserted"] += 1

        threshold_type, severity, alert_message = evaluate_alert(event)
        if threshold_type and severity and alert_message:
            self.supabase.table("fact_quality_alerts").insert(
                {
                    "sensor_id": event.sensor_id,
                    "zone_code": event.zone,
                    "metric": event.metric,
                    "value": event.value,
                    "threshold_type": threshold_type,
                    "severity": severity,
                    "message": alert_message,
                    "event_id": event.event_id,
                }
            ).execute()

    def run_quality_checks(self) -> None:
        checks: list[dict[str, Any]] = []

        nulls = (
            self.supabase.table("stg_sensor_readings")
            .select("event_id", count="exact")
            .is_("sensor_id", "null")
            .execute()
        )
        checks.append(
            {
                "check_name": "completeness_sensor_id",
                "check_category": "completeness",
                "status": "pass" if (nulls.count or 0) == 0 else "fail",
                "details": {"null_sensor_ids": nulls.count or 0},
            }
        )

        duplicate = (
            self.supabase.table("raw_sensor_events")
            .select("event_id", count="exact")
            .execute()
        )
        checks.append(
            {
                "check_name": "uniqueness_event_id",
                "check_category": "uniqueness",
                "status": "pass",
                "details": {"raw_events": duplicate.count or 0},
            }
        )

        latest = (
            self.supabase.table("fact_sensor_readings")
            .select("measured_at")
            .order("measured_at", desc=True)
            .limit(1)
            .execute()
        )
        freshness_status = "warn"
        minutes_since = None
        if latest.data:
            measured_at = datetime.fromisoformat(latest.data[0]["measured_at"].replace("Z", "+00:00"))
            minutes_since = (datetime.now(timezone.utc) - measured_at).total_seconds() / 60
            freshness_status = (
                "pass"
                if minutes_since <= self.settings.freshness_threshold_minutes
                else "fail"
            )
        checks.append(
            {
                "check_name": "freshness_last_reading",
                "check_category": "freshness",
                "status": freshness_status,
                "details": {"minutes_since_last_reading": minutes_since},
            }
        )

        for sensor_id, sensor in SENSOR_BY_ID.items():
            invalid = (
                self.supabase.table("fact_sensor_readings")
                .select("event_id", count="exact")
                .eq("sensor_id", sensor_id)
                .or_(f"value.lt.{sensor.normal_min - 20},value.gt.{sensor.normal_max + 20}")
                .execute()
            )
            if (invalid.count or 0) > 0:
                checks.append(
                    {
                        "check_name": f"validity_{sensor_id}",
                        "check_category": "validity",
                        "status": "fail",
                        "details": {"impossible_values": invalid.count},
                    }
                )

        if checks:
            self.supabase.table("data_quality_results").insert(checks).execute()

    def poll_loop(self, *, max_cycles: int | None = None) -> None:
        self.start_run()
        cycles = 0
        print("Consumer démarré — en attente d'événements Redpanda")

        try:
            while self.running and (max_cycles is None or cycles < max_cycles):
                batch = self.consumer.poll(timeout_ms=int(self.settings.consumer_timeout_seconds * 1000))
                if not batch:
                    cycles += 1
                    continue

                for _, messages in batch.items():
                    for message in messages:
                        try:
                            self.process_message(message)
                        except Exception as exc:  # noqa: BLE001
                            self.stats["errors_count"] += 1
                            self.store_dead_letter(
                                message.value if isinstance(message.value, dict) else {"raw": message.value},
                                f"processing: {exc}",
                                topic=message.topic,
                                event_id=message.value.get("event_id") if isinstance(message.value, dict) else None,
                            )

                    self.consumer.commit()

                self.run_quality_checks()
                cycles += 1
                print(
                    f"[consumer] read={self.stats['records_read']} "
                    f"inserted={self.stats['records_inserted']} "
                    f"rejected={self.stats['records_rejected']}"
                )

            status = "success" if self.stats["errors_count"] == 0 else "partial"
            self.finish_run(status)
        except Exception as exc:  # noqa: BLE001
            self.finish_run("failed", str(exc))
            raise
        finally:
            self.consumer.close()

    def stop(self) -> None:
        self.running = False


def main() -> None:
    parser = argparse.ArgumentParser(description="Consumer Redpanda vers Supabase")
    parser.add_argument("--cycles", type=int, default=None, help="Nombre de cycles de poll")
    args = parser.parse_args()

    settings = get_settings()
    pipeline = PipelineConsumer(settings)

    def handle_signal(*_args) -> None:
        pipeline.stop()

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    try:
        pipeline.poll_loop(max_cycles=args.cycles)
    except KeyboardInterrupt:
        pipeline.stop()
        sys.exit(0)


if __name__ == "__main__":
    main()
