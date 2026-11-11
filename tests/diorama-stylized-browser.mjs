import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('artifacts/diorama-3d-cast',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--no-sandbox'
]});
try{
 for(const view of [{name:'desktop',w:1280,h:720},{name:'mobile-landscape',w:900,h:440}]){
  const context=await browser.newContext({viewport:{width:view.w,height:view.h},deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  try{
   const response=await page.goto('http://127.0.0.1:8765/diorama/?ci-smoke&scene=meadow',
    {waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(response.status(),200);
   await page.waitForFunction(()=>window.__studioCIReady===true&&window.__dioramaCharacters?.npcCount===8,
    null,{timeout:65000});
   const state=await page.evaluate(()=>({
    art:window.__dioramaCharacters,world:window.__dioramaWorld,
    frame:document.querySelector('canvas')?.width,
    title:document.title
   }));
   assert.equal(state.art.renderMode,'fully-volumetric-3d');
   assert.equal(state.art.player.shading,'cel-shaded-vector-3d');
   assert(state.art.player.outlineMeshes>=6,'Missing player outlines');
   assert.equal(state.art.guardian.shading,'cel-shaded-vector-3d');
   assert.equal(state.art.player.installed,true);
   assert.equal(state.art.player.articulated,true);
   assert.equal(state.art.guardian.installed,true);
   assert.equal(state.art.npcCount,8);
   assert.equal(state.world.npcCount,9,'Guardian and eight NPCs must remain');
   assert.equal(state.world.bounds.half,83,'The original map must not shrink');
   assert.equal(state.art.cardboardOnlyForEnvironment,true);
   assert(state.frame>100,'No WebGL output');
   assert.equal(errors.length,0,errors.join(' | '));
   await page.screenshot({path:'artifacts/diorama-3d-cast/'+view.name+'.png',timeout:35000});
   console.log('PASS',view.name,state.art.renderMode,'NPCs',state.art.npcCount);
  }finally{await context.close();}
 }
 // Independent real 3D orbit review: all reference angles and cast variants.
 const context=await browser.newContext({viewport:{width:980,height:750},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  const response=await page.goto('http://127.0.0.1:8765/diorama/personaje-3d.html',
   {waitUntil:'domcontentloaded',timeout:40000});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>window.__characterPreviewReady?.ready===true,
   null,{timeout:40000});
  const info=await page.evaluate(()=>window.__characterPreviewReady);
  assert.equal(info.role,'player');
  assert.equal(info.full3D,true);
  assert(info.meshCount>65);
  await page.screenshot({path:'artifacts/diorama-3d-cast/character-front.png',timeout:25000});
  await page.getByRole('button',{name:'Espalda'}).click();
  await page.screenshot({path:'artifacts/diorama-3d-cast/character-back.png',timeout:25000});
  await page.getByRole('button',{name:'Derecha'}).click();
  await page.screenshot({path:'artifacts/diorama-3d-cast/character-side.png',timeout:25000});
  await page.locator('#role').selectOption('npc');
  await page.waitForFunction(()=>window.__characterPreviewReady?.role==='npc');
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('PASS: 360° character preview and NPC variation');
 }finally{await context.close();}
}finally{await browser.close();}
