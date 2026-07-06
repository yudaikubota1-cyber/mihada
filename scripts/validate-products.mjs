// 商品データバリデーション
//   1) 必須フィールド検査 : PRODUCTS 各件の image / url が空文字・未定義でないこと
//   2) 配列境界チェック   : PRODUCTS 以外の配列に商品と疑われる要素(id/brand を持つ)が混入していないこと
//   3) 重複ID検査         : PRODUCTS の id が完全にユニークであること
// 違反があれば非ゼロで終了する（prebuild フックでビルドを止める）。

import * as data from '../src/data/products.js';

const { PRODUCTS } = data;
const errors = [];

// ── 1) 必須フィールド検査 ──────────────────────────────
const missing = [];
for (const p of PRODUCTS) {
  const noImage = typeof p.image !== 'string' || p.image.trim() === '';
  const noUrl   = typeof p.url   !== 'string' || p.url.trim()   === '';
  if (noImage || noUrl) {
    missing.push({ id: p.id, brand: p.brand, name: p.nameJa || p.name, noImage, noUrl });
  }
}
if (missing.length) {
  errors.push(`必須フィールド欠損: ${missing.length}件`);
  for (const m of missing) {
    const flags = [m.noImage ? 'image空' : null, m.noUrl ? 'url空' : null].filter(Boolean).join(' / ');
    console.error(`  ✗ [${m.brand}] ${m.id} 「${m.name}」 → ${flags}`);
  }
}

// ── 2) 配列境界チェック ────────────────────────────────
// PRODUCTS（と隔離用 PENDING_PRODUCTS）以外の配列に、商品らしきオブジェクトが混入していないか。
// 「商品らしい」= brand を持ち、かつ nameJa / price / category / ingredients のいずれかを持つ。
// （CATEGORIES や *_CHIPS は id をキーに使うため、brand の有無で誤検知を防ぐ）
const PRODUCT_ARRAYS = new Set(['PRODUCTS', 'PENDING_PRODUCTS']);
const looksLikeProduct = (el) =>
  el && typeof el === 'object' && 'brand' in el &&
  (('nameJa' in el) || ('price' in el) || ('category' in el) || ('ingredients' in el));
const intruders = [];
for (const [key, value] of Object.entries(data)) {
  if (PRODUCT_ARRAYS.has(key)) continue;
  if (!Array.isArray(value)) continue;
  value.forEach((el, i) => {
    if (looksLikeProduct(el)) {
      intruders.push({ array: key, index: i, id: el.id, brand: el.brand });
    }
  });
}
if (intruders.length) {
  errors.push(`商品データの配列混入: ${intruders.length}件`);
  for (const it of intruders) {
    console.error(`  ✗ ${it.array}[${it.index}] に商品らしきオブジェクト (id=${it.id}, brand=${it.brand})`);
  }
}

// ── 3) 重複ID検査 ──────────────────────────────────────
const seen = new Map();
const dupes = [];
for (const p of PRODUCTS) {
  if (seen.has(p.id)) dupes.push(p.id);
  else seen.set(p.id, true);
}
if (dupes.length) {
  errors.push(`重複ID: ${[...new Set(dupes)].length}件`);
  for (const id of [...new Set(dupes)]) console.error(`  ✗ 重複 id: ${id}`);
}

// ═══ 以下は「警告」: ビルドは止めず、人間の確認を促すためのレポートのみ ═══
const { BRAND_STORE_URL } = data;

