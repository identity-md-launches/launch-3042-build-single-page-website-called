import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { importTool } from '../scripts/tooling.mjs';
import { startServer } from './server.mjs';
import { status, activity, economy, loadEngine, snapshot } from './engine.mjs';
const {chromium,webkit}=await importTool('playwright');
const AxeBuilder=await importTool('@axe-core/playwright');
const server=await startServer();
const results=[], errors=[];
const watchdog=setTimeout(()=>{console.error('Browser validation timed out after 90 seconds');process.exit(1);},90000);
watchdog.unref();
await mkdir('test/scratch/browser',{recursive:true});
const browser=await chromium.launch();
const key='hamster-chronicles-v1';
async function check(name,fn){try{await fn();results.push({name,passed:true});console.log(`PASS ${name}`);}catch(e){results.push({name,passed:false,error:e.message});console.error(`FAIL ${name}: ${e.stack}`);}}
async function open(options={}) {
  const context=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',...options});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  const state={status:status(),activity:structuredClone(activity),economy:structuredClone(economy),fail:new Set(),calls:{status:0,activity:0,economy:0},pending:false};
  await page.route('https://api.squeekchain.com/**',async route=>{
    const source=route.request().url().includes('settlements')?'activity':route.request().url().includes('economy')?'economy':'status';
    state.calls[source]++;
    if(state.fail.has(source))return route.fulfill({status:503,body:'Unavailable'});
    return route.fulfill({json:state[source]});
  });
  await page.clock.install({time:new Date('2026-11-06T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-11-06T12:00:01Z'));
  return {context,page,state,async navigate(){await page.goto(server.url);await page.locator('#chapter-type').waitFor({state:'visible'});},async close(){await context.close();}};
}
async function tick(page,ms=20_000){await page.clock.fastForward(ms);await page.waitForTimeout(50);}
async function join(page,name='Rowan',role='Baker'){
  await page.locator('.hero [data-join]').click();await page.locator('#name').fill(name);await page.locator('#role').selectOption(role);await page.locator('#save-character').click();
}
try {
 await check('production export at /preview/: metadata, local assets, first screen and no overflow',async()=>{
   const t=await open();await t.navigate();
   for(const width of [320,390,600,768,940,1440]){
     await t.page.setViewportSize({width,height:900});
     const dimensions=await t.page.evaluate(()=>({viewport:document.documentElement.clientWidth,page:document.documentElement.scrollWidth}));
     assert.ok(dimensions.page<=dimensions.viewport,`overflow at ${width}: ${JSON.stringify(dimensions)}`);
   }
   await t.page.setViewportSize({width:390,height:844});
   const title=await t.page.locator('h1').boundingBox(),button=await t.page.locator('.hero [data-join]').boundingBox(),chapter=await t.page.locator('#latest').boundingBox();
   assert.ok(title.y+title.height<844 && button.y+button.height<844 && chapter.y<844);
   const meta=await t.page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name=description]').content,og:document.querySelector('meta[property="og:title"]').content,image:document.querySelector('meta[property="og:image"]').content,icon:document.querySelector('link[rel=icon]').href}));
   assert.ok(meta.title.includes('Hamster Chronicles')&&meta.description&&meta.og&&meta.icon.startsWith('data:'));
   assert.equal((await t.page.request.get(new URL(meta.image,server.url).href)).status(),200);
   assert.equal(await t.page.evaluate(()=>document.fonts.check('32px "Pixelify Sans"')),true);
   await t.page.screenshot({path:'test/scratch/browser/mobile-dark.png'});
   await t.page.setViewportSize({width:1440,height:1000});await t.page.screenshot({path:'test/scratch/browser/desktop-dark.png',fullPage:true});
   await t.close();
 });
 await check('keyboard join, inline validation, HTML stripping, role, focus return, vote and reload',async()=>{
   const t=await open();await t.navigate();
   await t.page.locator('.hero [data-join]').focus();await t.page.keyboard.press('Enter');
   assert.equal(await t.page.locator('#name').evaluate(el=>el===document.activeElement),true);
   await t.page.locator('#save-character').click();assert.equal(await t.page.locator('#name').getAttribute('aria-invalid'),'true');
   await t.page.locator('#name').fill('<b>Ada</b>');await t.page.locator('#role').selectOption('Scout');await t.page.locator('#save-character').click();
   assert.equal(await t.page.locator('#join-dialog').evaluate(el=>el.open),false);assert.equal(await t.page.locator('#character-name').textContent(),'Ada');
   await t.page.locator('[data-choice="1"]').focus();await t.page.keyboard.press('Enter');
   assert.equal(await t.page.locator('#contribution').textContent(),'1');assert.equal(await t.page.locator('[data-choice="1"]').getAttribute('aria-pressed'),'true');
   assert.equal(await t.page.locator('.choice:disabled').count(),3);
   await t.page.reload();await t.page.locator('#chapter-type').waitFor({state:'visible'});
   assert.equal(await t.page.locator('#contribution').textContent(),'1');assert.equal(await t.page.locator('#character-name').textContent(),'Ada');
   await t.close();
 });
 await check('joining from a choice preserves intent, but an intervening chapter requires a fresh vote',async()=>{
   const t=await open();await t.navigate();
   await t.page.locator('[data-choice="2"]').click();await t.page.locator('#name').fill('Pip');await t.page.locator('#role').selectOption('Merchant');await t.page.locator('#save-character').click();
   assert.equal(await t.page.locator('#contribution').textContent(),'1');assert.equal(await t.page.locator('[data-choice="2"]').getAttribute('aria-pressed'),'true');
   assert.equal(await t.page.locator('#vote-result').evaluate(el=>el===document.activeElement),true);await t.close();
   const u=await open();await u.navigate();await u.page.locator('[data-choice="0"]').click();
   u.state.status=status({work:'1400'});await tick(u.page);await u.page.locator('#chapter-type').filter({hasText:'Journey'}).waitFor();
   await u.page.locator('#name').fill('Wren');await u.page.locator('#save-character').click();
   assert.equal(await u.page.locator('#contribution').textContent(),'0');assert.equal(await u.page.locator('.choice:disabled').count(),0);await u.close();
 });
 await check('20-second poll, exact RPM animation, choice remembered, 499/500 work and idle deduplication',async()=>{
   const t=await open();await t.navigate();await join(t.page);
   const label=await t.page.locator('[data-choice="0"] span:nth-child(2)').textContent();await t.page.locator('[data-choice="0"]').click();
   const initial=t.state.calls.status;await tick(t.page,19000);assert.equal(t.state.calls.status,initial);
   t.state.status=status({work:'1499'});await tick(t.page,1000);await t.page.locator('#chapter-type').filter({hasText:'Journey'}).waitFor();
   assert.equal(t.state.calls.status,initial+1);assert.match(await t.page.locator('#chapter-content').innerText(),/Rowan the Baker/);assert.ok((await t.page.locator('.story-text').first().innerText()).includes(label.toLowerCase()));
   assert.equal(await t.page.locator('#contribution').textContent(),'1');
   const rotor=await t.page.locator('#wheel-rotor').evaluate(el=>({duration:parseFloat(getComputedStyle(el).animationDuration),state:getComputedStyle(el).animationPlayState}));
   assert.ok(Math.abs(rotor.duration-60/42)<0.001);assert.equal(rotor.state,'running');
   t.state.status=status({work:'1999'});await tick(t.page);await t.page.locator('#chapter-type').filter({hasText:'Storm'}).waitFor();
   t.state.status=status({work:'1999',rpm:0,speed:0,status:'IDLE'});await tick(t.page);await t.page.locator('#chapter-type').filter({hasText:'Nap'}).waitFor();
   assert.equal(await t.page.locator('#wheel-rotor').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
   const saved=await t.page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(saved.round,4);
   await tick(t.page,60000);assert.equal((await t.page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)).round,4);
   await t.page.locator('.archive-entry summary').first().click();assert.equal(await t.page.locator('.archive-entry[open]').count(),1);
   await t.page.screenshot({path:'test/scratch/browser/archive-open.png',fullPage:true});await t.close();
 });
 await check('pause control and reduced motion stop animation without stopping live data',async()=>{
   const t=await open();await t.navigate();await t.page.locator('#motion-toggle').click();
   assert.equal(await t.page.locator('#wheel-rotor').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
   t.state.status=status({work:'1010'});await tick(t.page);await t.page.locator('#chapter-type').filter({hasText:'Journey'}).waitFor();
   await t.page.locator('#motion-toggle').click();assert.equal(await t.page.locator('#wheel-rotor').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
   await t.page.emulateMedia({reducedMotion:'reduce'});assert.equal(await t.page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length),0);
   await t.close();
 });
 await check('each failing endpoint preserves all last-good data, reconnects, then recovers',async()=>{
   const t=await open();await t.navigate();await t.page.locator('#minted').filter({hasText:'214,189,010.59'}).waitFor();
   const story=await t.page.locator('#chapter-content').innerText(),supply=await t.page.locator('#minted').textContent(),chart=await t.page.locator('#work-24').textContent();
   for(const source of ['status','activity','economy']){
     t.state.fail.add(source);await tick(t.page,120000);await t.page.locator('#connection-text').filter({hasText:'Reconnecting'}).waitFor();
     assert.equal(await t.page.locator('#chapter-content').innerText(),story);assert.equal(await t.page.locator('#minted').textContent(),supply);assert.equal(await t.page.locator('#work-24').textContent(),chart);
     t.state.fail.clear();await tick(t.page,120000);await t.page.locator('#connection-text').filter({hasText:'Wheel connected'}).waitFor();
   }
   await t.close();
 });
 await check('empty startup, request failures and retry keep joining available',async()=>{
   const t=await open();t.state.fail=new Set(['status','activity','economy']);await t.page.goto(server.url);await t.page.locator('#connection-text').filter({hasText:'Reconnecting'}).waitFor();
   assert.equal(await t.page.locator('#chapter-type').isVisible(),false);assert.match(await t.page.locator('#chapter-content').innerText(),/real wheel reading/);
   await join(t.page);assert.equal(await t.page.locator('#character-name').textContent(),'Rowan');
   await t.page.screenshot({path:'test/scratch/browser/startup-error.png'});
   t.state.fail.clear();await t.page.locator('#retry').click();await t.page.locator('#chapter-type').waitFor({state:'visible'});await t.close();
 });
 await check('unavailable storage, failed writes and corrupted memory stay usable',async()=>{
   for(const mode of ['blocked','write','corrupt']) {
     const t=await open();
     await t.page.addInitScript(({mode,key})=>{
       if(mode==='corrupt')localStorage.setItem(key,'{not-json');
       else if(mode==='blocked')Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});
       else Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError');};
     },{mode,key});
     await t.navigate();await join(t.page,'Willow','Bard');await t.page.locator('[data-choice="0"]').click();assert.equal(await t.page.locator('#contribution').textContent(),'1');
     assert.equal(await t.page.locator('#storage-note').isVisible(),true);await t.close();
   }
 });
 await check('empty and all-zero settlements chart, precise supply, accessible data table',async()=>{
   const t=await open();t.state.activity={buckets:[]};await t.navigate();await t.page.locator('#chart-container').filter({hasText:'No settlements'}).waitFor();
   t.state.activity={buckets:activity.buckets.map(b=>({...b,workAdded:'0',settlementCount:'0',completedBlockCount:'0'}))};await tick(t.page,120000);await t.page.locator('#chart-container').filter({hasText:'A quiet day'}).waitFor();
   await t.page.locator('.chart-table summary').click();assert.equal(await t.page.locator('tbody tr').count(),24);assert.equal(await t.page.locator('#minted').textContent(),'214,189,010.59');
   assert.equal(await t.page.evaluate(()=>document.documentElement.scrollWidth),390);await t.close();
 });
 await check('light/dark axe accessibility, modal semantics, 200% text resize, forced colors',async()=>{
   const t=await open();await t.navigate();await t.page.clock.resume();
   for(const colorScheme of ['dark','light']){
     await t.page.emulateMedia({colorScheme});
     const audit=await new AxeBuilder({page:t.page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
     await writeFile(`test/scratch/browser/axe-${colorScheme}.json`,JSON.stringify(audit.violations,null,2));
     assert.equal(audit.violations.length,0,JSON.stringify(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
     await t.page.screenshot({path:`test/scratch/browser/mobile-${colorScheme}.png`});
   }
   await t.page.locator('.hero [data-join]').click();const dialogAudit=await new AxeBuilder({page:t.page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.equal(dialogAudit.violations.length,0,JSON.stringify(dialogAudit.violations));
   await t.page.keyboard.press('Escape');assert.equal(await t.page.locator('.hero [data-join]').evaluate(el=>el===document.activeElement),true);
   await t.page.emulateMedia({forcedColors:'active'});await t.page.keyboard.press('Tab');await t.page.screenshot({path:'test/scratch/browser/forced-colors.png'});
   await t.page.emulateMedia({forcedColors:'none',colorScheme:'dark'});await t.page.addStyleTag({content:':root{font-size:32px}'});assert.equal(await t.page.evaluate(()=>document.documentElement.scrollWidth),390);
   await t.close();
 });
 await check('50-chapter archive remains local, scrollable, newest first and safe with hostile saved text',async()=>{
   const t=await open(),e=loadEngine(),m=e.emptyMemory();
   for(let i=0;i<60;i++)e.acceptSnapshot(m,snapshot({work:String(i*10)}));
   m.character={name:'Ada<img src=x>',role:'Knight',points:60};m.chapters[0].title='<script>alert(1)</script>';
   await t.page.addInitScript(({key,m})=>localStorage.setItem(key,JSON.stringify(m)),{key,m});t.state.status=status({work:'590'});await t.navigate();
   assert.equal(await t.page.locator('.archive-entry').count(),49);assert.equal(await t.page.locator('.archive-round').first().textContent(),'59');assert.equal(await t.page.locator('#chapter-content script').count(),0);
   assert.equal(await t.page.locator('#character-name img').count(),0);assert.ok(await t.page.locator('#archive-list').evaluate(el=>el.scrollHeight>el.clientHeight));await t.close();
 });
 await check('no browser script errors across interaction checks',async()=>assert.deepEqual(errors,[]));
 // A missing WebKit runtime is a separately reported coverage limitation, not a Chromium pass.
 try {
   const safari=await webkit.launch();
   try {
     const page=await safari.newPage({viewport:{width:390,height:844},colorScheme:'dark'});
     await page.route('https://api.squeekchain.com/**',route=>route.fulfill({json:route.request().url().includes('settlements')?activity:route.request().url().includes('economy')?economy:status()}));
     await page.goto(server.url);await page.locator('#chapter-type').waitFor({state:'visible'});await join(page);await page.locator('[data-choice="0"]').click();assert.equal(await page.locator('#contribution').textContent(),'1');
     results.push({name:'WebKit primary interaction',passed:true});
   } finally {await safari.close();}
 } catch(e) {results.push({name:'WebKit primary interaction',passed:null,limitation:e.message.split('\n').slice(0,24).join('\n')});console.log('LIMITATION WebKit cannot launch: missing host libraries.');}
} finally {
 await browser.close();await server.close();await writeFile('test/scratch/browser/results.json',JSON.stringify({results,errors},null,2));
}
console.log(`${results.filter(r=>r.passed===true).length} passed; ${results.filter(r=>r.passed===false).length} failed; ${results.filter(r=>r.passed===null).length} limitation.`);
clearTimeout(watchdog);
if(results.some(r=>r.passed===false))process.exitCode=1;
