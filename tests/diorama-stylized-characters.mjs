import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {installStylizedCharacter} from '../diorama/stylized-characters.mjs';
import {installIllustratedCharacter,illustratedViewForAngle,illustratedMirrorForAngle}
 from '../diorama/vector-character.mjs';

// Three.js geometry can be validated in Node without a browser/GPU.
globalThis.document={createElement(tag){
 assert.equal(tag,'canvas');
 const context={fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
 return {width:0,height:0,getContext:()=>context};
}};
function makeRig(){
 const root=new THREE.Group(),torso=new THREE.Group();
 torso.position.y=.90;root.add(torso);
 const head=new THREE.Group();head.position.y=.83;torso.add(head);
 const arms=[],legs=[];
 for(const sign of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(sign*.44,.66,0);torso.add(shoulder);
  const elbow=new THREE.Group();elbow.position.y=-.41;shoulder.add(elbow);
  const wrist=new THREE.Group();wrist.position.y=-.40;elbow.add(wrist);
  arms.push({shoulder,elbow,wrist});
  const hip=new THREE.Group();hip.position.set(sign*.24,.90,0);root.add(hip);
  const knee=new THREE.Group();knee.position.y=-.43;hip.add(knee);
  const ankle=new THREE.Group();ankle.position.y=-.42;knee.add(ankle);
  legs.push({hip,knee,ankle});
 }
 const legacy=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial());
 root.add(legacy);
 root.userData.rig={torso,head,arms,legs};
 return {root,legacy};
}
function inspect(role,seed,coat){
 const {root,legacy}=makeRig();
 const result=installStylizedCharacter(THREE,root,{role,coat,seed});
 assert.equal(result.installed,true);
 assert.equal(result.mode,'fully-volumetric-3d');
 assert.equal(result.articulated,true);
 assert.equal(result.shading,'cel-shaded-vector-3d');
 assert.equal(result.shadeBands,4);
 assert(result.outlineMeshes>=6,'Expected visible ink silhouettes');
 assert.equal(legacy.visible,false,'The former skeleton must not remain visible');
 assert.equal(installStylizedCharacter(THREE,root,{role,coat,seed}),result,'Do not install twice');
 const meshes=[],errorMeshes=[];
 root.traverse(node=>{
  if(node.isSprite||node.isPoints||node.geometry?.type==='PlaneGeometry')
   errorMeshes.push(node.type);
  if(node.isMesh&&node.visible){
   meshes.push(node);
   const p=node.geometry.attributes.position;
   assert(p.count>0,'Empty character geometry');
   assert(node.geometry.attributes.normal,'Missing material surface normals');
   for(const value of p.array)assert(Number.isFinite(value),'Non-finite 3D vertex');
   assert(node.material?.isMeshToonMaterial||node.material?.isMeshBasicMaterial,
    'Character requires physical 3D materials');
  }
 });
 assert.equal(errorMeshes.length,0,'Characters cannot be cardboard standees/sprites');
 assert(meshes.length>65,'Incomplete 3D character details: '+meshes.length);
 // Pose existing limb groups; new skin must follow with no extra skeleton.
 const ankle=root.userData.rig.legs[0].ankle;
 const toe=ankle.children.find(node=>node.isMesh&&node.visible);
 assert(toe,'Missing articulated shoe');
 const before=toe.getWorldPosition(new THREE.Vector3());
 root.userData.rig.legs[0].hip.rotation.x=.40;root.updateMatrixWorld(true);
 const after=toe.getWorldPosition(new THREE.Vector3());
 assert(before.distanceTo(after)>.015,'Visual mesh is disconnected from IK');
 assert(root.userData.rig.head.children.some(node=>node.isMesh&&node.visible));
 return {meshes:meshes.length};
}
// The hero now wears the authored illustration instead of geometry.
const {root:hero,legacy}=makeRig();
const texture=new THREE.Texture();
const art=installIllustratedCharacter(THREE,hero,{
 role:'player',defaultView:'back',texture
});
await art.loaded;
assert.equal(art.style,'illustrated-vector-2.5d');
assert.equal(art.ready,true);
assert.equal(legacy.visible,false,'Hide the former geometric skin');
assert(art.sprite.visible,'Artwork quad must be visible when texture loads');
assert.equal(hero.userData.rig.legs.length,2,'Keep legacy movement rig');
assert.equal(art.sprite.geometry.type,'PlaneGeometry');
assert.equal(art.views.length,4);
assert.equal(illustratedViewForAngle(0),'front');
assert.equal(illustratedViewForAngle(Math.PI*.30),'threeQuarter');
assert.equal(illustratedViewForAngle(Math.PI*.52),'side');
assert.equal(illustratedViewForAngle(Math.PI),'back');
assert(illustratedMirrorForAngle(Math.PI/2,'side'));
assert(!illustratedMirrorForAngle(-Math.PI/2,'side'));
art.setFrame('front');
assert.equal(art.sprites.length,11,'Each view is exactly 11 independently hinged painted parts');
assert.equal(art.boneCount,11);
assert.equal(art.partCount,44);
assert.equal(art.sprite.geometry.type,'PlaneGeometry');
const frontUV=art.sprite.geometry.attributes.uv.getX(0);
assert(frontUV>=0&&frontUV<=1);
art.setFrame('back');
assert.equal(art.frame,'back');
assert.equal(art.animationMode,'separate-skeletal-illustration');
assert.equal(art.facingSectors,8);
assert.equal(art.deformationVertices,0,'Original artwork pixels must not warp');
hero.rotation.y=Math.PI;
hero.updateMatrixWorld(true);
const mockCamera=new THREE.PerspectiveCamera();mockCamera.position.set(0,4,10);
art.update(mockCamera,1/60,{moving:true});
assert.equal(art.frame,'back');
const firstLeg=art.boneRotations.leftLeg;
for(let i=0;i<28;i++)art.update(mockCamera,1/60,{moving:true,running:true});
assert.equal(art.pose,'run');
assert(Math.abs(art.boneRotations.leftLeg-firstLeg)>.01,'Separate hip pivot did not move');
assert(Math.abs(art.boneRotations.rightLeg-art.boneRotations.leftLeg)>.01,
 'Legs must swing independently instead of warping the same plane');
