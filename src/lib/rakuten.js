const AFFILIATE_ID = import.meta.env.VITE_RAKUTEN_AFFILIATE_ID;

const CONCERN_KEYWORDS = {
  '乾燥':       '保湿 乾燥',
  '赤ニキビ':   'ニキビ 鎮静',
  '白ニキビ':   'ニキビ 毛穴ケア',
  'ニキビ跡':   'ニキビ跡 美白',
  'くすみ':     'くすみ 透明感',
  '毛穴の開き': '毛穴 引き締め',
  '黒ずみ':     '黒ずみ 毛穴',
  'たるみ':     'ハリ たるみ',
};

const CATEGORY_KEYWORDS = {
  cleanser: '洗顔料',
  toner:    '化粧水',
  serum:    '美容液',
  cream:    'クリーム',
};

// 診断結果から楽天検索アフィリエイトURLを生成
export function buildRakutenSearchUrl({ concerns = [], category }) {
  const concernKw = concerns.slice(0, 2).map(c => CONCERN_KEYWORDS[c] || c).join(' ');
  const catKw = CATEGORY_KEYWORDS[category] || 'スキンケア';
  const keyword = encodeURIComponent(`スキンケア ${catKw} ${concernKw}`.trim());

  const searchUrl = `https://search.rakuten.co.jp/search/mall/${keyword}/`;

  if (AFFILIATE_ID) {
    return `https://hb.afl.rakuten.co.jp/hgc/${AFFILIATE_ID}/?pc=${encodeURIComponent(searchUrl)}&m=${encodeURIComponent(searchUrl)}`;
  }
  return searchUrl;
}
