/* Weapon identities, finite build choices, and upgrade presentation. */
const ARMAMENTS=[
 [{n:'Rotting presence',t:'A close miasma accumulates disease. Infected corpses rupture.'},{n:'Pustule orchard',t:'Lob diseased seeds at distant prey. Each impact plants a lingering infectious wound.'}],
 [{n:'Covetous whisper',t:'Seduce a servant into betraying its own. Its touch spreads your afflictions.'},{n:'Hysterical choir',t:'A stolen voice screams from within the crowd. More enthralled voices amplify the chorus.'}],
 [{n:'Devouring flight',t:'Locust volleys finish the wounded and carry afflictions onward.'},{n:'Brood halo',t:'A revolving brood bites around you, seeding infestation in everything it touches.'}],
 [{n:'Blood debt',t:'A broad sacrifice of flesh. Every enemy cut restores your health.'},{n:'Sanguine needle',t:'Pierce a line of bodies; reap health from those already bleeding.'}],
 [{n:'Cinderswing',t:'Sweep a burning blade through the crowd and scatter embers.'},{n:'Funeral pyre',t:'Raise a lasting pyre beneath clustered enemies. Disease makes its flames hungrier.'}],
 [{n:'Gravity well',t:'Collapse a distant point, pulling flesh inward before a radiant impact.'},{n:'Binary suns',t:'Twin stars orbit you. Their periodic flares irradiate nearby enemies.'}],
 [{n:'Unfold',t:'A piercing proof divides at Fibonacci kill counts.'},{n:'Recursive lattice',t:'Trace a rotating polygon through space. Rays branch at its vertices into a self-similar lattice.'}],
 [{n:'Anti-sigil',t:'Place traps that explode when an enemy enters. Enter an unused seal to gain borrowed word: +25% damage to all weapons for 3 seconds.'},{n:'Palimpsest',t:'Automatically place two overlapping traps: one at your feet and one toward nearby prey (or your facing direction). Enemies entering a trap trigger an area blast. Stand in each unused seal to gain borrowed word: +25% damage to all weapons for 3 seconds. Further seals refresh the buff; they do not stack it. Seals expire after 10 seconds.'}],
 [{n:'Carrion rite',t:'Raise a seeker that walks into the densest crowd and detonates.'},{n:'Pallbearer procession',t:'Bone attendants circle their priest, striking nearby bodies and carrying disease.'}]
];
const DOCTRINES=[['Septic communion','Gangrenous heart'],['Adoring congregation','Ecstatic collapse'],['Endless brood','Carrion sovereign'],['Open artery','Red covenant'],['Wildfire scripture','White-hot execution'],['Binary devotion','Terminal collapse'],['Recursive axiom','Singular proof'],['Unending sentence','The unspeakable word'],['Funeral procession','One great ossuary']];
function weaponName(g,secondary=false){return !secondary&&S.gmod[g].f.metamorph?METAMORPHOSES[g][0]:ARMAMENTS[g][secondary?1-S.gmod[g].arm:S.gmod[g].arm||0].n;}
function weaponDescription(g,secondary=false){
 const transformed=!secondary&&S.gmod[g].f.metamorph,arm=secondary?1-S.gmod[g].arm:S.gmod[g].arm||0;
 let text=transformed?METAMORPHOSES[g][1]:ARMAMENTS[g][arm].t;
 if(g===7){const f=S.gmod[7].f;text+=' Current borrowed word: +'+Math.round(((f.wordPower??1.25)-1)*100)+'% global damage for '+(f.wordLife||3)+' seconds.';}
 return text+' Creatures of this god resist '+(Math.pow(.85,milestoneCount())*100).toFixed(2)+'% of its damage and effects. Each purity or transformation milestone in your build reduces that resistance by 15%, compounding. Condition-resistance stripping cannot remove this protection.';
}
function upgradeDescription(g,c,secondary=false){
 if(secondary||!S?.gmod[g].f.metamorph)return c.t;
 const notes={
  '2a':'Each extra projectile adds 25% swarm pulse damage.', '2migration':'The cloud lives 50% longer; its two extra broods add 50% pulse damage.',
  '2bite':'Swarm pulses also gain the extra infestation stack.', '2doctrineB':'Swarm pulses gain the same wounded-prey damage bonus.',
  '3a':'Also increases target acquisition and tether reach.', '3d':'Tethers heal 1.2 health per enemy per pulse, up from 0.6.', '3doctrineA':'Also doubles tether healing.', '3e':'Also multiplies blood-tether damage.',
  '4d':'Adds two eruptions and their fire patches.', '4doctrineA':'Eruption fire patches also gain the duration and radius bonuses.',
  '5mass':'Doubles the roaming core\'s pull strength.', '5corona':'Also adds a wider radiation ring around core pulses.', '5density':'Core pulses also apply two extra radiation stacks.',
  '6a':'Also expands the lattice.', '6origin':'Adds 45 units to the transformed lattice radius before area bonuses.', '6parallel':'Adds one vertex and edge to the transformed lattice.', '6doctrineA':'Adds one vertex and edge to the transformed lattice.',
  '7c':'Adds two active letters.', '7ink':'Letters also last six seconds longer.', '7margin':'Letters also pull nearby enemies.', '7doctrineA':'Letters touch enemies twice as often (every 0.15 seconds).', '7doctrineB':'Letter touches also apply four radiation stacks.', '7e':'Letters already strip resistance on every touch.', '7smudge':'Letter touches also apply four disease stacks.', '7sentence':'Letter touches heal for 2% of damage dealt, capped at 4 per letter pulse.'
 };
 return c.t+(notes[c.id]?' Transformed: '+notes[c.id]:'');
}
function hystericalRelease(voice){
 const r=120*S.stat.area*S.gmod[1].area*(S.gmod[1].f.screamArea||1),d=(12+Math.min(8,S.thresholds[1])*4)*S.gmod[1].dmg*(S.gmod[1].f.rapture?2:1);
 fx(voice.x,voice.y,r,GODS[1].col,.6);
 for(const e of S.enemies)if(e!==voice&&!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(voice.x,voice.y,e.x,e.y)<r*r){applyHysteria(e,3);hurt(e,d,GODS[1].col);}
}
function weaponOffer(g){return ARMAMENTS[g].map((w,i)=>({id:g+'weapon'+i,n:w.n,t:w.t,min:1,rarity:'Armament · choose one for this run',ap:m=>m.arm=i}));}
function initRevelations(){
 for(let g=0;g<9;g++){
  const add=(id,n,t,min,ap,extra={})=>CARDS[g].push({id:g+id,n,t,min,ap,...extra});
  const texts=[
   ['Infected corpses spread half their remaining disease, capped at 8 stacks per rupture wave. +30% rupture radius. Rupture kills do not trigger further ruptures.','Disease deals twice its damage, but consumes its stacks 40% faster.'],
   ['Enthrallment lasts 80% longer. Your stolen voices strike 25% farther.','Freed or slain thralls erupt in a hysterical scream that harms and disorients nearby enemies.'],
   ['Death broods release two extra locusts and chain one generation further. −15% weapon damage.','Your locusts and brood halo deal 70% more damage to enemies below 30% health.'],
   ['Bleeding lasts twice as long. Blood debt and Sanguine needle reap stronger healing.','Bleeding deals 75% more damage. Your weapon gains 20% damage but casts 15% slower.'],
   ['Your fire patches burn 50% longer and cover 35% more ground.','Burn deals 80% more damage, but consumes itself 25% faster.'],
   ['Radiation slows 50% more strongly. Your gravity well or solar orbit gains 30% area.','Gravity wells collapse almost immediately. +60% weapon damage, but cast 20% slower.'],
   ['Unfold mirrors a second, weaker ray. Recursive lattice gains another branching vertex.','Piercing rays lose no damage between bodies. Every contact unfolds twice as much resistance.'],
   ['Each seal survives its first detonation and may detonate once more.','Every sigil erases resistance and inflicts four stacks of radiation.'],
   ['Carrion rite raises twins. The procession gains another pallbearer. −15% weapon damage.','Bone detonations and pallbearers gain 65% damage and 20% area, but are raised 25% slower.']
  ];
  const applyA=[m=>m.f.septic=1,m=>{m.f.adore=1;CFG.whisperReach*=1.25;},m=>{CFG.infShots+=2;CFG.infGenCap++;m.dmg*=.85;},m=>{CFG.bleedLife*=2;m.f.heal=1;},m=>m.f.wildfire=1,m=>{CFG.radSlowPer*=1.5;m.area*=1.3;},m=>m.f.echo=1,m=>m.f.palimpsest=1,m=>{m.f.echo=1;m.dmg*=.85;}];
  const applyB=[m=>{CFG.disDps*=2;CFG.disDecay*=1.4;},m=>m.f.hysteria=1,m=>m.f.execute=1,m=>{CFG.bleedDps*=1.75;m.dmg*=1.2;m.cd*=1.15;},m=>{CFG.burnDps*=1.8;CFG.burnLife*=.75;},m=>{m.f.collapse=1;m.dmg*=1.6;m.cd*=1.2;},m=>m.f.proof=1,m=>{m.f.strip=1;m.f.silence=1;},m=>{m.dmg*=1.65;m.area*=1.2;m.cd*=1.25;}];
  add('doctrineA',DOCTRINES[g][0],texts[g][0],4,m=>{applyA[g](m);m.f.doctrine='A';},{branch:'doctrine',rarity:'Exclusive doctrine'});
  add('doctrineB',DOCTRINES[g][1],texts[g][1],4,m=>{applyB[g](m);m.f.doctrine='B';},{branch:'doctrine',rarity:'Exclusive doctrine'});
  addGodRevelations(g,add);
 }
}
function alternativeWeapons(D,A,C){
 for(let g=0;g<9;g++){
  const M=S.gmod[g],L=Math.min(8,S.thresholds[g]);if(!L||M.arm!==1||S.cd[g]>0||replacesWeapon(g)||(S.weaponPass!==undefined&&S.weaponPass!==g))continue;
  const dmg=(9+L*4)*D*M.dmg,area=A*M.area,extra=M.f.echo?1:0,stacks=M.f.virulent?2:1,col=GODS[g].col;
  const t=nearest(S.px,S.py,g===1?650*(M.f.inviteRange||1):650),angle=t?Math.atan2(t.y-S.py,t.x-S.px):Math.atan2(S.aim.y,S.aim.x);
  S.cd[g]=weaponInterval(g);
  if(g===0&&t){
   const targets=S.enemies.filter(e=>!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(S.px,S.py,e.x,e.y)<650**2)
     .sort((a,b)=>dist2(S.px,S.py,a.x,a.y)-dist2(S.px,S.py,b.x,b.y));
   for(let j=0;j<2+extra;j++){
    const target=targets[j%targets.length],distance=Math.hypot(target.x-S.px,target.y-S.py);
    S.shots.push({x:S.px,y:S.py,fromX:S.px,fromY:S.py,target,tx:target.x,ty:target.y,
     flight:0,duration:.4+distance/700,bend:(j-(1+extra)/2)*26,lift:35+distance*.12,
     vx:0,vy:0,r:6,life:2.2,dmg:dmg*.5,col,god:g,condition:'dis',stacks:3*stacks+(M.f.lesions||0),orchard:1,area});
   }
  }
  if(g===1){
   const voices=S.enemies.filter(e=>!e.dead&&e.turned&&dist2(S.px,S.py,e.x,e.y)<650**2);
   const centers=voices.length?voices.slice(0,2+extra):t?[t]:[];
   for(const v of centers){const r=95*area;fx(v.x,v.y,r,col,.5);
    for(const e of S.enemies)if(!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(v.x,v.y,e.x,e.y)<r*r){hurt(e,dmg*(1+Math.min(3,voices.length)*.25),col);applyHysteria(e,1.5);}
   }
   if(t)enthrall(t,(3+L*.3)*(M.f.adore?1.8:1));
  }
  if(g===2||g===5||g===8){
   const count=(g===5?2:g===8?3:4)+extra+M.count,orbit=(g===5?112:g===8?(M.f.tibia?100:80):94)*area;
   for(let j=0;j<count;j++){
    const a=S.t*(g===5?.8:1.4)+j*Math.PI*2/count,x=S.px+Math.cos(a)*orbit,y=S.py+Math.sin(a)*orbit,r=(g===5?58:38)*area*(g===8&&M.f.vigil?1.15:1);
    fx(x,y,r,col,.45);if(g===8){S.lastPallbearer=S.t;S.fx.push({bone:1,x,y,r:16,col,life:.6,max:.6});boneEcho(x,y,r,dmg*.48);if(transformed(8))launchBoneArcs(x,y,dmg*.48,r);}
    if(g===5){S.lastFlare={x,y,t:S.t};radiantRing(x,y,r,stacks+(M.f.radStacks||0));if(M.f.accretion||M.f.horizon)pullBodies(x,y,r*2, M.f.horizon?198:132,.25);}
    for(const e of S.enemies)if(!e.dead&&!protectedFromPlayer(e)&&dist2(x,y,e.x,e.y)<(r+e.r)**2){if(g===8)boneHit(e);hurt(e,dmg*(g===5?.8:.48)*(g===2&&M.f.execute&&e.hp<e.maxHp*.3?1.7:1),col);afflict(e,g===2?'inf':g===5?'rad':'dis',stacks*(g===8&&!M.f.carry?.5:1)+(g===5?M.f.radStacks||0:g===2?(M.f.infBite||0)+(M.f.piercing?3:0):0),g);}
   }
  }
  if(g===3){
   const len=410*area,width=18+extra*12;let healed=0;
   for(const e of S.enemies){if(e.dead||protectedFromPlayer(e))continue;const x=e.x-S.px,y=e.y-S.py,along=x*Math.cos(angle)+y*Math.sin(angle);
    if(along>0&&along<len&&Math.abs(-x*Math.sin(angle)+y*Math.cos(angle))<width+e.r){if(e.c.bleed>0)healed+=godEffectScale(e,3);hurt(e,bloodStrike(e,dmg),col);afflict(e,'bleed',3*stacks+(M.f.serration||0));}}
   healPlayer(healed*(M.f.heal?2:1));S.rays.push({x:S.px,y:S.py,dx:Math.cos(angle),dy:Math.sin(angle),len,life:.2,max:.2,col});
  }
  if(g===4&&t)for(let j=0;j<1+extra;j++)S.fields.push({x:t.x+j*48,y:t.y,r:74*area*(M.f.wildfire?1.35:1),life:M.f.wildfire?9:6,max:M.f.wildfire?9:6,tick:0,dmg:dmg*.3,col,condition:'burn',stacks,wildfire:1});
  if(g===6){
   const vertices=3+extra+(M.f.parallel?1:0),phase=S.t*.37,len=250*area,origin=54+(M.f.origin||0);
   S.fx.push({polygon:vertices,angle:phase,x:S.px,y:S.py,r:origin,col,life:.45,max:.45});
   for(let k=0;k<vertices;k++){const a=phase+k*Math.PI*2/vertices,x=S.px+Math.cos(a)*origin,y=S.py+Math.sin(a)*origin;
    castRay(x,y,a+Math.PI*.5,len,dmg*.55,false,1);
    if(L>=4){const vx=x+Math.cos(a+Math.PI*.5)*len*.618,vy=y+Math.sin(a+Math.PI*.5)*len*.618;castRay(vx,vy,a-Math.PI/3,len*.618,dmg*.34,L>=CFG.splitAtLevel,0);}
   }
  }
  if(g===7&&S.sigils.length<8+M.count)for(let j=0;j<2+extra;j++)S.sigils.push({x:S.px+Math.cos(angle)*j*64,y:S.py+Math.sin(angle)*j*64,r:62*area,life:10,dmg,spent:0,buffUsed:0,strip:M.f.strip?1:0});
 }
}
function advancePustule(s,dt){
 if(s.target&&!s.target.dead&&!s.target.turned&&!protectedFromPlayer(s.target)){s.tx=s.target.x;s.ty=s.target.y;}
 s.flight=Math.min(1,s.flight+dt/s.duration);
 s.x=s.fromX+(s.tx-s.fromX)*s.flight;s.y=s.fromY+(s.ty-s.fromY)*s.flight;
 if(s.flight<1)return;
 const r=32*s.area;fx(s.x,s.y,r,s.col,.35);
 for(const e of S.enemies)if(!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(s.x,s.y,e.x,e.y)<(r+e.r)**2){afflict(e,'dis',s.stacks);hurt(e,s.dmg,s.col);}
 S.fields.push({x:s.x,y:s.y,r:42*s.area,life:4,max:4,tick:0,dmg:s.dmg*.2,col:s.col,condition:'dis',stacks:1});s.life=0;
}
function cardMarkup(g,c,k){return `<button class="revelation offer" data-k="${k}" style="--god:${GODS[g].col}"><span class="card-serial">${c.rarity||'Blessing · rank '+c.min}</span><div class="card-art"><img src="assets/actors/god-${g}-portrait.png" alt=""></div><h3>${c.n}</h3><p>${upgradeDescription(g,c)}</p><span class="card-footer">${GODS[g].name}<b>Choose →</b></span></button>`;}


