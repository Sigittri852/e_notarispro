"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Scale,
  MapPin,
  Building2,
  FileText,
  Calendar,
  Hash,
  StickyNote,
  Landmark,
  Layers,
  Map,
  Printer,
} from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { StatusBadge, TipeBadge } from "@/components/StatusBadge"
import WorkflowTracker from "@/components/WorkflowTracker"
import PrintAkta from "@/components/PrintAkta"
import AuthGuard from "@/components/AuthGuard"
import { aktaService } from "@/lib/storage"
import type { Akta, StepStatusPPAT } from "@/lib/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value || "—"}</dd>
    </div>
  )
}

export default function DetailAktaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [akta, setAkta] = useState<Akta | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  useEffect(() => {
    aktaService.init()
    const found = aktaService.getById(id)
    if (!found) router.push("/akta")
    else setAkta(found)
  }, [id, router])

  function handleWorkflowUpdate(key: string, value: StepStatusPPAT) {
    if (!akta) return
    if (akta.tipeAkta === "PPAT" && akta.workflowPPAT) {
      const updated = aktaService.update(akta.id, {
        workflowPPAT: { ...akta.workflowPPAT, [key]: value },
      })
      if (updated) setAkta(updated)
    } else if (akta.tipeAkta === "NOTARIIL" && akta.workflowNotaris) {
      const updated = aktaService.update(akta.id, {
        workflowNotaris: { ...akta.workflowNotaris, [key]: value },
      })
      if (updated) setAkta(updated)
    }
  }

  function handleDelete() {
    if (!akta) return
    aktaService.delete(akta.id)
    router.push("/akta")
  }

  if (!akta) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-[#f0f4f8]">
          <Sidebar />
          <main className="flex-1 ml-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </AuthGuard>
    )
  }

  const isPPAT = akta.tipeAkta === "PPAT"

  return (
    <>
    {showPrint && <PrintAkta akta={akta} onClose={() => setShowPrint(false)} />}
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div
          className={`px-8 py-6 ${
            isPPAT
              ? "bg-gradient-to-r from-[#7c2d12] to-[#ea580c]"
              : "bg-gradient-to-r from-[#1e3a8a] to-[#1e40af]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/akta"
                className="p-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition"
              >
                <ArrowLeft size={16} />
              </Link>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isPPAT ? "bg-orange-800/40" : "bg-blue-800/40"
                }`}
              >
                {isPPAT ? <MapPin size={20} className="text-white" /> : <Scale size={20} className="text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <TipeBadge tipe={akta.tipeAkta} size="sm" />
                  <span className="text-white/70 text-xs">Akta No. {akta.nomorAkta}</span>
                </div>
                <h1 className="text-lg font-bold text-white mt-0.5 max-w-xl truncate">{akta.perihal}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={akta.statusUmum} />
              <button
                onClick={() => setShowPrint(true)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-lg transition no-print"
              >
                <Printer size={13} />
                Cetak
              </button>
              <Link
                href={`/akta/${akta.id}/edit`}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-lg transition no-print"
              >
                <Edit3 size={13} />
                Edit
              </Link>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition no-print"
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </div>
          </div>
        </div>

        {/* Delete confirm */}
        {confirmDelete && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between animate-fade-in">
            <p className="text-sm font-semibold text-red-700">
              Hapus akta ini secara permanen? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          {/* LEFT: Main info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Data Utama */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <FileText size={14} /> Data Utama Akta
              </p>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <InfoRow label="Nomor Akta" value={akta.nomorAkta} mono />
                <InfoRow label="Tanggal Akta" value={formatDate(akta.tanggalAkta)} />
                <InfoRow label="Kategori" value={akta.kategori} />
                <div className="col-span-2 sm:col-span-3">
                  <InfoRow label="Perihal" value={akta.perihal} />
                </div>
              </dl>
            </div>

            {/* Para Pihak */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Building2 size={14} /> Para Pihak
              </p>
              <div className="space-y-3">
                {akta.pihak.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {p.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{p.nama}</p>
                      <p className="text-xs text-slate-500">
                        NIK: <span className="font-mono">{p.nik || "—"}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md flex-shrink-0">
                      {p.peran}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Objek Tanah — PPAT only */}
            {isPPAT && akta.objekTanah && (
              <div className="bg-white rounded-xl border border-orange-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Map size={14} /> Detail Objek Tanah
                </p>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <InfoRow label="Nomor Sertifikat" value={akta.objekTanah.nomorSertifikat} mono />
                  </div>
                  <InfoRow label="NOP (Nomor Objek Pajak)" value={akta.objekTanah.nop} mono />
                  <InfoRow label="Luas Tanah" value={akta.objekTanah.luasTanah ? `${akta.objekTanah.luasTanah} m²` : "—"} />
                  <div className="sm:col-span-2">
                    <InfoRow
                      label="Nilai Transaksi"
                      value={akta.objekTanah.nilaiTransaksi ? `Rp ${akta.objekTanah.nilaiTransaksi}` : "—"}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <InfoRow label="Alamat Objek" value={akta.objekTanah.alamatObjek} />
                  </div>
                </dl>
              </div>
            )}

            {/* Pajak & Biaya */}
            {akta.pajak && (akta.pajak.bphtb || akta.pajak.pph || akta.pajak.honorarium || akta.pajak.bea_materai) && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <span className="text-slate-400">Rp</span> Pajak &amp; Biaya
                </p>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {akta.pajak.bphtb && <InfoRow label="BPHTB" value={`Rp ${akta.pajak.bphtb} (${akta.pajak.bphtbStatus})`} />}
                  {akta.pajak.pph && <InfoRow label="PPh" value={`Rp ${akta.pajak.pph} (${akta.pajak.pphStatus})`} />}
                  {akta.pajak.bea_materai && <InfoRow label="Bea Materai" value={`Rp ${akta.pajak.bea_materai}`} />}
                  {akta.pajak.honorarium && <InfoRow label="Honorarium" value={`Rp ${akta.pajak.honorarium}`} />}
                  {akta.pajak.biayaLain && <InfoRow label="Biaya Lain" value={`Rp ${akta.pajak.biayaLain}`} />}
                  {akta.pajak.catatanPajak && (
                    <div className="col-span-2 sm:col-span-3">
                      <InfoRow label="Catatan Pajak" value={akta.pajak.catatanPajak} />
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Dokumen Pendukung */}
            {akta.dokumen && akta.dokumen.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <FileText size={14} /> Dokumen Pendukung
                  <span className="ml-auto text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    {akta.dokumen.filter(d=>d.status==="ada").length} Ada
                  </span>
                  {akta.dokumen.filter(d=>d.status==="belum").length > 0 && (
                    <span className="text-xs font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                      {akta.dokumen.filter(d=>d.status==="belum").length} Belum
                    </span>
                  )}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 border border-slate-100">No</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 border border-slate-100">Nama Dokumen</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 border border-slate-100">Jenis</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 border border-slate-100">Nomor</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 border border-slate-100">Status</th>
                        <th className="text-left px-3 py-2 font-semibold text-slate-500 border border-slate-100">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {akta.dokumen.map((d,i) => (
                        <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-400 text-center border border-slate-100">{i+1}</td>
                          <td className="px-3 py-2 font-semibold text-slate-800 border border-slate-100">{d.nama}</td>
                          <td className="px-3 py-2 text-slate-600 border border-slate-100">{d.jenis}</td>
                          <td className="px-3 py-2 font-mono text-slate-600 border border-slate-100">{d.nomor||"—"}</td>
                          <td className="px-3 py-2 border border-slate-100">
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              d.status==="ada"?"bg-green-50 text-green-700":
                              d.status==="belum"?"bg-red-50 text-red-700":
                              "bg-slate-50 text-slate-500"
                            }`}>
                              {d.status==="ada"?"Ada":d.status==="belum"?"Belum":"Tidak Perlu"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-500 border border-slate-100">{d.keterangan||"—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Catatan */}
            {akta.catatan && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <StickyNote size={14} /> Catatan Internal
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{akta.catatan}</p>
              </div>
            )}
          </div>

          {/* RIGHT: Workflow + Meta */}
          <div className="space-y-5">
            {/* Workflow Tracker */}
            <div
              className={`bg-white rounded-xl border p-5 shadow-sm ${
                isPPAT ? "border-orange-200" : "border-blue-200"
              }`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-2 ${
                  isPPAT ? "text-orange-600" : "text-blue-700"
                }`}
              >
                <Layers size={14} />
                Alur Kerja {isPPAT ? "PPAT" : "Notariil"}
              </p>
              <WorkflowTracker
                tipe={akta.tipeAkta}
                workflowPPAT={akta.workflowPPAT}
                workflowNotaris={akta.workflowNotaris}
                onUpdate={handleWorkflowUpdate}
                readonly={false}
              />
            </div>

            {/* Meta info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar size={14} /> Informasi Sistem
              </p>
              <dl className="space-y-3">
                <InfoRow label="ID Akta" value={akta.id} mono />
                <InfoRow label="Dibuat pada" value={formatDateTime(akta.createdAt)} />
                <InfoRow label="Terakhir diperbarui" value={formatDateTime(akta.updatedAt)} />
              </dl>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Aksi Cepat</p>
              <div className="space-y-2">
                <Link
                  href={`/akta/${akta.id}/edit`}
                  className="flex items-center gap-2 w-full text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
                >
                  <Edit3 size={14} />
                  Edit Akta
                </Link>
                <button
                  onClick={() => setShowPrint(true)}
                  className="flex items-center gap-2 w-full text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition no-print"
                >
                  <Printer size={14} />
                  Cetak / Preview PDF
                </button>
                <Link
                  href="/akta/baru"
                  className="flex items-center gap-2 w-full text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-2 rounded-lg transition"
                >
                  <Hash size={14} />
                  Input Akta Baru
                </Link>
                <Link
                  href="/akta"
                  className="flex items-center gap-2 w-full text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg transition"
                >
                  <Landmark size={14} />
                  Kembali ke Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
    </>
  )
}
