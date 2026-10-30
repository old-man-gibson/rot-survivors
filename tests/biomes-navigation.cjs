const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/mersi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype.html')).href);
  await page.evaluate(()=>WorldAssets.ready);
  assert.deepEqual(await page.evaluate(()=>WorldAssets.errors),[],'Missing source art');
  const result=await page.evaluate(()=>{
   newGame(0);S.mode='altar';const checks=[];
   for(let seed=1;seed<=12;seed++){
    const palette=WORLD_TYPES[seed%3].biomes,m=WorldTerrain.create(S.towns,S.bases,seed,palette),root=WorldNavigation.nearest(m,S.towns[0].x,S.towns[0].y,24);
    m.navBudget=1;const f=WorldNavigation.field(m,WorldNavigation.index(m,root.x,root.y));
    for(const p of [...S.towns,...S.bases]){const q=WorldNavigation.nearest(m,p.x,p.y,24);if(f[WorldNavigation.index(m,q.x,q.y)]<0)throw Error('Unreachable landmark');}
    const counts=Array(12).fill(0);for(const k of m.ground)counts[k]++;
    if(palette.some(k=>counts[k]<10)||counts[6]<10||[...m.biome].some(k=>!palette.includes(k)))throw Error('World palette mismatch');
    const solid=m.solid.reduce((a,b)=>a+b,0);checks.push({seed,walkable:m.reachable,solid});
    // Collision agrees with rendered obstacle cells, including swept motion.
    let verified=0;
    for(let i=m.n;i<m.solid.length-m.n&&verified<40;i++)if(m.solid[i]&&!m.solid[i-1]&&i%m.n>0){
      const p=WorldNavigation.point(m,i-1),q=WorldNavigation.point(m,i),e={...p,r:11};
      WorldNavigation.move(m,e,128,0);if(e.x>=q.x-32||WorldNavigation.blocked(m,e.x,e.y,11))throw Error('Collision tunneled through obstacle');verified++;
    }
   }
   // A hand-built lake blocks the direct route; a servant must take the opening.
   const n=24,m={n,origin:0,cell:64,solid:new Uint8Array(n*n),flows:new Map(),navTick:0,navBudget:1};
   for(let y=0;y<20;y++)m.solid[y*n+11]=1;
   const e={x:5.5*64,y:8.5*64,r:20},target={x:17.5*64,y:8.5*64};
   let steps=0;
   for(;steps<3000&&Math.hypot(e.x-target.x,e.y-target.y)>8;steps++){
    WorldNavigation.begin(m);const q=WorldNavigation.steer(m,e,target.x,target.y),dx=q.x-e.x,dy=q.y-e.y,d=Math.hypot(dx,dy);
    if(d)WorldNavigation.move(m,e,dx/d*Math.min(d,8),dy/d*Math.min(d,8));
    if(WorldNavigation.blocked(m,e.x,e.y,20))throw Error('Navigation entered water');
   }
   if(steps===3000)throw Error('Servant could not route around lake');
   newGame(0);S.mode='altar';
   return {layouts:checks,detourSteps:steps};
  });
  for(let biome=0;biome<6;biome++){
   await page.evaluate(kind=>{
    newGame(0,WORLD_TYPES.findIndex(w=>w.biomes.includes(kind)));S.mode='altar';
    const m=S.terrain,r=m.regions.find(r=>r.kind===kind),p=WorldNavigation.nearest(m,r.x,r.y,11);S.px=p.x;S.py=p.y;updateHud();
   },biome);
   await page.waitForTimeout(500);await page.screenshot({path:path.resolve(__dirname,`biome-${biome}.png`)});
  }
  await page.evaluate(()=>{S.px=S.towns[0].x;S.py=S.towns[0].y;updateHud();});await page.waitForTimeout(500);
  await page.screenshot({path:path.resolve(__dirname,'biome-town.png')});
  assert.deepEqual(errors,[]);console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
