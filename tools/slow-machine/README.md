# A stand-in for an old computer

For measuring what a frame costs on a slow processor, on a fast machine. See "For slow processors" in `DESIGN.md`.

1. Start the game's dev server (`tools/serve.py`, port 8417).
2. Start a separate headless Chrome kept to slow cores (its own profile folder beside the script):
   `powershell -File tools/slow-machine/launch.ps1 -Mask 0x30000 -Port 9333 -Gpu real`
   - `-Mask` is which processor cores it may use (0x30000: two efficiency cores of an i7-14700; change it for another machine).
   - `-Gpu soft` draws in software (SwiftShader) instead of on the graphics card.
   - The path to Chrome is written into the script.
3. Run things in its page with Node (25 or later: it uses the built-in `WebSocket`):
   - `node cdp.mjs 9333 4 setup.js "http://127.0.0.1:8417/?mute"` loads the game and starts a round. The `4` slows the main thread four times.
   - `node cdp.mjs 9333 4 levels.js` a frame at each graphics level, and with four full balls in view.
   - `node cdp.mjs 9333 1 ab.js`, then `-e "__ab('name', on, off)"`: a change switched on and off in turn, averaged.
   - `node prof.mjs 9333 1 "__game.bench(400)" 40` where the main thread's time goes, by function.
   - `node shot.mjs 9333 out.png` a picture of the page.
   - `node cdp.mjs 9333 1 inv.js`, then `-e "__inv()"`: the baked props checked against the game's own records.
   - `node cdp.mjs 9333 1 cracks.js` counts pinholes in the ground from sixty viewpoints.
   - `node mp.mjs 9333` a host and a client in two tabs: claims granted and refused, and both sides' books compared.
4. Stop it by ending the `chrome.exe` processes whose command line names the `profile-` folder.

The scene drifts as the rivals play, so compare a change by switching it on and off in turn (`ab.js`), not by two
runs minutes apart. `__game.timeLeft = 1e6` keeps a round from ending mid-measurement.
