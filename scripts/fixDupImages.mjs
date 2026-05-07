/**
 * 同じ画像URLを持つ商品のうち、レビュー数最多の1件だけ残して他は image: null にする
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';

const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

// 画像URLごとにグループ化
const imgMap = {};
PRODUCTS.forEach((p, i) => {
  if (p.image) {
    if (!imgMap[p.image]) imgMap[p.image] = [];
    imgMap[p.image].push(i);
  }
});

const patched = PRODUCTS.map(p => ({ ...p }));
let fixedCount = 0;

Object.entries(imgMap)
  .filter(([, indices]) => indices.length > 1)
  .forEach(([url, indices]) => {
    console.log(`\n⚠️  重複画像 (${indices.length}件):`);
    indices.forEach(i => console.log(`   [${PRODUCTS[i].category}] ${PRODUCTS[i].brand} ${PRODUCTS[i].nameJa}`));

    // レビュー数が最多のものを1件残す（同数なら最初のもの）
    const sorted = [...indices].sort((a, b) => {
      const ra = Number(String(PRODUCTS[a].review?.count || '0').replace(/[^0-9]/g, '')) || 0;
      const rb = Number(String(PRODUCTS[b].review?.count || '0').replace(/[^0-9]/g, '')) || 0;
      return rb - ra;
    });

    const keepIdx = sorted[0];
    console.log(`   → 保持: [${PRODUCTS[keepIdx].category}] ${PRODUCTS[keepIdx].nameJa}`);

    sorted.slice(1).forEach(i => {
      console.log(`   → クリア: [${PRODUCTS[i].category}] ${PRODUCTS[i].nameJa}`);
      patched[i] = { ...patched[i], image: null };
      fixedCount++;
    });
  });

console.log(`\n合計 ${fixedCount}件の重複画像をクリアしました`);

// シリアライズ
function esc(s) { return String(s ?? '').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
function val(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number')  return String(v);
  if (typeof v === 'string')  return `"${esc(v)}"`;
  if (Array.isArray(v))       return `[${v.map(val).join(',')}]`;
  if (typeof v === 'object')  return `{${Object.entries(v).map(([k,vv])=>`${k}:${val(vv)}`).join(',')}}`;
  return JSON.stringify(v);
}

const productsLines = patched.map(p => `  ${val(p)}`).join(',\n');
writeFileSync('src/data/products.js',
  `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`,
  'utf-8');
console.log('\n✅ src/data/products.js を更新しました');
