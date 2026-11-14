/**
 * Sprite-only scene renderer. Visible world objects come exclusively from the
 * approved image atlases: tiled surfaces, houses, bridges, trees, shrubs,
 * rocks and articulated character cutouts. No procedural buildings or
 * geometric mountain meshes are drawn.
 */
import {WORLD,TILE,HOUSES,BRIDGES,ROADS,ART,tileAt} from './mundo-sprites-model.mjs';
import {TINY_RECTS} from './tiny-village-assets.mjs';
import {BONE_ATLAS} from './assets/vector-bone-manifest.mjs';
const TREES = Object.freeze({
  solo:['solo',0,0,1238,1240],
  round:['trees',49,12,587,644],
  palm:['trees',748,29,570,628],
  pine:['trees',1475,9,490,647],
  bush0:['bushes',43,21,435,302],bush1:['bushes',552,25,437,299],
  bush2:['bushes',1064,24,434,299],bush3:['bushes',1600,43,379,278],
  bush4:['bushes',59,427,402,221],bush5:['bushes',567,407,413,240],
  bush6:['bushes',1084,360,400,288],bush7:['bushes',1622,456,345,191]
});
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const im=new Image();
    im.onload=()=>im.naturalWidth?resolve(im):reject(new Error('Imagen vacía: '+src));
    im.onerror=()=>reject(new Error('No se pudo cargar '+src));
    im.src=src;
  });
}
function drawRegion(c,image,rectangle,x,y,w,h){
  if(!image||!rectangle)return;
  c.drawImage(image,...rectangle,x,y,w,h);
}
const terrainRects = {
  [TILE.GRASS]:'grassTile',[TILE.FOREST]:'grassTile',
  [TILE.DRY]:'sandTile',[TILE.SAND]:'sandTile',
  [TILE.ROCK]:'cliff',[TILE.CLIFF]:'cliff',
  [TILE.WATER]:'waterTile',[TILE.PATH]:'sandTile',
  [TILE.MARSH]:'grassTile',[TILE.SHALLOW]:'waterTile'
};
function drawGroundTiles(c,images,model,x0,y0,x1,y1){
  const t=WORLD.tile;
  const col0=Math.max(0,Math.floor(x0/t)-2),col1=Math.min(WORLD.columns-1,Math.ceil(x1/t)+2);
  const row0=Math.max(0,Math.floor(y0/t)-2),row1=Math.min(WORLD.rows-1,Math.ceil(y1/t)+2);
  for(let row=row0;row<=row1;row++)for(let col=col0;col<=col1;col++){
    const id=model.tiles[row*WORLD.columns+col],x=col*t,y=row*t;
    // Overpaint fractional edges to prevent floating-point hairline seams.
    const dx=x-.35,dy=y-.35,s=t+.7;
    if(id===TILE.GRASS||id===TILE.FOREST||id===TILE.MARSH||id===TILE.DRY||id===TILE.PATH){
      if(images.grass)drawRegion(c,images.grass,[0,0,images.grass.width,images.grass.height],dx,dy,s,s);
      else drawRegion(c,images.terrain,TINY_RECTS.grassTile,dx,dy,s,s);
    }else if(id===TILE.ROCK&&images.rock){
      drawRegion(c,images.rock,[0,0,images.rock.width,images.rock.height],dx,dy,s,s);
    }else{
      drawRegion(c,images.terrain,TINY_RECTS[terrainRects[id]],dx,dy,s,s);
    }
    if([TILE.GRASS,TILE.FOREST,TILE.DRY,TILE.MARSH,TILE.PATH].includes(id)){
      c.save();c.globalAlpha=id===TILE.FOREST?.19:.14;
      c.fillStyle=id===TILE.FOREST?'#3b6354':'#668255';
      c.fillRect(dx,dy,s,s);c.restore();
    }
    if(id===TILE.DRY){
      c.save();c.globalAlpha=Math.min(.24,.045+Math.max(0,y-2050)/600*.18);
      drawRegion(c,images.terrain,TINY_RECTS.sandTile,dx,dy,s,s);c.restore();
    }
    if(id===TILE.FOREST&&images.dense){
      c.save();c.globalAlpha=.10;
      drawRegion(c,images.dense,[0,0,images.dense.width,images.dense.height],dx,dy,s,s);c.restore();
    }
    if(id===TILE.MARSH){
      c.save();c.globalAlpha=.25;
      drawRegion(c,images.terrain,TINY_RECTS.waterTile,dx,dy,s,s);c.restore();
    }
    if(id===TILE.CLIFF){
      // A multi-tile mountain ledge rendered from the authored cliff sprite,
      // never an extruded world-space box.
      drawRegion(c,images.terrain,TINY_RECTS.cliff,x-2,y-26,t+4,t+33);
    }
    if(id===TILE.WATER){
      // Only shoreline cells get a transparent surf texture.
      const north=row>0?model.tiles[(row-1)*WORLD.columns+col]:TILE.WATER;
      const south=row<WORLD.rows-1?model.tiles[(row+1)*WORLD.columns+col]:TILE.WATER;
      if(north!==TILE.WATER||south!==TILE.WATER){
        c.save();c.globalAlpha=.46;
        drawRegion(c,images.terrain,TINY_RECTS.foam,x,y,t,t/2);
        c.restore();
      }
    }
  }

  // All intersecting routes are stroked as ONE silhouette, avoiding
  // darker rectangular overlaps where roads meet or split.
  if(images.terrain){
    const px=Math.floor(x0/512)*512,py=Math.floor(y0/512)*512;
    function roadMask(width){
      const mask=document.createElement('canvas');
      mask.width=512;mask.height=512;
      const g=mask.getContext('2d');
      g.translate(-px,-py);
      g.beginPath();
      for(const route of ROADS){
        g.moveTo(route[0][0],route[0][1]);
        for(let i=1;i<route.length;i++)g.lineTo(route[i][0],route[i][1]);
      }
      g.lineCap='round';g.lineJoin='round';
      g.lineWidth=width;g.strokeStyle='#fff';g.stroke();
      return {mask,g};
    }
    const shoulder=roadMask(102);
    shoulder.g.globalCompositeOperation='source-in';
    shoulder.g.fillStyle='#967c4b';
    shoulder.g.fillRect(px,py,512,512);
    c.save();c.globalAlpha=.25;c.drawImage(shoulder.mask,px,py);c.restore();
    const road=roadMask(86);
    const rect=TINY_RECTS.sandTile;
    const tile=document.createElement('canvas');
    tile.width=rect[2];tile.height=rect[3];
    tile.getContext('2d').drawImage(images.terrain,...rect,0,0,rect[2],rect[3]);
    road.g.globalCompositeOperation='source-in';
    road.g.fillStyle=road.g.createPattern(tile,'repeat');
    road.g.fillRect(px,py,512,512);
    c.save();c.globalAlpha=.79;c.drawImage(road.mask,px,py);c.restore();
  }
}

