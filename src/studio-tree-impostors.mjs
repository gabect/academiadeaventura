/**
 * Mountain Studio v0.60: licensed full-tree transparent PNG impostors.
 * The complete trunk, limbs and canopy are painted together in each image.
 * One vertically constrained camera-facing GPU quad per tree, not crossed Xs.
 * PNGs are baked deterministically from this module by the CI exporter.
 */
const TILE_W=512,TILE_H=512,COLS=3,ROWS=2,COUNTS={pine:6,broadleaf:5};
function rng(seed){let x=seed>>>0;return ()=>{x=(x+0x6D2B79F5)|0;
 let t=Math.imul(x^(x>>>15),1|x);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
const between=(r,a,b)=>a+(b-a)*r(),mix=(a,b,t)=>a+(b-a)*t;
function strokeWood(c,points,width,base='#887b60'){
 c.save();c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(...points[0]);
 for(let i=1;i<points.length;i++)c.lineTo(...points[i]);
 c.strokeStyle='rgba(38,42,28,.38)';c.lineWidth=width+3;c.stroke();
 const grad=c.createLinearGradient(points[0][0]-width,0,points[0][0]+width,0);
 grad.addColorStop(0,'#5f5d4a');grad.addColorStop(.53,base);grad.addColorStop(1,'#c5b48e');
 c.strokeStyle=grad;c.lineWidth=width;c.stroke();
 c.strokeStyle='rgba(238,215,166,.33)';c.lineWidth=Math.max(.7,width*.10);
 c.translate(-width*.20,0);c.stroke();c.restore();
}
function crownBlob(c,r,cx,cy,rx,ry,pine,palette){
 c.save();const pts=[];
 for(let k=0;k<25;k++){const a=k*Math.PI*2/25,v=between(r,.84,1.14);
  pts.push([cx+Math.cos(a)*rx*v,cy+Math.sin(a)*ry*v]);}
 c.beginPath();c.moveTo((pts[0][0]+pts[24][0])/2,(pts[0][1]+pts[24][1])/2);
 for(let i=0;i<25;i++){const p=pts[i],q=pts[(i+1)%25];
  c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}
 c.closePath();
 const gr=c.createRadialGradient(cx-rx*.2,cy-ry*.37,4,cx,cy,Math.max(rx,ry)*1.17);
 gr.addColorStop(0,palette[2]);gr.addColorStop(.43,palette[1]);gr.addColorStop(1,palette[0]);
 c.fillStyle=gr;c.fill();c.clip();
 const count=Math.round(rx*ry/(pine?14:21));
 for(let i=0;i<count;i++){
  const a=r()*6.28318,d=Math.sqrt(r())*.99;
  const x=cx+Math.cos(a)*d*rx,y=cy+Math.sin(a)*d*ry;
  const color=palette[r()>.88?3:r()>.27?2:r()>.2?1:0];
  c.save();c.translate(x,y);c.rotate(between(r,-1.5,1.5));
  if(pine){
   c.strokeStyle=color;c.lineWidth=between(r,1.0,2.6);c.lineCap='round';
   c.beginPath();c.moveTo(-between(r,1,7),between(r,0,5));
   c.lineTo(between(r,1,7),-between(r,4,13));c.stroke();
  }else{
   const length=between(r,4,10),wide=between(r,2.7,6.5);
   c.fillStyle=color;c.beginPath();c.moveTo(0,-length);
   c.quadraticCurveTo(wide,-length*.36,0,0);
   c.quadraticCurveTo(-wide,-length*.36,0,-length);c.fill();
  }c.restore();
 }
 // Luminous painterly patches are clipped to the natural crown silhouette.
 c.globalAlpha=.13;
 for(let i=0;i<19;i++){
  const x=cx+between(r,-rx,rx),y=cy+between(r,-ry,ry);
  c.strokeStyle=r()>.5?'#e1e3ab':'#214331';c.lineWidth=between(r,2,8);
  c.beginPath();c.moveTo(x,y);c.lineTo(x+between(r,-9,10),y-between(r,2,13));c.stroke();
 }c.restore();
}
function paintBroadleaf(c,index){
 const r=rng(0xBEA510+index*1229);
 const palette=index===1?['#2b5038','#4d7044','#779257','#a6b877']:
  index===3?['#304932','#507244','#77904b','#b7b276']:
  ['#264931','#426a3d','#688a4c','#b5c181'];
 const presets=[
  [[69,190,61,52],[117,132,70,65],[201,122,74,61],[257,190,51,53],[167,203,95,63],[95,233,54,46]],
  [[95,222,55,58],[130,146,54,69],[183,103,61,69],[225,162,57,65],[186,228,67,53]],
  [[58,209,59,56],[104,159,67,63],[176,113,76,69],[252,166,60,56],[208,220,74,58],[133,222,81,57]],
  [[75,169,61,58],[140,105,67,64],[225,113,73,64],[253,176,52,52],[183,188,85,66]],
  [[77,231,62,55],[145,171,77,66],[225,183,70,61],[180,120,54,55],[130,253,75,51]]
 ];
 const groups=presets[index],wind=[-8,11,4,-14,15][index],lean=[-11,11,6,-14,12][index];
 const xBase=160+lean*.25,xFork=156+lean,split=310+between(r,-8,11);
 // Back canopy and growing trunk are one illustration, not independent meshes.
 for(const [x,y,rx,ry] of groups)crownBlob(c,r,x+wind*.4,y+8,rx*.97,ry*.97,false,palette);
 strokeWood(c,[[xBase,506],[160+lean*.14,449],[157+lean*.4,373],[xFork,split]],
  between(r,21,27));
 const forks=[
  [xFork,split,67+wind*.3,184,12],[xFork,split,247+wind*.2,176,13],
  [xFork,split,166+wind*.3,110,9],[xFork,split,119+wind*.2,132,8],
  [xFork,split,216+wind*.2,232,7]
 ];
 for(const [x,y,tx,ty,w] of forks){
  const mx=mix(x,tx,.48)+between(r,-10,10),my=mix(y,ty,.50)-between(r,3,19);
  strokeWood(c,[[x,y],[mx,my],[tx,ty]],w,'#817761');
  for(let j=0;j<3;j++){
   const t=between(r,.47,.88),ax=mix(mx,tx,t),ay=mix(my,ty,t);
   strokeWood(c,[[ax,ay],[ax+between(r,-37,37),ay-between(r,12,45)]],
    between(r,1.3,2.9),'#78715e');
  }
 }
 for(let j=0;j<groups.length;j++){
  const [x,y,rx,ry]=groups[j];
  crownBlob(c,r,x+wind*.3+between(r,-11,11),y+between(r,-10,13),
   rx*between(r,.72,.80),ry*between(r,.70,.83),false,palette);
  if(j%2===0)crownBlob(c,r,x+between(r,-22,22),y+between(r,14,34),
   rx*.43,ry*.43,false,palette);
 }
 strokeWood(c,[[xBase-2,498],[xBase-15,508]],3,'#786a51');
 strokeWood(c,[[xBase+4,499],[xBase+19,508]],3,'#81735c');
}
function paintPine(c,index){
 const r=rng(0xA315C4+index*971);
 const palette=index%3===0?['#204639','#336246','#598655','#a1b581']:
  index%3===1?['#254c3a','#406c4a','#74945e','#b0c088']:
  ['#263f3c','#3f6555','#688974','#a5b79a'];
 const lean=[-9,9,3,-13,12,-5][index],top=29+between(r,-7,9),base=405+between(r,-20,9);
 const trunkX=y=>160+lean*(1-(y-top)/(510-top));
 strokeWood(c,[[160,508],[trunkX(417),417],[trunkX(289),289],
  [trunkX(165),165],[trunkX(top+12),top+12]],between(r,13,20),'#77735e');
 const levels=15+index%3;
 for(let j=levels-1;j>=0;j--){
  const t=j/(levels-1),y=mix(top+31,base,t),centre=trunkX(y);
  const reach=(20+between(r,82,108)*Math.pow(t,.85))*between(r,.74,1.09);
  const asym=Math.sin(j*2.3+index)*14;
  for(const side of [-1,1]){
   const endX=centre+side*reach*(side===1?.96:1.05)+asym;
   const tipY=y+between(r,-14,13);
   strokeWood(c,[[centre,y],[mix(centre,endX,.51),y+between(r,1,7)],
    [endX,tipY]],between(r,2,4),'#706f59');
   for(let n=0;n<4;n++){
    const f=(n+.7)/4.7,xx=mix(centre,endX,f),yy=mix(y,tipY,f)-between(r,4,13);
    const w=between(r,15,26)*(.67+t*.56);
    const h=between(r,15,27)*(.66+t*.58);
    crownBlob(c,r,xx,yy,w,h,true,palette);
   }
  }
  crownBlob(c,r,centre+asym*.10,y-between(r,2,12),
   between(r,22,36)*(.75+t*.43),between(r,20,33),true,palette);
 }
 for(let j=0;j<5;j++)crownBlob(c,r,trunkX(top+15+j*10),top+15+j*10,
  9+j*2.7,16+j*3,true,palette);
}
export function paintStudioTreeAtlasCanvas(family){
 if(!COUNTS[family])throw Error('Unknown tree family '+family);
 const canvas=document.createElement('canvas');
 canvas.width=TILE_W*COLS;canvas.height=TILE_H*ROWS;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)throw Error('2D canvas unavailable');
 for(let i=0;i<COUNTS[family];i++){
  ctx.save();ctx.translate((i%COLS)*TILE_W+96,Math.floor(i/COLS)*TILE_H);
  ctx.beginPath();ctx.rect(7,5,TILE_W-14,TILE_H-10);ctx.clip();
  if(family==='pine')paintPine(ctx,i);else paintBroadleaf(ctx,i);
  ctx.restore();
 }
 return canvas;
}
function makeCard(THREE,family,index){
 const g=new THREE.BufferGeometry(),col=index%COLS,row=Math.floor(index/COLS);
 const uPad=2/(TILE_W*COLS),vPad=2/(TILE_H*ROWS);
 const u0=col/COLS+uPad,u1=(col+1)/COLS-uPad;
 const v0=1-(row+1)/ROWS+vPad,v1=1-row/ROWS-vPad;
 const width=family==='pine'?[3.05,3.34,3.18,3.35,3.07,3.28][index]:
  [3.78,3.65,3.87,3.51,3.54][index];
 const height=family==='pine'?[4.95,4.72,5.15,4.86,4.88,5.00][index]:
  [4.65,4.77,4.73,4.55,4.48][index];
 g.setAttribute('position',new THREE.Float32BufferAttribute([
  -width*.5,-2.40,0,width*.5,-2.40,0,
  -width*.5,height-2.40,0,width*.5,height-2.40,0],3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute([u0,v0,u1,v0,u0,v1,u1,v1],2));
 g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();g.computeBoundingSphere();
 g.userData={family,variant:index,impostor:true,quadCount:1,
  displayWidth:width,displayHeight:height,foliageStyle:'licensed-botanical-png'};
 return g;
}
function billboard(THREE){
 const mat=new THREE.MeshBasicMaterial({
  color:0xffffff,side:THREE.DoubleSide,alphaTest:.21,alphaToCoverage:true,
  transparent:false,depthWrite:true,toneMapped:true
 });
 mat.visible=false;
 mat.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',[
   '// Camera-facing upright billboard, supports InstancedMesh and Mesh.',
   'vec4 root=vec4(0.,0.,0.,1.);',
   'float sx=length(modelViewMatrix[0].xyz),sy=length(modelViewMatrix[1].xyz);',
   '#ifdef USE_INSTANCING',
   'root=instanceMatrix*root;',
   'sx*=length(instanceMatrix[0].xyz);sy*=length(instanceMatrix[1].xyz);',
   '#endif',
   'vec4 origin=modelViewMatrix*root;',
   'vec3 up=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);',
   'vec3 viewPoint=origin.xyz+vec3(position.x*sx,0.,0.)+up*(position.y*sy);',
   'vec4 mvPosition=vec4(viewPoint,1.);',
   'gl_Position=projectionMatrix*mvPosition;'
  ].join('\n'));
 };
 mat.customProgramCacheKey=()=> 'academy-upright-full-tree-impostor-v2';
 return mat;
}
export function createStudioTreeImpostors(THREE,options={}){
 const root=options.root||'./assets/studio_hd/trees/';
 const info={version:'0.60.0',style:'licensed-whole-tree-billboards',
  pine:6,broadleaf:5,quadsPerTree:1,paintedWholeTree:true,licensedRealAssets:true,loaded:0,errors:[]};
 const loader=new THREE.TextureLoader();
 function material(family){
  const mat=billboard(THREE);
  function assign(tex){
   tex.colorSpace=THREE.SRGBColorSpace;
   tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
   tex.minFilter=THREE.LinearMipmapLinearFilter;
   tex.magFilter=THREE.LinearFilter;tex.generateMipmaps=true;tex.anisotropy=4;
   mat.map=tex;mat.visible=true;mat.needsUpdate=true;info.loaded++;
  }
  loader.load(root+'tree-'+family+'-atlas.png',assign,undefined,error=>{
   info.errors.push(family+': '+(error?.message||'PNG load failure'));
   assign(new THREE.CanvasTexture(paintStudioTreeAtlasCanvas(family)));
  });
  return mat;
 }
 return {
  pineVariants:Array.from({length:6},(_,i)=>makeCard(THREE,'pine',i)),
  broadleafVariants:Array.from({length:5},(_,i)=>makeCard(THREE,'broadleaf',i)),
  pineMaterial:material('pine'),
  broadleafMaterial:material('broadleaf'),info
 };
}
