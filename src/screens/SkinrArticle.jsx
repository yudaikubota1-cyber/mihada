import React from 'react';
import { PRODUCTS } from '../data/products.js';
import { SkinrLogo, SkinrEyebrow, Icon, ProductCard } from '../components/shared.jsx';

// 記事テンプレートデータ
const ARTICLES = [
  {
    slug: 'dry-skin',
    title: '乾燥肌におすすめの韓国スキンケア',
    subtitle: 'セラミド・ヒアルロン酸で潤いバリアを強化',
    concern: '乾燥',
    skinType: '乾燥肌',
    intro: '乾燥肌の根本的な原因は、肌のバリア機能の低下。セラミドやヒアルロン酸など、バリアを補強する成分が配合された韓国スキンケアで、内側からしっかり潤う肌を目指しましょう。',
    ingredients: [
      { name: 'セラミド', desc: '肌のバリア層を構成する脂質。外部刺激から肌を守り、水分蒸発を防ぐ。' },
      { name: 'ヒアルロン酸', desc: '1gで6Lの水分を保持できる保湿成分。肌の水分量を高め、ふっくらとした肌に。' },
      { name: 'スクワラン', desc: '肌なじみの良いオイル成分。べたつかずに潤いを閉じ込める。' },
    ],
    keywords: ['乾燥', '保湿', 'バリア低下', 'つっぱり'],
  },
  {
    slug: 'pore-care',
    title: '毛穴ケアに効く韓国スキンケア成分',
    subtitle: 'BHA・ナイアシンアミドで毛穴レス肌へ',
    concern: '毛穴',
    skinType: null,
    intro: '毛穴の開き・黒ずみの原因は、過剰な皮脂と古い角質の蓄積。BHA（サリチル酸）で毛穴の中の汚れを溶かし、ナイアシンアミドで毛穴を引き締める韓国スキンケアが効果的です。',
    ingredients: [
      { name: 'BHA（サリチル酸）', desc: '油溶性の酸で毛穴の中に浸透し、皮脂や角栓を溶かす。' },
      { name: 'ナイアシンアミド', desc: '皮脂コントロール+毛穴縮小。肌のキメを整える万能成分。' },
      { name: 'ティーツリー', desc: '抗菌・抗炎症作用。毛穴トラブルの原因菌にアプローチ。' },
    ],
    keywords: ['毛穴', '黒ずみ', '皮脂', '角栓', 'テカリ'],
  },
  {
    slug: 'acne',
    title: 'ニキビ肌向け韓国スキンケアおすすめ',
    subtitle: 'CICA・ドクダミで炎症を鎮める',
    concern: 'ニキビ',
    skinType: null,
    intro: 'ニキビケアの基本は「鎮静」と「菌の抑制」。韓国スキンケアはCICA（ツボクサエキス）やドクダミなど、優しく炎症を鎮める成分が豊富。肌に負担をかけずにニキビを改善します。',
    ingredients: [
      { name: 'ツボクサエキス（CICA）', desc: '韓国スキンケアの代表成分。炎症を鎮め、肌の修復を促進。' },
      { name: 'ドクダミエキス', desc: '抗菌・抗炎症作用。韓国で古くから使われてきた鎮静成分。' },
      { name: 'アゼライン酸', desc: '毛穴詰まりを解消し、ニキビの原因菌を抑制。赤みにも効果的。' },
    ],
    keywords: ['ニキビ', '赤み', '肌荒れ', '赤ニキビ', '白ニキビ'],
  },
  {
    slug: 'brightening',
    title: 'くすみ・シミ対策の韓国スキンケア',
    subtitle: 'ビタミンC・トラネキサム酸で透明感を',
    concern: 'くすみ',
    skinType: null,
    intro: 'くすみやシミの原因はメラニンの過剰生成と蓄積。ビタミンC誘導体やトラネキサム酸でメラニンの生成を抑え、ナイアシンアミドで肌全体のトーンを均一に整えましょう。',
    ingredients: [
      { name: 'ビタミンC誘導体', desc: 'メラニン生成を抑制し、既存のシミにもアプローチ。抗酸化作用も。' },
      { name: 'ナイアシンアミド', desc: 'メラニンの移動を阻害。肌全体のトーンアップに効果的。' },
      { name: 'トラネキサム酸', desc: '炎症由来のシミ・色素沈着に特に効果的な美白成分。' },
    ],
    keywords: ['くすみ', 'シミ', '美白', 'トーンアップ', '色素沈着'],
  },
  {
    slug: 'anti-aging',
    title: 'シワ・たるみに効く韓国スキンケア',
    subtitle: 'レチノール・ペプチドでハリ肌へ',
    concern: 'たるみ',
    skinType: null,
    intro: 'シワやたるみの原因は、コラーゲンの減少と肌の弾力低下。レチノールでコラーゲン産生を促進し、ペプチドで肌のハリを取り戻す韓国スキンケアが注目されています。',
    ingredients: [
      { name: 'レチノール', desc: 'ビタミンA誘導体。コラーゲン産生を促進し、シワを改善する王道成分。' },
      { name: 'ペプチド', desc: 'コラーゲンの合成を助け、肌のハリと弾力を回復させる。' },
      { name: 'PDRN（サーモンDNA）', desc: '細胞修復を促進する次世代成分。韓国美容クリニック発。' },
    ],
    keywords: ['シワ', 'たるみ', 'ハリ不足', 'エイジング', 'ほうれい線'],
  },
  {
    slug: 'sensitive',
    title: '敏感肌でも使える韓国スキンケア',
    subtitle: 'マデカソシド・パンテノールで優しく守る',
    concern: '敏感',
    skinType: '敏感肌',
    intro: '敏感肌には「鎮静」と「バリア修復」の2つが重要。刺激の少ないマデカソシドやパンテノール配合の韓国スキンケアで、肌を落ち着かせながらバリア機能を強化しましょう。',
    ingredients: [
      { name: 'マデカソシド', desc: 'ツボクサ由来の高純度鎮静成分。赤みや炎症を優しく抑える。' },
      { name: 'パンテノール', desc: 'ビタミンB5誘導体。肌の修復を助け、水分を保持する。' },
      { name: 'アラントイン', desc: '肌荒れを防ぎ、刺激を受けた肌を落ち着かせる。' },
    ],
    keywords: ['敏感', '赤み', '肌荒れ', 'バリア低下', '鎮静'],
  },
];

