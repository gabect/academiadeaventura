/**
 * Academia de Aventura — new 2D world renderer.
 * Crisp Canvas2D at device resolution; smooth terrain brushes plus selected
 * Tiny Swords free-pack sprites. No Three.js, no borrowed Zelda artwork.
 * Static map is prerendered once; characters/foreground are depth sorted.
 */
import {
 WORLD,boundaries,terrainAt,regionAt,RIVER,BRIDGES,BOARDWALKS,
 PATHS,LANDMARKS,SWAMP_POOLS,VILLAGE_BUILDINGS,HERO_VISUAL,RIVER_HALF_WIDTH
} from './nuevo-mundo-model.mjs';
import {loadTinyVillageArt,drawTinyHouse,drawTinyBridge,drawTinyRock,tilePattern}
 from './tiny-village-assets.mjs?v=1';
const PI=Math.PI,TAU=2*PI;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const atlasCuts={
 tree1:[228,8,238,380],tree2:[8,8,212,488],
 tree3:[474,8,180,292],tree4:[662,8,160,244],
 bush1:[8,504,134,92],bush2:[682,504,92,68],
 bush3:[830,8,156,118],bush4:[150,504,92,84],
 rock1:[868,504,64,52],rock2:[480,504,100,72],
 rock3:[782,504,78,58],rock4:[250,504,118,84],
 stump1:[376,504,96,80],stump2:[588,504,86,70]
};
function random(seed){
 let a=seed>>>0;return ()=>{
 a+=0x6d2b79f5;let t=a;
 t=Math.imul(t^(t>>>15),t|1);
 t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296;
 };
}
const fill=(c,color)=>{c.fillStyle=color;c.fill();};
function rounded(c,x,y,w,h,r,color,stroke){
 c.beginPath();c.roundRect(x,y,w,h,r);
 if(color){c.fillStyle=color;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
}
function oval(c,x,y,rx,ry,color,alpha=1){
 c.save();c.globalAlpha*=alpha;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);
 fill(c,color);c.restore();
}
function smoothPath(c,pts){
 if(!pts.length)return;
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
 for(let i=1;i<pts.length-1;i++){
  const a=pts[i],b=pts[i+1];
  c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);
 }
 c.lineTo(...pts[pts.length-1]);
}
function strokePolyline(c,pts,color,width){
 c.lineCap='round';c.lineJoin='round';smoothPath(c,pts);
 c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function landOutline(c){
 c.beginPath();c.moveTo(boundaries.west(212),212);
 for(let x=170;x<=2270;x+=16)c.lineTo(x,boundaries.north(x));
 for(let y=222;y<=1575;y+=16)c.lineTo(boundaries.east(y),y);
 for(let x=2270;x>=155;x-=16)c.lineTo(x,boundaries.south(x));
 for(let y=1550;y>=205;y-=16)c.lineTo(boundaries.west(y),y);
 c.closePath();
}
function colorRamp(c,x,y,rx,ry,inside,outside){
 const gradient=c.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
 gradient.addColorStop(0,inside);gradient.addColorStop(1,outside);
 c.fillStyle=gradient;c.fillRect(x-rx,y-ry,rx*2,ry*2);
}
function drawSea(c,pack){
 const g=c.createLinearGradient(0,0,0,WORLD.height);
 g.addColorStop(0,'#155877');g.addColorStop(.45,'#217994');
 g.addColorStop(.9,'#248a9b');g.addColorStop(1,'#157796');
 c.fillStyle=g;c.fillRect(0,0,WORLD.width,WORLD.height);
 const water=tilePattern(c,pack,'waterTile');
 if(water){
  c.save();c.globalAlpha=.19;c.fillStyle=water;
  c.fillRect(0,0,WORLD.width,WORLD.height);c.restore();
 }
 const rng=random(8162);
 for(let i=0;i<1900;i++){
  const x=rng()*WORLD.width,y=rng()*WORLD.height;
  if(terrainAt(x,y)!=='western-ocean'&&terrainAt(x,y)!=='eastern-ocean'
  &&terrainAt(x,y)!=='southern-ocean')continue;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+10,y-3,x+24,y+1);
  c.strokeStyle=i%4===0?'#d2f3df78':'#a1d1dd60';
  c.lineWidth=i%7===0?2:1;c.stroke();
 }
}
function drawBiomeGround(c,pack){
 landOutline(c);c.fillStyle='#8caf64';c.fill();
 c.save();landOutline(c);c.clip();
 const ground=tilePattern(c,pack,'grassTile');
 if(ground){
  c.save();c.globalAlpha=.24;c.fillStyle=ground;
  c.fillRect(0,0,WORLD.width,WORLD.height);c.restore();
 }
 // Large translucent washes make biomes readable with no tile seams.
 colorRamp(c,1020,260,1500,690,'#416e4f','#416e4f00');
 colorRamp(c,455,850,650,900,'#b0cc70','#b0cc7000');
 colorRamp(c,1840,720,770,730,'#688e75','#688e7500');
 colorRamp(c,1400,1370,1430,690,'#e7bc70','#e7bc7000');
 // Broad forest canopies cast a subtle continuous northern shadow.
 colorRamp(c,930,450,1050,390,'#234e4659','#234e4600');
 const rng=random(13008),n=13000;
 for(let i=0;i<n;i++){
  const x=165+rng()*(WORLD.width-300),y=170+rng()*(WORLD.height-240);
  const zone=terrainAt(x,y);
  if(['mountain','western-ocean','eastern-ocean','southern-ocean',
      'south-beach','southern-shallows','dangerous-eastern-beach'].includes(zone))continue;
  const hue=zone==='north'?['#9dc277','#234f456b','#bddc7a66']:
   zone==='east'?['#6a8d74','#4c7b755e','#acd1a06e']:
   zone==='south'?['#bfaa61','#e0d08380','#8e995d7a']:
   ['#b5d779','#6d9e6466','#e4df9663'];
  c.fillStyle=hue[i%hue.length];
  if(i%3===0){
   c.beginPath();c.ellipse(x,y,1.4+rng()*3,.7+rng()*1.5,
    rng()*TAU,0,TAU);c.fill();
  }else{
   c.fillRect(x,y,1+rng()*2,1+rng()*4);
  }
 }
 // Wildflower patches, denser near the western meadow.
 for(let i=0;i<800;i++){
  const x=200+rng()*1990,y=240+rng()*1250;
  const zone=terrainAt(x,y);
  if(zone==='north'||zone==='west'||zone==='south'){
   c.fillStyle=i%5===0?'#f0ca5b':'#fff1c0';
   oval(c,x,y,1.3,1.1,c.fillStyle,.70);
  }
 }
 c.restore();
}
function drawMountains(c){
 c.save();
 c.beginPath();c.moveTo(0,0);c.lineTo(WORLD.width,0);
 for(let x=WORLD.width;x>=0;x-=9)c.lineTo(x,boundaries.north(x));
 c.closePath();const g=c.createLinearGradient(0,0,0,260);
 g.addColorStop(0,'#5d6264');g.addColorStop(.55,'#898579');g.addColorStop(1,'#b0a18a');
 fill(c,g);
 const rng=random(338),peaks=75;
 for(let i=0;i<peaks;i++){
  const x=i*34-25+(rng()-.5)*23;
  const floor=boundaries.north(x)+4,top=-30+rng()*68,w=33+rng()*53;
  c.beginPath();c.moveTo(x-w, floor);c.lineTo(x+(rng()-.5)*18,top);
  c.lineTo(x+w,floor);c.closePath();
  c.fillStyle=['#6d7272','#8d8c85','#aaa394','#5c6266'][i%4];c.fill();
  c.beginPath();c.moveTo(x,top);c.lineTo(x-12,floor*.66);c.lineTo(x-w,floor);
  c.fillStyle='#e0d3bb49';c.fill();
  c.beginPath();c.moveTo(x+3,top+4);c.lineTo(x+w*.45,floor*.7);
  c.strokeStyle='#4f5b5d66';c.lineWidth=3;c.stroke();
 }
 // High cliff line physically coincides with the northern world boundary.
 c.beginPath();
 for(let x=0;x<=WORLD.width;x+=9){
  if(x===0)c.moveTo(x,boundaries.north(x));
  else c.lineTo(x,boundaries.north(x));
 }
 c.strokeStyle='#364841aa';c.lineWidth=12;c.stroke();
 c.strokeStyle='#c7bd9a77';c.lineWidth=4;c.stroke();
 c.restore();
}
function drawWesternCliffs(c){
 const rng=random(894);
 for(let y=190;y<1560;y+=25){
  const x=boundaries.west(y),wid=43+rng()*25;
  c.beginPath();c.moveTo(x-7,y-17);c.lineTo(x+wid-10,y-9);
  c.lineTo(x+wid*.7,y+17);c.lineTo(x-12,y+17);c.closePath();
  c.fillStyle=y%2===0?'#9c9783':'#807f76';c.fill();
  c.strokeStyle='#4b625a66';c.lineWidth=2;c.stroke();
  c.beginPath();c.moveTo(x+11,y-13);c.lineTo(x+8,y+13);
  c.strokeStyle='#e7ceaa5c';c.stroke();
  // Rough white surf against the vertical impassable coast.
  strokePolyline(c,[[x-24,y],[x-12,y-5],[x-2,y-1]],'#eff8ddbb',3);
 }
}
function drawEasternShore(c){
 c.save();c.beginPath();
 for(let y=220;y<=1550;y+=8){
  const x=boundaries.east(y);
  if(y===220)c.moveTo(x-94,y);else c.lineTo(x-94,y);
 }
 for(let y=1550;y>=220;y-=8)c.lineTo(boundaries.east(y)+4,y);
 c.closePath();c.fillStyle='#c2bda4';c.fill();
 const rng=random(404);
 for(let i=0;i<300;i++){
  const y=240+rng()*1300,x=boundaries.east(y)-90+rng()*88;
  oval(c,x,y,2+rng()*6,1+rng()*3,i%3?'#798780':'#e3dbc2',.7);
 }
 for(let y=240;y<1550;y+=28){
  const x=boundaries.east(y);
  c.beginPath();c.moveTo(x-16,y);
  c.quadraticCurveTo(x+5,y-11,x+19,y);
  c.strokeStyle='#e2f1d5d1';c.lineWidth=4;c.stroke();
  // Pointed reefs signal that this beach is unsafe for swimming.
  c.beginPath();c.moveTo(x-52,y+8);c.lineTo(x-43,y-12);c.lineTo(x-33,y+8);
  c.closePath();c.fillStyle='#626e6e';c.fill();
 }
 c.restore();
}
function drawSouthernBeach(c,pack){
 c.save();c.beginPath();
 for(let x=150;x<=2300;x+=10)c.lineTo(x,boundaries.south(x)-99);
 for(let x=2300;x>=150;x-=10)c.lineTo(x,boundaries.south(x)+8);
 c.closePath();
 const beach=c.createLinearGradient(0,1460,0,1580);
 beach.addColorStop(0,'#d2c387');beach.addColorStop(.52,'#f1dca3');
 beach.addColorStop(.90,'#ffe7b9');beach.addColorStop(1,'#a7dbc4');
 fill(c,beach);
 const sand=tilePattern(c,pack,'sandTile');
 if(sand){
  c.save();c.beginPath();
  for(let x=150;x<=2300;x+=10)c.lineTo(x,boundaries.south(x)-99);
  for(let x=2300;x>=150;x-=10)c.lineTo(x,boundaries.south(x)+8);
  c.closePath();c.clip();
  c.globalAlpha=.23;c.fillStyle=sand;
  c.fillRect(150,1350,2150,270);c.restore();
 }
 for(let x=180;x<2250;x+=6){
  const s=boundaries.south(x);
  oval(c,x,s+5,4.8,1.6,'#efffe3bd',.60);
 }
 const rng=random(631);
 for(let i=0;i<510;i++){
  const x=190+rng()*2050,y=boundaries.south(x)-rng()*92;
  oval(c,x,y,.8+rng()*2,.9+rng()*1.7,
   i%4?'#beae83':'#fff0cb',.8);
 }
 c.restore();
}
function drawSwamp(c){
 const glow=c.createRadialGradient(1850,720,40,1850,720,540);
 glow.addColorStop(0,'#345b5699');glow.addColorStop(1,'#486d5800');
 c.fillStyle=glow;c.fillRect(1510,250,770,900);
 for(const [x,y,rx,ry] of SWAMP_POOLS){
  oval(c,x,y,rx+11,ry+9,'#50695b');
  const g=c.createRadialGradient(x-20,y-15,1,x,y,Math.max(rx,ry));
  g.addColorStop(0,'#6f9b8a');g.addColorStop(.6,'#3e7676');
  g.addColorStop(1,'#315c64');
  c.save();c.translate(x,y);c.scale(rx,ry);
  c.beginPath();c.arc(0,0,1,0,TAU);fill(c,g);c.restore();
  for(let k=0;k<6;k++){
   const a=(k*1.36)+x*.003;
   oval(c,x+Math.cos(a)*rx*.50,y+Math.sin(a)*ry*.48,
    5,3,'#9bb976',.68);
  }
 }
}
function drawPathNetwork(c){
 for(const p of PATHS){
  strokePolyline(c,p,'#64734b80',41);
  strokePolyline(c,p,'#c3a76e',32);
  strokePolyline(c,p,'#e1cb94',27);
  strokePolyline(c,p,'#f2dda466',13);
 }
}
function drawRiver(c,pack){
 // Shared logical width with physical collision. 164 pixel river.
 strokePolyline(c,RIVER,'#506f58',RIVER_HALF_WIDTH*2+52);
 strokePolyline(c,RIVER,'#b3be85',RIVER_HALF_WIDTH*2+37);
 strokePolyline(c,RIVER,'#477b79',RIVER_HALF_WIDTH*2+14);
 strokePolyline(c,RIVER,'#287c92',RIVER_HALF_WIDTH*2);
 strokePolyline(c,RIVER,'#42a7b0',RIVER_HALF_WIDTH*2-16);
 const water=tilePattern(c,pack,'waterTile');
 if(water){
  c.save();c.globalAlpha=.43;c.strokeStyle=water;
  c.lineWidth=RIVER_HALF_WIDTH*2-20;c.lineCap='round';
  c.lineJoin='round';smoothPath(c,RIVER);c.stroke();c.restore();
 }
 strokePolyline(c,RIVER,'#c6efda72',3);
 for(const [x,y] of [[1280,520],[1130,1030],[1095,1360]]){
  c.fillStyle='#edf9e3';c.globalAlpha=.55;
  for(let n=0;n<5;n++)oval(c,x+n*5-12,y+n*2-4,8,1.6,'#ebfbda');
  c.globalAlpha=1;
 }
}
function drawBridge(c,bridge,pack){
 if(drawTinyBridge(c,pack,bridge))return;
 const {x,y,w,h}=bridge;
 // Walkable east-west bridge with deck wide enough for a 2D hero.
 c.save();c.translate(x,y);
 rounded(c,-w/2-8,-h/2-9,w+16,h+18,7,'#4a493d','#344b45');
 rounded(c,-w/2-3,-h/2-2,w+6,h+4,3,'#b98b57','#694b35');
 for(let dx=-w/2+5;dx<w/2;dx+=12){
  c.fillStyle=(Math.floor(dx/12)%3)?'#c6a172':'#a77b4e';
  c.fillRect(dx,-h/2+1,10,h-2);
  c.strokeStyle='#6e5239c5';c.lineWidth=1.2;
  c.beginPath();c.moveTo(dx+10,-h/2+2);c.lineTo(dx+10,h/2-2);c.stroke();
 }
 for(const side of [-1,1]){
  const railY=side*(h/2+5);
  c.strokeStyle='#3d554b';c.lineWidth=5;
  c.beginPath();c.moveTo(-w/2+5,railY);c.lineTo(w/2-5,railY);c.stroke();
  c.strokeStyle='#dbb583';c.lineWidth=3;
  c.beginPath();c.moveTo(-w/2+5,railY-3);c.lineTo(w/2-5,railY-3);c.stroke();
  for(let xx=-w/2+6;xx<=w/2-5;xx+=22){
   rounded(c,xx-4,railY-7,8,14,2,'#6c543a','#3b4942');
  }
 }
 c.restore();
}
function drawBoardwalk(c,b){
 strokePolyline(c,b.points,'#5b5643',b.width+10);
 strokePolyline(c,b.points,'#b28a56',b.width);
 for(let j=1;j<b.points.length;j++){
  const [ax,ay]=b.points[j-1],[bx,by]=b.points[j];
  const length=Math.hypot(bx-ax,by-ay),angle=Math.atan2(by-ay,bx-ax);
  for(let d=0;d<length;d+=13){
   const x=ax+(bx-ax)*d/length,y=ay+(by-ay)*d/length;
   c.save();c.translate(x,y);c.rotate(angle);
   c.strokeStyle='#5d533ead';c.lineWidth=2;
   c.beginPath();c.moveTo(0,-b.width/2+3);c.lineTo(0,b.width/2-3);c.stroke();
   c.restore();
  }
 }
}
function drawGrassDetail(c){
 const rng=random(41410);
 for(let i=0;i<3500;i++){
  const x=195+rng()*1995,y=230+rng()*1270;
  const area=terrainAt(x,y);
  if(area==='north'||area==='west'||area==='south'||area==='east'||area==='center'){
   const zone=regionAt(x,y);
   c.strokeStyle=zone==='south'?'#b1aa6299':zone==='north'?'#4d825599':'#718f5499';
   c.lineWidth=1.7;
   c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y-4-rng()*3);
   c.moveTo(x,y);c.lineTo(x+3,y-3-rng()*5);c.stroke();
  }
 }
}
function drawStatic(c,pack){
 drawSea(c,pack);drawBiomeGround(c,pack);drawMountains(c);
 drawWesternCliffs(c);drawEasternShore(c);drawSouthernBeach(c,pack);
 drawSwamp(c);drawPathNetwork(c);drawRiver(c,pack);
 for(const b of BRIDGES)drawBridge(c,b,pack);
 for(const b of BOARDWALKS)drawBoardwalk(c,b);
 drawGrassDetail(c);
}
function drawVectorTree(c,o){
 const {x,y,scale}=o,s=scale*(o.zone==='north'?1.1:.93);
 c.save();c.translate(x,y);c.scale(s,s);
 oval(c,1,4,30,12,'#253d3042');
 rounded(c,-7,-45,14,49,5,'#856544','#473e29');
 for(let k=0;k<8;k++){
  const a=k*TAU/8,xx=Math.cos(a)*27,yy=Math.sin(a)*12-46;
  oval(c,xx,yy,27,25,o.zone==='south'?
   ['#cfa65a','#e3c56b','#a9a85e'][k%3]:
   o.zone==='north'?['#245b53','#287463','#39745e'][k%3]:
   ['#619b62','#77aa66','#58976c'][k%3]);
 }
 c.restore();
}
function drawSprite(c,img,o){
 const s=o.scale||1;
 const key=o.kind==='tree'?
  o.zone==='north'?(o.variant%2?'tree1':'tree2'):
  o.zone==='south'?(o.variant%2?'tree4':'tree3'):
  o.variant%2?'tree3':'tree4':
  o.kind==='bush'?'bush'+(o.variant%4+1):
  o.kind==='rock'?'rock'+(o.variant%4+1):null;
 const rect=atlasCuts[key];
 if(!rect||!img?.naturalWidth)return false;
 const [sx,sy,sw,sh]=rect;
 const h=o.kind==='tree'?(o.zone==='north'?105:o.zone==='south'?86:93)*s:
  o.kind==='rock'?30*s:29*s;
 const w=h*sw/sh;
 oval(c,o.x,o.y+3,
  o.kind==='tree'?23*s:10*s,7*s,'#203a2b38');
 c.drawImage(img,sx,sy,sw,sh,o.x-w/2,o.y-h+9,w,h);
 return true;
}
function drawDeadTree(c,o){
 c.save();c.translate(o.x,o.y);c.scale(o.scale,o.scale);
 oval(c,1,2,16,6,'#33483a54');
 c.lineCap='round';c.strokeStyle='#665c4b';c.lineWidth=8;
 c.beginPath();c.moveTo(0,0);c.lineTo(0,-40);
 c.lineTo(-12,-60);c.moveTo(0,-40);c.lineTo(21,-59);
 c.moveTo(6,-29);c.lineTo(29,-33);c.stroke();
 c.lineWidth=3;c.strokeStyle='#b6ac8c';
 c.beginPath();c.moveTo(-12,-60);c.lineTo(-20,-69);
 c.moveTo(21,-59);c.lineTo(24,-70);
 c.moveTo(28,-33);c.lineTo(36,-41);c.stroke();c.restore();
}
function drawReeds(c,o){
 c.save();c.translate(o.x,o.y);
 c.strokeStyle='#496e4c';c.lineWidth=2.4;
 for(let i=0;i<5;i++){
  const xx=(i-2)*4;
  c.beginPath();c.moveTo(xx,0);
  c.quadraticCurveTo(xx-3,-15,xx+(i%2?3:-2),-23-(i%3)*5);c.stroke();
  if(i%2===0){
   oval(c,xx+(i%2?3:-2),-22-(i%3)*5,3,6,'#b18b54');
  }
 }
 c.restore();
}
function drawObject(c,img,o,pack){
 if(o.kind==='rock'&&drawTinyRock(c,pack,o))return;
 if(o.kind==='dead-tree')return drawDeadTree(c,o);
 if(o.kind==='reeds')return drawReeds(c,o);
 if(!drawSprite(c,img,o)){
  if(o.kind==='tree')drawVectorTree(c,o);
  else if(o.kind==='rock'){
   oval(c,o.x+1,o.y+2,15,9,'#36493846');
   oval(c,o.x,o.y-5,15,12,'#8d9185');
   oval(c,o.x-5,o.y-9,7,5,'#c8c6b0');
  }else{
   oval(c,o.x,o.y-8,18,13,'#6d9b61');
   oval(c,o.x-5,o.y-13,10,6,'#9dc077');
  }
 }
}
function drawHouse(c,x,y,scale=1,tint='#c99f62'){
 c.save();c.translate(x,y);c.scale(scale,scale);
 oval(c,3,12,48,15,'#4f574652');
 rounded(c,-34,-42,68,58,7,'#e7d4a5','#776345');
 rounded(c,-9,-22,18,36,5,'#72543a','#563e29');
 rounded(c,-27,-22,12,14,2,'#7499a5','#554d40');
 rounded(c,18,-22,12,14,2,'#7499a5','#554d40');
 c.beginPath();c.moveTo(-46,-37);c.quadraticCurveTo(-12,-90,0,-91);
 c.quadraticCurveTo(20,-93,48,-37);c.closePath();fill(c,tint);
 c.strokeStyle='#715337';c.lineWidth=3;c.stroke();
 for(let i=-38;i<44;i+=10){
  c.beginPath();c.moveTo(i,-48);c.lineTo(i+7,-52);
  c.strokeStyle='#f5d8878a';c.lineWidth=2;c.stroke();
 }
 c.restore();
}
function drawLandmark(c,l,time){
 c.save();c.translate(l.x,l.y);
 if(l.kind==='ruins'){
  for(let i=0;i<9;i++){
   const a=TAU*i/9,xx=Math.cos(a)*42,yy=Math.sin(a)*20;
   oval(c,xx,yy+4,12,6,'#41574655');
   rounded(c,xx-7,yy-24,14,25,3,'#bdb9a3','#747e74');
   rounded(c,xx-9,yy-26,18,6,2,'#d7cdb4');
  }
  oval(c,0,-2,16,8,'#d5c8aa');
 }else if(l.kind==='windmill'){
  oval(c,0,9,48,17,'#3e574354');
  rounded(c,-28,-38,55,49,7,'#e9d9ae','#80674a');
  c.beginPath();c.moveTo(-38,-36);c.lineTo(-2,-64);c.lineTo(36,-36);
  c.closePath();fill(c,'#b86f4c');
  rounded(c,-8,-20,15,30,3,'#705443');
  c.save();c.translate(0,-57);c.rotate(time*.25);
  c.fillStyle='#f4e6c2';c.strokeStyle='#9c7552';c.lineWidth=2;
  for(let i=0;i<4;i++){
   c.save();c.rotate(i*PI/2);
   c.beginPath();c.moveTo(-5,-4);c.lineTo(-12,-51);
   c.lineTo(13,-51);c.lineTo(5,-4);c.closePath();c.fill();c.stroke();
   c.restore();
  }
  oval(c,0,0,6,6,'#6d5134');c.restore();
 }else if(l.kind==='lighthouse'){
  oval(c,0,15,37,13,'#34495363');
  rounded(c,-19,-98,38,102,9,'#ddd5bb','#77766e');
  for(let i=0;i<4;i++){
   c.strokeStyle='#eae3d2';c.lineWidth=4;
   c.beginPath();c.moveTo(-16,-72+i*21);c.lineTo(16,-72+i*21);c.stroke();
  }
  rounded(c,-22,-101,44,19,6,'#b65e42','#603f36');
  c.beginPath();c.arc(0,-106,16,PI,TAU);fill(c,'#cd8154');
  rounded(c,-6,-96,12,14,2,'#f8e9a9');
 }else if(l.kind==='cave'){
  c.beginPath();c.arc(0,8,45,PI,TAU);c.lineTo(45,22);c.lineTo(-45,22);
  c.closePath();fill(c,'#999991');
  c.beginPath();c.arc(0,17,24,PI,TAU);
  c.lineTo(24,24);c.lineTo(-24,24);c.closePath();fill(c,'#273834');
 }else if(l.kind==='swamp-hut'){
  oval(c,0,7,45,19,'#375d5455');
  rounded(c,-27,-32,54,41,5,'#9f7b54','#554c3b');
  c.beginPath();c.moveTo(-38,-34);c.lineTo(0,-61);c.lineTo(38,-34);
  c.closePath();fill(c,'#9c8e5e');
  rounded(c,-6,-16,14,25,3,'#504a35');
 }else if(l.kind==='village'){
  // Square and fishing racks. Cottages are separately positioned geometry.
  oval(c,0,14,81,37,'#dbc18b88',.64);
  rounded(c,-19,-13,38,26,4,'#cba36a','#6f593e');
  rounded(c,-5,-22,10,10,2,'#68806a');
  for(const xx of [-78,61]){
   c.strokeStyle='#72563d';c.lineWidth=4;
   c.beginPath();c.moveTo(xx,53);c.lineTo(xx,18);
   c.lineTo(xx+32,18);c.lineTo(xx+32,53);c.stroke();
   for(let i=0;i<3;i++)oval(c,xx+7+i*8,31,3.3,9,'#73a5a9');
  }
 }else if(l.kind==='dock'){
  // Posts and boards extend south into the shallow southern sea visually.
  rounded(c,-27,-43,54,123,3,'#af8d5d','#675137');
  for(let yy=-37;yy<78;yy+=14){
   c.strokeStyle='#70533991';c.lineWidth=2;
   c.beginPath();c.moveTo(-24,yy);c.lineTo(25,yy);c.stroke();
  }
  for(const x of [-32,31])for(const y of [-30,15,66])
   oval(c,x,y,5,5,'#655039');
  c.save();c.translate(75,35);
  oval(c,0,0,35,14,'#775b3b');oval(c,0,-3,26,8,'#c5ad77');
  c.restore();
 }
 c.restore();
}
function drawHero(c,p,time){
 const {x,y,dirX=0,dirY=1,moving=false,running=false}=p;
 const phase=time*(running?11:7.8),step=moving?Math.sin(phase):0;
 c.save();c.translate(x,y);
 const side=dirX<-.3?-1:1,back=dirY<-.36;
 c.scale(side*HERO_VISUAL.height/80,HERO_VISUAL.height/80);
 oval(c,0,5,16,6,'#263c334b');
 // Boots, short pants, body and head: independent 2D shapes with clean ink.
 for(const k of [-1,1]){
  const dy=step*k*4;
  rounded(c,k*7-6,-3+dy,12,19,4,'#64513c','#342e2b');
  rounded(c,k*7-6,8+dy,13,7,3,'#956342','#48382f');
 }
 c.save();c.translate(0,moving?Math.abs(step)*1.3:Math.sin(time*1.7)*.5);
 // arms sway opposite to legs
 for(const k of [-1,1]){
  const swing=step*k*3;
  rounded(c,k*17-5,-34+swing,10,27,5,'#71815c','#394936');
  oval(c,k*19,-7+swing,5,6,'#e6b68f');
 }
 rounded(c,-16,-41,32,37,8,'#899166','#3e4f3c');
 c.strokeStyle='#d3b98e';c.lineWidth=3;
 c.beginPath();c.moveTo(-15,-15);c.lineTo(16,-15);c.stroke();
 // Crossbody satchel and strap visible from front / back.
 c.strokeStyle='#986744';c.lineWidth=5;
 c.beginPath();c.moveTo(back?13:-13,-40);
 c.lineTo(back?-9:10,-12);c.stroke();
 rounded(c,back?-19:9,-19,14,17,5,'#ac724c','#5f4536');
 // face or nape
 oval(c,0,-52,17,18,back?'#78543a':'#ebbb92');
 if(!back){
  for(const eye of [-1,1]){
   oval(c,eye*6,-53,2.7,3,'#362e28');
  }
  oval(c,-7,-45,2,1,'#c57e65');oval(c,7,-45,2,1,'#c57e65');
 }
 // Soft cap and tousled hair — not a blocky geometric model.
 c.beginPath();c.ellipse(0,-63,19,11,-.14,0,TAU);fill(c,'#75513b');
 c.beginPath();c.ellipse(4,-69,17,10,.25,0,TAU);fill(c,'#9a7857');
 c.strokeStyle='#514135';c.lineWidth=2;c.stroke();
 c.restore();c.restore();
}
export function createOverworldRenderer(canvas,model){
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw Error('Canvas2D unavailable');
 const terrain=document.createElement('canvas');
 terrain.width=WORLD.width;terrain.height=WORLD.height;
 const paint=terrain.getContext('2d',{alpha:false});
 drawStatic(paint);
 let image=null,pack=null,assetState='loading',packState='loading',lastErr=null;
 // Single bitmap for stationary scenery; critical for mobile framerate.
 const panorama=document.createElement('canvas');
 panorama.width=WORLD.width;panorama.height=WORLD.height;
 const pano=panorama.getContext('2d',{alpha:false});
 let panoramaReady=false;
 function buildPanorama(){
  pano.drawImage(terrain,0,0);
  const all=model.objects.map(obj=>({y:obj.y,kind:'object',obj}))
   .concat(LANDMARKS.map(obj=>({y:obj.y,kind:'landmark',obj})))
   .concat(VILLAGE_BUILDINGS.map(obj=>({y:obj.y,kind:'cottage',obj})));
  all.sort((a,b)=>a.y-b.y);
  for(const p of all){
   if(p.kind==='object')drawObject(pano,image,p.obj,pack);
   else if(p.kind==='cottage'){
    if(!drawTinyHouse(pano,pack,p.obj))
     drawHouse(pano,p.obj.x,p.obj.y,p.obj.scale,p.obj.roof);
   }
   else drawLandmark(pano,p.obj,0);
  }
  panoramaReady=true;
 }
 buildPanorama();
 const resource=new Image();
 resource.onload=()=>{image=resource;buildPanorama();assetState='loaded';};
 resource.onerror=()=>{assetState='fallback';lastErr='Tiny Swords artwork did not load';};
 resource.src=new URL('./assets/tiny-overworld.webp',import.meta.url);
 loadTinyVillageArt().then(img=>{
  pack=img;packState='loaded';
  paint.clearRect(0,0,WORLD.width,WORLD.height);
  drawStatic(paint,pack);
  buildPanorama();
 }).catch(err=>{
  packState='fallback';lastErr=String(err);
  console.warn('Tiny Swords buildings/bridges/terrain unavailable; keeping fallback',err);
 });
 let w=0,h=0,dpr=1;
 function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  w=window.innerWidth;h=window.innerHeight;
  canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);
  canvas.style.width=w+'px';canvas.style.height=h+'px';
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 }
 function draw(frame){
  if(w!==innerWidth||h!==innerHeight)resize();
  const {camera,player,time=0,overview=false}=frame;
  const zoom=overview?Math.min((w-40)/WORLD.width,(h-40)/WORLD.height):
   camera.zoom;
  const cameraX=overview?WORLD.width/2:camera.x;
  const cameraY=overview?WORLD.height/2:camera.y;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  // Paint a continuous ocean beyond the world bitmap at coastal edges;
  // alpha:false canvases otherwise reveal a black strip on wide screens.
  ctx.fillStyle='#207f94';
  ctx.fillRect(0,0,w,h);
  ctx.save();
  ctx.translate(w/2,h/2);
  ctx.scale(zoom,zoom);
  ctx.translate(-cameraX,-cameraY);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(panoramaReady?panorama:terrain,0,0);
  drawHero(ctx,player,time);
  // Very close foreground crowns conceal the player when appropriate.
  if(!overview){
   for(const o of model.objects){
    if(o.kind!=='tree'||o.y<=player.y||o.y>player.y+48)continue;
    if(Math.abs(o.x-player.x)<41)drawObject(ctx,image,o,pack);
   }
   // Roofs/walls obscure a hero walking behind a house, as in classic
   // top-down games. In front of the door, the hero remains visible.
   for(const hut of VILLAGE_BUILDINGS){
    if(player.y>=hut.y||player.y<hut.y-100*hut.scale)continue;
    if(Math.abs(player.x-hut.x)<55*hut.scale)
     if(!drawTinyHouse(ctx,pack,hut))
      drawHouse(ctx,hut.x,hut.y,hut.scale,hut.roof);
   }
  }
  ctx.restore();
  if(overview){
   ctx.save();
   ctx.strokeStyle='#fff6d9';ctx.lineWidth=2;ctx.strokeRect(
    (w-WORLD.width*zoom)/2,(h-WORLD.height*zoom)/2,
    WORLD.width*zoom,WORLD.height*zoom);
   ctx.restore();
  }
 }
 function drawMiniMap(target,width=170,height=116,player){
  const c=target.getContext('2d'),d=Math.min(window.devicePixelRatio||1,2);
  target.width=Math.floor(width*d);target.height=Math.floor(height*d);
  c.setTransform(d,0,0,d,0,0);
  c.drawImage(terrain,0,0,width,height);
  c.fillStyle='#fff2c0';c.strokeStyle='#3e4435';c.lineWidth=1.8;
  c.beginPath();c.arc(player.x/WORLD.width*width,
   player.y/WORLD.height*height,4.8,0,TAU);c.fill();c.stroke();
 }
 return {
  draw,resize,drawMiniMap,get assetState(){return assetState;},
  get assetError(){return lastErr;},
  get assetPackState(){return packState;},
  get treeCount(){return model.objects.filter(o=>o.kind==='tree').length;},
  background:terrain
 };
}
