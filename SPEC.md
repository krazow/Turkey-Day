# Thanksgiving at Weird People's House: build contract (0.1.0)

**Game:** a simple mobile PWA game. You are the player ({{name}}), and your partner **Riley** has brought you home for
Thanksgiving weekend to meet the **Pemberton** family at their split-level house in **Beaverton, Oregon** (Cedar Hills area).
Five days, `GAME.days=5`: **day 0 Wed Nov 25, 2026** (arrive 5:00 PM) → **day 1 Thu Nov 26, Thanksgiving** (dinner at 3:00 PM
sharp) → **day 2 Fri, Black Friday** → **day 3 Sat, the Pemberton Family Games** (2:00 PM) → **day 4 Sun**, you leave at noon
(the finale: reaching day 4's leaving time or its night finishes the game). Survive the weekend, win the family over, keep
Riley happy and keep your sanity. Gentle, absurd, warm humor: the family is weird, never cruel, nobody is mocked for who they
are. Everyone is an adult. No alcohol jokes beyond "Dad's eggnog", no politics, no real-person names.

The play style is Tacompton's (same engine): time moves only when you act; tap actions on the Here tab; travel with *Go
somewhere*; watch your meters; go to bed in the guest room. `DAYS` in `00-game.js` already starts on Wednesday, so
`dayName(0)` is 'Wednesday'.

**The family** (`FAMILY` in 20-world.js, keys fixed): `linda` Mom Linda (runs Thanksgiving like a military op from a laminated
clipboard), `gary` Dad Gary (deep-fries everything; the turkey fryer lives in the driveway), `marjorie` Grandma Marjorie
(keeps a ranking of every guest ever on the fridge; you start at #14 of 14), `dez` Uncle Dez (the garage is his ham-radio
studio; current theory: Daylight Saving Time is a hoax by the clock industry), `bev` Aunt Bev (essential oils, a home business,
she will try to sell you a starter kit), `tanner` cousin Tanner (24, lives in the basement, explains crypto), `biscuit` the
family corgi (wears a different outfit every meal). Also the guest room: Linda's craft room, a futon and 212 porcelain dolls.

**Engine:** `src/js/00-09` are generic: don't edit them. Read `04-loop.js` and `05-ui.js` heads for the content contract.
APIs: `modal(title, html, buttons)`, button `{l, fn, stay}`, `showTile`, `say`, `pass(min)`, `adj(stat, n)`, `money(n)`, `$`,
`fmt`, `tod()`, `day()`, `dayName(d)`, `pick`, `defEvent`, `chain`, `fireHook`, `endDay(where)`, `go(dest)`, `isOpen`,
`hoursTxt`, `DF()`, `finish()`, `gameOver(id)`, and the choices API in `03-events.js`. **Use Tacompton's own content as the
model**: `/home/claude/krazow/tacompton/src/js/20-world.js` and `21-story.js` (the same files this repo started from; the
current copies in this repo are Tacompton's and get replaced). Keep the "engine shims" block at the end of 20-world.js, with
`dlabel` → `augDate(d)`. Anything Tacompton calls from files that no longer exist (10-life, 30-grow, 72-county, 63-era,
`isGrow`, `lifeNew`, `HOODS`, careers, phone…) must not be called: remove it. `isGrow()` should simply not exist or return false.

## Places (`L` keys, exactly these) and `TRAVEL`
At the house (1–2 minutes apart): `guest` the guest room (sleep, rest, hide, text a friend, the dolls) · `kitchen` (Linda's
clipboard chores, snacks, the good leftovers) · `living` the living room (the TV, football, Grandma's armchair, the family
photo wall, dinner is served here at the long table) · `garage` (Uncle Dez's radio studio, Dad's second fridge) ·
`backyard` (the turkey fryer, the hot tub that doesn't work, Biscuit).
Out in Beaverton (by Riley's car or the MAX; 10–20 minutes each way): `oldtown` Old Town Beaverton (a café, a walk, a breather),
`fredmeyer` the grocery store (generic "the grocery store on Cedar Hills Blvd", for pie ingredients or a store-bought pie,
cranberry sauce runs) · `mall` Washington Square (Black Friday chaos, gifts) · `nature` Tualatin Hills Nature Park (a quiet walk
in the rain, best stress relief). Opening hours: everything outside closes on Thanksgiving except the grocery store (until
4 PM); the mall opens 6 AM Friday.

## State (S) – WORLD defines these in `newState()`; STORY reads and writes them
`money` (DF().money), `energy` 0–100 (start 80), `stress` 0–100 (start 15; high is bad), `charm` 0–100 (start 30: how much
the family likes you), `riley` 0–100 (start 70: how Riley is doing), `pie:{have:false,kind:null}` (you promised to bring a
pie to Thursday dinner: `'store'` or `'homemade'`), `dinner:{done:false,late:false}`, `games:{done:false,won:false}`,
`fam:{linda:0,gary:0,marjorie:0,dez:0,bev:0,tanner:0,biscuit:0}` (0–3 hearts each), `rank:14` (Grandma's fridge ranking,
1 is best), `chores:{}` (per-day count), `flags:{}`, `stats:{chores,escapes,trips,spent,weird,talks,meals}`.
HUD (`STATS`): Cash, Energy, Sanity (shown as 100−stress, or show Stress, your pick but be clear), Charm, Riley.
Losses (`LOSSES`, STORY): `meltdown` (stress 100), `breakup` (riley 0), `banished` (charm 0, Linda asks you to leave).

## Ownership
| Agent | Files |
|---|---|
| WORLD | `src/js/20-world.js`: newState, FAMILY, STATS/HUD, SCENE + scenery SVG (a rainy late-November Beaverton: grey sky, firs, the split-level, string lights), L + art per place, TRAVEL/travelMins, actionsHere (chores, talking to each family member → `fam` hearts and charm, hiding in the guest room, eating, buying/baking the pie, the Black Friday mall, going places), ACT_CATS, statusTags, alertBar, EXTRA_TABS (a 👪 Family tab: each member, hearts, a line about them; Grandma's ranking), helpers like `spend`, `calm`, `augDate(d)` → 'Wed Nov 25'. |
| STORY | `src/js/21-story.js`: onNewGame (welcome modal from Riley, sets S.t to day 0 5:00 PM), onMorning, onNight (sleep recovery, Grandma re-ranks you nightly from charm and hearts), onArrive, onTime, Thanksgiving dinner on day 1 at 3 PM (a scene with 3–4 choices: the toast, Dez's theory, Bev's pitch, the pie reveal; late or missing = big charm loss), the Family Games on day 3 at 2 PM (charades/a trivia round with choices), the finale on day 4 (leaving at noon: Grandma's final ranking, an invitation back next year), 18+ events with `defEvent` (the turkey fryer flare-up, Biscuit steals a roll, the doll that moved, a power blip, Bev's starter kit, Tanner's pitch, Dez on the radio, the hot tub, the kids' table, the leftover wars, Black Friday crowds, rain, the football game, a family photo), TIPS, todoItems, RULES_HTML, LOSSES, checkLoss, ACH (10+), SCORE_W, GRADE_CUTS (decent play = B), scoreOf/gradeOf/endRows/scoreParts, FINISH_TEXT, TITLE (art: an SVG of the house in the rain with a turkey; intro bullets), MIGRATIONS ({}), hudDay(d) e.g. 'Thanksgiving · Thu Nov 26', daySummary. |
| SHIP | Everything else: `src/js/26-help.js` (replace with a short Help sheet for this game, same function names the engine calls), `27-feedback.js` and `29-update-notice.js` (text: only version 0.1.0, 2026-11-26), `41-install.js` text, `README.md`, `CHANGELOG.md` (0.1.0), `manifest.webmanifest`, `src/shell.html` (title/description), `release.json`, `package.json`, `install/ios.html`, `.claude/commands/*`, `tests/*.test.js` (smoke bot over 5 days, basic, save), `tools/sim*.js` (delete if Tacompton-only), `tools/build-offline.py` names. |

## Rules for all agents
- Plain browser JS globals in the engine style; every file must pass `node --check`. Don't run git.
- Build: `python3 tools/build.py`. Tests: `NODE_PATH=/opt/npm-tools/node_modules CHROME_PATH=/usr/bin/google-chrome node tests/run.js`.
  Once the other agents' files exist, build and run the tests, and fix your own files.
- Keep it simple: this is a small 0.1.0, about 400–600 lines per content file. Keep functions short and lines readable.
- When done, reply briefly: the globals and S fields you defined, and anything another agent must know.
