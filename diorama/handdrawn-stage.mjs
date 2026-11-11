/**
 * Handmade school-cardboard theater built on existing Adventure Academy sites.
 * Drawn standees are full illustrations on physically thin cut panels:
 * black marker outlines, white scissor margins, colored-pencil scratch marks,
 * exposed brown cardboard edges and unobtrusive folded foot tabs.
 * Render-only: original coordinates, mountains, routes, NPCs and collisions stay.
 */
import {CRAYON,makeCorrugatedTexture} from './crayon-style.mjs';

const TAU=Math.PI*2;
function random(seed){let x=seed>>>0;return ()=>{
 x=(x+0x6D2B79F5)|0;let t=Math.imul(x^(x>>>15),1|x);
 t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;
};}
function polyFor(kind,variant){
 const r=random(1841+variant*709+kind.length*1229);
 if(kind==='pine'){
  const p=[[.455,.972],[.438,.797]];
  for(let row=5;row>=0;row--){
   const y=.13+row*.114,reach=.13+row*.053;
   p.push([.50-reach+(r()-.5)*.032,y+.075]);
   p.push([.49-reach*.50+(r()-.5)*.028,y+.063]);
  }
  p.push([.51+(r()-.5)*.05,.039]);
  for(let row=0;row<=5;row++){
   const y=.13+row*.114,reach=.13+row*.053;
   p.push([.50+reach*.46+(r()-.5)*.028,y+.060]);
   p.push([.50+reach+(r()-.5)*.032,y+.080]);
  }
  p.push([.560,.803],[.558,.974]);return p;
 }
 if(kind==='broad'){
  const pts=[[.442,.972],[.437,.697]];
  const cx=.50+(r()-.5)*.08,cy=.407,rx=.40+(r()-.5)*.055,ry=.317;
  for(let i=0;i<=21;i++){
   const a=2.36+i*(TAU-1.58)/21,amp=.93+.13*r();
   pts.push([cx+rx*Math.cos(a)*amp,cy+ry*Math.sin(a)*amp]);
  }
  pts.push([.560,.695],[.561,.973]);return pts;
 }
 if(kind==='shrub'){
  const pts=[[.10,.90],[.08,.68],[.18,.52],[.15,.37],[.28,.32],
   [.34,.21],[.48,.27],[.58,.13],[.72,.26],[.82,.25],
   [.88,.40],[.91,.55],[.95,.72],[.87,.90]];
  return pts.map(([x,y])=>[x+(r()-.5)*.04,y+(r()-.5)*.035]);
 }
 if(kind==='flower'){
  const pts=[[.45,.98],[.445,.52],[.24,.56],[.18,.47],[.27,.39],
   [.35,.36],[.30,.24],[.40,.17],[.49,.24],[.56,.10],[.68,.18],
   [.64,.32],[.79,.39],[.76,.52],[.63,.54],[.57,.49],[.55,.98]];
  return pts;
 }
 if(kind==='mushroom'){
  return [[.38,.98],[.40,.60],[.13,.60],[.075,.53],[.17,.34],
   [.33,.20],[.53,.16],[.73,.24],[.91,.41],[.94,.52],
   [.84,.61],[.60,.60],[.62,.98]];
 }
 // Jagged theatrical mountain skyline; flat base, asymmetric peaks.
 return [[.045,.974],[.045,.64],[.13,.56],[.20,.39],[.26,.46],
  [.39,.20],[.49,.32],[.63,.06],[.76,.26],[.83,.23],
  [.95,.62],[.95,.974]];
}
function path(ctx,pts,w,h){
 ctx.beginPath();ctx.moveTo(pts[0][0]*w,pts[0][1]*h);
 for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0]*w,pts[i][1]*h);
 ctx.closePath();
}
function inkStroke(ctx,pts,width=4){
 ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);
 ctx.lineWidth=width;ctx.strokeStyle='#292b28';ctx.lineJoin='round';
 ctx.lineCap='round';ctx.stroke();
}
function drawWax(ctx,r,color,x,y,rx,ry,n=320){
 ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.clip();
 for(let i=0;i<n;i++){
  const xx=x+(r()-.5)*rx*2.25,yy=y+(r()-.5)*ry*2.25;
  ctx.strokeStyle=r()>.73?'rgba(255,255,255,.40)':'rgba(24,37,34,.16)';
  ctx.lineWidth=.6+r()*2.8;ctx.beginPath();ctx.moveTo(xx,yy);
  ctx.lineTo(xx+(r()-.5)*15,yy-3-r()*11);ctx.stroke();
 }
 ctx.restore();
}
function brush(ctx,r,fill,points){
 ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(...points[0]);
 for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#272c29';ctx.lineWidth=3.0+r()*1.3;
 ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
}
function paint(kind,variant,pts){
 const W=512,H=640,c=document.createElement('canvas');c.width=W;c.height=H;
 const ctx=c.getContext('2d'),r=random(8441+variant*1409+kind.length*241);
 ctx.clearRect(0,0,W,H);
 // White scissor-margin runs around the irregular physical die-cut.
 path(ctx,pts,W,H);ctx.fillStyle='#fffdf5';ctx.fill();
 ctx.lineWidth=7;ctx.strokeStyle='#272b29';ctx.lineJoin='round';ctx.stroke();
 ctx.save();path(ctx,pts,W,H);ctx.clip();
 for(let i=0;i<440;i++){
  const x=r()*W,y=r()*H;ctx.fillStyle=r()>.5?'#a6a29b13':'#ffffff24';
  ctx.fillRect(x,y,1+r()*4,1+r()*4);
 }
 if(kind==='pine'||kind==='broad'){
  // Brown crayon trunk and visible branching; entire standee is one painting.
  brush(ctx,r,'#a57952',[[229,616],[230,315],[262,255],[281,620]]);
  for(let i=0;i<75;i++){
   const y=318+r()*282,x=240+r()*30;inkStroke(ctx,[[x,y],[x+3+r()*6,y-13-r()*16]],1+r());
  }
  if(kind==='broad'){
   inkStroke(ctx,[[251,385],[210,290],[158,240]],11);
   inkStroke(ctx,[[251,340],[304,265],[367,213]],9);
   inkStroke(ctx,[[247,297],[248,184]],7);
   const greens=['#278847','#41b952','#18a86e','#68ca70','#a3d66a'];
   const clouds=[
    [.32,.43,.21,.17],[.53,.30,.25,.19],[.70,.43,.23,.17],
    [.49,.52,.31,.16],[.37,.31,.20,.15]
   ];
   clouds.forEach(([x,y,rx,ry],i)=>{
    ctx.beginPath();ctx.ellipse(x*W,y*H,rx*W,ry*H,r()*.25,0,TAU);
    ctx.fillStyle=greens[(variant+i)%greens.length];ctx.fill();
    ctx.lineWidth=3.5;ctx.strokeStyle='#21392b';ctx.stroke();
    drawWax(ctx,r,greens[i],x*W,y*H,rx*W*.92,ry*H*.91,240);
   });
   for(let i=0;i<90;i++){
    const x=100+r()*310,y=125+r()*245;
    ctx.strokeStyle=r()>.5?'#d2e95d':'#195b3a';ctx.lineWidth=1.5+r()*2;
    ctx.beginPath();ctx.arc(x,y,4+r()*7,0,Math.PI*.9);ctx.stroke();
   }
  }else{
   const greens=['#12795d','#168b52','#20aa66','#52c77a'];
   for(let j=0;j<5;j++){
    const yy=125+j*68,spread=63+j*33,x=254+(r()-.5)*19;
    const poly=[[x,yy-75],[x-spread*.44,yy+15],
      [x-spread,yy+52],[x-spread*.27,yy+43],[x+spread*.20,yy+49],
      [x+spread,yy+54],[x+spread*.45,yy+13]];
    brush(ctx,r,greens[(variant+j)%greens.length],poly);
    for(let i=0;i<85;i++){
     const xx=x+(r()-.5)*spread*1.55,y=yy+(r()-.5)*66;
     inkStroke(ctx,[[xx,y],[xx-7+r()*14,y-3-r()*11]],.7+r()*1.7);
    }
   }
  }
 }else if(kind==='shrub'){
  const colors=['#58d47a','#21985b','#7ed66b'];
  const circles=[[.29,.60,.23,.30],[.53,.46,.28,.36],[.74,.62,.22,.27]];
  circles.forEach(([x,y,rx,ry],i)=>{
   ctx.beginPath();ctx.ellipse(x*W,y*H,rx*W,ry*H,0,0,TAU);
   ctx.fillStyle=colors[(i+variant)%3];ctx.fill();ctx.lineWidth=4;
   ctx.strokeStyle='#263d2d';ctx.stroke();
   drawWax(ctx,r,colors[i],x*W,y*H,rx*W,ry*H,170);
  });
  for(let i=0;i<25;i++){
   const x=90+r()*330,y=220+r()*265;
   inkStroke(ctx,[[x,y],[x+4+r()*15,y-10-r()*13]],1+r()*1.6);
  }
 }else if(kind==='mushroom'){
  brush(ctx,r,'#ffebcc',[[218,598],[217,379],[301,373],[305,600]]);
  brush(ctx,r,['#f65366','#ef3558','#ec2c45'][variant%3],
   [[61,368],[85,291],[178,190],[283,168],[386,231],[469,342],[449,388],[65,391]]);
  for(let i=0;i<19;i++){
   const x=115+r()*305,y=235+r()*115;
   ctx.beginPath();ctx.ellipse(x,y,8+r()*12,7+r()*8,r()*2,0,TAU);
   ctx.fillStyle='#fff8ee';ctx.fill();ctx.strokeStyle='#273335';ctx.lineWidth=2.5;ctx.stroke();
  }
 }else if(kind==='flower'){
  brush(ctx,r,'#299f5b',[[246,608],[240,317],[260,318],[273,608]]);
  brush(ctx,r,'#74c86a',[[247,484],[152,422],[164,403],[249,450]]);
  brush(ctx,r,'#60ad58',[[254,505],[338,444],[352,465],[260,525]]);
  const fill=['#f4407b','#ffdc2d','#9458c4'][variant%3];
  for(let i=0;i<9;i++){
   const a=i*TAU/9,x=251+Math.cos(a)*80,y=245+Math.sin(a)*72;
   ctx.beginPath();ctx.ellipse(x,y,36,65,a+Math.PI/2,0,TAU);
   ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#293333';ctx.lineWidth=4;ctx.stroke();
  }
  ctx.beginPath();ctx.arc(251,245,37,0,TAU);ctx.fillStyle='#713d35';ctx.fill();
  ctx.strokeStyle='#232b2b';ctx.lineWidth=5;ctx.stroke();
 }else{
  const peaks=[[40,485],[94,420],[169,250],[234,382],
   [318,110],[387,285],[485,480]];
  brush(ctx,r,'#c0c2ca',[[35,609],...peaks,[489,610]]);
  brush(ctx,r,'#7c8594',[[155,601],[220,393],[284,510],
   [313,283],[355,455],[422,600]]);
  brush(ctx,r,'#f8f8f4',[[170,250],[201,330],[166,302],[128,360]]);
  brush(ctx,r,'#f3f3f2',[[318,110],[355,201],[320,175],[285,223]]);
  drawWax(ctx,r,'#b9bbc7',260,418,210,180,550);
  for(let i=0;i<24;i++){
   const x=70+r()*380,y=330+r()*230;inkStroke(ctx,[[x,y],[x+9,y-15-r()*20]],1+r()*1.4);
  }
 }
 ctx.restore();
 // Outline once more, visibly irregular like a child's marker after cutting.
 path(ctx,pts,W,H);ctx.lineWidth=5.7;
 ctx.strokeStyle='#242927';ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
 return c;
}
function geometry(THREE,kind,variant,w,h){
 const points=polyFor(kind,variant);
 const s=new THREE.Shape();
 points.forEach(([x,y],i)=>{
  const px=(x-.5)*w,py=(1-y)*h;
  if(!i)s.moveTo(px,py);else s.lineTo(px,py);
 });s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:.045,steps:1,bevelEnabled:false,
  curveSegments:1});
 const position=g.getAttribute('position'),uv=g.getAttribute('uv');
 // Face UVs map directly to hand-drawn canvas. Cardboard side groups retain
 // the stock ExtrudeGeometry UVs for their corrugated texture.
 for(const group of g.groups){
  if(group.materialIndex!==0)continue;
  for(let i=group.start;i<group.start+group.count;i++){
   uv.setXY(i,position.getX(i)/w+.5,position.getY(i)/h);
  }
 }
 uv.needsUpdate=true;g.computeVertexNormals();
 g.userData={cardboardCutout:true,handIllustrated:true,kind,variant,thin:true};
 return {geometry:g,painting:paint(kind,variant,points)};
}
function faceMaterial(THREE,canvas){
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.magFilter=THREE.LinearFilter;
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.anisotropy=4;
 return new THREE.MeshBasicMaterial({map:texture,color:'#ffffff',
  side:THREE.DoubleSide,alphaTest:.35,depthWrite:true,transparent:false});
}
export function installHandDrawnStage({THREE,scene,camera,player,
 treeLocations,shrubSites,naturalSurfaceY,cabin,waterBodies,waterAt,
 oldForest=[],oldShrubs=null}){
 oldForest.forEach(m=>m.visible=false);
 if(oldShrubs)oldShrubs.visible=false;
 const edgeTex=makeCorrugatedTexture(THREE);
 const edge=new THREE.MeshStandardMaterial({
  map:edgeTex,color:'#f0d1a2',side:THREE.DoubleSide,roughness:1,
  metalness:0,flatShading:true
 });
 const artworks=[],cards=[],batchStates=[];
 const kindStyles={
  pine:{n:5,w:3.12,h:4.52,shadow:true},
  broad:{n:5,w:3.55,h:4.08,shadow:true},
  shrub:{n:3,w:1.43,h:1.16},
  flower:{n:3,w:.73,h:1.04},
  mushroom:{n:3,w:1.13,h:1.24},
  mountain:{n:2,w:8.8,h:7.0}
 };
 function addBatch(kind,positions){
  if(!positions.length)return;
  const style=kindStyles[kind],buckets=Array.from({length:style.n},()=>[]);
  positions.forEach((p,i)=>buckets[Math.abs(Math.floor((p.seed??i)*73+i*7))%style.n].push(p));
  for(let index=0;index<style.n;index++){
   const positions=buckets[index];if(!positions.length)continue;
   const art=geometry(THREE,kind,index,style.w,style.h);
   const material=faceMaterial(THREE,art.painting);
   artworks.push({kind,index,material,geometry:art.geometry});
   const mesh=new THREE.InstancedMesh(art.geometry,[material,edge],positions.length);
   mesh.name='handmade-cardboard-'+kind+'-'+index;mesh.frustumCulled=false;
   mesh.castShadow=!!style.shadow;mesh.receiveShadow=false;
   scene.add(mesh);cards.push(mesh);
   batchStates.push({mesh,positions,style,kind});
  }
 }
 const trees=[
  ...treeLocations.pine.map(p=>({...p,kind:'pine'})),
  ...treeLocations.broadleaf.map(p=>({...p,kind:'broad'}))
 ];
 addBatch('pine',trees.filter(p=>p.kind==='pine'));
 addBatch('broad',trees.filter(p=>p.kind==='broad'));
 // Maintain authored shrub placement density, but reveal small standees and
 // a few distinct flowers/mushrooms like the user's reference photograph.
 const shrubs=shrubSites.map((s,i)=>({...s,seed:Math.abs(Math.sin(s.x*17.2+s.z*9.1+i)),
  scale:.31+Math.abs(Math.sin(s.x+s.z))* .23}));
 addBatch('shrub',shrubs);
 const accents=shrubs.filter((_,i)=>i%19===0).map(s=>({...s,scale:.53}));
 const fungi=shrubs.filter((_,i)=>i%29===7).map(s=>({...s,scale:.48}));
 addBatch('flower',accents);addBatch('mushroom',fungi);
 // Flat theater backdrop panels only in non-traversal rear perimeter sites.
 // They don't replace or alter the climbable ORIGINAL mountains.
 const backdrop=[[-73,-71,0],[-60,-72,1],[-44,-73,2],[-27,-72,3]]
  .map(([x,z,i])=>({x,z,y:naturalSurfaceY(x,z),seed:i*.13,scale:1.10}));
 addBatch('mountain',backdrop);
 // Facade card placed exactly against the already-present and collidable
 // original cabin facade. Door/roof/windows are painted on the card.
 const hx=(cabin.minX+cabin.maxX)/2,hy=cabin.floorY-.1,hz=cabin.maxZ+.17;
 const houseCanvas=document.createElement('canvas');houseCanvas.width=640;houseCanvas.height=480;
 const x=houseCanvas.getContext('2d'),rand=random(3328);
 x.clearRect(0,0,640,480);
 x.fillStyle='#fffdf2';x.strokeStyle='#252927';x.lineWidth=9;
 x.beginPath();x.moveTo(75,170);x.lineTo(310,35);x.lineTo(553,164);
 x.lineTo(550,457);x.lineTo(72,457);x.closePath();x.fill();x.stroke();
 x.fillStyle='#f6d575';x.fillRect(94,171,441,278);
 x.strokeRect(94,171,441,278);
 for(let i=0;i<340;i++){
  x.strokeStyle=rand()>.5?'#f3904b':'#ffe9a9';x.lineWidth=1+rand()*3;
  const xx=95+rand()*437,yy=174+rand()*267;
  inkStroke(x,[[xx,yy],[xx+rand()*15,yy-rand()*5]],1+rand()*1.5);
 }
 brush(x,rand,'#e95659',[[65,181],[312,41],[568,187],[542,199],[311,83],[91,200]]);
 brush(x,rand,'#a67552',[[271,450],[271,284],[374,284],[376,450]]);
 for(const [cx,cy] of [[175,289],[470,285]]){
  x.fillStyle='#91ddec';x.fillRect(cx-44,cy-43,88,90);
  x.strokeStyle='#282c2b';x.lineWidth=6;x.strokeRect(cx-44,cy-43,88,90);
  inkStroke(x,[[cx,cy-43],[cx,cy+47]],5);
  inkStroke(x,[[cx-44,cy],[cx+44,cy]],5);
 }
 x.fillStyle='#f9d930';x.fillRect(345,366,13,13);
 const houseMap=new THREE.CanvasTexture(houseCanvas);houseMap.colorSpace=THREE.SRGBColorSpace;
 const houseShape=new THREE.Shape();
 [[-.5,0],[-.5,2.69],[0,4.37],[.5,2.69],[.5,0]].forEach(([a,b],i)=>{
  if(i===0)houseShape.moveTo(a*10,b);else houseShape.lineTo(a*10,b);
 });houseShape.closePath();
 const housePanel=new THREE.Mesh(new THREE.PlaneGeometry(10,4.5),
  new THREE.MeshBasicMaterial({map:houseMap,side:THREE.DoubleSide,
   alphaTest:.3,transparent:false,depthWrite:true}));
 housePanel.position.set(hx,hy+2.25,hz);
 housePanel.name='handmade-cabin-front';scene.add(housePanel);
 // Visible triangular craft supports at the bases; deliberately few, not
 // collision blockers (rendering-only), and oriented with stage cards.
 const tabGeom=new THREE.ConeGeometry(.11,.30,3);
 const tabMat=new THREE.MeshStandardMaterial({color:'#bc955f',roughness:1});
 const tabPositions=trees.filter((_,i)=>i%3===0).concat(accents.slice(0,16));
 const tab=new THREE.InstancedMesh(tabGeom,tabMat,tabPositions.length*2);
 tab.name='cardboard-folded-standing-tabs';tab.frustumCulled=false;
 const dummy=new THREE.Object3D();
 let lastYaw=null;
 function update(){
  const direction=Math.atan2(camera.position.x-player.position.x,
   camera.position.z-player.position.z);
  if(lastYaw!==null&&Math.abs(Math.atan2(Math.sin(direction-lastYaw),
       Math.cos(direction-lastYaw)))<.012)return;
  lastYaw=direction;
  for(const {mesh,positions,style} of batchStates){
   positions.forEach((p,i)=>{
    dummy.position.set(p.x,p.y+.023,p.z);
    dummy.rotation.set(0,direction+(p.seed-.5)*.21,0);
    const size=p.scale??1;dummy.scale.set(size,size,size);
    dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
   });
   mesh.instanceMatrix.needsUpdate=true;
  }
  tabPositions.forEach((p,i)=>{
   for(let side=0;side<2;side++){
    const dx=side===0?-.18:.18;
    dummy.position.set(p.x+Math.cos(direction)*dx,
      p.y+.12,(p.z-Math.sin(direction)*dx));
    dummy.rotation.set(Math.PI/2,direction,side?.12:-.12);
    dummy.scale.set(1,1,1);dummy.updateMatrix();tab.setMatrixAt(i*2+side,dummy.matrix);
   }
  });
  tab.instanceMatrix.needsUpdate=true;
 }
 scene.add(tab);cards.push(tab);
 update();
 // Trace the shoreline of the REAL lake, above its original water height.
 const lake=waterBodies.find(b=>b.kind==='lake');
 if(lake){
  const pts=[];
  for(let i=0;i<128;i++){
   const a=i*TAU/128,x=lake.x+lake.rx*Math.cos(a)*.98,
    z=lake.z+lake.rz*Math.sin(a)*.98;
   const w=waterAt(x,z);
   if(w&&Number.isFinite(w.surfaceY))pts.push(new THREE.Vector3(x,w.surfaceY+.052,z));
  }
  if(pts.length>20){
   const line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({color:'#263d71'}));
   line.name='drawn-blue-paper-lake-cut-edge';scene.add(line);
  }
 }
 const status={style:'hand-painted-school-cardboard-standees',
  illustratedCards:cards.length,variants:artworks.length,
  trees:trees.length,plants:shrubs.length,flowers:accents.length,
  mushrooms:fungi.length,mountainBackdrops:backdrop.length,
  cabinFacade:true,foldedSupports:tab.count,originalCollisionsPreserved:true};
 return {status,update,cards};
}
