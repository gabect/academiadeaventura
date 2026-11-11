/**
 * Continuous painterly ground treatment sampled from the user's handmade
 * crayon terrain, rock, path and water artwork. The source frames are cropped
 * out of the atlas; UV sampling never touches the brown cardboard borders.
 * Visual-only: terrain mesh, physics, placement and shorelines are unchanged.
 */
export function installCrayonTerrain({THREE,terrainMaterial,trailMat,waterMeshes,
 waterCoverageAt,upperRiverCoverageAt,worldHalfSize=83}) {
 const atlas=new THREE.TextureLoader().load(
  new URL('./assets/crayon-terrain-atlas.webp',import.meta.url).href);
 atlas.colorSpace=THREE.SRGBColorSpace;
 atlas.wrapS=atlas.wrapT=THREE.ClampToEdgeWrapping;
 // Cell edges cannot bleed into a neighboring atlas quadrant at low LOD.
 atlas.generateMipmaps=false;
 atlas.minFilter=THREE.LinearFilter;
 atlas.magFilter=THREE.LinearFilter;
 atlas.anisotropy=1;
 const atlasUniform={value:atlas};
 // Separate clean green grass texture provided by the user. The original
 // framed cardboard atlas remains exclusively for dirt, stone and water.
 const grass=new THREE.TextureLoader().load(
  new URL('./assets/crayon-grass-seamless.webp',import.meta.url).href);
 grass.colorSpace=THREE.SRGBColorSpace;
 grass.wrapS=grass.wrapT=THREE.RepeatWrapping;
 grass.minFilter=THREE.LinearMipmapLinearFilter;
 grass.magFilter=THREE.LinearFilter;
 grass.anisotropy=4;
 const grassUniform={value:grass};
 // Build a world-aligned shoreline mask from the game's actual lake/river
 // contours. This never creates square tiles or changes physical terrain.
 const shoreSize=512,worldMin=-worldHalfSize,worldSpan=worldHalfSize*2;
 const shorePixels=new Uint8Array(shoreSize*shoreSize*4);
 const smooth=(a,b,v)=>{
  const t=Math.max(0,Math.min(1,(v-a)/(b-a)));
  return t*t*(3-2*t);
 };
 const coverage=(x,z)=>{
  const low=waterCoverageAt?.(x,z)??-100;
  const high=upperRiverCoverageAt?.(x,z)??-100;
  return Math.max(low,high);
 };
 let shorelinePixels=0;
 for(let z=0;z<shoreSize;z++)for(let x=0;x<shoreSize;x++){
  const wx=worldMin+(x+.5)*worldSpan/shoreSize;
  const wz=worldMin+(z+.5)*worldSpan/shoreSize;
  const c=coverage(wx,wz);
  let sand=0,edge=0,wet=0;
  if(c>-.6&&c<.4){
   // Convert the normalized shoreline coverage to actual world distance.
   const step=.22;
   const gx=(coverage(wx+step,wz)-coverage(wx-step,wz))/(2*step);
   const gz=(coverage(wx,wz+step)-coverage(wx,wz-step))/(2*step);
   const d=c/Math.max(.001,Math.hypot(gx,gz));
   const irregular=.13*Math.sin(wx*3.17+Math.cos(wz*2.41))
       +.07*Math.sin(wz*4.23-wx*1.71);
   const ds=d+irregular;
   sand=smooth(-1.75,-1.02,ds)*(1-smooth(-.05,.12,ds));
   edge=smooth(-1.95,-1.58,ds)*(1-smooth(-1.30,-1.03,ds));
   wet=smooth(-.44,-.08,ds)*(1-smooth(.03,.28,ds));
   if(sand>.1)shorelinePixels++;
  }
  const i=(z*shoreSize+x)*4;
  shorePixels[i]=Math.round(Math.max(0,Math.min(1,sand))*255);
  shorePixels[i+1]=Math.round(Math.max(0,Math.min(1,edge))*255);
  shorePixels[i+2]=Math.round(Math.max(0,Math.min(1,wet))*255);
  shorePixels[i+3]=255;
 }
 const shoreMap=new THREE.DataTexture(shorePixels,shoreSize,shoreSize,THREE.RGBAFormat);
 shoreMap.wrapS=shoreMap.wrapT=THREE.ClampToEdgeWrapping;
 shoreMap.magFilter=shoreMap.minFilter=THREE.LinearFilter;
 shoreMap.generateMipmaps=false;
 shoreMap.needsUpdate=true;
 const shoreUniform={value:shoreMap};
 const shoreBoundsUniform={value:new THREE.Vector4(worldMin,worldMin,
  1/worldSpan,1/worldSpan)};
 // Four unframed, premade periodic paintings: grass, soil, stone and water.
 // Each cell is a quarter of the texture (top-left grass, top-right soil,
 // bottom-left stone, bottom-right water). Clamp taps to prevent atlas bleed.
 const shared=String.raw`
 uniform sampler2D crayonAtlas;
 uniform sampler2D crayonGrass;
 uniform sampler2D crayonShoreMap;
 uniform vec4 crayonShoreBounds;
 vec3 crayonTile(vec2 worldUV,vec2 cell){
   // Mirrored repeat joins the cropped artwork continuously at both axes.
   vec2 local=1.0-abs(fract(worldUV*.5)*2.0-1.0);
   vec2 uv=cell*.5+(.013+local*.474);
   return texture2D(crayonAtlas,uv).rgb;
 }
 `;
 function decorate(material,kind){
  if(!material||material.userData.crayonTerrainApplied)return;
  material.userData.crayonTerrainApplied=true;
  const old=material.onBeforeCompile?.bind(material);
  const oldKey=material.customProgramCacheKey.bind(material);
  material.onBeforeCompile=(shader,renderer)=>{
   if(old)old(shader,renderer);
   shader.uniforms.crayonAtlas=atlasUniform;
   shader.uniforms.crayonGrass=grassUniform;
   shader.uniforms.crayonShoreMap=shoreUniform;
   shader.uniforms.crayonShoreBounds=shoreBoundsUniform;
   shader.fragmentShader=shader.fragmentShader.replace(
    '#include <common>','#include <common>\n'+shared);
   if(kind==='terrain'){
    // The base mountain renderer already supplies accurate normal weights,
    // world coordinates and mountain grass/rock blend via vAcademyCover.
    const overlay=String.raw`
      // Use the user's clean seamless grass as the actual ground color.
      // Compute weights locally: the old layer-scoped weights variable is
      // not guaranteed to remain in scope after shader patch composition.
      vec2 grassUV=vAcademyRockWorld.xz*.22;
      vec3 handmadeGrass=texture2D(crayonGrass,grassUV).rgb;
      vec3 handmadeStoneTop=crayonTile(vAcademyRockWorld.xz*.19,vec2(0.0,0.0));
      vec3 handmadeStoneFront=crayonTile(vAcademyRockWorld.xy*.19,vec2(0.0,0.0));
      vec3 handmadeStoneSide=crayonTile(vAcademyRockWorld.zy*.19,vec2(0.0,0.0));
      vec3 crayonNormal=normalize(cross(dFdx(vAcademyRockWorld),dFdy(vAcademyRockWorld)));
      vec3 crayonWeights=pow(abs(crayonNormal),vec3(4.0));
      crayonWeights/=max(dot(crayonWeights,vec3(1.0)),0.0001);
      vec3 handmadeStone=handmadeStoneFront*crayonWeights.z+
        handmadeStoneSide*crayonWeights.x+handmadeStoneTop*crayonWeights.y;
      float meadow=smoothstep(.12,.88,clamp(vAcademyCover,0.0,1.0));
      vec3 handmadeGround=mix(handmadeStone,handmadeGrass,meadow);
      // Sample the continuous shoreline following the original water shapes.
      vec2 shoreUV=(vAcademyRockWorld.xz-crayonShoreBounds.xy)
        *crayonShoreBounds.zw;
      vec3 shoreMasks=texture2D(crayonShoreMap,shoreUV).rgb;
      vec3 earthGrain=crayonTile(vAcademyRockWorld.xz*.28,vec2(1.0,1.0));
      // Sandy, hand-painted rim uses the same crayon pigment marks as the
      // uploaded bank tiles; dark grass trim separates grass from the sand.
      vec3 sandPaint=mix(earthGrain,vec3(.97,.78,.51),.68);
      float shoreFacing=smoothstep(.22,.68,crayonWeights.y);
      handmadeGround=mix(handmadeGround,sandPaint,
        shoreMasks.r*shoreFacing*meadow);
      handmadeGround=mix(handmadeGround,vec3(.30,.35,.12),
        shoreMasks.g*.63*shoreFacing*meadow);
      handmadeGround=mix(handmadeGround,sandPaint*.82,
        shoreMasks.b*.35*shoreFacing*meadow);
      diffuseColor.rgb=mix(diffuseColor.rgb,handmadeGround,.98);
    `;
    shader.fragmentShader=shader.fragmentShader.replace(
     '#include <roughnessmap_fragment>',overlay+'\n#include <roughnessmap_fragment>');
   }else if(kind==='path'){
    const overlay=String.raw`
      vec3 handmadeSoil=crayonTile(vStudioTrailWorld.xz*.24,vec2(1.0,1.0));
      // Organic, dark-pencil transition at the paper-dirt footpath edges.
      float pathEdge=smoothstep(.73,.91,abs(vStudioLateral))
        *(1.0-smoothstep(.91,1.0,abs(vStudioLateral)));
      handmadeSoil=mix(handmadeSoil,vec3(.30,.28,.13),pathEdge*.28);
      diffuseColor.rgb=mix(diffuseColor.rgb,handmadeSoil,.96);
    `;
    shader.fragmentShader=shader.fragmentShader.replace(
     '#include <roughnessmap_fragment>',overlay+'\n#include <roughnessmap_fragment>');
   }else if(kind==='water'){
    shader.vertexShader=shader.vertexShader.replace(
      '#include <common>','#include <common>\nvarying vec3 crayonWaterWorld;');
    shader.vertexShader=shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\ncrayonWaterWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace(
      '#include <common>','#include <common>\nvarying vec3 crayonWaterWorld;');
    const overlay=String.raw`
      vec3 handmadeWater=crayonTile(crayonWaterWorld.xz*.22,vec2(1.0,0.0));
      diffuseColor.rgb=mix(diffuseColor.rgb,handmadeWater,.88);
    `;
    shader.fragmentShader=shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',overlay+'\n#include <roughnessmap_fragment>');
   }
  };
  material.customProgramCacheKey=()=>oldKey()+':handmade-crayon-'+kind+'-v5';
  material.needsUpdate=true;
 }
 decorate(terrainMaterial,'terrain');
 decorate(trailMat,'path');
 for(const mesh of waterMeshes)decorate(mesh.material,'water');
 return {name:'continuous-frameless-handmade-crayon',atlas:'96-to-64-pixel source swatches',
   sourceArt:'user-supplied-seamless-crayon-grass',grassTexture:'crayon-grass-seamless.webp',grassCoverage:.98,physicalMapChanged:false,
   brownBorders:false,seamlessSampling:true,water:true,grass:true,stone:true,soil:true,
   shoreline:true,shorelinePixels,shorelineMaskResolution:shoreSize};
}
