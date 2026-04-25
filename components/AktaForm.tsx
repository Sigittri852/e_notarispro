"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Scale, MapPin, PlusCircle, Trash2, Save, ArrowLeft,
  Info, FileText, ChevronDown, CheckCircle2,
  Printer, Users, Calculator,
  ChevronUp, AlertCircle, X,
} from "lucide-react"
import type {
  TipeAkta, KategoriNotaris, KategoriPPAT,
  Pihak, ObjekTanah, Akta, StatusUmum,
  DokumenPendukung, DataPajak, Saksi,
} from "@/lib/types"
import { defaultWorkflowNotaris, defaultWorkflowPPAT } from "@/lib/types"
import { aktaService } from "@/lib/storage"
import { getKantor, getAlamatLengkap, type ProfilKantor } from "@/lib/kantor"

// ─── Constants ────────────────────────────────────────────────────────────────

const KATEGORI_NOTARIS: KategoriNotaris[] = [
  "Akta Jual Beli","Akta Hibah","Akta Wasiat","Akta Pendirian PT",
  "Akta Pendirian CV","Akta Pendirian Yayasan","Akta Kuasa",
  "Akta Perjanjian","Akta Keterangan Waris","SKMHT","APHT","Lainnya (Notaris)",
]
const KATEGORI_PPAT: KategoriPPAT[] = [
  "AJB (Akta Jual Beli)","APHB (Akta Pemberian Hak Bangunan)",
  "Akta Hibah PPAT","APHT (Akta Pemberian Hak Tanggungan)",
  "Akta Tukar Menukar","Akta Pembagian Hak Bersama",
  "Akta Pemasukan Dalam Perusahaan","Akta Pemisahan Hak Milik","Lainnya (PPAT)",
]
const STATUS_OPTIONS: StatusUmum[] = ["Proses","Selesai","Tertunda","Dibatalkan"]
const JENIS_DOKUMEN = ["Identitas","Sertifikat","Pajak","Akta/SK","Perjanjian","Lainnya"]
const STATUS_DOKUMEN: DokumenPendukung["status"][] = ["ada","belum","tidak_diperlukan"]
const STATUS_PAJAK: ("belum"|"proses"|"lunas")[] = ["belum","proses","lunas"]

const EMPTY_PIHAK: Pihak = {
  nama:"", nik:"", peran:"", alamat:"",
  tempatLahir:"", tanggalLahir:"", kewarganegaraan:"WNI", pekerjaan:"",
}
const EMPTY_SAKSI: Saksi = { nama:"", nik:"", alamat:"", pekerjaan:"" }
const EMPTY_OBJEK: ObjekTanah = {
  nomorSertifikat:"", nop:"", luasTanah:"", alamatObjek:"",
  nilaiTransaksi:"", jenisTanah:"", kelasTanah:"",
}
const EMPTY_PAJAK: DataPajak = {
  bphtb:"", bphtbStatus:"belum", pph:"", pphStatus:"belum",
  bea_materai:"", honorarium:"", biayaLain:"", catatanPajak:"",
}

