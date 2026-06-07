export const dynamic = "force-dynamic";

import { StatusBadge, qualityVariant } from "@/components/ui/StatusBadge";
import { formatQualityStatus, formatTime, formatValue } from "@/lib/format";
import { getDashboardData } from "@/lib/queries";
import type {
  DataQualityResult,
  PipelineRun,
  QualityAlert,
  RecentReading,
  ZoneStatus,
} from "@/lib/types";

export default async function DashboardPage() {
  let data: {
    zones: ZoneStatus[];
    alerts: QualityAlert[];
    readings: RecentReading[];
    pipeline: PipelineRun | null;
    quality: DataQualityResult[];
  } = { zones: [], alerts: [], readings: [], pipeline: null, quality: [] };
  let dbError = false;

  try {
    data = await getDashboardData();
  } catch {
    dbError = true;
  }

  const criticalZones = data.zones.filter((z) => z.status_level === "critical").length;
  const okZones = data.zones.filter((z) => z.status_level === "ok").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Accueil</h2>
        <p className="mt-1 text-sm text-stone-600">
          Surveillance continue des caves, du frigo lait et du laboratoire.
        </p>
      </div>

      {dbError && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase non configuré — renseigner les variables dans `.env.local`.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Zones OK" value={String(okZones)} />
        <StatCard label="Zones critiques" value={String(criticalZones)} />
        <StatCard label="Alertes ouvertes" value={String(data.alerts.length)} />
        <StatCard
          label="Dernière mesure"
          value={formatTime(data.pipeline?.last_reading_at)}
        />
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-medium">État des zones</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.zones.length === 0 ? (
            <p className="text-sm text-stone-500">Aucune donnée capteur pour le moment.</p>
          ) : (
            data.zones.map((zone) => (
              <div key={zone.sensor_id} className="rounded-lg border border-stone-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{zone.zone_label}</p>
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
                  {formatTime(zone.last_measured_at)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-medium">Alertes récentes</h3>
          <div className="mt-4 space-y-3">
            {data.alerts.length === 0 ? (
              <p className="text-sm text-stone-500">Aucune alerte ouverte.</p>
            ) : (
              data.alerts.map((alert) => (
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
            {data.readings.map((reading) => (
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
