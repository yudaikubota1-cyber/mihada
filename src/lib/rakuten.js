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
  cleanser:  '洗顔料',
  toner:     '化粧水',
  serum:     '美容液',
  cream:     'クリーム',
  mask:      'シートマスク',
  pad:       'トナーパッド',
  sunscreen: '日焼け止め',
};

// 楽天商品ページURL（個別商品名で検索）
export function buildProductUrl(product) {
  const keyword = encodeURIComponent(`${product.brand} ${product.nameJa || product.name}`.trim());
  const searchUrl = `https://search.rakuten.co.jp/search/mall/${keyword}/`;
  if (AFFILIATE_ID) {
    return `https://hb.afl.rakuten.co.jp/hgc/${AFFILIATE_ID}/?pc=${encodeURIComponent(searchUrl)}&m=${encodeURIComponent(searchUrl)}`;
  }
  return searchUrl;
}

// 楽天検索アフィリエイトURL（カテゴリ別の外部検索リンク）
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

// 楽天商品検索API（Vercelサーバー関数経由）
export async function searchRakutenProducts({ concerns = [], category, hits = 5 }) {
  const concernKw = concerns.slice(0, 2).map(c => CONCERN_KEYWORDS[c] || c).join(' ');
  const catKw = CATEGORY_KEYWORDS[category] || 'スキンケア';
  const keyword = `スキンケア ${catKw} ${concernKw}`.trim();

  const res = await fetch(`/api/rakuten?keyword=${encodeURIComponent(keyword)}&hits=${hits}`);
  if (!res.ok) throw new Error(`Rakuten API error: ${res.status}`);

  const data = await res.json();
  if (!data.Items || data.error) return [];

  return data.Items.map(({ Item }) => ({
    id: Item.itemCode,
    name: Item.itemName,
    price: Item.itemPrice,
    priceStr: `¥${Number(Item.itemPrice).toLocaleString()}`,
    image: Item.smallImageUrls?.[0]?.imageUrl?.replace('_ex=128x128', '_ex=200x200') || null,
    url: Item.affiliateUrl || Item.itemUrl,
    shop: Item.shopName,
    rating: Item.reviewAverage,
    reviewCount: Item.reviewCount,
  }));
}
