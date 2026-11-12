/**
 * Smooth illustrated puppet: deforms artwork, not a geometry-built humanoid.
 * Eight angular facing sectors reuse four authored paintings, mirrored where
 * appropriate. Two canvases crossfade during turns instead of instant popping.
 * Works with the same scene/root physics and avoids allocating per-frame.
 */
const PI=Math.PI,TAU=PI*2;
const COLUMN={front:0,threeQuarter:1,side:2,back:3};
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const damp=(a,b,s,dt)=>a+(b-a)*(1-Math.exp(-s*dt));
function normalize(a){return Math.atan2(Math.sin(a),Math.cos(a));}
export function directionSector(relative){
 const n=normalize(relative);
 const index=Math.round(n/(PI/4));
 return ['front','frontRight','sideRight','rearRight','back','rearLeft',
  'sideLeft','frontLeft'][((index%8)+8)%8];
}
export function sourceFrameForSector(sector){
 if(sector==='front')return 'front';
 if(sector==='frontRight'||sector==='frontLeft')return 'threeQuarter';
 if(sector==='sideRight'||sector==='sideLeft')return 'side';
 return 'back'; // back-quarters use back art until painted views exist.
}
export function mirrorForSector(sector){
 return sector==='frontRight'||sector==='sideRight';
}
function makeGrid(THREE,width,height,segmentsX=28,segmentsY=44){
 const g=new THREE.PlaneGeometry(width,height,segmentsX,segmentsY);
 const original=new Float32Array(g.attributes.position.array);
 const uv=new Float32Array(g.attributes.uv.array);
 return {geometry:g,original,uv};
}
function assignFrame(view,grid){
 const column=COLUMN[view];
 if(column===undefined)throw Error('Invalid illustrated frame '+view);
 const a=grid.geometry.attributes.uv,src=grid.uv;
 for(let i=0;i<a.count;i++)a.setXY(i,(src[i*2]+column)*.25,src[i*2+1]);
 a.needsUpdate=true;
}
function animatedGeometry(grid,info,phase,t,move,run,pose,slope,style){
 const a=grid.geometry.attributes.position,base=grid.original;
 const width=info.width,height=info.height;
 const sideView=style==='side';
 const step=phase,effort=move*(run?.95:.64);
 const pitch=clamp(slope,-.33,.33);
 for(let i=0;i<a.count;i++){
  const x=base[i*3],y=base[i*3+1];
  const nx=x/(width*.5),ny=y/height+.5,side=nx<0?-1:1;
  const leg=smooth(.06,.23,Math.abs(nx))*(1-smooth(.32,.49,ny));
  const arm=smooth(.28,.52,Math.abs(nx))*smooth(.22,.42,ny)*
    (1-smooth(.61,.78,ny));
  const head=smooth(.63,.83,ny)*(1-smooth(.77,.97,Math.abs(nx)));
  const shoe=(1-smooth(.09,.23,ny))*leg;
  const lowerBody=1-smooth(.19,.46,ny);
  const hipPhase=step+(side>0?PI:0);
  const stride=Math.sin(hipPhase)*effort;
  const raised=Math.max(0,Math.sin(hipPhase))*effort;
  // Leg articulation: hips act as pivots, ankles lift on the swing phase.
  const legShift=(.075*height*stride+pitch*.018*height)*leg*
    (sideView?.60:1);
  const kneeBend=.028*height*raised*leg*smooth(.05,.21,ny);
  const ankleLift=.046*height*raised*shoe;
  // Sleeve swings have a soft shoulder anchor and trailing hands.
  const sleevePhase=Math.sin(step+(side<0?PI:0));
  const handDown=smooth(.34,.55,ny)*(1-smooth(.63,.77,ny));
  const armShift=.043*height*effort*sleevePhase*arm*(sideView?.65:1);
  const handLift=.016*height*effort*Math.sin(step*2)*arm*handDown;
  // Head/hat are not rubber: low-amplitude neck turn/settle.
  const headSway=(.009*height*Math.sin(t*1.45)+
    .010*height*Math.sin(step)*move)*head;
  const fabricFollow=.007*height*Math.sin(step-.55)*effort*
    smooth(.30,.56,ny)*(1-smooth(.57,.77,ny));
  // Reduce foot sliding during stance and raise only the swing foot.
  const yShift=ankleLift+kneeBend+handLift+
    .003*height*Math.sin(t*1.9)*(1-move)*smooth(.28,.67,ny);
  const xShift=legShift+armShift+headSway+fabricFollow;
  a.setXYZ(i,x+xShift,y+yShift,0);
 }
 a.needsUpdate=true;
 grid.geometry.computeBoundingSphere();
}
function softShadow(THREE){
 const size=96,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d');
 const gradient=ctx.createRadialGradient(48,48,8,48,48,46);
 gradient.addColorStop(0,'rgba(30,23,18,.34)');
 gradient.addColorStop(.45,'rgba(30,23,18,.24)');
 gradient.addColorStop(1,'rgba(30,23,18,0)');
 ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size);
 const texture=new THREE.CanvasTexture(canvas);
 texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;
 return texture;
}
export function createIllustratedPuppet(THREE,root,options={}){
 const height=options.height||2.48,width=options.width||height*.5;
 const layers=[];
 const pivot=new THREE.Group();pivot.name='turnaround-illustration-pivot';root.add(pivot);
 for(let n=0;n<2;n++){
  const grid=makeGrid(THREE,width,height,options.segmentsX||28,options.segmentsY||44);
  const material=new THREE.MeshBasicMaterial({
   color:0xffffff,side:THREE.DoubleSide,transparent:true,
   alphaTest:.04,depthTest:true,depthWrite:false,toneMapped:false,
   fog:true,opacity:n===0?1:0
  });
  const mesh=new THREE.Mesh(grid.geometry,material);
  mesh.name=n?'turnaround-incoming-painting':'turnaround-active-painting';
  mesh.position.y=height*.5-.088;
  mesh.renderOrder=100+n;
  mesh.visible=false;mesh.castShadow=false;mesh.receiveShadow=false;
  pivot.add(mesh);layers.push({grid,mesh,material,frame:'back',mirror:false});
 }
 const shadowMat=new THREE.MeshBasicMaterial({
  map:softShadow(THREE),transparent:true,opacity:.7,
  depthWrite:false,depthTest:true,side:THREE.DoubleSide,toneMapped:false
 });
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),shadowMat);
 shadow.rotation.x=-PI/2;shadow.position.y=-.083;
 shadow.scale.set(.78,.46,1);shadow.renderOrder=10;
 shadow.name='illustrated-soft-foot-contact';root.add(shadow);
 const state={
  frame:'back',sector:'back',targetSector:'back',style:'weighted-vector-puppet',
  artViews:4,facingSectors:8,pose:'idle',moving:false,runBlend:0,
  transition:1,turnDuration:.16,step:0,time:0,motionBlend:0,
  active:0,shadow,root: pivot,
  first:layers[0].mesh,
  get sprite(){return layers[this.active].mesh;},
  get sprites(){return layers.map(l=>l.mesh);},
  get deformationVertices(){return layers[0].grid.geometry.attributes.position.count;},
 };
 function pose(layer,animation,dt,heading){
  const t=state.time,phase=state.step,walk=state.motionBlend,
   run=state.runBlend,posture=animation.crawling?.55:
   animation.crouching?.78:animation.swimming?.78:1;
  layer.mesh.scale.y=damp(layer.mesh.scale.y,posture,11,dt);
  layer.mesh.scale.x=(layer.mirror?-1:1)*(heading==='rearRight'||heading==='rearLeft'?.96:1);
  const angle=(.007*Math.sin(t*1.7)+.014*Math.sin(phase)*walk);
  layer.mesh.rotation.z=angle;
  layer.mesh.position.y=height*.5*layer.mesh.scale.y-.088+
   .009*height*walk*(1-Math.cos(phase*2));
  animatedGeometry(layer.grid,{width,height},phase,t,walk,run,
   posture,animation.slope||0,layer.frame);
 }
 function applyImmediate(frame,mirror=false,sector=frame){
  state.active=0;state.frame=frame;state.sector=sector;state.targetSector=sector;
  state.transition=1;
  const first=layers[0],second=layers[1];
  first.frame=frame;first.mirror=mirror;
  assignFrame(frame,first.grid);first.material.opacity=1;
  first.mesh.visible=true;second.mesh.visible=false;second.material.opacity=0;
 }
 state.setFrame=(frame,mirror=false)=>{
  if(!Object.prototype.hasOwnProperty.call(COLUMN,frame))return;
  applyImmediate(frame,mirror,frame);
 };
 state.setTexture=texture=>{
  for(const layer of layers){
   layer.material.map=texture;layer.material.needsUpdate=true;
   layer.mesh.visible=layer===layers[state.active];
  }
 };
 state.update=(camera,dt=1/60,animation={})=>{
  dt=clamp(dt,0,1/15);
  state.time+=dt;
  const p=new THREE.Vector3();root.getWorldPosition(p);
  const yaw=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  const direction=new THREE.Vector3(0,0,1).applyQuaternion(
   root.getWorldQuaternion(new THREE.Quaternion()));
  const relative=Math.atan2(direction.x,direction.z);
  const cameraRelative=normalize(yaw-relative);
  pivot.rotation.y=cameraRelative;
  const sector=animation.forceSector||directionSector(cameraRelative);
  const frame=animation.forceView||sourceFrameForSector(sector);
  const mirrored=animation.forceView?cameraRelative>0&&frame!=='back'&&frame!=='front':
   mirrorForSector(sector);
  if(sector!==state.targetSector||animation.forceView&&frame!==layers[1-state.active].frame){
   if(state.transition<1){
    // Finish the dominant layer before scheduling the next turn.
    const now=state.transition>=.5?1-state.active:state.active;
    state.active=now;
   }
   const current=layers[state.active],incoming=layers[1-state.active];
   current.material.opacity=1;current.mesh.visible=true;
   incoming.frame=frame;incoming.mirror=mirrored;
   assignFrame(frame,incoming.grid);
   incoming.mesh.visible=!!incoming.material.map;
   incoming.material.opacity=0;
   state.transition=0;state.targetSector=sector;
  }
  if(state.transition<1){
   state.transition=clamp(state.transition+dt/state.turnDuration,0,1);
   const ease=smooth(0,1,state.transition);
   const current=layers[state.active],next=layers[1-state.active];
   current.material.opacity=1-ease;next.material.opacity=ease;
   if(state.transition>=1){
    current.mesh.visible=false;state.active=1-state.active;
    const active=layers[state.active];active.material.opacity=1;
    state.frame=active.frame;state.sector=sector;
   }
  }else{
   layers[state.active].mesh.visible=true;
   layers[1-state.active].mesh.visible=false;
   state.frame=layers[state.active].frame;state.sector=sector;
  }
  const moving=!!animation.moving||!!animation.climbing||!!animation.swimming;
  const target=Number(moving);
  state.motionBlend=damp(state.motionBlend,target,9,dt);
  state.runBlend=damp(state.runBlend,Number(!!animation.running),8,dt);
  state.moving=moving;state.pose=animation.crawling?'crawl':
   animation.crouching?'crouch':animation.swimming?'swim':
   animation.climbing?'climb':animation.jumping?'jump':
   moving?animation.running?'run':'walk':'idle';
  state.step+=dt*(animation.climbing?5.2:animation.swimming?5.6:
   animation.crawling?3.3:animation.running?12.4:7.3)*
   state.motionBlend;
  for(const layer of layers)if(layer.mesh.visible)pose(layer,animation,dt,sector);
  shadow.visible=!animation.swimming&&!animation.climbing&&!animation.jumping;
  shadow.material.opacity=damp(shadow.material.opacity,moving?.48:.68,5,dt);
  shadow.scale.x=damp(shadow.scale.x,animation.crouching?.9:.78,7,dt);
 };
 applyImmediate(options.defaultFrame||'back');
 state.hide=()=>{pivot.visible=false;shadow.visible=false;};
 state.show=()=>{pivot.visible=true;shadow.visible=true;};
 state.dispose=()=>{
  for(const layer of layers){
   layer.grid.geometry.dispose();layer.material.dispose();
  }
  shadow.geometry.dispose();shadowMat.map?.dispose();shadowMat.dispose();
  pivot.parent?.remove(pivot);shadow.parent?.remove(shadow);
 };
 return state;
}
