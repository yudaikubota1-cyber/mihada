import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS, CATEGORIES, CONCERN_CHIPS, SKIN_TYPE_FILTER_CHIPS } from '../data/products.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Chip, Divider, ProductCard,
} from '../components/shared.jsx';

// ── 公式ショップURL ─────────────────────────────────────────────
const BRAND_STORE_URL = {
  'ANUA': 'https://www.rakuten.co.jp/anuajapan/',
  'MEDICUBE': 'https://www.rakuten.co.jp/apr-japan/',
  'Numbuzin': 'https://www.rakuten.co.jp/numbuzin/',
  'Dr.G': 'https://www.rakuten.co.jp/drg-japan/',
  'dalba': 'https://www.rakuten.co.jp/dalba/',
  'VT COSMETICS': 'https://www.rakuten.co.jp/vtcosmetic-official/',
  'COSRX': 'https://www.rakuten.co.jp/cosrx-official/',
  'SKIN1004': 'https://www.rakuten.co.jp/skin1004-official/',
  'BIOHEAL BOH': 'https://www.rakuten.co.jp/biohealboh/',
  '魔女工場': 'https://www.rakuten.co.jp/manyo-official/',
  'innisfree': 'https://www.rakuten.co.jp/innisfree-official/',
  'Abib': 'https://www.rakuten.co.jp/abibofficial/',
  'Torriden': 'https://www.rakuten.co.jp/torriden-official/',
  'Centellian24': 'https://www.rakuten.co.jp/dongkook/',
  'ファンケル': 'https://www.rakuten.co.jp/fancl-shop/',
  'Goodal': 'https://www.rakuten.co.jp/cliojapan/',
};

// ── AI 肌診断チャットカード ─────────────────────────────────────
const G = '#1DAB6A';   // メイングリーン（明るめ）
const GD = '#178A55';  // ダークグリーン（ホバー用）

// キーワード分類マップ
const CONCERN_KEYWORDS = {
  '乾燥・保湿':   ['乾燥', 'かさつき', 'かさかさ', 'カサカサ', 'パサパサ', 'しっとり', '保湿', 'つっぱり', 'バリア', 'うるお', '乾いて', '皮むけ', 'ごわつき', 'ゴワつ', 'アトピー', 'インナードライ'],
  '毛穴・黒ずみ': ['毛穴', '黒ずみ', '黒ずん', 'つまり', 'ざらつき', '角栓', 'ポア', 'テカリ', 'テカ', '皮脂', 'オイリー', 'べたつ', 'ベタつ', 'ザラザラ', '角質'],
  'ニキビ・赤み': ['ニキビ', 'にきび', 'ぶつぶつ', '赤み', '赤く', '吹き出物', '炎症', '肌荒れ', 'アクネ', 'できもの', '荒れ', 'ぽつぽつ', 'コメド', '赤ら顔'],
  'くすみ・シミ': ['くすみ', 'くすん', 'シミ', 'しみ', 'トーン', '明るく', '透明感', '色素', '暗い', 'くっきり', '美白', '白く', '白い', '白さ', 'そばかす', '色白', 'ムラ', '均一'],
  'たるみ・ハリ': ['たるみ', 'たるん', 'ハリ', 'はり', '弾力', 'リフト', 'しわ', 'シワ', '引き締め', 'たぷ', 'ほうれい線', '法令線', 'フェイスライン', '老け', 'エイジング', 'クマ', '目元'],
};

const CONCERN_OPTIONS = [
  { label: '乾燥・保湿',   sub: 'かさつき・バリアを整えたい' },
  { label: '毛穴・黒ずみ', sub: '毛穴を引き締めたい' },
  { label: 'ニキビ・赤み', sub: '炎症・肌荒れを抑えたい' },
  { label: 'くすみ・シミ', sub: 'トーンアップしたい' },
  { label: 'たるみ・ハリ', sub: 'リフトアップしたい' },
];

const SKIN_TYPE_OPTIONS = [
  { label: '乾燥肌',    sub: 'かさつき・つっぱり感がある' },
  { label: '脂性肌',    sub: 'テカリやすい' },
  { label: '混合肌',    sub: 'Tゾーンのみテカる' },
  { label: 'わからない', sub: '自分の肌質に自信がない' },
];

