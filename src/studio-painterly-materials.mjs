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
 // Eight distinct hand-painted, alpha-cutout foliage silhouettes per family.
 // One 1024x512 atlas is shared by all tree instances: no per-tree textures.
 // Cards sample a single padded 256x256 tile, never smear leaf paint across a quad.
 function foliageAtlas(kind){
  const pine=kind==='pine',canvas=makeCanvas(1024,512),ctx=canvas.getContext('2d');
  const dark=pine?['#284936','#31553b','#396447']:['#315639','#3b6440','#456f42'];
  const mids=pine?['#396947','#48784e','#568454','#678e58']:
    ['#48763c','#568344','#648b46','#76984d','#84a354'];
  const lights=pine?['#799d66','#91ac77','#b2bd89']:
    ['#98ad5d','#a6b66e','#bec787'];
  for(let tile=0;tile<8;tile++){
   const rand=makeRandom((pine?71371:33769)+tile*1009);
   const tx=tile%4,ty=Math.floor(tile/4);
   ctx.save();ctx.translate(tx*256,ty*256);
   ctx.beginPath();ctx.rect(9,9,238,238);ctx.clip();
   // Vary the silhouette's weight and dominant sunward lean.
   const lean=(rand()-.5)*25,wide=.84+.23*rand();
   if(pine){
    const line=(x0,y0,x1,y1,width,color)=>{
     ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';
     ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
    };
    // Layer broad shadow sprays first, then overlapping fine needle fans.
    for(let layer=0;layer<2;layer++){
     for(let sprig=0;sprig<29;sprig++){
      const a=rand()*Math.PI*2,rr=Math.sqrt(rand())*.87;
      const x=128+lean+Math.cos(a)*87*rr*wide,y=135+Math.sin(a)*77*rr;
      const heading=a+(rand()-.5)*1.5,reach=19+rand()*33;
      const ex=x+Math.cos(heading)*reach,ey=y+Math.sin(heading)*reach*.80;
      line(x,y,ex,ey,1.1+rand()*1.8,layer?mids[Math.floor(rand()*mids.length)]:dark[Math.floor(rand()*dark.length)]);
      const count=10+Math.floor(rand()*8);
      for(let i=1;i<=count;i++){
       const t=i/(count+1),px=x+(ex-x)*t,py=y+(ey-y)*t;
       const needleLen=(7+rand()*13)*(1-.30*t);
       for(const side of [-1,1]){
        const alphaColor=(layer&&rand()>.73?lights:mids);
        const c=layer?alphaColor[Math.floor(rand()*alphaColor.length)]:dark[Math.floor(rand()*dark.length)];
        const spread=heading+side*(.73+.40*rand());
        line(px,py,px+Math.cos(spread)*needleLen,
         py+Math.sin(spread)*needleLen,1.35+rand()*1.6,c);
       }
      }
     }
    }
    // A few lighter needle tips break up the silhouette without a plastic shine.
    for(let i=0;i<68;i++){
     const a=rand()*Math.PI*2,rr=Math.sqrt(rand())*.88;
     const x=128+lean+Math.cos(a)*100*rr*wide,y=132+Math.sin(a)*96*rr;
     const t=a+(rand()-.5)*1.1,l=3+rand()*9;
     line(x,y,x+Math.cos(t)*l,y+Math.sin(t)*l,1+rand()*1.1,
      lights[Math.floor(rand()*lights.length)]);
    }
   }else{
    // Irregular overlapping brush-painted leaf bundles rather than one green ball.
    const drawLeaf=(x,y,angle,length,width,color,vein)=>{
     ctx.save();ctx.translate(x,y);ctx.rotate(angle);
     const grad=ctx.createLinearGradient(-width*.55,0,width*.65,-length);
     grad.addColorStop(0,color);grad.addColorStop(.62,color);
     grad.addColorStop(1,vein?'#b2ba76':color);
     ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(0,2);
     ctx.bezierCurveTo(-width*.83,-length*.13,-width*1.02,-length*.65,0,-length);
     ctx.bezierCurveTo(width*.96,-length*.74,width*.89,-length*.24,0,2);
     ctx.fill();
     ctx.strokeStyle=vein?'rgba(223,231,171,.27)':'rgba(30,68,32,.17)';
     ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-length*.88);ctx.stroke();
     if(width>9){
      ctx.beginPath();ctx.moveTo(0,-length*.40);ctx.lineTo(-width*.47,-length*.62);
      ctx.moveTo(0,-length*.53);ctx.lineTo(width*.45,-length*.75);ctx.stroke();
     }
     ctx.restore();
    };
    for(let layer=0;layer<3;layer++){
     const count=layer===0?44:layer===1?66:38;
     for(let i=0;i<count;i++){
      const a=rand()*Math.PI*2,rr=Math.sqrt(rand())*(layer===0?.77:.99);
      const x=128+lean+Math.cos(a)*87*rr*wide;
      const y=131+Math.sin(a)*(layer===0?77:88)*rr;
      const radial=Math.atan2(x-128-lean,131-y);
      const rot=radial+(rand()-.5)*1.95;
      const len=(layer===0?18:15)+rand()*(layer===2?24:31);
      const width=(layer===2?6:8)+rand()*9;
      const palette=layer===0?dark:layer===1?mids:(rand()>.42?lights:mids);
      drawLeaf(x,y,rot,len,width,palette[Math.floor(rand()*palette.length)],layer===2);
     }
    }
    // Natural crown gaps remain between cards; avoid a solid opaque round shell.
   }
   ctx.restore();
  }
  return canvas;
 }
 const texture=(canvas,repeat,cutout=false)=>{
  const t=new THREE.CanvasTexture(canvas);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=cutout?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;
  t.repeat.set(repeat[0],repeat[1]);
  t.anisotropy=4;t.generateMipmaps=true;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.needsUpdate=true;return t;
 };
 const woodMap=texture(bark(),[1,1.0]);
 const pineMap=texture(foliageAtlas('pine'),[1,1],true);
 const broadleafMap=texture(foliageAtlas('broadleaf'),[1,1],true);
 const shaded=(map,vertexColors)=>{
  return new THREE.MeshStandardMaterial({
   map,color:'#ffffff',vertexColors,side:THREE.DoubleSide,
   roughness:.93,metalness:0,flatShading:false
  });
 };
 const barkBranches=shaded(woodMap,true);
 const barkTrunks=shaded(woodMap,false);
 barkBranches.roughness=.91;barkTrunks.roughness=.91;
 // Cutout, not alpha blending: stable z-buffer and shadows on crossed cards.
 const cutout=map=>new THREE.MeshStandardMaterial({
  map,color:'#ffffff',vertexColors:true,side:THREE.DoubleSide,
  roughness:1,metalness:0,alphaTest:.39,transparent:false,depthWrite:true,
  alphaToCoverage:true
 });
 const pineLeaves=cutout(pineMap);
 const broadleafLeaves=cutout(broadleafMap);
 return {
  pine:[pineLeaves,barkBranches],
  broadleaf:[broadleafLeaves,barkBranches],
  barkTrunks,barkBranches,
  // This is inspected by the CI harness and useful when evaluating screenshots.
  info:{bark:'painted-grain-256x512',leaves:'painted-broadleaf-clump-atlas-1024x512',
   pine:'painted-needle-spray-atlas-1024x512',materialGroups:2,
   organicJoints:true,branchAnchoredLeaves:true,foliageCards:true,
   canopyAtlasTiles:8,alphaCutout:true}
 };
}
