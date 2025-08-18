"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Oripa {
  id: string
  title: string
  description: string | null
  category: string
  price: number
  totalSlots: number
  remainingSlots: number
  rewardRate: number
  isActive: boolean
  createdAt: string
}

export function OripaList() {
  const [oripas, setOripas] = useState<Oripa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const fetchOripas = useCallback(async () => {
    try {
      const url =
        selectedCategory === "all" ? "/api/oripas" : `/api/oripas?category=${selectedCategory}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setOripas(data.oripas)
      }
    } catch (error) {
      console.error("Failed to fetch oripas:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchOripas()
  }, [fetchOripas])

  const categories = [
    { id: "all", label: "すべて" },
    { id: "Pachimon", label: "Pachimon" },
    { id: "AsobiKing", label: "AsobiKing" },
  ]

  if (isLoading) {
    const skeletonCards = Array.from({ length: 6 }, (_, i) => (
      <Card key={`loading-skeleton-${i + 1}`} className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    ))

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{skeletonCards}</div>
    )
  }

  return (
    <div>
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {oripas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">オリパが見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oripas.map((oripa) => (
            <Link key={oripa.id} href={`/oripa/${oripa.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{oripa.title}</CardTitle>
                      <CardDescription>{oripa.description || "説明なし"}</CardDescription>
                    </div>
                    <Badge variant="secondary">{oripa.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">価格</span>
                      <span className="font-semibold text-lg">¥{oripa.price}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">残り口数</span>
                      <span className="font-medium">
                        {oripa.remainingSlots} / {oripa.totalSlots}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(oripa.remainingSlots / oripa.totalSlots) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">還元率</span>
                      <Badge variant="outline">{oripa.rewardRate}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
