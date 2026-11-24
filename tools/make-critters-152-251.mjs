// Writes the stand-in critters for slots 152-251: critters/critters_4.js and critters/critters_5.js, and adds the
// slots themselves to critters/slots.json.  Run from the project folder:  node tools/make-critters-152-251.mjs
//
// The facts (species category, types, height) are from the open PokeAPI data set, as for the first 151; Fairy is
// left out because it did not exist yet, and Dark and Steel are in because they did. Everything else here is
// original: the names, and the looks, which are put together from a dozen body plans and a kit of ears, tails,
// horns and so on in colours of our own choosing. They are not drawings of their counterparts.
import fs from 'node:fs';

// dex | official | category | types | height
const FACTS = `152|Chikorita|Leaf|grass|0.9
153|Bayleef|Leaf|grass|1.2
154|Meganium|Herb|grass|1.8
155|Cyndaquil|Fire Mouse|fire|0.5
156|Quilava|Volcano|fire|0.9
157|Typhlosion|Volcano|fire|1.7
158|Totodile|Big Jaw|water|0.6
159|Croconaw|Big Jaw|water|1.1
160|Feraligatr|Big Jaw|water|2.3
161|Sentret|Scout|normal|0.8
162|Furret|Long Body|normal|1.8
163|Hoothoot|Owl|normal,flying|0.7
164|Noctowl|Owl|normal,flying|1.6
165|Ledyba|Five Star|bug,flying|1.0
166|Ledian|Five Star|bug,flying|1.4
167|Spinarak|String Spit|bug,poison|0.5
168|Ariados|Long Leg|bug,poison|1.1
169|Crobat|Bat|poison,flying|1.8
170|Chinchou|Angler|water,electric|0.5
171|Lanturn|Light|water,electric|1.2
172|Pichu|Tiny Mouse|electric|0.3
173|Cleffa|Star Shape|normal|0.3
174|Igglybuff|Balloon|normal|0.3
175|Togepi|Spike Ball|normal|0.3
176|Togetic|Happiness|normal,flying|0.6
177|Natu|Tiny Bird|psychic,flying|0.2
178|Xatu|Mystic|psychic,flying|1.5
179|Mareep|Wool|electric|0.6
180|Flaaffy|Wool|electric|0.8
181|Ampharos|Light|electric|1.4
182|Bellossom|Flower|grass|0.4
183|Marill|Aqua Mouse|water|0.4
184|Azumarill|Aqua Rabbit|water|0.8
185|Sudowoodo|Imitation|rock|1.2
186|Politoed|Frog|water|1.1
187|Hoppip|Cottonweed|grass,flying|0.4
188|Skiploom|Cottonweed|grass,flying|0.6
189|Jumpluff|Cottonweed|grass,flying|0.8
190|Aipom|Long Tail|normal|0.8
191|Sunkern|Seed|grass|0.3
192|Sunflora|Sun|grass|0.8
193|Yanma|Clear Wing|bug,flying|1.2
194|Wooper|Water Fish|water,ground|0.4
195|Quagsire|Water Fish|water,ground|1.4
196|Espeon|Sun|psychic|0.9
197|Umbreon|Moonlight|dark|1.0
198|Murkrow|Darkness|dark,flying|0.5
199|Slowking|Royal|water,psychic|2.0
200|Misdreavus|Screech|ghost|0.7
201|Unown|Symbol|psychic|0.5
202|Wobbuffet|Patient|psychic|1.3
203|Girafarig|Long Neck|normal,psychic|1.5
204|Pineco|Bagworm|bug|0.6
205|Forretress|Bagworm|bug,steel|1.2
206|Dunsparce|Land Snake|normal|1.5
207|Gligar|Fly Scorpion|ground,flying|1.1
208|Steelix|Iron Snake|steel,ground|9.2
209|Snubbull|Fairy|normal|0.6
210|Granbull|Fairy|normal|1.4
211|Qwilfish|Balloon|water,poison|0.5
212|Scizor|Pincer|bug,steel|1.8
213|Shuckle|Mold|bug,rock|0.6
214|Heracross|Single Horn|bug,fighting|1.5
215|Sneasel|Sharp Claw|dark,ice|0.9
216|Teddiursa|Little Bear|normal|0.6
217|Ursaring|Hibernator|normal|1.8
218|Slugma|Lava|fire|0.7
219|Magcargo|Lava|fire,rock|0.8
220|Swinub|Pig|ice,ground|0.4
221|Piloswine|Swine|ice,ground|1.1
222|Corsola|Coral|water,rock|0.6
223|Remoraid|Jet|water|0.6
224|Octillery|Jet|water|0.9
225|Delibird|Delivery|ice,flying|0.9
226|Mantine|Kite|water,flying|2.1
227|Skarmory|Armor Bird|steel,flying|1.7
228|Houndour|Dark|dark,fire|0.6
229|Houndoom|Dark|dark,fire|1.4
230|Kingdra|Dragon|water,dragon|1.8
231|Phanpy|Long Nose|ground|0.5
232|Donphan|Armor|ground|1.1
233|Porygon2|Virtual|normal|0.6
234|Stantler|Big Horn|normal|1.4
235|Smeargle|Painter|normal|1.2
236|Tyrogue|Scuffle|fighting|0.7
237|Hitmontop|Handstand|fighting|1.4
238|Smoochum|Kiss|ice,psychic|0.4
239|Elekid|Electric|electric|0.6
240|Magby|Live Coal|fire|0.7
241|Miltank|Milk Cow|normal|1.2
242|Blissey|Happiness|normal|1.5
243|Raikou|Thunder|electric|1.9
244|Entei|Volcano|fire|2.1
245|Suicune|Aurora|water|2.0
246|Larvitar|Rock Skin|rock,ground|0.6
247|Pupitar|Hard Shell|rock,ground|1.2
248|Tyranitar|Armor|rock,dark|2.0
249|Lugia|Diving|psychic,flying|5.2
250|Ho-Oh|Rainbow|fire,flying|3.8
251|Celebi|Time Travel|psychic,grass|0.6`;

