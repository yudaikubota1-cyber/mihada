import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('src/data/products.js', 'utf-8');

const extra = `
export const SKIN_TYPE_CHIPS = [
  { label: '乾燥肌', message: '乾燥肌です', sub: '乾燥・つっぱり' },
  { label: '脂性肌', message: '脂性肌です', sub: 'テカり・ベタつき' },
  { label: '混合肌', message: '混合肌です', sub: 'Tゾーンのみテカ' },
  { label: '敏感肌', message: '敏感肌です', sub: '赤み・刺激感' },
  { label: '普通肌', message: '普通肌です', sub: '特にトラブルなし' },
  { label: 'わからない', message: '自分の肌タイプがよくわかりません', sub: '症状から判定' },
];

// 悩み選択チップ
export const CONCERN_CHIPS = [
  { label: '乾燥', message: '乾燥が気になります' },
  { label: '毛穴の開き', message: '毛穴の開きが気になります' },
  { label: '黒ずみ', message: '小鼻の黒ずみが気になります' },
  { label: '赤ニキビ', message: '赤ニキビができやすいです' },
  { label: '白ニキビ', message: '白ニキビができやすいです' },
  { label: 'ニキビ跡', message: 'ニキビ跡が気になります' },
  { label: 'くすみ', message: 'くすみが気になります' },
  { label: 'たるみ', message: 'たるみ・ハリ不足が気になります' },
];

// 肌タイプ絞り込みチップ
export const SKIN_TYPE_FILTER_CHIPS = [
  { id: '乾燥肌', label: '乾燥肌' },
  { id: '脂性肌', label: '脂性肌' },
  { id: '混合肌', label: '混合肌' },
  { id: '敏感肌', label: '敏感肌' },
];

export const QUICK_REPLIES = CONCERN_CHIPS.map(c => c.message);

export const ROUTINE_STEPS = {
  morning: [
    { step: '01', label: 'ANUA クレンジング', productId: 'anua-9' },
    { step: '02', label: 'ANUA トナー', productId: 'anua-6' },
    { step: '03', label: 'Torriden セラム', productId: 'torriden-64' },
    { step: '04', label: 'BIOHEAL BOH クリーム', productId: 'bioheal-boh-54' },
  ],
  night: [
    { step: '01', label: '魔女工場 クレンジング', productId: '---91' },
    { step: '02', label: 'ANUA 洗顔', productId: 'anua-11' },
    { step: '03', label: 'COSRX スネイル', productId: 'cosrx-72' },
    { step: '04', label: 'Torriden セラム', productId: 'torriden-64' },
    { step: '05', label: 'キュレル クリーム', productId: '--98' },
  ],
};
`;

writeFileSync('src/data/products.js', src.trimEnd() + '\n' + extra, 'utf-8');
console.log('✅ extra exports appended');
