import assert from 'node:assert/strict';
import fs from 'node:fs';
const files={
 art:fs.readFileSync('diorama/cardboard-art.mjs','utf8'),
 details:fs.readFileSync('diorama/cardboard-details.mjs','utf8'),
 palette:fs.readFileSync('diorama/crayon-style.mjs','utf8'),
 html:fs.readFileSync('diorama/index.html','utf8'),
 original:fs.readFileSync('index.html','utf8')
};
for(const key of ['red:','yellow:','blue:','green:','orange:','violet:','ink:'])
 assert(files.palette.includes(key),'Missing primary/secondary palette '+key);
for(const fragment of ['makeCrayonTexture','makeCorrugatedTexture','addSceneryInk',
  'CanvasTexture','LineSegments','EdgesGeometry','rgba(57,35,22'])
 assert(files.palette.includes(fragment),'Missing wax/ink effect '+fragment);
for(const fragment of [
  'academy-crayola-corrugated-strata-v2',
  'corrugated','blackInkCutout=true','cardboardEdge',
  'uCorrugated','vMapUv','diorama-cardboard-','ink.outlineCount',
  "m.color.set(CRAYON.water)",'blackInk:true','corrugatedEdges:true'])
 assert(files.art.includes(fragment),'Missing environment render feature '+fragment);
for(const fragment of [
 'geometry.userData.blackInkCutout=true','cardboardEdge',
 "diorama-ink-water-lines",'vMapUv','CRAYON.lightGreen'])
 assert(files.details.includes(fragment),'Missing shrubs/water feature '+fragment);
for(const fragment of [
 'DIORAMA CRAYOLA','dioramaOutline)return;',
 'window.__dioramaWorld.outlinedWater=true',
 "const WORLD={half:83,limit:78,plateauHeight:10"])
 assert(files.html.includes(fragment),'Missing diorama wiring '+fragment);
assert(files.original.includes("const MOUNTAIN_STUDIO=new URLSearchParams"),
 'Original game file changed inadvertently');
console.log('Crayola palette, hand-ink, exposed corrugated edges and isolated map tests passed.');
