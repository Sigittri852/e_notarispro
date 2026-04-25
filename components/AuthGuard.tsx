"use client"

import { Scale, MapPin } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"

/**
 * Wrap any page that requires authentication.
 * While loading: shows branded spinner.
 * Not logged in: renders nothing (redirect handled by AuthContext).
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e3a8a]">
        <div className="flex flex-col items-center gap-5">
          {/* Brand icons */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              <Scale size={26} className="text-white" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <MapPin size={26} className="text-orange-300" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">e-NotarisKu Pro</p>
            <p className="text-blue-300 text-xs mt-0.5">Memuat sesi...</p>
          </div>
          <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
