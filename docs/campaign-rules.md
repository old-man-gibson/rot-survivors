# Campaign rules — playable pre-alpha

Choose a patron, then a world and level. Each world uses a compatible pair of terrain biomes; roads, bridges, towns and camps retain their shared tiles. Levels increase enemy and seat health and enemy damage by 25% per level. A victory unlocks the next level, up to 20 for this prototype.

## Domination

The patron and its two wheel-neighbors form the player's coalition. The other six gods form two disjoint triplets. Coalition membership is independent of physical camp placement. Automatic weapons cannot harm allies. Enemy camp destruction creates neither allied wrath nor patron heresy in normal mode. To betray a particular ally, stand within 180 pixels of its seat and press F or Challenge allied seat three times within 12 seconds, at least 0.75 seconds apart. The first two challenges warn you; the third breaks that god's protection and removes its blood from coalition control.

Control means actual blood held by the coalition: seats, living servants, rival priests, blood offered at the altar, and the player's unspent raw blood. The denominator is the world's original blood supply. Towns and loose blood remain unclaimed; currency bonuses do not create world control. Spending transfers the proportional raw part of the bank into the recipient god's offerings, without counting it twice. Destroyed seats take their offerings out of circulation.

Reaching 45% commits to three desperation waves even if control subsequently falls:

1. One randomly selected enemy coalition.
2. The other enemy coalition.
3. Both coalitions in an all-out rush. Hostile enemy gods still fight on contact.

Existing units of the attacking coalition join its wave. Reinforcements funded by surviving bases enter around the battlefield on valid terrain, at least 950 pixels away. If the actor cap is crowded, inactive troops retire their carried blood to their seats to reserve 96 assault slots; retirement produces no rewards. Regular spawning pauses during the finale. Clear every wave attacker; twelve seconds separate waves. Destroying a camp cancels its unspawned reinforcements, not its existing troops.

Assault troops pursue the player within 1,200 pixels. Otherwise they attack the patron's seat, falling back to surviving allied seats, then the player if none remain. Distant assault troops travel faster beyond 1,600 pixels. Once reinforcements are exhausted and twelve or fewer attackers remain, survivors pursue the player and a hunt marker points to the nearest. Seats have health and regenerate out of combat. Base loss is a setback, not an automatic defeat. Player death loses the run; clearing the third wave wins.

## The horde

Every servant has a kind, a role and a stage. Kind is the body and never changes; role is what it is doing now (eat, hunt, return, guard); stage is still chain depth alone. `horde.js` holds the kinds and their rules.

- **Minions** gather blood off the ground and carry it home. They sense orbs at 420 px, never feed at towns, and flee the priest. A struck minion runs rather than turning.
- **Siegers** bleed towns. Each counts as two mouths and spills 55% of every bite instead of 35%, so a sieged town is a blood pile. A struck sieger keeps feeding.
- **Grunts** fight. Hueilei's charge along a shown line after a half-second wind-up and stop on contact at 1.8× damage. Ik'Thel'The's dash the length of a ray through where you stood, carry on past, deal 1.6×, then stand stunned for a second. Gwulhorlw's are slower and tougher and leave a three-second rot pool where they die that burns the priest. Other gods' grunts are plain for now.
- **Leaders** hold a pack. Members hold formation slots on the leader (triangular for Ik'Thel'The) until the priest is within 300 px, then break and rush. Every half second the leader decides: hunt if the priest is within 620 px or it was alarmed in the last 20 s; otherwise fight its god's war if an enemy is near; otherwise roam toward the live town nearest the priest, and go home after 45 s without a sighting. Hueilei's leader calls a synchronised charge; Gwulhorlw's heals its pack 2% a second. A leader has 20× grunt health and stands at the back. When it dies the pack loses its shape, not its hunger: members hunt loose for 15 s, then drift off to eat.
- **Titans** rise at a seat holding 320 blood or more, from minute two, one per god, and guard it within 420 px. They engage when the priest is within 480 px or the seat is being struck, and carry 60 blood that spills when they fall, along with a pledge token. Gwulhorlw's titan pulses a 150 px rot pool; the other two use their grunts' moves at 1.6× reach. Titans cannot be enthralled.

Blood harvested from an orb now heals 0.4 health per unit (`bloodHeal`); a town's slow bleed does not. Once packs landed, a god without Hueilei's lifesteal had 100 health and no way back, and walking to blood on the ground had no reason behind it.

Nothing hunts alone. The hostile share of a god's births gathers into a pack of 4 plus one per point of wrath, and every host is one leader per 14 bodies. Packs enter 160 px beyond the visible edge, from the seat's direction when the seat is out of view, spread along an arc; a host's successive flanks fan out to either side until the last come from behind. Eaters are still born at seats.

Measured with the scripted bot (walks to the nearest live town, spends everything, flees only when swarmed below half health): before this change a rank-8 priest took 0 to 4 hits in any two-minute window and no host body ever came within 600 px. After it, the Hueilei bot was at 44 health by 2:00 and had fled; the Ik'Thel'The bot, which never dodges a telegraph, was at 9 health by 4:00 and died at 2:02 in a later run, which is why hosts were cut from 10 + 5 per wrath to 8 + 4.

## Rival priests

Rival priests are greater demons: killing one banishes it rather than ending it. Each god keeps three (`priests.js`, roster and signatures in `horde-roster.md`), and the angriest god that still has one available sends it, every 75 seconds, up to three alive. A banished priest spills half of its bank where it fell as a marked orb, sends the other half home, gives up a pledge token, and returns after 90 seconds, 50% longer each time, with a grudge: +25% health per banishment (capped at four) and a hunting range that grows with it. Grudges persist in `rot-priests-v1` in the browser, so a priest banished in earlier runs arrives already holding one. The old prayed wound is now only Lady Whist's; every other priest has its own signature, and the three of a god differ in whether they command the horde beneath them, consume it, or fight in front of it.

