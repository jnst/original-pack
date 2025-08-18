import { Coin, GachaId, Result } from "../core/types"
import { CardInventory } from "../models/card"
import { createGachaResult, Gacha, GachaDrawCount } from "../models/gacha"
import { Member, subtractCoin } from "../models/member"
import { isAvailable, Oripa } from "../models/oripa"

export type GachaError =
  | "Gacha.OripaNotAvailable"
  | "Gacha.InsufficientStock"
  | "Gacha.InsufficientBalance"
  | "Gacha.NoAvailableCards"

// ガチャ実行サービス
export type GachaService = {
  readonly draw: (
    member: Member,
    oripa: Oripa,
    drawCount: GachaDrawCount,
    availableCards: readonly CardInventory[]
  ) => Result<
    {
      readonly gacha: Gacha
      readonly updatedMember: Member
      readonly drawnCards: readonly CardInventory[]
    },
    GachaError
  >
}

// ランダム選択（Fisher-Yates shuffle の変形）
const selectRandom = <T>(items: readonly T[], count: number): readonly T[] => {
  const shuffled = [...items]
  const selected: T[] = []

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const randomIndex = Math.floor(Math.random() * (shuffled.length - i)) + i
    ;[shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]]
    selected.push(shuffled[i])
  }

  return selected
}

export const createGachaService = (generateId: () => string): GachaService => ({
  draw: (member, oripa, drawCount, availableCards) => {
    // オリパが利用可能かチェック
    if (!isAvailable(oripa)) {
      return { ok: false, error: "Gacha.OripaNotAvailable" }
    }

    // 在庫チェック
    if (availableCards.length < drawCount) {
      return { ok: false, error: "Gacha.InsufficientStock" }
    }

    // 費用計算
    const totalCost = (oripa.price * drawCount) as Coin

    // 残高チェック＆消費
    const memberResult = subtractCoin(member, totalCost)
    if (!memberResult.ok) {
      return { ok: false, error: "Gacha.InsufficientBalance" }
    }

    // カードをランダム選択
    const drawnCards = selectRandom(availableCards, drawCount)
    if (drawnCards.length === 0) {
      return { ok: false, error: "Gacha.NoAvailableCards" }
    }

    // ガチャ結果作成
    const gachaId = generateId() as GachaId
    const cardInventoryIds = drawnCards.map((c) => c.id)

    const gacha = createGachaResult(
      gachaId,
      member.id,
      oripa.id,
      drawCount,
      totalCost,
      cardInventoryIds
    )

    return {
      ok: true,
      value: {
        gacha,
        updatedMember: memberResult.value,
        drawnCards,
      }
    }
  },
})
