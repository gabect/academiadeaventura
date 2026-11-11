import {CRAYON,makeCrayonTexture,makeCorrugatedTexture,addSceneryInk} from './crayon-style.mjs';
/* Cardboard art on the REAL original-world coordinates. Visuals only. */
export function installCardboardArt({THREE,scene,player,guardian,ambientNPCs,
 naturalSurfaceY,fieldTreeCrowns,mountainTreeSites,cliffPineSites,
 mountainShrubs,groundMesh,terrainMaterial,waterSurface,upperWaterSurface,waterfallPlane,
 waterBodies,terrainBounds}){
 const exempt=new Set([player,guardian,...ambientNPCs]);
 const waterMeshes=new Set([waterSurface,upperWaterSurface,waterfallPlane,groundMesh]);
 scene.background.set(CRAYON.sky);
 if(scene.fog){scene.fog.color.set(CRAYON.sky);scene.fog.near=56;scene.fog.far=145;}
 // Cliff and terrain retain original geometry, surface functions and
 // climbable trail slopes. Only the shader's PIGMENT changes to paper/corrugate.
 const previousTerrainCompiler=terrainMaterial.onBeforeCompile;
 terrainMaterial.onBeforeCompile=shader=>{
  previousTerrainCompiler(shader);
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>',String.raw`
   vec3 cNormal=normalize(cross(dFdx(vAcademyRockWorld),dFdy(vAcademyRockWorld)));
   float exposed=1.-smoothstep(.32,.81,abs(cNormal.y));
   float y=vAcademyRockWorld.y;
   float crayonGrain=sin(vAcademyRockWorld.x*13.6+y*3.2+
       vAcademyRockWorld.z*11.2)*.04;
   crayonGrain+=sin(vAcademyRockWorld.x*31.0-
       vAcademyRockWorld.z*9.0+y*6.3)*.021;
   vec3 grass=vec3(.14,.57,.18)+crayonGrain*.52;
   grass=mix(grass,vec3(.30,.72,.20),.36+
      .22*sin(vAcademyRockWorld.x*.39)*sin(vAcademyRockWorld.z*.37));
   // Gray pencil mountain faces over white handmade card, rather than
   // a giant brown ribbed wall. Only thin cut bands expose the flutes.
   float pencil=sin(vAcademyRockWorld.x*7.1+
     vAcademyRockWorld.z*5.4+y*3.7)*.07+
     sin(vAcademyRockWorld.x*18.5-y*9.3)*.033;
   vec3 graphite=mix(vec3(.43,.49,.54),vec3(.84,.85,.83),
     .48+.27*sin(vAcademyRockWorld.x*.46+y*.29+
       vAcademyRockWorld.z*.33))+pencil;
   float rib=sin(y*24.1+
       sin(vAcademyRockWorld.x*.52+vAcademyRockWorld.z*.31)*.65);
   vec3 flute=mix(vec3(.52,.34,.16),vec3(.87,.65,.38),.50+.50*rib);
   float groove=1.-smoothstep(.12,.38,abs(rib));
   flute=mix(flute,vec3(.27,.17,.09),groove*.49);
   float roughCut=sin(vAcademyRockWorld.x*.21+
       vAcademyRockWorld.z*.24+y*.18)*.39;
   float thinLayer=1.-smoothstep(.08,.30,abs(sin(y*2.58+roughCut)));
   vec3 core=mix(graphite,flute,.065+thinLayer*.29);
   core=mix(core,vec3(.065,.071,.076),thinLayer*.20);
   float paintCoverage=clamp(.15+vAcademyCover*.97-exposed*.99,0.,1.);
   diffuseColor.rgb=mix(core,grass,paintCoverage);
   float cutInk=exposed*(1.-exposed)*4.;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.028,.041,.038),
       smoothstep(.33,.85,cutInk)*.58);
   #include <alphamap_fragment>
  `);
 };
  terrainMaterial.customProgramCacheKey=()=>'academy-gray-pencil-cardboard-cliff-v3';
 const paper=makeCrayonTexture(THREE);
 const corrugated=makeCorrugatedTexture(THREE);
 const cache=new Map();
 function rep(m){
  if(!m||!m.isMeshStandardMaterial)return m;
  if(cache.has(m))return cache.get(m);
  const a=m.clone();cache.set(m,a);const h={h:0,s:0,l:0};
  a.color.getHSL(h);
  const green=h.h>.19&&h.h<.49&&h.s>.1;
  const blue=h.h>.48&&h.h<.70&&h.s>.14;
  const warm=h.h<.17&&h.s>.18;
  const color=green?(h.l>.54?CRAYON.lightGreen:CRAYON.green):
   blue?CRAYON.blue:
   warm?(h.l<.34?CRAYON.red:(h.s>.36?CRAYON.orange:CRAYON.yellow)):
   h.l>.71?CRAYON.cream:
   h.l<.34?'#9e6f42':
   h.s>.12?CRAYON.yellow:CRAYON.card;
  a.color.set(color);a.roughness=.70;a.metalness=0;a.flatShading=true;
  a.normalMap=null;a.roughnessMap=null;a.metalnessMap=null;
  a.map=paper;a.needsUpdate=true;return a;
 }
 function visit(node){
  if(exempt.has(node))return;
  // Path ribbons already have the user's hand-painted dirt material.
  // Never clone or recolor them into CRAYON.red as if they were cardboard props.
  if(node.userData?.preserveCrayonTrail)return;
  if(node.isMesh){
   if(node.geometry?.userData?.impostor){node.visible=false;return;}
   if(!waterMeshes.has(node)){
    node.material=Array.isArray(node.material)?
     node.material.map(rep):rep(node.material);
   }
  }
  for(const child of node.children)visit(child);
 }
 for(const child of scene.children)visit(child);
 for(const tree of fieldTreeCrowns)tree.visible=false;
 const ink=addSceneryInk({THREE,scene,
  exclude:[player,guardian,...ambientNPCs,groundMesh,waterSurface,
   upperWaterSurface,waterfallPlane,...fieldTreeCrowns],
  limit:180});
 if(mountainShrubs){mountainShrubs.visible=true;
  mountainShrubs.material=rep(mountainShrubs.material);}
 // Single non-indexed, vertex-colored 3D cardstock model per species.
 // Each replica is an InstancedMesh, not a transparent/billboard photograph.
 function shape(pine){
  const s=new THREE.Shape();
  if(pine){
   s.moveTo(.07,2.83);s.lineTo(-.55,2.11);s.lineTo(-.26,2.07);
   s.lineTo(-.98,1.37);s.lineTo(-.49,1.34);
   s.lineTo(-1.32,.58);s.quadraticCurveTo(-.29,.46,.08,.64);
   s.quadraticCurveTo(.42,.50,1.21,.70);
   s.lineTo(.48,1.38);s.lineTo(.88,1.42);
   s.lineTo(.33,2.10);s.lineTo(.57,2.09);
  }else{
   s.moveTo(-1.37,.21);
   s.bezierCurveTo(-1.75,.59,-1.51,1.38,-1.12,1.43);
   s.bezierCurveTo(-1.25,2.16,-.58,2.55,-.10,2.43);
   s.bezierCurveTo(.42,3.05,1.13,2.58,1.22,2.18);
   s.bezierCurveTo(1.83,1.81,1.62,1.26,1.41,1.08);
   s.bezierCurveTo(1.72,.55,1.12,.09,.58,.21);
   s.bezierCurveTo(.21,-.15,-.86,-.19,-1.37,.21);
  }
  s.closePath();return s;
 }
 function template(pine){
  const geos=[],colors=[
   new THREE.Color('#b98043'),new THREE.Color(CRAYON.yellow),
   new THREE.Color(pine?'#13894c':'#1c9d56'),
   new THREE.Color(pine?'#2ebf59':'#3cd550'),
   new THREE.Color(pine?'#6be56e':'#a2ed62'),
   new THREE.Color(CRAYON.ink)
  ];
  // Every paper cut is imperfectly inset over a larger black ink outline.
  const frame=new THREE.BoxGeometry(pine?.355:.475,2.22,.40);
  frame.translate(0,1.10,-.03);geos.push([frame,5]);
  const trunk=new THREE.BoxGeometry(pine?.29:.41,2.17,.36);
  trunk.translate(0,1.085,.025);geos.push([trunk,0]);
  const leaf=shape(pine);
  for(let i=0;i<3;i++){
   // Three layers: front paint, a thin black edge, and BACK paint.
   // A 3D camera can see either side without ever showing a black slab.
   for(const face of ['ink','front','back']){
    const outlined=face==='ink';
    const geom=new THREE.ExtrudeGeometry(leaf,{
     depth:outlined?.085:.052,steps:1,
     bevelEnabled:true,bevelThickness:outlined?.031:.022,
     bevelSize:outlined?.042:.018,bevelSegments:1,curveSegments:6
    });
    geom.scale((1-i*.095)*(outlined?1.040:1),
       (1-i*.07)*(outlined?1.032:1),1);
    const shift=face==='front'?.057:face==='back'?-.075:-.025;
    geom.translate((i-1)*(pine?.07:.17)+
       (outlined?-.010:.006),
      (pine?1.17:1.94)+i*(pine?.29:.14)-
       (outlined?.008:0),
      -.10+i*.12+shift);
    geom.rotateY(i===1?Math.PI*.37:(i===2?-.16:.13));
    geos.push([geom,outlined?5:i+2]);
   }
  }
  const positions=[],normals=[],uvs=[],rgb=[],edgeValues=[];
  const edgeColor=new THREE.Color('#dfb47d');
  const shadedEdge=new THREE.Color('#85522e');
  for(const [geom,index] of geos){
   const g=geom.index?geom.toNonIndexed():geom;
   const p=g.getAttribute('position'),n=g.getAttribute('normal'),
    uv=g.getAttribute('uv');
   for(let i=0;i<p.count;i++){
    positions.push(p.getX(i),p.getY(i),p.getZ(i));
    normals.push(n.getX(i),n.getY(i),n.getZ(i));
    const u=uv?uv.getX(i):0,v=uv?uv.getY(i):0;
    uvs.push(u,v);
    const isEdge=index!==5&&g.groups.some(gr=>
     gr.materialIndex===1&&i>=gr.start&&i<gr.start+gr.count);
    const rib=.64+.36*(.5+.5*Math.sin(u*35+v*18));
    const col=index===5?colors[5]:
     isEdge?edgeColor.clone().lerp(shadedEdge,1-rib):colors[index];
    rgb.push(col.r,col.g,col.b);
    edgeValues.push(isEdge?1:0);
   }
   g.dispose();
  }
  const result=new THREE.BufferGeometry();
  result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  result.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  result.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  result.setAttribute('color',new THREE.Float32BufferAttribute(rgb,3));
  result.setAttribute('cardboardEdge',new THREE.Float32BufferAttribute(edgeValues,1));
  result.computeBoundingSphere();
  result.userData.cardboardTree=true;
  result.userData.blackInkCutout=true;
  result.userData.corrugatedEdges=true;
  return result;
 }
 const locations={pine:[],broadleaf:[]};
 const seen=new Set();
 function push(x,y,z,type,scale,seed){
  if(!Number.isFinite(x)||!Number.isFinite(y))return;
  const key=[x.toFixed(2),z.toFixed(2),type].join(':');
  if(seen.has(key))return;seen.add(key);
  locations[type].push({x,y,z,scale,seed});
 }
 // All field trees, including those added after mountain cliff generation.
 for(const obj of fieldTreeCrowns){
  const x=obj.position.x,z=obj.position.z,seed=Math.abs(Math.sin(x*12.98+z*78.23));
  push(x,naturalSurfaceY(x,z),z,'pine',.91+.16*seed,seed);
 }
 for(const t of mountainTreeSites)
  push(t.x,t.y,t.z,t.evergreen?'pine':'broadleaf',t.scale*(.84+.18*t.color),t.color);
 for(const t of cliffPineSites)
  push(t.x,t.y,t.z,'pine',t.scale*.9,Math.abs(Math.sin(t.x+t.z)));
 for(const [x,z,k] of [[-60,-43,1.15],[-61.8,-44.2,.84],
  [-58.35,-44.4,.75],[-59.3,-41.2,.90]])
  push(x,naturalSurfaceY(x,z),z,'pine',k*.84,x*.1);
 const material=new THREE.MeshStandardMaterial({
  color:'#ffffff',map:paper,vertexColors:true,roughness:.68,
  metalness:0,flatShading:true,side:THREE.DoubleSide});
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
   '\ndiffuseColor.rgb=mix(diffuseColor.rgb,flute,vCardboardEdge*.84);');
 };
 material.customProgramCacheKey=()=>'diorama-corrugated-ink-wax-v2';
 const forest=[];
 for(const kind of ['pine','broadleaf']){
  const entries=locations[kind];
  const batch=new THREE.InstancedMesh(template(kind==='pine'),material,entries.length);
  const transform=new THREE.Object3D();
  for(let i=0;i<entries.length;i++){
   const s=entries[i];
   transform.position.set(s.x,s.y+.025,s.z);
   transform.rotation.set(0,Math.sin(s.seed*73)*.45,0);
   transform.scale.setScalar(s.scale);
   transform.updateMatrix();batch.setMatrixAt(i,transform.matrix);
  }
  batch.instanceMatrix.needsUpdate=true;batch.frustumCulled=false;
  batch.castShadow=true;batch.name='diorama-cardboard-'+kind;
  scene.add(batch);forest.push(batch);
 }
 // The ORIGINAL analytical water shapes remain untouched; only their paint changes.
 for(const obj of [waterSurface,upperWaterSurface,waterfallPlane]){
  if(!obj?.material)continue;
  for(const m of Array.isArray(obj.material)?obj.material:[obj.material]){
   if(m.color)m.color.set(CRAYON.water);
   if('metalness' in m)m.metalness=0;
   if('roughness' in m)m.roughness=.67;
   if('opacity' in m)m.opacity=.90;
   m.transparent=true;m.depthWrite=false;
   if(m.map)m.map=null;
   m.needsUpdate=true;
  }
 }
 const status={
  source:'original-map-v0.61.0',isDiorama:true,mapComplete:true,
  terrainExact:true,physicsReused:true,
  camera:'animal-crossing-perspective-follow',
  bounds:{...terrainBounds},treeCounts:{
   pine:locations.pine.length,broadleaf:locations.broadleaf.length},
  waterBodies:waterBodies.map(w=>({id:w.id,x:w.x,z:w.z})),
  npcCount:ambientNPCs.length+1,originalGameModified:false,
  assetStyle:'crayola-primary-ink-corrugated',artVersion:'crayon-v1',
  outlinedScenery:ink.outlineCount,blackInk:true,corrugatedEdges:true,
  palette:'primary-wax'
 };
 window.__dioramaWorld=status;
 return {status,forest,locations};
}
