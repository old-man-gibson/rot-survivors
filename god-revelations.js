/* Each god extends its original blessings with its own rules, rather than a shared stat deck. */
const GOD_REVELATIONS=[
 [
 ['putrefaction','Putrefaction','Disease deals 30% more damage per stack.',2,()=>CFG.disDps*=1.3],
 ['incubation','Incubation','Disease consumes its stacks 25% slower.',3,()=>CFG.disDecay*=.75],
 ['mucus','Clotted mucus','Diseased enemies move 20% slower.',5,m=>m.f.mucus=1],
 ['contagion','Skin to skin','Once per second, infected bodies spread disease within 65 units. Each enemy receives at most one stack per second, regardless of nearby carriers.',6,m=>m.f.contagion=1],
 ['compost','The body feeds','Your kills of infected enemies restore 1 health. At most once per second.',7,m=>m.f.compost=1],
 ['lesions','Open lesions','Your disease aura and seed pods apply two additional disease stacks.',8,m=>m.f.lesions=2],
 ['trail','A pilgrim of sores','Every two seconds while moving, leave a four-second infectious wound.',9,m=>m.f.plagueTrail=1],
 ['swelling','Swollen organs','Corpse ruptures reach 45% farther.',10,m=>m.f.ruptureArea=1.45],
 ['sepsis','Sepsis','All your damage deals 25% more to enemies carrying at least eight disease stacks.',11,m=>m.f.sepsis=1],
 ['reservoir','Walking reservoir','Gain 25 maximum health and 0.4 health per second, but move 8% slower.',15,m=>{m.f.vessel=25;m.f.regen=.4;m.f.speed=-.08;}]
 ],
 [
 ['velvet','Velvet invitation','Whispers and chorus invitations reach 35% farther.',2,m=>m.f.inviteRange=1.35],
 ['obsession','Obsession','Enthralled servants stay devoted three seconds longer.',3,m=>m.f.devotionTime=3],
 ['refuge','Adoring shelter','Take 25% less damage while an enthralled servant is within 180 pixels.',5,m=>m.f.refuge=1],
 ['jealousy','Jealous hands','Enthralled servants strike 40% harder.',6,m=>m.f.jealousy=1],
 ['panic','Inconsolable','Hysterical enemies are slowed by 50% instead of 30%.',7,m=>m.f.panic=1],
 ['afterglow','Afterglow','A released servant restores 3 health to you.',8,m=>m.f.afterglow=1],
 ['soprano','Glass soprano','Hysterical release screams reach 45% farther.',9,m=>m.f.screamArea=1.45],
 ['cruelty','A beautiful cruelty','Your damage against hysterical enemies increases by 35%.',10,m=>m.f.cruelty=1],
 ['magnetism','Fatal attraction','Gain 35% pickup radius and 10% movement speed.',11,m=>{m.f.pickup=.35;m.f.speed=.1;}],
 ['ecstasy','Cannot look away','Enthrallment lasts five seconds longer, but new invitations arrive 20% slower.',15,m=>{m.f.devotionTime=(m.f.devotionTime||0)+5;m.cd*=1.2;}]
 ],
 [
 ['antennae','Searching antennae','Locusts curve toward nearby prey. The brood halo reaches 15% farther.',2,m=>{m.f.homing=1;m.area*=1.15;}],
 ['eggs','Eggs beneath the skin','Your infestation death broods release two more locusts.',3,()=>CFG.infShots+=2],
 ['shell','Chitin mantle','Take 12% less incoming damage, but move 4% slower.',5,m=>{m.f.armor=.12;m.f.speed=-.04;}],
 ['bite','Living mandibles','Volley and halo strikes apply one additional infestation stack.',6,m=>m.f.infBite=1],
 ['migration','The long migration','Locusts remain alive 50% longer; the halo gains two orbiting broods.',7,m=>{m.f.longFlight=1;m.count+=2;}],
 ['nest','The fallen are nests','Your kills of infested enemies leave an infestation field for three seconds.',8,m=>m.f.nest=1],
 ['gullet','A second gullet','Condition transfer carries 35% more of each consumed affliction.',9,()=>CFG.infCarryPerStack*=1.35],
 ['quickening','Quickening swarm','Infestation damage doubles; death-brood locusts also benefit.',10,()=>CFG.infDmg*=2],
 ['skitter','Skittering pilgrimage','Move 14% faster, with 10 less maximum health.',11,m=>{m.f.speed=.14;m.f.vessel=-10;}],
 ['matriarch','The last matriarch','Death broods chain one generation further, but your weapon fires 15% slower.',15,m=>{CFG.infGenCap++;m.cd*=1.15;}]
 ],
 [
 ['serration','Serrated sacrament','Your blade and needle apply two additional bleed stacks.',2,m=>m.f.serration=2],
 ['scar','Scar tissue','Gain 20 maximum health.',3,m=>m.f.vessel=20],
 ['pursuit','Do not flee','Bleeding deals full damage even to stationary enemies.',5,()=>CFG.bleedFloor=1],
 ['execution','Red execution','Your direct blade and needle strikes execute ordinary bleeding enemies below 15% health. Bosses and seats resist execution.',6,m=>m.f.redExecute=1],
 ['reckoning','Pain remembers','Gain up to 60% blade and needle damage as your health falls.',7,m=>m.f.reckoning=1],
 ['martyr','Martyr\'s stride','Below half health, move 20% faster.',8,m=>m.f.martyr=1],
 ['clot','Clot the wound','Each of your kills of a bleeding enemy restores 2 health; at most once per second.',9,m=>m.f.clot=1],
 ['artery','A severed artery','Bleed stacks last 35% longer and deal 20% more damage.',10,()=>{CFG.bleedLife*=1.35;CFG.bleedDps*=1.2;}],
 ['mercy','No second wound','Gain 0.3 seconds of protection after taking damage.',11,m=>m.f.mercy=.3],
 ['oath','The last red oath','Your weapon gains 45% damage, but you lose 15 maximum health.',15,m=>{m.dmg*=1.45;m.f.vessel=(m.f.vessel||0)-15;}]
 ],
 [
 ['embers','Ember bed','Fire patches tick every 0.35 seconds instead of every 0.5.',2,m=>m.f.emberTick=.35],
 ['brand','The Jarl\'s brand','Your blade and fire patches add one extra burn stack per hit.',3,m=>m.f.brand=1],
 ['cautery','Cauterized flesh','Take 15% less incoming damage, but all healing is reduced by 20%.',5,m=>{m.f.armor=.15;m.f.healPenalty=.2;}],
 ['kindle','Plague kindling','Your fire damage increases by 50% against diseased enemies.',6,m=>m.f.kindle=1],
 ['ash','Ash in the lungs','Burning enemies move 20% slower.',7,m=>m.f.ashSlow=.2],
 ['coal','Coals from the dead','Your kills of burning enemies leave a four-second fire patch.',8,m=>m.f.coals=1],
 ['furnace','Furnace heart','Gain 20% fire-weapon damage but its effects are 15% smaller.',9,m=>{m.dmg*=1.2;m.area*=.85;}],
 ['pyre','An unending pyre','New fire patches last two seconds longer.',10,m=>m.f.fireLife=2],
 ['smith','The smith\'s endurance','Gain 18 maximum health and 0.2 seconds of protection after a hit.',11,m=>{m.f.vessel=18;m.f.mercy=.2;}],
 ['crown','Crown of cinders','Every three seconds, scorch enemies within 110 pixels for four burn stacks.',15,m=>m.f.cinderCrown=1]
 ],
 [
 ['mass','Accretion','Gravity pulls twice as hard. Solar flares pull nearby bodies toward their center.',2,m=>m.f.accretion=1],
 ['isotope','Unstable isotope','Radiation deals 35% more damage per stack.',3,()=>CFG.radDps*=1.35],
 ['pressure','Radiation pressure','Irradiated enemies deal 25% less damage to you.',5,m=>m.f.pressure=1],
 ['ion','Ionization','Radiation ignores half of an enemy\'s remaining condition resistance.',6,m=>m.f.ion=1],
 ['corona','Wide corona','Radiation is applied in a ring 40% wider than the damaging impact or flare.',7,m=>m.f.corona=1],
 ['eclipse','Eclipse shelter','Take 15% less damage while a gravity well is active, or within 150 pixels of your most recent solar flare.',8,m=>m.f.eclipse=1],
 ['density','Critical density','Apply two additional radiation stacks with impacts and flares.',9,m=>m.f.radStacks=2],
 ['half','The star outlives you','Radiation decays 35% slower.',10,()=>CFG.radLife*=1.35],
 ['orbit','Orbital pilgrimage','Gain 25% pickup radius and 8% movement speed.',11,m=>{m.f.pickup=.25;m.f.speed=.08;}],
 ['collapse','The weight of a sun','Radiated enemies take 20% more of your damage, but your star weapon casts 15% slower.',15,m=>{m.f.radVulnerable=1;m.cd*=1.15;}]
 ],
 [
 ['axiom','An extra dimension','Rays are 60% wider, including lattice branches.',2,m=>m.f.rayWidth=1.6],
 ['memory','The proof remains','Unfolding decays half as quickly.',3,m=>m.f.unfoldMemory=1],
 ['origin','An origin elsewhere','Rays originate 45 pixels ahead of you; the lattice expands its vertex circle to 99 pixels.',5,m=>m.f.origin=45],
 ['derivative','The derivative hurts','Ray hits deal 4% more damage per unfolding stack, up to 60%.',6,m=>m.f.derivative=1],
 ['parallel','Parallel postulate','Every primary ray adds a weaker parallel beam; each lattice gains another vertex.',7,m=>m.f.parallel=1],
 ['irrational','Irrational distance','Gain 12% movement speed and 0.15 seconds of protection after being struck.',8,m=>{m.f.speed=.12;m.f.mercy=.15;}],
 ['intersection','Intersection theorem','Ray hits apply two radiation stacks to unfolded enemies.',9,m=>m.f.intersection=1],
 ['fraction','A gentler division','Rays retain 97% damage per pierced body instead of 90%.',10,m=>m.f.falloff=.97],
 ['inverse','The inverse body','Enemies with at least four unfolding stacks deal 30% less damage to you.',11,m=>m.f.inverse=1],
 ['limit','An impossible limit','Ray length and lattice reach grow 50%, but casts arrive 20% slower.',15,m=>{m.area*=1.5;m.cd*=1.2;}]
 ],
 [
 ['ink','Wet scripture','New seals remain for six additional seconds.',2,m=>m.f.sigilLife=6],
 ['cadence','A longer blasphemy','Borrowed-word damage lasts six seconds instead of three.',3,m=>m.f.wordLife=6],
 ['absolution','Stolen absolution','Entering an unused seal restores 4 health.',5,m=>m.f.absolution=1],
 ['margin','Written in the margins','Seals pull enemies within twice their radius toward their center.',6,m=>m.f.sigilPull=1],
 ['vow','A protective lie','Take 20% less damage while carrying the borrowed word.',7,m=>m.f.wordArmor=1],
 ['echo','Echoed profanity','Every third seal you consume reduces all weapon cooldowns by one second.',8,m=>m.f.wordEcho=1],
 ['smudge','A stain on the name','Seal blasts apply four disease stacks.',9,m=>m.f.sigilDisease=1],
 ['sentence','A living sentence','Seals heal for 2% of their damage dealt, up to 4 health per detonation.',10,m=>m.f.sigilLeech=1],
 ['slander','Slander the gods','Borrowed word grants 40% global damage instead of 25%.',11,m=>m.f.wordPower=1.4],
 ['taboo','The final taboo','Your seals gain 50% damage, but borrowed word no longer increases damage.',15,m=>{m.dmg*=1.5;m.f.wordPower=1;}]
 ],
 [
 ['tibia','Long tibias','Seekers walk 40% faster; pallbearers orbit 25% farther out.',2,m=>m.f.tibia=1],
 ['ribs','Rib cage','Take 15% less incoming damage while a seeker lives or pallbearers have struck in the last second.',3,m=>m.f.ribs=1],
 ['mourn','Mourn the dead','Every fifth kill raises an additional seeker, up to 24 active seekers.',5,m=>m.f.mourn=1],
 ['shards','Splintered remains','Bone explosions and pallbearer strikes apply three bleed stacks.',6,m=>m.f.boneShards=1],
 ['vigil','A longer vigil','Seekers live five seconds longer; pallbearers gain 15% strike radius.',7,m=>m.f.vigil=1],
 ['grave','Cold grave','Bone strikes briefly slow enemies by 30%.',8,m=>m.f.graveSlow=1],
 ['burial','Proper burial','Every fifth kill restores 5 health.',9,m=>m.f.burial=1],
 ['marrow','Sacred marrow','Seekers and pallbearers gain 25% damage.',10,m=>m.dmg*=1.25],
 ['casket','A casket for you','Gain 30 maximum health, but move 6% slower.',11,m=>{m.f.vessel=30;m.f.speed=-.06;}],
 ['wake','An endless wake','Raise seekers or strike with pallbearers 25% faster; bone attacks become 15% smaller.',15,m=>{m.cd*=.75;m.area*=.85;}]
 ]
];
const GOD_ASCENSIONS=[
 [['The orchard of corpses','Your kills of infected bodies plant infectious wounds.','corpseGarden'],['The eternal infection','Disease never decays, but disease tick damage is reduced by 25%.','eternal']],
 [['Everyone belongs to her','Each invitation also enthralls up to two nearby ordinary servants for four seconds.','massCharm'],['A world of screaming mouths','Every new enthrallment emits a hysterical scream. All release screams deal double damage.','rapture']],
 [['The world is a nursery','All locusts home toward prey; infestation death broods release four additional locusts.','nursery'],['Nothing remains uneaten','Locusts pierce up to three bodies; halo bites apply three extra infestation stacks.','piercing']],
 [['The crimson tide','Bleeding enemies restore 0.12 health per second each, capped at 3 health per second.','bloodTide'],['One perfect sacrifice','Direct strikes deal triple damage to bleeding enemies below 40% health.','sacrifice']],
 [['Everything must burn','Your kills of burning enemies ignite nearby bodies for six stacks.','conflagration'],['The cold of white fire','Burning enemies move 45% slower and their attacks deal 20% less damage to you.','whiteFire']],
 [['Every death a supernova','Your kills of irradiated bodies deal 30 radiant damage around them and add four radiation stacks. At most four novas per second.','supernova'],['A captive universe','Gravity wells gain triple pull; solar flares pull with the same force. Radiation deals 50% more damage.','horizon']],
 [['Proof by recursion','A primary ray or lattice branch splits into two half-length rays at its first contact. Child rays cannot recurse.','recursive'],['The null hypothesis','Every ray removes condition resistance. Rays deal 50% extra damage to enemies carrying at least three different conditions.','null']],
 [['The sentence writes itself','A detonating seal triggers nearby seals, including those without an enemy inside.','chainSeals'],['The word becomes flesh','Entering an unused seal grants two seconds of hit immunity and heals 8 health.','wordFlesh']],
 [['Death has an echo','Seeker explosions and pallbearer strikes repeat at the same position after half a second, for half damage.','boneEcho'],['The dead stand before you','Each of your kills grants 2% damage reduction for five seconds, stacking to 30%.','soulWard']]
];
function addGodRevelations(g,add){
 for(const [id,n,t,min,ap] of GOD_REVELATIONS[g])add(id,n,t,min,ap);
 const [n,t,flag]=GOD_ASCENSIONS[g][0];
 add('apex0',n,t+' Reduces all creatures’ own-god resistance by 15%, compounding with other purity or transformation milestones.',12,m=>{m.f.apex='A';m.f[flag]=1;if(flag==='nursery'){m.f.homing=1;CFG.infShots+=4;}},{branch:'apex',rarity:'Purity · deepen your armament'});
 const [name,text]=METAMORPHOSES[g];add('apex1',name,text+' Reduces all creatures’ own-god resistance by 15%, compounding with other purity or transformation milestones.',12,m=>{m.f.apex='B';m.f.metamorph=1;},{branch:'apex',rarity:'Metamorphosis · transform your armament'});
}
