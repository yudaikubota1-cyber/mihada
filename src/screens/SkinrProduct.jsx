import React, { useState } from 'react';
import { PRODUCTS, ROUTINE_STEPS } from '../data/products.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Divider, PrimaryButton,
} from '../components/shared.jsx';

export default function SkinrProduct({ productId, onBack }) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const [routineTab, setRoutineTab] = useState('morning');

  // 楽天検索URL（ブランド名 + 商品名で検索）
  const rakutenSearchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${product.brand} ${product.nameJa}`)}/`;
  const openRakuten = () => window.open(rakutenSearchUrl, '_blank', 'noopener,noreferrer');

  return (
    <div style={{ height: '100%', position: 'relative', background: '#fff' }}>
      <div className="skinr-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 100 }}>

        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid #F0F0F0',
        }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
            <Icon name="arrowLeft" size={20} />
          </button>
          <SkinrEyebrow size={9}>{product.categoryLabel.toUpperCase()}</SkinrEyebrow>
          <div style={{ width: 32 }} />
        </div>

        {/* Hero image */}
        <ProductImage product={product} size="xl" label={false} />

        {/* Title block */}
        <div style={{ padding: '24px 24px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <SkinrEyebrow>{product.brand}</SkinrEyebrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="star" size={12} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{product.review.score}</span>
              <span style={{ fontSize: 11, color: '#7A7A7A' }}>({product.review.count})</span>
            </div>
          </div>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: 22, fontWeight: 500, lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>{product.nameJa}</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#7A7A7A', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>
            {product.name}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18 }}>
            <span style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.01em' }}>{product.price}</span>
            <span style={{ fontSize: 12, color: '#7A7A7A' }}>{product.volume}</span>
          </div>
        </div>

        {/* Tag chips */}
        <div style={{ padding: '0 24px 20px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {product.tags.map(t => (
            <span key={t} style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid #EBEBEB', fontSize: 11, color: '#888',
              background: '#FAFAFA', letterSpacing: '0.01em',
            }}># {t}</span>
          ))}
        </div>

        {/* Use timing */}
        <div style={{ padding: '0 24px 8px' }}>
          <Divider />
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', gap: 10 }}>
          {['朝', '夜'].map(t => {
            const active = product.timing.includes(t);
            return (
              <div key={t} style={{
                flex: 1,
                padding: '16px',
                border: '1px solid ' + (active ? '#111' : '#F0F0F0'),
                borderRadius: 4,
                opacity: active ? 1 : 0.4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <Icon name={t === '朝' ? 'sun' : 'moon'} size={20} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t}に使用</span>
                {active && <SkinrEyebrow size={9}>RECOMMENDED</SkinrEyebrow>}
              </div>
            );
          })}
        </div>

        {/* Ingredients */}
        <div style={{ padding: '12px 24px 0' }}>
          <Divider label="主要成分" />
        </div>
        <div style={{ padding: '20px 24px 8px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 300, letterSpacing: '-0.01em' }}>
            主要成分と効果
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: '#7A7A7A' }}>
            この商品が肌にどう効くのか
          </p>
        </div>
        <div style={{ padding: '14px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {product.ingredients.map((ing, i) => (
            <div key={ing.name} style={{
              padding: '14px 14px',
              border: '1px solid #EBEBEB',
              borderLeft: i === 0 ? '2.5px solid #111' : '1px solid #EBEBEB',
              borderRadius: 4,
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: i === 0 ? '#F9F9F9' : '#fff',
              animation: `skinrFadeIn 0.3s ${i * 0.06}s ease both`,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, letterSpacing: '0.12em', color: '#C0C0C0',
                paddingTop: 2, minWidth: 22,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ing.name}</div>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#777' }}>{ing.effect}</p>
              </div>
            </div>
          ))}
        </div>

        {/* For skin types */}
        <div style={{ padding: '8px 24px 0' }}>
          <Divider label="向いている肌" />
        </div>
        <div style={{ padding: '20px 24px 8px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>
            向いている肌タイプ
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {product.forSkin.map(s => (
              <span key={s} style={{
                padding: '6px 13px', borderRadius: 999,
                background: '#111', color: '#fff',
                fontSize: 11, fontWeight: 500,
                letterSpacing: '0.01em',
              }}>{s}</span>
            ))}
          </div>
          <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>
            アプローチできる悩み
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {product.concerns.map(s => (
              <span key={s} style={{
                padding: '6px 13px', borderRadius: 999,
                background: '#F5F5F5', fontSize: 11, fontWeight: 500,
                border: '1px solid #E8E8E8', color: '#444',
                letterSpacing: '0.01em',
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Good combos */}
        <div style={{ padding: '20px 24px 0' }}>
          <Divider label="相性のよい成分" />
        </div>
        <div style={{ padding: '20px 24px 0' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 300, letterSpacing: '-0.01em' }}>
            相性のよい組み合わせ
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {product.goodWith.map((g, i) => (
              <div key={g} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                border: '1px solid #EBEBEB', borderRadius: 4,
                animation: `skinrFadeIn 0.3s ${i * 0.06}s ease both`,
              }}>
                <Icon name="check" size={14} color="#555" />
                <span style={{ fontSize: 12, color: '#444' }}>{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NG combos */}
        <div style={{ padding: '8px 24px 0' }}>
          <Divider label="避けたい組み合わせ" />
        </div>
        <div style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {product.avoidWith.map((g, i) => (
              <div key={g} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: '#FAFAFA',
                border: '1px solid #EBEBEB',
                borderLeft: '2.5px solid #DCDCDC',
                borderRadius: 4,
                animation: `skinrFadeIn 0.3s ${i * 0.06}s ease both`,
              }}>
                <Icon name="warn" size={13} color="#ABABAB" />
                <span style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Daily Routine（結果画面から移動）─── */}
        <div style={{ padding: '8px 24px 0' }}>
          <Divider label="毎日のルーティン" />
        </div>
        <div style={{ padding: '14px 24px 4px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 300, letterSpacing: '-0.01em' }}>
            この商品を使ったルーティン
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: '#7A7A7A' }}>
            朝・夜それぞれのステップ順
          </p>
        </div>
        <div style={{ padding: '14px 24px 0', display: 'flex', gap: 0, borderBottom: '1px solid #F0F0F0' }}>
          {[
            { id: 'morning', label: '朝', icon: 'sun' },
            { id: 'night', label: '夜', icon: 'moon' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setRoutineTab(t.id)}
              style={{
                flex: 1, padding: '14px 0',
                background: 'none', border: 'none',
                borderBottom: '1.5px solid ' + (routineTab === t.id ? '#111' : 'transparent'),
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'inherit', fontSize: 13,
                fontWeight: routineTab === t.id ? 500 : 400,
                color: routineTab === t.id ? '#111' : '#7A7A7A',
                marginBottom: -1,
              }}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '20px 24px 32px' }}>
          {!ROUTINE_STEPS[routineTab].some(s => s.productId === product.id) && (
            <div style={{
              padding: '12px 14px', marginBottom: 16,
              background: '#FAFAFA', border: '1px solid #EBEBEB',
              borderRadius: 4, fontSize: 12, color: '#7A7A7A', lineHeight: 1.6,
            }}>
              この商品はこのルーティンには含まれていませんが、{product.timing.join('・')}に使用できます。
            </div>
          )}
          <div style={{ position: 'relative' }}>
            {/* Vertical connector line */}
            <div style={{
              position: 'absolute', left: 13, top: 26,
              width: 1, bottom: 26,
              background: '#EBEBEB',
              zIndex: 0,
            }} />
            {ROUTINE_STEPS[routineTab].map((step, i) => {
              const isCurrent = step.productId === product.id;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 0',
                  animation: `skinrFadeIn 0.25s ${i * 0.05}s ease both`,
                  position: 'relative', zIndex: 1,
                }}>
                  <div style={{
                    width: 26, height: 26,
                    border: '1.5px solid ' + (isCurrent ? '#111' : '#DCDCDC'),
                    borderRadius: '50%',
                    background: isCurrent ? '#111' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0,
                    color: isCurrent ? '#fff' : '#999',
                    boxShadow: isCurrent ? '0 0 0 3px rgba(17,17,17,0.08)' : 'none',
                  }}>
                    {step.step}
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 600 : 500,
                      marginBottom: 2,
                      color: isCurrent ? '#111' : '#555',
                    }}>
                      {step.label}
                      {isCurrent && (
                        <span style={{
                          marginLeft: 8,
                          fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.14em', color: '#fff',
                          background: '#111', padding: '2px 7px', borderRadius: 3,
                        }}>THIS ITEM</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews link — 楽天検索を新規タブで開く */}
        <div style={{ padding: '8px 24px 32px' }}>
          <button
            onClick={openRakuten}
            className="skinr-tappable"
            style={{
              width: '100%',
              padding: '14px 16px',
              background: '#fff',
              border: '1px solid #E8E8E8',
              borderRadius: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', fontFamily: 'inherit',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6,
                background: '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="star" size={16} color="#888" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>
                  楽天レビューを見る
                </div>
                <div style={{ fontSize: 11, color: '#ABABAB', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
                  ★ {product.review.score} · {product.review.count} reviews
                </div>
              </div>
            </div>
            <Icon name="arrowRight" size={14} color="#C0C0C0" />
          </button>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid #F0F0F0',
        zIndex: 5,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <PrimaryButton full onClick={openRakuten} icon={<Icon name="arrowRight" size={14} color="#fff" />}>
            楽天で購入する
          </PrimaryButton>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 300, letterSpacing: '-0.01em' }}>{product.price}</div>
          <div style={{ fontSize: 10, color: '#B5B5B5' }}>{product.volume}</div>
        </div>
      </div>
    </div>
  );
}
