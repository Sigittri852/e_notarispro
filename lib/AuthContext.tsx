"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session } from "./auth"
import { authService } from "./auth"

interface AuthContextValue {
  session: Session | null
  loading: boolean
  logout: () => void
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  logout: () => {},
  refreshSession: () => {},
})

// All paths that do NOT require authentication
const PUBLIC_PATHS = ["/login", "/login/lupa-password", "/login/lupa-username"]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router   = useRouter()
  const pathname = usePathname()
  // prevent double-redirect on strict mode double-effect
  const redirecting = useRef(false)

  const refreshSession = useCallback(() => {
    const s = authService.getSession()
    setSession(s)
    return s
  }, [])

  // ── Initial session load & route guard ────────────────────────────────────
  useEffect(() => {
    authService.init()
    const s = refreshSession()
    setLoading(false)

    if (!s && !isPublic(pathname) && !redirecting.current) {
      redirecting.current = true
      router.replace("/login")
    } else if (s && isPublic(pathname) && !redirecting.current) {
      redirecting.current = true
      router.replace("/")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Reset redirecting flag when pathname settles
  useEffect(() => {
    redirecting.current = false
  }, [pathname])

  // ── Cross-tab / cross-window sync via storage events ──────────────────────
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      // Session key changed in another tab
      if (e.key === "enotariskupro_session") {
        const s = authService.getSession()
        setSession(s)
        if (!s && !isPublic(pathname)) {
          router.replace("/login")
        }
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [pathname, router])

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
    redirecting.current = true
    router.replace("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ session, loading, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
