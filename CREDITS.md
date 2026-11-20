# Model credits

Every model in `models/` is released under **CC0 1.0** (public domain): free for any use, no attribution
required. Credit is given here anyway.

## Critters

All 151 critters are generated in code from the parts lists in `critters/critters_*.js` (format in `critters/kit.js`).
They are original designs; no model files are used for them. The Quaternius creature models used in an earlier
version have been removed.

## Scenery and items — Kenney

Author: Kenney (https://kenney.nl). CC0 1.0. Downloaded from a third-party GitHub mirror of Kenney's packs
(https://github.com/ETdoFresh/kenney.nl), which holds 2020 versions; newer versions are on kenney.nl.
Files are in `models/kenney/`.

| Folder | Kenney pack |
|---|---|
| nature | Nature Kit 2.1 |
| food | Food Kit 1.2 |
| furniture | Furniture Kit |
| town | Fantasy Town Kit 1.0 |
| hex | Hexagon Kit |
| graveyard | Graveyard Kit |

## Also generated in code

The ball, the trainer, houses, coins, boots, buckets, mailboxes, hay bales and the picnic blanket are built
from simple shapes in `main.js`, as is the fallback shape for any item whose model fails to load.

## Data

Species categories, types and heights in `critters/slots.json` come from the open PokéAPI data set
(https://github.com/PokeAPI/pokeapi). They are facts used to size and classify the stand-ins.

## Added 19 November 2026

More Kenney packs (all CC0 1.0, downloaded from kenney.nl) are in `models/kenney/`: Holiday, Pirate, Castle, Survival,
City Kit Industrial, Factory, Space, Platformer, Mini Arena and Mini Shop, plus fuller copies of Nature, Graveyard,
Fantasy Town and Food. The pack versions, the download pages and the file counts are in `models/CREDITS-additions.md`;
every model is listed in `models/INVENTORY.md`.

The props of the Crossway Continent map (about 380 kinds: snowmen, pylons, cacti, gravestones, beach huts and so on) do
not use these models yet. They are built from simple shapes in `habitats/*.js`, in the same style as the critters.
The new packs are there to swap in where a model is wanted: give an item in a habitat file a `model:` path.
