/**
 * EXACT uploaded PNG artwork: no redrawing, regeneration, recoloring or raster
 * cropping. Draw only the original pixels using UV windows in three source PNGs.
 * Retain the authored tree/shrub locations, player, NPCs and collision systems.
 */
const ASSETS={
 solo:new URL('./assets/handpainted-cardboard-tree.png',import.meta.url).href,
 trees:new URL('./assets/handpainted-cardboard-tree-collection.png',import.meta.url).href,
 bushes:new URL('./assets/handpainted-cardboard-bushes.png',import.meta.url).href
};
// Alpha-boundary pixel crop rectangles [left, top, right, bottom] from the
// 1254×1254 solo tree and two 2048×682 user-supplied atlases.
const treeDefs=[
 ['solo-tree','solo',[0,0,1238,1240],1254,1254,5.45],
 ['round-tree','trees',[49,12,636,656],2048,682,4.85],
 ['palm-tree','trees',[748,29,1318,657],2048,682,4.55],
 ['pine-tree','trees',[1475,9,1965,656],2048,682,4.75]
];
const bushRects=[
 [43,21,478,323],[552,25,989,324],[1064,24,1498,323],
 [1600,43,1979,321],[59,427,461,648],[567,407,980,647],
 [1084,360,1484,648],[1622,456,1967,647]
];
const bushDefs=bushRects.map((r,i)=>[
 'bush-'+(i+1),'bushes',r,2048,682,i<4?1.15:1.37
]);
function spritePlane(THREE,def){
 const [name,source,rect,sw,sh,h]=def,[x0,y0,x1,y1]=rect;
 const w=(x1-x0)/(y1-y0)*h;
 const g=new THREE.PlaneGeometry(w,h);
 g.translate(0,h/2,0);
 const uv=g.attributes.uv;
 for(let i=0;i<uv.count;i++){
  const isRight=uv.getX(i)>.5,isTop=uv.getY(i)>.5;
  uv.setXY(i,(isRight?x1:x0)/sw,1-(isTop?y0:y1)/sh);
 }
 uv.needsUpdate=true;g.userData={uploadedPNG:true,source,pixelCrop:rect};
 return g;
}
function loadPNG(THREE,src){
 return new Promise((resolve,reject)=>{
  new THREE.TextureLoader().load(src,t=>{
   t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
   t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;
   t.anisotropy=4;resolve(t);
  },undefined,reject);
 });
}
function selector(site,i){
 return Math.floor(Math.abs(Math.sin(site.x*3.71+site.z*2.13+i*.61))*8)%8;
}
export function installExactUserSprites({THREE,scene,camera,world,oldStage,
 treeLocations,shrubSites,naturalSurfaceY}){
 // Replace the older procedural drawings only, leaving its mountain-stage
 // backdrops and original cabin façade in place.
 for(const mesh of oldStage.cards){
  if(/^handmade-cardboard-(pine|broad|shrub|flower|mushroom)-/.test(mesh.name)||
    mesh.name==='cardboard-folded-standing-tabs')mesh.visible=false;
 }
 const pines=treeLocations.pine||[],broad=treeLocations.broadleaf||[],
  shrubs=shrubSites||[];
 // Original tree locations are never shuffled; show every uploaded tree type.
 const palmCandidates=broad.filter(s=>
   (s.x-38)*(s.x-38)+(s.z-11)*(s.z-11)<40*40);
 // Guarantee that the user-provided palm sprite appears without adding any
 // new tree positions: replace up to two existing trees near the lakeshore.
 const chosenPalmSites=(palmCandidates.length?palmCandidates:
   pines.slice().sort((a,b)=>
    ((a.x-38)**2+(a.z-11)**2)-((b.x-38)**2+(b.z-11)**2))).slice(0,2);
 const replaced=new Set(chosenPalmSites);
 const groups=[
  {def:treeDefs[0],sites:broad.filter((p,i)=>!replaced.has(p)&&i%2===0)},
  {def:treeDefs[1],sites:broad.filter((p,i)=>!replaced.has(p)&&i%2!==0)},
  {def:treeDefs[2],sites:chosenPalmSites},
  {def:treeDefs[3],sites:pines.filter(p=>!replaced.has(p))}
 ];
 for(let j=0;j<bushDefs.length;j++){
  groups.push({def:bushDefs[j],sites:shrubs.filter((p,i)=>selector(p,i)===j)});
 }
 const status={name:'uploaded-transparent-PNG-sprites',
  originalFiles:['Cardboard Tree Prop with Flowering Bushes.png',
   'Cardboard-Style Bush and Grass Sprite Sheet.png',
   'Cartoon Cardboard Tree Collection.png'],
  untouchedPixels:true,redrawn:false,ready:false,failed:false,
  variants:12,treePositions:pines.length+broad.length,shrubPositions:shrubs.length,
  sprites:0,drawCalls:0};
 world.userSprites=status;
 const batches=[];
 const ready=Promise.all([
  loadPNG(THREE,ASSETS.solo),loadPNG(THREE,ASSETS.trees),
  loadPNG(THREE,ASSETS.bushes)
 ]).then(([a,b,c])=>{
  const mats={
   solo:new THREE.MeshBasicMaterial({map:a,side:THREE.DoubleSide,alphaTest:.105,
    transparent:false,alphaToCoverage:true,depthWrite:true,toneMapped:false}),
   trees:new THREE.MeshBasicMaterial({map:b,side:THREE.DoubleSide,alphaTest:.105,
    transparent:false,alphaToCoverage:true,depthWrite:true,toneMapped:false}),
   bushes:new THREE.MeshBasicMaterial({map:c,side:THREE.DoubleSide,alphaTest:.105,
    transparent:false,alphaToCoverage:true,depthWrite:true,toneMapped:false})
  };
  for(const {def,sites} of groups){
   if(!sites.length)continue;
   const geo=spritePlane(THREE,def);
   const mesh=new THREE.InstancedMesh(geo,mats[def[1]],sites.length);
   mesh.name='original-PNG-'+def[0];
   mesh.frustumCulled=false;mesh.castShadow=false;
   mesh.userData={isUserSprite:true,source:def[1],rect:def[2]};
   scene.add(mesh);batches.push({mesh,sites,def});
  }
  status.orientation='fixed-stage-front';status.groundAnchored=true;
  status.ready=true;status.drawCalls=batches.length;
  status.sprites=batches.reduce((n,b)=>n+b.sites.length,0);
  status.usedVariants=batches.map(b=>b.def[0]);
  update(true);
  if(window.__studioCIRefresh)window.__studioCIRefresh();
 }).catch(error=>{
  status.failed=true;status.error=String(error);
  console.error('Failed to load original user PNG sprites',error);
 });
 let matricesInitialized=false;
 function update(force=false){
  if(!status.ready||(!force&&matricesInitialized))return;
  matricesInitialized=true;
  const temp=new THREE.Object3D();
  for(const {mesh,sites,def} of batches){
   for(let i=0;i<sites.length;i++){
    const p=sites[i];
    // Bottom-centered plane: place the cutout foot directly at the terrain surface.
    // Never billboard toward the player/camera: these are stationary stage flats.
    const floor=Number.isFinite(naturalSurfaceY?.(p.x,p.z))?
      naturalSurfaceY(p.x,p.z):p.y;
    temp.position.set(p.x,floor-.045,p.z);
    temp.rotation.set(0,0,0);
    const variation=Math.abs(Math.sin(p.x*.67+p.z*.32));
    const scale=def[1]==='bushes'?
      (def[0]==='bush-7'||def[0]==='bush-8'?.45+.18*variation:.55+.20*variation):
      Math.max(.67,Math.min(1.38,p.scale||1));
    temp.scale.setScalar(scale);temp.updateMatrix();
    mesh.setMatrixAt(i,temp.matrix);
   }
   mesh.instanceMatrix.needsUpdate=true;
  }
 }
 return {status,ready,update,batches};
}
