import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/shared.jsx';

const CONCERNS = ['乾燥', '毛穴の開き', '黒ずみ', '赤ニキビ', '白ニキビ', 'ニキビ跡', 'くすみ', 'たるみ'];

/* ══════════════════════════════════════════════════════════════
   案 I — "文中に書く"  Fill-in-the-blank
   参考: Typology (仏) の診断フォーム + Duolingo の文章完成
   ポイント: 文章の中に入力欄が溶け込む。読む行為 = 入力の行為
══════════════════════════════════════════════════════════════ */
function InputI({ onSend }) {
  const [main, setMain] = useState('');
  const [sub, setSub] = useState('');
  const [when, setWhen] = useState('');
  const mainRef = useRef(null);

  const autoSize = (ref) => {
    if (!ref.current) return;
    ref.current.style.width = '4px';
    ref.current.style.width = Math.max(ref.current.scrollWidth, 80) + 'px';
  };

  const inlineInput = (value, onChange, placeholder, ref, width = 120) => (
    <input
      ref={ref}
      value={value}
      onChange={e => { onChange(e.target.value); autoSize(ref); }}
      placeholder={placeholder}
      style={{
        display: 'inline-block',
        width: width,
        minWidth: 80,
        border: 'none',
        borderBottom: `2px solid ${value ? '#1A6644' : '#C8B8A8'}`,
        outline: 'none',
        background: 'transparent',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        fontWeight: 'inherit',
        color: value ? '#1A1814' : '#AAA098',
        textAlign: 'center',
        padding: '0 4px',
        letterSpacing: 'inherit',
        lineHeight: 'inherit',
        transition: 'border-color 0.2s',
      }}
    />
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* AI label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: '#1A6644', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="sparkle" size={8} color="#fff" />
        </div>
        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.24em', color: '#1A6644' }}>成分ロジック AI — 肌の悩みを教えてください</span>
      </div>

      {/* 文章 */}
      <div style={{ fontSize: 22, fontWeight: 300, lineHeight: 2.2, color: '#1A1814', letterSpacing: '-0.01em' }}>
        私のお肌の一番の悩みは「{inlineInput(main, setMain, '乾燥・毛穴など', mainRef, 160)}」です。
        {main && (
          <span style={{ animation: 'skinrFadeIn 0.3s ease' }}>
            {' '}特に{inlineInput(sub, setSub, 'いつ頃', null, 120)}に気になります。
          </span>
        )}
        {sub && (
          <span style={{ animation: 'skinrFadeIn 0.3s ease' }}>
            {' '}肌質は{inlineInput(when, setWhen, '乾燥肌など', null, 120)}寄りです。
          </span>
        )}
      </div>

      {/* 送信 */}
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => main && onSend && onSend(`${main}が悩みです。${sub ? sub + 'に気になります。' : ''}${when ? '肌質は' + when + '寄りです。' : ''}`)}
          disabled={!main}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 999,
            border: 'none',
            background: main ? '#1A6644' : '#E4D9CE',
            color: main ? '#fff' : '#AAA098',
            fontSize: 13, fontWeight: 500, cursor: main ? 'pointer' : 'default',
            fontFamily: 'inherit', letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
            boxShadow: main ? '0 4px 16px rgba(26,102,68,0.3)' : 'none',
          }}
        >
          <Icon name="sparkle" size={11} color={main ? '#fff' : '#C8B8A8'} />
          {main ? '診断する' : '上の文章を入力してください'}
        </button>
        {main && (
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#C8B8A8', letterSpacing: '0.1em', animation: 'skinrFadeIn 0.3s ease' }}>
            ENTER でも送信できます
          </span>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 J — "コマンドパレット"  Linear / macOS Spotlight 風
   参考: Linear の ⌘K パレット + macOS Spotlight
   ポイント: キーボード優先、即時フィルタリング、暗いポップアップ
══════════════════════════════════════════════════════════════ */
function InputJ({ onSend }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = CONCERNS.filter(c => !query || c.includes(query));
  const suggestions = [
    { key: '乾燥', desc: '保湿成分が強い商品を表示' },
    { key: '毛穴の開き', desc: '引き締め・収れん成分で絞り込む' },
    { key: 'ニキビ', desc: '抗炎症・抗菌成分でフィルター' },
    { key: 'くすみ', desc: 'ビタミンC・美白成分を優先表示' },
    { key: 'たるみ', desc: 'レチノール・コラーゲン系を探す' },
  ].filter(s => !query || s.key.includes(query) || s.desc.includes(query));

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>
      {/* トリガーヒント */}
      {!focused && (
        <div
          onClick={() => setFocused(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px',
            background: '#1A1814',
            borderRadius: 12,
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          }}
        >
          <Icon name="search" size={16} color="#666" />
          <span style={{ fontSize: 14, color: '#555', fontFamily: 'inherit', flex: 1 }}>
            肌の悩みを検索、または...
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['⌘', 'K'].map(k => (
              <span key={k} style={{
                padding: '3px 7px', borderRadius: 4,
                border: '1px solid #333', background: '#222',
                fontSize: 11, color: '#666',
                fontFamily: 'JetBrains Mono, monospace',
              }}>{k}</span>
            ))}
          </div>
        </div>
      )}

      {focused && (
        <div style={{
          background: '#1C1A18',
          borderRadius: 14,
          border: '1px solid #2E2A26',
          boxShadow: '0 24px 60px rgba(0,0,0,0.36), 0 0 0 1px rgba(255,255,255,0.05)',
          overflow: 'hidden',
          animation: 'skinrSlideUp 0.18s ease',
        }}>
          {/* 検索欄 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid #2A2622' }}>
            <Icon name="search" size={16} color="#555" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setFocused(false); if (e.key === 'Enter' && query) onSend && onSend(query); }}
              placeholder="悩みを入力…"
              style={{
                flex: 1, border: 'none', outline: 'none',
                fontSize: 15, fontFamily: 'inherit',
                background: 'transparent', color: '#F0EAE4',
                padding: 0,
              }}
            />
            <span
              onClick={() => setFocused(false)}
              style={{ fontSize: 10, padding: '3px 7px', borderRadius: 4, border: '1px solid #333', background: '#222', color: '#666', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}
            >ESC</span>
          </div>

          {/* 候補リスト */}
          <div style={{ padding: '8px 0' }}>
            {!query && (
              <div style={{ padding: '6px 18px 4px', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em', color: '#444' }}>
                よくある悩み
              </div>
            )}
            {suggestions.slice(0, 5).map((s, i) => (
              <div
                key={s.key}
                onClick={() => { onSend && onSend(s.key); setFocused(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 18px', cursor: 'pointer',
                  background: i === 0 ? 'rgba(26,102,68,0.15)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,102,68,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = i === 0 ? 'rgba(26,102,68,0.15)' : 'transparent'}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: i === 0 ? 'rgba(26,102,68,0.3)' : '#252220', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="leaf" size={13} color={i === 0 ? '#2EA86A' : '#555'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: '#E8E0D8', fontWeight: i === 0 ? 500 : 400 }}>{s.key}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{s.desc}</div>
                </div>
                {i === 0 && (
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, border: '1px solid #2A4A3A', background: 'rgba(26,102,68,0.2)', color: '#2EA86A', fontFamily: 'JetBrains Mono, monospace' }}>
                    ENTER
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* フッター */}
          <div style={{ borderTop: '1px solid #2A2622', padding: '8px 18px', display: 'flex', gap: 16 }}>
            {[['↑↓', '選択'], ['↵', '確定'], ['ESC', '閉じる']].map(([key, label]) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#444' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', background: '#252220', padding: '2px 5px', borderRadius: 3, border: '1px solid #333' }}>{key}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 K — "タイル選択"  Curology / Glossier skin quiz 風
   参考: Curology の step-by-step quiz + iherb のフィルター
   ポイント: テキスト入力なし。タップするだけ。最もハードルが低い
══════════════════════════════════════════════════════════════ */
const CONCERN_META = [
  { label: '乾燥', icon: '🌵', desc: 'カサつき・つっぱり感' },
  { label: '毛穴の開き', icon: '🔬', desc: '毛穴が目立つ・ザラつく' },
  { label: '黒ずみ', icon: '◼', desc: '鼻・あごの黒ずみ' },
  { label: '赤ニキビ', icon: '🔴', desc: '炎症を起こしたニキビ' },
  { label: '白ニキビ', icon: '⚪', desc: '皮脂詰まり' },
  { label: 'ニキビ跡', icon: '🌑', desc: '色素沈着・赤み跡' },
  { label: 'くすみ', icon: '🌫', desc: '顔色が暗い・透明感なし' },
  { label: 'たるみ', icon: '📉', desc: 'フェイスラインのゆるみ' },
];

function InputK({ onSend }) {
  const [selected, setSelected] = useState([]);
  const toggle = (label) => setSelected(s => s.includes(label) ? s.filter(x => x !== label) : [...s, label]);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* ヘッダー */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#1A6644', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={8} color="#fff" />
          </div>
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.24em', color: '#1A6644' }}>成分ロジック AI</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 400, color: '#1A1814', letterSpacing: '-0.01em' }}>
          気になるお悩みをすべて選んでください
        </div>
        <div style={{ fontSize: 12, color: '#AAA098', marginTop: 6 }}>複数選択できます</div>
      </div>

      {/* タイルグリッド */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {CONCERN_META.map(({ label, icon, desc }) => {
          const active = selected.includes(label);
          return (
            <button
              key={label}
              onClick={() => toggle(label)}
              style={{
                padding: '18px 12px 16px',
                borderRadius: 14,
                border: `2px solid ${active ? '#1A6644' : 'var(--border)'}`,
                background: active ? 'rgba(26,102,68,0.06)' : '#fff',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'all 0.18s ease',
                boxShadow: active
                  ? '0 4px 16px rgba(26,102,68,0.14)'
                  : '0 2px 8px rgba(80,60,40,0.06)',
                transform: active ? 'translateY(-2px)' : 'none',
                position: 'relative',
              }}
            >
              {/* チェックマーク */}
              {active && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#1A6644',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'skinrFadeIn 0.15s ease',
                }}>
                  <Icon name="check" size={10} color="#fff" strokeWidth={2.5} />
                </div>
              )}
              <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: active ? '#1A6644' : '#1A1814', letterSpacing: '0.01em' }}>{label}</span>
              <span style={{ fontSize: 10, color: active ? '#2A5A3A' : '#AAA098', textAlign: 'center', lineHeight: 1.4 }}>{desc}</span>
            </button>
          );
        })}
      </div>

      {/* 選択状況 + 送信 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: selected.length ? '#1A6644' : '#C8B8A8', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', transition: 'color 0.2s' }}>
          {selected.length > 0 ? `${selected.length} 件選択中 — ${selected.join(' · ')}` : '悩みをタップして選択'}
        </div>
        <button
          disabled={!selected.length}
          onClick={() => onSend && onSend(selected.join('、') + 'が悩みです')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 999, border: 'none',
            background: selected.length ? '#1A6644' : '#E4D9CE',
            color: selected.length ? '#fff' : '#C8B8A8',
            fontSize: 13, fontWeight: 500, cursor: selected.length ? 'pointer' : 'default',
            fontFamily: 'inherit', letterSpacing: '0.02em',
            transition: 'all 0.2s',
            boxShadow: selected.length ? '0 4px 20px rgba(26,102,68,0.30)' : 'none',
          }}
        >
          <Icon name="sparkle" size={11} color={selected.length ? '#fff' : '#C8B8A8'} />
          {selected.length ? `${selected.length}件で診断する` : '選択してください'}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 L — "日本の高級化粧品"  資生堂 / SUQQU 風
   参考: 資生堂・SUQQU・コスメデコルテ のカウンター接客体験
   ポイント: 縦書きラベル、薄金の枠線、文字カウンター、贅沢な余白
══════════════════════════════════════════════════════════════ */
function InputL({ onSend }) {
  const [val, setVal] = useState('');
  const [focused, setFocused] = useState(false);
  const MAX = 120;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 40, alignItems: 'stretch' }}>

      {/* 縦書きラベル */}
      <div style={{
        writingMode: 'vertical-rl', textOrientation: 'mixed',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        flexShrink: 0,
      }}>
        <div style={{ width: 1, flex: 1, background: 'linear-gradient(180deg, transparent, #C8A87A 30%, #C8A87A 70%, transparent)' }} />
        <span style={{
          fontSize: 10, fontFamily: 'serif', letterSpacing: '0.4em',
          color: '#A08060', fontWeight: 400,
        }}>
          肌のご相談
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 7,
          letterSpacing: '0.2em', color: '#C8B8A8',
          writingMode: 'horizontal-tb',
        }}>SKIN AI</span>
        <div style={{ width: 1, flex: 1, background: 'linear-gradient(180deg, #C8A87A 30%, #C8A87A 70%, transparent)' }} />
      </div>

      {/* メイン入力エリア */}
      <div style={{ flex: 1 }}>
        {/* 金色の枠 */}
        <div style={{
          border: `1px solid ${focused ? '#B8905A' : '#D8C4A8'}`,
          borderRadius: 2,
          padding: '24px 24px 20px',
          background: focused ? 'rgba(200,168,122,0.03)' : 'transparent',
          transition: 'all 0.3s ease',
          boxShadow: focused ? '0 0 0 3px rgba(200,168,122,0.08), 0 8px 32px rgba(160,120,80,0.08)' : '0 2px 12px rgba(160,120,80,0.06)',
          position: 'relative',
        }}>
          {/* フローティングラベル */}
          <div style={{
            fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.22em', color: focused || val ? '#C8A87A' : '#C8B8A8',
            marginBottom: 14, transition: 'color 0.25s',
          }}>
            今日のお肌の悩みをお聞かせください
          </div>

          <textarea
            value={val}
            onChange={e => setVal(e.target.value.slice(0, MAX))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={'乾燥がひどく、毛穴も気になっております…'}
            rows={4}
            style={{
              width: '100%', border: 'none', outline: 'none', resize: 'none',
              fontSize: 15, fontFamily: 'serif', color: '#1A1814',
              background: 'transparent', padding: 0, lineHeight: 1.9,
              minHeight: 90, letterSpacing: '0.04em',
            }}
          />

          {/* 文字カウンター */}
          <div style={{
            position: 'absolute', bottom: 12, right: 16,
            fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
            color: val.length > MAX * 0.8 ? '#B87A4A' : '#C8B8A8',
            letterSpacing: '0.08em',
            transition: 'color 0.2s',
          }}>
            {val.length} / {MAX}
          </div>
        </div>

        {/* 下部 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          {/* チップ */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['乾燥', '毛穴', 'くすみ', 'たるみ'].map(t => (
              <button
                key={t}
                onClick={() => setVal(v => v ? v + '、' + t : t)}
                style={{
                  padding: '4px 12px', borderRadius: 2,
                  border: '1px solid #D8C4A8',
                  background: 'transparent',
                  fontSize: 11, color: '#A08060', cursor: 'pointer',
                  fontFamily: 'serif', letterSpacing: '0.08em',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,168,122,0.08)'; e.currentTarget.style.borderColor = '#B8905A'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#D8C4A8'; }}
              >{t}</button>
            ))}
          </div>

          {/* 送信ボタン — 金縁 */}
          <button
            disabled={!val.trim()}
            onClick={() => val.trim() && onSend && onSend(val)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 26px', borderRadius: 2,
              border: `1px solid ${val.trim() ? '#B8905A' : '#D8C4A8'}`,
              background: val.trim() ? '#1A1814' : 'transparent',
              color: val.trim() ? '#E8D8C0' : '#C8B8A8',
              fontSize: 12, fontFamily: 'serif', letterSpacing: '0.12em',
              cursor: val.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (val.trim()) e.currentTarget.style.background = '#2A2420'; }}
            onMouseLeave={e => { if (val.trim()) e.currentTarget.style.background = '#1A1814'; }}
          >
            診 断 す る
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 M — "臨床成分表示"  The Ordinary / Paula's Choice 風
   参考: The Ordinary (カナダ) の製品ページ + Paula's Choice のルーティン診断
   ポイント: 製品成分表示の書体・余白をUI化。チェックボックスで悩みを選ぶ
   "あなたの肌を処方する" 感
══════════════════════════════════════════════════════════════ */
const CLINICAL_CONCERNS = [
  { code: 'XEROSIS', jp: '乾燥', desc: 'Dehydration / Moisture barrier disruption' },
  { code: 'COMEDONES', jp: '毛穴・黒ずみ', desc: 'Follicular occlusion / Sebum oxidation' },
  { code: 'ACNE VULGARIS', jp: 'ニキビ', desc: 'C. acnes proliferation / Inflammatory response' },
  { code: 'HYPERPIGMENTATION', jp: 'くすみ・シミ', desc: 'Melanin overproduction / UV-induced damage' },
  { code: 'CUTIS LAXA', jp: 'たるみ', desc: 'Collagen degradation / Elastin loss' },
  { code: 'ERYTHEMA', jp: '赤み・敏感', desc: 'Vascular dilation / TEWL increase' },
];

function InputM({ onSend }) {
  const [checked, setChecked] = useState([]);
  const toggle = (code) => setChecked(s => s.includes(code) ? s.filter(c => c !== code) : [...s, code]);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'JetBrains Mono, monospace' }}>
      {/* ヘッダー */}
      <div style={{ borderBottom: '2px solid #111', paddingBottom: 16, marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: '0.32em', color: '#999', marginBottom: 6 }}>SKINR · CLINICAL FORMULATION SYSTEM</div>
            <div style={{ fontSize: 20, letterSpacing: '0.08em', color: '#111', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              SKIN CONCERN ASSESSMENT
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 7, color: '#bbb', letterSpacing: '0.18em' }}>PROTOCOL v2.4</div>
            <div style={{ fontSize: 7, color: '#bbb', letterSpacing: '0.18em', marginTop: 3 }}>SELECT ALL APPLICABLE</div>
          </div>
        </div>
      </div>

      {/* チェックリスト */}
      <div style={{ border: '1px solid #ccc', borderTop: 'none' }}>
        {CLINICAL_CONCERNS.map((c, i) => {
          const active = checked.includes(c.code);
          return (
            <div
              key={c.code}
              onClick={() => toggle(c.code)}
              style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 1fr auto',
                alignItems: 'center', gap: 16,
                padding: '14px 20px',
                borderBottom: i < CLINICAL_CONCERNS.length - 1 ? '1px solid #E8E0D8' : 'none',
                background: active ? '#F8FDF9' : '#fff',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
            >
              {/* チェックボックス */}
              <div style={{
                width: 16, height: 16, border: `1.5px solid ${active ? '#1A6644' : '#aaa'}`,
                borderRadius: 2, background: active ? '#1A6644' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.12s',
              }}>
                {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontFamily: 'sans-serif' }}>✓</span>}
              </div>

              {/* コード */}
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', color: active ? '#1A6644' : '#111', fontWeight: active ? 700 : 400, transition: 'color 0.12s' }}>
                  {c.code}
                </div>
                <div style={{ fontSize: 8, color: '#ccc', letterSpacing: '0.1em', marginTop: 2 }}>
                  {c.desc}
                </div>
              </div>

              {/* 日本語 */}
              <div style={{ fontSize: 13, color: active ? '#1A1814' : '#888', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em', transition: 'color 0.12s' }}>
                {c.jp}
              </div>

              {/* インデックス */}
              <div style={{ fontSize: 8, color: '#ddd', letterSpacing: '0.12em' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>

      {/* 送信 */}
      <div style={{ marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #ccc', padding: '16px 20px', background: '#fff' }}>
        <div style={{ fontSize: 8, color: '#bbb', letterSpacing: '0.16em' }}>
          {checked.length > 0
            ? `${checked.length} CONCERNS SELECTED — AI WILL CROSS-REFERENCE ${checked.length * 12}+ ACTIVES`
            : 'SELECT SKIN CONCERNS ABOVE TO PROCEED'}
        </div>
        <button
          disabled={!checked.length}
          onClick={() => checked.length && onSend && onSend(checked.map(c => CLINICAL_CONCERNS.find(x => x.code === c)?.jp).join('、') + 'が悩みです')}
          style={{
            padding: '10px 24px',
            background: checked.length ? '#111' : '#F0EBE3',
            color: checked.length ? '#fff' : '#bbb',
            border: 'none',
            fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.22em', cursor: checked.length ? 'pointer' : 'default',
            transition: 'all 0.15s',
          }}
        >
          GENERATE FORMULA →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 N — "iOS / Apple Health 風"  ステップ式ピッカー
   参考: Apple Health app + iOS UIKit / Human Interface Guidelines
   ポイント: セグメントコントロール・カードステップ・丸ピル。親切でわかりやすい
══════════════════════════════════════════════════════════════ */
const STEPS_N = [
  {
    q: 'お肌のタイプを教えてください',
    choices: [
      { label: '乾燥肌', icon: '💧', sub: '全体的にかさつく' },
      { label: '脂性肌', icon: '✨', sub: 'テカリやすい' },
      { label: '混合肌', icon: '⚖️', sub: 'Tゾーンのみテカる' },
      { label: '普通肌', icon: '🌿', sub: 'バランスが取れている' },
    ],
  },
  {
    q: '一番気になるお悩みは何ですか？',
    choices: [
      { label: '乾燥・ハリ不足', icon: '🏔', sub: 'モイスチャー系が合いやすい' },
      { label: '毛穴・黒ずみ', icon: '🔬', sub: 'BHA・引き締め系' },
      { label: 'ニキビ・赤み', icon: '🌡', sub: '抗炎症・低刺激系' },
      { label: 'くすみ・シミ', icon: '☀️', sub: 'ビタミンC・美白系' },
    ],
  },
  {
    q: '肌の敏感さはいかがですか？',
    choices: [
      { label: '敏感肌', icon: '🌸', sub: 'すぐに赤くなる' },
      { label: 'やや敏感', icon: '🌼', sub: '刺激物に気をつける' },
      { label: '普通', icon: '🌱', sub: 'ほとんど反応しない' },
    ],
  },
];

function InputN({ onSend }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);

  const current = STEPS_N[step];
  const total = STEPS_N.length;
  const progress = step / total;

  const pick = (label) => {
    const next = [...answers, label];
    if (step < total - 1) {
      setAnswers(next);
      setStep(s => s + 1);
    } else {
      onSend && onSend(next.join('・') + 'です');
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      {/* プログレスバー */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.04em', fontFamily: 'JetBrains Mono, monospace' }}>
            STEP {step + 1} / {total}
          </span>
          {step > 0 && (
            <button
              onClick={() => { setStep(s => s - 1); setAnswers(a => a.slice(0, -1)); }}
              style={{ background: 'none', border: 'none', fontSize: 11, color: '#aaa', cursor: 'pointer', padding: '2px 8px', fontFamily: 'inherit' }}
            >
              ← 戻る
            </button>
          )}
        </div>
        {/* トラック */}
        <div style={{ height: 4, borderRadius: 4, background: '#E4D9CE', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            background: 'linear-gradient(90deg, #1A6644, #2EA86A)',
            width: `${((step) / total) * 100}%`,
            transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        {/* ドット */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {STEPS_N.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i <= step ? '#1A6644' : '#E4D9CE',
              transition: 'background 0.25s',
            }} />
          ))}
        </div>
      </div>

      {/* 質問カード */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 24px rgba(80,60,40,0.10)',
        padding: '32px 28px 28px',
        animation: 'skinrFadeIn 0.22s ease',
      }}>
        {/* AI badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: '#1A6644', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={11} color="#fff" />
          </div>
          <span style={{ fontSize: 10, color: '#1A6644', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.16em' }}>SKINR AI</span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 500, color: '#1A1814', letterSpacing: '-0.015em', lineHeight: 1.5, marginBottom: 24 }}>
          {current.q}
        </div>

        {/* 選択肢 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {current.choices.map(({ label, icon, sub }) => (
            <button
              key={label}
              onClick={() => pick(label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 18px',
                border: '1.5px solid #E8E0D8',
                borderRadius: 14,
                background: '#FFFEFB',
                cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', transition: 'all 0.14s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A6644'; e.currentTarget.style.background = 'rgba(26,102,68,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E0D8'; e.currentTarget.style.background = '#FFFEFB'; }}
            >
              <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1814', letterSpacing: '-0.01em' }}>{label}</div>
                <div style={{ fontSize: 11, color: '#AAA098', marginTop: 2 }}>{sub}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #D8CEC4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'transparent' }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 選択済み表示 */}
      {answers.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {answers.map((a, i) => (
            <span key={i} style={{
              padding: '4px 14px', borderRadius: 999,
              background: 'rgba(26,102,68,0.1)', color: '#1A6644',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.01em',
            }}>{a}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 O — "Aesop / Diptyque 風"  文学的・余白の贅沢
   参考: Aesop.com (豪) のブランド体験 + Diptyque の詩的なWebデザイン
   ポイント: 大きなセリフ体の問い、答えは自由記述のみ。思索させる余白
══════════════════════════════════════════════════════════════ */
function InputO({ onSend }) {
  const [val, setVal] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* 装飾ライン */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, #B8A898)' }} />
        <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.36em', color: '#C8B8A8' }}>SKIN · CONSULTATION</span>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #B8A898, transparent)' }} />
      </div>

      {/* メインの問い */}
      <div style={{
        fontSize: 28, fontFamily: 'Georgia, serif', fontWeight: 400,
        lineHeight: 1.7, color: '#2A2218', letterSpacing: '0.02em',
        marginBottom: 48,
      }}>
        あなたのお肌に、<br />
        今どのような悩みがありますか。
      </div>

      {/* サブテキスト */}
      <div style={{
        fontSize: 12, fontFamily: 'Georgia, serif', fontStyle: 'italic',
        color: '#A08878', lineHeight: 1.9, marginBottom: 40, letterSpacing: '0.04em',
      }}>
        「乾燥してどうしようもない」でも、「毎朝鏡を見るのが嫌になっている」でも構いません。<br />
        あなたの言葉で、そのままお話しください。
      </div>

      {/* テキスト入力 */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={val}
          onChange={e => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={'ここに書いてください…'}
          rows={5}
          style={{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            borderBottom: `1px solid ${focused || val ? '#8A7868' : '#D8CCC0'}`,
            fontSize: 16, fontFamily: 'Georgia, serif',
            color: '#2A2218', background: 'transparent',
            padding: '0 0 20px', lineHeight: 2,
            letterSpacing: '0.04em', transition: 'border-color 0.3s',
          }}
        />
        {/* カーソル行の光 */}
        {focused && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, #8A7868 0%, #B8A898 50%, transparent 100%)',
            animation: 'skinrSlideIn 0.4s ease',
          }} />
        )}
      </div>

      {/* 下部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <span style={{ fontSize: 10, fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#C8B8A8', letterSpacing: '0.06em' }}>
          {val.length > 0 ? `${val.length} 文字` : 'どんな言葉でも受け取ります'}
        </span>
        <button
          disabled={!val.trim()}
          onClick={() => val.trim() && onSend && onSend(val)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none',
            cursor: val.trim() ? 'pointer' : 'default',
            opacity: val.trim() ? 1 : 0.35,
            transition: 'opacity 0.3s',
          }}
        >
          <span style={{ fontSize: 11, fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#2A2218', letterSpacing: '0.08em' }}>
            AI に渡す
          </span>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #8A7868', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { if (val.trim()) { e.currentTarget.style.background = '#2A2218'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.color = '#fff'); } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 16, color: '#8A7868' }}>→</span>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 P — "LINEチャット / 会話型UI"  Conversational form
   参考: LINE (日本最大チャットアプリ) + Intercom / Drift のチャットウィジェット
   ポイント: 見慣れたチャット体験。テキストなし、ボタンタップだけで診断が進む
══════════════════════════════════════════════════════════════ */
const CHAT_FLOW = [
  {
    ai: 'こんにちは！\nお肌の悩みをお聞きして、あなたに合ったスキンケアをご提案します ✨',
    quick: ['乾燥・保湿', '毛穴・黒ずみ', 'ニキビ', 'くすみ・シミ', 'たるみ', '赤み・敏感'],
  },
  {
    ai: (ans) => `「${ans}」ですね。\nそのお悩みはいつ頃から気になっていますか？`,
    quick: ['最近始まった', '半年〜1年', '数年前から', 'ずっと昔から'],
  },
  {
    ai: (ans) => `なるほど。では最後に、\n今お使いのスキンケアはどの程度ですか？`,
    quick: ['ほぼ何もしていない', '洗顔のみ', '基礎3点セット', 'しっかりケアしている'],
  },
];

function InputP({ onSend }) {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(true);
  const [answers, setAnswers] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => {
      const text = typeof CHAT_FLOW[0].ai === 'string' ? CHAT_FLOW[0].ai : CHAT_FLOW[0].ai('');
      setMessages([{ role: 'ai', text }]);
      setTyping(false);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const pick = (choice) => {
    const newAnswers = [...answers, choice];
    const newMessages = [...messages, { role: 'user', text: choice }];

    if (step < CHAT_FLOW.length - 1) {
      setMessages(newMessages);
      setAnswers(newAnswers);
      setTyping(true);
      setTimeout(() => {
        const nextStep = step + 1;
        const aiText = typeof CHAT_FLOW[nextStep].ai === 'function'
          ? CHAT_FLOW[nextStep].ai(choice)
          : CHAT_FLOW[nextStep].ai;
        setMessages(m => [...m, { role: 'ai', text: aiText }]);
        setStep(nextStep);
        setTyping(false);
      }, 1100);
    } else {
      setMessages([...newMessages, { role: 'ai', text: '完璧です！\nあなたの情報をもとに成分を分析しています…' }]);
      setTimeout(() => {
        onSend && onSend(newAnswers.join('・') + 'が悩みです');
      }, 1600);
    }
  };

  const currentQuick = !typing && step < CHAT_FLOW.length && messages[messages.length - 1]?.role === 'ai'
    ? CHAT_FLOW[step].quick
    : [];

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      {/* チャットウィンドウ */}
      <div style={{
        background: '#F0EBE3',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(80,60,40,0.14)',
      }}>
        {/* ヘッダー */}
        <div style={{
          background: '#1A6644', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '0.01em' }}>SKINR AI</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>成分ロジック診断</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
            {[1, 0.6, 0.3].map((o, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(255,255,255,${o})` }} />
            ))}
          </div>
        </div>

        {/* メッセージエリア */}
        <div style={{ padding: '20px 16px', minHeight: 180, maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}
          className="skinr-scroll">
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'skinrFadeIn 0.2s ease',
            }}>
              {msg.role === 'ai' && (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1A6644', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>
                  <Icon name="sparkle" size={11} color="#fff" />
                </div>
              )}
              <div style={{
                maxWidth: '75%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                background: msg.role === 'user' ? '#1A6644' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1A1814',
                fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line',
                boxShadow: '0 2px 8px rgba(80,60,40,0.08)',
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* タイピングインジケーター */}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'skinrFadeIn 0.2s ease' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1A6644', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="sparkle" size={11} color="#fff" />
              </div>
              <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: 4, boxShadow: '0 2px 8px rgba(80,60,40,0.08)' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#C8B8A8',
                    animation: `skinrTypingDot 1.2s ease ${i * 0.18}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* クイックリプライ */}
        {currentQuick.length > 0 && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {currentQuick.map(q => (
              <button
                key={q}
                onClick={() => pick(q)}
                style={{
                  padding: '8px 16px', borderRadius: 999,
                  border: '1.5px solid #1A6644', background: '#fff',
                  color: '#1A6644', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.01em',
                  transition: 'all 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1A6644'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#1A6644'; }}
              >{q}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   案 Q — チャット型診断カード（ブラッシュアップ版）
   ポイント: ホームページのヒーローに埋め込む。カード内で診断 → 結果まで完結
   → 最後に「詳しい結果を見る」でSkinrResultへ飛ぶ設計
══════════════════════════════════════════════════════════════ */
const Q_FLOW = [
  {
    delay: 600,
    ai: 'こんにちは！成分ロジック AI です。\nいくつか質問して、あなたのお肌に合ったケアをご提案します。',
    quick: null,
  },
  {
    delay: 400,
    ai: 'まず、お肌のタイプを教えてください。',
    quick: [
      { label: '乾燥肌', sub: 'かさつき・つっぱり感' },
      { label: '脂性肌', sub: 'テカリ・毛穴が気になる' },
      { label: '混合肌', sub: 'Tゾーンのみテカる' },
      { label: '普通肌', sub: 'あまり気にならない' },
    ],
  },
  {
    delay: 500,
    ai: (ans) => `${ans}ですね。\n一番気になるお悩みはどれですか？`,
    quick: [
      { label: '乾燥・保湿', sub: 'バリア機能を整えたい' },
      { label: '毛穴・黒ずみ', sub: '引き締め・収れん' },
      { label: 'ニキビ・赤み', sub: '炎症を鎮めたい' },
      { label: 'くすみ・シミ', sub: 'トーンアップしたい' },
      { label: 'たるみ・ハリ', sub: 'コラーゲンをサポート' },
    ],
  },
  {
    delay: 500,
    ai: (ans) => `「${ans}」ですね。\n今のスキンケアはどのくらいですか？`,
    quick: [
      { label: 'ほぼ何もしていない', sub: 'これから始めたい' },
      { label: '洗顔・保湿のみ', sub: '基本ケアはしている' },
      { label: 'しっかりケアしている', sub: '美容液など複数使用中' },
    ],
  },
];

// 肌タイプ × 悩みから推奨成分を返す（簡易ロジック）
function getIngredients(skinType, concern) {
  const base = {
    '乾燥肌': ['ヒアルロン酸Na', 'セラミド', 'グリセリン'],
    '脂性肌': ['ナイアシンアミド', 'サリチル酸', 'ティーツリー'],
    '混合肌': ['ナイアシンアミド', 'ヒアルロン酸Na', 'レチノール'],
    '普通肌': ['ビタミンC誘導体', 'レチノール', 'ペプチド'],
  };
  const concern_map = {
    '乾燥・保湿': ['セラミド', 'ヒアルロン酸Na', 'スクワラン'],
    '毛穴・黒ずみ': ['サリチル酸', 'グルコン酸', 'ナイアシンアミド'],
    'ニキビ・赤み': ['アゼライン酸', 'ティーツリー', 'アラントイン'],
    'くすみ・シミ': ['ビタミンC誘導体', 'アルブチン', 'トラネキサム酸'],
    'たるみ・ハリ': ['レチノール', 'ペプチド', 'EGF'],
  };
  const b = base[skinType] || base['普通肌'];
  const c = concern_map[concern] || [];
  // 重複除去して3成分
  const merged = [...new Set([...c.slice(0, 2), ...b])].slice(0, 3);
  return merged;
}

function AiBubble({ text, isFirst }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'skinrFadeIn 0.22s ease' }}>
      {!isFirst && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #1A6644 0%, #2EA86A 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(26,102,68,0.25)',
        }}>
          <Icon name="sparkle" size={12} color="#fff" />
        </div>
      )}
      {isFirst && <div style={{ width: 28, flexShrink: 0 }} />}
      <div style={{
        maxWidth: '80%', padding: '11px 15px',
        background: '#fff',
        borderRadius: '4px 18px 18px 18px',
        fontSize: 13, lineHeight: 1.65, color: '#1A1814',
        whiteSpace: 'pre-line', letterSpacing: '0.01em',
        boxShadow: '0 2px 12px rgba(80,60,40,0.08)',
      }}>
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'skinrFadeIn 0.22s ease' }}>
      <div style={{
        maxWidth: '75%', padding: '11px 15px',
        background: 'linear-gradient(135deg, #1A6644 0%, #155239 100%)',
        borderRadius: '18px 4px 18px 18px',
        fontSize: 13, lineHeight: 1.6, color: '#fff',
        fontWeight: 500, letterSpacing: '0.01em',
        boxShadow: '0 3px 12px rgba(26,102,68,0.28)',
      }}>
        {text}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, animation: 'skinrFadeIn 0.18s ease' }}>
      <div style={{ width: 28, flexShrink: 0 }} />
      <div style={{
        padding: '12px 16px', background: '#fff',
        borderRadius: '4px 18px 18px 18px',
        display: 'flex', gap: 5, alignItems: 'center',
        boxShadow: '0 2px 12px rgba(80,60,40,0.08)',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#C8B8A8',
            animation: `skinrTypingDot 1.3s ease ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ skinType, concern, routine, onDetail }) {
  const ingredients = getIngredients(skinType, concern);
  const INGR_ICONS = { 'ヒアルロン酸Na': '💧', 'セラミド': '🛡', 'グリセリン': '🌊', 'ナイアシンアミド': '✨', 'サリチル酸': '🔬', 'ティーツリー': '🌿', 'レチノール': '🌙', 'ビタミンC誘導体': '☀️', 'ペプチド': '⚡', 'スクワラン': '💎', 'グルコン酸': '🧪', 'アゼライン酸': '🌸', 'アラントイン': '🌱', 'アルブチン': '🤍', 'トラネキサム酸': '⚪', 'EGF': '🔑' };

  return (
    <div style={{
      margin: '4px 0 0 36px',
      background: 'linear-gradient(135deg, #F0FAF4 0%, #E8F5EF 100%)',
      border: '1.5px solid rgba(26,102,68,0.18)',
      borderRadius: 16,
      padding: '18px 18px 16px',
      animation: 'skinrSlideUp 0.3s ease',
      boxShadow: '0 4px 20px rgba(26,102,68,0.10)',
    }}>
      {/* タイトル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A6644' }} />
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.18em', color: '#1A6644', fontWeight: 600 }}>
          診断完了 — あなたへのご提案
        </span>
      </div>

      {/* 肌タイプ */}
      <div style={{ fontSize: 13, color: '#1A1814', fontWeight: 600, marginBottom: 4 }}>
        {skinType} × {concern}
      </div>
      <div style={{ fontSize: 11, color: '#7A706A', marginBottom: 14 }}>
        {routine === 'しっかりケアしている' ? '現在のルーティンを活かしながら強化できます' :
         routine === '洗顔・保湿のみ' ? 'シンプルなルーティンに1〜2品追加するのがおすすめ' :
         '無理なく始められる3ステップを提案します'}
      </div>

      {/* 推奨成分 */}
      <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#AAA098', marginBottom: 10 }}>
        注目すべき成分
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {ingredients.map((ing, i) => (
          <div key={ing} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 99,
            background: '#fff', border: '1px solid rgba(26,102,68,0.15)',
            fontSize: 12, fontWeight: 500, color: '#1A1814',
            boxShadow: '0 1px 4px rgba(26,102,68,0.06)',
          }}>
            <span style={{ fontSize: 13 }}>{INGR_ICONS[ing] || '🌿'}</span>
            {ing}
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onDetail}
        style={{
          width: '100%', padding: '12px', borderRadius: 10,
          border: 'none',
          background: 'linear-gradient(135deg, #1A6644 0%, #155239 100%)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '0.02em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 16px rgba(26,102,68,0.30)',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(26,102,68,0.40)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,102,68,0.30)'}
      >
        <Icon name="sparkle" size={13} color="#fff" />
        おすすめ商品を全部見る
      </button>
    </div>
  );
}

function InputQ({ onComplete }) {
  // messages: { role, text, isFirst?, resultData? }
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [flowStep, setFlowStep] = useState(0); // which Q_FLOW step we're showing quick replies for
  const [answers, setAnswers] = useState({}); // { skinType, concern, routine }
  const [done, setDone] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const bottomRef = useRef(null);

  // 初期メッセージを表示
  useEffect(() => {
    const t1 = setTimeout(() => {
      setMessages([{ role: 'ai', text: Q_FLOW[0].ai, isFirst: true }]);
      setTyping(true);
    }, 300);
    const t2 = setTimeout(() => {
      setMessages(m => [...m, { role: 'ai', text: Q_FLOW[1].ai }]);
      setTyping(false);
      setFlowStep(1);
    }, 300 + 600 + 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages, typing, showResult]);

  const pick = (choice) => {
    if (done) return;
    const newMsgs = [...messages, { role: 'user', text: choice.label }];
    setMessages(newMsgs);

    const stepIdx = flowStep; // 1=skinType, 2=concern, 3=routine
    const newAnswers = { ...answers };
    if (stepIdx === 1) newAnswers.skinType = choice.label;
    if (stepIdx === 2) newAnswers.concern = choice.label;
    if (stepIdx === 3) newAnswers.routine = choice.label;
    setAnswers(newAnswers);

    const nextStep = stepIdx + 1;

    if (nextStep < Q_FLOW.length) {
      setFlowStep(0); // hide quick replies while typing
      setTyping(true);
      setTimeout(() => {
        const aiText = typeof Q_FLOW[nextStep].ai === 'function'
          ? Q_FLOW[nextStep].ai(choice.label)
          : Q_FLOW[nextStep].ai;
        setMessages(m => [...m, { role: 'ai', text: aiText }]);
        setTyping(false);
        setFlowStep(nextStep);
      }, Q_FLOW[nextStep].delay + 200);
    } else {
      // 診断完了
      setFlowStep(0);
      setDone(true);
      setTyping(true);
      setTimeout(() => {
        setMessages(m => [...m, { role: 'ai', text: '分析が完了しました！\nあなたの肌に合った成分とおすすめ商品をまとめました。' }]);
        setTyping(false);
        setTimeout(() => setShowResult(true), 350);
      }, 1200);
    }
  };

  const currentQuick = !typing && !done && flowStep > 0 && Q_FLOW[flowStep]?.quick
    ? Q_FLOW[flowStep].quick
    : [];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* ── カード本体 ── */}
      <div style={{
        background: 'var(--bg, #FFFEFB)',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(80,60,40,0.14), 0 2px 8px rgba(80,60,40,0.08)',
        border: '1px solid rgba(228,217,206,0.8)',
      }}>

        {/* ヘッダー */}
        <div style={{
          background: 'linear-gradient(135deg, #1A6644 0%, #134D33 100%)',
          padding: '14px 18px 13px',
          display: 'flex', alignItems: 'center', gap: 11,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
            <Icon name="sparkle" size={17} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              AI 肌診断
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>成分ロジック エンジン 稼働中</span>
            </div>
          </div>
          {/* ステップカウンター */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>
              STEP
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>
              {done ? '✓' : Math.max(0, flowStep - 1)}<span style={{ fontSize: 10, opacity: 0.5 }}>{done ? '' : '/3'}</span>
            </div>
          </div>
        </div>

        {/* プログレスバー */}
        <div style={{ height: 2, background: 'rgba(26,102,68,0.1)' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #1A6644, #2EA86A)',
            width: done ? '100%' : `${Math.max(8, (Math.max(0, flowStep - 1) / 3) * 100)}%`,
            transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>

        {/* メッセージエリア */}
        <div
          className="skinr-scroll"
          style={{
            padding: '20px 16px 16px',
            maxHeight: showResult ? 420 : 300,
            minHeight: 160,
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 10,
            transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {messages.map((msg, i) => (
            msg.role === 'ai'
              ? <AiBubble key={i} text={msg.text} isFirst={msg.isFirst} />
              : <UserBubble key={i} text={msg.text} />
          ))}
          {typing && <TypingBubble />}
          {showResult && (
            <ResultCard
              skinType={answers.skinType}
              concern={answers.concern}
              routine={answers.routine}
              onDetail={() => onComplete && onComplete(answers)}
            />
          )}
          <div ref={bottomRef} />
        </div>

        {/* クイックリプライ */}
        {currentQuick.length > 0 && (
          <div style={{
            padding: '0 16px 16px',
            borderTop: '1px solid var(--border, #E4D9CE)',
            display: 'flex', flexDirection: 'column', gap: 8,
            animation: 'skinrSlideUp 0.22s ease',
          }}>
            <div style={{ paddingTop: 12, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#AAA098' }}>
              選択してください
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {currentQuick.map(q => (
                <button
                  key={q.label}
                  onClick={() => pick(q)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '10px 15px',
                    borderRadius: 12,
                    border: '1.5px solid var(--border, #E4D9CE)',
                    background: 'var(--bg, #FFFEFB)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', transition: 'all 0.14s ease',
                    flex: currentQuick.length > 3 ? '0 0 calc(50% - 4px)' : '1',
                    minWidth: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A6644'; e.currentTarget.style.background = 'rgba(26,102,68,0.04)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border, #E4D9CE)'; e.currentTarget.style.background = 'var(--bg, #FFFEFB)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', letterSpacing: '-0.01em' }}>{q.label}</span>
                  {q.sub && <span style={{ fontSize: 10, color: '#AAA098', marginTop: 2, letterSpacing: '0.01em' }}>{q.sub}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ブランドノート */}
      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#C8B8A8' }}>
          POWERED BY SKINR INGREDIENT ENGINE · 1,200+ ACTIVES ANALYZED
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Preview ページ
══════════════════════════════════════════════════════════════ */
export default function InputPreview() {
  const options = [
    {
      label: 'Q',
      title: 'チャット診断カード ✦ ブラッシュアップ版',
      sub: 'カード内で診断から結果まで完結。成分提案 + おすすめ商品CTAまで一気通貫',
      ref: 'LINE / Intercom / iMessage + オリジナル設計',
      bg: 'linear-gradient(160deg, #EDE5DA 0%, #E4DDD5 60%, #DDD6CE 100%)',
      pad: '56px 72px',
      comp: <InputQ />,
      highlight: true,
    },
    {
      label: 'I',
      title: 'Fill-in-the-blank',
      sub: '文章の中に入力欄が溶け込む。読む = 入力する体験',
      ref: '参考: Typology / Duolingo の文章完成',
      bg: 'linear-gradient(180deg, #EDE5DA 0%, #E8DFCF 100%)',
      pad: '64px 80px',
      comp: <InputI />,
    },
    {
      label: 'J',
      title: 'コマンドパレット',
      sub: '⌘K で発動、キーボードで悩みを即検索。候補リスト付き',
      ref: '参考: Linear ⌘K + macOS Spotlight',
      bg: 'linear-gradient(180deg, #2A2622 0%, #1E1C18 100%)',
      pad: '64px 80px',
      comp: <InputJ />,
    },
    {
      label: 'K',
      title: 'タイル選択式',
      sub: 'テキスト入力なし。タップだけで完結。複数選択 → まとめて診断',
      ref: '参考: Curology skin quiz + Glossier skin quiz',
      bg: 'linear-gradient(180deg, #F0EBE3 0%, #E8E0D6 100%)',
      pad: '56px 72px',
      comp: <InputK />,
    },
    {
      label: 'L',
      title: '日本高級化粧品',
      sub: '縦書きラベル・金縁・明朝体・文字カウンター。カウンター接客感',
      ref: '参考: 資生堂 / SUQQU / コスメデコルテ Web',
      bg: 'linear-gradient(180deg, #F5EFE6 0%, #EDE5DA 100%)',
      pad: '60px 80px',
      comp: <InputL />,
    },
    {
      label: 'M',
      title: '臨床成分表示',
      sub: '製品成分表のような無機質なUIで「科学的な診断」感を演出',
      ref: '参考: The Ordinary / Paula\'s Choice',
      bg: 'linear-gradient(180deg, #F8F6F2 0%, #F0EEEA 100%)',
      pad: '0',
      comp: <InputM />,
    },
    {
      label: 'N',
      title: 'iOS ステップ式',
      sub: 'Apple Health/UIKit 風。3ステップの選択でスムーズに診断',
      ref: '参考: Apple Health App / iOS HIG',
      bg: 'linear-gradient(180deg, #EEE8E0 0%, #E4DDD5 100%)',
      pad: '56px 72px',
      comp: <InputN />,
    },
    {
      label: 'O',
      title: '文学的・余白の美',
      sub: 'セリフ体の大きな問いと自由記述のみ。思索する体験',
      ref: '参考: Aesop.com / Diptyque Web',
      bg: 'linear-gradient(180deg, #EDE5DA 0%, #E5DDD2 100%)',
      pad: '72px 96px',
      comp: <InputO />,
    },
    {
      label: 'P',
      title: 'LINEチャット型',
      sub: 'AIが質問・ユーザーはタップだけ。日本人に馴染み深い会話UI',
      ref: '参考: LINE / Intercom / Drift',
      bg: 'linear-gradient(180deg, #E8E0D8 0%, #DDD6CE 100%)',
      pad: '48px 64px',
      comp: <InputP />,
    },
  ];

  return (
    <div style={{
      background: '#E0D8CF',
      minHeight: '100vh',
      padding: '52px 48px 100px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* タイトル */}
      <div style={{ textAlign: 'center', marginBottom: 72 }}>
        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.28em', color: '#AAA098' }}>
          INPUT DESIGN · ROUND 3–4 + FEATURED Q · 参考サイト拡張版
        </span>
        <h2 style={{ fontSize: 30, fontWeight: 300, letterSpacing: '-0.04em', color: '#1A1814', margin: '10px 0 6px' }}>
          入力欄デザイン案 Q · I–P
        </h2>
        <p style={{ fontSize: 12, color: '#AAA098', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
          Typology · Linear · Curology · 資生堂 · The Ordinary · Apple · Aesop · LINE · iMessage
        </p>
      </div>

      {options.map(({ label, title, sub, ref, bg, pad, comp, highlight }) => (
        <div key={label} style={{ marginBottom: highlight ? 108 : 88 }}>
          {/* ラベル */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', color: highlight ? '#1A6644' : '#1A6644', fontWeight: 600 }}>
              案 {label}
            </span>
            {highlight && (
              <span style={{
                fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.18em',
                color: '#fff', background: '#1A6644', padding: '3px 10px', borderRadius: 4, fontWeight: 700,
              }}>FEATURED</span>
            )}
            <span style={{ fontSize: highlight ? 22 : 20, fontWeight: highlight ? 600 : 500, letterSpacing: '-0.025em', color: '#1A1814' }}>{title}</span>
            <span style={{ fontSize: 12, color: '#AAA098', flex: 1 }}>{sub}</span>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#C8B8A8', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{ref}</span>
          </div>

          {/* プレビューボックス */}
          <div style={{
            background: bg, borderRadius: highlight ? 20 : 16, padding: pad,
            border: highlight ? '2px solid rgba(26,102,68,0.14)' : '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
            boxShadow: highlight ? '0 8px 48px rgba(80,60,40,0.10)' : 'none',
          }}>
            {comp}
          </div>
          {highlight && (
            <div style={{ textAlign: 'center', marginTop: 14, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.18em', color: '#AAA098' }}>
              ↑ この案をベースに SkinrHome.jsx へ実装予定
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
