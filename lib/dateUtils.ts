/**
 * dateUtils.ts
 * Centralized date/time helpers — Bahasa Indonesia locale.
 * All functions return dynamic values based on actual current time.
 */

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
]

/** e.g. "Kamis, 24 April 2026" */
export function formatTanggalPanjang(d: Date = new Date()): string {
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

/** e.g. "24 Apr 2026" */
export function formatTanggalPendek(d: Date = new Date()): string {
  return `${String(d.getDate()).padStart(2, "0")} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

/** e.g. "14:35:09" */
export function formatJam(d: Date = new Date()): string {
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")
}

/** e.g. "14:35" */
export function formatJamPendek(d: Date = new Date()): string {
  return [d.getHours(), d.getMinutes()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")
}

/** e.g. "Kamis, 24 April 2026 — 14:35:09 WIB" */
export function formatLengkap(d: Date = new Date()): string {
  return `${formatTanggalPanjang(d)} — ${formatJam(d)} WIB`
}

/** Greeting based on current hour */
export function salam(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 12) return "Selamat Pagi"
  if (h < 15) return "Selamat Siang"
  if (h < 18) return "Selamat Sore"
  return "Selamat Malam"
}

/** Format ISO date string → "24 Januari 2026" */
export function isoToTanggalPanjang(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

/** Format ISO date string → "24 Jan 2026" */
export function isoToTanggalPendek(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")} ${BULAN[d.getMonth()].slice(0,3)} ${d.getFullYear()}`
}
