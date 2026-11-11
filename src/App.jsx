import React, { useState, useEffect, useRef, useCallback } from 'react';
import InputPreview from './screens/InputPreview.jsx';
import ProductPreview from './screens/ProductPreview.jsx';
import SkinrHome from './screens/SkinrHome.jsx';
import SkinrChat from './screens/SkinrChat.jsx';
import SkinrResult from './screens/SkinrResult.jsx';
import SkinrProduct from './screens/SkinrProduct.jsx';
import SkinrArticle from './screens/SkinrArticle.jsx';
import PrivacyPage from './screens/PrivacyPage.jsx';
import DisclosurePage from './screens/DisclosurePage.jsx';
import { SkinrLogo, Icon } from './components/shared.jsx';
import { useIsDesktop } from './lib/useIsDesktop.js';
import { clearMemory } from './lib/uiMemory.js';
import { PRODUCTS } from './data/products.js';

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

// 画面ごとのURL。商品・記事は共有や再読み込みで同じ画面に戻れるようにする。
function urlFor(screen, { productId, articleSlug } = {}) {
  if (screen === 'product' && productId) return `/?p=${encodeURIComponent(productId)}`;
  if (screen === 'article' && articleSlug) return `/?article=${encodeURIComponent(articleSlug)}`;
  if (screen === 'privacy') return '/privacy';
  if (screen === 'disclosure') return '/disclosure';
  if (screen === 'preview') return '/?preview=1';
  if (screen === 'products') return '/?products=1';
  return '/';
}

// 実際にスクロールする要素（デスクトップ=ページ全体 / モバイル=画面内のスクロール領域）
function getScroller() {
  if (window.matchMedia('(min-width: 768px)').matches) return document.scrollingElement;
  return document.querySelector('.skinr-screen .skinr-scroll');
}

const BASE_TITLE = 'miHada — 成分ロジックで選ぶスキンケア';

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
        fontSize: 13, fontWeight: 300,
        color: active ? '#111' : hovered ? '#333' : '#999',
        fontFamily: 'inherit', letterSpacing: '0.04em',
        textDecoration: 'none',
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
        <span style={{
          fontSize: 16, fontWeight: 300, letterSpacing: '0.18em',
          color: '#111111', fontFamily: 'inherit',
        }}>miHada</span>
      </button>

      {/* 右: スペーサー（左ナビと対称にするため） */}
      <div style={{ flex: 1 }} />
    </header>
  );
}

