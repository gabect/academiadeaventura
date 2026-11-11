import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createStudioTreeImpostors} from '../src/studio-tree-impostors.mjs';
class Attr{
 constructor(values,stride){this.array=values;this.itemSize=stride;this.count=values.length/stride;}
}
class Geom{
 constructor(){this.attributes={};this.userData={};this.isBufferGeometry=true;}
 setAttribute(name,attribute){this.attributes[name]=attribute;return this;}
 setIndex(index){this.index={array:index,count:index.length};return this;}
 getAttribute(name){return this.attributes[name];}
 computeVertexNormals(){}computeBoundingSphere(){}
}
class Material{constructor(config){Object.assign(this,config);}}
class Texture{constructor(){this.repeat={set(){}};}}
const paths=[];
class TextureLoader{
 load(path,callback){paths.push(path);callback(new Texture());return new Texture();}
}
const THREE={
 BufferGeometry:Geom,Float32BufferAttribute:Attr,MeshBasicMaterial:Material,
 TextureLoader,DoubleSide:2,SRGBColorSpace:'srgb',ClampToEdgeWrapping:1001,
 LinearMipmapLinearFilter:1008,LinearFilter:1006
};
const forest=createStudioTreeImpostors(THREE);
assert.equal(forest.info.version,'0.60.0');
assert.equal(forest.info.style,'licensed-rendered-tree-billboards');
assert.equal(forest.info.loaded,2);
assert.equal(forest.info.errors.length,0);
assert.equal(forest.pineVariants.length,6);
assert.equal(forest.broadleafVariants.length,5);
assert.deepEqual(paths,[
 './assets/studio_hd/trees/tree-pine-atlas.png',
 './assets/studio_hd/trees/tree-broadleaf-atlas.png'
]);
for(const [family,geos] of [['pine',forest.pineVariants],
 ['broadleaf',forest.broadleafVariants]]){
 for(const [i,g] of geos.entries()){
  assert(g.userData.impostor);
  assert.equal(g.userData.variant,i);
  assert.equal(g.userData.family,family);
  assert.equal(g.userData.quadCount,1);
  assert.equal(g.index.count,6,'Only two triangles, no 3D bark or leaf mesh');
  assert.equal(g.getAttribute('position').count,4);
  assert.equal(g.getAttribute('uv').count,4);
  const coords=Array.from(g.getAttribute('uv').array);
  assert(coords.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
  assert(g.getAttribute('position').array[1]===-2.40);
 }
 const mat=forest[family+'Material'];
 assert.equal(mat.alphaTest,.28);
 assert.equal(mat.transparent,false);
 assert.equal(mat.visible,true);
 assert(mat.map,'PNG must have loaded');
 const shader={vertexShader:'void main(){\n#include <project_vertex>\n}'};
 mat.onBeforeCompile(shader);
 assert(shader.vertexShader.includes('#ifdef USE_INSTANCING'));
 assert(shader.vertexShader.includes('gl_Position=projectionMatrix'));
 assert(shader.vertexShader.includes('viewMatrix'),'Billboard must track camera upright');
 assert(!shader.vertexShader.includes('#include <project_vertex>'));
 const file='assets/studio_hd/trees/tree-'+family+'-atlas.png';
 const bytes=fs.readFileSync(file);
 assert(bytes.length>20000,file+': PNG too small');
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','Not PNG');
 assert.equal(bytes.readUInt32BE(16),1536,'Atlas width should be 3x512');
 assert.equal(bytes.readUInt32BE(20),1024,'Atlas height should be 2x512');
 console.log(file,bytes.length+' bytes',geos.length+' unique whole-tree sprites');
}
console.log('Full-tree PNG billboard structural checks passed');
