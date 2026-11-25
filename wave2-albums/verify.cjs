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
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
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
  const page = await browser.newPage({ viewport: { width: 1420, height: 1080 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__WAVE2_READY === true);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));

  const microViolations = [];
  const nonSquareCovers = [];
  const overflows = [];

  for (const wide of [false, true]) {
    if (wide) await page.locator('#toggle-wide').click();
    for (const tone of ['auto', 'light', 'dark']) {
      await page.locator(`[data-tone="${tone}"]`).click();
      for (let cIdx = 0; cIdx < 6; cIdx++) {
        await page.locator(`[data-crate-all="${cIdx}"]`).click();
        await page.waitForTimeout(60);
        const res = await page.evaluate(() => {
          const mv = [], nsq = [], ov = [];
          document.querySelectorAll('.al-face').forEach((face, idx) => {
            const fr = face.getBoundingClientRect();
            const u = fr.width / 300;
            face.querySelectorAll('.al-img-sq').forEach((img) => {
              const r = img.getBoundingClientRect();
              if (Math.abs(r.width - r.height) > 1.5) nsq.push({ idx, w: r.width, h: r.height });
            });
            const walker = document.createTreeWalker(face, NodeFilter.SHOW_TEXT);
            let n;
            while ((n = walker.nextNode())) {
              const txt = n.textContent.trim();
              if (!txt) continue;
              const el = n.parentElement;
              if (!el || el.closest('.al-hit')) continue;
              const cs = getComputedStyle(el);
              const units = parseFloat(cs.fontSize) / u;
              const op = parseFloat(cs.opacity || '1');
              if (units < 18.2 || op < 0.85) mv.push({ idx, txt, units: Number(units.toFixed(1)), op });
            }
            face.querySelectorAll('div, span').forEach((ch) => {
              const cr = ch.getBoundingClientRect();
              if (cr.width > fr.width + 2 || cr.height > fr.height + 2) ov.push({ idx, cls: ch.className });
            });
          });
          return { mv, nsq, ov };
        });
        microViolations.push(...res.mv);
        nonSquareCovers.push(...res.nsq);
        overflows.push(...res.ov);
      }
    }
    if (wide) await page.locator('#toggle-wide').click();
  }

  // Reload to get staggered showcase across all 6 covers in Adaptive Auto mode
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__WAVE2_READY === true);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.locator('#widget-grid').screenshot({ path: path.join(OUT, 'adaptive-auto-280.jpg'), type: 'jpeg', quality: 92 });

  // Light botanical cover test ("林檎标本" idx=3) across all 7 templates in Auto Adaptive mode!
  await page.locator('[data-crate-all="3"]').click();
  await page.waitForTimeout(200);
  await page.locator('#widget-grid').screenshot({ path: path.join(OUT, 'adaptive-light-cover-apple.jpg'), type: 'jpeg', quality: 92 });

  // Dark chiaroscuro cover test ("The Visitors" idx=2) across all 7 templates in Auto Adaptive mode!
  await page.locator('[data-crate-all="2"]').click();
  await page.waitForTimeout(200);
  await page.locator('#widget-grid').screenshot({ path: path.join(OUT, 'adaptive-dark-cover-visitors.jpg'), type: 'jpeg', quality: 92 });

  // Reload staggered + 2x4 Wide mode
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__WAVE2_READY === true);
  await page.locator('#toggle-wide').click();
  await page.waitForTimeout(200);
  await page.locator('#widget-grid').screenshot({ path: path.join(OUT, 'adaptive-wide-2x4.jpg'), type: 'jpeg', quality: 92 });

  // 180px compact real-phone scale
  await page.locator('#toggle-wide').click();
  await page.locator('#toggle-size').click();
  await page.waitForTimeout(200);
  await page.locator('#widget-grid').screenshot({ path: path.join(OUT, 'adaptive-compact-180.jpg'), type: 'jpeg', quality: 92 });

  await browser.close();
  srv.close();

  console.log(JSON.stringify({
    errors,
    nonSquareCoverCount: nonSquareCovers.length,
    microViolationCount: microViolations.length,
    overflowCount: overflows.length
  }, null, 2));

  assert.deepEqual(errors, []);
  assert.equal(nonSquareCovers.length, 0);
  assert.equal(microViolations.length, 0);
  assert.equal(overflows.length, 0);
})();
