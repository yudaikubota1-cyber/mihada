import React, { useState } from 'react';
import { PRODUCTS, CATEGORIES, CONCERN_CHIPS, SKIN_TYPE_FILTER_CHIPS } from '../data/products.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Chip, Divider, ProductCard,
} from '../components/shared.jsx';

export default function SkinrHome({ onStartChat, onOpenProduct, onSendInline, lastDiagnosis, onViewLastResult, homeFilter }) {
  const [cat, setCat] = useState(homeFilter?.cat || 'all');
  const [skinFilter, setSkinFilter] = useState(null); // 肌タイプ絞り込み
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  // 診断フィルター（結果画面の「すべて見る」から来た場合）
  const [activeFilterIds, setActiveFilterIds] = useState(homeFilter?.productIds || null);
  const activeFilterLabel = homeFilter?.label || null;

  const clearFilter = () => {
    setActiveFilterIds(null);
    setCat('all');
    setSkinFilter(null);
  };

  const filtered = PRODUCTS.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false;
    if (activeFilterIds && !activeFilterIds.includes(p.id)) return false;
    if (skinFilter && !p.forSkin.some(s => s.includes(skinFilter))) return false;
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

  return (
    <div className="skinr-scroll" style={{
      height: '100%', overflowY: 'auto', background: '#fff',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', justifyContent: 'center',
        padding: '14px 0',
        borderBottom: '1px solid #F0F0F0',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        <SkinrLogo size={15} />
      </div>

      {/* 前回の診断バナー */}
      {lastDiagnosis && (
        <button
          onClick={onViewLastResult}
          className="skinr-tappable"
          style={{
            width: '100%', background: 'none', border: 'none',
            borderBottom: '1px solid #F0F0F0',
            padding: '12px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left',
            animation: 'skinrFadeIn 0.4s ease both',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 4,
            background: '#F5F5F5',
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

      {/* Hero — AI chat invite */}
      <div style={{ padding: '40px 24px 24px' }}>
        <SkinrEyebrow>Ingredient Logic</SkinrEyebrow>
        <h1 style={{
          margin: '12px 0 10px',
          fontSize: 28,
          lineHeight: 1.25,
          fontWeight: 400,
          letterSpacing: '-0.03em',
        }}>
          「何が合うかわからない」<br />を終わりにする。
        </h1>
        <p style={{
          fontSize: 13, lineHeight: 1.6, color: '#777',
          margin: '0 0 20px',
        }}>
          悩みを入れるだけ。成分ロジックが一本に絞り込む。
        </p>

        {/* Inline chat starter */}
        <div style={{
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 24,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 16px 56px rgba(0,0,0,0.12)',
        }}>
          {/* Input zone */}
          <div style={{ padding: '18px 20px 12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                background: '#111', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="sparkle" size={9} color="#fff" />
              </div>
              <span style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.18em', color: '#ADADAD',
              }}>成分ロジック</span>
            </div>
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
                  e.preventDefault();
                  onSendInline(draft.trim());
                }
              }}
              placeholder={'今の肌の悩みを、そのまま教えてください…'}
              rows={1}
              style={{
                width: '100%',
                border: 'none', outline: 'none', resize: 'none',
                fontSize: 15, fontFamily: 'inherit', color: '#111',
                background: 'transparent',
                padding: '0', lineHeight: 1.7, overflowY: 'auto',
                minHeight: '26px',
              }}
            />
          </div>

          {/* Action bar */}
          <div style={{
            background: '#F7F7F7',
            borderTop: '1px solid #F0F0F0',
            padding: '10px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontSize: 10, color: '#C8C8C8',
              fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em',
            }}>
              {draft.trim() ? 'ENTER で送信' : 'SHIFT+ENTER で改行'}
            </span>
            <button
              onClick={() => { if (draft.trim()) onSendInline(draft.trim()); else onStartChat(); }}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                border: 'none',
                background: draft.trim() ? '#111' : '#E4E4E4',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
                flexShrink: 0,
                boxShadow: draft.trim() ? '0 4px 16px rgba(0,0,0,0.22)' : 'none',
              }}
            >
              <Icon name="arrowRight" size={16} color={draft.trim() ? '#fff' : '#BCBCBC'} />
            </button>
          </div>
        </div>

        {/* Quick replies — 悩み */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
          }}>
            <span style={{
              fontSize: 10, color: '#B5B5B5',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.18em', whiteSpace: 'nowrap',
            }}>
              悩みから選ぶ
            </span>
            <div style={{ flex: 1, height: 1, background: '#F0F0F0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {CONCERN_CHIPS.map((c, i) => (
              <ConcernChip key={c.label} chip={c} onSend={onSendInline} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Section break */}
      <div style={{ padding: '20px 24px 0' }}>
        <Divider label="商品を探す" />
      </div>

      {/* Self-search */}
      <div style={{ padding: '20px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                border: '1px solid #DCDCDC', background: '#fff',
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
      <div style={{ padding: '8px 24px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: searchFocused ? '#EFEFEF' : '#F4F4F4',
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
        padding: '4px 24px 4px',
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
        padding: '4px 24px 8px',
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
              border: '1px solid #DCDCDC', background: '#fff',
              fontSize: 10, color: '#888', cursor: 'pointer',
              fontFamily: 'inherit', flexShrink: 0,
            }}
          >
            <Icon name="close" size={8} color="#ABABAB" />
            解除
          </button>
        )}
      </div>

      {/* Product grid */}
      <div style={{
        padding: '16px 24px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px 14px',
      }}>
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onClick={() => onOpenProduct(p.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '48px 24px', textAlign: 'center', animation: 'skinrFadeIn 0.3s ease both' }}>
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
              border: '1px solid #DCDCDC', background: '#fff',
              fontSize: 12, fontFamily: 'inherit', fontWeight: 500, color: '#555',
              cursor: 'pointer',
            }}
          >
            フィルターをリセット
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #F0F0F0',
        padding: '40px 24px 60px',
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
        border: '1px solid ' + (pressed ? '#C8C8C8' : '#E8E8E8'),
        background: pressed ? '#F0F0F0' : '#FAFAFA',
        cursor: 'pointer',
        fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'all 0.12s ease',
        minHeight: 72,
        boxShadow: pressed ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
        animation: `skinrFadeIn 0.3s ${index * 0.04}s ease both`,
      }}
    >
      <span style={{
        fontSize: 8,
        fontFamily: 'JetBrains Mono, monospace',
        color: '#CBCBCB',
        letterSpacing: '0.08em',
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
