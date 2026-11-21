# Critter Roller

Roll a ball around Crossway Continent, gather critters for five minutes against three other teams, then watch a wheel pick the arena where the armies fight. Play alone against CPU teams, or with up to four players online.

**Play it:** https://brain-camp.github.io/monster-roller-battle/

Runs in a desktop browser with keyboard and mouse or a gamepad. Progress is saved in the browser.

## Multiplayer

Two ways to play with others, both under **Multiplayer**:

- **Quick play** puts you in a public game with anyone else who is looking. The round starts by itself 20 seconds after a second player arrives (5 seconds once all four seats are taken). A public game that has started takes nobody new; latecomers are put in the next one.
- **Private room**: one player chooses **Host a private room** and shares the four-letter code or the invite link; the others type the code. The host picks the CPU difficulty and starts the round.

CPU teams fill any empty seats.

How it works (code in `net.js` and the "multiplayer" section of `main.js`):

- Players connect directly to the host's browser over WebRTC. The public PeerJS service is used only to find each other.
- The host's machine runs the world: critters, CPU teams, events, the clock and who rolled up what.
- Every player steers their own ball on their own machine, so their controls never lag. Pick-ups show at once and the host confirms or refuses them.
- The arena fight runs identically on every machine from the same armies and dice; the host sends each step's inputs.
- If the host leaves, the round ends for everyone. If another player leaves, a CPU takes over their ball.
- Some home and office networks block direct connections; those players will not be able to join.

For testing in two tabs of one browser without the internet, add `?net=local` to the address in both.

## Run it locally

No build step. Serve the folder and open it:

```
python tools/serve.py 8417
```

Then visit http://127.0.0.1:8417/.

## Notes

- `DESIGN.md` covers the map, the round, the events and the arena finale.
- `CREDITS.md` lists the models used (all CC0).
