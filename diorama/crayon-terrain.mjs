/**
 * Continuous painterly ground treatment sampled from the user's handmade
 * crayon terrain, rock, path and water artwork. The source frames are cropped
 * out of the atlas; UV sampling never touches the brown cardboard borders.
 * Visual-only: terrain mesh, physics, placement and shorelines are unchanged.
 */
export function installCrayonTerrain({THREE,terrainMaterial,trailMat,waterMeshes,
 waterCoverageAt,upperRiverCoverageAt,worldHalfSize=83,artStyle='crayon'}) {
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
  new URL(artStyle==='tiny-swords'?'./assets/tiny-ground.webp?v=1':'./assets/crayon-grass-seamless.webp',import.meta.url).href);
 grass.colorSpace=THREE.SRGBColorSpace;
 grass.wrapS=grass.wrapT=THREE.RepeatWrapping;
 grass.minFilter=THREE.LinearMipmapLinearFilter;
 grass.magFilter=THREE.LinearFilter;
 grass.anisotropy=4;
 const grassUniform={value:grass};
 // The supplied pack's water tile contributes its teal pigment while the
 // existing animated river/shore geometry and wet bank physics stay intact.
 const tinyWater=artStyle==='tiny-swords'?new THREE.TextureLoader().load(
  new URL('./assets/tiny-water.webp?v=1',import.meta.url).href):null;
 if(tinyWater){
  tinyWater.colorSpace=THREE.SRGBColorSpace;
  tinyWater.wrapS=tinyWater.wrapT=THREE.RepeatWrapping;
  tinyWater.minFilter=tinyWater.magFilter=THREE.LinearFilter;
 }
 const tinyWaterUniform={value:tinyWater};
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
 uniform sampler2D tinyWaterSwatch;
 uniform sampler2D crayonShoreMap;
 uniform vec4 crayonShoreBounds;
 // Matte wax pigment grade applied to BOTH the field and the path verge.
 // Preserve the uploaded drawing's strokes while taming neon highlights.
 vec3 crayonGradeGrass(vec3 pigment){
   float luma=dot(pigment,vec3(.23,.69,.08));
   vec3 softened=mix(vec3(luma),pigment,.75);
   return mix(softened,vec3(.29,.48,.20),.22);
 }
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
   if(tinyWater)shader.uniforms.tinyWaterSwatch=tinyWaterUniform;
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
      vec3 handmadeGrass=crayonGradeGrass(texture2D(crayonGrass,grassUV).rgb);
      vec3 handmadeStoneTop=crayonTile(vAcademyRockWorld.xz*.19,vec2(0.0,0.0));
      vec3 handmadeStoneFront=crayonTile(vAcademyRockWorld.xy*.19,vec2(0.0,0.0));
      vec3 handmadeStoneSide=crayonTile(vAcademyRockWorld.zy*.19,vec2(0.0,0.0));
      vec3 crayonNormal=normalize(cross(dFdx(vAcademyRockWorld),dFdy(vAcademyRockWorld)));
      vec3 crayonWeights=pow(abs(crayonNormal),vec3(4.0));
      crayonWeights/=max(dot(crayonWeights,vec3(1.0)),0.0001);
      vec3 handmadeStone=handmadeStoneFront*crayonWeights.z+
        handmadeStoneSide*crayonWeights.x+handmadeStoneTop*crayonWeights.y;
      // Warm grey craft-paper glazing unifies cliffs with painted cutouts.
      handmadeStone=mix(handmadeStone,vec3(.47,.50,.45),.21);
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
    // Fray the visible silhouette, not the collision geometry. The shader
    // uses world space so scuffed patches connect across curve segments.
    const overlay=String.raw`
      vec3 handmadeSoil=crayonTile(vStudioTrailWorld.xz*.24,vec2(1.0,1.0));
      float edge=abs(vStudioLateral);
      float wearBroad=sin(vStudioTrailWorld.x*4.9+
          sin(vStudioTrailWorld.z*3.7)*1.3)*
          cos(vStudioTrailWorld.z*5.3-vStudioTrailWorld.x*2.4);
      float wearFine=sin(vStudioTrailWorld.x*13.0+
          vStudioTrailWorld.z*9.0)*
          cos(vStudioTrailWorld.z*10.4-vStudioTrailWorld.x*6.2);
      float scratch=sin(vStudioTrailWorld.x*28.7+
          vStudioTrailWorld.z*19.3);
      // Broad bites + small notches, with an antialiased silhouette.
      float edgeLimit=.88+.10*wearBroad+.045*wearFine+.012*scratch;
      float feather=max(fwidth(edge)*1.3,.012);
      float visibleSoil=1.0-smoothstep(edgeLimit-feather,
        edgeLimit+feather,edge);
      // Dark, interrupted compacted-soil line just inside the worn edge.
      float rim=1.0-smoothstep(.012,.085,
        abs(edge-(edgeLimit-.07)));
      float brokenInk=.65+.35*(.5+.5*wearFine);
      handmadeSoil=mix(handmadeSoil,vec3(.33,.25,.12),
        rim*brokenInk*.17);
      // A few faint scratch marks blend the path naturally into the grass.
      float flecks=smoothstep(.93,.99,
        .5+.5*sin(vStudioTrailWorld.x*31.9)*
          sin(vStudioTrailWorld.z*23.4));
      handmadeSoil=mix(handmadeSoil,handmadeSoil*1.10,
        flecks*.16*(1.0-smoothstep(.50,.85,edge)));
      // Wax-pigment gradient: dirt -> mixed earth/grass -> meadow.
      // Sample exactly the same world-space grass texture as the ground;
      // no fixed green swatch or visible border stripe.
      vec3 edgeGrass=crayonGradeGrass(texture2D(crayonGrass,
        vStudioTrailWorld.xz*.22).rgb);
      float fadeStart=edgeLimit-(.35+.035*wearBroad);
      float fadeEnd=edgeLimit-.025;
      float edgeGradient=smoothstep(fadeStart,fadeEnd,edge);
      float grainBreak=.5+.5*wearFine;
      edgeGradient=clamp(edgeGradient+
        .035*grainBreak*smoothstep(.48,.82,edge),0.0,1.0);
      vec3 fadedEarth=mix(handmadeSoil,edgeGrass,
        edgeGradient*.89);
      diffuseColor.rgb=mix(diffuseColor.rgb,fadedEarth,.97);
      // Keep an opaque walking center; become progressively transparent
      // toward the frayed silhouette, exposing real grass underneath.
      float fadingAlpha=1.0-.88*edgeGradient;
      diffuseColor.a*=visibleSoil*fadingAlpha;
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
      ${artStyle==='tiny-swords'?String.raw`vec3 gameWater=texture2D(tinyWaterSwatch,crayonWaterWorld.xz*.15).rgb;
      handmadeWater=mix(handmadeWater,gameWater,.62);`:''}
      diffuseColor.rgb=mix(diffuseColor.rgb,handmadeWater,.88);
    `;
    shader.fragmentShader=shader.fragmentShader.replace(
      '#include <roughnessmap_fragment>',overlay+'\n#include <roughnessmap_fragment>');
   }
  };
  material.customProgramCacheKey=()=>oldKey()+':handmade-crayon-'+kind+'-v9-'+artStyle;
  material.needsUpdate=true;
 }
 decorate(terrainMaterial,'terrain');
 decorate(trailMat,'path');
 for(const mesh of waterMeshes)decorate(mesh.material,'water');
 return {name:'continuous-frameless-handmade-crayon',atlas:'96-to-64-pixel source swatches',
   sourceArt:artStyle==='tiny-swords'?'Pixel Frog Tiny Swords user-provided pack':'user-supplied-seamless-crayon-grass',grassTexture:artStyle==='tiny-swords'?'tiny-ground.webp':'crayon-grass-seamless.webp',grassCoverage:.98,physicalMapChanged:false,
   brownBorders:false,seamlessSampling:true,water:true,grass:true,stone:true,soil:true,
   shoreline:true,shorelinePixels,shorelineMaskResolution:shoreSize,
   mattePigmentGrade:true,grassSaturationFactor:.75,stoneGlaze:.21};
}
