const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
  await page.locator('#newRevelation').click();await page.locator('#patronPick button').first().click();
  await page.locator('#worldChoice .gbtn').first().click();
  await page.waitForTimeout(400);
  const result=await page.evaluate(()=>{
    S.mode='altar';
    const m=S.terrain;
    const again=WorldTerrain.create(S.towns,S.bases,m.seed);
    if(JSON.stringify(m.roads)!==JSON.stringify(again.roads))throw Error('Seed is not deterministic');
    // Compare positions: graph nodes intentionally contain only coordinates.
    const key=p=>p.x+','+p.y, seen=new Set([key(m.towns[0])]);
    for(let n=0;n<m.roads.length;n++)for(const r of m.roads){
      if(seen.has(key(r.a)))seen.add(key(r.b));
      if(seen.has(key(r.b)))seen.add(key(r.a));
    }
    if(![...m.towns,...m.bases].every(p=>seen.has(key(p))))throw Error('Disconnected landmark');
    for(let y=-2400;y<2400;y+=450)for(let x=-2400;x<2400;x+=450)WorldTerrain.draw(cx,m,x,y,800,480);
    if(m.cache.size>64)throw Error('Cache exceeded limit');
    S.px=S.towns[0].x;S.py=S.towns[0].y;render();
    return {towns:S.towns.length,roads:m.roads.length,seed:m.seed,cache:m.cache.size};
  });
  await page.waitForTimeout(400); // allow the bounded chunk queue to finish
  await page.screenshot({path:path.resolve(__dirname,'terrain-desktop.png')});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{resize();render();});
  await page.waitForTimeout(400);
  await page.screenshot({path:path.resolve(__dirname,'terrain-mobile.png')});
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({...result,errors}));
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
