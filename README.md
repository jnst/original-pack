# original-pack


## Tech Stack

2025年8月18日現在の最新バージョン(単にlatestを追加で問題ない)

- oven-sh/bun v1.2.20
- microsoft/TypeScript v5.9.2
- vercel/next.js v15.4.6 (with AppRouter)
- tursodatabase/turso v0.1.3 (SQLite)
- prisma/prisma v6.14.0 (with TypedSQL)
- colinhacks/zod v4.0.17
- biomejs/biome v2.2.0
- tailwindlabs/tailwindcss v4.1.12
- shadcn-ui/ui v2.10.0

## 画面

- ログイン
  - ローカル環境専用のためユーザー登録不要
  - あらかじめテストユーザーを登録しID/Passでログインできるようにしておく
- トップページ（パック一覧）
  - カテゴリタブ
    - Pachimon
    - AsobiKing
  - オリパ一覧
    - オリパ詳細
      - 1〜3等のカード種類
      - 1回あたりの価格
      - 総口数
      - 残り口数
      - 1回ガチャ
      - 10連ガチャ
      - 100連ガチャ
- 購入結果
- 購入履歴
- マイページ
  - 残高

## Feature

ローカル環境MVPに必要な**機能一覧**を整理します。
この機能群だけあれば、**「ログイン → 残高チャージ → パック購入（抽選） → 結果確認 → 履歴／保有確認」**という一連の体験がローカルで成立します。

### ユーザー系

* **ログイン**
  * 固定ユーザー1名のみ認証（メール＋パスワード）
  * ログアウト
* **残高管理**
  * 残高表示
  * 開発用チャージ（任意額加算）

### パック／ガチャ系

* **パック一覧表示**
  * タイトル・価格・レシピ（ざっくり）・残り目安
* **購入フロー**
  * 1連／10連／100連ボタン
  * 抽選実行（乱数によるカード選択＋在庫確保）
  * 残高消費
* **結果表示**
  * 今回引いたカード一覧
  * 同じ連数で再抽選するボタン

### 在庫系

* **在庫管理（裏側）**
  * 1枚単位で状態管理（available / allocated）
  * プールへの紐付け
  * CSV/JSONでの在庫インポート（開発用）

### 履歴系

* **抽選履歴**
  * 日時・パック名・連数・合計金額
  * 抽選結果の再表示
* **保有カード一覧**
  * ユーザーに確保済みのカードを表示
  * ソート（新着／レア度）


## Ubiquitous Language　 of Oripa

### エンティティ
- **オリパ (Oripa)**: システムが管理する商品パック
- **ガチャ (Gacha)**: オリパ購入・抽選実行
- **カード (Card)**: オリパに含まれるアイテム
- **会員 (Member)**: システムユーザー
- **会員ランク (Rank)**: ｛ブロンズ、シルバー、ゴールド、プラチナ、ダイヤモンド｝

### 商品属性
- **オリパタイプ (Type)**: ｛通常、限定、コラボ、イベント、ログインボーナス、ランク限定、ニブイチ、ループ、アド確定、最低保証｝
- **価格 (Price)**: 数値
- **総口数 (TotalSlots)**: 在庫総数
- **残り口数 (RemainingSlots)**: 現在在庫数
- **還元率 (RewardRate)**: パーセンテージ
- **当選確率 (WinRate)**: パーセンテージ
- **封入率 (InclusionRate)**: 分数（1/100等）

### 取引プロセス
- **購入方式 (GachaType)**: ｛単発、10連、100連｝

### 通貨・決済
- **有償通貨 (Coin)**: 
- **無償通貨 (Point)**: 
- **決済方法 (PaymentMethod)**: ｛クレジットカード、銀行振込、コンビニ払い、PayPay、メルペイ｝

### 賞品管理
- **賞ランク (PrizeRank)**: ｛S賞、A賞、B賞、C賞、D賞、E賞、ハズレ、最低保証｝
- **カード状態 (CardCondition)**: ｛PSA10、PSA9以上、美品、良品、プレイ用｝
- **枠種別 (SlotType)**: ｛当たり枠、ハズレ枠、確定枠｝

