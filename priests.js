/* Rival priests are greater demons. Killing one only sends it back; it returns with a grudge,
   and the grudge outlives the run. Each god keeps three, and no two work the same way: one
   commands the horde beneath it, one consumes it, one fights in front of it, each in the manner
   of its god. Names are placeholders to be replaced. */
const PRIESTS=[
 [ // 0 Gwulhorlw — rot
  {name:'Mother Vellum',epithet:'the Lesion',sig:'raise',n:5,cd:9,keep:260,passive:'trail',hp:1},
  {name:'Oswin Pallid',epithet:'the Lung',sig:'slam',r:150,cd:5,field:0,passive:'shield',hp:1.3},
  {name:'The Choirless Brother',epithet:'who eats his own',sig:'absorb',then:'slam',r:120,cd:6,passive:'pool',hp:.9},
 ],
 [ // 1 The Bottomless — coveting
  {name:'Lady Whist',epithet:'the Unanswered',sig:'pull',r:420,strength:85,keep:300,pray:true,hp:1},
  {name:'Caddis',epithet:'of the Many Hands',sig:'encircle',keep:320,hp:1.1},
  {name:'The Bride Enough',epithet:'',sig:'sacrifice',n:3,cd:6,mode:'scream',keep:280,hp:1},
 ],
 [ // 2 The Ninth Swarm — locusts
  {name:'Thrum',epithet:'the Unceasing',sig:'summon',n:6,cd:7,keep:300,hp:.9},
  {name:'The Hundredth Mouth',epithet:'',sig:'absorb',then:'slam',r:130,cd:6,hp:1.1},
  {name:'Sister Harrow',epithet:'of the Chitin Veil',sig:'volley',n:7,cd:3.2,spread:.9,speed:300,mode:'locust',keep:340,hp:.9},
 ],
 [ // 3 Hueilei — blood
  {name:'Arrax',epithet:'the Debtor',sig:'dash',dist:380,cd:4,heal:.12,hp:1.2},
  {name:'Pale Ilse',epithet:'Bloodwarden',sig:'sacrifice',n:2,cd:5,mode:'heal',hp:1},
  {name:'The Red Tally',epithet:'',sig:'line',cd:7,keep:260,hp:1.1},
 ],
 [ // 4 The Cinder Jarl — fire
  {name:'Brenna Ash',epithet:'the Hearthwife',sig:'slam',r:130,cd:4.5,field:4,hp:1.2},
  {name:'Ulf Half-Burnt',epithet:'',sig:'dash',dist:460,cd:4.5,trail:4,hp:1},
  {name:'The Kindling Choir',epithet:'',sig:'sacrifice',n:3,cd:6,mode:'ember',keep:300,hp:1},
 ],
 [ // 5 The Woken Star — radiance
  {name:'Sol Minora',epithet:'',sig:'volley',n:3,cd:3,spread:.5,speed:140,mode:'radiant',keep:360,hp:1},
  {name:'The Eclipse Vicar',epithet:'',sig:'pull',r:380,strength:70,well:true,cd:5,keep:300,hp:1.1},
  {name:'Perihelion Hest',epithet:'',sig:'blink',then:'slam',r:120,cd:6,field:5,hp:1},
 ],
 [ // 6 Ik'Thel'The — geometry
  {name:'The Theorem',epithet:'',sig:'dash',dist:520,cd:5,repeat:3,hp:1},
  {name:'Quiet Axiom',epithet:'',sig:'tessellate',keep:300,hp:1.1},
  {name:'The Second Proof',epithet:'',sig:'blink',then:'rays',n:3,cd:5.5,hp:.9},
 ],
 [ // 7 First Blasphemy — the written word
  {name:'Lector Umbrage',epithet:'',sig:'trap',n:3,cd:4,keep:320,hp:1},
  {name:'The Unspoken Gloss',epithet:'',sig:'curse',n:3,cd:7,keep:340,hp:1},
  {name:'Scrivener Null',epithet:'',sig:'sacrifice',n:2,cd:6,mode:'sigil',keep:300,hp:1},
 ],
 [ // 8 The Pale Ossuary — bone
  {name:'The Sexton',epithet:'',sig:'raise',n:6,cd:8,keep:280,hp:1},
  {name:'Ossa',epithet:'the Grandmother',sig:'absorb',then:'slam',r:140,cd:6,hp:1.2},
  {name:'Pallbearer Thane',epithet:'',sig:'procession',passive:'shield',hp:1.1},
 ],
];
const PRIEST={banishBase:90,banishGrow:.5,grudgeHp:.25,grudgeCap:4,spillShare:.5,ringSlots:24,ringMax:270,ringMin:110,ringClose:24,save:'rot-priests-v1'};
function priestMemory(){try{const p=JSON.parse(localStorage.getItem(PRIEST.save)||'{}');return Array.from({length:9},(_,g)=>[0,1,2].map(i=>Number(p.sent?.[g]?.[i])||0));}catch{return Array.from({length:9},()=>[0,0,0]);}}
function priestsInit(){
  const sent=priestMemory();
  S.priestState=PRIESTS.map((r,g)=>r.map((_,i)=>({alive:false,until:0,sent:0,grudge:Math.min(PRIEST.grudgeCap,sent[g][i])})));
  S.graves=Array.from({length:9},()=>[]);S.wounds=[];S.hostileShots=[];S.hostileRays=[];S.traps=[];S.curses=[];
}
function savePriests(){try{const sent=priestMemory();for(let g=0;g<9;g++)for(let i=0;i<3;i++)sent[g][i]+=S.priestState[g][i].sent;localStorage.setItem(PRIEST.save,JSON.stringify({sent}));}catch{}}
// Which of a god's three answers: the one not here and not banished that has been sent least.
function pickPriest(g){
  let best=-1,bs=Infinity;
  for(let i=0;i<3;i++){const s=S.priestState[g][i];if(s.alive||s.until>S.t)continue;const score=s.sent*10+i;if(score<bs){bs=score;best=i;}}
  return best;
}
function priestBody(g,i,hp,seed){
  const P=PRIESTS[g][i],st=S.priestState[g][i],b=S.bases[g],m=S.t/60;
  const e=servant(g,b.x,b.y,'hunt',hp*P.hp*(1+PRIEST.grudgeHp*st.grudge),CFG.bossRadius,(74+m*4.5)*1.1,seed);   // walks a little faster than its grunts; a seat is a long way off
  e.big=true;e.boss=true;e.priest=true;e.bank=0;e.prayCd=CFG.prayCd;e.pray=null;e.res=CFG.resBig;
  e.sig=P;e.pi=i;e.pname=P.name;e.grudge=st.grudge;e.sigCd=2;e.thinkT=0;e.members=[];e.order='hunt';e.absorbed=0;e.ab=null;e.abCd=0;e.r0=CFG.bossRadius;
  if(['encircle','tessellate','line','procession'].includes(P.sig)){e.order='ring';e.ring={r:PRIEST.ringMax,a:Math.random()*6.283};e.ringAbilities=P.sig==='tessellate';}
  st.alive=true;S.enemies.push(e);
  toast(P.name+(P.epithet?', '+P.epithet:'')+', priest of '+GODS[g].name+', '+(st.grudge?'returns with a grudge.':'leaves its seat.'));
  return e;
}
// Sent back, not killed. Half its bank spills where it stood; half goes home. It returns later, angrier.
function banishPriest(e,mine){
  const st=S.priestState[e.god][e.pi];st.alive=false;st.sent++;st.grudge=Math.min(PRIEST.grudgeCap,st.grudge+1);
  st.until=S.t+PRIEST.banishBase*(1+PRIEST.banishGrow*(st.sent-1));
  if(e.bank>0){const spill=e.bank*PRIEST.spillShare,home=e.bank-spill;mkOrb(e.x,e.y,spill,1<<e.god);if(S.bases[e.god].broken)S.departed+=home;else S.bases[e.god].B+=home;e.bank=0;}
  for(const o of e.members)if(!o.dead&&o.leader===e){o.leader=null;o.loose=S.t+HORDE.looseT;}
  savePriests();
  if(mine)toast(e.pname+' is sent back, not killed. A pledge token, torn out of it. It returns in '+Math.round(st.until-S.t)+' seconds.');
}
function priestGuard(e,dmg){
  if(e.sig?.passive!=='shield')return dmg;
  let n=0;for(const o of S.byGod[e.god])if(o!==e&&dist2(o.x,o.y,e.x,e.y)<200**2&&++n>=3)return dmg*.3;   // it stands behind its own
  return dmg;
}
function priestSlot(L,e,k,n){
  const sig=L.sig.sig,ring=L.ring;
  if(sig==='encircle'){const a=ring.a+k*6.283/Math.max(n,6);return {x:S.px+Math.cos(a)*ring.r,y:S.py+Math.sin(a)*ring.r};}
  if(sig==='tessellate'){const v=k%3,layer=Math.floor(k/3),a=ring.a+v*2.094,r=210+layer*34;return {x:S.px+Math.cos(a)*r,y:S.py+Math.sin(a)*r};}
  if(sig==='line'){const a=Math.atan2(S.py-L.y,S.px-L.x)+Math.PI/2,off=(k-(n-1)/2)*46;return {x:L.x+Math.cos(a)*off+Math.cos(a-Math.PI/2)*70,y:L.y+Math.sin(a)*off+Math.sin(a-Math.PI/2)*70};}
  const a=ring.a*2+k*6.283/Math.max(n,4);return {x:L.x+Math.cos(a)*95,y:L.y+Math.sin(a)*95};   // procession
}
function priestRecruit(e,max=PRIEST.ringSlots){
  e.members=e.members.filter(o=>!o.dead&&!o.turned&&o.leader===e);
  if(e.members.length>=max)return;
  for(const o of S.byGod[e.god]){if(o===e||o.kind!=='grunt'||o.desperate||liveLeader(o))continue;if(dist2(o.x,o.y,e.x,e.y)<450**2){o.leader=e;e.members.push(o);if(e.members.length>=max)break;}}
}
function priestSummon(e,n,where){
  const m=S.t/60,born=[];
  for(let k=0;k<n&&S.hunters<CFG.maxHunters;k++){
    const p=where&&where[k]?where[k]:{x:e.x+Math.cos(k*6.283/n)*50,y:e.y+Math.sin(k*6.283/n)*50};
    const o=hordeBody(e.god,'grunt','hunt',m,p.x,p.y);o.leader=e;e.members.push(o);o.tgtT=0;S.hunters++;fx(p.x,p.y,24,GODS[e.god].col,.4);born.push(o);
  }
  return born;
}
function ownNear(e,r){const out=[];for(const o of S.byGod[e.god])if(o!==e&&!o.dead&&!o.turned&&!o.titan&&dist2(o.x,o.y,e.x,e.y)<r*r)out.push(o);return out;}
function consume(e,o){e.bank+=o.abs;o.abs=0;o.dead=true;fx(o.x,o.y,o.r+6,GODS[e.god].col,.3);}
function wound(x,y,r,t,dmg,col){S.wounds.push({x,y,r,t,max:t,dmg,col});}
function placeTrap(x,y,col,dmg){if(S.traps.length<40)S.traps.push({x,y,r:60,arm:.8,life:12,dmg,col});}
function hostileShot(x,y,a,speed,r,dmg,life,col,mode){S.hostileShots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,dmg,life,col,mode});}
// Each frame, before it moves. Returns the same shapes hordeThink does.
function priestThink(e,dt,edmg){
  const P=e.sig,g=e.god,col=GODS[g].col,hostile=!protectedFromPlayer(e),d=Math.hypot(S.px-e.x,S.py-e.y),m=S.t/60;
  e.thinkT-=dt;e.sigCd-=dt;
  if(e.rageT>0){e.rageT-=dt;if(e.rageT<=0)e.dashMult=1;}
  // passives
  if(P.passive==='trail'&&S.t>=(e.trailT||0)&&(e.lastX===undefined||dist2(e.x,e.y,e.lastX,e.lastY)>40*40)){e.trailT=S.t+1.2;e.lastX=e.x;e.lastY=e.y;hostileField(e.x,e.y,40,4,edmg*.4,col);}
  if(P.passive==='pool'&&S.t>=(e.poolT||0)){e.poolT=S.t+.9;hostileField(e.x,e.y,56+e.absorbed*7,1,edmg*.5,col);}
  if(P.sig==='pull'&&hostile&&d<P.r&&d>40){const p={x:S.px,y:S.py,r:11};WorldNavigation.move(S.terrain,p,(e.x-S.px)/d*P.strength*dt,(e.y-S.py)/d*P.strength*dt);S.px=p.x;S.py=p.y;}
  if(P.sig==='absorb'){for(const o of ownNear(e,240)){if(o.kind==='leader'||o.boss)continue;const od=Math.hypot(o.x-e.x,o.y-e.y);if(od<e.r+o.r){consume(e,o);e.absorbed++;e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.05);e.r=Math.min(e.r0+18,e.r0+e.absorbed*1.5);}else WorldNavigation.move(S.terrain,o,(e.x-o.x)/od*130*dt,(e.y-o.y)/od*130*dt);}}
  // packs it leads
  if(e.thinkT<=0){
    e.thinkT=.5;
    if(e.order==='ring'||['summon','raise'].includes(P.sig))priestRecruit(e);
    if(e.order==='ring'){
      e.ring.a+=P.sig==='tessellate'?.3:.12;
      if(P.sig==='encircle'){if(e.rushT>0){e.rushT-=.5;if(e.rushT<=0){e.ring.r=PRIEST.ringMax;e.order='ring';}}else if(hostile&&d<520){e.ring.r-=PRIEST.ringClose;if(e.ring.r<=PRIEST.ringMin){e.rushT=3;e.order='hunt';for(const o of e.members)o.tgtT=0;}}}   // the ring closes, then the hands take hold
      if(e.members.length<4&&e.sigCd<=0&&hostile&&d<600){e.sigCd=8;priestSummon(e,P.sig==='procession'?4:6);}
    }
  }
  if(e.ab)return priestAbility(e,dt,edmg);
  if(!hostile||e.sigCd>0)return keepDistance(e,d);
  // signatures
  if(P.sig==='dash'&&d<P.dist*1.1&&d>60){e.ab={kind:'charge',phase:'windup',t:.6,a:Math.atan2(S.py-e.y,S.px-e.x),left:P.dist,spec:{...HORDE.charge,dist:P.dist,dmg:2,cd:P.cd,speed:3},repeat:(P.repeat||1)-1};return {hold:true};}
  if(P.sig==='slam'&&d<P.r*1.1){e.ab={kind:'slam',phase:'windup',t:.8,r:P.r};return {hold:true};}
  if(P.sig==='absorb'&&e.absorbed>=4&&d<(P.r+e.absorbed*5)*1.3+40){e.ab={kind:'slam',phase:'windup',t:.8,r:P.r+e.absorbed*5,bonus:1+e.absorbed*.1};e.absorbed=0;return {hold:true};}
  if(P.sig==='blink'&&d<560){const a=Math.random()*6.283;e.ab={kind:'blink',phase:'windup',t:.5,tx:S.px+Math.cos(a)*110,ty:S.py+Math.sin(a)*110};return {hold:true};}
  if(P.sig==='volley'&&d<520){e.sigCd=P.cd;const a0=Math.atan2(S.py-e.y,S.px-e.x);for(let k=0;k<P.n;k++){const a=a0+(k-(P.n-1)/2)*(P.spread/Math.max(1,P.n-1));if(P.mode==='locust')hostileShot(e.x,e.y,a,P.speed,4,edmg*.6,1.7,col,'locust');else hostileShot(e.x,e.y,a,P.speed,9,edmg*1.2,3.2,col,'radiant');}return {hold:true};}
  if(P.sig==='trap'&&d<520){e.sigCd=P.cd;for(let k=0;k<P.n;k++){const a=Math.random()*6.283,r=rnd(70,170);placeTrap(S.px+Math.cos(a)*r,S.py+Math.sin(a)*r,col,edmg*1.6);}return null;}
  if(P.sig==='curse'&&d<560){e.sigCd=P.cd;for(let k=1;k<=P.n;k++)S.curses.push({at:S.t+.8*k,r:84,dmg:edmg*1.5,col});fx(S.px,S.py,30,col,.5);return null;}
  if(P.sig==='pull'&&P.well&&d<P.r){e.sigCd=P.cd;wound(S.px,S.py,110,1.1,edmg*2,col);return null;}
  if(P.sig==='summon'&&d<600){e.sigCd=P.cd;priestSummon(e,P.n);return null;}
  if(P.sig==='raise'&&d<650){
    const graves=S.graves[g].filter(p=>dist2(p.x,p.y,e.x,e.y)<600**2).slice(-P.n);
    if(graves.length>=2){e.sigCd=P.cd;S.graves[g]=S.graves[g].filter(p=>!graves.includes(p));priestSummon(e,graves.length,graves);return null;}
  }
  if(P.sig==='sacrifice'&&d<520){
    const own=ownNear(e,280).filter(o=>!o.boss&&o.kind!=='leader').slice(0,P.n);
    if(own.length){e.sigCd=P.cd;
      for(const o of own){const ox=o.x,oy=o.y;consume(e,o);
        if(P.mode==='scream'){const a=Math.random()*6.283,r=rnd(0,60);wound(S.px+Math.cos(a)*r,S.py+Math.sin(a)*r,90,.7,edmg*1.6,col);}
        if(P.mode==='heal'){e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.08);e.dashMult=Math.min(1.45,(e.dashMult||1)+.15);e.rageT=10;}
        if(P.mode==='ember')hostileShot(ox,oy,Math.atan2(S.py-oy,S.px-ox),260,8,edmg*1.2,2.5,col,'ember');
        if(P.mode==='sigil')placeTrap(S.px+rnd(-120,120),S.py+rnd(-120,120),col,edmg*1.6);
      }
      return null;
    }
  }
  if(P.sig==='line'&&d<420&&e.members.length>=2){e.sigCd=P.cd;const a=Math.atan2(S.py-e.y,S.px-e.x);for(const o of e.members)if(!o.ab)o.ab={kind:'charge',phase:'windup',t:.6,a:Math.atan2(S.py-o.y,S.px-o.x),left:300,spec:HORDE.charge,scale:1};e.ab={kind:'charge',phase:'windup',t:.6,a,left:300,spec:{...HORDE.charge,dist:300,dmg:1.8,cd:P.cd,speed:2.6},repeat:0};return {hold:true};}
  return keepDistance(e,d);
}
function keepDistance(e,d){
  const keep=e.sig.keep;if(!keep||e.tt!==1)return null;
  if(d<keep-50){const a=Math.atan2(e.y-S.py,e.x-S.px);return {tx:e.x+Math.cos(a)*120,ty:e.y+Math.sin(a)*120,stop:0,speed:1};}
  if(d<keep+50)return {hold:true};
  return null;
}
function priestAbility(e,dt,edmg){
  const ab=e.ab,col=GODS[e.god].col;
  if(ab.kind==='charge'){
    const r=abilityStep(e,dt,edmg);
    if(!e.ab){if(ab.repeat>0&&!protectedFromPlayer(e)){e.ab={...ab,phase:'windup',t:.45,a:Math.atan2(S.py-e.y,S.px-e.x),left:ab.spec.dist,repeat:ab.repeat-1};}else e.sigCd=ab.spec.cd;}
    return r;
  }
  if(ab.kind==='blink'){
    ab.t-=dt;if(ab.t>0)return {hold:true};
    const p=WorldNavigation.nearest(S.terrain,ab.tx,ab.ty,24);fx(e.x,e.y,e.r+10,col,.4);e.x=p.x;e.y=p.y;fx(e.x,e.y,e.r+10,col,.4);
    if(e.sig.then==='slam')e.ab={kind:'slam',phase:'windup',t:.7,r:e.sig.r};
    else{e.ab=null;e.sigCd=e.sig.cd;const a0=Math.atan2(S.py-e.y,S.px-e.x);for(let k=0;k<e.sig.n;k++)S.hostileRays.push({x:e.x,y:e.y,a:a0+(k-(e.sig.n-1)/2)*.5,len:720,t:.7,max:.7,dmg:edmg*1.8,col});}
    return {hold:true};
  }
  if(ab.kind==='slam'){
    ab.t-=dt;if(ab.t>0)return {hold:true};
    const r=ab.r,bonus=ab.bonus||1,d=Math.hypot(S.px-e.x,S.py-e.y);
    fx(e.x,e.y,r,col,.5);
    if(d<r+11&&!protectedFromPlayer(e)){receiveDamage(edmg*2.2*bonus,e);S.inv=S.stat.iframe;const p={x:S.px,y:S.py,r:11},k=140/Math.max(1,d);WorldNavigation.move(S.terrain,p,(S.px-e.x)*k,(S.py-e.y)*k);S.px=p.x;S.py=p.y;if(S.hp<=0){die();return {hold:true};}}
    const fg=e.sig.field;if(fg!==undefined)hostileField(e.x,e.y,r*.8,3,edmg*.5*bonus,GODS[fg].col);
    e.ab=null;e.sigCd=e.sig.cd;return {hold:true};
  }
  e.ab=null;return null;
}
// wounds, traps, shots and rays: everything a priest leaves in the world that is aimed at you
function priestsTick(dt){
  const hit=(amount,src)=>{receiveDamage(amount,src);S.inv=S.stat.iframe;fx(S.px,S.py,22,'#e8534c',.25);if(S.hp<=0)die();};
  for(const c of S.curses)if(S.t>=c.at){wound(S.px,S.py,c.r,.9,c.dmg,c.col);c.done=1;}
  S.curses=S.curses.filter(c=>!c.done);
  for(const w of S.wounds){w.t-=dt;if(w.t<=0){w.done=1;fx(w.x,w.y,w.r,w.col,.3);if(dist2(S.px,S.py,w.x,w.y)<w.r*w.r&&S.inv<=0){hit(w.dmg);if(S.mode!=='play')return;}}}
  S.wounds=S.wounds.filter(w=>!w.done);
  for(const t of S.traps){t.arm-=dt;t.life-=dt;if(t.arm<=0&&dist2(S.px,S.py,t.x,t.y)<t.r*t.r){t.life=0;fx(t.x,t.y,t.r,t.col,.35);if(S.inv<=0){hit(t.dmg);if(S.mode!=='play')return;}}}
  S.traps=S.traps.filter(t=>t.life>0);
  for(const s of S.hostileShots){
    s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
    if(dist2(S.px,S.py,s.x,s.y)<(s.r+11)**2){s.life=0;if(S.inv<=0){hit(s.dmg);if(S.mode!=='play')return;}}
    if(s.life<=0&&s.mode==='radiant')hostileField(s.x,s.y,70,3,s.dmg*.3,s.col);
    if(s.life<=0&&s.mode==='ember')hostileField(s.x,s.y,44,3,s.dmg*.3,s.col);
  }
  S.hostileShots=S.hostileShots.filter(s=>s.life>0);
  for(const r of S.hostileRays){r.t-=dt;if(r.t<=0){r.done=1;const dx=Math.cos(r.a),dy=Math.sin(r.a),rx=S.px-r.x,ry=S.py-r.y,along=rx*dx+ry*dy;if(along>0&&along<r.len&&Math.abs(-rx*dy+ry*dx)<14+11&&S.inv<=0){hit(r.dmg);if(S.mode!=='play')return;}}}
  S.hostileRays=S.hostileRays.filter(r=>!r.done);
}
function drawPriestsUnder(cx){
  for(const t of S.traps){cx.strokeStyle=t.col+(t.arm>0?'44':'aa');cx.lineWidth=1.5;cx.beginPath();cx.arc(t.x,t.y,t.r,0,6.283);cx.stroke();cx.beginPath();for(let k=0;k<5;k++){const a=k*2*Math.PI*2/5-1.5708,px=t.x+Math.cos(a)*t.r*.6,py=t.y+Math.sin(a)*t.r*.6;k?cx.lineTo(px,py):cx.moveTo(px,py);}cx.closePath();cx.stroke();}
  for(const w of S.wounds){const p=1-w.t/w.max;cx.fillStyle=w.col+hex(p*.45);cx.beginPath();cx.arc(w.x,w.y,w.r,0,6.283);cx.fill();cx.strokeStyle=w.col+'cc';cx.stroke();}
  for(const r of S.hostileRays){const p=1-r.t/r.max;cx.strokeStyle=r.col+hex(.3+.6*p);cx.lineWidth=2+p*6;cx.beginPath();cx.moveTo(r.x,r.y);cx.lineTo(r.x+Math.cos(r.a)*r.len,r.y+Math.sin(r.a)*r.len);cx.stroke();}
  for(const s of S.hostileShots){cx.fillStyle=s.col;cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill();if(s.mode!=='locust'){cx.strokeStyle='#e8e2d8aa';cx.stroke();}}
  for(const e of S.enemies){
    if(e.dead||!e.priest||!e.ab)continue;const col=GODS[e.god].col;
    if(e.ab.kind==='slam'&&e.ab.phase==='windup'){const p=1-e.ab.t/.8;cx.strokeStyle=col+'cc';cx.lineWidth=3;cx.beginPath();cx.arc(e.x,e.y,e.ab.r,0,6.283);cx.stroke();cx.fillStyle=col+hex(.1+.3*p);cx.fill();}
    if(e.ab.kind==='blink'){cx.strokeStyle=col+'aa';cx.lineWidth=2;cx.setLineDash([6,6]);cx.beginPath();cx.arc(e.ab.tx,e.ab.ty,e.r+8,0,6.283);cx.stroke();cx.setLineDash([]);}
    cx.lineWidth=1;
  }
}
function drawPriestsOver(cx,viewW,viewH){
  cx.save();cx.textAlign='center';cx.font='11px system-ui';cx.lineWidth=3;cx.strokeStyle='#181612';
  for(const e of S.enemies){
    if(e.dead||!e.priest||!e.pname)continue;
    if(Math.abs(e.x-S.px)>viewW/2+120||Math.abs(e.y-S.py)>viewH/2+140)continue;
    const label=e.pname+(e.grudge?' †'+e.grudge:''),y=e.y+e.r+16;
    cx.fillStyle='#e8e2d8';cx.strokeText(label,e.x,y);cx.fillText(label,e.x,y);
    if(e.sig.passive==='shield'&&priestGuard(e,1)<1){cx.strokeStyle=GODS[e.god].col+'88';cx.lineWidth=2;cx.beginPath();cx.arc(e.x,e.y,e.r+6,0,6.283);cx.stroke();cx.lineWidth=3;cx.strokeStyle='#181612';}
  }
  cx.restore();
}
