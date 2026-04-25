"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Scale,
  MapPin,
  ArrowLeft,
  User,
  ShieldQuestion,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react"
import { authService } from "@/lib/auth"

type Step = "username" | "answer" | "newpass" | "done"

export default function LupaPasswordPage() {
  const router = useRouter()

  const [step, setStep]               = useState<Step>("username")
  const [username, setUsername]       = useState("")
  const [question, setQuestion]       = useState("")
  const [answer, setAnswer]           = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPw, setConfirmPw]     = useState("")
  const [showPw, setShowPw]           = useState(false)
  const [showCpw, setShowCpw]         = useState(false)
  const [error, setError]             = useState("")
  const [loading, setLoading]         = useState(false)

  // ── Step 1: cari user berdasarkan username ──────────────────────────────────
  function handleFindUser(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!username.trim()) { setError("Username wajib diisi."); return }
    setLoading(true)
    setTimeout(() => {
      const q = authService.getSecurityQuestionByUsername(username.trim())
      setLoading(false)
      if (!q) {
        setError("Username tidak ditemukan. Periksa kembali penulisan Anda.")
        return
      }
      setQuestion(q)
      setStep("answer")
    }, 350)
  }

  // ── Step 2: verifikasi jawaban ──────────────────────────────────────────────
  function handleVerifyAnswer(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!answer.trim()) { setError("Jawaban wajib diisi."); return }
    setLoading(true)
    setTimeout(() => {
      const ok = authService.verifySecurityAnswer(username.trim(), answer.trim())
      setLoading(false)
      if (!ok) {
        setError("Jawaban keamanan salah. Silakan coba lagi.")
        return
      }
      setStep("newpass")
    }, 350)
  }

  // ── Step 3: set password baru ───────────────────────────────────────────────
  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.")
      return
    }
    if (newPassword !== confirmPw) {
      setError("Konfirmasi password tidak cocok.")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const ok = authService.resetPasswordWithAnswer(username.trim(), answer.trim(), newPassword)
      setLoading(false)
      if (!ok) {
        setError("Gagal mereset password. Silakan ulangi dari awal.")
        return
      }
      setStep("done")
    }, 350)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0369a1] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 pt-7 pb-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Scale size={22} className="text-white" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <MapPin size={22} className="text-orange-300" />
              </div>
            </div>
            <h1 className="text-lg font-bold text-white">e-NotarisKu Pro</h1>
            <p className="text-blue-200 text-xs mt-0.5">Pemulihan Password</p>
          </div>

          <div className="px-8 py-7">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {(["username", "answer", "newpass"] as Step[]).map((s, i) => {
                const steps = ["username", "answer", "newpass", "done"]
                const current = steps.indexOf(step)
                const isDone  = current > i
                const isActive = steps[i] === step
                return (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={12} /> : i + 1}
                    </div>
                    {i < 2 && (
                      <div className={`flex-1 h-0.5 rounded ${isDone ? "bg-green-400" : "bg-slate-200"}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-4 animate-fade-in">
                <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* ── Step 1: Username ── */}
            {step === "username" && (
              <form onSubmit={handleFindUser} className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Masukkan Username Anda</p>
                  <p className="text-xs text-slate-400 mb-4">
                    Kami akan menampilkan pertanyaan keamanan untuk verifikasi identitas Anda.
                  </p>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm font-bold py-2.5 rounded-xl shadow transition disabled:opacity-60"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <ShieldQuestion size={15} />}
                  {loading ? "Mencari..." : "Lanjutkan"}
                </button>
              </form>
            )}

            {/* ── Step 2: Security Answer ── */}
            {step === "answer" && (
              <form onSubmit={handleVerifyAnswer} className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Pertanyaan Keamanan</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 mb-4">
                    <p className="text-xs font-semibold text-blue-700">{question}</p>
                  </div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jawaban Anda</label>
                  <div className="relative">
                    <ShieldQuestion size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => { setAnswer(e.target.value); setError("") }}
                      placeholder="Ketik jawaban Anda"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ color: "#1e293b" }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Jawaban tidak peka huruf besar/kecil.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm font-bold py-2.5 rounded-xl shadow transition disabled:opacity-60"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <ShieldQuestion size={15} />}
                  {loading ? "Memverifikasi..." : "Verifikasi"}
                </button>
              </form>
            )}

            {/* ── Step 3: New Password ── */}
            {step === "newpass" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Buat Password Baru</p>
                  <p className="text-xs text-slate-400 mb-4">Password minimal 6 karakter.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password Baru</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError("") }}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ color: "#1e293b" }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition" tabIndex={-1}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Konfirmasi Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type={showCpw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => { setConfirmPw(e.target.value); setError("") }}
                      placeholder="Ulangi password baru"
                      className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ color: "#1e293b" }}
                    />
                    <button type="button" onClick={() => setShowCpw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition" tabIndex={-1}>
                      {showCpw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl shadow transition disabled:opacity-60"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <KeyRound size={15} />}
                  {loading ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </form>
            )}

            {/* ── Done ── */}
            {step === "done" && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">Password Berhasil Direset!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan masuk menggunakan password baru Anda.
                  </p>
                </div>
                <button
                  onClick={() => router.replace("/login")}
                  className="w-full flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm font-bold py-2.5 rounded-xl shadow transition"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            )}

            {/* Back link */}
            {step !== "done" && (
              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 font-semibold transition"
                >
                  <ArrowLeft size={12} /> Kembali ke Login
                </Link>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-blue-300/60 text-[10px] mt-5">
          e-NotarisKu Pro &mdash; Data tersimpan aman di perangkat Anda
        </p>
      </div>
    </div>
  )
}
