// 商品画像の選定ロジック
// 「商品が写っていない可能性が高い」ファイル名（logo/banner/pr/event/campaign/宣伝 等）を
// 除外し、候補配列から最初の“商品写真らしい”画像を選ぶ。該当なしなら先頭(0番目)を採用する。

// 明らかに商品単体写真でない可能性が高いファイル名パターン。
// ※「pr」は product/spray 等の誤検出を避けるため、区切り文字で囲まれたトークンのみ対象。
const NON_PRODUCT_RE = /(logo|banner|campaign|event|宣伝|visual|hero|top_|_top|_kv|kv_|(^|[_\-./])pr([_\-./\d]|$))/i;

// ファイル名部分だけを取り出す
function fileNameOf(url) {
  if (typeof url !== 'string') return '';
  return url.split('?')[0].split('/').pop() || '';
}

// 商品写真でない可能性が高いか
export function isNonProductImage(url) {
  return NON_PRODUCT_RE.test(fileNameOf(url));
}

// URL候補配列から最良の1枚を選ぶ（除外パターンに当たらない最初の1枚→なければ先頭）
export function pickBestImageUrl(urls) {
  const list = (urls || []).filter(u => typeof u === 'string' && u);
  if (list.length === 0) return null;
  const good = list.find(u => !isNonProductImage(u));
  return good || list[0];
}
