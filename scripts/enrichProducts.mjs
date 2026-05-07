/**
 * Rakuten API で各商品の直リンク＋画像を取得して products.js に書き込む
 * Usage: node scripts/enrichProducts.mjs
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const RAKUTEN_APP_ID   = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID   = '5365226b.aee5572f.5365226c.046695be';
const DELAY_MS         = 500; // レート制限対策

// 公式ショップがなくても口コミ最多ショップを採用するブランド
const ALLOW_ANY_SHOP = new Set(['キュレル']);

// 書き換え前に PRODUCTS/CATEGORIES 以外のエクスポートを保存しておく
const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';

// ブランド公式ショップの判定キーワード
const OFFICIAL_KEYS = {
  'ANUA':            ['anua', 'アヌア'],
  'Numbuzin':        ['numbuzin', 'ナンバーズイン'],
  'MEDICUBE':        ['medicube', 'メディキューブ'],
  'Mediheal':        ['mediheal', 'メディヒール'],
  'Dr.G':            ['dr.g', 'drg', 'ドクタージー'],
  'Centellian24':    ['centellian', 'センテリアン'],
  'BIOHEAL BOH':     ['bioheal', 'バイオヒール'],
  'Torriden':        ['torriden', 'トリデン'],
  'COSRX':           ['cosrx', 'コスアールエックス'],
  'VT COSMETICS':    ['vt cosmetics', 'vtコスメ'],
  'Beauty of Joseon':['beauty of joseon', 'ジョソン'],
  'Round Lab':       ['round lab', 'ラウンドラボ'],
  'Abib':            ['abib', 'アビブ'],
  'Goodal':          ['goodal', 'グーダル'],
  '魔女工場':         ['魔女工場'],
  'BANILA CO':       ['banila', 'バニラコ'],
  'キュレル':         ['キュレル'],
  'ファンケル':       ['ファンケル', 'fancl'],
  "d'Alba":          ["d'alba", 'ダルバ'],
};

function isOfficial(shopName, brand) {
  const s = shopName.toLowerCase();
  // 公式・official はブランド問わず公式扱い
  if (s.includes('公式') || s.includes('official')) return true;
  // ブランドキーワードがショップ名に含まれるか（大文字小文字を無視）
  const keys = OFFICIAL_KEYS[brand] || OFFICIAL_KEYS[brand.toUpperCase()] || [];
  return keys.some(k => s.includes(k.toLowerCase()));
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 楽天検索用のブランド名エイリアス（英語ブランド名が日本語で登録されているケース）
const BRAND_SEARCH_ALIAS = {
  'Numbuzin': 'ナンバーズイン',
};

async function searchRakuten(product) {
  const brandAlias = BRAND_SEARCH_ALIAS[product.brand] || product.brand;
  const keyword = `${brandAlias} ${product.nameJa}`;
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
    const res  = await fetch(url, {
      headers: {
        'Referer': 'https://mihada.vercel.app/',
        'Origin':  'https://mihada.vercel.app',
      },
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`  API error ${res.status}: ${errText.slice(0, 100)}`);
      return null;
    }
    const data = await res.json();
    // formatVersion=2 では Items が直接配列（Itemラッパーなし）
    const items = data.Items;
    if (!items || items.length === 0) return null;

    const official = items.find(item => isOfficial(item.shopName, product.brand));
    const chosen   = official || items[0];

    return {
      url:        chosen.affiliateUrl || chosen.itemUrl,
      image:      (chosen.mediumImageUrls?.[0] ?? chosen.smallImageUrls?.[0] ?? null)
                    ?.replace('_ex=128x128', '_ex=400x400')
                    ?.replace('_ex=64x64', '_ex=400x400'),
      shopName:   chosen.shopName,
      isOfficial: !!official,
    };
  } catch (e) {
    console.error(`  fetch error: ${e.message}`);
    return null;
  }
}

// products.js をインポート
const { PRODUCTS, CATEGORIES } = await import(
  pathToFileURL(resolve('src/data/products.js')).href
);

console.log(`\n🔍 ${PRODUCTS.length} 商品を検索中...\n`);

const enriched   = [];
const notFound   = [];   // 楽天に無い商品
const noOfficial = [];   // 公式ショップ無し（一般ショップで代用）

for (let i = 0; i < PRODUCTS.length; i++) {
  const p = PRODUCTS[i];
  process.stdout.write(`[${String(i + 1).padStart(3)}/${PRODUCTS.length}] ${p.brand} — ${p.nameJa.slice(0, 30)}... `);

  const result = await searchRakuten(p);

  if (!result) {
    console.log('❌ 未発見');
    notFound.push(p);
    enriched.push({ ...p });
  } else if (!result.isOfficial && !ALLOW_ANY_SHOP.has(p.brand)) {
    console.log(`⚠️  公式なし (${result.shopName}) — スキップ`);
    noOfficial.push({ product: p, shopName: result.shopName });
    enriched.push({ ...p }); // url/image は設定しない
  } else {
    const label = result.isOfficial ? `✅ 公式 (${result.shopName})` : `🔶 口コミ最多 (${result.shopName})`;
    console.log(label);
    enriched.push({ ...p, url: result.url, image: result.image });
  }

  await sleep(DELAY_MS);
}

// --- products.js を再生成 ---
function esc(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
function val(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return `"${esc(v)}"`;
  if (Array.isArray(v)) return `[${v.map(val).join(',')}]`;
  if (typeof v === 'object') {
    const entries = Object.entries(v).map(([k, vv]) => `${k}:${val(vv)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(v);
}

const categoriesJs = JSON.stringify(CATEGORIES, null, 2);
const productsLines = enriched.map(p => `  ${val(p)}`).join(',\n');

const output = `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${categoriesJs};\n${EXTRA_EXPORTS}`;

writeFileSync('src/data/products.js', output, 'utf-8');
console.log('\n✅ src/data/products.js を更新しました\n');

// --- レポート ---
console.log('═══════════════════════════════════════');
console.log(`楽天未発見 (${notFound.length} 件) — Qoo10 等で追加推奨`);
console.log('───────────────────────────────────────');
notFound.forEach(p => console.log(`  • [${p.category}] ${p.brand} — ${p.nameJa}`));

console.log('');
console.log(`公式ショップなし (${noOfficial.length} 件) — 保留（リンク・画像なし）`);
console.log('───────────────────────────────────────');
noOfficial.forEach(({ product: p, shopName }) =>
  console.log(`  • [${p.category}] ${p.brand} — ${p.nameJa.slice(0, 40)}  (${shopName})`)
);
console.log('═══════════════════════════════════════\n');
