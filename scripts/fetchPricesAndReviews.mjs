/**
 * Rakuten Ichiba API で実際の価格・レビューを取得してproducts.jsを更新
 */
import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const APP_ID = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

// アフィリエイトURLから楽天 shopCode と itemCode を抽出
function extractItemCode(affiliateUrl) {
  try {
    const match = affiliateUrl.match(/[?&]pc=([^&]+)/);
    if (!match) return null;
    const productUrl = decodeURIComponent(match[1]);
    // https://item.rakuten.co.jp/shopCode/itemCode/
    const m = productUrl.match(/item\.rakuten\.co\.jp\/([^/]+)\/([^/?]+)/);
    if (!m) return null;
    return { shopCode: m[1], itemCode: m[2], fullCode: `${m[1]}:${m[2]}` };
  } catch { return null; }
}

// Rakuten APIで商品データを取得
async function fetchFromRakuten(fullItemCode) {
  const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&applicationId=${APP_ID}&itemCode=${encodeURIComponent(fullItemCode)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.Items?.[0]?.Item;
    if (!item) return null;
    return {
      price: item.itemPrice,
      score: item.reviewAverage,
      count: item.reviewCount,
    };
  } catch { return null; }
}

console.log(`\n🛒 Rakuten API で ${PRODUCTS.length} 件を取得中...\n`);

const updated = [];
let ok = 0, fail = 0;

for (const p of PRODUCTS) {
  const codes = extractItemCode(p.url);
  if (!codes) {
    console.log(`  ⚠️  コード取得失敗: ${p.nameJa.slice(0, 35)}`);
    updated.push(p); fail++;
    continue;
  }

  const data = await fetchFromRakuten(codes.fullCode);

  if (!data) {
    console.log(`  ❌ API失敗: ${p.nameJa.slice(0, 35)}`);
    updated.push(p); fail++;
    await new Promise(r => setTimeout(r, 200));
    continue;
  }

  const newProduct = { ...p };

  if (data.price) {
    newProduct.price = `¥${Number(data.price).toLocaleString('ja-JP')}`;
  }

  if (data.score || data.count) {
    newProduct.review = {
      score: data.score ? Math.round(data.score * 10) / 10 : p.review.score,
      count: data.count ? `${Number(data.count).toLocaleString('ja-JP')}件` : p.review.count,
    };
  }

  console.log(`  ✅ ${p.brand.padEnd(14)} | ${newProduct.price?.padEnd(10)} | ★${newProduct.review.score} (${newProduct.review.count}) | ${p.nameJa.slice(0, 25)}`);
  updated.push(newProduct);
  ok++;

  await new Promise(r => setTimeout(r, 250)); // レート制限対策
}

console.log(`\n✅ 成功: ${ok}件  ❌ 失敗: ${fail}件\n`);

// 書き出し
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

const lines = updated.map(p => `  ${val(p)}`).join(',\n');
writeFileSync('src/data/products.js',
  `export const PRODUCTS = [\n${lines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`,
  'utf-8');

console.log('✅ src/data/products.js を更新しました');
