"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { formatTime } from "@/lib/format";
import { fetchAlertsData } from "@/lib/queries-client";

export function AlertesView() {
  const { data: alerts, error, loading } = useLiveRefresh(fetchAlertsData);

  if (loading && !alerts) {
    return <p className="text-sm text-stone-500">Chargement des alertes…</p>;
  }

  const rows = alerts ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Alertes qualité</h2>
        <p className="mt-1 text-sm text-stone-600">
          Dérives de température, humidité ou absence de signal détectées par le pipeline.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase non configuré.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-stone-50 text-stone-500">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Capteur</th>
              <th className="px-4 py-3">Valeur</th>
              <th className="px-4 py-3">Sévérité</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-stone-500">
                  Aucune alerte enregistrée. Simulez une anomalie via le producer.
                </td>
              </tr>
            ) : (
              rows.map((alert) => (
                <tr key={alert.id} className="border-b border-stone-100">
                  <td className="px-4 py-3">{formatTime(alert.created_at)}</td>
                  <td className="px-4 py-3">{alert.zone_code}</td>
                  <td className="px-4 py-3">{alert.sensor_id}</td>
                  <td className="px-4 py-3">
                    {alert.value} ({alert.metric})
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={alert.severity}
                      variant={alert.severity === "critical" ? "error" : "warning"}
                    />
                  </td>
                  <td className="px-4 py-3">{alert.message}</td>
                  <td className="px-4 py-3">{alert.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
