/** Opt-in visual material study for the existing mountain heightfield.
 * Textures are deterministic, periodic and generated at startup: no network,
 * CDN or second terrain/physics mesh. Replace with commissioned HD tiles later.
 */
export function createMountainStudioTextures(THREE,{size=384}={}){
 if(!Number.isInteger(size)||size<64||size>1024)throw Error('Invalid studio texture size');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
 const hash=(x,y,s)=>{
  let h=(Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s|0,1442695041))|0;
  h=Math.imul(h^(h>>>13),1274126177);
  return ((h^(h>>>16))>>>0)/4294967295;
 };
 // Exact period on both axes, including all octaves.
 const cachedGrids=new Map();
 const gridFor=(period,seed)=>{
  const key=period+':'+seed;
  let grid=cachedGrids.get(key);
  if(grid)return grid;
  grid=new Float32Array(period*period);
  for(let j=0;j<period;j++)for(let i=0;i<period;i++)
   grid[j*period+i]=hash(i,j,seed);
  cachedGrids.set(key,grid);
  return grid;
 };
 const noise=(u,v,period,seed)=>{
  const grid=gridFor(period,seed);
  const x=u*period,y=v*period,ix=Math.floor(x),iy=Math.floor(y);
  const fx=x-ix,fy=y-iy,tx=fx*fx*(3-2*fx),ty=fy*fy*(3-2*fy);
  const x0=((ix%period)+period)%period,x1=(x0+1)%period;
  const y0=((iy%period)+period)%period,y1=(y0+1)%period;
  const i0=y0*period,i1=y1*period;
  const v0=grid[i0+x0]*(1-tx)+grid[i0+x1]*tx;
  const v1=grid[i1+x0]*(1-tx)+grid[i1+x1]*tx;
  return v0*(1-ty)+v1*ty;
 };
 const cells=8;
 const centerX=new Float32Array(cells*cells),centerY=new Float32Array(cells*cells);
 for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){
  centerX[j*cells+i]=.23+.54*hash(i,j,41);
  centerY[j*cells+i]=.23+.54*hash(i,j,67);
 }
 function fracture(u,v){
  const x=u*cells,y=v*cells,ix=Math.floor(x),iy=Math.floor(y);
  let near=1e9,next=1e9;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const cx=ix+dx,cy=iy+dy;
   const j=((cy%cells)+cells)%cells,i=((cx%cells)+cells)%cells;
   const px=cx+centerX[j*cells+i],py=cy+centerY[j*cells+i];
   const d=(x-px)**2+(y-py)**2;
   if(d<near){next=near;near=d;}else if(d<next)next=d;
  }
  return {edge:smooth(.03,.24,next-near),cell:Math.sqrt(near)};
 }
 function make(kind){
  const data=new Uint8Array(size*size*4),rock=kind==='rock';
  const put=(i,r,g,b)=>{
   data[i]=Math.round(clamp(r/255)*255);data[i+1]=Math.round(clamp(g/255)*255);
   data[i+2]=Math.round(clamp(b/255)*255);data[i+3]=255;
  };
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const u=x/size,v=y/size,i=(y*size+x)*4;
   const broad=noise(u,v,4,10),medium=noise(u,v,16,11),
    fine=noise(u,v,64,12),grain=noise(u,v,128,13);
   if(rock){
    const warp=(noise(u,v,8,88)-.5)*.08;
    const crack=fracture((u+warp+1)%1,(v+warp+1)%1);
    const veins=Math.sin((v*10+u*2+(broad-.5)*1.4)*Math.PI*2);
    const plate=1-smooth(.28,.8,crack.cell);
    const shade=78+50*broad+28*medium+13*(fine-.5)+8*veins+12*plate;
    const seam=(1-crack.edge)*(32+12*medium);
    // Small moss clusters follow fissures but never fill the whole stone.
    const moss=smooth(.51,.76,noise(u,v,8,46))*
      (.12+.69*(1-crack.edge))*(.4+.6*medium);
    const light=shade-seam+10*(grain-.5);
    put(i,light*(1-moss)+60*moss,light*1.01*(1-moss)+111*moss,
      light*.97*(1-moss)+40*moss);
   }else{
    const blades=noise(u,v,64,51),moss=noise(u,v,16,52);
    const patches=noise(u,v,8,53);
    const wisps=Math.pow(Math.max(0,Math.sin((u*96+(medium-.5)*9)*Math.PI*2)),6);
    const lit=patches*31+medium*20+fine*22+grain*10+wisps*17;
    put(i,38+lit*.63+blades*15,81+lit+blades*30+moss*16,
      18+lit*.30+blades*13);
   }
  }
  const tex=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.magFilter=THREE.LinearFilter;
  tex.minFilter=THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps=true;tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=4;tex.needsUpdate=true;
  return tex;
 }
 return {rock:make('rock'),grass:make('grass')};
}
