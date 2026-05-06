import { pathToFileURL } from 'url';
import { resolve } from 'path';

const RAKUTEN_APP_ID     = 'bc7f9188-26cb-4124-bcc0-8b0cbb28da0c';
const RAKUTEN_ACCESS_KEY = 'pk_5pxOxRBORZurmxgJAjQU4lg1do4j9lwNHkeMNW67fWT';
const RAKUTEN_AFF_ID     = '5365226b.aee5572f.5365226c.046695be';

const { PRODUCTS } = await import(pathToFileURL(resolve('src/data/products.js')).href);

const p = PRODUCTS[0];
const keyword = `${p.brand} ${p.nameJa}`;
const params = new URLSearchParams({
  applicationId: RAKUTEN_APP_ID,
  accessKey:     RAKUTEN_ACCESS_KEY,
  affiliateId:   RAKUTEN_AFF_ID,
  keyword,
  hits:          '3',
  sort:          '-reviewCount',
  imageFlag:     '1',
  formatVersion: '2',
});
const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?${params}`;
console.log('keyword:', keyword);
const res = await fetch(url, {
  headers: { 'Referer': 'https://mihada.vercel.app/', 'Origin': 'https://mihada.vercel.app' }
});
console.log('Status:', res.status);
const data = await res.json();
console.log('count:', data.count);
if (data.Items?.[0]) {
  const item = data.Items[0];
  console.log('shopName:', item.shopName);
  console.log('itemUrl:', (item.itemUrl || '').slice(0, 80));
  console.log('affiliateUrl:', (item.affiliateUrl || '').slice(0, 80));
  console.log('mediumImageUrls:', JSON.stringify(item.mediumImageUrls?.slice(0, 1)));
  console.log('smallImageUrls:', JSON.stringify(item.smallImageUrls?.slice(0, 1)));
} else {
  console.log('No items. Full response:', JSON.stringify(data).slice(0, 400));
}
