// ── e-NotarisKu Pro — Auth Service (localStorage-based) ──────────────────────
// Default credentials: username "admin" / password "notaris2025"
// Recovery via security question (offline — no email server needed).

export interface User {
  id: string
  username: string
  passwordHash: string       // btoa hash — sufficient for local offline app
  namaLengkap: string
  jabatan: string            // e.g. "Notaris & PPAT", "Staff"
  initials: string
  securityQuestion: string   // e.g. "Nama ibu kandung Anda?"
  securityAnswerHash: string // hashed answer (lowercase-trimmed)
}

export interface Session {
  userId: string
  username: string
  namaLengkap: string
  jabatan: string
  initials: string
  loginAt: string
}

export const SECURITY_QUESTIONS = [
  "Siapa nama ibu kandung Anda?",
  "Apa nama kota kelahiran Anda?",
  "Apa nama sekolah dasar Anda?",
  "Siapa nama hewan peliharaan pertama Anda?",
  "Apa nama jalan tempat Anda dibesarkan?",
  "Apa makanan favorit Anda semasa kecil?",
] as const

const USERS_KEY   = "enotariskupro_users"
const SESSION_KEY = "enotariskupro_session"

// ── simple hash / compare ────────────────────────────────────────────────────
function hashPassword(plain: string): string {
  return btoa(encodeURIComponent(plain))
}

function checkPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash
}

function hashAnswer(plain: string): string {
  // Normalize: lowercase + trim before hashing
  return btoa(encodeURIComponent(plain.toLowerCase().trim()))
}

function checkAnswer(plain: string, hash: string): boolean {
  return hashAnswer(plain) === hash
}

// ── seed default users ────────────────────────────────────────────────────────
const DEFAULT_USERS: User[] = [
  {
    id:                  "user-001",
    username:            "admin",
    passwordHash:        hashPassword("notaris2025"),
    namaLengkap:         "Admin Kantor",
    jabatan:             "Notaris & PPAT",
    initials:            "AK",
    securityQuestion:    "Siapa nama ibu kandung Anda?",
    securityAnswerHash:  hashAnswer("sari"),
  },
  {
    id:                  "user-002",
    username:            "staff",
    passwordHash:        hashPassword("staff123"),
    namaLengkap:         "Staff Kantor",
    jabatan:             "Staff",
    initials:            "SK",
    securityQuestion:    "Apa nama kota kelahiran Anda?",
    securityAnswerHash:  hashAnswer("jakarta"),
  },
]

function loadUsers(): User[] {
  if (typeof window === "undefined") return DEFAULT_USERS
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return DEFAULT_USERS
    return JSON.parse(raw) as User[]
  } catch {
    return DEFAULT_USERS
  }
}

function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function ensureUsers(): void {
  if (typeof window === "undefined") return
  const existing = localStorage.getItem(USERS_KEY)
  if (!existing) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
  } else {
    // Migrate existing users that are missing security fields
    try {
      const users = JSON.parse(existing) as User[]
      let changed = false
      users.forEach((u) => {
        if (!u.securityQuestion) {
          u.securityQuestion   = SECURITY_QUESTIONS[0]
          u.securityAnswerHash = hashAnswer("sari")
          changed = true
        }
      })
      if (changed) saveUsers(users)
    } catch { /* ignore */ }
  }
}

// ── public API ────────────────────────────────────────────────────────────────

