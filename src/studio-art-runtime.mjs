/** Opt-in illustrated mountain assets. No colliders, no external libraries. */
export function installStudioArt(THREE, options){
 const {scene, meadowSites, ledgeSites=[], wallSites=[], crestSites=[], onMeadowReady, rockUniform, grassUniform,
  mossUniform, rockMaterials=[], setEnvironmentRockTexture, statusSink}=options;
 const loader=new THREE.TextureLoader();
 const status={terrainReady:false,grassReady:false,rockReady:false,plantTypesReady:0,errors:[],spriteCounts:{}};
 const groups=[];
 const root='./assets/studio_hd/';
 const setCommon=(tex,tile=false)=>{
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.wrapS=tex.wrapT=tile?THREE.RepeatWrapping:THREE.ClampToEdgeWrapping;
  tex.minFilter=THREE.LinearMipmapLinearFilter;tex.magFilter=THREE.LinearFilter;
  tex.generateMipmaps=true;tex.anisotropy=tile?6:4;tex.needsUpdate=true;
 };
 const notify=()=>{if(statusSink)statusSink(status);};
 const load=(path,loaded)=>{
  loader.load(root+path,texture=>{
   try{setCommon(texture,path.startsWith('tiles/'));loaded(texture);notify();}
   catch(error){status.errors.push(path+': '+error.message);notify();}
  },undefined,err=>{
   status.errors.push('Missing '+path+': '+(err?.message||'network error'));
   notify();
  });
 };
 load('tiles/rock_quilt.webp',tex=>{
  rockUniform.value=tex;status.rockReady=true;
  for(const mat of rockMaterials){
   if(!mat)continue;mat.map=tex;mat.needsUpdate=true;
  }
  if(setEnvironmentRockTexture)setEnvironmentRockTexture(tex);
  status.terrainReady=!!grassUniform.value?.image;
 });
 load('tiles/rock_moss_quilt.webp',tex=>{if(mossUniform)mossUniform.value=tex;});
 load('tiles/grass_quilt.webp',tex=>{
  grassUniform.value=tex;
  status.terrainReady=!!rockUniform.value?.image;
 });
 function geometry(aspect,{cross=true,hanging=false}={}){
  const vertices=[],uv=[],indices=[],planes=cross?2:1;
  for(let i=0;i<planes;i++){
   const angle=i*Math.PI/2,start=vertices.length/3;
   const y0=hanging?-.78:-.025,y1=hanging?.18:1;
   for(const [x,y,u,v] of [[-.5,y0,0,0],[.5,y0,1,0],[-.5,y1,0,1],[.5,y1,1,1]]){
    vertices.push(Math.cos(angle)*aspect*x,y,Math.sin(angle)*aspect*x);uv.push(u,v);
   }
   indices.push(start,start+1,start+2,start+1,start+3,start+2);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(indices);g.computeVertexNormals();return g;
 }
 const groupSpecs=[
  {key:'grass_tuft',file:'grass_tuft.webp',aspect:1.30,source:'meadow',
   select:i=>i%5<2,height:v=>.62+v.size*.72},
  {key:'grass_medium',file:'grass_medium.webp',aspect:1.22,source:'meadow',
   select:i=>i%5===2||i%5===3,height:v=>.50+v.size*.60},
  {key:'fern',file:'fern.webp',aspect:1.17,source:'meadow',
   select:i=>i%9===0,height:v=>.67+v.size*.70},
  {key:'broadleaf',file:'broadleaf.webp',aspect:1.18,source:'meadow',
   select:i=>i%13===2,height:v=>.75+v.size*.65},
  {key:'flowers_white',file:'flowers_white.webp',aspect:1.07,source:'meadow',
   select:i=>i%32===8,height:v=>.49+v.size*.44},
  {key:'flowers_purple',file:'flowers_purple.webp',aspect:1.04,source:'meadow',
   select:i=>i%37===7,height:v=>.56+v.size*.53},
  // Vegetated ledges: dark stone remains genuinely 3D behind the cards.
  {key:'hanging_edge',file:'hanging_edge.webp',aspect:1.70,source:'ledge',
   select:i=>i%2===0,height:v=>.41+v.sx*.33,hanging:true,cross:false},
  {key:'cliff_crest',file:'hanging_edge.webp',aspect:1.83,source:'crest',
   select:i=>i%2===0,height:v=>.65+v.size*.24,hanging:true,cross:false},
  {key:'wall_vines',file:'vine.webp',aspect:1.05,source:'wall',
   select:i=>i%2===0,height:v=>1.02+v.size*.88,hanging:true,cross:false},
  {key:'wall_roots',file:'root.webp',aspect:2.05,source:'wall',
   select:i=>i%11===3,height:v=>.80+v.size*.42,hanging:true,cross:false},
  {key:'wall_ferns',file:'fern.webp',aspect:1.15,source:'wall',
   select:i=>i%4===1,height:v=>.41+v.size*.48,cross:false},
  {key:'ledge_flora',file:'broadleaf.webp',aspect:1.15,source:'ledge',
   select:i=>i%3===1,height:v=>.38+v.sx*.34,cross:false},
  {key:'ledge_rocks',file:'rock_ledge.webp',aspect:1.65,source:'ledge',
   select:i=>i%5===2,height:v=>.49+v.sx*.38,cross:false},
  {key:'rock_outcrops',file:'rock_outcrop.webp',aspect:1.64,source:'ledge',
   select:i=>i%7===5,height:v=>.52+v.sx*.42,cross:false}
 ];
 for(const spec of groupSpecs){
  const origin=spec.source==='ledge'?ledgeSites:spec.source==='wall'?wallSites:
   spec.source==='crest'?crestSites:meadowSites;
  const sites=origin.filter((s,i)=>spec.select(i));
  if(!sites.length)continue;
  const mat=new THREE.MeshStandardMaterial({color:'#ffffff',side:THREE.DoubleSide,
   roughness:1,alphaTest:.52,transparent:false,depthWrite:true});
  const geo=geometry(spec.aspect,{cross:spec.cross!==false,hanging:spec.hanging===true});
  const instanced=new THREE.InstancedMesh(geo,mat,sites.length);
  const dummy=new THREE.Object3D();
  for(let i=0;i<sites.length;i++){
   const item=sites[i],height=spec.height(item),yaw=(i*2.3999632)%6.2831853;
   dummy.position.set(item.x,(item.y||0)+(spec.source==='ledge'?(item.sy||0)*.72:0),
    item.z+(['ledge','crest','wall'].includes(spec.source)?.14:0));
   dummy.rotation.set(0,['ledge','crest','wall'].includes(spec.source)?0:yaw,0);
   dummy.scale.set(height,height,height);
   dummy.updateMatrix();instanced.setMatrixAt(i,dummy.matrix);
  }
  instanced.instanceMatrix.needsUpdate=true;
  instanced.frustumCulled=false;
  instanced.receiveShadow=true;
  instanced.name='studio-art-'+spec.key;
  instanced.visible=false;
  scene.add(instanced);
  status.spriteCounts[spec.key]=sites.length;
  groups.push({mesh:instanced,full:sites.length,key:spec.key,loaded:false});
  load('sprites/'+spec.file,tex=>{
   mat.map=tex;mat.needsUpdate=true;instanced.visible=true;
   const group=groups.find(g=>g.mesh===instanced);if(group)group.loaded=true;
   status.plantTypesReady++;
   if((spec.key==='grass_tuft'||spec.key==='grass_medium')&&!status.grassReady){
    status.grassReady=true;
    if(onMeadowReady)onMeadowReady();
   }
  });
 }
 notify();
 const update=quality=>{
  const ratio=quality==='low'?.28:quality==='medium'?.60:1;
  for(const g of groups)g.mesh.count=Math.max(0,Math.floor(g.full*ratio));
 };
 return {status,groups,update};
}
