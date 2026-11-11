import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// Fase 1: mundo aislado, sin importar módulos, datos ni controles del juego original.
// Estructura visual inicial de maqueta; NO constituye todavía el mapa completo.
const BASE={width:68,depth:52,limitX:31,limitZ:23};
const host=document.getElementById('world');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#a8cbd1');
scene.fog=new THREE.Fog('#a8cbd1',70,155);
const camera=new THREE.OrthographicCamera(-20,20,12,-12,.1,180);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.26;
host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#fff8e5','#78948d',2.25));
const sunlight=new THREE.DirectionalLight('#fff3d4',2.45);
sunlight.position.set(-20,33,23);
sunlight.castShadow=true;
sunlight.shadow.mapSize.set(1024,1024);
sunlight.shadow.camera.left=-56;
sunlight.shadow.camera.right=56;
sunlight.shadow.camera.top=56;
sunlight.shadow.camera.bottom=-56;
sunlight.shadow.normalBias=.018;
scene.add(sunlight,sunlight.target);
const mat=(color,more={})=>new THREE.MeshStandardMaterial({color,roughness:.95,metalness:0,...more});
const COLORS={board:'#b7a077',green:'#99bf82',light:'#b8d398',edge:'#d0b98b',paper:'#f5e9cc',
 blue:'#77c6cd',water:'#8dd5e1',foam:'#e3f7ef',hill:'#88a5a0',pine:'#518a70',
 darkPine:'#3e765c',leaf:'#85bb77',shadow:'#4b705e',roof:'#c67764'};
function mesh(geom,material,parent=scene,pos=[0,0,0]){
 const o=new THREE.Mesh(geom,material);o.position.set(...pos);
 o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}
