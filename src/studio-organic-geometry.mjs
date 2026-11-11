/** Deterministic, asymmetric forest crowns for the optional Studio rendering.
 * All shapes are decorative BufferGeometry. Keep player physics and lowland
 * grass unrelated to these shapes. Each family has several real mesh variants.
 */
export function createStudioFoliageGeometry(THREE,{meadowOnly=false}={}){
 const make=()=>({positions:[],colors:[],uvs:[],indices:[],barkIndices:[],cardCount:0});
 const col=(h,s,l)=>new THREE.Color().setHSL(h,s,l);
 const v=(g,p,c,uv=[.5,.5])=>{
  g.positions.push(p[0],p[1],p[2]);
  g.colors.push(c.r,c.g,c.b);
  g.uvs.push(uv[0],uv[1]);
  return g.positions.length/3-1;
 };
 const tri=(g,a,b,c,tint)=>{
  const x=v(g,a,tint),y=v(g,b,tint),z=v(g,c,tint);
  g.indices.push(x,y,z);
 };
 const quad=(g,a,b,c,d,tint)=>{
  const x=v(g,a,tint),y=v(g,b,tint),z=v(g,c,tint),w=v(g,d,tint);
  g.indices.push(x,y,z,y,w,z);
 };
 const finalize=(g,info)=>{
  const geo=new THREE.BufferGeometry(),leafCount=g.indices.length;
  geo.setAttribute('position',new THREE.Float32BufferAttribute(g.positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(g.colors,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(g.uvs,2));
  geo.setIndex(g.indices.concat(g.barkIndices));
  if(leafCount)geo.addGroup(0,leafCount,0);
  if(g.barkIndices.length)geo.addGroup(leafCount,g.barkIndices.length,1);
  geo.computeVertexNormals();geo.computeBoundingSphere();
  geo.userData={...info,leafTriangles:leafCount/3,barkTriangles:g.barkIndices.length/3,canopyCards:g.cardCount,foliageStyle:'crossed-alpha-clumps'};
  return geo;
 };
 const rng=seed=>{
  let x=seed>>>0;
  return ()=>{
   x=(x+0x6D2B79F5)|0;
   let z=Math.imul(x^(x>>>15),1|x);
   z^=z+Math.imul(z^(z>>>7),61|z);
   return ((z^(z>>>14))>>>0)/4294967296;
  };
 };
 const mix=(a,b,t)=>a+(b-a)*t;
 // Wood pigments must stay light enough to let the independently painted
 // bark map read on branches. The old dark vertex tint crushed its detail.
 const wood=()=>col(.082,.14,.78);
 function tube(g,a,b,r0,r1,tint){
  let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
  const len=Math.hypot(dx,dy,dz);if(len<.0001)return;
  dx/=len;dy/=len;dz/=len;
  let ux=-dz,uy=0,uz=dx;
  let ul=Math.hypot(ux,uy,uz);
  if(ul<.0001){ux=1;uy=0;uz=0;ul=1;}
  ux/=ul;uz/=ul;
  const vx=dy*uz-dz*uy,vy=dz*ux-dx*uz,vz=dx*uy-dy*ux;
  const n=5,start=g.positions.length/3;
  for(let ring=0;ring<2;ring++){
   const p=ring?b:a,r=ring?r1:r0;
   for(let k=0;k<n;k++){
    const theta=k*2*Math.PI/n,co=Math.cos(theta),si=Math.sin(theta);
    v(g,[p[0]+r*(ux*co+vx*si),p[1]+r*(uy*co+vy*si),
     p[2]+r*(uz*co+vz*si)],tint,[k/n,ring?len*1.30:0]);
   }
  }
  for(let k=0;k<n;k++){
   const next=(k+1)%n,a0=start+k,a1=start+next,b0=start+n+k,b1=start+n+next;
   g.barkIndices.push(a0,a1,b0,a1,b1,b0);
  }
 }
 function curvedBranch(g,a,b,r0,r1,tint,arch=.055){
  // Short overlapping tubular spans hide the mechanical straight-line seams
  // at fork nodes, without adding physics or per-frame transforms.
  const mid=[(a[0]+b[0])*.5,(a[1]+b[1])*.5+arch,
    (a[2]+b[2])*.5];
  tube(g,a,mid,r0,(r0+r1)*.55,tint);
  tube(g,mid,b,(r0+r1)*.55,r1,tint);
 }
 function branchCollar(g,p,r,tint){
  // Slightly thicker organic branch root, anchored in the parent wood.
  const stem=[p[0],p[1]-r*1.75,p[2]];
  const cap=[p[0],p[1]+r*1.7,p[2]];
  tube(g,stem,cap,r*.71,r*.49,tint);
 }
 // Billboard-free crossed cards with four vertices and two triangles each.
 // The card is physically situated at a terminal twig, never at random in space.
 function foliageCard(g,centre,yaw,width,height,tilt,tile,tint){
  const axis=[Math.cos(yaw),0,Math.sin(yaw)],normal=[-axis[2],0,axis[0]];
  const up=[normal[0]*Math.sin(tilt),Math.cos(tilt),normal[2]*Math.sin(tilt)];
  const corner=(side,high)=>[
   centre[0]+axis[0]*side*width*.5+up[0]*high*height*.5,
   centre[1]+up[1]*high*height*.5,
   centre[2]+axis[2]*side*width*.5+up[2]*high*height*.5];
  // CanvasTexture flips Y: the upper atlas row occupies high UV v.
  const column=tile%4,row=Math.floor(tile/4),padding=5;
  const u0=(column*256+padding)/1024,u1=((column+1)*256-padding)/1024;
  const top=1-(row*256+padding)/512,bottom=1-((row+1)*256-padding)/512;
  const first=g.positions.length/3;
  v(g,corner(-1,-1),tint,[u0,bottom]);
  v(g,corner(1,-1),tint,[u1,bottom]);
  v(g,corner(-1,1),tint,[u0,top]);
  v(g,corner(1,1),tint,[u1,top]);
  g.indices.push(first,first+1,first+2,first+1,first+3,first+2);
  g.cardCount++;
 }
 function foliageClump(g,site,heading,rand,needle=false,scale=1){
  const n=3,widthBase=needle?.45:.68,heightBase=needle?.43:.59;
  const tone=col(needle?.298:.278,.075+.055*rand(),.91+.07*rand());
  const rotation=heading+(rand()-.5)*.63;
  for(let i=0;i<n;i++){
   const yaw=rotation+i*Math.PI/n+(rand()-.5)*.25;
   const offset=(rand()-.50)*(needle?.15:.23)*scale;
   const centre=[
    site[0]+Math.cos(heading)*offset+Math.cos(yaw)*.065*scale,
    site[1]+(rand()-.44)*(needle?.16:.21)*scale,
    site[2]+Math.sin(heading)*offset+Math.sin(yaw)*.065*scale];
   foliageCard(g,centre,yaw,widthBase*scale*(.84+.36*rand()),
    heightBase*scale*(.81+.40*rand()),(rand()-.5)*.72,
    Math.floor(rand()*8),tone);
  }
 }
 function meadow(){
  const g=make();
  for(let j=0;j<19;j++){
   const a=j*2.399963229728653,co=Math.cos(a),si=Math.sin(a);
   const len=.55+.40*(.5+.5*Math.sin(j*4.17));
   const height=.54+.28*(.5+.5*Math.sin(j*2.83));
   const bend=.18+.29*(.5+.5*Math.sin(j*3.64));
   const breadth=.055+.040*(.5+.5*Math.sin(j*1.96));
   const hue=.235+.045*Math.sin(j*1.74),origin=.028*Math.sqrt(j);
   let prev=[];
   for(let k=0;k<=7;k++){
    const t=k/7,w=Math.pow(Math.sin(Math.PI*t),.75)*breadth;
    const rr=origin+len*t+bend*t*t,y=.006+height*(t-.21*t*t);
    const tint=col(hue,.55,.27+.23*t+.04*Math.sin(j*.94));
    const left=v(g,[co*rr-si*w,y+.016*Math.sin(t*Math.PI),si*rr+co*w],tint);
    const right=v(g,[co*rr+si*w,y-.005,si*rr-co*w],tint);
    if(prev.length)g.indices.push(prev[0],prev[1],left,prev[1],right,left);
    prev=[left,right];
   }
  }
  return finalize(g,{family:'meadow',variant:0});
 }
 function pine(variant){
  const r=rng(0x51F0A7^Math.imul(variant+1,0x9E3779B1)),g=make();
  const tiltAngle=r()*2*Math.PI,lean=.055+r()*.12;
  const shift=y=>[Math.cos(tiltAngle)*lean*(y/2.8),Math.sin(tiltAngle)*lean*(y/2.8)];
  const spine=y=>{const p=shift(y);return [p[0],y,p[1]];};
  const bark=wood();
  // Unified bark stem reaches into the soil and tapers inside foliage.
  // An independent cylinder was leaving a large, square-cut wooden post.
  const pineBottom=-2.40,pineTop=2.61,sections=13;
  const pineRadius=y=>.012+.202*Math.pow(Math.max(0,
   (pineTop-y)/(pineTop-pineBottom)),1.24);
  for(let i=0;i<sections;i++){
   const y0=mix(pineBottom,pineTop,i/sections);
   const y1=mix(pineBottom,pineTop,(i+1)/sections);
   tube(g,spine(y0),spine(y1),pineRadius(y0),pineRadius(y1),bark);
  }
  let branches=0,reach=0,secondaryBranches=0,tertiaryBranches=0,terminalClusters=0;
  const layerCount=9+(variant%2);
  const anisotropyAngle=r()*2*Math.PI;
  const heavySide=.22+.28*r();
  for(let level=0;level<layerCount;level++){
   const branchCount=5+Math.floor(r()*5);
   const height=.27+level*(2.22/layerCount);
   const phase=r()*Math.PI*2+level*(.17+.28*r());
   for(let j=0;j<branchCount;j++){
    if(r()<.15)continue; // gaps reveal the nonuniform skeleton
    const angle=phase+2*Math.PI*(j+(r()-.5)*.65)/branchCount;
    const sideWeight=1+heavySide*Math.cos(angle-anisotropyAngle);
    const length=(1.25-.106*level)*(.65+.62*r())*sideWeight;
    const co=Math.cos(angle),si=Math.sin(angle);
    const p0=spine(height);
    const p1=[p0[0]+co*length*.55,height-(.08+.18*r()),p0[2]+si*length*.55];
    const p2=[p0[0]+co*length*(.87+.15*r()),p1[1]+(.10*r()-.12),p0[2]+si*length*(.87+.15*r())];
    curvedBranch(g,p0,p1,.043,.024,bark,.032);
    curvedBranch(g,p1,p2,.024,.007,bark,-.016);
    if(j%3===0)branchCollar(g,p0,.055,bark);
    branches++;reach=Math.max(reach,Math.hypot(p2[0],p2[2]));
    // Secondary shoots and tertiary needle tips stay connected to each limb.
    for(let k=1;k<=2;k++){
     const t=k/3;
     const node=[mix(p0[0],p2[0],t),mix(p0[1],p2[1],t),mix(p0[2],p2[2],t)];
     for(const side of [-1,1]){
      const theta=angle+side*(.56+.40*r()),distance=(.20+.18*r())*(1-.18*t);
      const mid=[node[0]+Math.cos(theta)*distance*.60,
       node[1]+(r()-.52)*.09,node[2]+Math.sin(theta)*distance*.60];
      const end=[node[0]+Math.cos(theta)*distance,
       mid[1]+(r()-.35)*.07,node[2]+Math.sin(theta)*distance];
      tube(g,node,mid,.013,.008,bark);
      tube(g,mid,end,.008,.0025,bark);
      secondaryBranches++;tertiaryBranches++;
      foliageClump(g,end,theta,r,true,1.12);terminalClusters++;
      if(k===2&&r()>.54)foliageClump(g,mid,theta,r,true,.65);
     }
    }
    foliageClump(g,p2,angle,r,true,1.22);terminalClusters++;
    if(j%2===0)foliageClump(g,p1,angle,r,true,.72);
   }
  }
   // Small terminal needle sprays hide the trunk tip.
   for(let i=0;i<9;i++){
    const angle=r()*Math.PI*2,top=spine(2.43+.17*r());
    foliageClump(g,top,angle,r,true,.54+.22*r());
   }
  return finalize(g,{family:'pine',variant,branchCount:branches,maxReach:reach,integratedTrunk:true,trunkBaseY:-2.40,branchOrders:{primary:branches,secondary:secondaryBranches,tertiary:tertiaryBranches},terminalClusters});
 }
 function broadleaf(variant){
  const r=rng(0xB04DF3^Math.imul(variant+1,0xB5297A4D)),g=make(),bark=wood();
  const dominant=r()*2*Math.PI,crotch=[(r()-.5)*.25,.30+.16*r(),(r()-.5)*.25];
  // A curved main trunk rising from the terrain and dividing into two
  // independent woody leaders: genuine Y-shaped tree architecture.
  const trunkBase=[0,-2.40,0];
  const stem=[trunkBase,[crotch[0]*.2,-1.38,crotch[2]*.2],
   [crotch[0]*.47,-.55,crotch[2]*.47],
   [crotch[0]*.76,-.04,crotch[2]*.76],crotch];
  const radii=[.235,.185,.149,.118,.096];
  for(let i=0;i<stem.length-1;i++)
   tube(g,stem[i],stem[i+1],radii[i],radii[i+1],bark);
  const opposite=dominant+Math.PI*(.67+.19*r());
  const leaderA=[crotch[0]+Math.cos(dominant)*.42,
   crotch[1]+.47+.12*r(),crotch[2]+Math.sin(dominant)*.42];
  const leaderB=[crotch[0]+Math.cos(opposite)*.39,
   crotch[1]+.42+.17*r(),crotch[2]+Math.sin(opposite)*.39];
  curvedBranch(g,crotch,leaderA,.095,.068,bark,.045);
  curvedBranch(g,crotch,leaderB,.091,.065,bark,.055);
  branchCollar(g,crotch,.11,bark);
  const orders={primary:0,secondary:0,tertiary:0};
  let maxReach=0,terminalClusters=0;
  const position=(start,heading,elevation,length)=>{
   const flat=Math.cos(elevation);
   return [start[0]+Math.cos(heading)*flat*length,
    start[1]+Math.sin(elevation)*length,
    start[2]+Math.sin(heading)*flat*length];
  };
  function leafTips(p,heading){
   terminalClusters++;
   // These overlap naturally into irregular crowns while following woody tips.
   foliageClump(g,p,heading,r,false,1.22+.22*r());
  }
  function growBranch(start,heading,elevation,length,radius,order){
   const end=position(start,heading,elevation,length);
   const nextRadius=radius*(order===3?.24:.57);
   curvedBranch(g,start,end,radius,nextRadius,bark,(r()-.25)*.07);
   if(order===1)orders.primary++;
   else if(order===2)orders.secondary++;
   else orders.tertiary++;
   maxReach=Math.max(maxReach,Math.hypot(end[0],end[2]));
   if(order===3){
     leafTips(end,heading);
     const inner=position(start,heading,elevation,length*.63);
     if(r()>.22)foliageClump(g,inner,heading,r,false,.78);
     return;
    }
   // Secondary and tertiary branches originate on the actual parent wood.
   const count=order===1?2+Math.floor(r()*2):2;
   for(let j=0;j<count;j++){
    const t=.56+.31*r(),side=j-(count-1)/2;
    const base=[mix(start[0],end[0],t),
     mix(start[1],end[1],t),mix(start[2],end[2],t)];
    const angle=heading+side*(order===1?.70:.92)+(r()-.5)*.35;
    const rise=Math.max(.10,Math.min(1.12,
     elevation+(r()-.40)*(order===1?.53:.67)));
    const segment=length*(order===1?.60:.54)*(.83+.42*r());
    growBranch(base,angle,rise,segment,
     Math.max(.006,nextRadius*.82),order+1);
   }
   if(order===2&&r()>.25)foliageClump(g,end,heading,r,false,.82);
  }
  const mains=5+Math.floor(r()*3);
  for(let i=0;i<mains;i++){
   const heading=(i+(r()-.5)*.64)*2*Math.PI/mains+variant*.14;
   const anchor=i%3===0?crotch:i%2===0?leaderA:leaderB;
   const reach=(1.40+.62*r())*(1+.30*Math.cos(heading-dominant));
   growBranch(anchor,heading,.20+.37*r(),reach,.077+.029*r(),1);
  }
  // Upward leaders continue splitting instead of ending as bare spikes.
  for(const [point,angle] of [[leaderA,dominant],[leaderB,opposite]])
   growBranch(point,angle,.77+.15*r(),.62+.34*r(),.048,2);
  return finalize(g,{family:'broadleaf',variant,
   branchCount:orders.primary+orders.secondary+orders.tertiary,
   maxReach,integratedTrunk:true,trunkBaseY:-2.40,
   branchOrders:orders,leaderCount:2,terminalClusters});
 }
 if(meadowOnly)return {meadow:meadow()};
 const pineVariants=Array.from({length:6},(_,i)=>pine(i));
 const broadleafVariants=Array.from({length:5},(_,i)=>broadleaf(i));
 return {meadow:meadow(),pine:pineVariants[0],broadleaf:broadleafVariants[0],
  pineVariants,broadleafVariants};
}