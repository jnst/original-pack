import { v4 as uuidv4 } from "uuid"
import type { Result } from "../core/types"
import type { Card } from "../models/card"
import type { GachaResult, GachaResultId, GachaType } from "../models/gacha"
import type { MemberId } from "../models/member"
import type { OripaId } from "../models/oripa"
import { type AllocationError, allocateCards, calculateAllocationCost } from "./allocation"
import { executeGacha } from "./gacha"

export type GachaEngineError =
  | AllocationError
  | "GachaEngine.InsufficientBalance"
  | "GachaEngine.OripaNotFound"
  | "GachaEngine.OripaInactive"

export type GachaExecutionResult = Readonly<{
  gachaResult: GachaResult
  allocatedCards: ReadonlyArray<Card>
  totalCost: number
}>

export type GachaEngineParams = Readonly<{
  memberId: MemberId
  oripaId: OripaId
  gachaType: GachaType
  availableCards: ReadonlyArray<Card>
  memberBalance: number
  pricePerUnit: number
}>

export const executeGachaEngine = (
  params: GachaEngineParams
): Result<GachaExecutionResult, GachaEngineError> => {
  const { memberId, oripaId, gachaType, availableCards, memberBalance, pricePerUnit } = params

  if (availableCards.length === 0) {
    return { ok: false, error: "Allocation.InsufficientCards" }
  }

  const shuffledCardIds = executeGacha(availableCards.map((card) => card.id))
  if (!shuffledCardIds.ok) {
    return { ok: false, error: "Allocation.InsufficientCards" }
  }

  const allocation = allocateCards(shuffledCardIds.value, gachaType)
  if (!allocation.ok) {
    return { ok: false, error: allocation.error }
  }

  const totalCost = calculateAllocationCost(allocation.value, pricePerUnit)

  if (memberBalance < totalCost) {
    return { ok: false, error: "GachaEngine.InsufficientBalance" }
  }

  const allocatedCardIds = allocation.value.map((a) => a.cardId)
  const allocatedCards = availableCards.filter((card) => allocatedCardIds.includes(card.id))

  const gachaResult: GachaResult = {
    id: uuidv4() as GachaResultId,
    memberId,
    oripaId,
    gachaType,
    totalCost,
    createdAt: new Date(),
  }

  return {
    ok: true,
    value: {
      gachaResult,
      allocatedCards,
      totalCost,
    },
  }
}
