/**
 * Academia de Aventura: 3D toon finish for inhabitants only.
 * Cardboard terrain and paper sprites are deliberately not affected.
 * Built-in MeshToonMaterial keeps the engine's lights, shadows, fog and
 * scene-curvature hooks. Major silhouette meshes receive a thin inverted hull.
 */
export function applyToonFinish(THREE,root,{outlines=true,lowPower=false}={}){
 const tex=new THREE.DataTexture(new Uint8Array([
  66,66,66,255,
  125,125,125,255,
  207,207,207,255,
  255,255,255,255
 ]),4,1,THREE.RGBAFormat);
 tex.needsUpdate=true;
 tex.magFilter=THREE.NearestFilter;
 tex.minFilter=THREE.NearestFilter;
 tex.generateMipmaps=false;
 const replacements=new Map();
 const edge=new THREE.MeshBasicMaterial({
  color:'#30251f',side:THREE.BackSide,
  depthWrite:true,depthTest:true,toneMapped:false,fog:true
 });
 let outlined=0,converted=0;
 const meshes=[];
 root.traverse(node=>{if(node.isMesh&&node.visible&&!node.userData.toonOutline)meshes.push(node);});
 for(const mesh of meshes){
  const old=mesh.material;
  if(old?.isMeshStandardMaterial){
   let toon=replacements.get(old);
   if(!toon){
    toon=new THREE.MeshToonMaterial({
     color:old.color,gradientMap:tex,
     side:old.side,
     transparent:old.transparent,opacity:old.opacity,
     alphaTest:old.alphaTest,depthWrite:old.depthWrite,
     fog:true
    });
    toon.name='academia-cel-shading';
    toon.userData.materialStyle='four-tone-ink';
    replacements.set(old,toon);converted++;
   }
   mesh.material=toon;
  }
  // Fewer than 20 large silhouette outlines per character, mobile conscious.
  const geo=mesh.geometry;
  const sphere=geo?.type==='SphereGeometry' &&
   Math.max(mesh.scale.x,mesh.scale.y,mesh.scale.z)>.16 &&
   Math.min(mesh.scale.x,mesh.scale.y,mesh.scale.z)>.09;
  const tunic=geo?.userData?.characterGarment===true &&
   geo.userData.mainSilhouette===true;
  const bag=geo?.userData?.characterBag===true;
  if(!outlines||lowPower||!sphere&&!tunic&&!bag)continue;
  const contour=new THREE.Mesh(geo,edge);
  contour.name='character-ink-outline';
  contour.userData.toonOutline=true;
  contour.position.copy(mesh.position);
  contour.quaternion.copy(mesh.quaternion);
  contour.scale.copy(mesh.scale).multiplyScalar(
   geo?.type==='SphereGeometry'?1.055:1.045);
  contour.castShadow=false;contour.receiveShadow=false;
  contour.frustumCulled=mesh.frustumCulled;
  mesh.parent.add(contour);
  outlined++;
 }
 const status={style:'cel-shaded-vector-3d',shadeBands:4,
  materialCount:converted,outlineMeshes:outlined,
  outlinesEnabled:outlines&&!lowPower,noSpriteReplacement:true};
 root.userData.toonFinish=status;
 return status;
}
