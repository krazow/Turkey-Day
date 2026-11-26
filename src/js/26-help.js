// ============================================================
//  Thanksgiving at Weird People's House: the player's guide. "❓ Help" on the title screen and ⚙️ Settings → Help call helpModal(),
//  which opens a short full-screen guide: a cover, a table of contents with jump links, then a few short chapters.
//  Esc closes it, Tab stays inside, every control is at least 44px. Works before a game exists and mid-game.
//  Numbers come from the game's own constants (SCORE_W, GRADE_CUTS, L), guarded with typeof. Plain words, no code terms.
// ============================================================
const HELP_CUTS=()=>typeof GRADE_CUTS!=='undefined'&&Array.isArray(GRADE_CUTS)?GRADE_CUTS:null;
const hTip=(t,b)=>`<aside class="tut-box tip"><b>${t}</b><p>${b}</p></aside>`;
const hWarn=(t,b)=>`<aside class="tut-box warn"><b>${t}</b><p>${b}</p></aside>`;
const hTable=(head,rows)=>`<div class="tut-tw"><table class="tut-t"><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${c}</td>`:`<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const HSVG_COVER=()=>`<svg viewBox="0 0 320 120" role="img" aria-label="A split-level house in the rain with string lights and a turkey">
  <defs><clipPath id="tutclip"><rect width="320" height="120" rx="10"/></clipPath></defs><g clip-path="url(#tutclip)"><rect width="320" height="120" fill="#8d99a6"/>
  ${[18,40,262,290].map((x,i)=>`<polygon points="${x},96 ${x+14},${52-i%2*8} ${x+28},96" fill="#2f5a45"/>`).join('')}
  <rect y="96" width="320" height="24" fill="#5b7d68"/><rect x="92" y="62" width="136" height="38" fill="#c9a57a"/><rect x="92" y="62" width="60" height="38" fill="#b48f66"/>
  <polygon points="86,62 160,30 234,62" fill="#5a3328"/><rect x="104" y="72" width="14" height="12" fill="#fbe9b0"/><rect x="170" y="72" width="14" height="12" fill="#fbe9b0"/><rect x="198" y="72" width="14" height="12" fill="#fbe9b0"/>
  ${[0,1,2,3,4,5,6].map(i=>`<circle cx="${100+i*22}" cy="${64+i%2*3}" r="2.5" fill="${['#e3642e','#f2b630','#6f9aa6'][i%3]}"/>`).join('')}
  <ellipse cx="270" cy="88" rx="16" ry="11" fill="#a0612f"/><circle cx="283" cy="76" r="6" fill="#a0612f"/><path d="M254 82 q-14 -16 -2 -28 M260 80 q-8 -20 6 -28" stroke="#c97a3a" stroke-width="5" fill="none" stroke-linecap="round"/></g></svg>`;
const hRows=()=>{const k=typeof L!=='undefined'&&L?Object.keys(L):[];
  return k.map(x=>[`${L[x].ic||''} ${L[x].name||x}`,L[x].desc||'']).filter(r=>r[1]).slice(0,12)};

function helpChapters(){
  const cuts=HELP_CUTS(),places=hRows();
  return [
  ['goal','The goal',`
    <p>Your partner <b>Riley</b> has brought you home for Thanksgiving weekend to meet the <b>Pemberton</b> family at their split-level house in Beaverton, Oregon. You have five days, Wednesday evening to Sunday noon. Survive the weekend, win the family over, keep Riley happy and keep your sanity.</p>
    <p>The family is weird, never cruel. Be kind, be curious, and eat something.</p>`],
  ['play','How to play',`
    <p><b>Time moves only when you act.</b> Tap an action on the <b>Here</b> tab and the clock moves forward. Open <b>Go somewhere</b> to walk to another room or head out into Beaverton. Check the other tabs now and then, including the <b>Family</b> tab.</p>
    <ul><li><b>Talk to the family.</b> Each person you chat with warms up (up to three hearts) and raises your <b>Charm</b>.</li>
    <li><b>Help out.</b> Linda’s clipboard has chores. Chores earn goodwill and cost energy.</li>
    <li><b>Hide when you need to.</b> The guest room, the backyard and a rainy walk in the nature park all lower your stress.</li>
    <li><b>Go to bed</b> in the guest room. Sleep restores energy. Staying up past midnight ends the day anyway.</li></ul>`],
  ['meters','Your meters',hTable(['Meter','What it means'],[
    ['Cash','Money for a pie, gifts and snacks.'],
    ['Energy','Everything costs some. Sleep and food bring it back.'],
    ['Stress','High is bad. At 100 you have a meltdown and the weekend is over.'],
    ['Charm','How much the family likes you. At 0, Linda asks you to leave.'],
    ['Riley','How Riley is doing. At 0, Riley has had enough.']])+
    hWarn('Three ways to lose','A meltdown (stress 100), a breakup (Riley 0) or being banished (Charm 0).')],
  ['days','The five days',hTable(['Day','What happens'],[
    ['Wed Nov 25','You arrive at 5 PM. Settle in and meet everyone.'],
    ['Thu Nov 26','Thanksgiving. Dinner is at 3 PM sharp. Bring the pie you promised.'],
    ['Fri Nov 27','Black Friday. Everything outside is open again, and busy.'],
    ['Sat Nov 28','The Pemberton Family Games, 2 PM.'],
    ['Sun Nov 29','You leave at noon. Grandma’s final ranking.']])+
    hTip('The pie','You promised to bring one. Buy a store pie at the grocery store, or bake one. Showing up late or empty-handed costs you a lot of charm.')],
  ['places','Places',`<p>Five rooms in the house, and four places out in Beaverton (a car or MAX ride away, 10 to 20 minutes each way). On Thanksgiving almost everything outside is closed, except the grocery store until 4 PM. The mall opens at 6 AM on Friday.</p>${places.length?hTable(['Place','What it is'],places):''}`],
  ['family','The family',`
    <p>Meet them on the <b>Family</b> tab. Each person likes something different, so try talking to everyone. <b>Grandma Marjorie</b> keeps a ranking of every guest on the fridge, and you start at number 14 of 14. Her list updates each night from your charm and your hearts.</p>`],
  ['score','The score',`
    <p>When the weekend ends you get a score and a grade from A to F. Charm, Riley, low stress, hearts, the pie, dinner, the Games and your place on Grandma’s list all count.</p>
    ${cuts?hTable(['Grade','Score at least'],[['A',cuts[0]],['B',cuts[1]],['C',cuts[2]],['D',cuts[3]]].filter(r=>r[1]!=null)):''}
    ${hTip('A good weekend','Decent play earns a B. Skip nothing on Thursday and keep a little energy for the Games.')}`],
  ['more','Saving and more',`
    <ul><li>The game <b>saves itself</b>. ⚙️ Settings has save slots, a transfer code for moving a game to another device, sound and accessibility options.</li>
    <li>Install the game to your home screen from the title screen. It plays offline.</li>
    <li>Ideas or bugs? ${typeof feedbackModal==='function'?'<button class="linkbtn" onclick="feedbackModal()">💬 Send feedback</button>':'Send feedback'} from here, the title screen or ⚙️ Settings.</li></ul>
    <p>All the characters and events are made up. No real families were harmed.</p>`],
  ];
}
const helpId=k=>'tut-'+k;
const tutRM=()=>document.documentElement.classList.contains('rm')||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
// tap a contents link: scroll the guide to that chapter and move focus to its heading (keyboard and screen readers follow along)
window.helpJump=k=>{
  const el=document.getElementById(helpId(k));if(!el)return false;
  try{el.scrollIntoView({block:'start',behavior:tutRM()?'auto':'smooth'})}catch(e){el.scrollIntoView()}
  const h=el.matches('h2,nav')?el:el.querySelector('h2');if(h)try{h.focus({preventScroll:true})}catch(e){}
  return false;
};
function helpDoc(){
  const ch=helpChapters();
  const toc=`<nav class="tut-toc" id="${helpId('toc')}" tabindex="-1" aria-labelledby="tut-toc-h"><h2 id="tut-toc-h">Contents</h2><ol>${ch.map(([k,h],i)=>
    `<li><a href="#${helpId(k)}" onclick="return helpJump('${k}')"><span class="tut-tn">${i+1}</span>${h}</a></li>`).join('')}</ol></nav>`;
  const secs=ch.map(([k,h,t],i)=>`<section class="tut-ch" id="${helpId(k)}" aria-labelledby="${helpId(k)}-h">
    <h2 id="${helpId(k)}-h" tabindex="-1"><span class="tut-n">${i+1}</span><span>${h}</span></h2>${t}
    <a class="tut-up" href="#${helpId('toc')}" onclick="return helpJump('toc')">↑ Back to contents</a></section>`).join('');
  return `<article class="tut-doc"><header class="tut-cover">${HSVG_COVER()}<h1 id="tut-h">How to play ${esc(GAME.title)}</h1>
    <p class="tut-lede">A short guide to surviving the weekend: ${ch.length} short chapters.</p>
    <p class="tut-small">Version ${APP_VERSION}.</p></header>${toc}${secs}
    <footer class="tut-foot"><p>Beaverton is a real place. The Pembertons, their house and everything that happens in it are made up, written with love.</p></footer></article>`;
}
let TUT_RET=null;
function helpClose(){
  const el=document.getElementById('tut');if(!el)return;
  el.remove();document.documentElement.classList.remove('tut-open');
  const a=document.getElementById('app');if(a&&!document.getElementById('mbg'))a.removeAttribute('inert');
  const r=TUT_RET;TUT_RET=null;
  const back=(r&&document.body.contains(r)&&r.offsetParent!==null)?r:document.getElementById('helpBtn');
  if(back)try{back.focus({preventScroll:true})}catch(e){}
}
window.helpClose=helpClose;
window.helpPrint=()=>{try{window.print()}catch(e){}};
function helpModal(){
  if(document.getElementById('tut'))return helpJump('toc');
  const ae=document.activeElement;TUT_RET=ae&&ae!==document.body&&!ae.closest('#mbg')?ae:null;
  const el=document.createElement('div');el.className='tut';el.id='tut';
  el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','tut-h');el.tabIndex=-1;
  el.innerHTML=withName(`<div class="tut-bar"><button class="tut-x" onclick="helpClose()" aria-label="Close the guide">✕ Close</button>
    <button class="tut-pr" onclick="helpPrint()">📄 Print / save as PDF</button></div>${helpDoc()}`);
  // keys stay inside the guide: Esc closes it, Tab cycles through its links and buttons, and game shortcuts don't fire behind it
  el.addEventListener('keydown',e=>{
    if(document.getElementById('mbg'))return;
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();helpClose();return}
    if(e.key!=='Tab')return;
    const f=[...el.querySelectorAll(FOCUSABLE)].filter(x=>x.offsetParent!==null);if(!f.length)return;
    const first=f[0],last=f[f.length-1],cur=document.activeElement;
    if(!el.contains(cur)||cur===el){e.preventDefault();(e.shiftKey?last:first).focus();return}
    if(e.shiftKey&&cur===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&cur===last){e.preventDefault();first.focus()}});
  document.body.appendChild(el);document.documentElement.classList.add('tut-open');
  const inert=()=>{const a=document.getElementById('app');if(a&&document.getElementById('tut'))a.setAttribute('inert','')};
  inert();
  // opened from a pop-up (⚙️ Settings → Help): that pop-up's close hands focus back and un-inerts the game afterwards, so take both back
  setTimeout(()=>{if(!document.body.contains(el))return;inert();if(!document.getElementById('mbg'))try{el.querySelector('.tut-x').focus({preventScroll:true})}catch(e){}},40);
}
window.helpModal=helpModal;
