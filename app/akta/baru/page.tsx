"use client"

import Sidebar from "@/components/Sidebar"
import AktaForm from "@/components/AktaForm"
import AuthGuard from "@/components/AuthGuard"
import { FileText, Scale, MapPin } from "lucide-react"

export default function InputAktaBaruPage() {
  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Input Akta Baru</h1>
                <p className="text-blue-200 text-xs mt-0.5">Pilih tipe, isi data, lalu simpan</p>
              </div>
            </div>
            {/* Type legend */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <Scale size={13} className="text-blue-200" />
                <span className="text-blue-100 text-xs font-semibold">Notariil</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                <MapPin size={13} className="text-orange-300" />
                <span className="text-orange-200 text-xs font-semibold">PPAT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-5xl">
          <AktaForm mode="create" />
        </div>
      </main>
    </div>
    </AuthGuard>
  )
}
