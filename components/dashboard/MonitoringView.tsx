"use client";

import { StatusBadge, pipelineVariant, qualityCheckVariant } from "@/components/ui/StatusBadge";
import { useLiveRefresh } from "@/hooks/use-live-refresh";
import { formatPipelineStatus, formatTime } from "@/lib/format";
import { fetchMonitoringData } from "@/lib/queries-client";

export function MonitoringView() {
  const { data, error, loading } = useLiveRefresh(fetchMonitoringData);

  if (loading && !data) {
    return <p className="text-sm text-stone-500">Chargement du monitoring…</p>;
  }

  const runs = data?.runs ?? [];
  const deadLetters = data?.deadLetters ?? [];
  const quality = data?.quality ?? [];
  const latestRun = runs[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Monitoring pipeline</h2>
        <p className="mt-1 text-sm text-stone-600">
          Statut du consumer, dead-letter queue et contrôles qualité.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase non configuré.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MonitorCard
          label="Dernier run"
          value={latestRun ? formatPipelineStatus(latestRun.status) : "—"}
        />
        <MonitorCard
          label="Événements lus"
          value={latestRun ? String(latestRun.records_read) : "—"}
        />
        <MonitorCard
          label="Dead letters"
          value={latestRun ? String(latestRun.pending_dead_letters) : "—"}
        />
        <MonitorCard
          label="Dernière mesure"
          value={formatTime(latestRun?.last_reading_at)}
        />
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-medium">Historique des runs</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-stone-500">
                <th className="pb-2 pr-4">Début</th>
                <th className="pb-2 pr-4">Statut</th>
                <th className="pb-2 pr-4">Lus</th>
                <th className="pb-2 pr-4">Insérés</th>
                <th className="pb-2 pr-4">Rejetés</th>
                <th className="pb-2 pr-4">Erreurs</th>
                <th className="pb-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-stone-500">
                    Aucun run enregistré
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.run_id} className="border-b border-stone-100">
                    <td className="py-2 pr-4">{formatTime(run.started_at)}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge
                        label={formatPipelineStatus(run.status)}
                        variant={pipelineVariant(run.status)}
                      />
                    </td>
                    <td className="py-2 pr-4">{run.records_read}</td>
                    <td className="py-2 pr-4">{run.records_inserted}</td>
                    <td className="py-2 pr-4">{run.records_rejected}</td>
                    <td className="py-2 pr-4">{run.errors_count}</td>
                    <td className="py-2 max-w-[240px] truncate text-xs text-red-700">
                      {run.error_message ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-medium">Dead-letter queue</h3>
          <div className="mt-4 space-y-3">
            {deadLetters.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun événement rejeté.</p>
            ) : (
              deadLetters.map((item) => (
                <div key={item.id} className="rounded-lg bg-amber-50 px-3 py-2 text-sm">
                  <p className="font-medium text-amber-900">{item.rejection_reason}</p>
                  <p className="text-xs text-amber-700">{formatTime(item.rejected_at)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="font-medium">Contrôles qualité</h3>
          <div className="mt-4 space-y-3">
            {quality.length === 0 ? (
              <p className="text-sm text-stone-500">Aucun contrôle exécuté.</p>
            ) : (
              quality.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{check.check_name}</p>
                    <p className="text-xs text-stone-500">{check.check_category}</p>
                  </div>
                  <StatusBadge
                    label={check.status}
                    variant={qualityCheckVariant(check.status)}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MonitorCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
