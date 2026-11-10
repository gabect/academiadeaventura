import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createStudioFoliageGeometry} from '../src/studio-organic-geometry.mjs';
const forest=createStudioFoliageGeometry(THREE);
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/studio-organic-geometry.mjs',import.meta.url),'utf8');
assert(source.includes('function curvedBranch('));
assert(source.includes('function foliageBud('));
assert(source.includes('const trunkBase=[0,-2.40,0]'));
assert(source.includes('const pineBottom=-2.40'));
assert(!source.includes('const trunk=[0,-.54,0]'));
assert.equal(forest.pineVariants.length,6);
assert.equal(forest.broadleafVariants.length,5);
assert.strictEqual(forest.pine,forest.pineVariants[0]);
assert.strictEqual(forest.broadleaf,forest.broadleafVariants[0]);
function validate(g,kind){
 assert(g.isBufferGeometry,kind+' must be a BufferGeometry');
 const p=g.getAttribute('position'),c=g.getAttribute('color'),n=g.getAttribute('normal');
 assert(p.count===c.count&&n.count===p.count,kind+' attribute mismatch');
 const uv=g.getAttribute('uv');
 assert(uv?.count===p.count,kind+' requires UVs for painterly pigments');
 for(const val of uv.array)assert(Number.isFinite(val),kind+' invalid UV coordinate');
 if(kind!=='meadow'){
  assert(g.groups.length===2,kind+' should separate leaves from bark');
  assert(g.groups[0].materialIndex===0&&g.groups[1].materialIndex===1);
  assert(g.groups[1].count>0,kind+' bark surface is missing');
  assert(g.userData.leafTriangles>0&&g.userData.barkTriangles>0);
  assert.equal(g.userData.integratedTrunk,true,kind+' requires a continuous trunk');
  assert.equal(g.userData.trunkBaseY,-2.40);
  g.computeBoundingBox();
  assert(g.boundingBox.min.y<=-2.39,'trunk must reach actual terrain');

  assert(g.userData.barkTriangles>=(kind.startsWith('broadleaf')?240:170),
   kind+' missing continuous branch geometry');

 }
 assert(g.index.count>150,kind+' missing indexed triangles');
 for(const a of [p,c,n])for(const v of a.array)
  assert(Number.isFinite(v),kind+' contains invalid vertex data');
 g.computeBoundingBox();
 const b=g.boundingBox,extent=b.max.clone().sub(b.min);
 assert(extent.y>.55&&extent.x>1&&extent.z>1,kind+' must have 3D volume');
 return {bounds:[...b.min.toArray(),...b.max.toArray()].map(x=>+x.toFixed(2)),
  triangles:g.index.count/3,branches:g.userData.branchCount||0,
  reach:g.userData.maxReach||0};
}
validate(forest.meadow,'meadow');
const silhouettes=new Set();
for(const family of ['pine','broadleaf']){
 const collection=family==='pine'?forest.pineVariants:forest.broadleafVariants;
 for(let i=0;i<collection.length;i++){
  const g=collection[i],info=validate(g,family+'_'+i);
  assert.equal(g.userData.family,family);
  assert.equal(g.userData.variant,i);
  assert(info.branches>=(family==='pine'?26:12));
  assert(info.reach>(family==='pine'?.9:2.1));
  if(family==='broadleaf'){
   assert(info.bounds[3]-info.bounds[0]>3.5,'Broadleaf limbs must spread sideways');
   assert(info.bounds[4]-info.bounds[1]>2.0,'Broadleaf limbs must rise');
  }
  silhouettes.add(family+JSON.stringify(info.bounds));
  console.log(family,i,info);
 }
}
assert(silhouettes.size>=11,'Forest variants must not be cloned geometry');
console.log('Forest geometry checks passed: 6 irregular pines, 5 wide-branching trees');
