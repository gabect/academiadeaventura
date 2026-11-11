/* Paper shrub and hand-drawn water accents on the exact original placement data. */
export function installDioramaDetails({THREE,scene,meadowSites,shrubSites,
 waterAt,waterBodies,studioMeadowFallback,mountainShrubs}){
 if(studioMeadowFallback)studioMeadowFallback.visible=false;
 if(mountainShrubs)mountainShrubs.visible=false;
 const candidates=[...meadowSites,...shrubSites].filter(s=>
  Number.isFinite(s.x)&&Number.isFinite(s.z)&&Number.isFinite(s.y));
 const seen=new Set(),sites=[];
 for(const s of candidates){
  const id=Math.round(s.x*3)+':'+Math.round(s.z*3);
  if(seen.has(id))continue;seen.add(id);sites.push(s);
 }
 // Three scalloped, physically thick pieces of colored craft paper.
 const colors=['#629b6f','#83b47d','#abd194'];
 const leafParts=[];
 const paperShape=new THREE.Shape();
 paperShape.moveTo(-1,.16);
 paperShape.bezierCurveTo(-1.14,.69,-.70,1.09,-.44,.89);
 paperShape.bezierCurveTo(-.24,1.34,.30,1.32,.43,.91);
 paperShape.bezierCurveTo(.93,1.12,1.24,.53,.94,.14);
 paperShape.bezierCurveTo(.36,-.13,-.50,-.11,-1,.16);
 for(let i=0;i<3;i++){
  const g=new THREE.ExtrudeGeometry(paperShape,{depth:.12,
   bevelEnabled:true,bevelThickness:.035,bevelSize:.045,
   bevelSegments:1,steps:1,curveSegments:5});
  g.scale(.85-i*.1,.76-i*.04,1);
  g.translate((i-1)*.14,.10+(i===1?.2:0),(i-1)*.11);
  g.rotateY(i*Math.PI/3);
  const c=new THREE.Color(colors[i]),edge=new THREE.Color('#c2ab81');
  const geom=g.index?g.toNonIndexed():g;
  const p=geom.getAttribute('position'),n=geom.getAttribute('normal'),uv=geom.getAttribute('uv');
  for(let v=0;v<p.count;v++){
   const isEdge=geom.groups.some(gr=>gr.materialIndex===1&&v>=gr.start&&v<gr.start+gr.count);
   leafParts.push({
    p:[p.getX(v),p.getY(v),p.getZ(v)],
    n:[n.getX(v),n.getY(v),n.getZ(v)],
    uv:uv?[uv.getX(v),uv.getY(v)]:[0,0],
    c:isEdge?edge:c
   });
  }
  geom.dispose();
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>v.p),3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>v.n),3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>v.uv),2));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>[v.c.r,v.c.g,v.c.b]),3));
 geometry.computeBoundingSphere();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,
  flatShading:true,roughness:1,metalness:0});
 const shrubs=new THREE.InstancedMesh(geometry,material,sites.length);
 const transform=new THREE.Object3D();
 for(let i=0;i<sites.length;i++){
  const s=sites[i],seed=Math.abs(Math.sin(s.x*19.33+s.z*57.9));
  const scale=Math.min(.78,Math.max(.22,Number(s.size??s.sy??.9)))*(.34+seed*.15);
  transform.position.set(s.x,s.y+.02,s.z);
  transform.rotation.set(0,seed*Math.PI*2,0);
  transform.scale.set(scale,scale,scale);
  transform.updateMatrix();shrubs.setMatrixAt(i,transform.matrix);
 }
 shrubs.instanceMatrix.needsUpdate=true;shrubs.frustumCulled=false;
 shrubs.castShadow=false;shrubs.name='diorama-layered-paper-shrubs';
 scene.add(shrubs);
 // Drawn crests on the original river, lake and upper headwaters. Each motif
 // is placed against waterAt() and uses its actual world-space water level.
 const pos=[],indices=[];
 const positions=[
  ...Array.from({length:36},(_,i)=>{
   const lake=waterBodies.find(b=>b.kind==='lake')||waterBodies[1];
   const a=i*2.3999632,rad=Math.sqrt((i+.7)/37)*.87;
   return [lake.x+Math.cos(a)*lake.rx*rad,lake.z+Math.sin(a)*lake.rz*rad];
  }),
  ...Array.from({length:75},(_,i)=>{
   const x=-72+i*1.55,z=61+8*Math.sin(i*.071);
   return [x,z];
  }),
  ...Array.from({length:50},(_,i)=>{
   const x=-48+i*1.65,z=-49+4*Math.sin(i*.14);
   return [x,z];
  })
 ];
 for(const [x,z] of positions){
  const water=waterAt(x,z);
  if(!water||water.depth<.14||!Number.isFinite(water.surfaceY))continue;
  const half=.28+.20*Math.abs(Math.sin(x*1.7+z*.35)),y=water.surfaceY+.031;
  for(let j=0;j<11;j++){
   const t=j/10,xx=x+(t-.5)*2*half,zz=z+Math.sin(t*Math.PI)*.14;
   const a=pos.length/3;
   pos.push(xx,y,zz-.022,xx,y,zz+.022);
   if(j>0)indices.push(a-2,a-1,a,a-1,a+1,a);
  }
 }
 const waterGeometry=new THREE.BufferGeometry();
 waterGeometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 waterGeometry.setIndex(indices);waterGeometry.computeVertexNormals();
 const waves=new THREE.Mesh(waterGeometry,new THREE.MeshBasicMaterial({
  color:'#e6f5dc',side:THREE.DoubleSide,depthWrite:false,transparent:true,opacity:.79
 }));
 waves.name='diorama-drawn-water-ripples';waves.castShadow=false;
 waves.frustumCulled=false;scene.add(waves);
 return {shrubCount:sites.length,waterRipples:pos.length/22};
}
