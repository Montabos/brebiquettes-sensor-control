export const dynamic = "force-dynamic";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime } from "@/lib/format";
import { getAlertsData } from "@/lib/queries";
import type { QualityAlert } from "@/lib/types";

export default async function AlertesPage() {
  let alerts: QualityAlert[] = [];
  let dbError = false;

  try {
    alerts = await getAlertsData();
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Alertes qualité</h2>
        <p className="mt-1 text-sm text-stone-600">
          Dérives de température, humidité ou absence de signal détectées par le pipeline.
        </p>
      </div>

      {dbError && (
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
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-stone-500">
                  Aucune alerte enregistrée. Simulez une anomalie via le producer.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
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
