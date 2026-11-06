import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEngine, snapshot, status, activity, economy } from './engine.mjs';
const e = loadEngine();
const plain = value => JSON.parse(JSON.stringify(value));

test('public fields parse as strings/BigInts without losing precision', () => {
  const s = e.parseStatus(status({ work: '99999999999999999999999', rpm: 42.125, progress: 123456789 }), 123);
  assert.equal(s.work, '99999999999999999999999'); assert.equal(s.rpm, 42.125); assert.equal(s.progress, 123456789); assert.equal(s.fetchedAt, 123);
  assert.equal(e.parseActivity(activity).buckets.length, 24); assert.equal(e.parseEconomy(economy).minted, economy.supply.totalMintedBaseUnits);
  assert.equal(e.sqk(economy.supply.totalMintedBaseUnits), '214,189,010.59');
});
test('reject malformed data, negative work, invalid status, unsafe integers and bad progress', () => {
  for (const payload of [{}, { measurement: {} }, status({work:'-2'}), status({work:9007199254740992}), status({status:'UNKNOWN'}), status({progress:1000000001}), status({rpm:-1})]) assert.throws(() => e.parseStatus(payload));
  assert.throws(() => e.parseActivity({ buckets: [{workAdded:'oops'}] })); assert.throws(() => e.parseEconomy({supply:{totalMintedBaseUnits:'1.5'}}));
});
test('work thresholds are exact at 0, 1, 499 and 500', () => {
  assert.equal(e.chapterType('0'), 'Nap'); assert.equal(e.chapterType('1'), 'Journey'); assert.equal(e.chapterType('499'), 'Journey'); assert.equal(e.chapterType('500'), 'Storm');
});
test('10,000 deterministic chapters are 120–200 words with three distinct choices and real readings', () => {
  let min=Infinity, max=0;
  for(let i=0;i<10000;i++) {
    const s=snapshot({work:String(i*17),block:String(i+1)}), work=['0','1','499','500','9999'][i%5];
    const vote=i%2 ? {name:'Little Acorn',role:'Scout',choice:1,label:'Follow the quiet garden path'} : null;
    const c=e.generateChapter(s,work,i+1,vote), words=c.paragraphs.join(' ').trim().split(/\s+/).length;
    min=Math.min(min,words); max=Math.max(max,words);
    assert.ok(words>=120 && words<=200, `${words} words in chapter ${i}`);
    assert.equal(new Set(c.choices).size,3); assert.match(c.paragraphs[1],/42 RPM/); assert.match(c.paragraphs[1],/67% progress/);
    assert.deepEqual(plain(c),plain(e.generateChapter(s,work,i+1,vote)));
  }
  console.log(`Generated chapter word counts: ${min}–${max}.`);
});
test('initial reading creates a baseline Nap, unchanged readings do not flood the archive', () => {
  const m=e.emptyMemory(); e.acceptSnapshot(m,snapshot()); assert.equal(m.chapters[0].type,'Nap'); assert.equal(m.chapters[0].workAdded,'0');
  for(let i=0;i<100;i++) e.acceptSnapshot(m,snapshot({fetchedAt:i}));
  assert.equal(m.chapters.length,1); assert.equal(m.round,1);
});
test('positive deltas generate chapters; idle transition generates only one Nap', () => {
  const m=e.emptyMemory(); e.acceptSnapshot(m,snapshot());
  e.acceptSnapshot(m,snapshot({work:'1499'})); assert.equal(m.chapters[0].type,'Journey');
  e.acceptSnapshot(m,snapshot({work:'1999'})); assert.equal(m.chapters[0].type,'Storm');
  e.acceptSnapshot(m,snapshot({work:'1999',status:'IDLE',rpm:0})); assert.equal(m.chapters[0].type,'Nap');
  for(let i=0;i<100;i++) e.acceptSnapshot(m,snapshot({work:'1999',status:'IDLE',rpm:0}));
  assert.equal(m.chapters.length,4);
});
test('a vote earns one point, stays locked and is remembered with name and role in the next chapter', () => {
  const m=e.emptyMemory(); e.acceptSnapshot(m,snapshot());
  assert.equal(e.castVote(m,0),false);
  m.character={name:'Rowan',role:'Baker',points:0}; assert.equal(e.castVote(m,0),true); assert.equal(e.castVote(m,2),false); assert.equal(m.character.points,1);
  const selected=m.chapters[0].choices[0];
  m.character.name='New name';
  e.acceptSnapshot(m,snapshot({work:'1100'}));
  assert.match(m.chapters[0].paragraphs[0],/Rowan the Baker/); assert.ok(m.chapters[0].paragraphs[0].includes(selected.toLowerCase()));
  assert.equal(e.castVote(m,10),false); assert.equal(e.castVote(m,1),true); assert.equal(m.character.points,2);
});
test('last 50 chapters persist newest first, lifetime points survive archive pruning and reload', () => {
  const m=e.emptyMemory(); m.character={name:'Hazel',role:'Bard',points:0};
  for(let i=0;i<70;i++) { e.acceptSnapshot(m,snapshot({work:String(i)})); e.castVote(m,0); }
  const restored=e.validateMemory(plain(m));
  assert.equal(restored.chapters.length,50); assert.equal(restored.chapters[0].round,70); assert.equal(restored.chapters.at(-1).round,21); assert.equal(restored.character.points,70);
  e.acceptSnapshot(restored,snapshot({work:'69'})); assert.equal(restored.round,70); assert.equal(e.castVote(restored,1),false);
});
test('reset and epoch change rebase; the next increase uses the new baseline', () => {
  const m=e.emptyMemory(); e.acceptSnapshot(m,snapshot());
  const reset=e.acceptSnapshot(m,snapshot({work:'5'})); assert.equal(reset.reset,true); assert.equal(m.chapters[0].workAdded,'0');
  e.acceptSnapshot(m,snapshot({work:'15'})); assert.equal(m.chapters[0].workAdded,'10');
  e.acceptSnapshot(m,snapshot({work:'15',epoch:'old'}));
  e.acceptSnapshot(m,snapshot({work:'1000000',epoch:'new'})); assert.equal(m.chapters[0].workAdded,'10');
  e.acceptSnapshot(m,snapshot({work:'1000001',epoch:'new'})); assert.equal(m.chapters[0].workAdded,'1');
});
test('sanitize names and reject malformed local memory', () => {
  assert.equal(e.sanitizeName('<b>Ada</b>'), 'Ada'); assert.equal(e.sanitizeName('  <img>  '),''); assert.equal(e.sanitizeName('a'.repeat(100)).length,20); assert.equal(e.sanitizeName('\u202eAda'),'Ada');
  for(const value of [null,{}, {version:1,chapters:'x'}, {version:2,chapters:[]}]) assert.throws(()=>e.validateMemory(value));
});
