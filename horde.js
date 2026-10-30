/* The horde has roles. A body's KIND is what it is for (minion, sieger, grunt, leader, titan);
   its ROLE is what it is doing now (eat, hunt, return, guard); its STAGE is how deep the blood
   it carries runs. Kind never changes. Nothing hunts alone: hostile births gather into packs
   behind a leader and arrive from the direction of their seat, at the edge of what you can see. */
const HORDE={
  kinds:{
    minion:{r:7, hp:.6, spd:1.3},     // gathers blood off the ground and runs it home; flees you
    sieger:{r:14,hp:2.6,spd:.7},      // bleeds towns, two mouths' worth, and spills more of each bite
    grunt:{r:9, hp:1,  spd:1},        // fights, with its god's manner
    leader:{r:16,hp:20,spd:.9},       // holds a pack together and decides what it does; stands at the back
    titan:{r:28,hp:40, spd:.75},      // guards a fat seat; the god's own shape of violence, larger
  },
  minionShare:.6, minionSense:420, minionFlee:170, minionFleeT:1.2,
  siegerSpill:.55,
  // packs: size grows with wrath; members hold formation until the player is within packBreak
  packBase:4, packPerWrath:1, packMax:48, packR:190, packSense:620, packBreak:300, packMin:3, packAlarm:20, looseT:15, roamT:45,
  edge:160, flankSize:14,             // spawn this far beyond the visible edge; a host comes in flanks of this many
  titanBlood:320, titanSeed:60, titanAt:120, titanGuard:420, titanSense:480, titanRest:120,
  // Hueilei: a telegraphed charge that stops on contact. Ik'Thel'The: a telegraphed dash along a
  // ray through where you stood, carrying on past you, then a stun. Gwulhorlw: slow, and a rot
  // pool where it dies; its titan pulses rot around itself.
  charge:{range:320,windup:.5,dist:260,speed:3.2,dmg:1.8,cd:3.5},
  dash:{range:520,windup:.6,len:640,speed:4.5,dmg:1.6,cd:4,stun:1},
  rot:{r:58,life:3,dps:.6,titanR:150,titanLife:2.5,titanDps:.8,titanCd:4},
  gruntStat:{0:{hp:1.4,spd:.8}},     // Gwulhorlw's grunts are bloated
};
function hordeInit(){
  S.packAcc=new Array(9).fill(0);S.titan=new Array(9).fill(null);S.titanCd=new Array(9).fill(0);
  S.hostLead=new Array(9).fill(null);S.hostOrigin=new Array(9).fill(null);S.hostFlank=new Array(9).fill(0);S.hostileFields=[];
}
function eaterKind(){return Math.random()<HORDE.minionShare?'minion':'sieger';}
function kindOf(e){return HORDE.kinds[e.kind]||HORDE.kinds.grunt;}
function hordeBody(g,kind,role,m,x,y){
  const k=HORDE.kinds[kind]||HORDE.kinds.grunt,b=S.bases[g],gs=kind==='grunt'&&HORDE.gruntStat[g]||{hp:1,spd:1};
  const seed=Math.min(kind==='titan'?HORDE.titanSeed:CFG.servantSeed,b.B);b.B-=seed;
  const hp=(CFG.enemyHpBase+CFG.enemyHpPerMin*m)*k.hp*gs.hp;
  const e=servant(g,x,y,role,hp,k.r,(74+m*4.5)*k.spd*gs.spd,seed);
  e.kind=kind;e.r0=k.r;e.born=S.t;e.ab=null;e.flee=0;e.alarm=-99;e.abCd=0;
  if(kind==='leader'){e.big=true;e.res=CFG.resBig;e.members=[];e.order='roam';e.formA=Math.random()*6.283;}
  if(kind==='titan'){e.big=true;e.titan=true;e.res=CFG.resBig;}
  S.enemies.push(e);return e;
}
function packSize(g){return Math.min(HORDE.packMax,Math.round(HORDE.packBase+HORDE.packPerWrath*Math.min(12,wrathOf(g))));}
// Where a pack appears: the seat itself if you can see it, else just past the edge of the view
// in the seat's direction. They come from where they come from; you just meet them sooner.
function packOrigin(g,da=0){
  const b=S.bases[g],R=Math.hypot(W,H)/cameraZoom()/2+HORDE.edge,a=Math.atan2(b.y-S.py,b.x-S.px)+da;
  if(Math.hypot(b.x-S.px,b.y-S.py)<=R)return {x:b.x,y:b.y,seat:true,a,R};
  return {x:S.px+Math.cos(a)*R,y:S.py+Math.sin(a)*R,seat:false,a,R};
}
// A host does not walk in as one column: every flankSize bodies it sends another leader round
// another side of you, fanning out from the seat's direction until the last come from behind.
const FLANKS=[0,1.1,-1.1,2.2,-2.2,.55,-.55,1.65,-1.65,2.75,-2.75];
// Members arrive spread along an arc of the edge, not in a column a single ray could thread.
function packMember(g,lead,o,m,host){
  let x,y;
  if(o.seat){const a=Math.random()*6.283,d=rnd(10,50);x=o.x+Math.cos(a)*d;y=o.y+Math.sin(a)*d;}
  else{const a=o.a+rnd(-.7,.7),d=o.R+rnd(0,160);x=S.px+Math.cos(a)*d;y=S.py+Math.sin(a)*d;}
  const e=hordeBody(g,'grunt','hunt',m,x,y);
  e.leader=lead;lead.members.push(e);if(host){e.host=true;e.spd*=CFG.hostSpeed;}
  return e;
}
function packLeader(g,o,m,host){
  const lead=hordeBody(g,'leader','hunt',m,o.x+Math.cos(o.a)*(o.seat?20:90),o.y+Math.sin(o.a)*(o.seat?20:90));
  lead.order='hunt';lead.alarm=S.t+HORDE.packAlarm;if(host){lead.host=true;lead.spd*=CFG.hostSpeed;}
  return lead;
}
function spawnPack(g,n,host){
  const m=S.t/60,o=packOrigin(g,rnd(-.6,.6)),lead=packLeader(g,o,m,host);S.hunters++;
  for(let k=1;k<n&&S.hunters<CFG.maxHunters;k++){packMember(g,lead,o,m,host);S.hunters++;}
  return lead;
}
// Called by spawn(): skirmishers gather into packs; hosts are one leader and everything behind it;
// a fat seat raises a titan.
function hordeSpawn(dt,m){
  for(let g=0;g<9;g++){
    const b=S.bases[g];if(b.broken){S.packAcc[g]=0;continue;}
    const n=packSize(g);
    if(S.packAcc[g]>=n&&S.hunters+n<=CFG.maxHunters){S.packAcc[g]-=n;spawnPack(g,n,false);}
    S.packAcc[g]=Math.min(S.packAcc[g],HORDE.packMax*2);
    if(S.t>=HORDE.titanAt&&!S.titan[g]&&S.titanCd[g]<=S.t&&b.B>=HORDE.titanBlood){
      const a=Math.random()*6.283,e=hordeBody(g,'titan','guard',m,b.x+Math.cos(a)*90,b.y+Math.sin(a)*90);
      S.titan[g]=e;toast(GODS[g].name+"'s titan rises at its seat.");
    }
  }
  for(let g=0;g<9;g++){
    if(S.hostQueue[g]<=0||S.bases[g].broken){S.hostQueue[g]=0;S.hostLead[g]=null;continue;}
    S.hostAcc[g]+=dt*S.hostSize[g]/CFG.hostBurst;
    while(S.hostAcc[g]>=1&&S.hostQueue[g]>0){
      if(S.hunters>=CFG.maxHunters)break;
      S.hostAcc[g]-=1;S.hostQueue[g]--;S.hunters++;
      let lead=S.hostLead[g];
      if(!lead||lead.dead||lead.turned||lead.members.length>=HORDE.flankSize){
        const k=S.hostFlank[g]++;S.hostOrigin[g]=packOrigin(g,FLANKS[k%FLANKS.length]);
        lead=S.hostLead[g]=packLeader(g,S.hostOrigin[g],m,true);
      }
      else packMember(g,lead,S.hostOrigin[g],m,true);
    }
    if(S.hostQueue[g]<=0){S.hostLead[g]=null;S.hostFlank[g]=0;}
  }
}
// ---- decisions ----
function hordeOrbSense(e){return e.kind==='minion'?HORDE.minionSense:CFG.orbSense;}
function liveLeader(e){const L=e.leader;if(L&&(L.dead||L.turned)){e.leader=null;return null;}return L||null;}
// pickTarget asks here first. Titans guard; leaders think; members take their leader's order.
// tt 7 = hold formation on the leader.
function hordeOrders(e){
  if(e.titan){
    const b=S.bases[e.god],seat=b.ent;
    const near=!protectedFromPlayer(e)&&(dist2(S.px,S.py,e.x,e.y)<HORDE.titanSense**2||(seat&&seat.hurtT>0));
    const far=dist2(e.x,e.y,b.x,b.y)>(HORDE.titanGuard*1.6)**2;
    if(near&&!far){e.tt=1;e.role='hunt';}else{e.tt=5;e.role='guard';e.tgt=null;}
    return true;
  }
  if(e.kind==='leader'){leaderThink(e);return true;}
  const L=liveLeader(e);
  if(!L&&e.kind==='grunt'&&e.loose){if(e.loose>S.t)return false;e.loose=0;if(e.role==='hunt'){e.role='eat';e.tt=0;}return false;}
  if(!L||e.kind!=='grunt')return false;
  if(L.order==='hunt'){e.tt=1;e.role='hunt';e.tgt=null;}
  else if(L.order==='war'&&L.wtarget&&!L.wtarget.dead){e.tt=2;e.tgt=L.wtarget;}
  else if(L.order==='home'){e.tt=7;e.tgt=null;}
  else {e.tt=7;e.tgt=null;}
  return true;
}
function leaderThink(e){
  e.members=e.members.filter(o=>!o.dead&&!o.turned&&o.leader===e);
  if(e.members.length<HORDE.packMax)for(const o of S.byGod[e.god]){
    if(o===e||o.kind!=='grunt'||o.desperate||liveLeader(o))continue;
    if(dist2(o.x,o.y,e.x,e.y)<(HORDE.packR*1.5)**2){o.leader=e;e.members.push(o);if(e.members.length>=HORDE.packMax)break;}
  }
  const hostile=!protectedFromPlayer(e),pd=dist2(S.px,S.py,e.x,e.y);
  let order='roam',wt=null;
  if(hostile&&(pd<HORDE.packSense**2||e.alarm>S.t))order='hunt';
  else if(S.bases[e.god].warAny){
    const wr=S.war[e.god];let bd=(CFG.warSense*2)**2;
    for(let h=0;h<9;h++){if(!wr[h])continue;for(const o of S.byGod[h]){const d=dist2(e.x,e.y,o.x,o.y);if(d<bd){bd=d;wt=o;}}}
    if(wt)order='war';
  }
  if(order==='roam'&&e.members.length<HORDE.packMin&&S.t-e.born>20)order='home';
  if(order==='roam'){e.roamSince??=S.t;if(S.t-e.roamSince>HORDE.roamT)order='home';}else e.roamSince=null;   // a pack that cannot find you goes home
  e.order=order;e.wtarget=wt;
  if(order==='hunt'){e.tt=1;e.role='hunt';e.tgt=null;}
  else if(order==='war'){e.tt=2;e.tgt=wt;e.role='hunt';}
  else if(order==='home'){e.tt=5;e.role='return';e.tgt=null;}
  else{                                             // roam: toward the living town nearest the priest, where fresh blood is being spilled
    let bt=null,bd=Infinity;for(const t of S.towns){if(t.P<=0)continue;const d=dist2(S.px,S.py,t.x,t.y);if(d<bd){bd=d;bt=t;}}
    if(bt){e.tt=4;e.tgt=bt;}else{e.tt=5;e.tgt=null;}e.role='hunt';
  }
  if(e.god===0)for(const o of e.members)if(dist2(o.x,o.y,e.x,e.y)<HORDE.packR**2)o.hp=Math.min(o.maxHp,o.hp+o.maxHp*.01);   // the mother's air
  if(e.god===3&&order==='hunt'&&pd<400**2&&S.t-(e.lastCall||-99)>5){e.lastCall=S.t;e.chargeNow=S.t;}             // a called charge
  if(e.god===6)e.formA+=.3;                                                                                       // the figure turns
}
function packSlot(L,e){
  let k=L.members.indexOf(e);if(k<0)k=0;
  if(L.priest&&L.ring)return priestSlot(L,e,k,L.members.length);
  if(L.god===6){const ring=Math.floor(k/3)+1,a=(k%3)*2.094+L.formA;return {x:L.x+Math.cos(a)*(26+ring*22),y:L.y+Math.sin(a)*(26+ring*22)};}
  const a=k*2.399,r=24+11*Math.sqrt(k);return {x:L.x+Math.cos(a)*r,y:L.y+Math.sin(a)*r};
}
// A member holds its slot until the quarry is close; then it is a grunt like any other.
function packTarget(e){
  const L=liveLeader(e);if(!L||e.kind!=='grunt'||e.desperate)return null;
  if(e.tt===1&&dist2(S.px,S.py,e.x,e.y)<HORDE.packBreak**2)return null;
  if(e.tt===2&&e.tgt&&dist2(e.tgt.x,e.tgt.y,e.x,e.y)<200**2)return null;
  const s=packSlot(L,e);return {tx:s.x,ty:s.y,stop:6,speed:1.15};
}
// ---- the body, each frame, before it moves. Returns null (move as usual), {hold} (it is busy),
// or {tx,ty,stop,speed} (go here instead).
function hordeThink(e,dt,edmg){
  if(e.priest&&e.sig)return priestThink(e,dt,edmg);
  if(e.flee>0){e.flee-=dt;const a=Math.atan2(e.y-S.py,e.x-S.px);return {tx:e.x+Math.cos(a)*200,ty:e.y+Math.sin(a)*200,stop:0,speed:1.2};}
  if(e.kind==='minion'&&!e.turned&&e.role!=='hunt'&&dist2(S.px,S.py,e.x,e.y)<HORDE.minionFlee**2){e.flee=HORDE.minionFleeT;e.tgtT=0;return hordeThink(e,0,edmg);}
  if(e.ab)return abilityStep(e,dt,edmg);
  const g=e.god,hunting=(e.tt===1||(e.tt===7&&liveLeader(e)?.ringAbilities))&&!protectedFromPlayer(e)&&(e.kind==='grunt'||e.titan);
  if(hunting&&e.abCd<=S.t){
    if(g===3||g===6){
      const spec=g===3?HORDE.charge:HORDE.dash,scale=e.titan?1.6:1,d2=dist2(S.px,S.py,e.x,e.y);
      const L=liveLeader(e),called=g!==3||e.titan||!L||S.t-(L.chargeNow||-99)<.3;
      if(called&&d2<(spec.range*scale)**2&&d2>50*50){
        const a=Math.atan2(S.py-e.y,S.px-e.x);
        e.ab={kind:g===3?'charge':'dash',phase:'windup',t:spec.windup,a,left:(g===3?spec.dist:spec.len)*scale,spec,scale};
        return {hold:true};
      }
    }
    if(g===0&&e.titan&&dist2(S.px,S.py,e.x,e.y)<(HORDE.rot.titanR*1.4)**2){e.ab={kind:'rotpulse',phase:'windup',t:1,spec:HORDE.rot};return {hold:true};}
  }
  return packTarget(e);
}
function abilityStep(e,dt,edmg){
  const ab=e.ab;
  if(ab.phase==='windup'){
    ab.t-=dt;if(ab.t>0)return {hold:true};
    if(ab.kind==='rotpulse'){hostileField(e.x,e.y,HORDE.rot.titanR,HORDE.rot.titanLife,edmg*HORDE.rot.titanDps,GODS[0].col);e.ab=null;e.abCd=S.t+HORDE.rot.titanCd;return {hold:true};}
    ab.phase='go';e.dashMult=ab.spec.dmg*(e.titan?1.3:1);return {hold:true};
  }
  if(ab.phase==='go'){
    const s=Math.min(e.spd*ab.spec.speed*dt,ab.left);
    WorldNavigation.move(S.terrain,e,Math.cos(ab.a)*s,Math.sin(ab.a)*s);ab.left-=s;
    if(e.sig&&e.sig.trail!==undefined){ab.trailD=(ab.trailD||0)+s;if(ab.trailD>36){ab.trailD=0;hostileField(e.x,e.y,34,2.5,edmg*.5,GODS[e.sig.trail].col);}}   // a priest that burns as it goes
    const hit=dist2(S.px,S.py,e.x,e.y)<(e.r+11)**2;
    if(hit&&e.sig&&e.sig.heal&&ab.kind==='charge'&&!ab.healed){ab.healed=1;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*e.sig.heal);}
    if(ab.left<=0||(ab.kind==='charge'&&hit)||s<=0){ab.phase='stun';ab.t=ab.kind==='dash'?ab.spec.stun:.3;e.dashMult=1;}
    return {hold:true};
  }
  ab.t-=dt;if(ab.t<=0){e.ab=null;e.abCd=S.t+ab.spec.cd;}
  return {hold:true};
}
// ---- what a strike and a death mean, by kind ----
function hordeStruck(e){
  if(e.kind==='minion'){e.flee=HORDE.minionFleeT;return;}
  if(e.kind==='sieger'||e.titan)return;
  if(e.kind==='leader'){e.alarm=S.t+8;}
  if(e.role!=='hunt'){e.role='hunt';e.tt=1;e.tgt=null;}
}
function hordeDeath(e){
  if(e.kind==='leader'){
    // the pack loses its shape, not its hunger: members hunt loose for a while, then drift off to eat
    let n=0;for(const o of e.members||[])if(!o.dead&&o.leader===e){o.leader=null;o.loose=S.t+HORDE.looseT;o.tt=0;o.tgtT=0;o.flee=.5+Math.random()*.5;n++;}
    if(n>=6&&S.t-(S.scatterT||-99)>15){S.scatterT=S.t;toast('Without its leader, '+GODS[e.god].name+"'s pack scatters.");}
  }
  if(e.titan){S.titan[e.god]=null;S.titanCd[e.god]=S.t+HORDE.titanRest;S.tokens++;fx(e.x,e.y,160,'#e8e2d8',.7);toast(GODS[e.god].name+"'s titan is broken. A pledge token, torn out of it.");}
  if(!e.priest&&!e.titan){const gr=S.graves[e.god];gr.push({x:e.x,y:e.y});if(gr.length>40)gr.shift();}   // where it fell, for those who raise the dead
  if(e.kind==='grunt'&&e.god===0&&!e.turned)hostileField(e.x,e.y,HORDE.rot.r,HORDE.rot.life,(CFG.enemyDmgBase+CFG.enemyDmgPerMin*S.t/60)*S.enemyPower*HORDE.rot.dps,GODS[0].col);
}
function hordeRestage(e,st){e.r=(e.r0||CFG.stageR[0])*CFG.stageR[st]/CFG.stageR[0];}
// ---- ground that hurts you, not them ----
function hostileField(x,y,r,life,dps,col){if(S.hostileFields.length<80)S.hostileFields.push({x,y,r,life,max:life,dps,col});}
function hordeFields(dt){
  for(const f of S.hostileFields){
    f.life-=dt;
    if(f.life>0&&dist2(S.px,S.py,f.x,f.y)<f.r*f.r){receiveDamage(f.dps*dt);if(S.hp<=0){die();return;}}
  }
  S.hostileFields=S.hostileFields.filter(f=>f.life>0);
}
// ---- drawing: telegraphs and pools under the bodies, marks over them ----
function drawHordeUnder(cx){
  for(const f of S.hostileFields){const a=f.life/f.max;cx.fillStyle=f.col+hex(.1+.2*a);cx.beginPath();cx.arc(f.x,f.y,f.r,0,6.283);cx.fill();cx.strokeStyle=f.col+'66';cx.stroke();}
  for(const e of S.enemies){
    if(e.dead||!e.ab||e.ab.phase!=='windup')continue;
    const ab=e.ab,col=GODS[e.god].col,p=1-Math.max(0,ab.t)/(ab.kind==='rotpulse'?1:ab.spec.windup);
    if(ab.kind==='rotpulse'){cx.strokeStyle=col+'aa';cx.lineWidth=2;cx.beginPath();cx.arc(e.x,e.y,HORDE.rot.titanR*p,0,6.283);cx.stroke();}
    else{cx.strokeStyle=col+hex(.35+.5*p);cx.lineWidth=ab.kind==='dash'?3:6;cx.beginPath();cx.moveTo(e.x,e.y);cx.lineTo(e.x+Math.cos(ab.a)*ab.left,e.y+Math.sin(ab.a)*ab.left);cx.stroke();}
    cx.lineWidth=1;
  }
  drawPriestsUnder(cx);
}
function drawHordeOver(cx,viewW,viewH){
  drawPriestsOver(cx,viewW,viewH);
  for(const e of S.enemies){
    if(e.dead||e.seat||(e.kind!=='leader'&&!e.titan))continue;
    if(Math.abs(e.x-S.px)>viewW/2+120||Math.abs(e.y-S.py)>viewH/2+140)continue;
    const col=GODS[e.god].col,top=e.y+e.r*.7-Math.max(28,e.r*3.2);
    if(e.kind==='leader'){cx.fillStyle=col;cx.strokeStyle='#e8e2d8';cx.lineWidth=1;cx.beginPath();cx.moveTo(e.x,top-4);cx.lineTo(e.x-7,top-18);cx.lineTo(e.x+7,top-18);cx.closePath();cx.fill();cx.stroke();}
    else{cx.strokeStyle='#e8e2d8aa';cx.lineWidth=2;cx.beginPath();cx.arc(e.x,e.y,e.r+8,0,6.283);cx.stroke();cx.strokeStyle=col+'aa';cx.beginPath();cx.arc(e.x,e.y,e.r+13,0,6.283);cx.stroke();cx.lineWidth=1;}
  }
}
