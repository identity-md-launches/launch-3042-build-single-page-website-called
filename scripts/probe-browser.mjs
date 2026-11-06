// Optional adapter for the pinned design probe. It uses real API requests through
// the contributor's network proxy when present; it does not change or mock the page.
import { importTool } from './tooling.mjs';
const { chromium: engine } = await importTool('playwright');
const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
export const chromium = {
  async launch(options) {
    return engine.launch({ ...options, ...(proxy ? { proxy: { server: proxy, bypass: '127.0.0.1,localhost' } } : {}) });
  }
};
