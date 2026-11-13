import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tinyRegion,classifyTinySites}
 from '../diorama/tiny-swords-overworld.mjs';
const trees={
 pine:[{x:-3,z:12},{x:7,z:4},{x:12,z:2}],
 broadleaf:[{x:2,z:5},{x:4,z:9}]
};
const bushes=[{x:1,z:2},{x:2,z:3}],stones=[{x:11,z:11},{x:12,z:12},{x:13,z:13}];
const sites=classifyTinySites(trees,bushes,stones);
assert.equal(sites.length,3+2+Math.ceil(bushes.length/7)+Math.ceil(stones.length/4));
assert.deepEqual(sites.filter(x=>x.kind.startsWith('tree')).map(x=>x.site),
 trees.pine.concat(trees.broadleaf),'Original tree sites must not be relocated');
assert(sites.every(x=>Number.isFinite(x.site.x)&&Number.isFinite(x.site.z)));
for(const site of sites){
 const rect=tinyRegion(site.kind);
 assert(rect,site.kind);
 const [x,y,w,h]=rect;
 assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=1024&&y+h<=1024);
}
for(const key of ['tree1','tree2','tree3','tree4','bush1','bush2','bush3','bush4',
 'rock1','rock2','rock3','rock4']){
 assert(tinyRegion(key));
}
for(const asset of ['tiny-overworld.webp','tiny-ground.webp','tiny-water.webp']){
 const data=fs.readFileSync('diorama/assets/'+asset);
 assert(data.length>30,asset);
 assert.equal(data.toString('ascii',0,4),'RIFF',asset);
 assert.equal(data.toString('ascii',8,12),'WEBP',asset);
}
const game=fs.readFileSync('diorama/index.html','utf8');
const terrain=fs.readFileSync('diorama/crayon-terrain.mjs','utf8');
for(const token of ["installTinySwordsOverworld({","treeLocations:dioramaArt.locations",
 "stoneSites:MOUNTAIN_STONE_SITES","tinySwordsScenery?.update()",
 "artStyle:CLASSIC_VIEW?'tiny-swords':'crayon'",
 "window.__dioramaWorld.classicAssetPack="]){
 assert(game.includes(token),'Game integration missing '+token);
}
assert(terrain.includes('tiny-ground.webp')&&terrain.includes('tiny-water.webp'));
assert(terrain.includes('waterCoverageAt')&&terrain.includes('shorelinePixels'),
 'The original physical water/shoreline must remain');
console.log('PASS: selected Tiny Swords in-game atlas, fixed source coordinates and classic water/grass');
