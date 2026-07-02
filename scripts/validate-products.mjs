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

// ── レポート ───────────────────────────────────────────
console.log('─'.repeat(48));
console.log(`商品データバリデーション`);
console.log(`  PRODUCTS 総件数: ${PRODUCTS.length}`);
console.log(`  1) 必須フィールド欠損: ${missing.length}件`);
console.log(`  2) 配列への商品混入 : ${intruders.length}件`);
console.log(`  3) 重複ID           : ${[...new Set(dupes)].length}件`);
console.log('─'.repeat(48));

if (errors.length) {
  console.error(`\n❌ バリデーション失敗: ${errors.join(' / ')}`);
  process.exit(1);
}
console.log('\n✅ バリデーション成功: 問題は見つかりませんでした');
