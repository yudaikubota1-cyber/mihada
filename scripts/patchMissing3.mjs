/**
 * 3rd patch: Centellian24（センテリアン）とMEDICUBEグルタチオン
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const RAKUTEN_APP_ID     = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID     = '5365226b.aee5572f.5365226c.046695be';
const DELAY_MS           = 2500;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Centellian24 official shop contains 'centellian'
const PATCHES = [
  { brand: 'Centellian24', nameContains: 'シーズン1',       keyword: 'センテリアン マデカクリーム シーズン1',          officialHint: 'centellian', allowAny: false },
  { brand: 'Centellian24', nameContains: 'シーズン4',       keyword: 'センテリアン マデカクリーム シーズン4',          officialHint: 'centellian', allowAny: false },
  { brand: 'Centellian24', nameContains: 'シーズン6',       keyword: 'センテリアン マデカクリーム シーズン6',          officialHint: 'centellian', allowAny: false },
  { brand: 'Centellian24', nameContains: 'コアファーミング', keyword: 'センテリアン エキスパート マデカ ファーミング',  officialHint: 'centellian', allowAny: true  },
  { brand: 'Centellian24', nameContains: 'カプセルクリーム', keyword: 'センテリアン マデカ カプセル セラム クリーム',  officialHint: 'centellian', allowAny: false },
  { brand: 'MEDICUBE',     nameContains: 'グルタチオンブライト', keyword: 'MEDICUBE グルタチオン セラム',             officialHint: 'medicube',   allowAny: false },
];

function isOfficial(shopName, officialHint) {
  const s = shopName.toLowerCase();
  if (s.includes('公式') || s.includes('official')) return true;
  return s.includes(officialHint.toLowerCase());
}

async function searchRakuten(keyword, officialHint, allowAny) {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID, accessKey: RAKUTEN_ACCESS_KEY,
    affiliateId: RAKUTEN_AFF_ID, keyword,
    hits: '10', sort: '-reviewCount', imageFlag: '1', formatVersion: '2',
  });
  try {
    const res = await fetch(
      `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?${params}`,
      { headers: { 'Referer': 'https://mihada.vercel.app/', 'Origin': 'https://mihada.vercel.app' } }
    );
    if (!res.ok) { console.error(`  API ${res.status}`); return null; }
    const data = await res.json();
    if (!data.Items?.length) return null;
    const official = data.Items.find(i => isOfficial(i.shopName, officialHint));
    const item = official || (allowAny ? data.Items[0] : null);
    if (!item) return null;
    return {
      url:   item.affiliateUrl || item.itemUrl,
      image: (item.mediumImageUrls?.[0] ?? item.smallImageUrls?.[0] ?? null)
               ?.replace('_ex=128x128','_ex=400x400')
               ?.replace('_ex=64x64','_ex=400x400'),
      shopName: item.shopName,
      isOff: !!official,
    };
  } catch (e) { return null; }
}

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

console.log('\n🔧 第3ラウンドパッチ (Centellian24 + MEDICUBE)...\n');
const enriched = PRODUCTS.map(p => ({ ...p }));

for (const patch of PATCHES) {
  const idx = enriched.findIndex(p =>
    p.brand === patch.brand && p.nameJa.includes(patch.nameContains) && !p.url
  );
  if (idx === -1) { console.log(`  (skip — already enriched) ${patch.brand} / ${patch.nameContains}`); continue; }
  const p = enriched[idx];
  process.stdout.write(`  ${p.brand} — ${p.nameJa.slice(0,35)}... `);
  const result = await searchRakuten(patch.keyword, patch.officialHint, patch.allowAny);
  if (!result) {
    console.log('❌ 未発見');
  } else {
    const label = result.isOff ? `✅ 公式 (${result.shopName})` : `🔶 (${result.shopName})`;
    console.log(label);
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
