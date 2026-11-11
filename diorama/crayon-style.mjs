/**
 * Diorama Crayola art kit. Deterministic canvas textures; no image downloads.
 * A single shared wax paper surface and a ribbed cardboard edge surface
 * provide deliberate handmade color, wax flecks, dark ink and cut fibers.
 */
export const CRAYON={
 ink:'#1e2422',
 red:'#ec3534',yellow:'#ffd32a',blue:'#2875ec',
 green:'#39b852',orange:'#f28a2d',violet:'#9450c7',
 lightGreen:'#72d46e',deepGreen:'#239e57',cream:'#fff6d7',
 tan:'#cba574',card:'#d6af78',edge:'#af8253',
 sky:'#9dd9f2',water:'#299de4'
};
function random(seed){
 let a=seed>>>0;
 return ()=>{
  a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);
  t^=t+Math.imul(t^(t>>>7),61|t);
  return ((t^(t>>>14))>>>0)/4294967296;
 };
}
export function makeCrayonTexture(THREE){
 const size=256,c=document.createElement('canvas');
 c.width=c.height=size;const g=c.getContext('2d'),r=random(3297604);
 g.fillStyle='#fefefa';g.fillRect(0,0,size,size);
 // Dense angled translucent wax marks tint vertex-colored artwork without
 // turning it into camouflage or the previous scribbled foliage.
 for(let i=0;i<3100;i++){
  const x=r()*size,y=r()*size,length=2+r()*14;
  g.strokeStyle=r()>.62?'rgba(255,255,255,.19)':'rgba(57,35,22,.065)';
  g.lineWidth=.38+r()*1.3;g.lineCap='round';
  g.beginPath();g.moveTo(x,y);g.lineTo(x+length,y-length*(.16+r()*.27));g.stroke();
 }
 // Sparse pressed wax / paper-tooth highlights catch a little warm light.
 for(let i=0;i<1900;i++){
  g.fillStyle=r()>.53?'rgba(255,255,255,.43)':'rgba(31,29,25,.035)';
  g.fillRect(r()*size,r()*size,.3+r()*1.3,.3+r()*1.3);
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1.8,1.8);
 tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearMipmapLinearFilter;
 tex.anisotropy=4;return tex;
}
export function makeCorrugatedTexture(THREE){
 const size=256,c=document.createElement('canvas');c.width=c.height=size;
 const g=c.getContext('2d'),r=random(96230);
 g.fillStyle=CRAYON.card;g.fillRect(0,0,size,size);
 // Repeated compressed channels and their inner shadows, like the exposed
 // flute layer of double-wall corrugated shipping cardboard.
 for(let x=0;x<size;x+=11){
  g.fillStyle='#8f653e';g.fillRect(x+2,0,2.9,size);
  g.fillStyle='#f4d3a1';g.fillRect(x+5.1,0,2.5,size);
  g.fillStyle='#bb925d';g.fillRect(x+7.8,0,3.0,size);
  g.strokeStyle='rgba(52,38,27,.22)';g.lineWidth=.8;
  g.beginPath();g.moveTo(x+2,0);
  for(let y=0;y<size;y+=12)g.lineTo(x+2+Math.sin(y*.075)*1.2,y);
  g.stroke();
 }
 for(let i=0;i<3400;i++){
  const x=r()*size,y=r()*size;
  g.fillStyle=r()>.5?'rgba(255,237,194,.16)':'rgba(44,26,13,.09)';
  g.fillRect(x,y,1+r()*3,.4+r()*.6);
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(1.4,1.6);
 tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearMipmapLinearFilter;
 tex.anisotropy=4;return tex;
}
/** Ink outlines for original houses, structures and rocks, preserving 3D. */
export function addSceneryInk({THREE,scene,exclude=[],limit=155}){
 const excluded=new Set(exclude.filter(Boolean));
 const ink=new THREE.LineBasicMaterial({
  color:CRAYON.ink,transparent:false,depthTest:true,depthWrite:false
 });
 const meshes=[];
 scene.traverse(node=>{
  if(!node.isMesh||node.isInstancedMesh||!node.visible||excluded.has(node))return;
  if(node.userData?.noDioramaInk||node.geometry?.userData?.impostor)return;
  // No topological outline for terrain/water, or character skeletons.
  for(let p=node.parent;p;p=p.parent)if(excluded.has(p))return;
  const geo=node.geometry;
  if(!geo||!geo.attributes?.position||geo.attributes.position.count>1800)return;
  if(!geo.boundingBox)geo.computeBoundingBox();
  const dim=geo.boundingBox.getSize(new THREE.Vector3());
  const big=Math.max(dim.x,dim.y,dim.z);
  if(big<.38||big>17)return;
  const kind=geo.type||'';
  if(!/Box|Dodecahedron|Icosahedron|Cylinder|Cone|Sphere|Extrude/.test(kind))return;
  meshes.push(node);
 });
 let count=0;
 // Exposed rock faces and house edges; cap independent draw calls for mobile.
 for(const mesh of meshes){
  if(count>=limit)break;
  const geom=new THREE.EdgesGeometry(mesh.geometry,38);
  if(!geom.getAttribute('position')||geom.getAttribute('position').count<4){
   geom.dispose();continue;
  }
  const line=new THREE.LineSegments(geom,ink);
  line.name='diorama-crayon-black-outline';
  line.userData.dioramaOutline=true;
  line.renderOrder=mesh.renderOrder+1;
  mesh.add(line);count++;
 }
 return {outlineCount:count,material:ink};
}
