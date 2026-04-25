"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  PlusCircle,
  Scale,
  MapPin,
  ArrowRight,
  Filter,
  FileText,
  Trash2,
  Edit3,
} from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { StatusBadge, TipeBadge } from "@/components/StatusBadge"
import AuthGuard from "@/components/AuthGuard"
import { aktaService } from "@/lib/storage"
import { useAuth } from "@/lib/AuthContext"
import type { Akta, TipeAkta, StatusUmum } from "@/lib/types"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function DaftarAktaPage() {
  const { session } = useAuth()
  const [allAkta, setAllAkta]           = useState<Akta[]>([])
  const [query, setQuery]               = useState("")
  const [filterTipe, setFilterTipe]     = useState<TipeAkta | "SEMUA">("SEMUA")
  const [filterStatus, setFilterStatus] = useState<StatusUmum | "SEMUA">("SEMUA")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    aktaService.init()
    setAllAkta(aktaService.getAll())
  }, [])

  function handleDelete(id: string) {
    aktaService.delete(id)
    setAllAkta(aktaService.getAll())
    setConfirmDeleteId(null)
  }

  const filtered = useMemo(() => {
    let data = query.trim() ? aktaService.search(query) : allAkta
    if (filterTipe !== "SEMUA") data = data.filter((a) => a.tipeAkta === filterTipe)
    if (filterStatus !== "SEMUA") data = data.filter((a) => a.statusUmum === filterStatus)
    return data
  }, [allAkta, query, filterTipe, filterStatus])

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Buku Daftar Akta</h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {allAkta.length > 0
                  ? `${allAkta.length} akta tercatat${session ? ` — ${session.namaLengkap}` : ""}`
                  : "Belum ada akta"}
              </p>
            </div>
            <Link
              href="/akta/baru"
              className="flex items-center gap-2 bg-white text-blue-800 text-sm font-bold px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition whitespace-nowrap flex-shrink-0"
            >
              <PlusCircle size={16} />
              Input Akta Baru
            </Link>
          </div>
        </div>

        <div className="px-8 py-6 space-y-4 animate-fade-in">
          {/* Search & filter bar */}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nomor, perihal, nama pihak, NOP, sertifikat..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value as TipeAkta | "SEMUA")}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="SEMUA">Semua Tipe</option>
                <option value="NOTARIIL">Notariil</option>
                <option value="PPAT">PPAT</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as StatusUmum | "SEMUA")}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="Proses">Proses</option>
                <option value="Selesai">Selesai</option>
                <option value="Tertunda">Tertunda</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center px-6">
                {allAkta.length === 0 ? (
                  /* Belum ada akta sama sekali */
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                      <FileText size={28} className="text-blue-300" />
                    </div>
                    <p className="text-base font-bold text-slate-600 mb-1">Buku Daftar Akta Masih Kosong</p>
                    <p className="text-xs text-slate-400 mb-5 max-w-xs mx-auto">
                      Belum ada akta yang diinput. Mulai catat akta Notariil atau PPAT pertama Anda sekarang.
                    </p>
                    <Link
                      href="/akta/baru"
                      className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow transition"
                    >
                      <PlusCircle size={16} />
                      Input Akta Pertama
                    </Link>
                  </>
                ) : (
                  /* Ada akta tapi filter tidak cocok */
                  <>
                    <FileText size={36} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Tidak ada akta yang cocok</p>
                    <p className="text-xs text-slate-300 mt-1">Coba ubah filter atau kata kunci pencarian</p>
                    <button
                      onClick={() => { setQuery(""); setFilterTipe("SEMUA"); setFilterStatus("SEMUA") }}
                      className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                      Reset semua filter
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-5 py-3">Tipe</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">No. Akta</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Tanggal</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Kategori</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Perihal</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Para Pihak</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Status</th>
                      <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide px-3 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((akta) => (
                      <tr
                        key={akta.id}
                        className={`hover:bg-slate-50 transition group ${
                          confirmDeleteId === akta.id ? "bg-red-50 hover:bg-red-50" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-7 h-7 rounded-md flex items-center justify-center ${
                                akta.tipeAkta === "PPAT"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {akta.tipeAkta === "PPAT" ? <MapPin size={13} /> : <Scale size={13} />}
                            </div>
                            <TipeBadge tipe={akta.tipeAkta} size="sm" />
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {akta.nomorAkta}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(akta.tanggalAkta)}
                        </td>
                        <td className="px-3 py-3.5 text-xs text-slate-600 max-w-[140px]">
                          <span className="truncate block">{akta.kategori}</span>
                        </td>
                        <td className="px-3 py-3.5 max-w-[200px]">
                          <p className="text-xs font-medium text-slate-800 truncate">{akta.perihal}</p>
                          {akta.objekTanah?.nomorSertifikat && (
                            <p className="text-[10px] text-orange-600 mt-0.5 truncate">
                              {akta.objekTanah.nomorSertifikat}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3.5 max-w-[160px]">
                          <p className="text-xs text-slate-600 truncate">
                            {akta.pihak.map((p) => p.nama).join(", ")}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {akta.pihak.map((p) => p.peran).join(" / ")}
                          </p>
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={akta.statusUmum} size="sm" />
                        </td>
                        {/* ── Kolom Aksi ── */}
                        <td className="px-3 py-3.5">
                          {confirmDeleteId === akta.id ? (
                            /* Mini konfirmasi hapus inline */
                            <div className="flex items-center gap-1.5 animate-fade-in">
                              <span className="text-[10px] font-semibold text-red-600 whitespace-nowrap">Hapus?</span>
                              <button
                                onClick={() => handleDelete(akta.id)}
                                className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md transition"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-[10px] font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-2 py-1 rounded-md transition"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            /* Tombol-tombol aksi normal */
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                              <Link
                                href={`/akta/${akta.id}`}
                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition whitespace-nowrap"
                              >
                                Detail <ArrowRight size={11} />
                              </Link>
                              <Link
                                href={`/akta/${akta.id}/edit`}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition"
                              >
                                <Edit3 size={11} />
                              </Link>
                              <button
                                onClick={() => setConfirmDeleteId(akta.id)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                {/* Footer: row count */}
                <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Menampilkan <span className="font-semibold text-slate-600">{filtered.length}</span> dari{" "}
                    <span className="font-semibold text-slate-600">{allAkta.length}</span> akta
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
                      Notariil: {filtered.filter(a => a.tipeAkta === "NOTARIIL").length}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm bg-orange-500 inline-block" />
                      PPAT: {filtered.filter(a => a.tipeAkta === "PPAT").length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
