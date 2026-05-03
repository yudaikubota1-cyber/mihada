// Vercel Serverless Function — 楽天商品検索APIプロキシ
// CORS回避 + applicationId をサーバー側で保持

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { keyword, hits = '5' } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'keyword is required' });
  }

  const appId = process.env.RAKUTEN_APP_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId) {
    return res.status(500).json({ error: 'RAKUTEN_APP_ID not set' });
  }

  const params = new URLSearchParams({
    applicationId: appId,
    keyword,
    hits: String(Math.min(Number(hits), 10)),
    sort: 'reviewCount',
    imageFlag: '1',
    ...(affiliateId ? { affiliateId } : {}),
  });

  const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // 1時間キャッシュ
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
