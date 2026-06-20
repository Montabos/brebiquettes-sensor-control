"use client";

import { useCallback, useEffect, useState } from "react";

import { createBrowserClient } from "@/lib/supabase/client";

const WATCHED_TABLES = [
  "fact_sensor_readings",
  "fact_quality_alerts",
  "pipeline_runs",
  "dead_letter_events",
  "data_quality_results",
] as const;

const POLL_INTERVAL_MS = 5000;

export function useLiveRefresh<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(false);
      setLastUpdate(new Date().toISOString());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });

    const supabase = createBrowserClient();
    const channel = supabase.channel("brebiquettes-pipeline-live");

    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          load();
        }
      );
    }

    channel.subscribe((status) => {
      setLive(status === "SUBSCRIBED");
    });

    const interval = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [load]);

  return { data, error, loading, live, lastUpdate, refresh: load };
}
