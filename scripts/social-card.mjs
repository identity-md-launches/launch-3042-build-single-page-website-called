// Rebuild the local social preview from the site's own embedded font and pixel art.
import { readFile, mkdir } from 'node:fs/promises';
import { importTool } from './tooling.mjs';
const { chromium } = await importTool('playwright');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const font = html.match(/@font-face \{[^}]+\}/)[0];
const scene = html.match(/<svg class="landscape"[\s\S]*?<\/svg>/)[0];
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html><head><style>${font}*{box-sizing:border-box}body{margin:0;background:#111522;color:#eee9dd;padding:64px;font-family:Georgia,serif;width:1200px;height:630px;background-image:radial-gradient(#30364a 1px,transparent 1px);background-size:24px 24px}h1{font:400 72px 'Pixelify Sans';color:#edc778;margin:0;max-width:650px;line-height:1.1}p{font-size:28px;margin:24px 0}.scene{width:620px;position:absolute;right:24px;bottom:54px}svg{width:100%;height:auto}small{font:20px system-ui;position:absolute;left:64px;bottom:64px;color:#adb3c4;max-width:360px;line-height:1.6}</style></head><body><h1>Hamster<br>Chronicles</h1><p>The wheel writes the story</p><div class="scene">${scene}</div><small>A living village tale powered<br>by Squeektoshi’s real wheel.</small></body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await mkdir(new URL('../assets/', import.meta.url),{recursive:true});
  await page.screenshot({path:new URL('../assets/social-card.png',import.meta.url).pathname});
  console.log('Created assets/social-card.png (1200 × 630).');
} finally { await browser.close(); }
