/**
 * Downloads all product images from external CDNs to public/images/products/
 * Run: node scripts/download-images.mjs
 */

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { pipeline } from 'stream/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'products');

mkdirSync(OUT_DIR, { recursive: true });

// All product images scraped from external CDNs
const images = [
  // ── From Netlify (Chai & Spice) ─────────────────────────────────────────
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Khamni Box.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Locho Box.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Khaman Box.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Sev Usal Box.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Khavsa A.jpg',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Misal Box.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Dal Chawal.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Dal Khichdi.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Dal Makhani.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Masala Khichdi Kadhi.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Paneer Butter Masala.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Paneer Lababdar.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Paneer Tikka Masala_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Pav Bhaji.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Rajma Masala.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Tava Pulao.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Veg Biryani.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Veg Makhanwala.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Surati Mix Farsan_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Tikha Mix_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Plain Sev_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Nylon Sve_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Tikha Gathiya_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Plain Gathiya_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Papdi_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Poha Chevdo_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Makkai Chevda_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Chana Dal_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Bhel_Aa.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Kolhapuri Bhel Mix_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Lemon Mix_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Falahari Chivda_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Tikhi Sev_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Limboo Mari Sev_Front_A.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Golden Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Kashmiri Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Pudina Sev.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Aloo Sev.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Bhatha Kani.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Punjabi Mix.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Fryums Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Sp. Lasan Mix Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Nylon Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Aloo Chat Mix.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Lilu Lasan Mix.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Wheat Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Fuljadi.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Tal Katri.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Tikho Farali Chevdo.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Alphonso_Mango.png',
  'https://famous-sunburst-99001a.netlify.app/assets/images/products/Kesar_Mango.png',

  // ── From Jamoona CDN ────────────────────────────────────────────────────
  'https://www.jamoona.com/cdn/shop/files/Daawat-5kg-Extra-Long-Basmatireis--extralange-Koerner--991193_1_63affdfe-8b20-4de5-a438-becb81668244.png?v=1753350737&width=500',
  'https://www.jamoona.com/cdn/shop/files/Anjappar-5kg-Kurnool-Sona-Masoori-Reis-9037835.png?v=1753249960&width=500',
  'https://www.jamoona.com/cdn/shop/files/Heer-5kg-Superior-Basmati-Reis-extra-lang-991197_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Daawat-1kg-Original-Basmatireis-991187.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-100g-Kurkumapulver--Haldi--9016881.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/TRS-100g-Garam-Masala-Mix-990629.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-100g-Kreuzkuemmelsamen--Jeera-Ganze--991693_ac68a55b-2a2d-4e64-bdbf-91b716521adc.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/MDH-100g-Kashmiri-Mirch-Chillipulver-13011.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-100g-Korianderpulver--Dhaniya--991676_88f038e9-aab1-4bf1-838d-cab65d28100d.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Everest-100g-Garam-Masala-9017228.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/TRS-50g-Gruener-Kardamom--Elaichi--990048_5b2b6587-a9bb-46fb-9b73-b5d5ff0edcac.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/TRS-100g-Chillipulver-Extrascharf-991002.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Kichererbsen-halb-und-geschaelt--Chana-Dal--991557.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Rote-Linsen--Masoor-Dal--991571_2f4f4a40-3619-4607-97fc-f387615c3e9e.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Toor-Dal--Linsen--991586.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Halbe-geschaelte-Mungbohnen--Moong-Dal--991574_4fbb0ae6-b234-485c-a1fd-86262029e2f2.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Rote-Kidneybohnen--Rajma--991583.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Kichererbsen--Kabuli-Chana--991559.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Aashirvaad-5kg--Exportpackung--Atta-Weizenmehl-21208.png?v=1753189228&width=500',
  'https://www.jamoona.com/cdn/shop/files/Aashirvaad-10kg--Exportpackung--Atta-Weizenmehl-990554_abb25c00-4c9f-486d-9e8a-f06e18692362.png?v=1753350737&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1kg-Pure-Kichererbsenmehl--Besan--Mehl--991537_66a9fadc-3944-485b-a5dd-a97a526c6c17.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-5kg-Chapati-Atta-Weiss-990477_37b010b5-fbba-4454-9386-d3eec53289e8.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Heer-5kg-Chakki-Atta--Vollkornmehl--990974.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Haldiram-s-200g-Aloo-Bhujia--wuerzige-Kartoffelsticks--16251_1_5b0f5681-4eff-4792-8c83-774d323946bd.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Haldiram-s-200g-Khatta-Meetha-Mix-aus-Kichererbsen-16267_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Parle-79-9g-Parle-G-Biscuits-9017280.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Kurkure-85g-Chilli-Chatka-Snack-9017146_1_66852864-7a12-4113-b978-da4b460d4506.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Haldiram-s-200g-Bhujia-Masala-16253_d5e0ab5f-4765-4fd2-a712-68fd82daac43.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Hamdard-800ml-Rooh-Afza-Sirup-990061_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Rubicon-1l-Mangosaft-Deluxe-990294.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/TATA-450g-Tee-Gold-991180_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Wagh-Bakri-250g-Masala-Tee--Dose--22025.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Ahmed-1kg-Mango-Pickle-9040067.png?v=1753260979&width=500',
  'https://www.jamoona.com/cdn/shop/files/Patak-s-283g-Mango-Pickles-mild--Eingelegte-Mango--13635_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Ahmed-1kg-Gemischte-Pickles--13066_1.png?v=1753198530&width=500',
  'https://www.jamoona.com/cdn/shop/files/TRS-400g-Konzentrierte-Tamarindenpaste-991746_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Haldiram-s-200g-Boondi-Masala-16256_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Haldiram-s-200g-Samosa-Snack--mit-Kichererbsen--Cashews-und-Rosinen--16276_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Brooke-Bond-500g-Red-Label-9039018.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Rubicon-1l-Guavensaft-17123.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Anjappar-10kg-Kurnool-Sona-Masoori-Reis-9017057_1.png?v=1753214160&width=500',
  'https://www.jamoona.com/cdn/shop/files/Daawat-10kg-Original-Basmatireis-991190_1_370e2d72-07c6-458e-8423-d726711c2c65.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-2kg-Kichererbsen-halb-und-geschaelt--Chana-Dal--991558_091b02ea-d03d-49bd-84b3-aa36f7e4e80d.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Khanum-1kg-Butter-Ghee-991714.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Mothers-Kitchen-500g-Reines-Ghee-9040436_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/TRS-500g-Reines-Butter-Ghee-9017219_1.png?v=1753228441&width=500',
  'https://www.jamoona.com/cdn/shop/files/Anjappar-500ml-Kokosnussoel-9017849_253be8c6-e27a-4ca1-b96a-c766b5bf886e.png?v=1753221285&width=500',
  'https://www.jamoona.com/cdn/shop/files/Schani-1l-Senfoel-9039554_c699e023-59af-4a3a-b87d-3b4423dc802d.png?v=1753228441&width=500',
];

function urlToFilename(url) {
  const clean = url.split('?')[0];
  return clean.split('/').pop().replace(/%20/g, ' ');
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      resolve(res);
    });
    req.on('error', reject);
  });
}

async function downloadImage(url) {
  const filename = urlToFilename(url);
  const dest = join(OUT_DIR, filename);

  if (existsSync(dest)) {
    console.log(`  skip  ${filename}`);
    return;
  }

  try {
    const stream = await fetchUrl(url);
    const writer = createWriteStream(dest);
    await pipeline(stream, writer);
    console.log(`  ✓     ${filename}`);
  } catch (err) {
    console.error(`  ✗     ${filename} — ${err.message}`);
  }
}

console.log(`Downloading ${images.length} product images to ${OUT_DIR}\n`);

// Download in batches of 5 to avoid overwhelming servers
for (let i = 0; i < images.length; i += 5) {
  const batch = images.slice(i, i + 5);
  await Promise.all(batch.map(downloadImage));
}

console.log('\nDone.');
