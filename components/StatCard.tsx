interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: "blue" | "orange" | "green" | "yellow" | "red" | "teal"
  sub?: string
}

const colorMap: Record<StatCardProps["color"], { bg: string; iconBg: string; text: string; border: string }> = {
  blue:   { bg: "bg-white", iconBg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200" },
  orange: { bg: "bg-white", iconBg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  green:  { bg: "bg-white", iconBg: "bg-green-100",  text: "text-green-700",  border: "border-green-200" },
  yellow: { bg: "bg-white", iconBg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
  red:    { bg: "bg-white", iconBg: "bg-red-100",    text: "text-red-700",    border: "border-red-200" },
  teal:   { bg: "bg-white", iconBg: "bg-teal-100",   text: "text-teal-700",   border: "border-teal-200" },
}

export default function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`${c.bg} rounded-xl border ${c.border} p-4 card-hover shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={c.text}>{icon}</span>
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
