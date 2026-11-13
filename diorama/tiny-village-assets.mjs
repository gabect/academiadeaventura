/**
 * Tiny Swords game-use art atlas, compiled from user-provided Tiny Swords
 * (Update 010) and Tiny Swords Free Pack. Original art: Pixel Frog.
 * Rendered in-game only; not a standalone redistribution of assets.
 *
 * 1024x1024 atlas, source pixel rectangles; all house coordinates are
 * authored in the same logical world units as their collision footprints.
 */
export const TINY_VILLAGE_ATLAS_URL=new URL('./assets/tiny-village-terrain.webp?v=1',import.meta.url).href;
export const TINY_RECTS=Object.freeze({
 house0:[0,0,128,192],house1:[144,0,128,192],
 house2:[288,0,128,192],house3:[432,0,128,192],
 house4:[576,0,128,192],
 bridgeHorizontal:[0,224,160,61],
 bridgeVertical:[190,224,65,165],
 rock0:[300,224,64,64],rock1:[380,224,64,64],
 rock2:[460,224,64,64],rock3:[540,224,64,64],
 grassTile:[0,458,96,96],sandTile:[112,458,96,96],
 waterTile:[224,458,64,64],foam:[315,458,192,95],
 cliff:[520,458,128,160],
 tool0:[680,458,64,64],tool1:[760,458,64,64],
 tool2:[840,458,64,64],tool3:[920,458,64,64]
});
export function loadTinyVillageArt(){
 return new Promise((resolve,reject)=>{
  const image=new Image();
  image.onload=()=>resolve(image);
  image.onerror=()=>reject(new Error('Tiny Swords building/bridge atlas failed to load'));
  image.src=TINY_VILLAGE_ATLAS_URL;
 });
}
export function drawTinyRegion(ctx,img,name,x,y,width,height){
 const rect=TINY_RECTS[name];
 if(!img?.naturalWidth||!rect)return false;
 ctx.drawImage(img,...rect,x,y,width,height);
 return true;
}
export function drawTinyHouse(ctx,img,house){
 const r=TINY_RECTS[house.sprite]||TINY_RECTS.house0;
 const w=r[2]*house.scale,h=r[3]*house.scale;
 // Source row 172 is the physical base; the remaining 20 rows are transparent.
 return drawTinyRegion(ctx,img,house.sprite,
  house.x-w/2,house.y-172*house.scale,w,h);
}
export function drawTinyBridge(ctx,img,bridge){
 if(!img?.naturalWidth)return false;
 const {x,y,w,h}=bridge;
 return drawTinyRegion(ctx,img,'bridgeHorizontal',
  x-w/2-5,y-h/2-4,w+10,h+8);
}
export function drawTinyRock(ctx,img,rock){
 if(!img?.naturalWidth)return false;
 const i=rock.variant%4,scale=rock.scale||1;
 const h=34*scale,w=h;
 return drawTinyRegion(ctx,img,'rock'+i,rock.x-w/2,rock.y-h+5,w,h);
}
export function tilePattern(ctx,image,key){
 const rect=TINY_RECTS[key];
 if(!rect||!image?.naturalWidth)return null;
 const [, ,w,h]=rect;
 const tile=document.createElement('canvas');
 tile.width=w;tile.height=h;
 tile.getContext('2d').drawImage(image,...rect,0,0,w,h);
 return ctx.createPattern(tile,'repeat');
}
