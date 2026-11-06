import { importTool } from '../scripts/tooling.mjs';
import { startServer } from './server.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await importTool('playwright');
await mkdir('test/scratch/browser',{recursive:true});
const server=await startServer();
const proxy=process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const browser=await chromium.launch({...(proxy?{proxy:{server:proxy,bypass:'127.0.0.1,localhost'}}:{})});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'dark'}), failures=[], responses=[];
 page.on('requestfailed',r=>failures.push({url:new URL(r.url()).hostname,error:r.failure()?.errorText}));
 page.on('response',r=>{if(r.url().includes('api.squeekchain.com'))responses.push({path:new URL(r.url()).pathname,status:r.status()});});
 await page.goto(server.url);await page.waitForFunction(()=>document.querySelector('#connection-text').textContent.includes('connected')||document.querySelector('#connection-text').textContent.includes('Reconnecting'),null,{timeout:15000});
 await page.waitForTimeout(500);
 const result={connection:await page.locator('#connection-text').textContent(),wheel:await page.locator('#wheel-status').textContent(),chapter:await page.locator('#chapter-content').innerText(),minted:await page.locator('#minted').textContent(),work24:await page.locator('#work-24').textContent(),responses,failures};
 console.log(JSON.stringify(result,null,2));
 await page.screenshot({path:'test/scratch/browser/live-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test/scratch/browser/live-mobile.png'});
 await writeFile('test/scratch/browser/live.json',JSON.stringify(result,null,2));
 assert.equal(result.responses.filter(r=>r.status===200).length,3,'All three public APIs must respond');
 assert.equal(result.failures.length,0);
 assert.ok(!result.chapter.includes('A little story is on its way'));
 assert.ok(result.minted !== 'Waiting' && result.work24 !== 'Waiting');
} finally {await browser.close();await server.close();}
