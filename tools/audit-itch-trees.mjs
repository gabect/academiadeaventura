import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('art-audit/itch',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({acceptDownloads:true});
 page.on('console',m=>console.log('PAGE',m.type(),m.text().slice(0,200)));
 page.on('pageerror',e=>console.log('ERROR',e.message));
 await page.goto('https://klamtii.itch.io/tree-sprites',{waitUntil:'domcontentloaded',timeout:60000});
 console.log('TITLE',await page.title(),'URL',page.url());
 await page.screenshot({path:'art-audit/itch/page.png'});
 let data=await page.locator('a').evaluateAll(xs=>xs.map(x=>({t:(x.textContent||'').trim().slice(0,80),href:x.href})).filter(x=>/download|purchase|claim|free|take me|no thanks/i.test(x.t+' '+x.href)));
 console.log('DOWNLOAD LINKS',JSON.stringify(data.slice(0,25)));
 let button=page.getByText(/Download Now/i).first();
 if(await button.count()) await button.click({timeout:20000});
 await page.waitForTimeout(1500);
 await page.screenshot({path:'art-audit/itch/modal.png'});
 console.log('AFTER DOWNLOAD CLICK',page.url());
 const html=await page.locator('body').innerText();
 console.log('TEXT',html.slice(0,6000));
 let free=page.getByText(/No thanks, just take me to the downloads/i).first();
 if(await free.count()){
  await free.click({timeout:20000});
  await page.waitForTimeout(1500);
  console.log('AFTER FREE',page.url());
  await page.screenshot({path:'art-audit/itch/free.png'});
 }
 let links=await page.locator('a').evaluateAll(xs=>xs.map(x=>({text:(x.textContent||'').trim().slice(0,70),href:x.href})).filter(x=>/download|trees.zip/i.test(x.text+' '+x.href)));
 console.log('FILE LINKS',JSON.stringify(links.slice(0,30)));
 // The exact itch download link (not the surrounding "downloads not starting" link).
 const actual=page.getByRole('link',{name:'Download',exact:true}).first();
 console.log('DOWNLOAD BUTTON COUNT',await actual.count());
 if(await actual.count()){
  console.log('DOWNLOAD BUTTON',await actual.evaluate(el=>el.outerHTML.slice(0,1400)));
  page.on('request',req=>{if(/download|upload|cdn|hwcdn/i.test(req.url()))console.log('REQUEST',req.method(),req.url().slice(0,300))});
  page.on('response',res=>{if(/download|upload|cdn|hwcdn/i.test(res.url()))console.log('RESPONSE',res.status(),res.url().slice(0,300))});
  const pending=page.waitForEvent('download',{timeout:45000}).catch(e=>{console.log('NO DOWNLOAD EVENT',String(e));return null});
  await actual.click({timeout:20000});
  const dl=await pending;
  if(dl){
   console.log('DOWNLOADED',dl.suggestedFilename());
   await dl.saveAs('art-audit/itch/trees.zip');
   console.log('ZIP SIZE',fs.statSync('art-audit/itch/trees.zip').size);
  }else {
   console.log('FINAL URL',page.url(),'TEXT', (await page.locator('body').innerText()).slice(-1400));
  }
 }
}finally{await browser.close()}
