/** Organic, vertex-colored, decorative meshes for the opt-in Studio view. */
export function createStudioFoliageGeometry(THREE){
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const make=()=>({vertices:[],colors:[],indices:[]});
 const color=(h,s,l)=>new THREE.Color().setHSL(h,s,l);
 function point(g,p,c){g.vertices.push(...p);g.colors.push(c.r,c.g,c.b);return g.vertices.length/3-1;}
 function quad(g,a,b,c,d){g.indices.push(a,b,c,b,d,c);}
 function finalize(g){
  const out=new THREE.BufferGeometry();
  out.setAttribute('position',new THREE.Float32BufferAttribute(g.vertices,3));
  out.setAttribute('color',new THREE.Float32BufferAttribute(g.colors,3));
  out.setIndex(g.indices);out.computeVertexNormals();out.computeBoundingSphere();return out;
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
   let prior=[];
   for(let k=0;k<=7;k++){
    const t=k/7,w=Math.pow(Math.sin(Math.PI*t),.75)*breadth;
    const centerR=origin+len*t+bend*t*t;
    const y=.006+height*(t-.21*t*t);
    const c=color(hue,.55,clamp(.27+.23*t+.04*Math.sin(j*.94),.17,.66));
    const left=point(g,[co*centerR-si*w,y+.016*Math.sin(t*Math.PI),si*centerR+co*w],c);
    const right=point(g,[co*centerR+si*w,y-.005,si*centerR-co*w],c);
    if(prior.length)quad(g,prior[0],prior[1],left,right);prior=[left,right];
   }
  }return finalize(g);
 }
 function pine(){
  // Narrow crossed needle sprays replace the horizontal pancake-like fronds.
  const g=make();
  function blade(a,b,c,h,l){
   const tint=color(h,.56,l);
   const i=point(g,a,tint),j=point(g,b,tint),k=point(g,c,tint);
   g.indices.push(i,j,k);
  }
  for(let level=0;level<9;level++){
   const base=.32+level*.302,count=12+(level%4),radius=1.22-level*.111;
   for(let j=0;j<count;j++){
    const a=j*6.283185307/count+level*.51+.13*Math.sin(j*2.2+level);
    const co=Math.cos(a),si=Math.sin(a),tx=-si,tz=co;
    const len=radius*(.87+.12*Math.sin(j*3.67+level*4.8));
    const yaw=.035*Math.sin(j*3.4+level*1.87);
    for(let k=1;k<=7;k++){
     const t=k/8,along=len*t;
     const y=base-.27*along+.14*along*along+
      .064*Math.sin(j*2.91+level*1.41);
     const x=co*(.06+along)+tx*yaw,z=si*(.06+along)+tz*yaw;
     const spread=(.135+.095*(1-t))*(.82+.18*Math.sin(j*2.7+k*1.5));
     const hue=.305+.043*Math.sin(j*.86+k*.35+level*.54);
     const light=Math.max(.15,Math.min(.54,
      .24+.085*t+.064*Math.sin(j*1.7+k*.67)));
     for(let needle=0;needle<4;needle++){
      const phi=needle*Math.PI/2+.37*Math.sin(j+level+k);
      const lateral=Math.cos(phi),vertical=Math.sin(phi);
      const length=(.13+.15*(1-t))*(.84+.22*Math.sin(j*2.7+needle));
      const baseP=[x-tx*lateral*spread*.55,y-vertical*spread*.32,z-tz*lateral*spread*.55];
      const flank=[x+tx*lateral*spread,y+vertical*spread,z+tz*lateral*spread];
      const tip=[x+co*length+tx*lateral*spread*.48,
       y+vertical*spread*.57-.10*length,
       z+si*length+tz*lateral*spread*.48];
      blade(baseP,flank,tip,hue,light);
     }
    }
   }
  }
  return finalize(g);
 }
 function broadleaf(){
  // Avoid a balloon of icosahedra. Each branch gets tapered foliage
  // sprays that follow an irregular rounded crown without polygon blobs.
  const g=make();
  for(let tier=0;tier<5;tier++){
   const count=11+(tier%3),radius=1.06-tier*.14;
   for(let j=0;j<count;j++){
    const angle=j*6.283185307/count+tier*.43;
    const co=Math.cos(angle),si=Math.sin(angle);
    const reach=radius*(.84+.17*Math.sin(j*2.17+tier*1.31));
    for(let k=1;k<=5;k++){
     const t=k/6,rad=.14+reach*t;
     const baseY=.30+tier*.35+.22*Math.sin(t*Math.PI)-.14*t;
     const leafLength=.25+.19*(1-t)+.055*Math.sin(j*1.7+k);
     const width=.11+.055*(1-t);
     for(const side of [-1,1]){
      const leafAngle=angle+side*(.48+.28*Math.sin(k*1.7+j));
      const lx=Math.cos(leafAngle),lz=Math.sin(leafAngle);
      const px=co*rad,pz=si*rad;
      const hue=.28+.05*Math.sin(j*1.7+k*.62+tier);
      const light=.28+.10*(.5+.5*Math.sin(k*2.3+side+j));
      const c=color(hue,.48,light);
      const origin=point(g,[px,baseY,pz],c);
      const left=point(g,[px+lx*leafLength*.47-lz*width,
       baseY+.12+leafLength*.24,pz+lz*leafLength*.47+lx*width],c);
      const right=point(g,[px+lx*leafLength*.47+lz*width,
       baseY+.09+leafLength*.24,pz+lz*leafLength*.47-lx*width],c);
      const tip=point(g,[px+lx*leafLength,
       baseY+.15+leafLength*.45,pz+lz*leafLength],c);
      g.indices.push(origin,left,right,left,tip,right);
     }
    }
   }
  }
  return finalize(g);
 }
 return {meadow:meadow(),pine:pine(),broadleaf:broadleaf()};
}