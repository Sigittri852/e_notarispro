"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Sidebar from "@/components/Sidebar"
import AuthGuard from "@/components/AuthGuard"
import {
  Building2, User, Phone, Mail, MapPin, Globe,
  Save, CheckCircle2, Image as ImageIcon, X,
  FileText, Hash, Layers,
} from "lucide-react"
import {
  getKantor, saveKantor, defaultKantor,
  type ProfilKantor,
} from "@/lib/kantor"

// ─── Reusable field ────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = "text", icon, required,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  icon?: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-slate-200 bg-white py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${icon ? "pl-9 pr-3" : "px-3"}`}
          style={{ color: "#1e293b" }}
        />
      </div>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200">
      <span className="text-blue-600">{icon}</span>
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function PengaturanKantorPage() {
  const [form, setForm] = useState<ProfilKantor>(defaultKantor)
  const [saved, setSaved] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const data = getKantor()
    setForm(data)
    if (data.logoUrl) setLogoPreview(data.logoUrl)
  }, [])

  const set = useCallback((key: keyof ProfilKantor) => (v: string) => {
    setForm((prev) => ({ ...prev, [key]: v }))
  }, [])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 300 * 1024) {
      alert("Logo terlalu besar. Maksimal 300 KB.")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      setLogoPreview(url)
      setForm((prev) => ({ ...prev, logoUrl: url }))
    }
    reader.readAsDataURL(file)
  }

  function removeLogo() {
    setLogoPreview("")
    setForm((prev) => ({ ...prev, logoUrl: "" }))
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    saveKantor(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="ml-64 flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Profil Kantor</h1>
                <p className="text-blue-200 text-xs mt-0.5">
                  Data kantor akan tampil di kop surat akta, form input, dan dokumen cetak
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="flex-1 px-8 py-6 max-w-4xl">

            {/* Logo */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-5">
              <SectionTitle icon={<ImageIcon size={15} />} title="Logo Kantor" />
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo kantor" className="w-full h-full object-contain" />
                    : <Building2 size={32} className="text-slate-300" />
                  }
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-slate-600">
                    Upload logo kantor (PNG/JPG, maks. 300 KB).
                    Logo akan tampil di kop surat cetak.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <ImageIcon size={12} /> Pilih File
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition"
                      >
                        <X size={12} /> Hapus Logo
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
              </div>
            </div>

            {/* Identitas Kantor */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-5">
              <SectionTitle icon={<Building2 size={15} />} title="Identitas Kantor" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Nama Kantor" value={form.namaKantor} onChange={set("namaKantor")}
                    placeholder="Kantor Notaris & PPAT Hj. Sari Dewi, S.H., M.Kn."
                    icon={<Building2 size={14} />} required
                    hint="Nama resmi kantor sesuai SK pengangkatan" />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Nama Notaris / PPAT" value={form.namaNotaris} onChange={set("namaNotaris")}
                    placeholder="Hj. Sari Dewi, S.H., M.Kn."
                    icon={<User size={14} />} required />
                </div>
                <Field label="Nomor SK Pengangkatan" value={form.nomorSK} onChange={set("nomorSK")}
                  placeholder="AHU-1234.AH.02.01.Tahun2020"
                  icon={<Hash size={14} />}
                  hint="SK Menteri Kehakiman / Kepres" />
                <Field label="Wilayah Kerja" value={form.wilayahKerja} onChange={set("wilayahKerja")}
                  placeholder="Kota Jakarta Selatan, Prov. DKI Jakarta"
                  icon={<Layers size={14} />} />
              </div>
            </div>

            {/* Alamat */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-5">
              <SectionTitle icon={<MapPin size={15} />} title="Alamat Kantor" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Jalan / Nama Gedung" value={form.alamat} onChange={set("alamat")}
                    placeholder="Jl. Sudirman No. 88, Gedung Notaris Lt. 5"
                    icon={<MapPin size={14} />} required />
                </div>
                <Field label="Kelurahan" value={form.kelurahan} onChange={set("kelurahan")}
                  placeholder="Senayan" />
                <Field label="Kecamatan" value={form.kecamatan} onChange={set("kecamatan")}
                  placeholder="Kebayoran Baru" />
                <Field label="Kota / Kabupaten" value={form.kota} onChange={set("kota")}
                  placeholder="Jakarta Selatan" required />
                <Field label="Provinsi" value={form.provinsi} onChange={set("provinsi")}
                  placeholder="DKI Jakarta" />
                <Field label="Kode Pos" value={form.kodePos} onChange={set("kodePos")}
                  placeholder="12190" />
              </div>
            </div>

            {/* Kontak */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-5">
              <SectionTitle icon={<Phone size={15} />} title="Kontak" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nomor Telepon Kantor" value={form.telepon} onChange={set("telepon")}
                  placeholder="(021) 123-4567"
                  icon={<Phone size={14} />} />
                <Field label="HP / WhatsApp" value={form.hp} onChange={set("hp")}
                  placeholder="0812-3456-7890"
                  icon={<Phone size={14} />} />
                <Field label="Fax" value={form.fax} onChange={set("fax")}
                  placeholder="(021) 123-4568"
                  icon={<Phone size={14} />} />
                <Field label="Email" value={form.email} onChange={set("email")}
                  type="email"
                  placeholder="info@kantornotaris.id"
                  icon={<Mail size={14} />} />
                <div className="sm:col-span-2">
                  <Field label="Website" value={form.website} onChange={set("website")}
                    placeholder="https://kantornotaris.id"
                    icon={<Globe size={14} />} />
                </div>
              </div>
            </div>

            {/* Preview Kop Surat */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
              <SectionTitle icon={<FileText size={15} />} title="Preview Kop Surat" />
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-5 bg-slate-50">
                <div style={{
                  fontFamily: "'Times New Roman', serif",
                  borderBottom: "3px double #000",
                  paddingBottom: 12,
                  textAlign: "center",
                }}>
                  {logoPreview && (
                    <img src={logoPreview} alt="logo" style={{ height: 60, margin: "0 auto 8px", display: "block", objectFit: "contain" }} />
                  )}
                  <p style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: "#555" }}>
                    {form.namaKantor ? (form.namaKantor.toUpperCase().includes("PPAT") ? "KANTOR NOTARIS & PPAT" : "KANTOR NOTARIS") : "KANTOR NOTARIS & PPAT"}
                  </p>
                  <p style={{ fontSize: 16, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, margin: "3px 0" }}>
                    {form.namaNotaris || "NAMA NOTARIS"}
                  </p>
                  {form.nomorSK && (
                    <p style={{ fontSize: 9, color: "#555" }}>SK No. {form.nomorSK}</p>
                  )}
                  {(form.alamat || form.kota) && (
                    <p style={{ fontSize: 9.5, color: "#333", marginTop: 3 }}>
                      {[form.alamat, form.kelurahan && `Kel. ${form.kelurahan}`, form.kecamatan && `Kec. ${form.kecamatan}`, form.kota, form.kodePos].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {(form.telepon || form.hp || form.email) && (
                    <p style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
                      {[form.telepon && `Telp. ${form.telepon}`, form.hp && `HP/WA. ${form.hp}`, form.email].filter(Boolean).join(" \u2022 ")}
                    </p>
                  )}
                  {form.wilayahKerja && (
                    <p style={{ fontSize: 9, color: "#777", marginTop: 2 }}>
                      Wilayah Kerja: {form.wilayahKerja}
                    </p>
                  )}
                </div>
                <p style={{ fontFamily: "'Times New Roman', serif", fontSize: 10, color: "#888", textAlign: "center", marginTop: 8 }}>
                  ↑ Tampilan kop surat pada dokumen cetak
                </p>
              </div>
            </div>

            {/* Simpan */}
            <div className="flex items-center gap-4 pb-10">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow transition text-sm"
              >
                {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                {saved ? "Tersimpan!" : "Simpan Profil Kantor"}
              </button>
              {saved && (
                <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={14} />
                  Data kantor berhasil disimpan dan akan muncul di semua dokumen.
                </p>
              )}
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  )
}
