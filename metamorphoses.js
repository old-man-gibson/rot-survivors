/* Exclusive metamorphoses have their own spatial and timing rules. */
const METAMORPHOSES=[
 ['The breathing plague','Become a far-reaching disease pulse. It expands to 320 units and contracts, striking each enemy once in each direction.'],
 ['The black waltz','Each cast enthralls a servant and creates a wandering lure that drags enemies into a hysterical, damaging dance. Invitation and servant upgrades still apply.'],
 ['A storm with a stomach','Your brood becomes a hunting swarm cloud, then returns to you. Each extra projectile adds 25% pulse damage. Flight duration, infestation, and wounded-prey bonuses carry over.'],
 ['The heart outside the body','Your blade becomes three blood tethers that drain enemies and heal on each pulse. Swing area increases tether reach; healing and schism bonuses carry over.'],
 ['The funeral march','Your weapon becomes five sequential eruptions that leave burning ground. Extra fire patches add eruptions; fire-patch size, duration, and tick upgrades carry over.'],
 ['A wandering singularity','Your star becomes a roaming gravity core that seeks enemies, draws them in, and irradiates them repeatedly.'],
 ['An impossible tessellation','Rays become a lattice whose edges repeatedly cut and unfold bodies. Extra-ray upgrades add vertices; ray reach, origin, piercing, and splitting upgrades carry over.'],
 ['The alphabet of unmaking','Sigils become six drifting letters that strip resistance and disintegrate weakened ordinary enemies. Touch each new letter once to gain borrowed word; seal upgrades carry over to letters.'],
 ['The bones remember flight','Your bone explosions scatter three arcing fragments. Each fragment explodes again when it lands. The second explosion cannot scatter more fragments.']
];
function transformed(g){return !!S.gmod[g].f.metamorph&&!S.secondaryPass;}
function replacesWeapon(g){return g!==8&&transformed(g);}
function metamorphInterval(g){return [2.4,3,2.8,2.1,2.7,4,3.4,4,2][g]*S.stat.cdr*S.gmod[g].cd;}
function metamorphs(){return S.metamorphs||(S.metamorphs=[]);}
function metamorphDamage(g){
 const M=S.gmod[g],L=Math.min(8,S.thresholds[g]);
 return (12+L*4)*S.stat.dmg*wordMultiplier()*M.dmg*(g===2?1+M.count/4:1)*(g===3&&M.f.schism?1+schism().S*.6:1);
}
function fireMetamorphoses(){
 const forms=metamorphs();
 for(let g=0;g<8;g++){
  if(!S.thresholds[g]||!replacesWeapon(g)||S.cd[g]>0||(S.weaponPass!==undefined&&S.weaponPass!==g))continue;
  S.cd[g]=metamorphInterval(g);const M=S.gmod[g],L=Math.min(8,S.thresholds[g]),dmg=metamorphDamage(g),area=S.stat.area*M.area;
  const range=700*(g===1?M.f.inviteRange||1:g===3||g===6?area:1);
  const targets=S.enemies.filter(e=>!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(S.px,S.py,e.x,e.y)<range**2).sort((a,b)=>dist2(S.px,S.py,a.x,a.y)-dist2(S.px,S.py,b.x,b.y));
  const t=targets[0],angle=t?Math.atan2(t.y-S.py,t.x-S.px):Math.atan2(S.aim.y,S.aim.x);
  const base={g,x:S.px,y:S.py,t:0,tick:0,dmg,area,col:GODS[g].col,life:2};
  if(g===0)forms.push({...base,life:1.8,hits:[new Set(),new Set()],r:0});
  if(g===1&&t){enthrall(t,(5.5+L*.4)*(M.f.adore?1.8:1));forms.push({...base,x:t.x,y:t.y,life:3.5,angle:0});}
  if(g===2&&t){const duration=2.4*(M.f.longFlight?1.5:1);forms.push({...base,life:duration,duration,target:t});}
  if(g===3&&t)forms.push({...base,life:1.6,targets:targets.slice(0,3)});
  if(g===4)for(let k=0;k<5+M.count;k++)forms.push({...base,x:S.px+Math.cos(angle)*(55+k*55),y:S.py+Math.sin(angle)*(55+k*55),life:1.5+k*.18,delay:k*.18,burst:false});
  if(g===5&&t)forms.push({...base,life:4.5,target:t});
  if(g===6){const count=3+(M.f.echo?1:0)+(M.f.parallel?1:0),radius=(170+(M.f.origin||0))*area,center=t?{x:t.x-Math.cos(angle)*radius,y:t.y-Math.sin(angle)*radius}:{x:S.px,y:S.py};const points=Array.from({length:count},(_,k)=>({x:center.x+Math.cos(angle+k*Math.PI*2/count)*radius,y:center.y+Math.sin(angle+k*Math.PI*2/count)*radius}));forms.push({...base,life:3.2,points});}
  if(g===7){const count=6+M.count,active=forms.filter(f=>f.g===7&&f.life>0).length;for(let k=0;k<count-active;k++)forms.push({...base,x:S.px+Math.cos(k*Math.PI*2/count)*75,y:S.py+Math.sin(k*Math.PI*2/count)*75,life:5+(M.f.sigilLife||0),angle:k*Math.PI*2/count,buffUsed:0,glyph:['א','Ϟ','∴','Ψ','∅','Ϙ'][k%6]});}
 }
}
function formEnemies(form,r,fn){for(const e of S.enemies)if(!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(form.x,form.y,e.x,e.y)<(r+e.r)**2)fn(e);}
function updateMetamorphoses(dt){
 const forms=metamorphs();
 for(const f of forms){
  if(f.life<=0)continue;f.t+=dt;f.life-=dt;f.tick-=dt;const M=S.gmod[f.g];
  if(f.g===0){const phase=f.t<.9?0:1;f.r=(phase===0?f.t/.9:Math.max(0,(1.8-f.t)/.9))*320*f.area;
   for(const e of S.enemies){if(e.dead||e.turned||protectedFromPlayer(e)||f.hits[phase].has(e))continue;const d=Math.hypot(e.x-f.x,e.y-f.y);if(Math.abs(d-f.r)<22+e.r){f.hits[phase].add(e);afflict(e,'dis',3+(M.f.lesions||0));hurt(e,f.dmg*.75,f.col);}}
  }
  if(f.g===1){f.angle+=dt;f.x+=Math.cos(f.angle)*20*dt;f.y+=Math.sin(f.angle)*20*dt;pullBodies(f.x,f.y,160*f.area,90,dt,1);if(f.tick<=0){f.tick=.5;formEnemies(f,75*f.area,e=>{applyHysteria(e,2);hurt(e,f.dmg*.35,f.col);});}}
  if(f.g===2||f.g===5){
   const t=f.g===2&&f.t>(f.duration||2.4)/2?{x:S.px,y:S.py}:f.target&&!f.target.dead&&!f.target.turned?f.target:nearest(f.x,f.y,700);
   if(t){const a=Math.atan2(t.y-f.y,t.x-f.x),speed=f.g===2?230:95;f.x+=Math.cos(a)*Math.min(speed*dt,Math.hypot(t.x-f.x,t.y-f.y));f.y+=Math.sin(a)*Math.min(speed*dt,Math.hypot(t.x-f.x,t.y-f.y));}
   if(f.g===5){pullBodies(f.x,f.y,180*f.area,140*(M.f.horizon?3:M.f.accretion?2:1),dt);S.lastFlare={x:f.x,y:f.y,t:S.t};}
   if(f.tick<=0){f.tick=.3;const stacks=2+(f.g===2?(M.f.infBite||0)+(M.f.piercing?3:0):M.f.radStacks||0);
    if(f.g===5)radiantRing(f.x,f.y,60*f.area,stacks);
    formEnemies(f,60*f.area,e=>{afflict(e,f.g===2?'inf':'rad',stacks);const execute=f.g===2&&M.f.execute&&e.hp<e.maxHp*.3;const kb=e.kb;if(f.g===2)e.kb=2;hurt(e,f.dmg*.22*(execute?1.7:1),f.col);e.kb=kb;});
   }
  }
  if(f.g===3&&f.tick<=0){f.tick=.4;for(const e of f.targets)if(!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(S.px,S.py,e.x,e.y)<(800*f.area)**2){afflict(e,'bleed',2+(M.f.serration||0));hurt(e,bloodStrike(e,f.dmg*.3),f.col);healPlayer((M.f.heal?1.2:.6)*godEffectScale(e,3));}}
  if(f.g===4&&f.t>=f.delay&&!f.burst){f.burst=true;fx(f.x,f.y,65*f.area,f.col,.5);formEnemies(f,65*f.area,e=>{afflict(e,'burn',4+(M.f.brand||0));hurt(e,f.dmg*.55,f.col);});const life=M.f.wildfire?4.5:3;if(S.fields.length<160)S.fields.push({x:f.x,y:f.y,r:42*f.area*(M.f.wildfire?1.35:1),life,max:life,tick:0,dmg:f.dmg*.1,col:f.col});}
  if(f.g===6&&f.t>.6&&f.tick<=0){f.tick=.6;for(let k=0;k<f.points.length;k++){const a=f.points[k],b=f.points[(k+1)%f.points.length];castRay(a.x,a.y,Math.atan2(b.y-a.y,b.x-a.x),Math.hypot(b.x-a.x,b.y-a.y),f.dmg*.6,Math.min(8,S.thresholds[6])>=CFG.splitAtLevel,0);}}
  if(f.g===7){
   f.angle+=Math.sin(f.t*2+f.x*.01)*dt*2;const home=Math.hypot(f.x-S.px,f.y-S.py);if(home>230*f.area)f.angle=Math.atan2(S.py-f.y,S.px-f.x);f.x+=Math.cos(f.angle)*85*dt;f.y+=Math.sin(f.angle)*85*dt;
   const r=25*f.area;if(M.f.sigilPull)pullBodies(f.x,f.y,r*2,65,dt,7);
   if(!f.buffUsed&&dist2(S.px,S.py,f.x,f.y)<r*r)consumeWord(f);
   if(f.tick<=0){f.tick=M.f.palimpsest?.15:.3;let siphon=0;formEnemies(f,r,e=>{stripResistance(e,7);if(M.f.silence)afflict(e,'rad',4,7);if(M.f.sigilDisease)afflict(e,'dis',4,7);const d=!e.seat&&!e.boss&&e.hp<e.maxHp*.12?e.hp:f.dmg*.28,before=e.hp;hurt(e,d,f.col);siphon+=Math.max(0,before-Math.max(0,e.hp))*.02;});if(M.f.sigilLeech)healPlayer(Math.min(4,siphon));}
  }
 }
 S.metamorphs=forms.filter(f=>f.life>0);
}
function launchBoneArcs(x,y,dmg,r){
 const targets=S.enemies.filter(e=>!e.dead&&!e.turned&&!protectedFromPlayer(e)&&dist2(x,y,e.x,e.y)<400**2).sort((a,b)=>dist2(x,y,a.x,a.y)-dist2(x,y,b.x,b.y));
 for(let k=0;k<3;k++){const a=k*Math.PI*2/3,target=targets[k%targets.length],tx=target?target.x:x+Math.cos(a)*110,ty=target?target.y:y+Math.sin(a)*110;
  S.shots.push({boneShard:1,x,y,fromX:x,fromY:y,tx,ty,target,flight:0,duration:.65,lift:65,bend:(k-1)*24,r:5,blastR:r*.65,dmg:dmg*.35,life:1,col:GODS[8].col});}
}
function advanceBoneArc(s,dt){if(s.target&&!s.target.dead&&!s.target.turned&&!protectedFromPlayer(s.target)){s.tx=s.target.x;s.ty=s.target.y;}s.flight=Math.min(1,s.flight+dt/s.duration);s.x=s.fromX+(s.tx-s.fromX)*s.flight;s.y=s.fromY+(s.ty-s.fromY)*s.flight;if(s.flight<1)return;s.life=0;fx(s.x,s.y,s.blastR,s.col,.4);for(const e of S.enemies)if(!e.dead&&!protectedFromPlayer(e)&&dist2(e.x,e.y,s.x,s.y)<(s.blastR+e.r)**2){boneHit(e);if(S.gmod[8].f.carry)afflict(e,'dis',4,8);hurt(e,s.dmg,s.col);}}
function drawMetamorphoses(ctx){
 for(const f of metamorphs()){ctx.save();ctx.strokeStyle=f.col+'bb';ctx.fillStyle=f.col+'25';ctx.lineWidth=2;
  if(f.g===0){ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.stroke();ctx.lineWidth=12;ctx.strokeStyle=f.col+'38';ctx.stroke();}
  else if(f.g===3){for(const e of f.targets)if(!e.dead){ctx.beginPath();ctx.moveTo(S.px,S.py);ctx.quadraticCurveTo((S.px+e.x)/2,S.py+30*Math.sin(S.t*6),e.x,e.y);ctx.stroke();}}
  else if(f.g===6){ctx.globalAlpha=f.t<.6?.4:1;ctx.beginPath();f.points.forEach((p,k)=>k?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();}
  else if(f.g===7){ctx.font='bold 28px Georgia';ctx.textAlign='center';ctx.fillStyle=f.col;ctx.fillText(f.glyph,f.x,f.y);ctx.strokeStyle=f.col+(f.buffUsed?'55':'cc');ctx.beginPath();ctx.arc(f.x,f.y,25*f.area,0,Math.PI*2);ctx.stroke();}
  else if(f.g===4){if(!f.burst){ctx.beginPath();ctx.moveTo(f.x-25,f.y);ctx.lineTo(f.x,f.y-15);ctx.lineTo(f.x+25,f.y);ctx.stroke();}}
  else{const r=(f.g===1?75:60)*f.area;ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();for(let k=0;k<8;k++){const a=k*Math.PI/4+f.t*2;ctx.fillStyle=f.col;ctx.fillRect(f.x+Math.cos(a)*r*.7-2,f.y+Math.sin(a)*r*.7-2,4,4);}}
  ctx.restore();
 }
}


