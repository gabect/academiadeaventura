import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const out='artifacts/new-overworld';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--no-sandbox'
]});
try{
 for(const view of [
  {name:'desktop',width:1440,height:810,touch:false},
  {name:'mobile-landscape',width:900,height:440,touch:true}
 ]){
  const context=await browser.newContext({
   viewport:{width:view.width,height:view.height},
   deviceScaleFactor:1,hasTouch:view.touch,isMobile:view.touch
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  try{
   const res=await page.goto('http://127.0.0.1:8765/diorama/nuevo-mundo.html',
    {waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(res.status(),200,'New world route unavailable');
   await page.waitForFunction(()=>window.__newWorld?.ready&&
    window.__newWorld?.assetState==='loaded',null,{timeout:30000});
   const state=await page.evaluate(()=>({
    mode:window.__newWorld.mode,model:window.__newWorld.models,
    assets:window.__newWorld.assetState,player:window.__newWorld.player,
    props:window.__newWorld.totalProps,canvas:document.getElementById('game').width,
    legacyLink:!!document.querySelector('a[href="./"]')
   }));
   assert.equal(state.mode,'canvas-2d');
   assert.equal(state.assets,'loaded','Embedded Tiny Swords forest image missing');
   assert(state.props>=350,'Four-region vegetation missing');
   assert.equal(state.model.shallowSouthPx,8);
   assert.equal(state.model.landmarks,7);
   assert(state.model.bridges>=3);
   assert(state.model.boardwalks>=2);
   assert(state.canvas>500);
   assert.equal(state.legacyLink,true,'Legacy map must remain available');
   // Screenshot a completed still frame; continuous canvas redraw otherwise
   // competes with Playwright's capture on CI software rendering.
   await page.waitForTimeout(240);
   await page.evaluate(()=>window.__newWorld.pauseRendering(true));
   await page.screenshot({path:out+'/'+view.name+'.png',timeout:45000});
   await page.evaluate(()=>window.__newWorld.pauseRendering(false));
   if(!view.touch){
    const origin=state.player;
    await page.keyboard.down('w');
    await page.waitForTimeout(460);
    await page.keyboard.up('w');
    const moved=await page.evaluate(()=>window.__newWorld.player);
    assert(moved.y<origin.y-15,'W key should move north from spawn');
    await page.keyboard.press('m');
    const overview=await page.evaluate(()=>window.__newWorld.overview);
    assert.equal(overview,true);
    await page.waitForTimeout(180);
    await page.evaluate(()=>window.__newWorld.pauseRendering(true));
    await page.screenshot({path:out+'/map-overview.png',timeout:45000});
    await page.evaluate(()=>window.__newWorld.pauseRendering(false));
    await page.keyboard.press('m');
    assert.equal(await page.evaluate(()=>window.__newWorld.overview),false);
    const reached=await page.evaluate(()=>window.__newWorld.teleport(750,1550));
    assert.equal(typeof reached,'boolean');
   }else{
    const stick=page.locator('#stick');
    assert(await stick.isVisible(),'Mobile joystick absent');
    assert(await page.locator('#action').isVisible());
   }
   assert.equal(errors.length,0,'Browser errors: '+errors.join(' | '));
   console.log('PASS',view.name,state);
  }finally{await context.close();}
 }
}finally{await browser.close();}
