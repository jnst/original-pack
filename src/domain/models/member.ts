import { Coin, Err, MemberId, Ok, Point, Result } from "../core/types"

export type { MemberId } from "../core/types"
export type MemberRank = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND"

export type Member = Readonly<{
  readonly id: MemberId
  readonly email: string
  readonly password: string // ハッシュ化済み
  readonly coin: Coin
  readonly point: Point
  readonly rank: MemberRank
  readonly createdAt: Date
}>

// 残高
export type Balance = Readonly<{
  readonly coin: Coin
  readonly point: Point
}>

// 残高更新
export const addCoin = (member: Member, amount: Coin): Member => ({
  ...member,
  coin: (member.coin + amount) as Coin,
})

export const subtractCoin = (
  member: Member,
  amount: Coin
): Result<Member, "Member.InsufficientBalance"> => {
  const newBalance = member.coin - amount
  if (newBalance < 0) {
    return { ok: false, error: "Member.InsufficientBalance" }
  }
  return {
    ok: true,
    value: {
      ...member,
      coin: newBalance as Coin,
    }
  }
}

// ランク判定（累計購入金額ベース）
export const determineRank = (totalSpent: number): MemberRank => {
  if (totalSpent >= 1000000) {
    return "DIAMOND"
  }
  if (totalSpent >= 500000) {
    return "PLATINUM"
  }
  if (totalSpent >= 200000) {
    return "GOLD"
  }
  if (totalSpent >= 50000) {
    return "SILVER"
  }
  return "BRONZE"
}
