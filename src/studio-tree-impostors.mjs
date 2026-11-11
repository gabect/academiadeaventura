/**
 * Mountain Studio v0.60 — licensed rendered whole-tree PNG impostors.
 * Each frame depicts complete trunk, branches and foliage; NO fake Canvas leaves.
 * A vertically upright, camera-facing alpha-test quad costs only two triangles.
 * Source art: klamtii, https://klamtii.itch.io/tree-sprites (modification allowed).
 */
const TILE_W=512,TILE_H=512,COLS=3,ROWS=2;
function spriteGeometry(THREE,family,index){
 const geometry=new THREE.BufferGeometry();
 const col=index%COLS,row=Math.floor(index/COLS),pad=2;
 const u0=(col*TILE_W+pad)/(COLS*TILE_W);
 const u1=((col+1)*TILE_W-pad)/(COLS*TILE_W);
 const v0=1-((row+1)*TILE_H-pad)/(ROWS*TILE_H);
 const v1=1-(row*TILE_H+pad)/(ROWS*TILE_H);
 // All PNGs are aligned to a common soil baseline in the atlas.
 const width=family==='pine'?[3.25,3.49,3.20,3.42,3.52,3.69][index]:
  [4.52,4.30,4.78,4.95,4.37][index];
 const height=family==='pine'?[5.37,5.22,5.43,5.45,5.35,5.56][index]:
  [5.30,5.35,5.15,5.30,5.46][index];
 geometry.setAttribute('position',new THREE.Float32BufferAttribute([
  -width/2,-2.40,0, width/2,-2.40,0,
  -width/2,height-2.40,0,width/2,height-2.40,0
 ],3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute([
  u0,v0,u1,v0,u0,v1,u1,v1
 ],2));
 geometry.setIndex([0,1,2,1,3,2]);
 geometry.computeVertexNormals();
 geometry.computeBoundingSphere();
 geometry.userData={family,variant:index,impostor:true,quadCount:1,
  displayWidth:width,displayHeight:height,foliageStyle:'rendered-tree-png'};
 return geometry;
}
function createBillboardMaterial(THREE,playerPosition){
 const material=new THREE.MeshBasicMaterial({
  color:'#ffffff',side:THREE.DoubleSide,alphaTest:.28,
  alphaToCoverage:true,transparent:false,depthWrite:true,
  toneMapped:true,polygonOffset:false,fog:true
 });
 material.visible=false; // A late PNG must never appear as an opaque card.
 material.onBeforeCompile=shader=>{
  shader.uniforms.academyTreePlayer={value:playerPosition};
  shader.vertexShader='varying vec3 academyTreeOriginWorld;\\n'+shader.vertexShader;
  shader.fragmentShader='uniform vec3 academyTreePlayer;\\nvarying vec3 academyTreeOriginWorld;\\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',
   'diffuseColor.a*=smoothstep(1.10,2.90,distance(academyTreeOriginWorld.xz,academyTreePlayer.xz));\\n#include <alphatest_fragment>');
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',[
   '// GPU upright camera-facing full-tree sprite; also works with instancing.',
   'vec4 root=vec4(0.,0.,0.,1.);',
   'float sx=length(modelViewMatrix[0].xyz),sy=length(modelViewMatrix[1].xyz);',
   '#ifdef USE_INSTANCING',
   'root=instanceMatrix*root;',
   'sx*=length(instanceMatrix[0].xyz);sy*=length(instanceMatrix[1].xyz);',
   '#endif',
   'vec4 origin=modelViewMatrix*root;',
   'academyTreeOriginWorld=(modelMatrix*root).xyz;',
   'vec3 up=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);',
   'vec3 viewPoint=origin.xyz+vec3(position.x*sx,0.,0.)+up*(position.y*sy);',
   'vec4 mvPosition=vec4(viewPoint,1.);', // Fog and clipping chunks read mvPosition.
   'gl_Position=projectionMatrix*mvPosition;'
  ].join('\n'));
 };
 material.customProgramCacheKey=()=> 'academy-upright-real-tree-impostor-v2';
 return material;
}
export function createStudioTreeImpostors(THREE,options={}){
 const root=options.root||'./assets/studio_hd/trees/';
 const info={version:'0.60.0',style:'licensed-rendered-tree-billboards',
  pine:6,broadleaf:5,quadsPerTree:1,paintedWholeTree:true,
  source:'klamtii.itch.io/tree-sprites',loaded:0,errors:[]};
 const loader=new THREE.TextureLoader();
 const playerPosition=new THREE.Vector3(0,-1000,0);
 const material=family=>{
  const mat=createBillboardMaterial(THREE,playerPosition);
  loader.load(root+'tree-'+family+'-atlas.png',texture=>{
   texture.colorSpace=THREE.SRGBColorSpace;
   texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
   texture.minFilter=THREE.LinearMipmapLinearFilter;
   texture.magFilter=THREE.LinearFilter;
   texture.generateMipmaps=true;texture.anisotropy=4;texture.needsUpdate=true;
   mat.map=texture;mat.visible=true;mat.needsUpdate=true;info.loaded++;
  },undefined,error=>{
   info.errors.push('Missing '+family+' PNG atlas: '+(error?.message||'network error'));
   // Do not resurrect the v0.59 procedural Scribble Tree fallback.
  });
  return mat;
 };
 return {
  pineVariants:Array.from({length:6},(_,i)=>spriteGeometry(THREE,'pine',i)),
  broadleafVariants:Array.from({length:5},(_,i)=>spriteGeometry(THREE,'broadleaf',i)),
  pineMaterial:material('pine'),broadleafMaterial:material('broadleaf'),info,
  setPlayerPosition(position){playerPosition.copy(position);}
 };
}