const CHUNK_SIZE=512;
const terrainCache=new Map();
function drawGround(c,images,model,x0,y0,x1,y1){
  if(!images.terrain)return;
  const c0=Math.max(0,Math.floor(x0/CHUNK_SIZE));
  const c1=Math.min(Math.ceil(WORLD.width/CHUNK_SIZE)-1,Math.floor(x1/CHUNK_SIZE));
  const r0=Math.max(0,Math.floor(y0/CHUNK_SIZE));
  const r1=Math.min(Math.ceil(WORLD.height/CHUNK_SIZE)-1,Math.floor(y1/CHUNK_SIZE));
  for(let row=r0;row<=r1;row++)for(let col=c0;col<=c1;col++){
    const key=row*100+col,px=col*CHUNK_SIZE,py=row*CHUNK_SIZE;
    let chunk=terrainCache.get(key);
    if(!chunk){
      chunk=document.createElement('canvas');
      chunk.width=CHUNK_SIZE;chunk.height=CHUNK_SIZE;
      const g=chunk.getContext('2d',{alpha:false});
      g.translate(-px,-py);
      drawGroundTiles(g,images,model,px,py,px+CHUNK_SIZE,py+CHUNK_SIZE);
      terrainCache.set(key,chunk);
      if(terrainCache.size>32)terrainCache.delete(terrainCache.keys().next().value);
    }
    c.drawImage(chunk,px-1.3,py-1.3,CHUNK_SIZE+2.6,CHUNK_SIZE+2.6);
  }
}

