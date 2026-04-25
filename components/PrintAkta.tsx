"use client"

import { useRef, useEffect, useState } from "react"
import { Printer, X, Download } from "lucide-react"
import type { Akta } from "@/lib/types"
import { getKantor, getAlamatLengkap, getKontakLine, type ProfilKantor } from "@/lib/kantor"
import { isoToTanggalPanjang, formatLengkap } from "@/lib/dateUtils"

interface Props {
  akta: Akta
  onClose: () => void
}

function fmtDate(iso: string) {
  if (!iso) return "—"
  return isoToTanggalPanjang(iso)
}
function fmtDateTime(iso: string) {
  if (!iso) return "—"
  return isoToTanggalPanjang(iso)
}

const tdStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  border: "1px solid #999", padding: "5px 8px", verticalAlign: "top",
  fontSize: "11pt", ...extra,
})
const thStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
  ...tdStyle(), fontWeight: "bold", background: "#f0f0f0", ...extra,
})

function buildPrintHtml(akta: Akta, kantor: ProfilKantor): string {
  const isPPAT = akta.tipeAkta === "PPAT"
  const alamat = getAlamatLengkap(kantor)
  const kontak = getKontakLine(kantor)
  const kopTitle = isPPAT ? "KANTOR NOTARIS & PPAT" : "KANTOR NOTARIS"

  // kop logo (base64 embedded)
  const logoTag = kantor.logoUrl
    ? `<img src="${kantor.logoUrl}" style="height:60px;display:block;margin:0 auto 6px;object-fit:contain;" alt="logo" />`
    : ""

  // para pihak rows
  const pihakRows = akta.pihak.map((p, i) => `
    <tr style="background:${i%2===0?"#fff":"#fafafa"}">
      <td style="border:1px solid #999;padding:5px 8px;text-align:center;width:26px;font-size:11pt;">${i+1}</td>
      <td style="border:1px solid #999;padding:5px 8px;font-weight:bold;font-size:11pt;">${p.nama}</td>
      <td style="border:1px solid #999;padding:5px 8px;font-family:monospace;font-size:9.5pt;">${p.nik||"—"}</td>
      <td style="border:1px solid #999;padding:5px 8px;font-size:10pt;">${p.peran||"—"}</td>
      <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${
        p.tempatLahir||p.tanggalLahir
          ? `${p.tempatLahir||""}${p.tempatLahir&&p.tanggalLahir?", ":""}${p.tanggalLahir?new Date(p.tanggalLahir).toLocaleDateString("id-ID"):""}`
          : "—"
      }</td>
      <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${p.pekerjaan||"—"}</td>
      <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${p.alamat||"—"}</td>
    </tr>`).join("")

  // saksi rows
  const saksiSection = akta.saksi && akta.saksi.length > 0 ? `
    <p class="section-title">Saksi-Saksi</p>
    <table>
      <thead><tr>${["No","Nama","NIK","Pekerjaan","Alamat"].map(h=>`<th style="border:1px solid #999;padding:5px 8px;font-weight:bold;background:#f0f0f0;font-size:10pt;">${h}</th>`).join("")}</tr></thead>
      <tbody>${akta.saksi.map((s,i)=>`
        <tr style="background:${i%2===0?"#fff":"#fafafa"}">
          <td style="border:1px solid #999;padding:5px 8px;text-align:center;">${i+1}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-weight:bold;">${s.nama}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-family:monospace;font-size:9.5pt;">${s.nik||"—"}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${s.pekerjaan||"—"}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${s.alamat||"—"}</td>
        </tr>`).join("")}</tbody>
    </table>` : ""

  // objek tanah section
  const objekSection = isPPAT && akta.objekTanah ? `
    <p class="section-title">Objek Tanah</p>
    <table><tbody>
      ${([
        ["Nomor Sertifikat", akta.objekTanah.nomorSertifikat],
        ["NOP (Nomor Objek Pajak)", akta.objekTanah.nop],
        ["Luas Tanah", akta.objekTanah.luasTanah ? `${akta.objekTanah.luasTanah} m²` : "—"],
        ["Jenis Tanah", akta.objekTanah.jenisTanah||"—"],
        ["Kelas Tanah", akta.objekTanah.kelasTanah||"—"],
        ["Nilai Transaksi", akta.objekTanah.nilaiTransaksi ? `Rp ${akta.objekTanah.nilaiTransaksi}` : "—"],
        ["Alamat Objek", akta.objekTanah.alamatObjek],
      ] as [string,string][]).map(([k,v])=>`
        <tr>
          <td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#fff7ed;">${k}</td>
          <td style="border:1px solid #999;padding:5px 8px;">${v||"—"}</td>
        </tr>`).join("")}
    </tbody></table>` : ""

  // pajak section
  const pajakRows = akta.pajak ? [
    akta.pajak.bphtb ? `<tr><td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">BPHTB</td><td style="border:1px solid #999;padding:5px 8px;">Rp ${akta.pajak.bphtb} &nbsp;<em>(${akta.pajak.bphtbStatus})</em></td></tr>` : "",
    akta.pajak.pph ? `<tr><td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">PPh</td><td style="border:1px solid #999;padding:5px 8px;">Rp ${akta.pajak.pph} &nbsp;<em>(${akta.pajak.pphStatus})</em></td></tr>` : "",
    akta.pajak.bea_materai ? `<tr><td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">Bea Materai</td><td style="border:1px solid #999;padding:5px 8px;">Rp ${akta.pajak.bea_materai}</td></tr>` : "",
    akta.pajak.honorarium ? `<tr><td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">Honorarium</td><td style="border:1px solid #999;padding:5px 8px;">Rp ${akta.pajak.honorarium}</td></tr>` : "",
    akta.pajak.biayaLain ? `<tr><td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">Biaya Lain-lain</td><td style="border:1px solid #999;padding:5px 8px;">Rp ${akta.pajak.biayaLain}</td></tr>` : "",
    akta.pajak.catatanPajak ? `<tr><td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">Catatan Pajak</td><td style="border:1px solid #999;padding:5px 8px;">${akta.pajak.catatanPajak}</td></tr>` : "",
  ].filter(Boolean).join("") : ""

  const pajakSection = pajakRows ? `
    <p class="section-title">Pajak &amp; Biaya</p>
    <table><tbody>${pajakRows}</tbody></table>` : ""

  // dokumen section
  const dokSection = akta.dokumen && akta.dokumen.length > 0 ? `
    <p class="section-title">Checklist Dokumen Pendukung</p>
    <table>
      <thead><tr>${["No","Nama Dokumen","Jenis","Nomor","Status","Keterangan"].map(h=>`<th style="border:1px solid #999;padding:5px 8px;font-weight:bold;background:#f0f0f0;font-size:10pt;">${h}</th>`).join("")}</tr></thead>
      <tbody>${akta.dokumen.map((d,i)=>`
        <tr style="background:${i%2===0?"#fff":"#fafafa"}">
          <td style="border:1px solid #999;padding:5px 8px;text-align:center;">${i+1}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-weight:bold;font-size:10.5pt;">${d.nama}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${d.jenis}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-family:monospace;font-size:9.5pt;">${d.nomor||"—"}</td>
          <td style="border:1px solid #999;padding:5px 8px;font-weight:bold;font-size:10pt;color:${d.status==="ada"?"#15803d":d.status==="belum"?"#dc2626":"#64748b"}">
            ${d.status==="ada"?"ADA":d.status==="belum"?"BELUM":"TDK PERLU"}
          </td>
          <td style="border:1px solid #999;padding:5px 8px;font-size:9.5pt;">${d.keterangan||"—"}</td>
        </tr>`).join("")}</tbody>
    </table>` : ""

  // tanda tangan grid
  const ttCols = Math.min(akta.pihak.length + 1, 4)
  const ttPihak = akta.pihak.slice(0, 3).map((p, i) => `
    <div style="text-align:center;">
      <p style="font-size:10pt;font-weight:bold;margin-bottom:60pt;">${p.peran||`Pihak ${i+1}`}</p>
      <div style="border-top:1px solid #000;padding-top:4pt;">
        <p style="font-weight:bold;font-size:11pt;">${p.nama}</p>
        ${p.nik ? `<p style="font-size:9.5pt;color:#555;">NIK: ${p.nik}</p>` : ""}
      </div>
    </div>`).join("")
  const ttNotaris = `
    <div style="text-align:center;">
      <p style="font-size:10pt;font-weight:bold;margin-bottom:60pt;">${isPPAT?"PPAT":"Notaris"}</p>
      <div style="border-top:1px solid #000;padding-top:4pt;">
        <p style="font-weight:bold;font-size:11pt;">${kantor.namaNotaris||"_________________________"}</p>
        ${kantor.nomorSK ? `<p style="font-size:9pt;color:#555;">SK No. ${kantor.nomorSK}</p>` : ""}
      </div>
    </div>`

  return `<!DOCTYPE html><html lang="id"><head>
    <meta charset="utf-8">
    <title>Akta No. ${akta.nomorAkta} — ${akta.kategori}</title>
    <style>
      @page { size: A4 portrait; margin: 2.5cm 3cm 2cm 3cm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.7; }
      h1,h2,h3 { margin: 0; padding: 0; }
      table { width: 100%; border-collapse: collapse; margin: 6pt 0; }
      .section-title { font-weight: bold; font-size: 11pt; text-transform: uppercase;
        border-bottom: 1px solid #000; padding-bottom: 3pt; margin: 14pt 0 8pt; letter-spacing: 0.5px; }
      .page-break { page-break-before: always; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    </style>
  </head><body>

    <!-- KOP SURAT -->
    <div style="text-align:center;border-bottom:3px double #000;padding-bottom:12pt;margin-bottom:18pt;">
      ${logoTag}
      <p style="font-size:9pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#444;">${kopTitle}</p>
      <h1 style="font-size:18pt;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:4px 0;">
        ${kantor.namaNotaris || kantor.namaKantor || "e-NotarisKu Pro"}
      </h1>
      ${kantor.nomorSK ? `<p style="font-size:9pt;color:#555;">SK No. ${kantor.nomorSK}</p>` : ""}
      ${alamat ? `<p style="font-size:9.5pt;color:#333;margin-top:3px;">${alamat}</p>` : ""}
      ${kontak ? `<p style="font-size:9pt;color:#555;margin-top:2px;">${kontak}</p>` : ""}
      ${kantor.wilayahKerja ? `<p style="font-size:9pt;color:#777;margin-top:2px;">Wilayah Kerja: ${kantor.wilayahKerja}</p>` : ""}
    </div>

    <!-- JUDUL -->
    <div style="text-align:center;margin:20pt 0 16pt;">
      <h2 style="font-size:14pt;font-weight:bold;text-transform:uppercase;text-decoration:underline;letter-spacing:1.5px;">
        ${akta.kategori}
      </h2>
      <p style="font-size:12pt;margin-top:5pt;">Nomor : <strong>${akta.nomorAkta}</strong></p>
    </div>

    <!-- DATA AKTA -->
    <p class="section-title">Data Akta</p>
    <table><tbody>
      ${([
        ["Nomor Akta", akta.nomorAkta],
        ["Tanggal Akta", fmtDate(akta.tanggalAkta)],
        ["Jenis / Kategori", akta.kategori],
        ["Tipe Akta", akta.tipeAkta],
        ["Perihal", akta.perihal],
        ["Status", akta.statusUmum],
      ] as [string,string][]).map(([k,v])=>`
        <tr>
          <td style="border:1px solid #999;padding:5px 8px;width:200px;font-weight:bold;background:#f5f5f5;">${k}</td>
          <td style="border:1px solid #999;padding:5px 8px;">${v||"—"}</td>
        </tr>`).join("")}
    </tbody></table>

    <!-- PARA PIHAK -->
    ${akta.pihak.length > 0 ? `
    <p class="section-title">Para Pihak</p>
    <table>
      <thead><tr>${["No","Nama","NIK","Peran","Tempat/Tgl Lahir","Pekerjaan","Alamat"].map(h=>`<th style="border:1px solid #999;padding:5px 8px;font-weight:bold;background:#f0f0f0;font-size:10pt;">${h}</th>`).join("")}</tr></thead>
      <tbody>${pihakRows}</tbody>
    </table>` : ""}

    ${saksiSection}
    ${objekSection}
    ${pajakSection}
    ${dokSection}

    <!-- CATATAN -->
    ${akta.catatan ? `
    <div style="margin:16pt 0;padding:10pt 13pt;background:#fffbeb;border:1px solid #fcd34d;border-radius:3px;">
      <p style="font-weight:bold;font-size:11pt;margin-bottom:5pt;">Catatan Internal:</p>
      <p style="font-size:11pt;line-height:1.7;">${akta.catatan}</p>
    </div>` : ""}

    <!-- TANDA TANGAN -->
    <p class="section-title">Penandatanganan</p>
    <div style="display:grid;grid-template-columns:repeat(${ttCols},1fr);gap:0 20pt;margin-top:10pt;">
      ${ttPihak}
      ${ttNotaris}
    </div>

    <!-- INFO SISTEM -->
    <div style="margin-top:24pt;padding:8pt 10pt;background:#f8fafc;border:1px solid #e2e8f0;border-radius:3px;font-size:9pt;color:#555;">
      <strong>Informasi Sistem:</strong> ID: ${akta.id} &bull; Dibuat: ${fmtDateTime(akta.createdAt)} &bull; Diperbarui: ${fmtDateTime(akta.updatedAt)}
    </div>

    <!-- FOOTER -->
    <div style="margin-top:16pt;border-top:1px solid #ccc;padding-top:8pt;text-align:center;font-size:9pt;color:#888;">
      Dicetak dari <strong>e-NotarisKu Pro</strong> &bull; ${formatLengkap(new Date())} &bull;
      Dokumen ini bersifat RAHASIA dan hanya untuk keperluan internal
    </div>

  </body></html>`
}

