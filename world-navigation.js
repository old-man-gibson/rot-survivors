/* Static terrain collision and shared reverse-BFS fields. One field build per
   update; hundreds of servants reuse town, camp and player destinations. */
const WorldNavigation=(()=>{
  function index(m,x,y){const gx=Math.floor((x-m.origin)/m.cell),gy=Math.floor((y-m.origin)/m.cell);
    return gx<0||gy<0||gx>=m.n||gy>=m.n?-1:gy*m.n+gx;}
  function point(m,i){return {x:m.origin+(i%m.n+.5)*m.cell,y:m.origin+(Math.floor(i/m.n)+.5)*m.cell};}
  function blocked(m,x,y,r=0){
    const a=Math.floor((x-r-m.origin)/m.cell),b=Math.floor((x+r-m.origin)/m.cell);
    const c=Math.floor((y-r-m.origin)/m.cell),d=Math.floor((y+r-m.origin)/m.cell);
    for(let gy=c;gy<=d;gy++)for(let gx=a;gx<=b;gx++){
      if(gx<0||gy<0||gx>=m.n||gy>=m.n)return true;
      if(!m.solid[gy*m.n+gx])continue;
      const nx=Math.max(m.origin+gx*m.cell,Math.min(x,m.origin+(gx+1)*m.cell));
      const ny=Math.max(m.origin+gy*m.cell,Math.min(y,m.origin+(gy+1)*m.cell));
      if((nx-x)**2+(ny-y)**2<=r*r)return true;
    }return false;
  }
  function nearest(m,x,y,r=0){
    const at=index(m,x,y);if(at>=0&&!blocked(m,x,y,r))return {x,y};
    const gx=Math.floor((x-m.origin)/m.cell),gy=Math.floor((y-m.origin)/m.cell);
    for(let ring=0;ring<m.n;ring++){
      let best=null,bd=Infinity;
      for(let dy=-ring;dy<=ring;dy++)for(let dx=-ring;dx<=ring;dx++){
        if(Math.max(Math.abs(dx),Math.abs(dy))!==ring)continue;
        const xx=gx+dx,yy=gy+dy;if(xx<0||yy<0||xx>=m.n||yy>=m.n)continue;
        const p=point(m,yy*m.n+xx),dist=(p.x-x)**2+(p.y-y)**2;
        if(dist<bd&&!blocked(m,p.x,p.y,r)){best=p;bd=dist;}
      }if(best)return best;
    }return {x:0,y:0};
  }
  function move(m,e,dx,dy,r=Math.min(e.r||11,24)){
    if(blocked(m,e.x,e.y,r)){const p=nearest(m,e.x,e.y,r);e.x=p.x;e.y=p.y;}
    // Small swept steps prevent fast motion and separation from tunneling.
    const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/12));dx/=steps;dy/=steps;
    for(let i=0;i<steps;i++){
      if(!blocked(m,e.x+dx,e.y,r))e.x+=dx;
      if(!blocked(m,e.x,e.y+dy,r))e.y+=dy;
    }
  }
  function clear(m,x,y,tx,ty,r=20){
    const d=Math.hypot(tx-x,ty-y),steps=Math.max(1,Math.ceil(d/24));
    for(let i=1;i<=steps;i++)if(blocked(m,x+(tx-x)*i/steps,y+(ty-y)*i/steps,r))return false;
    return true;
  }
  function field(m,goal){
    if(m.flows.has(goal))return m.flows.get(goal);
    if(m.navBudget<=0)return null;m.navBudget--;
    const distances=new Int32Array(m.n*m.n);distances.fill(-1);
    const queue=m.queue||(m.queue=new Int32Array(distances.length));let head=0,tail=0;
    distances[goal]=0;queue[tail++]=goal;
    while(head<tail){const i=queue[head++],x=i%m.n,y=Math.floor(i/m.n),next=distances[i]+1;
      for(const j of [x>0?i-1:-1,x<m.n-1?i+1:-1,y>0?i-m.n:-1,y<m.n-1?i+m.n:-1]){
        if(j<0||m.solid[j]||distances[j]>=0)continue;distances[j]=next;queue[tail++]=j;
      }
    }
    m.flows.set(goal,distances);if(m.flows.size>32)m.flows.delete(m.flows.keys().next().value);
    return distances;
  }
  function steer(m,e,tx,ty){
    const r=Math.min(e.r||11,24),at=index(m,e.x,e.y);
    // Short-range clear paths need no graph search; cache the LOS for a few ticks.
    const target=index(m,tx,ty);
    if(!e.nav||e.nav.target!==target||e.nav.until<=m.navTick){
      e.nav={target,until:m.navTick+8,direct:clear(m,e.x,e.y,tx,ty,r)};
    }
    if(e.nav.direct)return {x:tx,y:ty};
    const end=nearest(m,tx,ty,r),goal=index(m,end.x,end.y),f=field(m,goal);
    if(!f||at<0)return {x:e.x,y:e.y};
    if(at===goal)return end;
    const ax=at%m.n,ay=Math.floor(at/m.n);let best=-1,score=Infinity;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const xx=ax+dx,yy=ay+dy;
      if(xx<0||yy<0||xx>=m.n||yy>=m.n)continue;
      const i=yy*m.n+xx;if(f[i]<0||m.solid[i])continue;
      if(dx&&dy&&(m.solid[ay*m.n+xx]||m.solid[yy*m.n+ax]))continue;
      const p=point(m,i),s=f[i]+Math.hypot(e.x-p.x,e.y-p.y)/m.cell*.2;
      if(s<score&&clear(m,e.x,e.y,p.x,p.y,r)){score=s;best=i;}
    }
    if(best>=0)return point(m,best);
    // Move to this cell's center before turning a tight corner.
    return point(m,at);
  }
  function begin(m){m.navBudget=1;m.navTick++;}
  return {index,point,blocked,nearest,move,clear,field,steer,begin};
})();
