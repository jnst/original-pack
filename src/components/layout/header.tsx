"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const { member, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return (
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Original Pack</h1>
            <div className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </header>
    )
  }

  if (!member) {
    return (
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-900">Original Pack</h1>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 hover:text-gray-700 cursor-pointer">
                Original Pack
              </h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                ホーム
              </Link>
              <Link href="/admin/inventory" className="text-sm text-gray-600 hover:text-gray-900">
                在庫管理
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">残高:</span>
              <Badge variant="secondary" className="text-lg font-semibold">
¥{member.balance.toLocaleString()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{member.name}</span>
              <Badge variant="outline">{member.rank}</Badge>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
