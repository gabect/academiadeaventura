// Download the artist's free PNG sprite archive; no login or payment.
import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('art-audit/itch',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({acceptDownloads:true});
 await page.goto('https://klamtii.itch.io/tree-sprites',{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByRole('link',{name:'Download Now'}).first().click({timeout:20000});
 await page.getByText('No thanks, just take me to the downloads').click({timeout:20000});
 const button=page.getByRole('link',{name:'Download',exact:true}).first();
 await button.waitFor({timeout:25000});
 const promise=page.waitForEvent('download',{timeout:45000});
 await button.click({timeout:20000});
 const dl=await promise;
 if(dl.suggestedFilename()!=='trees.zip')throw Error('Unexpected file '+dl.suggestedFilename());
 await dl.saveAs('art-audit/itch/trees.zip');
 if(fs.statSync('art-audit/itch/trees.zip').size<3000000)throw Error('Truncated tree pack');
 console.log('Downloaded legitimate free tree pack from klamtii.itch.io');
}finally{await browser.close()}