function uid() {
  return `dok-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
}
function newDok(): DokumenPendukung {
  return { id:uid(), nama:"", jenis:"Identitas", nomor:"", keterangan:"", status:"belum" }
}

function defaultDokumen(tipe: TipeAkta, kategori: string): DokumenPendukung[] {
  const mk = (nama: string, jenis: string): DokumenPendukung =>
    ({ id:uid(), nama, jenis, nomor:"", keterangan:"", status:"belum" })
  const base = [
    mk("KTP Asli Pihak I","Identitas"),
    mk("KTP Asli Pihak II","Identitas"),
    mk("Kartu Keluarga","Identitas"),
  ]
  if (tipe === "PPAT") {
    base.push(
      mk("Sertifikat Asli","Sertifikat"),
      mk("SPPT PBB Tahun Berjalan","Pajak"),
      mk("Bukti Pelunasan BPHTB","Pajak"),
      mk("Bukti Pelunasan PPh","Pajak"),
      mk("IMB / PBG","Akta/SK"),
    )
  } else {
    if (kategori.includes("PT") || kategori.includes("CV"))
      base.push(
        mk("Akta Pendirian / Perubahan","Akta/SK"),
        mk("SK Kemenkumham","Akta/SK"),
        mk("NPWP Perusahaan","Identitas"),
      )
    if (kategori.includes("Waris"))
      base.push(
        mk("Surat Kematian Asli","Akta/SK"),
        mk("Akta Kelahiran Ahli Waris","Akta/SK"),
        mk("Akta Nikah (jika berlaku)","Akta/SK"),
      )
  }
  return base
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
// Inject once via <style> tag inside the component render
const FORM_CSS = `
.nf-input {
  width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; padding: 8px 12px; font-size: 14px; color: #1e293b;
  outline: none; font-family: inherit; box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.nf-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.nf-input.error { border-color: #f87171; }
.nf-input.error:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.15); }
.nf-input.mono { font-family: monospace; }
.nf-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
.nf-label {
  display: block; font-size: 11px; font-weight: 700;
  color: #475569; margin-bottom: 4px; letter-spacing: 0.02em;
}
.nf-error { font-size: 11px; color: #ef4444; margin-top: 3px; font-weight: 600; }
.nf-card {
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.nf-card-head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 18px; cursor: pointer; user-select: none;
  font-size: 13px; font-weight: 700; color: #334155;
  border-bottom: 1px solid transparent;
  transition: background 0.1s;
}
.nf-card-head:hover { background: #f8fafc; }
.nf-card-head.open { border-bottom-color: #f1f5f9; }
.nf-card-body { padding: 16px 18px; }
.nf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.nf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.nf-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; }
@media (max-width: 640px) {
  .nf-grid-2, .nf-grid-3, .nf-grid-4 { grid-template-columns: 1fr; }
}
.nf-add-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 700; color: #2563eb;
  background: #eff6ff; border: 1px solid #bfdbfe;
  border-radius: 7px; padding: 5px 11px;
  cursor: pointer; font-family: inherit;
}
.nf-add-btn:hover { background: #dbeafe; }
.nf-del-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #fecaca; background: #fff5f5;
  color: #ef4444; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-family: inherit;
}
.nf-del-btn:hover { background: #fee2e2; }
.nf-pihak-card {
  border: 1px solid #e2e8f0; border-radius: 10px;
  overflow: hidden; background: #f8fafc;
}
.nf-pihak-head {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; cursor: pointer;
  background: #f8fafc;
}
.nf-pihak-body { padding: 14px; background: #fff; border-top: 1px solid #f1f5f9; }
.nf-spin {
  width: 13px; height: 13px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
.nf-tipe-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 12px; border-radius: 12px; border: 2px solid #e2e8f0;
  background: #fff; cursor: pointer; transition: all 0.15s; font-family: inherit;
  flex: 1;
}
.nf-tipe-btn:hover { border-color: #94a3b8; }
.status-badge {
  display: inline-block; font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 99px;
}
`

// ─── Print Preview Modal ───────────────────────────────────────────────────────

interface PrintData {
  tipeAkta: TipeAkta; nomorAkta: string; tanggalAkta: string
  perihal: string; kategori: string; pihak: Pihak[]
  statusUmum: StatusUmum; saksi?: Saksi[]
  objekTanah?: ObjekTanah; dokumen?: DokumenPendukung[]
  pajak?: DataPajak; catatan?: string; lokasiKantor?: string
}

function PrintPreviewModal({ akta, onClose }: { akta: PrintData; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null)

  const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("id-ID", {
      weekday:"long", day:"2-digit", month:"long", year:"numeric",
    }) : "—"

  function handlePrint() {
    if (!printRef.current) return
    const html = printRef.current.innerHTML
    const prev = document.getElementById("__nf_print__")
    if (prev) prev.remove()
    const frame = document.createElement("iframe")
    frame.id = "__nf_print__"
    frame.setAttribute("style",
      "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:0;")
    document.body.appendChild(frame)
    const win = frame.contentWindow
    if (!win) return
    win.document.open()
    win.document.write(`<!DOCTYPE html><html lang="id"><head>
<meta charset="utf-8">
<title>Akta ${akta.nomorAkta}</title>
<style>
@page{size:A4 portrait;margin:2.5cm 3cm 2cm 3cm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Times New Roman',serif;font-size:12pt;color:#000;line-height:1.7}
.kop{text-align:center;border-bottom:3px double #000;padding-bottom:10pt;margin-bottom:14pt}
.kn{font-size:15pt;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px}
.ks{font-size:10.5pt;margin-top:2pt}
.judul{text-align:center;margin:18pt 0 12pt}
.judul h2{font-size:13pt;font-weight:bold;text-transform:uppercase;text-decoration:underline;letter-spacing:2px}
.judul p{font-size:12pt;margin-top:3pt}
.sec{margin-bottom:14pt}
.sec-h{font-size:11pt;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #000;padding-bottom:3pt;margin-bottom:8pt}
.row{display:flex;margin-bottom:3pt;font-size:11pt}
.rl{min-width:180pt;font-weight:bold}
.rv{flex:1}
table{width:100%;border-collapse:collapse;font-size:11pt;margin-top:6pt}
th{background:#f0f0f0;text-align:left;padding:5pt 7pt;font-weight:bold;border:1px solid #888}
td{padding:5pt 7pt;border:1px solid #888;vertical-align:top}
tr:nth-child(even) td{background:#fafafa}
.sg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 20pt;margin-top:44pt}
.sl{font-size:11pt;font-weight:bold;margin-bottom:56pt;text-align:center}
.sn{border-top:1px solid #000;padding-top:4pt;font-size:11pt;font-weight:bold;text-align:center}
.ft{margin-top:28pt;border-top:1px solid #ccc;padding-top:6pt;text-align:center;font-size:9pt;color:#555}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head><body>${html}</body></html>`)
    win.document.close()
    setTimeout(() => {
      win.focus()
      win.print()
      setTimeout(() => frame.remove(), 2000)
    }, 400)
  }

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(15,23,42,0.8)", zIndex:9999,
      display:"flex", flexDirection:"column", alignItems:"center",
      overflowY:"auto", padding:"20px 16px 40px",
    }}>
      {/* Toolbar */}
      <div style={{
        width:"100%", maxWidth:820, display:"flex",
        justifyContent:"space-between", alignItems:"center", marginBottom:14,
      }}>
        <p style={{ color:"#fff", fontSize:14, fontWeight:700 }}>
          Preview Cetak — Akta No. {akta.nomorAkta || "(belum diisi)"}
        </p>
        <div style={{ display:"flex", gap:8 }}>
          <button type="button" onClick={handlePrint} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 18px",
            borderRadius:8, border:"none", background:"#2563eb", color:"#fff",
            fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          }}>
            <Printer size={14} /> Cetak / PDF
          </button>
          <button type="button" onClick={onClose} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
            borderRadius:8, border:"1.5px solid rgba(255,255,255,0.3)",
            background:"transparent", color:"#fff",
            fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
          }}>
            <X size={14} /> Tutup
          </button>
        </div>
      </div>

      {/* A4 Paper preview */}
      <div ref={printRef} style={{
        width:820, background:"#fff", padding:"72px 88px",
        boxShadow:"0 8px 40px rgba(0,0,0,0.35)",
        fontFamily:"'Times New Roman', serif", fontSize:12,
        color:"#000", lineHeight:1.7, minHeight:1120,
      }}>
        {/* Kop */}
        <div className="kop" style={{
          textAlign:"center", borderBottom:"3px double #000",
          paddingBottom:10, marginBottom:14,
        }}>
          <div className="kn" style={{
            fontSize:15, fontWeight:"bold",
            textTransform:"uppercase", letterSpacing:1.5,
          }}>
            KANTOR NOTARIS / PPAT
          </div>
          <div className="ks" style={{ fontSize:10.5, marginTop:2 }}>
            {akta.lokasiKantor || "Jakarta"} &bull; Telp. (021) 000-0000
          </div>
        </div>

        {/* Judul */}
        <div style={{ textAlign:"center", margin:"18px 0 14px" }}>
          <h2 style={{
            fontSize:13, fontWeight:"bold",
            textTransform:"uppercase", textDecoration:"underline", letterSpacing:2,
          }}>
            {akta.tipeAkta === "PPAT" ? "AKTA PPAT" : "AKTA NOTARIIL"}
          </h2>
          <p style={{ fontSize:12, marginTop:3 }}>Nomor: {akta.nomorAkta}</p>
        </div>

        {/* I. Data Utama */}
        <div style={{ marginBottom:14 }}>
          <div style={{
            fontSize:11, fontWeight:"bold", textTransform:"uppercase",
            borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
          }}>I. Data Utama Akta</div>
          {[
            ["Nomor Akta",       akta.nomorAkta    ],
            ["Tanggal Akta",     fmtDate(akta.tanggalAkta)],
            ["Jenis / Kategori", akta.kategori     ],
            ["Perihal",          akta.perihal      ],
            ["Status",           akta.statusUmum   ],
            ["Lokasi",           akta.lokasiKantor || "—"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", marginBottom:3, fontSize:11 }}>
              <span style={{ minWidth:180, fontWeight:"bold" }}>{k}</span>
              <span style={{ flex:1 }}>: {v}</span>
            </div>
          ))}
        </div>

        {/* II. Para Pihak */}
        <div style={{ marginBottom:14 }}>
          <div style={{
            fontSize:11, fontWeight:"bold", textTransform:"uppercase",
            borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
          }}>II. Para Pihak</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr>
                {["No","Nama Lengkap","NIK / ID","Peran","Tempat/Tgl Lahir","Pekerjaan"].map(h => (
                  <th key={h} style={{
                    background:"#f0f0f0", textAlign:"left",
                    padding:"5px 7px", border:"1px solid #888",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {akta.pihak.map((p, i) => (
                <tr key={i} style={{ background: i%2?"#fafafa":"#fff" }}>
                  <td style={{ padding:"5px 7px", border:"1px solid #888", textAlign:"center" }}>{i+1}</td>
                  <td style={{ padding:"5px 7px", border:"1px solid #888", fontWeight:"bold" }}>{p.nama}</td>
                  <td style={{ padding:"5px 7px", border:"1px solid #888", fontFamily:"monospace" }}>{p.nik||"—"}</td>
                  <td style={{ padding:"5px 7px", border:"1px solid #888" }}>{p.peran||"—"}</td>
                  <td style={{ padding:"5px 7px", border:"1px solid #888" }}>
                    {p.tempatLahir||"—"}
                    {p.tanggalLahir ? `, ${new Date(p.tanggalLahir).toLocaleDateString("id-ID")}` : ""}
                  </td>
                  <td style={{ padding:"5px 7px", border:"1px solid #888" }}>{p.pekerjaan||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* III. Saksi */}
        {(akta.saksi ?? []).length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{
              fontSize:11, fontWeight:"bold", textTransform:"uppercase",
              borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
            }}>III. Saksi-Saksi</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead>
                <tr>
                  {["No","Nama","NIK","Pekerjaan","Alamat"].map(h => (
                    <th key={h} style={{ background:"#f0f0f0", textAlign:"left", padding:"5px 7px", border:"1px solid #888" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(akta.saksi ?? []).map((s, i) => (
                  <tr key={i} style={{ background: i%2?"#fafafa":"#fff" }}>
                    <td style={{ padding:"5px 7px", border:"1px solid #888", textAlign:"center" }}>{i+1}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888", fontWeight:"bold" }}>{s.nama}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888", fontFamily:"monospace" }}>{s.nik||"—"}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888" }}>{s.pekerjaan||"—"}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888" }}>{s.alamat||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* IV. Objek Tanah (PPAT) */}
        {akta.tipeAkta === "PPAT" && akta.objekTanah && (
          <div style={{ marginBottom:14 }}>
            <div style={{
              fontSize:11, fontWeight:"bold", textTransform:"uppercase",
              borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
            }}>IV. Objek Tanah</div>
            {[
              ["No. Sertifikat",  akta.objekTanah.nomorSertifikat ],
              ["NOP",             akta.objekTanah.nop              ],
              ["Luas Tanah",      akta.objekTanah.luasTanah ? `${akta.objekTanah.luasTanah} m²` : "—"],
              ["Jenis Tanah",     akta.objekTanah.jenisTanah || "—"],
              ["Nilai Transaksi", akta.objekTanah.nilaiTransaksi ? `Rp ${akta.objekTanah.nilaiTransaksi}` : "—"],
              ["Alamat Objek",    akta.objekTanah.alamatObjek      ],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", marginBottom:3, fontSize:11 }}>
                <span style={{ minWidth:180, fontWeight:"bold" }}>{k}</span>
                <span style={{ flex:1 }}>: {v}</span>
              </div>
            ))}
          </div>
        )}

        {/* V. Pajak */}
        {akta.pajak && (akta.pajak.bphtb||akta.pajak.pph||akta.pajak.honorarium||akta.pajak.bea_materai) && (
          <div style={{ marginBottom:14 }}>
            <div style={{
              fontSize:11, fontWeight:"bold", textTransform:"uppercase",
              borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
            }}>V. Pajak &amp; Biaya</div>
            {([
              akta.pajak.bphtb     && ["BPHTB",        `Rp ${akta.pajak.bphtb} — ${akta.pajak.bphtbStatus}`],
              akta.pajak.pph       && ["PPh",           `Rp ${akta.pajak.pph} — ${akta.pajak.pphStatus}`],
              akta.pajak.bea_materai && ["Bea Materai", `Rp ${akta.pajak.bea_materai}`],
              akta.pajak.honorarium  && ["Honorarium",  `Rp ${akta.pajak.honorarium}`],
              akta.pajak.biayaLain   && ["Biaya Lain",  `Rp ${akta.pajak.biayaLain}`],
            ] as (string[]|false)[]).filter(Boolean).map((row) => {
              const [k,v] = row as string[]
              return (
                <div key={k} style={{ display:"flex", marginBottom:3, fontSize:11 }}>
                  <span style={{ minWidth:180, fontWeight:"bold" }}>{k}</span>
                  <span style={{ flex:1 }}>: {v}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* VI. Dokumen */}
        {(akta.dokumen ?? []).length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{
              fontSize:11, fontWeight:"bold", textTransform:"uppercase",
              borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
            }}>VI. Checklist Dokumen Pendukung</div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead>
                <tr>
                  {["No","Nama Dokumen","Jenis","Nomor","Status","Keterangan"].map(h => (
                    <th key={h} style={{ background:"#f0f0f0", textAlign:"left", padding:"5px 7px", border:"1px solid #888" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(akta.dokumen ?? []).map((d, i) => (
                  <tr key={d.id} style={{ background: i%2?"#fafafa":"#fff" }}>
                    <td style={{ padding:"5px 7px", border:"1px solid #888", textAlign:"center" }}>{i+1}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888", fontWeight:"bold" }}>{d.nama}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888" }}>{d.jenis}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888", fontFamily:"monospace" }}>{d.nomor||"—"}</td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888" }}>
                      {d.status==="ada"?"Ada":d.status==="belum"?"Belum":"Tidak Perlu"}
                    </td>
                    <td style={{ padding:"5px 7px", border:"1px solid #888" }}>{d.keterangan||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Catatan */}
        {akta.catatan && (
          <div style={{ marginBottom:14 }}>
            <div style={{
              fontSize:11, fontWeight:"bold", textTransform:"uppercase",
              borderBottom:"1px solid #000", paddingBottom:3, marginBottom:8,
            }}>VII. Catatan</div>
            <p style={{ fontSize:11 }}>{akta.catatan}</p>
          </div>
        )}

        {/* TTD */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0 20px", marginTop:44 }}>
          {["Pihak I","Pihak II","Notaris / PPAT"].map((lbl, i) => (
            <div key={lbl} style={{ textAlign:"center" }}>
              <p style={{ fontSize:11, fontWeight:"bold", marginBottom:56 }}>{lbl}</p>
              <div style={{ borderTop:"1px solid #000", paddingTop:4 }}>
                <p style={{ fontSize:11, fontWeight:"bold" }}>
                  {i < akta.pihak.length ? akta.pihak[i]?.nama : "(Nama Notaris)"}
                </p>
                {i < akta.pihak.length && akta.pihak[i]?.nik && (
                  <p style={{ fontSize:10 }}>NIK: {akta.pihak[i].nik}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop:28, borderTop:"1px solid #ccc", paddingTop:6,
          textAlign:"center", fontSize:9, color:"#555",
        }}>
          Dicetak dari e-NotarisKu Pro &bull; {new Date().toLocaleString("id-ID")} &bull; RAHASIA
        </div>
      </div>
    </div>
  )
}

// ─── Collapsible Section ───────────────────────────────────────────────────────

function Section({
  title, icon, defaultOpen = true, badge, accentOrange = false, children,
}: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean
  badge?: React.ReactNode; accentOrange?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="nf-card" style={accentOrange ? { borderColor:"#fed7aa" } : undefined}>
      <div
        className={`nf-card-head${open?" open":""}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key==="Enter"||e.key===" ") setOpen(o=>!o) }}
        style={accentOrange ? { color:"#9a3412" } : undefined}
      >
        {icon}
        <span style={{ flex:1 }}>{title}</span>
        {badge}
        {open
          ? <ChevronUp size={14} color="#94a3b8" />
          : <ChevronDown size={14} color="#94a3b8" />}
      </div>
      {open && <div className="nf-card-body">{children}</div>}
    </div>
  )
}

// ─── Main AktaForm ─────────────────────────────────────────────────────────────

interface AktaFormProps {
  initial?: Akta
  mode?: "create" | "edit"
}

export default function AktaForm({ initial, mode = "create" }: AktaFormProps) {
  const router = useRouter()
  const [kantor, setKantor] = useState<ProfilKantor | null>(null)
  useEffect(() => { setKantor(getKantor()) }, [])

  // Core field state
  const [tipe,         setTipe]     = useState<TipeAkta>(initial?.tipeAkta   ?? "NOTARIIL")
  const [kategori,     setKategori] = useState(initial?.kategori              ?? "")
  const [nomorAkta,    setNomor]    = useState(initial?.nomorAkta             ?? "")
  const [tanggal,      setTanggal]  = useState(
    initial?.tanggalAkta ?? new Date().toISOString().slice(0,10)
  )
  const [perihal,      setPerihal]  = useState(initial?.perihal               ?? "")
  const [status,       setStatus]   = useState<StatusUmum>(initial?.statusUmum ?? "Proses")
  const [lokasiKantor, setLokasi]   = useState(initial?.lokasiKantor          ?? "")

  const [pihak,        setPihak]    = useState<Pihak[]>(
    initial?.pihak?.length ? initial.pihak : [{ ...EMPTY_PIHAK }]
  )
  const [expandedPihak, setExpandedPihak] = useState<Record<number,boolean>>({0:true})
  const [saksi,        setSaksi]    = useState<Saksi[]>(initial?.saksi          ?? [])
  const [objek,        setObjek]    = useState<ObjekTanah>(initial?.objekTanah ?? { ...EMPTY_OBJEK })
  const [dokumen,      setDokumen]  = useState<DokumenPendukung[]>(initial?.dokumen ?? [])
  const [pajak,        setPajak]    = useState<DataPajak>(initial?.pajak        ?? { ...EMPTY_PAJAK })
  const [catatan,      setCatatan]  = useState(initial?.catatan                 ?? "")

  // UI state
  const [saving,       setSaving]   = useState(false)
  const [saved,        setSaved]    = useState(false)
  const [errors,       setErrors]   = useState<Record<string,string>>({})
  const [submitError,  setSubmitErr]= useState("")
  const [showPreview,  setShowPrev] = useState(false)

  // ── Handlers ────────────────────────────────────────────────────────────

  function onTipeChange(t: TipeAkta) {
    setTipe(t); setKategori(""); setDokumen([])
  }
  function onKategoriChange(k: string) {
    setKategori(k)
    if (k && dokumen.length === 0) setDokumen(defaultDokumen(tipe, k))
  }

  // Pihak
  function addPihak()  { setPihak(p => [...p, { ...EMPTY_PIHAK }]); setExpandedPihak(e => ({ ...e, [pihak.length]:true })) }
  function delPihak(i: number) { setPihak(p => p.filter((_,idx) => idx!==i)) }
  function updPihak(i: number, f: keyof Pihak, v: string) {
    setPihak(p => p.map((x,idx) => idx===i ? { ...x, [f]:v } : x))
  }
  function togglePihak(i: number) {
    setExpandedPihak(e => ({ ...e, [i]:!e[i] }))
  }

  // Saksi
  function addSaksi()  { setSaksi(s => [...s, { ...EMPTY_SAKSI }]) }
  function delSaksi(i: number) { setSaksi(s => s.filter((_,idx) => idx!==i)) }
  function updSaksi(i: number, f: keyof Saksi, v: string) {
    setSaksi(s => s.map((x,idx) => idx===i ? { ...x, [f]:v } : x))
  }

  // Dokumen
  function addDok()  { setDokumen(d => [...d, newDok()]) }
  function delDok(id: string) { setDokumen(d => d.filter(x => x.id!==id)) }
  function updDok(id: string, f: keyof DokumenPendukung, v: string) {
    setDokumen(d => d.map(x => x.id===id ? { ...x, [f]:v } : x))
  }

  // ── Validate ────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string,string> = {}
    if (!nomorAkta.trim()) errs.nomorAkta = "Nomor akta wajib diisi"
    if (!kategori)         errs.kategori  = "Pilih kategori akta"
    if (!perihal.trim())   errs.perihal   = "Perihal wajib diisi"
    if (!tanggal)          errs.tanggal   = "Tanggal wajib diisi"
    if (pihak.some(p => !p.nama.trim())) errs.pihak = "Nama semua pihak wajib diisi"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitErr("")
    if (!validate()) return
    setSaving(true)

    const payload = {
      tipeAkta:     tipe,
      kategori:     kategori as KategoriNotaris | KategoriPPAT,
      nomorAkta:    nomorAkta.trim(),
      tanggalAkta:  tanggal,
      perihal:      perihal.trim(),
      statusUmum:   status,
      lokasiKantor: lokasiKantor.trim(),
      pihak: pihak.map(p => ({
        nama: p.nama.trim(), nik: p.nik.trim(), peran: p.peran.trim(),
        alamat: p.alamat?.trim()||"", tempatLahir: p.tempatLahir?.trim()||"",
        tanggalLahir: p.tanggalLahir||"",
        kewarganegaraan: p.kewarganegaraan?.trim()||"WNI",
        pekerjaan: p.pekerjaan?.trim()||"",
      })),
      saksi: saksi.length
        ? saksi.map(s => ({
            nama: s.nama.trim(), nik: s.nik.trim(),
            alamat: s.alamat?.trim()||"", pekerjaan: s.pekerjaan?.trim()||"",
          }))
        : undefined,
      objekTanah:      tipe==="PPAT" ? objek : undefined,
      dokumen:         dokumen.length ? dokumen : undefined,
      pajak:           Object.values(pajak).some(Boolean) ? pajak : undefined,
      workflowPPAT:    tipe==="PPAT"
        ? (initial?.workflowPPAT    ?? defaultWorkflowPPAT)    : undefined,
      workflowNotaris: tipe==="NOTARIIL"
        ? (initial?.workflowNotaris ?? defaultWorkflowNotaris) : undefined,
      catatan: catatan.trim(),
    }

    try {
      if (mode==="edit" && initial) {
        const updated = aktaService.update(initial.id, payload)
        if (!updated) throw new Error("Gagal menyimpan perubahan.")
        setSaved(true)
        setTimeout(() => router.push(`/akta/${initial.id}`), 800)
      } else {
        const created = aktaService.create(payload)
        setSaved(true)
        setTimeout(() => router.push(`/akta/${created.id}`), 800)
      }
    } catch (err: unknown) {
      setSaving(false)
      setSubmitErr(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.")
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────

  const isPPAT   = tipe === "PPAT"
  const accent   = isPPAT ? "#ea580c" : "#2563eb"
  const dokAda   = dokumen.filter(d => d.status==="ada").length
  const dokBelum = dokumen.filter(d => d.status==="belum").length

  const previewData: PrintData = {
    tipeAkta: tipe, kategori, nomorAkta, tanggalAkta: tanggal, perihal,
    statusUmum: status, pihak, saksi, objekTanah: isPPAT ? objek : undefined,
    dokumen, pajak, catatan, lokasiKantor,
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Inject CSS once */}
      <style>{FORM_CSS}</style>

      {showPreview && (
        <PrintPreviewModal akta={previewData} onClose={() => setShowPrev(false)} />
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* Kantor info banner */}
        {kantor && (
          <div style={{
            background: kantor.namaNotaris ? "#f0f9ff" : "#fffbeb",
            border: `1px solid ${kantor.namaNotaris ? "#bae6fd" : "#fde68a"}`,
            borderRadius: 10, padding: "10px 14px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <AlertCircle size={15} color={kantor.namaNotaris ? "#0284c7" : "#d97706"} style={{ flexShrink:0, marginTop:1 }} />
            <div style={{ flex:1 }}>
              {kantor.namaNotaris ? (
                <>
                  <p style={{ fontSize:12, fontWeight:700, color:"#0c4a6e" }}>{kantor.namaKantor}</p>
                  <p style={{ fontSize:11, color:"#0369a1", marginTop:1 }}>
                    {kantor.namaNotaris}
                    {kantor.nomorSK && <> &bull; SK No. {kantor.nomorSK}</>}
                  </p>
                  {getAlamatLengkap(kantor) && (
                    <p style={{ fontSize:11, color:"#0369a1" }}>{getAlamatLengkap(kantor)}</p>
                  )}
                </>
              ) : (
                <p style={{ fontSize:12, color:"#92400e" }}>
                  Profil kantor belum diisi.{" "}
                  <a href="/pengaturan/kantor" style={{ fontWeight:700, color:"#b45309", textDecoration:"underline" }}>
                    Lengkapi Profil Kantor
                  </a>{" "}
                  agar kop surat akta tampil dengan benar.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Floating action bar */}
        <div style={{
          display:"flex", justifyContent:"flex-end", gap:8,
          position:"sticky", top:8, zIndex:50,
        }}>
          <button type="button" onClick={() => setShowPrev(true)} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
            borderRadius:9, border:"1.5px solid #e2e8f0", background:"#fff",
            fontSize:12, fontWeight:700, color:"#334155", cursor:"pointer",
            fontFamily:"inherit", boxShadow:"0 2px 8px rgba(0,0,0,0.1)",
          }}>
            <Printer size={13} /> Preview &amp; Cetak
          </button>
          <button type="submit" disabled={saving||saved} style={{
            display:"flex", alignItems:"center", gap:6, padding:"8px 18px",
            borderRadius:9, border:"none",
            background: saved ? "#16a34a" : accent,
            fontSize:12, fontWeight:700, color:"#fff",
            cursor: (saving||saved) ? "not-allowed" : "pointer",
            opacity: saving ? 0.75 : 1,
            fontFamily:"inherit", boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
            transition:"background 0.2s",
          }}>
            {saved
              ? <><CheckCircle2 size={13} /> Tersimpan!</>
              : saving
              ? <><span className="nf-spin" /> Menyimpan...</>
              : <><Save size={13} /> {mode==="edit" ? "Simpan Perubahan" : "Simpan Akta"}</>}
          </button>
        </div>

        {/* ── 1. Tipe Akta ─────────────────────────────────────────────── */}
        <div className="nf-card">
          <div className="nf-card-head open" style={{ cursor:"default" }}>
            <FileText size={14} color="#64748b" />
            <span style={{ flex:1, color:"#334155" }}>Tipe Akta</span>
          </div>
          <div className="nf-card-body">
            <div style={{ display:"flex", gap:12 }}>
              {(["NOTARIIL","PPAT"] as TipeAkta[]).map(t => {
                const active = tipe===t
                const col    = t==="PPAT" ? "#ea580c" : "#2563eb"
                return (
                  <button key={t} type="button" className="nf-tipe-btn"
                    onClick={() => onTipeChange(t)}
                    style={{
                      borderColor: active ? col : "#e2e8f0",
                      background:  active ? (t==="PPAT"?"#fff7ed":"#eff6ff") : "#fff",
                    }}
                  >
                    {t==="PPAT"
                      ? <MapPin  size={26} color={active ? col : "#94a3b8"} />
                      : <Scale   size={26} color={active ? col : "#94a3b8"} />}
                    <div style={{ textAlign:"center" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:active?col:"#64748b" }}>{t}</p>
                      <p style={{ fontSize:10, color:active?col:"#94a3b8", marginTop:2 }}>
                        {t==="PPAT" ? "Akta Tanah & Hak" : "Akta Notaris / PPNS"}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
            {isPPAT && (
              <div style={{
                marginTop:10, display:"flex", gap:8, background:"#fff7ed",
                border:"1px solid #fed7aa", borderRadius:8, padding:"9px 12px",
              }}>
                <Info size={14} color="#ea580c" style={{ flexShrink:0, marginTop:1 }} />
                <p style={{ fontSize:12, color:"#9a3412" }}>
                  Untuk PPAT: wajib mengisi Data Objek Tanah (Sertifikat, NOP, Luas, Alamat, Nilai Transaksi).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Data Utama ─────────────────────────────────────────────── */}
        <Section title="Data Utama Akta" icon={<FileText size={14} color="#64748b" />}>
          <div className="nf-grid-2">
            <div>
              <label className="nf-label">Nomor Akta *</label>
              <input
                className={`nf-input${errors.nomorAkta?" error":""}`}
                value={nomorAkta}
                onChange={e => setNomor(e.target.value)}
                placeholder={isPPAT ? "001/PPAT/VII/2025" : "001/NOT/VII/2025"}
              />
              {errors.nomorAkta && <p className="nf-error">{errors.nomorAkta}</p>}
            </div>
            <div>
              <label className="nf-label">Tanggal Akta *</label>
              <input
                type="date"
                className={`nf-input${errors.tanggal?" error":""}`}
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
              />
              {errors.tanggal && <p className="nf-error">{errors.tanggal}</p>}
            </div>
            <div>
              <label className="nf-label">Kategori *</label>
              <div style={{ position:"relative" }}>
                <select
                  className={`nf-input nf-select${errors.kategori?" error":""}`}
                  value={kategori}
                  onChange={e => onKategoriChange(e.target.value)}
                  style={{ paddingRight:30 }}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {(isPPAT ? KATEGORI_PPAT : KATEGORI_NOTARIS).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <ChevronDown size={13} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              </div>
              {errors.kategori && <p className="nf-error">{errors.kategori}</p>}
            </div>
            <div>
              <label className="nf-label">Status Umum</label>
              <div style={{ position:"relative" }}>
                <select
                  className="nf-input nf-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as StatusUmum)}
                  style={{ paddingRight:30 }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={13} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop:14 }}>
            <label className="nf-label">Perihal / Judul Akta *</label>
            <input
              className={`nf-input${errors.perihal?" error":""}`}
              value={perihal}
              onChange={e => setPerihal(e.target.value)}
              placeholder="Contoh: Jual Beli Tanah SHM No. 1234 di Cibubur"
            />
            {errors.perihal && <p className="nf-error">{errors.perihal}</p>}
          </div>

          <div style={{ marginTop:14 }}>
            <label className="nf-label">Lokasi Kantor</label>
            <input
              className="nf-input"
              value={lokasiKantor}
              onChange={e => setLokasi(e.target.value)}
              placeholder="Jakarta Selatan"
            />
          </div>
        </Section>

        {/* ── 3. Para Pihak ─────────────────────────────────────────────── */}
        <Section
          title="Para Pihak"
          icon={<Users size={14} color="#64748b" />}
          badge={
            <span style={{
              fontSize:11, fontWeight:700, background:"#eff6ff",
              color:"#2563eb", border:"1px solid #bfdbfe",
              borderRadius:99, padding:"1px 8px",
            }}>{pihak.length}</span>
          }
        >
          {errors.pihak && (
            <div style={{
              display:"flex", gap:6, background:"#fef2f2", border:"1px solid #fecaca",
              borderRadius:8, padding:"8px 12px", marginBottom:12,
            }}>
              <AlertCircle size={13} color="#ef4444" />
              <span style={{ fontSize:12, color:"#dc2626", fontWeight:600 }}>{errors.pihak}</span>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {pihak.map((p, i) => (
              <div key={i} className="nf-pihak-card">
                <div className="nf-pihak-head" onClick={() => togglePihak(i)}>
                  <span style={{
                    width:22, height:22, borderRadius:99, background:accent,
                    color:"#fff", fontSize:11, fontWeight:700,
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}>{i+1}</span>
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:"#334155" }}>
                    {p.nama || `Pihak ${i+1}`}
                  </span>
                  {p.peran && (
                    <span style={{
                      fontSize:10, fontWeight:700, background:isPPAT?"#fff7ed":"#eff6ff",
                      color:isPPAT?"#c2410c":"#1d4ed8",
                      border:`1px solid ${isPPAT?"#fed7aa":"#bfdbfe"}`,
                      borderRadius:99, padding:"1px 7px", marginRight:6,
                    }}>{p.peran}</span>
                  )}
                  {pihak.length > 1 && (
                    <button type="button" className="nf-del-btn"
                      onClick={e => { e.stopPropagation(); delPihak(i) }}>
                      <Trash2 size={12} />
                    </button>
                  )}
                  {expandedPihak[i]
                    ? <ChevronUp size={13} color="#94a3b8" />
                    : <ChevronDown size={13} color="#94a3b8" />}
                </div>
                {expandedPihak[i] && (
                  <div className="nf-pihak-body">
                    <div className="nf-grid-2" style={{ marginBottom:10 }}>
                      <div>
                        <label className="nf-label">Nama Lengkap *</label>
                        <input className="nf-input" value={p.nama}
                          onChange={e => updPihak(i,"nama",e.target.value)}
                          placeholder="Nama sesuai KTP" />
                      </div>
                      <div>
                        <label className="nf-label">NIK / ID</label>
                        <input className="nf-input mono" value={p.nik}
                          onChange={e => updPihak(i,"nik",e.target.value)}
                          placeholder="16 digit NIK" maxLength={20} />
                      </div>
                      <div>
                        <label className="nf-label">Peran</label>
                        <input className="nf-input" value={p.peran}
                          onChange={e => updPihak(i,"peran",e.target.value)}
                          placeholder={isPPAT ? "Penjual / Pembeli" : "Penghadap"} />
                      </div>
                      <div>
                        <label className="nf-label">Pekerjaan</label>
                        <input className="nf-input" value={p.pekerjaan||""}
                          onChange={e => updPihak(i,"pekerjaan",e.target.value)}
                          placeholder="Wiraswasta / PNS / dll" />
                      </div>
                      <div>
                        <label className="nf-label">Tempat Lahir</label>
                        <input className="nf-input" value={p.tempatLahir||""}
                          onChange={e => updPihak(i,"tempatLahir",e.target.value)}
                          placeholder="Jakarta" />
                      </div>
                      <div>
                        <label className="nf-label">Tanggal Lahir</label>
                        <input type="date" className="nf-input" value={p.tanggalLahir||""}
                          onChange={e => updPihak(i,"tanggalLahir",e.target.value)} />
                      </div>
                      <div>
                        <label className="nf-label">Kewarganegaraan</label>
                        <input className="nf-input" value={p.kewarganegaraan||"WNI"}
                          onChange={e => updPihak(i,"kewarganegaraan",e.target.value)}
                          placeholder="WNI / WNA" />
                      </div>
                    </div>
                    <div>
                      <label className="nf-label">Alamat Lengkap</label>
                      <textarea className="nf-input" rows={2}
                        value={p.alamat||""}
                        onChange={e => updPihak(i,"alamat",e.target.value)}
                        placeholder="Jl. Merdeka No. 1, Kel. …, Kec. …, Kota …"
                        style={{ resize:"vertical" }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="nf-add-btn" onClick={addPihak}
            style={{ marginTop:12 }}>
            <PlusCircle size={13} /> Tambah Pihak
          </button>
        </Section>

        {/* ── 4. Saksi ──────────────────────────────────────────────────── */}
        <Section
          title="Saksi-Saksi"
          icon={<Users size={14} color="#64748b" />}
          defaultOpen={false}
          badge={saksi.length > 0 ? (
            <span style={{
              fontSize:11, fontWeight:700, background:"#f0fdf4",
              color:"#16a34a", border:"1px solid #bbf7d0",
              borderRadius:99, padding:"1px 8px",
            }}>{saksi.length}</span>
          ) : undefined}
        >
          {saksi.length === 0 && (
            <p style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>
              Belum ada saksi. Klik tombol di bawah untuk menambahkan.
            </p>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {saksi.map((s, i) => (
              <div key={i} style={{ border:"1px solid #e2e8f0", borderRadius:10, padding:14, background:"#f8fafc" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#475569" }}>Saksi {i+1}</span>
                  <button type="button" className="nf-del-btn" onClick={() => delSaksi(i)}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="nf-grid-2">
                  <div>
                    <label className="nf-label">Nama</label>
                    <input className="nf-input" value={s.nama}
                      onChange={e => updSaksi(i,"nama",e.target.value)}
                      placeholder="Nama saksi" />
                  </div>
                  <div>
                    <label className="nf-label">NIK</label>
                    <input className="nf-input mono" value={s.nik}
                      onChange={e => updSaksi(i,"nik",e.target.value)}
                      placeholder="16 digit NIK" />
                  </div>
                  <div>
                    <label className="nf-label">Pekerjaan</label>
                    <input className="nf-input" value={s.pekerjaan||""}
                      onChange={e => updSaksi(i,"pekerjaan",e.target.value)}
                      placeholder="Karyawan / PNS" />
                  </div>
                  <div>
                    <label className="nf-label">Alamat</label>
                    <input className="nf-input" value={s.alamat||""}
                      onChange={e => updSaksi(i,"alamat",e.target.value)}
                      placeholder="Jl. Saksi No. 1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="nf-add-btn" onClick={addSaksi}
            style={{ marginTop: saksi.length ? 12 : 0 }}>
            <PlusCircle size={13} /> Tambah Saksi
          </button>
        </Section>

        {/* ── 5. Objek Tanah (PPAT) ─────────────────────────────────────── */}
        {isPPAT && (
          <Section
            title="Data Objek Tanah"
            icon={<MapPin size={14} color="#ea580c" />}
            accentOrange
          >
            <div className="nf-grid-2">
              <div>
                <label className="nf-label">Nomor Sertifikat</label>
                <input className="nf-input" value={objek.nomorSertifikat}
                  onChange={e => setObjek({ ...objek, nomorSertifikat:e.target.value })}
                  placeholder="SHM No. 1234/Cibubur" />
              </div>
              <div>
                <label className="nf-label">NOP (Nomor Objek Pajak)</label>
                <input className="nf-input mono" value={objek.nop}
                  onChange={e => setObjek({ ...objek, nop:e.target.value })}
                  placeholder="31.74.040.004.012-0001.0" />
              </div>
              <div>
                <label className="nf-label">Luas Tanah (m²)</label>
                <input type="number" className="nf-input" value={objek.luasTanah}
                  onChange={e => setObjek({ ...objek, luasTanah:e.target.value })}
                  placeholder="250" min="0" />
              </div>
              <div>
                <label className="nf-label">Nilai Transaksi (Rp)</label>
                <input className="nf-input" value={objek.nilaiTransaksi}
                  onChange={e => setObjek({ ...objek, nilaiTransaksi:e.target.value })}
                  placeholder="1.500.000.000" />
              </div>
              <div>
                <label className="nf-label">Jenis Tanah</label>
                <input className="nf-input" value={objek.jenisTanah||""}
                  onChange={e => setObjek({ ...objek, jenisTanah:e.target.value })}
                  placeholder="Pekarangan / Sawah / Bangunan" />
              </div>
              <div>
                <label className="nf-label">Kelas Tanah</label>
                <input className="nf-input" value={objek.kelasTanah||""}
                  onChange={e => setObjek({ ...objek, kelasTanah:e.target.value })}
                  placeholder="A / B / C" />
              </div>
            </div>
            <div style={{ marginTop:14 }}>
              <label className="nf-label">Alamat Objek Tanah</label>
              <textarea className="nf-input" rows={2}
                value={objek.alamatObjek}
                onChange={e => setObjek({ ...objek, alamatObjek:e.target.value })}
                placeholder="Jl. Merdeka No. 1, Kel. …, Kec. …, Kota …"
                style={{ resize:"vertical" }} />
            </div>
          </Section>
        )}

        {/* ── 6. Dokumen Pendukung ──────────────────────────────────────── */}
        <Section
          title="Checklist Dokumen Pendukung"
          icon={<FileText size={14} color="#64748b" />}
          defaultOpen={false}
          badge={
            <div style={{ display:"flex", gap:4 }}>
              {dokAda > 0 && (
                <span style={{
                  fontSize:10, fontWeight:700, background:"#dcfce7", color:"#16a34a",
                  border:"1px solid #bbf7d0", borderRadius:99, padding:"1px 7px",
                }}>{dokAda} Ada</span>
              )}
              {dokBelum > 0 && (
                <span style={{
                  fontSize:10, fontWeight:700, background:"#fee2e2", color:"#dc2626",
                  border:"1px solid #fecaca", borderRadius:99, padding:"1px 7px",
                }}>{dokBelum} Belum</span>
              )}
            </div>
          }
        >
          {dokumen.length === 0 ? (
            <p style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>
              Belum ada dokumen. Pilih kategori terlebih dahulu untuk pengisian otomatis, atau tambah manual.
            </p>
          ) : (
            <div style={{ overflowX:"auto", marginBottom:12 }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:"#f8fafc" }}>
                    {["No","Nama Dokumen","Jenis","Nomor","Status","Ket.",""].map(h => (
                      <th key={h} style={{
                        padding:"7px 10px", fontWeight:700, color:"#475569",
                        textAlign:"left", border:"1px solid #e2e8f0", fontSize:11,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dokumen.map((d, i) => (
                    <tr key={d.id} style={{ background: i%2?"#f8fafc":"#fff" }}>
                      <td style={{ padding:"6px 10px", border:"1px solid #e2e8f0", color:"#94a3b8", textAlign:"center", fontSize:11 }}>{i+1}</td>
                      <td style={{ padding:"4px 6px", border:"1px solid #e2e8f0", minWidth:160 }}>
                        <input className="nf-input" style={{ fontSize:12, padding:"4px 8px" }}
                          value={d.nama} onChange={e => updDok(d.id,"nama",e.target.value)}
                          placeholder="Nama dokumen" />
                      </td>
                      <td style={{ padding:"4px 6px", border:"1px solid #e2e8f0", minWidth:110 }}>
                        <div style={{ position:"relative" }}>
                          <select className="nf-input nf-select" style={{ fontSize:12, padding:"4px 24px 4px 8px" }}
                            value={d.jenis} onChange={e => updDok(d.id,"jenis",e.target.value)}>
                            {JENIS_DOKUMEN.map(j => <option key={j} value={j}>{j}</option>)}
                          </select>
                          <ChevronDown size={11} style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
                        </div>
                      </td>
                      <td style={{ padding:"4px 6px", border:"1px solid #e2e8f0", minWidth:120 }}>
                        <input className="nf-input mono" style={{ fontSize:12, padding:"4px 8px" }}
                          value={d.nomor||""} onChange={e => updDok(d.id,"nomor",e.target.value)}
                          placeholder="No. / Seri" />
                      </td>
                      <td style={{ padding:"4px 6px", border:"1px solid #e2e8f0", minWidth:110 }}>
                        <div style={{ position:"relative" }}>
                          <select className="nf-input nf-select" style={{
                            fontSize:12, padding:"4px 24px 4px 8px",
                            background: d.status==="ada"?"#f0fdf4":d.status==="belum"?"#fef2f2":"#f8fafc",
                            color: d.status==="ada"?"#15803d":d.status==="belum"?"#b91c1c":"#475569",
                          }}
                            value={d.status} onChange={e => updDok(d.id,"status",e.target.value as DokumenPendukung["status"])}>
                            {STATUS_DOKUMEN.map(s => (
                              <option key={s} value={s}>
                                {s==="ada"?"Ada":s==="belum"?"Belum":"Tidak Perlu"}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={11} style={{ position:"absolute", right:6, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
                        </div>
                      </td>
                      <td style={{ padding:"4px 6px", border:"1px solid #e2e8f0", minWidth:130 }}>
                        <input className="nf-input" style={{ fontSize:12, padding:"4px 8px" }}
                          value={d.keterangan||""} onChange={e => updDok(d.id,"keterangan",e.target.value)}
                          placeholder="Keterangan" />
                      </td>
                      <td style={{ padding:"4px 6px", border:"1px solid #e2e8f0", textAlign:"center" }}>
                        <button type="button" className="nf-del-btn" onClick={() => delDok(d.id)}>
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button type="button" className="nf-add-btn" onClick={addDok}>
            <PlusCircle size={13} /> Tambah Dokumen
          </button>
        </Section>

        {/* ── 7. Pajak & Biaya ──────────────────────────────────────────── */}
        <Section
          title="Pajak & Biaya"
          icon={<Calculator size={14} color="#64748b" />}
          defaultOpen={false}
        >
          <div className="nf-grid-2">
            <div>
              <label className="nf-label">BPHTB (Rp)</label>
              <input className="nf-input" value={pajak.bphtb||""}
                onChange={e => setPajak({ ...pajak, bphtb:e.target.value })}
                placeholder="60.000.000" />
            </div>
            <div>
              <label className="nf-label">Status BPHTB</label>
              <div style={{ position:"relative" }}>
                <select className="nf-input nf-select" style={{ paddingRight:30 }}
                  value={pajak.bphtbStatus||"belum"}
                  onChange={e => setPajak({ ...pajak, bphtbStatus:e.target.value as DataPajak["bphtbStatus"] })}>
                  {STATUS_PAJAK.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={13} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              </div>
            </div>
            <div>
              <label className="nf-label">PPh (Rp)</label>
              <input className="nf-input" value={pajak.pph||""}
                onChange={e => setPajak({ ...pajak, pph:e.target.value })}
                placeholder="37.500.000" />
            </div>
            <div>
              <label className="nf-label">Status PPh</label>
              <div style={{ position:"relative" }}>
                <select className="nf-input nf-select" style={{ paddingRight:30 }}
                  value={pajak.pphStatus||"belum"}
                  onChange={e => setPajak({ ...pajak, pphStatus:e.target.value as DataPajak["pphStatus"] })}>
                  {STATUS_PAJAK.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={13} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }} />
              </div>
            </div>
            <div>
              <label className="nf-label">Bea Materai (Rp)</label>
              <input className="nf-input" value={pajak.bea_materai||""}
                onChange={e => setPajak({ ...pajak, bea_materai:e.target.value })}
                placeholder="10.000" />
            </div>
            <div>
              <label className="nf-label">Honorarium (Rp)</label>
              <input className="nf-input" value={pajak.honorarium||""}
                onChange={e => setPajak({ ...pajak, honorarium:e.target.value })}
                placeholder="5.000.000" />
            </div>
            <div>
              <label className="nf-label">Biaya Lain-lain (Rp)</label>
              <input className="nf-input" value={pajak.biayaLain||""}
                onChange={e => setPajak({ ...pajak, biayaLain:e.target.value })}
                placeholder="500.000" />
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <label className="nf-label">Catatan Pajak / Biaya</label>
            <textarea className="nf-input" rows={2}
              value={pajak.catatanPajak||""}
              onChange={e => setPajak({ ...pajak, catatanPajak:e.target.value })}
              placeholder="Keterangan tambahan mengenai pajak atau biaya..."
              style={{ resize:"vertical" }} />
          </div>
        </Section>

        {/* ── 8. Catatan ────────────────────────────────────────────────── */}
        <Section title="Catatan Internal" icon={<FileText size={14} color="#64748b" />} defaultOpen={false}>
          <textarea className="nf-input" rows={4}
            value={catatan} onChange={e => setCatatan(e.target.value)}
            placeholder="Catatan untuk internal kantor — tidak tampil di dokumen publik..."
            style={{ resize:"vertical" }} />
        </Section>

        {/* Submit error */}
        {submitError && (
          <div style={{
            background:"#fef2f2", border:"1px solid #fecaca",
            borderRadius:10, padding:"12px 16px",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <AlertCircle size={14} color="#dc2626" />
            <span style={{ fontSize:13, color:"#dc2626", fontWeight:600 }}>{submitError}</span>
          </div>
        )}

        {/* Bottom actions */}
        <div style={{
          display:"flex", justifyContent:"space-between",
          alignItems:"center", paddingBottom:40, gap:12,
        }}>
          <button type="button" onClick={() => router.back()} style={{
            display:"flex", alignItems:"center", gap:7, padding:"10px 20px",
            borderRadius:9, border:"1.5px solid #e2e8f0", background:"#fff",
            fontSize:13, fontWeight:700, color:"#475569", cursor:"pointer", fontFamily:"inherit",
          }}>
            <ArrowLeft size={14} /> Kembali
          </button>
          <div style={{ display:"flex", gap:8 }}>
            <button type="button" onClick={() => setShowPrev(true)} style={{
              display:"flex", alignItems:"center", gap:7, padding:"10px 20px",
              borderRadius:9, border:"1.5px solid #e2e8f0", background:"#fff",
              fontSize:13, fontWeight:700, color:"#334155", cursor:"pointer", fontFamily:"inherit",
            }}>
              <Printer size={14} /> Preview &amp; Cetak
            </button>
            <button type="submit" disabled={saving||saved} style={{
              display:"flex", alignItems:"center", gap:7, padding:"10px 28px",
              borderRadius:9, border:"none",
              background: saved ? "#16a34a" : accent,
              fontSize:13, fontWeight:700, color:"#fff",
              cursor: (saving||saved) ? "not-allowed" : "pointer",
              opacity: saving ? 0.75 : 1, fontFamily:"inherit",
              boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
              transition:"background 0.2s",
            }}>
              {saved
                ? <><CheckCircle2 size={15} /> Tersimpan!</>
                : saving
                ? <><span className="nf-spin" /> Menyimpan...</>
                : <><Save size={16} /> {mode==="edit" ? "Simpan Perubahan" : "Simpan Akta"}</>}
            </button>
          </div>
        </div>

      </form>
    </>
  )
}
