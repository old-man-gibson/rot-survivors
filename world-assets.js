/* Source atlas cells are 32px. All original pack files remain untouched. */
const WorldAssets=(()=>{
  const root='tilemaps/', images={},tiles={},errors=[],pending=[];
  let revision=0;
  const packs={
    grass:'ERW - Grass Land 2.0 v2.1/', desert:'Epic RPG World - Desert V1.6/',
    highland:'Epic RPG World - Highlands V1.4.1/', dead:'EPIC RPG World Pack - Cemetery V 1.6/',
    volcano:'Epic RPG World - Volcano V1.6/', village:'Epic RPG World - The Village V2.2/'
  };
  function surface(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function load(id,path,onload){
    const img=new Image();images[id]=img;
    pending.push(new Promise(resolve=>{
      img.onload=()=>{if(onload)onload(img);revision++;resolve();};
      img.onerror=()=>{errors.push(path);console.warn('Missing world asset:',path);revision++;resolve();};
    }));img.src=root+path;return img;
  }
  function sheet(id,path,entries){load(id,path,img=>{
    for(const [name,cells] of Object.entries(entries))tiles[name]=cells.map(([x,y])=>{
      const raw=surface(32),r=raw.getContext('2d');r.drawImage(img,x*32,y*32,32,32,0,0,32,32);
      const c=surface(32),ctx=c.getContext('2d');ctx.filter='saturate(0.65) brightness(0.78)';ctx.drawImage(raw,0,0);return c;
    });
  });}
  sheet('grass',packs.grass+'Tilesets/Tileset-Terrain.png',{
    grass:[[26,3],[27,3],[28,3],[26,4]],road:[[37,6],[38,6],[39,6]],stone:[[47,26],[48,26],[49,26]]
  });
  sheet('desert',packs.desert+'tilesets/tilesets.png',{sand:[[2,0],[3,0],[4,0]],dry:[[30,1],[31,1],[32,1]]});
  sheet('highland',packs.highland+'tilesets and props/tilesets.png',{
    snow:[[1,6],[2,6],[2,7]],rock:[[44,6],[45,6],[44,7]],wood:[[23,29],[24,29]]
  });
  sheet('dead',packs.dead+'Tilesets/Tileset-Terrain.png',{dead:[[33,4],[34,4],[34,5]]});
  sheet('volcano',packs.volcano+'Tilesets/tileset.png',{
    ash:[[16,18],[17,18],[18,18]],lava:[[6,14],[7,14],[8,14]]
  });
  // Transparent, hand-painted banks: numbered according to the pack's tile guide.
  const coast=packs.grass+'Tilesets/Platform - grass to water/';
  for(let n=1;n<=16;n++)sheet('bank'+n,coast+'water to grass(transparency)- sprites/Tile '+n+' - frame 1.png',{['bank'+n]:[[0,0]]});
  // Match the water embedded in the bank sprites, including its animation frame.
  sheet('bankWater',coast+'Animated water tiles (full tile).png',{water:[[0,0]]});
  sheet('terrainMasks',packs.grass+'Tilesets/Tileset-Terrain-new grass - transparency.png',{
    blendTop:[[28,25]],blendRight:[[30,27]],blendBottom:[[28,29]],blendLeft:[[26,27]],
    blendTL:[[27,25]],blendTR:[[29,25]],blendBL:[[27,29]],blendBR:[[29,29]]
  });
  load('houses',packs.village+'buildings/Premade_houses.png');
  load('pine',packs.grass+'Props/Static props/pine-tree-sprites/pine-tree_0.png');
  load('snowPine',packs.highland+'tilesets and props/props-sprites/animated_pine_tree_big-snow1-1.png');
  load('deadTree',packs.dead+'Props/props by individual sprites/tree 1.png');
  load('boulder',packs.volcano+'Props/static/individual sprites/big rocks_0.png');
  load('boulderWide',packs.volcano+'Props/static/individual sprites/big rocks_5.png');
  load('sandRock',packs.desert+'props/props-sprites/big_rocks_noSand_1.png');
  load('tent',packs.desert+'props/props-houses-sprites/tent1.png');
  load('well','EPIC RPG World Pack - Grass Land V. 1.6/Props/Atlas-Props-individual sprites/waterwell_0.png');
  const houseCrops=[[16,16,416,400],[480,16,384,400],[864,16,448,400],[1792,112,192,272]];
  function sprite(ctx,name,x,y,w,h,variant=0){
    const img=images[name];if(!img||!img.complete||!img.naturalWidth)return false;
    if(name==='houses')ctx.drawImage(img,...houseCrops[variant%4],x,y,w,h);
    else if(name==='snowPine')ctx.drawImage(img,70,12,112,165,x,y,w,h);
    else ctx.drawImage(img,x,y,w,h);return true;
  }
  return {tiles,images,sprite,surface,errors,ready:Promise.all(pending),get revision(){return revision;}};
})();
