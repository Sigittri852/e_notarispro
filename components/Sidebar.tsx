"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BarChart3,
  ChevronRight,
  Scale,
  MapPin,
  LogOut,
  Settings,
  Users,
  Building2,
} from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import LiveClock from "@/components/LiveClock"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: "/",         label: "Dashboard",           icon: <LayoutDashboard size={18} /> },
  { href: "/akta",     label: "Daftar Akta",         icon: <FileText size={18} /> },
  { href: "/akta/baru",label: "Input Akta Baru",     icon: <PlusCircle size={18} /> },
  { href: "/laporan",  label: "Laporan & Statistik", icon: <BarChart3 size={18} /> },
  { href: "/pengguna",          label: "Manajemen Pengguna",  icon: <Users size={18} /> },
  { href: "/pengaturan/kantor", label: "Profil Kantor",       icon: <Building2 size={18} /> },
  { href: "/pengaturan",        label: "Pengaturan Akun",     icon: <Settings size={18} /> },
]

export default function Sidebar() {
  const pathname            = usePathname()
  const { session, logout } = useAuth()
  const [prosesCount, setProsesCount] = useState(0)
  const [tertundaCount, setTertundaCount] = useState(0)

  // Live badge: count akta Proses & Tertunda from localStorage
  useEffect(() => {
    function updateCounts() {
      try {
        const raw = localStorage.getItem("enotariskupro_akta")
        if (!raw) { setProsesCount(0); setTertundaCount(0); return }
        const data = JSON.parse(raw) as { statusUmum: string }[]
        setProsesCount(data.filter((a) => a.statusUmum === "Proses").length)
        setTertundaCount(data.filter((a) => a.statusUmum === "Tertunda").length)
      } catch {
        setProsesCount(0); setTertundaCount(0)
      }
    }
    updateCounts()
    window.addEventListener("storage", updateCounts)
    // Poll every 3s to pick up changes made in the same tab
    const timer = setInterval(updateCounts, 3000)
    return () => { window.removeEventListener("storage", updateCounts); clearInterval(timer) }
  }, [])

  function isActive(href: string) {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-gradient-to-b from-[#1e3a8a] to-[#1e40af] shadow-xl no-print">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <Scale size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">e-NotarisKu Pro</p>
          <p className="text-blue-200 text-[10px] leading-tight">Notaris & PPAT Digital</p>
        </div>
      </div>

      {/* Live clock */}
      <div className="px-5 py-2.5 border-b border-white/10 bg-white/5">
        <LiveClock
          mode="date"
          className="block text-[10px] font-semibold text-blue-200 leading-tight"
        />
        <LiveClock
          mode="time"
          className="block text-lg font-bold text-white leading-tight tabular-nums"
        />
        <span className="text-[9px] text-blue-300 font-medium">WIB</span>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-5 py-3 border-b border-white/10">
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-blue-600/60 text-blue-100 px-2 py-0.5 rounded-full">
          <Scale size={10} /> Notaris
        </span>
        <span className="flex items-center gap-1 text-[10px] font-semibold bg-orange-500/60 text-orange-100 px-2 py-0.5 rounded-full">
          <MapPin size={10} /> PPAT
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href)
          // Dynamic badge logic
          const badge =
            item.href === "/akta" && prosesCount > 0
              ? { count: prosesCount, color: "bg-blue-400 text-white" }
              : item.href === "/akta" && tertundaCount > 0
              ? { count: tertundaCount, color: "bg-yellow-400 text-yellow-900" }
              : null
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white/20 text-white border-l-[3px] border-white pl-[9px]"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badge.color}`}>
                  {badge.count}
                </span>
              )}
              {active && !badge && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer — user info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        {session && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {session.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{session.namaLengkap}</p>
              <p className="text-blue-300 text-[10px] truncate">{session.jabatan}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full text-xs font-semibold text-red-300 hover:text-white hover:bg-red-600/40 px-3 py-2 rounded-lg transition"
        >
          <LogOut size={14} />
          Keluar / Log Out
        </button>
      </div>
    </aside>
  )
}
