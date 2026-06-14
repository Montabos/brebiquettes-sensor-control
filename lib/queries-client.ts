import { createBrowserClient } from "./supabase/client";
import type {
  DataQualityResult,
  PipelineRun,
  QualityAlert,
  RecentReading,
  SensorHistoryPoint,
  ZoneStatus,
} from "./types";

export async function fetchDashboardData() {
  const supabase = createBrowserClient();

  const [zones, alerts, readings, pipeline, quality] = await Promise.all([
    supabase.from("mart_live_quality_status").select("*"),
    supabase
      .from("fact_quality_alerts")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("mart_recent_readings").select("*").limit(8),
    supabase.from("mart_pipeline_health").select("*").limit(1).maybeSingle(),
    supabase
      .from("data_quality_results")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(5),
  ]);

  return {
    zones: (zones.data ?? []) as ZoneStatus[],
    alerts: (alerts.data ?? []) as QualityAlert[],
    readings: (readings.data ?? []) as RecentReading[],
    pipeline: (pipeline.data ?? null) as PipelineRun | null,
    quality: (quality.data ?? []) as DataQualityResult[],
  };
}

export async function fetchZoneDetailData(sensorId: string) {
  const supabase = createBrowserClient();

  const [zone, history, alerts] = await Promise.all([
    supabase
      .from("mart_live_quality_status")
      .select("*")
      .eq("sensor_id", sensorId)
      .maybeSingle(),
    supabase
      .from("fact_sensor_readings")
      .select("event_id, value, measured_at")
      .eq("sensor_id", sensorId)
      .order("measured_at", { ascending: false })
      .limit(200),
    supabase
      .from("fact_quality_alerts")
      .select("*")
      .eq("sensor_id", sensorId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const historyPoints = ((history.data ?? []) as SensorHistoryPoint[]).reverse();

  return {
    zone: (zone.data ?? null) as ZoneStatus | null,
    history: historyPoints,
    alerts: (alerts.data ?? []) as QualityAlert[],
  };
}

export async function fetchAlertsData() {
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from("fact_quality_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as QualityAlert[];
}

export async function fetchMonitoringData() {
  const supabase = createBrowserClient();

  const [runs, deadLetters, quality] = await Promise.all([
    supabase.from("mart_pipeline_health").select("*").limit(20),
    supabase
      .from("dead_letter_events")
      .select("*")
      .order("rejected_at", { ascending: false })
      .limit(20),
    supabase
      .from("data_quality_results")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(20),
  ]);

  return {
    runs: (runs.data ?? []) as PipelineRun[],
    deadLetters: (deadLetters.data ?? []) as Array<{
      id: string;
      rejection_reason: string;
      rejected_at: string;
    }>,
    quality: (quality.data ?? []) as DataQualityResult[],
  };
}
