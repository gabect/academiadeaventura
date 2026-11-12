/**
 * Academia de Aventura: illustrated 2.5D hero, authored from the approved
 * character turnaround. The artwork (not geometric primitives) IS the skin.
 *
 * Physics, collision, ladder actions, swimming, foot IK, input and camera
 * remain driven by the original game object and its legacy skeleton.
 *
 * The underlying image atlas is an AVIF export of the vector-style artwork.
 * This is a textured upright quad in 3D space, not an SVG mesh or a GLB.
 */
export const ILLUSTRATED_VIEWS = Object.freeze(['front','threeQuarter','side','back']);
const VIEW_CELLS = {front:0,threeQuarter:1,side:2,back:3};
const TAU = Math.PI * 2;
export const ILLUSTRATION_ASSET_URL = new URL('./assets/vector-adventurer-turnaround.avif',import.meta.url).href;

function normalizeAngle(angle) {
 return Math.atan2(Math.sin(angle),Math.cos(angle));
}
export function illustratedViewForAngle(relativeAngle){
 const a=Math.abs(normalizeAngle(relativeAngle));
 if(a<Math.PI/7)return 'front';
 if(a<Math.PI*0.39)return 'threeQuarter';
 if(a<Math.PI*0.70)return 'side';
 return 'back';
}
export function illustratedMirrorForAngle(relativeAngle,view){
 // The source sheet's right-facing profile/hero pose reads naturally when
 // the camera approaches from the character's left. Mirror from the right.
 return (view==='side'||view==='threeQuarter')&&normalizeAngle(relativeAngle)>0;
}
function selectFrame(geometry,column){
 const uv=geometry.attributes.uv;
 for(let i=0;i<uv.count;i++){
  const u=uv.getX(i),v=uv.getY(i);
  // Each of the four turnaround drawings has one full-height atlas cell.
  uv.setXY(i,(u+column)/4,v);
 }
 uv.needsUpdate=true;
}
function atlasTexture(THREE,options){
 if(options.texture)return Promise.resolve(options.texture);
 return new Promise((resolve,reject)=>{
  new THREE.TextureLoader().load(options.assetURL||ILLUSTRATION_ASSET_URL,
   resolve,undefined,reject);
 });
}
export function installIllustratedCharacter(THREE,character,options={}){
 if(character.userData.illustratedCharacter)return character.userData.illustratedCharacter;
 const rig=character.userData.rig;
 if(!rig?.torso||!rig?.head||rig.legs?.length!==2||rig.arms?.length!==2)
  throw new Error('The original articulated character rig is required');
 // Hide only existing visible geometry, not the joints, physics or animation.
 character.traverse(o=>{if(o.isMesh||o.isLine)o.visible=false;});
 const height=options.height??2.48;
 const width=height*.5;
 const geometry=new THREE.PlaneGeometry(width,height,1,1);
 const material=new THREE.MeshBasicMaterial({
  color:0xffffff,side:THREE.DoubleSide,transparent:true,
  alphaTest:.075,depthWrite:true,depthTest:true,
  toneMapped:false,fog:true
 });
 const sprite=new THREE.Mesh(geometry,material);
 sprite.name='illustrated-character-'+(options.role||'player');
 sprite.visible=false;
 sprite.castShadow=false;sprite.receiveShadow=false;
 sprite.position.y=height/2-.088;
 // The physical character root can turn freely. The painting keeps its
 // upright silhouette aimed at the camera via counter-rotation.
 character.add(sprite);
 let shadow;
 if(options.groundShadow!==false){
  const shMat=new THREE.MeshBasicMaterial({
   color:0x302922,transparent:true,opacity:.20,
   depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1
  });
  shadow=new THREE.Mesh(new THREE.CircleGeometry(1,20),shMat);
  shadow.name='illustrated-ground-contact-shadow';
  shadow.rotation.x=-Math.PI/2;shadow.scale.set(.43,.24,1);
  shadow.position.y=-.079;shadow.renderOrder=1;
  shadow.castShadow=false;shadow.receiveShadow=false;
  character.add(shadow);
 }
 const state={style:'illustrated-vector-2.5d',source:'approved-character-turnaround',
  views:ILLUSTRATED_VIEWS.slice(),frame:'back',ready:false,error:null,
  usesOriginalRig:true,usesOriginalWorld:true,geometryPrimitiveSkin:false,
  sprite,shadow,role:options.role||'player'};
 let previousColumn=-1;
 const clock={step:0,time:0};
 state.setFrame=view=>{
  if(!(view in VIEW_CELLS))return;
  if(VIEW_CELLS[view]!==previousColumn){
   // Never remap the same vertices repeatedly: restore canonical plane UVs.
   const uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setX(i,i%2?1:0);
   selectFrame(geometry,VIEW_CELLS[view]);
   previousColumn=VIEW_CELLS[view];
  }
  state.frame=view;
 };
 state.setFrame(options.defaultView||'back');
 state.update=(camera,dt=1/60,animation={})=>{
  if(!state.ready)return;
  character.updateWorldMatrix(true,false);
  const a=new THREE.Vector3();character.getWorldPosition(a);
  const relativeCameraYaw=Math.atan2(camera.position.x-a.x,camera.position.z-a.z);
  const charYaw=character.getWorldQuaternion(new THREE.Quaternion());
  const forward=new THREE.Vector3(0,0,1).applyQuaternion(charYaw);
  const worldFacing=Math.atan2(forward.x,forward.z);
  const relative=normalizeAngle(relativeCameraYaw-worldFacing);
  const frame=animation.forceView||illustratedViewForAngle(relative);
  state.setFrame(frame);
  sprite.rotation.y=relative;
  sprite.scale.x=illustratedMirrorForAngle(relative,frame)?-1:1;
  const moving=!!animation.moving;
  const running=!!animation.running;
  const crouching=!!animation.crouching, crawling=!!animation.crawling;
  const swimming=!!animation.swimming;
  const posture=crawling?.49:crouching?.75:swimming?.79:1;
  clock.time+=dt;
  if(moving)clock.step+=dt*(running?13:8.2);
  const lift=moving?.021*(1+Number(running))*(1-Math.cos(clock.step*2))*.5:0;
  const tilt=moving?.012*Math.sin(clock.step):.004*Math.sin(clock.time*1.7);
  sprite.rotation.z=tilt;
  // Keep boots near the real floor while crouching and during animation.
  sprite.scale.y=posture*(1+.004*Math.sin(clock.time*1.8));
  sprite.position.y=(height*.5*posture)-.088+lift;
  if(shadow)shadow.visible=!swimming&&!animation.climbing;
 };
 state.dispose=()=>{
  geometry.dispose();material.dispose();shadow?.geometry.dispose();
  shadow?.material.dispose();sprite.parent?.remove(sprite);
  shadow?.parent?.remove(shadow);
 };
 character.userData.illustratedCharacter=state;
 character.userData.characterArt={installed:true,mode:state.style,
  reference:'approved-vector-character-illustration',articulated:false,
  originalRigIntact:true,frameCount:4,atlasURL:options.assetURL||ILLUSTRATION_ASSET_URL};
 state.loaded=atlasTexture(THREE,options).then(tex=>{
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.magFilter=THREE.LinearFilter;
  tex.minFilter=THREE.LinearMipmapLinearFilter;
  tex.anisotropy=4;tex.needsUpdate=true;
  material.map=tex;material.needsUpdate=true;
  sprite.visible=true;state.ready=true;
  return state;
 }).catch(err=>{
  state.error=String(err?.message||err);
  // Restore the original skeleton if artwork fails to load.
  character.traverse(o=>{
   if((o.isMesh||o.isLine)&&o!==sprite&&o!==shadow)o.visible=true;
  });
  sprite.visible=false;
  return state;
 });
 return state;
}
