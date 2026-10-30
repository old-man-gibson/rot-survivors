const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { pathToFileURL }=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
  const geometry=await page.evaluate(()=>{
   let minCamp=Infinity,minTown=Infinity,maxTrip=0;
   for(let run=0;run<30;run++){
    newGame(run%9);S.mode='altar';
    if(S.towns.length!==CFG.townCount)throw Error('Town placement failed');
    for(let i=0;i<9;i++){
     const b=S.bases[i];
     for(let j=i+1;j<9;j++)minCamp=Math.min(minCamp,Math.hypot(b.x-S.bases[j].x,b.y-S.bases[j].y));
     const nearest=Math.min(...S.towns.map(t=>Math.hypot(b.x-t.x,b.y-t.y)));
     if(nearest>CFG.campTownGap+1)throw Error('Camp has no local supply');
     maxTrip=Math.max(maxTrip,nearest);
    }
    for(let i=0;i<S.towns.length;i++)for(let j=i+1;j<S.towns.length;j++){
     const a=S.towns[i],b=S.towns[j],d=Math.hypot(a.x-b.x,a.y-b.y);minTown=Math.min(minTown,d);
     if(d<CFG.townGap-1)throw Error('Town footprints overlap');
    }
   }
   return {worldDiameter:CFG.worldLimit*2,minCamp,minTown,maxTrip,nearestCampWalkSeconds:minCamp/CFG.playerSpeed};
  });
  assert.ok(geometry.minCamp>2900);
  const economy=await page.evaluate(()=>{
   newGame(0);S.mode='altar';S.thresholds.fill(0);S.hp=S.maxHp=1e9;
   const maxStores=S.bases.map(b=>b.B),initial=S.world0;
   for(let i=0;i<6000;i++){
    update(.05);for(let g=0;g<9;g++)maxStores[g]=Math.max(maxStores[g],S.bases[g].B);
   }
   return {minutes:S.t/60,consumed:initial-worldLeft()-9*CFG.baseSeed,maxStores,alive:S.hp>0};
  });
  assert.ok(economy.maxStores.every(v=>v>150),'Some remote camps never accumulated blood');
  assert.ok(economy.consumed>1000,'Economy stalled during longer travel');
  await page.evaluate(()=>{newGame(0);S.mode='altar';S.px=S.towns[0].x;S.py=S.towns[0].y;updateHud();});
  await page.waitForTimeout(2400);
  await page.screenshot({path:path.resolve(__dirname,'town-expanded.png')});
  await page.evaluate(()=>{S.px=S.bases[0].x;S.py=S.bases[0].y;updateHud();});
  await page.waitForTimeout(600);
  await page.screenshot({path:path.resolve(__dirname,'camp-expanded.png')});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({geometry,economy,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
