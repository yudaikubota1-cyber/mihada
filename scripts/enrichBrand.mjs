/**
 * 特定ブランドだけ再エンリッチして products.js を上書き
 * Usage: node scripts/enrichBrand.mjs キュレル
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const TARGET_BRAND = process.argv[2];
if (!TARGET_BRAND) { console.error('Usage: node enrichBrand.mjs <brand>'); process.exit(1); }

const RAKUTEN_APP_ID     = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID     = '5365226b.aee5572f.5365226c.046695be';
const DELAY_MS           = 600;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Numbuzin専用キーワードビルダー
const CAT_JA = { toner:'トナー', serum:'美容液', cream:'クリーム', mask:'マスク', pad:'パッド', cleanser:'洗顔', sunscreen:'日焼け止め' };
const BRAND_SEARCH_ALIAS = { 'Numbuzin': 'ナンバーズイン' };

// 公式ショップの判定（shopName に含まれるキーワード）
const OFFICIAL_SHOP_KEYWORDS = {
  'Numbuzin': ['numbuzin'],
};
const ALLOW_ANY_SHOP = new Set(['キュレル']);

function isOfficial(shopName, brand) {
  const s = shopName.toLowerCase();
  if (s.includes('公式') || s.includes('official')) return true;
  return (OFFICIAL_SHOP_KEYWORDS[brand] || []).some(k => s.includes(k));
}

function buildKeyword(product) {
  if (product.brand === 'Numbuzin') {
    const m = product.nameJa.match(/No\.(\d+)/i);
    const num = m ? `${m[1]}番` : '';
    const catJa = CAT_JA[product.category] || '';
    return `ナンバーズイン ${num} ${catJa}`.trim();
  }
  const alias = BRAND_SEARCH_ALIAS[product.brand] || product.brand;
  return `${alias} ${product.nameJa}`;
}

async function searchRakuten(product) {
  const keyword = buildKeyword(product);
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    accessKey:     RAKUTEN_ACCESS_KEY,
    affiliateId:   RAKUTEN_AFF_ID,
    keyword,
    hits:          '10',
    sort:          '-reviewCount',
    imageFlag:     '1',
    formatVersion: '2',
  });
  const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?${params}`;
  try {
    const res = await fetch(url, {
      headers: { 'Referer': 'https://mihada.vercel.app/', 'Origin': 'https://mihada.vercel.app' },
    });
    if (!res.ok) { console.error(`  API ${res.status}`); return null; }
    const data = await res.json();
    if (!data.Items?.length) return null;
    const item = data.Items[0]; // 口コミ最多
    return {
      url:   item.affiliateUrl || item.itemUrl,
      image: (item.mediumImageUrls?.[0] ?? item.smallImageUrls?.[0] ?? null)
               ?.replace('_ex=128x128','_ex=400x400')
               ?.replace('_ex=64x64','_ex=400x400'),
      shopName: item.shopName,
    };
  } catch (e) { return null; }
}

// products.js を読み込み
const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';

const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

console.log(`\n🔍 ${TARGET_BRAND} の商品を再検索...\n`);

const enriched = [];
for (let i = 0; i < PRODUCTS.length; i++) {
  const p = PRODUCTS[i];
  if (p.brand !== TARGET_BRAND) { enriched.push({ ...p }); continue; }

  process.stdout.write(`  ${p.nameJa.slice(0, 35)}... `);
  const result = await searchRakuten(p);

  if (!result) {
    console.log('❌ 未発見');
    enriched.push({ ...p });
  } else if (!isOfficial(result.shopName, p.brand) && !ALLOW_ANY_SHOP.has(p.brand)) {
    console.log(`⚠️  公式なし (${result.shopName}) — スキップ`);
    enriched.push({ ...p });
  } else {
    const label = isOfficial(result.shopName, p.brand) ? `✅ 公式 (${result.shopName})` : `🔶 口コミ最多 (${result.shopName})`;
    console.log(label);
    enriched.push({ ...p, url: result.url, image: result.image });
  }
  await sleep(DELAY_MS);
}

// serialise
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

const categoriesJs   = JSON.stringify(CATEGORIES, null, 2);
const productsLines  = enriched.map(p => `  ${val(p)}`).join(',\n');
const output = `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${categoriesJs};\n${EXTRA_EXPORTS}`;

writeFileSync('src/data/products.js', output, 'utf-8');
console.log('\n✅ src/data/products.js を更新しました');
