const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('../../parcel-prototype/node_modules/playwright');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'previews');
fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

(async () => {
  const srv = await new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); res.end(); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => resolve(s));
  });

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1120, height: 800 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));

  for (const pIdx of [0, 1, 2]) {
    await page.locator(`[data-palette-all="${pIdx}"]`).click();
    await page.waitForTimeout(180);
    await page.locator('#widget-grid').screenshot({ path: path.join(OUT, `palette-${pIdx}-280.png`) });
  }

  await page.locator('[data-palette-all="0"]').click();
  await page.locator('#toggle-size').click();
  await page.waitForTimeout(180);
  await page.locator('#widget-grid').screenshot({ path: path.join(OUT, 'compact-180.png') });

  await browser.close();
  srv.close();
  assert.deepEqual(errs, []);
  console.log('Wave 1 curated verified and screenshots saved.');
})();
