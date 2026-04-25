"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Settings,
  Lock,
  ShieldQuestion,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  User,
  KeyRound,
  ChevronRight,
} from "lucide-react"
import Sidebar from "@/components/Sidebar"
import AuthGuard from "@/components/AuthGuard"
import { useAuth } from "@/lib/AuthContext"
import { authService, SECURITY_QUESTIONS } from "@/lib/auth"

type ActiveTab = "password" | "security"

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl px-3 py-2.5 mb-5 animate-fade-in ${
        type === "success"
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
      )}
      <p className={`text-xs font-medium ${type === "success" ? "text-green-700" : "text-red-600"}`}>
        {message}
      </p>
    </div>
  )
}

export default function PengaturanPage() {
  const { session } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>("password")

  // ── Ganti Password ─────────────────────────────────────────────────────────
  const [oldPw, setOldPw]       = useState("")
  const [newPw, setNewPw]       = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showOld, setShowOld]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [showCon, setShowCon]   = useState(false)
  const [pwMsg, setPwMsg]       = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingPw, setSavingPw] = useState(false)

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (!oldPw) { setPwMsg({ type: "error", text: "Password lama wajib diisi." }); return }
    if (newPw.length < 6) { setPwMsg({ type: "error", text: "Password baru minimal 6 karakter." }); return }
    if (newPw !== confirmPw) { setPwMsg({ type: "error", text: "Konfirmasi password tidak cocok." }); return }
    if (!session) return
    setSavingPw(true)
    setTimeout(() => {
      // Verify old password by trying to login
      const ok = authService.verifyCurrentPassword(session.username, oldPw)
      if (!ok) {
        setPwMsg({ type: "error", text: "Password lama salah." })
        setSavingPw(false)
        return
      }
      authService.changePassword(session.username, newPw)
      setPwMsg({ type: "success", text: "Password berhasil diubah. Gunakan password baru untuk login berikutnya." })
      setOldPw(""); setNewPw(""); setConfirmPw("")
      setSavingPw(false)
    }, 400)
  }

  // ── Ganti Pertanyaan Keamanan ───────────────────────────────────────────────
  const [secQuestion, setSecQuestion] = useState(
    session ? authService.getSecurityQuestionByUsername(session.username) ?? SECURITY_QUESTIONS[0] : SECURITY_QUESTIONS[0]
  )
  const [secAnswer, setSecAnswer]     = useState("")
  const [currentPwSec, setCurrentPwSec] = useState("")
  const [showCurSec, setShowCurSec]   = useState(false)
  const [secMsg, setSecMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [savingSec, setSavingSec]     = useState(false)

  function handleChangeSecurity(e: React.FormEvent) {
    e.preventDefault()
    setSecMsg(null)
    if (!currentPwSec) { setSecMsg({ type: "error", text: "Password saat ini wajib diisi untuk konfirmasi." }); return }
    if (!secAnswer.trim()) { setSecMsg({ type: "error", text: "Jawaban keamanan baru wajib diisi." }); return }
    if (!session) return
    setSavingSec(true)
    setTimeout(() => {
      const ok = authService.verifyCurrentPassword(session.username, currentPwSec)
      if (!ok) {
        setSecMsg({ type: "error", text: "Password salah. Tidak dapat menyimpan perubahan." })
        setSavingSec(false)
        return
      }
      authService.updateSecurityQuestion(session.username, secQuestion, secAnswer.trim())
      setSecMsg({ type: "success", text: "Pertanyaan dan jawaban keamanan berhasil diperbarui." })
      setSecAnswer(""); setCurrentPwSec("")
      setSavingSec(false)
    }, 400)
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5"

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: "password", label: "Ganti Password", icon: <Lock size={15} /> },
    { key: "security", label: "Pertanyaan Keamanan", icon: <ShieldQuestion size={15} /> },
  ]

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#f0f4f8]">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Settings size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Pengaturan Akun</h1>
                <p className="text-blue-200 text-sm mt-0.5">
                  {session ? `Masuk sebagai ${session.namaLengkap} (${session.username})` : "Kelola keamanan akun Anda"}
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 max-w-2xl animate-fade-in">
            {/* User card */}
            {session && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
                  {session.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{session.namaLengkap}</p>
                  <p className="text-xs text-slate-500">{session.jabatan}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">@{session.username}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                  <CheckCircle2 size={12} />
                  Aktif
                </div>
              </div>
            )}

            {/* Tab nav */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-6">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition ${
                    activeTab === t.key
                      ? "bg-blue-700 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab: Ganti Password ── */}
            {activeTab === "password" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <SectionHeader
                  icon={<Lock size={18} className="text-blue-600" />}
                  title="Ubah Password"
                  desc="Gunakan password yang kuat dan unik untuk melindungi akun Anda."
                />

                {pwMsg && <Alert type={pwMsg.type} message={pwMsg.text} />}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className={labelClass}>Password Saat Ini</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPw}
                        onChange={(e) => { setOldPw(e.target.value); setPwMsg(null) }}
                        placeholder="Masukkan password saat ini"
                        className={inputClass + " pl-9 pr-10"}
                      />
                      <button type="button" onClick={() => setShowOld(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Password Baru</label>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => { setNewPw(e.target.value); setPwMsg(null) }}
                        placeholder="Minimal 6 karakter"
                        className={inputClass + " pl-9 pr-10"}
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {/* Password strength */}
                    {newPw.length > 0 && (
                      <div className="mt-1.5 flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                            newPw.length >= i * 3
                              ? newPw.length >= 10 ? "bg-green-500" : newPw.length >= 7 ? "bg-yellow-400" : "bg-red-400"
                              : "bg-slate-200"
                          }`} />
                        ))}
                        <span className="text-[10px] text-slate-400 ml-1">
                          {newPw.length >= 10 ? "Kuat" : newPw.length >= 7 ? "Sedang" : "Lemah"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Konfirmasi Password Baru</label>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showCon ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => { setConfirmPw(e.target.value); setPwMsg(null) }}
                        placeholder="Ulangi password baru"
                        className={`${inputClass} pl-9 pr-10 ${confirmPw && confirmPw !== newPw ? "border-red-300 focus:ring-red-400" : confirmPw && confirmPw === newPw ? "border-green-300 focus:ring-green-400" : ""}`}
                      />
                      <button type="button" onClick={() => setShowCon(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showCon ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirmPw && confirmPw !== newPw && (
                      <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={savingPw}
                    className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold py-2.5 rounded-xl shadow transition disabled:opacity-60 mt-2"
                  >
                    {savingPw
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Save size={15} />}
                    {savingPw ? "Menyimpan..." : "Simpan Password Baru"}
                  </button>
                </form>
              </div>
            )}

            {/* ── Tab: Pertanyaan Keamanan ── */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <SectionHeader
                  icon={<ShieldQuestion size={18} className="text-blue-600" />}
                  title="Pertanyaan & Jawaban Keamanan"
                  desc="Digunakan untuk memulihkan password jika Anda lupa. Pilih pertanyaan yang jawabannya hanya Anda yang tahu."
                />

                {secMsg && <Alert type={secMsg.type} message={secMsg.text} />}

                <form onSubmit={handleChangeSecurity} className="space-y-4">
                  <div>
                    <label className={labelClass}>Pilih Pertanyaan Keamanan</label>
                    <select
                      value={secQuestion}
                      onChange={(e) => setSecQuestion(e.target.value)}
                      className={inputClass}
                    >
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Jawaban Baru</label>
                    <div className="relative">
                      <ShieldQuestion size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={secAnswer}
                        onChange={(e) => { setSecAnswer(e.target.value); setSecMsg(null) }}
                        placeholder="Jawaban tidak peka huruf besar/kecil"
                        className={inputClass + " pl-9"}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Jawaban akan disimpan dalam format tidak peka huruf.</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <label className={labelClass}>Konfirmasi dengan Password Saat Ini</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showCurSec ? "text" : "password"}
                        value={currentPwSec}
                        onChange={(e) => { setCurrentPwSec(e.target.value); setSecMsg(null) }}
                        placeholder="Masukkan password Anda"
                        className={inputClass + " pl-9 pr-10"}
                      />
                      <button type="button" onClick={() => setShowCurSec(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showCurSec ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Diperlukan sebagai verifikasi perubahan keamanan.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSec}
                    className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold py-2.5 rounded-xl shadow transition disabled:opacity-60"
                  >
                    {savingSec
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Save size={15} />}
                    {savingSec ? "Menyimpan..." : "Simpan Pertanyaan Keamanan"}
                  </button>
                </form>
              </div>
            )}

            {/* Quick nav */}
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Navigasi Cepat</p>
              <div className="space-y-1">
                {[
                  { href: "/", label: "Kembali ke Dashboard" },
                  { href: "/akta/baru", label: "Input Akta Baru" },
                  { href: "/laporan", label: "Laporan & Statistik" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                  >
                    {item.label}
                    <ChevronRight size={13} className="text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
