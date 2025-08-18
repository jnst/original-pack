import { CardInventoryId, Coin, GachaId, GachaResultId, MemberId, OripaId } from "../core/types"

export type { GachaResultId } from "../core/types"
export type GachaType = "SINGLE" | "TEN" | "HUNDRED"
export type GachaDrawCount = 1 | 10 | 100

export type Gacha = Readonly<{
  readonly id: GachaId
  readonly memberId: MemberId
  readonly oripaId: OripaId
  readonly drawCount: GachaDrawCount
  readonly totalCost: Coin
  readonly cardInventoryIds: readonly CardInventoryId[]
  readonly createdAt: Date
}>

export type GachaResult = Readonly<{
  readonly id: GachaResultId
  readonly memberId: MemberId
  readonly oripaId: OripaId
  readonly gachaType: GachaType
  readonly totalCost: Coin
  readonly createdAt: Date
}>

// ガチャ結果作成
export const createGachaResult = (
  id: GachaId,
  memberId: MemberId,
  oripaId: OripaId,
  drawCount: GachaDrawCount,
  totalCost: Coin,
  cardInventoryIds: readonly CardInventoryId[]
): Gacha => ({
  id,
  memberId,
  oripaId,
  drawCount,
  totalCost,
  cardInventoryIds,
  createdAt: new Date(),
})
