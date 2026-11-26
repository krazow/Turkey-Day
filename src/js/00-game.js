// ============================================================
//  GAME CONFIG: start here when you make a new game.
//  tools/new-game.py rewrites id / title / codePrefix / colors for you
//  (in this file, src/shell.html, the web manifest and sw.js).
//
//  Files, in build order (tools/build.py concatenates src/js/*.js by name):
//    00-game.js      this config
//    01-core.js      state, preferences, sound, player name, time + stat helpers
//    02-kit.js       bottom-sheet modals, event tiles, full-screen transitions
//    03-events.js    random-event engine (hooks, chances, cooldowns, chains)
//    04-loop.js      new game, days, nights, travel, the passing of time
//    05-ui.js        HUD, scene, tabs, action list, to-do + priorities, log, tips
//    06-save.js      autosave, 3 slots, migrations, transfer codes, service worker
//    07-endings.js   end screen, score, best score, achievements
//    08-settings.js  title screen, name/difficulty pickers, settings, accessibility, slots
//    09-keys.js      keyboard shortcuts for desktop
//    20-world.js     ← YOUR GAME: stats, starting state, the places, chores, actions, scenery
//    21-story.js     ← YOUR GAME: the job pick, events, tips, to-do, neighbors, achievements, scoring, migrations
//    26-help.js      the Help sheet
//    29-update-notice.js  the "updated to version X" notice and What's new
//    41-install.js   the title screen's install bar and Install app button (Android/Chrome prompt, other browsers' steps, iPhone page)
//    99-boot.js      starts the app
//  Engine files (00–09) shouldn't need much editing; your game lives in 20+.
// ============================================================
const GAME={
  id:'turkeyday',           // storage-key prefix and service-worker cache prefix (lowercase, no spaces)
  title:'Thanksgiving at Weird People\'s House',
  tagline:'Survive the holiday weekend with your partner\'s very strange family in Beaverton, OR',
  codePrefix:'TURKEYDAY',   // transfer codes start with this
  version:'0.1.0',          // bump on every release: shown in Settings, stamped into saves and sw.js
  schema:1,                 // bump when the shape of S changes, and add a MIGRATIONS entry (21-story.js)
  days:5,                   // Wed Nov 25 – Sun Nov 29, 2026: Thanksgiving weekend at the Pembertons' in Beaverton
  wake:480,                 // 8:00 AM (day one's arrival time is set by onNewGame)
  startLoc:'guest',
  travelAnim:20,            // trips this many minutes or longer play the full-screen transition
  defaultName:'Guest',      // used until the player picks a name
  slots:3,                  // save slots
};
const APP_VERSION=GAME.version, SAVE_SCHEMA=GAME.schema;
const KEY=k=>GAME.id+'.'+k;  // every localStorage key goes through this
// day 0 is Wednesday Nov 25, 2026 (the engine names day d as DAYS[d%7])
const DAYS=['Wednesday','Thursday','Friday','Saturday','Sunday','Monday','Tuesday'];
// Difficulties: anything here is readable in your content as DF().something.
const DIFFS={
  // money: starting cash. bad: bad-event multiplier. cost: store prices. strain: stress multiplier on weird moments. No difficulty changes the score.
  easy:  {n:'Normal-ish Family',ic:'🥧',d:'A little weird. More cash, cheaper pie, and the family forgives a lot.',money:400,bad:0.6,cost:0.85,strain:0.75},
  normal:{n:'The Pembertons',   ic:'🦃',d:'Exactly as weird as Riley warned you. Possibly more.',money:250,bad:1,cost:1,strain:1},
  hard:  {n:'Full Pemberton',   ic:'🔥',d:'Grandma is keeping score, Uncle Dez has a new theory, and your wallet is thin. Same score, harder weekend.',money:120,bad:1.4,cost:1.2,strain:1.3},
};
const DF=()=>DIFFS[(typeof S!=='undefined'&&S&&S.diff)||'normal']||DIFFS.normal;