function cube(w,h,d,color,parent,x,y,z){
 return mesh(new THREE.BoxGeometry(w,h,d),mat(color),parent,[x,y,z]);
}
function paperTexture(base){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const c=canvas.getContext('2d');c.fillStyle=base;c.fillRect(0,0,512,512);
 let seed=35687;const rand=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 for(let i=0;i<4000;i++){
  const x=rand()*512,y=rand()*512,r=.2+rand()*1.1;
  c.fillStyle=rand()>.5?'#ffffff15':'#334b2610';
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
 }
 for(let i=0;i<120;i++){
  c.strokeStyle='#526d4410';c.lineWidth=.4+rand()*.8;c.beginPath();
  const x=rand()*512,y=rand()*512;c.moveTo(x,y);c.lineTo(x+rand()*22,y+rand()*4);c.stroke();
 }
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,3);
 t.anisotropy=4;return t;
}
// Cartón visible en los bordes: base, canto y una lámina verde pintada encima.
cube(70,.28,54,'#d7be8a',scene,0,-1.27,0);
cube(BASE.width,1.08,BASE.depth,COLORS.board,scene,0,-.7,0);
const green=mat('#ffffff',{map:paperTexture(COLORS.green)});
mesh(new THREE.BoxGeometry(67.7,.12,51.7),[mat(COLORS.edge),mat(COLORS.edge),green,mat(COLORS.board),mat(COLORS.edge),mat(COLORS.edge)],scene,[0,-.08,0]);
for(let i=0;i<37;i++){
 const z=-25.1+i*1.39;
 cube(69,.035,.07,'#ba9b6a',scene,0,-1.14,z);
}
// A modest papier-mâché mountain ridge (stage 1 prototype, not the final map).
function polygonShape(points){const s=new THREE.Shape();s.moveTo(...points[0]);for(let i=1;i<points.length;i++)s.lineTo(...points[i]);s.closePath();return s}
function plateau(points,height,topColor,sideColor){
 const shape=polygonShape(points);
 const g=new THREE.ExtrudeGeometry(shape,{depth:height,steps:1,bevelEnabled:true,
  bevelThickness:.13,bevelSize:.15,bevelSegments:1,curveSegments:2});
 g.rotateX(-Math.PI/2);
 const o=mesh(g,[mat(topColor),mat(sideColor)],scene,[0,.10,0]);
 return o;
}
plateau([[-31,-22],[-9,-22],[-6,-19],[-12,-13],[-21,-8],[-31,-11]],2.4,'#b0c9a0','#c4ad85');
plateau([[-31,-22],[-19,-22],[-12,-19],[-20,-14],[-30,-15]],3.9,'#a3baa0','#c9b592');
for(const [x,z,r,h] of [[-27,-19,3.5,5.0],[-22,-18,2.8,3.7],[-16,-20,3.0,4.3]]){
 const mountain=mesh(new THREE.ConeGeometry(r,h,6),mat(COLORS.hill),scene,[x,3.9+h/2,z]);
 mountain.rotation.y=x*.31;
 const tip=mesh(new THREE.ConeGeometry(r*.34,h*.2,6),mat('#e2e6d5'),scene,[x,3.9+h*.9,z]);
 tip.rotation.y=x*.31;
}
// Paper ribbons lie flat on the set surface; broad sections will form full routes later.
function ribbon(points,width,color,y=.14){
 const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,y,z)),false,'centripetal');
 const n=56,v=[],uv=[],ix=[];
 for(let i=0;i<=n;i++){
  const t=i/n,p=curve.getPoint(t),tan=curve.getTangent(t);
  const nx=-tan.z,nz=tan.x,variation=1+.045*Math.sin(t*28);
  for(const side of [-1,1]){
   v.push(p.x+side*nx*width*.5*variation,p.y,p.z+side*nz*width*.5*variation);
   uv.push(t,side===-1?0:1);
  }
  if(i<n){const a=i*2;ix.push(a,a+2,a+1,a+1,a+2,a+3)}
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
 return mesh(g,mat(color,{side:THREE.DoubleSide}),scene);
}
ribbon([[-27,15],[-17,10],[-9,7],[0,5],[9,10],[16,16],[27,20]],3.5,'#e7d2a8');
ribbon([[1,-23],[5,-16],[9,-10],[13,-5],[18,2],[23,9]],3.1,'#73c2d0',.18);
ribbon([[1,-23],[5,-16],[9,-10],[13,-5],[18,2],[23,9]],1.9,'#8ddce0',.195);
// Cut-paper pond with multiple concentric layers.
const pond=(rx,rz,y,color)=>{
 const g=new THREE.CircleGeometry(1,64);
 const w=mesh(g,mat(color,{side:THREE.DoubleSide}),scene,[22,y,11]);
 w.rotation.x=-Math.PI/2;w.scale.set(rx,rz,1);
};
pond(9.7,7,.11,'#d5e1c3');pond(9.0,6.3,.15,'#78bcc9');pond(8.5,5.9,.165,'#8cdae1');
for(let i=0;i<6;i++){
 const z=7+i*1.65,x=17+(i%3)*3.6;
 const squiggle=ribbon([[x-1,z],[x,z-.35],[x+1,z]],.075,'#eaf9e3',.185);
 squiggle.castShadow=false;
}
// A few sample cardboard trees: paper cutouts with a small physical thickness.
function cutout(shape,color,depth=.20){
 const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,steps:1,
  bevelThickness:.036,bevelSize:.055,bevelSegments:1,curveSegments:8});
 const face=mat(color,{side:THREE.DoubleSide});
 return new THREE.Mesh(geo,[face,mat('#d8be89',{side:THREE.DoubleSide})]);
}
function triangleShape(width,height){
 const s=new THREE.Shape();s.moveTo(0,height);s.lineTo(-width*.5,0);
 s.quadraticCurveTo(0,-.18,width*.5,0);s.closePath();return s;
}
function cloudShape(w,h){
 const s=new THREE.Shape();s.moveTo(-w*.47,0);
 s.bezierCurveTo(-w*.79,h*.08,-w*.55,h*.61,-w*.25,h*.64);
 s.bezierCurveTo(-w*.18,h*1.10,w*.16,h*1.10,w*.29,h*.75);
 s.bezierCurveTo(w*.74,h*.79,w*.72,h*.23,w*.43,h*.15);
 s.bezierCurveTo(w*.43,-h*.18,-w*.27,-h*.14,-w*.47,0);
 s.closePath();return s;
}
const treeColors=['#80b978','#91c282','#6fa66c','#a3c88c'];
function cardboardTree(x,z,type='broad',scale=1,seed=0,y=0){
 const tree=new THREE.Group();tree.position.set(x,y,z);tree.scale.setScalar(scale);
 tree.rotation.y=Math.sin(seed*2.1)*.45;
 scene.add(tree);
 cube(.38,2.0,.32,'#9c785b',tree,0,1.0,0);
 cube(.16,1.78,.33,'#c9a27c',tree,.12,1.0,.015);
 if(type==='pine'){
  for(let j=0;j<3;j++){
   const needle=cutout(triangleShape(2.2-j*.30,2.5-j*.20),
    j===0?'#4c8567':j===1?'#589873':'#6daa7c',.20);
   needle.position.set(0,1.18+j*.81,.06+j*.07);needle.castShadow=true;tree.add(needle);
  }
 }else{
  for(const [dx,dy,w,h,c] of [[-.73,2.15,2.5,2.35,treeColors[(seed+1)%4]],
   [.61,2.24,2.5,2.5,treeColors[(seed+2)%4]],
   [-.10,2.65,2.8,2.7,treeColors[seed%4]]]){
   const leaf=cutout(cloudShape(w,h),c,.17);
   leaf.position.set(dx,dy,-.05+dx*.1);tree.add(leaf);
  }
 }
 return tree;
}
for(const [i,x,z,type,scale,y] of [
 [0,-27,5,'pine',1.1,0],[1,-24,2,'pine',.82,0],[2,-19,0,'broad',.86,0],
 [3,-13,14,'broad',1,0],[4,-19,19,'pine',1.12,0],[5,-5,18,'broad',.83,0],
 [6,1,-17,'pine',.95,0],[7,5,-19,'broad',.85,0],[8,15,-15,'broad',1.02,0],
 [9,23,-13,'pine',1.06,0],[10,29,-5,'broad',.87,0],[11,28,21,'broad',1.04,0],
 [12,-28,-14,'pine',.77,2.35],[13,-23,-13,'pine',.74,2.35],[14,-29,-20,'pine',.73,3.94]
])cardboardTree(x,z,type,scale,i,y);
// A little cardstock house; prototype prop, fully separated from original game code.
const house=new THREE.Group();house.position.set(-5,.12,-6);scene.add(house);
cube(4.6,3.1,4.0,'#e8d6b0',house,0,1.55,0);
cube(4.8,.10,4.2,'#cbaa78',house,0,3.10,0);
for(const side of [-1,1]){
 const roof=cube(3.45,.25,4.55,COLORS.roof,house,side*1.19,3.93,0);
 roof.rotation.z=side*.70;
}
cube(1.0,1.9,.065,'#9f7458',house,0,1.03,2.045);
for(const x of [-1.52,1.52]){
 cube(.72,.78,.09,'#b4d5d0',house,x,2.00,2.08);
 cube(.83,.07,.15,'#f8edce',house,x,2.39,2.13);
 cube(.10,.86,.14,'#f8edce',house,x,2.00,2.16);
}
const doorKnob=mesh(new THREE.SphereGeometry(.073,8,6),mat('#f4daa3'),house,[.34,1.02,2.12]);
// Main character/NPC are actual 3D meshes, not the cardboard scene art.
const skin=mat('#e5bca0'),bone=mat('#e8dbc4');
function boneBetween(parent,a,b,rad,material){
 const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
 const d=new THREE.Vector3().subVectors(end,start);
 const c=mesh(new THREE.CylinderGeometry(rad*.85,rad,d.length(),8),material,parent,
  [(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2]);
 c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
 return c;
}
function character(jacket='#497e9e',x=0,z=0,isPlayer=false){
 const root=new THREE.Group();root.position.set(x,.08,z);scene.add(root);
 const jacketMat=mat(jacket),pants=mat('#7b6756');
 const head=mesh(new THREE.SphereGeometry(.36,18,12),skin,root,[0,2.55,0]);
 const neck=mesh(new THREE.CylinderGeometry(.09,.10,.24,9),bone,root,[0,2.15,0]);
 const torso=mesh(new THREE.BoxGeometry(.85,1.03,.40),jacketMat,root,[0,1.55,0]);
 torso.geometry.translate(0,0,0);
 for(let r=0;r<4;r++)boneBetween(root,[-.42,1.85-r*.16,.21],[.42,1.85-r*.16,.21],.047,bone);
 const legNodes=[];
 for(const sign of [-1,1]){
  const leg=new THREE.Group();leg.position.set(sign*.23,1.06,0);root.add(leg);
  boneBetween(leg,[0,0,0],[0,-.87,0],.118,pants);
  mesh(new THREE.SphereGeometry(.12,9,7),skin,leg,[0,-.87,0]);
  const boot=mesh(new THREE.BoxGeometry(.23,.16,.33),pants,leg,[0,-.95,.09]);
  legNodes.push(leg);
  boneBetween(root,[sign*.50,1.93,0],[sign*.67,1.20,0],.10,jacketMat);
  mesh(new THREE.SphereGeometry(.13,9,7),skin,root,[sign*.67,1.15,0]);
 }
 root.userData={legs:legNodes,isPlayer};
 return root;
}
const player=character('#517b97',0,9,true);
const npc1=character('#bc8566',11,-4);
const npc2=character('#79946f',-13,8);
let yaw=Math.PI/4,zoom=window.innerWidth>1050?.82:1,viewSize=25;
camera.zoom=zoom;
const target=new THREE.Vector3(0,1,7),desired=new THREE.Vector3();
const keys=new Set(),touch={x:0,y:0};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const diagnostic={
 version:'phase1',mode:'isolated-cardboard-diorama',mapComplete:false,
 camera:'orthographic-isometric',originalFilesChanged:false,
 objects:{player3D:true,npc3D:2,cardboardTrees:15},
 renderedFrames:0,ready:false,player:{x:0,z:9},angle:yaw
};
window.__dioramaStatus=diagnostic;
function resize(){
 const width=window.innerWidth,height=window.innerHeight;
 viewSize=width<600?18.5:width<1000?21:25;
 const aspect=width/height;
 camera.left=-viewSize*aspect;camera.right=viewSize*aspect;
 camera.top=viewSize;camera.bottom=-viewSize;
 camera.updateProjectionMatrix();
 renderer.setSize(width,height);
}
window.addEventListener('resize',resize);resize();
const normalizeKey=(key)=>key.toLowerCase();
window.addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
 keys.add(normalizeKey(e.key));
 if(!e.repeat&&(e.code==='KeyQ'||e.code==='KeyE')){
  yaw+=(e.code==='KeyQ'?-1:1)*Math.PI/4;
  diagnostic.angle=yaw;
 }
});
window.addEventListener('keyup',e=>keys.delete(normalizeKey(e.key)));
window.addEventListener('blur',()=>keys.clear());
function setZoom(delta){zoom=clamp(zoom*delta,.68,1.85);camera.zoom=zoom;camera.updateProjectionMatrix();}
document.getElementById('rotateL').addEventListener('click',()=>{yaw-=Math.PI/4;diagnostic.angle=yaw;});
document.getElementById('rotateR').addEventListener('click',()=>{yaw+=Math.PI/4;diagnostic.angle=yaw;});
document.getElementById('zoomIn').addEventListener('click',()=>setZoom(1.16));
document.getElementById('zoomOut').addEventListener('click',()=>setZoom(1/1.16));
renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();setZoom(e.deltaY<0?1.12:1/1.12)},{passive:false});
const stick=document.getElementById('stick'),knob=document.getElementById('knob');
let finger=null;
function touchMove(e){
 const r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2);
 const dy=e.clientY-(r.top+r.height/2),d=Math.max(1,Math.hypot(dx,dy)),m=Math.min(d,43);
 touch.x=dx/d*m/43;touch.y=-dy/d*m/43;
 knob.style.transform='translate('+(touch.x*43)+'px,'+(-touch.y*43)+'px)';
}
stick.addEventListener('pointerdown',e=>{
 finger=e.pointerId;stick.setPointerCapture(finger);touchMove(e);
});
stick.addEventListener('pointermove',e=>{if(e.pointerId===finger)touchMove(e);});
const release=e=>{if(e.pointerId===finger){finger=null;touch.x=touch.y=0;knob.style.transform='translate(0px,0px)';}};
stick.addEventListener('pointerup',release);stick.addEventListener('pointercancel',release);
const clock=new THREE.Clock();
let stepPhase=0;
function frame(){
 requestAnimationFrame(frame);
 const dt=Math.min(clock.getDelta(),.045),dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+touch.x;
 const dy=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'))+touch.y;
 const size=Math.hypot(dx,dy);
 if(size>.04){
  const rightX=Math.cos(yaw),rightZ=-Math.sin(yaw);
  const forwardX=-Math.sin(yaw),forwardZ=-Math.cos(yaw);
  const vx=(rightX*dx+forwardX*dy)/Math.max(1,size);
  const vz=(rightZ*dx+forwardZ*dy)/Math.max(1,size);
  const nx=clamp(player.position.x+vx*4.7*dt,-BASE.limitX,BASE.limitX);
  const nz=clamp(player.position.z+vz*4.7*dt,-BASE.limitZ,BASE.limitZ);
  // The first prototype has a simple water-avoidance footprint.
  const water=Math.pow((nx-22)/9.5,2)+Math.pow((nz-11)/7,2)<1;
  if(!water){player.position.x=nx;player.position.z=nz;}
  player.rotation.y=Math.atan2(vx,vz);
  stepPhase+=dt*10;
  player.userData.legs[0].rotation.x=Math.sin(stepPhase)*.32;
  player.userData.legs[1].rotation.x=-Math.sin(stepPhase)*.32;
 }else for(const leg of player.userData.legs)leg.rotation.x*=Math.exp(-10*dt);
 target.lerp(desired.set(player.position.x,1.0,player.position.z),1-Math.exp(-5*dt));
 camera.position.set(target.x+Math.sin(yaw)*37,target.y+27,target.z+Math.cos(yaw)*37);
 camera.lookAt(target);
 npc1.rotation.y=Math.sin(clock.elapsedTime*.40)*.2;
 npc2.rotation.y=-Math.sin(clock.elapsedTime*.33)*.2;
 renderer.render(scene,camera);
 diagnostic.renderedFrames++;
 diagnostic.player={x:player.position.x,z:player.position.z};
 diagnostic.ready=true;
}
try{frame();}catch(err){
 const el=document.getElementById('error');el.hidden=false;
 el.textContent='No se pudo iniciar el diorama: '+(err?.message||err);
 throw err;
}