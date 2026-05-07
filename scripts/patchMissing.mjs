/**
 * 見つからなかった商品を個別にカスタムキーワードで再検索してパッチ
 * Usage: node scripts/patchMissing.mjs
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const RAKUTEN_APP_ID     = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID     = '5365226b.aee5572f.5365226c.046695be';
const DELAY_MS           = 2500;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// 個別カスタムキーワードとショップ判定キーワード
// id: products.js の id フィールドと一致させる
// keyword: 検索キーワード
// officialHint: 公式ショップ判定に使うキーワード（小文字）
const PATCHES = [
  { brand: 'ANUA',         nameContains: 'グリーンタンジェリン',     keyword: 'ANUA グリーンタンジェリン マスク',       officialHint: 'anua' },
  { brand: 'ANUA',         nameContains: 'ドクダミ77%鎮静マスク',    keyword: 'ANUA ドクダミ 鎮静 マスクパック',        officialHint: 'anua' },
  { brand: 'ANUA',         nameContains: 'ドクダミ穏やか',           keyword: 'ANUA ドクダミ クレンジングフォーム',     officialHint: 'anua' },
  { brand: 'ANUA',         nameContains: 'ハートリーフ泡',           keyword: 'ANUA ハートリーフ 洗顔 フォーム',        officialHint: 'anua' },
  { brand: 'ANUA',         nameContains: '桃70%ナイアシントナー',     keyword: 'ANUA 桃 ナイアシン トナー',             officialHint: 'anua' },
  { brand: 'Anua',         nameContains: 'ドクダミ80%スージング',     keyword: 'ANUA ドクダミ アンプル',               officialHint: 'anua' },
  { brand: 'MEDICUBE',     nameContains: 'グルタチオンブライト',      keyword: 'MEDICUBE グルタチオン ブライト セラム', officialHint: 'medicube' },
  { brand: 'Dr.G',         nameContains: 'R.E.D バリア',            keyword: 'Dr.G R.E.D クリーム バリア',           officialHint: 'official' },
  { brand: 'Dr.G',         nameContains: 'pHクレンジング',           keyword: 'Dr.G pH クレンジング フォーム',         officialHint: 'official' },
  { brand: 'BIOHEAL BOH',  nameContains: 'コラーゲンモデリングトナー', keyword: 'BIOHEAL BOH コラーゲンモデリング トナー', officialHint: 'bioheal' },
  { brand: 'BIOHEAL BOH',  nameContains: 'タンタンクリーム',          keyword: 'バイオヒール タンタン クリーム',          officialHint: 'bioheal' },
  { brand: 'Torriden',     nameContains: 'アゼライン酸',             keyword: 'Torriden アゼライン酸',                officialHint: 'torriden' },
  { brand: 'COSRX',        nameContains: 'スネイルムチン96',          keyword: 'COSRX スネイルムチン 96',              officialHint: 'cosrx' },
  { brand: 'VT COSMETICS', nameContains: 'AZケア',                  keyword: 'VT AZケア トナーパッド',               officialHint: 'vt' },
  { brand: 'Beauty of Joseon', nameContains: 'リリーフサン',         keyword: 'Beauty of Joseon ライス サン',         officialHint: 'joseon' },
  { brand: 'Round Lab',    nameContains: 'シラカバ水分クリーム',      keyword: 'Round Lab シラカバ クリーム',           officialHint: 'round lab' },
  { brand: 'Abib',         nameContains: 'ドクダミ77%スージング',     keyword: 'Abib ドクダミ トナー',                 officialHint: 'abib' },
  { brand: '魔女工場',      nameContains: 'ビフィオバイオム',          keyword: '魔女工場 ビフィオ アンプル',            officialHint: '魔女工場' },
  { brand: 'BANILA CO',    nameContains: 'リバイタルライジング',       keyword: 'BANILA CO クリーンイットゼロ リバイタル', officialHint: 'banila' },
  { brand: 'キュレル',      nameContains: 'UVケアジェル',             keyword: 'キュレル UVケア',                      officialHint: 'キュレル' },
  { brand: 'キュレル',      nameContains: '泡立て洗顔料',             keyword: 'キュレル 泡洗顔',                      officialHint: 'キュレル' },
  { brand: 'ファンケル',    nameContains: 'チオレドキシン',            keyword: 'ファンケル チオレドキシン',             officialHint: 'fancl' },
  { brand: 'ファンケル',    nameContains: 'マイルドクレンジングオイル（黒）', keyword: 'ファンケル マイルドクレンジングオイル 黒', officialHint: 'fancl' },
];

const ALLOW_ANY_SHOP = new Set(['キュレル']);

function isOfficial(shopName, officialHint) {
  const s = shopName.toLowerCase();
  if (s.includes('公式') || s.includes('official')) return true;
  return s.includes(officialHint.toLowerCase());
}

async function searchRakuten(keyword, officialHint, brand) {
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
    const official = data.Items.find(i => isOfficial(i.shopName, officialHint));
    const allowAny = ALLOW_ANY_SHOP.has(brand);
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

// products.js を読み込み
const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

console.log('\n🔧 未発見商品の個別パッチ...\n');

// brand+nameContains でマッチする商品のインデックスを作成
const enriched = PRODUCTS.map(p => ({ ...p }));
const stillMissing = [];

for (const patch of PATCHES) {
  const idx = enriched.findIndex(p =>
    p.brand === patch.brand &&
    p.nameJa.includes(patch.nameContains) &&
    !p.url  // URLがまだ無いものだけ
  );
  if (idx === -1) {
    console.log(`  (skip — already enriched or not found) ${patch.brand} / ${patch.nameContains}`);
    continue;
  }
  const p = enriched[idx];
  process.stdout.write(`  ${p.brand} — ${p.nameJa.slice(0,35)}... `);
  const result = await searchRakuten(patch.keyword, patch.officialHint, p.brand);
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
const categoriesJs  = JSON.stringify(CATEGORIES, null, 2);
const productsLines = enriched.map(p => `  ${val(p)}`).join(',\n');
const output = `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${categoriesJs};\n${EXTRA_EXPORTS}`;
writeFileSync('src/data/products.js', output, 'utf-8');
console.log('\n✅ src/data/products.js を更新しました');

// Report
console.log('\n═══ 楽天で本当に見つからなかった商品 ═══');
// Include Centellian24 (確認済み: 単品なし)
const centellian = PRODUCTS.filter(p => p.brand === 'Centellian24' && !p.url);
const allMissing = [...centellian, ...stillMissing.filter(p => p.brand !== 'Centellian24')];
allMissing.forEach(p => console.log(`  • [${p.brand}] ${p.nameJa}`));
console.log('═══════════════════════════════════════\n');
