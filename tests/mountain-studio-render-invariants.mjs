// Source-level guardrails for the opt-in Mountain Studio v0.48.0.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const env=readFileSync(new URL('../src/mountain-environment.mjs',import.meta.url),'utf8');
const version=JSON.parse(readFileSync(new URL('../version.json',import.meta.url)));
assert.equal(version.version,'0.48.0');
assert(html.includes("const BUILD='0.48.0'"));
assert(html.includes("const MOUNTAIN_STUDIO="));
assert(!html.includes("grass_tuft_dense.png"),'Broken foreground sprite must not load');
assert(!html.includes("studioMeadow"),'Tiny mismapped atlas cards must not recur');
assert(html.includes('studioOrganic.meadow'));
assert(html.includes('studioOrganic.pine'));
assert(html.includes('studioOrganic.broadleaf'));
assert(env.includes('if(options.studio&&t.n.y<.72)continue'));
assert(env.includes('foliageMaterial:foliageMat'));
assert(env.includes('options.studio?.58:.78'));
console.log('Studio v0.48.0 source invariants passed (not GPU validation)');
