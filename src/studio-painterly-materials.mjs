/** Lightweight hand-painted-style colour maps for Studio trees.
 * Generated once per app load, shared across every instanced crown. No downloads,
 * no non-Studio shaders, no collision surfaces or third-party dependencies.
 */
export function createStudioTreeMaterials(THREE){
 const makeRandom=seed=>{
  let n=seed>>>0;
  return ()=>{n=(n+0x6D2B79F5)|0;let t=Math.imul(n^(n>>>15),1|n);
   t^=t+Math.imul(t^(t>>>7),61|t);
   return ((t^(t>>>14))>>>0)/4294967296;};
 };
 const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const stroke=(ctx,rand,x,y,dx,dy,width,color)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;
  ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);
  ctx.bezierCurveTo(x+dx*.31+rand()*4-2,y+dy*.31,
    x+dx*.70+rand()*5-2,y+dy*.70,x+dx,y+dy);
  ctx.stroke();
 };
 function bark(){
  const canvas=makeCanvas(256,512),ctx=canvas.getContext('2d'),r=makeRandom(80412);
  const base=ctx.createLinearGradient(0,0,256,0);
  base.addColorStop(0,'#a2a18d');base.addColorStop(.38,'#ddd1b1');
  base.addColorStop(.72,'#aba38c');base.addColorStop(1,'#ccc4a8');
  ctx.fillStyle=base;ctx.fillRect(0,0,256,512);
  // Vertical grain with uneven fissures, overlaid translucent paint strokes.
  for(let i=0;i<580;i++){
   const x=r()*256,y=r()*590-40,len=16+r()*157;
   const crack=r()>.58;
   stroke(ctx,r,x,y,(r()-.5)*17,len,.6+r()* (crack?2.4:7.2),
    crack?'rgba(49,40,25,'+(.16+.26*r())+')':
     'rgba(247,225,171,'+(.09+.20*r())+')');
  }
  for(let i=0;i<220;i++){
   const x=r()*256,y=r()*512;
   stroke(ctx,r,x,y,(r()-.5)*24,3+r()*34,.7+2.5*r(),
    r()>.46?'rgba(51,47,36,.21)':'rgba(255,230,179,.25)');
  }
  // Small bark notches, never a repeated straight grid.
  for(let i=0;i<80;i++){
   const x=r()*256,y=r()*512;
   ctx.save();ctx.translate(x,y);ctx.rotate((r()-.5)*.36);
   ctx.fillStyle='rgba(62,54,37,'+(.05+.16*r())+')';
   ctx.fillRect(-1-r()*3,-1-r()*3,2+r()*7,3+r()*12);
   ctx.restore();
  }
  return canvas;
 }
 function leaf(kind){
  const pine=kind==='pine',canvas=makeCanvas(256,256),ctx=canvas.getContext('2d');
  const r=makeRandom(pine?90183:61194);
  const base=ctx.createLinearGradient(0,0,256,256);
  if(pine){
   base.addColorStop(0,'#c1cda7');base.addColorStop(.45,'#e0e2b6');
   base.addColorStop(1,'#a8c2a0');
  }else{
   base.addColorStop(0,'#d7dfbd');base.addColorStop(.48,'#f3ecc1');
   base.addColorStop(1,'#bdd1aa');
  }
  ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
  // Pigment mottling, more broad-surface brushwork on deciduous leaves.
  for(let i=0;i<(pine?480:720);i++){
   const x=r()*256,y=r()*256,rad=(pine?2:4)+r()*(pine?9:19);
   ctx.fillStyle=r()>.5?'rgba(59,86,52,'+(.02+.10*r())+')':
    'rgba(255,248,189,'+(.03+.16*r())+')';
   ctx.beginPath();ctx.ellipse(x,y,rad*(.3+.6*r()),rad*(.5+r()),r()*6.28,0,6.28);ctx.fill();
  }
  // Longitudinal luminous strokes that follow the leaf's growing axis.
  for(let i=0;i<(pine?125:90);i++){
   const x=r()*256,y=r()*256,len=15+r()*83;
   stroke(ctx,r,x,y,(r()-.5)*13,len,.5+r()*(pine?1.7:3.2),
    r()>.46?'rgba(255,253,205,.24)':'rgba(54,76,51,.13)');
  }
  // Vein of the leaf, soft enough to avoid a printed icon appearance.
  ctx.strokeStyle=pine?'rgba(236,239,187,.27)':'rgba(95,115,65,.19)';
  ctx.lineWidth=pine?2.4:4;
  ctx.beginPath();ctx.moveTo(128,247);ctx.quadraticCurveTo(129,143,129,16);ctx.stroke();
  if(!pine){
   for(let y=37;y<218;y+=21){
    ctx.strokeStyle='rgba(94,120,67,.12)';ctx.lineWidth=1.9;
    ctx.beginPath();ctx.moveTo(129,y+16);ctx.lineTo(57+(y%19),y-11);ctx.stroke();
    ctx.beginPath();ctx.moveTo(129,y+16);ctx.lineTo(201-(y%16),y-16);ctx.stroke();
   }
  }
  return canvas;
 }
 const texture=(canvas,repeat)=>{
  const t=new THREE.CanvasTexture(canvas);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(repeat[0],repeat[1]);
  t.anisotropy=4;t.generateMipmaps=true;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.needsUpdate=true;return t;
 };
 const woodMap=texture(bark(),[1,1.0]);
 const pineMap=texture(leaf('pine'),[1,1]);
 const broadleafMap=texture(leaf('broadleaf'),[1,1]);
 const shaded=(map,vertexColors)=>{
  return new THREE.MeshStandardMaterial({
   map,color:'#ffffff',vertexColors,side:THREE.DoubleSide,
   roughness:.93,metalness:0,flatShading:false
  });
 };
 const barkBranches=shaded(woodMap,true);
 const barkTrunks=shaded(woodMap,false);
 const pineLeaves=shaded(pineMap,true);
 const broadleafLeaves=shaded(broadleafMap,true);
 return {
  pine:[pineLeaves,barkBranches],
  broadleaf:[broadleafLeaves,barkBranches],
  barkTrunks,barkBranches,
  // This is inspected by the CI harness and useful when evaluating screenshots.
  info:{bark:'painted-grain-256x512',leaves:'painted-veins-256x256',
   pine:'painted-needle-pigment-256x256',materialGroups:2}
 };
}