### システム状態
- **在庫状態 (StockStatus)**: ｛在庫あり、残りわずか、在庫切れ、補充予定｝
- **取引状態 (TransactionStatus)**: ｛処理中、完了、キャンセル、エラー｝
- **発送状態 (ShippingStatus)**: ｛未発送、発送準備中、発送済み、配達完了｝

### 会員管理
- **ランク条件 (RankCondition)**: 累計購入金額
- **ランク特典 (RankBenefit)**: ｛ボーナスコイン、ポイント付与率、限定オリパアクセス｝
- **ログインボーナス (LoginBonus)**: デイリー報酬

## Development Principle

### ドメインモデリングで推奨されるスタイル

* **クラスを使わない**
  TSのクラスはOOP言語っぽく見えるが、実際はJava/C#と違う落とし穴が多い（後述）。クラスベースの建て付けで建てると想定と違う挙動になりやすい。

* **データ型には `Readonly` を付ける**
  値オブジェクト的な不変性を保証するため。業務上の「値」や「状態」が不用意に書き換えられるとバグにつながるので、型で守る。

* **データ型と振る舞いを分離する**
  クラスにまとめるのではなく、データは型（インターフェースやtype alias）、振る舞いは関数として切り離す。
  → 不変データ + 純粋関数、という関数型寄りのモデル化。

* **Branded Typeを使用する**
  単なる `string` や `number` では区別できない「値オブジェクト」（例: UserId, PostId）をブランド化して区別可能にする。

  ```ts
  type UserId = string & { __brand: "UserId" };
  type PostId = string & { __brand: "PostId" };
  ```

  こうすることで「同じstringなのに混ざる」事故を防げる。

---

### TypeScriptのクラス利用の注意点

TSでクラスをそのままOOPのように使うと、次の違和感や危険点がある：

1. **構造的部分型**
   TSは「名前」ではなく「構造」で型を判定する。

   ```ts
   class Post { constructor(public id: string) {} }
   class User { constructor(public id: string) {} }

   const p: Post = new User("x"); // コンパイルエラーにならない
   ```

   → Java/C#のように「クラスごとに固有の型」にならない。

2. **`this` が常にインスタンスを指すとは限らない**
   メソッドを切り出して渡すと、`this` が失われることがある。Java/C#のように自動バインドされない。

3. **`private` は実行時には存在しない**
   TSのアクセス修飾子は型検査専用。Java/C#のようにランタイムで本当に隠蔽されているわけではない。
   → 実行時には `obj["privateProp"]` でアクセスできてしまう。

4. **型情報は実行時には消える**
   TSの型はコンパイルで消えるので、`interface` や `type` で定義したものはランタイムで参照できない。
   → 実行時のバリデーションや型判定には使えない（別途 `zod` などが必要）。

---

### Code Example

