from pathlib import Path
from PIL import Image
import json
sources=[
 ('EPIC RPG World - Sewers V1.5/Characters/Mutant Rat/mutant rat - idle.png',128,96,8),
 ('ERW - Sea Adventures (GL 2.0 expansion) V1.5/Characters/female enemy/female-enemy-anims-idle-8frames.png',128,96,8),
 ('EPIC RPG World Pack - Cemetery V 1.6/Characters/bat/Bat2-Idle animation.png',96,96,8),
 ('EPIC RPG World Pack - Cemetery V 1.6/Characters/undead/Undead-idle animation.png',96,96,8),
 ('Epic RPG World - Volcano V1.6/Characters/imp-like demon/no shadow/imp-idle_9frames.png',192,160,9),
 ('Epic RPG World - Volcano V1.6/Characters/elemental/elemental-idle_8frames.png',256,224,8),
 ('Epic RPG World - The dephs of the Mountain V1.5.1/Characters/Enemy 1/enemy 1-idle.png',256,224,8),
 ('EPIC RPG World Pack - Crypt V.1.6/Characters/Big Worm 1/Big worm - 1-idle-8 frames.png',128,128,8),
 ('EPIC RPG World Pack - Old Prison V1.7.1/Characters/Mage Skeleton/Mage Skeleton no shield/Mage Skeleton - animations-idle.png',220,220,8)]
out=Path('assets/actors');out.mkdir(parents=True,exist_ok=True);manifest=[]
for g,(path,w,h,count) in enumerate(sources):
 im=Image.open(Path('tilemaps')/path).convert('RGBA');frames=[im.crop((k*w,0,(k+1)*w,h)) for k in range(count)]
 boxes=[f.getbbox() for f in frames];box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes));bw,bh=box[2]-box[0],box[3]-box[1]
 atlas=Image.new('RGBA',(bw*count,bh))
 for k,f in enumerate(frames):atlas.paste(f.crop(box),(k*bw,0))
 atlas.save(out/f'god-{g}.png');frames[0].crop(box).save(out/f'god-{g}-portrait.png')
 manifest.append(dict(source=path,w=bw,h=bh,frames=count))
(out/'sources.json').write_text(json.dumps(manifest,indent=2))
Path('actor-art.js').write_text('''/* Trimmed animation frames from the bundled packs; provenance in assets/actors/sources.json. */
const ActorArt=(()=>{
 const meta='''+json.dumps(manifest)+''',images=[],errors=[];
 const ready=Promise.all(meta.map((m,g)=>new Promise(resolve=>{const i=new Image();images[g]=i;i.onload=resolve;i.onerror=()=>{errors.push(i.src);resolve();};i.src='assets/actors/god-'+g+'.png';})));
 function draw(ctx,g,x,y,height,time=0,flip=false){const im=images[g],m=meta[g];if(!im?.complete||!im.naturalWidth)return false;
  const w=height*m.w/m.h,frame=Math.floor(time*8)%m.frames;ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(im,frame*m.w,0,m.w,m.h,-w/2,-height,w,height);ctx.restore();return true;}
 return {draw,ready,errors};
})();
''')
