"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "@/components/layout/header"
import { OripaList } from "@/components/oripa/oripa-list"
import { useAuth } from "@/hooks/use-auth"

export default function Home() {
  const { member, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !member) {
      router.push("/login")
    }
  }, [member, isLoading, router])

  if (isLoading) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">読み込み中...</div>
        </main>
      </div>
    )
  }

  if (!member) {
    return null
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">オリパ一覧</h2>
          <p className="text-gray-600">お気に入りのオリパを選んでガチャを楽しもう！</p>
        </div>
        <OripaList />
      </main>
    </div>
  )
}