// dex | name | habitat | rarity | move | temper | body plan | three colours | extras
const LOOKS = `152|Sprigling|forest|common|walk|timid|quad|8fc46a b7e08a 4f8a3a|lf tp
153|Frondeer|forest|uncommon|walk|calm|quad|9ccf6f 5f9a44 e8d98a|lf mn tl
154|Bloomantle|plain|rare|walk|calm|quad|a8d47a e58aa8 f4e39a|mn h2 tl bl
155|Emberquill|volcano|common|walk|timid|quad|3d4f6e f0d9a0 f2743a|sp ep bl
156|Cinderback|volcano|uncommon|walk|bold|quad|34466a f3dfae ff8a2a|sp ep tfm bl
157|Blazebrow|volcano|rare|walk|bold|biped|2f3f63 f1dca6 ff6a1f|mn sp ep bl
158|Snaplet|marsh|common|walk|bold|biped|4aa3c8 f0e2a8 d85a4a|sp tn bl
159|Chompadile|marsh|uncommon|walk|bold|biped|3f93bd efe0a0 c94f40|cr tn bl sp
160|Gulpgator|gorge|rare|walk|bold|biped|3884b0 ecdc98 b8463a|cr sp tl bl tk
161|Peeklet|plain|common|hop|curious|biped|a9744a f0dcb4 6a4630|er tp bl rg
162|Longlope|plain|uncommon|walk|curious|serpent|c79a62 f3e2bd 6f4a30|er tp
163|Tickhoot|forest|common|hop|calm|bird|a8794f f2deb0 d6503c|tf bl
164|Duskowl|forest|rare|fly|calm|bird|7d5a3c e9d3a2 c9a646|h2 bl wg
165|Dotwing|farm|common|fly|timid|bug|e25a45 f6efdc 2d2d3a|wg tf
166|Starshell|plain|uncommon|fly|curious|bug|d94a3c f8f2e0 30303e|wg h2 bl
167|Threadling|forest|common|walk|timid|bug|8fc94a f0e060 5a3a7a|hn
168|Stiltweaver|forest|uncommon|walk|bold|bug|c9463a e8c84a 4a2f6a|hn sp
169|Quadflit|gorge|rare|fly|bold|bird|8a5ab8 5ac0c8 f0d040|ep wg tn
170|Glimfin|sea|common|swim|timid|fish|3f7fd0 ffe04a f2f2f2|lr bl
171|Lampray|sea|uncommon|swim|calm|fish|2f6fc0 ffd83a f6f6f6|lr bl tn
172|Sparklet|plain|uncommon|hop|curious|blob|f3e37a 2d2d2d f08a8a|ep tn
173|Twinklet|ruins|uncommon|float|curious|blob|f6c6d0 9a6a4a fff2c8|ep tf
174|Bubblun|town|uncommon|float|curious|blob|f7b8c8 f04a6a ffffff|tf
175|Shellbud|town|uncommon|walk|timid|blob|fbf4dc e25a4a 4a8ae0|sp
176|Gladwing|summit|rare|float|calm|biped|fdf8ea e0584a 4a86de|wg sp bl
177|Pipnod|ruins|common|hop|calm|bird|6fbf5a f0d040 d8483c|tf
178|Totemwing|ruins|rare|still|calm|bird|5fae52 f6f6f0 d8483c|cr wg bl
179|Fleecelet|farm|common|walk|timid|quad|3a5a9a f6f0d6 f0c83a|pf to
180|Woolspark|farm|uncommon|walk|calm|biped|f2a6b8 fbf6e6 3a4f8a|pf to ep
181|Beaconeck|mountain|rare|walk|calm|biped|f2d24a fbf6e6 d8483c|to hn bl
182|Petalance|farm|rare|hop|curious|plant|8fcf5a e0483a f6d84a|bl
183|Plipmouse|tidepool|common|hop|curious|blob|4a8ae0 f6f6f6 2f5fb0|er to bl
184|Bubblear|beach|uncommon|hop|bold|blob|4f90e4 f8f8f8 2c58a8|el to bl
185|Fauxbark|canyon|uncommon|still|calm|rocky|9a6f48 6fb04a 5a3f2a|lf h2
186|Croakrown|marsh|rare|hop|bold|blob|5fbf5a f2e27a e0584a|cr bl
187|Puffseed|plain|common|float|timid|plant|f2a0b8 6fbf5a f8e87a|ep
188|Whirlbud|plain|uncommon|float|curious|plant|8fd06a f6e04a e0a03a|ep
189|Driftuft|summit|rare|float|calm|plant|6f9fe0 fbfbf2 e06a6a|pf
190|Graspail|forest|uncommon|hop|curious|biped|9a62b8 f2dcb4 6a3f8a|er tl bl
191|Kernlet|farm|common|hop|timid|plant|f2dc5a 4f8a3a 6a4a2a|lf
192|Solbloom|farm|uncommon|walk|calm|plant|6fbf5a f6d23a f2a03a|mn
193|Glasswing|marsh|uncommon|fly|bold|bug|d8483c 8fd06a e8f6f8|wg tl
194|Mudlet|marsh|common|walk|calm|blob|6fb0e0 a070c0 f0f0f0|tn h2
195|Bogbroad|marsh|uncommon|walk|calm|biped|6aa8d8 8a5fb0 f2f2f2|tn bl
196|Sunfork|ruins|rare|walk|calm|quad|d8a0d8 f0e8f8 e0483a|el tl
197|Ringshade|ruins|rare|walk|bold|quad|2c2c36 f2d84a d8483c|el tl rg
198|Hatcrow|town|common|fly|curious|bird|2f3348 f0d040 d8483c|cr wg
199|Crownsage|tidepool|rare|walk|calm|biped|f2a6b0 fbf2dc d8483c|sh hn bl tl
200|Wailwisp|ruins|uncommon|float|curious|ghost|3f6a78 e06a8a f0e04a|tf rg
201|Glyphlet|ruins|common|float|calm|ghost|2c2c36 f6f6f6 6a6a7a|rg hn
202|Bluffbag|canyon|uncommon|still|calm|blob|5fb0e8 2c2c36 f6f6f6|tl
203|Twintail|plain|uncommon|walk|curious|quad|f2c84a 6a4a3a f6a0b8|h2 mn to
204|Conelet|forest|common|still|calm|rocky|4f8a8a 2f5f5f e0483a|sp
205|Bastionut|forest|rare|still|bold|shell|8a5fa0 d8483c c8c8d0|sp h2
206|Burrowinder|canyon|uncommon|slither|timid|serpent|f2dc7a 6fb0d8 f6f6f6|wg tn
207|Glidesting|canyon|uncommon|fly|bold|bug|c08ad8 4a8ae0 f6f6f6|wg tl ep
208|Girdercoil|mountain|unique|slither|bold|serpent|9aa0aa c8ccd4 5a606a|sp hn
209|Poutpup|town|common|walk|bold|biped|f2a6c0 4a8ae0 2c2c36|ep bl tp
210|Jowlguard|town|rare|walk|bold|biped|b08ad0 2c2c36 f6f6f6|ep tk bl tp
211|Spinepuff|sea|common|swim|bold|fish|3f8a8a f2e6a0 2c4a4a|sp
212|Clampwing|forest|rare|fly|bold|bug|d8483c 2c2c36 f2d84a|wg h2 tk
213|Jarshell|beach|uncommon|still|timid|shell|e0483a f2dc7a f6f6f6|tf
214|Hornlift|forest|uncommon|walk|bold|bug|3f5f9a f2d84a 2c3a5a|hn wg
215|Slyclaw|summit|uncommon|walk|bold|biped|2f3a4a d8483c f2d84a|cr ep tk
216|Honeycub|mountain|common|walk|curious|biped|c8853a f2dcb0 f2d84a|er bl tp
217|Ringbruin|mountain|rare|walk|bold|biped|8a5a30 f2d84a f2dcb0|er bl rg tp
218|Magmollusk|volcano|common|slither|calm|blob|f2603a f2d84a 8a2f1f|fl
219|Kilnshell|volcano|uncommon|slither|calm|shell|f2683a 6a6f78 f2d84a|fl
220|Tuftsnout|summit|common|walk|timid|quad|9a6f48 6a4a30 f2a6b0|pf
221|Shagtusk|summit|uncommon|walk|calm|quad|8a6040 5a3f28 f6f6f6|pf tk mn
222|Reefsprig|tidepool|common|hop|calm|rocky|f2a0b8 f6f6f6 e0708a|sp h2
223|Squirtfin|sea|common|swim|bold|fish|9aa6b8 4a6a9a f6f6f6|tn
224|Turretpus|islet|uncommon|walk|bold|blob|e0583a f2d84a f6e6c8|tl tk
225|Sackgull|summit|uncommon|hop|curious|bird|d8483c f6f6f6 f2d84a|tp bl
226|Kitewing|sea|rare|swim|calm|fish|2f4f8a f0f0f6 6a8ad0|wg h2
227|Bladefeather|canyon|rare|fly|bold|bird|a0a6b0 d8483c 5a6068|cr wg sp
228|Embercur|volcano|common|walk|bold|quad|2c2c36 f2743a f6f6f6|ep hn tl bl
229|Hornhound|volcano|rare|walk|bold|quad|2a2a34 f2603a f2f2f2|h2 tl sp bl
230|Tidewyrm|sea|rare|swim|bold|serpent|4f8ad8 f2dc7a 2f5fb0|cr wg
231|Trunklet|canyon|common|walk|curious|quad|6fb0d8 e0483a f6f6f6|er tk tp
232|Rolltusk|canyon|rare|walk|bold|quad|8a909a 2c2c36 f6f6f6|sh tk er
233|Vertexel|town|uncommon|float|curious|blob|e0486a 4a8ae0 f6f6f6|tn hn
234|Antlerook|plain|uncommon|walk|timid|quad|c89a62 f2e6c8 2c2c36|h2 tp bl
235|Daubtail|town|uncommon|walk|curious|biped|f2ecd8 8a6a4a 5fbf5a|tf tl ep
236|Scrapling|town|uncommon|walk|bold|biped|c8a0d0 8a5a3a f6f6f6|hn bl
237|Whirlkick|beach|uncommon|hop|bold|biped|8a6a4a 4a8ae0 f6f6f6|hn tl sp
238|Chillip|summit|uncommon|walk|curious|biped|c88ad0 f2d84a f6c6c0|mn bl
239|Plugling|islet|uncommon|walk|bold|biped|f2d84a 2c2c36 f6f6f6|h2 bl
240|Cinderpip|volcano|uncommon|walk|bold|biped|e0583a f2d84a f6e0a0|fl bl tfm
241|Dairybelle|farm|uncommon|walk|calm|quad|f2a6b8 2c2c36 f6ecc8|h2 er bl to
242|Joyovum|gorge|rare|walk|calm|blob|f6b8c8 fbfbf2 f6f6f6|mn bl
243|Stormfang|mountain|unique|walk|bold|quad|f2d84a 8a6ab8 2c2c36|mn sp tk tl
244|Pyremane|volcano|unique|walk|bold|quad|9a5a3a f6f6f6 e0483a|mn cr sp bl
245|Borealope|gorge|unique|walk|calm|quad|6fb8e0 a070c8 f6f6f6|mn cr tl bl
246|Gritlet|mountain|common|hop|timid|rocky|8fae6a d8483c 2c2c36|hn
247|Podstone|mountain|uncommon|still|calm|rocky|7a8aa8 2c2c36 d8483c|sp h2
248|Cragtyrant|mountain|rare|walk|bold|biped|7aa06a 4a6a9a 2c2c36|sp cr tl bl
249|Abyssgale|islet|unique|fly|calm|bird|f2f2f8 3f5fa0 2c3a6a|wg sp tl bl
250|Prismwing|summit|unique|fly|bold|bird|e0583a f2d84a 5fbf5a|cr wg tl bl
251|Timesprout|forest|unique|float|curious|plant|9fd47a 4a8ae0 f6f6f6|wg ep`;

