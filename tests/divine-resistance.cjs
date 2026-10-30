const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('prototype.html')).href);
 const result=await page.evaluate(()=>{
  const check=(v,m)=>{if(!v)throw Error(m);},near=(a,b)=>Math.abs(a-b)<1e-6;
  const reset=()=>{newGame(0,0,1,false,true);S.forsaken=true;S.mode='altar';S.enemies=[];S.px=S.py=0;};
  const enemy=(g,x=0,hp=10000)=>{const e=servant(g,x,0,'hunt',hp,12,80,0);e.x=x;e.y=0;e.res=0;S.enemies.push(e);return e;};
  for(let milestones=0;milestones<=3;milestones++)for(let g=0;g<9;g++){
   reset();for(let i=0;i<milestones;i++)S.gmod[i].f.apex=i%2?'A':'B';
   const e=enemy(g),other=enemy((g+1)%9);hurt(e,100,GODS[g].col);hurt(other,100,GODS[g].col);
   check(near(10000-e.hp,100*(1-.85**milestones)),'Own god damage '+g+'/'+milestones);check(other.hp===9900,'Other god unaffected');
   e.res=.8;stripResistance(e,g);check(near(e.res,.8*.85**milestones),'Resistance stripping obeys divine resistance');
  }
  for(const [key,g] of Object.entries(CONDITION_GOD)){
   reset();let e=enemy(g);afflict(e,key,10);check(e.c[key]===0,'Immune condition '+key);
   S.gmod[8].f.apex='A';afflict(e,key,10);check(near(e.c[key],1.5),'Compounded condition '+key);
   if(key==='dis'){const hp=e.hp;tickConds(e,1,0);check(near(hp-e.hp,1.5*CFG.disDps),'DOT resistance applied exactly once');}
  }
  reset();let e=enemy(1);check(!enthrall(e,10),'Immune enthrallment');applyHysteria(e,3);check(!e.hysteria,'Immune hysteria');S.gmod[0].f.apex='A';check(enthrall(e,10)&&near(e.turnT,1.5),'Reduced control duration');
  reset();e=enemy(6,40);e.res=.8;castRay(0,0,0,100,100,true,0);check(e.hp===10000&&e.unf===0&&e.res===.8,'Immune ray damage and unfolding');
  reset();e=enemy(8);S.gmod[8].f.boneShards=S.gmod[8].f.graveSlow=1;boneHit(e);afflict(e,'dis',4,8);check(e.c.bleed===0&&e.c.dis===0&&!e.boneSlow,'Cross-condition source is bone god');const other=enemy(3);boneHit(other);check(other.c.bleed===3,'Bone bleed remains a bone ability');
  reset();e=enemy(5,40);const oldMove=WorldNavigation.move;let calls=0;try{WorldNavigation.move=()=>calls++;pullBodies(0,0,100,100,1,5);check(calls===0,'Immune gravity');S.gmod[2].f.apex='B';pullBodies(0,0,100,100,1,5);check(calls===1,'Milestone permits gravity');}finally{WorldNavigation.move=oldMove;}
  reset();S.gmod[0].f.contagion=1;for(let i=0;i<40;i++)enemy(4,i).c.dis=2;const target=enemy(4,45);updateBuild(.01);check(target.c.dis===1,'Dense carriers add at most one stack');updateBuild(.01);check(target.c.dis===1,'Contagion once per second');
  reset();S.gmod[0].f.contagion=1;const source=enemy(4,0),middle=enemy(4,60),end=enemy(4,120);source.c.dis=1;updateBuild(.01);check(middle.c.dis===1&&end.c.dis===0,'New infection cannot spread in same pulse');
  reset();S.gmod[0].f.septic=1;const seed=enemy(4,0,10),first=enemy(4,40,10),last=enemy(4,95,100);seed.c.dis=100;killEnemy(seed,GODS[3].col);check(!first.dead&&last.hp===100,'Rupture is delayed');S.t=.21;updateBuild(.01);check(first.dead&&last.hp===100,'No recursive cluster wipe');check(!buildState().diseaseBursts.length,'No secondary rupture queued');
  reset();const a=enemy(4,0,10),b=enemy(4,1,10),victim=enemy(4,20,1000);a.c.dis=b.c.dis=10;killEnemy(a,GODS[3].col);killEnemy(b,GODS[3].col);S.t=.21;updateBuild(.01);check(near(1000-victim.hp,10*CFG.disBlast),'Overlapping rupture wave does not multiply damage');
  reset();const seat=S.bases[0].ent;hurt(seat,100,GODS[0].col);check(seat.hp===seat.maxHp,'Final patron seat has divine immunity');S.gmod[1].f.apex='A';hurt(seat,100,GODS[0].col);check(near(seat.maxHp-seat.hp,15),'Other god milestone weakens final patron seat');
  return {gods:9,milestoneLevels:4,conditions:5,disease:'bounded contagion and nonrecursive rupture waves',extermination:true};
 });assert.deepEqual(errors,[]);console.log(result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
