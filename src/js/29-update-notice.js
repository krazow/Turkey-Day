// ---------------- "Updated to version X" notice ----------------
// The title screen calls maybeUpdateNotice(). If this device last acknowledged a different version, a pop-up says which
// version the game is now, what's new, and (when there are saved games) that they were brought up to date. The only way
// to dismiss it is its "Got it" button; the version is remembered only after that, so a reload shows it again.
// A brand-new player (no remembered version, no saves) gets no pop-up: the version is just remembered.
// The full list, every version, opens from the title screen's 🆕 What’s new, ⚙️ Settings and Help (whatsNewModal below).
// Add a line list here for each release (newest last). Unknown versions get the generic line below.
const CHANGELOG={
  '0.1.0':['🦃 First release: five days of Thanksgiving weekend at the Pembertons’ split-level in Beaverton, Oregon, Wed Nov 25 to Sun Nov 29, 2026. Win over Linda, Gary, Grandma Marjorie, Uncle Dez, Aunt Bev, Tanner and Biscuit the corgi, keep Riley happy, bring the pie and keep your sanity.'],
};
const CHANGELOG_GENERIC='Fixes and small improvements throughout.';
const LASTVER_KEY=KEY('lastVersion');
function lastSeenVersion(){try{return localStorage.getItem(LASTVER_KEY)||''}catch(e){return ''}}
function rememberVersion(){try{localStorage.setItem(LASTVER_KEY,APP_VERSION)}catch(e){}}
// Run every slot's save through the engine's own migrate() and write it back stamped with this version
// (keeping its timestamp, so the current slot and "newest save" don't change). Returns {count, oldest app version}.
function upgradeAllSaves(){
  const ls=store(),out={count:0,oldest:''};if(!ls)return out;
  for(let n=1;n<=GAME.slots;n++){
    try{
      const r=rawSave(n);if(!r)continue;
      const raw=JSON.parse(r.v),d=migrate(raw);if(d.S.over)continue;
      out.count++;
      if(typeof raw.app==='string'&&raw.app&&(!out.oldest||verCmp(raw.app,out.oldest)<0))out.oldest=raw.app;
      if(d.newer)continue; // from a newer version: leave it exactly as it is
      ls.setItem(r.k,JSON.stringify({schema:d.schema,app:APP_VERSION,S:d.S,uiNarr:d.uiNarr,tab:d.tab,at:r.at||d.at}));
    }catch(e){}
  }
  return out;
}
// Every line since `from` (all of them with no `from`), newest version first: [[version, line], …].
function changelogAll(from){
  const lines=[];
  if(!CHANGELOG[APP_VERSION])lines.push([APP_VERSION,CHANGELOG_GENERIC]);
  changelogVersions(from).forEach(v=>CHANGELOG[v].forEach(t=>lines.push([v,t])));
  return lines;
}
const NOTICE_MAX=8;   // the pop-up stays short; the full list is one tap away (whatsNewModal)
function changelogLines(from){return changelogAll(from).slice(0,NOTICE_MAX)}
// The versions with notes, up to this one, newer than `from`, newest first.
function changelogVersions(from){
  return Object.keys(CHANGELOG).filter(v=>verCmp(v,APP_VERSION)<=0&&(!from||verCmp(v,from)>0)).sort((a,b)=>verCmp(b,a));
}
function maybeUpdateNotice(){
  try{
    const seen=lastSeenVersion();
    if(seen===APP_VERSION)return;
    if(document.getElementById('mbg'))return; // something else is open; the next title screen will show it
    const saves=upgradeAllSaves(),from=seen||saves.oldest;
    if(!seen&&!saves.count){rememberVersion();return} // brand-new player
    const all=changelogAll(from),lines=all.slice(0,NOTICE_MAX),multi=new Set(lines.map(l=>l[0])).size>1;
    // skipped a few updates and not everything fits: say so, and offer the full list from where they left off
    const cut=all.length-lines.length,since=cut&&from?from:'';
    const intro=from&&from!==APP_VERSION?`<p>${esc(GAME.title)} was updated from version ${esc(from)} to <b>${esc(APP_VERSION)}</b>.</p>`:`<p>${esc(GAME.title)} is now on version <b>${esc(APP_VERSION)}</b>.</p>`;
    const sv=saves.count?`<p>${saves.count>1?'Your saved games were':'Your saved game was'} updated to work with this version.</p>`:'';
    modal(`🆕 Updated to version ${esc(APP_VERSION)}`,`${intro}${sv}<p style="margin-bottom:2px"><b>What’s new</b></p><ul>${lines.map(l=>`<li>${multi?`<small>${esc(l[0])}</small> `:''}${l[1]}</li>`).join('')}</ul>${cut?`<p class="wn-more">…and ${cut} more ${cut>1?'changes':'change'} from earlier updates.</p>`:''}`,
      [{l:'Got it',fn:rememberVersion},
       ...(cut?[{l:since?`See everything new since ${esc(since)}`:'See everything new',s:'Every update you missed, newest first.',fn:()=>{rememberVersion();whatsNewModal({from:since})}}]:[])],true);
  }catch(e){}
}

