const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('prototype.html')).href);
 const report=await page.evaluate(()=>{
  const check=(v,m)=>{if(!v)throw Error(m);},near=(a,b)=>Math.abs(a-b)<1e-6;
  const reset=(g,arm=0)=>{newGame(g,0,1,false,false,arm);S.mode='altar';S.enemies=[];S.px=S.py=0;S.thresholds[g]=12;S.gmod[g].f.metamorph=1;S.cd.fill(0);};
  const enemy=(x=80,y=0)=>{const e=servant((S.patron+4)%9,x,y,'hunt',10000,12,80,0);e.x=x;e.y=y;e.res=0;S.enemies.push(e);return e;};
  const card=(g,id)=>{const c=CARDS[g].find(c=>c.id===g+id);check(c,'Missing card '+g+id);c.ap(S.gmod[g]);S.taken[c.id]=1;};
  for(const arm of [0,1]){
   reset(0,arm);let e=enemy(32);card(0,'lesions');fireMetamorphoses();updateMetamorphoses(.09);check(e.c.dis===5,'Plague lesions '+arm);
   reset(1,arm);e=enemy();card(1,'obsession');card(1,'ecstasy');card(1,'doctrineA');fireMetamorphoses();check(e.turned&&near(e.turnT,(5.5+8*.4)*1.8+8),'Waltz servant duration '+arm);
   reset(2,arm);e=enemy(0);const base=metamorphDamage(2);card(2,'a');card(2,'migration');card(2,'bite');card(2,'doctrineB');e.hp=2000;fireMetamorphoses();check(near(metamorphs()[0].life,3.6),'Cloud duration');updateMetamorphoses(.01);check(near(2000-e.hp,base*2*.22*1.7),'Cloud count and execution');check(e.c.inf===3,'Cloud bite');check(near(weaponSnapshot(2).damage,base*2*.22),'Cloud displayed damage');
   reset(3,arm);e=enemy(850);card(3,'a');card(3,'d');card(3,'e');card(3,'reckoning');S.hp=40;fireMetamorphoses();const damage=weaponSnapshot(3).damage;updateMetamorphoses(.01);check(near(S.hp,41.2),'Tether healing');check(near(10000-e.hp,damage),'Tether reach, schism, reckoning and readout');
   reset(4,arm);enemy();card(4,'d');card(4,'doctrineA');card(4,'pyre');fireMetamorphoses();check(metamorphs().length===7,'Extra eruptions');for(let i=0;i<30;i++)updateMetamorphoses(.05);check(S.fields.length===7,'Every eruption leaves ground');for(const f of S.fields){prepareField(f);check(near(f.life,6.5)&&near(f.r,42*1.35),'Wildfire and pyre');}
   reset(5,arm);e=enemy(0);const ring=enemy(78);card(5,'density');card(5,'corona');card(5,'mass');fireMetamorphoses();let pull=0;const oldPull=pullBodies;try{pullBodies=(x,y,r,strength)=>{pull=strength;};updateMetamorphoses(.01);}finally{pullBodies=oldPull;}check(pull===280,'Core accretion');check(e.c.rad===4&&ring.c.rad===4,'Core density and corona');
   reset(6,arm);e=enemy(100);card(6,'a');card(6,'origin');card(6,'parallel');card(6,'doctrineA');card(6,'intersection');fireMetamorphoses();const form=metamorphs()[0];check(form.points.length===5,'Lattice vertices');const side=Math.hypot(form.points[1].x-form.points[0].x,form.points[1].y-form.points[0].y);check(near(side,2*215*1.35*Math.sin(Math.PI/5)),'Lattice area and origin');updateMetamorphoses(.65);check(e.hp<10000&&e.c.rad>0&&S.rays.length===5,'Lattice attacks and ray hooks');
   reset(7,arm);card(7,'c');card(7,'ink');card(7,'cadence');card(7,'absolution');card(7,'echo');card(7,'slander');card(7,'smudge');card(7,'sentence');card(7,'doctrineB');fireMetamorphoses();check(metamorphs().length===8&&metamorphs().every(f=>f.life===11),'Letter count and lifetime');
   S.hp=50;S.cd.fill(10);for(const f of metamorphs())f.x=f.y=1000;for(const f of metamorphs().slice(0,3))f.x=f.y=0;updateMetamorphoses(.001);check(S.hp===62&&S.wordT===6&&wordMultiplier()===1.4&&S.cd.every(c=>c===9),'Letter borrowed-word effects');updateMetamorphoses(.001);check(S.hp===62,'Letters consumed once');
   e=enemy(0);updateMetamorphoses(.31);check(e.c.dis>0&&e.c.rad>0&&S.hp>62,'Letter disease, radiation, and leech');check(metamorphs().length===8,'Letter bound');
   reset(7,arm);card(7,'doctrineA');fireMetamorphoses();updateMetamorphoses(.01);check(metamorphs().every(f=>f.tick===.15),'Repeat-letter doctrine');
   reset(8,arm);e=enemy(20);card(8,'e');card(8,'shards');card(8,'grave');launchBoneArcs(0,0,100,80);const shards=S.shots.slice();for(const s of shards)advanceBoneArc(s,1);check(e.c.dis>0&&e.c.bleed>0&&e.boneSlow>S.t,'Bone fragment conditions');check(S.shots.length===3,'Bone fragments must not recurse');
  }
  reset(7,1);S.gmod[7].f.metamorph=0;alternativeWeapons(1,1,1);check(S.sigils.length===2&&S.sigils[0].x===0&&S.sigils[0].y===0,'Palimpsest paired placement');S.hp=50;consumeWord(S.sigils[0]);check(S.wordT===3&&wordMultiplier()===1.25,'Palimpsest base buff');consumeWord(S.sigils[1]);check(wordMultiplier()===1.25,'Word does not stack');
  for(let g=0;g<9;g++){reset(g);enemy();S.dualPatron=true;fire(.01);check(S.secondaryCd[g]>0,'Companion must still fire '+g);check(!weaponSnapshot(g,true).transformed,'Companion must not transform '+g);}
  reset(7,1);renderPlayerStats();check(document.getElementById('playerStatsBody').textContent.includes('Touch each new letter once'),'Transformation instructions in inspector');
  return {transformedWeapons:9,startingArmaments:2,companionChecks:9,palimpsest:true};
 });assert.deepEqual(errors,[]);console.log(report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
