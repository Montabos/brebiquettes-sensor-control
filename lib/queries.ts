import { createServerClient } from "./supabase/server";
import type {
  DataQualityResult,
  PipelineRun,
  QualityAlert,
  RecentReading,
  ZoneStatus,
} from "./types";

export async function getDashboardData() {
  const supabase = createServerClient();

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

export async function getZonesData() {
  const supabase = createServerClient();
  const { data } = await supabase.from("mart_live_quality_status").select("*");
  return (data ?? []) as ZoneStatus[];
}

export async function getAlertsData() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("fact_quality_alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as QualityAlert[];
}

export async function getMonitoringData() {
  const supabase = createServerClient();

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
