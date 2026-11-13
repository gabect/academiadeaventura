import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CLASSIC_CAMERA,classicFrustum,classicOffset,classicFacingDirection}
 from '../diorama/classic-camera.mjs';
const close=(a,b,eps=1e-10)=>Math.abs(a-b)<eps;
assert.equal(CLASSIC_CAMERA.heading,Math.PI,'Fixed north/south axis');
assert(CLASSIC_CAMERA.pitch>Math.PI/3&&CLASSIC_CAMERA.pitch<1.20,
 'A Link to the Past inspired high three-quarter elevation');
const landscape=classicFrustum(1280,720);
assert(close(landscape.right-landscape.left,
 (landscape.top-landscape.bottom)*1280/720));
assert(close(landscape.top-landscape.bottom,20.5));
const mobile=classicFrustum(900,440,1.2);
assert(close(mobile.top-mobile.bottom,20.5/1.2));
assert(close(mobile.right-mobile.left,(20.5/1.2)*900/440));
assert(classicFrustum(1280,720,2).top<classicFrustum(1280,720,1).top,
 'Zoom-in must show LESS world instead of moving the camera');
const offset=classicOffset();
assert(close(offset.x,0));
assert(offset.y>30&&offset.z>15,'Camera should be high and behind player');
const moves=[
 [0,1,0,-1],
 [0,-1,0,1],
 [-1,0,-1,0],
 [1,0,1,0],
 [1,1,Math.SQRT1_2,-Math.SQRT1_2],
 [-1,1,-Math.SQRT1_2,-Math.SQRT1_2],
 [1,-1,Math.SQRT1_2,Math.SQRT1_2],
 [-1,-1,-Math.SQRT1_2,Math.SQRT1_2]
];
for(const [r,f,x,z] of moves){
 const dir=classicFacingDirection(r,f);
 assert(close(dir.x,x)&&close(dir.z,z),'Wrong overhead movement '+r+','+f);
}
assert.equal(classicFacingDirection(0,0).length,0);
const source=fs.readFileSync('diorama/index.html','utf8');
for(const token of [
 "const CLASSIC_VIEW=CAMERA_MODE!=='third-person'",
 'new THREE.OrthographicCamera(',
 'classicFrustum(innerWidth,innerHeight,cameraZoom)',
 'cameraHeading=CLASSIC_CAMERA.heading',
 'cameraPitch=CLASSIC_CAMERA.pitch',
 "const desired=worldWalkDirection(right,forward,cameraHeading);",
 "renderMode:'original-articulated-skeleton'",
 'const WORLD={half:83,limit:78,plateauHeight:10',
 'handdrawnStage.update()'
])assert(source.includes(token),'Missing integration: '+token);
console.log('PASS: classic overhead lens, 8-way input, 16:9/mobile framing, zoom, intact skeleton and cardboard terrain');
