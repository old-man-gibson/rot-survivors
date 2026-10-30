const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
 const report=await page.evaluate(()=>{
  const results=[];
  for(let world=0;world<3;world++){
   newGame(world*3,world);S.thresholds.fill(0);S.hp=S.maxHp=1e12;S.px=S.py=0;
   // No player action or weapon: measure the autonomous economy, not combat survivability.
   const playerBleed=CFG.townPlayerBleed;CFG.townPlayerBleed=0;
   try{for(let tick=0;tick<12000;tick++){S.mode='play';update(.1);}}
   finally{CFG.townPlayerBleed=playerBleed;}
   const controls=bloodControl(),sum=controls.reduce((a,b)=>a+b,0);
   results.push({world:WORLD_TYPES[world].name,minutes:S.t/60,control:controls,shareOfClaimed:controls.map(v=>v/sum),finale:!!S.finale});
  }
  return results;
 });console.log(JSON.stringify(report,null,2));assert.ok(report.every(r=>!r.finale),'Idle world triggered player domination');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
