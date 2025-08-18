// Branded Type基盤
export type Brand<T, B extends string> = T & { readonly __brand: B }

// Result型（エラーハンドリング用）
export type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export const Ok = <T>(value: T): Result<T> => ({ ok: true, value })
export const Err = <E extends string>(error: E): Result<never, E> => ({ ok: false, error })

// 基本的なBranded Types
export type MemberId = Brand<string, "MemberId">
export type OripaId = Brand<string, "OripaId">
export type CardId = Brand<string, "CardId">
export type CardInventoryId = Brand<string, "CardInventoryId">
export type GachaId = Brand<string, "GachaId">

// 通貨
export type Coin = Brand<number, "Coin">
export type Point = Brand<number, "Point">

// コンストラクタ関数
export const MemberId = (s: string): Result<MemberId, "MemberId.Empty"> =>
  s.trim() ? Ok(s as MemberId) : Err("MemberId.Empty")

export const OripaId = (s: string): Result<OripaId, "OripaId.Empty"> =>
  s.trim() ? Ok(s as OripaId) : Err("OripaId.Empty")

export const CardId = (s: string): Result<CardId, "CardId.Empty"> =>
  s.trim() ? Ok(s as CardId) : Err("CardId.Empty")

export const CardInventoryId = (s: string): Result<CardInventoryId, "CardInventoryId.Empty"> =>
  s.trim() ? Ok(s as CardInventoryId) : Err("CardInventoryId.Empty")

export const GachaId = (s: string): Result<GachaId, "GachaId.Empty"> =>
  s.trim() ? Ok(s as GachaId) : Err("GachaId.Empty")

export const Coin = (n: number): Result<Coin, "Coin.Invalid"> =>
  Number.isInteger(n) && n >= 0 ? Ok(n as Coin) : Err("Coin.Invalid")

export const Point = (n: number): Result<Point, "Point.Invalid"> =>
  Number.isInteger(n) && n >= 0 ? Ok(n as Point) : Err("Point.Invalid")
