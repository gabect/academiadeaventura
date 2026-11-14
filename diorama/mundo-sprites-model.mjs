/**
 * Academia de Aventura — Mundo a escala (tile/sprite edition).
 * Independent gameplay map. The grid, not painted polygons or Three.js geometry,
 * is the source of terrain, impassable surfaces and neighborhood layout.
 */
export const WORLD = Object.freeze({
  tile:64, columns:80, rows:60, width:5120, height:3840,
  playerRadius:15, heroHeight:80, seed:20261113,
  spawn:Object.freeze({x:3560,y:2680}),
  southernWade:8
});
export const TILE = Object.freeze({GRASS:0,FOREST:1,DRY:2,SAND:3,ROCK:4,CLIFF:5,
  WATER:6,PATH:7,MARSH:8,SHALLOW:9});
export const TILE_NAMES = Object.freeze(['grass','forest','dry-grass','sand','rock','cliff',
  'water','path','marsh','shallow']);
export const RIVER = Object.freeze([
  [2350,520],[2420,1120],[2260,1820],[2200,2440],[2150,3300],[2130,3820]
]);
export const BRIDGES = Object.freeze([
  {id:'puente-del-bosque',x:2410,y:1180,w:548,h:154,orientation:'horizontal'},
  {id:'puente-del-mercado',x:2200,y:2460,w:575,h:160,orientation:'horizontal'},
  {id:'pasarela-del-pantano',x:4320,y:1520,w:154,h:820,orientation:'vertical'}
]);
export const SWAMP_POOLS = Object.freeze([
  {x:3990,y:1370,rx:290,ry:190},
  {x:4450,y:1560,rx:260,ry:350},
  {x:3910,y:1860,rx:210,ry:195},
  {x:4710,y:1170,rx:200,ry:190}
]);
export const ROADS = Object.freeze([
  [[1080,1500],[1390,1310],[1880,1180],[2410,1180],[2750,1180],[3270,1430],[3640,1790],[3750,2160]],
  [[480,2470],[1020,2460],[1660,2460],[2200,2460],[2680,2460],[2900,2660]],
  [[2900,2660],[3150,2780],[3540,2780],[3970,2780],[4490,2780]],
  [[2780,2820],[2780,3150],[3170,3150],[3560,3150],[3950,3150],[4340,3150]],
  [[3170,2780],[3170,3150]],
  [[3950,2780],[3950,3150]],
  [[2900,2660],[2920,2230],[3550,2190],[4250,2190]],
  [[1080,1500],[900,1750],[750,2050],[760,2460]],
  [[3950,2190],[4200,1900],[4320,1520]],
  [[4490,2780],[4540,3180],[4570,3500]],
  [[3170,3150],[3180,3520]]
]);
const house = (id,name,x,y,sprite,scale=2.32)=>Object.freeze({id,name,x,y,sprite,scale});
export const HOUSES = Object.freeze([
  house('pescador-1','Casa de los Pescadores',2780,2550,'house0'),
  house('pescador-2','Casa de las Redes',3170,2550,'house1'),
  house('pescador-3','Casa del Carpintero',3560,2550,'house2'),
  house('pescador-4','Casa del Capitán',3950,2550,'house3'),
  house('pescador-5','Casa de la Sal',4340,2550,'house4'),
  house('pescador-6','Casa del Puerto',2780,3370,'house2'),
  house('pescador-7','Casa del Faro',3170,3370,'house4'),
  house('pescador-8','Casa de los Remeros',3560,3370,'house0'),
  house('pescador-9','Casa de las Redes II',3950,3370,'house1'),
  house('pescador-10','Casa de la Costa',4340,3370,'house3'),
  house('molino','Casa del Molino',2910,2060,'house3',2.45),
  house('posada','Posada del Camino',3550,2060,'house4',2.46),
  house('guardabosques','Casa del Guardabosques',4260,2060,'house1',2.36),
  house('aldea-oeste-1','Cabaña del Bosque Claro',720,2280,'house0',2.32),
  house('aldea-oeste-2','Casa del Valle Oeste',1170,2280,'house2',2.36),
  house('aldea-oeste-3','Casa de los Leñadores',1650,2280,'house3',2.34),
  house('casa-norte','Refugio del Bosque',1020,1490,'house1',2.3)
]);
export const PLACES = Object.freeze([
  {id:'villa',name:'Villa de los Pescadores',x:3640,y:2840},
  {id:'bosque',name:'Bosque del Norte',x:1430,y:1060},
  {id:'valle',name:'Cruce de los Dos Puentes',x:2440,y:2220},
  {id:'pantano',name:'Marismas del Este',x:4240,y:1400},
  {id:'costa',name:'Costa del Sur',x:3580,y:3550},
  {id:'oeste',name:'Aldea del Bosque Claro',x:1190,y:2470}
]);
export function mountainEdge(x){
  return 545+120*Math.sin(x/490)+74*Math.sin(x/170)+48*Math.sin(x/67);
}
export function shoreY(x){return 3545+28*Math.sin(x/290)+12*Math.sin(x/110);}
export function eastShore(y){return 4820+28*Math.sin(y/230)+9*Math.sin(y/65);}
export function westShore(y){return 245+50*Math.sin(y/340)+17*Math.sin(y/105);}
export function regionAt(x,y){
  if(y>2060&&x>2580)return 'Villa de los Pescadores';
  if(y>3030)return 'Bosques secos y costa sur';
  if(x>3530&&y<2190)return 'Marismas del Este';
  if(y<1840)return 'Bosque del Norte';
  if(x<1820)return 'Bosque Claro del Oeste';
  return 'Cruce del Valle';
}
export function distanceToSegment(x,y,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
  const t=den?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/den)):0;
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function distanceToRoute(x,y,pts){
  let d=Infinity;
  for(let i=1;i<pts.length;i++)d=Math.min(d,distanceToSegment(x,y,pts[i-1],pts[i]));
  return d;
}
function inPool(x,y,p){return ((x-p.x)/p.rx)**2+((y-p.y)/p.ry)**2<1;}
function noise(x,y){
  let z=Math.imul(x+343,374761393)+Math.imul(y+911,668265263);
  z=Math.imul(z^(z>>>13),1274126177);
  return ((z^(z>>>16))>>>0)/4294967296;
}
function onDeck(x,y,margin=0){
  return BRIDGES.some(b=>Math.abs(x-b.x)<b.w/2-margin&&Math.abs(y-b.y)<b.h/2-margin);
}
export function houseWalls(h){
  return {left:h.x-43*h.scale,right:h.x+43*h.scale,
    top:h.y-47*h.scale,bottom:h.y-2*h.scale,
    doorX:h.x,doorY:h.y+38};
}
export function nearDoor(x,y,range=74){
  let result=null, best=range;
  for(const h of HOUSES){
    const w=houseWalls(h),d=Math.hypot(x-w.doorX,y-w.doorY);
    if(d<best){best=d;result=h;}
  }
  return result;
}
export function makeTiles(){
  const arr=new Uint8Array(WORLD.rows*WORLD.columns);
  for(let row=0;row<WORLD.rows;row++)for(let col=0;col<WORLD.columns;col++){
    const x=(col+.5)*WORLD.tile,y=(row+.5)*WORLD.tile;
    const n=noise(col,row),edge=mountainEdge(x);
    let type=TILE.GRASS;
    if(y<edge-50)type=TILE.ROCK;
    else if(y<edge+18)type=TILE.CLIFF;
    else if(x<westShore(y)-45||x>eastShore(y)+12||y>shoreY(x)+10)type=TILE.WATER;
    else if(x<westShore(y)+80)type=TILE.ROCK;
    else if(x>eastShore(y)-140||y>shoreY(x)-150)type=TILE.SAND;
    else if(y>2050)type=n>.48?TILE.DRY:TILE.GRASS;
    else if(y<1840)type=n>.24?TILE.FOREST:TILE.GRASS;
    else if(x>3450)type=n>.35?TILE.MARSH:TILE.GRASS;
    if(type!==TILE.WATER&&type!==TILE.ROCK&&type!==TILE.CLIFF){
      if(x>3500&&y<2160&&SWAMP_POOLS.some(p=>inPool(x,y,p)))
        type=TILE.WATER;
      if(distanceToRoute(x,y,RIVER)<137)type=TILE.WATER;
      if(type!==TILE.WATER&&ROADS.some(path=>distanceToRoute(x,y,path)<48))
        type=TILE.PATH;
      if(y>shoreY(x)-55&&y<=shoreY(x)+10)type=TILE.SAND;
    }
    arr[row*WORLD.columns+col]=type;
  }
  return arr;
}
function random(seed){let v=seed>>>0;return ()=>{
  v+=0x6d2b79f5;let t=v;
  t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
};}
function overlapsHouse(x,y,r=0){
  return HOUSES.some(h=>{
    const d=houseWalls(h);
    return x>d.left-r-85&&x<d.right+r+85&&
      y>h.y-185*h.scale-r&&y<h.y+110+r;
  });
}
export function makeWorld(seed=WORLD.seed){
  const tiles=makeTiles(),props=[],rand=random(seed);
  const model={tiles,props,width:WORLD.width,height:WORLD.height,
    houses:HOUSES,bridges:BRIDGES,roads:ROADS,places:PLACES};
  function put(kind,count,box,spriteSet,baseHeight,radius){
    let created=0,tries=0;
    while(created<count&&tries++<count*110){
      const x=box[0]+rand()*(box[2]-box[0]),y=box[1]+rand()*(box[3]-box[1]);
      const tile=tileAt(x,y,model);
      if(![TILE.GRASS,TILE.FOREST,TILE.DRY,TILE.MARSH].includes(tile))continue;
      if(Math.hypot(x-WORLD.spawn.x,y-WORLD.spawn.y)<220)continue;
      if(distanceToRoute(x,y,RIVER)<235||
        ROADS.some(path=>distanceToRoute(x,y,path)<90+radius)||
        BRIDGES.some(b=>Math.abs(x-b.x)<b.w/2+70&&Math.abs(y-b.y)<b.h/2+70)||
        overlapsHouse(x,y,radius))continue;
      if(props.some(p=>Math.hypot(p.x-x,p.y-y)<p.radius+radius+20))continue;
      props.push({id:props.length,x:Math.round(x),y:Math.round(y),kind,
        sprite:spriteSet[Math.floor(rand()*spriteSet.length)],
        height:baseHeight*(.80+rand()*.35),radius,solid:kind==='tree'||kind==='rock'});
      created++;
    }
  }
  put('tree',330,[360,780,3430,1860],['round','round','pine','solo'],229,20);
  put('tree',90,[365,1640,1850,2940],['round','pine','solo'],215,20);
  put('tree',92,[3850,820,4750,2020],['pine','round'],204,18);
  put('tree',85,[300,2700,2470,3450],['palm','round','pine'],210,18);
  put('bush',160,[340,900,4700,3380],['bush0','bush1','bush2','bush3','bush4','bush5','bush6','bush7'],83,7);
  put('rock',95,[260,630,4720,3410],['rock0','rock1','rock2','rock3'],72,16);
  props.sort((a,b)=>a.y-b.y);
  return model;
}
export function tileAt(x,y,model){
  const col=Math.floor(x/WORLD.tile),row=Math.floor(y/WORLD.tile);
  if(col<0||row<0||col>=WORLD.columns||row>=WORLD.rows)return TILE.WATER;
  return model.tiles[row*WORLD.columns+col];
}
function terrainBlocked(x,y,model){
  if(y<mountainEdge(x)+12)return 'cordillera';
  if(x<westShore(y)+30||x>eastShore(y)+2)return 'oceano';
  if(y>shoreY(x)+WORLD.southernWade)return 'mar-profundo';
  if(onDeck(x,y))return null;
  const t=tileAt(x,y,model);
  if(t===TILE.WATER)return 'agua';
  if(t===TILE.CLIFF||t===TILE.ROCK&&y<mountainEdge(x)+100)return 'montana';
  return null;
}
export function blockedReason(x,y,model,radius=WORLD.playerRadius){
  for(const [dx,dy] of [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],
    [radius*.7,radius*.7],[-radius*.7,radius*.7],
    [radius*.7,-radius*.7],[-radius*.7,-radius*.7]]){
    const reason=terrainBlocked(x+dx,y+dy,model);
    if(reason)return reason;
  }
  for(const h of HOUSES){
    const w=houseWalls(h);
    if(x+radius>w.left&&x-radius<w.right&&y+radius>w.top&&y-radius<w.bottom)
      return 'pared-de-'+h.id;
  }
  for(const p of model.props){
    if(!p.solid)continue;
    if(Math.abs(p.y-y)>radius+p.radius||Math.abs(p.x-x)>radius+p.radius)continue;
    if(Math.hypot(x-p.x,y-p.y)<radius+p.radius)return 'obstaculo-'+p.kind;
  }
  return null;
}
export function canEnter(x,y,model,radius=WORLD.playerRadius){
  return !blockedReason(x,y,model,radius);
}
export function movePlayer(player,dx,dy,model){
  if(!Number.isFinite(dx)||!Number.isFinite(dy))return {x:player.x,y:player.y};
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));
  let x=player.x,y=player.y;
  for(let i=0;i<steps;i++){
    const sx=dx/steps,sy=dy/steps;
    if(canEnter(x+sx,y+sy,model)){x+=sx;y+=sy;}
    else {
      if(canEnter(x+sx,y,model))x+=sx;
      if(canEnter(x,y+sy,model))y+=sy;
    }
  }
  return {x,y};
}
export function nearestPlace(x,y,max=155){
  return PLACES.find(p=>Math.hypot(x-p.x,y-p.y)<max)||null;
}
export const ART = Object.freeze({
  terrain:'./assets/tiny-village-terrain.webp',
  treeCollection:'./assets/handpainted-cardboard-tree-collection.png',
  treeSolo:'./assets/handpainted-cardboard-tree.png',
  bushes:'./assets/handpainted-cardboard-bushes.png',
  character:'./assets/vector-bone-atlas.webp'
});