function getArticleProducts(article) {
  return PRODUCTS
    .filter(p => {
      const haystack = [...(p.concerns || []), ...(p.tags || []), ...(p.ingredients || [])].join(' ');
      return article.keywords.some(kw => haystack.includes(kw));
    })
    .slice(0, 6);
}

export { ARTICLES };

export default function SkinrArticle({ slug, onBack, onOpenProduct, onStartChat }) {
  const article = ARTICLES.find(a => a.slug === slug);
  if (!article) return <div style={{ padding: 40, textAlign: 'center' }}>記事が見つかりません</div>;

  const products = getArticleProducts(article);

  // SEO: 動的にdocument.titleとmeta descriptionを更新
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = `${article.title} | miHada`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.content;
    if (metaDesc) metaDesc.content = article.intro.substring(0, 120);
    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.content = prevDesc;
    };
  }, [slug]);

  return (
    <div className="skinr-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 5,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="arrowLeft" size={20} />
        </button>
        <SkinrLogo size={13} />
        <div style={{ width: 32 }} />
      </div>

      {/* Article content */}
      <article style={{ padding: '32px 24px 20px', maxWidth: 680, margin: '0 auto' }}>
        <SkinrEyebrow>Article</SkinrEyebrow>
        <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4, margin: '12px 0 8px', letterSpacing: '-0.02em' }}>
          {article.title}
        </h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px', lineHeight: 1.6 }}>
          {article.subtitle}
        </p>

        {/* Intro */}
        <p style={{ fontSize: 14, lineHeight: 1.9, color: '#444', margin: '0 0 32px' }}>
          {article.intro}
        </p>

        {/* Key ingredients */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#B5B5B5', letterSpacing: '0.14em' }}>KEY INGREDIENTS</span>
          </h2>
          {article.ingredients.map((ing, i) => (
            <div key={i} style={{
              padding: '16px 0',
              borderBottom: i < article.ingredients.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#D0D0D0' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{ing.name}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#777', lineHeight: 1.7, paddingLeft: 28 }}>
                {ing.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Recommended products */}
        {products.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#B5B5B5', letterSpacing: '0.14em' }}>RECOMMENDED</span>
            </h2>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {products.map(p => (
                <div key={p.id} style={{ flex: '0 0 140px', cursor: 'pointer' }} onClick={() => onOpenProduct(p.id)}>
                  <div style={{
                    width: 140, height: 140, borderRadius: 10, overflow: 'hidden',
                    background: p.image ? '#fff' : (p.swatch || '#F0EDE8'),
                    marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    {p.image ? (
                      <img src={p.image} alt={p.nameJa} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8%' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: p.swatch, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 9, color: '#999' }}>{p.brand}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7, color: '#C0C0C0', marginBottom: 2 }}>{p.brand}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, marginBottom: 3 }}>{p.nameJa}</div>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{
          padding: '24px', borderRadius: 12,
          background: 'var(--bg-soft)', border: '1px solid var(--border)',
          textAlign: 'center', marginBottom: 32,
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 12px' }}>
            あなたの肌に合う商品をAIが診断
          </p>
          <button
            onClick={onStartChat}
            style={{
              padding: '12px 28px', background: '#1A1814', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            <Icon name="sparkle" size={14} color="#fff" />
            無料で肌診断する
          </button>
        </div>
      </article>
    </div>
  );
}