const r = (n) => Math.round(n * 1000) / 1000;
// Each body plan gives its fixed parts and where the head (H, radius hr), the back (BK) and the tail root (TL) are,
// so the extras can be hung on any of them.
const PLANS = {
  quad: (c) => ({ H: [0, 0.62, 0.42], hr: 0.2, BK: [0, 0.64, -0.04], TL: [0, 0.44, -0.36], BD: [0, 0.4, 0.3, 0.4], eye: [0.1, 0.67, 0.58], er: 0.045, parts: [
    ['sph', c[0], [0.5, 0.42, 0.72], [0, 0.42, 0]], ['sph', c[0], [0.4, 0.38, 0.4], [0, 0.62, 0.42]],
    ['cyl', c[0], [0.13, 0.3, 0.13], [0.16, 0.15, 0.24], null, true], ['cyl', c[0], [0.13, 0.3, 0.13], [0.16, 0.15, -0.24], null, true],
    ['sph', c[1], [0.2, 0.14, 0.16], [0, 0.56, 0.62]] ] }),
  biped: (c) => ({ H: [0, 0.74, 0.04], hr: 0.21, BK: [0, 0.52, -0.16], TL: [0, 0.2, -0.2], BD: [0, 0.34, 0.2, 0.34], eye: [0.1, 0.78, 0.22], er: 0.045, parts: [
    ['taper', c[0], [0.42, 0.5, 0.36], [0, 0.36, 0]], ['sph', c[0], [0.42, 0.4, 0.4], [0, 0.74, 0.04]],
    ['sph', c[0], [0.12, 0.26, 0.12], [0.27, 0.42, 0.04], [0, 0, -14], true], ['cyl', c[0], [0.15, 0.2, 0.18], [0.12, 0.1, 0.02], null, true],
    ['sph', c[1], [0.16, 0.1, 0.1], [0, 0.69, 0.22]] ] }),
  bird: (c) => ({ H: [0, 0.7, 0.2], hr: 0.15, BK: [0, 0.6, -0.08], TL: [0, 0.36, -0.3], BD: [0, 0.36, 0.24, 0.34], eye: [0.08, 0.74, 0.31], er: 0.04, parts: [
    ['sph', c[0], [0.44, 0.42, 0.56], [0, 0.4, 0]], ['sph', c[0], [0.3, 0.3, 0.3], [0, 0.7, 0.2]],
    ['cone', c[2], [0.1, 0.16, 0.1], [0, 0.67, 0.4], [90, 0, 0]], ['box', c[1], [0.24, 0.05, 0.24], [0, 0.36, -0.36], [20, 0, 0]],
    ['cyl', c[2], [0.05, 0.18, 0.05], [0.1, 0.09, 0.02], null, true] ] }),
  fish: (c) => ({ H: [0, 0.5, 0.2], hr: 0.16, BK: [0, 0.62, -0.04], TL: [0, 0.36, -0.36], BD: [0, 0.32, 0.12, 0.3], eye: [0.14, 0.46, 0.26], er: 0.045, parts: [
    ['sph', c[0], [0.36, 0.44, 0.74], [0, 0.4, 0]], ['box', c[1], [0.04, 0.36, 0.2], [0, 0.4, -0.46]],
    ['box', c[1], [0.2, 0.04, 0.16], [0.22, 0.3, 0.1], [0, 0, -25], true], ['cone', c[1], [0.06, 0.2, 0.3], [0, 0.66, -0.02]],
    ['sph', c[2], [0.16, 0.1, 0.1], [0, 0.36, 0.36]] ] }),
  bug: (c) => ({ H: [0, 0.4, 0.38], hr: 0.13, BK: [0, 0.48, -0.1], TL: [0, 0.3, -0.42], BD: [0, 0.24, 0.1, 0.24], eye: [0.09, 0.44, 0.47], er: 0.045, parts: [
    ['sph', c[0], [0.4, 0.34, 0.46], [0, 0.3, -0.2]], ['sph', c[1], [0.32, 0.3, 0.3], [0, 0.34, 0.14]], ['sph', c[0], [0.28, 0.26, 0.26], [0, 0.4, 0.38]],
    ['cyl', c[2], [0.05, 0.26, 0.05], [0.22, 0.13, 0.14], [0, 0, -30], true], ['cyl', c[2], [0.05, 0.26, 0.05], [0.22, 0.13, -0.1], [0, 0, -30], true],
    ['cyl', c[2], [0.03, 0.2, 0.03], [0.07, 0.6, 0.44], [20, 0, -15], true] ] }),
  blob: (c) => ({ H: [0, 0.4, 0.02], hr: 0.26, BK: [0, 0.56, -0.12], TL: [0, 0.22, -0.26], BD: [0, 0.24, 0.24, 0.4], eye: [0.1, 0.42, 0.26], er: 0.05, parts: [
    ['sph', c[0], [0.6, 0.56, 0.56], [0, 0.32, 0]], ['sph', c[0], [0.18, 0.1, 0.24], [0.16, 0.05, 0.08], null, true],
    ['sph', c[0], [0.12, 0.18, 0.12], [0.32, 0.3, 0.08], [0, 0, -20], true], ['sph', c[1], [0.1, 0.08, 0.04], [0.19, 0.3, 0.22], null, true],
    ['sph', c[2], [0.1, 0.05, 0.04], [0, 0.3, 0.28]] ] }),
  serpent: (c) => ({ H: [0, 0.5, 0.34], hr: 0.15, BK: [0, 0.3, -0.14], TL: [0, 0.14, -0.5], BD: [0, 0.3, 0.38, 0.2], eye: [0.09, 0.55, 0.46], er: 0.04, parts: [
    ['sph', c[0], [0.3, 0.26, 0.3], [0, 0.14, -0.36]], ['sph', c[0], [0.32, 0.28, 0.32], [0, 0.15, -0.14]], ['sph', c[0], [0.3, 0.26, 0.3], [0, 0.14, 0.08]],
    ['sph', c[0], [0.26, 0.3, 0.26], [0, 0.3, 0.26]], ['sph', c[0], [0.3, 0.26, 0.34], [0, 0.5, 0.34]],
    ['cone', c[1], [0.14, 0.24, 0.14], [0, 0.12, -0.56], [-100, 0, 0]], ['sph', c[1], [0.2, 0.04, 0.5], [0, 0.03, -0.1]] ] }),
  plant: (c) => ({ H: [0, 0.34, 0.02], hr: 0.22, BK: [0, 0.5, -0.1], TL: [0, 0.2, -0.22], BD: [0, 0.22, 0.2, 0.3], eye: [0.1, 0.32, 0.21], er: 0.045, parts: [
    ['sph', c[0], [0.46, 0.44, 0.46], [0, 0.28, 0]], ['sph', c[0], [0.14, 0.08, 0.18], [0.13, 0.04, 0.06], null, true],
    ['sph', c[1], [0.14, 0.04, 0.34], [0, 0.56, 0.2], [20, 0, 0]], ['sph', c[1], [0.14, 0.04, 0.34], [0, 0.56, -0.2], [-20, 0, 0]],
    ['sph', c[1], [0.34, 0.04, 0.14], [0.2, 0.56, 0], [0, 0, 20], true], ['cyl', c[1], [0.05, 0.14, 0.05], [0, 0.58, 0]], ['sph', c[2], [0.14, 0.14, 0.14], [0, 0.7, 0]] ] }),
  ghost: (c) => ({ H: [0, 0.52, 0], hr: 0.24, BK: [0, 0.7, -0.08], TL: [0, 0.3, -0.24], BD: [0, 0.4, 0.22, 0.3], eye: [0.1, 0.5, 0.22], er: 0.05, parts: [
    ['hemi', c[0], [0.5, 0.5, 0.5], [0, 0.5, 0]], ['cone', c[0], [0.16, 0.2, 0.16], [0.14, 0.16, 0], [180, 0, 0], true],
    ['cone', c[0], [0.16, 0.2, 0.16], [0, 0.16, 0.14], [180, 0, 0]], ['cone', c[0], [0.16, 0.2, 0.16], [0, 0.16, -0.14], [180, 0, 0]],
    ['sph', c[1], [0.1, 0.1, 0.2], [0.3, 0.4, 0.1], null, true], ['sph', c[1], [0.14, 0.06, 0.04], [0, 0.36, 0.24]] ] }),
  shell: (c) => ({ H: [0, 0.3, 0.4], hr: 0.12, BK: [0, 0.56, 0], TL: [0, 0.18, -0.36], BD: [0, 0.2, 0.3, 0.2], eye: [0.07, 0.35, 0.5], er: 0.035, parts: [
    ['hemi', c[1], [0.62, 0.4, 0.66], [0, 0.36, 0]], ['box', c[0], [0.5, 0.1, 0.56], [0, 0.16, 0]], ['sph', c[0], [0.24, 0.22, 0.26], [0, 0.3, 0.4]],
    ['cyl', c[0], [0.14, 0.16, 0.14], [0.2, 0.08, 0.2], null, true], ['cyl', c[0], [0.14, 0.16, 0.14], [0.2, 0.08, -0.2], null, true],
    ['cone', c[0], [0.08, 0.14, 0.08], [0, 0.18, -0.38], [-90, 0, 0]] ] }),
  rocky: (c) => ({ H: [0, 0.6, 0.1], hr: 0.17, BK: [0, 0.56, -0.16], TL: [0, 0.24, -0.26], BD: [0, 0.3, 0.26, 0.3], eye: [0.09, 0.64, 0.25], er: 0.045, parts: [
    ['rock', c[0], [0.6, 0.5, 0.56], [0, 0.3, 0]], ['rock', c[0], [0.36, 0.3, 0.34], [0, 0.6, 0.1]],
    ['rock', c[1], [0.18, 0.18, 0.18], [0.36, 0.34, 0.06], null, true], ['rock', c[1], [0.2, 0.12, 0.22], [0.16, 0.06, 0.04], null, true],
    ['box', c[2], [0.2, 0.04, 0.04], [0, 0.52, 0.27]] ] }),
};
const EXTRAS = {
  ep: (a, c) => [['cone', c[1], [a.hr * 0.5, a.hr * 0.9, a.hr * 0.3], [a.hr * 0.55, a.H[1] + a.hr * 0.95, a.H[2] - a.hr * 0.1], [0, 0, -18], true]],
  er: (a, c) => [['sph', c[1], [a.hr * 0.7, a.hr * 0.7, a.hr * 0.3], [a.hr * 0.8, a.H[1] + a.hr * 0.75, a.H[2] - a.hr * 0.05], null, true]],
  el: (a, c) => [['taper', c[1], [a.hr * 0.4, a.hr * 1.6, a.hr * 0.3], [a.hr * 0.5, a.H[1] + a.hr * 1.3, a.H[2] - a.hr * 0.2], [-15, 0, -12], true]],
  hn: (a, c) => [['cone', c[2], [a.hr * 0.4, a.hr * 1.1, a.hr * 0.4], [0, a.H[1] + a.hr * 1.2, a.H[2] + a.hr * 0.2], [15, 0, 0]]],
  h2: (a, c) => [['cone', c[2], [a.hr * 0.3, a.hr * 1.0, a.hr * 0.3], [a.hr * 0.45, a.H[1] + a.hr * 1.15, a.H[2]], [0, 0, -20], true]],
  cr: (a, c) => [['cone', c[1], [a.hr * 0.3, a.hr * 1.2, a.hr * 0.9], [0, a.H[1] + a.hr * 1.1, a.H[2] - a.hr * 0.3], [-25, 0, 0]]],
  lf: (a, c) => [['sph', c[1], [a.hr * 0.5, a.hr * 0.12, a.hr * 1.6], [0, a.H[1] + a.hr * 1.05, a.H[2] - a.hr * 0.7], [20, 0, 0]]],
  tf: (a, c) => [['sph', c[1], [a.hr * 0.7, a.hr * 0.6, a.hr * 0.7], [0, a.H[1] + a.hr * 0.95, a.H[2]]]],
  fl: (a, c) => [['cone', c[1], [a.hr * 0.8, a.hr * 1.3, a.hr * 0.8], [0, a.H[1] + a.hr * 1.3, a.H[2] - a.hr * 0.1]], ['cone', c[2], [a.hr * 0.4, a.hr * 0.8, a.hr * 0.4], [0, a.H[1] + a.hr * 1.2, a.H[2] + a.hr * 0.15]]],
  lr: (a, c) => [['cyl', c[2], [0.03, 0.24, 0.03], [0, a.H[1] + a.hr * 1.4, a.H[2] + 0.06], [35, 0, 0]], ['sph', c[1], [0.12, 0.12, 0.12], [0, a.H[1] + a.hr * 2.0, a.H[2] + 0.16]]],
  mn: (a, c) => [['sph', c[1], [a.hr * 2.4, a.hr * 2.0, a.hr * 1.4], [0, a.H[1] - a.hr * 0.3, a.H[2] - a.hr * 1.0]]],
  sp: (a, c) => [-0.14, 0, 0.14].map((z, i) => ['cone', c[i === 1 ? 2 : 1], [0.12, 0.2, 0.12], [0, a.BK[1] + 0.06, a.BK[2] + z], [-12, 0, 0]]),
  wg: (a, c) => [['box', c[1], [0.34, 0.04, 0.26], [0.36, a.BK[1] - 0.04, a.BK[2]], [0, 0, 20], true]],
  sh: (a, c) => [['hemi', c[2], [0.5, 0.3, 0.5], [0, a.BK[1] - 0.02, a.BK[2]]]],
  pf: (a, c) => [['sph', c[1], [0.34, 0.3, 0.34], [0, a.BK[1] - 0.02, a.BK[2]]], ['sph', c[1], [0.26, 0.24, 0.26], [0.17, a.BK[1] - 0.14, a.BK[2] + 0.08], null, true]],
  tl: (a, c) => [['cyl', c[0], [0.08, 0.4, 0.08], [0, a.TL[1] + 0.1, a.TL[2] - 0.16], [-60, 0, 0]], ['sph', c[1], [0.12, 0.12, 0.12], [0, a.TL[1] + 0.2, a.TL[2] - 0.34]]],
  tp: (a, c) => [['sph', c[1], [0.2, 0.2, 0.2], [0, a.TL[1] + 0.06, a.TL[2] - 0.1]]],
  tfm: (a, c) => [['cone', c[2], [0.16, 0.3, 0.16], [0, a.TL[1] + 0.22, a.TL[2] - 0.14], [-20, 0, 0]]],
  tn: (a, c) => [['box', c[1], [0.04, 0.26, 0.2], [0, a.TL[1] + 0.05, a.TL[2] - 0.14]]],
  to: (a, c) => [['cyl', c[0], [0.05, 0.3, 0.05], [0, a.TL[1] + 0.08, a.TL[2] - 0.12], [-50, 0, 0]], ['sph', c[2], [0.16, 0.16, 0.16], [0, a.TL[1] + 0.2, a.TL[2] - 0.26]]],
  bl: (a, c) => [['sph', c[1], [a.BD[2] * 1.4, a.BD[3] * 0.8, 0.1], [0, a.BD[0] + a.BD[1], a.BD[2]]]],
  tk: (a, c) => [['cone', c[2], [0.06, 0.2, 0.06], [a.hr * 0.5, a.H[1] - a.hr * 0.5, a.H[2] + a.hr * 0.8], [100, 0, 0], true]],
  rg: (a, c) => [['torus', c[2], [0.44, 0.1, 0.44], [0, a.BD[0] + a.BD[1] + 0.02, 0]]],
};

