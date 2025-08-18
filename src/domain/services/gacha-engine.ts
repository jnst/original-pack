import { v4 as uuidv4 } from "uuid"
import type { Result } from "../core/types"
import type { Card } from "../models/card"
import type { GachaResult, GachaResultId, GachaType } from "../models/gacha"
import type { MemberId } from "../models/member"
import type { OripaId } from "../models/oripa"
// Fisher-Yates shuffle algorithm for fair random selection
const shuffleArray = <T>(array: readonly T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export type GachaEngineError =
  | "GachaEngine.InsufficientCards"
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
    return { ok: false, error: "GachaEngine.InsufficientCards" }
  }

  const shuffledCards = shuffleArray(availableCards)
  const drawCount = gachaType === "SINGLE" ? 1 : gachaType === "TEN" ? 10 : 100
  
  if (shuffledCards.length < drawCount) {
    return { ok: false, error: "GachaEngine.InsufficientCards" }
  }
  
  const selectedCards = shuffledCards.slice(0, drawCount)
  const totalCost = pricePerUnit * drawCount

  if (memberBalance < totalCost) {
    return { ok: false, error: "GachaEngine.InsufficientBalance" }
  }

  const allocatedCards = selectedCards

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
