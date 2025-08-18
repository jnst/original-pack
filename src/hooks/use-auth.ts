"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export interface Member {
  id: string
  email: string
  name: string
  rank: string
  balance: number
}

export function useAuth() {
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
      } else {
        setMember(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setMember(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
        router.push("/")
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error: "ログインに失敗しました" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setMember(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const refreshMember = async () => {
    await checkAuth()
  }

  return {
    member,
    isLoading,
    login,
    logout,
    refreshMember,
  }
}
