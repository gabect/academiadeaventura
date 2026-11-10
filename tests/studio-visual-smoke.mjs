import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--disable-software-rasterizer=false']});
let fails=[];
for(const [name,width,height,mode] of [
 ['studio-desktop',920,518,'studio'],['studio-mobile',640,360,'studio'],
 ['studio-cliff',920,518,'cliff'],['normal-desktop',800,450,'normal']
]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,
  isMobile:name.includes('mobile'),hasTouch:name.includes('mobile')});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console '+m.text());});
 try{
  await page.goto('http://127.0.0.1:8765/?'+(mode!=='normal'?'mountain=studio&':'')+(mode==='cliff'?'scene=cliff&':'')+
   'ci-smoke=1',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.__studioCIReady===true,
    null,{timeout:120000,polling:500}).catch(()=>{});
  const result=await page.evaluate(()=>{
   const c=document.querySelector('canvas'),gl=c?.getContext('webgl2')||c?.getContext('webgl');
   return {label:document.getElementById('buildLabel')?.textContent,webgl:!!gl,
    stopped:window.__studioCIReady===true,canvas:c?[c.width,c.height]:null};
  });
  console.log(name,JSON.stringify(result),'errors',JSON.stringify(errors.slice(0,10)));
  if(!result.webgl)fails.push(name+':no WebGL context');
  if(!result.label?.includes('0.48.0'))fails.push(name+':old label');
  if(!result.label?.includes(mode==='normal'?'NORMAL':'STUDIO'))fails.push(name+':wrong mode');
  if(errors.length)fails.push(name+':'+errors.slice(0,4).join(' | '));
  if(result.stopped){
   try{await page.screenshot({path:'artifacts/'+name+'.png',
    animations:'allow',timeout:90000});console.log(name,'screenshot stored');}
   catch(e){fails.push(name+':screenshot '+e.message);}
  }else fails.push(name+':frame loop did not settle');
 }catch(e){fails.push(name+':'+e.message)}
 await context.close();
}
await browser.close();
if(fails.length){console.error(fails);process.exitCode=1;}
