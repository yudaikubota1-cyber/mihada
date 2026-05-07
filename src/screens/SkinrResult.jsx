import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products.js';
import { INGREDIENT_DICT } from '../data/knowledge.js';
import { buildRakutenSearchUrl, buildProductUrl, searchRakutenProducts } from '../lib/rakuten.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Divider, PrimaryButton,
} from '../components/shared.jsx';

// AI診断の concerns からプロダクトを絞り込む簡易マッピング
const CONCERN_MAP = {
  '乾燥': ['乾燥', 'つっぱり', '保湿', 'バリア低下'],
  '毛穴の開き': ['毛穴', '黒ずみ'],
  '黒ずみ': ['毛穴', '黒ずみ'],
  'くすみ': ['くすみ', 'ハリ不足', '色ムラ'],
  '赤ニキビ': ['ニキビ', '赤み', '肌荒れ'],
  '白ニキビ': ['ニキビ', '赤み', '肌荒れ'],
  'ニキビ跡': ['ニキビ跡', '赤み'],
  'たるみ': ['ハリ不足', 'たるみ', 'ツヤ', 'くすみ'],
};

const ING_CATEGORY_MAP = [
  ['ドクダミ', '鎮静'], ['センテラ', '鎮静'], ['ツボクサ', '鎮静'], ['CICA', '鎮静'], ['アラントイン', '鎮静'],
  ['マデカッソシド', 'バリア'], ['アシアチン酸', 'バリア'], ['セラミド', 'バリア'],
  ['ヒアルロン酸', '保湿'], ['パンテノール', '保湿'], ['ベタイン', '保湿'],
  ['ハチミツ', '保湿'], ['スクワラン', '保湿'], ['海洋水', '保湿'], ['オリーブ', '保湿'],
  ['ナイアシンアミド', '整肌'], ['ローズマリー', '整肌'],
  ['ビタミンC', '透明感'], ['プロポリス', '抗酸化'],
  ['パパイヤ', '角質ケア'],
];
function getIngCategory(name) {
  for (const [key, cat] of ING_CATEGORY_MAP) {
    if (name.includes(key)) return cat;
  }
  // fallback: try INGREDIENT_DICT
  const dict = INGREDIENT_DICT.find(d => name.includes(d.name) || d.name.includes(name));
  return dict?.category || '有効成分';
}

function lookupIngEffect(name) {
  const dict = INGREDIENT_DICT.find(d => name.includes(d.name) || d.name.includes(name));
  return dict?.effects || '';
}

// ingredients フィールドが string[] か {name,effect}[] かを正規化する
function normalizeIngredients(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  if (typeof arr[0] === 'string') return arr;
  return arr.map(i => i.name || '').filter(Boolean);
}

function scoreProduct(product, concerns, skinType) {
  let score = 0;
  for (const concern of concerns) {
    const keywords = CONCERN_MAP[concern] || [concern];
    for (const kw of keywords) {
      if (product.concerns.some(c => c.includes(kw) || kw.includes(c))) score += 2;
    }
  }
  const skinHaystack = [...(product.skinTypes || []), ...(product.forSkin || [])];
  if (skinType && skinHaystack.some(s => s === skinType || skinType.includes(s.replace('肌', '')))) score += 1;
  return score;
}

// 楽天商品カード
function RakutenCard({ item }) {
  const [imgError, setImgError] = useState(false);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        flex: '0 0 120px',
        display: 'flex', flexDirection: 'column',
        textDecoration: 'none', color: 'inherit',
      }}
    >
      {/* 画像 */}
      <div style={{
        width: 120, height: 120, borderRadius: 8, overflow: 'hidden',
        background: '#F5F5F5', marginBottom: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: 11, color: '#C0C0C0', fontFamily: 'JetBrains Mono, monospace' }}>R</span>
        )}
        {/* 楽天バッジ */}
        <div style={{
          position: 'absolute', top: 5, right: 5,
          width: 16, height: 16, borderRadius: '50%',
          background: '#BF0000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: 8, fontWeight: 700 }}>R</span>
        </div>
      </div>

      {/* 店舗名 */}
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
        letterSpacing: '0.1em', color: '#B5B5B5', marginBottom: 3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{item.shop}</div>

      {/* 商品名 */}
      <div style={{
        fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: '#111',
        marginBottom: 4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{item.name}</div>

      {/* 価格 */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#111', marginBottom: 2 }}>
        {item.priceStr}
      </div>

      {/* レビュー */}
      {item.rating > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ color: '#F5A623', fontSize: 9 }}>★</span>
          <span style={{ fontSize: 10, color: '#888' }}>
            {Number(item.rating).toFixed(1)}
            <span style={{ fontSize: 9, color: '#C0C0C0', marginLeft: 2 }}>
              ({item.reviewCount})
            </span>
          </span>
        </div>
      )}
    </a>
  );
}