const facts = new Map(FACTS.split('\n').map((l) => { const [dex, official, category, types, height] = l.split('|'); return [+dex, { dex: +dex, official, category, types: types.split(','), height: +height }]; }));
const critters = LOOKS.split('\n').map((l) => {
  const [dex, name, habitat, rarity, move, temper, plan, cols, extras] = l.split('|'), f = facts.get(+dex);
  const c = cols.split(' ').map((h) => parseInt(h, 16)), a = PLANS[plan](c), parts = a.parts.slice();
  for (const e of extras.split(' ').filter(Boolean)) parts.push(...EXTRAS[e](a, c));
  parts.push(['eye', a.er, a.eye]);
  if (parts.length < 6 || parts.length > 20) throw new Error(`${name}: ${parts.length} parts`);
  return { dex: +dex, id: name.toLowerCase(), name, species: f.category, types: f.types, height: f.height, habitat, rarity, move, temper, parts };
});
if (critters.length !== 100 || new Set(critters.map((c) => c.id)).size !== 100) throw new Error('names are not 100 different ones');

const hex = (n) => '0x' + n.toString(16).padStart(6, '0');
const part = (p) => (p[0] === 'eye' ? `['eye', ${r(p[1])}, [${p[2].map(r).join(', ')}]]`
  : `['${p[0]}', ${hex(p[1])}, [${p[2].map(r).join(', ')}], [${p[3].map(r).join(', ')}]${p[4] || p[5] ? ', ' + (p[4] ? '[' + p[4].join(', ') + ']' : 'null') : ''}${p[5] ? ', true' : ''}]`);