// ---------------- 🆕 What's new: every update, newest first ----------------
// One sheet: a heading per version (with its release date when we know it; no date is made up), the version you have marked,
// the newest few open and the rest folded under "Show older updates". With {from:'1.12.1'} (from the update pop-up) every version
// since that one is open and the older ones are folded. {back:fn} adds a Back button (Settings, Help); otherwise Close.
// Opening it from inside another sheet (Help's link) replaces that sheet: still one pop-up.
const WN_DATES={'0.1.0':'2026-11-26'};   // version → release date (YYYY-MM-DD) from CHANGELOG.md; no date is made up
const WN_OPEN=3;   // versions shown before "Show older"
function wnDate(v){const d=WN_DATES[v];if(!d)return '';const [y,m,dd]=d.split('-').map(Number);
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${dd}, ${y}`}
const wnId=v=>'wn-'+v.replace(/\./g,'-');
function wnVersion(v){
  const cur=v===APP_VERSION,d=wnDate(v),lines=CHANGELOG[v]||[CHANGELOG_GENERIC];
  return `<section class="wn-ver${cur?' wn-cur':''}" id="${wnId(v)}" aria-labelledby="${wnId(v)}-h"><h3 id="${wnId(v)}-h" tabindex="-1">Version ${esc(v)}${cur?' <span class="wn-tag">Your version</span>':''}${d?` <small class="wn-date">${d}</small>`:''}</h3>
    <ul>${lines.map(t=>`<li>${t}</li>`).join('')}</ul></section>`;
}
function whatsNewBody(from){
  const vs=changelogVersions('');if(!CHANGELOG[APP_VERSION])vs.unshift(APP_VERSION);
  const n=from?Math.max(1,vs.filter(v=>verCmp(v,from)>0).length):WN_OPEN,top=vs.slice(0,n),older=vs.slice(n);
  const sum=from?`<p class="wn-sum">New since version ${esc(from)}: ${top.length} ${top.length>1?'updates':'update'}, newest first. You have version <b>${esc(APP_VERSION)}</b>.</p>`
    :`<p class="wn-sum">Every update, newest first. You have version <b>${esc(APP_VERSION)}</b>.</p>`;
  return sum+top.map(wnVersion).join('')+(older.length?`<details class="wn-older"><summary>Show older updates (${older.length})</summary>${older.map(wnVersion).join('')}</details>`:'');
}
function whatsNewModal(opts={}){
  const open=document.getElementById('mbg');if(open){open.remove();syncInert()}   // from inside Help: this sheet takes its place
  modal('🆕 What’s new',whatsNewBody(opts.from||''),opts.back?[{l:'Back',fn:opts.back},{l:'Close',fn:()=>{}}]:[{l:'Close',fn:()=>{}}]);
  const m=document.querySelector('#mbg .modal');if(m)m.scrollTop=0;
}
window.whatsNewModal=whatsNewModal;
