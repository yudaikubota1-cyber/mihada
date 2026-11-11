import React from 'react';
import ReactDOM from 'react-dom/client';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App.jsx';
import './index.css';

inject();
injectSpeedInsights();

// 想定外のエラーで画面が真っ白になるのを防ぐ
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div style={{ minHeight: '100dvh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: '#FFFFFF', color: '#111111', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>表示中に問題が発生しました</p>
        <p style={{ margin: 0, fontSize: 12, color: '#999999', lineHeight: 1.7 }}>お手数ですが、トップページから<br />もう一度お試しください。</p>
        <button
          onClick={() => { history.replaceState(null, '', '/'); location.reload(); }}
          style={{ marginTop: 8, padding: '12px 28px', background: '#111111', color: '#FFFFFF', border: 'none', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
        >
          トップに戻る
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