// 楽天商品ローダー（カテゴリ別）
function RakutenSection({ concerns, category, searchUrl, px = '24px' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchRakutenProducts({ concerns, category, hits: 6 })
      .then(data => { if (!cancelled) { setItems(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [concerns.join(','), category]);

  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 10, padding: `0 ${px} 14px` }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: '0 0 120px', height: 120, borderRadius: 8,
            background: 'linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)',
            backgroundSize: '200% 100%',
            animation: 'skinrLoadBar 1.3s ease infinite',
          }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    // APIが使えない場合は検索リンクボタンのみ
    return (
      <div style={{ padding: `0 ${px} 14px` }}>
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 6,
            border: '1px solid #E0E0E0', textDecoration: 'none',
            background: '#FAFAFA',
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: '#BF0000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>R</span>
          </div>
          <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>楽天で探す</span>
          <Icon name="arrowRight" size={14} color="#999" />
        </a>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 14,
        width: 48, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, transparent, #fff)',
      }} />
      <div className="skinr-scroll" style={{
        display: 'flex', gap: 10,
        overflowX: 'auto',
        padding: `0 ${px} 14px`,
        WebkitOverflowScrolling: 'touch',
      }}>
        {items.map(item => (
          <RakutenCard key={item.id} item={item} />
        ))}
        {/* もっと探す */}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: '0 0 80px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, height: 120, alignSelf: 'flex-start',
            border: '1px solid #E8E8E8', borderRadius: 8,
            background: '#FAFAFA', textDecoration: 'none',
            padding: 12,
          }}
        >
          <Icon name="arrowRight" size={18} color="#999" />
          <div style={{ fontSize: 10, color: '#999', textAlign: 'center', lineHeight: 1.5 }}>
            もっと<br />見る
          </div>
        </a>
      </div>
    </div>
  );
}

// アプリ内商品カード（診断結果用）
function ResultProductCard({ product: p, idx, onDetail }) {
  const [pressed, setPressed] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      style={{ flex: '0 0 130px', cursor: 'pointer' }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* 画像 */}
      <div
        onClick={onDetail}
        style={{
          width: 130, height: 130, borderRadius: 10, overflow: 'hidden',
          background: p.image ? '#F7F5F2' : (p.swatch || '#F0EDE8'),
          border: p.image ? '1px solid #EDEBE8' : 'none',
          marginBottom: 8, position: 'relative',
          boxShadow: pressed ? '0 2px 8px rgba(0,0,0,0.07)' : '0 4px 16px rgba(0,0,0,0.10)',
          transform: pressed ? 'scale(0.96)' : 'scale(1)',
          transition: 'all 0.15s ease',
        }}
      >
        {p.image && !imgError ? (
          <img
            src={p.image}
            alt={p.nameJa}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8%' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: p.swatch,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              letterSpacing: '0.14em', color: p.accent, opacity: 0.6,
            }}>{p.brand.split(' ')[0]}</span>
          </div>
        )}
        {idx === 0 && (
          <div style={{
            position: 'absolute', top: 6, left: 6,
            background: '#111', color: '#fff',
            fontSize: 7, fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.12em', padding: '2px 6px', borderRadius: 2,
          }}>BEST MATCH</div>
        )}
      </div>

      {/* テキスト情報 */}
      <div onClick={onDetail}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '0.14em', color: '#C0C0C0', marginBottom: 3 }}>
          {p.brand}
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: '#111', marginBottom: 5 }}>
          {p.nameJa}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#111', marginBottom: 5 }}>
          {p.price}
        </div>
      </div>

      {/* アクションボタン行 */}
      <div style={{ display: 'flex', gap: 5 }}>
        {/* 詳細を見る */}
        <button
          onClick={onDetail}
          style={{
            flex: 1, padding: '6px 0',
            background: '#111', color: '#fff',
            border: 'none', borderRadius: 5,
            fontSize: 9, fontFamily: 'inherit', fontWeight: 600,
            cursor: 'pointer', letterSpacing: '0.02em',
          }}
        >
          詳細
        </button>
        {/* 楽天で直接購入 */}
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '6px 0',
              background: '#BF0000', color: '#fff',
              border: 'none', borderRadius: 5,
              fontSize: 9, fontFamily: 'inherit', fontWeight: 600,
              cursor: 'pointer', letterSpacing: '0.02em',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            購入
          </a>
        )}
      </div>
    </div>
  );
}

