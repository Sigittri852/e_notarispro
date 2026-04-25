"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Scale,
  MapPin,
  ArrowLeft,
  UserSearch,
  ShieldQuestion,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react"
import { authService } from "@/lib/auth"

type Step = "name" | "answer" | "done"

export default function LupaUsernamePage() {
  const router = useRouter()

  const [step, setStep]           = useState<Step>("name")
  const [namaLengkap, setNama]    = useState("")
  const [question, setQuestion]   = useState("")
  const [answer, setAnswer]       = useState("")
  const [foundUsername, setFound] = useState("")
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)

  // ── Step 1: cari user berdasarkan nama lengkap ──────────────────────────────
  function handleFindByName(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!namaLengkap.trim()) { setError("Nama lengkap wajib diisi."); return }
    setLoading(true)
    setTimeout(() => {
      const q = authService.getSecurityQuestionByName(namaLengkap.trim())
      setLoading(false)
      if (!q) {
        setError("Nama lengkap tidak ditemukan. Pastikan penulisan sesuai data pendaftaran.")
        return
      }
      setQuestion(q)
      setStep("answer")
    }, 350)
  }

  // ── Step 2: verifikasi jawaban lalu tampilkan username ──────────────────────
  function handleVerifyAnswer(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!answer.trim()) { setError("Jawaban wajib diisi."); return }
    setLoading(true)
    setTimeout(() => {
      const uname = authService.getUsernameWithAnswer(namaLengkap.trim(), answer.trim())
      setLoading(false)
      if (!uname) {
        setError("Jawaban keamanan salah. Silakan coba lagi.")
        return
      }
      setFound(uname)
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
            <p className="text-blue-200 text-xs mt-0.5">Pemulihan Username</p>
          </div>

          <div className="px-8 py-7">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {(["name", "answer"] as Step[]).map((s, i) => {
                const steps = ["name", "answer", "done"]
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
                    {i < 1 && (
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

            {/* ── Step 1: Nama Lengkap ── */}
            {step === "name" && (
              <form onSubmit={handleFindByName} className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Masukkan Nama Lengkap Anda</p>
                  <p className="text-xs text-slate-400 mb-4">
                    Ketik nama persis seperti saat mendaftar. Sistem akan menampilkan pertanyaan keamanan.
                  </p>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <UserSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={namaLengkap}
                      onChange={(e) => { setNama(e.target.value); setError("") }}
                      placeholder="Contoh: Admin Kantor"
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
                  {loading ? "Memverifikasi..." : "Tampilkan Username"}
                </button>
              </form>
            )}

            {/* ── Done ── */}
            {step === "done" && (
              <div className="space-y-4 py-2">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={28} className="text-green-600" />
                  </div>
                  <p className="text-base font-bold text-slate-800">Username Ditemukan!</p>
                  <p className="text-xs text-slate-500">Username yang terdaftar atas nama Anda adalah:</p>
                </div>

                {/* Username reveal box */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-6 py-4 text-center shadow-md">
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Username Anda</p>
                  <p className="text-2xl font-black text-white tracking-wide font-mono">{foundUsername}</p>
                </div>

                <p className="text-xs text-slate-400 text-center">
                  Catat username Anda di tempat yang aman, lalu kembali untuk masuk.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => router.replace("/login")}
                    className="w-full flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white text-sm font-bold py-2.5 rounded-xl shadow transition"
                  >
                    <LogIn size={15} />
                    Masuk Sekarang
                  </button>
                  <Link
                    href="/login/lupa-password"
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition"
                  >
                    Juga lupa password? Reset di sini
                  </Link>
                </div>
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
