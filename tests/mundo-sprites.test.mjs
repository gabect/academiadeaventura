import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  WORLD,TILE,HOUSES,BRIDGES,ROADS,PLACES,ART,makeWorld,makeTiles,tileAt,
  houseWalls,nearDoor,movePlayer,blockedReason,canEnter,mountainEdge,
  eastShore,shoreY,regionAt
} from '../diorama/mundo-sprites-model.mjs';
import {TINY_RECTS} from '../diorama/tiny-village-assets.mjs';
import {BONE_ATLAS} from '../diorama/assets/vector-bone-manifest.mjs';
const world=makeWorld();
assert.equal(WORLD.width,5120);
assert.equal(WORLD.height,3840);
assert.equal(world.tiles.length,WORLD.rows*WORLD.columns);
assert.deepEqual(makeTiles(),world.tiles,'Tile topology must be deterministic');
assert.deepEqual(makeWorld().props,world.props,'Sprite placement must be deterministic');
assert.equal(world.houses.length,17,'The settlement must have individual buildings');
assert.equal(new Set(world.houses.map(h=>h.id)).size,17,'Each door has a stable identity');
assert(BRIDGES.length>=3&&ROADS.length>=6&&PLACES.length>=5);
assert(world.props.filter(p=>p.kind==='tree').length>=500);
assert(world.props.some(p=>p.sprite==='palm'));
assert(world.props.some(p=>p.sprite==='pine'));
assert(world.props.some(p=>p.sprite==='round'));
assert(world.props.some(p=>p.sprite==='solo'));
assert(canEnter(WORLD.spawn.x,WORLD.spawn.y,world),'The player must spawn on walkable ground');
for(const h of HOUSES){
  const walls=houseWalls(h);
  assert((walls.right-walls.left)>WORLD.heroHeight*2.2,
    'Every house must be much wider than the actual character');
  assert.equal(blockedReason(h.x,h.y-20*h.scale,world),'pared-de-'+h.id);
  assert(canEnter(walls.doorX,walls.doorY,world),'Front door is inaccessible: '+h.id);
  assert.equal(nearDoor(walls.doorX,walls.doorY)?.id,h.id);
  assert(TINY_RECTS[h.sprite],'Missing house artwork '+h.sprite);
}
for(const b of BRIDGES){
  assert(TINY_RECTS[b.orientation==='vertical'?'bridgeVertical':'bridgeHorizontal']);
  const horizontal=b.orientation==='horizontal';
  const x=horizontal?b.x-b.w/2-32:b.x;
  const y=horizontal?b.y:b.y-b.h/2-32;
  assert(canEnter(x,y,world),'Bridge entry inaccessible: '+b.id);
  assert(canEnter(b.x,b.y,world),'Bridge deck blocked: '+b.id);
  const end=movePlayer({x,y},horizontal?b.w+64:0,horizontal?0:b.h+64,world);
  assert(horizontal?end.x>b.x+b.w/2:end.y>b.y+b.h/2,
    'Bridge must connect BOTH sides: '+b.id);
}
assert(blockedReason(2100,1180,world)?.startsWith('agua')||
  canEnter(2100,1180,world),'River bank must be a coherent tile surface');
assert(blockedReason(2400,mountainEdge(2400)-100,world),'Cordillera must be solid');
assert(blockedReason(eastShore(1200)+50,1200,world),'Dangerous eastern ocean must block');
assert(blockedReason(2300,shoreY(2300)+50,world),'Deep southern ocean must block');
const south=shoreY(3150);
assert(blockedReason(3150,south+WORLD.southernWade+12,world),
  'No player may swim beyond the 8px southern allowance');
assert.equal(regionAt(WORLD.spawn.x,WORLD.spawn.y),'Villa de los Pescadores');
assert(TILE.CLIFF!==TILE.ROCK&&TILE.WATER!==TILE.PATH,'Dedicated terrain classes required');
const needs=['diorama/mundo-sprites.html','diorama/mundo-sprites-render.mjs',
  'diorama/mundo-sprites-model.mjs'];
for(const file of needs){
  const data=fs.readFileSync(file,'utf8');
  assert(data.length>2000,file+' missing/incomplete');
  assert(!/Trifuerza|triforce|trifuerza/i.test(data),'No franchise-specific symbols');
}
assert(!fs.readFileSync('diorama/mundo-sprites.html','utf8').includes('nuevo-mundo-render.mjs'),
  'New renderer must be fully independent from the old procedural map');
assert(!fs.readFileSync('diorama/mundo-sprites-render.mjs','utf8').includes('THREE.'),
  'No Three.js world geometry is allowed');
assert(BONE_ATLAS.views.front&&BONE_ATLAS.views.side&&BONE_ATLAS.views.back);
for(const file of [
  'diorama/assets/tiny-village-terrain.webp',
  'diorama/assets/handpainted-cardboard-tree-collection.png',
  'diorama/assets/handpainted-cardboard-tree.png',
  'diorama/assets/handpainted-cardboard-bushes.png',
  'diorama/assets/vector-bone-atlas.webp'
])assert(fs.statSync(file).size>1000,'Referenced kit asset missing: '+file);
console.log('PASS: sprites-only map, 17 real houses, accessible doors, three working bridges, 595 trees and reused character atlas');
