import { CardInventoryId, Coin, GachaId, MemberId, OripaId } from "../core/types"

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
