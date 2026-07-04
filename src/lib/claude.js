import { SYSTEM_PROMPT } from '../prompts/systemPrompt.js';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-001';
const MAX_RETRIES = 3;

async function callGemini(model, messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    const status = res.status;
    throw Object.assign(new Error(`Gemini API ${status}: ${errText}`), { status });
  }

  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * リトライ＋フォールバック付きでGeminiにメッセージを送信する。
 */
export async function sendMessage(messages) {
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await callGemini(model, messages);
      } catch (err) {
        const isRetryable = err.status === 503 || err.status === 429;
        const isLastAttempt = attempt === MAX_RETRIES;
        const isLastModel = model === models[models.length - 1];

        if (isRetryable && !isLastAttempt) {
          await new Promise(r => setTimeout(r, attempt * 1500));
          continue;
        }
        if (isLastAttempt && !isLastModel) break; // 次のモデルへ
        if (isLastAttempt && isLastModel) throw err;
      }
    }
  }
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
