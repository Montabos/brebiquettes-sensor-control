type Variant = "success" | "error" | "warning" | "pending" | "neutral";

const styles: Record<Variant, string> = {
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  error: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-stone-100 text-stone-600 border-stone-200",
  neutral: "bg-stone-50 text-stone-700 border-stone-200",
};

export function StatusBadge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

export function qualityVariant(status: string | null | undefined): Variant {
  if (status === "ok") return "success";
  if (status === "critical") return "error";
  if (status === "watch") return "warning";
  return "pending";
}

export function pipelineVariant(status: string | null | undefined): Variant {
  if (status === "success") return "success";
  if (status === "failed") return "error";
  if (status === "partial" || status === "running") return "warning";
  return "neutral";
}

export function qualityCheckVariant(status: string | null | undefined): Variant {
  if (status === "pass") return "success";
  if (status === "fail") return "error";
  if (status === "warn") return "warning";
  return "neutral";
}
