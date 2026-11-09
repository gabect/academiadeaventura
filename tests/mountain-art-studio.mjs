// Node-only deterministic texture invariants. No GPU renderer is implied.
import assert from 'node:assert/strict';
import {createMountainStudioTextures} from '../src/mountain-art-studio.mjs';
class DataTexture {
 constructor(data,width,height){this.image={data,width,height};}
}
const THREE={
 DataTexture,RGBAFormat:1023,RepeatWrapping:1000,
 LinearFilter:1006,LinearMipmapLinearFilter:1008,SRGBColorSpace:'srgb'
};
const size=64;
const a=createMountainStudioTextures(THREE,{size});
const b=createMountainStudioTextures(THREE,{size});
for(const kind of ['rock','grass']){
 const texture=a[kind],bytes=texture.image.data;
 assert.equal(bytes.length,size*size*4);
 assert.equal(texture.colorSpace,THREE.SRGBColorSpace);
 assert.equal(texture.wrapS,THREE.RepeatWrapping);
 assert.equal(texture.generateMipmaps,true);
 assert.deepEqual(bytes,b[kind].image.data,'Texture must be reproducible');
 let min=255,max=0,delta=0;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const offset=(y*size+x)*4;
  assert.equal(bytes[offset+3],255);
  min=Math.min(min,bytes[offset]);max=Math.max(max,bytes[offset]);
 }
 for(let y=0;y<size;y++)for(let c=0;c<3;c++)
  delta+=Math.abs(bytes[(y*size)*4+c]-bytes[(y*size+size-1)*4+c]);
 assert(max-min>25,kind+' must contain surface detail');
 assert(delta/size/3<18,kind+' needs near-matching tile edges');
 console.log(kind,{size,range:[min,max],meanHorizontalSeam:delta/size/3});
}
assert.throws(()=>createMountainStudioTextures(THREE,{size:16}),/size/);
console.log('Mountain studio CPU texture tests passed (not WebGL validation)');
