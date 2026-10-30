/* Values shown here are also used to schedule weapon casts. */
const ALT_INTERVALS=[1.7,2.4,.7,1.25,2.8,1,1.9,1.8,.85];
function weaponInterval(g,arm=S.gmod[g].arm,secondary=false){if(S.gmod[g].f.metamorph&&g<8&&!secondary&&!S.secondaryPass)return metamorphInterval(g);const L=Math.min(8,S.thresholds[g]),M=S.gmod[g];const base=arm===1?ALT_INTERVALS[g]:[.45,Math.max(1.6,4.6-.34*L),Math.max(.34,1.15-.07*L),.9,1.6,Math.max(1.1,2.7-.16*L),Math.max(.55,1.5-.09*L),Math.max(.9,2.3-.15*L),Math.max(1,3-.2*L)][g];return base*S.stat.cdr*M.cd;}
function weaponSnapshot(g,secondary=false){
 const M=S.gmod[g],L=Math.min(8,S.thresholds[g]),scale=S.stat.dmg*wordMultiplier()*M.dmg,area=S.stat.area*M.area,alt=(secondary?1-M.arm:M.arm)===1;
 const base=alt?(9+L*4)*[.5,1,.48,1,.3,.8,.55,1,.48][g]:[3+1.6*L,0,(6+2.3*L)*CFG.locustDmgScale,(11+4.4*L)*(M.f.schism?1+schism().S*.6:1),14+5.2*L,30+11*L,18+6.2*L,23+8.5*L,(26+9.5*L)*CFG.minionDmgScale*(L>=PASSIVE_AT?1.25:1)][g];
 const metamorph=!!M.f.metamorph&&!secondary;
 const label=metamorph&&g<8?['Per outward / inward hit','Per dance pulse','Per swarm pulse','Per blood-tether pulse','Per eruption','Per core pulse','Per lattice edge pulse','Per letter touch'][g]:alt?['Per pod impact','Per voice, before chorus bonus','Per brood bite','Per pierced body','Per fire tick','Per solar flare','Per parent ray','Per seal blast','Per pallbearer strike'][g]:['Per aura pulse','Enthrallment','Per locust','Per blade strike','Per blade strike','Per impact','First body hit','Per seal blast','Per seeker blast'][g];
 const damage=metamorph&&g<8?metamorphDamage(g)*[.75,.35,.22,.3,.55,.22,.6,.28][g]*(g===3&&M.f.reckoning?1+(1-S.hp/S.maxHp)*.6:1):g===1&&!alt?null:base*scale*(g===3&&M.f.reckoning?1+(1-S.hp/S.maxHp)*.6:1);
 return {g,name:weaponName(g,secondary),secondary,transformed:!!M.f.metamorph&&!secondary,rank:S.thresholds[g],damage,label,interval:weaponInterval(g,secondary?1-M.arm:M.arm,secondary),damageScale:scale,area,chosen:CARDS[g].filter(c=>S.taken[c.id]&&!(secondary&&c.id===g+'apex1'))};
}
function playerSnapshot(){return {hp:S.hp,maxHp:S.maxHp,speed:playerSpeed(),damage:S.stat.dmg*wordMultiplier(),reduction:damageReduction(),regen:S.stat.regen*(1-(S.gmod[4].f.healPenalty||0)),iframe:S.stat.iframe,pickup:CFG.pickupBase*S.stat.pickup,cdr:S.stat.cdr,recentDps:recentDps(),totalDamage:S.combat?.total||0,weapons:S.thresholds.flatMap((n,g)=>n?[weaponSnapshot(g),...(S.dualPatron&&g===(S.heretic?6:S.patron)?[weaponSnapshot(g,true)]:[])]:[])};}
function initPlayerStats(){
 const bar=document.createElement('div');bar.id='playerReadout';document.getElementById('hpbar').after(bar);
 const toggle=document.createElement('button');toggle.id='playerStatsButton';toggle.className='stats-link';toggle.textContent='Your build · C';toggle.onclick=()=>togglePlayerStats();bar.after(toggle);
 const first=document.getElementById('hWorld').parentElement,last=document.getElementById('hJourney').parentElement,details=document.createElement('details');details.id='worldReadout';details.innerHTML='<summary>World & coalition</summary>';first.before(details);
 let node=first;while(node){const next=node.nextElementSibling;details.append(node);if(node===last)break;node=next;}
 const screen=document.createElement('section');screen.id='playerStats';screen.className='screen';screen.innerHTML='<div class="card player-sheet"><button id="closePlayerStats" class="close">Return · C</button><p class="eyebrow">The priest, not the pantheon</p><h1>Your current build</h1><div id="playerStatsBody"></div></div>';document.body.append(screen);
 document.getElementById('closePlayerStats').onclick=()=>togglePlayerStats();
 const altarButton=document.createElement('button');altarButton.className='stats-link';altarButton.id='altarStatsButton';altarButton.textContent='Inspect your stats & acquired upgrades';altarButton.onclick=()=>togglePlayerStats();document.querySelector('#altar h1').after(altarButton);
 addEventListener('keydown',e=>{if(e.code==='KeyC'&&!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();togglePlayerStats();}});
}
let playerStatsFocus=null;
function togglePlayerStats(){
 if(!S||!['play','altar','stats','info'].includes(S.mode))return;
 const screen=document.getElementById('playerStats');
 if(S.mode==='stats'){screen.classList.remove('on');S.mode=S.statsReturn||'play';updatePlayerReadout();if(playerStatsFocus?.isConnected)playerStatsFocus.focus();return;}
 playerStatsFocus=document.activeElement;S.statsReturn=S.mode;S.mode='stats';stickDrop();for(const k in keys)keys[k]=0;screen.classList.add('on');renderPlayerStats();document.getElementById('closePlayerStats').focus();
}
function updatePlayerReadout(){
 const host=document.getElementById('playerReadout');if(!host||!S)return;
 host.innerHTML=`<div><b>${Math.ceil(Math.max(0,S.hp))} / ${Math.round(S.maxHp)}</b> health <span>DMG <b>×${(S.stat.dmg*wordMultiplier()).toFixed(2)}</b></span></div><div>Move <b>${Math.round(playerSpeed())}</b> <small>units/s</small><span>Recent DPS <b>${recentDps().toFixed(1)}</b></span></div>`;
}
function renderPlayerStats(){
 if(!S)return;const p=playerSnapshot(),body=document.getElementById('playerStatsBody');if(!body)return;
 const tile=(name,value,note='')=>`<article><small>${name}</small><strong>${value}</strong><span>${note}</span></article>`;
 body.innerHTML=`<p class="sub">Time is paused. Damage per hit includes global, weapon, and active borrowed-word multipliers. Target-dependent bonuses, condition ticks, secondary hits, and armor interactions are listed with your upgrades below.</p><div class="player-stat-grid">${tile('Health',Math.ceil(Math.max(0,p.hp))+' / '+Math.round(p.maxHp))}${tile('Movement',p.speed.toFixed(0)+' units/s',((p.speed/CFG.playerSpeed-1)*100).toFixed(0)+'% versus base')}${tile('Global damage','×'+p.damage.toFixed(2),S.wordT>0?'Borrowed word active: '+S.wordT.toFixed(1)+'s remaining':'Weapon modifiers appear below')}${tile('Current damage reduction',(p.reduction*100).toFixed(0)+'%','Enemy-specific reductions are additional')}${tile('Regeneration',p.regen.toFixed(2)+' HP/s','Passive regeneration after healing penalties')}${tile('Hit protection',p.iframe.toFixed(2)+'s','Invulnerability after taking a hit')}${tile('Pickup radius',p.pickup.toFixed(0)+' units')}${tile('Global cast speed','×'+(1/p.cdr).toFixed(2),'Weapon intervals below include their modifiers')}${tile('Recent actual DPS',p.recentDps.toFixed(1),'Damage dealt over the last 10 seconds; minimum 1s window')}${tile('Damage dealt',Math.round(p.totalDamage).toLocaleString(),'This run; excludes overkill and faction damage')}</div><h2 class="library-subtitle">Your armaments</h2><div class="weapon-stat-list">${p.weapons.map(w=>`<article style="--god:${GODS[w.g].col}"><header><img src="assets/actors/god-${w.g}-portrait.png" alt=""><div><h2>${w.name}</h2><p>${GODS[w.g].name} · rank ${w.rank} / 16${w.secondary?' · patron companion (free slot)':''}</p></div></header><p class="sub">${weaponDescription(w.g,w.secondary)}</p><div class="weapon-numbers"><span>${w.label}<b>${w.damage===null?'Control effect':w.damage.toFixed(1)}</b></span><span>Cast interval<b>${w.interval.toFixed(2)}s</b></span><span>Effect size multiplier<b>×${w.area.toFixed(2)}</b></span></div><details class="owned-upgrades" open><summary>Acquired revelations · ${w.chosen.length}</summary>${w.chosen.length?w.chosen.map(c=>`<div><b>${c.n}</b><p>${upgradeDescription(w.g,c,w.secondary)}</p></div>`).join(''):'<p>No revelations chosen yet.</p>'}</details></article>`).join('')}</div>`;
}
/* Combat stays clear; inspection is an explicit pause. */
let infoFocus=null;
function initCompactHud(){
 const shell=document.createElement('div');shell.id='infoOverlay';shell.inert=true;
 shell.innerHTML='<button id="infoBackdrop" aria-label="Close run information"></button><section id="infoDrawer" role="dialog" aria-modal="true" aria-labelledby="infoTitle"><header><div><small>GAME PAUSED</small><h2 id="infoTitle">Run information</h2></div><button id="closeInfo" aria-label="Close run information">×</button></header></section>';
 document.body.append(shell);document.getElementById('infoDrawer').append(document.getElementById('hud'));
 document.getElementById('worldReadout').open=true;
 const button=document.createElement('button');button.id='infoBtn';button.type='button';button.textContent='ⓘ';button.title='Run information · I';button.setAttribute('aria-label','Run information (pauses game)');button.setAttribute('aria-controls','infoDrawer');button.setAttribute('aria-expanded','false');document.body.append(button);
 const health=document.createElement('div');health.id='combatHealth';health.innerHTML='<span id="combatHealthText"></span><div><i id="combatHealthFill"></i></div>';document.body.append(health);
 button.onclick=toggleRunInfo;document.getElementById('closeInfo').onclick=toggleRunInfo;document.getElementById('infoBackdrop').onclick=toggleRunInfo;
 document.getElementById('gods').addEventListener('click',e=>{
  const button=e.target.closest('[data-weapon]');if(!button||S?.mode!=='play')return;
  togglePlayerStats();
  const articles=document.querySelectorAll('.weapon-stat-list>article');const article=articles[Number(button.dataset.weapon)];
  if(article){article.tabIndex=-1;article.focus();article.scrollIntoView({block:'start'});}
 });
 addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  if(e.code==='KeyI'&&!e.repeat){e.preventDefault();toggleRunInfo();}
  if(e.code==='Escape'&&S?.mode==='info'){e.preventDefault();toggleRunInfo();}
  else if(e.code==='Escape'&&S?.mode==='stats'){e.preventDefault();togglePlayerStats();}
  if(e.code==='Tab'&&S?.mode==='info'){
   const focusable=[...document.querySelectorAll('#infoDrawer button,#infoDrawer summary')];const first=focusable[0],last=focusable.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
}
function toggleRunInfo(){
 if(!S||!['play','info'].includes(S.mode))return;
 const open=S.mode==='play',shell=document.getElementById('infoOverlay');
 if(open){infoFocus=document.activeElement;stickDrop();for(const k in keys)keys[k]=0;S.mode='info';updateHud();}
 else S.mode='play';
 shell.inert=!open;shell.classList.toggle('on',open);document.getElementById('infoBtn').setAttribute('aria-expanded',String(open));
 if(open)document.getElementById('closeInfo').focus();else (infoFocus?.isConnected?infoFocus:document.getElementById('infoBtn')).focus();
}
function updateCompactHud(){
 const health=document.getElementById('combatHealthFill');if(!health)return;
 health.style.width=Math.max(0,Math.min(100,S.hp/S.maxHp*100))+'%';
 document.getElementById('combatHealthText').textContent=Math.ceil(Math.max(0,S.hp))+' / '+Math.round(S.maxHp);
 const host=document.getElementById('gods');
 // Rebuild only when the loadout changes, so a pressed icon keeps its DOM identity.
 const signature=S.thresholds.map((n,g)=>n+':'+weaponName(g)).join('|')+'|'+S.dualPatron;
 if(host.dataset.loadout===signature)return;host.dataset.loadout=signature;
 host.replaceChildren();let index=0;
 for(let g=0;g<9;g++)if(S.thresholds[g]){
  const count=S.dualPatron&&g===(S.heretic?6:S.patron)?2:1;
  for(let arm=0;arm<count;arm++){
   const name=weaponName(g,!!arm),button=document.createElement('button');button.className='weapon-icon';button.dataset.weapon=index++;button.style.setProperty('--god',GODS[g].col);
   button.title=name+' · level '+S.thresholds[g];button.setAttribute('aria-label',button.title+' — inspect weapon (pauses game)');
   button.innerHTML='<img src="assets/actors/god-'+g+'-portrait.png" alt=""><span class="weapon-level">'+S.thresholds[g]+'</span>'+(arm?'<small>II</small>':'');host.append(button);
  }
 }
}


