// Files needed by the illustrated scene must be committed and non-empty.
import assert from 'node:assert/strict';
import fs from 'node:fs';
for(const p of [
 'tiles/rock.webp','tiles/rock_moss.webp','tiles/grass.webp',
 'sprites/grass_tuft.webp','sprites/grass_medium.webp',
 'sprites/fern.webp','sprites/broadleaf.webp',
 'sprites/flowers_white.webp','sprites/flowers_purple.webp',
 'sprites/hanging_edge.webp']){
 const url=new URL('../assets/studio_hd/'+p,import.meta.url);
 assert(fs.existsSync(url),'Missing '+p);
 const data=fs.readFileSync(url);
 assert(data.length>10000,'Unreasonably small '+p);
 assert.equal(data.toString('ascii',8,12),'WEBP','Must be real WebP: '+p);
}
console.log('All required illustrated Studio WebP assets present');
