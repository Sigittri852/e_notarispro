"use client"

import { CheckCircle2, Circle, Clock, Ban, ChevronRight } from "lucide-react"
import type { WorkflowPPAT, WorkflowNotaris, StepStatusPPAT, TipeAkta } from "@/lib/types"
import {
  workflowPPATLabels,
  workflowNotarisLabels,
} from "@/lib/types"

interface WorkflowTrackerProps {
  tipe: TipeAkta
  workflowPPAT?: WorkflowPPAT
  workflowNotaris?: WorkflowNotaris
  onUpdate?: (key: string, value: StepStatusPPAT) => void
  readonly?: boolean
}

const stepIcon: Record<StepStatusPPAT, React.ReactNode> = {
  selesai:          <CheckCircle2 size={18} className="text-green-500" />,
  proses:           <Clock size={18} className="text-blue-500" />,
  belum:            <Circle size={18} className="text-slate-300" />,
  tidak_diperlukan: <Ban size={18} className="text-slate-300" />,
}

const stepBg: Record<StepStatusPPAT, string> = {
  selesai:          "bg-green-50 border-green-200",
  proses:           "bg-blue-50 border-blue-200",
  belum:            "bg-white border-slate-200",
  tidak_diperlukan: "bg-gray-50 border-gray-200",
}

const stepOptions: { value: StepStatusPPAT; label: string }[] = [
  { value: "belum",            label: "Belum" },
  { value: "proses",           label: "Proses" },
  { value: "selesai",          label: "Selesai" },
  { value: "tidak_diperlukan", label: "Tidak Diperlukan" },
]

export default function WorkflowTracker({
  tipe,
  workflowPPAT,
  workflowNotaris,
  onUpdate,
  readonly = false,
}: WorkflowTrackerProps) {
  const isPPAT = tipe === "PPAT"

  const entries: [string, StepStatusPPAT][] = isPPAT
    ? Object.entries(workflowPPAT ?? {}) as [string, StepStatusPPAT][]
    : Object.entries(workflowNotaris ?? {}) as [string, StepStatusPPAT][]

  const labels = isPPAT ? workflowPPATLabels : workflowNotarisLabels

  const doneCount = entries.filter(([, v]) => v === "selesai" || v === "tidak_diperlukan").length
  const totalCount = entries.length
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPPAT ? "bg-orange-500" : "bg-blue-600"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-600 w-12 text-right">
          {doneCount}/{totalCount}
        </span>
        <span className={`text-xs font-bold ${isPPAT ? "text-orange-600" : "text-blue-700"}`}>
          {pct}%
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-1.5">
        {entries.map(([key, value], idx) => (
          <div
            key={key}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${stepBg[value]}`}
          >
            {/* Step number */}
            <span className="text-[10px] font-bold text-slate-400 w-4 text-right flex-shrink-0">
              {idx + 1}
            </span>

            {/* Icon */}
            <span className="flex-shrink-0">{stepIcon[value]}</span>

            {/* Label */}
            <span className="flex-1 text-xs font-medium text-slate-700">
              {labels[key as keyof typeof labels]}
            </span>

            {/* Connector arrow */}
            {idx < entries.length - 1 && (
              <ChevronRight size={12} className="text-slate-300 flex-shrink-0 hidden sm:block" />
            )}

            {/* Dropdown (editable) */}
            {!readonly && onUpdate && (
              <select
                value={value}
                onChange={(e) => onUpdate(key, e.target.value as StepStatusPPAT)}
                className={`text-[10px] font-semibold rounded-md border px-2 py-1 cursor-pointer focus:outline-none flex-shrink-0 ${
                  value === "selesai"
                    ? "bg-green-100 border-green-300 text-green-700"
                    : value === "proses"
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : value === "tidak_diperlukan"
                    ? "bg-gray-100 border-gray-300 text-gray-400"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                {stepOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
