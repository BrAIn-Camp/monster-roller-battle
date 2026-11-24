// Which map this page is playing. It is chosen before anything is built: the ground, the minimap, the habitat tables
// and the roster are all made once, at load, from whichever map this module hands on. So changing map is a reload:
//   ?map=lanternrise   in the address, or the choice the menu last saved (localStorage `map`); otherwise Crossway.
// In multiplayer the host's map is sent with the lobby, and a guest on another map reloads into it (main.js).
import * as crossway from './map.js';
import * as lanternrise from './map2.js';

export const MAPS = { crossway, lanternrise };
export const MAP_LIST = [
  { id: 'crossway', name: 'Crossway Continent', blurb: 'The first 151, on a compass rose of climates' },
  { id: 'lanternrise', name: 'Lanternrise', blurb: 'Slots 152-251, in hill country: three great stairs to climb' },
];
function pick() {
  let id = null;
  try { id = new URLSearchParams(location.search).get('map') || localStorage.getItem('map'); } catch (e) { /* no page, or storage blocked */ }
  return MAPS[id] ? id : 'crossway';
}
export const MAP_ID = pick();
const M = MAPS[MAP_ID];
export const MAP_NAME = M.NAME, ROSTER = M.ROSTER, ROUTES = M.ROUTES, EVENT = M.EVENT, DENSITY = M.DENSITY ?? 1;
export const BOUNDS = M.BOUNDS, STARTS = M.STARTS, BIOMES = M.BIOMES, B = M.B, PLACES = M.PLACES, REHOME = M.REHOME, GUESTS = M.GUESTS, R_HUB = M.R_HUB;
export const scenery = M.scenery, layout = M.layout, ITEMS = M.ITEMS, SHAPES = M.SHAPES;
// Reloads the page on another map, keeping whatever else is in the address (a room code, test switches).
export function switchMap(id, extra = {}) {
  if (!MAPS[id]) return;
  try { localStorage.setItem('map', id); } catch (e) { /* the address carries it anyway */ }
  const u = new URL(location.href);
  u.searchParams.set('map', id);
  for (const k in extra) u.searchParams.set(k, extra[k]);
  location.href = u.href;
}
