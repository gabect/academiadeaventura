import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 WORLD,ZONES,boundaries,RIVER,BRIDGES,BOARDWALKS,SWAMP_POOLS,LANDMARKS,
 terrainAt,regionAt,canEnter,blockedReason,movePlayer,createWorld,
 nearestLandmark,onBridge,onBoardwalk,pondAt,nearSouthernShallows
} from '../diorama/nuevo-mundo-model.mjs';
const model=createWorld();
assert.equal(model.width,2400);
assert.equal(model.height,1680);
assert.equal(model.seed,WORLD.seed);
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
const mid=RIVER.find((_,i)=>i>=4);
assert(mid,'Missing center river');
const waterY=920,riverX=1161;
assert.equal(blockedReason(riverX,waterY,model),'rio-sin-puente');
assert(SWAMP_POOLS.length>=9);
assert(pondAt(1614,460),'Marsh pool missing');
assert.equal(blockedReason(1614,460,model),'agua-profunda-del-pantano');
const plank=BOARDWALKS[0].points[1];
assert(onBoardwalk(plank[0],plank[1]),'Marsh boardwalk not walkable');
assert(nearestLandmark(1790,1346)?.id==='aldea','Fishing village missing');
assert(LANDMARKS.some(l=>l.kind==='dock'));
assert.equal(blockedReason(1805,1294,model),'casa-villa-costera');
let p={...model.spawn};
const before={...p};
p=movePlayer(p,85,0,model);
assert(Number.isFinite(p.x)&&Number.isFinite(p.y));
assert(Math.hypot(p.x-before.x,p.y-before.y)<=86);
const collisionPoint={x:1120,y:boundaries.south(1120)-15};
const after=movePlayer(collisionPoint,0,250,model);
assert(after.y<=boundaries.south(after.x)+WORLD.shallowSouthPx,
 'Large delta may not tunnel through the southern sea boundary');
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
console.log('PASS: NEW independent 2D world, four biomes, collision on every edge, river bridges, swamps, village and ≤8px southern shallows');
console.log('Summary:',JSON.stringify({
 props:model.objects.length,trees:model.objects.filter(o=>o.kind==='tree').length,
 byBiome:model.categoryCounts,landmarks:LANDMARKS.length,
 bridges:BRIDGES.length,boardwalks:BOARDWALKS.length
}));
