import React, { useState, useEffect, useRef, useCallback } from 'react';
import InputPreview from './screens/InputPreview.jsx';
import ProductPreview from './screens/ProductPreview.jsx';
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

function DesktopHeader({ screen, onHome }) {
  return (
    <header className="skinr-desktop-header" style={{ position: 'relative' }}>
      {/* 左: ナビリンク */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <HeaderNavLink label="商品一覧" active={screen === 'home'} onClick={onHome} />
      </nav>

      {/* 中央: ブランド名（絶対配置で真ん中固定） */}
      <button
        onClick={onHome}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 7,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.06em', color: '#AAA098' }}>🕯</span>
        <span style={{
          fontSize: 14, fontWeight: 600, letterSpacing: '0.18em',
          color: '#1A1814', fontFamily: 'inherit', textTransform: 'uppercase',
        }}>mihada</span>
        <span style={{ fontSize: 11, letterSpacing: '0.06em', color: '#AAA098' }}>🕯</span>
      </button>

      {/* 右: スペーサー（左ナビと対称にするため） */}
      <div style={{ flex: 1 }} />
    </header>
  );
}

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const params = new URLSearchParams(location.search);
  const [screen, setScreen] = useState(params.get('products') ? 'products' : params.get('preview') ? 'preview' : 'home');
  const [prevScreen, setPrevScreen] = useState('home');
  const [productId, setProductId] = useState(null);
  const [chatSeed, setChatSeed] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [lastDiagnosis, setLastDiagnosis] = useState(loadDiagnosis);
  const [homeFilter, setHomeFilter] = useState(null);

  const isDesktop = useIsDesktop(768);

  // スクロール位置の保存・復元
  const scrollPositions = useRef({});
  const isGoingBack = useRef(false);

  // 画面切り替え時：戻る時は復元、進む時はトップへ
  useEffect(() => {
    if (isGoingBack.current) {
      isGoingBack.current = false;
      const savedPos = scrollPositions.current[screen];
      if (savedPos != null) {
        const tryRestore = (attempts) => {
          const el = document.querySelector('.skinr-content');
          if (el) {
            el.scrollTop = savedPos;
            if (el.scrollTop === 0 && savedPos > 0 && attempts < 5) {
              requestAnimationFrame(() => tryRestore(attempts + 1));
            }
          }
        };
        requestAnimationFrame(() => tryRestore(0));
      }
    } else {
      // 新規遷移はトップへ
      requestAnimationFrame(() => {
        const el = document.querySelector('.skinr-content');
        if (el) el.scrollTop = 0;
      });
    }
  }, [screen]);

  // スクロール位置を保存
  const saveScrollPos = useCallback((screenName) => {
    const el = document.querySelector('.skinr-content');
    if (el) scrollPositions.current[screenName] = el.scrollTop;
  }, []);

  // 画面遷移（ブラウザ履歴にpush）— 遷移前にスクロール位置を保存
  const navigate = useCallback((newScreen, extras = {}) => {
    saveScrollPos(screen);
    const state = { screen: newScreen, ...extras };
    history.pushState(state, '', '');
    setPrevScreen(screen);
    Object.entries(extras).forEach(([k, v]) => {
      if (k === 'productId') setProductId(v);
      if (k === 'chatSeed') setChatSeed(v);
      if (k === 'homeFilter') setHomeFilter(v);
      if (k === 'diagnosis') { setDiagnosis(v); saveDiagnosis(v); setLastDiagnosis(v); }
    });
    isGoingBack.current = false;
    setScreen(newScreen);
  }, [screen, saveScrollPos]);

  // ブラウザの戻る/進むボタン — 戻る時はスクロール復元フラグを立てる
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      isGoingBack.current = true;
      if (state && state.screen) {
        if (state.productId) setProductId(state.productId);
        if (state.homeFilter !== undefined) setHomeFilter(state.homeFilter);
        if (state.diagnosis) { setDiagnosis(state.diagnosis); }
        setScreen(state.screen);
      } else {
        setScreen('home');
        setHomeFilter(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    history.replaceState({ screen }, '', '');
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goHome = () => navigate('home', { homeFilter: null });
  const goHomeFiltered = (cat, productIds, label) => {
    navigate('home', { homeFilter: { cat, productIds, label } });
  };
  const goChat = (msg = null) => navigate('chat', { chatSeed: msg });
  const goResult = (diagnosisData) => {
    navigate('result', { diagnosis: diagnosisData });
  };
  const goLastResult = () => {
    if (lastDiagnosis) {
      navigate('result', { diagnosis: lastDiagnosis });
    }
  };
  const goProduct = (id) => navigate('product', { productId: id });
  const goBack = () => history.back();

  return (
    <div className="app-shell">
      {/* Desktop top header — hidden on mobile via CSS */}
      <DesktopHeader
        screen={screen}
        onHome={goHome}
      />

      {/* Main content */}
      <div className="skinr-content">
        {screen === 'preview' && <InputPreview />}
        {screen === 'products' && <ProductPreview />}
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
