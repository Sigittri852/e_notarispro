"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldQuestion,
  Lock,
} from "lucide-react"
import Sidebar from "@/components/Sidebar"
import AuthGuard from "@/components/AuthGuard"
import { useAuth } from "@/lib/AuthContext"
import { authService, SECURITY_QUESTIONS } from "@/lib/auth"

type SafeUser = {
  id: string
  username: string
  namaLengkap: string
  jabatan: string
  initials: string
  securityQuestion: string
}

type ModalState =
  | { type: "add" }
  | { type: "edit"; user: SafeUser }
  | { type: "resetpw"; user: SafeUser }
  | { type: "delete"; user: SafeUser }
  | null

type AddUserFormState = {
  username: string
  password: string
  confirmPw: string
  namaLengkap: string
  jabatan: string
  securityQuestion: string
  securityAnswer: string
}

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl px-3 py-2.5 animate-fade-in text-xs font-medium ${
        type === "success"
          ? "bg-green-50 border border-green-200 text-green-700"
          : "bg-red-50 border border-red-200 text-red-600"
      }`}
    >
      {type === "success"
        ? <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
        : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
      {msg}
    </div>
  )
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
const labelCls = "block text-xs font-semibold text-slate-600 mb-1.5"

export default function ManajemenPenggunaPage() {
  const { session } = useAuth()
  const [users, setUsers]   = useState<SafeUser[]>([])
  const [modal, setModal]   = useState<ModalState>(null)
  const [toast, setToast]   = useState<{ type: "success" | "error"; msg: string } | null>(null)

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const reload = useCallback(() => {
    setUsers(authService.getAllUsers() as SafeUser[])
  }, [])

  useEffect(() => {
    authService.init()
    reload()
  }, [reload])

  // ── Add User ───────────────────────────────────────────────────────────────
  const [addForm, setAddForm] = useState<AddUserFormState>({
    username: "", password: "", confirmPw: "",
    namaLengkap: "", jabatan: "Staff",
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: "",
  })
  const [addMsg, setAddMsg]   = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [savingAdd, setSavingAdd] = useState(false)
  const [showAddPw, setShowAddPw] = useState(false)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddMsg(null)
    if (!addForm.username.trim())     { setAddMsg({ type: "error", msg: "Username wajib diisi." }); return }
    if (addForm.password.length < 6)  { setAddMsg({ type: "error", msg: "Password minimal 6 karakter." }); return }
    if (addForm.password !== addForm.confirmPw) { setAddMsg({ type: "error", msg: "Konfirmasi password tidak cocok." }); return }
    if (!addForm.namaLengkap.trim())  { setAddMsg({ type: "error", msg: "Nama lengkap wajib diisi." }); return }
    if (!addForm.securityAnswer.trim()) { setAddMsg({ type: "error", msg: "Jawaban keamanan wajib diisi." }); return }
    setSavingAdd(true)
    setTimeout(() => {
      const result = authService.createUser({
        username:        addForm.username.trim(),
        password:        addForm.password,
        namaLengkap:     addForm.namaLengkap.trim(),
        jabatan:         addForm.jabatan.trim() || "Staff",
        securityQuestion: addForm.securityQuestion,
        securityAnswer:  addForm.securityAnswer.trim(),
      })
      setSavingAdd(false)
      if (!result) {
        setAddMsg({ type: "error", msg: "Username sudah digunakan. Pilih username lain." })
        return
      }
      reload()
      setModal(null)
      setAddForm({
        username: "",
        password: "",
        confirmPw: "",
        namaLengkap: "",
        jabatan: "Staff",
        securityQuestion: SECURITY_QUESTIONS[0],
        securityAnswer: "",
      })
      showToast("success", `Pengguna "${result.username}" berhasil ditambahkan.`)
    }, 350)
  }

  // ── Edit User ──────────────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({ namaLengkap: "", jabatan: "" })
  const [editMsg, setEditMsg]   = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (modal?.type === "edit") {
      setEditForm({ namaLengkap: modal.user.namaLengkap, jabatan: modal.user.jabatan })
      setEditMsg(null)
    }
  }, [modal])

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (modal?.type !== "edit") return
    setEditMsg(null)
    if (!editForm.namaLengkap.trim()) { setEditMsg({ type: "error", msg: "Nama lengkap wajib diisi." }); return }
    setSavingEdit(true)
    setTimeout(() => {
      authService.updateUserProfile(modal.user.id, editForm)
      reload()
      setSavingEdit(false)
      setModal(null)
      showToast("success", "Profil pengguna berhasil diperbarui.")
    }, 350)
  }

  // ── Reset Password ─────────────────────────────────────────────────────────
  const [newPw, setNewPw]   = useState("")
  const [conPw, setConPw]   = useState("")
  const [showPw, setShowPw] = useState(false)
  const [pwMsg, setPwMsg]   = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    if (modal?.type === "resetpw") { setNewPw(""); setConPw(""); setPwMsg(null) }
  }, [modal])

  function handleResetPw(e: React.FormEvent) {
    e.preventDefault()
    if (modal?.type !== "resetpw") return
    setPwMsg(null)
    if (newPw.length < 6)  { setPwMsg({ type: "error", msg: "Password minimal 6 karakter." }); return }
    if (newPw !== conPw)   { setPwMsg({ type: "error", msg: "Konfirmasi tidak cocok." }); return }
    setSavingPw(true)
    setTimeout(() => {
      authService.adminResetPassword(modal.user.id, newPw)
      setSavingPw(false)
      setModal(null)
      showToast("success", `Password untuk "${modal.user.username}" berhasil direset.`)
    }, 350)
  }

  // ── Delete User ────────────────────────────────────────────────────────────
  function handleDelete() {
    if (modal?.type !== "delete" || !session) return
    const ok = authService.deleteUser(modal.user.id, session.userId)
    if (!ok) {
      showToast("error", "Tidak dapat menghapus akun Anda sendiri.")
    } else {
      reload()
      showToast("success", `Pengguna "${modal.user.username}" berhasil dihapus.`)
    }
    setModal(null)
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#f0f4f8]">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">

          {/* Page header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Manajemen Pengguna</h1>
                  <p className="text-blue-200 text-sm mt-0.5">
                    {users.length} pengguna terdaftar
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setAddMsg(null); setModal({ type: "add" }) }}
                className="flex items-center gap-2 bg-white text-blue-800 text-sm font-bold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
              >
                <UserPlus size={15} />
                Tambah Pengguna
              </button>
            </div>
          </div>

          <div className="px-8 py-6 max-w-4xl animate-fade-in space-y-4">

            {/* Toast */}
            {toast && <Alert type={toast.type} msg={toast.msg} />}

            {/* Users table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3">Pengguna</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Username</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Jabatan</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Pertanyaan Keamanan</th>
                    <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => {
                    const isSelf = u.id === session?.userId
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{u.namaLengkap}</p>
                              {isSelf && (
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {u.username}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs text-slate-600">{u.jabatan}</span>
                        </td>
                        <td className="px-3 py-3.5 max-w-[200px]">
                          <div className="flex items-start gap-1.5">
                            <ShieldQuestion size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-[11px] text-slate-500 truncate">{u.securityQuestion}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setModal({ type: "edit", user: u })}
                              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition"
                              title="Edit profil"
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              onClick={() => setModal({ type: "resetpw", user: u })}
                              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition"
                              title="Reset password"
                            >
                              <KeyRound size={11} />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => setModal({ type: "delete", user: u })}
                                className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition"
                                title="Hapus pengguna"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <ShieldCheck size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-700 mb-0.5">Catatan Keamanan</p>
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Password disimpan menggunakan encoding lokal. Gunakan password yang kuat dan unik.
                  Halaman ini hanya untuk administrator kantor. Setiap pengguna dapat mengubah password
                  sendiri melalui menu Pengaturan Akun.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">

            {/* ── Modal: Tambah Pengguna ── */}
            {modal.type === "add" && (
              <>
                <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserPlus size={18} className="text-white" />
                    <p className="text-white font-bold">Tambah Pengguna Baru</p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/70 hover:text-white transition">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAdd} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {addMsg && <Alert type={addMsg.type} msg={addMsg.msg} />}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Username *</label>
                      <input
                        value={addForm.username}
                        onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                        placeholder="Contoh: budi.s"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Jabatan</label>
                      <input
                        value={addForm.jabatan}
                        onChange={(e) => setAddForm({ ...addForm, jabatan: e.target.value })}
                        placeholder="Staff / Notaris / ..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Nama Lengkap *</label>
                    <input
                      value={addForm.namaLengkap}
                      onChange={(e) => setAddForm({ ...addForm, namaLengkap: e.target.value })}
                      placeholder="Nama sesuai identitas"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Password *</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showAddPw ? "text" : "password"}
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        placeholder="Minimal 6 karakter"
                        className={inputCls + " pl-9 pr-10"}
                      />
                      <button type="button" onClick={() => setShowAddPw(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showAddPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Konfirmasi Password *</label>
                    <input
                      type="password"
                      value={addForm.confirmPw}
                      onChange={(e) => setAddForm({ ...addForm, confirmPw: e.target.value })}
                      placeholder="Ulangi password"
                      className={`${inputCls} ${addForm.confirmPw && addForm.confirmPw !== addForm.password ? "border-red-300 focus:ring-red-400" : addForm.confirmPw && addForm.confirmPw === addForm.password ? "border-green-300" : ""}`}
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Pertanyaan Keamanan</p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Pertanyaan</label>
                        <select
                          value={addForm.securityQuestion}
                          onChange={(e) => setAddForm({ ...addForm, securityQuestion: e.target.value })}
                          className={inputCls}
                        >
                          {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Jawaban *</label>
                        <input
                          value={addForm.securityAnswer}
                          onChange={(e) => setAddForm({ ...addForm, securityAnswer: e.target.value })}
                          placeholder="Jawaban tidak peka huruf besar/kecil"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setModal(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Batal
                    </button>
                    <button type="submit" disabled={savingAdd}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow transition disabled:opacity-60">
                      {savingAdd ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                      {savingAdd ? "Menyimpan..." : "Buat Pengguna"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Modal: Edit Profil ── */}
            {modal.type === "edit" && (
              <>
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 size={17} className="text-white" />
                    <p className="text-white font-bold">Edit Profil — {modal.user.username}</p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/70 hover:text-white transition"><X size={18} /></button>
                </div>
                <form onSubmit={handleEdit} className="p-6 space-y-4">
                  {editMsg && <Alert type={editMsg.type} msg={editMsg.msg} />}
                  <div>
                    <label className={labelCls}>Nama Lengkap *</label>
                    <input
                      value={editForm.namaLengkap}
                      onChange={(e) => { setEditForm({ ...editForm, namaLengkap: e.target.value }); setEditMsg(null) }}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Jabatan</label>
                    <input
                      value={editForm.jabatan}
                      onChange={(e) => { setEditForm({ ...editForm, jabatan: e.target.value }); setEditMsg(null) }}
                      placeholder="Staff / Notaris / PPAT / ..."
                      className={inputCls}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setModal(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Batal
                    </button>
                    <button type="submit" disabled={savingEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow transition disabled:opacity-60">
                      {savingEdit ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                      Simpan
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Modal: Reset Password ── */}
            {modal.type === "resetpw" && (
              <>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={17} className="text-white" />
                    <p className="text-white font-bold">Reset Password — {modal.user.username}</p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/70 hover:text-white transition"><X size={18} /></button>
                </div>
                <form onSubmit={handleResetPw} className="p-6 space-y-4">
                  {pwMsg && <Alert type={pwMsg.type} msg={pwMsg.msg} />}
                  <p className="text-xs text-slate-500">
                    Sebagai administrator, Anda dapat mereset password pengguna tanpa memerlukan verifikasi.
                  </p>
                  <div>
                    <label className={labelCls}>Password Baru *</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => { setNewPw(e.target.value); setPwMsg(null) }}
                        placeholder="Minimal 6 karakter"
                        className={inputCls + " pl-9 pr-10"}
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                        {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Konfirmasi Password Baru *</label>
                    <input
                      type="password"
                      value={conPw}
                      onChange={(e) => { setConPw(e.target.value); setPwMsg(null) }}
                      placeholder="Ulangi password"
                      className={`${inputCls} ${conPw && conPw !== newPw ? "border-red-300" : conPw && conPw === newPw ? "border-green-300" : ""}`}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setModal(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Batal
                    </button>
                    <button type="submit" disabled={savingPw}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow transition disabled:opacity-60">
                      {savingPw ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <KeyRound size={14} />}
                      Reset Password
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Modal: Konfirmasi Hapus ── */}
            {modal.type === "delete" && (
              <>
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 size={17} className="text-white" />
                    <p className="text-white font-bold">Hapus Pengguna</p>
                  </div>
                  <button onClick={() => setModal(null)} className="text-white/70 hover:text-white transition"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Konfirmasi Penghapusan</p>
                      <p className="text-xs text-red-600 mt-1">
                        Hapus pengguna <strong>{modal.user.namaLengkap}</strong> (@{modal.user.username})?
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setModal(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      Batal
                    </button>
                    <button onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow transition">
                      <Trash2 size={14} />
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </AuthGuard>
  )
}
