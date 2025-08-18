"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CardData {
  id: string
  name: string
  prizeRank: string
  condition: string
  value: number
  imageUrl: string | null
}

interface GachaResult {
  id: string
  gachaType: string
  totalCost: number
  cards: CardData[]
  createdAt: string
}

interface GachaResultModalProps {
  result: GachaResult
  onClose: () => void
  onPlayAgain: () => void
}

export function GachaResultModal({ result, onClose, onPlayAgain }: GachaResultModalProps) {
  const getGachaTypeLabel = (gachaType: string) => {
    switch (gachaType) {
      case "SINGLE":
        return "1回"
      case "TEN":
        return "10連"
      case "HUNDRED":
        return "100連"
      default:
        return gachaType
    }
  }

  const getPrizeRankColor = (prizeRank: string) => {
    switch (prizeRank) {
      case "S":
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case "A":
        return "bg-gradient-to-r from-red-400 to-red-600 text-white"
      case "B":
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
      case "C":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white"
      case "D":
        return "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
      case "E":
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const totalValue = result.cards.reduce((sum, card) => sum + card.value, 0)
  const profitLoss = totalValue - result.totalCost
  const isProfitable = profitLoss > 0

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">🎉 ガチャ結果 🎉</DialogTitle>
          <DialogDescription className="text-center">
            {getGachaTypeLabel(result.gachaType)}ガチャの結果です
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-center items-center gap-4 mb-2">
              <div>
                <span className="text-sm text-gray-600">使用金額</span>
                <p className="text-lg font-bold">¥{result.totalCost.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">獲得価値</span>
                <p className="text-lg font-bold">¥{totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div
              className={`text-xl font-bold ${isProfitable ? "text-green-600" : "text-red-600"}`}
            >
              {isProfitable ? "+" : ""}¥{profitLoss.toLocaleString()}
              {isProfitable ? " 🎊" : " 😅"}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">獲得カード ({result.cards.length}枚)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.cards.map((card, index) => (
                <Card key={`${card.id}-${index}`} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm leading-tight">{card.name}</h4>
                        <div className="flex gap-1 mt-2">
                          <Badge className={`text-xs ${getPrizeRankColor(card.prizeRank)}`}>
                            {card.prizeRank}賞
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {card.condition}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <span className="text-sm font-bold">¥{card.value.toLocaleString()}</span>
                      </div>
                    </div>

                    {card.imageUrl && (
                      <div className="mt-3 relative h-24">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          className="object-cover rounded"
                          fill={true}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              閉じる
            </Button>
            <Button onClick={onPlayAgain} className="flex-1">
              もう一度引く
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