export default function SkinrResult({ isDesktop, diagnosis, onBack, onOpenProduct, onNewChat, onViewCategory }) {
  const skinType = diagnosis?.skin_type || '混合肌';
  const concerns = diagnosis?.concerns || ['乾燥', '毛穴の開き', 'くすみ'];
  const aiMessage = diagnosis?.message;

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const byCategory = {
    cleanser: PRODUCTS.filter(p => p.category === 'cleanser').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
    toner:    PRODUCTS.filter(p => p.category === 'toner').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
    serum:    PRODUCTS.filter(p => p.category === 'serum').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
    cream:    PRODUCTS.filter(p => p.category === 'cream').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
  };

  const categoryOrder = [
    { key: 'cleanser', label: '洗顔', step: '00' },
    { key: 'toner',    label: 'トナー', step: '01' },
    { key: 'serum',    label: '美容液', step: '02' },
    { key: 'cream',    label: 'クリーム', step: '03' },
  ];

  const topProducts = categoryOrder.map(cat => (byCategory[cat.key] || [])[0]).filter(Boolean);
  const ingredients = topProducts
    .flatMap(p => {
      const names = normalizeIngredients(p.ingredients).slice(0, 2);
      return names.map(name => ({
        name,
        effect: lookupIngEffect(name),
        category: getIngCategory(name),
      }));
    })
    .filter((ing, i, arr) => arr.findIndex(x => x.name === ing.name) === i)
    .slice(0, 5);

  const comboGood = [...new Set(topProducts.flatMap(p => p.goodWith || []))].slice(0, 5);
  const comboAvoid = [...new Set(topProducts.flatMap(p => p.avoidWith || []))].slice(0, 4);

  const rakutenUrls = Object.fromEntries(
    categoryOrder.map(cat => [cat.key, buildRakutenSearchUrl({ concerns, category: cat.key })])
  );

  const px = isDesktop ? '40px' : '24px';

  return (
    <div className={`skinr-scroll${isDesktop ? ' skinr-page' : ''}`} style={{
      height: isDesktop ? 'auto' : '100%',
      overflowY: isDesktop ? 'visible' : 'auto',
      background: '#fff',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #F0F0F0',
        position: isDesktop ? 'static' : 'sticky',
        top: 0, background: '#fff', zIndex: 5,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="arrowLeft" size={20} />
        </button>
        {!isDesktop && <SkinrLogo size={13} />}
        <div style={{ flex: isDesktop ? 1 : 'none', textAlign: 'center' }}>
          {isDesktop && (
            <span style={{ fontSize: 12, color: '#ABABAB', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
              DIAGNOSIS RESULT
            </span>
          )}
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* Hero */}
      <div style={{ padding: `40px ${px} 8px` }}>
        <SkinrEyebrow>Result · {dateStr}</SkinrEyebrow>
        <h1 style={{
          margin: '14px 0 0',
          fontSize: 26, fontWeight: 400, lineHeight: 1.3,
          letterSpacing: '-0.02em',
          animation: 'skinrFadeIn 0.4s ease both',
        }}>
          あなたの肌に必要な<br />
          <span style={{ fontWeight: 700 }}>成分、{ingredients.length}つ。</span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 24 }}>
          {ingredients.map((ing, i) => (
            <div key={ing.name} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 0',
              borderBottom: i < ingredients.length - 1 ? '1px solid #F0F0F0' : 'none',
              animation: `skinrFadeIn 0.3s ${0.08 + i * 0.07}s ease both`,
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                letterSpacing: '0.14em', color: '#C8C8C8',
                minWidth: 20, flexShrink: 0,
              }}>{String(i + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{ing.name}</span>
                  <span style={{
                    fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                    letterSpacing: '0.08em', color: '#888',
                    background: '#EFEFEF', padding: '2px 7px', borderRadius: 3,
                    flexShrink: 0,
                  }}>{ing.category}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#888', lineHeight: 1.5 }}>{ing.effect}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 20, flexWrap: 'wrap',
          animation: 'skinrFadeIn 0.35s 0.3s ease both',
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            letterSpacing: '0.14em', color: '#B8B8B8',
            border: '1px solid #EBEBEB', padding: '3px 8px', borderRadius: 999,
          }}>{skinType}</span>
          {concerns.map(c => (
            <span key={c} style={{
              padding: '3px 9px', borderRadius: 999,
              border: '1px solid #DCDCDC', fontSize: 11, color: '#555', fontWeight: 500,
            }}>{c}</span>
          ))}
        </div>

        {aiMessage && (
          <p style={{
            fontSize: 13, lineHeight: 1.8, color: '#777',
            margin: '16px 0 0',
            animation: 'skinrFadeIn 0.4s 0.35s ease both',
          }}>
            {aiMessage}
          </p>
        )}
      </div>

      {/* 相性ガイド */}
      {(comboGood.length > 0 || comboAvoid.length > 0) && (
        <div style={{ padding: `0 ${px} 24px` }}>
          <div style={{ border: '1px solid #EBEBEB', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              padding: '10px 16px', borderBottom: '1px solid #F0F0F0',
              background: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: '#ABABAB' }}>PAIRING GUIDE</span>
            </div>
            {comboGood.length > 0 && (
              <div style={{ padding: '14px 16px', borderBottom: comboAvoid.length > 0 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#111', letterSpacing: '0.01em' }}>一緒に使うと効果的</span>
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#fff', background: '#111', padding: '2px 6px', borderRadius: 2, letterSpacing: '0.08em' }}>◎</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {comboGood.map(g => (
                    <span key={g} style={{ padding: '5px 11px', borderRadius: 999, border: '1px solid #DCDCDC', background: '#fff', fontSize: 11, color: '#333', fontWeight: 500 }}>{g}</span>
                  ))}
                </div>
              </div>
            )}
            {comboAvoid.length > 0 && (
              <div style={{ padding: '14px 16px', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '0.01em' }}>使うタイミングに注意</span>
                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#888', border: '1px solid #D8D8D8', padding: '2px 6px', borderRadius: 2, letterSpacing: '0.08em' }}>△</span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 11, color: '#999', lineHeight: 1.6 }}>朝・夜で分けるか、日を変えるなど時間差での使用がおすすめ</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {comboAvoid.map(a => (
                    <span key={a} style={{ padding: '5px 11px', borderRadius: 999, border: '1px dashed #D0D0D0', background: '#fff', fontSize: 11, color: '#888' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: `4px ${px} 0` }}>
        <Divider label="01 — Recommended Products" />
      </div>

      {categoryOrder.map(cat => {
        const items = (byCategory[cat.key] || []).slice(0, 5);
        const rakutenUrl = rakutenUrls[cat.key];
        return (
          <div key={cat.key} style={{ padding: '20px 0 0' }}>
            {/* カテゴリヘッダー */}
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginBottom: 12, padding: `0 ${px}`,
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em', fontWeight: 500, color: '#111' }}>
                {cat.key.toUpperCase()} · {cat.label}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.16em', color: '#B5B5B5' }}>
                STEP {cat.step}
              </span>
            </div>

            {/* 自社DBの厳選商品（小さめカード） */}
            {items.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 14,
                  width: 48, zIndex: 2, pointerEvents: 'none',
                  background: 'linear-gradient(to right, transparent, #fff)',
                }} />
                <div className="skinr-scroll" style={{
                  display: 'flex', gap: 10,
                  overflowX: 'auto',
                  padding: `0 ${px} 14px`,
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {items.map((p, idx) => (
                    <ResultProductCard
                      key={p.id}
                      product={p}
                      idx={idx}
                      onDetail={() => onOpenProduct(p.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 楽天商品（リアルタイム取得） */}
            <div style={{ padding: `0 ${px} 8px` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#BF0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 7, fontWeight: 700 }}>R</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.14em', color: '#999' }}>RAKUTEN</span>
              </div>
            </div>
            <RakutenSection concerns={concerns} category={cat.key} searchUrl={rakutenUrl} px={px} />

            <div style={{ height: 1, background: '#F0F0F0', margin: `8px ${px} 0` }} />
          </div>
        );
      })}

      {/* CTA */}
      <div style={{
        padding: `28px ${px} ${isDesktop ? '60px' : '64px'}`,
        borderTop: '1px solid #F0F0F0',
        marginTop: 8,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ fontSize: 11, color: '#B5B5B5', textAlign: 'center', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
          診断結果は成分ロジックに基づいています
        </div>
        <PrimaryButton full onClick={onNewChat} icon={<Icon name="sparkle" size={14} color="#fff" />}>
          もう一度絞り込む
        </PrimaryButton>
        <button
          onClick={onBack}
          className="skinr-tappable"
          style={{
            width: '100%', padding: '14px',
            background: 'none', border: '1px solid #DCDCDC',
            borderRadius: 4, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13,
            color: '#666', fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          商品一覧を見る
        </button>
      </div>
    </div>
  );
}
