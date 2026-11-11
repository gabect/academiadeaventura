import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--disable-software-rasterizer=false']});
let fails=[];
for(const [name,width,height,mode] of [
 ['studio-desktop',920,518,'studio'],['studio-mobile',640,360,'studio'],
 ['studio-cliff',920,518,'cliff'],['studio-meadow',920,518,'meadow'],['studio-plants',920,518,'plants'],['studio-summit',920,518,'summit'],['studio-route30',920,518,'route30'],['studio-broadleaf',920,518,'broadleaf'],['normal-desktop',800,450,'normal']
]){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,
  isMobile:name.includes('mobile'),hasTouch:name.includes('mobile')});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror '+e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push('console '+m.text());});
 try{
  await page.goto('http://127.0.0.1:8765/?'+(mode!=='normal'?'mountain=studio&':'')+(['cliff','meadow','plants','summit','route30','broadleaf'].includes(mode)?'scene='+mode+'&':'')+
   'ci-smoke=1',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>window.__studioCIReady===true,
    null,{timeout:120000,polling:500}).catch(()=>{});
  if(mode!=='normal'){
   await page.waitForFunction(()=>window.__studioTreeImpostors?.loaded===2,null,{timeout:24000,polling:300});
   await page.waitForFunction(()=>window.__studioArtStatus?.grassReady===true
    &&window.__studioArtStatus?.rockReady===true,null,{timeout:22000,polling:500});
   await page.evaluate(()=>window.__studioCIRefresh?.());
  }
  const result=await page.evaluate(()=>{
   const c=document.querySelector('canvas'),gl=c?.getContext('webgl2')||c?.getContext('webgl');
   return {label:document.getElementById('buildLabel')?.textContent,webgl:!!gl,
    stopped:window.__studioCIReady===true,hd:window.__studioArtStatus||null,nature:window.__studioNaturalSiteStats||null,trees:window.__studioTreeVariantInfo||null,painterly:window.__studioTreePainterly||null,canvas:c?[c.width,c.height]:null};
  });
  console.log(name,JSON.stringify(result),'errors',JSON.stringify(errors.slice(0,10)));
  if(!result.webgl)fails.push(name+':no WebGL context');
  if(!result.label?.includes('0.61.0'))fails.push(name+':old label');
  if(!result.label?.includes(mode==='normal'?'NORMAL':'STUDIO'))fails.push(name+':wrong mode');
  if(errors.length)fails.push(name+':'+errors.slice(0,4).join(' | '));
  if(mode!=='normal'){
   if(!(result.nature?.clustered>600))fails.push(name+':too few clustered ground plants');
   if(!(result.nature?.wall>70))fails.push(name+':too few attached wall sites');
   if(!(result.nature?.crest>45))fails.push(name+':too few cliff-crest sites');
   if(!(result.hd?.spriteCounts?.grass_tuft>500))fails.push(name+':grass sprites missing');
   if(!(result.hd?.spriteCounts?.grass_tuft>1000))fails.push(name+':lush 0.51 meadow missing');
   if(!(result.hd?.spriteCounts?.broadleaf>60))fails.push(name+':broadleaf sprouts missing');
   if(result.painterly?.style!=='licensed-rendered-tree-billboards'||result.painterly?.quadsPerTree!==1)
    fails.push(name+':painted bark and leaf material missing');
   if(!(result.painterly?.paintedWholeTree && result.painterly?.loaded===2 && result.painterly?.errors?.length===0))
    fails.push(name+':cutout canopy atlas missing');
   if(!(result.trees?.pine===6&&result.trees?.broadleaf===5))
    fails.push(name+':variant families missing');
   if(!(result.trees?.pineInstances>0&&result.trees?.broadleafInstances>0))
    fails.push(name+':some tree families have no instances');
   if(!(result.hd?.spriteCounts?.wall_vines>20))fails.push(name+':wall sprites missing');
   if(!(result.hd?.spriteCounts?.cliff_crest>20))fails.push(name+':cliff caps missing');
  }
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
