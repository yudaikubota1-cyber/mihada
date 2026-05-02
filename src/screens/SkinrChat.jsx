import React, { useState, useEffect, useRef } from 'react';
import { SKIN_TYPE_CHIPS, CONCERN_CHIPS } from '../data/products.js';
import { SkinrLogo, SkinrEyebrow, Icon, Chip } from '../components/shared.jsx';
import { sendMessage, parseConfirmation } from '../lib/claude.js';

export default function SkinrChat({ initialMessage, onComplete, onBack }) {
  const INITIAL_AI_MESSAGE = '今、気になっていることを教えてください。成分ロジックから、あなたに合う一本を見つけます。';

  // history: Anthropic形式 { role: 'user'|'assistant', content: string }
  const [history, setHistory] = useState([]);
  // 表示用メッセージ { role: 'user'|'ai', text: string }
  const [messages, setMessages] = useState([{ role: 'ai', text: INITIAL_AI_MESSAGE }]);
  const [input, setInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const [loadingStep, setLoadingStep] = useState(-1);
  const [error, setError] = useState(null);
  const [diagnosed, setDiagnosed] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const initialSent = useRef(false);

  // スクロールを最下部に
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, aiTyping, loadingStep]);

  // 初期メッセージがある場合、最初に送信
  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      handleSend(initialMessage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const callAi = async (historyToSend) => {
    setAiTyping(true);
    try {
      const aiText = await sendMessage(historyToSend);
      const confirmed = parseConfirmation(aiText);

      if (confirmed) {
        setAiTyping(false);
        setDiagnosed(true);
        setMessages(prev => [...prev, {
          role: 'ai',
          text: confirmed.message || '十分な情報が集まりました。あなたに最適な成分と商品を分析します。',
        }]);
        setTimeout(() => startLoading(confirmed), 700);
      } else {
        setAiTyping(false);
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        setHistory(prev => [...prev, { role: 'assistant', content: aiText }]);
      }
    } catch (err) {
      setAiTyping(false);
      const friendlyMsg = err.status === 503 || err.status === 429
        ? 'ただいま混み合っています。少し待ってもう一度お試しください。'
        : '通信に失敗しました。もう一度お試しください。';
      setError(friendlyMsg);
      console.error(err);
    }
  };

  const handleSend = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    setError(null);

    // 表示用に追加
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    // 会話履歴を構築
    const newHistory = [...history, { role: 'user', content: userText }];
    setHistory(newHistory);

    await callAi(newHistory);
  };

  const handleRetry = async () => {
    setError(null);
    await callAi(history);
  };

  const startLoading = (diagnosisData) => {
    setDiagnosis(diagnosisData);
    setLoadingStep(0);
    setTimeout(() => setLoadingStep(1), 800);
    setTimeout(() => setLoadingStep(2), 1600);
    setTimeout(() => onComplete(diagnosisData), 2500);
  };

  const send = () => handleSend(input);

  // ─── Loading overlay ───
  if (loadingStep >= 0) {
    return <LoadingScreen step={loadingStep} onBack={onBack} skinType={diagnosis?.skin_type} />;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #F0F0F0',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="close" size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: aiTyping ? '#7A7A7A' : '#111',
            animation: aiTyping ? 'skinrPulse 1s ease infinite' : 'none',
          }} />
          <SkinrEyebrow size={9}>{aiTyping ? '絞り込み中...' : 'SKINR · LOGIC'}</SkinrEyebrow>
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="skinr-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 18px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
        {aiTyping && <TypingIndicator />}

        {error && (
          <div style={{
            padding: '13px 14px',
            background: '#FAFAFA',
            border: '1px solid #EBEBEB',
            borderLeft: '2.5px solid #555',
            borderRadius: 6,
            fontSize: 13,
            color: '#555',
            display: 'flex', flexDirection: 'column', gap: 10,
            animation: 'skinrFadeIn 0.25s ease both',
          }}>
            <span style={{ lineHeight: 1.55 }}>{error}</span>
            <button
              onClick={handleRetry}
              style={{
                alignSelf: 'flex-start',
                padding: '7px 14px',
                background: '#111', color: '#fff',
                border: 'none', borderRadius: 6,
                fontSize: 12, fontFamily: 'inherit', fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              再試行
            </button>
          </div>
        )}

        {/* クイック返信チップ — 最後のAIメッセージの直下にインライン表示 */}
        {!aiTyping && !error && !diagnosed && messages.length > 0 && messages[messages.length - 1].role === 'ai' && (() => {
          const lastAiText = messages[messages.length - 1].text;

          // 肌タイプに関わるキーワード（症状ベースで肌タイプを判定する質問に使われる語）
          const SYMPTOM_KEYS = [
            'テカり', 'テカる', 'つっぱ', 'つっぱり',
            '皮脂が', '皮脂を', '皮脂は',
            '乾燥感', 'べたつ', 'ベタつ', 'しっとり',
            '洗顔後', '水分', 'うるお',
          ];
          const SKIN_TYPE_NAMES = ['乾燥肌', '脂性肌', '混合肌', '敏感肌', '普通肌'];

          // ① バイナリー2択チップ：「Aですか？それともBですか？」パターン
          const binaryOptions = extractBinaryOptions(lastAiText);

          // 肌タイプを聞いているバイナリー質問かどうか判定
          // →「つっぱる？それともテカる？」など → バイナリー抽出テキストではなく肌タイプチップを出す
          const isSkinTypeBinary = binaryOptions &&
            SYMPTOM_KEYS.some(k => lastAiText.includes(k));

          // ② 肌タイプチップ：肌タイプバイナリー質問 OR 症状キーワード OR 肌タイプ名2つ以上
          const hasSymptomQuestion = SYMPTOM_KEYS.some(k => lastAiText.includes(k)) && lastAiText.includes('？');
          const hasMultipleSkinTypeNames = SKIN_TYPE_NAMES.filter(n => lastAiText.includes(n)).length >= 2;
          const showSkinTypeChips = isSkinTypeBinary || (!binaryOptions && (hasSymptomQuestion || hasMultipleSkinTypeNames));

          // バイナリーチップは肌タイプ質問以外のときだけ表示
          const showBinaryChips = binaryOptions && !isSkinTypeBinary;

          const isFirstTurn = messages.length === 1;

          if (!binaryOptions && !showSkinTypeChips && !isFirstTurn) return null;

          return (
            <div style={{ animation: 'skinrFadeIn 0.3s 0.08s ease both', marginTop: -4 }}>

              {/* バイナリー2択チップ（それとも系の質問） */}
              {showBinaryChips && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {binaryOptions.map((opt, i) => (
                    <BinaryOptionChip key={i} label={opt} onSend={handleSend} index={i} />
                  ))}
                </div>
              )}

              {/* 肌タイプチップ（症状/肌タイプ系の質問） */}
              {showSkinTypeChips && (
                <div className="skinr-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                  {SKIN_TYPE_CHIPS.map((c, i) => (
                    <SkinTypeChip key={c.label} chip={c} onSend={handleSend} index={i} />
                  ))}
                </div>
              )}

              {/* 最初のターンのみ：悩みチップも表示 */}
              {isFirstTurn && (
                <>
                  {(binaryOptions || showSkinTypeChips) && <div style={{ height: 1, background: '#F0F0F0', margin: '10px 0' }} />}
                  <div className="skinr-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                    {CONCERN_CHIPS.map((c, i) => (
                      <Chip key={c.label} size="sm" onClick={() => handleSend(c.message)}>
                        {c.label}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })()}

      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid #F0F0F0',
        padding: '10px 16px 20px',
        background: '#fff',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          padding: '10px 12px 10px 16px',
          border: '1.5px solid ' + (aiTyping ? '#EFEFEF' : '#DCDCDC'),
          borderRadius: 999,
          transition: 'border-color 0.15s ease',
          background: aiTyping ? '#FAFAFA' : '#fff',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={aiTyping ? '成分を分析中...' : messages.length === 1 ? '悩みを自由に書いてください…' : 'または自由に入力…'}
            rows={1}
            disabled={aiTyping}
            style={{
              flex: 1,
              border: 'none', outline: 'none', resize: 'none',
              fontSize: 14, fontFamily: 'inherit',
              background: 'transparent',
              padding: '3px 0',
              lineHeight: 1.5,
              maxHeight: 100,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || aiTyping}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: 'none',
              cursor: (input.trim() && !aiTyping) ? 'pointer' : 'default',
              background: (input.trim() && !aiTyping) ? '#111' : '#EFEFEF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s ease',
              boxShadow: (input.trim() && !aiTyping) ? '0 4px 14px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            <Icon name="arrowRight" size={15} color={(input.trim() && !aiTyping) ? '#fff' : '#C0C0C0'} />
          </button>
        </div>
      </div>
    </div>
  );
}

