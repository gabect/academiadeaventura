/**
 * Academia de Aventura — NUEVO MUNDO (independent 2D overworld).
 * Gameplay topology and collision logic. No DOM, Canvas or Three.js required.
 * All distances are world pixels; NORTH is negative Y.
 */
export const WORLD = Object.freeze({
 width:2400,height:1680,seed:29471,
 shallowSouthPx:8,playerRadius:10,
 spawn:Object.freeze({x:1060,y:995}),
 spawnLabel:'Cruce del Valle'
});
export const ZONES = Object.freeze([
 {id:'north',name:'Bosque del Norte',description:'Bosque denso · cordillera impenetrable'},
 {id:'west',name:'Bosque Claro',description:'Senderos abiertos · océano y acantilados'},
 {id:'east',name:'Marismas del Este',description:'Valles húmedos · costa sin acceso al mar'},
 {id:'south',name:'Costa de los Pescadores',description:'Bosques secos · villas y playa transitable'},
 {id:'center',name:'Cruce del Valle',description:'Caminos que unen las cuatro regiones'}
]);
const S=(v)=>Math.sin(v), C=(v)=>Math.cos(v);
export const boundaries=Object.freeze({
 north:x=>205+29*S(x/140)+17*S(x/48),
 west:y=>158+23*S(y/113)+10*S(y/37),
 east:y=>2262-29*S(y/149)+13*S(y/39),
 south:x=>1548+17*S(x/139)+10*S(x/42)
});
export function regionAt(x,y){
 if(y<615)return 'north';
 if(y>1115)return 'south';
 if(x>1510)return 'east';
 if(x<870)return 'west';
 return 'center';
}
export function onSouthBeach(x,y){
 return y>=boundaries.south(x)-88&&y<=boundaries.south(x)+WORLD.shallowSouthPx;
}
export function nearSouthernShallows(x,y){
 const edge=boundaries.south(x);
 return y>edge&&y<=edge+WORLD.shallowSouthPx;
}
export function terrainAt(x,y){
 if(y<boundaries.north(x))return 'mountain';
 if(x<boundaries.west(y))return 'western-ocean';
 if(x>boundaries.east(y))return 'eastern-ocean';
 if(y>boundaries.south(x)+WORLD.shallowSouthPx)return 'southern-ocean';
 if(y>boundaries.south(x))return 'southern-shallows';
 if(onSouthBeach(x,y))return 'south-beach';
 if(x>boundaries.east(y)-80)return 'dangerous-eastern-beach';
 if(x<boundaries.west(y)+65)return 'western-cliffs';
 return regionAt(x,y);
}
export const RIVER = Object.freeze([
 [1330,220],[1336,340],[1274,475],[1260,620],[1194,784],
 [1154,940],[1090,1105],[1080,1245],[1140,1382],[1135,1556]
]);
export const BRIDGES=Object.freeze([
 {id:'puente-bosque',x:1268,y:604,w:132,h:38},
 {id:'puente-central',x:1184,y:813,w:156,h:46},
 {id:'puente-sur',x:1093,y:1110,w:146,h:46}
]);
export const BOARDWALKS=Object.freeze([
 {id:'pasarela-marismas',points:[[1535,732],[1685,732],[1685,632],[1812,632],[1910,590]],width:37},
 {id:'pasarela-este',points:[[1840,860],[1930,860],[1930,745],[2070,745]],width:35}
]);
export const PATHS=Object.freeze([
 [[1060,995],[1130,920],[1184,813],[1280,748],[1395,720],[1535,732],[1660,760],[1800,760],[2050,750]],
 [[1184,813],[1060,750],[945,658],[780,583],[610,520],[450,470]],
 [[1060,995],[920,1090],[760,1198],[545,1315],[392,1390]],
 [[1060,995],[1100,1105],[1120,1190],[1295,1320],[1525,1400],[1790,1370]],
 [[1400,720],[1450,615],[1430,500],[1390,360],[1320,265]],
 [[1010,780],[1028,675],[1110,604],[1268,604],[1405,575]],
 [[1800,760],[1890,860],[1990,975],[1970,1100],[1830,1245],[1790,1370]],
 [[610,520],[625,720],[755,910],[920,1090]],
 [[1525,1400],[1710,1490],[1950,1470],[2115,1380]],
 [[545,1315],[760,1400],[950,1470],[1090,1510]]
]);
export const LANDMARKS=Object.freeze([
 {id:'ruinas',name:'Ruinas del Cruce',x:1040,y:825,r:52,kind:'ruins',collides:false,message:'Las piedras conservan historias que aún no conocemos.'},
 {id:'caverna',name:'Paso de la Cordillera',x:1330,y:245,r:34,kind:'cave',collides:true,message:'La cordillera bloquea el camino hacia el norte.'},
 {id:'molino',name:'Molino del Bosque Claro',x:442,y:433,r:46,kind:'windmill',collides:true,message:'El viento mantiene en marcha el molino.'},
 {id:'faro',name:'Faro de Poniente',x:368,y:1339,r:43,kind:'lighthouse',collides:true,message:'Los acantilados occidentales son demasiado peligrosos.'},
 {id:'aldea',name:'Villa Pesquera',x:1790,y:1346,r:75,kind:'village',collides:false,message:'Las barcas saldrán cuando el mar esté en calma.'},
 {id:'muelle',name:'Muelle de los Pescadores',x:1900,y:1500,r:40,kind:'dock',collides:false,message:'Las redes de pesca se secan junto al muelle.'},
 {id:'refugio',name:'Refugio de las Marismas',x:1980,y:605,r:35,kind:'swamp-hut',collides:true,message:'Las marismas esconden caminos sobre el agua.'}
]);
export const SWAMP_POOLS=Object.freeze([
 [1614,460,75,50],[1810,445,80,63],[2040,454,70,54],
 [1595,580,63,58],[1780,585,95,75],[2080,620,73,65],
 [1590,828,63,75],[1780,890,92,65],[2050,920,81,61],
 [1690,1010,70,45],[1920,1050,70,55],[2170,780,41,115]
]);
export function distanceToSegment(x,y,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy;
 const t=len?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/len)):0;
 return Math.hypot(x-(ax+t*dx),y-(ay+t*dy));
}
export function distanceToPolyline(x,y,pts){
 let best=Infinity;
 for(let k=1;k<pts.length;k++){
  const a=pts[k-1],b=pts[k];
  best=Math.min(best,distanceToSegment(x,y,a[0],a[1],b[0],b[1]));
 }
 return best;
}
export function riverCenterAt(y){
 for(let i=1;i<RIVER.length;i++){
  const a=RIVER[i-1],b=RIVER[i];
  if(y>=a[1]&&y<=b[1]){
   const t=(y-a[1])/(b[1]-a[1]);
   return a[0]+(b[0]-a[0])*t;
  }
 }
 return y<RIVER[0][1]?RIVER[0][0]:RIVER[RIVER.length-1][0];
}
export function onBridge(x,y){
 return BRIDGES.some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(y-b.y)<b.h/2);
}
export function onBoardwalk(x,y){
 return BOARDWALKS.some(b=>distanceToPolyline(x,y,b.points)<b.width/2);
}
export function pondAt(x,y,r=0){
 return SWAMP_POOLS.some(([cx,cy,rx,ry])=>
  (((x-cx)/(rx+r))**2+((y-cy)/(ry+r))**2)<1);
}
function mulberry32(seed){
 let t=seed>>>0;return ()=>{t+=0x6d2b79f5;let a=t;
 a=Math.imul(a^(a>>>15),a|1);
 a^=a+Math.imul(a^(a>>>7),a|61);
 return ((a^(a>>>14))>>>0)/4294967296;};
}
function avoidRoad(x,y,limit=39){
 return PATHS.some(p=>distanceToPolyline(x,y,p)<limit)
  ||BOARDWALKS.some(p=>distanceToPolyline(x,y,p.points)<limit);
}
function nearLandmark(x,y,pad=0){
 return LANDMARKS.some(k=>Math.hypot(x-k.x,y-k.y)<k.r+pad);
}
export function createWorld(seed=WORLD.seed){
 const rand=mulberry32(seed);
 const objects=[],categoryCounts={north:0,south:0,west:0,east:0,center:0};
 const make=(kind,zone,count,range,rad=18,variants=4)=>{
  let attempts=0,n=0;
  while(n<count&&attempts++<count*75){
   const x=range[0]+rand()*(range[1]-range[0]);
   const y=range[2]+rand()*(range[3]-range[2]);
   if(regionAt(x,y)!==zone&&!(zone==='center'&&regionAt(x,y)==='west'))continue;
   if(y<boundaries.north(x)+60||y>boundaries.south(x)-84||
    x<boundaries.west(y)+75||x>boundaries.east(y)-100)continue;
   if(zone==='east'&&pondAt(x,y,22))continue;
   if(Math.abs(x-riverCenterAt(y))<62||avoidRoad(x,y,rad+30)||
    nearLandmark(x,y,rad+55))continue;
   if(objects.some(o=>Math.hypot(o.x-x,o.y-y)<o.radius+rad+4))continue;
   objects.push({id:objects.length,kind,zone,x:Math.round(x),y:Math.round(y),
    radius:rad,variant:Math.floor(rand()*variants),scale:.83+rand()*.37,
    collision:kind==='tree'||kind==='dead-tree'||kind==='rock'});
   categoryCounts[zone]++;n++;
  }
 };
 make('tree','north',215,[210,2180,225,610],19);
 make('tree','west',105,[225,1120,610,1230],17);
 make('tree','south',120,[250,2160,1120,1510],18);
 make('dead-tree','east',45,[1510,2180,345,1105],14,2);
 make('bush','north',95,[210,2200,255,615],8);
 make('bush','west',70,[210,1120,635,1150],8);
 make('bush','south',85,[240,2150,1160,1450],8);
 make('reeds','east',105,[1550,2200,340,1100],6);
 make('rock','west',40,[200,990,470,1230],13);
 make('rock','north',35,[220,2100,250,610],12);
 make('rock','south',22,[250,2100,1120,1460],12);
 make('rock','east',26,[1570,2160,340,1070],12);
 objects.sort((a,b)=>a.y-b.y);
 return {seed,width:WORLD.width,height:WORLD.height,
  spawn:{...WORLD.spawn},objects,landmarks:LANDMARKS,
  paths:PATHS,bridges:BRIDGES,boardwalks:BOARDWALKS,
  categoryCounts,river:RIVER,swampPools:SWAMP_POOLS};
}
export function blockedReason(x,y,model,{radius=WORLD.playerRadius}={}){
 if(x<boundaries.west(y)+radius)return 'oeste-acantilados-y-oceano';
 if(x>boundaries.east(y)-radius)return 'este-costa-intransitable';
 if(y<boundaries.north(x)+radius)return 'norte-cordillera-infranqueable';
 if(y>boundaries.south(x)+WORLD.shallowSouthPx-radius)
  return 'sur-profundidad-del-mar';
 if(y>=RIVER[0][1]&&y<=RIVER[RIVER.length-1][1]&&
  Math.abs(x-riverCenterAt(y))<22+radius&&!onBridge(x,y))
  return 'rio-sin-puente';
 if(pondAt(x,y,radius)&&!onBoardwalk(x,y))return 'agua-profunda-del-pantano';
 for(const o of model.objects){
  if(!o.collision)continue;
  const r=o.radius+radius;
  if((x-o.x)**2+(y-o.y)**2<r*r)return 'obstaculo-'+o.kind;
 }
 for(const l of LANDMARKS){
  if(l.collides&&Math.hypot(x-l.x,y-l.y)<l.r*.62+radius)
   return 'estructura-'+l.kind;
 }
 return null;
}
export function canEnter(x,y,model,opts){
 return blockedReason(x,y,model,opts)===null;
}
export function movePlayer(pos,dx,dy,model,radius=WORLD.playerRadius){
 if(!Number.isFinite(dx)||!Number.isFinite(dy))return {...pos};
 let x=pos.x,y=pos.y;
 const n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/5));
 for(let i=0;i<n;i++){
  const sx=dx/n,sy=dy/n;
  if(canEnter(x+sx,y+sy,model,{radius})){x+=sx;y+=sy;}
  else{
   if(canEnter(x+sx,y,model,{radius}))x+=sx;
   if(canEnter(x,y+sy,model,{radius}))y+=sy;
  }
 }
 return {x,y};
}
export function nearestLandmark(x,y,distance=90){
 let nearest=null,best=distance;
 for(const l of LANDMARKS){
  const d=Math.hypot(x-l.x,y-l.y);
  if(d<best){best=d;nearest=l;}
 }
 return nearest;
}
