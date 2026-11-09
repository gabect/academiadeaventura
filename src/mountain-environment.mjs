/** Decorative mountain ecology. No collider or locomotion mutations. */
export function buildMountainEnvironment(THREE, options) {
 const {scene, ground, footZ, crestZ, waterAt, routeAt} = options;
 const started = performance.now(), up = new THREE.Vector3(0,1,0);
 let seed=0x45ac91;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const coverAt=(p)=>1-smooth(.61,.86,.5+.5*Math.sin(p.x*.38+p.y*.24+Math.sin(p.z*.35))*Math.cos(p.z*.53-p.x*.17));
 ground.updateMatrixWorld(true);
 const pos=ground.geometry.attributes.position, idx=ground.geometry.index;
 const triangles=[], bins=new Map(), chunks=new Map(), groups=[];
 const windTime={value:0};
 let foliageState='loading';
 const worldVertex=i=>new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(ground.matrixWorld);
 // Index the final rendered triangles, including sculpting, rather than the
 // analytical collision surface. This also preserves the exact mesh diagonal.
 for(let i=0;i<idx.count;i+=3){
  const a=worldVertex(idx.getX(i)),b=worldVertex(idx.getX(i+1)),c=worldVertex(idx.getX(i+2));
  const minX=Math.min(a.x,b.x,c.x),maxX=Math.max(a.x,b.x,c.x);
  const minZ=Math.min(a.z,b.z,c.z),maxZ=Math.max(a.z,b.z,c.z);
  const x=(minX+maxX)*.5;
  if(maxX< -75||minX>75||maxZ<crestZ(x)-3||minZ>footZ(x)+4)continue;
  const cross=new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a));
  const area=cross.length()*.5,n=cross.normalize();if(n.y<0)n.negate();
  const t={a,b,c,n,area};triangles.push(t);
  for(let bx=Math.floor(minX);bx<=Math.floor(maxX);bx++)for(let bz=Math.floor(minZ);bz<=Math.floor(maxZ);bz++){
   const key=bx+','+bz;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(t);
  }
 }
 const surface=(x,z)=>{
  const list=bins.get(Math.floor(x)+','+Math.floor(z))||[];let best=null;
  for(const t of list){
   const {a,b,c}=t,den=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);
   if(Math.abs(den)<1e-10)continue;
   const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/den;
   const v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/den,w=1-u-v;
   if(Math.min(u,v,w)>=-1e-5){const y=a.y*u+b.y*v+c.y*w;if(!best||y>best.p.y)best={p:new THREE.Vector3(x,y,z),n:t.n.clone()};}
  }return best;
 };
 const groupFor=p=>{
  const key=Math.floor(p.x/7)+','+Math.floor(p.z/5);
  if(!chunks.has(key))chunks.set(key,{blades:[],leaves:[],center:p.clone()});
  return chunks.get(key);
 };
 const tuftColors=['#70963c','#83a947','#91b951','#668938'].map(c=>new THREE.Color(c));
 const demoWeight=x=>1-smooth(8,21,Math.abs(x-3));
 let bladeCount=0;
 const exclusionCache=new Map();
 const excluded=p=>{
  const key=p.x.toFixed(5)+','+p.z.toFixed(5);
  if(!exclusionCache.has(key))exclusionCache.set(key,!!waterAt(p.x,p.z)||routeAt(p.x,p.z,.15));
  return exclusionCache.get(key);
 };
 for(const t of triangles){
  const center=t.a.clone().add(t.b).add(t.c).multiplyScalar(1/3);
  if(center.y<.1||center.y>12||excluded(center)||excluded(t.a)||excluded(t.b)||excluded(t.c))continue;
  const density=38+demoWeight(center.x)*66;
  const expected=t.area*density,count=Math.floor(expected)+(random()<expected%1?1:0);
  for(let j=0;j<count;j++){
   const r=Math.sqrt(random()),s=random(),p=t.a.clone().multiplyScalar(1-r).addScaledVector(t.b,r*(1-s)).addScaledVector(t.c,r*s);
   if(p.z<crestZ(center.x)-1.7||p.z>footZ(center.x)+2.8)continue;
   const cover=coverAt(p);
   if(random()>cover*.94)continue;
   // Fine blades are rooted individually. Their scale never amplifies a
   // tuft's footprint through a steep, curved, non-planar terrain triangle.
   const n=t.n.clone().lerp(up,.32).normalize();
   groupFor(p).blades.push({p:p.add(new THREE.Vector3(0,-.003,0)),n,
    angle:random()*Math.PI*2,height:.11+random()*.18,width:.012+random()*.014,
    color:tuftColors[Math.floor(random()*tuftColors.length)]});bladeCount++;
  }
 }
 function bladeGeometry(){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([
   -1,0,0,1,0,0,-.67,.48,.12,.67,.48,.12,-.30,.8,.3,.30,.8,.3,0,1,.5],3));
  g.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);
  const colors=[];for(const y of [0,0,.48,.48,.8,.8,1])colors.push(.44+y*.56,.52+y*.48,.38+y*.62);
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 }
 const grassMaterial=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,side:THREE.DoubleSide,roughness:1});
 const bladeGeo=bladeGeometry(),dummy=new THREE.Object3D(),q=new THREE.Quaternion();
 function batch(sites,geometry,material,name,scaler){
  if(!sites.length)return null;
  const mesh=new THREE.InstancedMesh(geometry,material,sites.length);
  for(let i=0;i<sites.length;i++){
   const s=sites[i];dummy.position.copy(s.p);
   dummy.quaternion.setFromUnitVectors(up,s.n);q.setFromAxisAngle(up,s.angle||0);dummy.quaternion.multiply(q);
   scaler(dummy,s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
   if(s.color)mesh.setColorAt(i,s.color);
  }
  mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  mesh.name=name;mesh.receiveShadow=true;mesh.userData.ignoreCameraRay=true;
  // Standard frustum bounds are incorrect after rolling-horizon deformation.
  // Explicit conservative curved bounds are tested in update() instead.
  mesh.frustumCulled=false;mesh.computeBoundingSphere();scene.add(mesh);
  groups.push({mesh,full:sites.length,grass:name==='mountain-blades',sphere:mesh.boundingSphere.clone()});return mesh;
 }
 for(const chunk of chunks.values()){
  // Shuffle once: reducing instance count preserves uniform spatial coverage.
  const sites=chunk.blades;for(let i=sites.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[sites[i],sites[j]]=[sites[j],sites[i]];}
  batch(sites,bladeGeo,grassMaterial,'mountain-blades',(o,s)=>o.scale.set(s.width,s.height,s.height));
 }
 // Authored rock/fern islands form a focal composition directly ahead of spawn.
 // Other faces receive lighter repeats of that ecology, with separate seeds.
 const anchors=[[-5,2.1,1.05],[-2.5,5.4,1.2],[1.3,3.5,.9],[3.6,7.5,1.3],[6.5,1.6,.95],[7.5,5.1,1.0],[-1,8.4,.8]];
 const rocks=[],ferns=[],leaves=[],flowers=[];
 function atHeight(x,y){
  let a=crestZ(x)-.3,b=footZ(x)+.3;
  for(let k=0;k<24;k++){const z=(a+b)/2,s=surface(x,z);if(!s)return null;if(s.p.y>y)a=z;else b=z;}
  return surface(x,(a+b)/2);
 }
 function addIsland(x,y,size,hero){
  const s=atHeight(x,y);if(!s||waterAt(x,s.p.z)||routeAt(x,s.p.z,size+.4))return;
  rocks.push({...s,p:s.p.clone().addScaledVector(s.n,-size*.16),size,angle:random()*6.28});
  // Understory crescents occupy damp cracks beside each exposed stone,
  // leaving its centre visible. No illustrated rock billboards.
  for(let j=0;j<(hero?10:5);j++){
   const dx=(j%2?1:-1)*size*(.65+random()*.5),ny=y+(random()-.5)*size*2.1;
   const a=atHeight(x+dx,ny);if(!a||routeAt(a.p.x,a.p.z,.25)||waterAt(a.p.x,a.p.z))continue;
   const item={...a,angle:random()*6.28,size:.20+random()*.30};
   (j%3===0?ferns:leaves).push(item);
   if(hero&&j===1)flowers.push({...item,size:.17});
  }
 }
 anchors.forEach(a=>addIsland(...a,true));
 for(let x=-70;x<74;x+=12){if(Math.abs(x)<15)continue;for(let j=0;j<3;j++)addIsland(x+random()*3,1.7+j*2.7,.55+random()*.65,false);}
 // Sculpt an asymmetric rock with rounded fracture planes. Moss is a
 // vertex material region on upward-facing caps, not a separate hovering shell.
 function rockGeometry(){
  const g=new THREE.IcosahedronGeometry(1,3),p=g.attributes.position,colors=[];
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   const r=1+.09*Math.sin(x*8+y*3)*Math.cos(z*7-y*4)+.045*Math.cos(x*17-z*9);
   p.setXYZ(i,x*r*(1+.1*y),y*r*.55,z*r*.83);
   const moss=smooth(.12,.65,y+.16*Math.sin(x*8+z*5));
   const color=new THREE.Color('#81867b').lerp(new THREE.Color('#648638'),moss);
   color.multiplyScalar(.85+.15*(y*.5+.5));colors.push(color.r,color.g,color.b);
  }g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 }
 const rockGeo=rockGeometry();
 const rockMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,
  map:options.rockTexture||null,bumpMap:options.rockTexture||null,bumpScale:.065});
 const bedrock=batch(rocks,rockGeo,rockMat,'moss-bedrock',(o,s)=>o.scale.setScalar(s.size));
 if(bedrock)bedrock.castShadow=true;
 // Curved broad leaves and pinnate ferns, opaque geometry with clean edges.
 function leafGeometry(fern){
  const vertices=[],colors=[],indices=[];
  function leaf(base,angle,length,width,lift){
   const start=vertices.length/3;
   for(let k=0;k<=5;k++){
    const t=k/5,rad=length*t,w=Math.sin(Math.PI*t)*width;
    for(const side of [-1,1]){
     const x=rad,z=side*w,y=lift*Math.sin(t*Math.PI*.85)+(side===1?.012:0);
     vertices.push(base.x+Math.cos(angle)*x-Math.sin(angle)*z,base.y+y,base.z+Math.sin(angle)*x+Math.cos(angle)*z);
     const c=new THREE.Color(fern?'#4f8837':'#699e43').multiplyScalar(.65+t*.35);colors.push(c.r,c.g,c.b);
    }
    if(k<5){const a=start+k*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
   }
  }
  for(let f=0;f<7;f++){
   const angle=f*2.39996,length=.65+(f%3)*.11;
   if(!fern)leaf(new THREE.Vector3(),angle,length,.18,.4);
   else for(let k=0;k<8;k++){
    const t=k/8,b=new THREE.Vector3(Math.cos(angle)*t*length,.38*Math.sin(t*2.6),Math.sin(angle)*t*length);
    for(const side of [-1,1])leaf(b,angle+side*1.04,.25*(1-t)+.035,.045*(1-t)+.01,.045);
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 const leafMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide});
 const fallbackFerns=batch(ferns,leafGeometry(true),leafMat,'pinnate-ferns',(o,s)=>o.scale.setScalar(s.size*1.6));
 const fallbackLeaves=batch(leaves,leafGeometry(false),leafMat,'broadleaf-rosettes',(o,s)=>o.scale.setScalar(s.size));
 // One local atlas, shared by all foliage cards. Alpha testing keeps depth
 // writes and avoids transparent sorting through the mountain. The high
 // cutoff removes the generated atlas's faint matte between fine leaves.
 const foliageTexture=new THREE.TextureLoader().load(
  new URL('../assets/mountain_hd/foliage-atlas-v2.png',import.meta.url).href,
  ()=>{foliageState='ready';},undefined,
  ()=>{foliageState='failed';console.warn('Mountain foliage atlas unavailable; using geometric plants.');});
 foliageTexture.colorSpace=THREE.SRGBColorSpace;
 foliageTexture.anisotropy=4;
 const foliageMat=new THREE.MeshStandardMaterial({
  map:foliageTexture,alphaTest:.78,side:THREE.DoubleSide,
  roughness:.95,color:'#b4c69d',transparent:false,depthWrite:true
 });
 foliageMat.onBeforeCompile=shader=>{
  shader.uniforms.mountainWindTime=windTime;
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
   '#include <common>\nuniform float mountainWindTime;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   vec3 plantOrigin=vec3(0.0);
   #ifdef USE_INSTANCING
    plantOrigin=instanceMatrix[3].xyz;
   #endif
   float flex=pow(clamp(abs(position.y),0.0,1.0),2.0);
   transformed.x+=sin(mountainWindTime*1.4+plantOrigin.x*.73+plantOrigin.z*.41)*.035*flex;
   transformed.z+=cos(mountainWindTime*1.1+plantOrigin.x*.53)*.018*flex;
  `);
 };
 foliageMat.customProgramCacheKey=()=>'mountain-foliage-wind-v1';
 function cardGeometry(col,row,hanging=false){
  const vertices=[],uvs=[],indices=[];
  // Two intersecting planes preserve volume from the orbit camera. UVs
  // stay inside each tile; root positions account for the painted padding.
  for(let k=0;k<2;k++){
   const a=k*Math.PI/2,start=vertices.length/3;
   for(const [x,y,u,v] of [[-.5,0,0,0],[.5,0,1,0],[-.5,1,0,1],[.5,1,1,1]]){
    const localY=hanging?y-.94:y-.08;
    vertices.push(Math.cos(a)*x,localY,Math.sin(a)*x);
    uvs.push((col+.015+u*.97)/2,(1-row+.015+v*.97)/2);
   }
   indices.push(start,start+1,start+2,start+1,start+3,start+2);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 let spriteCount=0;
 function foliageBatch(sites,geometry,name){
  const mesh=batch(sites,geometry,foliageMat,name,(o,s)=>o.scale.set(s.size,s.size,s.size));
  if(!mesh)return;
  const item=groups[groups.length-1];item.foliage=true;item.grass=true;
  item.sphere.radius+=.08;mesh.visible=false;spriteCount+=sites.length;
 }
 const grassCard=cardGeometry(0,0),fernCard=cardGeometry(1,0),leafCard=cardGeometry(0,1);
 // Spatial batches retain distance/quality culling. All anchors come from
 // rendered triangle samples; routes and water are checked per card.
 for(const chunk of chunks.values()){
  const sites=[];
  for(let i=0;i<chunk.blades.length;i+=55){
   const b=chunk.blades[i];if(b.n.y<.60||excluded(b.p))continue;
   sites.push({p:b.p.clone(),n:b.n.clone().lerp(up,.72).normalize(),
    angle:b.angle,size:.32+random()*.25});
  }
  foliageBatch(sites,grassCard,'painted-meadow-clumps');
 }
 const plantSites=sites=>sites.map(s=>({...s,p:s.p.clone(),n:s.n.clone().lerp(up,.75).normalize(),size:s.size*1.8}));
 foliageBatch(plantSites(ferns),fernCard,'painted-fern-islands');
 foliageBatch(plantSites(leaves),leafCard,'painted-broadleaf-islands');
 const hanging=[];
 for(let x=-72;x<73;x+=1.15){
  const s=surface(x,crestZ(x)+.22);if(!s||excluded(s.p)||routeAt(x,s.p.z,.8))continue;
  hanging.push({...s,n:up.clone(),angle:random()*.5,size:.45+random()*.4});
 }
 foliageBatch(hanging,cardGeometry(1,1,true),'hanging-crest-grasses');
 for(const mesh of [fallbackFerns,fallbackLeaves]){
  const item=groups.find(g=>g.mesh===mesh);if(item)item.fallback=true;
 }
 // Flowers are deliberately sparse, small and placed with the understory.
 const flowerGeo=new THREE.SphereGeometry(.04,6,4);flowerGeo.translate(0,.28,0);
 batch(flowers,flowerGeo,new THREE.MeshStandardMaterial({color:'#f1e8af',roughness:1}),'small-flowers',(o)=>o.scale.setScalar(1));
 const rootMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
 let rootCount=0;
 function rootPath(startX,top,bottom,lean,radius,phase){
  const path=[];const rings=100,sides=10;
  for(let i=0;i<=rings;i++){
   const t=i/rings,y=top+(bottom-top)*t,x=startX+lean*t+Math.sin(t*7+phase)*.27*Math.sin(Math.PI*t);
   const s=atHeight(x,y);if(!s||routeAt(x,s.p.z,.7)||waterAt(x,s.p.z))return;
   const r=radius*Math.pow(1-t,.8)+.012;
   path.push({...s,r});
  }
  const verts=[],colors=[],indices=[];
  for(let i=0;i<path.length;i++){
   const s=path[i],t=i/rings,tangent=path[Math.min(rings,i+1)].p.clone().sub(path[Math.max(0,i-1)].p).normalize();
   const side=new THREE.Vector3().crossVectors(tangent,s.n).normalize(),normal=new THREE.Vector3().crossVectors(side,tangent).normalize();
   // Each cross-section is reprojected, so interpolation cannot bridge over
   // the cliff's ledges. The inner half is embedded in the terrain.
   for(let j=0;j<sides;j++){
    const a=j/sides*Math.PI*2,r=s.r*(1+.12*Math.sin(j*3+t*22));
    const v=s.p.clone().addScaledVector(normal,Math.cos(a)*r+r*.26).addScaledVector(side,Math.sin(a)*r);
    verts.push(v.x,v.y,v.z);
    const c=new THREE.Color('#725538').multiplyScalar(.73+.20*Math.cos(a)+.07*Math.sin(t*49+j));colors.push(c.r,c.g,c.b);
    if(i<rings){const n=i*sides+j,b=i*sides+(j+1)%sides;indices.push(n,b,n+sides,b,b+sides,n+sides);}
   }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingSphere();
  const mesh=new THREE.Mesh(geo,rootMaterial);mesh.name='surface-tapered-root';mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.ignoreCameraRay=true;mesh.frustumCulled=false;scene.add(mesh);
  groups.push({mesh,grass:false,sphere:geo.boundingSphere.clone()});rootCount++;
 }
 for(const [x,lean] of [[-3,2.2],[4,-2.5],[8,1.4],[-32,-2],[-57,2.8],[47,-2.1],[66,2]]){
  rootPath(x,9.9,.6,lean,.24,x);
  rootPath(x+lean*.5+Math.sin(3.5+x)*.27,5.25,1.4,-lean*.65,.105,x+1);
 }
 let quality='high';try{quality=localStorage.getItem('mountain-quality')||(matchMedia('(pointer:coarse)').matches?'low':'high');}catch{}
 if(!['low','medium','high'].includes(quality))quality='high';
 const frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),sphere=new THREE.Sphere();
 const stats={generationMs:performance.now()-started,blades:bladeCount,rocks:rocks.length,ferns:ferns.length,roots:rootCount,sprites:spriteCount,foliageState,batches:groups.length,quality};
 const frames=[];let previous=0,lastUpdate=0;
 const update=(camera,focus,curve,now)=>{
  windTime.value=now*.001;stats.foliageState=foliageState;
  if(previous&&now-previous<1000){frames.push(now-previous);if(frames.length>240)frames.shift();}previous=now;
  if(now-lastUpdate<120)return;lastUpdate=now;
  camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
  const range=quality==='low'?24:quality==='medium'?38:56,ratio=quality==='low'?.25:quality==='medium'?.55:1;
  for(const item of groups){
   const {mesh}=item;sphere.copy(item.sphere);
   const forward=Math.max(0,(sphere.center.x-focus.x)*curve.direction.value.x+(sphere.center.z-focus.z)*curve.direction.value.y-curve.near.value);
   sphere.center.y-=curve.amount.value*forward*forward;
   sphere.radius+=curve.amount.value*(2*forward*sphere.radius+sphere.radius*sphere.radius);
   const distance=camera.position.distanceTo(sphere.center);
   mesh.visible=frustum.intersectsSphere(sphere)&&(!item.grass||distance<range+sphere.radius);
   if(item.foliage&&foliageState!=='ready')mesh.visible=false;
   if(item.fallback&&foliageState==='ready')mesh.visible=false;
   if(item.grass)mesh.count=Math.max(0,Math.floor(item.full*ratio*(distance<14?1:distance<28?.55:.24)));
  }
  stats.quality=quality;
  if(frames.length>30){const sorted=[...frames].sort((a,b)=>a-b);stats.frameMedianMs=sorted[Math.floor(sorted.length*.5)];stats.frameP95Ms=sorted[Math.floor(sorted.length*.95)];stats.fps=1000/stats.frameMedianMs;}
 };
 return {stats,update,surface,groups,setQuality(value){if(['low','medium','high'].includes(value)){quality=value;try{localStorage.setItem('mountain-quality',value);}catch{}}},getQuality:()=>quality};
}
