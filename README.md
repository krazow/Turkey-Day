# Thanksgiving at Weird People's House

**Five days with the Pembertons.** A mobile game (installable PWA, works offline) about Thanksgiving weekend at your partner Riley's family's split-level house in Beaverton, Oregon, Wednesday Nov 25 to Sunday Nov 29, 2026. Survive the weekend, win the family over, keep Riley happy and keep your sanity. Gentle, absurd, warm humor: the family is weird, never cruel.

It is a sibling of [Tacompton](https://github.com/krazow/Tacompton) and [Guide Master](https://github.com/krazow/Guide-Master), built on the same engine.

## How to play

- **A day:** time moves only when you act. Tap actions on the Here tab, travel with *Go somewhere*, watch your meters, and go to bed in the guest room.
- **The family:** Mom Linda, Dad Gary, Grandma Marjorie, Uncle Dez, Aunt Bev, cousin Tanner and Biscuit the corgi. Talk to them to earn hearts and Charm. Grandma keeps a ranking of every guest on the fridge.
- **The big moments:** Thanksgiving dinner on Thursday at 3 PM sharp (bring the pie you promised), Black Friday, the Pemberton Family Games on Saturday, and leaving at noon on Sunday.
- **Losing:** a meltdown (stress 100), a breakup (Riley 0) or being banished (Charm 0).
- **The score:** charm, Riley, hearts, sanity, the pie, dinner and the Games, graded A to F.

## Structure

- `src/js/00-09`: the engine, shared with Tacompton and the Krazow framework. Rarely edited.
- `src/js/20-29`: the content. `20-world.js` places, stats and actions, `21-story.js` events, scoring and achievements, `26-help.js` the help, `29-update-notice.js` the update notice.
- `src/shell.html`, `src/style.css`: the page. `tools/build.py` builds `index.html`; `tools/build-offline.py` builds the single-file offline version.
- `tests/`: Playwright tests (headless Chromium) run by `tests/run.js`.

## Build and test

```
npm install                 # once (Playwright)
python3 tools/build.py      # build index.html
npm test                    # run every test (add a name filter: node tests/run.js smoke)
python3 tools/build-offline.py   # the single-file offline build
npm run serve               # http://localhost:8000
```

## Release process

Releases use the shared Krazow release kit ([krazow/release-kit](https://github.com/krazow/release-kit)). Type `/releasenow` in a Claude chat on this repo: it builds, tests, ships a beta, then promotes it to production. Pull requests merge automatically once CI passes; add the `no-automerge` label (or open a draft) to opt out. The Windows installer uses port 47851 and the offline file ships as `TurkeyDay-offline.html`. Play it at https://krazow.github.io/Turkey-Day/.

## Disclaimer

This is a game. The Pembertons and everything they do are made up.
