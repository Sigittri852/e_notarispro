// ─── Enum-like constants ───────────────────────────────────────────────────

export type TipeAkta = "NOTARIIL" | "PPAT"

export type KategoriNotaris =
  | "Akta Jual Beli"
  | "Akta Hibah"
  | "Akta Wasiat"
  | "Akta Pendirian PT"
  | "Akta Pendirian CV"
  | "Akta Pendirian Yayasan"
  | "Akta Kuasa"
  | "Akta Perjanjian"
  | "Akta Keterangan Waris"
  | "SKMHT"
  | "APHT"
  | "Lainnya (Notaris)"

export type KategoriPPAT =
  | "AJB (Akta Jual Beli)"
  | "APHB (Akta Pemberian Hak Bangunan)"
  | "Akta Hibah PPAT"
  | "APHT (Akta Pemberian Hak Tanggungan)"
  | "Akta Tukar Menukar"
  | "Akta Pembagian Hak Bersama"
  | "Akta Pemasukan Dalam Perusahaan"
  | "Akta Pemisahan Hak Milik"
  | "Lainnya (PPAT)"

export type StatusUmum =
  | "Proses"
  | "Selesai"
  | "Tertunda"
  | "Dibatalkan"

// ─── PPAT workflow steps ───────────────────────────────────────────────────

export type StepStatusPPAT = "belum" | "proses" | "selesai" | "tidak_diperlukan"

export interface WorkflowPPAT {
  pengecekanBPN: StepStatusPPAT
  validasiPajak_BPHTB: StepStatusPPAT
  validasiPajak_PPh: StepStatusPPAT
  penandatangananAkta: StepStatusPPAT
  pendaftaranBPN: StepStatusPPAT
  balikNama: StepStatusPPAT
  serahTerimaSertifikat: StepStatusPPAT
}

export const defaultWorkflowPPAT: WorkflowPPAT = {
  pengecekanBPN: "belum",
  validasiPajak_BPHTB: "belum",
  validasiPajak_PPh: "belum",
  penandatangananAkta: "belum",
  pendaftaranBPN: "belum",
  balikNama: "belum",
  serahTerimaSertifikat: "belum",
}

export const workflowPPATLabels: Record<keyof WorkflowPPAT, string> = {
  pengecekanBPN: "Pengecekan Sertifikat BPN",
  validasiPajak_BPHTB: "Validasi BPHTB (Pembeli)",
  validasiPajak_PPh: "Validasi PPh (Penjual)",
  penandatangananAkta: "Penandatanganan Akta",
  pendaftaranBPN: "Pendaftaran ke BPN",
  balikNama: "Proses Balik Nama",
  serahTerimaSertifikat: "Serah Terima Sertifikat",
}

// ─── Notaris workflow steps ────────────────────────────────────────────────

export interface WorkflowNotaris {
  periksaIdentitas: StepStatusPPAT
  draftAkta: StepStatusPPAT
  bacakanAkta: StepStatusPPAT
  penandatangananAkta: StepStatusPPAT
  pembukukuan: StepStatusPPAT
  serahMinuta: StepStatusPPAT
}

export const defaultWorkflowNotaris: WorkflowNotaris = {
  periksaIdentitas: "belum",
  draftAkta: "belum",
  bacakanAkta: "belum",
  penandatangananAkta: "belum",
  pembukukuan: "belum",
  serahMinuta: "belum",
}

export const workflowNotarisLabels: Record<keyof WorkflowNotaris, string> = {
  periksaIdentitas: "Periksa & Verifikasi Identitas",
  draftAkta: "Draft / Rancangan Akta",
  bacakanAkta: "Pembacaan Akta",
  penandatangananAkta: "Penandatanganan Akta",
  pembukukuan: "Pembukuan (Buku Daftar Akta)",
  serahMinuta: "Serah Minuta & Salinan",
}

// ─── Pihak (party) ────────────────────────────────────────────────────────

export interface Pihak {
  nama: string
  nik: string
  peran: string       // e.g. "Penjual", "Pembeli", "Penghadap", "Debitur"
  alamat?: string
  tempatLahir?: string
  tanggalLahir?: string
  kewarganegaraan?: string
  pekerjaan?: string
}

// ─── Saksi ────────────────────────────────────────────────────────────────

export interface Saksi {
  nama: string
  nik: string
  alamat?: string
  pekerjaan?: string
}

// ─── Dokumen Pendukung ────────────────────────────────────────────────────

export interface DokumenPendukung {
  id: string
  nama: string        // e.g. "KTP Penjual", "Sertifikat Asli"
  jenis: string       // e.g. "Identitas", "Sertifikat", "Pajak", "Lainnya"
  nomor?: string      // nomor dokumen jika ada
  keterangan?: string
  status: "ada" | "belum" | "tidak_diperlukan"
}

// ─── Pajak / Biaya ────────────────────────────────────────────────────────

export interface DataPajak {
  bphtb?: string          // nominal Rp
  bphtbStatus?: "belum" | "proses" | "lunas"
  pph?: string
  pphStatus?: "belum" | "proses" | "lunas"
  bea_materai?: string
  honorarium?: string
  biayaLain?: string
  catatanPajak?: string
}

// ─── Objek Tanah (PPAT specific) ──────────────────────────────────────────

export interface ObjekTanah {
  nomorSertifikat: string
  nop: string            // Nomor Objek Pajak
  luasTanah: string      // m²
  alamatObjek: string
  nilaiTransaksi: string // Rp
  jenisTanah?: string    // e.g. "Pekarangan", "Sawah", "Bangunan"
  kelasTanah?: string
}

// ─── Main Akta record ─────────────────────────────────────────────────────

export interface Akta {
  id: string
  tipeAkta: TipeAkta
  kategori: KategoriNotaris | KategoriPPAT
  nomorAkta: string
  tanggalAkta: string      // ISO date
  perihal: string
  statusUmum: StatusUmum
  pihak: Pihak[]
  saksi?: Saksi[]
  objekTanah?: ObjekTanah  // PPAT only
  dokumen?: DokumenPendukung[]
  pajak?: DataPajak
  workflowPPAT?: WorkflowPPAT
  workflowNotaris?: WorkflowNotaris
  catatan: string
  lokasiKantor?: string
  createdAt: string
  updatedAt: string
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalNotaris: number
  totalPPAT: number
  totalProses: number
  totalSelesai: number
  totalTertunda: number
  totalDibatalkan: number
  aktaTerbaru: Akta[]
}
