/**
 * 2nd round patch: カスタムキーワードで発見した商品をパッチ
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
  { brand: 'COSRX',       nameContains: 'スネイルムチン96',         keyword: 'COSRX スネイル 96 ムチン エッセンス',        officialHint: 'cosrx',     allowAny: false },
  { brand: 'ANUA',        nameContains: 'ドクダミ77%鎮静マスク',     keyword: 'ANUA ドクダミ 77 シートマスク',              officialHint: 'anua',      allowAny: false },
  { brand: 'MEDICUBE',    nameContains: 'グルタチオンブライト',       keyword: 'MEDICUBE グルタチオン ブライト アンプル',     officialHint: 'medicube',  allowAny: false },
  { brand: 'BIOHEAL BOH', nameContains: 'コラーゲンモデリングトナー', keyword: 'BIOHEAL BOH プロバイオダーム トナー コラーゲン', officialHint: 'bioheal',  allowAny: false },
  { brand: 'BIOHEAL BOH', nameContains: 'タンタンクリーム',          keyword: 'BIOHEAL BOH タンタン クリーム リフティング',  officialHint: 'bioheal',   allowAny: false },
  { brand: 'ANUA',        nameContains: 'グリーンタンジェリン',       keyword: 'ANUA グリーンタンジェリン ビタ',             officialHint: 'anua',      allowAny: false },
  { brand: 'ANUA',        nameContains: 'ハートリーフ泡',            keyword: 'ANUA ハートリーフ 洗顔 フォーム',            officialHint: 'anua',      allowAny: false },
  { brand: 'ANUA',        nameContains: '桃70%ナイアシントナー',      keyword: 'ANUA 桃 ナイアシン トナー 70',              officialHint: 'anua',      allowAny: false },
  { brand: 'Torriden',    nameContains: 'アゼライン酸',              keyword: 'Torriden アゼライン酸 セラム',               officialHint: 'torriden',  allowAny: false },
  { brand: '魔女工場',     nameContains: 'ビフィオバイオム',           keyword: '魔女工場 ma:nyo ビフィオ コンプレックス',     officialHint: '魔女工場',  allowAny: false },
  { brand: 'Round Lab',   nameContains: 'シラカバ水分クリーム',       keyword: 'ラウンドラボ シラカバ 水分 クリーム',         officialHint: 'round lab', allowAny: false },
  { brand: 'Dr.G',        nameContains: 'R.E.D バリア',             keyword: 'ドクタージー レッド バリア クリーム',          officialHint: 'official',  allowAny: false },
  { brand: 'Dr.G',        nameContains: 'pHクレンジング',            keyword: 'ドクタージー pH クレンジング フォーム',        officialHint: 'official',  allowAny: false },
  { brand: 'Beauty of Joseon', nameContains: 'リリーフサン',         keyword: 'Beauty of Joseon ライス プロバイオティクス 日焼け止め', officialHint: 'joseon', allowAny: false },
  { brand: 'BANILA CO',   nameContains: 'リバイタルライジング',        keyword: 'バニラコ クリーンイットゼロ クレンジング バーム', officialHint: 'banila', allowAny: false },
  { brand: 'ファンケル',   nameContains: 'チオレドキシン',             keyword: 'ファンケル チオレドキシン 先行 美容液',        officialHint: 'fancl',     allowAny: false },
];

function isOfficial(shopName, officialHint) {
  const s = shopName.toLowerCase();
  if (s.includes('公式') || s.includes('official')) return true;
  return s.includes(officialHint.toLowerCase());
}

async function searchRakuten(keyword, officialHint, allowAny) {
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
    const res = await fetch(url, { headers: { 'Referer': 'https://mihada.vercel.app/', 'Origin': 'https://mihada.vercel.app' } });
    if (!res.ok) { console.error(`  API ${res.status}`); return null; }
    const data = await res.json();
    if (!data.Items?.length) return null;
    const official = data.Items.find(i => isOfficial(i.shopName, officialHint));
    const item = official || (allowAny ? data.Items[0] : null);
    if (!item) return null;
    return {
      url:      item.affiliateUrl || item.itemUrl,
      image:    (item.mediumImageUrls?.[0] ?? item.smallImageUrls?.[0] ?? null)
                  ?.replace('_ex=128x128','_ex=400x400')
                  ?.replace('_ex=64x64','_ex=400x400'),
      shopName: item.shopName,
      isOff:    !!official,
    };
  } catch (e) { return null; }
}

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

console.log('\n🔧 第2ラウンドパッチ...\n');

const enriched = PRODUCTS.map(p => ({ ...p }));
const stillMissing = [];

for (const patch of PATCHES) {
  const idx = enriched.findIndex(p =>
    p.brand === patch.brand &&
    p.nameJa.includes(patch.nameContains) &&
    !p.url
  );
  if (idx === -1) {
    console.log(`  (skip — already enriched) ${patch.brand} / ${patch.nameContains}`);
    continue;
  }
  const p = enriched[idx];
  process.stdout.write(`  ${p.brand} — ${p.nameJa.slice(0,35)}... `);
  const result = await searchRakuten(patch.keyword, patch.officialHint, patch.allowAny);
  if (!result) {
    console.log('❌ 未発見');
    stillMissing.push(p);
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
const output = `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`;
writeFileSync('src/data/products.js', output, 'utf-8');
console.log('\n✅ src/data/products.js を更新しました');

// Final report
const remaining = enriched.filter(p => !p.url);
console.log('\n═══ 楽天で本当に見つからなかった商品（最終） ═══');
remaining.forEach(p => console.log(`  • [${p.brand}] ${p.nameJa}`));
console.log(`\n合計: ${remaining.length}件\n`);
