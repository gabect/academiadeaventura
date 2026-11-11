import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();
 const problems=[];
 page.on('pageerror',error=>problems.push(String(error)));
 await page.goto('http://127.0.0.1:8765/tools/studio-tree-sprite-export.html',
  {waitUntil:'load',timeout:45000});
 await page.waitForFunction(()=>window.__treeSpriteReady||window.__treeSpriteError,
  null,{timeout:40000});
 if(problems.length)throw Error(problems.join('; '));
 const outcome=await page.evaluate(()=>({
  error:window.__treeSpriteError,atlases:window.__treeAtlases
 }));
 if(outcome.error)throw Error(outcome.error);
 mkdirSync('assets/studio_hd/trees',{recursive:true});
 for(const family of ['pine','broadleaf']){
  const uri=outcome.atlases?.[family];
  if(!uri?.startsWith('data:image/png;base64,'))throw Error('Invalid '+family+' PNG');
  const bytes=Buffer.from(uri.split(',')[1],'base64');
  if(bytes.length<20000)throw Error('Empty or low-quality '+family+' artwork: '+bytes.length);
  const path='assets/studio_hd/trees/tree-'+family+'-atlas.png';
  writeFileSync(path,bytes);
  console.log(path,bytes.length,'bytes');
 }
}finally{await browser.close();}
