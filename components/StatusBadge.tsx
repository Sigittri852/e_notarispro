import type { StatusUmum, TipeAkta, StepStatusPPAT } from "@/lib/types"

interface StatusBadgeProps {
  status: StatusUmum
  size?: "sm" | "md"
}

const statusConfig: Record<StatusUmum, { bg: string; text: string; dot: string; label: string }> = {
  Proses:      { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Proses" },
  Selesai:     { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Selesai" },
  Tertunda:    { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", label: "Tertunda" },
  Dibatalkan:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500",    label: "Dibatalkan" },
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = statusConfig[status]
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${cfg.bg} ${cfg.text} ${pad}`}
      style={{ border: "1px solid currentColor", opacity: 1, borderColor: "transparent" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

interface TipeBadgeProps {
  tipe: TipeAkta
  size?: "sm" | "md"
}

export function TipeBadge({ tipe, size = "md" }: TipeBadgeProps) {
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
  if (tipe === "NOTARIIL") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-md ${pad} bg-blue-100 text-blue-700 border border-blue-300`}>
        Notariil
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-md ${pad} bg-orange-100 text-orange-700 border border-orange-300`}>
      PPAT
    </span>
  )
}

interface StepBadgeProps {
  status: StepStatusPPAT
}

export function StepBadge({ status }: StepBadgeProps) {
  const cfg: Record<StepStatusPPAT, { bg: string; text: string; label: string }> = {
    belum:            { bg: "bg-slate-100", text: "text-slate-500", label: "Belum" },
    proses:           { bg: "bg-blue-100",  text: "text-blue-700",  label: "Proses" },
    selesai:          { bg: "bg-green-100", text: "text-green-700", label: "Selesai" },
    tidak_diperlukan: { bg: "bg-gray-100",  text: "text-gray-400",  label: "N/A" },
  }
  const c = cfg[status]
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}
