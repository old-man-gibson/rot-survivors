const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:2560,height:1440}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
  const result=await page.evaluate(async()=>{
   await new Promise(resolve=>{const img=new Image();img.onload=resolve;img.onerror=resolve;img.src='tilemaps/ERW - Grass Land 2.0 v2.1/Tilesets/Tileset-Terrain.png';});
   const start=performance.now();newGame(0);render();const startup=performance.now()-start;
   const times=[];const original=render;
   render=function(){const t=performance.now();original();times.push(performance.now()-t);};
   const before=S.px;keys.d=1;
   await new Promise(resolve=>setTimeout(resolve,5000));keys.d=0;render=original;
   times.sort((a,b)=>a-b);
   return {startupMs:startup,frames:times.length,p95Ms:times[Math.floor(times.length*.95)],maxMs:times.at(-1),moved:S.px!==before,gameTime:S.t,cache:S.terrain.cache.size};
  });
  console.log(result);
  assert.ok(result.startupMs<250,'Startup blocked for more than 250ms');
  assert.ok(result.frames>60&&result.moved&&result.gameTime>2,'Game failed to keep running during movement');
  assert.ok(result.maxMs<250,'Terrain caused a render stall over 250ms');
  const populated=await page.evaluate(async()=>{
   S.hp=S.maxHp=1e9;
   for(let i=S.enemies.length;i<350;i++)birth(i%9,i<220?'hunt':'eat',5,false);
   const times=[],original=update;
   update=function(dt){const start=performance.now();original(dt);times.push(performance.now()-start);};
   await new Promise(resolve=>setTimeout(resolve,3000));update=original;
   const stuck=S.enemies.filter(e=>!e.seat&&!e.dead&&WorldNavigation.blocked(S.terrain,e.x,e.y,Math.min(e.r,24))).length;
   times.sort((a,b)=>a-b);return {enemies:S.enemies.length,updates:times.length,p95UpdateMs:times[Math.floor(times.length*.95)],maxUpdateMs:times.at(-1),insideObstacles:stuck};
  });
  console.log(populated);assert.ok(populated.updates>30&&populated.maxUpdateMs<250,'Populated world stalled');
  assert.equal(populated.insideObstacles,0,'Actors ended inside blocked scenery');
  if(errors.length)throw Error(errors.join('\n'));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
