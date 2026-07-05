// Vercel Serverless Function — Gemini チャットプロキシ
// APIキー(GEMINI_API_KEY)をサーバー側のみで保持し、クライアントには一切露出しない。
// リトライ＋モデルフォールバックもサーバー側で完結させる。
import { SYSTEM_PROMPT } from '../src/prompts/systemPrompt.js';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-001';
const MAX_RETRIES = 3;

async function callGemini(model, messages, apiKey) {
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
    throw Object.assign(new Error(`Gemini API ${res.status}`), { status: res.status, detail: errText });
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });

  // body の取得（Vercelは通常JSONをパース済み。文字列で来た場合にも対応）
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages (array) is required' });
  }

  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  for (const model of models) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const text = await callGemini(model, messages, apiKey);
        return res.status(200).json({ text });
      } catch (err) {
        const isRetryable = err.status === 503 || err.status === 429;
        const isLastAttempt = attempt === MAX_RETRIES;
        const isLastModel = model === models[models.length - 1];

        if (isRetryable && !isLastAttempt) {
          await new Promise(r => setTimeout(r, attempt * 1500));
          continue;
        }
        if (isLastAttempt && !isLastModel) break; // 次のモデルへ
        if (isLastAttempt && isLastModel) {
          return res.status(err.status || 500).json({ error: err.message || 'Gemini error' });
        }
      }
    }
  }
  return res.status(500).json({ error: 'Unexpected error' });
}
