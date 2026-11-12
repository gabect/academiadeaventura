/**
 * Academia de Aventura — authentic illustrated 2D skeletal protagonist.
 * Source paintings are separated into 44 independently rotating cutout parts
 * (11 jointed parts x 4 approved angles). No full-image vertex deformation.
 * The underlying game camera, physics and invisible IK rig remain intact.
 */
import {createBoneCharacter} from './articulated-vector-puppet.mjs?v=1';
import {directionSector,sourceFrameForSector,mirrorForSector}
 from './illustrated-puppet-motion.mjs?v=2';
export const ILLUSTRATED_VIEWS=Object.freeze(['front','threeQuarter','side','back']);
export const ILLUSTRATION_ASSET_URL=
 new URL('./assets/vector-bone-atlas.webp?v=1',import.meta.url).href;
export function illustratedViewForAngle(angle){
 return sourceFrameForSector(directionSector(angle));
}
export function illustratedMirrorForAngle(angle,view){
 return view==='front'||view==='back'?false:
  mirrorForSector(directionSector(angle));
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
  throw Error('An original articulated gameplay rig is required');
 const legacy=[];
 character.traverse(o=>{
  if((o.isMesh||o.isLine)&&o.visible){legacy.push(o);o.visible=false;}
 });
 const puppet=createBoneCharacter(THREE,character,{
  height:options.height||2.48,defaultFrame:options.defaultView||'back'
 });
 puppet.hide();
 const state={
  style:'illustrated-vector-2.5d',
  animationMode:'separate-skeletal-illustration',
  source:'approved-character-turnaround',
  views:ILLUSTRATED_VIEWS.slice(),
  facingSectors:8,rigAttached:true,geometryPrimitiveSkin:false,
  usesOriginalRig:true,usesOriginalWorld:true,
  boneCount:puppet.boneCount,partCount:puppet.partCount,
  ready:false,error:null,frame:options.defaultView||'back',sector:'back',
  pose:'idle',role:options.role||'player',puppet,shadow:puppet.shadow,
  get sprite(){return puppet.sprite;},
  get sprites(){return puppet.sprites;},
  get boneRotations(){return puppet.boneRotations;},
  get postureScale(){return puppet.postureScale;},
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
  puppet.dispose();for(const object of legacy)object.visible=true;
  character.userData.illustratedCharacter=null;
 };
 character.userData.illustratedCharacter=state;
 character.userData.characterArt={
  installed:true,mode:state.style,
  reference:'approved-vector-character-illustration',
  animationMode:state.animationMode,articulated:true,
  boneCount:state.boneCount,partCount:state.partCount,
  originalRigIntact:true,frameCount:4,facingSectors:8,
  atlasURL:options.assetURL||ILLUSTRATION_ASSET_URL
 };
 state.loaded=loadAtlas(THREE,options).then(texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.anisotropy=4;
  texture.generateMipmaps=true;texture.needsUpdate=true;
  puppet.setTexture(texture);
  puppet.show();
  state.ready=true;
  return state;
 }).catch(error=>{
  state.error=String(error?.message||error);
  puppet.hide();for(const object of legacy)object.visible=true;
  return state;
 });
 return state;
}
