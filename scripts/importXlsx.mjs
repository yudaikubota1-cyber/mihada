/**
 * Excelデータを products.js に反映
 * - 既存商品に skinTypes / concerns / ingredients / category を追加
 * - 他シートを src/data/knowledge.js にエクスポート
 */
import xlsx from 'xlsx';
import { writeFileSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { resolve } from 'path';

const wb = xlsx.readFile('C:/Users/yudai/Downloads/skincare_database_complete.xlsx');

// ─── 商品データベース ───────────────────────────
const productRows = xlsx.utils.sheet_to_json(wb.Sheets['商品データベース'], { defval: '' })
  .filter(r => r['ブランド'] !== '');

// nameJa → metadata のマップ
const metaByName = {};
for (const r of productRows) {
  metaByName[r['商品名']] = {
    skinTypes:   r['対応肌タイプ'] ? r['対応肌タイプ'].split('・').map(s => s.trim()).filter(Boolean) : [],
    concerns:    r['対応悩み']    ? r['対応悩み'].split('・').map(s => s.trim()).filter(Boolean)    : [],
    ingredients: r['主要成分']    ? r['主要成分'].split('・').map(s => s.trim()).filter(Boolean)    : [],
    ingredientDesc: r['成分の効果説明'] || '',
    category2:   r['商品カテゴリ'] || '',
  };
}

// products.js を読み込み
const origSrc = readFileSync('src/data/products.js', 'utf-8');
const extraMatch = origSrc.match(/export const SKIN_TYPE_CHIPS[\s\S]*/);
const EXTRA_EXPORTS = extraMatch ? '\n' + extraMatch[0] : '';
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(resolve('src/data/products.js')).href);

let matched = 0, unmatched = [];
const enriched = PRODUCTS.map(p => {
  const meta = metaByName[p.nameJa];
  if (!meta) { unmatched.push(p.nameJa); return { ...p }; }
  matched++;
  return {
    ...p,
    skinTypes:      meta.skinTypes,
    concerns:       meta.concerns,
    ingredients:    meta.ingredients,
    ingredientDesc: meta.ingredientDesc,
  };
});

console.log(`\nマッチ: ${matched}件 / 未マッチ: ${unmatched.length}件`);
if (unmatched.length) console.log('未マッチ:', unmatched);

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
const productsLines = enriched.map(p => `  ${val(p)}`).join(',\n');
writeFileSync('src/data/products.js',
  `export const PRODUCTS = [\n${productsLines}\n];\n\nexport const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};\n${EXTRA_EXPORTS}`,
  'utf-8');
console.log('✅ products.js に skinTypes / concerns / ingredients を追加しました');

// ─── 知識ベースを knowledge.js にエクスポート ───────────────────────────

// 成分辞典
const ingredientDict = xlsx.utils.sheet_to_json(wb.Sheets['成分辞典'], { defval: '' })
  .filter(r => r['成分名'])
  .map(r => ({
    name:       r['成分名'],
    category:   r['効果カテゴリ'],
    effects:    r['主な効果'],
    skinTypes:  r['向いている肌タイプ'] ? r['向いている肌タイプ'].split('・').map(s=>s.trim()) : [],
    concerns:   r['向いている悩み']    ? r['向いている悩み'].split('・').map(s=>s.trim())    : [],
    caution:    r['注意点'],
  }));

// 悩み×肌タイプ マトリクス
const concernMatrix = xlsx.utils.sheet_to_json(wb.Sheets['悩み×肌タイプ マトリクス'], { defval: '' })
  .filter(r => r['悩み \\ 肌タイプ'])
  .map(r => ({
    concern:  r['悩み \\ 肌タイプ'],
    乾燥肌:   r['乾燥肌'],
    脂性肌:   r['脂性肌'],
    混合肌:   r['混合肌'],
    敏感肌:   r['敏感肌'],
    普通肌:   r['普通肌'],
  }));

// 成分エビデンス
const evidence = xlsx.utils.sheet_to_json(wb.Sheets['成分エビデンス（学術根拠）'], { defval: '' })
  .filter(r => r['成分名'])
  .map(r => ({
    name:      r['成分名'],
    effect:    r['効果'],
    evidence:  r['根拠'],
    dose:      r['有効濃度'],
    duration:  r['効果が出るまでの期間'],
  }));

// 言葉の辞書
const wordDict = xlsx.utils.sheet_to_json(wb.Sheets['言葉の辞書（AI変換用）'], { defval: '' })
  .filter(r => r['ユーザーの言葉・表現'])
  .map(r => ({
    expressions: r['ユーザーの言葉・表現'],
    category:    r['変換先カテゴリ'],
    type:        r['種別（肌タイプ/悩み）'],
  }));

// 作用×成分マッピング
const actionMap = xlsx.utils.sheet_to_json(wb.Sheets['作用×成分マッピング'], { defval: '' })
  .filter(r => r['作用カテゴリ'])
  .map(r => ({
    action:      r['作用カテゴリ'],
    description: r['説明'],
    ingredients: r['効果的な成分（優先順）'],
    caution:     r['注意点'],
  }));

// 成分相性表
const compatibility = xlsx.utils.sheet_to_json(wb.Sheets['成分相性表'], { defval: '' })
  .filter(r => r['成分A'])
  .map(r => ({
    ingredientA: r['成分A'],
    ingredientB: r['成分B'],
    compatibility: r['相性'],
    reason:      r['理由・根拠'],
    usage:       r['推奨の使い方'],
  }));

const knowledgeJs = `// 自動生成 — importXlsx.mjs
// スキンケア知識ベース（Excelから抽出）

export const INGREDIENT_DICT = ${JSON.stringify(ingredientDict, null, 2)};

export const CONCERN_MATRIX = ${JSON.stringify(concernMatrix, null, 2)};

export const INGREDIENT_EVIDENCE = ${JSON.stringify(evidence, null, 2)};

export const WORD_DICT = ${JSON.stringify(wordDict, null, 2)};

export const ACTION_MAP = ${JSON.stringify(actionMap, null, 2)};

export const COMPATIBILITY = ${JSON.stringify(compatibility, null, 2)};
`;

writeFileSync('src/data/knowledge.js', knowledgeJs, 'utf-8');
console.log('✅ src/data/knowledge.js を作成しました');
console.log(`   成分辞典: ${ingredientDict.length}件`);
console.log(`   悩み×肌タイプ: ${concernMatrix.length}件`);
console.log(`   成分エビデンス: ${evidence.length}件`);
console.log(`   言葉の辞書: ${wordDict.length}件`);
console.log(`   作用マッピング: ${actionMap.length}件`);
console.log(`   成分相性表: ${compatibility.length}件`);
