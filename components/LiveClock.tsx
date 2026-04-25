"use client"

import { useEffect, useState } from "react"
import { formatTanggalPanjang, formatJam } from "@/lib/dateUtils"

interface LiveClockProps {
  /** "full" = tanggal + jam | "date" = tanggal saja | "time" = jam saja */
  mode?: "full" | "date" | "time"
  className?: string
}

export default function LiveClock({ mode = "full", className = "" }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null)

  // Inisialisasi setelah mount untuk menghindari hydration mismatch
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sebelum mount tampilkan placeholder agar tidak flicker
  if (!now) {
    return <span className={className} style={{ opacity: 0 }}>--</span>
  }

  if (mode === "date") return <span className={className}>{formatTanggalPanjang(now)}</span>
  if (mode === "time") return <span className={className}>{formatJam(now)}</span>

  return (
    <span className={className}>
      {formatTanggalPanjang(now)}{" "}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatJam(now)}</span>
      {" "}WIB
    </span>
  )
}
