import type { QualityStatus } from "./types";

export function formatTime(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatValue(value: number | null | undefined, unit: string) {
  if (value == null) return "—";
  if (unit === "celsius") return `${value.toFixed(1)} °C`;
  if (unit === "percent") return `${value.toFixed(0)} %`;
  return `${value} ${unit}`;
}

export function formatThresholdRange(min: number, max: number, unit: string) {
  if (unit === "celsius") return `${min} – ${max} °C`;
  if (unit === "percent") return `${min} – ${max} %`;
  return `${min} – ${max} ${unit}`;
}

export function formatQualityStatus(status: QualityStatus | string | null | undefined) {
  switch (status) {
    case "ok":
      return "OK";
    case "watch":
      return "À surveiller";
    case "critical":
      return "Critique";
    default:
      return "Inconnu";
  }
}

export function formatPipelineStatus(status: string | null | undefined) {
  switch (status) {
    case "success":
      return "Succès";
    case "failed":
      return "Échec";
    case "partial":
      return "Partiel";
    case "running":
      return "En cours";
    default:
      return status ?? "—";
  }
}
