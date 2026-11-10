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
  const g=make();
  for(let layer=0;layer<6;layer++){
   const base=.22+layer*.41,count=13+(layer%3),spread=1.21-layer*.145;
   for(let j=0;j<count;j++){
    const a=j*Math.PI*2/count+layer*.47,co=Math.cos(a),si=Math.sin(a);
    const len=spread*(.85+.16*(.5+.5*Math.sin(j*4.29+layer*7)));
    const width=(.29-layer*.029)*(.92+.12*Math.sin(j*1.5));
    const lift=(layer*.019)+(j%3)*.012,hue=.31+.032*Math.sin(j*1.71+layer*.8);
    let before=[];
    for(let k=0;k<=7;k++){
     const t=k/7,r=.065+len*t,w=Math.pow(Math.sin(Math.PI*t),.75)*width*(1-.26*t);
     const y=base-len*.27*t+len*.10*t*t+lift;
     const c=color(hue,.55,.235+.16*t+.075*(.5+.5*Math.sin(j*.93+layer)));
     const lhs=point(g,[co*r-si*w,y+.03*Math.sin(Math.PI*t),si*r+co*w],c);
     const rhs=point(g,[co*r+si*w,y,si*r-co*w],c);
     if(before.length)quad(g,before[0],before[1],lhs,rhs);before=[lhs,rhs];
    }
   }
  }return finalize(g);
 }
 function broadleaf(){
  const g=make(),original=new THREE.IcosahedronGeometry(1,1);
  const base=original.index?original.toNonIndexed():original,p=base.attributes.position;
  for(let j=0;j<18;j++){
   const a=j*2.399963229728653,radial=.24+.68*Math.sqrt((j+.5)/18);
   const center=[Math.cos(a)*radial,.26+.47*Math.sin(j*1.43)**2,Math.sin(a)*radial];
   const size=.29+.19*(.5+.5*Math.sin(j*2.76));
   const col=color(.28+.065*Math.sin(j*1.13),.47,.29+.13*(.5+.5*Math.sin(j*2.71)));
   for(let k=0;k<p.count;k+=3){
    const tri=[];
    for(let v=0;v<3;v++){
     const x=p.getX(k+v),y=p.getY(k+v),z=p.getZ(k+v);
     const swell=1+.11*Math.sin((x+j)*7+(z-j)*5);
     tri.push(point(g,[center[0]+size*x*swell,center[1]+size*y*.79,center[2]+size*z*swell],col));
    }
    g.indices.push(...tri);
   }
  }return finalize(g);
 }
 return {meadow:meadow(),pine:pine(),broadleaf:broadleaf()};
}