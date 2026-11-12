import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('diorama/index.html','utf8');
const root=fs.readFileSync('index.html','utf8');
for(const forbidden of [
 "installIllustratedCharacter(THREE,player",
 "installStylizedCharacter(THREE,guardian",
 "installStylizedCharacter(THREE,npc",
 "protagonistIllustration.update(",
 "castReleaseLink",
 "renderMode:'illustrated-vector-2.5d'",
 "renderMode:'fully-volumetric-3d'"
])assert(!source.includes(forbidden),'Experimental art still active: '+forbidden);
for(const required of [
 'function person(color,accent){',
 'const player=person(blue,mat(',
 'const guardian=person(red,gold);',
 'const npc=person(mat(def.coat),',
 "renderMode:'original-articulated-skeleton'",
 'ESQUELETO ORIGINAL · RESTAURADO',
 'rig.ribcage=ribcage',
 'rig.arms.push({shoulder,elbow,wrist})',
 'rig.legs.push({hip,knee,ankle})',
 'function poseGroundedCharacter(',
 'function solveLegTarget(',
 'function followPlayerCamera(',
 'function stepLadder(',
 'function poseSwimmingCharacter(',
 'const NPC_MARKERS=[',
 'const WORLD={half:83,limit:78,plateauHeight:10',
 'handdrawnStage.update()'
])assert(source.includes(required),'Missing original rig/game system: '+required);
const personStart=source.indexOf('function person(color,accent){');
const personEnd=source.indexOf('// Straight standing pose',personStart);
assert(personStart>=0&&personEnd>personStart,'Original articulated person() should remain');
const originalPerson=source.slice(personStart,personEnd);
assert(originalPerson.includes('root.userData.rig=rig;'),'Original rig metadata missing');
for(const key of [
 'const WORLD={half:83,limit:78,plateauHeight:10',
 'const FIELD_TREE_POSITIONS=[',
 'const WATER_BODIES=[',
 'const FIELD_RAMPS=[',
 'const CABIN={',
 'function naturalSurfaceY(x,z){',
 'function moveWithCollisions('
]){
 const i=source.indexOf(key),j=root.indexOf(key);
 assert(i>=0&&j>=0,'Map fixture missing: '+key);
 assert.equal(source.slice(i,i+Math.min(380,source.length-i)),
  root.slice(j,j+Math.min(380,root.length-j)),
  'Map/physics drift: '+key);
}
console.log('PASS: original animated skeletons restored; four limbs, IK, camera and unchanged cardboard map');
