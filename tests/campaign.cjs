const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
  await page.locator('#newRevelation').click();await page.locator('#patronPick button').first().click();await page.locator('#worldChoice .gbtn').nth(1).click();
  const result=await page.evaluate(()=>{
   const check=(v,m)=>{if(!v)throw Error(m);};S.mode='altar';check(S.world===1,'World selection');
   for(let p=0;p<9;p++){const gs=coalitionGroups(p);check(new Set(gs.flat()).size===9,'Partition');check(gs[0].includes(p)&&gs[0].includes((p+8)%9)&&gs[0].includes((p+1)%9),'Neighbors');}
   newGame(0);S.blood=1e7;S.harvested=1e7;campaignTick(.1);check(!S.finale,'Bonus currency falsely triggered control');
   S.rawBank=100;const before=bloodControl()[0];buy(0,false);check(Math.abs(bloodControl()[0]-before)<1e-10,'Offering counted twice');S.offer=null;S.mode='play';
   const own=S.bases[0].ent;hurt(own,1e9);check(!own.dead,'Patron friendly fire');
   S.rawBank=S.world0*.45;campaignTick(.1);check(S.finale.wave===1,'45% trigger');
   const first=S.finale.order[0];check(S.finale.gods.every(g=>S.groups[first].includes(g)),'First wave coalition');
   S.rawBank=0;campaignTick(.2);check(S.finale,'Finale cancelled below threshold');
   const attacker=S.enemies.find(e=>e.desperate);check(attacker,'Wave spawned');
   attacker.x=S.px;attacker.y=S.py;pickTarget(attacker);check(attacker.tt===1,'Player first');
   S.px=-S.bases[0].x;S.py=-S.bases[0].y;attacker.x=S.bases[0].x;attacker.y=S.bases[0].y;pickTarget(attacker);check(attacker.tt===6&&attacker.tgt===own,'Patron second');
   attacker.x=own.x+own.r+attacker.r+2;attacker.mobCd=0;const hpBefore=own.hp;update(.05);check(own.hp<hpBefore,'Siege troops did not damage base');
   hurt(own,1e9,'red',attacker);check(S.mode==='play'&&S.bases[0].broken,'Base loss should not end run');pickTarget(attacker);check(attacker.tt===6&&S.groups[0].includes(attacker.tgt.god),'Allies tertiary');
   const clear=()=>{S.finale.queue=[];for(const e of S.enemies)if(e.desperate===S.finale.wave)e.dead=true;campaignTick(.1);};
   clear();campaignTick(12);check(S.finale.wave===2&&S.finale.order[1]!==first,'Second wave order');
   clear();campaignTick(12);check(S.finale.wave===3&&S.finale.gods.length===6,'Third wave both coalitions');campaignTick(.2);
   check(S.groups[1].some(a=>S.groups[2].some(b=>S.war[a][b])),'Finale enemy infighting');clear();check(S.mode==='victory','Three waves victory');
   const original=localStorage.getItem('rot-campaign-v1');
   try{
    saveCampaign({cleared:Array(9).fill(false),level:1});
    for(let p=0;p<9;p++){
     newGame(p,0,1,false,true);hurt(S.bases[p].ent,1e9);check(!S.bases[p].broken,'Premature patron destruction');
     for(let g=0;g<9;g++)if(g!==p)hurt(S.bases[g].ent,1e9);
     check(S.forsaken&&S.hostQueue[p]===80,'Betrayal attack');check(!campaignProgress().cleared[p],'Unlock before patron defeat');
     hurt(S.bases[p].ent,1e9);campaignTick(.1);check(S.mode==='victory'&&campaignProgress().cleared[p],'Extermination saved');
    }
    check(campaignProgress().cleared.every(Boolean),'All nine rites');
    newGame(6,2,3,true,true);check(S.heretic&&!S.groups[0].some(alliedGod),'Patronless');
    check(costOf(0)===costOf(8),'Heretic has patron cost bias');check(S.enemyPower===1.5,'World difficulty');
    for(const b of S.bases)hurt(b.ent,1e9);campaignTick(.1);check(S.mode==='victory','Heretic ending');
   }finally{if(original===null)localStorage.removeItem('rot-campaign-v1');else localStorage.setItem('rot-campaign-v1',original);}
   newGame(0);S.hp=0;die();check(S.mode==='dead','Player death');
   newGame(0);document.getElementById('dead').classList.remove('on');S.mode='altar';updateHud();
   return {coalitions:9,waves:3,exterminationRites:9,worlds:WORLD_TYPES.length};
  });
  await page.screenshot({path:path.resolve(__dirname,'campaign.png')});assert.deepEqual(errors,[]);console.log(result);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
