/**
 * 公式ショップコードを指定して直接ショップ内検索でパッチ
 * Usage: node scripts/patchByShop.mjs
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const RAKUTEN_APP_ID     = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID     = '5365226b.aee5572f.5365226c.046695be';
const DELAY_MS           = 2500;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 公式ショップコード指定で直接検索するパッチリスト
const SHOP_PATCHES = [
  // BIOHEAL BOH — タンタンクリームは「3Dリフティングクリーム」として掲載
  { brand: 'BIOHEAL BOH', nameContains: 'タンタンクリーム',        shopCode: 'biohealboh',       keyword: '3D リフティング クリーム' },
  // Torriden — アゼライン酸セラム
  { brand: 'Torriden',    nameContains: 'アゼライン酸',            shopCode: 'torriden-official', keyword: 'アゼライン酸' },
  // 魔女工場 — manyo楽天市場店 でビフィダを探す
  { brand: '魔女工場',     nameContains: 'ビフィオバイオム',         shopCode: 'manyo-official',    keyword: 'ビフィダ アンプル' },
  // ANUA — 公式ショップ内でグリーンタンジェリン/ハートリーフ/桃
  { brand: 'ANUA',        nameContains: 'グリーンタンジェリン',      shopCode: 'anua-official',     keyword: 'グリーン タンジェリン マスク' },
  { brand: 'ANUA',        nameContains: 'ハートリーフ泡',           shopCode: 'anua-official',     keyword: 'ハートリーフ 洗顔' },
  { brand: 'ANUA',        nameContains: '桃70%ナイアシントナー',     shopCode: 'anua-official',     keyword: '桃 ナイアシン トナー' },
  // Dr.G — 公式ショップを探す
  { brand: 'Dr.G',        nameContains: 'R.E.D バリア',            shopCode: 'drg-official',      keyword: 'R.E.D バリア クリーム' },
  { brand: 'Dr.G',        nameContains: 'pHクレンジング',           shopCode: 'drg-official',      keyword: 'pH クレンジング フォーム' },
  // Beauty of Joseon
  { brand: 'Beauty of Joseon', nameContains: 'リリーフサン',        shopCode: 'beautyofjoseon',   keyword: 'ライス サン' },
  // Round Lab
  { brand: 'Round Lab',   nameContains: 'シラカバ水分クリーム',      shopCode: 'roundlab-official', keyword: 'シラカバ 水分 クリーム' },
  // BANILA CO
  { brand: 'BANILA CO',   nameContains: 'リバイタルライジング',       shopCode: 'banilaco-official', keyword: 'クリーンイットゼロ リバイタル' },
  // Centellian24 — シーズン4
  { brand: 'Centellian24', nameContains: 'シーズン4',              shopCode: 'centellian24',      keyword: 'マデカクリーム シーズン4' },
  // ファンケル — チオレドキシン
  { brand: 'ファンケル',   nameContains: 'チオレドキシン',            shopCode: 'fancl',            keyword: 'チオレドキシン' },
];

async function searchInShop(keyword, shopCode) {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    accessKey:     RAKUTEN_ACCESS_KEY,
    affiliateId:   RAKUTEN_AFF_ID,
    keyword,
    shopCode,
    hits:          '5',
    sort:          '-reviewCount',
    imageFlag:     '1',
    formatVersion: '2',
  });
  try {
    const res = await fetch(
      `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?${params}`,
      { headers: { 'Referer': 'https://mihada.vercel.app/', 'Origin': 'https://mihada.vercel.app' } }
    );
    if (!res.ok) { console.error(`  API ${res.status}`); return null; }
    const data = await res.json();
    const item = data.Items?.[0];
    if (!item) return null;
    return {
      url:      item.affiliateUrl || item.itemUrl,
      image:    (item.mediumImageUrls?.[0] ?? item.smallImageUrls?.[0] ?? null)
                  ?.replace('_ex=128x128','_ex=400x400')
                  ?.replace('_ex=64x64','_ex=400x400'),
      shopName: item.shopName,
    };
  } catch (e) { return null; }
}

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

console.log('\n🔧 公式ショップコード指定パッチ...\n');
const enriched = PRODUCTS.map(p => ({ ...p }));

for (const patch of SHOP_PATCHES) {
  const idx = enriched.findIndex(p =>
    p.brand === patch.brand && p.nameJa.includes(patch.nameContains) && !p.url
  );
  if (idx === -1) {
    console.log(`  (skip/enriched) ${patch.brand} / ${patch.nameContains}`);
    continue;
  }
  const p = enriched[idx];
  process.stdout.write(`  [${patch.shopCode}] ${p.brand} — ${p.nameJa.slice(0,30)}... `);
  const result = await searchInShop(patch.keyword, patch.shopCode);
  if (!result) {
    console.log('❌ 未発見');
  } else {
    console.log(`✅ (${result.shopName})`);
    enriched[idx] = { ...p, url: result.url, image: result.image };
  }
  await sleep(DELAY_MS);
}

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
const productsLines = enriched.map(p => `  ${val(p)}`).join(',\n');
writeFileSync('src/data/products.js',
  `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`,
  'utf-8');
console.log('\n✅ src/data/products.js を更新しました');

const remaining = enriched.filter(p => !p.url);
console.log('\n═══ 最終的に楽天に無かった商品 ═══');
remaining.forEach(p => console.log(`  • [${p.brand}] ${p.nameJa}`));
console.log(`\n合計: ${remaining.length}件\n`);
