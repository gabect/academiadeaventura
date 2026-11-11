/**
 * Academia de Aventura — inhabitants of the cardboard world.
 * Fully volumetric stylized character meshes; the surrounding world remains
 * handmade paper/cardboard. No billboards, cut-outs or screen-facing quads.
 *
 * Art direction: warm 3D animated-film boy, slouching cloth cap, messy brown
 * hair, freckles, worn olive tunic, rope belt, satchel, balloon trousers,
 * leg wraps and leather boots. This is a procedural game-ready interpretation
 * of the reference sheets, NOT a photogrammetric/AI-derived GLB.
 *
 * IMPORTANT: This module only skins the existing articulated gameplay rig.
 * It deliberately preserves locomotion IK, head/limb joints, collisions,
 * climbing, swimming, camera, NPC identities and world locations.
 */

import {applyToonFinish} from './toon-finish.mjs?v=1';

const PI=Math.PI, TAU=2*Math.PI;
const PALETTES=[
 {hair:'#65402d',hairLight:'#8b5737',skin:'#f2b78f'},
 {hair:'#392a25',hairLight:'#634233',skin:'#d9a17e'},
 {hair:'#a56238',hairLight:'#d0894b',skin:'#edb58f'},
 {hair:'#493329',hairLight:'#825439',skin:'#d8a57f'}
];

