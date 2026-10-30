/* Run rules. Actual blood is tracked separately from spendable bonus currency. */
const WORLD_TYPES=[
  {name:'The Withering March',biomes:[0,3],description:'Grassland and deadwood'},
  {name:'The Frozen Crown',biomes:[2,5],description:'Snowy highlands and rocky uplands'},
  {name:'The Cinder Expanse',biomes:[1,4],description:'Dunes and volcanic wastes'}
];
function campaignProgress(){
  try{const p=JSON.parse(localStorage.getItem('rot-campaign-v1')||'{}');return {cleared:Array.from({length:9},(_,i)=>p.cleared?.[i]===true),level:Math.max(1,Math.min(20,Math.floor(Number(p.level)||1)))};}
  catch{return {cleared:Array(9).fill(false),level:1};}
}
function saveCampaign(p){try{localStorage.setItem('rot-campaign-v1',JSON.stringify(p));return true;}catch{return false;}}
function coalitionGroups(p){return [0,1,2].map(k=>[0,1,2].map(j=>(p+8+k*3+j)%9));}
function alliedGod(g){return !S.heretic&&!S.extermination&&S.groups[0].includes(g)&&!S.betrayed[g];}
// Automatic weapons never count as intent. Three separate challenges at a seat do.
function challengeAlly(){
  if(!S||S.mode!=='play'||S.heretic||S.extermination)return;
  const b=S.bases.find(b=>!b.broken&&alliedGod(b.g)&&dist2(S.px,S.py,b.x,b.y)<180**2);
  if(!b)return;
  const a=S.allyAttacks[b.g];if(S.t-a.last<.75)return;
  a.count=S.t-a.last>12?1:a.count+1;a.last=S.t;
  if(a.count<3){toast(GODS[b.g].name+' warns you: direct challenge '+a.count+'/3. Leave the seat to keep the alliance.');return;}
  S.betrayed[b.g]=true;S.spike[b.g]=CFG.seatSpike;
  for(const e of S.enemies)if(!e.dead&&e.god===b.g&&!e.seat){e.role='hunt';e.tt=1;e.tgtT=0;}
  hurt(b.ent,30,GODS[b.g].col);toast(GODS[b.g].name+' renounces your alliance after your third direct challenge.');
}
function protectedFromPlayer(e){return alliedGod(e.god)||(!S.heretic&&S.extermination&&!S.forsaken&&e.god===S.patron);}
function bloodControl(){
  const held=S.bases.map((b,g)=>b.broken?0:b.B+S.offered[g]);
  for(const e of S.enemies)if(!e.dead)held[e.god]+=e.abs+(e.bank||0);
  if(!S.heretic)held[S.patron]+=S.rawBank;
  return S.groups.map((gs,k)=>gs.reduce((sum,g)=>sum+(k===0&&S.betrayed[g]?0:held[g]),0)/Math.max(1,S.world0));
}
function chooseWorld(patron,heretic=false){
  document.getElementById('patronPick').style.display='none';
  document.getElementById('randomPatron').style.display='none';
  let panel=document.getElementById('worldChoice');
  if(!panel){panel=document.createElement('div');panel.id='worldChoice';document.getElementById('patronPick').after(panel);}
  panel.replaceChildren();
  const title=document.createElement('h2');title.textContent=(heretic?'The Heretic':GODS[patron].name)+' — choose a world';panel.append(title);
  const allies=document.createElement('p');allies.className='sub';allies.textContent=heretic?'A stolen void weapon. No patron or allies.': 'Your allied gods: '+coalitionGroups(patron)[0].filter(g=>g!==patron).map(g=>GODS[g].name).join(' and ')+'.';panel.append(allies);
  const weapons=document.createElement('div');weapons.className='weapon-choices';
  weapons.innerHTML=ARMAMENTS[heretic?6:patron].map((w,i)=>'<label><input type="radio" name="startingWeapon" value="'+i+'" '+(i===0?'checked':'')+'>'+w.n+'<small>'+w.t+'</small></label>').join('');panel.append(weapons);
  const gift=document.createElement('div');gift.className='weapon-choices patron-gift';
  gift.innerHTML='<label><input type="radio" name="patronGift" value="blessing" checked>One weapon + free revelation<small>Choose a free opening upgrade. Your selected weapon is your main armament.</small></label><label><input type="radio" name="patronGift" value="dual">Both patron weapons<small>Both fire independently and share this god’s upgrades. The companion costs no pledge slot and retains its original form if the main weapon transforms.</small></label>';panel.append(gift);
  const level=document.createElement('select');level.id='worldLevel';
  for(let n=1;n<=campaignProgress().level;n++){const o=document.createElement('option');o.value=n;o.textContent='World level '+n+' · enemy power ×'+(1+(n-1)*.25).toFixed(2);level.append(o);}
  level.value=campaignProgress().level;panel.append(level);
  const route=document.createElement('input');route.type='checkbox';route.id='exterminationRoute';route.checked=heretic;route.disabled=heretic;
  const label=document.createElement('label');label.append(route,document.createTextNode(' Extermination: destroy eight rival camps, then survive your patron’s betrayal and destroy its camp. No domination victory.'));panel.append(document.createElement('br'),label);
  WORLD_TYPES.forEach((w,i)=>{const b=document.createElement('button');b.className='gbtn';b.textContent=w.name+' — '+w.description;b.onclick=()=>newGame(patron,i,+level.value,heretic,route.checked,+weapons.querySelector('input:checked').value,gift.querySelector('input:checked').value);panel.append(b);});
  const back=document.createElement('button');back.textContent='Back to patrons';back.onclick=()=>{panel.remove();document.getElementById('patronPick').style.display='';document.getElementById('randomPatron').style.display='';};panel.append(back);
}
function finishCampaign(extermination=false){
  if(S.mode==='dead'||S.mode==='victory')return;
  const progress=campaignProgress();if(extermination&&!S.heretic)progress.cleared[S.patron]=true;
  progress.level=Math.min(20,Math.max(progress.level,S.worldLevel+1));const saved=saveCampaign(progress);
  S.mode='victory';stickDrop();document.getElementById('altar').classList.remove('on');
  document.querySelector('#dead h1').textContent=extermination?'No gods remain':'Your coalition claims this world';
  document.getElementById('deadTxt').textContent=(extermination?'All nine bases destroyed.':'Three desperation waves defeated.')+' Survived '+fmt(S.t)+'. '+(extermination?'Extermination rites: '+progress.cleared.filter(Boolean).length+'/9. ':'')+(progress.cleared.every(Boolean)?'The patronless Heretic is unlocked. ':'')+'World level '+progress.level+' available.'+(saved?'':' Progress could not be saved in this browser.');
  document.getElementById('dead').classList.add('on');
}
function startDesperationWave(){
  const f=S.finale;f.wave++;f.pause=0;f.elapsed=0;f.rally=false;
  const groups=f.wave===3?[1,2]:[f.order[f.wave-1]];f.gods=groups.flatMap(k=>S.groups[k]);
  f.queue=[];f.spawnClock=0;
  for(const g of f.gods)if(!S.bases[g].broken)for(let n=0;n<(f.wave===3?16:18)+S.worldLevel*2;n++)f.queue.push(g);
  // Existing armies join their own coalition's wave, never the opposing wave.
  for(const e of S.enemies)if(!e.dead&&!e.seat&&f.gods.includes(e.god)){e.desperate=f.wave;e.role='hunt';e.tgtT=0;}
  // Reserve room for the assault without deleting blood or rewarding retirements.
  let count=S.enemies.filter(e=>!e.dead).length;
  for(const e of S.enemies)if(count>CFG.maxEnemies-96&&!e.dead&&!e.seat&&!e.desperate){
    const amount=e.abs+(e.bank||0),home=S.bases[e.god];
    if(home.broken)S.departed+=amount;else home.B+=amount;
    e.abs=0;e.bank=0;e.dead=true;count--;
  }
  toast('Desperation '+f.wave+'/3 — '+(f.wave===3?'both rival coalitions rush your forces!':f.gods.map(g=>GODS[g].name).join(', ')));
}
function campaignTick(dt){
  if(S.hp<=0||S.mode!=='play')return;
  if(S.extermination){if(S.bases.every(b=>b.broken))finishCampaign(true);return;}
  if(!S.finale&&bloodControl()[0]>=.45){
    S.finale={wave:0,order:Math.random()<.5?[1,2]:[2,1],queue:[],pause:0};S.hostQueue.fill(0);startDesperationWave();
  }
  const f=S.finale;if(!f)return;
  if(f.pause>0){f.pause-=dt;if(f.pause<=0)startDesperationWave();return;}
  f.elapsed+=dt;f.queue=f.queue.filter(g=>!S.bases[g].broken);f.spawnClock+=dt;
  while(f.queue.length&&f.spawnClock>=.12&&S.enemies.filter(e=>!e.dead).length<CFG.maxEnemies){
    f.spawnClock-=.12;const g=f.queue.shift(),e=birth(g,'hunt',S.t/60,true);e.desperate=f.wave;e.host=true;e.spd*=CFG.hostSpeed;
    // Reinforcements enter around the active battle, rather than walking across the entire map.
    const a=Math.random()*Math.PI*2,r=Math.max(950,Math.hypot(W,H)/2+180);
    const p=WorldNavigation.nearest(S.terrain,S.px+Math.cos(a)*r,S.py+Math.sin(a)*r,Math.min(e.r,24));e.x=p.x;e.y=p.y;
  }
  f.spawnClock=Math.min(f.spawnClock,1);
  if(!f.queue.length&&!f.rally&&S.enemies.filter(e=>!e.dead&&e.desperate===f.wave).length<=12){
    f.rally=true;for(const e of S.enemies)if(e.desperate===f.wave)e.tgtT=0;
    toast('The remaining attackers converge on you. Follow the hunt marker.');
  }
  if(f.wave===3)for(const a of S.groups[1])for(const b of S.groups[2])if(ringDist(a,b)>=3){S.war[a][b]=S.war[b][a]=true;S.bases[a].warAny=S.bases[b].warAny=true;}
  if(!f.queue.length&&!S.enemies.some(e=>!e.dead&&e.desperate===f.wave)){
    if(f.wave===3)finishCampaign();else{f.pause=12;toast('Wave repelled. The next coalition advances in 12 seconds.');}
  }
}
function assaultTarget(e){
  if(!e.desperate)return false;
  if(S.finale?.rally){e.tt=1;return true;}
  // Immediate threats pursue the player; distant troops besiege the patron first.
  if(dist2(e.x,e.y,S.px,S.py)<1200**2){e.tt=1;return true;}
  let b=S.bases[S.patron];
  if(b.broken)b=S.groups[0].map(g=>S.bases[g]).filter(b=>!b.broken).sort((a,b)=>dist2(e.x,e.y,a.x,a.y)-dist2(e.x,e.y,b.x,b.y))[0];
  if(b){e.tt=6;e.tgt=b.ent;}else e.tt=1;
  return true;
}
