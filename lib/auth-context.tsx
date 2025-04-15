"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  name: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [pathname])

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
        if (pathname?.startsWith("/dashboard")) {
          router.push("/login")
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
        credentials: "include"
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Registrace selhala")
      }

      const data = await res.json()
      setUser(data.user)
      toast.success("Registrace úspěšná")
      router.push("/dashboard")
    } catch (error) {
      console.error("Signup failed:", error)
      toast.error(error instanceof Error ? error.message : "Registrace selhala")
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Přihlášení selhalo")
      }

      const data = await res.json()
      setUser(data.user)
      toast.success("Přihlášení úspěšné")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login failed:", error)
      toast.error(error instanceof Error ? error.message : "Přihlášení selhalo")
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      })
      setUser(null)
      toast.success("Odhlášení úspěšné")
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Odhlášení selhalo")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
