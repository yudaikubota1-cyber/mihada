import React, { useState } from 'react';
import { PRODUCTS } from '../data/products.js';
import { INGREDIENT_DICT } from '../data/knowledge.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Divider, PrimaryButton, shade,
} from '../components/shared.jsx';

// 成分名でINGREDIENT_DICTを検索（部分一致）
function lookupIngredient(name) {
  if (!name) return null;
  return INGREDIENT_DICT.find(d =>
    name.includes(d.name) || d.name.includes(name)
  ) || null;
}

export default function SkinrProduct({ isDesktop, productId, onBack }) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const [imgError, setImgError] = useState(false);

  const openRakuten = () => {
    const url = product.url || `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(`${product.brand} ${product.nameJa}`)}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // skin types: prefer Excel-imported skinTypes, fall back to forSkin
  const skinTypes = (product.skinTypes && product.skinTypes.length > 0)
    ? product.skinTypes
    : (product.forSkin || []);

  // ingredients: always string[] after Excel import
  const ingredients = Array.isArray(product.ingredients)
    ? (typeof product.ingredients[0] === 'string'
        ? product.ingredients
        : product.ingredients.map(i => i.name || ''))
    : [];

  const px = isDesktop ? '40px' : '24px';

  return (
    <div style={{
      height: isDesktop ? 'auto' : '100%',
      minHeight: isDesktop ? '100dvh' : 'auto',
      position: 'relative', background: '#fff',
    }}>
      <div className={`skinr-scroll${isDesktop ? ' skinr-page' : ''}`} style={{
        height: isDesktop ? 'auto' : '100%',
        overflowY: isDesktop ? 'visible' : 'auto',
        paddingBottom: isDesktop ? 0 : 100,
      }}>

        {/* Top bar */}
        <div style={{
          position: isDesktop ? 'static' : 'sticky', top: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
            <Icon name="arrowLeft" size={20} />
          </button>
          <SkinrEyebrow size={9}>{(product.categoryLabel || '').toUpperCase()}</SkinrEyebrow>
          <div style={{ width: 32 }} />
        </div>

        {/* Hero image — full bleed */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#fff' }}>
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.nameJa}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: 340, objectFit: 'contain', display: 'block', padding: '6%' }}
            />
          ) : (
            <div style={{
              width: '100%', height: 340,
              background: product.swatch,
              backgroundImage: `repeating-linear-gradient(135deg, ${product.swatch} 0px, ${product.swatch} 18px, ${shade(product.swatch, -3)} 18px, ${shade(product.swatch, -3)} 19px)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
            }}>
              <div style={{
                width: 90, height: 140,
                background: shade(product.swatch, -10),
                borderRadius: 6,
              }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, letterSpacing: '0.22em',
                color: product.accent, opacity: 0.7,
              }}>
                {product.brand.toUpperCase()}
              </span>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
            background: 'linear-gradient(to top, rgba(255,255,255,0.7), transparent)',
          }} />
        </div>

        {/* Title block */}
        <div style={{ padding: `24px ${px} 12px` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <SkinrEyebrow size={10}>{product.brand}</SkinrEyebrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#D4A017', fontSize: 13 }}>★</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{product.review.score}</span>
              <span style={{ fontSize: 11, color: '#ABABAB' }}>({product.review.count})</span>
            </div>
          </div>
          <h1 style={{
            margin: '0 0 6px',
            fontSize: 23, fontWeight: 500, lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>{product.nameJa}</h1>
          <p style={{ margin: '0 0 16px', fontSize: 11, color: '#ABABAB', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>
            {product.name}
          </p>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {product.price}
            </span>
            <span style={{ fontSize: 12, color: '#ABABAB' }}>{product.volume}</span>
          </div>
        </div>

        {/* ingredientDesc — expert summary */}
        {product.ingredientDesc && (
          <div style={{ padding: `0 ${px} 16px` }}>
            <div style={{
              padding: '14px 16px',
              background: '#F9F7F4',
              border: '1px solid #EDE9E3',
              borderLeft: '2.5px solid #111',
              borderRadius: 6,
              fontSize: 13, lineHeight: 1.7,
              color: '#444',
              letterSpacing: '0.01em',
            }}>
              {product.ingredientDesc}
            </div>
          </div>
        )}

        {/* Tag chips */}
        <div style={{ padding: `0 ${px} 16px`, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(product.tags || []).map(t => (
            <span key={t} style={{
              padding: '5px 11px', borderRadius: 999,
              border: '1px solid #EDEBE8', fontSize: 11, color: '#888',
              background: '#FAFAF8', letterSpacing: '0.01em',
            }}># {t}</span>
          ))}
        </div>

        {/* Use timing */}
        <div style={{ padding: `0 ${px} 4px` }}>
          <Divider />
        </div>
        <div style={{ padding: `16px ${px}`, display: 'flex', gap: 10 }}>
          {['朝', '夜'].map(t => {
            const active = (product.timing || []).includes(t);
            return (
              <div key={t} style={{
                flex: 1,
                padding: '16px',
                border: '1px solid ' + (active ? '#111' : '#EDEDED'),
                borderRadius: 8,
                opacity: active ? 1 : 0.38,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: active ? '#FAFAFA' : '#fff',
              }}>
                <Icon name={t === '朝' ? 'sun' : 'moon'} size={20} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{t}に使用</span>
                {active && <SkinrEyebrow size={8}>RECOMMENDED</SkinrEyebrow>}
              </div>
            );
          })}
        </div>

        {/* ─── Ingredients ─────────────────────────────── */}
        <div style={{ padding: `8px ${px} 0` }}>
          <Divider label="主要成分" />
        </div>
        <div style={{ padding: `20px ${px} 24px` }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 400, letterSpacing: '-0.01em' }}>
            成分と効果
          </h3>
          {ingredients.length === 0 ? (
            <p style={{ fontSize: 12, color: '#ABABAB' }}>成分データなし</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ingredients.map((ingName, i) => {
                const dict = lookupIngredient(ingName);
                const category = dict?.category || '';
                const effects = dict?.effects || '';
                const caution = dict?.caution || '';
                const isPrimary = i === 0;

                return (
                  <div key={ingName + i} style={{
                    padding: '14px 16px',
                    border: '1px solid ' + (isPrimary ? '#D5D0C8' : '#EDEBE8'),
                    borderLeft: isPrimary ? '3px solid #111' : '1px solid #EDEBE8',
                    borderRadius: 8,
                    background: isPrimary ? '#F9F7F4' : '#fff',
                    animation: `skinrFadeIn 0.3s ${i * 0.055}s ease both`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: effects ? 7 : 0 }}>
                      {/* Index */}
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 9, letterSpacing: '0.12em',
                        color: '#C8C8C8', flexShrink: 0,
                        minWidth: 18,
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Name */}
                      <span style={{ fontSize: 14, fontWeight: 600, flex: 1, lineHeight: 1.3 }}>
                        {ingName}
                      </span>
                      {/* Category badge */}
                      {category && (
                        <span style={{
                          fontSize: 8, fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.1em', color: '#888',
                          background: '#EFEFEF', padding: '2px 7px', borderRadius: 3,
                          flexShrink: 0,
                        }}>{category}</span>
                      )}
                    </div>
                    {effects && (
                      <p style={{
                        margin: '0 0 0 28px',
                        fontSize: 12, lineHeight: 1.65, color: '#666',
                      }}>{effects}</p>
                    )}
                    {caution && (
                      <div style={{
                        margin: '8px 0 0 28px',
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                      }}>
                        <Icon name="warn" size={12} color="#C0BBAF" />
                        <span style={{ fontSize: 11, color: '#ABABAB', lineHeight: 1.5 }}>{caution}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Skin types & Concerns ─────────────────── */}
        <div style={{ padding: `0 ${px} 0` }}>
          <Divider label="向いている肌" />
        </div>
        <div style={{ padding: `18px ${px} 20px` }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: '#111' }}>
              向いている肌タイプ
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {skinTypes.map(s => (
                <span key={s} style={{
                  padding: '6px 14px', borderRadius: 999,
                  background: '#111', color: '#fff',
                  fontSize: 12, fontWeight: 500,
                  letterSpacing: '0.01em',
                }}>{s}</span>
              ))}
              {skinTypes.length === 0 && (
                <span style={{ fontSize: 12, color: '#ABABAB' }}>—</span>
              )}
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: '#111' }}>
              アプローチできる悩み
            </h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(product.concerns || []).map(s => (
                <span key={s} style={{
                  padding: '6px 13px', borderRadius: 999,
                  background: '#F5F3F0', fontSize: 12, fontWeight: 500,
                  border: '1px solid #E8E4DE', color: '#444',
                  letterSpacing: '0.01em',
                }}>{s}</span>
              ))}
              {(!product.concerns || product.concerns.length === 0) && (
                <span style={{ fontSize: 12, color: '#ABABAB' }}>—</span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Good / Avoid combos ─────────────────── */}
        {(product.goodWith?.length > 0 || product.avoidWith?.length > 0) && (
          <>
            <div style={{ padding: `0 ${px} 0` }}>
              <Divider label="成分の相性" />
            </div>
            <div style={{ padding: `18px ${px} 20px`, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {product.goodWith?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="check" size={9} color="#fff" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>一緒に使うと効果的</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {product.goodWith.map((g, i) => (
                      <div key={g} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 13px',
                        border: '1px solid #E8E4DE', borderRadius: 6,
                        background: '#fff',
                        animation: `skinrFadeIn 0.3s ${i * 0.05}s ease both`,
                      }}>
                        <Icon name="plus" size={12} color="#888" />
                        <span style={{ fontSize: 12, color: '#444' }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.avoidWith?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #C0BBAF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="warn" size={8} color="#C0BBAF" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>使うタイミングに注意</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {product.avoidWith.map((g, i) => (
                      <div key={g} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 13px',
                        background: '#FAF8F6',
                        border: '1px solid #EDEBE8',
                        borderLeft: '2.5px solid #D5D0C8',
                        borderRadius: 6,
                        animation: `skinrFadeIn 0.3s ${i * 0.05}s ease both`,
                      }}>
                        <Icon name="warn" size={12} color="#C0C0B8" />
                        <span style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reviews link */}
        <div style={{ padding: `0 ${px} 32px` }}>
          <button
            onClick={openRakuten}
            className="skinr-tappable"
            style={{
              width: '100%', padding: '14px 16px',
              background: '#FAFAF8',
              border: '1px solid #E8E4DE',
              borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', fontFamily: 'inherit', gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#F0EDE8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#D4A017', fontSize: 16 }}>★</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>
                  楽天レビューを見る
                </div>
                <div style={{ fontSize: 11, color: '#ABABAB', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
                  {product.review.score} · {product.review.count} reviews
                </div>
              </div>
            </div>
            <Icon name="arrowRight" size={14} color="#C0C0C0" />
          </button>
        </div>
      </div>

      {/* CTA — sticky on mobile, inline on desktop */}
      {isDesktop ? (
        /* Desktop: inline purchase section at bottom */
        <div style={{
          padding: `24px ${px} 60px`,
          borderTop: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{ flex: 1 }}>
            <PrimaryButton full onClick={openRakuten} icon={<Icon name="arrowRight" size={14} color="#fff" />}>
              楽天で購入する
            </PrimaryButton>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>{product.price}</div>
            <div style={{ fontSize: 11, color: '#BABABA', marginTop: 3 }}>{product.volume}</div>
          </div>
        </div>
      ) : (
        /* Mobile: absolute sticky at bottom */
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '12px 16px calc(16px + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <PrimaryButton full onClick={openRakuten} icon={<Icon name="arrowRight" size={14} color="#fff" />}>
              楽天で購入する
            </PrimaryButton>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1 }}>{product.price}</div>
            <div style={{ fontSize: 10, color: '#BABABA', marginTop: 2 }}>{product.volume}</div>
          </div>
        </div>
      )}
    </div>
  );
}
