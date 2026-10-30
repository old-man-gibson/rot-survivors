# The horde roster — for markup

Every god fields the same five kinds; what differs is the manner. A kind's job never changes (minions gather, siegers bleed towns, grunts fight, leaders hold packs, titans guard seats): the roster below says how each god's body does that job and what it borrows from the god's weapon. **Built** entries are in `horde.js` today; the rest are designed and use the generic body until built. Names, numbers and mechanics are all open to edit.

## Bodies

| God | Minion (gathers blood, flees you) | Sieger (bleeds towns, spills) | Grunt (fights) | Leader (holds the pack, decides) | Titan (guards a fat seat) |
|---|---|---|---|---|---|
| **Gwulhorlw** rot | *Scab*: slow, leaves a faint rot smear where it walks that other Gwulhorlw bodies heal in. | *Tumour*: swells as it feeds; bursts into a rot pool when killed, bigger the fuller it is. | **Built**: bloated, 0.8× speed, 1.4× health, leaves a 3 s rot pool where it dies. | **Built**: heals its pack 2% a second. Designed: pack members struck near it spread one disease stack back to you. | **Built**: pulses a 150 px rot pool every 4 s. Designed: every third pulse raises two bloaters from the pool. |
| **The Bottomless** coveting | *Hand*: fastest minion; steals a fresh orb from inside your pickup radius once before fleeing. | *Mouth*: feeds twice as fast but spills nothing; what it eats is gone. | *Suitor*: a telegraphed tentacle lash (120 px line) that pulls you 60 px toward it. | *Chaperone*: members within its radius cannot be enthralled; it releases your thralls that touch it. | *The Bride*: slow pull on you within 380 px; every 6 s a 1 s wound where you stand. Cannot be enthralled. |
| **The Ninth Swarm** locusts | *Drone*: half size, half health, twice as many per birth; eats orbs in a flock. | *Hopper*: bleeds a town in short frenzied bursts, then rests; spills in bursts. | *Flock*: erratic flight path (sinusoidal), weaves rather than charges; cheap, many. | *Queen*: births two drones every 5 s while the pack hunts; pack moves 15% faster. | *The Sphere*: a rolling ball of locusts that chases you slowly and sheds flocks; its body is the swarm, so it shrinks as grunts die. |
| **Hueilei** blood | *Tithe-runner*: carries double gullet; bleeds (takes damage) while moving, so it hurries home. | *Flayer*: bleeds a town fast and spills ripe-looking (bright) orbs that heal you more. | **Built**: charge along a shown line, 1.8×, stops on contact. Leader calls charges together. | **Built**: calls a charge every 5 s. Designed: members that hit you heal the leader. | *The Arena*: charges 420 px at 2.2×; every third charge is a slam that bleeds you (damage over 3 s). |
| **The Cinder Jarl** fire | *Ember*: leaves a short fire trail when fleeing. | *Brand*: sets the town's lots burning as it feeds; a burning town spills fire patches that hurt you. | *Thrall of the forge*: armoured (0.6× damage taken from the front), burns briefly where it dies. | *Hearth-thane*: pack members within radius are immune to burn and 20% faster; it ignites on death. | *The Sword*: a slam (130 px) with a fire field; every slam leaves a burning line toward you. |
| **The Woken Star** radiance | *Mote*: glows; orbs it carries are visible from further off (easier to chase). | *Glare*: feeds from range (does not enter the town); stands in the open, easy to hit, slow. | *Comet*: lobs a slow radiant shot (telegraphed landing circle) every 4 s from 400 px. | *Corona*: pulls the pack together (tight formation) and reflects 20% of damage to its members back at you as radiation stacks. | *The Shrine*: a gravity pull on you within 380 px and a 110 px wound every 5 s; blinks 110 px away when struck hard. |
| **Ik'Thel'The** geometry | *Point*: moves in straight segments, turning at right angles; fast, hard to predict. | *Edge*: bleeds along a line through the town, spilling orbs in a row. | **Built**: dashes the length of a ray through where you stood, 1.6×, stunned 1 s after. | **Built**: triangular formation. Designed: pack dashes in sequence one vertex at a time. | *The Object*: three ray telegraphs through you, fired in sequence; blinks after each volley. |
| **First Blasphemy** the word | *Letter*: carries blood as a glyph; three of them together form a word that shields nearby minions. | *Gloss*: writes on the town's lots; written lots spill nothing and bleed 30% faster. | *Scribe*: places a trap sigil where it stood when struck, armed after 0.8 s. | *Lector*: marks you every 7 s; three delayed wounds follow your path. | *The Obelisk*: stationary; every 4 s writes three traps around you; pulls you 40 px toward it while you stand on a trap. |
| **The Pale Ossuary** bone | *Knuckle*: tiny; when killed, leaves a bone that a Sexton can raise. | *Jaw*: cracks the town's lots; a cracked lot stays spent even after regrowth. | *Pallbearer*: splits into two half-health knuckles when killed. | *Sexton*: raises a grunt from any grave within 200 px every 6 s. | *The Tower*: shielded while four or more Ossuary bodies stand within 200 px; slams (140 px) and raises two grunts from the slam. |

Rules that hold for every row: chain depth alone sets stage and strength; minions never feed at towns; siegers never hunt unless the world is eaten or their seat is struck; a pack that loses its leader hunts loose for 15 s and then eats; titans cannot be enthralled and drop a pledge token and 60 blood.

## Priests (greater demons)

