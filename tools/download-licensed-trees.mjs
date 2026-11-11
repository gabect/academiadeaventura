// Runtime asset build only. Source assets are freely reusable by permission of klamtii.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {downloadGame}=require('itchio-downloader');
const dest='/tmp/academia-tree-source';fs.mkdirSync(dest,{recursive:true});
const result=await downloadGame({itchGameUrl:'https://klamtii.itch.io/tree-sprites',
 downloadDirectory:dest,desiredFileName:'source-trees',writeMetaData:false,retries:2});
console.log('Download status',result.status,result.filePath,result.message);
if(!result.status||!result.filePath||!fs.existsSync(result.filePath))throw Error('Could not download licensed tree sprites');
if(!result.filePath.toLowerCase().endsWith('.zip'))throw Error('Expected original trees.zip, got '+result.filePath);
fs.copyFileSync(result.filePath,'/tmp/academia-trees.zip');
console.log('Licensed source pack verified',fs.statSync('/tmp/academia-trees.zip').size);