// URLから楽天の店舗スラッグを抽出（アフィリンクは pc= を復号してから）
function extractShopSlug(url) {
  if (typeof url !== 'string' || !url) return null;
  let target = url;
  try {
    const u = new URL(url);
    const pc = u.searchParams.get('pc');
    if (pc) target = decodeURIComponent(pc);
  } catch { /* URLでなければそのまま */ }
  // search.rakuten.co.jp（検索結果ページ）は店舗特定不可
  if (/search\.rakuten\.co\.jp/.test(target)) return null;
  const m = target.match(/(?:item\.|www\.|event\.)?rakuten\.co\.jp\/(?:mc\/)?([^/]+)\//);
  return m ? m[1] : null;
}

// ── 警告② : url が対応ブランドの公式ショップ・ドメイン配下にあるか ──
const urlWarnings = [];
for (const p of PRODUCTS) {
  if (p.brand === 'キュレル') continue; // 単独公式ショップが無い（花王正規取扱店網）ため対象外
  const official = BRAND_STORE_URL && BRAND_STORE_URL[p.brand];
  if (!official) continue;
  const officialSlug = extractShopSlug(official);
  const productSlug = extractShopSlug(p.url);
  if (!officialSlug || !productSlug) continue; // 検索URL等は判定不可
  if (productSlug !== officialSlug) {
    urlWarnings.push({ id: p.id, brand: p.brand, name: p.nameJa || p.name, officialSlug, productSlug });
  }
}

// ── 警告④ : 重複候補（正規化名 / 同一url / 同一画像）──
function normName(s) {
  return (s || '')
    .replace(/[（(].*?[）)]/g, '')                 // 括弧内
    .replace(/\d+(\.\d+)?\s*(ml|mL|g|G|枚|本|回|ea)/g, '') // 容量
    .replace(/spf\s*\d+|pa\++/gi, '')             // SPF/PA
    .replace(/\d+(\.\d+)?%?/g, '')                 // 数字・濃度
    .replace(/no\.?|ナンバーズイン|番/gi, '')
    .replace(/[\s　・\-/、,。.【】\[\]#]/g, '')
    .toLowerCase();
}
const dupWarnings = [];
const groupBy = (keyFn) => {
  const map = new Map();
  for (const p of PRODUCTS) {
    const k = keyFn(p);
    if (!k) continue;
    (map.get(k) || map.set(k, []).get(k)).push(p);
  }
  return [...map.values()].filter(g => g.length > 1);
};
for (const g of groupBy(p => normName(p.nameJa))) {
  dupWarnings.push({ reason: '正規化名が一致', ids: g.map(p => p.id), sample: g[0].nameJa });
}
for (const g of groupBy(p => p.url)) {
  dupWarnings.push({ reason: '同一url', ids: g.map(p => p.id), sample: g[0].nameJa });
}
for (const g of groupBy(p => (p.image || '').split('?')[0])) {
  dupWarnings.push({ reason: '同一画像URL', ids: g.map(p => p.id), sample: g[0].nameJa });
}

// ── レポート ───────────────────────────────────────────
console.log('─'.repeat(48));
console.log(`商品データバリデーション`);
console.log(`  PRODUCTS 総件数: ${PRODUCTS.length}`);
console.log(`  [エラー] 1) 必須フィールド欠損: ${missing.length}件`);
console.log(`  [エラー] 2) 配列への商品混入 : ${intruders.length}件`);
console.log(`  [エラー] 3) 重複ID           : ${[...new Set(dupes)].length}件`);
console.log(`  [警告]  4) URL≠公式ドメイン  : ${urlWarnings.length}件`);
console.log(`  [警告]  5) 重複候補          : ${dupWarnings.length}組`);
console.log('─'.repeat(48));

if (urlWarnings.length) {
  console.log('\n⚠ 警告④: url が公式ショップ・ドメイン外（要・人手確認。ビルドは止めません）');
  for (const w of urlWarnings) {
    console.log(`  ・[${w.brand}] ${w.id} 「${w.name}」 公式=${w.officialSlug} / 実際=${w.productSlug}`);
  }
}
if (dupWarnings.length) {
  console.log('\n⚠ 警告⑤: 重複候補（要・人手確認。ビルドは止めません）');
  for (const w of dupWarnings) {
    console.log(`  ・${w.reason}: ${w.ids.join(' ↔ ')}  「${w.sample}」`);
  }
}

if (errors.length) {
  console.error(`\n❌ バリデーション失敗（エラー）: ${errors.join(' / ')}`);
  process.exit(1);
}
const warnTotal = urlWarnings.length + dupWarnings.length;
console.log(warnTotal
  ? `\n✅ エラーなし（ビルド継続）。ただし警告 ${warnTotal} 件あり → 上記を人手で確認してください。`
  : '\n✅ バリデーション成功: エラー・警告ともにありません');
