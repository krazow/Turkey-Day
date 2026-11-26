// ---------------- random events ----------------
// defEvent({
//   id:'found_cash',             unique id (saved in S.ev, so don't rename casually: see MIGRATIONS)
//   hook:'arrive',               when it can fire: 'wake' | 'arrive' | 'travel' | 'night' | any name you fireHook() yourself
//                                (or an array of hooks)
//   tile:['💵','Found $20','good'],  icon, title, kind for the toast
//   chance:0.1,                  0–1, or a function (ctx)=>number
//   bad:true,                    scale chance by the difficulty's "bad" multiplier
//   cond:ctx=>S.loc==='park',    must be true to fire
//   cooldown:2,                  days before it can fire again
//   max:1,                       times per game
//   priority:0,                  higher runs first
//   run:ctx=>{ money(20); say('…'); return {stop:true} }  return {stop:true} to stop later events on this hook
// })
// chain('id') forces an event to fire the next time its hook runs (one event can set up another).
const EV=[];
function defEvent(e){EV.push(Object.assign({chance:0,priority:0,cooldown:0,max:99},e))}
let EV_RUNNING=null;
function chain(id,cause){if(!S.ev.force.includes(id))S.ev.force.push(id);S.ev.cause=S.ev.cause||{};S.ev.cause[id]=cause||EV_RUNNING||null}
window.forceEvent=id=>chain(id);
const HOOK_SCALE={wake:0.85}; // chance that a hook call lets any event through at all (15% of mornings stay quiet)
const HOOK_SUB={wake:'This morning',night:'Overnight'};
function fireHook(hook,ctx={}){
  ctx.hook=hook;let res=null;const popItems=[];
  const capped=infoPopsToday()>=INFO_POP_CAP;   // enough "OK" pop-ups today: the rest show as tiles and go in the log
  const scale=HOOK_SCALE[hook]??1,open=scale>=1||Math.random()<scale;
  const list=EV.filter(e=>e.hook===hook||(Array.isArray(e.hook)&&e.hook.includes(hook))).sort((a,b)=>b.priority-a.priority);
  for(const e of list){
    const forced=S.ev.force.includes(e.id);
    if(e.cond){let ok=false;try{ok=e.cond(ctx)}catch(err){ok=false}if(!ok)continue}
    if(!open&&!forced) continue;
    if(!forced){
      if((S.ev.count[e.id]||0)>=e.max) continue;
      if(e.choices&&(isPending(e.id)||AMB[e.id]||(!e.urgent&&!evAmbient(e,ctx)&&pendingList().length>=CHOICE_MAX))) continue;   // decisions waiting: no more choice events for now (urgent ones ask at once, and moments don't count)
      if(S.ev.last[e.id]!=null&&day()-S.ev.last[e.id]<e.cooldown) continue;
      const p=(typeof e.chance==='function'?e.chance(ctx):e.chance)*(e.bad?DF().bad:1);
      if(!(Math.random()<p)) continue;
    } else S.ev.force=S.ev.force.filter(x=>x!==e.id);
    S.ev.last[e.id]=day();S.ev.count[e.id]=(S.ev.count[e.id]||0)+1;S.ev.history.push({id:e.id,t:S.t});
    const nBefore=uiNarr.length,mBefore=MQ.length+(document.getElementById('mbg')?1:0);
    if(Array.isArray(ctx.fired))ctx.fired.push(e.id);   // the caller can ask which events ran (endDay: the morning report's picture)
    EV_RUNNING=e.id;let r;try{r=(e.run?e.run(ctx):null)||{}}finally{EV_RUNNING=null}
    // events that didn't open their own modal get collected into one OK pop-up per hook call
    const ownModal=MQ.length+(document.getElementById('mbg')?1:0)!==mBefore;
    if(e.choices){   // a decision: its own tile or sheet (choiceFired), not the OK pop-up
      choiceFired(e,ctx,uiNarr.slice(nBefore),forced);
      if(S.ev.cause)delete S.ev.cause[e.id];
      if(ctx.notes) ctx.notes.push(...uiNarr.slice(nBefore));
      if(r.stop){res=r;break}
      res=res||r;continue}
    if(!ownModal) popItems.push({e,lines:uiNarr.slice(nBefore)});
    const [ic,title,kind]=e.tile||['📍',e.id.replace(/_/g,' '),'info'];
    const dup=ownModal||hook==='night'||!!DIGEST||(popupsOn()&&!capped);   // the event's own modal, the night summary or the OK pop-up already tells the player
    const cause=S.ev.cause&&S.ev.cause[e.id],ce=cause&&EV.find(x=>x.id===cause);
    if(!dup)showTile(ic,title,ce?`Because of: ${ce.tile?ce.tile[1]:cause}`:(ctx.sub||HOOK_SUB[hook]||''),kind,hook==='night'?`${dayName(day()).slice(0,3)} night`:null);
    if(S.ev.cause)delete S.ev.cause[e.id];
    if(ctx.notes) ctx.notes.push(...uiNarr.slice(nBefore));
    if(r.stop){res=r;break}
    res=res||r;
  }
  eventPopup(hook,popItems,capped);
  if(popItems.length&&hook!=='night'&&!DIGEST&&!(popupsOn()&&!capped)) artNarrEvent(popItems.map(it=>it.e.id));   // 40-art.js: no pop-up, so its picture goes over the narration
  return res;
}
// ---- OK pop-up for events (on by default; Settings → Event pop-ups) ----
const POPUP_KEY=KEY('popups');
// (1.12.0: off unless you turn it on. The morning report and decisions still pop up; the rest is a tile and a log line.)
function popupsOn(){try{return localStorage.getItem(POPUP_KEY)==='on'}catch(e){return false}}
// At most INFO_POP_CAP of these information-only pop-ups a day (decisions and the night summary are never counted or held back).
const INFO_POP_CAP=1;
function infoPopsToday(){const p=S&&S.ev&&S.ev.pop;return p&&p.d===day()?p.n:0}
function eventPopup(hook,items,capped){
  if(!items.length||hook==='night'||!S||S.over) return;
  if(DIGEST){items.forEach(it=>{const m=it.e.tile||['📍',it.e.id.replace(/_/g,' ')];DIGEST.items.push({ic:m[0],title:m[1],lines:it.lines,id:it.e.id})});return}   // morning events are part of the morning report
  if(!popupsOn()||capped) return;
  S.ev.pop={d:day(),n:infoPopsToday()+1}; // night events go in the "Good night" summary
  const meta=e=>e.tile||['📍',e.id.replace(/_/g,' ')];
  const body=items.map(it=>{const m=meta(it.e);const txt=it.lines.map(l=>`<p style="margin:4px 0 0">${l}</p>`).join('');
    return items.length>1?`<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)"><span style="font-size:24px">${m[0]}</span><div><b>${m[1]}</b>${txt}</div></div>`:txt}).join('');
  const one=items.length===1?meta(items[0].e):null;
  const art=artOn()?artFirst(items.map(it=>()=>artSlot('event',()=>artEventCtx(it.e.id,'game'),{deco:true}))):'';   // 40-art.js: the first event with an illustration
  modal(one?`${one[0]} ${one[1]}`:'📍 Meanwhile…',art+(body||'<p></p>'),[{l:'OK',fn:()=>{}}]);
}

