"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface InventoryItem {
  id: string
  title: string
  category: string
  price: number
  totalSlots: number
  remainingSlots: number
  soldSlots: number
  availableCards: number
  salesRate: string
  status: "sold_out" | "low_stock" | "in_stock"
  isActive: boolean
  createdAt: string
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory)
      } else {
        setError("在庫データの取得に失敗しました")
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error)
      setError("在庫データの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sold_out":
        return <Badge variant="destructive">売り切れ</Badge>
      case "low_stock":
        return <Badge variant="outline">残り僅か</Badge>
      case "in_stock":
        return <Badge variant="secondary">在庫あり</Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Pachimon":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Pachimon
          </Badge>
        )
      case "AsobiKing":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            AsobiKing
          </Badge>
        )
      default:
        return <Badge variant="outline">{category}</Badge>
    }
  }

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.soldSlots * item.price, 0)
  const totalSlots = inventory.reduce((sum, item) => sum + item.totalSlots, 0)
  const totalSoldSlots = inventory.reduce((sum, item) => sum + item.soldSlots, 0)
  const overallSalesRate = totalSlots > 0 ? ((totalSoldSlots / totalSlots) * 100).toFixed(1) : "0"

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">在庫管理</h1>
        <p className="text-gray-600">オリパの在庫状況を確認できます</p>
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総売上</CardDescription>
            <CardTitle className="text-2xl">¥{totalInventoryValue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>販売率</CardDescription>
            <CardTitle className="text-2xl">{overallSalesRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総口数</CardDescription>
            <CardTitle className="text-2xl">{totalSlots.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>売却済</CardDescription>
            <CardTitle className="text-2xl">{totalSoldSlots.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 在庫一覧テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>オリパ在庫一覧</CardTitle>
          <CardDescription>各オリパの在庫状況と販売状況</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>オリパ名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>価格</TableHead>
                <TableHead>在庫状況</TableHead>
                <TableHead>残り口数</TableHead>
                <TableHead>販売率</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{getCategoryBadge(item.category)}</TableCell>
                  <TableCell>¥{item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {item.remainingSlots} / {item.totalSlots}
                      </div>
                      <div className="text-gray-500">利用可能カード: {item.availableCards}枚</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(item.remainingSlots / item.totalSlots) * 100}%`,
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{item.salesRate}%</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