function classifyConcern(text) {
  for (const [concern, keywords] of Object.entries(CONCERN_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return concern;
  }
  return null;
}

const INGR_MAP = {
  '乾燥肌':  { base: ['ヒアルロン酸Na','セラミド','グリセリン'] },
  '脂性肌':  { base: ['ナイアシンアミド','サリチル酸','ティーツリー'] },
  '混合肌':  { base: ['ナイアシンアミド','ヒアルロン酸Na','レチノール'] },
  '普通肌':  { base: ['ビタミンC誘導体','レチノール','ペプチド'] },
};
const CONCERN_MAP = {
  '乾燥・保湿':   ['セラミド','ヒアルロン酸Na','スクワラン'],
  '毛穴・黒ずみ': ['サリチル酸','グルコン酸','ナイアシンアミド'],
  'ニキビ・赤み': ['アゼライン酸','ティーツリー','アラントイン'],
  'くすみ・シミ': ['ビタミンC誘導体','アルブチン','トラネキサム酸'],
  'たるみ・ハリ': ['レチノール','ペプチド','EGF'],
};
const INGR_ICONS = { 'ヒアルロン酸Na':'💧','セラミド':'🛡','グリセリン':'🌊','ナイアシンアミド':'✨','サリチル酸':'🔬','ティーツリー':'🌿','レチノール':'🌙','ビタミンC誘導体':'☀️','ペプチド':'⚡','スクワラン':'💎','グルコン酸':'🧪','アゼライン酸':'🌸','アラントイン':'🌱','アルブチン':'🤍','トラネキサム酸':'⚪','EGF':'🔑' };

function getIngredients(skinType, concern) {
  const base = (INGR_MAP[skinType] || INGR_MAP['普通肌']).base;
  const c = CONCERN_MAP[concern] || [];
  return [...new Set([...c.slice(0, 2), ...base])].slice(0, 3);
}

function ChatDiagnosisCard({ onComplete }) {
  // phase: 'init' | 'concern_input' | 'concern_followup' | 'skintype' | 'done'
  const [messages, setMessages]   = useState([]);
  const [typing, setTyping]       = useState(false);
  const [phase, setPhase]         = useState('init');
  const [concern, setConcern]     = useState(null);
  const [skinType, setSkinType]   = useState(null);
  const [inputText, setInputText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  // 初期メッセージ
  useEffect(() => {
    const t = setTimeout(() => {
      setMessages([{ role: 'ai', text: 'こんにちは！\n今、一番気になるお肌の悩みを教えてください。', isFirst: true }]);
      setPhase('concern_input');
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 60);
  }, [messages, typing, showResult]);

  // Auto-focus input when phase is concern_input
  useEffect(() => {
    if (phase === 'concern_input' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase]);

  // 自由記述の悩みを送信
  const submitConcern = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    setMessages(m => [...m, { role: 'user', text }]);
    setPhase('init');
    setTyping(true);

    const matched = classifyConcern(text);
    setTimeout(() => {
      if (matched) {
        setConcern(matched);
        setMessages(m => [...m, { role: 'ai', text: `「${matched}」のお悩みですね。\n次に、お肌のタイプを教えてください。` }]);
        setTyping(false);
        setPhase('skintype');
      } else {
        setMessages(m => [...m, { role: 'ai', text: 'ありがとうございます。\nお悩みに近いのはどちらですか？' }]);
        setTyping(false);
        setPhase('concern_followup');
      }
    }, 900);
  };

  // フォローアップ（選択式）でお悩みを確定
  const pickConcernFollowup = (label) => {
    setConcern(label);
    setMessages(m => [...m, { role: 'user', text: label }]);
    setPhase('init');
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: `「${label}」ですね。\nお肌のタイプを教えてください。` }]);
      setTyping(false);
      setPhase('skintype');
    }, 700);
  };

  // 肌タイプを選択 → 自動で結果画面へ遷移
  const pickSkinType = (label) => {
    setSkinType(label);
    setMessages(m => [...m, { role: 'user', text: label }]);
    setPhase('init');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setPhase('done');
      // 直接onCompleteを呼んで結果画面へ
      if (onComplete) {
        onComplete({ concern, skinType: label });
      }
    }, 800);
  };

  // プログレス
  const progressPct = phase === 'concern_input' ? 8 : phase === 'concern_followup' ? 30 : phase === 'skintype' ? 55 : phase === 'done' ? 100 : 0;

  const ingredients = (concern && skinType) ? getIngredients(skinType, concern) : [];
  const skinLabel   = skinType === 'わからない' ? '肌タイプ未判定' : skinType;
  const resultNote  = skinType === 'わからない'
    ? '詳しい診断でさらに精度の高い提案ができます'
    : `${skinLabel}の${concern}には、この成分の組み合わせがおすすめです`;

  // 選択ボタン共通スタイル生成
  const optionButtonStyle = (wide) => ({
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    padding: '10px 15px', borderRadius: 12,
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.14s ease',
    flex: wide ? '0 0 calc(50% - 4px)' : '1', minWidth: 0,
  });

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        background: 'var(--bg)', borderRadius: 22, overflow: 'hidden',
        boxShadow: '0 16px 64px rgba(80,60,40,0.14), 0 2px 8px rgba(80,60,40,0.06)',
        border: '1px solid rgba(228,217,206,0.8)',
      }}>
        {/* ヘッダー */}
        <div style={{ background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)`, padding: '14px 18px 13px', display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={17} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>AI 肌診断</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>成分ロジック エンジン 稼働中</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>
              {phase === 'done' ? 'DONE' : 'STEP'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
              {phase === 'done' ? '✓' : (phase === 'skintype' || phase === 'concern_followup') ? '2' : '1'}
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <div style={{ height: 2, background: `rgba(29,171,106,0.12)` }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${G}, ${GD})`, width: `${progressPct}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>

        {/* メッセージエリア */}
        <div ref={scrollRef} className="skinr-scroll" style={{ padding: '20px 16px 16px', maxHeight: showResult ? 460 : 220, minHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)' }}>
          {messages.map((msg, i) => (
            msg.role === 'ai' ? (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'skinrFadeIn 0.22s ease' }}>
                {!msg.isFirst
                  ? <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px rgba(29,171,106,0.25)` }}><Icon name="sparkle" size={12} color="#fff" /></div>
                  : <div style={{ width: 28, flexShrink: 0 }} />
                }
                <div style={{ maxWidth: '80%', padding: '11px 15px', background: '#fff', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.65, color: '#1A1814', whiteSpace: 'pre-line', letterSpacing: '0.01em', boxShadow: '0 2px 12px rgba(80,60,40,0.08)' }}>
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', animation: 'skinrFadeIn 0.22s ease' }}>
                <div style={{ maxWidth: '75%', padding: '11px 15px', background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)`, borderRadius: '18px 4px 18px 18px', fontSize: 13, lineHeight: 1.6, color: '#fff', fontWeight: 500, letterSpacing: '0.01em', boxShadow: `0 3px 12px rgba(29,171,106,0.28)` }}>
                  {msg.text}
                </div>
              </div>
            )
          ))}

          {/* タイピング */}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'skinrFadeIn 0.18s ease' }}>
              <div style={{ width: 28, flexShrink: 0 }} />
              <div style={{ padding: '12px 16px', background: '#fff', borderRadius: '4px 18px 18px 18px', display: 'flex', gap: 5, alignItems: 'center', boxShadow: '0 2px 12px rgba(80,60,40,0.08)' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8B8A8', animation: `skinrTypingDot 1.3s ease ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}

          {/* 結果カード */}
          {showResult && (
            <div style={{ margin: '4px 0 0 36px', background: 'linear-gradient(135deg, #F0FAF4 0%, #E8F5EF 100%)', border: `1.5px solid rgba(29,171,106,0.18)`, borderRadius: 16, padding: '18px 18px 16px', animation: 'skinrSlideUp 0.3s ease', boxShadow: `0 4px 20px rgba(29,171,106,0.10)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: G }} />
                <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.18em', color: G, fontWeight: 600 }}>診断完了 — あなたへのご提案</span>
              </div>
              <div style={{ fontSize: 13, color: '#1A1814', fontWeight: 600, marginBottom: 3 }}>{skinLabel} × {concern}</div>
              <div style={{ fontSize: 11, color: '#7A706A', marginBottom: 14 }}>{resultNote}</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#AAA098', marginBottom: 10 }}>注目すべき成分</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {ingredients.map(ing => (
                  <div key={ing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: '#fff', border: `1px solid rgba(29,171,106,0.15)`, fontSize: 12, fontWeight: 500, color: '#1A1814', boxShadow: `0 1px 4px rgba(29,171,106,0.06)` }}>
                    <span style={{ fontSize: 13 }}>{INGR_ICONS[ing] || '🌿'}</span>{ing}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onComplete && onComplete({ concern, skinType })}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${G} 0%, ${GD} 100%)`, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 16px rgba(29,171,106,0.30)`, transition: 'all 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 24px rgba(29,171,106,0.40)`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 16px rgba(29,171,106,0.30)`}
              >
                <Icon name="sparkle" size={13} color="#fff" />
                おすすめ商品を全部見る
              </button>
            </div>
          )}
        </div>

        {/* ── 自由記述入力（悩みステップ） ── */}
        {phase === 'concern_input' && (
          <div style={{ padding: '12px 14px 14px', borderTop: '1px solid var(--border)', animation: 'skinrSlideUp 0.22s ease' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <input
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitConcern(); } }}
                placeholder="例：ぶつぶつが気になる、乾燥してかさかさ…"
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 12,
                  border: '1.5px solid var(--border)', background: 'var(--bg-soft)',
                  fontSize: 13, fontFamily: 'inherit', color: '#1A1814',
                  outline: 'none', transition: 'border-color 0.15s ease',
                }}
                onFocus={e => e.currentTarget.style.borderColor = G}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={submitConcern}
                disabled={!inputText.trim()}
                style={{
                  padding: '11px 18px', borderRadius: 12, border: 'none', flexShrink: 0,
                  background: inputText.trim() ? `linear-gradient(135deg, ${G} 0%, ${GD} 100%)` : 'var(--bg-soft)',
                  color: inputText.trim() ? '#fff' : '#C8B8A8',
                  fontSize: 13, fontWeight: 600,
                  cursor: inputText.trim() ? 'pointer' : 'default',
                  fontFamily: 'inherit', transition: 'all 0.15s ease',
                  boxShadow: inputText.trim() ? '0 2px 12px rgba(29,171,106,0.28)' : 'none',
                }}
              >送信</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#C8C0B8', letterSpacing: '0.02em' }}>
              気になることを自由に入力してください · Enter で送信
            </div>
          </div>
        )}

        {/* ── フォローアップ選択（キーワード未一致時） ── */}
        {phase === 'concern_followup' && (
          <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', animation: 'skinrSlideUp 0.22s ease' }}>
            <div style={{ paddingTop: 12, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#AAA098', marginBottom: 8 }}>近いものを選んでください</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CONCERN_OPTIONS.map(q => (
                <button key={q.label} onClick={() => pickConcernFollowup(q.label)}
                  style={optionButtonStyle(true)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.background = `rgba(29,171,106,0.04)`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', letterSpacing: '-0.01em' }}>{q.label}</span>
                  {q.sub && <span style={{ fontSize: 10, color: '#AAA098', marginTop: 2 }}>{q.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 肌タイプ選択 ── */}
        {phase === 'skintype' && (
          <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', animation: 'skinrSlideUp 0.22s ease' }}>
            <div style={{ paddingTop: 12, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#AAA098', marginBottom: 8 }}>肌タイプを選んでください</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKIN_TYPE_OPTIONS.map(q => (
                <button key={q.label} onClick={() => pickSkinType(q.label)}
                  style={optionButtonStyle(true)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = G; e.currentTarget.style.background = `rgba(29,171,106,0.04)`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', letterSpacing: '-0.01em' }}>{q.label}</span>
                  {q.sub && <span style={{ fontSize: 10, color: '#AAA098', marginTop: 2 }}>{q.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BrandDirectoryRow ───────────────────────────────────────────────────────
function BrandDirectoryRow({ brand, total, lines, products, px, isDesktop, delay = 0, onClick, onOpenProduct }) {
  const [hovered, setHovered] = React.useState(false);
  const scrollRef = React.useRef(null);
  const filteredLines = lines.filter(({ line }) => line !== '—');

  // 画像つき商品を優先して最大20枚
  const imageProducts = React.useMemo(() => {
    const withImg = products.filter(p => p.image);
    const withoutImg = products.filter(p => !p.image);
    return [...withImg, ...withoutImg].slice(0, 20);
  }, [products]);

  const cardW = isDesktop ? 160 : 130;
  const cardH = isDesktop ? 160 : 130;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        background: hovered ? 'var(--bg-warm)' : 'transparent',
        transition: 'background 0.15s ease',
        animation: `skinrFadeIn 0.3s ${delay}s ease both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ブランド名 + もっと見るボタン */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `16px ${px} 10px` }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: isDesktop ? 16 : 14, fontWeight: 700, color: '#1A1814', letterSpacing: '-0.02em' }}>{brand}</span>
            <span style={{ fontSize: 9, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>{total} ITEMS</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 5px' }}>
            {filteredLines.slice(0, 3).map(({ line, products: lp }) => (
              <span key={line} style={{
                fontSize: 10, color: '#9A9087',
                background: 'var(--bg-soft)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                padding: '2px 6px',
                letterSpacing: '0.01em',
                lineHeight: 1.6,
              }}>
                {line}
                <span style={{ fontSize: 9, color: '#C5C5C5', marginLeft: 3 }}>{lp.length}</span>
              </span>
            ))}
            {filteredLines.length > 3 && (
              <span style={{ fontSize: 10, color: '#C5C5C5', padding: '2px 0', lineHeight: 1.6 }}>+{filteredLines.length - 3}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClick}
          style={{
            background: hovered ? '#1DAB6A' : 'none',
            border: '1px solid ' + (hovered ? '#1DAB6A' : 'var(--border-strong)'),
            borderRadius: 8, cursor: 'pointer',
            fontSize: 11, color: hovered ? '#fff' : '#555',
            fontWeight: 600, fontFamily: 'inherit',
            padding: '7px 14px', whiteSpace: 'nowrap',
            flexShrink: 0, marginLeft: 14,
            transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          もっと見る
          <Icon name="arrowRight" size={10} color={hovered ? '#fff' : '#999'} />
        </button>
      </div>

      {/* 横スクロール商品ストリップ */}
      <div style={{ position: 'relative', paddingBottom: 14 }}>
        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 14,
            overflowX: 'auto',
            paddingLeft: px,
            paddingRight: px,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={e => e.stopPropagation()}
        >
          {imageProducts.map((p, i) => (
            <div
              key={p.id}
              style={{ flexShrink: 0, width: cardW, textAlign: 'left' }}
            >
              {/* 画像（クリックで詳細） */}
              <div
                onClick={() => onOpenProduct ? onOpenProduct(p.id) : onClick()}
                style={{
                  width: cardW, height: cardH,
                  borderRadius: 10, overflow: 'hidden',
                  background: p.swatch || '#F0EDE8',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.nameJa || p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                    loading="lazy"
                  />
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 100, color: p.accent || '#888', opacity: 0.22 }}>
                    {(p.brand || '?').charAt(0)}
                  </span>
                )}
              </div>
              {/* 商品名 */}
              <div style={{
                fontSize: isDesktop ? 11 : 10, color: '#6B6560',
                lineHeight: 1.4, overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                letterSpacing: '-0.01em', marginTop: 6,
              }}>
                {p.nameJa || p.name}
              </div>
              {/* 価格 */}
              <div style={{ fontSize: isDesktop ? 11 : 10, fontWeight: 700, color: '#1A1814', marginTop: 3 }}>
                {p.price || '—'}
              </div>
              {/* 詳細・購入ボタン */}
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                <button
                  onClick={() => onOpenProduct ? onOpenProduct(p.id) : onClick()}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: 9, fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer',
                    border: '1px solid var(--border-strong)', borderRadius: 5,
                    background: 'var(--bg-soft)', color: '#555',
                    letterSpacing: '0.02em',
                  }}
                >詳細</button>
                <button
                  onClick={() => window.open(
                    p.url || `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(p.nameJa || p.name)}/`,
                    '_blank', 'noopener'
                  )}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: 9, fontWeight: 700,
                    fontFamily: 'inherit', cursor: 'pointer',
                    border: 'none', borderRadius: 5,
                    background: '#BF0000', color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >購入</button>
              </div>
            </div>
          ))}
          {/* 末尾:もっと見るカード */}
          <button
            onClick={onClick}
            style={{
              flexShrink: 0,
              width: cardW,
              height: cardH,
              borderRadius: 10,
              border: '1px dashed var(--border-strong)',
              background: hovered ? 'rgba(29,171,106,0.04)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transition: 'background 0.15s',
              alignSelf: 'flex-start',
            }}
          >
            <span style={{ fontSize: 18, color: '#1DAB6A' }}>→</span>
            <span style={{ fontSize: 9, color: '#1DAB6A', fontWeight: 600, letterSpacing: '0.05em' }}>全部見る</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ホームカードのconcernラベル → 結果画面用concerns
const QUICK_CONCERN_MAP = {
  '乾燥・保湿':   ['乾燥'],
  '毛穴・黒ずみ': ['毛穴の開き', '黒ずみ'],
  'ニキビ・赤み': ['赤ニキビ', '肌荒れ'],
  'くすみ・シミ': ['くすみ', 'シミ'],
  'たるみ・ハリ': ['たるみ'],
};

export default function SkinrHome({ isDesktop, onStartChat, onOpenProduct, onSendInline, onQuickDiagnosis, onOpenArticle, lastDiagnosis, onViewLastResult, homeFilter }) {
  const [cat, setCat] = useState(homeFilter?.cat || 'all');
  const [skinFilter, setSkinFilter] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollRowRefs = useRef({});
  // 診断フィルター（結果画面の「すべて見る」から来た場合）
  const [activeFilterIds, setActiveFilterIds] = useState(homeFilter?.productIds || null);
  const activeFilterLabel = homeFilter?.label || null;
  const [activeBrand, setActiveBrand] = useState(null);

  const scrollRow = (key, dir) => {
    const el = scrollRowRefs.current[key];
    if (el) el.scrollBy({ left: dir * (isDesktop ? 640 : 320), behavior: 'smooth' });
  };

  const clearFilter = () => {
    setActiveFilterIds(null);
    setActiveBrand(null);
    setCat('all');
    setSkinFilter(null);
  };

  const filtered = PRODUCTS.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (activeFilterIds && !activeFilterIds.includes(p.id)) return false;
    if (skinFilter) {
      const haystack = [...(p.skinTypes || []), ...(p.forSkin || [])];
      if (!haystack.some(s => s.includes(skinFilter))) return false;
    }
    if (query) {
      const searchTarget = [
        p.nameJa, p.name, p.brand,
        ...p.tags,
        ...p.concerns,
        ...p.forSkin,
        ...(Array.isArray(p.ingredients) ? p.ingredients : p.ingredients.map(i => i.name || '')),
      ].join(' ').toLowerCase();
      if (!searchTarget.includes(query.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    if (activeFilterIds) {
      const ai = activeFilterIds.indexOf(a.id);
      const bi = activeFilterIds.indexOf(b.id);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
    }
    return 0;
  });

  const px = isDesktop ? '40px' : '24px';

  // フィルターが何も掛かっていない = ブランドディレクトリモード
  const isBrandMode = cat === 'all' && !skinFilter && !query && !activeFilterIds && !activeBrand;

  // ブランド → ライン別グループ（ブランドディレクトリ用）
  const brandGroups = isBrandMode ? (() => {
    const brandMap = new Map();
    PRODUCTS.forEach(p => {
      if (!brandMap.has(p.brand)) brandMap.set(p.brand, new Map());
      const lineKey = p.line || '—';
      const lm = brandMap.get(p.brand);
      if (!lm.has(lineKey)) lm.set(lineKey, []);
      lm.get(lineKey).push(p);
    });
    return [...brandMap.entries()].map(([brand, lm]) => ({
      brand,
      total: [...lm.values()].reduce((s, ps) => s + ps.length, 0),
      lines: [...lm.entries()].map(([line, products]) => ({ line, products })),
      products: [...lm.values()].flat(),
    }));
  })() : null;

  // フィルター中のブランド別グループ（プレビュー付き）
  const filteredBrandGroups = (!isBrandMode && !activeBrand && filtered.length > 0) ? (() => {
    const bm = new Map();
    filtered.forEach(p => {
      if (!bm.has(p.brand)) bm.set(p.brand, []);
      bm.get(p.brand).push(p);
    });
    return [...bm.entries()].map(([brand, products]) => ({ brand, products }));
  })() : null;

  // activeBrand が設定されているとき → filteredの中からそのブランド絞り込み → ライン別
  const activeBrandLines = activeBrand ? (() => {
    const brandProds = activeBrand
      ? (filtered.some(p => p.brand === activeBrand)
          ? filtered.filter(p => p.brand === activeBrand)
          : PRODUCTS.filter(p => p.brand === activeBrand))
      : [];
    const lm = new Map();
    brandProds.forEach(p => {
      const k = p.line || '—';
      if (!lm.has(k)) lm.set(k, []);
      lm.get(k).push(p);
    });
    return { products: brandProds, lines: [...lm.entries()].map(([line, products]) => ({ line, products })) };
  })() : null;

  return (
    <div className={`skinr-scroll${isDesktop ? ' skinr-page' : ''}`} style={{
      flex: isDesktop ? 'none' : 1,
      minHeight: 0,
      overflowY: isDesktop ? 'visible' : 'auto',
      background: 'var(--bg)',
    }}>
      {/* Header — hidden on desktop (logo is in sidebar) */}
      {!isDesktop && (
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', justifyContent: 'center',
        padding: '14px 0',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,254,251,0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <SkinrLogo size={15} />
      </div>
      )}


      {/* Hero — AI Chat Diagnosis Card */}
      {isDesktop ? (
        /* ── Desktop: フルスクリーンヒーロー ── */
        <div style={{
          minHeight: 'calc(100dvh - 60px)',
          padding: '0 64px',
          background: 'linear-gradient(160deg, var(--bg-warm) 0%, var(--bg-soft) 60%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border-strong)',
          display: 'flex', flexDirection: 'row',
          alignItems: 'center', gap: 'clamp(32px, 5vw, 80px)',
        }}>
          {/* 左: コピー */}
          <div style={{ flex: '0 0 auto', maxWidth: 360 }}>
            <SkinrEyebrow>Ingredient Logic AI</SkinrEyebrow>
            <h1 style={{
              margin: '20px 0 0',
              fontSize: 52, lineHeight: 1.1,
              fontWeight: 400, letterSpacing: '-0.04em',
            }}>
              「何が合うか<br />わからない」を<br />終わりにする。
            </h1>
            {/* スクロールヒント */}
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 1, height: 28, background: 'var(--border-strong)' }} />
              <span style={{ fontSize: 10, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em' }}>SCROLL TO BROWSE</span>
            </div>
          </div>

          {/* 右: チャットカード */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ChatDiagnosisCard onComplete={({ concern, skinType }) => {
              const st = skinType === 'わからない' ? '混合肌' : skinType;
              const concerns = QUICK_CONCERN_MAP[concern] || ['乾燥'];
              onQuickDiagnosis({
                status: 'confirmed',
                skin_type: st,
                concerns,
                message: `${st}で${concern}のお悩みですね。成分ロジックからあなたに最適な商品を選びました。`,
              });
            }} />
          </div>
        </div>
      ) : (
        /* ── Mobile: chat card hero ─────────────── */
        <div style={{
          padding: '32px 20px 28px',
          background: 'linear-gradient(160deg, var(--bg-warm) 0%, var(--bg-soft) 60%, var(--bg) 100%)',
          borderBottom: '1px solid var(--border-strong)',
        }}>
          <SkinrEyebrow>Ingredient Logic AI</SkinrEyebrow>
          <h1 style={{ margin: '10px 0 6px', fontSize: 26, lineHeight: 1.25, fontWeight: 400, letterSpacing: '-0.03em' }}>
            「何が合うかわからない」を終わりにする。
          </h1>
          <p style={{ fontSize: 12, lineHeight: 1.65, color: '#999', margin: '0 0 20px' }}>
            気になる悩みを入力するだけ。あなたの肌に合う成分を絞り込みます。
          </p>
          <ChatDiagnosisCard onComplete={({ concern, skinType }) => {
            const st = skinType === 'わからない' ? '混合肌' : skinType;
            const concerns = QUICK_CONCERN_MAP[concern] || ['乾燥'];
            onQuickDiagnosis({
              status: 'confirmed',
              skin_type: st,
              concerns,
              message: `${st}で${concern}のお悩みですね。成分ロジックからあなたに最適な商品を選びました。`,
            });
          }} />
        </div>
      )}

      {/* Section break */}
      <div style={{ padding: `20px ${px} 0` }}>
        <Divider label="商品を探す" />
      </div>

      {/* Self-search header */}
      <div style={{ padding: `20px ${px} 8px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeFilterIds ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1DAB6A', boxShadow: '0 0 6px rgba(29,171,106,0.5)' }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1814', margin: 0 }}>
                {activeFilterLabel || 'AI診断'} の おすすめ
              </p>
            </div>
          ) : skinFilter ? (
            <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', margin: 0 }}>
              {skinFilter} 向け
            </p>
          ) : (query || cat !== 'all') ? (
            <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', margin: 0 }}>検索結果</p>
          ) : (
            <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', margin: 0 }}>ブランド一覧</p>
          )}
          {(activeFilterIds || skinFilter || query || cat !== 'all') && (
            <button
              onClick={clearFilter}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '3px 9px', borderRadius: 999,
                border: '1px solid var(--border)', background: 'var(--bg)',
                fontSize: 10, color: '#888', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 500,
              }}
            >
              <Icon name="close" size={8} color="#ABABAB" />
              リセット
            </button>
          )}
        </div>
        <span style={{ fontSize: 10, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
          {isBrandMode ? `${PRODUCTS.length} ITEMS` : `${filtered.length} ITEMS`}
        </span>
      </div>

      {/* Search bar */}
      <div style={{ padding: `8px ${px} 12px` }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: searchFocused ? 'var(--bg-warm)' : 'var(--bg-soft)',
          borderRadius: 999,
          border: '1.5px solid ' + (searchFocused ? '#111' : 'transparent'),
          transition: 'all 0.15s ease',
        }}>
          <Icon name="search" size={14} color={searchFocused ? '#111' : '#999'} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="成分・悩み・ブランド名で検索"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: 13, fontFamily: 'inherit', background: 'transparent',
              color: '#111', padding: 0,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <Icon name="close" size={13} color="#B5B5B5" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="skinr-scroll" style={{
        display: 'flex', gap: 6, overflowX: 'auto',
        padding: `4px ${px} 4px`,
      }}>
        {CATEGORIES.map(c => (
          <Chip key={c.id} active={cat === c.id} onClick={() => { setCat(c.id); setActiveFilterIds(null); }} size="sm">
            {c.label}
          </Chip>
        ))}
      </div>

      {/* 肌タイプ絞り込み（AIなしで使えるセカンダリフィルター） */}
      <div className="skinr-scroll" style={{
        display: 'flex', gap: 5, overflowX: 'auto',
        padding: `4px ${px} 8px`,
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.14em', color: '#C5C5C5',
          whiteSpace: 'nowrap', flexShrink: 0,
          paddingRight: 4,
        }}>SKIN</span>
        {SKIN_TYPE_FILTER_CHIPS.map(s => (
          <Chip
            key={s.id}
            active={skinFilter === s.id}
            onClick={() => {
              setSkinFilter(prev => prev === s.id ? null : s.id);
              setActiveFilterIds(null);
            }}
            size="sm"
          >
            {s.label}
          </Chip>
        ))}
        {skinFilter && (
          <button
            onClick={() => setSkinFilter(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              padding: '3px 7px', borderRadius: 999,
              border: '1px solid var(--border)', background: 'var(--bg)',
              fontSize: 10, color: '#888', cursor: 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            <Icon name="close" size={8} color="#ABABAB" />
            解除
          </button>
        )}
      </div>

      {/* ── ① ブランドディレクトリ（フィルターなし） ── */}
      {isBrandMode ? (
        <div style={{ padding: `4px 0 40px` }}>
          {brandGroups.map(({ brand, total, lines, products }, bi) => (
            <BrandDirectoryRow
              key={brand}
              brand={brand}
              total={total}
              lines={lines}
              products={products}
              px={px}
              isDesktop={isDesktop}
              delay={bi * 0.03}
              onClick={() => setActiveBrand(brand)}
              onOpenProduct={onOpenProduct}
            />
          ))}
        </div>

      ) : activeBrand ? (
        /* ── ② ブランド内ライン別グリッド（マガジン風） ── */
        <div style={{ padding: `8px 0 48px`, animation: 'skinrFadeIn 0.2s ease' }}>
          {/* ブランドヘッダー */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: `20px ${px} 16px`,
            borderBottom: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setActiveBrand(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px 6px 0', display: 'flex', alignItems: 'center' }}
            >
              <Icon name="arrowLeft" size={14} color="#888" />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: isDesktop ? 20 : 17, fontWeight: 700, color: '#1A1814', letterSpacing: '-0.03em' }}>{activeBrand}</span>
                <span style={{ fontSize: 10, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
                  {activeBrandLines.products.length} ITEMS
                </span>
              </div>
              {(activeFilterIds || skinFilter || cat !== 'all') && (
                <div style={{ fontSize: 11, color: '#1DAB6A', marginTop: 2 }}>
                  {activeFilterLabel ? `${activeFilterLabel}のおすすめ` : '絞り込み中'}
                </div>
              )}
            </div>
            {/* 公式ショップリンク */}
            {BRAND_STORE_URL[activeBrand] && (
              <button
                onClick={() => window.open(BRAND_STORE_URL[activeBrand], '_blank', 'noopener')}
                style={{
                  marginLeft: 'auto', flexShrink: 0,
                  background: '#BF0000', border: 'none', borderRadius: 8,
                  padding: '7px 14px', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                  color: '#fff', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 5,
                  letterSpacing: '0.02em',
                }}
              >
                公式ショップ
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            )}
          </div>

          {/* ライン別セクション */}
          {activeBrandLines.lines.map(({ line, products }, li) => (
            <div key={line} style={{ marginTop: 28, animation: `skinrFadeIn 0.3s ${li * 0.06}s ease both` }}>
              {/* ラインヘッダー帯 */}
              <div style={{
                margin: `0 0 16px`,
                padding: `10px ${px}`,
                background: 'var(--bg-warm)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ width: 3, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #1DAB6A 0%, #178A55 100%)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: isDesktop ? 13 : 12, fontWeight: 700, color: '#1A1814', letterSpacing: '-0.01em' }}>
                    {line === '—' ? 'その他' : line}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#C5C5C5', letterSpacing: '0.12em' }}>
                  {products.length} ITEMS
                </span>
              </div>

              {/* 商品グリッド */}
              <div style={{
                padding: `0 ${px}`,
                display: 'grid',
                gridTemplateColumns: isDesktop
                  ? 'repeat(auto-fill, minmax(180px, 1fr))'
                  : 'repeat(2, 1fr)',
                gap: isDesktop ? '20px 16px' : '18px 12px',
              }}>
                {products.map(p => (
                  <ProductCard key={p.id} product={p} onClick={() => onOpenProduct(p.id)} />
                ))}
              </div>

              {li < activeBrandLines.lines.length - 1 && (
                <div style={{ margin: `24px ${px} 0`, height: 0 }} />
              )}
            </div>
          ))}
        </div>

      ) : filteredBrandGroups ? (
        /* ── ③ フィルター中: ブランド別プレビュー + もっと見る ── */
        <div style={{ padding: `8px 0 32px` }}>
          {filteredBrandGroups.map(({ brand, products }, bi) => (
            <div key={brand} style={{ borderBottom: '1px solid var(--border)', animation: `skinrFadeIn 0.25s ${bi * 0.04}s ease both` }}>
              {/* ブランド行 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `16px ${px} 10px` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: isDesktop ? 15 : 14, fontWeight: 700, color: '#1A1814', letterSpacing: '-0.02em' }}>{brand}</span>
                  <span style={{ fontSize: 10, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{products.length} ITEMS</span>
                </div>
                <button
                  onClick={() => setActiveBrand(brand)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#1DAB6A', fontWeight: 600, fontFamily: 'inherit', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  もっと見る
                  <Icon name="arrowRight" size={10} color="#1DAB6A" />
                </button>
              </div>
              {/* プレビュー横スクロール */}
              <div className="skinr-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: `0 ${px} 16px`, scrollbarWidth: 'none' }}>
                {products.slice(0, isDesktop ? 5 : 4).map(p => (
                  <div key={p.id} style={{ width: isDesktop ? 170 : 148, flexShrink: 0 }}>
                    <ProductCard product={p} onClick={() => onOpenProduct(p.id)} />
                  </div>
                ))}
                {products.length > (isDesktop ? 5 : 4) && (
                  <button
                    onClick={() => setActiveBrand(brand)}
                    style={{ width: isDesktop ? 80 : 70, flexShrink: 0, background: 'var(--bg-soft)', border: '1px dashed var(--border-strong)', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}
                  >
                    <span style={{ fontSize: 18, color: '#1DAB6A' }}>+{products.length - (isDesktop ? 5 : 4)}</span>
                    <span style={{ fontSize: 10, color: '#B0A898' }}>見る</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredBrandGroups.length === 0 && (
            <div style={{ padding: `64px ${px} 48px`, textAlign: 'center', animation: 'skinrFadeIn 0.4s ease both' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--bg-soft)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: 22,
              }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1814', marginBottom: 8, letterSpacing: '-0.01em' }}>
                該当する商品が見つかりません
              </div>
              <div style={{ fontSize: 12, color: '#ABABAB', lineHeight: 1.7, marginBottom: 24, maxWidth: 260, margin: '0 auto 24px' }}>
                別のキーワードか、AIに相談してみてください
              </div>
              <button onClick={() => { setQuery(''); setCat('all'); setSkinFilter(null); setActiveFilterIds(null); }}
                style={{ padding: '10px 22px', borderRadius: 999, border: '1.5px solid var(--border-strong)', background: 'var(--bg)', fontSize: 12, fontFamily: 'inherit', fontWeight: 600, color: '#555', cursor: 'pointer' }}>
                リセット
              </button>
            </div>
          )}
        </div>
      ) : null}

      {/* 記事セクション */}
      {onOpenArticle && (
        <div style={{ padding: `20px ${px} 0` }}>
          <Divider label="成分ガイド" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: 12, padding: '16px 0 24px',
          }}>
            {[
              { slug: 'dry-skin', label: '乾燥肌ケア', sub: 'セラミド・ヒアルロン酸' },
              { slug: 'pore-care', label: '毛穴ケア', sub: 'BHA・ナイアシンアミド' },
              { slug: 'acne', label: 'ニキビケア', sub: 'CICA・ドクダミ' },
              { slug: 'brightening', label: '美白・くすみ', sub: 'ビタミンC・トラネキサム酸' },
              { slug: 'anti-aging', label: 'シワ・たるみ', sub: 'レチノール・ペプチド' },
              { slug: 'sensitive', label: '敏感肌ケア', sub: 'マデカソシド・パンテノール' },
            ].map(a => (
              <button
                key={a.slug}
                onClick={() => onOpenArticle(a.slug)}
                className="skinr-tappable"
                style={{
                  padding: '14px 12px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 3,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1814' }}>{a.label}</span>
                <span style={{ fontSize: 10, color: '#B5B5B5' }}>{a.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: `40px ${px} ${isDesktop ? '60px' : '60px'}`,
        textAlign: 'center',
      }}>
        <SkinrLogo size={12} />
      </div>
    </div>
  );
}

// 悩みチップ（ホーム用・グリッドカード型）
function ConcernChip({ chip, onSend, index = 0 }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={() => onSend(chip.message)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        padding: '14px 6px 16px',
        borderRadius: 12,
        border: '1px solid ' + (pressed ? 'var(--border-strong)' : 'var(--border)'),
        background: pressed ? 'var(--bg-warm)' : 'var(--bg-soft)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'all 0.12s ease',
        minHeight: 72,
        boxShadow: pressed ? 'none' : '0 2px 10px rgba(100,80,60,0.07)',
        animation: `skinrFadeIn 0.3s ${index * 0.04}s ease both`,
      }}
    >
      <span style={{
        fontSize: 8,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#1DAB6A',
        letterSpacing: '0.08em',
        opacity: 0.65,
        lineHeight: 1,
        marginBottom: 7,
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span style={{
        fontSize: 11, fontWeight: 600, color: '#1A1A1A',
        letterSpacing: '0.02em', lineHeight: 1.3,
        textAlign: 'center',
      }}>
        {chip.label}
      </span>
    </button>
  );
}
