export const dynamic = "force-dynamic";

import { StatusBadge, qualityVariant } from "@/components/ui/StatusBadge";
import { formatQualityStatus, formatTime, formatValue } from "@/lib/format";
import { getZonesData } from "@/lib/queries";
import type { ZoneStatus } from "@/lib/types";

export default async function ZonesPage() {
  let zones: ZoneStatus[] = [];
  let dbError = false;

  try {
    zones = await getZonesData();
  } catch {
    dbError = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Zones surveillées</h2>
        <p className="mt-1 text-sm text-stone-600">
          Température et humidité des caves, frigo lait et laboratoire.
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
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Capteur</th>
              <th className="px-4 py-3">Mesure</th>
              <th className="px-4 py-3">Valeur</th>
              <th className="px-4 py-3">Seuil normal</th>
              <th className="px-4 py-3">Dernière lecture</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Alertes</th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-stone-500">
                  Lancez le producer et le consumer pour alimenter les zones.
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.sensor_id} className="border-b border-stone-100">
                  <td className="px-4 py-3 font-medium">{zone.zone_label}</td>
                  <td className="px-4 py-3">{zone.sensor_id}</td>
                  <td className="px-4 py-3">{zone.metric}</td>
                  <td className="px-4 py-3">{formatValue(zone.last_value, zone.unit)}</td>
                  <td className="px-4 py-3">
                    {zone.normal_min} – {zone.normal_max} {zone.unit}
                  </td>
                  <td className="px-4 py-3">{formatTime(zone.last_measured_at)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={formatQualityStatus(zone.status_level)}
                      variant={qualityVariant(zone.status_level)}
                    />
                  </td>
                  <td className="px-4 py-3">{zone.open_alerts_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
