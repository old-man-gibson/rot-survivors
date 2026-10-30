const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage();await p.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
 const report=await p.evaluate(()=>{
  const check=(v,m)=>{if(!v)throw Error(m);};
  const setup=()=>{newGame(0,0,1,false,false,1);S.mode='altar';S.enemies=[];S.px=S.py=0;};
  const enemy=(x,y,g=4)=>{const e=servant(g,x,y,'hunt',1000,12,80,0);e.x=x;e.y=y;S.enemies.push(e);return e;};
  setup();let target=enemy(260,0);fire(.01);
  check(S.shots.length===2&&S.shots.every(s=>s.target===target),'Volley must converge on one target');
  const total=S.shots.reduce((n,s)=>n+s.dmg,0),pods=S.shots.slice();
  for(let frame=0;frame<120;frame++){target.y+=1.2;for(const s of pods)if(s.life>0)advancePustule(s,1/60);}
  check(Math.abs(1000-target.hp-total)<1e-6,'Both pods must land on moving target');
  check(target.c.dis>0&&S.fields.length===2,'Landing must apply disease and plant wounds');
  setup();const a=enemy(180,0),b=enemy(240,80),ally=enemy(90,0,1);fire(.01);
  check(new Set(S.shots.map(s=>s.target)).size===2,'Volley should divide across nearby enemies');
  check(S.shots.every(s=>s.target!==ally),'Volley targeted ally');
  a.dead=true;for(const s of S.shots)for(let frame=0;frame<120&&s.life>0;frame++)advancePustule(s,1/60);
  check(S.shots.every(s=>Number.isFinite(s.x)&&s.life===0),'Dead target stranded a projectile');
  check(ally.hp===ally.maxHp,'Lob harmed ally');
  return {movingTarget:'2 / 2 impacts',crowd:'distinct targets',deadTarget:'lands at last position',allies:'protected'};
 });console.log(report);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