## Extermination and the Heretic

Select the Extermination checkbox before choosing a world to pursue the alternate ending. Your two neighboring gods are enemies on this route. The patron remains protected until all eight other camps are destroyed. It then demands your blood, turns its servants against you and musters an 80-unit host. Destroy its camp while surviving to complete that patron's rite.

Complete this with **all nine patrons** to unlock the Heretic. The Heretic has no allies, no patron-distance price premium, and begins with the existing void weapon as a stolen starter ability. All nine camps can be attacked immediately. This starter weapon is a provisional implementation choice, not a finalized Heretic blessing design.

Progress uses browser localStorage (`rot-campaign-v1`). File previews can have browser-specific storage behavior; keep using the same browser and file location. A failed save is reported on the victory screen.

## Balance and verification

Nine home towns each start with 1,500 blood; five smaller interior towns have 400 each. Equal home supplies and per-god civilian capacity keep the starting economy symmetric without redistributing earned blood. War, travel and terrain still create variation. Claimed-blood shares differ from shares of the whole world while blood remains in towns or on the ground.

Twenty minutes is a tuning target, not a scripted victory time. Idle simulations currently do not trigger the player's finale, but faction shares still drift. The exact one-third equilibrium and involved-player completion time need further playtesting; neither is guaranteed by these tests.

Run `node tests/campaign.cjs` for patron/world selection, coalition membership, bonus accounting, base damage, wave order, victory/death, betrayal, nine patron rites and Heretic rules. `node tests/campaign-balance.cjs` simulates twenty unattended minutes per world. Existing terrain tests cover connectivity, collision and performance. Browser tests use Playwright and Edge; set `PLAYWRIGHT_MODULE` if needed.

## Armaments, revelations, and presentation

The sanctuary offers New revelation, Codex, Grimoire, and Exit. Exit provides a close-tab screen, since an ordinary browser page cannot reliably close its own window. The Grimoire previews run upgrades rather than selling permanent stats.

Each god offers two armaments. Before the run, choose your main armament and either both patron weapons or one weapon plus a free opening revelation. The companion weapon has its own cooldown, shares god upgrades, and costs no extra pledge slot. Later pledges offer one weapon choice. A run permits three pledged gods, including the starter. Each has sixteen ranks with one upgrade per rank after the first. Rank 4 forces an exclusive doctrine; rank 12 offers fidelity (deepen the existing attack) or metamorphosis (replace the main attack pattern). A patron companion retains its original form. There are 19-20 cards per god, so one run cannot collect the whole tree. Core weapon rank scaling caps at eight. Prices gain a 22% per-rank multiplier after rank five in addition to the existing economy formula. Tuning changes from upgrades reset every new run.

Gwulhorlw offers a disease aura or targeted lobbed seed pods. Pods converge on a lone target or divide across nearby enemies, tracking their assigned target and planting disease fields on landing. The Bottomless offers enthrallment or a hysterical chorus, with longer devotion or release-scream doctrines. Ik'Thel'The offers a piercing ray or a rotating recursive lattice, with mirrored recursion or lossless piercing. Other alternatives include a brood halo, bleeding needle, funeral pyre, binary suns, paired seals, and circling pallbearers. The Grimoire lists precise effects and tradeoffs.

Faction creatures and seat manifestations use trimmed animations from the bundled packs. Source paths and frame sizes are recorded in `assets/actors/sources.json`; `tools/prepare-actors.py` rebuilds the derived sheets. These reuse pack assets rather than bespoke deity portraits.

Additional verification:

- `node tests/revelations.cjs`: menus, mobile cards, alternate attacks, direct betrayal, pledge limits, and finale rally.
- `node tests/thematic-combat.cjs`: disease spread, seduction, hysterical release, bleeding, lossless piercing, repeat seals, complete upgrade paths, and per-run tuning reset.
- `node tests/projectile-targeting.cjs`: all pods hit a moving lone target, crowd targeting, dead-target landing, and ally protection.

The new progression and finale pacing still need full-run playtesting; these checks establish behavior, not a guaranteed completion time.

## Player stats and distinct builds

The HUD prioritizes health, global damage, movement speed, and measured recent DPS; world information is under a collapsible heading. Press C or Your build to pause and inspect health, regeneration, hit immunity, pickup radius, active mitigation, total damage, weapon damage per hit, actual cast intervals, and acquired upgrades. Enemy-dependent damage bonuses and condition ticks are described separately. Damage tracking excludes overkill and faction attacks.

Each god now has ten individually authored additional blessings and unique ascensions instead of a duplicated stat deck. These include contact contagion, protection from enthralled servants, homing locusts, low-health blood mechanics, fire tick timing, radiation resistance penetration, wider or parallel rays, borrowed-word cooldown refunds, and kill-triggered seekers.

Metamorphoses include a 320-unit expanding/contracting plague pulse (one hit per direction), a hysterical lure, a returning swarm cloud, blood tethers, sequential eruptions, a roaming gravity core, a triangular ray lattice, six drifting destructive letters, and secondary arcing bone explosions. Arc fragments cannot recursively spawn more fragments. Letter executions and bleeding executions exclude bosses and seats. Enemy health, blood-stage scaling, and priest damage tuning are unchanged.

Verification: `node tests/build-depth.cjs` covers all patron loadouts, free-upgrade paths, transformations, stats arithmetic, and desktop/mobile sheets. `node tests/upgrade-hooks.cjs` checks hooks for all nine gods and simulates a dense fight. `node tests/metamorph-previews.cjs` saves in-game effect previews.