const entry = (c) => `  { dex: ${c.dex}, id: '${c.id}', name: '${c.name}', species: '${c.species}', types: [${c.types.map((t) => `'${t}'`).join(', ')}], height: ${c.height},\n    habitat: '${c.habitat}', rarity: '${c.rarity}', move: '${c.move}', temper: '${c.temper}',\n    parts: [\n${c.parts.map((p) => '      ' + part(p) + ',').join('\n')}\n    ] },`;
const file = (list, a, b) => `// Stand-in critters for slots ${a}-${b}. Written by tools/make-critters-152-251.mjs: change the tables there and run it\n// again, do not edit this by hand. The format is in kit.js.\nexport default [\n${list.map(entry).join('\n')}\n];\n`;
fs.writeFileSync('critters/critters_4.js', file(critters.slice(0, 50), 152, 201).replace(/\n/g, '\r\n'));
fs.writeFileSync('critters/critters_5.js', file(critters.slice(50), 202, 251).replace(/\n/g, '\r\n'));

// the slots, in the file's own layout (one key a line)
const slots = JSON.parse(fs.readFileSync('critters/slots.json', 'utf8')).filter((s) => s.dex < 152);
for (const f of facts.values()) slots.push(f);
const slotText = '[\n' + slots.map((s) => `{\n"dex": ${s.dex},\n"official": ${JSON.stringify(s.official)},\n"category": ${JSON.stringify(s.category)},\n"types": [\n${s.types.map((t) => JSON.stringify(t)).join(',\n')}\n],\n"height": ${Number.isInteger(s.height) ? s.height.toFixed(1) : s.height}\n}`).join(',\n') + '\n]\n';
const eol = fs.readFileSync('critters/slots.json', 'utf8').includes('\r\n') ? '\r\n' : '\n';
fs.writeFileSync('critters/slots.json', slotText.replace(/\n/g, eol));
console.log('wrote critters_4.js, critters_5.js and', slots.length, 'slots');
