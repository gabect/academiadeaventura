/**
 * Academia de Aventura - authored 2D cut-out skeletal character.
 * Artwork is cut into independent parts (head, torso, arms, knees, boots,
 * satchel), each pivoted on a bone group. No warping of a single full-body
 * billboard and no spheres/cylinders as visible character geometry.
 *
 * World collision, ground IK and camera remain in the existing game root.
 * The art rig only consumes their animation state.
 */
import { BONE_ATLAS } from './assets/vector-bone-manifest.mjs?v=2';
import {directionSector,sourceFrameForSector,mirrorForSector}
  from './illustrated-puppet-motion.mjs?v=2';

const PI=Math.PI;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=(t)=>{t=clamp(t,0,1);return t*t*(3-2*t);};
const damping=(x,target,speed,dt)=>x+(target-x)*(1-Math.exp(-speed*dt));
const BONE_ORDER=['legLL','legLU','legRL','legRU','torso',
 'armLL','armLU','armRL','armRU','bag','head'];
const VIEW_NAME={front:'front',threeQuarter:'hero',side:'side',back:'back'};
export const ARTICULATED_BONE_COUNT=11;
export const ARTICULATED_VIEW_COUNT=4;
export const ARTICULATED_SECTORS=8;

function uvRect(THREE,rect){
 const [x,y,w,h]=rect,[aw,ah]=[BONE_ATLAS.atlas.width,BONE_ATLAS.atlas.height];
 const geometry=new THREE.PlaneGeometry(1,1);
 const uv=geometry.attributes.uv;
 for(let i=0;i<uv.count;i++){
  const u=uv.getX(i),v=uv.getY(i);
  uv.setXY(i,(x+u*w)/aw,1-(y+(1-v)*h)/ah);
 }
 uv.needsUpdate=true;
 return geometry;
}
function vec(point,view,s){
 return [(point[0]-view.width/2)*s,(view.height-point[1])*s-.09];
}
function makeView(THREE,id,height){
 const descriptor=BONE_ATLAS.views[id];
 if(!descriptor)throw Error('Missing drawn view '+id);
 const s=height/descriptor.height;
 const group=new THREE.Group();group.name='vector-skeleton-'+id;
 const materials=[],bones={},meshes={};
 const pivots=descriptor.parts;
 const torsoJoint=pivots.torso.pivot;
 function createBone(name,parent,parentJoint){
  const data=pivots[name];if(!data)throw Error('Missing bone part '+id+'/'+name);
  const bone=new THREE.Group();bone.name='bone-'+name;
  const [worldX,worldY]=vec(data.pivot,descriptor,s);
  const [pX,pY]=parentJoint?vec(parentJoint,descriptor,s):[0,0];
  bone.position.set(worldX-pX,worldY-pY,0);
  parent.add(bone);bones[name]=bone;
  const [sx,sy,sw,sh]=data.atlas;
  const [x1,y1,x2,y2]=data.bbox;
  const geometry=uvRect(THREE,data.atlas);
  const material=new THREE.MeshBasicMaterial({
   side:THREE.DoubleSide,transparent:true,opacity:1,
   alphaTest:.025,depthWrite:false,depthTest:true,
   fog:true,toneMapped:false
  });
  const plane=new THREE.Mesh(geometry,material);
  plane.name='painted-'+id+'-'+name;
  plane.scale.set(sw*s,sh*s,1);
  plane.position.set(((x1+x2)/2-data.pivot[0])*s,
   (data.pivot[1]-(y1+y2)/2)*s,0);
  plane.renderOrder=200+BONE_ORDER.indexOf(name);
  plane.castShadow=false;plane.receiveShadow=false;
  bone.add(plane);meshes[name]=plane;materials.push(material);
  return bone;
 }
 // Root hips must not be parented to the torso: swinging the chest cannot
 // drag planted feet along the terrain.
 const legLU=createBone('legLU',group,null);
 createBone('legLL',legLU,pivots.legLU.pivot);
 const legRU=createBone('legRU',group,null);
 createBone('legRL',legRU,pivots.legRU.pivot);
 const torso=createBone('torso',group,null);
 const left=createBone('armLU',torso,torsoJoint);
 createBone('armLL',left,pivots.armLU.pivot);
 const right=createBone('armRU',torso,torsoJoint);
 createBone('armRL',right,pivots.armRU.pivot);
 createBone('bag',torso,torsoJoint);
 createBone('head',torso,torsoJoint);
 // The source paintings reconstruct exactly at the zero pose, before swing.
 return {id,group,materials,bones,meshes,descriptor,scale:s};
}
function softShadow(THREE){
 const w=64,data=new Uint8Array(w*w*4);
 for(let y=0;y<w;y++)for(let x=0;x<w;x++){
  const d=Math.hypot((x+.5-w/2)/(w/2),(y+.5-w/2)/(w/2));
  const a=clamp((1-d)/.83,0,1);const p=(y*w+x)*4;
  data[p]=39;data[p+1]=32;data[p+2]=25;data[p+3]=Math.round(a*a*128);
 }
 const t=new THREE.DataTexture(data,w,w,THREE.RGBAFormat);
 t.needsUpdate=true;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;
 const mat=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.66,
  depthWrite:false,depthTest:true,side:THREE.DoubleSide,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),mat);
 mesh.rotation.x=-PI/2;mesh.scale.set(.88,.48,1);
 mesh.position.y=-.085;mesh.name='painted-feet-ground-shadow';
 return mesh;
}
function animateBones(view,phase,t,move,run,anim,dt,pose){
 const bone=view.bones;
 const effort=move*(run?1.25:1);
 const wave=Math.sin(phase),opposite=Math.sin(phase+PI);
 const armAmp=(pose==='climb'?.26:pose==='swim'?.22:pose==='run'?.20:.125)*effort;
 const legAmp=(pose==='crawl'?.14:pose==='run'?.18:.12)*effort;
 // Limb bones rotate around anatomically selected pivots. The image fragments
 // do not stretch or distort: elbows and knees are separate attached images.
 const armLeft=armAmp*wave,armRight=armAmp*opposite;
 bone.armLU.rotation.z=damping(bone.armLU.rotation.z,armLeft,12,dt);
 bone.armRU.rotation.z=damping(bone.armRU.rotation.z,armRight,12,dt);
 bone.armLL.rotation.z=damping(bone.armLL.rotation.z,
  0*wave*effort+(pose==='climb'?.08:0),13,dt);
 bone.armRL.rotation.z=damping(bone.armRL.rotation.z,
  0*opposite*effort-(pose==='climb'?.08:0),13,dt);
 bone.legLU.rotation.z=damping(bone.legLU.rotation.z,-legAmp*wave,14,dt);
 bone.legRU.rotation.z=damping(bone.legRU.rotation.z,-legAmp*opposite,14,dt);
 const bend=pose==='crouch'?.15:pose==='crawl'?.21:
   pose==='jump'?.16:pose==='swim'?.13:0;
 bone.legLL.rotation.z=damping(bone.legLL.rotation.z,
  legAmp*.16*Math.max(0,-wave)+bend,13,dt);
 bone.legRL.rotation.z=damping(bone.legRL.rotation.z,
  -legAmp*.16*Math.max(0,-opposite)-bend,13,dt);
 bone.torso.rotation.z=damping(bone.torso.rotation.z,
  Math.sin(phase)*.013*move+Math.sin(t*1.4)*.004,7,dt);
 bone.head.rotation.z=damping(bone.head.rotation.z,
  -.012*move*wave+Math.sin(t*1.1)*.008,6,dt);
 bone.bag.rotation.z=damping(bone.bag.rotation.z,
  -Math.sin(phase-.65)*.026*effort,6,dt);
 // Knees bend when crouched; the feet remain near the same ground line.
 const lowered=pose==='crawl'?.50:pose==='crouch'?.30:pose==='swim'?.35:0;
 view.group.scale.y=damping(view.group.scale.y,1-lowered,9,dt);
 const bob=(1-Math.cos(phase*2))*.007*effort;
 view.group.position.y=bob;
}
export function createBoneCharacter(THREE,root,options={}){
 const height=options.height||2.48;
 const billboard=new THREE.Group();billboard.name='vector-bone-billboard';root.add(billboard);
 const views={};for(const id of Object.keys(BONE_ATLAS.views)){
  views[id]=makeView(THREE,id,height);
  views[id].group.visible=false;
  billboard.add(views[id].group);
 }
 const shadow=softShadow(THREE);root.add(shadow);
 let active=options.defaultFrame||'back';if(active==='threeQuarter')active='hero';
 let previous=null,transition=1,currentKey=active+':0';
 views[active].group.visible=true;
 const state={
  style:'vector-cutout-skeleton',animationMode:'separate-skeletal-illustration',
  boneCount:ARTICULATED_BONE_COUNT,partCount:ARTICULATED_BONE_COUNT*4,
  frame:active==='hero'?'threeQuarter':active,sector:'back',pose:'idle',
  facingSectors:ARTICULATED_SECTORS,animationPhase:0,
  facingTransition:1,frames:BONE_ATLAS.views,shadow,root:billboard,
  get sprite(){return views[active].meshes.torso;},
  get sprites(){return Object.values(views[active].meshes);},
  get viewMeshes(){return views[active].meshes;},
  get deformationVertices(){return 0;},
  get postureScale(){return views[active].group.scale.y;},
  get boneRotations(){const b=views[active].bones;return {
    leftArm:b.armLU.rotation.z,rightArm:b.armRU.rotation.z,
    leftLeg:b.legLU.rotation.z,rightLeg:b.legRU.rotation.z,
    head:b.head.rotation.z,bag:b.bag.rotation.z};}
 };
 function setOpacity(view,value){for(const mat of view.materials)mat.opacity=value;}
 function showFrame(id,mirror){
  const v=views[id];v.group.scale.x=mirror?-1:1;
  const key=id+':'+Number(mirror);
  if(key===currentKey)return;
  if(previous){const old=views[previous];old.group.visible=false;setOpacity(old,1);previous=null;}
  previous=active;active=id;currentKey=key;transition=0;
  const next=views[active];next.group.visible=true;setOpacity(next,0);
  if(previous===active){previous=null;transition=1;setOpacity(next,1);}
 }
 state.setFrame=(frame,mirror=false)=>{
  const id=VIEW_NAME[frame]||frame;
  if(!views[id])return;
  showFrame(id,mirror);
  transition=1;if(previous){views[previous].group.visible=false;previous=null;}
  setOpacity(views[active],1);state.frame=frame;
 };
 state.setTexture=texture=>{
  for(const view of Object.values(views))for(const mat of view.materials){
   mat.map=texture;mat.needsUpdate=true;
  }
 };
 let step=0,time=0,blend=0,run=0;
 const a=new THREE.Vector3(),direction=new THREE.Vector3(),quaternion=new THREE.Quaternion();
 state.update=(camera,dt=1/60,animation={})=>{
  dt=clamp(dt,0,1/15);time+=dt;
  root.updateWorldMatrix(true,false);root.getWorldPosition(a);
  const cameraYaw=Math.atan2(camera.position.x-a.x,camera.position.z-a.z);
  root.getWorldQuaternion(quaternion);
  direction.set(0,0,1).applyQuaternion(quaternion);
  const characterYaw=Math.atan2(direction.x,direction.z);
  const relative=Math.atan2(Math.sin(cameraYaw-characterYaw),Math.cos(cameraYaw-characterYaw));
  billboard.rotation.y=relative;
  const sector=animation.forceSector||directionSector(relative);
  const targetFrame=animation.forceView||sourceFrameForSector(sector);
  const id=VIEW_NAME[targetFrame]||targetFrame;
  const mirror=animation.forceView?relative>0&&id!=='back'&&id!=='front':mirrorForSector(sector);
  showFrame(id,mirror);
  if(transition<1){transition=clamp(transition+dt/.17,0,1);
   setOpacity(views[active],smooth(transition));
   if(previous){setOpacity(views[previous],1-smooth(transition));
    if(transition>=1){views[previous].group.visible=false;previous=null;}}
  }
  const moving=!!animation.moving||!!(animation.climbing&&animation.climbMoving)||!!animation.swimming;
  blend=damping(blend,Number(moving),10,dt);
  run=damping(run,Number(!!animation.running),8,dt);
  const pose=animation.falling?'fall':animation.crawling?'crawl':
   animation.crouching?'crouch':animation.swimming?'swim':
   animation.climbing?'climb':animation.jumping?'jump':
   moving?(animation.running?'run':'walk'):'idle';
  step+=dt*(animation.climbing?6:animation.swimming?5.3:animation.crawling?3.4:
   animation.running?12.4:7.5)*blend;
  animateBones(views[active],step,time,blend,run,animation,dt,pose);
  if(previous)animateBones(views[previous],step,time,blend,run,animation,dt,pose);
  billboard.visible=!animation.falling;
  shadow.visible=!animation.falling&&!animation.swimming&&!animation.climbing&&!animation.jumping;
  shadow.material.opacity=damping(shadow.material.opacity,blend?.44:.65,6,dt);
  state.sector=sector;state.pose=pose;state.facingTransition=transition;
  state.frame=id==='hero'?'threeQuarter':id;state.animationPhase=step;
 };
 state.show=()=>{billboard.visible=true;shadow.visible=true;};
 state.hide=()=>{billboard.visible=false;shadow.visible=false;};
 state.dispose=()=>{
  for(const view of Object.values(views))for(const mesh of Object.values(view.meshes)){
    mesh.geometry.dispose();mesh.material.dispose();
  }
  shadow.geometry.dispose();shadow.material.map?.dispose();shadow.material.dispose();
  billboard.parent?.remove(billboard);shadow.parent?.remove(shadow);
 };
 return state;
}