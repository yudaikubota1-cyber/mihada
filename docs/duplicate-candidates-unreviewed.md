# 未精査の重複候補（18組）

生成日: 2026-07-04 / 対象: PRODUCTS 313件（validate-products.mjs の警告⑤より）

## 位置づけ
- 自動検出した**重複候補**であり、確定した重複ではありません（**未精査**）。
- 容量違いの正規SKU（残すべき）と、真の重複（統合すべき）が混在しています。
- 優先度: 低。より重大な実在性問題（medicube-863/864）は解決済みのため、本リストは
  **今後、実機で該当商品が話題になった際に個別対応する運用**とします。
- 検出は `npm run validate` の警告⑤で随時再生成できます（ビルドは止めません）。

## 検出ロジック
1. `nameJa` を正規化（括弧内・容量[ml/g/枚/本]・SPF/PA・数字/濃度・No./番・記号を除去）した一致
2. 同一 `url`
3. 同一 画像URL（クエリ除去後）

## 候補一覧（検出時点）
- 正規化名が一致: medicube-20 ↔ medicube-n5  「MEDICUBE PDRNピンクアンプル」
- 正規化名が一致: medicube-22 ↔ medicube-n6  「MEDICUBE PDRNピンクトナー」
- 正規化名が一致: medicube-24 ↔ medicube-n4  「MEDICUBE コウジ酸ビタナイアシンセラム」
- 正規化名が一致: centellian24-34 ↔ centellian24-35  「Centellian24 ザ・マデカクリーム シーズン1（定番）」
- 正規化名が一致: cosrx-60 ↔ cosrx-n3  「COSRX RXザ・セラミド 肌バリア保湿クリーム」
- 正規化名が一致: fancl-89 ↔ fancl-97  「ファンケル マイルドクレンジングオイル」
- 正規化名が一致: fancl-91 ↔ fancl-96  「ファンケル ブライトニング化粧液」
- 正規化名が一致: anua-99 ↔ anua-n5  「Anua PDRNヒアルロン酸カプセル100セラム」
- 正規化名が一致: numbuzin-n1 ↔ numbuzin-r-no3-200ml  「ナンバーズイン 3番 うるツヤ発酵トナー 200ml」
- 正規化名が一致: numbuzin-n7 ↔ numbuzin-r-no9-nmn-pdrn  「ナンバーズイン 9番 NMN PDRNトリートメントトナー 200ml」
- 正規化名が一致: manyo-r-30 ↔ manyo-r-100ml  「ガラクトミセス3.0エッセンス」
- 正規化名が一致: manyo-r-400ml ↔ manyo-r-200ml  「ピュアクレンジングオイル 400mL」
- 同一画像URL: numbuzin-871 ↔ numbuzin-r-no1  「Numbuzin No.1スキンソフナークリーム」
- 同一画像URL: numbuzin-875 ↔ numbuzin-n9  「Numbuzin No.4高麗人参エナジーセラム」
- 同一画像URL: numbuzin-876 ↔ numbuzin-r-no5-c  「Numbuzin No.5グルタチオングロートナー」
- 同一画像URL: numbuzin-877 ↔ numbuzin-n6  「Numbuzin No.5グルタチオングロークリーム」
- 同一画像URL: numbuzin-878 ↔ numbuzin-r-no9-nmn-pdrn  「Numbuzin No.9NMNアンチエイジングトナー」
- 同一画像URL: numbuzin-r-no3-200ml ↔ numbuzin-r-no1-93  「No.3 うるツヤ発酵トナー 200ml」

（計18組。真の重複か容量違いの別SKUかは未判定）
