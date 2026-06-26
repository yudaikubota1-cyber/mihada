import React from 'react';
import { SkinrLogo, Icon } from '../components/shared.jsx';

export default function DisclosurePage({ onBack }) {
  const px = '24px';
  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,254,251,0.95)',
        backdropFilter: 'blur(8px)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="arrowLeft" size={20} />
        </button>
        <SkinrLogo size={14} />
        <div style={{ width: 32 }} />
      </div>

      <div style={{ padding: `40px ${px} 80px`, maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
          アフィリエイト表記
        </h1>
        <p style={{ fontSize: 11, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', margin: '0 0 40px' }}>
          広告・収益に関するご案内
        </p>

        <div style={{ fontSize: 13, lineHeight: 1.9, color: '#555', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            padding: '20px 24px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-soft)',
            borderLeft: '3px solid #111',
          }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8 }}>
              当サイト（miHada）は、<strong>楽天アフィリエイトプログラム</strong>に参加しています。当サイト内の商品リンクから購入が完了した場合、当サイトに対して一定の報酬が発生することがあります。
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.01em' }}>商品推薦の基準について</h2>
            <p>当サイトで紹介している商品は、<strong>成分ロジック</strong>に基づいて選定しています。アフィリエイト報酬の有無によって、特定の商品を優遇したり推薦内容を変えることは一切ありません。</p>
            <p>商品の推薦は、以下の基準のみに基づいています：</p>
            <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
              <li>有効成分の種類と濃度</li>
              <li>ユーザーの肌タイプ・悩みとの成分相性</li>
              <li>成分同士の相乗的な働き・禁忌情報</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.01em' }}>掲載している広告・リンクについて</h2>
            <p>商品詳細ページおよび提案結果ページに表示される「楽天で購入する」ボタンおよびリンクは、アフィリエイトリンクです。リンク先の楽天市場にて商品を購入された際に、当サービスに報酬が発生する場合があります。</p>
            <p>お客様の購入価格や商品の内容に影響はありません。</p>
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.01em' }}>お問い合わせ</h2>
            <p>広告・アフィリエイトに関するご質問は下記までお問い合わせください。</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>yudaikubota1@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