```ts
// domain.ts – 小規模 EC ドメイン（クラス不使用 / 不変データ / 振る舞いは関数 / ブランド型）
// 依存なし（標準TSのみ）

// ===== 基盤: ブランド型 / 結果型 =====================================================

type Brand<T, B extends string> = T & { readonly __brand: B };

type Result<T, E extends string = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

const Ok = <T>(value: T): Result<T> => ({ ok: true, value });
const Err = <E extends string>(error: E): Result<never, E> => ({ ok: false, error });

// ===== 値オブジェクト（全て Readonly）=================================================

// ID たち（string の混同を防ぐ）
export type UserId   = Brand<string, "UserId">;
export type Sku      = Brand<string, "Sku">;
export type OrderId  = Brand<string, "OrderId">;
export type Currency = Brand<"JPY" | "USD" | "EUR", "Currency">;

// 単位付きの数量
export type Quantity = Brand<number, "Quantity">;
// 非負の金額（整数で最小通貨単位を扱う：JPY=円, USD/EUR=セント）
export type Money = Readonly<{
  readonly amount: number;   // >= 0
  readonly currency: Currency;
}>;

// コンストラクタ（実行時ガード）
export const UserId = (s: string): Result<UserId, "UserId.Empty"> =>
  s.trim() ? Ok(s as UserId) : Err("UserId.Empty");

export const Sku = (s: string): Result<Sku, "Sku.Empty"> =>
  s.trim() ? Ok(s as Sku) : Err("Sku.Empty");

export const Currency = (c: "JPY" | "USD" | "EUR"): Currency => c as Currency;

export const Quantity = (n: number): Result<Quantity, "Quantity.Invalid"> =>
  Number.isInteger(n) && n > 0 ? Ok(n as Quantity) : Err("Quantity.Invalid");

export const Money = (amount: number, currency: Currency): Result<Money, "Money.Negative"> =>
  amount >= 0 ? Ok({ amount, currency }) : Err("Money.Negative");

// ヘルパー（通貨一致を前提に純粋加算）
export const addMoney = (a: Money, b: Money): Result<Money, "Money.CurrencyMismatch"> =>
  a.currency === b.currency
    ? Ok({ amount: a.amount + b.amount, currency: a.currency })
    : Err("Money.CurrencyMismatch");

// 単価 × 数量
export const mulMoney = (unit: Money, q: Quantity): Money =>
  ({ amount: unit.amount * (q as unknown as number), currency: unit.currency });

// ===== エンティティ風データ（不変 & データのみ）=======================================

export type CatalogItem = Readonly<{
  readonly sku: Sku;
  readonly title: string;
  readonly unitPrice: Money;  // Money(currency fixed)
  readonly isActive: boolean;
}>;

export type CartItem = Readonly<{
  readonly sku: Sku;
  readonly title: string;
  readonly unitPrice: Money;
  readonly qty: Quantity;
}>;

export type Cart = Readonly<{
  readonly userId: UserId;
  readonly currency: Currency;
  readonly items: ReadonlyArray<CartItem>;
}>;

export type OrderLine = Readonly<{
  readonly sku: Sku;
  readonly title: string;
  readonly unitPrice: Money;
  readonly qty: Quantity;
  readonly lineTotal: Money;
}>;

export type Order = Readonly<{
  readonly orderId: OrderId;
  readonly userId: UserId;
  readonly currency: Currency;
  readonly total: Money;
  readonly lines: ReadonlyArray<OrderLine>;
}>;

// ===== ドメインサービス（振る舞いは純粋関数）=========================================

// カタログから SKU を引くためのポート（依存は注入する）
export type CatalogPort = (sku: Sku) => Result<CatalogItem, "Catalog.NotFound" | "Catalog.Inactive">;

export const catalogFrom = (
  items: ReadonlyArray<CatalogItem>,
): CatalogPort => (sku: Sku) => {
  const item = items.find(i => i.sku === sku);
  if (!item) return Err("Catalog.NotFound");
  if (!item.isActive) return Err("Catalog.Inactive");
  return Ok(item);
};

// カート作成
export const createCart = (userId: UserId, currency: Currency): Cart => ({
  userId, currency, items: [],
});

// カートに追加（同一SKUは数量加算）。通貨不一致や非アクティブは弾く
export const addToCart = (
  cart: Cart,
  sku: Sku,
  qty: Quantity,
  find: CatalogPort,
): Result<Cart, "Catalog.NotFound" | "Catalog.Inactive" | "Currency.Mismatch"> => {
  const res = find(sku);
  if (!res.ok) return res;
  const item = res.value;
  if (item.unitPrice.currency !== cart.currency) return Err("Currency.Mismatch");

  const existing = cart.items.find(i => i.sku === sku);
  const updatedItems: ReadonlyArray<CartItem> = existing
    ? cart.items.map(i => i.sku === sku
        ? ({ ...i, qty: Quantity((i.qty as unknown as number) + (qty as unknown as number)).value! })
        : i)
    : [...cart.items, { sku: item.sku, title: item.title, unitPrice: item.unitPrice, qty }];

  // Quantity() の結果は create 時点で正と仮定（合成の単純化）
  return Ok({ ...cart, items: updatedItems });
};

// 数量変更（0 は削除）
export const setQty = (
  cart: Cart,
  sku: Sku,
  qty: Quantity | 0,
): Cart => {
  if (qty === 0) {
    return { ...cart, items: cart.items.filter(i => i.sku !== sku) };
  }
  return {
    ...cart,
    items: cart.items.map(i => i.sku === sku ? ({ ...i, qty: qty as Quantity }) : i),
  };
};

// 小計
export const subtotal = (cart: Cart): Money =>
  cart.items.reduce<Money>(
    (acc, it) => addMoney(acc, mulMoney(it.unitPrice, it.qty)).value!,
    { amount: 0, currency: cart.currency },
  );

// チェックアウト（Order を作るだけ：外部副作用なし）
export const checkout = (
  cart: Cart,
  makeOrderId: () => OrderId,
): Result<Order, "Cart.Empty"> => {
  if (cart.items.length === 0) return Err("Cart.Empty");

  const lines: ReadonlyArray<OrderLine> = cart.items.map(it => ({
    sku: it.sku,
    title: it.title,
    unitPrice: it.unitPrice,
    qty: it.qty,
    lineTotal: mulMoney(it.unitPrice, it.qty),
  }));

  const total = lines.reduce<Money>(
    (acc, l) => addMoney(acc, l.lineTotal).value!,
    { amount: 0, currency: cart.currency },
  );

  return Ok({
    orderId: makeOrderId(),
    userId: cart.userId,
    currency: cart.currency,
    total,
    lines,
  });
};

// ===== 例: 最小の組み立て（テスト・利用側）===========================================

// 固定カタログ
const JPY = Currency("JPY");
const USD = Currency("USD");

const catalog: ReadonlyArray<CatalogItem> = [
  { sku: Sku("coffee").value!, title: "Coffee Beans 250g", unitPrice: Money(1200, JPY).value!, isActive: true },
  { sku: Sku("mug").value!,    title: "Ceramic Mug",       unitPrice: Money(800,  JPY).value!, isActive: true },
  { sku: Sku("gift").value!,   title: "Gift Card $10",     unitPrice: Money(1000, USD).value!, isActive: true },
];

const find = catalogFrom(catalog);

// ユーザーとカート作成
const user = UserId("u_123").value!;
let cart = createCart(user, JPY);

// アイテム追加（成功）
cart = addToCart(cart, Sku("coffee").value!, Quantity(2).value!, find).value!;
cart = addToCart(cart, Sku("mug").value!,    Quantity(1).value!, find).value!;

// 通貨ミスマッチ（USD商品をJPYカートへ）→ エラー
const mismatch = addToCart(cart, Sku("gift").value!, Quantity(1).value!, find);
if (!mismatch.ok) {
  // -> "Currency.Mismatch"
}

// 数量変更（mug を 2 個へ）
cart = setQty(cart, Sku("mug").value!, Quantity(2).value!);

// 小計（JPY, 1200*2 + 800*2 = 4000）
const sum = subtotal(cart); // { amount: 4000, currency: "JPY"(branded) }

// チェックアウト
const orderIdGen = (): OrderId => (`o_${Date.now()}` as OrderId);
const orderRes = checkout(cart, orderIdGen);
if (orderRes.ok) {
  const order = orderRes.value;
  // order.total.amount === 4000
  // order.lines.length === 2
}

// ===== メモ: TS での意図のポイント =====================================================
// - 型の区別: UserId / Sku / OrderId / Currency をブランド化して構造的部分型の混同を防止
// - 不変: すべて Readonly / ReadonlyArray、更新はコピーで表現
// - 振る舞い分離: addToCart / checkout 等は関数、クラスや this は不使用
// - 実行時ガード: 値オブジェクトのコンストラクタでバリデーション（型は消えるため）
// - 依存注入: CatalogPort / orderIdGen で外界への依存を引数化（純粋性維持）
```




## Initial setup memo

```
$ bun create next-app@latest . --typescript

✔ Would you like to use ESLint? … No
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … Yes
✔ Would you like to use App Router? (recommended) … Yes
✔ Would you like to use Turbopack for `next dev`? … Yes
✔ Would you like to customize the import alias (`@/*` by default)? … No
```
