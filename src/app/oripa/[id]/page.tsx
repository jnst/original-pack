"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { GachaResultModal } from "@/components/gacha/gacha-result-modal"
import { Header } from "@/components/layout/header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

interface CardData {
  id: string
  name: string
  prizeRank: string
  condition: string
  value: number
  imageUrl: string | null
}

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
  cards: CardData[]
}

interface GachaResult {
  id: string
  gachaType: string
  totalCost: number
  cards: CardData[]
  createdAt: string
}

export default function OripaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { member, refreshMember, isLoading: authLoading } = useAuth()
  const [oripa, setOripa] = useState<Oripa | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null)
  const [error, setError] = useState("")

  const fetchOripa = useCallback(async () => {
    try {
      const response = await fetch(`/api/oripas/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setOripa(data.oripa)
      } else {
        setError("オリパが見つかりませんでした")
      }
    } catch (error) {
      console.error("Failed to fetch oripa:", error)
      setError("データの取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (!authLoading && !member) {
      router.push("/login")
      return
    }

    if (params.id) {
      fetchOripa()
    }
  }, [params.id, member, authLoading, router, fetchOripa])

  const executeGacha = async (gachaType: "SINGLE" | "TEN" | "HUNDRED") => {
    if (!oripa || !member) {
      return
    }

    const cost = getCost(gachaType)
    if (member.balance < cost) {
      setError("残高が不足しています")
      return
    }

    setIsExecuting(true)
    setError("")

    try {
      const response = await fetch("/api/gacha/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oripaId: oripa.id,
          gachaType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setGachaResult(data.gachaResult)
        await refreshMember()
        await fetchOripa() // Update remaining slots
      } else {
        const errorData = await response.json()
        setError(errorData.error || "ガチャの実行に失敗しました")
      }
    } catch (error) {
      console.error("Gacha execution failed:", error)
      setError("ガチャの実行に失敗しました")
    } finally {
      setIsExecuting(false)
    }
  }

  const getCost = (gachaType: "SINGLE" | "TEN" | "HUNDRED") => {
    if (!oripa) {
      return 0
    }

    switch (gachaType) {
      case "SINGLE":
        return oripa.price
      case "TEN":
        return oripa.price * 10
      case "HUNDRED":
        return oripa.price * 100
      default:
        return 0
    }
  }

  const getGachaTypeLabel = (gachaType: "SINGLE" | "TEN" | "HUNDRED") => {
    switch (gachaType) {
      case "SINGLE":
        return "1回"
      case "TEN":
        return "10連"
      case "HUNDRED":
        return "100連"
      default:
        return ""
    }
  }

  if (authLoading || isLoading) {
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

  if (error && !oripa) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  if (!oripa) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">オリパが見つかりませんでした</div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()}>
            ← 戻る
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{oripa.title}</CardTitle>
                    <CardDescription>{oripa.description || "説明なし"}</CardDescription>
                  </div>
                  <Badge variant="secondary">{oripa.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-600">価格</span>
                    <p className="text-2xl font-bold">¥{oripa.price}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">還元率</span>
                    <p className="text-2xl font-bold">{oripa.rewardRate}%</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">残り口数</span>
                    <p className="text-xl font-semibold">
                      {oripa.remainingSlots} / {oripa.totalSlots}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">進行状況</span>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${(oripa.remainingSlots / oripa.totalSlots) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">ガチャを引く</h3>

                  {["SINGLE", "TEN", "HUNDRED"].map((type) => {
                    const gachaType = type as "SINGLE" | "TEN" | "HUNDRED"
                    const cost = getCost(gachaType)
                    const canAfford = member.balance >= cost
                    const hasSlots = oripa.remainingSlots > 0

                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{getGachaTypeLabel(gachaType)}</p>
                          <p className="text-sm text-gray-600">¥{cost.toLocaleString()}</p>
                        </div>
                        <Button
                          onClick={() => executeGacha(gachaType)}
                          disabled={!canAfford || !hasSlots || isExecuting}
                          className="min-w-24"
                        >
                          {isExecuting ? "実行中..." : "引く"}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>封入カード</CardTitle>
                <CardDescription>このオリパに含まれるカードの一部</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {oripa.cards.slice(0, 5).map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{card.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {card.prizeRank}賞
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {card.condition}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">¥{card.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {oripa.cards.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      他 {oripa.cards.length - 5} 枚
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {gachaResult && (
          <GachaResultModal
            result={gachaResult}
            onClose={() => setGachaResult(null)}
            onPlayAgain={() => {
              setGachaResult(null)
              // Re-enable gacha buttons
            }}
          />
        )}
      </main>
    </div>
  )
}
