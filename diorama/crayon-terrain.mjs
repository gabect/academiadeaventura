/**
 * Continuous painterly ground treatment sampled from the user's handmade
 * crayon terrain, rock, path and water artwork. The source frames are cropped
 * out of the atlas; UV sampling never touches the brown cardboard borders.
 * Visual-only: terrain mesh, physics, placement and shorelines are unchanged.
 */
export function installCrayonTerrain({THREE,terrainMaterial,trailMat,waterMeshes}) {
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
 // Four unframed, premade periodic paintings: grass, soil, stone and water.
 // Each cell is a quarter of the texture (top-left grass, top-right soil,
 // bottom-left stone, bottom-right water). Clamp taps to prevent atlas bleed.
 const shared=String.raw`
 uniform sampler2D crayonAtlas;
 uniform sampler2D crayonGrass;
 vec3 crayonTile(vec2 worldUV,vec2 cell){
   vec2 local=fract(worldUV);
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
      diffuseColor.rgb=mix(diffuseColor.rgb,handmadeGround,.98);
    `;
    shader.fragmentShader=shader.fragmentShader.replace(
     '#include <roughnessmap_fragment>',overlay+'\n#include <roughnessmap_fragment>');
   }else if(kind==='path'){
    const overlay=String.raw`
      vec3 handmadeSoil=crayonTile(vStudioTrailWorld.xz*.24,vec2(1.0,1.0));
      diffuseColor.rgb=mix(diffuseColor.rgb,handmadeSoil,.91);
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
  material.customProgramCacheKey=()=>oldKey()+':handmade-crayon-'+kind+'-v3';
  material.needsUpdate=true;
 }
 decorate(terrainMaterial,'terrain');
 decorate(trailMat,'path');
 for(const mesh of waterMeshes)decorate(mesh.material,'water');
 return {name:'continuous-frameless-handmade-crayon',atlas:'96-to-64-pixel source swatches',
   sourceArt:'user-supplied-seamless-crayon-grass',grassTexture:'crayon-grass-seamless.webp',grassCoverage:.98,physicalMapChanged:false,
   brownBorders:false,seamlessSampling:true,water:true,grass:true,stone:true,soil:true};
}
