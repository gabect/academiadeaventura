import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
const folder='artifacts/mundo-sprites';
fs.mkdirSync(folder,{recursive:true});
async function saveFrame(page,file){
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const png=await page.evaluate(()=>window.__spriteWorld.screenshot());
  assert(png.startsWith('data:image/png;base64,'));
  fs.writeFileSync(folder+'/'+file+'.png',
    Buffer.from(png.slice('data:image/png;base64,'.length),'base64'));
}
const browser=await chromium.launch({
  headless:true,args:['--use-angle=swiftshader','--disable-dev-shm-usage','--no-sandbox']
});
try{
  for(const device of [
    {id:'desktop',width:1440,height:900,mobile:false},
    {id:'mobile-landscape',width:900,height:440,mobile:true}
  ]){
    const context=await browser.newContext({
      viewport:{width:device.width,height:device.height},
      deviceScaleFactor:1,hasTouch:device.mobile,isMobile:device.mobile
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    try{
      const response=await page.goto('http://127.0.0.1:8765/diorama/mundo-sprites.html',
        {waitUntil:'domcontentloaded',timeout:45000});
      assert.equal(response.status(),200);
      await page.waitForFunction(()=>window.__spriteWorld?.ready,null,{timeout:30000});
      const state=await page.evaluate(()=>({
        status:window.__spriteWorld.assetStatus,mode:window.__spriteWorld.mode,
        houses:window.__spriteWorld.houses.length,props:window.__spriteWorld.props,
        bridges:window.__spriteWorld.bridges.length,spawn:window.__spriteWorld.player,
        canvas:{w:document.querySelector('#game').width,h:document.querySelector('#game').height},
        legacy:document.querySelector('a[href="./nuevo-mundo.html"]')!==null
      }));
      assert.equal(state.mode,'sprites-and-tiles');
      assert.equal(state.houses,17);
      assert(state.props>800);
      assert.equal(state.bridges,3);
      assert(state.canvas.w>500&&state.canvas.h>300);
      assert.equal(state.legacy,true,'Earlier map must remain accessible');
      assert.equal(state.status.failed.length,0,
        'Missing kit assets: '+state.status.failed.join('; '));
      const sample=await page.evaluate(()=>{
        const c=document.querySelector('#game'),g=c.getContext('2d');
        const data=g.getImageData(0,0,c.width,c.height).data;
        const colors=new Set();
        for(let i=0;i<data.length;i+=Math.max(4,Math.floor(data.length/500/4)*4)){
          colors.add(data[i]+','+data[i+1]+','+data[i+2]);
        }
        return colors.size;
      });
      assert(sample>=10,'Frame appears monochrome or unrendered: '+sample);
      await saveFrame(page,''+device.id+'-village');
      if(device.mobile){
        assert(await page.locator('#stick').isVisible());
        assert(await page.locator('#dash').isVisible());
      }else{
        const before=state.spawn;
        await page.keyboard.down('w');await page.waitForTimeout(380);
        await page.keyboard.up('w');
        const after=await page.evaluate(()=>window.__spriteWorld.player);
        assert(after.y<before.y-10,'WASD movement must be functional');
        await page.keyboard.press('m');
        assert.equal(await page.evaluate(()=>window.__spriteWorld.overview),true);
        await saveFrame(page,'map-overview');
        await page.keyboard.press('m');
        assert.equal(await page.evaluate(()=>window.__spriteWorld.overview),false);
        const house=await page.evaluate(()=>{
          const h=window.__spriteWorld.houses[0];
          return {wall:window.__spriteWorld.blocked(h.x,h.y-20*h.scale),
            door:window.__spriteWorld.teleport(h.x,h.y+38)};
        });
        assert(house.wall?.startsWith('pared-de-'));
        assert.equal(house.door,true);
        await saveFrame(page,'house-entrance');
        for(const bridge of state.bridges?await page.evaluate(()=>window.__spriteWorld.bridges):[]){
          assert.equal(await page.evaluate(b=>window.__spriteWorld.teleport(b.x,b.y),bridge),true);
        }
        await saveFrame(page,'bridge-scale');
      }
      assert.deepEqual(errors,[],'Browser console/page errors');
      console.log('PASS',device.id,state.houses+' houses, '+state.props+' scenery items');
    }finally{await context.close();}
  }
}finally{await browser.close();}
