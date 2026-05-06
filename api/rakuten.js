// Vercel Serverless Function — 楽天商品検索APIプロキシ
// CORS回避 + credentials をサーバー側で保持
// 新エンドポイント: openapi.rakuten.co.jp (2026-04-01)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { keyword, hits = '5' } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'keyword is required' });
  }

  const appId      = process.env.RAKUTEN_APP_ID;
  const accessKey  = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId || !accessKey) {
    return res.status(500).json({ error: 'RAKUTEN_APP_ID or RAKUTEN_ACCESS_KEY not set' });
  }

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    keyword,
    hits:          String(Math.min(Number(hits), 10)),
    sort:          '-reviewCount',
    imageFlag:     '1',
    formatVersion: '2',
    ...(affiliateId ? { affiliateId } : {}),
  });

  const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?${params}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://mihada.vercel.app/',
        'Origin':  'https://mihada.vercel.app',
      },
    });
    const data = await response.json();

    // 1時間キャッシュ
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
