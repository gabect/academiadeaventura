import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// Open World Lab v0.1 · An independent third-person 3D vertical slice.
// Deliberately no grid tiles, voxels, isometric projection or map-marker buildings.
const $ = (id) => document.getElementById(id);
const canvas = $('world');
const loading = $('loading');
const saveKey = 'academia-openworld-lab-v01';
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
const rng = (() => { let n=0x5a18f3c1; return () => { n+=0x6D2B79F5;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296; }; })();
const rand = (a,b) => lerp(a,b,rng());
const fract = (x) => x-Math.floor(x);
const noise = (x,z) => { const a=Math.sin(x*127.1+z*311.7)*43758.5453;return fract(a)*2-1; };
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
} catch(err) {
  loading.classList.add('error');$('loadHint').textContent='WebGL no está disponible en este navegador o dispositivo.';
  throw err;
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
const scene=new THREE.Scene();
scene.background=new THREE.Color('#a9d5e6');
scene.fog=new THREE.FogExp2('#a9d5e6',0.0058);
const camera=new THREE.PerspectiveCamera(62,window.innerWidth/window.innerHeight,0.08,340);
const hemi=new THREE.HemisphereLight('#e9f6ff','#8a9279',2.05);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff0d0',2.35);
sun.position.set(-36,70,44);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-95;sun.shadow.camera.right=95;sun.shadow.camera.top=95;sun.shadow.camera.bottom=-95;
sun.shadow.camera.near=1;sun.shadow.camera.far=240;sun.shadow.bias=-0.00018;
scene.add(sun,sun.target);
scene.add(new THREE.AmbientLight('#e2f8d5',0.25));
const mat=(hex,roughness=.89)=>new THREE.MeshStandardMaterial({color:hex,roughness,metalness:0});
const paint={earth:mat('#776d55'),timber:mat('#75573c'),timberLight:mat('#ae845e'),stone:mat('#aba899'),stoneDark:mat('#778582'),roofRed:mat('#965a49'),roofBlue:mat('#526b75'),roofBrown:mat('#75645b'),glass:new THREE.MeshStandardMaterial({color:'#688f9c',metalness:.17,roughness:.2}),window:mat('#e8d7b4'),door:mat('#54432f'),cream:mat('#e0c9a2'),metal:mat('#756e62'),bark:mat('#69513c'),leaf1:mat('#648e52'),leaf2:mat('#719e62'),leaf3:mat('#8bab62'),pine1:mat('#416a52'),pine2:mat('#517b60'),pine3:mat('#668a5c'),flower:mat('#e4d398')};
const shadow=(mesh,cast=true,receive=true)=>{mesh.castShadow=cast;mesh.receiveShadow=receive;return mesh;};
const addMesh=(geometry,material,parent=scene,x=0,y=0,z=0)=>{let m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);shadow(m);parent.add(m);return m;};
const cube=(w,h,d,material,parent,x,y,z)=>addMesh(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z);
const ball=(r,material,parent,x,y,z,scale)=>{let m=addMesh(new THREE.IcosahedronGeometry(r,2),material,parent,x,y,z);if(scale)m.scale.set(...scale);return m;};
const cylinder=(r1,r2,h,material,parent,x,y,z,segments=10)=>addMesh(new THREE.CylinderGeometry(r1,r2,h,segments),material,parent,x,y,z);
const riverX=z=>29+7*Math.sin(z*.023)+2*Math.sin(z*.067);
const riverDistance=(x,z)=>Math.abs(x-riverX(z));
function landHeight(x,z){
  const waves=.36*Math.sin(x*.047+z*.018)+.31*Math.cos(z*.064-x*.037)+.14*Math.sin(x*.17)*Math.sin(z*.15);
  const foothills=4.5*smooth(38,89,-z)*(.65+.35*Math.sin(x*.055+1.3)**2);
  const peak=12*Math.exp(-((x+35)**2)/3300-((z+108)**2)/1800);
  const ridge=7.5*Math.exp(-((x-77)**2)/1700-((z+95)**2)/2500);
  const outer=Math.max(Math.abs(x),Math.abs(z));
  return 1.20+waves+foothills+peak+ridge+19*smooth(119,157,outer);
}
function terrainHeight(x,z){
  let h=landHeight(x,z);
  // The village is an organic, gently leveled site, not a square platform.
  const center=Math.hypot((x+19)*.90,(z-4)*1.18);
  const level=1-smooth(22,43,center);
  h=lerp(h,1.4+.08*Math.sin(x*.1),level*.89);
  const bank=riverDistance(x,z);
  const cut=1-smooth(4.7,13.3,bank);
  h=lerp(h,-2.05+.12*Math.sin(z*.12),cut);
  return h;
}
const bridge={z:-19,x:riverX(-19),deck:1.67,halfWidth:3.2,halfLength:14.2};
function onBridge(x,z){return Math.abs(z-bridge.z)<bridge.halfWidth-0.28 && Math.abs(x-bridge.x)<bridge.halfLength;}
function walkHeight(x,z){const h=terrainHeight(x,z);if(!onBridge(x,z))return h;const ramp=smooth(bridge.halfLength,bridge.halfLength-3.5,Math.abs(x-bridge.x));return lerp(h,Math.max(h,bridge.deck),ramp);}
const paths=[
  [[-15,31],[-16,18],[-19,6],[-17,-8],[-12,-25],[-29,-47],[-48,-67]],
  [[-13,-18],[0,-19],[17,-19],[bridge.x,-19],[57,-19],[72,-31]],
  [[-19,8],[-38,7],[-49,2],[-70,-15]],
  [[-20,-24],[-10,-48],[5,-69],[14,-96]],
  [[-20,22],[-42,25],[-60,31]],
  [[59,-20],[72,1],[76,25],[93,42]]
];
function segDist(x,z,a,b){const vx=b[0]-a[0],vz=b[1]-a[1];const t=clamp(((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz),0,1);return Math.hypot(x-a[0]-t*vx,z-a[1]-t*vz);}
function pathDistance(x,z){let min=999;for(const p of paths){for(let i=1;i<p.length;i++)min=Math.min(min,segDist(x,z,p[i-1],p[i]));}return min;}
function buildTerrain(){
  const side=320,steps=192,geo=new THREE.PlaneGeometry(side,side,steps,steps);
  geo.rotateX(-Math.PI/2);
  const positions=geo.attributes.position;const colors=[];
  const grassA=new THREE.Color('#71996a'),grassB=new THREE.Color('#89a773'),rock=new THREE.Color('#838c7a'),road=new THREE.Color('#b89b70'),mud=new THREE.Color('#8f865e'),sand=new THREE.Color('#adad8e');
  const tint=new THREE.Color();
  for(let i=0;i<positions.count;i++){
    const x=positions.getX(i),z=positions.getZ(i),h=terrainHeight(x,z);
    positions.setY(i,h);
    const n=noise(Math.floor(x*.37),Math.floor(z*.37));
    tint.copy(grassA).lerp(grassB,clamp(.42+n*.23,0,1));
    tint.lerp(rock,Math.min(.65,smooth(8,22,h)*.63));
    const d=pathDistance(x,z),w=smooth(2.15,4.6,d);
    tint.lerp(road,(1-w)*(.84+.08*n));
    const r=riverDistance(x,z);
    tint.lerp(sand,(1-smooth(5,9,r))*.28);
    tint.lerp(mud,(1-smooth(1.0,5.7,r))*.5);
    colors.push(tint.r,tint.g,tint.b);
  }
  positions.needsUpdate=true;
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const ground=addMesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,side:THREE.FrontSide}));ground.receiveShadow=true;ground.castShadow=false;
}
function buildRiver(){
  const p=[],uv=[],ids=[];const steps=180;
  for(let i=0;i<=steps;i++){
    const z=-158+i*316/steps,x=riverX(z),wave=Math.sin(z*.071)*.25;
    for(let j=0;j<=8;j++){const t=(j/8*2-1),width=5.25+wave;p.push(x+t*width,-.37+Math.sin(z*.063+t)*.045,z);uv.push(j/8,i/11);}
  }
  for(let i=0;i<steps;i++)for(let j=0;j<8;j++){const a=i*9+j,b=a+9;ids.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ids);geo.computeVertexNormals();
  const water=new THREE.Mesh(geo,new THREE.MeshPhysicalMaterial({color:'#318b9e',roughness:.2,metalness:.18,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));water.receiveShadow=false;water.userData.water=true;scene.add(water);
  // Thin glints suggest current rather than a static blue ribbon.
  const glitterMat=new THREE.MeshBasicMaterial({color:'#b2ebed',transparent:true,opacity:.31,depthWrite:false});
  const riverLines=new THREE.Group();scene.add(riverLines);
  for(let k=0;k<65;k++){const z=rand(-145,145),x=riverX(z)+rand(-3.8,3.8);const line=addMesh(new THREE.PlaneGeometry(rand(.45,1.5),.055),glitterMat,riverLines,x,-.30,z);line.rotation.x=-Math.PI/2;line.userData.z=z;}
  return riverLines;
}
function makeRoof(w,d,rise,m,parent,y){
  const roof=new THREE.BufferGeometry();const w2=w/2,d2=d/2;
  const pts=[-w2,y,-d2,0,y+rise,-d2,w2,y,-d2,-w2,y,d2,0,y+rise,d2,w2,y,d2];
  roof.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  roof.setIndex([0,3,4,0,4,1,1,4,5,1,5,2,0,1,2,3,5,4]);roof.computeVertexNormals();
  const o=addMesh(roof,m,parent);o.material.side=THREE.DoubleSide;
  // Subtle roof-ridge strip, visible from a third-person street viewpoint.
  const rid=cube(.22,.11,d+.2,paint.timberLight,parent,0,y+rise+.02,0);rid.castShadow=false;
}
const colliders=[];const interactables=[];const cameraObstacles=[];
function makeHouse({x,z,w=9,d=7,h=3.6,wall='#cfb999',roof=paint.roofRed,school=false,name='Casa'}){
  const y=terrainHeight(x,z),g=new THREE.Group();g.position.set(x,y,z);scene.add(g);
  cube(w+.48,.36,d+.48,paint.stone,g,0,.12,0);
  const wallMat=mat(wall);const body=cube(w,h,d,wallMat,g,0,.36+h/2,0);cameraObstacles.push(body);
  cube(w+.28,.19,d+.28,paint.cream,g,0,.36+h,0);
  makeRoof(w+1.15,d+1.1,school?2.25:1.95,roof,g,.36+h+.1);
  const width=school?1.85:1.26;
  cube(width,2.25,.14,paint.door,g,0,1.49,d/2+.11);
  cube(width+.38,.20,.34,paint.cream,g,0,2.71,d/2+.22);
  cylinder(.08,.08,.08,paint.flower,g,width*.34,1.43,d/2+.25,8).rotation.z=Math.PI/2;
  const windowY=2.10;
  const positions=school?[-w*.37,-w*.23,w*.23,w*.37]:[-w*.31,w*.31];
  for(const q of positions){
    cube(1.14,1.28,.16,paint.window,g,q,windowY,d/2+.12);
    cube(.91,1.03,.18,paint.glass,g,q,windowY,d/2+.24);
    cube(.075,1.12,.2,paint.cream,g,q,windowY,d/2+.36);
    cube(1,.065,.2,paint.cream,g,q,windowY,d/2+.38);
    cube(1.22,.13,.34,paint.stone,g,q,windowY-.72,d/2+.2);
    cube(1.11,1.29,.15,paint.window,g,q,windowY,-d/2-.12);
    cube(.9,1.01,.17,paint.glass,g,q,windowY,-d/2-.24);
    cube(.075,1.1,.18,paint.cream,g,q,windowY,-d/2-.31);
  }
  for(const side of [-1,1]){
    cube(.9,1.21,.14,paint.window,g,side*(w/2+.12),2,-.4);
    cube(.7,.97,.17,paint.glass,g,side*(w/2+.21),2,-.4);
  }
  // Real, walkable stone doorstep rather than an icon or stand-in marker.
  cube(width+1.25,.16,1.25,paint.stone,g,0,.18,d/2+.84);
  if(school){
    cube(w*.22,.75,.15,paint.cream,g,0,3.8,d/2+.17);
    let clock=cylinder(.31,.31,.1,paint.window,g,0,4.2,d/2+.28,20);clock.rotation.x=Math.PI/2;
    const tower=cylinder(.58,.65,1.2,wallMat,g,0,6.1,0,10);
    const cap=cylinder(0,.78,.8,roof,g,0,7.05,0,10);
  }
  colliders.push({type:'box',x,z,hw:w/2+.35,hd:d/2+.42});
  interactables.push({name,x,z:z+d/2+1.6,r:3.9});
}
function buildVillage(){
  const houses=[
    {x:-32,z:10,w:9.2,d:7.1,wall:'#dfc3a4',roof:paint.roofRed,name:'Casa del Pueblo'},
    {x:-18,z:9,w:8,d:7,wall:'#cbbba0',roof:paint.roofBrown,name:'Biblioteca (próxima fase)'},
    {x:-4,z:7,w:9,d:7.4,wall:'#ead0af',roof:paint.roofBlue,name:'Taller de Creación'},
    {x:-31,z:-13,w:8.7,d:7.1,wall:'#d2b49a',roof:paint.roofBlue,name:'Centro Comunitario'},
    {x:-18,z:-14,w:8.2,d:7,wall:'#e4c6a6',roof:paint.roofRed,name:'Casa del Explorador'},
    {x:-5,z:-13,w:8.2,d:7,wall:'#cdc6ad',roof:paint.roofBrown,name:'Casa del Bosque'},
    {x:-43,z:-35,w:16,d:10,h:5.2,wall:'#d4bea3',roof:paint.roofBlue,school:true,name:'Academia — futura sede de misiones'}
  ];
  houses.forEach(makeHouse);
  // Village-scale details. Sconces and plant beds are placed on actual ground.
  const pave=mat('#b4a68c');
  const well=new THREE.Group();const x=-47,z=22;well.position.set(x,terrainHeight(x,z),z);scene.add(well);
  const base=cylinder(2.4,2.5,.25,paint.stone,well,0,.14,0,24);
  const basin=cylinder(1.45,1.55,.56,paint.stone,well,0,.43,0,24);
  cylinder(1.12,1.12,.012,mat('#559fa8',.2),well,0,.73,0,24);
  for(const s of [-1,1])cylinder(.15,.19,2.9,paint.timber,well,s*1.7,1.75,0,8);
  cube(4.05,.3,.4,paint.timberLight,well,0,3.18,0);
  const hill=terrainHeight(-42,-35);
  for(let i=0;i<7;i++){const a=i/7*TAU,x=-43+7*Math.cos(a),z=-35+9*Math.sin(a);if(pathDistance(x,z)>4){let b=ball(.42,paint.leaf2,scene,x,terrainHeight(x,z)+.26,z,[1.8,.8,1.3]);b.castShadow=false;}}
}
function bridgeWorld(){
  const g=new THREE.Group();g.position.set(bridge.x,bridge.deck,bridge.z);scene.add(g);
  const length=bridge.halfLength*2;
  for(let i=0;i<29;i++){
    const x=-bridge.halfLength+(i+.5)*length/29;
    cube(.90,.18,6.3,paint.timberLight,g,x,-.06,0);
    for(const k of [-2.65,2.65])if(i%4===0){cylinder(.09,.11,1.4,paint.timber,g,x,.67,k,8);}
  }
  for(const k of [-2.65,2.65]){
    cube(length, .17,.18,paint.timber,g,0,1.26,k);
    cube(length,.19,.21,paint.timberLight,g,0,.58,k);
  }
  // Stone supports under the actual crossing; the avatar walks across its deck.
  for(const x of [-8,8]){
    const pier=cylinder(.65,.75,3.5,paint.stone,scene,bridge.x+x,-.55,bridge.z,10);pier.castShadow=true;
  }
}
function scatterNature(){
  const trunkGeo=new THREE.CylinderGeometry(.13,.27,3.1,8);
  const crownGeo=new THREE.IcosahedronGeometry(1,1);
  const coneGeo=new THREE.ConeGeometry(1,2.5,9,1);
  const rockGeo=new THREE.DodecahedronGeometry(1,0);
  const shrubGeo=new THREE.IcosahedronGeometry(1,1);
  const pins=[],broad=[],stones=[],bushes=[];
  for(let i=0;i<700;i++){
    const x=rand(-145,145),z=rand(-145,145),d=pathDistance(x,z);
    if(riverDistance(x,z)<11||d<4.8)continue;
    const v=Math.hypot(x+18,z-1);
    const forest=(x<-39||z<-38||x>74);
    if(v<43|| (!forest&&rng()<.84))continue;
    const y=terrainHeight(x,z),s=rand(.77,1.5),a=rand(0,TAU);
    if(y>20&&rng()<.57)continue;
    const item={x,y,z,s,a,seed:rng()};
    (rng()<.60?pins:broad).push(item);
    if(i<530)colliders.push({type:'circle',x,z,r:.45*s});
  }
  const tmp=new THREE.Object3D();
  function install(instances,geometries,materials,def){
    const meshes=[];
    for(let i=0;i<geometries.length;i++){
      let mesh=new THREE.InstancedMesh(geometries[i],materials[i],instances.length);
      mesh.castShadow=i<2;mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);scene.add(mesh);meshes.push(mesh);
    }
    instances.forEach((t,j)=>{
      const poses=def(t);
      poses.forEach((p,i)=>{
        tmp.position.set(t.x+p[0]*t.s,t.y+p[1]*t.s,t.z+p[2]*t.s);
        tmp.rotation.set(p[6]||0,t.a+(p[7]||0),p[8]||0);
        tmp.scale.set(p[3]*t.s,p[4]*t.s,p[5]*t.s);tmp.updateMatrix();meshes[i].setMatrixAt(j,tmp.matrix);
      });
    });
    meshes.forEach(m=>{m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();});
  }
  install(pins,[trunkGeo,coneGeo,coneGeo,coneGeo],[paint.bark,paint.pine1,paint.pine2,paint.pine3],t=>[
    [0,1.9,0,1,1.14,1],
    [0,3.22,0,1.55,1.1,1.55],
    [0,4.33,0,1.32,1.12,1.32],
    [0,5.32,0,.97,.9,.97]
  ]);
  install(broad,[trunkGeo,crownGeo,crownGeo,crownGeo,crownGeo],[paint.bark,paint.leaf1,paint.leaf2,paint.leaf3,paint.leaf2],t=>[
    [0,1.70,0,1,1.1,1],
    [-.65,3.45,.2,1.68,1.42,1.6],
    [.90,3.58,-.15,1.45,1.36,1.5],
    [0,4.62,0,1.62,1.32,1.55],
    [0,3.55,1.0,1.45,1.2,1.35]
  ]);
  for(let i=0;i<190;i++){
    const x=rand(-136,136),z=rand(-136,136);if(riverDistance(x,z)<5||pathDistance(x,z)<2.4||Math.hypot(x+19,z-1)<26)continue;
    stones.push({x,y:terrainHeight(x,z)+.15,z,s:rand(.28,1.06),a:rand(0,TAU)});
  }
  for(let i=0;i<520;i++){
    const x=rand(-143,143),z=rand(-143,143);if(riverDistance(x,z)<8||pathDistance(x,z)<2.1)continue;
    bushes.push({x,y:terrainHeight(x,z)+.17,z,s:rand(.18,.60),a:rand(0,TAU)});
  }
  install(stones,[rockGeo],[paint.stone],t=>[[0,0,0,1.23,.75,.98]]);
  install(bushes,[shrubGeo],[paint.leaf2],t=>[[0,0,0,1.6,.86,1.43]]);
}
function playerCharacter(){
  const root=new THREE.Group();scene.add(root);
  const skin=mat('#c5916a'),shirt=mat('#617e68'),trouser=mat('#484d50'),hair=mat('#4c372b'),boots=mat('#534331'),pack=mat('#986b4b'),belt=mat('#574c3d');
  const torso=addMesh(new THREE.CapsuleGeometry(.32,.69,7,10),shirt,root,0,1.14,0);torso.scale.set(1,.9,.73);
  const head=addMesh(new THREE.SphereGeometry(.235,16,12),skin,root,0,1.79,-.015);
  const cap=addMesh(new THREE.SphereGeometry(.24,12,8),hair,root,0,1.93,-.04);cap.scale.set(1,.52,1.06);
  const neck=cylinder(.09,.1,.18,skin,root,0,1.56,0,12);
  const backpack=addMesh(new THREE.CapsuleGeometry(.25,.45,5,9),pack,root,0,1.18,.35);backpack.scale.set(1,.9,.5);
  cube(.60,.1,.38,belt,root,0,.91,0);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.38,1.45,0);root.add(arm);
    const up=addMesh(new THREE.CapsuleGeometry(.105,.35,5,8),shirt,arm,side*.07,-.29,0);
    addMesh(new THREE.SphereGeometry(.105,10,8),skin,arm,side*.10,-.60,.005);
    arms.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.15,.81,0);root.add(leg);
    addMesh(new THREE.CapsuleGeometry(.14,.34,5,8),trouser,leg,0,-.32,0);
    const boot=addMesh(new THREE.CapsuleGeometry(.14,.14,4,8),boots,leg,0,-.67,-.09);boot.scale.z=1.5;
    legs.push(leg);
  }
  return {root,torso,arms,legs};
}
function collisionAt(x,z){
  if(Math.abs(x)>152||Math.abs(z)>152)return true;
  if(terrainHeight(x,z)<-.18&&!onBridge(x,z))return true;
  for(const c of colliders){
    if(c.type==='circle'){if(Math.hypot(x-c.x,z-c.z)<c.r+.35)return true;}
    else {const dx=Math.max(Math.abs(x-c.x)-c.hw,0),dz=Math.max(Math.abs(z-c.z)-c.hd,0);if(Math.hypot(dx,dz)<.42)return true;}
  }
  return false;
}
let flashUntil=0,flashText='';
function say(message){flashText=message;flashUntil=performance.now()+3500;$('toast').textContent=message;$('toast').classList.add('visible');}
let nearest=null;
function interactive(x,z){nearest=null;let distance=Infinity;
  for(const item of interactables){const d=Math.hypot(x-item.x,z-item.z);if(d<item.r&&d<distance){nearest=item;distance=d;}}
  $('prompt').textContent=nearest?`E · ${nearest.name}`:'';
  $('prompt').classList.toggle('visible',!!nearest);
}
// Generate static geometry before restoring saved positions: collision checks must see buildings and trees.
buildTerrain();
const riverGlints=buildRiver();
buildVillage();bridgeWorld();scatterNature();
let initial={x:-13,z:28,yaw:0};
try {const saved=JSON.parse(localStorage.getItem(saveKey)||'null');
 if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.z)&&Math.abs(saved.x)<140&&Math.abs(saved.z)<140&&!collisionAt(saved.x,saved.z))initial={...initial,...saved};
} catch{}
const player=playerCharacter(),position=new THREE.Vector3(initial.x,walkHeight(initial.x,initial.z),initial.z);
player.root.position.copy(position);let heading=initial.yaw||0,cameraYaw=heading,cameraPitch=.36,cameraDistance=6.9;
const keys=new Set();const joystick={x:0,y:0};let touchRun=false,jumpQueued=false,velocityY=0,grounded=true,walking=0,run=false;
const idealCam=new THREE.Vector3(),lookAt=new THREE.Vector3(),target=new THREE.Vector3(),ray=new THREE.Raycaster(),viewDir=new THREE.Vector3();
const pointer={dragging:false,id:null,lastX:0,lastY:0};
canvas.addEventListener('pointerdown',e=>{pointer.dragging=true;pointer.id=e.pointerId;pointer.lastX=e.clientX;pointer.lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
 if(!pointer.dragging||e.pointerId!==pointer.id)return;
 const dx=e.clientX-pointer.lastX,dy=e.clientY-pointer.lastY;
 pointer.lastX=e.clientX;pointer.lastY=e.clientY;
 cameraYaw-=dx*.0048;cameraPitch=clamp(cameraPitch+dy*.004,-.05,1.13);
});
function stopPointer(e){if(e.pointerId===pointer.id){pointer.dragging=false;pointer.id=null;}}
canvas.addEventListener('pointerup',stopPointer);canvas.addEventListener('pointercancel',stopPointer);
canvas.addEventListener('wheel',e=>{e.preventDefault();cameraDistance=clamp(cameraDistance+Math.sign(e.deltaY)*.7,3.1,11.8);},{passive:false});
window.addEventListener('keydown',e=>{if(/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space|ShiftLeft|ShiftRight|KeyE)$/.test(e.code))e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat)jumpQueued=true;if(e.code==='KeyE'&&nearest)say(`${nearest.name}: espacio reservado para futuras actividades educativas.`);});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>keys.clear());
$('reset').addEventListener('click',()=>{position.set(-13,walkHeight(-13,28),28);velocityY=0;cameraYaw=0;localStorage.removeItem(saveKey);say('Regresaste al punto de inicio.');});
$('help').addEventListener('click',()=>$('helpModal').hidden=false);
$('closeHelp').addEventListener('click',()=>$('helpModal').hidden=true);
$('helpModal').addEventListener('click',e=>{if(e.target.id==='helpModal')$('helpModal').hidden=true;});
$('touchJump').addEventListener('pointerdown',e=>{e.preventDefault();jumpQueued=true;});
$('touchE').addEventListener('pointerdown',e=>{e.preventDefault();if(nearest)say(`${nearest.name}: aquí se integrarán futuras actividades.`);});
for(const event of ['pointerdown','pointerup','pointercancel'])$('touchRun').addEventListener(event,e=>{e.preventDefault();touchRun=event==='pointerdown';});
const stick=$('joystick'),knob=$('knob');let stickId=null;
function moveStick(e){const b=stick.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,dx=e.clientX-cx,dy=e.clientY-cy,m=Math.min(1,Math.hypot(dx,dy)/44),a=Math.atan2(dy,dx);joystick.x=Math.cos(a)*m;joystick.y=Math.sin(a)*m;knob.style.transform=`translate(${joystick.x*44}px,${joystick.y*44}px)`;}
stick.addEventListener('pointerdown',e=>{stickId=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);});
stick.addEventListener('pointermove',e=>{if(stickId===e.pointerId)moveStick(e);});
function endStick(e){if(stickId===e.pointerId){stickId=null;joystick.x=joystick.y=0;knob.style.transform='';}}
stick.addEventListener('pointerup',endStick);stick.addEventListener('pointercancel',endStick);
window.addEventListener('resize',()=>{const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));});
renderer.setSize(innerWidth,innerHeight,false);
loading.remove();say('Explora libremente con WASD y el mouse.');
let previous=performance.now(),frames=0,statsTime=previous,lastSave=previous;
function tick(now){
 requestAnimationFrame(tick);
 const dt=Math.min((now-previous)/1000,.05);previous=now;
 let mx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
 let mz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joystick.y;
 const len=Math.hypot(mx,mz);if(len>1){mx/=len;mz/=len;}
 run=keys.has('ShiftLeft')||keys.has('ShiftRight')||touchRun;
 const speed=run?7.4:4.4;
 const dx=(Math.cos(cameraYaw)*mx-Math.sin(cameraYaw)*mz)*speed*dt;
 const dz=(-Math.sin(cameraYaw)*mx-Math.cos(cameraYaw)*mz)*speed*dt;
 const prevY=walkHeight(position.x,position.z);
 const nextX=position.x+dx,nextZ=position.z+dz;
 if(!collisionAt(nextX,position.z)&&Math.abs(walkHeight(nextX,position.z)-prevY)<.46)position.x=nextX;
 if(!collisionAt(position.x,nextZ)&&Math.abs(walkHeight(position.x,nextZ)-walkHeight(position.x,position.z))<.46)position.z=nextZ;
 const ground=walkHeight(position.x,position.z);
 if(grounded&&jumpQueued){velocityY=6.2;grounded=false;}
 jumpQueued=false;
 if(!grounded){velocityY-=17.5*dt;position.y+=velocityY*dt;if(position.y<=ground){position.y=ground;velocityY=0;grounded=true;}}
 else position.y=lerp(position.y,ground,Math.min(1,dt*16));
 player.root.position.copy(position);
 const moving=len>.09;
 if(moving){const desired=Math.atan2(-dx,-dz);let delta=((desired-heading+Math.PI*3)%TAU)-Math.PI;heading+=delta*Math.min(1,dt*12);}
 player.root.rotation.y=heading;
 walking+=(moving?speed*dt:dt*.5)*2.4;
 const swing=moving?Math.sin(walking)*(run?.56:.38):0;
 player.legs[0].rotation.x=swing;player.legs[1].rotation.x=-swing;
 player.arms[0].rotation.x=-swing*.68;player.arms[1].rotation.x=swing*.68;
 player.torso.rotation.z=moving?Math.sin(walking*.5)*.022:0;
 player.torso.position.y=1.14+(moving?Math.abs(Math.sin(walking))*.027:Math.sin(now*.0015)*.015);
 const horiz=cameraDistance*Math.cos(cameraPitch),vert=2.0+cameraDistance*Math.sin(cameraPitch);
 lookAt.set(position.x,position.y+1.35,position.z);
 idealCam.set(position.x+Math.sin(cameraYaw)*horiz,position.y+vert,position.z+Math.cos(cameraYaw)*horiz);
 // Keep the camera out of hills and buildings.
 idealCam.y=Math.max(idealCam.y,terrainHeight(idealCam.x,idealCam.z)+.85);
 viewDir.copy(idealCam).sub(lookAt);const distance=viewDir.length();viewDir.normalize();ray.set(lookAt,viewDir);ray.far=distance;
 const hits=ray.intersectObjects(cameraObstacles,false);
 if(hits.length)idealCam.copy(lookAt).addScaledVector(viewDir,Math.max(1.1,hits[0].distance-.42));
 target.lerp(lookAt,Math.min(1,dt*8));
 camera.position.lerp(idealCam,Math.min(1,dt*7));camera.lookAt(target);
 interactive(position.x,position.z);
 let region='Valle Abierto';if(position.x<-35&&position.z<-30)region='Bosque del Norte';else if(position.z<-60)region='Colinas del Norte';else if(position.x<-48)region='Sendero del Bosque';else if(Math.abs(position.z-bridge.z)<9&&Math.abs(position.x-bridge.x)<20)region='Puente del Río';else if(position.x<8&&position.z>-34&&position.z<37)region='Villa Central';else if(position.x>40)region='Praderas del Este';
 if($('region').textContent!==region)$('region').textContent=region;
 if(now-statsTime>950){$('status').textContent=`${Math.round(frames*1000/(now-statsTime))} FPS`;frames=0;statsTime=now;$('coords').textContent=`X ${Math.round(position.x)} · Z ${Math.round(position.z)}`;}frames++;
 if(now>flashUntil)$('toast').classList.remove('visible');
 if(now-lastSave>2600){try{localStorage.setItem(saveKey,JSON.stringify({x:position.x,z:position.z,yaw:cameraYaw}));}catch{}lastSave=now;}
 riverGlints.position.z=Math.sin(now*.001)*.06;
 renderer.render(scene,camera);
}
requestAnimationFrame(tick);