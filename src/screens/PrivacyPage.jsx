import React from 'react';
import { SkinrLogo, Icon } from '../components/shared.jsx';

export default function PrivacyPage({ onBack }) {
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
          プライバシーポリシー
        </h1>
        <p style={{ fontSize: 11, color: '#B5B5B5', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', margin: '0 0 40px' }}>
          最終更新: 2025年6月
        </p>

        <Section title="1. 収集する情報">
          <p>当サービス（miHada）は、以下の情報を収集することがあります。</p>
          <ul>
            <li><strong>チャット入力内容：</strong>お肌の悩みや状態に関するご入力内容。AIによる商品提案の精度向上のために使用します。</li>
            <li><strong>アクセスログ：</strong>IPアドレス、ブラウザの種類、訪問日時、閲覧ページなどの情報。</li>
            <li><strong>Cookie情報：</strong>サービス向上および分析目的で使用します。</li>
          </ul>
        </Section>

        <Section title="2. 利用目的">
          <ul>
            <li>AIによるスキンケア商品提案の精度向上</li>
            <li>サービスの改善および新機能の開発</li>
            <li>利用状況の分析（Vercel Analytics使用）</li>
          </ul>
        </Section>

        <Section title="3. 第三者提供">
          <p>当サービスでは、以下の第三者へのリンクが含まれます。</p>
          <ul>
            <li><strong>楽天市場：</strong>商品購入リンクとして楽天アフィリエイトリンクを使用しています。リンクをクリックし商品を購入された場合、楽天市場の個人情報保護方針が適用されます。</li>
            <li><strong>Qoo10：</strong>一部商品についてQoo10へのリンクを含む場合があります。</li>
          </ul>
          <p>上記以外の第三者への個人情報の提供は、法令に基づく場合を除き行いません。</p>
        </Section>

        <Section title="4. Cookieについて">
          <p>当サービスはCookieを使用しています。Cookieは、お客様のブラウザに保存される小さなデータファイルです。ブラウザの設定からCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。</p>
        </Section>

        <Section title="5. アクセス解析ツール">
          <p>当サービスはVercel Analyticsを使用してアクセス解析を行っています。このツールはCookieを使用せず、プライバシーに配慮した形で集計データを収集します。</p>
        </Section>

        <Section title="6. プライバシーポリシーの変更">
          <p>当サービスのプライバシーポリシーは、法令の変更や業務内容の変更に伴い、予告なく更新することがあります。最新の内容をご確認ください。</p>
        </Section>

        <Section title="7. お問い合わせ">
          <p>プライバシーに関するお問い合わせは、下記までご連絡ください。</p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>yudaikubota1@gmail.com</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ fontSize: 13, lineHeight: 1.8, color: '#555' }}>
        {children}
      </div>
    </div>
  );
}
