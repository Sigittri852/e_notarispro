"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit3, Scale, MapPin } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import AktaForm from "@/components/AktaForm"
import AuthGuard from "@/components/AuthGuard"
import { aktaService } from "@/lib/storage"
import type { Akta } from "@/lib/types"

export default function EditAktaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [akta, setAkta] = useState<Akta | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    aktaService.init()
    const found = aktaService.getById(id)
    if (!found) setNotFound(true)
    else setAkta(found)
  }, [id])

  if (notFound) {
    return (
      <AuthGuard>
      <div className="flex min-h-screen bg-[#f0f4f8]">
        <Sidebar />
        <main className="flex-1 ml-64 flex flex-col items-center justify-center gap-4">
          <p className="text-slate-500 font-semibold">Akta tidak ditemukan.</p>
          <Link
            href="/akta"
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Kembali ke Daftar Akta
          </Link>
        </main>
      </div>
      </AuthGuard>
    )
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
          <div className="flex items-center gap-3">
            <Link
              href={`/akta/${akta.id}`}
              className="p-2 rounded-lg bg-white/15 text-white hover:bg-white/25 transition"
            >
              <ArrowLeft size={16} />
            </Link>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isPPAT ? "bg-orange-800/40" : "bg-blue-800/40"
              }`}
            >
              {isPPAT ? (
                <MapPin size={18} className="text-white" />
              ) : (
                <Scale size={18} className="text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Edit3 size={13} className="text-white/70" />
                <span className="text-white/70 text-xs font-medium">Edit Akta</span>
              </div>
              <h1 className="text-lg font-bold text-white mt-0.5 max-w-xl truncate">
                {akta.perihal}
              </h1>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-5xl">
          <AktaForm initial={akta} mode="edit" />
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