Each god keeps three. Within a god they differ in how they relate to the horde: one **commands** it (formations, calls), one **consumes** it (absorbs, sacrifices, raises), one **fights in front of it** (dash, slam, blink, volley). Between gods the same mechanic is coloured by the god's weapon. Killing one banishes it for 90 s, growing 50% longer each time; it comes back with a grudge (+25% health per banishment, caps at 4) and hunts you from further off. Grudges are saved in the browser (`rot-priests-v1`) across runs. Half its bank spills where it fell; a pledge token always comes out of it. All 27 are **built** in `priests.js` from shared primitives; names are placeholders.

| God | Name | Relation | Signature | Passive / note |
|---|---|---|---|---|
| Gwulhorlw | Mother Vellum, the Lesion | consumes | **Raise**: every 9 s raises up to 5 bloaters from the graves of Gwulhorlw bodies within 600 px, as her pack. | Leaves a rot wound every 1.2 s as she walks. Keeps 260 px from you. |
| Gwulhorlw | Oswin Pallid, the Lung | fights | **Slam**: 0.8 s ring telegraph, 150 px, 2.2× damage, knockback, rot pool. | Shielded (0.3× damage) while three of his own stand within 200 px. |
| Gwulhorlw | The Choirless Brother | consumes | **Absorb**: drags his own servants into himself (heals 5%, grows); at four eaten, a slam whose size and damage scale with the count. | A rot pool under him that grows with what he has eaten. |
| The Bottomless | Lady Whist, the Unanswered | fights | **Pull**: draws you toward her at 85 px/s within 420 px while praying the old wound. | Keeps 300 px: you cannot leave, you cannot reach. |
| The Bottomless | Caddis, of the Many Hands | commands | **Encircle**: her pack forms a ring around *you* that closes from 270 px to 110 px over four seconds, then takes hold for three. | Summons six if her pack falls below four. |
| The Bottomless | The Bride Enough | consumes | **Sacrifice**: every 6 s three of her own become hysterical screams, 90 px wounds around you. | Keeps 280 px. |
| The Ninth Swarm | Thrum, the Unceasing | commands | **Summon**: six grunts every 7 s, as its pack. | Keeps 300 px. |
| The Ninth Swarm | The Hundredth Mouth | consumes | **Absorb** then **slam** (130 px). | |
| The Ninth Swarm | Sister Harrow, of the Chitin Veil | fights | **Volley**: seven fast locust shots in a 0.9 rad fan every 3.2 s. | Keeps 340 px. |
| Hueilei | Arrax, the Debtor | fights | **Dash**: 380 px charge at 2× that heals him 12% when it lands. | |
| Hueilei | Pale Ilse, Bloodwarden | consumes | **Sacrifice**: bleeds two of her own every 5 s to heal 8% each and gain +15% contact damage for 10 s, stacking to 1.45×. | |
| Hueilei | The Red Tally | commands | **Line**: her pack forms a line abreast and charges with her every 7 s. | Keeps 260 px between charges. |
| The Cinder Jarl | Brenna Ash, the Hearthwife | fights | **Slam** (130 px) leaving a fire field. | |
| The Cinder Jarl | Ulf Half-Burnt | fights (front) | **Dash** 460 px leaving a trail of fire patches. | |
| The Cinder Jarl | The Kindling Choir | consumes | **Sacrifice**: three of its own become burning embers that fly at you and leave fire where they land. | Keeps 300 px. |
| The Woken Star | Sol Minora | fights | **Volley**: three slow radiant shots that leave radiation fields where they end. | Keeps 360 px. |
| The Woken Star | The Eclipse Vicar | commands (you) | **Pull** at 70 px/s within 380 px, and a 110 px gravity wound on you every 5 s. | Keeps 300 px. |
| The Woken Star | Perihelion Hest | fights | **Blink** to 110 px from you, then **slam** (120 px) with a radiant field. | |
| Ik'Thel'The | The Theorem | fights | **Dash** 520 px, three times in sequence, re-aimed each time. | |
| Ik'Thel'The | Quiet Axiom | commands | **Tessellate**: its pack holds a rotating triangle around you and members dash through you from the vertices. | Keeps 300 px. |
| Ik'Thel'The | The Second Proof | fights | **Blink**, then three telegraphed rays through you (0.7 s), 1.8×. | |
| First Blasphemy | Lector Umbrage | fights | **Trap**: three sigils around you every 4 s, armed after 0.8 s. | Keeps 320 px. |
| First Blasphemy | The Unspoken Gloss | commands (you) | **Curse**: marks you; three wounds follow where you stand at 0.8 s intervals. | Keeps 340 px. |
| First Blasphemy | Scrivener Null | consumes | **Sacrifice**: two of its own become trap sigils near you. | Keeps 300 px. |
| The Pale Ossuary | The Sexton | consumes | **Raise**: six grunts from Ossuary graves every 8 s. | Keeps 280 px. |
| The Pale Ossuary | Ossa, the Grandmother | consumes | **Absorb** then **slam** (140 px). | |
| The Pale Ossuary | Pallbearer Thane | commands | **Procession**: pallbearers circle him; summons four when fewer remain. | Shielded while three of his own stand within 200 px. |

Shared primitives in `priests.js`: `dash` (reuses the grunt charge), `slam`, `blink`, `volley`, `rays`, `trap`, `curse`, `pull`, `summon`, `raise`, `absorb`, `sacrifice` (modes scream / heal / ember / sigil), and the formation orders `encircle`, `tessellate`, `line`, `procession`. Adding a priest is one line of data; adding a new manner is one primitive.
