export type QualityStatus = "ok" | "watch" | "critical" | "unknown";
export type AlertSeverity = "watch" | "critical";
export type PipelineStatus = "running" | "success" | "failed" | "partial";

export interface ZoneStatus {
  zone_code: string;
  zone_label: string;
  sensor_id: string;
  metric: string;
  unit: string;
  normal_min: number;
  normal_max: number;
  last_value: number | null;
  last_measured_at: string | null;
  minutes_since_reading: number | null;
  status_level: QualityStatus;
  open_alerts_count: number;
}

export interface QualityAlert {
  id: string;
  sensor_id: string;
  zone_code: string;
  zone_label: string | null;
  metric: string;
  value: number;
  threshold_type: string;
  severity: AlertSeverity;
  message: string;
  status: string;
  created_at: string;
}

export interface PipelineRun {
  run_id: string;
  run_type: string;
  started_at: string;
  finished_at: string | null;
  status: PipelineStatus;
  records_read: number;
  records_inserted: number;
  records_rejected: number;
  errors_count: number;
  error_message: string | null;
  duration_seconds: number | null;
  total_raw_events: number;
  pending_dead_letters: number;
  last_reading_at: string | null;
  open_alerts: number;
}

export interface RecentReading {
  event_id: string;
  sensor_id: string;
  zone_code: string;
  zone_label: string;
  metric: string;
  value: number;
  unit: string;
  measured_at: string;
  source: string;
  status_level: QualityStatus;
}

export interface SensorHistoryPoint {
  event_id: string;
  value: number;
  measured_at: string;
}

export interface DataQualityResult {
  id: string;
  check_name: string;
  check_category: string;
  status: string;
  details: Record<string, unknown> | null;
  checked_at: string;
}