// ---------------- choices: events that ask you to decide ----------------
// An event may add, besides run:
//   choices:()=>[{ic:'🚌',l:'Sit up front',s:'Lose less if something happens',fn:()=>{…},dis:false}, …]   2–3 options, built when it fires
//   dflt:1          the option applied if you never decide by the end of the day (the cautious or "pass" one)
//   urgent:true     opens the choice sheet at once, even with pop-ups off (setbacks that can't wait)
// When it fires: run() runs, a pending decision goes in S.ev.pending ({id,day,title,ic,lines,hook,urgent}), and its tile says
// "Tap to decide". The sheet opens from the tile, the Decide card on the Here tab, or the morning report. At night, anything still
// pending gets its dflt option ("You let it go: …"). At most CHOICE_MAX pending (urgent ones aside: they ask at once): further choice events don't fire (a forced one takes
// its default at once). Saves keep S.ev.pending; the options are rebuilt from the event after a reload.
// An urgent event on the night hook goes at the top of the morning report and its sheet opens right after the report closes.
// Ambient moments (choices from stopWatch, whose array carries .ambient) never take a pending slot: they live in AMB (not saved)
// while their tile shows. The tile is tappable for its lifetime; once it goes (or at night) "Keep going" is applied silently.
const CHOICE_MAX=3;
const AMB={};   // id → {id,title,ic,lines,hook}: ambient moments you can still stop for
function evAmbient(e,ctx){   // does this event's choices() come from stopWatch? (probed once, then cached on the event)
  if(e._amb!==undefined)return e._amb;
  try{const o=e.choices(Object.assign({},ctx,{probe:true}));e._amb=!!(o&&o.ambient)}catch(err){return false}
  return e._amb}
