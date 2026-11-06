import { readFileSync } from 'node:fs';
import vm from 'node:vm';
export function loadEngine() {
  const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const code = source.match(/<script id="app-script">([\s\S]*?)<\/script>/)[1];
  const context = vm.createContext({ Intl, Date, console });
  vm.runInContext(code, context);
  return vm.runInContext('({parseStatus,parseActivity,parseEconomy,sanitizeName,chapterType,generateChapter,emptyMemory,validateMemory,acceptSnapshot,castVote,sqk,hash,OPENINGS,EVENTS,SETTINGS,NPCS,ENDINGS,CHOICES})', context);
}
export const snapshot = (overrides = {}) => ({ work: '1000', block: '42', progress: 670000000, rpm: 42, speed: 120, status: 'SPINNING', epoch: '', fetchedAt: 100, observedAt: '', stale: false, ...overrides });
export const status = (overrides = {}) => {
  const s = snapshot(overrides);
  return { measurement: { cumulativeWorkUnits: s.work, rpmMilli: s.rpm * 1000, speedMmPerSecond: s.speed, coreStatus: s.status, counterEpoch: s.epoch, freshness: 'online' }, builder: { anchor: { blockHeight: s.block, blockProgress: String(s.progress) } } };
};
export const activity = { buckets: Array.from({length:24}, (_, i) => ({ startAt: `2026-11-05T${String(i).padStart(2, '0')}:00:00Z`, endAt: `2026-11-05T${String(i).padStart(2, '0')}:59:59Z`, workAdded: String(i % 7 * 90), settlementCount: '3', completedBlockCount: String(i % 3) })) };
export const economy = { supply: { totalMintedBaseUnits: '214189010598012554959716406' } };
