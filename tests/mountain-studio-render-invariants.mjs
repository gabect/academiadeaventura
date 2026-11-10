// No WebGL renderer in this CPU invariant test.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const env=readFileSync(new URL('../src/mountain-environment.mjs',import.meta.url),'utf8');
const version=JSON.parse(readFileSync(new URL('../version.json',import.meta.url)));
assert.equal(version.version,'0.47.2');
assert(html.includes("const BUILD='0.47.2'"));
assert(!html.includes("grass_tuft_dense.png"),'Defective card texture must not be loaded');
assert(html.includes('studio-shared-atlas-meadow'));
assert(html.includes('mountainEnvironment.foliageMaterial'));
assert(html.includes("foliageState==='ready'"));
assert(html.includes('cliffGrass.visible=!ready'));
assert(html.includes("q==='low'?.30:q==='medium'?.65:1"));
assert(env.includes('foliageMaterial:foliageMat'));
assert(env.includes('options.studio?.58:.78'));
console.log('v0.47.2 Studio invariants passed (CPU/source only)');