const choiceWaiting=id=>isPending(id)||!!AMB[id];
window.choicesWaiting=()=>pendingList().map(p=>p.id).concat(Object.keys(AMB));
const untag=h=>String(h||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const CHOICE_CACHE={};   // id → {ctx, opts}: the options as built when the event fired (not saved; rebuilt after a reload)
function eventFlag(id){return S&&S.ev&&S.ev.flags?S.ev.flags[id]:undefined}
function setEventFlag(id,v){S.ev.flags=S.ev.flags||{};S.ev.flags[id]=v===undefined?true:v}
// The standard two options for an ambient moment: "👀 Stop and watch" (time → calm, maybe energy/community) or "Keep going" (nothing).
// Use with dflt:1.
function stopWatch(o={}){
  const mins=o.mins??15,cv=o.calm??6,en=o.energy||0,co=o.community||0,grow=typeof isGrow==='function'&&isGrow();
  const bits=[`${mins} min`];
  if(cv)bits.push(grow?`mood +${cv}`:(typeof calmTxt==='function'?calmTxt(cv):`stress −${cv}`));
  if(en)bits.push(`energy ${en>0?'+':'−'}${Math.abs(en)}`);
  if(co&&!grow)bits.push(`community +${co}`);
  const r=[
    {ic:'👀',l:'Stop and watch',s:bits.join(', ').replace(/^./,c=>c.toUpperCase())+'.',fn:()=>{
      pass(mins);
      if(cv){if(grow)adj('mood',cv);else if(typeof calm==='function')calm(cv);else adj('stress',-cv)}
      if(en&&'energy' in S)adj('energy',en);
      if(co&&!grow&&'community' in S)adj('community',co);
      if(o.text)say(o.text)}},
    {ic:'🚶',l:'Keep going',s:o.pass||'No time spent. The moment goes on without you.',fn:()=>{}}];
  r.ambient=true;return r;
}
function pendingList(){if(!S.ev.pending)S.ev.pending=[];return S.ev.pending}
const isPending=id=>pendingList().some(p=>p.id===id);
// The options for a pending decision (from the cache, or rebuilt from the event)
function choiceOpts(id){
  const e=EV.find(x=>x.id===id);if(!e||!e.choices)return null;
  let c=CHOICE_CACHE[id];
  if(!c){let opts=[];try{opts=e.choices({hook:(pendingList().find(p=>p.id===id)||{}).hook,reload:true})||[]}catch(err){opts=[]}c=CHOICE_CACHE[id]={opts}}
  return c.opts;
}
function choiceDflt(id){const e=EV.find(x=>x.id===id),o=choiceOpts(id)||[];
  let d=e&&typeof e.dflt==='function'?e.dflt():e&&e.dflt;d=Number.isInteger(d)&&o[d]?d:o.length-1;
  if(o[d]&&o[d].dis){const k=o.findIndex(x=>!x.dis);if(k>=0)d=k}
  return d}
// Called by fireHook for an event with choices, after its run()
function choiceFired(e,ctx,lines,forced){
  let opts=[];EV_RUNNING=e.id;try{opts=e.choices(ctx)||[]}catch(err){opts=[]}finally{EV_RUNNING=null}
  if(!opts.length)return;
  const [ic,title]=e.tile||['📍',e.id.replace(/_/g,' ')];
  CHOICE_CACHE[e.id]={ctx,opts};
  const P=pendingList();
  if(opts.ambient){e._amb=true;   // a moment: no pending slot
    if(ctx.hook==='night'){choiceDrop(e.id);return}   // nobody is out to see it
    AMB[e.id]={id:e.id,title,ic,lines:lines.slice(0,4),hook:ctx.hook,amb:true};
    if(DIGEST){DIGEST.items.push({ic,title,lines,amb:e.id});return}   // the morning report offers it (morningReport)
    if(popupsOn())openChoice(e.id);
    else showTile(ic,title,'Tap to stop and watch',e.tile?e.tile[2]:'good',null,{decide:e.id});
    return}
  if(isPending(e.id)||(!e.urgent&&P.length>=CHOICE_MAX)){   // forced past the limit: it takes its default now
    if(!isPending(e.id)){P.push({id:e.id,day:day(),title,ic,lines,hook:ctx.hook});choiceApply(e.id,choiceDflt(e.id),'full')}
    return}
  P.push({id:e.id,day:day(),title,ic,lines:lines.slice(0,4),hook:ctx.hook,urgent:!!e.urgent});
  const now=ctx.hook!=='night'&&(e.urgent||popupsOn());
  if(DIGEST){DIGEST.items.push({ic,title,lines:lines.concat([e.urgent?'You need to decide this one now.':'Decide below, or it waits until tonight.'])});if(now)openChoice(e.id);return}
  if(now)openChoice(e.id);
  else if(ctx.hook!=='night')showTile(ic,title,'Tap to decide',e.tile?e.tile[2]:'info',null,{decide:e.id});
}
// Apply option i of a pending decision. how: 'pick' (you chose), 'night' (defaulted), 'full' (too many pending)
function choiceApply(id,i,how){
  const P=pendingList(),k=P.findIndex(p=>p.id===id),amb=k<0&&AMB[id];if(k<0&&!amb)return false;
  const opts=choiceOpts(id)||[],o=opts[i];
  if(amb)delete AMB[id];else P.splice(k,1);delete CHOICE_CACHE[id];
  if(!o)return false;
  const p0=S.ev.choiceLog||(S.ev.choiceLog={});p0[id]=i;   // the last option taken for each event (follow-ups can read it)
  EV_RUNNING=id;try{o.fn&&o.fn()}catch(err){console.error(err)}finally{EV_RUNNING=null}
  return true;
}
// Open the choice sheet for a pending decision (one sheet at a time: it queues behind any open pop-up)
function openChoice(id){
  const p=pendingList().find(x=>x.id===id)||AMB[id];if(!p)return;
  const opts=choiceOpts(id);if(!opts||!opts.length){if(p.amb)delete AMB[id];else pendingList().splice(pendingList().indexOf(p),1);return}
  const d=choiceDflt(id),e=EV.find(x=>x.id===id),urgent=!!(e&&e.urgent&&!p.amb);
  const body=`<div class="choice-sheet" data-ev="${esc(id)}" data-dflt="${d}" hidden></div>`+(p.lines||[]).map(l=>`<p>${l}</p>`).join('')+
    (p.amb?'':`<p class="ch-q">What do you do?</p>`+(urgent?'':`<p class="ch-note">If you don’t decide by tonight: ${esc(untag(opts[d].l))}.</p>`));
  const btns=opts.map((o,i)=>({l:`${o.ic?o.ic+' ':''}${o.l}`,s:o.s||'',dis:!!o.dis,np:true,fn:()=>{if(!choiceWaiting(id))return;uiNarr=[];choiceApply(id,i,'pick');afterAction()}}));
  if(!urgent&&!p.amb)btns.push({l:'Not now',s:'It waits on the Here tab until tonight.',fn:()=>{}});
  modalSwap(`${p.ic} ${p.title}`,body,btns,urgent);
}
window.openChoice=openChoice;
// The default option of the open choice sheet (for bots and tests), or −1 when no choice sheet is open
window.choiceBtn=()=>{const m=document.getElementById('mbg'),c=m&&m.querySelector('.choice-sheet');return c?+c.dataset.dflt:-1};
// Night: every decision still pending takes its default. Lines go to notes (the morning report) and the log.
// A moment that passed without you: "Keep going", silently
function choiceDrop(id){if(!AMB[id]){delete CHOICE_CACHE[id];return}choiceApply(id,choiceDflt(id),'gone')}
window.choiceDrop=choiceDrop;
function choiceNight(notes){
  Object.keys(AMB).forEach(choiceDrop);
  const P=pendingList().slice();
  for(const p of P){const opts=choiceOpts(p.id)||[],d=choiceDflt(p.id),o=opts[d];
    const n0=uiNarr.length,l0=S.log.length;
    S.log.push({t:S.t,s:`⏳ You let it go: ${p.ic} ${p.title}${o?` (${o.ic?o.ic+' ':''}${untag(o.l)})`:''}.`});
    choiceApply(p.id,d,'night');
    if(notes){notes.push(`⏳ You let it go: <b>${p.title}</b>${o?`. ${o.ic?o.ic+' ':''}${o.l}`:''}.`);notes.push(...uiNarr.slice(n0))}
    void l0}
}
// The Decide card at the top of the Here tab (05-ui.js) and the morning report's list
function choiceCard(btn){
  const P=pendingList();if(!P.length)return '';
  return `<div class="decide" role="region" aria-label="Decisions waiting"><div class="sect">🤔 Decide · ${P.length} waiting</div>`+
    P.map(p=>btn({ic:p.ic,l:p.title,s:p.urgent?'Decide now.':'Tap to decide. If you don’t, the cautious choice is made tonight.',cls:'decide-btn',fn:()=>openChoice(p.id)})).join('')+'</div>';
}
