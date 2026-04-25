// ─── Profil Kantor (localStorage) ────────────────────────────────────────────

const KEY = "enotariskupro_kantor"

export interface ProfilKantor {
  namaKantor: string       // "Kantor Notaris & PPAT Hj. Sari Dewi, S.H., M.Kn."
  namaNotaris: string      // "Hj. Sari Dewi, S.H., M.Kn."
  nomorSK: string          // Nomor SK Pengangkatan
  wilayahKerja: string     // "Kota Jakarta Selatan, Prov. DKI Jakarta"
  alamat: string           // Jl. ...
  kelurahan: string
  kecamatan: string
  kota: string
  provinsi: string
  kodePos: string
  telepon: string          // (021) 123-4567
  hp: string               // 0812-xxxx-xxxx
  fax: string
  email: string
  website: string
  logoUrl: string          // base64 data URL (opsional)
}

export const defaultKantor: ProfilKantor = {
  namaKantor: "Kantor Notaris & PPAT",
  namaNotaris: "",
  nomorSK: "",
  wilayahKerja: "",
  alamat: "",
  kelurahan: "",
  kecamatan: "",
  kota: "",
  provinsi: "",
  kodePos: "",
  telepon: "",
  hp: "",
  fax: "",
  email: "",
  website: "",
  logoUrl: "",
}

export function getKantor(): ProfilKantor {
  if (typeof window === "undefined") return defaultKantor
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultKantor
    return { ...defaultKantor, ...JSON.parse(raw) }
  } catch {
    return defaultKantor
  }
}

export function saveKantor(data: ProfilKantor): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getAlamatLengkap(k: ProfilKantor): string {
  const parts = [
    k.alamat,
    k.kelurahan && `Kel. ${k.kelurahan}`,
    k.kecamatan && `Kec. ${k.kecamatan}`,
    k.kota,
    k.provinsi,
    k.kodePos,
  ].filter(Boolean)
  return parts.join(", ")
}

export function getKontakLine(k: ProfilKantor): string {
  const parts: string[] = []
  if (k.telepon) parts.push(`Telp. ${k.telepon}`)
  if (k.hp) parts.push(`HP/WA. ${k.hp}`)
  if (k.fax) parts.push(`Fax. ${k.fax}`)
  if (k.email) parts.push(k.email)
  if (k.website) parts.push(k.website)
  return parts.join(" \u2022 ")
}
