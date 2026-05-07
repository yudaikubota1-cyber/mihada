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

// ─── Desktop sidebar nav ─────────────────────────────────
function SidebarNavItem({ label, sub, icon, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 14px',
        background: active ? '#F2F0ED' : hovered ? '#F8F8F8' : 'transparent',
        border: 'none', borderRadius: 8,
        cursor: 'pointer', fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'background 0.14s ease',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: 7,
        background: active ? '#111' : '#F0EDE8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'background 0.14s ease',
      }}>
        <Icon name={icon} size={14} color={active ? '#fff' : '#888'} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? '#111' : '#444',
          letterSpacing: '-0.01em',
        }}>{label}</div>
        {sub && (
          <div style={{
            fontSize: 10, color: '#ABABAB',
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.04em', marginTop: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{sub}</div>
        )}
      </div>
    </button>
  );
}

function DesktopSidebar({ screen, lastDiagnosis, onHome, onChat, onResult }) {
  return (
    <nav className="skinr-desktop-sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px' }}>
        <SkinrLogo size={14} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F0EDE8', margin: '0 20px 16px' }} />

      {/* Nav */}
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SidebarNavItem
          label="ホーム"
          sub="全商品を探す"
          icon="search"
          active={screen === 'home'}
          onClick={onHome}
        />
        <SidebarNavItem
          label="AI診断"
          sub="肌悩みを相談する"
          icon="sparkle"
          active={screen === 'chat'}
          onClick={onChat}
        />
        {lastDiagnosis && (
          <SidebarNavItem
            label="前回の診断結果"
            sub={lastDiagnosis.skin_type || ''}
            icon="arrowRight"
            active={screen === 'result'}
            onClick={onResult}
          />
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #F0EDE8',
      }}>
        <div style={{
          fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.14em', color: '#C8C8C8',
          lineHeight: 1.8,
        }}>
          MIHADA<br />
          成分ロジック · v1.0
        </div>
      </div>
    </nav>
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
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <DesktopSidebar
        screen={screen}
        lastDiagnosis={lastDiagnosis}
        onHome={goHome}
        onChat={() => goChat(null)}
        onResult={goLastResult}
      />

      {/* Main content */}
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
  );
}
