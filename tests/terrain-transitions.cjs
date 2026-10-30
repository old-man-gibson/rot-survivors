const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1024,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);await page.evaluate(()=>WorldAssets.ready);
 assert.deepEqual(await page.evaluate(()=>WorldAssets.errors),[]);
 const stats=await page.evaluate(()=>{
  const n=16,m={n,origin:0,cell:64,seed:42,ground:new Uint8Array(n*n),props:new Uint8Array(n*n),cache:new Map(),revision:WorldAssets.revision,overview:WorldAssets.surface(n)};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   let k=x>9?3:0;if(x>=2&&x<=6&&y>=2&&y<=8)k=6;if(x===6&&y<=3)k=0;if(x===3&&y===8)k=0;
   if(y===10||y===11)k=8;if(x>=12&&y<4)k=1;m.ground[y*n+x]=k;
  }
  const original=Array.from(m.ground),canvas=WorldAssets.surface(1024,768),ctx=canvas.getContext('2d');
  for(let i=0;i<12;i++)WorldTerrain.draw(ctx,m,0,0,1023,767);
  document.body.replaceChildren(canvas);canvas.style.cssText='position:fixed;inset:0;width:1024px;height:768px';
  if(original.some((k,i)=>m.ground[i]!==k))throw Error('Rendering mutated terrain');
  return {chunks:m.cache.size,banks:Array.from({length:16},(_,i)=>WorldAssets.tiles['bank'+(i+1)].length)};
 });
 assert.equal(stats.chunks,4);assert.ok(stats.banks.every(n=>n===1));
 await page.locator('canvas').screenshot({path:path.resolve(__dirname,'terrain-transitions.png')});assert.deepEqual(errors,[]);console.log(JSON.stringify(stats));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

