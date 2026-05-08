import React, { useState } from 'react';
import SkinrHome from './screens/SkinrHome.jsx';
import SkinrChat from './screens/SkinrChat.jsx';
import SkinrResult from './screens/SkinrResult.jsx';
import SkinrProduct from './screens/SkinrProduct.jsx';
import { SkinrLogo, Icon } from './components/shared.jsx';
import { useIsDesktop } from './lib/useIsDesktop.js';

// localStorage helpers
function loadDiagnosis() {
  try {
    const s = localStorage.getItem('skinr_last_diagnosis');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
function saveDiagnosis(d) {
  try { localStorage.setItem('skinr_last_diagnosis', JSON.stringify(d)); } catch {}
}

// ─── Desktop top header ───────────────────────────────────
function HeaderNavLink({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '6px 14px', borderRadius: 6,
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? '#111' : hovered ? '#333' : '#666',
        fontFamily: 'inherit', letterSpacing: '-0.01em',
        borderBottom: active ? '2px solid #111' : '2px solid transparent',
        transition: 'all 0.14s ease',
      }}
    >
      {label}
    </button>
  );
}

function DesktopHeader({ screen, lastDiagnosis, onHome, onChat, onResult }) {
  return (
    <header className="skinr-desktop-header">
      {/* Logo */}
      <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
        <SkinrLogo size={15} />
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 28px 0 32px', flexShrink: 0 }} />

      {/* Nav links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <HeaderNavLink label="商品一覧" active={screen === 'home'} onClick={onHome} />
        {lastDiagnosis && (
          <HeaderNavLink label="診断結果" active={screen === 'result'} onClick={onResult} />
        )}
      </nav>

      {/* AI診断 CTA */}
      <button
        onClick={onChat}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '9px 20px', borderRadius: 8, border: 'none',
          background: screen === 'chat' ? '#155239' : '#1A6644',
          color: '#fff', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '0.02em',
          boxShadow: '0 2px 16px rgba(26,102,68,0.30)',
          transition: 'all 0.14s ease',
        }}
      >
        <Icon name="sparkle" size={12} color="#fff" />
        AI 肌診断
      </button>
    </header>
  );
}

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState('home');
  const [productId, setProductId] = useState('anua-toner');
  const [chatSeed, setChatSeed] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [lastDiagnosis, setLastDiagnosis] = useState(loadDiagnosis);
  const [homeFilter, setHomeFilter] = useState(null);

  const isDesktop = useIsDesktop(768);

  const goHome = () => { setPrevScreen(screen); setHomeFilter(null); setScreen('home'); };
  const goHomeFiltered = (cat, productIds, label) => {
    setPrevScreen(screen);
    setHomeFilter({ cat, productIds, label });
    setScreen('home');
  };
  const goChat = (msg = null) => { setPrevScreen(screen); setChatSeed(msg); setScreen('chat'); };
  const goResult = (diagnosisData) => {
    setPrevScreen(screen);
    setDiagnosis(diagnosisData);
    saveDiagnosis(diagnosisData);
    setLastDiagnosis(diagnosisData);
    setScreen('result');
  };
  const goLastResult = () => {
    if (lastDiagnosis) {
      setPrevScreen('home');
      setDiagnosis(lastDiagnosis);
      setScreen('result');
    }
  };
  const goProduct = (id) => { setPrevScreen(screen); setProductId(id); setScreen('product'); };
  const goBack = () => { setScreen(prevScreen); setPrevScreen('home'); };

  return (
    <div className="app-shell">
      {/* Desktop top header — hidden on mobile via CSS */}
      <DesktopHeader
        screen={screen}
        lastDiagnosis={lastDiagnosis}
        onHome={goHome}
        onChat={() => goChat(null)}
        onResult={goLastResult}
      />

      {/* Main content */}
      <div className="skinr-content">
        {screen === 'home' && (
          <div key="home" className="skinr-screen">
            <SkinrHome
              isDesktop={isDesktop}
              onStartChat={() => goChat(null)}
              onSendInline={(msg) => goChat(msg)}
              onOpenProduct={goProduct}
              lastDiagnosis={lastDiagnosis}
              onViewLastResult={goLastResult}
              homeFilter={homeFilter}
            />
          </div>
        )}
        {screen === 'chat' && (
          <div key="chat" className="skinr-screen">
            <SkinrChat
              key={chatSeed}
              initialMessage={chatSeed}
              onComplete={goResult}
              onBack={goHome}
            />
          </div>
        )}
        {screen === 'result' && (
          <div key="result" className="skinr-screen">
            <SkinrResult
              isDesktop={isDesktop}
              diagnosis={diagnosis}
              onBack={goHome}
              onOpenProduct={goProduct}
              onNewChat={() => goChat(null)}
              onViewCategory={goHomeFiltered}
            />
          </div>
        )}
        {screen === 'product' && (
          <div key="product" className="skinr-screen">
            <SkinrProduct
              isDesktop={isDesktop}
              productId={productId}
              onBack={goBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}
