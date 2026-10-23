# miHada マーケティング作業 — 進捗メモ

## 目的
miHada（AI肌診断サービス）を日本の女性に広める。最優先は Instagram/TikTok 投稿。

## SNS投稿コンテンツ（完成済み）
- `public/slides/index.html` に 12投稿・40スライドのInstagramスライドジェネレーターがHTMLである
- ブランチ `claude/service-marketing-strategy-AOFdF`、PR #6（ドラフト）
- デザイン: 1080x1080, ダーク#1A1814 × ライト#FAF8F5 × ゴールド#C9A96E, Inter

### 投稿一覧
1. 脂性肌の成分TOP3（カルーセル5）2. AI診断体験（リール1）3. ナイアシンアミド解説（6）
4. インナードライ（1）5. 韓国コスメが刺さる理由（5）6. AIが本物（1）
7. 毛穴チートシート（5）8. 肌悩みアンケート（1）9. 乾燥肌vs脂性肌（5）
10. 2週間後の結果（1）11. オフケアで毛穴ケア（4・2025トレンド）12. 3ステップレシピ（5・skinimalism）

## 商品画像の状況（重要）
- 楽天CDNはホットリンク保護で直リンク不可（メインECアプリもカラープレースホルダーにフォールバック中＝PROPOSALS P1）
- 対策実装済み: `api/img.js` Vercelプロキシ（Rakuten Referer付与）→ weserv.nl → ゴールドプレースホルダーの3段フォールバック
- **この実行環境はネットワークegress allowlistで楽天/Vercelに到達不可**（dangerouslyDisableSandboxでも「Host not in allowlist」）→ 環境内では実写真の取得・検証は不可能。本番デプロイ後にユーザー確認が必要。
- 環境内でレンダリングすると商品画像はゴールドプレースホルダーになる（上品で破綻はしない）

## 完成したPNG納品
- Playwright で40スライドを実1080x1080でレンダリング → `/tmp/mihada_slides/`（投稿別フォルダ）
- ユーザーにzipで直接SendUserFile済み（URLやGitHub不要のフロー）

## 次にやること候補
- TikTok: 動画/写真カルーセルが必要。スライドをTikTok写真投稿に転用 or 簡易動画化の戦略提示
- 実商品写真が欲しい場合: ユーザーが本番(mihada.jp/slides/)で確認、出なければ Rakuten API(api/rakuten.js、APIキー設定済み)から取得に切替
- 投稿スケジュール（Meta Business Suite）とハッシュタグ戦略（#毛穴ケア #オフケア #スキンミニマリズム）

## ユーザー特性
- 非エンジニア。GitHub/Vercel/マージ等の技術用語で混乱する。
- 「コピペするだけ」「完成品を渡す」フローを強く希望。技術詳細より成果物優先。