const standingScale=art.postureScale;
for(let i=0;i<18;i++)art.update(mockCamera,1/60,{crouching:true});
assert(art.postureScale<standingScale-.12,'Crouch must lower the bone hierarchy');
mockCamera.position.set(-10,4,0);
for(let i=0;i<18;i++)art.update(mockCamera,1/60,{});
assert.equal(art.sector,'sideRight','Character rotation determines camera-relative sector');
assert.equal(art.frame,'side');
mockCamera.position.set(10,4,0);
for(let i=0;i<18;i++)art.update(mockCamera,1/60,{});
assert.equal(art.sector,'sideLeft');
assert.equal(art.frame,'side');
assert.equal(art.puppet.sprites.length,11,'Each view must preserve separate limbs');
assert(art.puppet.sprites.every(v=>v.geometry.attributes.uv.count===4));
const atlas=fs.readFileSync('diorama/assets/vector-bone-atlas.webp');
assert(atlas.length>20000,'Missing authored transparent bone texture atlas');
assert.equal(atlas.toString('ascii',0,4),'RIFF');
assert.equal(atlas.toString('ascii',8,12),'WEBP');
const guardian=inspect('guardian',1,'#a9634e');
const npc=inspect('npc',3,'#6a9d96');
const html=fs.readFileSync('diorama/index.html','utf8');
for(const token of [
 "import {installStylizedCharacter} from './diorama/stylized-characters.mjs?v=3';",
 "installIllustratedCharacter(THREE,player,{role:'player'",
 "installStylizedCharacter(THREE,guardian,{role:'guardian'",
 "installStylizedCharacter(THREE,npc,{role:'npc'",
 'window.__dioramaCharacters=',
 'const WORLD={half:83,limit:78,plateauHeight:10',
 'const NPC_MARKERS=['
])assert(html.includes(token),'Missing game integration: '+token);
console.log('PASS: original 4-view art now has 44 separate skeletal textures, animated hip/elbow/head/bag pivots; world and NPC rig preserved',guardian,npc);
