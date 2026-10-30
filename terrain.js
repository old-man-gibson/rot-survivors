/* Shared tile world: scenery, collision, navigation and minimap. */
const WorldTerrain=(()=>{
  const CELL=64,CHUNK=512,CACHE_LIMIT=64;
  const kinds=['grass','sand','snow','dead','ash','rock','water','lava','road','stone','wood','dry'];
  const colors=['#46563e','#a38b56','#94a6b1','#50465b','#463b3e','#706b66','#286477','#b65a29','#776552','#77746c','#775c41','#796645'];
  const names=['Grassland','Dunes','Highlands','Deadwood','Cinder wastes','Rocky uplands'];
  const hash=(x,y,seed)=>{let n=Math.imul(x^seed,374761393)^Math.imul(y,668265263);n=Math.imul(n^n>>>13,1274126177);return ((n^n>>>16)>>>0)/4294967296;};
  function noise(x,y,seed){const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);
    return (hash(ix,iy,seed)*(1-u)+hash(ix+1,iy,seed)*u)*(1-v)+(hash(ix,iy+1,seed)*(1-u)+hash(ix+1,iy+1,seed)*u)*v;}
  function create(towns,bases,seed=(Math.random()*4294967296)>>>0,palette=[0,3]){
    const roads=[],nodes=towns.map(t=>({x:t.x,y:t.y}));
    function road(a,b,width){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,bend=(hash(roads.length,8,seed)-.5)*Math.min(320,d*.3);
      roads.push({a:{x:a.x,y:a.y},b:{x:b.x,y:b.y},c:{x:(a.x+b.x)/2-dy/d*bend,y:(a.y+b.y)/2+dx/d*bend},width});}
    const joined=new Set(nodes.length?[0]:[]);
    while(joined.size<nodes.length){let best=Infinity,ai=0,bi=0;
      for(const a of joined)for(let b=0;b<nodes.length;b++)if(!joined.has(b)){
        const d=(nodes[a].x-nodes[b].x)**2+(nodes[a].y-nodes[b].y)**2;if(d<best){best=d;ai=a;bi=b;}}
      road(nodes[ai],nodes[bi],160);joined.add(bi);}
    for(let i=0;i<nodes.length;i+=4){const near=nodes.filter(n=>n!==nodes[i]).sort((a,b)=>Math.hypot(a.x-nodes[i].x,a.y-nodes[i].y)-Math.hypot(b.x-nodes[i].x,b.y-nodes[i].y));if(near[1])road(nodes[i],near[1],128);}
    for(const b of bases){const t=nodes.slice().sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];if(t)road(b,t,160);}
    const n=208,origin=-n*CELL/2,len=n*n;
    const m={seed,roads,towns,bases,n,origin,cell:CELL,ground:new Uint8Array(len),biome:new Uint8Array(len),solid:new Uint8Array(len),props:new Uint8Array(len),reserved:new Uint8Array(len),buildings:[],camps:[],wells:[],cache:new Map(),flows:new Map(),navBudget:1,navTick:0,revision:WorldAssets.revision};
    // Large districts with noise-warped borders, rather than random tiles.
    const rotation=hash(5,8,seed)*Math.PI*2;m.regions=[{x:0,y:0,kind:palette[0]}];
    for(let i=0;i<6;i++){const a=rotation+i*Math.PI/3;m.regions.push({x:Math.cos(a)*3900,y:Math.sin(a)*3900,kind:palette[i%3===0?palette.length-1:0]});}
    for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++){
      const i=gy*n+gx,x=origin+(gx+.5)*CELL,y=origin+(gy+.5)*CELL;
      const wx=x+(noise(x/1700,y/1700,seed+5)-.5)*1500,wy=y+(noise(x/1700,y/1700,seed+6)-.5)*1500;
      let closest=Infinity,kind=0;for(const r of m.regions){const d=(wx-r.x)**2+(wy-r.y)**2;if(d<closest){closest=d;kind=r.kind;}}
      m.ground[i]=m.biome[i]=kind;
      const wet=noise(x/880,y/880,seed+7),rough=noise(x/490,y/490,seed+8),forest=noise(x/650,y/650,seed+9);
      if(wet>.70){m.ground[i]=kind===4?7:6;m.solid[i]=1;}
      else if(rough>.74||(kind===5&&rough>.55)){m.solid[i]=1;m.props[i]=kind===1?5:4;}
      else if((kind===0||kind===2||kind===3)&&forest>.59){m.solid[i]=1;m.props[i]=kind===2?2:kind===3?3:1;}
      if(Math.hypot(x,y)>6470){m.solid[i]=1;m.ground[i]=6;m.props[i]=0;}
    }
    function disk(x,y,r,paint=-1){const gx=Math.floor((x-origin)/CELL),gy=Math.floor((y-origin)/CELL),reach=Math.ceil(r/CELL)+1;
      for(let yy=Math.max(0,gy-reach);yy<=Math.min(n-1,gy+reach);yy++)for(let xx=Math.max(0,gx-reach);xx<=Math.min(n-1,gx+reach);xx++){
        if(Math.hypot(origin+(xx+.5)*CELL-x,origin+(yy+.5)*CELL-y)>r)continue;
        const i=yy*n+xx;m.reserved[i]=1;m.props[i]=0;m.solid[i]=0;
        if(paint>=0)m.ground[i]=(m.ground[i]===6||m.ground[i]===7||m.ground[i]===10)?10:paint;else m.ground[i]=m.biome[i];}}
    for(const t of towns)disk(t.x,t.y,t.r+140);for(const b of bases)disk(b.x,b.y,540);
    // Roads guarantee access; water crossings use a bridge deck texture.
    for(const r of roads){const steps=Math.ceil(Math.hypot(r.a.x-r.b.x,r.a.y-r.b.y)/24);
      for(let s=0;s<=steps;s++){const t=s/steps,u=1-t;disk(u*u*r.a.x+2*u*t*r.c.x+t*t*r.b.x,u*u*r.a.y+2*u*t*r.c.y+t*t*r.b.y,r.width/2+32,8);}}
    function rect(x,y,w,h,kind){for(let yy=Math.floor((y-origin)/CELL);yy<=Math.floor((y+h-origin)/CELL);yy++)for(let xx=Math.floor((x-origin)/CELL);xx<=Math.floor((x+w-origin)/CELL);xx++){
      if(xx<0||yy<0||xx>=n||yy>=n)continue;const i=yy*n+xx;m.ground[i]=kind;m.solid[i]=0;m.props[i]=0;}}
    function propAt(x,y,type,list,data){const i=WorldNavigation.index(m,x,y),p=WorldNavigation.point(m,i);m.solid[i]=1;m.props[i]=type;list.push({...p,...data,index:i});}
    for(const t of towns){
      rect(t.x-t.r,t.y-48,t.r*2,96,8);rect(t.x-48,t.y-t.r,96,t.r*2,8);rect(t.x-110,t.y-82,220,164,9);rect(t.x-315,t.y+315,225,96,11);
      for(const side of [-1,1])rect(t.x+side*160-36,t.y-310,72,610,8);
      t.pts.forEach((p,lot)=>propAt(t.x+p.x,t.y+p.y,6,m.buildings,{town:t,lot,style:p.style}));
      propAt(t.x+64,t.y+64,8,m.wells,{town:t});}
    for(const b of bases){disk(b.x,b.y,290,8);disk(b.x,b.y,88,9);for(let i=0;i<6;i++){const a=i*Math.PI/3+.35;propAt(b.x+Math.cos(a)*210,b.y+Math.sin(a)*210,7,m.camps,{base:b});}}
    // Close isolated pockets so spawns cannot be placed on unreachable islands.
    const start=WorldNavigation.nearest(m,towns[0].x,towns[0].y),root=WorldNavigation.index(m,start.x,start.y);
    const seen=new Uint8Array(len),queue=new Int32Array(len);let head=0,tail=0;seen[root]=1;queue[tail++]=root;
    while(head<tail){const i=queue[head++],x=i%n,y=Math.floor(i/n);
      for(const j of [x>0?i-1:-1,x<n-1?i+1:-1,y>0?i-n:-1,y<n-1?i+n:-1])if(j>=0&&!seen[j]&&!m.solid[j]){seen[j]=1;queue[tail++]=j;}}
    for(let i=0;i<len;i++)if(!seen[i]&&!m.solid[i]){m.solid[i]=1;m.props[i]=4;}
    m.reachable=tail;m.queue=queue;
    m.overview=WorldAssets.surface(n);const oc=m.overview.getContext('2d'),pixels=oc.createImageData(n,n);
    for(let i=0;i<len;i++){const col=parseInt(colors[m.ground[i]].slice(1),16),shade=m.props[i]&&m.props[i]<6?.6:1;
      pixels.data[i*4]=(col>>16)*shade;pixels.data[i*4+1]=((col>>8)&255)*shade;pixels.data[i*4+2]=(col&255)*shade;pixels.data[i*4+3]=255;}
    oc.putImageData(pixels,0,0);
    for(const t of towns){t.worldBuildings=m.buildings.filter(b=>b.town===t);t.worldWells=m.wells.filter(w=>w.town===t);}for(const b of bases)b.worldTents=m.camps.filter(t=>t.base===b);
    return m;
  }
  const blocks=new Map(),edges=new Map();let blockRevision=-1;
  function block(kind,variant=0){
    if(blockRevision!==WorldAssets.revision){blocks.clear();edges.clear();blockRevision=WorldAssets.revision;}
    const key=kind+':'+variant;if(blocks.has(key))return blocks.get(key);
    const c=WorldAssets.surface(CELL),ctx=c.getContext('2d'),tiles=WorldAssets.tiles[kinds[kind]];ctx.fillStyle=colors[kind];ctx.fillRect(0,0,CELL,CELL);
    if(tiles)for(let y=0;y<2;y++)for(let x=0;x<2;x++)ctx.drawImage(tiles[(variant+x+y*2)%tiles.length],x*32,y*32);blocks.set(key,c);return c;
  }
  // A single material owns each border, so opposite sides never blur into each other.
  const priority=[8,3,7,5,4,6,-1,-1,9,10,11,2];
  const corners=['TL','TR','BL','BR'],outerBank=[9,7,15,1],innerBank=[10,6,14,2];
  function neighbor(m,gx,gy,fallback){return gx<0||gy<0||gx>=m.n||gy>=m.n?fallback:m.ground[gy*m.n+gx];}
  function blend(kind,q,h,v,diagonal){
    const key=[kind,q,h,v,diagonal].join(':');if(edges.has(key))return edges.get(key);
    const c=WorldAssets.surface(32),ctx=c.getContext('2d');ctx.drawImage(block(kind),0,0,32,32,0,0,32,32);
    const mask=name=>WorldAssets.tiles[name]?.[0];
    ctx.globalCompositeOperation='destination-in';
    if(h&&v){const tile=mask('blend'+corners[q]);if(tile)ctx.drawImage(tile,0,0);}
    else if(h||v){const tile=mask(h?(q%2?'blendRight':'blendLeft'):(q<2?'blendTop':'blendBottom'));if(tile)ctx.drawImage(tile,0,0);}
    else if(diagonal){
      ctx.globalCompositeOperation='destination-out';const tile=mask('blend'+corners[3-q]);
      if(tile)ctx.drawImage(tile,q%2?16:0,q<2?0:16,16,16);
    }
    edges.set(key,c);return c;
  }
  function chunk(m,cx,cy){const c=WorldAssets.surface(CHUNK),ctx=c.getContext('2d'),ox=cx*CHUNK,oy=cy*CHUNK;ctx.imageSmoothingEnabled=false;
    for(let y=0;y<CHUNK;y+=CELL)for(let x=0;x<CHUNK;x+=CELL){
      const i=WorldNavigation.index(m,ox+x+1,oy+y+1),kind=i<0?6:m.ground[i];
      ctx.drawImage(block(kind,Math.floor(hash((ox+x)/CELL,(oy+y)/CELL,m.seed)*4)),x,y);if(i<0||kind===6||kind===7||kind===10)continue;
      const gx=i%m.n,gy=Math.floor(i/m.n);
      for(let q=0;q<4;q++){
        const dx=q%2?1:-1,dy=q<2?-1:1,px=x+(q%2)*32,py=y+(q>>1)*32;
        const h=neighbor(m,gx+dx,gy,6),v=neighbor(m,gx,gy+dy,6),d=neighbor(m,gx+dx,gy+dy,6);
        const lower=k=>k!==6&&k!==10&&priority[k]<priority[kind];
        const eh=lower(h),ev=lower(v),ed=lower(d);
        if(eh||ev||ed){
          const under=[eh?h:kind,ev?v:kind,ed?d:kind].sort((a,b)=>priority[a]-priority[b])[0];
          ctx.drawImage(block(under),0,0,32,32,px,py,32,32);ctx.drawImage(blend(kind,q,eh,ev,ed),px,py);
        }
        // Banks are painted on dry ground, with transparent interiors revealing its biome.
        const wh=h===6,wv=v===6,wd=d===6;
        const bank=wh&&wv?outerBank[q]:wh?(dx<0?12:4):wv?(dy<0?8:16):wd?innerBank[q]:0;
        const tile=WorldAssets.tiles['bank'+bank]?.[0];if(tile)ctx.drawImage(tile,px,py);
      }
    }
    // Props and blocked cells have exactly the same source of truth.
    for(let y=-CELL;y<CHUNK+CELL*3;y+=CELL)for(let x=-CELL;x<CHUNK+CELL;x+=CELL){const i=WorldNavigation.index(m,ox+x+1,oy+y+1);if(i<0)continue;
      const type=m.props[i];if(!type||type>5)continue;
      const jitter=hash(i,21,m.seed),id=type===4?(jitter>.5?'boulderWide':'boulder'):['','pine','snowPine','deadTree','','sandRock'][type];
      const w=type>=4?100+jitter*16:104+jitter*12,h=type>=4?76+jitter*14:140+jitter*25;
      ctx.save();ctx.translate(x+CELL/2+(jitter-.5)*14,y+CELL-4);
      if(hash(i,22,m.seed)>.5)ctx.scale(-1,1);
      WorldAssets.sprite(ctx,id,-w/2,-h,w,h);ctx.restore();}
    ctx.fillStyle='rgba(13,15,19,.16)';ctx.fillRect(0,0,CHUNK,CHUNK);return c;
  }
  function draw(ctx,m,x,y,w,h){if(m.revision!==WorldAssets.revision){m.cache.clear();m.revision=WorldAssets.revision;}
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(m.overview,m.origin,m.origin,m.n*CELL,m.n*CELL);let built=false;
    for(let gy=Math.floor(y/CHUNK);gy<=Math.floor((y+h)/CHUNK);gy++)for(let gx=Math.floor(x/CHUNK);gx<=Math.floor((x+w)/CHUNK);gx++){
      const key=gx+','+gy;let c=m.cache.get(key);if(!c){if(built)continue;c=chunk(m,gx,gy);built=true;}
      m.cache.delete(key);m.cache.set(key,c);if(m.cache.size>CACHE_LIMIT)m.cache.delete(m.cache.keys().next().value);ctx.drawImage(c,gx*CHUNK,gy*CHUNK);}ctx.restore();}
  function minimap(ctx,m,k,x,y){ctx.save();ctx.globalAlpha=.85;ctx.imageSmoothingEnabled=false;ctx.drawImage(m.overview,x+m.origin*k,y+m.origin*k,m.n*CELL*k,m.n*CELL*k);ctx.restore();}
  function visible(p,px,py,w,h){return Math.abs(p.x-px)<w/2+180&&Math.abs(p.y-py)<h/2+180;}
  function drawTown(ctx,t,occupied,px,py,w,h){if(!t.worldBuildings)return;ctx.save();ctx.imageSmoothingEnabled=false;
    for(const b of t.worldBuildings){if(!visible(b,px,py,w,h))continue;
      if(b.lot>=occupied){ctx.globalAlpha=.4;WorldAssets.sprite(ctx,'boulder',b.x-40,b.y-52,80,84);ctx.globalAlpha=1;continue;}
      ctx.globalAlpha=Math.abs(px-b.x)<64&&py>b.y-105&&py<b.y-28?.4:1;WorldAssets.sprite(ctx,'houses',b.x-64,b.y-100,128,132,b.style);ctx.globalAlpha=1;}
    for(const well of t.worldWells)if(visible(well,px,py,w,h))WorldAssets.sprite(ctx,'well',well.x-40,well.y-64,80,96);ctx.restore();}
  function drawCamp(ctx,b,col,px,py,w,h){if(!b.worldTents)return;ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=b.broken?.4:1;
    for(const t of b.worldTents)if(visible(t,px,py,w,h))WorldAssets.sprite(ctx,'tent',t.x-58,t.y-54,116,86);ctx.restore();
    if(!b.broken&&visible(b,px,py,w,h)){ctx.save();ctx.fillStyle=col;ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText('Camp stores · '+Math.floor(b.B)+' blood',b.x,b.y+330);ctx.restore();}}
  function region(m,x,y){const i=WorldNavigation.index(m,x,y);return i<0?'Sea':names[m.biome[i]];}
  return {create,draw,minimap,drawTown,drawCamp,region,kinds};
})();


