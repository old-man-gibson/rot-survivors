/* Bounded runtime hooks for the god-specific build rules. */
const CONDITION_GOD={dis:0,inf:2,bleed:3,burn:4,rad:5};
function milestoneCount(){return S.gmod.filter(m=>m.f.apex||m.f.metamorph).length;}
function godEffectScale(e,g){return e.god===g?1-Math.pow(.85,milestoneCount()):1;}
function abilityGod(col){return GODS.findIndex(g=>g.col===col);}
function stripResistance(e,g){e.res*=1-godEffectScale(e,g);}
function applyHysteria(e,duration){e.hysteria=Math.max(e.hysteria||0,duration*godEffectScale(e,1));}
function queueDiseaseBurst(e){
 const b=buildState();b.diseaseBursts??=[];
 if(b.diseaseBursts.length<128)b.diseaseBursts.push({x:e.x,y:e.y,stacks:e.c.dis,at:S.t+.2});
}
function updateDiseaseBursts(){
 const b=buildState(),due=(b.diseaseBursts||[]).filter(d=>d.at<=S.t);b.diseaseBursts=(b.diseaseBursts||[]).filter(d=>d.at>S.t);
 if(!due.length)return;
 const r=52*S.stat.area*(S.gmod[0].f.septic?1.3:1)*(S.gmod[0].f.ruptureArea||1),hits=new Map();
 for(const d of due){fx(d.x,d.y,r,GODS[0].col,.35);for(const e of S.enemies)if(!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(d.x,d.y,e.x,e.y)<r*r)hits.set(e,Math.max(hits.get(e)||0,d.stacks));}
 // Overlapping ruptures hit once per wave; rupture kills cannot start another wave.
 for(const [e,stacks] of hits){if(S.gmod[0].f.septic)afflict(e,'dis',Math.min(8,stacks*.5));hurt(e,stacks*CFG.disBlast*S.stat.dmg,GODS[0].col,{turned:true,diseaseBurst:true});}
}
function buildState(){return S.build||(S.build={clock:0,trail:0,crown:0,contagion:0,lastX:S.px,lastY:S.py,heals:{},echoes:[],novas:[],novaSecond:-1,novaCount:0,wordCount:0,ward:0,wardUntil:0});}
function wordMultiplier(){return S.wordT>0?(S.gmod[7].f.wordPower??1.25):1;}
function playerSpeed(){return CFG.playerSpeed*S.stat.speed*(S.gmod[3].f.martyr&&S.hp<S.maxHp*.5?1.2:1);}
function healPlayer(amount){const penalty=S.gmod[4].f.healPenalty||0;S.hp=Math.min(S.maxHp,S.hp+Math.max(0,amount)*(1-penalty));}
function damageReduction(source){
 let retained=1;for(const m of S.gmod)retained*=1-(m.f.armor||0);
 if(S.gmod[1].f.refuge&&S.enemies.some(e=>!e.dead&&e.turned&&dist2(S.px,S.py,e.x,e.y)<180**2))retained*=.75;
 if(S.gmod[7].f.wordArmor&&S.wordT>0)retained*=.8;
 if(S.gmod[8].f.ribs&&(S.minions.some(m=>m.life>0)||S.t-(S.lastPallbearer??-99)<1))retained*=.85;
 if(S.gmod[5].f.eclipse&&(S.fields.some(f=>f.well&&f.life>0)||(S.lastFlare&&S.t-S.lastFlare.t<1.5&&dist2(S.px,S.py,S.lastFlare.x,S.lastFlare.y)<150**2)))retained*=.85;
 const b=buildState();if(b.wardUntil>S.t)retained*=1-b.ward;
 if(source){if(S.gmod[5].f.pressure&&source.c.rad>0)retained*=.75;if(S.gmod[6].f.inverse&&source.unf>=4)retained*=.7;if(S.gmod[4].f.whiteFire&&source.c.burn>0)retained*=.8;}
 return Math.min(.7,1-retained);
}
function receiveDamage(amount,source){const damage=Math.max(0,amount)*(1-damageReduction(source));S.hp-=damage;return damage;}
function combatMeter(amount){
 const c=S.combat||(S.combat={total:0,buckets:Array.from({length:10},()=>({second:-1,damage:0}))}),second=Math.floor(S.t),bucket=c.buckets[second%10];
 if(bucket.second!==second){bucket.second=second;bucket.damage=0;}bucket.damage+=amount;c.total+=amount;
}
function recentDps(){if(!S.combat)return 0;const second=Math.floor(S.t);return S.combat.buckets.reduce((n,b)=>n+(b.second>second-10?b.damage:0),0)/Math.max(1,Math.min(10,S.t));}
function buildDamage(e,dmg,col,src){
 if(src&&!src.turned)return dmg;
 if(src?.turned&&S.gmod[1].f.jealousy)dmg*=1.4;
 if(S.gmod[0].f.sepsis&&e.c.dis>=8)dmg*=1.25;
 if(S.gmod[1].f.cruelty&&e.hysteria>0)dmg*=1.35;
 if(S.gmod[5].f.radVulnerable&&e.c.rad>0)dmg*=1.2;
 if(col==='#e0662a'&&S.gmod[4].f.kindle&&e.c.dis>0)dmg*=1.5;
 return dmg;
}
function bloodStrike(e,dmg){
 const f=S.gmod[3].f;
 if(f.reckoning)dmg*=1+(1-S.hp/S.maxHp)*.6;
 if(f.sacrifice&&e.c.bleed>0&&e.hp<e.maxHp*.4)dmg*=3;
 if(f.redExecute&&e.c.bleed>0&&e.hp<e.maxHp*.15&&!e.boss&&!e.seat)dmg=Math.max(dmg,e.hp);
 return dmg;
}
function plagueField(x,y,r=42,life=4,condition='dis'){if(S.fields.length<160)S.fields.push({x,y,r,life,max:life,tick:0,dmg:1,col:condition==='inf'?GODS[2].col:GODS[0].col,condition,stacks:1,prepared:true});}
function buildDeath(e){
 const b=buildState(),f=S.gmod.map(m=>m.f);
 const restore=(key,amount)=>{if((b.heals[key]??-99)<=S.t){b.heals[key]=S.t+1;healPlayer(amount);}};
 if(e.c.dis>0){if(f[0].compost)restore('compost',1);if(f[0].corpseGarden)plagueField(e.x,e.y,60,5);}
 if(e.c.bleed>0&&f[3].clot)restore('clot',2);
 if(e.c.inf>0&&f[2].nest)plagueField(e.x,e.y,55,3,'inf');
 if(e.c.burn>0){
  if(f[4].coals&&S.fields.length<160)S.fields.push({x:e.x,y:e.y,r:48,life:4,max:4,tick:0,dmg:3,col:GODS[4].col});
  if(f[4].conflagration)for(const o of S.enemies)if(!o.dead&&dist2(e.x,e.y,o.x,o.y)<100**2)afflict(o,'burn',6);
 }
 if(e.c.rad>0&&f[5].supernova){const sec=Math.floor(S.t);if(b.novaSecond!==sec){b.novaSecond=sec;b.novaCount=0;}if(b.novaCount++<4)b.novas.push({x:e.x,y:e.y});}
 if(f[8].soulWard){b.ward=b.wardUntil>S.t?Math.min(.3,b.ward+.02):.02;b.wardUntil=S.t+5;}
 if(S.kills%5===0){if(f[8].burial)healPlayer(5);if(f[8].mourn&&S.minions.length<24){const mn={x:e.x,y:e.y,life:6,arm:.35,dmg:28*S.gmod[8].dmg,r:55,done:0,tx:0,ty:0,lock:0};lockCluster(mn);S.minions.push(mn);}}
}
function enthrall(e,duration,secondary=false){
 if(!e||e.dead||e.turned||e.seat||e.boss||e.titan||e.stage>=2||protectedFromPlayer(e))return false;
 const scale=godEffectScale(e,1);if(scale<=0)return false;
 const f=S.gmod[1].f;e.turned=1;e.turnT=(duration+(secondary?0:f.devotionTime||0))*scale;e.spd*=1.25;fx(e.x,e.y,26,GODS[1].col,.4);
 if(f.rapture)hystericalRelease(e);
 if(f.massCharm&&!secondary){let count=0;for(const o of S.enemies)if(o!==e&&dist2(e.x,e.y,o.x,o.y)<180**2&&enthrall(o,4,true)&&++count===2)break;}
 return true;
}
function buildSlow(e){
 return Math.max(S.gmod[0].f.mucus&&e.c.dis>0?.2:0,e.c.burn>0?(S.gmod[4].f.whiteFire?.45:S.gmod[4].f.ashSlow||0):0,(e.boneSlow||0)>S.t?.3:0);
}
function pullBodies(x,y,r,strength,dt,g=5){for(const e of S.enemies){if(e.dead||e.seat||e.turned||protectedFromPlayer(e))continue;const d=Math.hypot(x-e.x,y-e.y),scale=godEffectScale(e,g);if(scale>0&&d>1&&d<r)WorldNavigation.move(S.terrain,e,(x-e.x)/d*Math.min(d,strength*dt*scale),(y-e.y)/d*Math.min(d,strength*dt*scale));}}
function prepareField(f){
 if(f.prepared)return;f.prepared=true;
 if(!f.well&&f.col===GODS[4].col){const extra=S.gmod[4].f.fireLife||0;f.life+=extra;f.max+=extra;}
}
function prepareSigil(g){if(g.prepared)return;g.prepared=true;g.life+=S.gmod[7].f.sigilLife||0;}
function consumeWord(g){
 const f=S.gmod[7].f;g.buffUsed=1;S.wordT=f.wordLife||3;
 if(f.absolution)healPlayer(4);if(f.wordFlesh){healPlayer(8);S.inv=Math.max(S.inv,2);}
 const b=buildState();if(f.wordEcho&&++b.wordCount%3===0)for(let i=0;i<9;i++)S.cd[i]-=1;
}
function onSealBlast(g){
 const f=S.gmod[7].f;
 if(f.chainSeals)for(const o of S.sigils)if(o!==g&&!o.spent&&dist2(g.x,g.y,o.x,o.y)<(g.r+o.r)**2)o.triggered=true;
}
function boneHit(e){const f=S.gmod[8].f;if(f.boneShards)afflict(e,'bleed',3,8);if(f.graveSlow&&godEffectScale(e,8)>0)e.boneSlow=S.t+2*godEffectScale(e,8);}
function boneEcho(x,y,r,dmg){const b=buildState();if(S.gmod[8].f.boneEcho&&b.echoes.length<64)b.echoes.push({x,y,r,dmg:dmg*.5,at:S.t+.5});}
function radiantRing(x,y,r,stacks){
 if(S.gmod[5].f.corona)for(const e of S.enemies)if(!e.dead&&dist2(x,y,e.x,e.y)>r*r&&dist2(x,y,e.x,e.y)<(r*1.4)**2)afflict(e,'rad',stacks);
}
function updateBuild(dt){
 updateDiseaseBursts();
 const b=buildState(),f=S.gmod.map(m=>m.f);b.clock+=dt;
 if(f[0].plagueTrail&&S.t>=b.trail&&Math.hypot(S.px-b.lastX,S.py-b.lastY)>24){plagueField(S.px,S.py);b.trail=S.t+2;b.lastX=S.px;b.lastY=S.py;}
 if(f[0].contagion&&S.t>=b.contagion){b.contagion=S.t+1;const carriers=S.enemies.filter(e=>!e.dead&&!e.turned&&!protectedFromPlayer(e)&&e.c.dis>0),recipients=new Set();for(const e of carriers)for(const o of S.enemies)if(o!==e&&!o.dead&&!o.turned&&dist2(e.x,e.y,o.x,o.y)<65**2)recipients.add(o);for(const e of recipients)afflict(e,'dis',1);}
 if(f[4].cinderCrown&&S.t>=b.crown){b.crown=S.t+3;fx(S.px,S.py,110,GODS[4].col,.4);for(const e of S.enemies)if(!e.dead&&dist2(S.px,S.py,e.x,e.y)<110**2)afflict(e,'burn',4);}
 if(f[3].bloodTide){const bleeding=S.enemies.filter(e=>!e.dead&&!protectedFromPlayer(e)&&e.c.bleed>0).length;healPlayer(Math.min(3,bleeding*.12)*dt);}
 const due=b.echoes.filter(e=>e.at<=S.t);b.echoes=b.echoes.filter(e=>e.at>S.t);
 for(const echo of due){fx(echo.x,echo.y,echo.r,GODS[8].col,.3);for(const e of S.enemies)if(!e.dead&&dist2(echo.x,echo.y,e.x,e.y)<echo.r**2){boneHit(e);hurt(e,echo.dmg,GODS[8].col);}}
 const novas=b.novas.splice(0);for(const n of novas){fx(n.x,n.y,110,GODS[5].col,.4);for(const e of S.enemies)if(!e.dead&&dist2(n.x,n.y,e.x,e.y)<110**2){afflict(e,'rad',4);hurt(e,30*S.stat.dmg,GODS[5].col);}}
}
function prepareLocust(s,dt){
 const f=S.gmod[2].f;if(!s.prepared){s.prepared=true;if(f.longFlight)s.life*=1.5;s.hits=new Set();s.pierces=f.piercing?3:1;}
 s.seek=(s.seek||0)-dt;
 if((f.homing||f.nursery)&&s.seek<=0){s.seek=.12;let target=null,best=450**2;for(const e of S.enemies){if(e.dead||e.turned||protectedFromPlayer(e)||s.hits.has(e))continue;const d=dist2(s.x,s.y,e.x,e.y);if(d<best){best=d;target=e;}}if(target){const speed=Math.hypot(s.vx,s.vy),angle=Math.atan2(target.y-s.y,target.x-s.x);s.vx=Math.cos(angle)*speed;s.vy=Math.sin(angle)*speed;}}
}
