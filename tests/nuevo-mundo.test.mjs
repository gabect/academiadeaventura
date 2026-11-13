import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 WORLD,ZONES,boundaries,RIVER,BRIDGES,BOARDWALKS,SWAMP_POOLS,LANDMARKS,
 terrainAt,regionAt,canEnter,blockedReason,movePlayer,createWorld,
 nearestLandmark,onBridge,onBoardwalk,pondAt,nearSouthernShallows,
 VILLAGE_BUILDINGS,cottageWalls,nearCottageDoor,HERO_VISUAL,RIVER_HALF_WIDTH,riverCenterAt
} from '../diorama/nuevo-mundo-model.mjs';
const model=createWorld();
assert.equal(model.width,2400);
assert.equal(model.height,1680);
assert.equal(model.seed,WORLD.seed);
assert.equal(RIVER_HALF_WIDTH*2,164,'River should be a broad physical river, not a pencil line');
assert.deepEqual(createWorld().objects,model.objects,'Overworld must be deterministic');
assert(model.objects.length>=350,'Forest and scenery too sparse: '+model.objects.length);
assert(model.objects.filter(o=>o.kind==='tree').length>=180,'No dense forest');
assert(model.objects.some(o=>o.kind==='dead-tree'),'Missing marsh dead trees');
assert(model.objects.some(o=>o.kind==='reeds'),'Missing marsh reeds');
for(const key of ['north','west','east','south']){
 assert(model.objects.some(o=>o.zone===key),'Empty biome '+key);
 assert(ZONES.some(z=>z.id===key));
}
assert.equal(regionAt(1100,400),'north');
assert.equal(regionAt(380,850),'west');
assert.equal(regionAt(1950,850),'east');
assert.equal(regionAt(1750,1300),'south');
assert.equal(regionAt(1110,880),'center');
assert.equal(terrainAt(1100,60),'mountain');
assert.equal(terrainAt(10,820),'western-ocean');
assert.equal(terrainAt(2365,820),'eastern-ocean');
assert.equal(terrainAt(750,1670),'southern-ocean');
assert(canEnter(WORLD.spawn.x,WORLD.spawn.y,model),'Initial spawn collides');
for(const x of [300,800,1200,1800,2220]){
 assert(blockedReason(x,boundaries.north(x)-15,model),
  'North mountain must block every edge at x='+x);
}
for(const y of [340,760,1100,1400]){
 const w=boundaries.west(y),e=boundaries.east(y);
 assert(blockedReason(w+45,y,model)?.startsWith('oeste-'),
  'West cliff coast is impassable at y='+y);
 assert(blockedReason(e+2,y,model)?.startsWith('este-'),
  'East beach must never permit ocean swimming at y='+y);
}
for(const x of [400,750,1500,2080]){
 const y=boundaries.south(x);
 assert(nearSouthernShallows(x,y+4),'Southern wading strip not detected');
 assert(!nearSouthernShallows(x,y+9),'Southern wading exceeds eight pixels');
 assert(canEnter(x,y+4,model,{radius:WORLD.playerRadius}),
  'Player cannot enter permitted southern shallows at x='+x);
 assert.equal(blockedReason(x,y+9,model),'sur-profundidad-del-mar',
  'More than 8px south of the shoreline must be blocked');
}
for(const bridge of BRIDGES){
 assert(onBridge(bridge.x,bridge.y),'Bridge collider invalid');
 assert(canEnter(bridge.x,bridge.y,model),'Bridge must permit passage');
}
const centerBridge=BRIDGES.find(b=>b.id==='puente-central');
assert(centerBridge,'Central bridge missing');
const left={x:centerBridge.x-centerBridge.w/2-12,y:centerBridge.y};
assert(canEnter(left.x,left.y,model),'Player must approach the west bank of bridge');
const crossed=movePlayer(left,centerBridge.w+25,0,model);
assert(crossed.x>centerBridge.x+centerBridge.w/2,
 'Character should physically walk from one bank to the other');
assert.equal(blockedReason(centerBridge.x,centerBridge.y+centerBridge.h/2+42,model),
 'rio-sin-puente','Off-bridge river crossing must remain blocked');
