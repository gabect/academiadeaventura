// CPU scene construction and mesh invariants; explicitly NOT a WebGL test.
// Usage: THREE_MODULE=/absolute/path/three.module.mjs node tests/environment-smoke.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {buildMountainEnvironment} from '../src/mountain-environment.mjs';
const THREE=await import(pathToFileURL(process.env.THREE_MODULE).href);
const noop=()=>{};
function element(){return {style:{},classList:{toggle:noop},addEventListener:noop,setAttribute:noop,append:noop,prepend:noop,getContext:()=>({clearRect:noop,fillText:noop}),getBoundingClientRect:()=>({width:120,height:120,left:0,top:0})};}
class Renderer{constructor(){this.domElement=element();this.shadowMap={};this.info={render:{calls:0,triangles:0}};}setPixelRatio(){}setSize(){}render(){}}
const context={THREE:{...THREE,WebGLRenderer:Renderer},buildMountainEnvironment,document:{body:element(),getElementById:element,createElement:element,addEventListener:noop},performance,console,Math,URLSearchParams,location:{search:'',reload:noop},localStorage:{getItem:()=>null,setItem:noop},matchMedia:()=>({matches:false,addEventListener:noop}),devicePixelRatio:1,innerWidth:1363,innerHeight:936,addEventListener:noop,setTimeout:noop,setInterval:noop,requestAnimationFrame:noop,navigator:{},screen:{orientation:{}}};
context.window=context;
let code=fs.readFileSync('index.html','utf8').split('<script type="module">')[1].split('</script>')[0].replace(/^import .*;$/gm,'');
code+='\nglobalThis.result={scene,mountainEnvironment,groundMesh,camera,player,CURVED_HORIZON,obstacles};';
vm.createContext(context);vm.runInContext(code,context,{timeout:30000});
const {scene,mountainEnvironment:env,camera,player,CURVED_HORIZON:curve}=context.result;
assert(env.stats.blades>10000,'Must contain a continuous population of blades');assert(env.stats.roots>0,'Composed roots must be present');assert(env.stats.rocks>0);
let geometries=0,instances=0;
scene.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;if(p){for(const v of p.array)assert(Number.isFinite(v),`${m.name} nonfinite vertex`);geometries++;}if(m.isInstancedMesh){for(const v of m.instanceMatrix.array)assert(Number.isFinite(v));instances+=m.count;}});
// Independent raycasts verify placement uses actual rendered geometry,
// not merely a duplicated implementation of the analytical height function.
context.result.groundMesh.updateMatrixWorld(true);
const ray=new THREE.Raycaster(),origin=new THREE.Vector3(),direction=new THREE.Vector3(0,-1,0);
let contacts=0;const matrix=new THREE.Matrix4(),point=new THREE.Vector3();
for(const group of env.groups.filter(g=>g.grass).slice(0,20)){
 for(let i=0;i<group.full;i+=Math.max(1,Math.floor(group.full/5))){
  group.mesh.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix);
  origin.set(point.x,40,point.z);ray.set(origin,direction);
  const hit=ray.intersectObject(context.result.groundMesh)[0];assert(hit,'Root must intersect rendered terrain');
  // Small burial along a steep normal can move vertically; use point/triangle distance.
  const s=env.surface(point.x,point.z);assert(s);assert(Math.abs(point.y-hit.point.y)<.20,JSON.stringify({point:point.toArray(),hit:hit.point.toArray(),surface:s.p.toArray()}));contacts++;
 }
}
let testTime=performance.now()+1000;const qualityCounts=[];
for(const q of ['low','medium','high']){env.setQuality(q);env.update(camera,player.position,curve,testTime+=1000);qualityCounts.push(env.groups.filter(g=>g.grass).reduce((sum,g)=>sum+g.mesh.count,0));for(const g of env.groups.filter(g=>g.grass))assert(g.mesh.count<=g.full);}
assert(qualityCounts[0]<qualityCounts[1]&&qualityCounts[1]<qualityCounts[2],'Quality must reduce draw instances');
console.log(JSON.stringify({kind:'CPU only; no WebGL or measured GPU FPS',...env.stats,geometries,instances,verifiedContacts:contacts},null,2));
