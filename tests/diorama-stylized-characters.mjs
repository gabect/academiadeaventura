import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {installStylizedCharacter} from '../diorama/stylized-characters.mjs';

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
const player=inspect('player',0,'#818052');
const guardian=inspect('guardian',1,'#a9634e');
const npc=inspect('npc',3,'#6a9d96');
const html=fs.readFileSync('diorama/index.html','utf8');
for(const token of [
 "import {installStylizedCharacter} from './diorama/stylized-characters.mjs?v=2';",
 "installStylizedCharacter(THREE,player,{role:'player'",
 "installStylizedCharacter(THREE,guardian,{role:'guardian'",
 "installStylizedCharacter(THREE,npc,{role:'npc'",
 'window.__dioramaCharacters=',
 'const WORLD={half:83,limit:78,plateauHeight:10',
 'const NPC_MARKERS=['
])assert(html.includes(token),'Missing game integration: '+token);
console.log('PASS: articulated fully volumetric 3D boy, guardian, NPC',player,guardian,npc);
