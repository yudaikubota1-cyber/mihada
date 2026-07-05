// AIチャットは /api/chat（Vercelサーバーレス関数）経由で呼び出す。
// APIキー・システムプロンプトはサーバー側のみで保持し、クライアントには一切含めない。
// リトライ／モデルフォールバックはサーバー側で完結する。

/**
 * サーバーレス関数 /api/chat にメッセージを送信し、AIの返答テキストを返す。
 * messages: [{ role: 'user'|'assistant', content: string }]
 */
export async function sendMessage(messages) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    let msg = `Chat API ${res.status}`;
    try {
      const e = await res.json();
      if (e && e.error) msg = e.error;
    } catch { /* ignore */ }
    // 混雑系ステータスは呼び出し側の「混み合っています」表示に使われる
    throw Object.assign(new Error(msg), { status: res.status });
  }

  const data = await res.json();
  return data.text;
}

/**
 * AIの返答がJSON確定形式かどうかを判定する。
 * 確定なら parsed オブジェクトを返し、そうでなければ null。
 */
export function parseConfirmation(text) {
  try {
    const match = text.match(/\{[\s\S]*?"status"\s*:\s*"confirmed"[\s\S]*?\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (parsed.status !== 'confirmed') return null;
    // スロット埋め方式: skin_type/concerns 以外に ingredient/brand/category/max_price の
    // いずれか1つでも埋まっていれば確定として受理する（成分・ブランド単独検索に対応）。
    const hasSlot =
      parsed.skin_type ||
      (Array.isArray(parsed.concerns) && parsed.concerns.length > 0) ||
      parsed.ingredient ||
      parsed.brand ||
      parsed.category ||
      (parsed.max_price != null && parsed.max_price !== '');
    return hasSlot ? parsed : null;
  } catch {
    return null;
  }
}
