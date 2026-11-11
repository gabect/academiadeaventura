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
 let candidates=page.getByText(/Download/i).all();
 for(const l of await candidates){
  const txt=(await l.innerText().catch(()=>''))?.trim();
  if(!txt||txt.length>80)continue;
  console.log('BUTTON TEXT',txt);
 }
 // Download only freely accessible trees.zip, never purchase or submit payment.
 const zipLink=page.locator('a').filter({hasText:/Download/i}).last();
 if(await zipLink.count()){
  try{
   const dl=await Promise.race([
    page.waitForEvent('download',{timeout:20000}),
    zipLink.click({timeout:15000}).then(()=>new Promise((_,reject)=>setTimeout(()=>reject(Error('No download event')),20000)))
   ]);
   if(dl&&dl.suggestedFilename){
    console.log('DOWNLOADED',dl.suggestedFilename());
    await dl.saveAs('art-audit/itch/trees.zip');
   }
  }catch(e){console.log('Download not available',String(e))}
 }
}finally{await browser.close()}
