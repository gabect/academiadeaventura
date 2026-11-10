/** Semi-illustrated, deterministic forest materials for the opt-in Studio view.
 * Three small reusable CanvasTextures: no external URLs, no generated
 * canvases per tree, no collision or terrain changes.
 */
export function createStudioTreeMaterials(THREE){
 const makeCanvas=(size=256)=>{
  const c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Canvas2D unavailable for Studio forest materials');
  return {canvas:c,ctx};
 };
 function rng(seed){
  let x=seed>>>0;
  return ()=>{
   x=(x+0x6D2B79F5)|0;
   let z=Math.imul(x^(x>>>15),1|x);
   z^=z+Math.imul(z^(z>>>7),61|z);
   return ((z^(z>>>14))>>>0)/4294967296;
  };
 }
 const texture=(c)=>{
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.anisotropy=4;t.generateMipmaps=true;t.needsUpdate=true;
  return t;
 };
 function bark(){
  const {canvas,ctx}=makeCanvas(),r=rng(42658);
  ctx.fillStyle='#cecbba';ctx.fillRect(0,0,256,256);
  // Painted warm/cool vertical bark bands with subtle breaks, not sharp noise.
  for(let i=0;i<165;i++){
   const x=r()*256,w=.6+r()*4.3;
   const dark=r()>.34;
   ctx.strokeStyle=dark?'rgba(52,43,36,.20)':'rgba(252,244,218,.30)';
   ctx.lineWidth=w;ctx.lineCap='round';
   const y0=-25+r()*245;
   ctx.beginPath();ctx.moveTo(x,y0);
   ctx.bezierCurveTo(x-4+r()*8,y0+40,x-6+r()*12,y0+98,x-4+r()*8,y0+172);
   ctx.stroke();
  }
  for(let i=0;i<88;i++){
   const x=r()*256,y=r()*256,length=7+r()*36;
   ctx.strokeStyle=r()>.45?'rgba(54,47,35,.19)':'rgba(252,245,223,.29)';
   ctx.lineWidth=.6+r()*1.25;ctx.beginPath();ctx.moveTo(x,y);
   ctx.quadraticCurveTo(x+(r()-.5)*5,y+length*.52,x+(r()-.5)*7,y+length);
   ctx.stroke();
  }
  for(let i=0;i<18;i++){
   const x=r()*256,y=r()*256;
   ctx.fillStyle='rgba(103,124,63,.15)';
   ctx.beginPath();ctx.ellipse(x,y,1+r()*4,4+r()*9,r()*.4,0,Math.PI*2);ctx.fill();
  }
  return texture(canvas);
 }
 function leaf(broadleaf){
  const {canvas,ctx}=makeCanvas(),r=rng(broadleaf?0xBEE4:0xF1A0);
  const grad=ctx.createLinearGradient(0,0,256,256);
  if(broadleaf){
   grad.addColorStop(0,'#c3d1b2');grad.addColorStop(.40,'#e3e7cb');
   grad.addColorStop(.77,'#bdcaaa');grad.addColorStop(1,'#e4e4c6');
  }else{
   grad.addColorStop(0,'#c1cfb5');grad.addColorStop(.45,'#dbe5d4');
   grad.addColorStop(1,'#b0c8ab');
  }
  ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);
  const lines=broadleaf?28:65;
  for(let i=0;i<lines;i++){
   const x=r()*256,y=r()*256;
   const size=(broadleaf?3:2)+r()*(broadleaf?36:50);
   ctx.strokeStyle=r()>.47?'rgba(48,83,47,.13)':'rgba(250,251,210,.28)';
   ctx.lineWidth=broadleaf?.65+r()*1.25:.45+r()*.8;
   ctx.beginPath();ctx.moveTo(x,y);
   ctx.quadraticCurveTo(x+(r()-.5)*8,y-size*.55,x+(r()-.5)*13,y-size);
   ctx.stroke();
  }
  // Each local UV leaf has a painted midrib and oblique venation.
  if(broadleaf){
   ctx.strokeStyle='rgba(246,247,212,.60)';ctx.lineWidth=2.6;
   ctx.beginPath();ctx.moveTo(128,255);ctx.quadraticCurveTo(122,131,128,2);ctx.stroke();
   for(const side of [-1,1])for(let k=0;k<7;k++){
    const y=22+k*29,extent=34*(.60+.40*Math.sin(Math.PI*y/256));
    ctx.strokeStyle='rgba(65,105,53,.20)';ctx.lineWidth=1.4;
    ctx.beginPath();ctx.moveTo(128,y+14);
    ctx.quadraticCurveTo(128+side*extent*.6,y-7,128+side*extent,y-16);ctx.stroke();
   }
  }else{
   for(let i=0;i<7;i++){
    const x=43+i*28;
    ctx.strokeStyle='rgba(247,253,218,.32)';ctx.lineWidth=1.15;
    ctx.beginPath();ctx.moveTo(x,256);ctx.lineTo(x+4*Math.sin(i*2),0);ctx.stroke();
   }
  }
  return texture(canvas);
 }
 const barkMap=bark(),pineMap=leaf(false),broadleafMap=leaf(true);
 const crown=new THREE.MeshStandardMaterial({
  color:'#f3f3e8',vertexColors:true,side:THREE.DoubleSide,
  roughness:.94,metalness:0
 });
 crown.onBeforeCompile=shader=>{
  shader.uniforms.studioTreeBark={value:barkMap};
  shader.uniforms.studioTreePine={value:pineMap};
  shader.uniforms.studioTreeBroadleaf={value:broadleafMap};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',
   ['#include <common>','attribute vec2 studioPaintUV;',
    'attribute float studioSurfaceType;','varying vec2 vStudioPaintUV;',
    'varying float vStudioSurfaceType;'].join('\n'));
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
   ['#include <begin_vertex>',
    'vStudioPaintUV=studioPaintUV;','vStudioSurfaceType=studioSurfaceType;'].join('\n'));
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
   ['#include <common>','varying vec2 vStudioPaintUV;',
    'varying float vStudioSurfaceType;',
    'uniform sampler2D studioTreeBark;','uniform sampler2D studioTreePine;',
    'uniform sampler2D studioTreeBroadleaf;'].join('\n'));
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',
   ['#include <color_fragment>',
    'vec3 studioPaintBark=texture2D(studioTreeBark,vStudioPaintUV).rgb;',
    'vec3 studioPaintPine=texture2D(studioTreePine,vStudioPaintUV).rgb;',
    'vec3 studioPaintBroad=texture2D(studioTreeBroadleaf,vStudioPaintUV).rgb;',
    'float studioWood=1.0-step(.5,vStudioSurfaceType);',
    'float studioBroad=step(1.5,vStudioSurfaceType);',
    'vec3 studioLeaves=mix(studioPaintPine,studioPaintBroad,studioBroad);',
    'vec3 studioPaint=mix(studioLeaves,studioPaintBark,studioWood);',
    'diffuseColor.rgb*=mix(vec3(.82),vec3(1.30),studioPaint);'
   ].join('\n'));
 };
 crown.customProgramCacheKey=()=> 'studio-painted-forest-crowns-v1';
 const trunk=new THREE.MeshStandardMaterial({
  color:'#79614a',map:barkMap,roughness:.96,metalness:0
 });
 return {crown,trunk,stats:{maps:3,size:256,painterly:true},textures:{barkMap,pineMap,broadleafMap}};
}