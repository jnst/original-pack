// Branded Type基盤
export type Brand<T, B extends string> = T & { readonly __brand: B }

// Result型（エラーハンドリング用）
export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export const Ok = <T>(value: T): Result<T> => ({ ok: true, value })
export const Err = <E extends string>(error: E): Result<never, E> => ({ ok: false, error } as const)

// 基本的なBranded Types
export type MemberId = Brand<string, "MemberId">
export type OripaId = Brand<string, "OripaId">
export type CardId = Brand<string, "CardId">
export type CardInventoryId = Brand<string, "CardInventoryId">
export type GachaId = Brand<string, "GachaId">
export type GachaResultId = Brand<string, "GachaResultId">

// 通貨
export type Coin = Brand<number, "Coin">
export type Point = Brand<number, "Point">

// コンストラクタ関数
export const MemberId = (s: string): Result<MemberId, "MemberId.Empty"> => {
  if (s.trim()) {
    return { ok: true, value: s as MemberId }
  }
  return { ok: false, error: "MemberId.Empty" }
}

export const OripaId = (s: string): Result<OripaId, "OripaId.Empty"> => {
  if (s.trim()) {
    return { ok: true, value: s as OripaId }
  }
  return { ok: false, error: "OripaId.Empty" }
}

export const CardId = (s: string): Result<CardId, "CardId.Empty"> => {
  if (s.trim()) {
    return { ok: true, value: s as CardId }
  }
  return { ok: false, error: "CardId.Empty" }
}

export const CardInventoryId = (s: string): Result<CardInventoryId, "CardInventoryId.Empty"> => {
  if (s.trim()) {
    return { ok: true, value: s as CardInventoryId }
  }
  return { ok: false, error: "CardInventoryId.Empty" }
}

export const GachaId = (s: string): Result<GachaId, "GachaId.Empty"> => {
  if (s.trim()) {
    return { ok: true, value: s as GachaId }
  }
  return { ok: false, error: "GachaId.Empty" }
}

export const GachaResultId = (s: string): Result<GachaResultId, "GachaResultId.Empty"> => {
  if (s.trim()) {
    return { ok: true, value: s as GachaResultId }
  }
  return { ok: false, error: "GachaResultId.Empty" }
}

export const Coin = (n: number): Result<Coin, "Coin.Invalid"> => {
  if (Number.isInteger(n) && n >= 0) {
    return { ok: true, value: n as Coin }
  }
  return { ok: false, error: "Coin.Invalid" }
}

export const Point = (n: number): Result<Point, "Point.Invalid"> => {
  if (Number.isInteger(n) && n >= 0) {
    return { ok: true, value: n as Point }
  }
  return { ok: false, error: "Point.Invalid" }
}
