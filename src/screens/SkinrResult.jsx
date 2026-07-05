import React, { useState, useEffect, useCallback } from 'react';
import { PRODUCTS, storeUrlFor } from '../data/products.js';
import { INGREDIENT_DICT, INGREDIENT_EVIDENCE } from '../data/knowledge.js';
import { buildRakutenSearchUrl, buildProductUrl, searchRakutenProducts } from '../lib/rakuten.js';
import { generateShareImage, shareOrDownload } from '../lib/shareCard.js';
import {
  SkinrLogo, SkinrEyebrow, ProductImage, Icon,
  Divider, PrimaryButton, SiteFooter,
} from '../components/shared.jsx';

// AI診断の concerns からプロダクトを絞り込む簡易マッピング
const CONCERN_MAP = {
  '乾燥': ['乾燥', 'つっぱり', '保湿', 'バリア低下'],
  '毛穴の開き': ['毛穴', '黒ずみ'],
  '黒ずみ': ['毛穴', '黒ずみ'],
  'くすみ': ['くすみ', 'ハリ不足', '色ムラ'],
  'ブライトニング': ['くすみ', 'トーンアップ', 'シミ', 'ブライトニング'],
  'シミ': ['シミ', 'くすみ', '色素沈着'],
  '赤ニキビ': ['ニキビ', '赤み', '肌荒れ'],
  '白ニキビ': ['ニキビ', '赤み', '肌荒れ'],
  'ニキビ跡': ['ニキビ跡', '赤み', '色素沈着'],
  'たるみ': ['ハリ不足', 'たるみ', 'ツヤ', 'くすみ'],
  'シワ': ['シワ', 'ハリ不足', 'エイジング'],
  '皮脂': ['皮脂', 'テカリ', '毛穴'],
  '肌荒れ': ['肌荒れ', '赤み', 'バリア低下', '鎮静'],
  'バリア低下': ['バリア低下', '乾燥', '敏感'],
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

// 成分名 → エビデンス（INGREDIENT_EVIDENCE を部分一致で照合）
function lookupEvidence(name) {
  // 括弧内の別名も拾えるよう、コア部分でも突き合わせる
  const core = name.replace(/[（(].*?[）)]/g, '').trim();
  return INGREDIENT_EVIDENCE.find(e => {
    const en = e.name;
    const ecore = en.replace(/[（(].*?[）)]/g, '').trim();
    return en.includes(name) || name.includes(ecore) || ecore.includes(core) || core.includes(ecore);
  }) || null;
}

// 展開式（アコーディオン）成分行 — タップで成分エビデンスの要約を表示
function IngredientRow({ ing, index, isLast }) {
  const [open, setOpen] = React.useState(false);
  const ev = lookupEvidence(ing.name);
  return (
    <div style={{
      borderBottom: !isLast ? '1px solid var(--border)' : 'none',
      animation: `skinrFadeIn 0.3s ${0.08 + index * 0.07}s ease both`,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 0', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          letterSpacing: '0.14em', color: '#C8C8C8',
          minWidth: 20, flexShrink: 0,
        }}>{String(index + 1).padStart(2, '0')}</span>
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
        {/* 開閉インジケーター（＋ / −） */}
        <span style={{
          flexShrink: 0, width: 22, height: 22, borderRadius: '50%',
          border: '1px solid var(--border)', color: '#999',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, lineHeight: 1,
          transition: 'transform 0.2s ease', transform: open ? 'rotate(45deg)' : 'none',
        }}>＋</span>
      </button>

      {/* 展開部：成分エビデンスの要約 */}
      {open && (
        <div style={{
          padding: '2px 0 18px 34px',
          animation: 'skinrFadeIn 0.2s ease both',
        }}>
          {ev ? (
            <div style={{ background: 'var(--bg-soft)', borderRadius: 10, padding: '13px 15px' }}>
              <p style={{ margin: '0 0 10px', fontSize: 12.5, lineHeight: 1.75, color: '#444' }}>
                {ev.evidence}
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {ev.dose && (
                  <div>
                    <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', color: '#AAA', marginBottom: 2 }}>推奨濃度</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{ev.dose}</div>
                  </div>
                )}
                {ev.duration && (
                  <div>
                    <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', color: '#AAA', marginBottom: 2 }}>目安期間</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{ev.duration}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: '#999', lineHeight: 1.6 }}>
              {ing.name}（{ing.category}）— {ing.effect || 'スキンケアをサポートする成分です。'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ingredients フィールドが string[] か {name,effect}[] かを正規化する
function normalizeIngredients(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  if (typeof arr[0] === 'string') return arr;
  return arr.map(i => i.name || '').filter(Boolean);
}

// AIが未知のconcernを返した場合のファジーマッチ用
const FUZZY_CONCERN_MAP = {
  '赤ら顔': ['肌荒れ'], '赤み': ['肌荒れ', 'ニキビ'], 'そばかす': ['シミ'],
  'クレーター': ['ニキビ跡'], '凹凸': ['ニキビ跡'], '毛穴落ち': ['毛穴の開き', '皮脂'],
  '角質': ['くすみ', '毛穴の開き'], 'ゴワつき': ['くすみ'],
  'ゴルゴライン': ['たるみ'], 'マリオネットライン': ['たるみ'], '法令線': ['たるみ'],
  'ほうれい線': ['たるみ'], 'クマ': ['くすみ', 'たるみ'], '日焼け': ['シミ', '肌荒れ'],
  '小ジワ': ['シワ', '乾燥'], '脂漏': ['皮脂', '肌荒れ'],
  'アトピー': ['バリア低下', '乾燥'], '花粉': ['肌荒れ', 'バリア低下'],
  'エイジング': ['たるみ', 'シワ'], 'ハリ不足': ['たるみ'],
  'ニキビ': ['赤ニキビ'], 'テカリ': ['皮脂'], 'トーンアップ': ['ブライトニング'],
  '色素沈着': ['シミ', 'ニキビ跡'], '敏感': ['バリア低下', '肌荒れ'],
};

function resolveConcern(concern) {
  if (CONCERN_MAP[concern]) return concern;
  // ファジーマッチ: FUZZY_CONCERN_MAP → 部分一致
  if (FUZZY_CONCERN_MAP[concern]) return FUZZY_CONCERN_MAP[concern][0];
  for (const [key, mapped] of Object.entries(FUZZY_CONCERN_MAP)) {
    if (concern.includes(key) || key.includes(concern)) return mapped[0];
  }
  // 最終フォールバック: CONCERN_MAPのキーに部分一致
  for (const key of Object.keys(CONCERN_MAP)) {
    if (concern.includes(key) || key.includes(concern)) return key;
  }
  return concern;
}

function scoreProduct(product, concerns, skinType, ingredient) {
  let score = 0;
  for (const concern of concerns) {
    const resolved = resolveConcern(concern);
    const keywords = CONCERN_MAP[resolved] || [concern, resolved];
    for (const kw of keywords) {
      if (product.concerns.some(c => c.includes(kw) || kw.includes(c))) score += 2;
    }
  }
  const skinHaystack = [...(product.skinTypes || []), ...(product.forSkin || [])];
  if (skinType && skinHaystack.some(s => s === skinType || skinType.includes(s.replace('肌', '')))) score += 1;
  // 成分名検索（#2 軽量案）: 指定成分を含む商品を強めに加点して上位に
  if (ingredient) {
    const core = ingredient.replace(/[（(].*?[）)]/g, '').trim();
    const hay = [...(product.ingredients || []), ...(product.tags || [])];
    if (hay.some(x => typeof x === 'string' && (x.includes(core) || core.includes(x)))) score += 4;
  }
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
        flex: '0 0 150px',
        scrollSnapAlign: 'start',
        display: 'flex', flexDirection: 'column',
        textDecoration: 'none', color: 'inherit',
      }}
    >
      {/* 画像（1:1 正方形・全カテゴリ共通サイズ） */}
      <div style={{
        width: 150, height: 150, borderRadius: 10, overflow: 'hidden',
        background: '#F8F8F8', marginBottom: 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8%' }}
          />
        ) : (
          <span style={{ fontSize: 11, color: '#C0C0C0', fontFamily: 'JetBrains Mono, monospace' }}>R</span>
        )}
        {/* 楽天バッジ */}
        <div style={{
          position: 'absolute', top: 5, right: 5,
          width: 16, height: 16, borderRadius: '50%',
          background: '#111111',
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

      {/* 商品名（1行固定・省略記号でカード高さ統一） */}
      <div style={{
        fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: '#111',
        marginBottom: 4,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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
      <div style={{ display: 'flex', gap: 16, padding: `0 ${px} 14px` }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            flex: '0 0 150px', height: 150, borderRadius: 10,
            background: 'linear-gradient(90deg, var(--bg-soft) 25%, var(--bg-warm) 50%, var(--bg-soft) 75%)',
            backgroundSize: '200% 100%',
            animation: 'skinrLoadBar 1.3s ease infinite',
          }} />
        ))}
      </div>
    );
  }

  // 0件時は独立行を出さない（検索導線はセクションタイトル右端の「楽天で探す」に集約）
  if (items.length === 0) return null;

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 14,
        width: 48, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, transparent, #fff)',
      }} />
      <div className="skinr-scroll skinr-snap-x" style={{
        display: 'flex', gap: 16,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
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
            flex: '0 0 100px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, height: 150, alignSelf: 'flex-start',
            border: '1px solid #E8E8E8', borderRadius: 10,
            background: 'var(--bg-soft)', textDecoration: 'none',
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
      onClick={onDetail}
      style={{ flex: '0 0 150px', cursor: 'pointer', scrollSnapAlign: 'start' }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* 画像（1:1 正方形・全カテゴリ共通サイズ） */}
      <div
        style={{
          width: 150, height: 150, borderRadius: 10, overflow: 'hidden',
          background: '#F8F8F8',
          marginBottom: 10, position: 'relative',
          boxShadow: pressed ? '0 2px 8px rgba(0,0,0,0.07)' : '0 4px 16px rgba(0,0,0,0.10)',
          transform: pressed ? 'scale(0.96)' : 'scale(1)',
          transition: 'all 0.15s ease',
        }}
      >
        {p.image && !imgError ? (
          <img
            src={p.image}
            alt={p.nameJa}
            loading="lazy"
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

      {/* テキスト情報（商品名は1行固定・省略記号で高さ統一） */}
      <div style={{ padding: '0 2px' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, letterSpacing: '0.14em', color: '#C0C0C0', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.brand}
        </div>
        <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, color: '#111', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.nameJa}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#111', marginBottom: 8 }}>
          {p.price}
        </div>
      </div>

      {/* 購入ボタン（1つのみ・黒背景白文字）。カード全体タップは詳細へ遷移。
          url未設定でも公式ショップ導線にフォールバック（死に表示「準備中」は使わない） */}
      <a
        href={storeUrlFor(p)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 0',
          background: '#111111', color: '#fff',
          border: 'none', borderRadius: 6,
          fontSize: 10, fontFamily: 'inherit', fontWeight: 600,
          cursor: 'pointer', letterSpacing: '0.04em',
          textDecoration: 'none',
        }}
      >
        {p.url ? '購入' : '商品ページを探す'}
      </a>
    </div>
  );
}

// ── スロット絞り込み用ヘルパー ─────────────────────────────
// カテゴリ表記（ラベル/同義語）→ 内部カテゴリID
// 注: このDBではクレンジング/洗顔はいずれも category="cleanser" に格納されている
// （"cleansing" idは実データが無い）ため、両方 cleanser に解決する。
const CATEGORY_LABEL_TO_ID = [
  [['クレンジング', 'クレンジングオイル', 'クレンジングバーム', 'メイク落とし', '洗顔', '洗顔料', '洗顔フォーム', 'フォームクレンザー', 'クレンザー'], 'cleanser'],
  [['トナー', '化粧水', 'スキンブースター', '導入'], 'toner'],
  [['パッド', 'トナーパッド', '拭き取り'], 'pad'],
  [['美容液', 'セラム', 'アンプル', 'エッセンス'], 'serum'],
  [['クリーム', '乳液', 'モイスチャライザー', 'ジェル'], 'cream'],
  [['マスク', 'シートマスク', 'パック'], 'mask'],
  [['日焼け止め', 'UV', 'サンスクリーン', 'サンクリーム', 'サンセラム'], 'sunscreen'],
];
function resolveCategoryId(label) {
  if (!label) return null;
  for (const [names, id] of CATEGORY_LABEL_TO_ID) {
    if (names.some(n => label.includes(n) || n.includes(label))) return id;
  }
  return null;
}
// "¥2,970" / "¥32,000~" → 2970 / 32000
function parsePrice(price) {
  if (typeof price !== 'string') return NaN;
  const digits = price.replace(/[^\d]/g, '');
  return digits ? Number(digits) : NaN;
}
// 商品が指定成分を含むか（ingredients / tags を照合）
function productHasIngredient(product, ingredient) {
  const core = ingredient.replace(/[（(].*?[）)]/g, '').trim();
  const hay = [...(product.ingredients || []), ...(product.tags || [])];
  return hay.some(x => typeof x === 'string' && (x.includes(core) || core.includes(x)));
}
// ブランド名の緩い一致
function productMatchesBrand(product, brand) {
  const a = (product.brand || '').toLowerCase().replace(/\s/g, '');
  const b = brand.toLowerCase().replace(/\s/g, '');
  return a === b || a.includes(b) || b.includes(a);
}

export default function SkinrResult({ isDesktop, diagnosis, onBack, onOpenProduct, onNewChat, onViewCategory, onViewAll }) {
  // ── スロット抽出 ──
  const searchIngredient = diagnosis?.ingredient || null;
  const searchBrand      = diagnosis?.brand || null;
  const searchCategoryId = resolveCategoryId(diagnosis?.category);
  const maxPrice         = (diagnosis?.max_price != null && diagnosis?.max_price !== '') ? Number(diagnosis.max_price) : null;
  const hasSlotFilter    = !!(searchIngredient || searchBrand || searchCategoryId || (maxPrice != null && !isNaN(maxPrice)));

  const skinType = diagnosis?.skin_type || '混合肌';
  // 決定的スロットがある場合は無関係なデフォルト悩みを注入しない
  const concerns = (diagnosis?.concerns && diagnosis.concerns.length)
    ? diagnosis.concerns
    : (hasSlotFilter ? [] : ['乾燥', '毛穴の開き', 'くすみ']);
  const aiMessage = diagnosis?.message;
  const [sharing, setSharing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('all');
  // カテゴリごとの「その場で展開」状態（SEE MORE でインライン展開／再タップで折りたたみ）
  const [expandedCats, setExpandedCats] = useState({});
  const toggleExpand = (key) => setExpandedCats(s => ({ ...s, [key]: !s[key] }));

  // ── 全スロットを AND 条件でハード絞り込み ──
  const pool = PRODUCTS.filter(p => {
    if (searchBrand && !productMatchesBrand(p, searchBrand)) return false;
    if (searchIngredient && !productHasIngredient(p, searchIngredient)) return false;
    if (searchCategoryId && p.category !== searchCategoryId) return false;
    if (maxPrice != null && !isNaN(maxPrice)) {
      const pr = parsePrice(p.price);
      if (isNaN(pr) || pr > maxPrice) return false;
    }
    return true;
  });

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const FULL_CATEGORY_ORDER = [
    { key: 'cleansing', label: 'クレンジング', step: '00' },
    { key: 'cleanser',  label: '洗顔',         step: '01' },
    { key: 'toner',     label: 'トナー',       step: '02' },
    { key: 'pad',       label: 'トナーパッド', step: '03' },
    { key: 'serum',     label: '美容液',       step: '04' },
    { key: 'cream',     label: 'クリーム',     step: '05' },
    { key: 'mask',      label: 'マスク',       step: '06' },
    { key: 'sunscreen', label: '日焼け止め',   step: '07' },
  ];

  const byCategory = Object.fromEntries(
    FULL_CATEGORY_ORDER.map(cat => [
      cat.key,
      pool.filter(p => p.category === cat.key)
        .sort((a, b) => scoreProduct(b, concerns, skinType, searchIngredient) - scoreProduct(a, concerns, skinType, searchIngredient)),
    ])
  );

  const categoryOrder = FULL_CATEGORY_ORDER.filter(cat => (byCategory[cat.key] || []).length > 0);

  // カテゴリフィルター用の短縮ラベル
  const FILTER_LABELS = {
    cleansing: 'クレンジング', cleanser: '洗顔', toner: 'トナー', pad: 'パッド',
    serum: '美容液', cream: 'クリーム', mask: 'マスク', sunscreen: 'UV',
  };
  // 「すべて」選択時は全カテゴリ、それ以外は該当カテゴリのみ表示
  const visibleCategories = selectedCat === 'all'
    ? categoryOrder
    : categoryOrder.filter(cat => cat.key === selectedCat);

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

  const rakutenUrls = Object.fromEntries(
    categoryOrder.map(cat => [cat.key, buildRakutenSearchUrl({ concerns, category: cat.key })])
  );

  const px = isDesktop ? '40px' : '24px';

  return (
    <div className={`skinr-scroll${isDesktop ? ' skinr-page' : ''}`} style={{
      height: isDesktop ? 'auto' : '100%',
      overflowY: isDesktop ? 'visible' : 'auto',
      background: 'var(--bg)',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        position: isDesktop ? 'static' : 'sticky',
        top: 0, background: 'var(--bg)', zIndex: 5,
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

        {/* タップで成分の説明が開くヒント */}
        <div style={{
          fontSize: 11, color: '#AAA', marginTop: 20, marginBottom: 2,
          display: 'flex', alignItems: 'center', gap: 5,
          animation: 'skinrFadeIn 0.35s 0.25s ease both',
        }}>
          <span style={{ fontSize: 12 }}>＋</span> 成分名をタップすると、根拠と使い方が見られます
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
          {ingredients.map((ing, i) => (
            <IngredientRow
              key={ing.name}
              ing={ing}
              index={i}
              isLast={i === ingredients.length - 1}
            />
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 20, flexWrap: 'wrap',
          animation: 'skinrFadeIn 0.35s 0.3s ease both',
        }}>
          {diagnosis?.skin_type && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              letterSpacing: '0.14em', color: '#B8B8B8',
              border: '1px solid #EBEBEB', padding: '3px 8px', borderRadius: 999,
            }}>{skinType}</span>
          )}
          {/* スロット絞り込みチップ（成分・ブランド・カテゴリ・予算）= 黒 */}
          {[searchBrand, searchIngredient, diagnosis?.category,
            (maxPrice != null && !isNaN(maxPrice)) ? `〜¥${maxPrice.toLocaleString()}` : null]
            .filter(Boolean).map(s => (
              <span key={s} style={{
                padding: '3px 9px', borderRadius: 999,
                background: '#111', color: '#fff', fontSize: 11, fontWeight: 600,
              }}>{s}</span>
          ))}
          {concerns.map(c => (
            <span key={c} style={{
              padding: '3px 9px', borderRadius: 999,
              border: '1px solid var(--border)', fontSize: 11, color: '#555', fontWeight: 500,
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


      {/* Products */}
      <div style={{ padding: `4px ${px} 0` }}>
        <Divider label="01 — Recommended Products" />
      </div>

      {/* カテゴリフィルター（sticky） */}
      <div
        className="skinr-scroll"
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'var(--bg)',
          display: 'flex', gap: 6,
          overflowX: 'auto',
          padding: `10px ${px}`,
          borderBottom: '1px solid var(--border)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* 該当商品0件のタブは非表示。選べるタブ（＋すべて）だけを表示する */}
        {[{ key: 'all', label: 'すべて' }, ...categoryOrder.map(c => ({ key: c.key, label: FILTER_LABELS[c.key] || c.label }))].map(f => {
          const active = selectedCat === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setSelectedCat(f.key)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                minHeight: 36,
                borderRadius: 2,
                fontSize: 12,
                fontFamily: 'inherit',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: active ? '1px solid #111' : '1px solid #DDD',
                background: active ? '#111' : '#fff',
                color: active ? '#fff' : '#555',
                transition: 'all 0.12s ease',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 0件フォールバック（スロット絞り込みで該当なし） */}
      {categoryOrder.length === 0 && (
        <div style={{ padding: `48px ${px}`, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 8 }}>
            条件に合う商品が見つかりませんでした
          </div>
          <p style={{ fontSize: 13, color: '#999', lineHeight: 1.7, margin: '0 0 20px' }}>
            条件を少し広げるか、別の言葉でもう一度教えてください。
          </p>
          <button
            onClick={onNewChat}
            style={{
              padding: '12px 24px', borderRadius: 8, border: 'none',
              background: '#111', color: '#fff', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            条件を変えて相談する
          </button>
        </div>
      )}

      {visibleCategories.map(cat => {
        const allInCat = byCategory[cat.key] || [];
        const expanded = !!expandedCats[cat.key];
        const items = expanded ? allInCat : allInCat.slice(0, 5); // 展開時は全件、通常は5件
        const hasMore = allInCat.length > 5; // 6件以上ある時だけ SEE MORE / 閉じる を出す
        const rakutenUrl = rakutenUrls[cat.key];
        return (
          <div key={cat.key} style={{ padding: '20px 0 0' }}>
            {/* カテゴリヘッダー（タイトル右端に「楽天で探す」を小さく配置） */}
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              marginBottom: 12, padding: `0 ${px}`, gap: 10,
            }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.18em', fontWeight: 500, color: '#111' }}>
                {cat.key.toUpperCase()} · {cat.label}
              </span>
              <a
                href={rakutenUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
                  fontSize: 10, color: '#999', textDecoration: 'none', fontWeight: 500,
                  letterSpacing: '0.04em',
                }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: '50%', background: '#111',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 7, fontWeight: 700,
                }}>R</span>
                楽天で探す
                <Icon name="arrowRight" size={11} color="#BBB" />
              </a>
            </div>

            {/* 自社DBの厳選商品（小さめカード） */}
            {items.length > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 14,
                  width: 48, zIndex: 2, pointerEvents: 'none',
                  background: 'linear-gradient(to right, transparent, #fff)',
                }} />
                <div className="skinr-scroll skinr-snap-x" style={{
                  display: 'flex', gap: 16,
                  overflowX: 'auto',
                  scrollSnapType: 'x mandatory',
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
                  {/* SEE MORE / 閉じる — 画面遷移せず、その場でインライン展開・折りたたみ */}
                  {hasMore && (
                    <button
                      onClick={() => toggleExpand(cat.key)}
                      style={{
                        flex: '0 0 100px',
                        height: 150, alignSelf: 'flex-start',
                        border: '1px dashed #D8D8D8', borderRadius: 10,
                        background: 'var(--bg-soft)', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontFamily: 'inherit',
                      }}
                    >
                      <span style={{ fontSize: 20, color: '#999', lineHeight: 1 }}>{expanded ? '×' : '＋'}</span>
                      <span style={{ fontSize: 9, color: '#999', textAlign: 'center', lineHeight: 1.5, letterSpacing: '0.04em' }}>
                        {expanded ? '閉じる' : <>SEE<br />MORE<br />(+{allInCat.length - 5})</>}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 楽天商品（リアルタイム取得） */}
            <div style={{ padding: `0 ${px} 8px` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        borderTop: '1px solid var(--border)',
        marginTop: 8,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ fontSize: 11, color: '#B5B5B5', textAlign: 'center', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
          提案は成分ロジックに基づいています
        </div>

        {/* シェアボタン */}
        <button
          onClick={async () => {
            setSharing(true);
            try {
              const canvas = await generateShareImage({
                skinType,
                concerns,
                ingredients: ingredients.map(i => ({ name: i.name, category: i.category })),
                message: aiMessage,
              });
              await shareOrDownload(canvas);
            } catch (e) { /* シェア生成失敗時は無視 */ }
            setSharing(false);
          }}
          disabled={sharing}
          className="skinr-tappable"
          style={{
            width: '100%', padding: '14px',
            background: '#1A1814', color: '#fff',
            border: 'none', borderRadius: 4,
            cursor: sharing ? 'default' : 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            letterSpacing: '0.02em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: sharing ? 0.6 : 1,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {sharing ? '生成中...' : '提案結果をシェア'}
        </button>

        <PrimaryButton full onClick={onNewChat} icon={<Icon name="sparkle" size={14} color="#fff" />}>
          もう一度絞り込む
        </PrimaryButton>
        <button
          onClick={onBack}
          className="skinr-tappable"
          style={{
            width: '100%', padding: '14px',
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 4, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13,
            color: '#666', fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          商品一覧を見る
        </button>
      </div>
      <SiteFooter />
    </div>
  );
}
