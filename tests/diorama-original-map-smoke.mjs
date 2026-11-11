import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const actual=fs.readFileSync('diorama/index.html','utf8');
const original=fs.readFileSync('index.html','utf8');
for(const key of [
 'const WORLD={half:83,limit:78,plateauHeight:10',
 'const FIELD_TREE_POSITIONS=[',
 'const WATER_BODIES=[',
 'const UPPER_RIVER_NODES=[',
 'const RIVER_NODES=[',
 'const FIELD_RAMPS=[',
 'const CABIN={',
 'const LAKE_PLATFORM={',
 'const NPC_MARKERS=[',
 'function naturalSurfaceY(x,z){',
 'function moveWithCollisions('
]){
 const pos=original.indexOf(key),p=actual.indexOf(key);
 assert(pos>=0&&p>=0,'Original map component absent: '+key);
 const size=key.startsWith('function ')?180:Math.min(420,original.length-pos);
 assert.equal(actual.slice(p,p+size),original.slice(pos,pos+size),
  'The original map was altered: '+key);
}
assert(actual.includes('<base href="../">'));
assert(actual.includes("const MOUNTAIN_STUDIO=true;"));
assert(actual.includes("const SAVE_KEY='adventure-academy-diorama-progression-v1'"));
assert(actual.includes("installCardboardArt({"));
assert(actual.includes('new THREE.PerspectiveCamera(42'));
assert(actual.includes('let cameraHeading=Math.PI,cameraPitch=.62'));
console.log('Map invariants: original dimensions, physics, routes, NPCs and water are exact.');
fs.mkdirSync('artifacts/diorama-full',{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader',
 '--disable-dev-shm-usage','--no-sandbox']});
const failures=[];
for(const conf of [
 {name:'valley-desktop',width:1280,height:720,scene:'meadow',mobile:false},
 {name:'summit',width:1040,height:650,scene:'summit-overlook',mobile:false},
 {name:'lake',width:920,height:518,scene:'cliff',mobile:false},
 {name:'mobile-portrait',width:390,height:844,scene:'meadow',mobile:true},
 {name:'mobile-landscape',width:900,height:440,scene:'route30',mobile:true}
]){
 const context=await browser.newContext({viewport:{width:conf.width,height:conf.height},
  deviceScaleFactor:1,isMobile:conf.mobile,hasTouch:conf.mobile});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 try{
  const res=await page.goto('http://127.0.0.1:8765/diorama/?ci-smoke&scene='+conf.scene,
   {waitUntil:'domcontentloaded',timeout:38000});
  assert.equal(res.status(),200);
  await page.waitForFunction(()=>window.__studioCIReady===true&&window.__dioramaWorld?.isDiorama===true&&window.__dioramaWorld?.userSprites?.ready===true,
   null,{timeout:24000});
  const state=await page.evaluate(()=>({
   world:window.__dioramaWorld,
   canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON(),
   label:document.getElementById('buildLabel')?.textContent,
   appTitle:document.title,
   studio:window.__studioArtStatus,
   framebuffer:document.querySelector('canvas')?.width||0
  }));
  assert(state.world.userSprites?.ready,'Uploaded PNG textures did not load');
  assert.equal(state.world.userSprites.variants,12,'Expected four original tree images and eight bush crops');
  assert.equal(state.world.userSprites.redrawn,false,'Do not redraw user artwork');
  assert.equal(state.world.userSprites.untouchedPixels,true);
  assert(state.world.userSprites.drawCalls>=11,'Missing PNG sprite families');
  assert(state.world.userSprites.sprites>100,'Sprites not instanced at authored locations');
  assert(state.world.userSprites.usedVariants.includes('palm-tree'),'Uploaded palm variant not displayed');
  assert(state.world.terrainExact&&state.world.physicsReused);
  assert.equal(state.world.bounds.half,83);
  assert.equal(state.world.bounds.limit,78);
  assert.equal(state.world.bounds.plateauHeight,10);
  assert(state.world.treeCounts.pine>10);
  assert(state.world.treeCounts.broadleaf>10);
  assert(state.world.stage?.style==='hand-painted-school-cardboard-standees',
   'Handmade school scenery must replace the old extruded look');
  assert(state.world.stage?.trees>20,'Original tree positions were lost');
  assert(state.world.stage?.plants>50,'Original ground vegetation was lost');
  assert(state.world.stage?.flowers>0&&state.world.stage?.mushrooms>0,
   'Hand-painted flowers and mushrooms missing');
  assert(state.world.stage?.mountainBackdrops>=3,'Mountains should have paper theater backdrops');
  assert(state.world.stage?.cabinFacade,'Cardboard illustrated cabin missing');
  assert(state.world.stage?.foldedSupports>0,'Cardboard scenery has no standing tabs');
  assert(state.world.papercraftShrubs>50,'Real shrub placement data must render as paper');
  assert(state.world.waterRipples>15,'Original water requires drawn ripples');
  assert.equal(state.world.npcCount,9);
  assert(state.world.ramps.some(x=>x.rise>2));
  assert(state.world.waterBodies.some(x=>x.id==='lake-organic'));
  assert(state.canvas.width>conf.width*.7);
  assert(state.framebuffer>0);
  assert.equal(errors.length,0,'Browser errors: '+errors.join(' || '));
  await page.screenshot({path:'artifacts/diorama-full/'+conf.name+'.png',timeout:20000});
  console.log('PASS',conf.name,JSON.stringify({
   trees:state.world.treeCounts,npcs:state.world.npcCount,
   world:state.world.bounds,camera:state.world.camera}));
 }catch(e){failures.push(conf.name+': '+e.message);console.error('FAIL',conf.name,e.message)}
 finally{await context.close()}
}
await browser.close();
if(failures.length){console.error('Diorama failures',failures);process.exitCode=1}
