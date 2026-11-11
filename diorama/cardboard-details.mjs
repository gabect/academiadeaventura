import {CRAYON,makeCrayonTexture,makeCorrugatedTexture} from './crayon-style.mjs';
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
 const colors=[CRAYON.deepGreen,CRAYON.green,CRAYON.lightGreen];
 const wax=makeCrayonTexture(THREE),corrugated=makeCorrugatedTexture(THREE);
 const leafParts=[];
 const paperShape=new THREE.Shape();
 // Imperfect hand-cut shrub border: scallops, not symmetric vector bubbles.
 paperShape.moveTo(-1.02,.13);
 paperShape.bezierCurveTo(-1.15,.34,-1.07,.77,-.79,.84);
 paperShape.lineTo(-.68,.77);
 paperShape.bezierCurveTo(-.55,1.10,-.24,1.23,-.02,1.05);
 paperShape.bezierCurveTo(.18,1.35,.51,1.13,.62,.88);
 paperShape.bezierCurveTo(1.11,1.03,1.27,.44,.96,.13);
 paperShape.lineTo(.72,.19);
 paperShape.bezierCurveTo(.18,-.14,-.51,-.12,-1.02,.13);
 for(let i=0;i<3;i++){
  for(const outline of [true,false]){
   const g=new THREE.ExtrudeGeometry(paperShape,{depth:outline?.09:.13,
    bevelEnabled:true,bevelThickness:outline?.043:.035,
    bevelSize:outline?.075:.04,bevelSegments:1,steps:1,curveSegments:6});
   g.scale((.85-i*.10)*(outline?1.085:1),
    (.76-i*.04)*(outline?1.065:1),1);
   g.translate((i-1)*.14+(outline?-.014:.016),
    .10+(i===1?.2:0)-(outline?.011:0),
    (i-1)*.11+(outline?-.053:.018));
   g.rotateY(i*Math.PI/3);
   const c=new THREE.Color(outline?CRAYON.ink:colors[i]);
   const edge=new THREE.Color('#c99c65');
   const geom=g.index?g.toNonIndexed():g;
   const p=geom.getAttribute('position'),n=geom.getAttribute('normal'),
     uv=geom.getAttribute('uv');
   for(let v=0;v<p.count;v++){
    const side=!outline&&geom.groups.some(gr=>gr.materialIndex===1&&
     v>=gr.start&&v<gr.start+gr.count);
    leafParts.push({
     p:[p.getX(v),p.getY(v),p.getZ(v)],
     n:[n.getX(v),n.getY(v),n.getZ(v)],
     uv:uv?[uv.getX(v),uv.getY(v)]:[0,0],
     c:side?edge:c,edge:side?1:0
    });
   }
   geom.dispose();
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>v.p),3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>v.n),3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>v.uv),2));
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(leafParts.flatMap(v=>[v.c.r,v.c.g,v.c.b]),3));
 geometry.setAttribute('cardboardEdge',new THREE.Float32BufferAttribute(
  leafParts.map(v=>v.edge),1));
 geometry.computeBoundingSphere();
 geometry.userData.blackInkCutout=true;
 geometry.userData.corrugatedEdges=true;
 const material=new THREE.MeshStandardMaterial({map:wax,vertexColors:true,
  side:THREE.DoubleSide,flatShading:true,roughness:.70,metalness:0});
 material.onBeforeCompile=shader=>{
  shader.uniforms.uCorrugated={value:corrugated};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
   '#include <common>\nattribute float cardboardEdge;\nvarying float vCardboardEdge;');
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
   '#include <begin_vertex>\nvCardboardEdge=cardboardEdge;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
   '#include <common>\nuniform sampler2D uCorrugated;\nvarying float vCardboardEdge;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
   '#include <map_fragment>\nvec3 flute=texture2D(uCorrugated,vMapUv).rgb;'+
   '\ndiffuseColor.rgb=mix(diffuseColor.rgb,flute,vCardboardEdge*.86);');
 };
 material.customProgramCacheKey=()=>'diorama-crayola-shrub-cut-v1';
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
  color:CRAYON.cream,side:THREE.DoubleSide,depthWrite:false,
  transparent:true,opacity:.94
 }));
 waves.name='diorama-drawn-water-ripples';waves.castShadow=false;
 waves.frustumCulled=false;scene.add(waves);
 // Two strokes of black marker flank each wax-highlighted ripple;
 // these follow the original lake/stream waterAt() sampler.
 const blackPos=[];
 for(let i=0;i<pos.length;i+=6){
  const x=pos[i],y=pos[i+1]-.009;
  const z0=pos[i+2],z1=pos[i+5],middle=(z0+z1)*.5;
  blackPos.push(x,y,middle-.072,x,y,middle+.072);
 }
 const blackGeometry=new THREE.BufferGeometry();
 blackGeometry.setAttribute('position',new THREE.Float32BufferAttribute(blackPos,3));
 blackGeometry.setIndex(indices);blackGeometry.computeVertexNormals();
 const inkWaves=new THREE.Mesh(blackGeometry,new THREE.MeshBasicMaterial({
  color:'#253b61',side:THREE.DoubleSide,depthWrite:false,
  transparent:true,opacity:.92
 }));
 inkWaves.name='diorama-ink-water-lines';inkWaves.castShadow=false;
 inkWaves.frustumCulled=false;inkWaves.renderOrder=waves.renderOrder-1;
 scene.add(inkWaves);
 return {shrubCount:sites.length,waterRipples:pos.length/22};
}
