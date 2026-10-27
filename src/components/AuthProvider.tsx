import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { api, errorMessage, type User } from "@/lib/api"

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  signIn: (user: User) => void
  signOut: () => Promise<void>
}
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<{ user: User | null }>("/auth/session")
      setUser(data.user)
      setError(null)
    } catch (failure) {
      setError(errorMessage(failure))
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  async function signOut() {
    await api("/auth/logout", { method: "POST", body: {} })
    setUser(null)
    setError(null)
  }

  return <AuthContext.Provider value={{ user, loading, error, refresh, signIn: setUser, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth requires AuthProvider")
  return context
}
