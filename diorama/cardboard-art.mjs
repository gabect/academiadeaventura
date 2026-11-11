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
   vec3 grass=vec3(.18,.72,.24)+crayonGrain;
   grass=mix(grass,vec3(.42,.86,.22),.36+
      .22*sin(vAcademyRockWorld.x*.39)*sin(vAcademyRockWorld.z*.37));
   float rib=sin(y*23.4+
       sin(vAcademyRockWorld.x*.52+vAcademyRockWorld.z*.31)*.65);
   vec3 core=mix(vec3(.55,.31,.13),vec3(.91,.62,.29),.50+.50*rib);
   float groove=1.-smoothstep(.16,.38,abs(rib));
   core=mix(core,vec3(.25,.16,.08),groove*.53);
   float cutWobble=sin(vAcademyRockWorld.x*.21+
       vAcademyRockWorld.z*.24+y*.18)*.42;
   float inkLine=1.-smoothstep(.07,.24,abs(sin(y*7.7+cutWobble)));
   core=mix(core,vec3(.025,.038,.034),inkLine*.82);
   float paintCoverage=clamp(.15+vAcademyCover*.97-exposed*.99,0.,1.);
   diffuseColor.rgb=mix(core,grass,paintCoverage);
   float cutInk=exposed*(1.-exposed)*4.;
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.028,.041,.038),
       smoothstep(.33,.85,cutInk)*.58);
   #include <alphamap_fragment>
  `);
 };
  terrainMaterial.customProgramCacheKey=()=>'academy-crayola-corrugated-strata-v2';
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
   s.moveTo(0,2.8);s.lineTo(-.55,2.06);s.lineTo(-.3,2.06);
   s.lineTo(-.90,1.35);s.lineTo(-.51,1.35);
   s.lineTo(-1.27,.60);s.quadraticCurveTo(0,.38,1.27,.60);
   s.lineTo(.51,1.35);s.lineTo(.90,1.35);
   s.lineTo(.3,2.06);s.lineTo(.55,2.06);
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
  const geos=[],base=[
   new THREE.Color('#ad875f'),new THREE.Color('#d3b390'),
   new THREE.Color(pine?'#4d8869':'#6f9f74'),
   new THREE.Color(pine?'#68a080':'#8dbc80'),
   new THREE.Color(pine?'#86b69a':'#b0cf98')
  ];
  const trunk=new THREE.BoxGeometry(pine?.31:.43,2.17,.34);
  trunk.translate(0,1.085,0);geos.push([trunk,0]);
  const leaf=shape(pine);
  for(let i=0;i<3;i++){
   const g=new THREE.ExtrudeGeometry(leaf,{depth:.13,steps:1,
    bevelEnabled:true,bevelThickness:.035,bevelSize:.06,
    bevelSegments:1,curveSegments:5});
   g.scale(1-i*.10,1-i*.08,1);
   g.translate((i-1)*(pine?.07:.17),
    (pine?1.17:1.95)+i*(pine?.29:.14),-.10+i*.11);
   g.rotateY(i===1?Math.PI*.37:(i===2?-.15:.12));
   geos.push([g,i+2]);
  }
  let positions=[],normals=[],uvs=[],colors=[];
  const edge=new THREE.Color('#c2a37c');
  for(const [geom,idx] of geos){
   const g=geom.index?geom.toNonIndexed():geom;
   const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=g.getAttribute('uv');
   for(let i=0;i<p.count;i++){
    positions.push(p.getX(i),p.getY(i),p.getZ(i));
    normals.push(n.getX(i),n.getY(i),n.getZ(i));
    uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);
    const side=g.groups.some(gr=>gr.materialIndex===1&&i>=gr.start&&i<gr.start+gr.count);
    const c=side?edge:base[idx];
    colors.push(c.r,c.g,c.b);
   }
   g.dispose();
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.computeBoundingSphere();g.userData.cardboardTree=true;return g;
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
  color:'#ffffff',vertexColors:true,roughness:1,
  metalness:0,flatShading:true,side:THREE.DoubleSide});
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
 return {status,forest};
}
