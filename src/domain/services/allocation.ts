import type { Result } from "../core/types"
import type { CardId } from "../models/card"
import type { GachaType } from "../models/gacha"

export type AllocationError = "Allocation.InsufficientCards" | "Allocation.InvalidQuantity"

export type CardAllocation = Readonly<{
  cardId: CardId
  quantity: number
}>

export const allocateCards = (
  availableCardIds: ReadonlyArray<CardId>,
  gachaType: GachaType
): Result<ReadonlyArray<CardAllocation>, AllocationError> => {
  const quantity = getQuantityForGachaType(gachaType)

  if (quantity <= 0) {
    return { ok: false, error: "Allocation.InvalidQuantity" }
  }

  if (availableCardIds.length < quantity) {
    return { ok: false, error: "Allocation.InsufficientCards" }
  }

  const allocations: CardAllocation[] = availableCardIds
    .slice(0, quantity)
    .map((cardId) => ({ cardId, quantity: 1 }))

  return { ok: true, value: allocations }
}

const getQuantityForGachaType = (gachaType: GachaType): number => {
  switch (gachaType) {
    case "SINGLE":
      return 1
    case "TEN":
      return 10
    case "HUNDRED":
      return 100
    default:
      return 0
  }
}

export const calculateAllocationCost = (
  allocations: ReadonlyArray<CardAllocation>,
  pricePerUnit: number
): number =>
  allocations.reduce((total, allocation) => total + allocation.quantity * pricePerUnit, 0)
