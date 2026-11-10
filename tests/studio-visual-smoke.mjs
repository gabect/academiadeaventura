import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({
 headless:true,
 args:['--enable-webgl','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader','--disable-dev-shm-usage']
});
let fails=[];
for(const [name,width,height,mode] of [
 ['studio-desktop',1366,768,'studio'],['studio-mobile',854,480,'studio'],
 ['normal-desktop',1366,768,'normal']
]){
 const context=await browser.newContext({
  viewport:{width,height},deviceScaleFactor:1,
  isMobile:name.includes('mobile'),hasTouch:name.includes('mobile')
 });
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push('pageerror '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console '+m.text());});
 const url='http://127.0.0.1:8765/?'+(mode==='studio'?'mountain=studio&':'')+'ci-smoke=1';
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForTimeout(9500);
  const result=await page.evaluate(()=>{
   const c=document.querySelector('canvas');
   const label=document.getElementById('buildLabel')?.textContent||'';
   const gl=c?.getContext('webgl2')||c?.getContext('webgl');
   return {label,webgl:!!gl,
    renderer:gl?.getParameter(gl.RENDERER)||'none',
    resolution:c?[c.width,c.height]:null,
    studioCardCount:document.querySelectorAll('canvas').length,
    text:document.body.innerText.slice(0,350)};
  });
  await page.screenshot({path:'artifacts/'+name+'.png',animations:'disabled'});
  console.log(name,JSON.stringify(result),'errors=',JSON.stringify(errors.slice(0,8)));
  if(!result.webgl)fails.push(name+': WebGL unavailable');
  if(!result.label.includes('0.47.2'))fails.push(name+': stale build label');
  if(!result.label.includes(mode==='studio'?'STUDIO':'NORMAL'))fails.push(name+': wrong mode');
  if(errors.some(e=>/uncaught|failed to compile|shader error|webgl context|pageerror/i.test(e)))
   fails.push(name+': '+errors.join(' | ').slice(0,700));
 }catch(e){fails.push(name+': '+e.message);console.log(name,e);}
 await context.close();
}
await browser.close();
if(fails.length){console.error('Smoke issues',fails);process.exitCode=1;}
