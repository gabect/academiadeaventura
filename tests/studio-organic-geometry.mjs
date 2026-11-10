// Real official Three.js CPU build, not a GPU test.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStudioFoliageGeometry} from '../src/studio-organic-geometry.mjs';
const result=createStudioFoliageGeometry(THREE);
for(const [kind,g] of Object.entries(result)){
 assert(g.isBufferGeometry,kind+' must be BufferGeometry');
 const pos=g.getAttribute('position'),colors=g.getAttribute('color'),norm=g.getAttribute('normal');
 assert(pos.count===colors.count&&norm.count===pos.count);
 assert(pos.count>100,kind+' too few vertices');
 assert(g.index.count>100,kind+' missing triangles');
 for(const attr of [pos,colors,norm])
  for(const v of attr.array)assert(Number.isFinite(v),kind+' contains nonfinite geometry');
 g.computeBoundingBox();
 const bb=g.boundingBox;
 assert(bb.max.y>bb.min.y+.25,kind+' no vertical volume');
 assert(bb.max.x>bb.min.x+.5&&bb.max.z>bb.min.z+.5,kind+' no radial volume');
 console.log(kind,{vertices:pos.count,triangles:g.index.count/3,
  boundingBox:[bb.min.toArray(),bb.max.toArray()]});
}
console.log('Organic foliage CPU mesh checks passed');
