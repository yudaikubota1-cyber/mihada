const appId = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const key   = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const keyword = encodeURIComponent('化粧水');
const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?applicationId=${appId}&accessKey=${key}&keyword=${keyword}&hits=2&formatVersion=2`;

console.log('Testing:', url);
const r = await fetch(url, {
  headers: {
    'Referer': 'https://mihada.vercel.app/',
    'Origin':  'https://mihada.vercel.app',
  }
});
console.log('Status:', r.status);
const text = await r.text();
console.log('Body:', text.slice(0, 500));