const mid=RIVER.find((_,i)=>i>=4);
assert(mid,'Missing center river');
const waterY=920,riverX=1161;
assert.equal(blockedReason(riverX,waterY,model),'rio-sin-puente');
assert(SWAMP_POOLS.length>=9);
assert(pondAt(1614,460),'Marsh pool missing');
assert.equal(blockedReason(1614,460,model),'agua-profunda-del-pantano');
const plank=BOARDWALKS[0].points[1];
assert(onBoardwalk(plank[0],plank[1]),'Marsh boardwalk not walkable');
assert(nearestLandmark(1810,1365)?.id==='aldea','Fishing village missing');
assert(LANDMARKS.some(l=>l.kind==='dock'));
assert.equal(VILLAGE_BUILDINGS.length,5);
assert(HERO_VISUAL.height>=58&&HERO_VISUAL.height<=72);
assert(HERO_VISUAL.bodyWidth>=WORLD.playerRadius*2);
for(const hut of VILLAGE_BUILDINGS){
 const box=cottageWalls(hut);
 assert(box.right-box.left>HERO_VISUAL.bodyWidth*3,
  'Each cottage must be substantially wider than the character');
 assert(hut.scale>=1.85,'Each cottage must be rendered noticeably bigger');
 assert(['house0','house1','house2','house3','house4'].includes(hut.sprite),
  'Cottages must use actual source sprite frames, not generic drawing');
 assert.equal(blockedReason(hut.x,hut.y-18*hut.scale,model),
  'casa-villa-costera','Each visible cottage must have solid walls');
 const entranceY=box.doorY+13;
 assert.equal(nearCottageDoor(hut.x,entranceY)?.id,hut.id,
  'Each door must be individually approachable');
 assert(canEnter(hut.x,entranceY,model),
  'Walkable exterior in front of cottage entrance '+hut.id);
}
for(const bridge of BRIDGES){
 assert(bridge.w>=300&&bridge.h>=90,
  'Bridge should read as traversable structure, not icon');
 assert(bridge.h>=HERO_VISUAL.bodyWidth*3,
  'Bridge walking deck is not wide enough for protagonist');
}
let p={...model.spawn};
const before={...p};
p=movePlayer(p,85,0,model);
assert(Number.isFinite(p.x)&&Number.isFinite(p.y));
assert(Math.hypot(p.x-before.x,p.y-before.y)<=86);
const collisionPoint={x:1120,y:boundaries.south(1120)-15};
const after=movePlayer(collisionPoint,0,250,model);
assert(after.y<=boundaries.south(after.x)+WORLD.shallowSouthPx,
 'Large delta may not tunnel through the southern sea boundary');
const {TINY_RECTS}=await import('../diorama/tiny-village-assets.mjs');
for(const key of ['house0','house1','house2','house3','house4',
 'bridgeHorizontal','grassTile','sandTile','waterTile','rock0','rock1']){
 const r=TINY_RECTS[key];
 assert(r&&r.length===4&&r[2]>0&&r[3]>0,'Source atlas entry missing '+key);
 assert(r[0]+r[2]<=1024&&r[1]+r[3]<=1024);
}
const atlas=fs.readFileSync('diorama/assets/tiny-village-terrain.webp');
assert(atlas.length>20000,'Game-only assets atlas was not stored');
assert.equal(atlas.toString('ascii',0,4),'RIFF');
assert.equal(atlas.toString('ascii',8,12),'WEBP');
const expected=['diorama/nuevo-mundo.html','diorama/nuevo-mundo-render.mjs'];
for(const file of expected)assert(fs.readFileSync(file,'utf8').length>5000,'Missing '+file);
const html=fs.readFileSync(expected[0],'utf8');
assert(html.includes("import {createOverworldRenderer}"));
assert(html.includes("id=\"stick\""));
assert(html.includes("id=\"mapBtn\""));
for(const file of [expected[0],expected[1],'diorama/nuevo-mundo-model.mjs']){
 assert(!/Trifuerza|triforce|trifuerza/i.test(fs.readFileSync(file,'utf8')),
  'Unwanted franchise-specific emblem in '+file);
}
console.log('PASS: NEW 2D world: four biomes, five physical cottages, scale-coherent bridges, solid coast, 8px shallow water');
console.log('Summary:',JSON.stringify({
 props:model.objects.length,trees:model.objects.filter(o=>o.kind==='tree').length,
 byBiome:model.categoryCounts,landmarks:LANDMARKS.length,
 bridges:BRIDGES.length,boardwalks:BOARDWALKS.length
}));
