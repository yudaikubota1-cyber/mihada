import React, { useState } from 'react';
import SkinrHome from './screens/SkinrHome.jsx';
import SkinrChat from './screens/SkinrChat.jsx';
import SkinrResult from './screens/SkinrResult.jsx';
import SkinrProduct from './screens/SkinrProduct.jsx';

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

export default function App() {
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState('home');
  const [productId, setProductId] = useState('anua-toner');
  const [chatSeed, setChatSeed] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [lastDiagnosis, setLastDiagnosis] = useState(loadDiagnosis);
  const [homeFilter, setHomeFilter] = useState(null); // { cat, productIds, label }

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
      {screen === 'home' && (
        <div key="home" className="skinr-screen">
          <SkinrHome
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
            productId={productId}
            onBack={goBack}
          />
        </div>
      )}
    </div>
  );
}
