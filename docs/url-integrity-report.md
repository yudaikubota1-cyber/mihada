# 商品URL整合性チェック・レポート

生成日: 2026-07-02

## 1. 公式ショップURL（16ブランド / Goodal除く）

| ブランド | 公式楽天ショップURL |
|---|---|
| ANUA | https://www.rakuten.co.jp/anuajapan/ |
| Numbuzin | https://www.rakuten.co.jp/numbuzin/ |
| BIOHEAL BOH | https://www.rakuten.co.jp/biohealboh/ |
| COSRX | https://www.rakuten.co.jp/cosrx-official/ |
| 魔女工場 | https://www.rakuten.co.jp/manyo-official/ |
| MEDICUBE | https://www.rakuten.co.jp/apr-japan/ |
| SKIN1004 | https://www.rakuten.co.jp/skin1004-official/ |
| ファンケル | https://www.rakuten.co.jp/fancl-shop/ |
| VT COSMETICS | https://www.rakuten.co.jp/vtcosmetic-official/ |
| Torriden | https://www.rakuten.co.jp/torriden-official/ |
| dalba | https://www.rakuten.co.jp/dalba/ |
| innisfree | https://www.rakuten.co.jp/innisfree-official/ |
| Abib | https://www.rakuten.co.jp/abibofficial/ |
| Dr.G | https://www.rakuten.co.jp/drg-japan/ |
| Centellian24 | https://www.rakuten.co.jp/dongkook/ （Centellian24楽天市場店 / DONGKOOK社正規品） |
| キュレル | https://event.rakuten.co.jp/mc/kao-mall/brand/curel/ （花王MALL・単独公式ショップなし） |

## 2. 更新済みリスト（商品名 / 旧URL / 新URL）

なし。

本実行環境からは楽天市場へアウトバウンド接続して各公式ショップ内の在庫・
商品ページの実在を確認できないため、実在確認ができない差し替えURLの自動生成
（＝リンク切れや別商品への誤リンクのリスク）は行っていない。ドメイン不一致の
商品は下記「削除候補」に計上し、実URL更新は手動確認後に行う方針とする。

## 3. 削除候補リスト（discontinued_candidate）

現在の楽天URLが公式ショップドメインと一致しない商品。**削除はせず**、後日
公式ショップ内での再検索・判断を行う対象。

| ブランド | 商品名 | 現URLの店舗 | 理由 |
|---|---|---|---|
| Torriden | ダイブインクレンジングフォーム | nagomi-pharmacy | 公式(torriden-official)外の第三者出店 |
| COSRX | ワンステップモイスチャーアップパッド | zakkastore365 | 公式(cosrx-official)外の第三者出店 |
| Abib | ドクダミスポットパッド | 683street | 公式(abibofficial)外の第三者出店 |
| ファンケル | エンリッチプラス 化粧液 | f253839-hino | 公式(fancl-shop)外 |
| ファンケル | サンガード50+ SPF50+PA++++ | rakuten24-cosmetics | 公式(fancl-shop)外 |
| ファンケル | ホワイトニング 化粧液 | kyoka-kesyohin | 公式(fancl-shop)外 |
| キュレル | 潤浸保湿 角層深部バリア美容液 | yayoi-cosme | 花王MALL/楽天24以外 |
| キュレル | 潤浸保湿フェイスクリーム | nanohanadrg | 花王MALL/楽天24以外 |
| キュレル | UVケアジェル SPF50+PA+++ | essence-of-life | 花王MALL/楽天24以外 |
| キュレル | クレンジングジェル | sian | 花王MALL/楽天24以外 |
| キュレル | 泡立て洗顔料 | kenkoex | 花王MALL/楽天24以外 |
| キュレル | 潤浸保湿化粧水 II（しっとり） | akakabeshop | 花王MALL/楽天24以外 |
| キュレル | 潤浸保湿化粧水 I（さっぱり） | ladydrugplus | 花王MALL/楽天24以外 |
| キュレル | 潤浸保湿美容液 | nanohanadrg | 花王MALL/楽天24以外 |
| キュレル | 皮脂トラブルケア化粧水 | tsuruha | 花王MALL/楽天24以外 |
| キュレル | 皮脂トラブルケアクリーム | daikisone | 花王MALL/楽天24以外 |

削除候補: **16件**（うちキュレル10件・ファンケル3件・その他3件）

※キュレルは単独公式ショップが存在しないため、花王MALL（kao-mall）または楽天24
（rakuten24 / rakuten24-cosmetics）の花王正規取扱ページを許容ドメインとしている。
上記10件はそれ以外の第三者出店のため候補計上。

## 4. Goodal削除後の総商品数

- 削除前: 318件
- Goodal削除: 3件（グリーンタンジェリン ビタCセラム / トナーパッド / ビタCクリーム）
- **削除後の総商品数: 315件**
- ブランド数: 16
