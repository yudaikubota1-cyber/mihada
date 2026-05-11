import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS, CATEGORIES, CONCERN_CHIPS, SKIN_TYPE_FILTER_CHIPS } from '../data/products.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Chip, Divider, ProductCard,
} from '../components/shared.jsx';

// ── AI 肌診断チャットカード ─────────────────────────────────────
const G = '#1DAB6A';   // メイングリーン（明るめ）
const GD = '#178A55';  // ダークグリーン（ホバー用）

// キーワード分類マップ
const CONCERN_KEYWORDS = {
  '乾燥・保湿':   ['乾燥', 'かさつき', 'かさかさ', 'カサカサ', 'パサパサ', 'しっとり', '保湿', 'つっぱり', 'バリア', 'うるお', '乾いて'],
  '毛穴・黒ずみ': ['毛穴', '黒ずみ', '黒ずん', 'つまり', 'ざらつき', '角栓', 'ポア', 'テカリ', 'テカ'],
  'ニキビ・赤み': ['ニキビ', 'にきび', 'ぶつぶつ', '赤み', '赤く', '吹き出物', '炎症', '肌荒れ', 'アクネ', 'できもの', '荒れ'],
  'くすみ・シミ': ['くすみ', 'くすん', 'シミ', 'しみ', 'トーン', '明るく', '透明感', '色素', '暗い', 'くっきり'],
  'たるみ・ハリ': ['たるみ', 'たるん', 'ハリ', 'はり', '弾力', 'リフト', 'しわ', 'シワ', '引き締め', 'たぷ'],
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
        setMessages(m => [...m, { role: 'ai', text: 'ありがとうございます。\nお悩みをもう少し詳しく教えてください。どれに近いですか？' }]);
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

  // 肌タイプを選択
  const pickSkinType = (label) => {
    setSkinType(label);
    setMessages(m => [...m, { role: 'user', text: label }]);
    setPhase('init');
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: '分析が完了しました！\nお悩みと肌タイプに合った成分をまとめました。' }]);
      setTyping(false);
      setPhase('done');
      setTimeout(() => setShowResult(true), 350);
    }, 1200);
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

