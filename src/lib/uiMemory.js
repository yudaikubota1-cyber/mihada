import { useState, useEffect } from 'react';

// 画面をまたいで保持するUI状態（ページを開いている間だけ有効）。
// 商品詳細から戻ったときに、検索語・カテゴリ・展開状態が消えないようにする。
const mem = new Map();

export function useMemoryState(key, initial) {
  const [value, setValue] = useState(() => (
    mem.has(key) ? mem.get(key) : (typeof initial === 'function' ? initial() : initial)
  ));
  useEffect(() => { mem.set(key, value); }, [key, value]);
  return [value, setValue];
}

export function clearMemory(prefix) {
  for (const k of [...mem.keys()]) {
    if (k.startsWith(prefix)) mem.delete(k);
  }
}
