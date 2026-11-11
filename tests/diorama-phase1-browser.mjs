import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

fs.mkdirSync('artifacts/diorama',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage']});
const failures=[];
for(const target of [
 {name:'desktop',width:1280,height:720,mobile:false},
 {name:'mobile',width:390,height:844,mobile:true},
 {name:'landscape',width:900,height:440,mobile:true}
]){
 const context=await browser.newContext({viewport:{width:target.width,height:target.height},
  deviceScaleFactor:1,isMobile:target.mobile,hasTouch:target.mobile});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  const response=await page.goto('http://127.0.0.1:8765/diorama/',
   {waitUntil:'domcontentloaded',timeout:45000});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>window.__dioramaStatus?.ready===true
    &&window.__dioramaStatus.renderedFrames>=5,null,{timeout:45000});
  const before=await page.evaluate(()=>structuredClone(window.__dioramaStatus));
  assert.equal(before.version,'phase1');
  assert.equal(before.mapComplete,false);
  assert.equal(before.camera,'orthographic-isometric');
  assert.equal(before.originalFilesChanged,false);
  assert.equal(before.objects.npc3D,2);
  assert(before.objects.cardboardTrees>=12);
  assert.equal(errors.length,0,errors.join('\n'));
  await page.screenshot({path:'artifacts/diorama/'+target.name+'.png',timeout:30000});
  await page.keyboard.down('KeyW');await page.waitForTimeout(330);
  await page.keyboard.up('KeyW');
  const after=await page.evaluate(()=>structuredClone(window.__dioramaStatus));
  assert(Math.hypot(after.player.x-before.player.x,after.player.z-before.player.z)>.1,
   'W input did not move the character');
  await page.keyboard.press('KeyE');
  const turned=await page.evaluate(()=>window.__dioramaStatus.angle);
  assert(Math.abs(turned-before.angle-Math.PI/4)<.01,'Q/E rotation failed');
  await page.locator('#zoomIn').click();
  await page.locator('#zoomOut').click();
  assert.equal(errors.length,0,errors.join('\n'));
  console.log(target.name,'PASS',JSON.stringify(before), 'move',JSON.stringify(after.player));
 }catch(e){failures.push(target.name+': '+e.message);console.error(target.name,e)}
 finally{await context.close();}
}
await browser.close();
if(failures.length){console.error('Diorama smoke failures:',failures);process.exitCode=1;}
