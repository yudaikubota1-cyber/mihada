// Vercel Serverless Function — 商品画像プロキシ
// Rakuten CDN画像をサーバーサイドでフェッチしてCORSヘッダー付きで返す
// スライドのhtml2canvas PNG出力でも画像が含まれるようになる

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) return res.status(400).end('url required');

  // Rakuten CDNのみ許可
  let targetUrl;
  try {
    targetUrl = new URL(url);
  } catch {
    return res.status(400).end('invalid url');
  }
  if (!targetUrl.hostname.endsWith('rakuten.co.jp')) {
    return res.status(403).end('only rakuten.co.jp images allowed');
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'Referer': 'https://item.rakuten.co.jp/',
        'Origin': 'https://item.rakuten.co.jp',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=86400');
    res.end(Buffer.from(buffer));
  } catch (err) {
    res.status(500).end(err.message);
  }
}
