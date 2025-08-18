import { Coin, OripaId } from "../core/types"

export type OripaCategory = "Pachimon" | "AsobiKing"

export type Oripa = Readonly<{
  readonly id: OripaId
  readonly name: string
  readonly category: OripaCategory
  readonly price: Coin
  readonly totalSlots: number
  readonly remainingSlots: number
  readonly imageUrl?: string
  readonly isActive: boolean
}>

// オリパ状態判定
export const isAvailable = (oripa: Oripa): boolean => oripa.isActive && oripa.remainingSlots > 0

export const isSoldOut = (oripa: Oripa): boolean => oripa.remainingSlots === 0

// 在庫減算
export const decrementStock = (oripa: Oripa, count: number): Oripa => ({
  ...oripa,
  remainingSlots: Math.max(0, oripa.remainingSlots - count),
})
