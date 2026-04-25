"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Scale,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  PlusCircle,
  ArrowRight,
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Sidebar from "@/components/Sidebar"
import LiveClock from "@/components/LiveClock"
import StatCard from "@/components/StatCard"
import { StatusBadge, TipeBadge } from "@/components/StatusBadge"
import AuthGuard from "@/components/AuthGuard"
import { aktaService, resetToSeedData } from "@/lib/storage"
import { useAuth } from "@/lib/AuthContext"
import { isoToTanggalPendek } from "@/lib/dateUtils"
import type { DashboardStats, Akta } from "@/lib/types"

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { month: "short", year: "numeric" })
}

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

export default function DashboardPage() {
  const { session } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [allAkta, setAllAkta] = useState<Akta[]>([])
  const [resetting, setResetting] = useState(false)

  function refreshData() {
    aktaService.init()
    setStats(aktaService.getStats())
    setAllAkta(aktaService.getAll())
  }

  useEffect(() => { refreshData() }, [])

  function handleResetDemo() {
    if (!confirm("Reset semua data ke data demo? Semua akta yang Anda input akan dihapus.")) return
    setResetting(true)
    resetToSeedData()
    // Hard reload agar seluruh state aplikasi (storage + komponen) segar
    window.location.reload()
  }

  const monthData = useMemo(() => {
    const map: Record<string, { notaris: number; ppat: number }> = {}
    allAkta.forEach((a) => {
      const m = monthLabel(a.tanggalAkta)
      if (!map[m]) map[m] = { notaris: 0, ppat: 0 }
      if (a.tipeAkta === "NOTARIIL") map[m].notaris++
      else map[m].ppat++
    })
    return Object.entries(map)
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => {
        const parse = (s: string) => new Date(s.replace(/(\w{3}) (\d{4})/, "$1 1 $2")).getTime()
        return parse(a.name) - parse(b.name)
      })
      .slice(-5)
  }, [allAkta])

  if (!stats) {
    return (
      <AuthGuard>
        <div className="flex h-screen items-center justify-center bg-[#f0f4f8]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Memuat data...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  const total = stats.totalNotaris + stats.totalPPAT

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />

      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {session && (
                <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {session.initials}
                </div>
              )}
              <div>
                <LiveClock
                  mode="date"
                  className="block text-blue-200 text-[10px] font-medium"
                />
                <h1 className="text-xl font-bold text-white leading-tight">
                  {session?.namaLengkap ?? "Dashboard"}
                </h1>
                <p className="text-blue-300 text-xs mt-0.5">
                  {session?.jabatan} &mdash;{" "}
                  <LiveClock
                    mode="time"
                    className="font-bold tabular-nums text-white"
                  />
                  {" "}WIB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleResetDemo}
                disabled={resetting}
                title="Reset ke data demo"
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw size={13} className={resetting ? "animate-spin" : ""} />
                Data Demo
              </button>
              <Link
                href="/akta/baru"
                className="flex items-center gap-2 bg-white text-blue-800 text-sm font-bold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition whitespace-nowrap"
              >
                <PlusCircle size={16} />
                Input Akta Baru
              </Link>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 animate-fade-in">

          {/* Welcome banner — hanya tampil jika belum ada akta */}
          {total === 0 && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Scale size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-base">Selamat Datang di e-NotarisKu Pro</p>
                  <p className="text-blue-200 text-xs mt-1 max-w-md leading-relaxed">
                    Sistem siap digunakan. Tidak ada data demo — semua akta adalah data nyata Anda.
                    Mulai dengan menginput akta pertama untuk mengaktifkan seluruh fitur dashboard.
                  </p>
                </div>
              </div>
              <Link
                href="/akta/baru"
                className="flex-shrink-0 flex items-center gap-2 bg-white text-blue-800 text-sm font-bold px-4 py-2.5 rounded-xl shadow hover:bg-blue-50 transition whitespace-nowrap"
              >
                <PlusCircle size={15} />
                Mulai Sekarang
              </Link>
            </div>
          )}

          {/* Primary stats row */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ringkasan Akta</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Semua Akta"
                value={total}
                icon={<FileText size={20} />}
                color="teal"
                sub="Notaris + PPAT"
              />
              <StatCard
                label="Akta Notariil"
                value={stats.totalNotaris}
                icon={<Scale size={20} />}
                color="blue"
                sub="Akta Notaris PPNS"
              />
              <StatCard
                label="Akta PPAT"
                value={stats.totalPPAT}
                icon={<MapPin size={20} />}
                color="orange"
                sub="Tanah & Hak"
              />
              <StatCard
                label="Akta Selesai"
                value={stats.totalSelesai}
                icon={<CheckCircle2 size={20} />}
                color="green"
                sub="Proses tuntas"
              />
            </div>
          </div>

          {/* Status row */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status Proses</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Sedang Diproses"
                value={stats.totalProses}
                icon={<Clock size={20} />}
                color="blue"
              />
              <StatCard
                label="Tertunda"
                value={stats.totalTertunda}
                icon={<AlertTriangle size={20} />}
                color="yellow"
              />
              <StatCard
                label="Dibatalkan"
                value={stats.totalDibatalkan}
                icon={<XCircle size={20} />}
                color="red"
              />
            </div>
          </div>

          {/* Progress bar breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-slate-500" />
                <p className="text-sm font-bold text-slate-700">Komposisi Akta</p>
              </div>
              <span className="text-xs text-slate-400">{total} total akta</span>
            </div>
            <div className="space-y-4">
              {/* Notaris vs PPAT */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
                    Notariil
                  </span>
                  <span>{total > 0 ? Math.round((stats.totalNotaris / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ width: total > 0 ? `${(stats.totalNotaris / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
                    PPAT
                  </span>
                  <span>{total > 0 ? Math.round((stats.totalPPAT / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-700"
                    style={{ width: total > 0 ? `${(stats.totalPPAT / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
              {/* Selesai rate */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
                    Tingkat Penyelesaian
                  </span>
                  <span>{total > 0 ? Math.round((stats.totalSelesai / total) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: total > 0 ? `${(stats.totalSelesai / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mini trend chart */}
          {monthData.length > 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={15} className="text-slate-500" />
                  <p className="text-sm font-bold text-slate-700">Tren Akta per Bulan</p>
                </div>
                <Link
                  href="/laporan"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                >
                  Laporan Lengkap <ArrowRight size={12} />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthData} barSize={14} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    width={20}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="notaris" name="Notariil" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="ppat" name="PPAT" fill="#f97316" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent akta */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-700">Akta Terbaru</p>
              <Link
                href="/akta"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {stats.aktaTerbaru.length === 0 ? (
                <div className="py-14 text-center px-6 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center">
                    <FileText size={28} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-600">Buku Daftar Akta Masih Kosong</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      Aplikasi siap digunakan. Mulai dengan menginput akta Notariil atau PPAT pertama Anda untuk melihat data di sini.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      href="/akta/baru"
                      className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow transition"
                    >
                      <PlusCircle size={15} />
                      Input Akta Pertama
                    </Link>
                    <Link
                      href="/akta"
                      className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold px-5 py-2.5 rounded-xl transition"
                    >
                      <FileText size={15} />
                      Buka Daftar Akta
                    </Link>
                  </div>
                </div>
              ) : (
                stats.aktaTerbaru.map((akta) => (
                  <Link
                    key={akta.id}
                    href={`/akta/${akta.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition group"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        akta.tipeAkta === "PPAT"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {akta.tipeAkta === "PPAT" ? <MapPin size={16} /> : <Scale size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition">
                        {akta.perihal}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        No. {akta.nomorAkta} &bull; {isoToTanggalPendek(akta.tanggalAkta)} &bull;{" "}
                        {akta.pihak.map((p) => p.nama).join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TipeBadge tipe={akta.tipeAkta} size="sm" />
                      <StatusBadge status={akta.statusUmum} size="sm" />
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