// 「Aですか？それともBですか？」パターンから2択オプションを抽出
function extractBinaryOptions(text) {
  const parts = text.split('それとも');
  if (parts.length !== 2) return null;

  // Option A: parts[0] の末尾にある「ですか？」直前のフレーズ（最大28文字）
  const aMatch = parts[0].match(/([^。？?、\n]{3,28})ですか[？?]\s*$/);
  // Option B: parts[1] の冒頭にある「ですか？」直前のフレーズ（最大28文字）
  const bMatch = parts[1].match(/^\s*([^。？?、\n]{3,28})ですか[？?]/);

  if (aMatch && bMatch) {
    // 「〜のは」「〜るのは」などの冗長プレフィックスを除去
    const trimPrefix = (s) => s.replace(/^.{0,8}(のは|るのは|ているのは|というのは)/, '').trim();
    const a = trimPrefix(aMatch[1]);
    const b = trimPrefix(bMatch[1]);
    if (a.length >= 3 && b.length >= 3) return [a, b];
  }
  return null;
}

// バイナリー2択チップ（全幅・縦積み）
function BinaryOptionChip({ label, onSend, index = 0 }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={() => onSend(label)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: '100%',
        padding: '11px 14px',
        borderRadius: 10,
        border: '1px solid ' + (pressed ? '#B0B0B0' : '#E0E0E0'),
        background: pressed ? '#EFEFEF' : '#FAFAFA',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        color: '#111',
        fontWeight: 500,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.1s ease',
        animation: `skinrFadeIn 0.25s ${0.05 + index * 0.08}s ease both`,
        letterSpacing: '0.01em',
        lineHeight: 1.5,
        boxShadow: pressed ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: '50%',
        border: '1.5px solid #DCDCDC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 9, color: '#ABABAB', fontWeight: 600,
        letterSpacing: '0.02em',
      }}>
        {String.fromCharCode(65 + index)}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
}

