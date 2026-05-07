import { pathToFileURL } from 'url';
import { resolve } from 'path';
const { PRODUCTS } = await import(pathToFileURL(resolve('src/data/products.js')).href);

const withImg = PRODUCTS.filter(p => p.image);
const pattern = /thumbnail\.image\.rakuten\.co\.jp\/@0_mall\/([^\/]+)\//;
const shopMap = {};
withImg.forEach(p => {
  const m = p.image.match(pattern);
  const shop = m ? m[1] : 'other';
  if (!shopMap[shop]) shopMap[shop] = [];
  shopMap[shop].push(p.nameJa.slice(0, 30));
});
Object.entries(shopMap)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([shop, names]) => {
    console.log(`${shop} (${names.length}件): ${names.slice(0, 3).join(' / ')}`);
  });