// ─── App ─────────────────────────────────────────────────
export default function App() {
  const params = new URLSearchParams(location.search);
  const articleSlug = params.get('article');
  const pathname = location.pathname;
  const productParam = params.get('p');
  const validProductParam = productParam && PRODUCTS.some(p => p.id === productParam) ? productParam : null;
  // 再読み込み時は、ブラウザが保持している履歴状態から同じ画面を復元する
  const [boot] = useState(() => {
    const saved = history.state;
    const fromUrl =
      pathname === '/privacy' ? 'privacy' :
      pathname === '/disclosure' ? 'disclosure' :
      params.get('products') ? 'products' : params.get('preview') ? 'preview' :
      articleSlug ? 'article' : validProductParam ? 'product' : 'home';
    if (saved && saved.screen && fromUrl === 'home') {
      // 結果画面は診断データが残っている場合だけ復元（無ければホーム）
      if (saved.screen === 'result' && saved.diagnosis) return { screen: 'result', diagnosis: saved.diagnosis };
      if (saved.screen === 'chat') return { screen: 'chat' };
    }
    return { screen: fromUrl };
  });
  const [screen, setScreen] = useState(boot.screen);
  const [prevScreen, setPrevScreen] = useState('home');
  const [productId, setProductId] = useState(validProductParam);
  const [currentArticle, setCurrentArticle] = useState(articleSlug);
  const [chatSeed, setChatSeed] = useState(null);
  const [diagnosis, setDiagnosis] = useState(boot.diagnosis || null);
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
        // 画像や一覧の描画で高さが決まるまで数フレーム待って復元する
        const tryRestore = (attempts) => {
          const el = getScroller();
          if (el) {
            el.scrollTop = savedPos;
            if (Math.abs(el.scrollTop - savedPos) > 2 && attempts < 20) {
              requestAnimationFrame(() => tryRestore(attempts + 1));
            }
          }
        };
        requestAnimationFrame(() => tryRestore(0));
      }
    } else {
      // 新規遷移はトップへ
      requestAnimationFrame(() => {
        const el = getScroller();
        if (el) el.scrollTop = 0;
      });
    }
  }, [screen, productId]);

  // タブのタイトルを画面に合わせる
  useEffect(() => {
    const product = screen === 'product' ? PRODUCTS.find(p => p.id === productId) : null;
    document.title =
      product ? `${product.nameJa} | miHada` :
      screen === 'result' ? 'あなたへの提案 | miHada' :
      screen === 'privacy' ? 'プライバシーポリシー | miHada' :
      screen === 'disclosure' ? 'アフィリエイト表記 | miHada' :
      BASE_TITLE;
  }, [screen, productId]);

  // スクロール位置を保存
  const saveScrollPos = useCallback((screenName) => {
    const el = getScroller();
    if (el) scrollPositions.current[screenName] = el.scrollTop;
  }, []);

  // 画面遷移（ブラウザ履歴にpush or replace）— 遷移前にスクロール位置を保存
  // back=true の場合は遷移先のスクロール位置を復元（戻る動作）
  const navigate = useCallback((newScreen, extras = {}, { replace = false, back = false } = {}) => {
    saveScrollPos(screen);
    // 戻る以外でホーム／結果に入るときは、前回の絞り込み・展開状態を持ち越さない
    if (!back && newScreen === 'home') clearMemory('home:');
    if (!back && newScreen === 'result') clearMemory('result:');
    const state = { screen: newScreen, ...extras };
    // 戻る遷移では extras が空なので、いま表示中の値を履歴とURLに残す
    if (newScreen === 'product' && !state.productId) state.productId = productId;
    if (newScreen === 'article' && !state.articleSlug) state.articleSlug = currentArticle;
    if (newScreen === 'result' && !state.diagnosis) state.diagnosis = diagnosis;
    const url = urlFor(newScreen, state);
    if (replace) {
      history.replaceState(state, '', url);
    } else {
      history.pushState(state, '', url);
    }
    // 商品→関連商品のように同じ画面内で移るときは「戻り先」を上書きしない
    if (newScreen !== screen) setPrevScreen(screen);
    Object.entries(extras).forEach(([k, v]) => {
      if (k === 'productId') setProductId(v);
      if (k === 'chatSeed') setChatSeed(v);
      if (k === 'homeFilter') setHomeFilter(v);
      if (k === 'articleSlug') setCurrentArticle(v);
      if (k === 'diagnosis') { setDiagnosis(v); saveDiagnosis(v); setLastDiagnosis(v); }
    });
    isGoingBack.current = back;
    setScreen(newScreen);
  }, [screen, saveScrollPos, productId, currentArticle, diagnosis]);

  // ブラウザの戻る/進むボタン — 戻る時はスクロール復元フラグを立てる
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state;
      isGoingBack.current = true;
      if (state && state.screen) {
        if (state.productId) setProductId(state.productId);
        if (state.articleSlug) setCurrentArticle(state.articleSlug);
        if (state.homeFilter !== undefined) setHomeFilter(state.homeFilter);
        if (state.diagnosis) { setDiagnosis(state.diagnosis); }
        // 診断データの無い結果画面には戻れないのでホームへ
        setScreen(state.screen === 'result' && !state.diagnosis ? 'home' : state.screen);
      } else {
        setScreen('home');
        setHomeFilter(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    // 初回表示の状態を履歴に記録（再読み込みで復元した結果データは消さない）
    history.replaceState(
      { screen, ...(productId ? { productId } : {}), ...(currentArticle ? { articleSlug: currentArticle } : {}), ...(diagnosis ? { diagnosis } : {}) },
      '', ''
    );
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goHome = () => navigate('home', { homeFilter: null });
  const goHomeFiltered = (cat, productIds, label) => {
    navigate('home', { homeFilter: { cat, productIds, label } });
  };
  const goChat = (msg = null) => navigate('chat', { chatSeed: msg });
  const goResult = (diagnosisData) => {
    // チャット→結果はreplaceで、戻るボタンでチャットをスキップしてホームに直接戻る
    navigate('result', { diagnosis: diagnosisData }, { replace: true });
  };
  const goLastResult = () => {
    if (lastDiagnosis) {
      navigate('result', { diagnosis: lastDiagnosis });
    }
  };
  const goProduct = (id) => navigate('product', { productId: id });
  const goArticle = (slug) => navigate('article', { articleSlug: slug });
  // アプリ内ナビゲーションで戻る（ブラウザの history.back() は使わない）
  // 直前の画面へ戻る。商品詳細→結果（or ホーム）、記事→ホーム など
  const goBack = () => {
    const target = (prevScreen && prevScreen !== screen) ? prevScreen : 'home';
    navigate(target, {}, { back: true });
  };
  const goPrivacy = () => navigate('privacy');
  const goDisclosure = () => navigate('disclosure');

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
              onQuickDiagnosis={goResult}
              onOpenProduct={goProduct}
              onOpenArticle={goArticle}
              lastDiagnosis={lastDiagnosis}
              onViewLastResult={goLastResult}
              homeFilter={homeFilter}
              onOpenPrivacy={goPrivacy}
              onOpenDisclosure={goDisclosure}
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
              key={productId}
              isDesktop={isDesktop}
              productId={productId}
              onBack={goBack}
              onOpenProduct={goProduct}
            />
          </div>
        )}
        {screen === 'article' && (
          <div key="article" className="skinr-screen">
            <SkinrArticle
              slug={currentArticle}
              onBack={goBack}
              onOpenProduct={goProduct}
              onStartChat={() => goChat(null)}
            />
          </div>
        )}
        {screen === 'privacy' && (
          <div key="privacy" className="skinr-screen">
            <PrivacyPage onBack={goHome} />
          </div>
        )}
        {screen === 'disclosure' && (
          <div key="disclosure" className="skinr-screen">
            <DisclosurePage onBack={goHome} />
          </div>
        )}
      </div>
    </div>
  );
}
