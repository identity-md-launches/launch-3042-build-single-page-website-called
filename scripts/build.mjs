import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
if (html.includes('__PIXEL_FONT__')) throw new Error('The embedded font has not been supplied');
if (!html.includes('<script id="app-script">')) throw new Error('Missing application script');
await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await writeFile(new URL('../dist/index.html', import.meta.url), html);
await copyFile(new URL('../assets/social-card.png', import.meta.url), new URL('../dist/social-card.png', import.meta.url));
console.log(`Built dist/index.html (${Buffer.byteLength(html).toLocaleString()} bytes) and social-card.png. No runtime dependencies.`);
