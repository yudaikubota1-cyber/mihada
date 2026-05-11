import React, { useState } from 'react';

/* ── モックデータ ───────────────────────────────────── */
const MOCK = [
  { id:1, brand:'ANUA', name:'ドクダミ77%鎮静マスク', category:'マスク', price:'¥2,178', score:4.7, count:'654件', ing:['ドクダミ77%','シカ','パンテノール'], concern:'ニキビ・赤み', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/anuajapan/cabinet/anua00010/11089069/imgrc0120425837.jpg?_ex=400x400' },
  { id:2, brand:'ANUA', name:'桃70%ナイアシンセラム', category:'美容液', price:'¥3,190', score:4.6, count:'372件', ing:['白桃エキス70%','ナイアシンアミド5%','セラミド'], concern:'くすみ・シミ', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/anuajapan/cabinet/anua00076/11089147/imgrc0120426044.jpg?_ex=400x400' },
  { id:3, brand:'ANUA', name:'3セラミドバリアクリーム', category:'クリーム', price:'¥2,970', score:4.6, count:'312件', ing:['3種セラミド','パンテノール','ナイアシンアミド'], concern:'乾燥・保湿', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/anuajapan/cabinet/11452587/imgrc0122273036.jpg?_ex=400x400' },
  { id:4, brand:'ANUA', name:'ダークスポットセラム', category:'美容液', price:'¥3,080', score:4.6, count:'428件', ing:['ナイアシンアミド','アルファアルブチン','ビタミンC誘導体'], concern:'くすみ・シミ', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/anuajapan/cabinet/10467510/11810334/darkspot_202505.jpg?_ex=400x400' },
  { id:5, brand:'Numbuzin', name:'No.3 スキングラスエッセンス', category:'美容液', price:'¥3,520', score:4.5, count:'256件', ing:['ナイアシンアミド','ビタミンC誘導体','グルタチオン'], concern:'くすみ・シミ', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/numbuzin/cabinet/08182394/08275638/imgrc0140276544.jpg?_ex=400x400' },
  { id:6, brand:'Numbuzin', name:'No.5 白玉グルタチオンC美容液', category:'美容液', price:'¥4,180', score:4.5, count:'198件', ing:['グルタチオン','ナイアシンアミド5万ppm','トラネキサム酸'], concern:'くすみ・シミ', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/numbuzin/cabinet/08182394/10065445/imgrc0140276199.jpg?_ex=400x400' },
  { id:7, brand:'MEDICUBE', name:'PDRNピンクアンプル', category:'美容液', price:'¥5,500', score:4.4, count:'342件', ing:['PDRN10,000ppm','ペプチド','ヒアルロン酸'], concern:'たるみ・ハリ', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/medicube/cabinet/10000012/imgrc0139432123.jpg?_ex=400x400' },
  { id:8, brand:'MEDICUBE', name:'ゼロ毛穴1DAYセラム', category:'美容液', price:'¥3,960', score:4.4, count:'267件', ing:['AHA1%+BHA0.2%+PHA14%','スクワラン'], concern:'毛穴・黒ずみ', timing:'夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/medicube/cabinet/10000019/imgrc0100543756.jpg?_ex=400x400' },
  { id:9, brand:'COSRX', name:'アドバンスドスネイルセラム', category:'美容液', price:'¥3,300', score:4.6, count:'891件', ing:['スネイル分泌フィルトレート96%','ヒアルロン酸'], concern:'乾燥・保湿', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/cosrx/cabinet/02851882/imgrc0076855095.jpg?_ex=400x400' },
  { id:10, brand:'Torriden', name:'ダイブイン セラム', category:'美容液', price:'¥3,850', score:4.5, count:'445件', ing:['5種ヒアルロン酸','ペプチド複合体'], concern:'乾燥・保湿', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/torriden/cabinet/10000003/imgrc0102256154.jpg?_ex=400x400' },
  { id:11, brand:'Beauty of Joseon', name:'グロウウォータリーサンスクリーン', category:'日焼け止め', price:'¥2,640', score:4.6, count:'523件', ing:['ライスブランエキス','ナイアシンアミド','SPF50+'], concern:'くすみ・シミ', timing:'朝', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/beautyofjoseon-japan/cabinet/10000001/imgrc0108481597.jpg?_ex=400x400' },
  { id:12, brand:'キュレル', name:'潤浸保湿フェイスクリーム', category:'クリーム', price:'¥1,980', score:4.5, count:'1,204件', ing:['セラミド機能成分','インターセプター'], concern:'乾燥・保湿', timing:'朝夜', img:'https://thumbnail.image.rakuten.co.jp/@0_mall/curael/cabinet/m/imgrc0063555213.jpg?_ex=400x400' },
];

const CONCERNS = ['乾燥・保湿','毛穴・黒ずみ','ニキビ・赤み','くすみ・シミ','たるみ・ハリ'];
const BRANDS = [...new Set(MOCK.map(p => p.brand))];
const G = '#1DAB6A';

/* ── 共通パーツ ─────────────────────────────────────── */
function Stars({ score }) {
  return <span style={{ color: '#F5A623', fontSize: 11 }}>★ {score}</span>;
}

function Pill({ text, accent }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 99,
      fontSize: 10, background: accent ? `rgba(29,171,106,0.10)` : '#F5F0EC',
      color: accent ? G : '#888', border: accent ? `1px solid rgba(29,171,106,0.2)` : 'none',
      fontWeight: accent ? 600 : 400, whiteSpace: 'nowrap',
    }}>{text}</span>
  );
}

/* 縦型カード（各案で共通使用） */
function VCard({ p, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <div style={{
      borderRadius: sm ? 12 : 16, overflow: 'hidden',
      background: '#fff', border: '1px solid #EDE8E2',
      boxShadow: '0 2px 12px rgba(80,60,40,0.06)',
      cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(80,60,40,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(80,60,40,0.06)'; }}
    >
      <div style={{ aspectRatio: '1/1', background: '#F5F0EC', overflow: 'hidden' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ padding: sm ? '10px 12px' : '14px 16px' }}>
        <div style={{ fontSize: 9, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 4 }}>{p.brand}</div>
        <div style={{ fontSize: sm ? 11 : 12, fontWeight: 500, color: '#1A1814', lineHeight: 1.4, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
        {!sm && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {p.ing.slice(0, 2).map(i => <Pill key={i} text={i} />)}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: sm ? 12 : 13, fontWeight: 700, letterSpacing: '-0.02em' }}>{p.price}</span>
          <Stars score={p.score} />
        </div>
      </div>
    </div>
  );
}

/* 横型カード */
function HCard({ p }) {
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 0',
      borderBottom: '1px solid #EDE8E2', cursor: 'pointer',
    }}>
      <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F5F0EC' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{p.brand}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1814', lineHeight: 1.4, marginTop: 2, marginBottom: 6 }}>{p.name}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {p.ing.slice(0, 2).map(i => <Pill key={i} text={i} />)}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{p.price}</span>
          <Stars score={p.score} />
          <span style={{ fontSize: 10, color: '#C5C5C5' }}>{p.count}</span>
        </div>
      </div>
    </div>
  );
}

/* ══ 案A: Netflix行スクロール（ブランド別） ══════════════════ */
function LayoutA() {
  return (
    <div style={{ background: '#FFFEFB' }}>
      <div style={{ padding: '20px 20px 4px', borderBottom: '1px solid #EDE8E2' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5' }}>商品を探す</div>
      </div>
      {BRANDS.map(brand => {
        const prods = MOCK.filter(p => p.brand === brand);
        return (
          <div key={brand} style={{ marginBottom: 4 }}>
            <div style={{ padding: '18px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1814' }}>{brand}</span>
                <span style={{ fontSize: 10, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace' }}>{prods.length} ITEMS</span>
              </div>
              <span style={{ fontSize: 11, color: G, fontWeight: 500 }}>もっと見る →</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 18px', scrollbarWidth: 'none' }}>
              {prods.map(p => (
                <div key={p.id} style={{ width: 148, flexShrink: 0 }}>
                  <VCard p={p} size="sm" />
                </div>
              ))}
            </div>
            <div style={{ margin: '0 20px', height: 1, background: '#EDE8E2' }} />
          </div>
        );
      })}
    </div>
  );
}

/* ══ 案B: 悩み別キュレーション ══════════════════════════════ */
function LayoutB() {
  const CONCERN_ICONS = { '乾燥・保湿':'💧', '毛穴・黒ずみ':'🔬', 'ニキビ・赤み':'🌸', 'くすみ・シミ':'☀️', 'たるみ・ハリ':'⚡' };
  return (
    <div style={{ background: '#FFFEFB' }}>
      <div style={{ padding: '20px 20px 4px' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5', marginBottom: 4 }}>悩み別おすすめ</div>
        <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>お悩みから選ぶと、ぴったりの商品が見つかります</div>
      </div>
      {CONCERNS.map(concern => {
        const prods = MOCK.filter(p => p.concern === concern);
        if (!prods.length) return null;
        return (
          <div key={concern} style={{ marginTop: 20 }}>
            <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{CONCERN_ICONS[concern]}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1814' }}>{concern}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px 4px', scrollbarWidth: 'none' }}>
              {prods.map(p => (
                <div key={p.id} style={{ width: 160, flexShrink: 0 }}>
                  <VCard p={p} size="sm" />
                </div>
              ))}
            </div>
            <div style={{ margin: '16px 20px 0', height: 1, background: '#EDE8E2' }} />
          </div>
        );
      })}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ══ 案C: ランキング形式（1〜10位） ══════════════════════════ */
function LayoutC() {
  const ranked = [...MOCK].sort((a, b) => b.score - a.score).slice(0, 10);
  return (
    <div style={{ background: '#FFFEFB', padding: '0 20px' }}>
      <div style={{ padding: '20px 0 4px' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5' }}>人気ランキング</div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#1A1814', marginTop: 4 }}>今週のベスト10</div>
      </div>
      {ranked.map((p, i) => (
        <div key={p.id} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: '1px solid #EDE8E2', cursor: 'pointer', alignItems: 'center' }}>
          <div style={{
            width: 36, flexShrink: 0, textAlign: 'center',
            fontSize: i < 3 ? 26 : 18, fontWeight: 800,
            color: i === 0 ? '#D4A017' : i === 1 ? '#A8A8A8' : i === 2 ? '#C47B3A' : '#E0D8CF',
            fontFamily: 'JetBrains Mono, monospace', lineHeight: 1,
          }}>
            {i + 1}
          </div>
          <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#F5F0EC' }}>
            <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{p.brand} · {p.category}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1814', marginTop: 2, marginBottom: 4, lineHeight: 1.4 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Stars score={p.score} />
              <span style={{ fontSize: 10, color: '#C5C5C5' }}>{p.count}</span>
              <span style={{ fontSize: 12, fontWeight: 700, marginLeft: 'auto' }}>{p.price}</span>
            </div>
          </div>
        </div>
      ))}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ══ 案D: エディトリアル（マガジン風） ══════════════════════ */
function LayoutD() {
  const [featured, setFeatured] = useState(0);
  const fp = MOCK[featured];
  const rest = MOCK.filter((_, i) => i !== featured).slice(0, 6);
  return (
    <div style={{ background: '#FFFEFB' }}>
      {/* Featured */}
      <div style={{ margin: 16, borderRadius: 20, overflow: 'hidden', background: '#1A1814', cursor: 'pointer', position: 'relative' }}>
        <img src={fp.img} alt={fp.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', opacity: 0.7 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px 20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', marginBottom: 6 }}>FEATURED · {fp.brand}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 8 }}>{fp.name}</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {fp.ing.map(i => <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: 99 }}>{i}</span>)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stars score={fp.score} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fp.price}</span>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 14, right: 14, background: G, color: '#fff', fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 99 }}>PICK</div>
      </div>
      {/* Grid */}
      <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {rest.map((p, i) => (
          <div key={p.id} onClick={() => setFeatured(MOCK.indexOf(p))}>
            <VCard p={p} size="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ 案E: ベントグリッド（Bento Box） ══════════════════════ */
function LayoutE() {
  return (
    <div style={{ background: '#FFFEFB', padding: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, gridAutoRows: 'auto' }}>
        {/* 大きいカード (col span 2) */}
        <div style={{ gridColumn: 'span 2', borderRadius: 18, overflow: 'hidden', background: '#fff', border: '1px solid #EDE8E2', cursor: 'pointer' }}>
          <div style={{ display: 'flex', height: 160 }}>
            <img src={MOCK[0].img} alt="" style={{ width: 140, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 9, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>{MOCK[0].brand}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1814', lineHeight: 1.4, marginTop: 4 }}>{MOCK[0].name}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {MOCK[0].ing.slice(0, 2).map(i => <Pill key={i} text={i} accent />)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Stars score={MOCK[0].score} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{MOCK[0].price}</span>
              </div>
            </div>
          </div>
        </div>
        {/* 小カード */}
        {MOCK.slice(1, 2).map(p => <VCard key={p.id} p={p} size="sm" />)}
        {/* 小カード x 3 */}
        {MOCK.slice(2, 5).map(p => <VCard key={p.id} p={p} size="sm" />)}
        {/* 大きいカード (col span 2) */}
        <div style={{ gridColumn: 'span 2', borderRadius: 18, overflow: 'hidden', background: `linear-gradient(135deg, ${G}22, ${G}11)`, border: `1px solid ${G}33`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', height: 130 }}>
            <img src={MOCK[5].img} alt="" style={{ width: 120, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 9, color: G, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>STAFF PICK</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1814', lineHeight: 1.4, marginTop: 4 }}>{MOCK[5].name}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{MOCK[5].price}</span>
            </div>
          </div>
        </div>
        {MOCK.slice(6, 7).map(p => <VCard key={p.id} p={p} size="sm" />)}
      </div>
    </div>
  );
}

/* ══ 案F: 詳細リスト（比較しやすい） ══════════════════════ */
function LayoutF() {
  return (
    <div style={{ background: '#FFFEFB', padding: '8px 16px' }}>
      <div style={{ padding: '12px 0 8px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5' }}>
        全商品 · {MOCK.length} ITEMS
      </div>
      {MOCK.map(p => <HCard key={p.id} p={p} />)}
      <div style={{ height: 24 }} />
    </div>
  );
}

/* ══ 案G: 成分タグ起点 ════════════════════════════════════ */
function LayoutG() {
  const allIng = [...new Set(MOCK.flatMap(p => p.ing))];
  const [active, setActive] = useState(null);
  const filtered = active ? MOCK.filter(p => p.ing.includes(active)) : MOCK;
  return (
    <div style={{ background: '#FFFEFB' }}>
      <div style={{ padding: '16px 16px 10px' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5', marginBottom: 10 }}>成分から探す</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allIng.slice(0, 12).map(ing => (
            <button key={ing} onClick={() => setActive(prev => prev === ing ? null : ing)}
              style={{
                padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
                background: active === ing ? G : '#F0EBE3',
                color: active === ing ? '#fff' : '#666',
                transition: 'all 0.15s',
              }}>
              {ing}
            </button>
          ))}
        </div>
        {active && (
          <div style={{ marginTop: 10, fontSize: 12, color: G, fontWeight: 500 }}>
            「{active}」を含む商品 · {filtered.length}件
          </div>
        )}
      </div>
      <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ borderRadius: 14, overflow: 'hidden', background: '#fff', border: '1px solid #EDE8E2' }}>
            <img src={p.img} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: '#F5F0EC' }} />
            <div style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace' }}>{p.brand}</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#1A1814', margin: '3px 0 6px', lineHeight: 1.4 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {p.ing.map(i => <Pill key={i} text={i} accent={i === active} />)}
              </div>
              <div style={{ marginTop: 8, fontWeight: 700, fontSize: 12 }}>{p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ 案H: 朝/夜ルーティン別 ═══════════════════════════════ */
function LayoutH() {
  const [tab, setTab] = useState('朝');
  const filtered = tab === '朝' ? MOCK.filter(p => p.timing.includes('朝')) : MOCK.filter(p => p.timing.includes('夜'));
  return (
    <div style={{ background: '#FFFEFB' }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5', marginBottom: 12 }}>ルーティン別</div>
        <div style={{ display: 'flex', gap: 0, background: '#F0EBE3', borderRadius: 10, padding: 3 }}>
          {['朝', '夜'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1A1814' : '#999',
              boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.18s',
            }}>
              {t === '朝' ? '☀️ 朝のケア' : '🌙 夜のケア'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 16px 24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {filtered.map(p => <VCard key={p.id} p={p} size="sm" />)}
      </div>
    </div>
  );
}

/* ══ 案I: スポットライト（Hero回転 + ミニグリッド） ════════ */
function LayoutI() {
  const [idx, setIdx] = useState(0);
  const hero = MOCK[idx % MOCK.length];
  return (
    <div style={{ background: '#FFFEFB' }}>
      {/* Hero */}
      <div style={{ margin: 16, borderRadius: 20, background: '#F5F0EC', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
        <div style={{ display: 'flex', gap: 0, height: 200 }}>
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', marginBottom: 8 }}>SPOTLIGHT · {hero.brand}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#1A1814', lineHeight: 1.35, marginBottom: 10 }}>{hero.name}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {hero.ing.slice(0, 2).map(i => <Pill key={i} text={i} accent />)}
              </div>
            </div>
            <div>
              <Stars score={hero.score} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1814', marginTop: 4 }}>{hero.price}</div>
            </div>
          </div>
          <div style={{ width: 160, flexShrink: 0 }}>
            <img src={hero.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        {/* ナビゲーションドット */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5 }}>
          {MOCK.slice(0, 5).map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{
              width: i === idx % 5 ? 16 : 6, height: 6, borderRadius: 3,
              background: i === idx % 5 ? G : '#CCC',
              cursor: 'pointer', transition: 'all 0.2s',
            }} />
          ))}
        </div>
      </div>
      {/* Mini Grid */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', color: '#B5B5B5', marginBottom: 12 }}>すべての商品</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {MOCK.map((p, i) => (
            <div key={p.id} onClick={() => setIdx(i)} style={{
              borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
              border: `2px solid ${i === idx % MOCK.length ? G : 'transparent'}`,
              transition: 'border-color 0.15s',
            }}>
              <img src={p.img} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: '#F5F0EC', display: 'block' }} />
              <div style={{ padding: '5px 7px', background: '#fff' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#1A1814', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
                <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{p.price}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══ 案J: コンパクト密集グリッド（一覧性重視） ════════════ */
function LayoutJ() {
  const [sort, setSort] = useState('popular');
  const sorted = [...MOCK].sort((a, b) => sort === 'popular' ? b.score - a.score : parseFloat(a.price.replace(/[^\d]/g,'')) - parseFloat(b.price.replace(/[^\d]/g,'')));
  return (
    <div style={{ background: '#FFFEFB' }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1814' }}>全{MOCK.length}商品</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['popular', '人気順'], ['price', '価格順']].map(([key, label]) => (
            <button key={key} onClick={() => setSort(key)} style={{
              padding: '4px 10px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontSize: 10, fontFamily: 'inherit', fontWeight: 500,
              background: sort === key ? '#1A1814' : '#F0EBE3',
              color: sort === key ? '#fff' : '#888',
              transition: 'all 0.14s',
            }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '0 12px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {sorted.map(p => (
          <div key={p.id} style={{ borderRadius: 12, overflow: 'hidden', background: '#fff', border: '1px solid #EDE8E2', cursor: 'pointer' }}>
            <img src={p.img} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: '#F5F0EC', display: 'block' }} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 8, color: '#C5C5C5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', marginBottom: 2 }}>{p.brand}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#1A1814', lineHeight: 1.35, marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1814' }}>{p.price}</div>
              <div style={{ fontSize: 9, color: '#F5A623', marginTop: 2 }}>★ {p.score}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══ プレビューページ ══════════════════════════════════════ */
const OPTIONS = [
  { label:'A', title:'Netflixスタイル', sub:'ブランド別の横スクロール行。コンパクトで一覧性が高い', tag:'ブランド別', comp:<LayoutA /> },
  { label:'B', title:'悩み別キュレーション', sub:'お悩みでセクション分け。AI診断との一貫性が高い', tag:'悩み別', comp:<LayoutB /> },
  { label:'C', title:'ランキング形式', sub:'1位〜10位のリスト。SNS映えする、権威性が出る', tag:'ランキング', comp:<LayoutC /> },
  { label:'D', title:'エディトリアル（マガジン風）', sub:'大きなFeatured枠＋グリッド。高級感・編集感が出る', tag:'マガジン', comp:<LayoutD /> },
  { label:'E', title:'ベントグリッド（Bento Box）', sub:'サイズ混在の不規則グリッド。モダンでSNS映えする', tag:'Bento', comp:<LayoutE /> },
  { label:'F', title:'詳細リスト', sub:'横並びの詳細カード。成分まで読める、比較しやすい', tag:'リスト', comp:<LayoutF /> },
  { label:'G', title:'成分タグ起点', sub:'成分タグをタップして絞り込み。成分派ユーザー向け', tag:'成分', comp:<LayoutG /> },
  { label:'H', title:'朝/夜ルーティン別', sub:'朝ケア・夜ケアでタブ切り替え。使い方が明確', tag:'ルーティン', comp:<LayoutH /> },
  { label:'I', title:'スポットライト＋ミニグリッド', sub:'ヒーロー商品をドットで切り替え＋サムネグリッド', tag:'スポット', comp:<LayoutI /> },
  { label:'J', title:'コンパクト密集グリッド', sub:'3列ミニカードで一度にたくさん表示。ECらしい', tag:'コンパクト', comp:<LayoutJ /> },
];

export default function ProductPreview() {
  const [current, setCurrent] = useState(0);
  const opt = OPTIONS[current];

  return (
    <div style={{ minHeight: '100dvh', background: '#1A1814', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ヘッダー */}
      <div style={{ background: '#252220', borderBottom: '1px solid #333', padding: '12px 20px', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.16em', color: '#666' }}>商品一覧 デザイン案 A–J</span>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 1 }}>
            案{opt.label}：{opt.title}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setCurrent(i => Math.max(0, i - 1))} disabled={current === 0}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: current === 0 ? '#333' : '#444', color: current === 0 ? '#555' : '#fff', cursor: current === 0 ? 'default' : 'pointer', fontSize: 16 }}>←</button>
          <button onClick={() => setCurrent(i => Math.min(OPTIONS.length - 1, i + 1))} disabled={current === OPTIONS.length - 1}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: current === OPTIONS.length - 1 ? '#333' : G, color: '#fff', cursor: current === OPTIONS.length - 1 ? 'default' : 'pointer', fontSize: 16 }}>→</button>
        </div>
      </div>

      {/* 概要バッジ */}
      <div style={{ background: '#252220', padding: '10px 20px 12px', borderBottom: '1px solid #2A2826' }}>
        <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: `${G}22`, color: G, fontSize: 10, fontWeight: 600, marginBottom: 6, letterSpacing: '0.06em' }}>{opt.tag}</div>
        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{opt.sub}</div>
      </div>

      {/* 案セレクター */}
      <div style={{ display: 'flex', gap: 6, padding: '12px 16px', overflowX: 'auto', background: '#1E1C18', scrollbarWidth: 'none' }}>
        {OPTIONS.map((o, i) => (
          <button key={o.label} onClick={() => setCurrent(i)} style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            background: i === current ? G : '#2A2826',
            color: i === current ? '#fff' : '#888',
            transition: 'all 0.15s',
          }}>案{o.label}</button>
        ))}
      </div>

      {/* プレビュー枠（スマホサイズ） */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 16px 48px' }}>
        <div style={{
          width: '100%', maxWidth: 390,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          border: '1px solid #333',
        }}>
          {opt.comp}
        </div>
      </div>
    </div>
  );
}
