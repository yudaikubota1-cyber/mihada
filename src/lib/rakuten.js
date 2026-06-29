const AFFILIATE_ID = import.meta.env.VITE_RAKUTEN_AFFILIATE_ID;

const CONCERN_KEYWORDS = {
  '乾燥':       '保湿 乾燥',
  '赤ニキビ':   'ニキビ 鎮静',
  '白ニキビ':   'ニキビ 毛穴ケア',
  'ニキビ跡':   'ニキビ跡 ブライトニング',
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

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 画像URLを高解像度化（128x128 → 400x400）
function upscaleImage(url) {
  if (!url) return null;
  return url.replace(/_ex=\d+x\d+/, '_ex=400x400');
}

function mapItems(items) {
  return items.map(({ Item }) => ({
    id: Item.itemCode,
    name: Item.itemName,
    price: Item.itemPrice,
    priceStr: `¥${Number(Item.itemPrice).toLocaleString()}`,
    image: upscaleImage(Item.mediumImageUrls?.[0]?.imageUrl || Item.smallImageUrls?.[0]?.imageUrl) || null,
    url: Item.affiliateUrl || Item.itemUrl,
    shop: Item.shopName,
    rating: Item.reviewAverage,
    reviewCount: Item.reviewCount,
  }));
}

async function fetchRakuten(keyword, hits) {
  const res = await fetch(`/api/rakuten?keyword=${encodeURIComponent(keyword)}&hits=${hits}`);
  if (!res.ok) throw new Error(`Rakuten API error: ${res.status}`);
  const data = await res.json();
  if (!data.Items || data.error) return [];
  return mapItems(data.Items);
}

// 楽天商品検索API（Vercelサーバー関数経由）
export async function searchRakutenProducts({ concerns = [], category, hits = 5 }) {
  const concernKw = concerns.slice(0, 2).map(c => CONCERN_KEYWORDS[c] || c).join(' ');
  const catKw = CATEGORY_KEYWORDS[category] || 'スキンケア';

  // レート制限対策: リクエスト前に 100ms ディレイ
  await delay(100);

  // ① カテゴリ + 悩みで具体的に検索
  const keyword = `スキンケア ${catKw} ${concernKw}`.trim();
  let items = await fetchRakuten(keyword, hits);

  // ② ヒット0件 → カテゴリのみで再検索（フォールバック）
  if (items.length === 0) {
    await delay(100);
    items = await fetchRakuten(catKw, hits);
  }

  return items;
}
