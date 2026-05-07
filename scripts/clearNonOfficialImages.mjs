/**
 * 非公式ショップ（ウォーターマーク入り）の画像を null にする
 */
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

// 公式 or 信頼できるショップのみ残す（明示的ホワイトリスト）
const OFFICIAL_SHOPS = new Set([
  'anuajapan',          // Anua Japan 公式
  'biohealboh',         // BIOHEAL BOH 公式
  'torriden-official',  // Torriden 公式
  'apr-japan',          // MEDICUBE/APR 公式
  'fancl-shop',         // FANCL 公式
  'numbuzin',           // Numbuzin 公式
  'cosrx-official',     // COSRX 公式
  'vtcosmetic-official',// VT Cosmetics 公式
  'abibofficial',       // Abib 公式
  'cliojapan',          // CLIO/Goodal 公式
  'manyo-official',     // ma:nyo 公式
  'dongkook',           // Centellian24 (東国製薬) 公式
  'bijin-cosme',        // Goodal 正規
  'theshopkorea',       // Beauty of Joseon 正規
  'roseroseshop',       // Round Lab 正規
  '683street',          // Abib 正規
  'zakkastore365',      // COSRX 正規
  // 薬局・大手ドラッグストア（日本ブランド向け、通常ウォーターマークなし）
  'rakuten24',
  'rakuten24-cosmetics',
  'nagomi-pharmacy',
  'nanohanadrg',
  'essence-of-life',
  'sian',
  'kenkoex',
  'yayoi-cosme',
  'ladydrugplus',
  'tsuruha',
  'f253839-hino',
  'kyoka-kesyohin',
]);

const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

const pattern = /thumbnail\.image\.rakuten\.co\.jp\/@0_mall\/([^\/]+)\//;

let cleared = 0;
const patched = PRODUCTS.map(p => {
  if (!p.image) return p;
  const m = p.image.match(pattern);
  const shop = m ? m[1] : null;
  if (shop && !OFFICIAL_SHOPS.has(shop)) {
    console.log(`  ❌ [${shop}] ${p.nameJa.slice(0, 40)}`);
    cleared++;
    return { ...p, image: null };
  }
  return p;
});

console.log(`\n合計 ${cleared} 件の非公式ショップ画像をクリアしました`);
const stillHave = patched.filter(p => p.image).length;
console.log(`画像あり: ${stillHave} 件 / 画像なし: ${patched.filter(p => !p.image).length} 件`);

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

const lines = patched.map(p => `  ${val(p)}`).join(',\n');
writeFileSync('src/data/products.js',
  `export const PRODUCTS = [\n${lines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`,
  'utf-8');
console.log('\n✅ src/data/products.js を更新しました');
