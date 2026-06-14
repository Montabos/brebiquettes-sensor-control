"use client";

import Link from "next/link";
import { useCallback } from "react";

import { ZoneHistoryChart } from "@/components/dashboard/ZoneHistoryChart";
import { StatusBadge, qualityVariant } from "@/components/ui/StatusBadge";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import {
  formatQualityStatus,
  formatThresholdRange,
  formatTime,
  formatValue,
} from "@/lib/format";
import { fetchZoneDetailData } from "@/lib/queries-client";

export function ZoneDetailView({ sensorId }: { sensorId: string }) {
  const fetcher = useCallback(() => fetchZoneDetailData(sensorId), [sensorId]);
  const { data, error, loading } = useLiveRefresh(fetcher);

  if (loading && !data) {
    return <p className="text-sm text-stone-500">Chargement du capteur…</p>;
  }

  const zone = data?.zone;
  const history = data?.history ?? [];
  const alerts = data?.alerts ?? [];

  if (!zone) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard" className="text-sm text-emerald-700 hover:underline">
          ← Retour à la fromagerie
        </Link>
        <p className="text-sm text-stone-600">Capteur « {sensorId} » introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Retour à la fromagerie
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{zone.zone_label}</h2>
            <p className="mt-1 text-sm text-stone-600">{zone.sensor_id}</p>
            <p className="mt-1 text-sm text-stone-500 capitalize">{zone.metric}</p>
          </div>
          <StatusBadge
            label={formatQualityStatus(zone.status_level)}
            variant={qualityVariant(zone.status_level)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase non configuré — renseigner les variables dans `.env.local`.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Valeur actuelle" value={formatValue(zone.last_value, zone.unit)} />
        <StatCard
          label="Seuil normal"
          value={formatThresholdRange(zone.normal_min, zone.normal_max, zone.unit)}
        />
        <StatCard label="Dernière mesure" value={formatTime(zone.last_measured_at)} />
        <StatCard label="Alertes ouvertes" value={String(zone.open_alerts_count)} />
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-medium">Évolution des mesures</h3>
        <p className="mt-1 text-sm text-stone-500">
          Dernières {history.length} mesures — mise à jour automatique.
        </p>
        <div className="mt-6">
          <ZoneHistoryChart
            points={history}
            normalMin={zone.normal_min}
            normalMax={zone.normal_max}
            unit={zone.unit}
          />
        </div>
      </section>

      {alerts.length > 0 && (
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-medium">Historique des alertes</h3>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg px-3 py-2 text-sm ${
                  alert.severity === "critical"
                    ? "bg-red-50 text-red-900"
                    : "bg-amber-50 text-amber-900"
                }`}
              >
                <p className="font-medium">{alert.message}</p>
                <p className="mt-1 text-xs opacity-80">
                  {formatTime(alert.created_at)} · {alert.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