export default function PrintAkta({ akta, onClose }: Props) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [kantor, setKantor] = useState<ProfilKantor | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [saveProjectHint, setSaveProjectHint] = useState<string | null>(null)

  useEffect(() => {
    setKantor(getKantor())
  }, [])

  function triggerIframePrint(html: string) {
    const existing = document.getElementById("__notaris_print_frame__")
    if (existing) existing.remove()
    const frame = document.createElement("iframe")
    frame.id = "__notaris_print_frame__"
    frame.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;visibility:hidden;"
    document.body.appendChild(frame)
    const win = frame.contentWindow
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
    setTimeout(() => {
      win.focus()
      win.print()
      setTimeout(() => frame.remove(), 3000)
    }, 600)
  }

  function handlePrint() {
    if (!kantor) return
    const html = buildPrintHtml(akta, kantor)
    triggerIframePrint(html)
  }

  async function handleDownloadPdf() {
    if (!kantor) return
    if (isGeneratingPdf) return
    if (!previewRef.current) return
    setSaveProjectHint(null)
    setIsGeneratingPdf(true)
    try {
      const source = previewRef.current
      const html2canvasModule = await import("html2canvas")
      const jsPdfModule = await import("jspdf")
      const html2canvas = (html2canvasModule as any).default ?? (html2canvasModule as any)
      const JsPDF = (jsPdfModule as any).default ?? (jsPdfModule as any).jsPDF
      const canvas = await html2canvas(source, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      })
      const imgData = canvas.toDataURL("image/jpeg", 0.98)
      const pdf = new JsPDF("p", "mm", "a4")
      const pageWidth = 210
      const pageHeight = 297
      const imageHeight = (canvas.height * pageWidth) / canvas.width
      let remainingHeight = imageHeight
      let yOffset = 0

      pdf.addImage(imgData, "JPEG", 0, yOffset, pageWidth, imageHeight, undefined, "FAST")
      remainingHeight -= pageHeight

      while (remainingHeight > 0) {
        yOffset = remainingHeight - imageHeight
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 0, yOffset, pageWidth, imageHeight, undefined, "FAST")
        remainingHeight -= pageHeight
      }

      const filename = `Akta-${akta.nomorAkta.replace(/\//g, "-")}-${akta.kategori.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`

      try {
        const blob = pdf.output("blob") as Blob
        const form = new FormData()
        form.append("file", blob, filename)
        form.append("filename", filename)
        const res = await fetch("/api/simpan-pdf", { method: "POST", body: form })
        const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string }
        if (res.ok && data.path) {
          setSaveProjectHint(`Tersimpan otomatis di: ${data.path}`)
        }
      } catch {
        /* unduhan browser tetap jalan */
      }

      pdf.save(filename)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  function handleDownload() {
    if (!kantor) return
    const html = buildPrintHtml(akta, kantor)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Akta-${akta.nomorAkta.replace(/\//g, "-")}-${akta.kategori.replace(/[^a-zA-Z0-9]/g, "-")}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!kantor) return null

  const isPPAT = akta.tipeAkta === "PPAT"
  const alamat = getAlamatLengkap(kantor)
  const kontak = getKontakLine(kantor)

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.75)", zIndex: 9999,
      display: "flex", flexDirection: "column", alignItems: "center",
      overflowY: "auto", padding: "20px 16px 48px",
    }}>
      {/* Toolbar */}
      <div style={{
        width: "100%", maxWidth: 860, display: "flex",
        justifyContent: "space-between", alignItems: "center",
        marginBottom: 14, gap: 8, flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>
            Preview — {akta.kategori} No. {akta.nomorAkta}
          </p>
          {saveProjectHint && (
            <p style={{ color: "#6ee7b7", fontSize: 12, fontWeight: 600, marginTop: 6 }}>
              {saveProjectHint}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handlePrint}
            style={{ display:"flex", alignItems:"center", gap:6, background:"#2563eb", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            <Printer size={14} /> Print
          </button>
          <button onClick={handleDownloadPdf} disabled={isGeneratingPdf}
            style={{ display:"flex", alignItems:"center", gap:6, background:"#0d9488", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:isGeneratingPdf?"not-allowed":"pointer", opacity:isGeneratingPdf?0.8:1, fontFamily:"inherit" }}>
            <Download size={14} /> {isGeneratingPdf ? "Menyiapkan PDF..." : "Download PDF"}
          </button>
          <button onClick={handleDownload}
            style={{ display:"flex", alignItems:"center", gap:6, background:"#059669", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            <Download size={14} /> Download HTML
          </button>
          <button onClick={onClose}
            style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.12)", color:"#e2e8f0", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"9px 14px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
            <X size={14} /> Tutup
          </button>
        </div>
      </div>

      {/* Paper preview */}
      <div ref={previewRef} style={{
        width: 794, background: "#fff", padding: "72px 88px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.45)", borderRadius: 4,
        fontFamily: "'Times New Roman', serif", fontSize: "12pt",
        color: "#000", lineHeight: 1.7,
      }}>
        {/* KOP */}
        <div style={{ textAlign:"center", borderBottom:"3px double #000", paddingBottom:12, marginBottom:18 }}>
          {kantor.logoUrl && (
            <img src={kantor.logoUrl} alt="Logo kantor" style={{ height:64, display:"block", margin:"0 auto 8px", objectFit:"contain" }} />
          )}
          <p style={{ fontSize:"9pt", fontWeight:"bold", textTransform:"uppercase", letterSpacing:1, color:"#444" }}>
            {isPPAT ? "KANTOR NOTARIS & PPAT" : "KANTOR NOTARIS"}
          </p>
          <h1 style={{ fontSize:"18pt", fontWeight:"bold", textTransform:"uppercase", letterSpacing:2, margin:"4px 0" }}>
            {kantor.namaNotaris || kantor.namaKantor || "NAMA NOTARIS"}
          </h1>
          {kantor.nomorSK && (
            <p style={{ fontSize:"9pt", color:"#555" }}>SK No. {kantor.nomorSK}</p>
          )}
          {alamat && (
            <p style={{ fontSize:"9.5pt", color:"#333", marginTop:3 }}>{alamat}</p>
          )}
          {kontak && (
            <p style={{ fontSize:"9pt", color:"#555", marginTop:2 }}>{kontak}</p>
          )}
          {kantor.wilayahKerja && (
            <p style={{ fontSize:"9pt", color:"#777", marginTop:2 }}>Wilayah Kerja: {kantor.wilayahKerja}</p>
          )}
          {!kantor.namaNotaris && !kantor.alamat && (
            <p style={{ fontSize:"9pt", color:"#f59e0b", marginTop:4, fontStyle:"italic" }}>
              * Lengkapi Profil Kantor di menu &quot;Profil Kantor&quot; untuk kop surat yang benar
            </p>
          )}
        </div>

        {/* Judul */}
        <div style={{ textAlign:"center", margin:"22px 0 20px" }}>
          <h2 style={{ fontSize:"14pt", fontWeight:"bold", textTransform:"uppercase", textDecoration:"underline", letterSpacing:1.5 }}>
            {akta.kategori}
          </h2>
          <p style={{ fontSize:"12pt", marginTop:5 }}>Nomor : <strong>{akta.nomorAkta}</strong></p>
        </div>

        {/* Data Akta */}
        <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginBottom:10, letterSpacing:0.5 }}>Data Akta</p>
        <table style={{ borderCollapse:"collapse", width:"100%", marginBottom:0 }}>
          <tbody>
            {([
              ["Nomor Akta", akta.nomorAkta],
              ["Tanggal Akta", fmtDate(akta.tanggalAkta)],
              ["Jenis / Kategori", akta.kategori],
              ["Tipe Akta", akta.tipeAkta],
              ["Perihal", akta.perihal],
              ["Status", akta.statusUmum],
            ] as [string,string][]).map(([k,v]) => (
              <tr key={k}>
                <td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>{k}</td>
                <td style={tdStyle()}>{v||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Para Pihak */}
        {akta.pihak.length > 0 && (
          <>
            <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginTop:16, marginBottom:10, letterSpacing:0.5 }}>Para Pihak</p>
            <table style={{ borderCollapse:"collapse", width:"100%" }}>
              <thead>
                <tr>{["No","Nama","NIK","Peran","Tempat/Tgl Lahir","Pekerjaan","Alamat"].map(h => <th key={h} style={thStyle({ fontSize:"10pt" })}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {akta.pihak.map((p,i) => (
                  <tr key={i} style={{ background:i%2===0?"#fff":"#fafafa" }}>
                    <td style={tdStyle({ textAlign:"center", width:26, fontWeight:"bold" })}>{i+1}</td>
                    <td style={tdStyle({ fontWeight:"bold" })}>{p.nama}</td>
                    <td style={tdStyle({ fontFamily:"monospace", fontSize:"9.5pt" })}>{p.nik||"—"}</td>
                    <td style={tdStyle({ fontSize:"10pt" })}>{p.peran||"—"}</td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>
                      {p.tempatLahir||p.tanggalLahir
                        ? `${p.tempatLahir||""}${p.tempatLahir&&p.tanggalLahir?", ":""}${p.tanggalLahir?new Date(p.tanggalLahir).toLocaleDateString("id-ID"):""}`
                        : "—"}
                    </td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>{p.pekerjaan||"—"}</td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>{p.alamat||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Saksi */}
        {akta.saksi && akta.saksi.length > 0 && (
          <>
            <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginTop:16, marginBottom:10, letterSpacing:0.5 }}>Saksi-Saksi</p>
            <table style={{ borderCollapse:"collapse", width:"100%" }}>
              <thead><tr>{["No","Nama","NIK","Pekerjaan","Alamat"].map(h=><th key={h} style={thStyle({ fontSize:"10pt" })}>{h}</th>)}</tr></thead>
              <tbody>
                {akta.saksi.map((s,i) => (
                  <tr key={i} style={{ background:i%2===0?"#fff":"#fafafa" }}>
                    <td style={tdStyle({ textAlign:"center", width:26 })}>{i+1}</td>
                    <td style={tdStyle({ fontWeight:"bold" })}>{s.nama}</td>
                    <td style={tdStyle({ fontFamily:"monospace", fontSize:"9.5pt" })}>{s.nik||"—"}</td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>{s.pekerjaan||"—"}</td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>{s.alamat||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Objek Tanah */}
        {isPPAT && akta.objekTanah && (
          <>
            <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginTop:16, marginBottom:10, letterSpacing:0.5 }}>Objek Tanah</p>
            <table style={{ borderCollapse:"collapse", width:"100%" }}>
              <tbody>
                {([
                  ["Nomor Sertifikat", akta.objekTanah.nomorSertifikat],
                  ["NOP", akta.objekTanah.nop],
                  ["Luas Tanah", akta.objekTanah.luasTanah ? `${akta.objekTanah.luasTanah} m²` : "—"],
                  ["Jenis Tanah", akta.objekTanah.jenisTanah||"—"],
                  ["Kelas Tanah", akta.objekTanah.kelasTanah||"—"],
                  ["Nilai Transaksi", akta.objekTanah.nilaiTransaksi ? `Rp ${akta.objekTanah.nilaiTransaksi}` : "—"],
                  ["Alamat Objek", akta.objekTanah.alamatObjek],
                ] as [string,string][]).map(([k,v]) => (
                  <tr key={k}>
                    <td style={tdStyle({ width:200, fontWeight:"bold", background:"#fff7ed" })}>{k}</td>
                    <td style={tdStyle()}>{v||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Pajak */}
        {akta.pajak && (akta.pajak.bphtb||akta.pajak.pph||akta.pajak.honorarium||akta.pajak.bea_materai) && (
          <>
            <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginTop:16, marginBottom:10, letterSpacing:0.5 }}>Pajak &amp; Biaya</p>
            <table style={{ borderCollapse:"collapse", width:"100%" }}>
              <tbody>
                {akta.pajak.bphtb && <tr><td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>BPHTB</td><td style={tdStyle()}>Rp {akta.pajak.bphtb} &nbsp;<em>({akta.pajak.bphtbStatus})</em></td></tr>}
                {akta.pajak.pph && <tr><td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>PPh</td><td style={tdStyle()}>Rp {akta.pajak.pph} &nbsp;<em>({akta.pajak.pphStatus})</em></td></tr>}
                {akta.pajak.bea_materai && <tr><td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>Bea Materai</td><td style={tdStyle()}>Rp {akta.pajak.bea_materai}</td></tr>}
                {akta.pajak.honorarium && <tr><td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>Honorarium</td><td style={tdStyle()}>Rp {akta.pajak.honorarium}</td></tr>}
                {akta.pajak.biayaLain && <tr><td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>Biaya Lain-lain</td><td style={tdStyle()}>Rp {akta.pajak.biayaLain}</td></tr>}
                {akta.pajak.catatanPajak && <tr><td style={tdStyle({ width:200, fontWeight:"bold", background:"#f5f5f5" })}>Catatan Pajak</td><td style={tdStyle()}>{akta.pajak.catatanPajak}</td></tr>}
              </tbody>
            </table>
          </>
        )}

        {/* Dokumen */}
        {akta.dokumen && akta.dokumen.length > 0 && (
          <>
            <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginTop:16, marginBottom:10, letterSpacing:0.5 }}>Checklist Dokumen Pendukung</p>
            <table style={{ borderCollapse:"collapse", width:"100%" }}>
              <thead><tr>{["No","Nama Dokumen","Jenis","Nomor","Status","Keterangan"].map(h=><th key={h} style={thStyle({ fontSize:"10pt" })}>{h}</th>)}</tr></thead>
              <tbody>
                {akta.dokumen.map((d,i) => (
                  <tr key={d.id} style={{ background:i%2===0?"#fff":"#fafafa" }}>
                    <td style={tdStyle({ textAlign:"center", width:26 })}>{i+1}</td>
                    <td style={tdStyle({ fontWeight:"bold", fontSize:"10.5pt" })}>{d.nama}</td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>{d.jenis}</td>
                    <td style={tdStyle({ fontFamily:"monospace", fontSize:"9.5pt" })}>{d.nomor||"—"}</td>
                    <td style={tdStyle({ fontWeight:"bold", fontSize:"10pt", color:d.status==="ada"?"#15803d":d.status==="belum"?"#dc2626":"#64748b" })}>
                      {d.status==="ada"?"ADA":d.status==="belum"?"BELUM":"TDK PERLU"}
                    </td>
                    <td style={tdStyle({ fontSize:"9.5pt" })}>{d.keterangan||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Catatan */}
        {akta.catatan && (
          <div style={{ margin:"16pt 0", padding:"10pt 13pt", background:"#fffbeb", border:"1px solid #fcd34d", borderRadius:3 }}>
            <p style={{ fontWeight:"bold", fontSize:"11pt", marginBottom:5 }}>Catatan Internal:</p>
            <p style={{ fontSize:"11pt", lineHeight:1.7 }}>{akta.catatan}</p>
          </div>
        )}

        {/* Tanda Tangan */}
        <p style={{ fontWeight:"bold", fontSize:"11pt", textTransform:"uppercase", borderBottom:"1px solid #000", paddingBottom:3, marginTop:16, marginBottom:22, letterSpacing:0.5 }}>Penandatanganan</p>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(akta.pihak.length+1,4)},1fr)`, gap:"0 20pt" }}>
          {akta.pihak.slice(0,3).map((p,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <p style={{ fontSize:"10pt", fontWeight:"bold", marginBottom:60 }}>{p.peran||`Pihak ${i+1}`}</p>
              <div style={{ borderTop:"1px solid #000", paddingTop:4 }}>
                <p style={{ fontWeight:"bold", fontSize:"11pt" }}>{p.nama}</p>
                {p.nik && <p style={{ fontSize:"9.5pt", color:"#555" }}>NIK: {p.nik}</p>}
              </div>
            </div>
          ))}
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:"10pt", fontWeight:"bold", marginBottom:60 }}>{isPPAT?"PPAT":"Notaris"}</p>
            <div style={{ borderTop:"1px solid #000", paddingTop:4 }}>
              <p style={{ fontWeight:"bold", fontSize:"11pt" }}>{kantor.namaNotaris || "________________________"}</p>
              {kantor.nomorSK && <p style={{ fontSize:"9pt", color:"#555" }}>SK No. {kantor.nomorSK}</p>}
            </div>
          </div>
        </div>

        {/* Info & Footer */}
        <div style={{ marginTop:24, padding:"8pt 10pt", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:3, fontSize:"9pt", color:"#555" }}>
          <strong>Info Sistem:</strong> ID: {akta.id} &bull; Dibuat: {fmtDateTime(akta.createdAt)} &bull; Diperbarui: {fmtDateTime(akta.updatedAt)}
        </div>
        <div style={{ marginTop:16, borderTop:"1px solid #ccc", paddingTop:8, textAlign:"center", fontSize:"9pt", color:"#888" }}>
          Dicetak dari <strong>e-NotarisKu Pro</strong> &bull; {formatLengkap(new Date())} &bull; Dokumen ini bersifat RAHASIA
        </div>
      </div>
    </div>
  )
}