function drawBridge(c,image,b){
  const name=b.orientation==='vertical'?'bridgeVertical':'bridgeHorizontal';
  drawRegion(c,image,TINY_RECTS[name],b.x-b.w/2,b.y-b.h/2,b.w,b.h);
}
function drawHouse(c,image,house){
  const r=TINY_RECTS[house.sprite];
  const w=r[2]*house.scale,h=r[3]*house.scale;
  drawRegion(c,image,r,house.x-w/2,house.y-172*house.scale,w,h);
}
function drawProp(c,images,p){
  const key=p.sprite;
  if(p.kind==='rock'){
    const r=TINY_RECTS[key]||TINY_RECTS.rock0;
    drawRegion(c,images.terrain,r,p.x-p.height/2,p.y-p.height,p.height,p.height);
    return;
  }
  const cut=TREES[key];
  if(!cut)return;
  const [source,sx,sy,sw,sh]=cut,h=p.height,w=h*sw/sh;
  const image=images[source];
  if(image)drawRegion(c,image,[sx,sy,sw,sh],p.x-w/2,p.y-h+5,w,h);
}
const BONE_ORDER=['legLU','legLL','legRU','legRL','torso','armLU','armLL','armRU','armRL','bag','head'];
function drawHero(c,image,player,time){
  if(!image)return;
  const heading=player.direction||'front';
  const viewKey=heading==='back'?'back':heading==='side'?'side':'front';
  const view=BONE_ATLAS.views[viewKey];
  const scale=WORLD.heroHeight/view.height;
  const swing=player.moving?Math.sin(time*(player.running?14:9))*.75:0;
  c.save();
  c.translate(player.x,player.y);
  if(heading==='side'&&player.facingX<0)c.scale(-1,1);
  // Character shadow is the only drawn primitive: a flat contact mark, not a world prop.
  c.save();c.globalAlpha=.21;c.fillStyle='#26362a';
  c.beginPath();c.ellipse(0,0,18,6,0,0,Math.PI*2);c.fill();c.restore();
  for(const partName of BONE_ORDER){
    const part=view.parts[partName];
    if(!part)continue;
    const [l,t,r,b]=part.bbox;
    const [sx,sy,sw,sh]=part.atlas;
    const phase=partName.includes('leg')?(partName[3]==='L'?-1:1):
      partName.includes('arm')?(partName[3]==='L'?1:-1):0;
    const movement=phase*swing*2.4;
    const bounce=player.moving?Math.abs(swing)*1.4:0;
    c.drawImage(image,sx,sy,sw,sh,
      (l-view.width/2)*scale+movement,
      (t-view.height)*scale-bounce,
      (r-l)*scale,(b-t)*scale);
  }
  c.restore();
}
export function createSpriteRenderer(canvas,model){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)throw new Error('Se requiere Canvas 2D');
  const assets={
    terrain:new URL(ART.terrain,import.meta.url).href,
    trees:new URL(ART.treeCollection,import.meta.url).href,
    solo:new URL(ART.treeSolo,import.meta.url).href,
    bushes:new URL(ART.bushes,import.meta.url).href,
    character:new URL(ART.character,import.meta.url).href,
    grass:new URL('./assets/crayon-grass-seamless.webp',import.meta.url).href,
    rock:new URL('../assets/studio_hd/tiles/rock_quilt.webp',import.meta.url).href,
    dense:new URL('../assets/studio_hd/tiles/grass_dense.webp',import.meta.url).href
  };
  const images={};
  const status={ready:false,loaded:[],failed:[]};
  const ready=Promise.all(Object.entries(assets).map(async ([key,src])=>{
    try{images[key]=await loadImage(src);status.loaded.push(key);}
    catch(e){status.failed.push(key+': '+e.message);}
  })).then(()=>{terrainCache.clear();status.ready=!!images.terrain&&!!images.character&&!!images.trees;return status;});
  let width=0,height=0,dpr=1;
  function resize(){
    width=window.innerWidth;height=window.innerHeight;
    dpr=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  }
  const palette=['#95be6e','#679a56','#bdaf74','#e9cf8b','#8c8b7e',
    '#68695d','#3886a1','#c6a276','#63856d','#78bbc5'];
  const minimap=document.createElement('canvas');
  minimap.width=WORLD.columns*3;minimap.height=WORLD.rows*3;
  const mc=minimap.getContext('2d');
  for(let row=0;row<WORLD.rows;row++)for(let col=0;col<WORLD.columns;col++){
    const type=model.tiles[row*WORLD.columns+col];
    mc.fillStyle=palette[type];mc.fillRect(col*3,row*3,3,3);
  }
  for(const h of HOUSES){
    mc.fillStyle='#d18e55';
    mc.fillRect((h.x-75)/WORLD.width*minimap.width,
      (h.y-80)/WORLD.height*minimap.height,8,6);
  }
  function draw(frame){
    if(width!==innerWidth||height!==innerHeight)resize();
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle='#287d92';ctx.fillRect(0,0,width,height);
    const {camera,player,time=0,overview=false}=frame;
    if(overview){
      const fit=Math.min((width-30)/minimap.width,(height-30)/minimap.height);
      const dw=minimap.width*fit,dh=minimap.height*fit;
      const left=(width-dw)/2,top=(height-dh)/2;
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(minimap,left,top,dw,dh);
      const px=left+player.x/WORLD.width*dw,py=top+player.y/WORLD.height*dh;
      ctx.fillStyle='#fffae5';ctx.strokeStyle='#203a39';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fill();ctx.stroke();
      return;
    }
    const zoom=camera.zoom||1;
    const x0=camera.x-width/(2*zoom)-160,y0=camera.y-height/(2*zoom)-270;
    const x1=camera.x+width/(2*zoom)+160,y1=camera.y+height/(2*zoom)+170;
    ctx.save();ctx.translate(width/2,height/2);ctx.scale(zoom,zoom);ctx.translate(-camera.x,-camera.y);
    drawGround(ctx,images,model,x0,y0,x1,y1);
    if(images.terrain)for(const b of BRIDGES){
      if(b.x+b.w/2<x0||b.x-b.w/2>x1||b.y+b.h/2<y0||b.y-b.h/2>y1)continue;
      drawBridge(ctx,images.terrain,b);
    }
    const visible=[];
    for(const h of HOUSES){
      if(h.x<x0-250||h.x>x1+250||h.y<y0-200||h.y>y1+500)continue;
      visible.push({y:h.y,kind:'house',data:h});
    }
    for(const p of model.props){
      if(p.x<x0-170||p.x>x1+170||p.y<y0-110||p.y>y1+250)continue;
      visible.push({y:p.y,kind:'prop',data:p});
    }
    visible.push({y:player.y,kind:'hero'});
    visible.sort((a,b)=>a.y-b.y);
    for(const item of visible){
      if(item.kind==='house')drawHouse(ctx,images.terrain,item.data);
      else if(item.kind==='prop')drawProp(ctx,images,item.data);
      else drawHero(ctx,images.character,player,time);
    }
    ctx.restore();
  }
  function drawMinimap(target,player){
    const c=target.getContext('2d'),w=target.width,h=target.height;
    c.clearRect(0,0,w,h);c.imageSmoothingEnabled=false;
    c.drawImage(minimap,0,0,w,h);
    c.fillStyle='#fffbe4';c.strokeStyle='#173d39';c.lineWidth=2;
    c.beginPath();c.arc(player.x/WORLD.width*w,player.y/WORLD.height*h,4,0,Math.PI*2);
    c.fill();c.stroke();
  }
  return {draw,resize,drawMinimap,status,ready,get images(){return images;}};
}
