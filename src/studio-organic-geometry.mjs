/** Deterministic, asymmetric forest crowns for the optional Studio rendering.
 * All shapes are decorative BufferGeometry. Keep player physics and lowland
 * grass unrelated to these shapes. Each family has several real mesh variants.
 */
export function createStudioFoliageGeometry(THREE){
 const make=()=>({positions:[],colors:[],indices:[],paintUV:[],surfaceTypes:[]});
 const col=(h,s,l)=>new THREE.Color().setHSL(h,s,l);
 const v=(g,p,c,uv=[.5,.5],surface=1)=>{
  g.positions.push(p[0],p[1],p[2]);
  g.colors.push(c.r,c.g,c.b);
  g.paintUV.push(uv[0],uv[1]);g.surfaceTypes.push(surface);
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
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(g.positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(g.colors,3));
  geo.setAttribute('studioPaintUV',new THREE.Float32BufferAttribute(g.paintUV,2));
  geo.setAttribute('studioSurfaceType',new THREE.Float32BufferAttribute(g.surfaceTypes,1));
  geo.setIndex(g.indices);geo.computeVertexNormals();geo.computeBoundingSphere();
  geo.userData={...info};
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
 const wood=()=>col(.083,.32,.24);
 function tube(g,a,b,r0,r1,tint){
  let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
  const len=Math.hypot(dx,dy,dz);if(len<.0001)return;
  dx/=len;dy/=len;dz/=len;
  let ux=-dz,uy=0,uz=dx;
  let ul=Math.hypot(ux,uy,uz);
  if(ul<.0001){ux=1;uy=0;uz=0;ul=1;}
  ux/=ul;uz/=ul;
  const vx=dy*uz-dz*uy,vy=dz*ux-dx*uz,vz=dx*uy-dy*ux;
  const n=6,start=g.positions.length/3;
  for(let ring=0;ring<2;ring++){
   const p=ring?b:a,r=ring?r1:r0;
   for(let k=0;k<=n;k++){
    const theta=k*2*Math.PI/n,co=Math.cos(theta),si=Math.sin(theta);
    v(g,[p[0]+r*(ux*co+vx*si),p[1]+r*(uy*co+vy*si),p[2]+r*(uz*co+vz*si)],
     tint,[k/n,ring*len*1.18],0);
   }
  }
  for(let k=0;k<n;k++){
   const a0=start+k,a1=start+k+1,b0=start+n+1+k,b1=start+n+2+k;
   g.indices.push(a0,a1,b0,a1,b1,b0);
  }
 }
 function foliageLeaf(g,root,dir,length,width,tint,up=.12,surface=2){
  // A folded, tapered painted leaf with a lifted midrib and rounded shoulder.
  // Coordinates provide local UVs to the shared broadleaf/needle paint maps.
  const horizontal=Math.hypot(dir[0],dir[2])||1;
  const dx=dir[0]/horizontal,dz=dir[2]/horizontal;
  const lateral=(x,y,w,height)=>{
   const advance=length*x;
   return [root[0]+dx*advance-dz*w*width,
    root[1]+up*y+height,
    root[2]+dz*advance+dx*w*width];
  };
  const widthFactor=surface===1?.78:1;
  const rootId=v(g,lateral(0,0,0,0),tint,[.5,0],surface);
  const l1=v(g,lateral(.22,.20,-.55*widthFactor,.005),tint,[.23,.25],surface);
  const l2=v(g,lateral(.61,.57,-1.0*widthFactor,.010),tint,[.02,.63],surface);
  const tip=v(g,lateral(1,1,0,.02),tint,[.5,1],surface);
  const r2=v(g,lateral(.61,.57,1.0*widthFactor,-.010),tint,[.98,.63],surface);
  const r1=v(g,lateral(.22,.20,.55*widthFactor,-.005),tint,[.77,.25],surface);
  const ridge=v(g,lateral(.55,.52,0,.075),tint,[.5,.57],surface);
  g.indices.push(rootId,l1,r1,l1,l2,ridge,l2,tip,ridge,
   ridge,tip,r2,ridge,r2,r1,rootId,r1,ridge,rootId,ridge,l1);
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
  for(let i=0;i<6;i++)tube(g,spine(i*.48),spine((i+1)*.48),.085-i*.009,.076-i*.009,bark);
  let branches=0,reach=0;
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
    tube(g,p0,p1,.028,.019,bark);tube(g,p1,p2,.019,.006,bark);
    branches++;reach=Math.max(reach,Math.hypot(p2[0],p2[2]));
    for(let k=1;k<=5;k++){
     const t=k/6,center=[mix(p0[0],p2[0],t),mix(p0[1],p2[1],t),mix(p0[2],p2[2],t)];
     for(let n=0;n<4;n++){
      const spreadAngle=angle+(n-1.5)*(.70+.24*r())+.10*(r()-.5);
      const dir=[Math.cos(spreadAngle),0,Math.sin(spreadAngle)];
      const leafLen=(.16+.18*r())*(1-.27*t),leafWidth=.077+.055*r();
      const tint=col(.293+.065*r(),.48+.14*r(),.205+.15*r());
      foliageLeaf(g,center,dir,leafLen,leafWidth,tint,(r()-.27)*.22,1);
     }
    }
   }
  }
  for(let i=0;i<11;i++){
   const a=r()*Math.PI*2,base=spine(2.56+.23*r());
   foliageLeaf(g,base,[Math.cos(a),0,Math.sin(a)],.12+.12*r(),.045,col(.32+.02*r(),.58,.27+.07*r()),.12,1);
  }
  return finalize(g,{family:'pine',variant,branchCount:branches,maxReach:reach});
 }
 function broadleaf(variant){
  const r=rng(0xB04DF3^Math.imul(variant+1,0xB5297A4D)),g=make(),bark=wood();
  const trunk=[0,-.18,0],crotch=[(r()-.5)*.14,.34,(r()-.5)*.14];
  tube(g,trunk,crotch,.17,.105,bark);
  const mains=5+Math.floor(r()*3),dominant=r()*Math.PI*2;
  let tipCount=0,maxReach=0;
  for(let i=0;i<mains;i++){
   const angle=(i+(r()-.5)*.65)*(2*Math.PI/mains)+.15*variant;
   const co=Math.cos(angle),si=Math.sin(angle);
   const dominantBias=1+.38*Math.cos(angle-dominant);
   const reach=(1.48+.72*r())*dominantBias;
   const y1=.58+.49*r(),y2=1.13+.78*r();
   const p1=[crotch[0]+co*(.46+.18*r()),y1,crotch[2]+si*(.46+.18*r())];
   const p2=[crotch[0]+co*reach*.75+(r()-.5)*.23,
      y2*.83,crotch[2]+si*reach*.75+(r()-.5)*.23];
   const p3=[crotch[0]+co*reach+(r()-.5)*.30,
      y2+.10+.35*r(),crotch[2]+si*reach+(r()-.5)*.30];
   tube(g,crotch,p1,.102,.079,bark);tube(g,p1,p2,.079,.048,bark);
   tube(g,p2,p3,.048,.014,bark);
   maxReach=Math.max(maxReach,Math.hypot(p3[0],p3[2]));tipCount++;
   // Secondary limbs reach sideways and UP; their tips carry leaves.
   const tips=[p2,p3];
   for(let j=0;j<2;j++){
    const side=j===0?-1:1;
    const t=.60+.30*r();
    const base=[mix(p1[0],p3[0],t),mix(p1[1],p3[1],t),mix(p1[2],p3[2],t)];
    const sideAngle=angle+side*(.35+.50*r());
    const reach2=.36+.57*r();
    const tip=[base[0]+Math.cos(sideAngle)*reach2,base[1]+.25+.48*r(),
      base[2]+Math.sin(sideAngle)*reach2];
    tube(g,base,tip,.039,.009,bark);
    tips.push(tip);tipCount++;
    maxReach=Math.max(maxReach,Math.hypot(tip[0],tip[2]));
   }
   for(const tip of tips){
    const count=10+Math.floor(r()*7);
    const anisAngle=angle+(r()-.5)*.65;
    for(let j=0;j<count;j++){
     const alpha=anisAngle+(j+(r()-.5)*.5)*Math.PI*2/count;
     const dir=[Math.cos(alpha),0,Math.sin(alpha)];
     const root=[tip[0]+(r()-.5)*.33,tip[1]+(r()-.5)*.35,tip[2]+(r()-.5)*.33];
     foliageLeaf(g,root,dir,.27+.39*r(),.12+.11*r(),
      col(.275+.075*r(),.42+.18*r(),.25+.20*r()),.07+.31*r());
    }
   }
  }
  // Vertical leading shoots disturb the top edge of the canopy.
  for(let i=0;i<3;i++){
   const a=dominant+(r()-.5)*2.4,base=[.16*Math.cos(a),.61+.28*r(),.16*Math.sin(a)];
   const tip=[.32*Math.cos(a),1.95+.58*r(),.32*Math.sin(a)];
   tube(g,base,tip,.046,.008,bark);
   for(let j=0;j<7;j++){
    const around=2*Math.PI*j/7;
    const root=[tip[0],tip[1]-.27+.12*r(),tip[2]];
    foliageLeaf(g,root,[Math.cos(around),0,Math.sin(around)],.27+.22*r(),.115,
     col(.29+.055*r(),.48,.28+.16*r()),.25+.12*r());
   }
  }
  return finalize(g,{family:'broadleaf',variant,branchCount:tipCount,maxReach});
 }
 const pineVariants=Array.from({length:6},(_,i)=>pine(i));
 const broadleafVariants=Array.from({length:5},(_,i)=>broadleaf(i));
 return {meadow:meadow(),pine:pineVariants[0],broadleaf:broadleafVariants[0],
  pineVariants,broadleafVariants};
}