export function installStylizedCharacter(THREE,character,options={}){
 const rig=character.userData?.rig;
 if(!rig?.torso||!rig?.head||rig.legs?.length!==2||rig.arms?.length!==2)
  throw new Error('Stylized character requires the original articulated rig');
 if(character.userData.characterArt?.installed)return character.userData.characterArt;
 const player=options.role==='player',seed=options.seed||0;
 const palette=PALETTES[player?0:Math.abs(seed)%PALETTES.length];
 const coat=options.coat||(player?'#818052':'#877f71');
 const skinColor=options.skin||palette.skin,hatColor=player?'#947047':'#77634f';
 const hairColor=player?'#68412e':palette.hair;
 const hairHighlight=player?'#9b623e':palette.hairLight;
 const clothes=material(coat,'fabric',21+seed);
 const trim=material('#594834','fabric',3),skin=new THREE.MeshStandardMaterial({color:skinColor,roughness:.79});
 const cheek=new THREE.MeshStandardMaterial({color:'#f29375',roughness:.88,transparent:true,opacity:.48,depthWrite:false});
 const noseMat=new THREE.MeshStandardMaterial({color:'#ed9d78',roughness:.8});
 const hair=material(hairColor,'hair',42),hairLit=material(hairHighlight,'hair',14);
 const cap=material(hatColor,'fabric',8),capShade=material('#765737','fabric',11);
 const trousers=material(player?'#56493e':'#625247','fabric',51);
 const leather=material('#9a5b35','leather',71),leatherDark=material('#764328','leather',13);
 const rope=material('#d9b88b','rope',23),bandage=material('#d6c5a5','fabric',17);
 const sole=new THREE.MeshStandardMaterial({color:'#3f332e',roughness:1});
 const eyesWhite=new THREE.MeshStandardMaterial({color:'#fff7ec',roughness:.22});
 const iris=new THREE.MeshStandardMaterial({color:'#704225',roughness:.22});
 const black=new THREE.MeshStandardMaterial({color:'#1c1816',roughness:.14});
 const sparkle=new THREE.MeshBasicMaterial({color:'#ffffff'});
 const freckle=new THREE.MeshStandardMaterial({color:'#bd6545',roughness:.95});
 const stitches=new THREE.LineBasicMaterial({color:'#c69d70'});
 const smiling=new THREE.MeshStandardMaterial({color:'#7e4439',roughness:1});
 const sphere=new THREE.SphereGeometry(1,20,14);
 // Replace only visuals, never parents of gameplay/IK joints.
 character.traverse(o=>{if(o.isMesh||o.isLine)o.visible=false;});
 function material(color,kind,number){
  // Solid color swatches replace noisy procedural fabric and leather textures.
  const m=new THREE.MeshStandardMaterial({color,roughness:.94,metalness:0});
  m.name='cel-'+kind+'-'+number;return m;
 }
 function add(parent,g,m,p=[0,0,0],s=null,shadow=true){
  const mesh=new THREE.Mesh(g,m);mesh.position.set(...p);
  if(s)mesh.scale.set(...s);
  mesh.castShadow=shadow;mesh.receiveShadow=shadow;
  parent.add(mesh);return mesh;
 }
 function orb(parent,m,p,s,shadow=true){return add(parent,sphere,m,p,s,shadow);}
 function line(parent,points,r,m,segments=12){
  return add(parent,new THREE.TubeGeometry(
   new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),
   segments,r,6,false),m);
 }
 function ring(parent,m,x,y,z,rx,rz,r=.018){
  const curve=new THREE.CatmullRomCurve3(Array.from({length:25},(_,i)=>{
   const a=TAU*i/24;return new THREE.Vector3(x+Math.cos(a)*rx,y,z+Math.sin(a)*rz);
  }),true);
  return add(parent,new THREE.TubeGeometry(curve,36,r,5,true),m);
 }
 function garment(parent,m,rings,segments=20,rough=.014){
  const positions=[],uv=[],indices=[];
  for(let i=0;i<rings.length;i++){
   const [h,rx,rz,ox=0,oz=0]=rings[i];
   for(let j=0;j<=segments;j++){
    const a=j/segments*TAU;const fold=1+.014*Math.sin(a*5+i*1.7);
    positions.push(ox+Math.sin(a)*rx*fold,
     h+(i===0?rough*Math.sin(a*9+seed):0),
     oz+Math.cos(a)*rz*fold);
    uv.push(j/segments,i/Math.max(1,rings.length-1));
   }
  }
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<segments;j++){
   const k=i*(segments+1)+j;
   indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
  geo.userData.characterGarment=true;
  geo.userData.mainSilhouette=parent===rig.torso||rig.legs.some(l=>parent===l.hip||parent===l.knee);
  return add(parent,geo,m);
 }
 function roundedPanel(parent,w,h,d,m,x,y,z){
  const s=new THREE.Shape(),r=Math.min(w,h)*.2,x0=-w/2,y0=-h/2;
  s.moveTo(x0+r,y0);s.lineTo(x0+w-r,y0);
  s.quadraticCurveTo(x0+w,y0,x0+w,y0+r);
  s.lineTo(x0+w,y0+h-r);s.quadraticCurveTo(x0+w,y0+h,x0+w-r,y0+h);
  s.lineTo(x0+r,y0+h);s.quadraticCurveTo(x0,y0+h,x0,y0+h-r);
  s.lineTo(x0,y0+r);s.quadraticCurveTo(x0,y0,x0+r,y0);
  const geo=new THREE.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,
   bevelThickness:.014,bevelSize:.014,bevelSegments:2,curveSegments:4});
  geo.userData.characterBag=m===leather||m===leatherDark;
  return add(parent,geo,m,[x,y,z]);
 }
 function seams(parent,x0,y0,z0,w,h){
  const verts=[];
  for(let i=0;i<12;i++){
   const t=i/11,xx=x0-w/2+.038+t*(w-.076);
   verts.push(xx,y0-h/2+.026,z0,xx+.006,y0-h/2+.055,z0);
  }
  for(let i=0;i<7;i++){
   const t=i/6,yy=y0-h/2+.048+t*(h-.10);
   for(const sign of [-1,1]){
    const xx=x0+sign*(w/2-.028);verts.push(xx-.008,yy-.014,z0,xx+.008,yy+.014,z0);
   }
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  const l=new THREE.LineSegments(g,stitches);parent.add(l);return l;
 }
 function taperedLock(parent,points,r,m){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const pos=[],uv=[],idx=[],N=10,S=7;
  const tangent=new THREE.Vector3(),u=new THREE.Vector3(),v=new THREE.Vector3();
  for(let i=0;i<=N;i++){
   const t=i/N,p=curve.getPoint(t);curve.getTangent(t,tangent);
   const ref=Math.abs(tangent.z)>.9?new THREE.Vector3(0,1,0):new THREE.Vector3(0,0,1);
   u.crossVectors(tangent,ref).normalize();v.crossVectors(tangent,u).normalize();
   const radius=r*Math.pow(1-t,.65)+.002;
   for(let j=0;j<=S;j++){
    const a=j/S*TAU;
    pos.push(p.x+radius*(u.x*Math.cos(a)+v.x*Math.sin(a)),
     p.y+radius*(u.y*Math.cos(a)+v.y*Math.sin(a)),
     p.z+radius*(u.z*Math.cos(a)+v.z*Math.sin(a)));
    uv.push(j/S,t);
   }
  }
  for(let i=0;i<N;i++)for(let j=0;j<S;j++){
   const a=i*(S+1)+j;idx.push(a,a+1,a+S+1,a+1,a+S+2,a+S+1);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  return add(parent,g,m);
 }
 // Tailored olive linen dress: silhouette is a softly flared, uneven tunic.
 const torso=rig.torso;
 garment(torso,clothes,[[-.105,.405,.31],[.015,.38,.295],[.17,.33,.27],
  [.39,.365,.285],[.585,.415,.255],[.73,.255,.21]]);
 ring(torso,trim,0,.736,.012,.245,.21,.022);
 for(let i=0;i<3;i++){
  const y=.675-i*.092;
  line(torso,[[-.075,y,.218],[0,y-.018,.242],[.072,y,.218]],.012,trim,5);
 }
 // Recessed fabric creases and hand-stitching across the left shoulder.
 line(torso,[[-.31,.69,.02],[-.38,.57,.05],[-.38,.42,.06]],.009,trim);
 // Rope belt is actually round in 3D, not a flat texture.
 ring(torso,rope,0,.165,0,.375,.295,.030);
 ring(torso,trim,0,.163,0,.377,.297,.007);
 orb(torso,rope,[.08,.15,.307],[.062,.067,.039]);
 for(const x of [.035,.14]){
  line(torso,[[x,.115,.321],[x+.014,-.015,.365],[x+.006,-.11,.354]],.020,rope);
  orb(torso,rope,[x+.006,-.11,.354],[.029,.026,.029]);
 }
 // Worn leather bag on one hip and diagonal shoulder strap.
 line(torso,[[-.31,.715,-.15],[-.06,.41,-.32],[.34,.09,-.21]],.063,leatherDark);
 line(torso,[[-.32,.718,.196],[-.11,.50,.285],[.13,.28,.326],[.42,.055,.20]],.069,leather);
 // Seam accent following the upper edge of the broad strap.
 line(torso,[[-.345,.713,.204],[-.13,.50,.305],[.11,.29,.346],[.405,.064,.216]],.008,rope,14);
 const satchel=new THREE.Group();satchel.position.set(.48,-.025,.015);
 satchel.rotation.y=-.42;torso.add(satchel);
 roundedPanel(satchel,.43,.45,.22,leather,.0,0,-.075);
 roundedPanel(satchel,.45,.19,.034,leatherDark,0,.145,.163);
 seams(satchel,0,-.008,.173,.42,.41);
 line(satchel,[[-.18,.116,.201],[0,.045,.208],[.18,.116,.201]],.008,rope,9);
 orb(satchel,rope,[0,.062,.216],[.027,.025,.012],false);
 // Prominent, poseable arms — the same joints used by collision/animation.
 for(let i=0;i<rig.arms.length;i++){
  const arm=rig.arms[i],sign=i===0?-1:1;
  garment(arm.shoulder,clothes,[[-.42,.158,.155],[-.30,.167,.155],[-.10,.18,.165],[.04,.16,.15]],13,.012);
  ring(arm.shoulder,trim,0,-.419,0,.158,.153,.016);
  garment(arm.elbow,clothes,[[-.23,.129,.132],[-.13,.140,.138],[.04,.15,.146]],12,.009);
  ring(arm.elbow,trim,0,-.236,0,.129,.13,.012);
  orb(arm.elbow,skin,[0,-.325,0],[.10,.132,.105]);
  orb(arm.wrist,skin,[0,-.116,.02],[.12,.15,.115]);
  for(let j=0;j<3;j++)orb(arm.wrist,skin,[sign*.012+(j-1)*.049,-.239,.045],[.033,.066,.043],false);
  if(sign===1){
   // Large sewn repair: part of sleeve, so it bends with the arm.
   const patch=roundedPanel(arm.shoulder,.225,.25,.012,
    material('#9c7850','fabric',39),sign*.168,-.205,.026);
   patch.rotation.y=PI/2.6;
   // visible seams on outside of sleeve, rather than painted cardboard outlines
   line(arm.shoulder,[[.171,-.29,.055],[.182,-.20,.06],[.17,-.12,.052]],.008,trim,7);
  }
 }
 // Baggy separate trouser legs, cloth wrappings and three-dimensional boots.
 for(let i=0;i<rig.legs.length;i++){
  const leg=rig.legs[i],hip=leg.hip,knee=leg.knee,ankle=leg.ankle;
  garment(hip,trousers,[[-.43,.195,.19],[-.34,.223,.229],[-.16,.255,.245],
   [.025,.205,.20]],14,.014);
  garment(knee,trousers,[[-.22,.162,.164],[-.07,.182,.191],[.05,.196,.19]],14,.011);
  ring(knee,trousers,0,-.214,0,.163,.16,.035);
  // Cream leg wraps continue from the trousers into the boot shaft.
  garment(knee,bandage,[[-.425,.108,.111],[-.23,.125,.122]],12,.004);
  for(let j=0;j<4;j++){
   const y=-.245-j*.047;
   line(knee,[[-.112,y,.05],[.04,y-.018,.122],[.112,y+.015,.045]],.013,rope,7);
  }
  // Boot shafts/toe/sole are attached to IK ankle: no drifting shoes.
  orb(ankle,leather,[0,.101,.024],[.165,.212,.157]);
  orb(ankle,leather,[0,-.04,.208],[.183,.109,.281]);
  orb(ankle,sole,[0,-.097,.142],[.192,.048,.347]);
  orb(ankle,leatherDark,[0,.06,.174],[.092,.14,.02],false);
  for(let j=0;j<4;j++){
   const y=.157-j*.047,z=.183+(j/4)*.023;
   line(ankle,[[-.056,y,z],[0,y-.014,z+.016],[.056,y,z]],.009,rope,5);
  }
  ring(ankle,leatherDark,0,.262,.02,.165,.158,.024);
 }
 // Distinctly real, rounded head (front = local +Z), ears and cheeks.
 const head=rig.head;
 orb(head,skin,[0,.152,.019],[.286,.31,.267]);
 for(const side of [-1,1]){
  orb(head,skin,[side*.278,.112,-.008],[.085,.105,.066]);
  orb(head,noseMat,[side*.287,.114,.047],[.033,.054,.023],false);
  orb(head,cheek,[side*.162,.052,.252],[.094,.052,.016],false);
  // eye whites, separate corneas, brown irises, large catchlights
  orb(head,eyesWhite,[side*.121,.221,.242],[.083,.108,.055]);
  orb(head,iris,[side*.122,.214,.294],[.054,.073,.028],false);
  orb(head,black,[side*.121,.209,.316],[.036,.052,.019],false);
  orb(head,sparkle,[side*.137,.236,.332],[.018,.025,.010],false);
  line(head,[[side*.057,.353,.263],[side*.121,.378,.282],
   [side*.191,.341,.260]],.023,hair,7);
 }
 orb(head,noseMat,[0,.09,.306],[.061,.047,.067]);
 line(head,[[-.103,-.004,.267],[-.042,-.039,.302],
  [.036,-.039,.300],[.112,-.002,.262]],.009,smiling);
 for(const side of [-1,1]){
  if(player||options.role==='guardian'){
   for(let i=0;i<7;i++){
    const dx=(i%4)*.027,dy=Math.floor(i/4)*.027;
    orb(head,freckle,[side*(.113+dx),.073+dy,.277-.020*(i%3)],
     [.008,.008,.003],false);
   }
  }
 }
 // Hair is a shell plus curved, tapering sculpted clumps, never a sprite.
 orb(head,hair,[0,.295,-.063],[.330,.297,.296],false);
 const locks=player?19:11;
 for(let i=0;i<locks;i++){
  const a=(i+.45)/locks*TAU,xx=Math.sin(a),zz=Math.cos(a);
  const back=zz<.55,sy=back?.325:.465;
  const x=.286*xx,z=.25*zz-.067;
  taperedLock(head,[[x*.92,sy,z],[x*1.03,sy-.095,z+.006],
   [x*1.17,sy-.20,z+.025],[x*1.24,sy-.27+(i%3)*.025,z+.029]],
   .064+(i%3)*.009,i%4===0?hairLit:hair);
 }
 // Slightly asymmetric loose fringe dangling under the cap.
 for(let i=0;i<6;i++){
  const x=-.24+i*.088;
  taperedLock(head,[[x-.07,.435,.192],[x-.045,.371,.259],
   [x+.035,.305,.289],[x+.064,.273+(i%3)*.027,.286]],
   .062,i%3===0?hairLit:hair);
 }
 // Soft folded beanie with slouching crown and dimensional fabric brim.
 const hasHat=player||options.role==='guardian'||seed%3!==1;
 if(hasHat){
  orb(head,cap,[.035,.515,-.064],[.355,.205,.319]);
  orb(head,cap,[.103,.649,-.145],[.315,.159,.279]);
  orb(head,capShade,[.114,.593,-.137],[.327,.061,.295]);
  ring(head,capShade,.006,.436,-.044,.351,.302,.062);
  ring(head,cap,.006,.458,-.045,.361,.306,.043);
  // hand-sewn fold (muted, realistic, not a thick cartoon outline)
  line(head,[[-.30,.515,.08],[-.24,.625,.19],[-.08,.677,.236],
   [.12,.652,.21],[.28,.565,.04]],.012,capShade,17);
 }
 const finish=applyToonFinish(THREE,character,{outlines:options.outlines!==false,
  lowPower:options.lowPower===true});
 character.userData.characterArt={
  installed:true,mode:'fully-volumetric-3d',reference:'cel-shaded-adventurer',
  shading:finish.style,shadeBands:finish.shadeBands,outlineMeshes:finish.outlineMeshes,
  role:options.role||'npc',hat:hasHat,articulated:true,
  noCardboardOnCharacters:true,skinnedByExistingRig:true
 };
 return character.userData.characterArt;
}