export default function SkinrHome({ isDesktop, onStartChat, onOpenProduct, onSendInline, lastDiagnosis, onViewLastResult, homeFilter }) {
  const [cat, setCat] = useState(homeFilter?.cat || 'all');
  const [skinFilter, setSkinFilter] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollRowRefs = useRef({});
  // 診断フィルター（結果画面の「すべて見る」から来た場合）
  const [activeFilterIds, setActiveFilterIds] = useState(homeFilter?.productIds || null);
  const activeFilterLabel = homeFilter?.label || null;

  const scrollRow = (brand, dir) => {
    const el = scrollRowRefs.current[brand];
    if (el) el.scrollBy({ left: dir * (isDesktop ? 640 : 320), behavior: 'smooth' });
  };

  const clearFilter = () => {
    setActiveFilterIds(null);
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

  // フィルターが何も掛かっていない = ブランド別表示モード
  const isBrandMode = cat === 'all' && !skinFilter && !query && !activeFilterIds;

  // ブランド別グループ（順序を保持）
  const brandGroups = isBrandMode ? (() => {
    const map = new Map();
    PRODUCTS.forEach(p => {
      if (!map.has(p.brand)) map.set(p.brand, []);
      map.get(p.brand).push(p);
    });
    return [...map.entries()].map(([brand, products]) => ({ brand, products }));
  })() : null;

  return (
    <div className={`skinr-scroll${isDesktop ? ' skinr-page' : ''}`} style={{
      height: isDesktop ? 'auto' : '100%',
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

      {/* 前回の診断バナー */}
      {lastDiagnosis && (
        <button
          onClick={onViewLastResult}
          className="skinr-tappable"
          style={{
            width: '100%', background: 'none', border: 'none',
            borderBottom: '1px solid var(--border)',
            padding: '12px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left',
            animation: 'skinrFadeIn 0.4s ease both',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 4,
            background: 'var(--bg-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon name="sparkle" size={15} color="#555" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10, color: '#B5B5B5',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.14em', marginBottom: 2,
            }}>前回の絞り込み結果</div>
            <div style={{
              fontSize: 12, fontWeight: 500, color: '#333',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {lastDiagnosis.skin_type}
              {lastDiagnosis.concerns?.length > 0 && (
                <span style={{ color: '#999', fontWeight: 400 }}>
                  {' · '}{lastDiagnosis.concerns.slice(0, 2).join(' · ')}
                </span>
              )}
            </div>
          </div>
          <Icon name="arrowRight" size={14} color="#C0C0C0" />
        </button>
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
          alignItems: 'center', gap: 80,
        }}>
          {/* 左: コピー */}
          <div style={{ flex: '0 0 auto', maxWidth: 400 }}>
            <SkinrEyebrow>Ingredient Logic AI</SkinrEyebrow>
            <h1 style={{
              margin: '20px 0 18px',
              fontSize: 52, lineHeight: 1.1,
              fontWeight: 400, letterSpacing: '-0.04em',
            }}>
              「何が合うか<br />わからない」を<br />終わりにする。
            </h1>
            <p style={{
              fontSize: 14, lineHeight: 1.85, color: '#999',
              margin: '0 0 32px', maxWidth: 300,
            }}>
              気になる悩みを伝えるだけ。<br />
              成分ロジックがあなたに合う<br />
              ケアを一本に絞り込みます。
            </p>
            {/* スタッツ */}
            <div style={{ display: 'flex', gap: 28 }}>
              {[
                { num: '72', label: '取扱商品' },
                { num: 'AI', label: '成分診断' },
                { num: '無料', label: '完全無料' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1814' }}>{s.num}</div>
                  <div style={{ fontSize: 10, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {/* スクロールヒント */}
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 1, height: 28, background: 'var(--border-strong)' }} />
              <span style={{ fontSize: 10, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em' }}>SCROLL TO BROWSE</span>
            </div>
          </div>

          {/* 右: チャットカード */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ChatDiagnosisCard onComplete={({ concern, skinType }) => {
              const skin = skinType === 'わからない' ? '' : `肌タイプは${skinType}で、`;
              const msg  = `${skin}${concern}に悩んでいます。`;
              onSendInline(msg);
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
            「何が合うか<br />わからない」を<br />終わりにする。
          </h1>
          <p style={{ fontSize: 12, lineHeight: 1.65, color: '#999', margin: '0 0 20px' }}>
            気になる悩みを入力するだけ。あなたの肌に合う成分を絞り込みます。
          </p>
          <ChatDiagnosisCard onComplete={({ concern, skinType }) => {
            const skin = skinType === 'わからない' ? '' : `肌タイプは${skinType}で、`;
            const msg  = `${skin}${concern}に悩んでいます。`;
            onSendInline(msg);
          }} />
        </div>
      )}

      {/* Section break */}
      <div style={{ padding: `20px ${px} 0` }}>
        <Divider label="商品を探す" />
      </div>

      {/* Self-search */}
      <div style={{ padding: `20px ${px} 8px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>
            {activeFilterIds
              ? `${activeFilterLabel || ''} · 診断結果`
              : skinFilter
              ? `${skinFilter} · 絞り込み`
              : (query || cat !== 'all' ? '検索結果' : '全商品')}
          </p>
          {activeFilterIds && (
            <button
              onClick={clearFilter}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '3px 8px', borderRadius: 999,
                border: '1px solid var(--border)', background: 'var(--bg)',
                fontSize: 10, color: '#888', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 500,
              }}
            >
              <Icon name="close" size={9} color="#ABABAB" />
              解除
            </button>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
          {filtered.length} / {PRODUCTS.length} ITEMS
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

      {/* ── ブランド別横スクロール（Netflixスタイル） ── */}
      {isBrandMode ? (
        <div style={{ padding: `8px 0 32px` }}>
          {brandGroups.map(({ brand, products }) => (
            <div key={brand} style={{ marginBottom: 4 }}>
              {/* ブランドヘッダー */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `20px ${px} 12px`,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{
                    fontSize: isDesktop ? 16 : 14,
                    fontWeight: 600, color: '#1A1814', letterSpacing: '-0.02em',
                  }}>{brand}</span>
                  <span style={{
                    fontSize: 10, color: '#C5C5C5',
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
                  }}>{products.length} ITEMS</span>
                </div>
                <span style={{ fontSize: 11, color: '#1DAB6A', fontWeight: 500, cursor: 'default' }}>
                  全件 →
                </span>
              </div>

              {/* 横スクロール行 + 左右ボタン */}
              <div style={{ position: 'relative' }}>
                {/* 左ボタン */}
                <button
                  onClick={() => scrollRow(brand, -1)}
                  style={{
                    position: 'absolute', left: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1.5px solid var(--border-strong)',
                    background: 'rgba(255,254,251,0.95)',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 12px rgba(80,60,40,0.14)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1DAB6A'; e.currentTarget.style.borderColor = '#1DAB6A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,254,251,0.95)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                >
                  <Icon name="arrowRight" size={13} color="#555"
                    style={{ transform: 'rotate(180deg)', display: 'block' }}
                  />
                </button>

                {/* スクロール行 */}
                <div
                  ref={el => { scrollRowRefs.current[brand] = el; }}
                  className="skinr-scroll"
                  style={{
                    display: 'flex', gap: isDesktop ? 16 : 12,
                    overflowX: 'auto', overflowY: 'visible',
                    padding: `4px ${px} 16px`,
                    scrollbarWidth: 'none',
                  }}
                >
                  {products.map(p => (
                    <div key={p.id} style={{ width: isDesktop ? 200 : 160, flexShrink: 0 }}>
                      <ProductCard product={p} onClick={() => onOpenProduct(p.id)} />
                    </div>
                  ))}
                </div>

                {/* 右ボタン */}
                <button
                  onClick={() => scrollRow(brand, 1)}
                  style={{
                    position: 'absolute', right: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1.5px solid var(--border-strong)',
                    background: 'rgba(255,254,251,0.95)',
                    backdropFilter: 'blur(6px)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 12px rgba(80,60,40,0.14)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1DAB6A'; e.currentTarget.style.borderColor = '#1DAB6A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,254,251,0.95)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                >
                  <Icon name="arrowRight" size={13} color="#555" />
                </button>
              </div>

              {/* セパレーター */}
              <div style={{ margin: `4px ${px} 0`, height: 1, background: 'var(--border)' }} />
            </div>
          ))}
        </div>
      ) : (
        /* ── フィルター中: フラットグリッド ── */
        <>
          <div style={{
            padding: `16px ${px} 24px`,
            display: 'grid',
            gridTemplateColumns: isDesktop
              ? 'repeat(auto-fill, minmax(190px, 1fr))'
              : 'repeat(2, 1fr)',
            gap: isDesktop ? '28px 20px' : '24px 14px',
          }}>
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => onOpenProduct(p.id)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: `48px ${px}`, textAlign: 'center', animation: 'skinrFadeIn 0.3s ease both' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 6 }}>
                該当する商品が見つかりません
              </div>
              <div style={{ fontSize: 12, color: '#ABABAB', lineHeight: 1.6, marginBottom: 20 }}>
                別のキーワードか、AIに相談してみてください
              </div>
              <button
                onClick={() => { setQuery(''); setCat('all'); }}
                style={{
                  padding: '9px 18px', borderRadius: 999,
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  fontSize: 12, fontFamily: 'inherit', fontWeight: 500, color: '#555',
                  cursor: 'pointer',
                }}
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </>
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
