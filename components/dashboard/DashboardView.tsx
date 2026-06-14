"use client";

import Link from "next/link";

import { StatusBadge, qualityVariant } from "@/components/ui/StatusBadge";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import {
  formatQualityStatus,
  formatThresholdRange,
  formatTime,
  formatValue,
} from "@/lib/format";
import { fetchDashboardData } from "@/lib/queries-client";

export function DashboardView() {
  const { data, error, loading } = useLiveRefresh(fetchDashboardData);

  if (loading && !data) {
    return <p className="text-sm text-stone-500">Chargement des capteurs…</p>;
  }

  const zones = data?.zones ?? [];
  const alerts = data?.alerts ?? [];
  const readings = data?.readings ?? [];
  const pipeline = data?.pipeline ?? null;
  const criticalZones = zones.filter((z) => z.status_level === "critical").length;
  const okZones = zones.filter((z) => z.status_level === "ok").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Fromagerie</h2>
        <p className="mt-1 text-sm text-stone-600">
          Surveillance continue des caves, du frigo lait et du laboratoire.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase non configuré — renseigner les variables dans `.env.local`.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Zones OK" value={String(okZones)} />
        <StatCard label="Zones critiques" value={String(criticalZones)} />
        <StatCard label="Alertes ouvertes" value={String(alerts.length)} />
        <StatCard label="Dernière mesure" value={formatTime(pipeline?.last_reading_at)} />
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-medium">État des zones</h3>
        <p className="mt-1 text-sm text-stone-500">Cliquez sur une zone pour voir l&apos;historique.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.length === 0 ? (
            <p className="text-sm text-stone-500">Aucune donnée capteur pour le moment.</p>
          ) : (
            zones.map((zone) => (
              <Link
                key={zone.sensor_id}
                href={`/dashboard/zone/${encodeURIComponent(zone.sensor_id)}`}
                className="group rounded-lg border border-stone-100 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium group-hover:text-emerald-900">{zone.zone_label}</p>
                  <StatusBadge
                    label={formatQualityStatus(zone.status_level)}
                    variant={qualityVariant(zone.status_level)}
                  />
                </div>
                <p className="mt-2 text-sm text-stone-600">{zone.sensor_id}</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatValue(zone.last_value, zone.unit)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Seuil : {formatThresholdRange(zone.normal_min, zone.normal_max, zone.unit)}
                </p>
                <p className="mt-1 text-xs text-stone-400">{formatTime(zone.last_measured_at)}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-medium">Alertes récentes</h3>
          <div className="mt-4 space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-stone-500">Aucune alerte ouverte.</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-xs text-red-700">{formatTime(alert.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-medium">Mesures récentes</h3>
          <div className="mt-4 space-y-2">
            {readings.map((reading) => (
              <div
                key={reading.event_id}
                className="flex items-center justify-between border-b border-stone-100 py-2 text-sm"
              >
                <span>
                  {reading.zone_label} — {reading.sensor_id}
                </span>
                <span className="font-medium">{formatValue(reading.value, reading.unit)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