// 肌タイプチップ（「わからない」は破線スタイルで区別、sub テキストで症状ヒント付き）
function SkinTypeChip({ chip, onSend, index = 0 }) {
  const isUnknown = chip.label === 'わからない';
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={() => onSend(chip.message)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding: chip.sub ? '7px 12px' : '7px 13px',
        borderRadius: 10,
        border: `1px ${isUnknown ? 'dashed' : 'solid'} ${pressed ? '#888' : isUnknown ? '#C0C0C0' : '#DCDCDC'}`,
        background: pressed ? '#F0F0F0' : isUnknown ? '#FAFAFA' : '#fff',
        color: isUnknown ? '#7A7A7A' : '#111',
        fontFamily: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.1s ease',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        animation: `skinrFadeIn 0.25s ${0.05 + index * 0.04}s ease both`,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.01em' }}>{chip.label}</span>
      {chip.sub && (
        <span style={{ fontSize: 9, color: isUnknown ? '#AAAAAA' : '#A0A0A0', fontWeight: 400, letterSpacing: '0.02em' }}>
          {chip.sub}
        </span>
      )}
    </button>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      animation: 'skinrFadeIn 0.25s ease both',
    }}>
      <div style={{
        maxWidth: '82%',
        padding: isUser ? '11px 14px' : '12px 15px',
        borderRadius: isUser ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
        background: isUser ? '#111' : '#F7F7F7',
        color: isUser ? '#fff' : '#111',
        fontSize: 14, lineHeight: 1.6,
        whiteSpace: 'pre-line',
        border: isUser ? 'none' : '1px solid #EFEFEF',
      }}>
        {message.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', animation: 'skinrFadeIn 0.2s ease both' }}>
      <div style={{
        padding: '13px 16px', borderRadius: '3px 14px 14px 14px',
        background: '#F7F7F7', border: '1px solid #EFEFEF',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#555',
            animation: `skinrTypingDot 1.1s ${i * 0.16}s infinite ease`,
          }} />
        ))}
      </div>
    </div>
  );
}

function LoadingScreen({ step, onBack, skinType }) {
  const steps = ['肌タイプを分析中', '成分を選定中', '商品を絞り込み中'];
  return (
    <div style={{
      height: '100%', background: '#fff',
      display: 'flex', flexDirection: 'column',
      padding: '60px 28px 40px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="close" size={20} color="#7A7A7A" />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          width: 52, height: 52,
          background: '#111',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <div style={{ animation: 'skinrPulse 1.6s ease infinite' }}>
            <Icon name="sparkle" size={22} color="#fff" />
          </div>
        </div>

        <SkinrEyebrow>Logic · Running</SkinrEyebrow>
        <h2 style={{
          fontSize: 26, fontWeight: 400, lineHeight: 1.3,
          letterSpacing: '-0.01em', margin: '12px 0 32px',
        }}>
          {skinType ? (
            <><span style={{ fontWeight: 500 }}>{skinType}</span>の悩みから<br />成分ロジックで絞り込み中</>
          ) : (
            <>悩みから成分を特定し、<br />一本に絞り込んでいます</>
          )}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {steps.map((s, i) => {
            const status = i < step ? 'done' : i === step ? 'active' : 'pending';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: status === 'pending' ? 0.3 : 1,
                transition: 'opacity 0.3s ease',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: '1px solid ' + (status === 'pending' ? '#E2E2E2' : '#111'),
                  background: status === 'done' ? '#111' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {status === 'done' && <Icon name="check" size={12} color="#fff" />}
                  {status === 'active' && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#111',
                      animation: 'skinrPulse 1s ease infinite',
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {s}
                    {status === 'active' && <span style={{ marginLeft: 4, color: '#7A7A7A' }}>...</span>}
                  </div>
                  {status === 'active' && (
                    <div style={{
                      marginTop: 8, height: 1, background: '#F0F0F0',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%',
                        background: '#111',
                        animation: 'skinrLoadBar 1.3s ease forwards',
                      }} />
                    </div>
                  )}
                </div>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: '0.14em', color: '#B5B5B5',
                }}>
                  {String(i + 1).padStart(2, '0')} / 03
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <SkinrLogo size={11} />
      </div>
    </div>
  );
}
