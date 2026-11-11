import assert from 'node:assert/strict';
import {worldWalkDirection,shortestTurnDelta,faceWalkDirection} from '../diorama/directional-facing.mjs';

// Original camera starts at PI. The full eight compass directions must map
// to world space without limiting the character to facing camera-forward.
const eight=[
 ['W',0,1,0,-1,Math.PI],
 ['S',0,-1,0,1,0],
 ['A',-1,0,-1,0,-Math.PI/2],
 ['D',1,0,1,0,Math.PI/2],
 ['W+A',-1,1,-Math.SQRT1_2,-Math.SQRT1_2,-3*Math.PI/4],
 ['W+D',1,1,Math.SQRT1_2,-Math.SQRT1_2,3*Math.PI/4],
 ['S+A',-1,-1,-Math.SQRT1_2,Math.SQRT1_2,-Math.PI/4],
 ['S+D',1,-1,Math.SQRT1_2,Math.SQRT1_2,Math.PI/4]
];
for(const [name,r,f,x,z,expectedYaw] of eight){
 const v=worldWalkDirection(r,f,Math.PI);
 assert(Math.abs(v.x-x)<1e-12,name+' x');
 assert(Math.abs(v.z-z)<1e-12,name+' z');
 let yaw=Math.PI;
 for(let i=0;i<120;i++)yaw=faceWalkDirection(yaw,v.x,v.z,1/60);
 assert(Math.abs(shortestTurnDelta(yaw,expectedYaw))<.005,
  name+' never turned to the desired world direction');
 console.log('PASS '+name+' -> '+expectedYaw.toFixed(3)+' radians');
}
assert.equal(worldWalkDirection(0,0,Math.PI).length,0);
assert.equal(faceWalkDirection(.92,0,0,1/60),.92,'Do not swivel when idle');
const firstStep=faceWalkDirection(Math.PI,0,1,1/60);
assert(Math.abs(shortestTurnDelta(Math.PI,firstStep))<.3,
 '180 degree reversal must turn gradually, not snap');
assert(Math.abs(shortestTurnDelta(3.1,-3.1))<.1,
 'Turning across 180-degree boundary must take shortest arc');
for(const fps of [30,60,120]){
 let y=0;
 for(let i=0;i<fps;i++)y=faceWalkDirection(y,1,0,1/fps);
 assert(Math.abs(shortestTurnDelta(y,Math.PI/2))<.005,
  'Turn should converge at '+fps+'fps');
}
const camera=Math.PI/4;
const cameraRelative=worldWalkDirection(0,1,camera);
assert(Math.abs(cameraRelative.x-Math.SQRT1_2)<1e-12);
assert(Math.abs(cameraRelative.z-Math.SQRT1_2)<1e-12);
console.log('Eight-way facing, turning, camera-relative input and FPS checks passed.');
