import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const output='artifacts/diorama-original-skeleton';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--no-sandbox'
]});
try{
 for(const view of [{name:'desktop',width:1280,height:720},
  {name:'mobile-landscape',width:900,height:440}]){
  const context=await browser.newContext({
   viewport:{width:view.width,height:view.height},deviceScaleFactor:1
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  try{
   const res=await page.goto('http://127.0.0.1:8765/diorama/?ci-smoke&scene=meadow',
    {waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(res.status(),200);
   await page.waitForFunction(()=>window.__studioCIReady===true&&
    window.__dioramaCharacters?.restored===true&&
    window.__dioramaWorld?.isDiorama===true,null,{timeout:65000});
   const state=await page.evaluate(()=>({
    rig:window.__dioramaCharacters,
    world:window.__dioramaWorld,
    canvas:document.querySelector('canvas')?.width,
    status:document.body.textContent.includes('ESQUELETO ORIGINAL · RESTAURADO')
   }));
   assert.equal(state.rig.renderMode,'original-articulated-skeleton');
   assert.equal(state.rig.player.mode,'original-articulated-skeleton');
   assert.equal(state.rig.guardian.mode,'original-articulated-skeleton');
   assert.equal(state.rig.player.armJoints,2);
   assert.equal(state.rig.player.legJoints,2);
   assert(state.rig.player.visibleMeshes>20,'Player skeleton not visible');
   assert(state.rig.guardian.visibleMeshes>20,'Guardian skeleton not visible');
   assert.equal(state.rig.npcCount,8);
   assert.equal(state.rig.npcVisuals.length,8);
   assert(state.rig.npcVisuals.every(n=>n.visibleMeshes>20&&n.armJoints===2&&n.legJoints===2));
   assert.equal(state.world.npcCount,9,'NPC locations should remain unchanged');
   assert.equal(state.world.bounds.half,83,'Map bounds were changed');
   assert.equal(state.rig.originalMapPreserved,true);
   assert.equal(state.rig.cardboardOnlyForEnvironment,true);
   assert(state.canvas>100,'Three.js canvas missing');
   assert(state.status,'No visible skeleton restoration status');
   assert.equal(errors.length,0,'Browser errors: '+errors.join(' | '));
   await page.screenshot({path:output+'/'+view.name+'.png',timeout:35000});
   console.log('PASS',view.name,'original visible skeletons:',state.rig.player.visibleMeshes,
    'NPCs:',state.rig.npcCount);
  }finally{await context.close();}
 }
 const page=await browser.newPage();
 const res=await page.goto('http://127.0.0.1:8765/diorama/personaje-3d.html',
  {waitUntil:'domcontentloaded'});
 assert.equal(res.status(),200);
 assert(await page.getByText('Experimento archivado').isVisible());
 assert(await page.getByRole('link',{name:'Volver al juego'}).isVisible());
 console.log('PASS: previous illustrated preview explicitly archived');
 await page.close();
}finally{await browser.close();}
