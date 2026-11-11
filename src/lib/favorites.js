import { useState, useEffect, useCallback } from 'react';

// お気に入り（保存した商品）。この端末の localStorage にだけ保存する。
const KEY = 'mihada_favorites';
const EVENT = 'mihada:favorites';

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
  } catch { return []; }
}

function write(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useFavorites() {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((id) => {
    const cur = read();
    // 新しく保存したものを先頭に
    write(cur.includes(id) ? cur.filter(x => x !== id) : [id, ...cur]);
  }, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  return { ids, has, toggle };
}
