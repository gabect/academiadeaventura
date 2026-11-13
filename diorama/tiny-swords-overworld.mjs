/**
 * Tiny Swords illustrated scenery in the classic Zelda-like overworld.
 * In-game integration of selected artwork by Pixel Frog, from the user-provided
 * Tiny Swords Free Pack. Art is not a standalone asset distribution.
 * Original terrain topology, collision, trees' X/Z sites, and NPCs never change.
 */
const REGIONS={
 tree1:[228,8,238,380],tree2:[8,8,212,488],
 tree3:[474,8,180,292],tree4:[662,8,160,244],
 bush1:[8,504,134,92],bush2:[682,504,92,68],
 bush3:[830,8,156,118],bush4:[150,504,92,84],
 rock1:[868,504,64,52],rock2:[480,504,100,72],
 rock3:[782,504,78,58],rock4:[250,504,118,84],
 stump1:[376,504,96,80],stump2:[588,504,86,70]
};
const ATLAS=1024;
export const TINY_SWORDS_ATLAS=new URL('./assets/tiny-overworld.webp?v=1',import.meta.url).href;
export function tinyRegion(key){return REGIONS[key]?REGIONS[key].slice():null;}
export function classifyTinySites(locations={},shrubSites=[],stoneSites=[]){
 const pines=locations.pine||[],broad=locations.broadleaf||[];
 const groups=[];
 for(let i=0;i<pines.length;i++)groups.push({kind:i%2?'tree1':'tree2',site:pines[i]});
 for(let i=0;i<broad.length;i++)groups.push({kind:i%2?'tree4':'tree3',site:broad[i]});
 for(let i=0;i<shrubSites.length;i++)groups.push({
  kind:'bush'+(1+i%4),site:shrubSites[i]
 });
 for(let i=0;i<stoneSites.length;i+=2)groups.push({
  kind:'rock'+(1+i%4),site:stoneSites[i]
 });
 return groups;
}
export function installTinySwordsOverworld({THREE,scene,camera,world,
 baseSprites,treeLocations,shrubSites=[],stoneSites=[],naturalSurfaceY,
 applyTerrainCurve}){
 const sites=classifyTinySites(treeLocations,shrubSites,stoneSites);
 const status={
  style:'tiny-swords-illustrated-overworld',
  artist:'Pixel Frog',source:'Tiny Swords Free Pack',
  ready:false,failed:false,trees:sites.filter(s=>s.kind.startsWith('tree')).length,
  bushes:sites.filter(s=>s.kind.startsWith('bush')).length,
  rocks:sites.filter(s=>s.kind.startsWith('rock')).length,
  batches:0,originalSitesPreserved:true,collisionsPreserved:true,
  atlas:'integrated-game-texture'
 };
 world.tinySwords=status;
 let ready=false,lastYaw=Infinity;
 const batches=[];
 const t=new THREE.Object3D();
 function shade(){
  const g=new THREE.CircleGeometry(1,20);
  const m=new THREE.MeshBasicMaterial({
   color:0x2b3429,transparent:true,opacity:.18,depthWrite:false,
   polygonOffset:true,polygonOffsetFactor:-1
  });
  applyTerrainCurve?.(m);
  return {g,m};
 }
 const contact=shade();
 function prepareGeo(key){
  const [x,y,w,h]=REGIONS[key];
  const heights={tree1:4.2,tree2:4.55,tree3:3.65,tree4:3.25,
   bush1:.86,bush2:.66,bush3:.92,bush4:.72,
   rock1:.53,rock2:.66,rock3:.61,rock4:.69,
   stump1:.67,stump2:.57};
  const height=heights[key],width=height*w/h;
  const geometry=new THREE.PlaneGeometry(width,height);
  geometry.translate(0,height/2-.02,0);
  const uv=geometry.attributes.uv;
  for(let j=0;j<uv.count;j++){
   const right=uv.getX(j)>.5,top=uv.getY(j)>.5;
   uv.setXY(j,
    (x+(right?w-.5:.5))/ATLAS,
    1-(y+(top?.5:h-.5))/ATLAS);
  }
  uv.needsUpdate=true;
  return {geometry,width,height};
 }
 function groundAt(x,z,fallback=0){
  const h=naturalSurfaceY?.(x,z);
  return Number.isFinite(h)?h:fallback;
 }
 function update(force=false){
  if(!ready)return;
  // Fixed-angle sprites do not spin toward the player. They face the same
  // camera direction as a classic illustrated top-down map.
  const facing=new THREE.Vector3();
  camera.getWorldDirection(facing);
  const yaw=Math.atan2(-facing.x,-facing.z);
  if(!force&&Math.abs(Math.atan2(Math.sin(yaw-lastYaw),Math.cos(yaw-lastYaw)))<.009)
   return;
  lastYaw=yaw;
  for(const batch of batches){
   const {mesh,shadows,records,key}=batch;
   for(let i=0;i<records.length;i++){
    const p=records[i].site,scale=key.startsWith('tree')?
      Math.max(.76,Math.min(1.22,p.scale||1)):
      key.startsWith('rock')?.72+(i%5)*.065:
      .78+(i%5)*.07;
    const radius=key.startsWith('tree')?.47:.17;
    const floor=Math.min(
     groundAt(p.x,p.z,p.y||0),
     groundAt(p.x-radius,p.z,p.y||0),
     groundAt(p.x+radius,p.z,p.y||0),
     groundAt(p.x,p.z-radius,p.y||0),
     groundAt(p.x,p.z+radius,p.y||0));
    t.position.set(p.x,floor-.08,p.z);
    t.rotation.set(0,yaw,0);
    t.scale.set(scale,scale,scale);t.updateMatrix();
    mesh.setMatrixAt(i,t.matrix);
    t.position.set(p.x,groundAt(p.x,p.z,p.y||0)+.045,p.z);
    t.rotation.set(-Math.PI/2,0,0);
    const extent=key.startsWith('tree')?.75:key.startsWith('bush')?.40:.48;
    t.scale.set(extent*scale,extent*.43*scale,1);
    t.updateMatrix();
    shadows.setMatrixAt(i,t.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
   shadows.instanceMatrix.needsUpdate=true;
  }
 }
 const materialTexture=new THREE.TextureLoader();
 const readyPromise=new Promise((resolve,reject)=>{
  materialTexture.load(TINY_SWORDS_ATLAS,resolve,undefined,reject);
 }).then(texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;
  texture.generateMipmaps=false;texture.anisotropy=1;
  texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
  const material=new THREE.MeshBasicMaterial({
   map:texture,side:THREE.DoubleSide,transparent:true,
   alphaTest:.12,depthWrite:true,alphaToCoverage:true,toneMapped:false
  });
  applyTerrainCurve?.(material);
  for(const key of Object.keys(REGIONS)){
   const records=sites.filter(s=>s.kind===key);if(!records.length)continue;
   const {geometry}=prepareGeo(key);
   const mesh=new THREE.InstancedMesh(geometry,material,records.length);
   mesh.name='tiny-swords-'+key;mesh.frustumCulled=false;
   mesh.castShadow=false;mesh.receiveShadow=false;
   mesh.userData={assetPack:'tiny-swords',kind:key,renderOnly:true};
   const shadows=new THREE.InstancedMesh(contact.g,contact.m,records.length);
   shadows.name='tiny-swords-contact-'+key;
   shadows.frustumCulled=false;
   scene.add(shadows,mesh);
   batches.push({mesh,shadows,records,key});
  }
  ready=true;update(true);
  // Replace older picture planes ONLY when the new atlas is loaded.
  // If loading fails, original trees remain playable and visible.
  const hideOld=()=>{for(const batch of baseSprites?.batches||[]){
   batch.mesh.visible=false;batch.shadow.visible=false;
  }};
  hideOld();baseSprites?.ready?.then(hideOld);
  status.ready=true;status.batches=batches.length;
  status.variants=Object.keys(REGIONS).length;
  world.assetStyle='tiny-swords-2d-sprites';
  window.__studioCIRefresh?.();
  return status;
 }).catch(err=>{
  status.failed=true;status.error=String(err);
  console.error('Tiny Swords scenery did not load; original art remains',err);
  return status;
 });
 return {status,ready:readyPromise,update,batches};
}
