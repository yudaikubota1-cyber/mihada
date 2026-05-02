import React from 'react';
import { PRODUCTS } from '../data/products.js';
import { buildRakutenSearchUrl } from '../lib/rakuten.js';
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

// 成分名から機能カテゴリを引く
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
  return '有効成分';
}

// concerns + 肌タイプ両方でスコアリング
function scoreProduct(product, concerns, skinType) {
  let score = 0;
  for (const concern of concerns) {
    const keywords = CONCERN_MAP[concern] || [concern];
    for (const kw of keywords) {
      if (product.concerns.some(c => c.includes(kw) || kw.includes(c))) score += 2;
    }
  }
  // 肌タイプ一致でボーナス
  if (skinType && product.forSkin.some(s => s === skinType || skinType.includes(s.replace('肌', '')))) score += 1;
  return score;
}

export default function SkinrResult({ diagnosis, onBack, onOpenProduct, onNewChat, onViewCategory }) {
  // diagnosisはAIが返した { skin_type, concerns, message }
  const skinType = diagnosis?.skin_type || '混合肌';
  const concerns = diagnosis?.concerns || ['乾燥', '毛穴の開き', 'くすみ'];
  const aiMessage = diagnosis?.message;

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // カテゴリ別おすすめ商品（concerns + 肌タイプ両方でスコアリング）
  const byCategory = {
    cleanser: PRODUCTS.filter(p => p.category === 'cleanser').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
    toner: PRODUCTS.filter(p => p.category === 'toner').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
    serum:  PRODUCTS.filter(p => p.category === 'serum').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
    cream:  PRODUCTS.filter(p => p.category === 'cream').sort((a, b) => scoreProduct(b, concerns, skinType) - scoreProduct(a, concerns, skinType)),
  };

  const categoryOrder = [
    { key: 'cleanser', label: '洗顔', step: '00' },
    { key: 'toner', label: 'トナー', step: '01' },
    { key: 'serum',  label: '美容液', step: '02' },
    { key: 'cream',  label: 'クリーム', step: '03' },
  ];

  // 推奨成分をトップ商品の実際の成分リストから導出
  const topProducts = categoryOrder.map(cat => (byCategory[cat.key] || [])[0]).filter(Boolean);
  const ingredients = topProducts
    .flatMap(p => p.ingredients.slice(0, 2).map(ing => ({
      name: ing.name,
      effect: ing.effect,
      category: getIngCategory(ing.name),
    })))
    .filter((ing, i, arr) => arr.findIndex(x => x.name === ing.name) === i)
    .slice(0, 5);

  // 推奨商品から goodWith / avoidWith を集約・重複排除
  const comboGood = [...new Set(topProducts.flatMap(p => p.goodWith || []))].slice(0, 5);
  const comboAvoid = [...new Set(topProducts.flatMap(p => p.avoidWith || []))].slice(0, 4);

  // カテゴリ別の楽天検索URL（アフィリエイトリンク）
  const rakutenUrls = Object.fromEntries(
    categoryOrder.map(cat => [cat.key, buildRakutenSearchUrl({ concerns, category: cat.key })])
  );

  return (
    <div className="skinr-scroll" style={{ height: '100%', overflowY: 'auto', background: '#fff' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #F0F0F0',
        position: 'sticky', top: 0, background: '#fff', zIndex: 5,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="arrowLeft" size={20} />
        </button>
        <SkinrLogo size={13} />
        <div style={{ width: 32 }} />
      </div>

      {/* Hero — 成分リストをそのままメインビジュアルに */}
      <div style={{ padding: '40px 24px 8px' }}>
        <SkinrEyebrow>Result · {dateStr}</SkinrEyebrow>

        {/* 見出し */}
        <h1 style={{
          margin: '14px 0 0',
          fontSize: 26, fontWeight: 400, lineHeight: 1.3,
          letterSpacing: '-0.02em',
          animation: 'skinrFadeIn 0.4s ease both',
        }}>
          あなたの肌に必要な<br />
          <span style={{ fontWeight: 700 }}>成分、{ingredients.length}つ。</span>
        </h1>

        {/* 成分リスト — ヒーロー本体 */}
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

        {/* 肌タイプ・悩みタグ（セカンダリ） */}
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

        {/* AIメッセージ */}
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
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{
            border: '1px solid #EBEBEB',
            borderRadius: 8,
            overflow: 'hidden',
          }}>

            {/* ヘッダー */}
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid #F0F0F0',
              background: '#FAFAFA',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9, letterSpacing: '0.18em', color: '#ABABAB',
              }}>PAIRING GUIDE</span>
            </div>

            {/* ◎ 合わせると効果的 */}
            {comboGood.length > 0 && (
              <div style={{
                padding: '14px 16px',
                borderBottom: comboAvoid.length > 0 ? '1px solid #F0F0F0' : 'none',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#111',
                    letterSpacing: '0.01em',
                  }}>一緒に使うと効果的</span>
                  <span style={{
                    fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                    color: '#fff', background: '#111',
                    padding: '2px 6px', borderRadius: 2, letterSpacing: '0.08em',
                  }}>◎</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {comboGood.map(g => (
                    <span key={g} style={{
                      padding: '5px 11px', borderRadius: 999,
                      border: '1px solid #DCDCDC', background: '#fff',
                      fontSize: 11, color: '#333', fontWeight: 500,
                    }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* △ 使うタイミングに注意 */}
            {comboAvoid.length > 0 && (
              <div style={{ padding: '14px 16px', background: '#FAFAFA' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#555',
                    letterSpacing: '0.01em',
                  }}>使うタイミングに注意</span>
                  <span style={{
                    fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                    color: '#888', border: '1px solid #D8D8D8',
                    padding: '2px 6px', borderRadius: 2, letterSpacing: '0.08em',
                  }}>△</span>
                </div>
                <p style={{
                  margin: '0 0 10px', fontSize: 11, color: '#999', lineHeight: 1.6,
                }}>
                  朝・夜で分けるか、日を変えるなど時間差での使用がおすすめ
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {comboAvoid.map(a => (
                    <span key={a} style={{
                      padding: '5px 11px', borderRadius: 999,
                      border: '1px dashed #D0D0D0', background: '#fff',
                      fontSize: 11, color: '#888',
                    }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ padding: '4px 24px 0' }}>
        <Divider label="01 — Recommended Products" />
      </div>

      {categoryOrder.map(cat => {
        const items = byCategory[cat.key] || [];
        const rakutenUrl = rakutenUrls[cat.key];
        return (
          <div key={cat.key} style={{ padding: '20px 0 8px' }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginBottom: 12, padding: '0 24px',
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                letterSpacing: '0.18em', fontWeight: 500, color: '#111',
              }}>
                {cat.key.toUpperCase()} · {cat.label}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                letterSpacing: '0.16em', color: '#B5B5B5',
              }}>
                STEP {cat.step}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 14,
                width: 48, zIndex: 2, pointerEvents: 'none',
                background: 'linear-gradient(to right, transparent, #fff)',
              }} />
              <div className="skinr-scroll" style={{
                display: 'flex', gap: 10,
                overflowX: 'auto',
                padding: '0 24px 14px',
                WebkitOverflowScrolling: 'touch',
              }}>
                {items.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => onOpenProduct(p.id)}
                    className="skinr-tappable"
                    style={{ flex: '0 0 120px', cursor: 'pointer' }}
                  >
                    <div style={{ width: 120, height: 120, overflow: 'hidden', borderRadius: 8, marginBottom: 8, position: 'relative' }}>
                      <div style={{ transform: `scale(${120 / 140})`, transformOrigin: 'top left', width: 140, height: 168 }}>
                        <ProductImage product={p} size="md" label={false} />
                      </div>
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute', top: 6, left: 6,
                          background: '#111', color: '#fff',
                          fontSize: 8, fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.12em', padding: '3px 6px', borderRadius: 2,
                        }}>BEST MATCH</div>
                      )}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, letterSpacing: '0.18em', color: '#B5B5B5', marginBottom: 3 }}>{p.brand}</div>
                    <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: '#111', marginBottom: 4 }}>{p.nameJa}</div>
                    <div style={{ fontSize: 10, color: '#7A7A7A' }}>{p.tags.slice(0, 2).join('・')}</div>
                  </div>
                ))}
                {/* 楽天で探すボタン */}
                <a
                  href={rakutenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: '0 0 100px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 6, height: 120, alignSelf: 'flex-start',
                    border: '1px solid #E8E8E8', borderRadius: 8,
                    background: '#FAFAFA', textDecoration: 'none',
                    padding: 12,
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#BF0000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>R</span>
                  </div>
                  <div style={{
                    fontSize: 10, color: '#777',
                    textAlign: 'center', lineHeight: 1.5, fontWeight: 500,
                  }}>楽天で<br />探す</div>
                </a>
              </div>
            </div>
            <div style={{ height: 1, background: '#F0F0F0', margin: '0 24px' }} />
          </div>
        );
      })}

      {/* CTA */}
      <div style={{
        padding: '28px 24px 64px',
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