export const authService = {
  init(): void {
    ensureUsers()
  },

  login(username: string, password: string): Session | null {
    ensureUsers()
    const users = loadUsers()
    const user  = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (!user) return null
    if (!checkPassword(password, user.passwordHash)) return null

    const session: Session = {
      userId:      user.id,
      username:    user.username,
      namaLengkap: user.namaLengkap,
      jabatan:     user.jabatan,
      initials:    user.initials,
      loginAt:     new Date().toISOString(),
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  },

  logout(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(SESSION_KEY)
  },

  getSession(): Session | null {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      return JSON.parse(raw) as Session
    } catch {
      return null
    }
  },

  isLoggedIn(): boolean {
    return !!authService.getSession()
  },

  // ── Recovery: Lupa Password ─────────────────────────────────────────────────

  /** Verify security answer without changing anything. True = correct. */
  verifySecurityAnswer(username: string, answer: string): boolean {
    ensureUsers()
    const users = loadUsers()
    const user  = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (!user) return false
    return checkAnswer(answer, user.securityAnswerHash)
  },

  /** Step 1 — find user by username and return their security question */
  getSecurityQuestionByUsername(username: string): string | null {
    ensureUsers()
    const users = loadUsers()
    const user  = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    return user ? user.securityQuestion : null
  },

  /** Step 2 — verify answer, then set new password. Returns true on success. */
  resetPasswordWithAnswer(
    username: string,
    answer: string,
    newPassword: string,
  ): boolean {
    ensureUsers()
    const users = loadUsers()
    const idx   = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase())
    if (idx === -1) return false
    if (!checkAnswer(answer, users[idx].securityAnswerHash)) return false
    users[idx].passwordHash = hashPassword(newPassword)
    saveUsers(users)
    return true
  },

  // ── Account management (for logged-in users) ───────────────────────────────

  /** Verify a user's current password (used before allowing sensitive changes). */
  verifyCurrentPassword(username: string, password: string): boolean {
    ensureUsers()
    const users = loadUsers()
    const user  = users.find((u) => u.username.toLowerCase() === username.toLowerCase())
    if (!user) return false
    return checkPassword(password, user.passwordHash)
  },

  /** Change password for an already-authenticated user. */
  changePassword(username: string, newPassword: string): boolean {
    ensureUsers()
    const users = loadUsers()
    const idx   = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase())
    if (idx === -1) return false
    users[idx].passwordHash = hashPassword(newPassword)
    saveUsers(users)
    return true
  },

  /** Update security question and answer for an authenticated user. */
  updateSecurityQuestion(username: string, question: string, answer: string): boolean {
    ensureUsers()
    const users = loadUsers()
    const idx   = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase())
    if (idx === -1) return false
    users[idx].securityQuestion   = question
    users[idx].securityAnswerHash = hashAnswer(answer)
    saveUsers(users)
    return true
  },

  // ── User Management (admin only) ────────────────────────────────────────────

  /** Get all users (without password hashes). Admin use only. */
  getAllUsers(): Omit<User, "passwordHash" | "securityAnswerHash">[] {
    ensureUsers()
    return loadUsers().map(({ passwordHash: _ph, securityAnswerHash: _sa, ...rest }) => rest)
  },

  /** Create a new user. Returns null if username already taken. */
  createUser(data: {
    username: string
    password: string
    namaLengkap: string
    jabatan: string
    securityQuestion: string
    securityAnswer: string
  }): Omit<User, "passwordHash" | "securityAnswerHash"> | null {
    ensureUsers()
    const users = loadUsers()
    const exists = users.find((u) => u.username.toLowerCase() === data.username.toLowerCase())
    if (exists) return null

    const initials = data.namaLengkap
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("")

    const newUser: User = {
      id:                  `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username:            data.username.trim(),
      passwordHash:        hashPassword(data.password),
      namaLengkap:         data.namaLengkap.trim(),
      jabatan:             data.jabatan.trim(),
      initials:            initials || data.username.slice(0, 2).toUpperCase(),
      securityQuestion:    data.securityQuestion,
      securityAnswerHash:  hashAnswer(data.securityAnswer),
    }
    saveUsers([...users, newUser])
    const { passwordHash: _ph, securityAnswerHash: _sa, ...safe } = newUser
    return safe
  },

  /** Update a user's profile fields (namaLengkap, jabatan). */
  updateUserProfile(
    userId: string,
    patch: { namaLengkap?: string; jabatan?: string },
  ): boolean {
    ensureUsers()
    const users = loadUsers()
    const idx   = users.findIndex((u) => u.id === userId)
    if (idx === -1) return false
    if (patch.namaLengkap) {
      users[idx].namaLengkap = patch.namaLengkap.trim()
      users[idx].initials    = patch.namaLengkap
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    }
    if (patch.jabatan !== undefined) users[idx].jabatan = patch.jabatan.trim()
    saveUsers(users)
    return true
  },

  /** Admin: reset another user's password directly (no verification needed). */
  adminResetPassword(userId: string, newPassword: string): boolean {
    ensureUsers()
    const users = loadUsers()
    const idx   = users.findIndex((u) => u.id === userId)
    if (idx === -1) return false
    users[idx].passwordHash = hashPassword(newPassword)
    saveUsers(users)
    return true
  },

  /** Delete a user by ID. Cannot delete yourself. */
  deleteUser(userId: string, currentUserId: string): boolean {
    if (userId === currentUserId) return false // can't delete yourself
    ensureUsers()
    const users   = loadUsers()
    const updated = users.filter((u) => u.id !== userId)
    if (updated.length === users.length) return false
    saveUsers(updated)
    return true
  },

  // ── Recovery: Lupa Username ─────────────────────────────────────────────────

  /** Step 1 — find user by full name (case-insensitive) and return question */
  getSecurityQuestionByName(namaLengkap: string): string | null {
    ensureUsers()
    const users = loadUsers()
    const user  = users.find(
      (u) => u.namaLengkap.toLowerCase() === namaLengkap.toLowerCase().trim(),
    )
    return user ? user.securityQuestion : null
  },

  /** Step 2 — verify answer, then reveal username. Returns username or null. */
  getUsernameWithAnswer(namaLengkap: string, answer: string): string | null {
    ensureUsers()
    const users = loadUsers()
    const user  = users.find(
      (u) => u.namaLengkap.toLowerCase() === namaLengkap.toLowerCase().trim(),
    )
    if (!user) return null
    if (!checkAnswer(answer, user.securityAnswerHash)) return null
    return user.username
  },
}
