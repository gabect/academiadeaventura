/**
 * Academia de Aventura — illustrated protagonist.
 *
 * The approved four-view character painting stays the visible skin. The
 * weighted 2D puppet changes its silhouette smoothly through locomotion,
 * not spheres/cylinders. Original 3D rig, terrain, NPCs and physics persist.
 */
import {createIllustratedPuppet,directionSector,sourceFrameForSector,mirrorForSector}
 from './illustrated-puppet-motion.mjs?v=1';
export const ILLUSTRATED_VIEWS=Object.freeze(['front','threeQuarter','side','back']);
const PI=Math.PI;
export const ILLUSTRATION_ASSET_URL=
 new URL('./assets/vector-adventurer-turnaround.avif?v=2',import.meta.url).href;
function normalize(a){return Math.atan2(Math.sin(a),Math.cos(a));}
export function illustratedViewForAngle(relativeAngle){
 return sourceFrameForSector(directionSector(relativeAngle));
}
export function illustratedMirrorForAngle(relativeAngle,view){
 return view==='front'||view==='back'?false:
  mirrorForSector(directionSector(relativeAngle));
}
function loadAtlas(THREE,options){
 if(options.texture)return Promise.resolve(options.texture);
 return new Promise((resolve,reject)=>new THREE.TextureLoader().load(
  options.assetURL||ILLUSTRATION_ASSET_URL,resolve,undefined,reject
 ));
}
export function installIllustratedCharacter(THREE,character,options={}){
 if(character.userData.illustratedCharacter)return character.userData.illustratedCharacter;
 const rig=character.userData?.rig;
 if(!rig?.torso||!rig?.head||rig.legs?.length!==2||rig.arms?.length!==2)
  throw Error('Illustrated character requires the original animated gameplay rig');
 const legacy=[];
 character.traverse(o=>{
  if((o.isMesh||o.isLine)&&o.visible){legacy.push(o);o.visible=false;}
 });
 const puppet=createIllustratedPuppet(THREE,character,{
  height:options.height||2.48,defaultFrame:options.defaultView||'back',
  segmentsX:options.segmentsX||28,segmentsY:options.segmentsY||44
 });
 puppet.shadow.visible=false;
 const state={
  style:'illustrated-vector-2.5d',animationMode:'weighted-illustrated-puppet',
  source:'approved-character-turnaround',views:ILLUSTRATED_VIEWS.slice(),
  facingSectors:8,rigAttached:true,geometryPrimitiveSkin:false,
  usesOriginalRig:true,usesOriginalWorld:true,ready:false,error:null,
  frame:options.defaultView||'back',sector:'back',pose:'idle',
  role:options.role||'player',shadow:puppet.shadow,puppet,
  get sprite(){return puppet.sprite;},
  get sprites(){return puppet.sprites;},
  get deformationVertices(){return puppet.deformationVertices;}
 };
 state.setFrame=(frame,mirror=false)=>{
  if(!ILLUSTRATED_VIEWS.includes(frame))return;
  puppet.setFrame(frame,mirror);state.frame=frame;
 };
 state.setFrame(options.defaultView||'back');
 state.update=(camera,dt=1/60,animation={})=>{
  if(!state.ready)return;
  puppet.update(camera,dt,animation);
  state.frame=puppet.frame;state.sector=puppet.sector;state.pose=puppet.pose;
 };
 state.dispose=()=>{
  puppet.dispose();
  for(const part of legacy)part.visible=true;
  character.userData.illustratedCharacter=null;
 };
 character.userData.illustratedCharacter=state;
 character.userData.characterArt={
  installed:true,mode:state.style,
  reference:'approved-vector-character-illustration',
  animationMode:state.animationMode,articulated:true,
  originalRigIntact:true,frameCount:4,facingSectors:8,
  atlasURL:options.assetURL||ILLUSTRATION_ASSET_URL
 };
 state.loaded=loadAtlas(THREE,options).then(texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.anisotropy=4;
  texture.generateMipmaps=true;
  texture.needsUpdate=true;
  puppet.setTexture(texture);puppet.shadow.visible=true;
  state.ready=true;return state;
 }).catch(error=>{
  state.error=String(error?.message||error);
  puppet.hide();
  for(const part of legacy)part.visible=true;
  return state;
 });
 return state;
}
