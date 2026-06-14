"use client";

import { useEffect, useState } from "react";

import { formatTime } from "@/lib/format";
import { createBrowserClient } from "@/lib/supabase/client";

export function LiveIndicator() {
  const [live, setLive] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel("brebiquettes-live-indicator")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "fact_sensor_readings" },
        (payload) => {
          const measuredAt =
            (payload.new as { measured_at?: string }).measured_at ?? null;
          setLastEvent(measuredAt ?? new Date().toISOString());
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600">
      <span
        className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-amber-400"}`}
        aria-hidden
      />
      <span>{live ? "Live" : "Connexion…"}</span>
      {lastEvent && (
        <span className="hidden text-stone-400 sm:inline">
          · {formatTime(lastEvent)}
        </span>
      )}
    </div>
  );
}
