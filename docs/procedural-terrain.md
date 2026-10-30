# Procedural world

Open `prototype.html` with the project's JavaScript and CSS files, `assets/`, and `tilemaps/` beside it. No server or build is required. Original asset packs are untouched. See `campaign-rules.md` for run rules, patron loadouts, player stats, and weapon transformations.

## Art and regions

`world-assets.js` maps source atlas cells and sprite files to named materials. Source tiles are 32 pixels; the world uses 64-pixel logical cells composed of four source tiles. Filtered swatches are prepared once rather than applying expensive image filters while playing.

The generator uses one selected pair of broad, noise-warped biomes: grassland/deadwood, snow/rock, or dunes/volcanic wastes. It no longer mixes all six in every world. Grass Land supplies matching water and transparent shoreline banks; Volcano supplies lava. Eight-neighbor quadrant selection draws straight banks, outer corners, and concave corners over the underlying dry biome. Land and lava borders use authored transparent grass silhouettes as texture masks, with one material owning each border to avoid double blending. Wooden bridge decks keep their straight edges. Roads are rasterized into the same grid; water and lava crossings use a Highlands wooden deck. The minimap displays the actual biome and obstacle map.

The Village supplies houses. Desert tents replace the drawn camp triangles, and the Grass Land well replaces the drawn ellipse. Trees and rocks are placed from the collision cells. Buildings fade when their upper artwork obscures the player. Depleted houses become blocked rubble. Gameplay indicators, god-seat glyphs, combat effects and the placeholder actors still use the existing canvas renderer.

## Layout and economy

The playable radius remains 6,500 pixels, with nine camps on a 5,400-pixel ring and fourteen settlements. Nine towns are 1,100 pixels inward from their camps; five occupy the interior. Town centers are at least 1,400 pixels apart. The connected road graph links all locations and includes a few loops. Each town contains twelve housing lots, crossroads, side streets, a square and a well. No forest or lake is allowed to cut the reserved road network.

The previous economy tuning remains: carrier capacity 20/60/180 and influence radius `330 + 48 × sqrt(blood)`. Factions grow by harvesting finite towns, returning blood and mustering. There is no distance-based stat bonus or new source of blood. Displayed walking times are straight-line lower bounds, marked ≥; obstacles and combat can lengthen them.

## Collision and movement

Forests, rocks, water, lava, buildings, camp tents and wells now block movement. Roads, bridges and open ground remain walkable. A flood-fill closes isolated pockets, and spawns and blood drops are placed in reachable open space.

`world-navigation.js` provides circle-versus-cell collision with short swept steps and sliding. Player motion, servants, rival priests, converted servants, summoned minions, separation pushes and gravity pulls use it. Large actors use a terrain footprint capped at 24 pixels so they fit a one-cell passage. Sprites can extend above their ground footprint. Magic projectiles/effects retain their existing ability to reach across terrain; water and lava are barriers rather than damage-over-time hazards in this pass.

Enemies share reverse BFS distance fields for destinations. Direct clear approaches bypass the search. At most one field is built per update, and at most 32 are cached; static terrain does not require per-enemy full-map searches. Depleted lots remain rubble, so navigation stays valid as towns empty.

## Performance and extension

Rendering builds at most one visible 512-pixel chunk per frame, with an LRU limit of 64 (about 64 MiB of pixel storage before browser overhead). A small overview gives immediate ground colors while details fill in. Asset completion invalidates cached fallback chunks. Source loading failures are recorded in `WorldAssets.errors`.

`S.terrain.seed` reproduces terrain for the same landmark positions. It is not a whole-game replay seed; the existing town layout and combat randomness are separate.

Add atlas entries/sprites in `world-assets.js`, biome and placement rules in `terrain.js`, and movement behavior in `world-navigation.js`. Enemy art and blessings can still be developed independently in the existing actor and card systems.

## Verification

Tests use Playwright with Edge; set `PLAYWRIGHT_MODULE` if its package is elsewhere.

- `node tests/biomes-navigation.cjs`: checks source art loading, selected biome pairs and water, connectivity across twelve terrain seeds, swept collision, and an actor routing around a lake; saves biome previews.
- `node tests/world-scale.cjs`: checks thirty world layouts, simulates five minutes of harvesting, and verifies all nine camps can accumulate stores; saves town/camp previews.
- `node tests/terrain-performance.cjs`: measures startup, movement and updates with hundreds of actors, and checks actors remain outside solid terrain.
- `node tests/terrain-transitions.cjs`: checks bank loading, chunk completion, and rendering without terrain mutation; saves a controlled lake, biome, and road preview.
- `node tests/terrain-smoke.cjs`: road determinism, cache bounds, desktop/mobile rendering and browser errors.

These tests verify functional behavior and basic responsiveness, not final balance or target-device performance.

