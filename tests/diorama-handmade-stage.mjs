import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const orig=readFileSync('index.html','utf8');
const diorama=readFileSync('diorama/index.html','utf8');
const art=readFileSync('diorama/handdrawn-stage.mjs','utf8');
const kit=readFileSync('diorama/cardboard-art.mjs','utf8');
const details=readFileSync('diorama/cardboard-details.mjs','utf8');
assert(orig.includes("const MOUNTAIN_STUDIO=new URLSearchParams"),'Original map overwritten');
for(const source of ["const WORLD={half:83,limit:78,plateauHeight:10","const FIELD_RAMPS=[",
 "const CABIN={","const WATER_BODIES=[","function naturalSurfaceY(x,z){"]){
 assert(diorama.includes(source),'Missing original location / topology '+source);
}
for(const part of ["polyFor(kind,variant)","makeCorrugatedTexture",
 "handIllustrated:true","kind==='pine'","kind==='broad'","kind==='mushroom'",
 "kind==='flower'","mountain:{n:2","black marker",
 "oldForest.forEach(m=>m.visible=false)","if(oldShrubs)oldShrubs.visible=false",
 "handmade-cabin-front","cardboard-folded-standing-tabs",
 "drawn-blue-paper-lake-cut-edge","return {status,update,cards}"])
 assert(art.includes(part),'Missing handmade detail '+part);
for(const bit of ["return {status,forest,locations};",
 "return {shrubCount:sites.length,waterRipples:pos.length/22,sites,shrubs};"])
 assert((kit+details).includes(bit),'The existing world sites are not shared');
assert(diorama.includes('handdrawnStage.update()'),'Camera-facing stage not animated');
assert(diorama.includes("assetStyle:'hand-painted-school-cardboard-standees'"));
console.log('Handpainted stage artwork and original-map isolation checks passed.');
