"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Scale, Eye, EyeOff, LogIn, MapPin, AlertCircle, Lock, User, ChevronDown } from "lucide-react"
import { authService } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername]   = useState("")
  const [password, setPassword]   = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [showHint, setShowHint]   = useState(false)
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [checking, setChecking]   = useState(true)

  // If already logged in, redirect immediately
  useEffect(() => {
    authService.init()
    if (authService.isLoggedIn()) {
      router.replace("/")
    } else {
      setChecking(false)
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!username.trim() || !password) {
      setError("Username dan password wajib diisi.")
      return
    }
    setLoading(true)
    // Small timeout to show loading feedback
    setTimeout(() => {
      const session = authService.login(username.trim(), password)
      if (session) {
        router.replace("/")
      } else {
        setError("Username atau password salah. Silakan coba lagi.")
        setLoading(false)
      }
    }, 400)
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                <Scale size={24} className="text-white" />
              </div>
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <MapPin size={24} className="text-orange-300" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">e-NotarisKu Pro</h1>
            <p className="text-blue-200 text-xs mt-1">Sistem Manajemen Akta Digital</p>
            <div className="flex justify-center gap-2 mt-3">
              <span className="text-[10px] font-semibold bg-blue-600/60 text-blue-100 px-2 py-0.5 rounded-full">
                Notaris
              </span>
              <span className="text-[10px] font-semibold bg-orange-500/50 text-orange-100 px-2 py-0.5 rounded-full">
                PPAT
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            <div>
              <p className="text-base font-bold text-slate-800 mb-1">Masuk ke Akun Anda</p>
              <p className="text-xs text-slate-400">Gunakan kredensial kantor yang telah ditetapkan.</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 animate-fade-in">
                <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError("") }}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  style={{ color: "#1e293b" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  style={{ color: "#1e293b" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot links */}
            <div className="flex items-center justify-between text-[11px]">
              <Link
                href="/login/lupa-password"
                className="text-blue-600 hover:text-blue-800 font-semibold transition"
              >
                Lupa Password?
              </Link>
              <Link
                href="/login/lupa-username"
                className="text-slate-500 hover:text-slate-700 font-semibold transition"
              >
                Lupa Username?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm font-bold py-2.5 rounded-xl shadow transition disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Memeriksa..." : "Masuk"}
            </button>

            {/* Collapsible hint */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHint(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition"
              >
                <span className="uppercase tracking-wide">Akun Demo / Petunjuk Login</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform ${showHint ? "rotate-180" : ""}`}
                />
              </button>
              {showHint && (
                <div className="px-4 pb-3 pt-2 bg-white space-y-1.5 animate-fade-in">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Admin:</span>
                    <span className="font-mono font-semibold">admin / notaris2025</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Staff:</span>
                    <span className="font-mono font-semibold">staff / staff123</span>
                  </div>
                  <div className="border-t border-slate-100 pt-1.5 mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Jawaban Keamanan Demo</p>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Admin (nama ibu):</span>
                      <span className="font-mono font-semibold text-slate-600">sari</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Staff (kota lahir):</span>
                      <span className="font-mono font-semibold text-slate-600">jakarta</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-blue-300/60 text-[10px] mt-5">
          e-NotarisKu Pro &mdash; Data tersimpan aman di perangkat Anda
        </p>
      </div>
    </div>
  )
}
