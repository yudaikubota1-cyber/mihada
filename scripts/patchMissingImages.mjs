/**
 * 画像なし商品を楽天で個別検索してパッチ（英語キーワード対応）
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const RAKUTEN_APP_ID     = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID     = '5365226b.aee5572f.5365226c.046695be';
const DELAY_MS           = 2500;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const PATCHES = [
  // Numbuzin No.1
  { nameContains: 'No.1 青草たっぷり93%整肌セラム',      kw: 'numbuzin no1 serum 美容液' },
  { nameContains: 'No.1 青草たっぷり93%整肌クリーム',    kw: 'numbuzin no1 cream クリーム' },
  { nameContains: 'No.1 青草93%整肌シートマスク',         kw: 'numbuzin no1 mask シートマスク' },
  // Numbuzin No.3
  { nameContains: 'No.3 スキングラスエッセンシャルトナー', kw: 'numbuzin no3 toner' },
  { nameContains: 'No.3 スキングラスエッセンス（既存）',   kw: 'numbuzin no3 serum essence' },
  { nameContains: 'No.3 スキングラスクリーム',             kw: 'numbuzin no3 cream' },
  { nameContains: 'No.3 すべすべキメケアシートマスク',     kw: 'numbuzin no3 mask シートマスク' },
  // Numbuzin No.4
  { nameContains: 'No.4 高麗人参栄養膜トナー',            kw: 'numbuzin no4 toner 化粧水' },
  { nameContains: 'No.4 高麗人参栄養幕シートマスク',       kw: 'numbuzin no4 mask シートマスク' },
  // Numbuzin No.5
  { nameContains: 'No.5 スキンエクセレンスシートマスク',   kw: 'numbuzin no5 mask シートマスク' },
  { nameContains: 'No.5 白玉グルタチオンCエッセンシャルトナー', kw: 'numbuzin no5 toner グルタチオン' },
  { nameContains: 'No.5 白玉グルタチオンC美容液（既存）',  kw: 'numbuzin no5 serum グルタチオン 美容液' },
  { nameContains: 'No.5 白玉グルタチオンCメラゼロクリーム', kw: 'numbuzin no5 cream メラゼロ' },
  { nameContains: 'No.5 白玉グルタチオンCふりかけマスク', kw: 'numbuzin no5 mask ふりかけ' },
  { nameContains: 'No.5 白玉グルタチオンCフィルムパッド', kw: 'numbuzin no5 pad フィルム' },
  { nameContains: 'No.5 白玉グルタチオンCトーンアップベース', kw: 'numbuzin no5 tone up base SPF' },
  // Numbuzin No.9
  { nameContains: 'No.9 NMNラインアップセラム（既存）',   kw: 'numbuzin no9 nmn serum 美容液' },
  { nameContains: 'No.9 NMNラインアップトナー',           kw: 'numbuzin no9 nmn toner 化粧水' },
  { nameContains: 'No.9 NMNレチノールリフトアイクリーム', kw: 'numbuzin no9 retinol eye cream アイクリーム' },
  { nameContains: 'No.9 NMNシートマスク（既存）',          kw: 'numbuzin no9 nmn mask シートマスク' },
  // Centellian24
  { nameContains: 'シーズン6',  kw: 'centellian24 マデカ season6 シーズン6' },
];

async function searchRakuten(kw) {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    accessKey:     RAKUTEN_ACCESS_KEY,
    affiliateId:   RAKUTEN_AFF_ID,
    keyword:       kw,
    hits:          '8',
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
    // 公式ショップ優先、なければ最高レビュー数
    const items = data.Items || [];
    if (!items.length) return null;
    const official = items.find(i => {
      const s = i.shopName.toLowerCase();
      return s.includes('公式') || s.includes('official') || s.includes('numbuzin') || s.includes('centellian');
    });
    const item = official || items[0];
    return {
      url:   item.affiliateUrl || item.itemUrl,
      image: (item.mediumImageUrls?.[0] ?? item.smallImageUrls?.[0] ?? null)
               ?.replace('_ex=128x128','_ex=400x400')
               ?.replace('_ex=64x64','_ex=400x400'),
      shopName: item.shopName,
      itemName: item.itemName,
    };
  } catch(e) { return null; }
}

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

console.log('\n🔧 画像なし商品のパッチ（英語キーワード）...\n');
const enriched = PRODUCTS.map(p => ({ ...p }));
let patched = 0;

for (const patch of PATCHES) {
  const idx = enriched.findIndex(p => p.nameJa.includes(patch.nameContains) && !p.image);
  if (idx === -1) { console.log(`  (skip) ${patch.nameContains}`); continue; }
  const p = enriched[idx];
  process.stdout.write(`  ${p.category} | ${p.nameJa.slice(0,35)}... `);
  const result = await searchRakuten(patch.kw);
  if (!result?.image) {
    console.log('❌ 未発見');
  } else {
    console.log(`✅ (${result.shopName.slice(0,20)})`);
    enriched[idx] = { ...p, url: result.url, image: result.image };
    patched++;
  }
  await sleep(DELAY_MS);
}

console.log(`\n✅ パッチ: ${patched}件`);
const stillMissing = enriched.filter(p => !p.image);
console.log(`画像なし残り: ${stillMissing.length}件`);
stillMissing.forEach(p => console.log(`  • [${p.category}] ${p.nameJa}`));

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
const lines = enriched.map(p => `  ${val(p)}`).join(',\n');
writeFileSync('src/data/products.js',
  `export const PRODUCTS = [\n${lines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`,
  'utf-8');
console.log('\n✅ src/data/products.js を更新しました');
