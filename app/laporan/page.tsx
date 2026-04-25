"use client"

import { useEffect, useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  BarChart3,
  Scale,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  TrendingUp,
  Calendar,
  Download,
} from "lucide-react"
import Sidebar from "@/components/Sidebar"
import AuthGuard from "@/components/AuthGuard"
import { aktaService } from "@/lib/storage"
import type { Akta } from "@/lib/types"

// ── helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(val: string) {
  const num = Number(val.replace(/\./g, "").replace(/,/g, ""))
  if (isNaN(num) || num === 0) return "—"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num)
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { month: "short", year: "numeric" })
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
      <span className="text-slate-500">{icon}</span>
      {children}
    </h2>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  colorText,
  colorBg,
  colorBorder,
}: {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  colorText: string
  colorBg: string
  colorBorder: string
}) {
  return (
    <div className={`bg-white rounded-xl border ${colorBorder} p-4 shadow-sm`}>
      <div className={`w-10 h-10 rounded-lg ${colorBg} flex items-center justify-center mb-3`}>
        <span className={colorText}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${colorText}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── custom tooltip ────────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-slate-700">{payload[0].name}</p>
      <p className="font-semibold text-slate-600">{payload[0].value} akta</p>
      <p className="text-slate-400">{payload[0].payload.pct}%</p>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function LaporanPage() {
  const [akta, setAkta] = useState<Akta[]>([])

  useEffect(() => {
    aktaService.init()
    setAkta(aktaService.getAll())
  }, [])

  // ── derived stats ─────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalNotaris = akta.filter((a) => a.tipeAkta === "NOTARIIL").length
    const totalPPAT = akta.filter((a) => a.tipeAkta === "PPAT").length
    const total = akta.length

    const statusCounts = {
      Proses: akta.filter((a) => a.statusUmum === "Proses").length,
      Selesai: akta.filter((a) => a.statusUmum === "Selesai").length,
      Tertunda: akta.filter((a) => a.statusUmum === "Tertunda").length,
      Dibatalkan: akta.filter((a) => a.statusUmum === "Dibatalkan").length,
    }

    // Completion rate
    const completionRate = total > 0 ? Math.round((statusCounts.Selesai / total) * 100) : 0

    // Pie data — Tipe
    const tipeData = [
      { name: "Notariil", value: totalNotaris, pct: total > 0 ? Math.round((totalNotaris / total) * 100) : 0 },
      { name: "PPAT", value: totalPPAT, pct: total > 0 ? Math.round((totalPPAT / total) * 100) : 0 },
    ].filter((d) => d.value > 0)

    // Pie data — Status
    const statusData = [
      { name: "Selesai", value: statusCounts.Selesai, pct: total > 0 ? Math.round((statusCounts.Selesai / total) * 100) : 0 },
      { name: "Proses", value: statusCounts.Proses, pct: total > 0 ? Math.round((statusCounts.Proses / total) * 100) : 0 },
      { name: "Tertunda", value: statusCounts.Tertunda, pct: total > 0 ? Math.round((statusCounts.Tertunda / total) * 100) : 0 },
      { name: "Dibatalkan", value: statusCounts.Dibatalkan, pct: total > 0 ? Math.round((statusCounts.Dibatalkan / total) * 100) : 0 },
    ].filter((d) => d.value > 0)

    // Bar data — per kategori
    const kategoriMap: Record<string, { notaris: number; ppat: number }> = {}
    akta.forEach((a) => {
      const k = a.kategori
      if (!kategoriMap[k]) kategoriMap[k] = { notaris: 0, ppat: 0 }
      if (a.tipeAkta === "NOTARIIL") kategoriMap[k].notaris++
      else kategoriMap[k].ppat++
    })
    const kategoriData = Object.entries(kategoriMap)
      .map(([name, val]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, ...val, total: val.notaris + val.ppat }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)

    // Bar data — per bulan (last 6 months)
    const monthMap: Record<string, { notaris: number; ppat: number }> = {}
    akta.forEach((a) => {
      const m = monthLabel(a.tanggalAkta)
      if (!monthMap[m]) monthMap[m] = { notaris: 0, ppat: 0 }
      if (a.tipeAkta === "NOTARIIL") monthMap[m].notaris++
      else monthMap[m].ppat++
    })
    const monthData = Object.entries(monthMap)
      .map(([name, val]) => ({ name, ...val, total: val.notaris + val.ppat }))
      .sort((a, b) => {
        const parse = (s: string) => new Date(s.replace(/(\w{3}) (\d{4})/, "$1 1 $2")).getTime()
        return parse(a.name) - parse(b.name)
      })
      .slice(-6)

    // PPAT specific: nilai transaksi total
    const totalNilaiPPAT = akta
      .filter((a) => a.tipeAkta === "PPAT" && a.objekTanah?.nilaiTransaksi)
      .reduce((sum, a) => {
        const v = Number((a.objekTanah!.nilaiTransaksi ?? "0").replace(/\./g, "").replace(/,/g, ""))
        return isNaN(v) ? sum : sum + v
      }, 0)

    // Workflow PPAT completion
    const ppats = akta.filter((a) => a.tipeAkta === "PPAT" && a.workflowPPAT)
    const avgWorkflowPct =
      ppats.length > 0
        ? Math.round(
            ppats.reduce((sum, a) => {
              const steps = Object.values(a.workflowPPAT!)
              const done = steps.filter((s) => s === "selesai" || s === "tidak_diperlukan").length
              return sum + (done / steps.length) * 100
            }, 0) / ppats.length
          )
        : 0

    return {
      total,
      totalNotaris,
      totalPPAT,
      statusCounts,
      completionRate,
      tipeData,
      statusData,
      kategoriData,
      monthData,
      totalNilaiPPAT,
      avgWorkflowPct,
    }
  }, [akta])

  const PIE_TIPE_COLORS = ["#2563eb", "#f97316"]
  const PIE_STATUS_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#ef4444"]

  const handlePrint = () => window.print()

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6 no-print">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <BarChart3 size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Laporan & Statistik</h1>
                <p className="text-blue-200 text-sm mt-0.5">
                  Analisis kinerja kantor Notaris &amp; PPAT
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white text-blue-800 text-sm font-bold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
            >
              <Download size={15} />
              Cetak / Ekspor
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 animate-fade-in">

          {/* KPI Row */}
          <div>
            <SectionTitle icon={<TrendingUp size={15} />}>Ringkasan Kinerja</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Semua Akta"
                value={stats.total}
                sub="Notariil + PPAT"
                icon={<FileText size={20} />}
                colorText="text-teal-700"
                colorBg="bg-teal-100"
                colorBorder="border-teal-200"
              />
              <KpiCard
                label="Akta Notariil"
                value={stats.totalNotaris}
                icon={<Scale size={20} />}
                colorText="text-blue-700"
                colorBg="bg-blue-100"
                colorBorder="border-blue-200"
              />
              <KpiCard
                label="Akta PPAT"
                value={stats.totalPPAT}
                icon={<MapPin size={20} />}
                colorText="text-orange-700"
                colorBg="bg-orange-100"
                colorBorder="border-orange-200"
              />
              <KpiCard
                label="Tingkat Penyelesaian"
                value={`${stats.completionRate}%`}
                sub={`${stats.statusCounts.Selesai} dari ${stats.total} akta`}
                icon={<CheckCircle2 size={20} />}
                colorText="text-green-700"
                colorBg="bg-green-100"
                colorBorder="border-green-200"
              />
            </div>
          </div>

          {/* Status row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Sedang Diproses"
              value={stats.statusCounts.Proses}
              icon={<Clock size={20} />}
              colorText="text-blue-700"
              colorBg="bg-blue-100"
              colorBorder="border-blue-200"
            />
            <KpiCard
              label="Tertunda"
              value={stats.statusCounts.Tertunda}
              icon={<AlertTriangle size={20} />}
              colorText="text-yellow-700"
              colorBg="bg-yellow-100"
              colorBorder="border-yellow-200"
            />
            <KpiCard
              label="Dibatalkan"
              value={stats.statusCounts.Dibatalkan}
              icon={<XCircle size={20} />}
              colorText="text-red-700"
              colorBg="bg-red-100"
              colorBorder="border-red-200"
            />
            <KpiCard
              label="Rata-rata Workflow PPAT"
              value={`${stats.avgWorkflowPct}%`}
              sub="Progres langkah PPAT"
              icon={<BarChart3 size={20} />}
              colorText="text-orange-700"
              colorBg="bg-orange-100"
              colorBorder="border-orange-200"
            />
          </div>

          {/* Charts row 1: Pie tipe + Pie status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie — Tipe Akta */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <SectionTitle icon={<Scale size={15} />}>Komposisi Tipe Akta</SectionTitle>
              {stats.tipeData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Belum ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.tipeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.tipeData.map((_, i) => (
                        <Cell key={i} fill={PIE_TIPE_COLORS[i % PIE_TIPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      formatter={(value, entry: any) => (
                        <span className="text-xs font-semibold text-slate-600">
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie — Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <SectionTitle icon={<CheckCircle2 size={15} />}>Komposisi Status</SectionTitle>
              {stats.statusData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Belum ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_STATUS_COLORS[i % PIE_STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      formatter={(value, entry: any) => (
                        <span className="text-xs font-semibold text-slate-600">
                          {value} ({entry.payload.value})
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar — per bulan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <SectionTitle icon={<Calendar size={15} />}>Akta per Bulan (6 bulan terakhir)</SectionTitle>
            {stats.monthData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthData} barSize={18} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-600 capitalize">{value}</span>
                    )}
                  />
                  <Bar dataKey="notaris" name="Notariil" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ppat" name="PPAT" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar — per kategori */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <SectionTitle icon={<FileText size={15} />}>Akta per Kategori (Top 8)</SectionTitle>
            {stats.kategoriData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.kategoriData} layout="vertical" barSize={14} barGap={2} margin={{ left: 16, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={160}
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-600 capitalize">{value}</span>
                    )}
                  />
                  <Bar dataKey="notaris" name="Notariil" fill="#2563eb" radius={[0, 4, 4, 0]} stackId="a" />
                  <Bar dataKey="ppat" name="PPAT" fill="#f97316" radius={[0, 4, 4, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* PPAT Nilai Transaksi */}
          {stats.totalPPAT > 0 && (
            <div className="bg-white rounded-xl border border-orange-200 p-5 shadow-sm">
              <SectionTitle icon={<MapPin size={15} />}>Ringkasan PPAT</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-1">Total Akta PPAT</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.totalPPAT}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-1">Rata-rata Progres Workflow</p>
                  <p className="text-2xl font-bold text-orange-700">{stats.avgWorkflowPct}%</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide mb-1">Total Nilai Transaksi Tercatat</p>
                  <p className="text-lg font-bold text-orange-700 truncate">
                    {stats.totalNilaiPPAT > 0
                      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(stats.totalNilaiPPAT)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tabel ringkas semua akta */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText size={15} className="text-slate-400" />
              <p className="text-sm font-bold text-slate-700">Daftar Semua Akta</p>
              <span className="ml-auto text-xs text-slate-400">{stats.total} akta</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left font-bold text-slate-500 uppercase tracking-wide px-4 py-2.5">Tipe</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-wide px-3 py-2.5">No. Akta</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-wide px-3 py-2.5">Tanggal</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-wide px-3 py-2.5">Kategori</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-wide px-3 py-2.5">Perihal</th>
                    <th className="text-left font-bold text-slate-500 uppercase tracking-wide px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {akta.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-300">
                        Belum ada akta
                      </td>
                    </tr>
                  ) : (
                    akta.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              a.tipeAkta === "PPAT"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {a.tipeAkta === "PPAT" ? "PPAT" : "Notariil"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono font-semibold text-slate-700">{a.nomorAkta}</td>
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                          {new Date(a.tanggalAkta).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 max-w-[120px] truncate">{a.kategori}</td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium max-w-[180px] truncate">{a.perihal}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              a.statusUmum === "Selesai"
                                ? "bg-green-100 text-green-700"
                                : a.statusUmum === "Proses"
                                ? "bg-blue-100 text-blue-700"
                                : a.statusUmum === "Tertunda"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {a.statusUmum}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
