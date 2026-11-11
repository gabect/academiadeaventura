import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--no-sandbox']});
fs.mkdirSync('artifacts/diorama-turning',{recursive:true});
const context=await browser.newContext({viewport:{width:960,height:540},deviceScaleFactor:1});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
const angleError=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));

try{
 const res=await page.goto('http://127.0.0.1:8765/diorama/?motion-test',
  {waitUntil:'domcontentloaded',timeout:50000});
 assert.equal(res.status(),200);
 await page.waitForFunction(()=>window.__dioramaMotionQA?.frames>5,
  null,{timeout:70000});
 async function read(){return page.evaluate(()=>({...window.__dioramaMotionQA}));}
 const initial=await read();
 assert(Math.abs(angleError(initial.cameraHeading,Math.PI))<.01,
  'The original Animal Crossing camera must start behind the character');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('Start facing',initial.yaw,'camera',initial.cameraHeading);
 const moves=[
  {code:'KeyS',heading:0,name:'toward-camera',axis:'z',dir:1},
  {code:'KeyD',heading:Math.PI/2,name:'right',axis:'x',dir:1},
  {code:'KeyA',heading:-Math.PI/2,name:'left',axis:'x',dir:-1},
  {code:'KeyW',heading:Math.PI,name:'away-camera',axis:'z',dir:-1}
 ];
 for(const move of moves){
  const before=await read();
  await page.keyboard.down(move.code);
  await page.waitForFunction(({heading,x,z,axis,dir})=>{
   const state=window.__dioramaMotionQA;
   if(!state)return false;
   const yawError=Math.atan2(Math.sin(state.yaw-heading),Math.cos(state.yaw-heading));
   return Math.abs(yawError)<.53 &&
     (axis==='x'?(state.x-x)*dir:(state.z-z)*dir)>.19;
  },{heading:move.heading,x:before.x,z:before.z,axis:move.axis,dir:move.dir},
  {timeout:20000,polling:120});
  const state=await read();
  await page.keyboard.up(move.code);
  assert(Math.abs(angleError(state.yaw,move.heading))<.54,
   'Did not turn toward '+move.name);
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS '+move.name+' yaw='+state.yaw.toFixed(3)+
   ' position=('+state.x.toFixed(2)+','+state.z.toFixed(2)+')');
  await page.waitForTimeout(180);
 }
 // Idle camera rotation should never turn the standing avatar in place.
 await page.waitForTimeout(320);
 const idle=await read();
 await page.keyboard.down('ArrowRight');
 await page.waitForTimeout(430);
 await page.keyboard.up('ArrowRight');
 await page.waitForTimeout(160);
 const turnedCamera=await read();
 assert(Math.abs(angleError(turnedCamera.cameraHeading,idle.cameraHeading))>.08,
  'Camera arrows did not rotate the camera');
 assert(Math.abs(angleError(turnedCamera.yaw,idle.yaw))<.02,
  'Camera orbit incorrectly forced idle avatar to swivel');
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS stationary avatar stays facing while orbiting the camera');
}catch(error){
 console.error('Browser directional test failed:',error.message,errors);
 process.exitCode=1;
 // Avoid page.screenshot while software WebGL is animating continuously.
}finally{await context.close();await browser.close()}
