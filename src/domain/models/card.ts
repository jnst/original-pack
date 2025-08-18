import { CardId, CardInventoryId, GachaId, MemberId, OripaId } from "../core/types"

export type CardRarity = "S" | "A" | "B" | "C" | "D" | "E"

export type Card = Readonly<{
  readonly id: CardId
  readonly name: string
  readonly rarity: CardRarity
  readonly imageUrl?: string
}>

export type CardInventoryStatus = "available" | "allocated"

export type CardInventory = Readonly<{
  readonly id: CardInventoryId
  readonly cardId: CardId
  readonly oripaId: OripaId
  readonly status: CardInventoryStatus
  readonly allocatedTo?: MemberId
  readonly gachaId?: GachaId
}>

// カードのレアリティ順序
export const rarityOrder: Record<CardRarity, number> = {
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
  E: 6,
}

// レアリティでソート
export const sortByRarity = (cards: readonly Card[]): readonly Card[] =>
  [...cards].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])
