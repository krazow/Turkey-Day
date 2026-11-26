// ============================================================
//  THANKSGIVING AT WEIRD PEOPLE'S HOUSE, part 2: what happens.
//  The title screen, lifecycle hooks, Thanksgiving dinner, the Pemberton Family Games, the goodbye,
//  random events, tips, the to-do list, achievements, scoring and save migrations.
//  Wed Nov 25 – Sun Nov 29, 2026, at the Pembertons' split-level in Beaverton, Oregon.
// ============================================================

// ---- small helpers (atHouse, weird, heartsTotal, calm, spend come from 20-world.js) ----
const FAM_N={linda:'Linda',gary:'Gary',marjorie:'Grandma Marjorie',dez:'Uncle Dez',bev:'Aunt Bev',tanner:'Tanner',biscuit:'Biscuit'};
const stDate=d=>typeof augDate==='function'?augDate(d):`${dayName(d)}`;
const stPass=m=>{if(tod()+m<1410)pass(m)};   // an option's time, skipped late at night so a defaulted choice never runs past bedtime
const stCalm=n=>{if(typeof calm==='function')calm(n);else adj('stress',-n)};
const stSpend=n=>{if(typeof spend==='function')spend(n);else{money(-n);S.stats.spent=(S.stats.spent||0)+n}};
const stCost=n=>Math.round(n*DF().cost);
// hearts with a family member (0–3)
function stHeart(k,n=1){if(!S.fam||!(k in S.fam))return;const o=S.fam[k];S.fam[k]=clamp(o+n,0,3);
  if(S.fam[k]>o)say(`💛 ${FAM_N[k]} likes you a little more (${'♥'.repeat(S.fam[k])}${'♡'.repeat(3-S.fam[k])}).`)}
const stFlag=k=>(S.flags||{})[k];
const stSet=(k,v=true)=>{S.flags=S.flags||{};S.flags[k]=v};
const seen=id=>(S.ev.count[id]||0)>0;

// ---- title screen ----
const TITLE={
  start:'🦃 New game',
  intro:'Your partner Riley is bringing you home for Thanksgiving. Five days at the Pembertons’ split-level in Beaverton, Oregon: '+
    'a laminated schedule, a turkey fryer in the driveway, a garage radio studio, 212 porcelain dolls in the guest room and a corgi '+
    'in a new outfit every meal. Grandma keeps a ranking of every guest who ever came to dinner. You start at #14 of 14.',
  bullets:[
    '🥧 You promised a pie for Thursday. Bake it or buy it, but bring it.',
    '🍽️ Dinner is at <b>3:00 PM sharp</b> on Thursday. Linda has a clipboard.',
    '🎲 Saturday at 2:00 PM: the Pemberton Family Games. Charades. Trivia. Grandma plays to win.',
    '💛 Talk to everyone, help out, win hearts and climb the fridge list.',
    '❤️ Keep Riley happy and keep your sanity. Hide in the guest room when you need to.',
  ],
  note:'A made-up family in a real suburb. Everyone is weird, nobody is mean.',
  art:()=>`<svg viewBox="0 0 480 250" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%" aria-hidden="true">
    <defs><linearGradient id="tks" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8892"/><stop offset="1" stop-color="#c3c9cc"/></linearGradient></defs>
    <rect width="480" height="250" fill="url(#tks)"/>
    ${[30,70,420,455].map((x,i)=>`<polygon points="${x},${60+i%2*14} ${x-26},${190} ${x+26},${190}" fill="#2f4a3a"/>`).join('')}
    <rect y="190" width="480" height="60" fill="#55705a"/><rect x="200" y="196" width="90" height="54" fill="#6b6e70"/>
    <g transform="translate(120,92)">
      <rect x="0" y="40" width="120" height="70" fill="#b9a68a"/><polygon points="-8,42 60,6 128,42" fill="#5b4a3e"/>
      <rect x="120" y="66" width="110" height="44" fill="#c8b597"/><polygon points="114,68 175,40 236,68" fill="#5b4a3e"/>
      ${[[14,56],[76,56],[136,78],[192,78]].map(([x,y])=>`<rect x="${x}" y="${y}" width="26" height="20" fill="#f6dc9a"/>`).join('')}
      <rect x="50" y="80" width="20" height="30" fill="#7a3b2a"/>
      <path d="M-8 42 Q16 52 40 42 Q64 52 88 42 Q112 52 128 42" stroke="#333" fill="none"/>
      ${[0,1,2,3,4,5,6,7].map(i=>`<circle cx="${-4+i*17}" cy="${46+(i%2)*3}" r="3" fill="${['#f4c542','#e2574c','#5fb0e6','#7bd17b'][i%4]}"/>`).join('')}
    </g>
    <g transform="translate(330,205)">
      ${[-60,-30,0,30,60].map((a,i)=>`<ellipse cx="0" cy="-28" rx="11" ry="30" fill="${['#a0522d','#d2843f','#e8b04a','#d2843f','#a0522d'][i]}" transform="rotate(${a} 0 0)"/>`).join('')}
      <ellipse cx="0" cy="0" rx="22" ry="18" fill="#7a4a2a"/><circle cx="18" cy="-18" r="8" fill="#8a5a3a"/>
      <path d="M24 -18 l8 3 l-8 3 z" fill="#f0a830"/><path d="M22 -13 q4 8 0 12" stroke="#d33" stroke-width="4" fill="none"/>
      <circle cx="20" cy="-20" r="1.6" fill="#111"/><path d="M-6 16 v10 M6 16 v10" stroke="#e0a030" stroke-width="3"/>
    </g>
    <g stroke="#e8eef2" stroke-width="1.2" opacity=".55">${Array.from({length:40},(_,i)=>`<line x1="${(i*53)%480}" y1="${(i*37)%200}" x2="${(i*53)%480-6}" y2="${(i*37)%200+16}"/>`).join('')}</g>
  </svg>`,
};

// ---- lifecycle hooks (04-loop.js) ----
function onNewGame(){
  S.cur=0;S.t=1020;S.loc='guest';   // Wednesday, 5:00 PM: you pull into the driveway
  say(`${stDate(0)}, 5:00 PM. Rain on the windshield, a turkey fryer under a tarp in the driveway, and a corgi in a tiny raincoat at the window. You’re here.`);
  modal('❤️ A text from Riley, in the driveway',`<p>“Okay. Before we go in. I love them. They are a LOT.”</p>
    <p>“<b>Mom (Linda)</b> runs Thanksgiving off a laminated clipboard. <b>Dad (Gary)</b> will deep-fry anything that holds still. <b>Grandma Marjorie</b> ranks every guest on the fridge. You’re #14. Everyone starts at #14.”</p>
    <p>“<b>Uncle Dez</b> lives in the garage radio studio. Don’t ask about Daylight Saving. <b>Aunt Bev</b> will try to sell you oils. <b>Tanner</b> will explain crypto. <b>Biscuit</b> is the corgi. Biscuit is perfect.”</p>
    <p>“You said you’d bring a <b>pie</b> Thursday. Dinner is <b>3:00 PM sharp</b>. Saturday at 2 is the Family Games. We leave Sunday at noon.”</p>
    <p>“You’re sleeping in Mom’s craft room. With the dolls. I’m so sorry. 💛”</p>`,[{l:'🚪 Ring the doorbell',fn:()=>{}}],true);
}
const MORNINGS=['🌧️ Rain. Soft, steady, Beaverton rain. It will do this all day.','🌫️ Fog in the firs out back. The string lights glow in it.',
  '☁️ A grey so even it looks painted on.','🐿️ A squirrel is staring at the turkey fryer like it knows something.','📻 Faint static from the garage. Dez is up.',
  '☕ The coffee maker in the kitchen beeps eleven times. Nobody knows why.','🪆 The dolls are exactly where they were. Probably.'];
const DAY_NOTE=[
  '',
  '🦃 <b>Thanksgiving.</b> Dinner is at <b>3:00 PM sharp</b> in the living room. Bring the pie. Everything outside is closed except the grocery store (until 4 PM).',
  '🛍️ <b>Black Friday.</b> Washington Square opened at 6 AM. The leftovers are in the fridge, and the leftover politics have begun.',
  '🎲 <b>Family Games day.</b> 2:00 PM in the living room. Grandma has been stretching.',
  '🧳 <b>Sunday.</b> You leave at <b>noon</b>. Last chances to climb the fridge list.'];
function onMorning(d){
  if(d===0) return;
  say(`${stDate(d)}, ${fmt(S.t)}. ${pick(MORNINGS)}`);
  if(DAY_NOTE[d]) say(DAY_NOTE[d]);
  if(d===1&&!S.pie.have) say('🥧 You still don’t have the pie. The grocery store on Cedar Hills Blvd closes at 4. Dinner is at 3.');
}
function onTime(min){
  if(min>0)adj('energy',-min/50);   // being awake is tiring
  stSceneCheck();
}
function onArrive(dest,from){
  if(S.flags.scene){S.loc='living';return}   // a scene started on the way out: you never made it out the door
  if(!atHouse(dest)) S.stats.trips=(S.stats.trips||0)+1;
  stSceneCheck();
}
function onNight(where,notes,d){
  if(where==='collapsed'){S.loc='guest';weird(8);adj('riley',-3);notes.push('😵 You fell asleep sitting up on the couch. Biscuit sat on your feet all night. Linda put a blanket on you and a sticky note: “BED IS UPSTAIRS.”')}
  const early=tod()<1380,inGuest=where!=='collapsed';
  adj('energy',inGuest?(early?60:48):30);
  if(inGuest)stCalm(early?10:6);
  if(inGuest&&early) notes.push('🛏️ The futon is lumpy, the dolls are watching, and you sleep like a log anyway.');
  if(d===1&&!S.dinner.done){S.dinner.done=true;S.dinner.late=true;stSet('dinnerMissed');adj('charm',-18);adj('riley',-15);weird(10);
    notes.push('🍽️ You missed Thanksgiving dinner. Linda wrapped you a plate with a note: “We waited.” Riley isn’t talking much. Charm −18, Riley −15.')}
  if(d===3&&!S.games.done){S.games.done=true;stSet('gamesMissed');adj('charm',-10);adj('riley',-8);
    notes.push('🎲 You skipped the Family Games. Grandma won anyway and seemed disappointed about it. Charm −10, Riley −8.')}
  if(S.stress>=75){adj('riley',-3);notes.push('😬 Riley can tell you’re fried. “Take an hour tomorrow. Hide in the guest room. It’s allowed.”')}
  if(S.charm>=60&&S.riley<95){adj('riley',3);notes.push('❤️ Riley, half asleep: “They like you. Grandma asked if you’re coming back.”')}
  stRerank(notes);
  if(S.flags.scene&&S.flags.scene!=='farewell')stSet('scene',false);
  if(d===4&&!S.flags.leaving)stSet('invited',S.charm>=45&&S.rank<=8);
}
// Grandma re-ranks you every night from charm and hearts (1 is best), moving at most 5 places a night
function rankTarget(){return clamp(Math.round(14-(S.charm+4*heartsTotal()-30)/8),1,14)}
function stRerank(notes){
  const old=S.rank,t=rankTarget(),n=clamp(t,old-5,old+3);S.rank=n;
  const msg=n<old?`up ${old-n} 🎉`:n>old?`down ${n-old} 😬`:'no change';
  notes.push(`📋 Grandma updates the fridge list in her neat cursive. You’re <b>#${n} of 14</b> (${msg}).${n===1?' Above Doug the mail carrier, 1997. Historic.':''}`);
}
function daySummary(d){return [`⚡ ${S.energy}`,`🧠 ${100-S.stress}`,`💛 ${S.charm}`,`❤️ ${S.riley}`,`📋 #${S.rank}`]}
const DAY_TAG=['Arrival','Thanksgiving','Black Friday','Family Games','Going home'];
function hudDay(d){return `${DAY_TAG[d]||`Day ${d+1}`} · ${stDate(d)}`}

// ---- the big scenes: Thanksgiving dinner (Thu 3 PM) and the Family Games (Sat 2 PM) ----
const SCENES={dinner:{d:1,at:900,until:1140,ic:'🍽️',name:'Thanksgiving dinner'},games:{d:3,at:840,until:1020,ic:'🎲',name:'the Family Games'}};
function stSceneCheck(){
  if(!S||S.over)return;
  if(S.flags.scene){   // a scene whose pop-up is gone (a reload, or the night closed it): pick it up again
    if(DIGEST||document.getElementById('mbg')||MQ.length)return;
    const k=S.flags.scene;stSet('scene',false);if(k==='farewell')return finish();
  }
  const d=day(),m=tod();
  if(d===4&&m>=720&&!S.flags.leaving) return stFarewell();
  for(const k in SCENES){const c=SCENES[k],st=S[k];
    if(d!==c.d||st.done||m<c.at)continue;
    if(atHouse()&&m<c.until) return stScene(k);
    if(!atHouse()&&!stFlag(k+'Texted')){stSet(k+'Texted');st.late=true;adj('riley',-4);
      say(`📱 Riley: “${k==='dinner'?'Dinner. Is. NOW. Mom is holding the gravy hostage.':'Games are starting!! Grandma is doing stretches.'} Where are you??”`)}}
}
// a scene: a list of steps, each one pop-up of choices; the steps swap in place (stay:true + modalSwap)
function stScene(k){
  const c=SCENES[k];stSet('scene',k);S.loc='living';
  const steps=k==='dinner'?dinnerSteps():gamesSteps();let i=0;
  const show=()=>{const s=steps[i];
    const btns=s.opts().map(o=>({l:o.l,s:o.s,np:true,dis:!!o.dis,stay:true,fn:()=>{o.fn();i++;i<steps.length?show():done()}}));
    modalSwap(`${c.ic} ${s.t}`,s.body(),btns,true)};
  const done=()=>{stSet('scene',false);(k==='dinner'?dinnerEnd:gamesEnd)()};
  show();
}
window.stScene=stScene;

function dinnerSteps(){
  const late=S.dinner.late;
  return [
    {t:late?'Dinner (you’re late)':'Dinner is served',body:()=>(late?'<p>Everyone is already seated. Linda makes a small, precise mark on the clipboard. Charm −8.</p>':'<p>3:00 PM exactly. Linda checks the clipboard and nods at you. On time. A rare thing.</p>')+
      '<p>Seventeen dishes, four of them deep-fried. Biscuit is under the table dressed as a pilgrim. Linda taps her glass: “Our guest will give the toast.”</p>',
      opts:()=>{if(late){adj('charm',-8)}return [
        {l:'💛 A heartfelt toast',s:'About Riley, and family. Charm +6, Riley +6.',fn:()=>{adj('charm',6);adj('riley',6);stHeart('marjorie');say('🥂 You keep it short and mean every word. Grandma dabs an eye with a napkin shaped like a turkey.')}},
        {l:'🐕 A toast to Biscuit’s outfit',s:'Risky but funny. Charm +4.',fn:()=>{adj('charm',4);stHeart('biscuit');stHeart('gary');say('🐕 “To Biscuit, who dressed for the occasion.” Gary laughs so hard he has to stand up. Biscuit barks once, formally.')}},
        {l:'🙂 “Cheers, everybody!”',s:'Safe. Charm +2, stress −3.',fn:()=>{adj('charm',2);stCalm(3);say('🙂 Short and sweet. Linda checks “toast” off the clipboard.')}}]}},
    {t:'Uncle Dez has a theory',body:()=>'<p>Between the yams and the fried green beans, Dez leans in. “Daylight Saving Time. Who benefits? <b>The clock industry.</b> Twice a year, every clock in America needs a human hand. Think about it.”</p>',
      opts:()=>[
        {l:'🤔 Ask a follow-up question',s:'He lights up. Dez ♥, stress +4.',fn:()=>{stHeart('dez');weird(4);say('🤔 “What about phones? They change themselves.” Dez points his fork at you. “Exactly. Who do you think makes the phones’ clocks?” He’s delighted.')}},
        {l:'🏈 Change the subject to football',s:'Gary ♥. Charm +2.',fn:()=>{stHeart('gary');adj('charm',2);say('🏈 “How about that game, though?” Gary, gratefully, takes over. Dez mutters “classic misdirection.”')}},
        {l:'⏰ “It’s actually about farmers.”',s:'Dez loves a debate. Dez ♥, Linda not so much. Charm −2.',fn:()=>{stHeart('dez');adj('charm',-2);weird(3);say('⏰ It goes on for twenty minutes. Linda refills the gravy with a little more force than necessary.')}}]},
    {t:'Aunt Bev’s pitch',body:()=>`<p>Bev passes the rolls and, in the same motion, a small brown bottle. “Peppermint. For digestion. The starter kit is only ${$(stCost(49))}, and you’d be on my team.”</p>`,
      opts:()=>{const c=stCost(49);return [
        {l:`🧴 Buy the starter kit (${$(c)})`,s:'Bev ♥♥. Charm +3.',dis:S.money<c||stFlag('kit'),fn:()=>{stSpend(c);stSet('kit');stHeart('bev',2);adj('charm',3);say('🧴 Bev hugs you across the table. You now own eleven tiny bottles and a laminated card about your “upline.”')}},
        {l:'👃 Take a free sample',s:'Bev ♥. Stress −3.',fn:()=>{stHeart('bev');stCalm(3);say('👃 The peppermint is honestly nice. Bev winks: “Day one.”')}},
        {l:'🙏 “Maybe after dinner.”',s:'Polite. Nothing changes.',fn:()=>{say('🙏 “After dinner,” Bev agrees, in the voice of someone who will remember.')}}]}},
    {t:'The pie reveal',body:()=>S.pie.have?(S.pie.kind==='homemade'?'<p>You set your homemade pie on the table. The crust is uneven. It smells incredible. Grandma Marjorie leans in to inspect it.</p>':'<p>You set down your pie. It’s in a plastic dome with a price sticker you missed. Grandma Marjorie leans in to inspect it.</p>'):'<p>Linda looks at the clipboard. “And the pie?” Everyone turns. You did not bring the pie.</p>',
      opts:()=>{const p=S.pie;
        if(p.have&&p.kind==='homemade')return [
          {l:'🥧 “I made it this morning.”',s:'Charm +10, Grandma ♥.',fn:()=>{adj('charm',10);stHeart('marjorie');stHeart('linda');say('🥧 Grandma takes a bite, closes her eyes, and writes something on her napkin. Riley squeezes your hand.')}},
          {l:'😅 “It’s my first try.”',s:'Humble. Charm +8, Riley +3.',fn:()=>{adj('charm',8);adj('riley',3);stHeart('marjorie');say('😅 “You can tell,” Grandma says, “and that’s the best kind.” She has seconds.')}}];
        if(p.have)return [
          {l:'🏪 “It’s from the grocery store!”',s:'Honest. Charm +4.',fn:()=>{adj('charm',4);say('🏪 “Honest,” Grandma says. “I like honest.” Gary has two slices.')}},
          {l:'🤥 Pretend you baked it',s:'50/50. Charm +7 or −8.',fn:()=>{if(Math.random()<0.5){adj('charm',7);say('🤥 Nobody spots the sticker. Grandma nods slowly. You will carry this forever.')}else{adj('charm',-8);adj('riley',-4);say('🤥 Grandma peels the price sticker off the dome and holds it up without a word. Charm −8.')}}}];
        return [
          {l:'😔 Confess and apologize',s:'Charm −8, Riley −4.',fn:()=>{adj('charm',-8);adj('riley',-4);say('😔 “I’m so sorry.” Linda writes “PIE?” on the clipboard and underlines it twice.')}},
          {l:'🍪 Offer to do every dish tonight',s:'Charm −4, energy −15.',fn:()=>{adj('charm',-4);adj('energy',-15);stHeart('linda');say('🍪 You wash dishes until 7. Linda dries, silently, then says: “Okay. You’re forgiven.”')}}]}},
  ];
}
function dinnerEnd(){
  S.dinner.done=true;S.stats.meals=(S.stats.meals||0)+1;stPass(90);adj('energy',18);
  if(!S.dinner.late){adj('charm',6);say('✅ On time for dinner. Linda puts a small star next to your name. Charm +6.')}
  say('🍽️ Dinner is over. Everyone is lying on a different piece of furniture. Biscuit is asleep in the pilgrim hat.');
  modal('🍽️ Thanksgiving: done',`<p>You survived Thanksgiving dinner at the Pembertons’.</p><p>💛 Charm ${S.charm} · ❤️ Riley ${S.riley} · 🧠 Sanity ${100-S.stress}</p>`,[{l:'😮‍💨 Loosen your belt',fn:()=>{}}]);
}

// the Family Games: four points up for grabs; 3 wins. Trivia answers are marked for family you’ve talked to.
const TRIVIA=[
  {k:'dez',q:'What did Uncle Dez name his radio show?',a:['Dez After Dark','The Frequency Files','Garage Waves'],c:1},
  {k:'gary',q:'What has Gary deep-fried, besides turkey?',a:['A whole birthday cake','A watermelon','A pickle the size of a forearm'],c:0},
  {k:'linda',q:'What color is Linda’s clipboard?',a:['Harvest orange','Navy','Clear, laminated twice'],c:2},
  {k:'bev',q:'What is Bev’s best-selling oil called?',a:['Calm Down Carol','Peppermint Patrol','Lavender Lou'],c:0},
];
function gamesSteps(){
  S.games.pts=0;const pt=()=>{S.games.pts++;say('🏅 A point for your team!')};
  const q=TRIVIA.slice().sort(()=>Math.random()-0.5).slice(0,2);
  const trivia=t=>({t:'Pemberton trivia',body:()=>`<p>Tanner reads from an index card: “${t.q}”</p>${S.fam[t.k]>=1?`<p><i>You remember ${FAM_N[t.k]} mentioning this.</i></p>`:''}`,
    opts:()=>t.a.map((a,j)=>({l:`${S.fam[t.k]>=1&&j===t.c?'💡 ':''}${a}`,s:'',fn:()=>{if(j===t.c){pt();stHeart(t.k)}else say(`❌ The answer was “${t.a[t.c]}.” ${FAM_N[t.k]} looks a little hurt.`)}}))});
  return [
    {t:'The Family Games: charades',body:()=>`<p>2:00 PM. ${S.games.late?'You slide in late. ':''}Teams: you and Riley and Tanner against Grandma, Dez and Bev. Gary keeps score on Linda’s clipboard. Your card says: <b>“TURKEY FRYER.”</b></p>`,
      opts:()=>[
        {l:'🔥 Go big: become the fryer',s:'Full commitment. Likely a point. Energy −6.',fn:()=>{adj('energy',-6);if(Math.random()<0.75){pt();stHeart('gary');say('🔥 You bubble. You hiss. You mime a fire extinguisher. Riley yells “FRYER!” Gary is very moved.')}else say('🔥 Tanner guesses “jacuzzi.” Time.')}},
        {l:'🦃 Act out a turkey, then point at the driveway',s:'Clever. A fair chance.',fn:()=>{if(Math.random()<0.55){pt();say('🦃 Riley gets it from the driveway point. Teamwork.')}else say('🦃 “Biscuit?” Biscuit, hearing his name, runs in. Time.')}},
        {l:'😶 Stand still and make a small bubbling noise',s:'Low effort. Low odds. Stress −2.',fn:()=>{stCalm(2);if(Math.random()<0.25){pt();say('😶 Somehow Dez on the OTHER team shouts it. Gary rules it counts.')}else say('😶 Silence. A doll upstairs probably understood.')}}]},
    trivia(q[0]),trivia(q[1]),
    {t:'The final round: Grandma',body:()=>`<p>Score: you ${S.games.pts}, Grandma’s team ${Math.max(0,3-S.games.pts)}. The last point is a head-to-head speed round against <b>Grandma Marjorie</b>. She cracks her knuckles.</p>`,
      opts:()=>[
        {l:'🏃 Go for it',s:'You might win. Grandma respects a fighter.',fn:()=>{if(Math.random()<0.5){pt();stHeart('marjorie');say('🏃 You win by half a second. Grandma shakes your hand like a coach.')}else say('🏃 Grandma wins. She does a small, dignified fist pump.')}},
        {l:'👵 Let Grandma win (subtly)',s:'No point. Charm +5, Grandma ♥.',fn:()=>{adj('charm',5);stHeart('marjorie');say('👵 You hesitate one beat too long. Grandma notices, and pats your cheek. “Sweet. Don’t do it again.”')}}]},
  ];
}
function gamesEnd(){
  const g=S.games;g.done=true;g.won=g.pts>=3;stPass(60);
  if(g.won){adj('charm',8);adj('riley',5);say(`🏆 Your team wins the Pemberton Family Games, ${g.pts} points! Your name goes on the trophy (a gravy boat). Charm +8.`)}
  else{adj('charm',3);stCalm(4);say(`🎲 Grandma’s team wins (you got ${g.pts}). Everyone agrees you were a good sport. Charm +3.`)}
  modal(g.won?'🏆 Champions':'🎲 Good game',`<p>${g.won?'The gravy boat is yours until next year.':'There is always next year. Grandma says so, pointedly, which is a good sign.'}</p>`,[{l:'OK',fn:()=>{}}]);
}
// Sunday noon: the goodbye (also callable from a "Leave early" action)
function stFarewell(){
  if(S.flags.leaving)return;stSet('leaving');stSet('scene','farewell');
  S.rank=clamp(rankTarget(),S.rank-3,S.rank+2);
  const inv=S.charm>=45&&S.rank<=8;stSet('invited',inv);
  modal('🧳 Sunday, noon: time to go',`<p>Riley’s car is packed. The whole family is in the driveway in the rain, under one big golf umbrella that Gary holds.</p>
    <p>Grandma Marjorie unpins the fridge list and shows you: <b>#${S.rank} of 14</b>.${S.rank===1?' First place. Doug the mail carrier has been dethroned.':''}</p>
    <p>${inv?'Linda hands you a laminated card: <b>“THANKSGIVING 2027. YOU’RE INVITED. 3:00 PM SHARP.”</b>':'Linda hands you a foil-wrapped plate. “Drive safe.” It’s kind. It’s not an invitation.'}</p>
    <p>Biscuit, in a tiny raincoat, sits on your foot until the very last second.</p>`,[{l:'👋 Wave goodbye',fn:()=>finish()}],true);
}
window.stFarewell=stFarewell;

// ---- losing ----
let LOSSES={
  meltdown:['Meltdown','Somewhere between the fourth deep-fried thing and the 212th doll, something gave. You walk to the MAX station in your socks and take the train to the airport. Riley understands. Mostly.'],
  breakup:['Riley needs some space','On the drive to the grocery store, Riley goes quiet, then says it: “I think this weekend showed us some things.” You still have Biscuit’s respect. That’s something.'],
  banished:['Asked to leave','Linda finds you in the guest room with the clipboard held to her chest. “We think it’s best if you head home early.” Grandma moves you to #15. There wasn’t a #15 before.'],
};
function checkLoss(){if(S.stress>=100)return 'meltdown';if(S.riley<=0)return 'breakup';if(S.charm<=0)return 'banished';return null}

// ---- random events (03-events.js). Hooks: wake, arrive {at,from}, travel {from,to}, night {where,notes} ----
const daytime=()=>tod()>=540&&tod()<1200, evening=()=>tod()>=1080&&tod()<1350;
defEvent({id:'biscuit_outfit',hook:'wake',tile:['🐕','Biscuit’s outfit','good'],chance:0.6,cooldown:1,cond:()=>day()>0,
  run:()=>{say(`🐕 Biscuit trots past the guest room in today’s outfit: ${pick(['a tiny sweater vest','a pilgrim hat with a buckle','a pie costume (pumpkin)','a raincoat with a hood that has ears','a bow tie and nothing else'])}. He seems to know he looks good.`)},
  choices:()=>[{ic:'😍',l:'Tell him he looks great',s:'A minute. Biscuit ♥ (sometimes).',fn:()=>{if(Math.random()<0.5)stHeart('biscuit');stCalm(2);say('😍 Biscuit accepts the compliment with a slow blink.')}},
    {ic:'🚶',l:'Keep going',s:'Nothing changes.',fn:()=>{}}],dflt:1});
defEvent({id:'doll_moved',hook:'wake',tile:['🪆','The doll that moved','bad'],chance:0.4,max:2,cooldown:1,cond:()=>day()>0&&S.loc==='guest',
  run:()=>{say('🪆 You wake up. One of the 212 porcelain dolls is facing you. You are almost positive it was facing the wall last night.')},
  choices:()=>[
    {ic:'🔄',l:'Turn it back around',s:'Stress +3.',fn:()=>{weird(3);say('🔄 You turn it to face the wall. You hear nothing. That’s worse.')}},
    {ic:'👋',l:'Say good morning to it',s:'Sanity, in a way. Stress −2.',fn:()=>{stCalm(2);stSet('dollFriend');say('👋 “Morning.” You decide it’s your friend now. Her name is Constance.')}},
    {ic:'📋',l:'Ask Linda about it',s:'Linda ♥, 15 minutes.',fn:()=>{stPass(15);stHeart('linda');say('📋 Linda tells you its whole history. It was her mother’s. It moves “when it likes someone.” She seems pleased.')}}],dflt:0});
defEvent({id:'linda_clipboard',hook:'wake',tile:['📋','Your name is on the clipboard','info'],chance:1,max:1,cond:()=>day()===1,
  run:()=>{say('📋 Linda knocks at 8:01. The clipboard says: <b>Guest: napkin folding (swans), ice run, keep Gary away from the oven.</b>')},
  choices:()=>[
    {ic:'💪',l:'Volunteer for one more job',s:'Linda ♥, charm +3, energy −6.',fn:()=>{stHeart('linda');adj('charm',3);adj('energy',-6);S.stats.chores=(S.stats.chores||0)+1;say('💪 Linda adds a line, “gravy backup,” and almost smiles.')}},
    {ic:'👍',l:'“Got it!”',s:'Nothing extra.',fn:()=>{say('👍 Linda taps the clipboard twice and moves on.')}}],dflt:1});
defEvent({id:'fridge_check',hook:'wake',tile:['📋','Grandma’s fridge list','info'],chance:0.5,cooldown:1,cond:()=>day()>0,
  run:()=>{say(`📋 You check the fridge list on the way to coffee. You’re <b>#${S.rank}</b>. #1 has been “Doug (mail carrier), 1997” for decades. Grandma is watching you read it.`)}});
defEvent({id:'gary_fries',hook:'wake',tile:['🔥','Gary fries the leftovers','good'],chance:1,max:1,cond:()=>day()===2,
  run:()=>{say('🔥 Gary has the fryer going at 9 AM. He is deep-frying a slice of pumpkin pie. He has a look in his eyes.')},
  choices:()=>[
    {ic:'🥧',l:'Try the fried pie',s:'Gary ♥, energy +8, stress +2.',fn:()=>{stHeart('gary');adj('energy',8);weird(2);say('🥧 It is… actually amazing? Gary nods. “Nobody believes until they try.”')}},
    {ic:'🥗',l:'Have a salad instead',s:'Stress −2.',fn:()=>{stCalm(2);say('🥗 Gary looks at the salad like it owes him money.')}}],dflt:1});
defEvent({id:'tanner_coin',hook:'wake',tile:['🪙','TurkeyCoin update','info'],max:1,
  run:()=>{const up=Math.random()<0.4,v=up?stCost(35):3;money(v);
    say(up?`🪙 Tanner bursts in: TurkeyCoin is UP. Your $20 is worth ${$(v)}. He hugs you. “We’re early.”`:`🪙 Tanner, quietly: TurkeyCoin is… resting. Your $20 is worth ${$(v)}. He gives it to you in cash, which is decent of him.`)}});
defEvent({id:'fryer_flare',hook:'arrive',tile:['🔥','Fryer flare-up','bad'],chance:0.7,max:1,bad:true,urgent:true,cond:c=>c.at==='backyard'&&day()<=2&&daytime(),
  run:()=>{say('🔥 WHOOMP. The fryer in the driveway throws a tall yellow flame. Gary is inside looking for a thermometer.')},
  choices:()=>[
    {ic:'🧯',l:'Grab the extinguisher and handle it',s:'Gary ♥, charm +4, energy −4.',fn:()=>{stHeart('gary');adj('charm',4);adj('energy',-4);say('🧯 Lid on, gas off, crisis over. Gary comes out and salutes you with the thermometer.')}},
    {ic:'📣',l:'Back away and yell for Gary',s:'Safe. Stress +5.',fn:()=>{weird(5);say('📣 Gary jogs out, turns the gas down, and says “she does that.” She?')}},
    {ic:'📱',l:'Film it for Tanner',s:'Tanner ♥, charm −2.',fn:()=>{stHeart('tanner');adj('charm',-2);say('📱 Tanner posts it. Linda sees it. Linda is not a fan.')}}],dflt:1});
defEvent({id:'hot_tub',hook:'arrive',tile:['♨️','The hot tub “works now”','info'],chance:0.4,max:1,cond:c=>c.at==='backyard',
  run:()=>{say('♨️ Gary pulls the cover off the hot tub with a flourish. “Works now!” It is full of cold rainwater and one fir cone.')},
  choices:()=>[
    {ic:'🥶',l:'Get in anyway',s:'Gary ♥♥, charm +3, stress +5.',fn:()=>{stHeart('gary',2);adj('charm',3);weird(5);say('🥶 You get in. Gary gets in. You both say “refreshing” through chattering teeth.')}},
    {ic:'🔧',l:'Help him fix the heater',s:'40 minutes. Gary ♥, energy −8.',fn:()=>{stPass(40);stHeart('gary');adj('energy',-8);say('🔧 You find the breaker. It warms to “almost lukewarm.” Gary calls it a team win.')}},
    {ic:'🙅',l:'“Maybe tomorrow!”',s:'Nothing.',fn:()=>{say('🙅 Gary puts the cover back on, unbothered. “Tomorrow, then.”')}}],dflt:2});
defEvent({id:'biscuit_roll',hook:'arrive',tile:['🥖','Biscuit steals a roll','info'],chance:0.25,cooldown:1,cond:c=>['kitchen','living'].includes(c.at),
  run:()=>{say('🥖 A blur of corgi. Biscuit has a dinner roll and is heading for the stairs at full speed.')},
  choices:()=>[
    {ic:'🏃',l:'Chase him',s:'Energy −5, charm +2.',fn:()=>{adj('energy',-5);adj('charm',2);say('🏃 You corner him on the landing. He drops the roll and bows. Everyone saw. They clap.')}},
    {ic:'🦴',l:'Trade him a treat for it',s:'Biscuit ♥.',fn:()=>{stHeart('biscuit');say('🦴 A fair trade. Biscuit respects a negotiator.')}},
    {ic:'🤫',l:'Let him have it. Say nothing.',s:'Biscuit ♥, stress +2.',fn:()=>{stHeart('biscuit');weird(2);say('🤫 Your secret. Biscuit will remember this.')}}],dflt:2});
defEvent({id:'power_blip',hook:'arrive',tile:['💡','A power blip','bad'],chance:0.08,max:1,bad:true,cond:c=>atHouse(c.at)&&tod()>=960,
  run:()=>{say('💡 The lights flicker and go out. In the dark, from the garage, Dez’s voice: “The grid knows.”')},
  choices:()=>[
    {ic:'🔦',l:'Find the flashlights',s:'Charm +3.',fn:()=>{adj('charm',3);say('🔦 You find them in the junk drawer, labeled by Linda: FLASHLIGHT 1–4. The power comes back.')}},
    {ic:'👻',l:'Tell ghost stories with Tanner',s:'Tanner ♥, stress +3.',fn:()=>{stHeart('tanner');weird(3);say('👻 Tanner’s story is about a haunted crypto wallet. It is strangely scary.')}},
    {ic:'❤️',l:'Sit in the dark with Riley',s:'Riley +5, stress −4.',fn:()=>{adj('riley',5);stCalm(4);say('❤️ Two minutes of quiet in the dark, holding hands. Then the TV comes back at full volume.')}}],dflt:0});
defEvent({id:'bev_kit',hook:'arrive',tile:['🧴','Bev’s starter kit','info'],chance:0.3,max:1,cond:c=>atHouse(c.at)&&!stFlag('kit')&&day()!==1,
  run:()=>{say(`🧴 Aunt Bev appears beside you with a wicker basket. “I put together a starter kit for you. ${$(stCost(49))}. No pressure. Some pressure.”`)},
  choices:()=>{const c=stCost(49);return [
    {ic:'💳',l:`Buy it (${$(c)})`,s:'Bev ♥♥, charm +3.',dis:S.money<c,fn:()=>{stSpend(c);stSet('kit');stHeart('bev',2);adj('charm',3);say('🧴 Bev is thrilled. The basket smells like a spa exploded.')}},
    {ic:'👃',l:'Try the lavender',s:'Bev ♥, stress −4.',fn:()=>{stHeart('bev');stCalm(4);say('👃 You do feel calmer. Bev takes this as a yes for later.')}},
    {ic:'🙏',l:'A warm “no thank you”',s:'Stress +2.',fn:()=>{weird(2);say('🙏 Bev smiles. “The door is always open.” It sounds like a threat, nicely.')}}]},dflt:2});
defEvent({id:'tanner_pitch',hook:'arrive',tile:['🪙','Tanner’s pitch','info'],chance:0.3,max:1,cond:c=>['living','kitchen','garage'].includes(c.at)&&day()<=2,
  run:()=>{say('🪙 Tanner sits down way too close. “Okay so. TurkeyCoin. It goes up every Thanksgiving. Historically.” It launched in October.')},
  choices:()=>[
    {ic:'💵',l:'Put in $20',s:'Tanner ♥♥. Who knows?',dis:S.money<20,fn:()=>{stSpend(20);stHeart('tanner',2);chain('tanner_coin');say('💵 Tanner shakes your hand for a long time. “You won’t regret this.”')}},
    {ic:'👂',l:'Listen to the whole thing',s:'20 minutes. Tanner ♥, energy −4.',fn:()=>{stPass(20);stHeart('tanner');adj('energy',-4);say('👂 You learn the word “tokenomics.” Tanner feels heard. That’s the real coin.')}},
    {ic:'🙂',l:'“Tell me later!”',s:'Nothing.',fn:()=>{say('🙂 “Later,” Tanner says, and writes it down in his phone. Oh no.')}}],dflt:2});
defEvent({id:'dez_radio',hook:'arrive',tile:['📻','Dez is on the air','good'],chance:0.5,max:2,cooldown:1,cond:c=>c.at==='garage',
  run:()=>{say('📻 The ON AIR light is on. Dez waves you to the second microphone. “Live from the garage. We have a guest. Tell the people what you know about time.”')},
  choices:()=>[
    {ic:'🎙️',l:'Go on the air',s:'Dez ♥, charm +2, stress +3.',fn:()=>{stPass(20);stHeart('dez');adj('charm',2);weird(3);say('🎙️ Someone in Idaho calls in to agree with you. You’re not sure what you said.')}},
    {ic:'🎧',l:'Just listen',s:'Oddly calming. Stress −4.',fn:()=>{stPass(15);stCalm(4);say('🎧 The static, the rain on the garage door, Dez’s low voice. Weirdly soothing.')}},
    {ic:'🚪',l:'Back out quietly',s:'Nothing.',fn:()=>{say('🚪 You back out. Dez tells his listeners you were “a mysterious visitor.”')}}],dflt:1});
defEvent({id:'kids_table',hook:'arrive',tile:['🪑','The kids’ table','info'],chance:0.6,max:1,cond:c=>c.at==='living'&&day()===1&&tod()<900,
  run:()=>{say('🪑 Linda’s seating chart is taped to the wall. You are at the kids’ table. The kids’ table is you, Tanner (24) and Biscuit.')},
  choices:()=>[
    {ic:'😊',l:'Accept it gracefully',s:'Linda ♥, charm +3.',fn:()=>{stHeart('linda');adj('charm',3);say('😊 “Honored.” Linda nods. A good guest doesn’t argue with the chart.')}},
    {ic:'🎉',l:'Make it the fun table',s:'Tanner ♥, Biscuit ♥.',fn:()=>{stHeart('tanner');stHeart('biscuit');say('🎉 You make place cards. Biscuit’s says “Sir Biscuit.” Tanner is touched.')}},
    {ic:'🙏',l:'Ask Riley to swap seats',s:'Riley −3.',fn:()=>{adj('riley',-3);say('🙏 Riley swaps. Now Riley is at the kids’ table, looking at you.')}}],dflt:0});
defEvent({id:'football',hook:'arrive',tile:['🏈','The football game','info'],chance:0.4,max:2,cooldown:1,cond:c=>c.at==='living'&&[1,3].includes(day())&&daytime(),
  run:()=>{say('🏈 Gary and Dez are on the couch, watching football. Gary: “So who are you rooting for?” Dez: “It’s scripted anyway.”')},
  choices:()=>[
    {ic:'🙌',l:'Root for Gary’s team',s:'Gary ♥.',fn:()=>{stHeart('gary');stPass(30);say('🙌 Gary’s team scores. He high-fives you, then Biscuit.')}},
    {ic:'🍿',l:'“I’m just here for the snacks.”',s:'Charm +2, stress −4.',fn:()=>{adj('charm',2);stCalm(4);stPass(30);say('🍿 Respect. Gary passes you the fried cheese curds.')}},
    {ic:'🚶',l:'Keep going',s:'Nothing.',fn:()=>{}}],dflt:2});
defEvent({id:'leftover_wars',hook:'arrive',tile:['🥡','The leftover wars','info'],chance:0.5,max:1,cond:c=>c.at==='kitchen'&&day()>=2,
  run:()=>{say('🥡 One container of stuffing left. Tanner and Dez reach for it at the same moment, and both look at you, the neutral party.')},
  choices:()=>[
    {ic:'⚖️',l:'Split it exactly in half',s:'Tanner ♥, Dez ♥, charm +2.',fn:()=>{stHeart('tanner');stHeart('dez');adj('charm',2);say('⚖️ You use a kitchen scale. Dez calls you “a just ruler.”')}},
    {ic:'👵',l:'Give it to Grandma',s:'Grandma ♥, charm +3.',fn:()=>{stHeart('marjorie');adj('charm',3);say('👵 Grandma accepts the stuffing like a tribute. Wise.')}},
    {ic:'😋',l:'Eat it yourself',s:'Energy +10, charm −3.',fn:()=>{adj('energy',10);adj('charm',-3);say('😋 Delicious. Both of them watch you eat every bite.')}}],dflt:1});
defEvent({id:'family_photo',hook:'arrive',tile:['📸','The family photo','good'],chance:0.6,max:1,cond:c=>['living','backyard'].includes(c.at)&&[2,3].includes(day())&&daytime(),
  run:()=>{say('📸 Linda: “PHOTO.” Matching sweaters with turkeys on them, in front of the big fir. There is one for you. It has your name on it, ironed on.')},
  choices:()=>[
    {ic:'🧶',l:'Put on the sweater',s:'Linda ♥, Grandma ♥, charm +5.',fn:()=>{stPass(20);stHeart('linda');stHeart('marjorie');adj('charm',5);adj('riley',3);say('🧶 You’re in the photo, front row, next to Biscuit. It will be on the wall by Sunday.')}},
    {ic:'📷',l:'Offer to take the picture',s:'Gary ♥, charm +1.',fn:()=>{stHeart('gary');adj('charm',1);say('📷 You take 40 shots. Gary blinked in all of them. He loves it.')}},
    {ic:'🙂',l:'Stand at the edge',s:'Charm +2.',fn:()=>{adj('charm',2);say('🙂 You’re in it. Half of you is.')}}],dflt:2});
defEvent({id:'riley_moment',hook:'arrive',tile:['❤️','Riley on the futon','good'],chance:0.45,cooldown:1,cond:c=>c.at==='guest'&&evening(),
  run:()=>{say('❤️ Riley flops onto the futon next to you, surrounded by dolls. “Hey. How are you actually doing?”')},
  choices:()=>[
    {ic:'💬',l:'Talk for real',s:'20 minutes. Riley +6, stress −6.',fn:()=>{stPass(20);adj('riley',6);stCalm(6);S.stats.talks=(S.stats.talks||0)+1;say('💬 You talk until a doll falls off a shelf. You both laugh too hard.')}},
    {ic:'👍',l:'“Great! Really!”',s:'Riley +2.',fn:()=>{adj('riley',2);say('👍 Riley squints at you. “Okay. But the door’s open.”')}},
    {ic:'😤',l:'Vent about the weekend',s:'Stress −6, Riley −3.',fn:()=>{stCalm(6);adj('riley',-3);say('😤 It feels good. Riley says “they’re my family, though,” softly.')}}],dflt:1});
defEvent({id:'black_friday',hook:'arrive',tile:['🛍️','Black Friday','bad'],chance:1,max:1,urgent:true,cond:c=>c.at==='mall'&&day()===2,
  run:()=>{say('🛍️ Washington Square on Black Friday: a sea of people, a line around a store selling air fryers, and a man in a turkey costume handing out coupons.')},
  choices:()=>{const c=stCost(30);return [
    {ic:'🎁',l:`Fight for a doorbuster gift for Linda (${$(c)})`,s:'Stress +10, Linda ♥♥.',dis:S.money<c,fn:()=>{stSpend(c);weird(10);stHeart('linda',2);stSet('gift');say('🎁 You win a label maker. Linda is going to lose her mind (in a good way).')}},
    {ic:'🥨',l:'Retreat to the food court',s:'$6. Stress −3.',dis:S.money<6,fn:()=>{stSpend(6);stCalm(3);say('🥨 A soft pretzel and a bench. You watch the chaos like a nature documentary.')}},
    {ic:'🏃',l:'Turn around and leave',s:'Stress +3.',fn:()=>{weird(3);say('🏃 You turn around in the doorway. The man in the turkey costume nods. He understands.')}}]},dflt:2});
defEvent({id:'heron',hook:'arrive',tile:['🪶','A great blue heron','good'],chance:0.5,cooldown:1,cond:c=>c.at==='nature',
  run:()=>{say('🪶 Out on the boardwalk, a great blue heron stands perfectly still in the rain. It does not care about Grandma’s list.')},
  choices:()=>stopWatch({mins:15,calm:8,text:'🪶 You stand with it a while. Nobody is ranking anybody out here.'}),dflt:1});
defEvent({id:'rain_dash',hook:'travel',tile:['🌧️','A real Oregon downpour','info'],chance:0.2,cooldown:1,cond:c=>!atHouse(c.to)||!atHouse(c.from),
  run:()=>{say('🌧️ The drizzle becomes a downpour between the car and the door. There is one umbrella.')},
  choices:()=>[
    {ic:'☂️',l:'Share the umbrella with Riley',s:'Riley +3.',fn:()=>{adj('riley',3);say('☂️ Both of you half-wet, laughing. Worth it.')}},
    {ic:'🏃',l:'Just run for it',s:'Stress +2.',fn:()=>{weird(2);say('🏃 Soaked. Biscuit greets you at the door in his own raincoat, judging.')}}],dflt:1});
defEvent({id:'max_ferret',hook:'travel',tile:['🚈','On the MAX','good'],chance:0.12,max:1,cond:c=>!atHouse(c.to),
  run:()=>{say('🚈 On the MAX, a man across the aisle has a ferret in a tiny scarf. It is the second-best-dressed animal you’ve seen this weekend.')},
  choices:()=>stopWatch({mins:5,calm:4,text:'🚈 The ferret falls asleep in the scarf. Beaverton slides by, wet and green.'}),dflt:1});
defEvent({id:'futon_fold',hook:'night',tile:['🛏️','The futon folds','bad'],chance:0.25,cooldown:2,cond:c=>c.where!=='collapsed',
  run:()=>{adj('energy',-6);weird(2);say('🛏️ At 3 AM the futon folds up with you inside it, like a taco. You lie there a while, considering the dolls.')}});

// ---- tips: one at a time, first match wins, each once per game ----
let TIPS=[
  {id:'welcome',when:()=>day()===0,t:'👋 Welcome to the Pembertons’, {{name}}! Tap actions on the <b>Here</b> tab, and use <b>🧭 Go somewhere</b> to move around the house or out into Beaverton.'},
  {id:'tiles',when:()=>S.ev.history.length>0,t:'🔔 Things that happen show up as small <b>tiles</b> under the bar. A tile that says “Tap to decide” is your call.'},
  {id:'pie',when:()=>day()===1&&!S.pie.have,t:'🥧 No pie yet! Bake one in the <b>kitchen</b> or buy one at <b>the grocery store</b> (open until 4 PM today). Dinner is at <b>3:00 PM</b>.'},
  {id:'dinner',when:()=>day()===1&&tod()>=780&&!S.dinner.done,t:'🍽️ Dinner starts at <b>3:00 PM</b> wherever you are in the house. Be home by then: late costs charm.'},
  {id:'stress',when:()=>S.stress>=60,t:'🧠 Your sanity is slipping. Hide in the <b>guest room</b>, walk the <b>Nature Park</b>, or get a coffee in <b>Old Town</b>. At 100 you melt down.'},
  {id:'riley',when:()=>S.riley<45,t:'❤️ Riley needs you. Spend time together and don’t leave them alone with Bev. At 0, it’s over.'},
  {id:'family',when:()=>day()>=1,t:'👪 The <b>Family</b> tab shows each person’s hearts and Grandma’s ranking. Hearts help you climb the fridge list every night.'},
  {id:'games',when:()=>day()===3&&!S.games.done,t:'🎲 The Family Games start at <b>2:00 PM</b>. Family you’ve talked to drop hints for the trivia round.'},
  {id:'bed',when:()=>S.loc==='guest'&&tod()>=1260,t:'🛏️ Go to bed before 11 PM for the best sleep. Staying up past midnight costs you.'},
];

// ---- To-do tab goals: {l, s, ok, fail, urgent} ----
function todoItems(){
  const d=day(),m=tod(),it=[];
  it.push({l:'Bring a pie to Thanksgiving',s:S.pie.have?`Got it: ${S.pie.kind==='homemade'?'homemade 🥧':'store-bought 🏪'}.`:'Bake one in the kitchen or buy one at the grocery store.',ok:S.pie.have,fail:!S.pie.have&&S.dinner.done,urgent:!S.pie.have&&d===1});
  it.push({l:'Thanksgiving dinner, Thu 3:00 PM',s:S.dinner.done?(stFlag('dinnerMissed')?'Missed.':S.dinner.late?'Done (late).':'Done, on time.'):'In the living room. Don’t be late.',ok:S.dinner.done&&!S.dinner.late,fail:S.dinner.done&&S.dinner.late,urgent:d===1&&m>=780&&!S.dinner.done});
  it.push({l:'Family Games, Sat 2:00 PM',s:S.games.done?(S.games.won?'Won! 🏆':stFlag('gamesMissed')?'Missed.':'Played.'):'Charades and trivia in the living room.',ok:S.games.done&&!stFlag('gamesMissed'),fail:!!stFlag('gamesMissed'),urgent:d===3&&m>=720&&!S.games.done});
  it.push({l:'Keep Riley happy',s:`Riley ${S.riley}/100. At 0, it’s over.`,ok:S.riley>=60,urgent:S.riley<30});
  it.push({l:'Keep your sanity',s:`Sanity ${100-S.stress}/100. At 0 you melt down.`,ok:S.stress<60,urgent:S.stress>=80});
  it.push({l:'Win the family over',s:`Charm ${S.charm}/100 · ${heartsTotal()} of 21 hearts`,ok:S.charm>=60,urgent:S.charm<15});
  it.push({l:'Climb Grandma’s fridge list',s:`You’re #${S.rank} of 14. Top 5 is the goal; #1 is legend.`,ok:S.rank<=5});
  if(d===4) it.push({l:'Leave at noon',s:'Riley’s car leaves at 12:00 PM.',ok:!!S.flags.leaving});
  return it;
}

// ---- scoring ----
const SCORE_W={charm:20,riley:15,sanity:10,heart:60,rank:80,ontime:300,pieHome:250,pieStore:100,gamesWon:300,gamesPlayed:100,invited:300};
const GRADE_CUTS=[6000,4400,3300,2400];   // A, B, C, D (same on every difficulty)
let RULES_HTML=`<p>Survive Thanksgiving weekend with Riley’s family. Bring a pie, be at dinner Thursday at 3:00 PM, play the Family Games Saturday at 2:00 PM, and leave Sunday at noon. The game ends early if your sanity hits 0 (meltdown), Riley hits 0 (breakup) or your charm hits 0 (asked to leave).</p>
<p>Score: charm × ${SCORE_W.charm} + Riley × ${SCORE_W.riley} + sanity × ${SCORE_W.sanity} + hearts × ${SCORE_W.heart} + (15 − Grandma’s rank) × ${SCORE_W.rank}, plus bonuses: dinner on time, the pie, the games, and an invitation back next year. Grades: A ${grp(GRADE_CUTS[0])}, B ${grp(GRADE_CUTS[1])}, C ${grp(GRADE_CUTS[2])}, D ${grp(GRADE_CUTS[3])}.</p>`;
function scoreParts(){
  const w=SCORE_W,p=S.pie,g=S.games,ot=S.dinner.done&&!S.dinner.late,pie=p.have?(p.kind==='homemade'?w.pieHome:w.pieStore):0;
  return [['Charm',S.charm*w.charm,`${S.charm} × ${w.charm}`],['Riley',S.riley*w.riley,`${S.riley} × ${w.riley}`],
    ['Sanity',(100-S.stress)*w.sanity,`${100-S.stress} × ${w.sanity}`],['Hearts',heartsTotal()*w.heart,`${heartsTotal()} of 21 × ${w.heart}`],
    ['Grandma’s list',(15-S.rank)*w.rank,`#${S.rank} of 14`],['Dinner on time',ot?w.ontime:0,ot?'3:00 PM sharp':'—'],
    ['The pie',pie,p.have?p.kind:'none'],['Family Games',g.won?w.gamesWon:g.done&&!stFlag('gamesMissed')?w.gamesPlayed:0,g.won?'won':g.done?'played':'—'],
    ['Invited back',stFlag('invited')?w.invited:0,stFlag('invited')?'2027':'—']].map(([k,v,n])=>[k,Math.round(v)||0,n]);
}
function scoreOf(){return scoreParts().reduce((a,r)=>a+r[1],0)}
function gradeOf(sc){
  if(sc>=GRADE_CUTS[0]) return ['A','Family Now','Grandma moved your photo to the good part of the fridge. Linda laminated your invitation twice.'];
  if(sc>=GRADE_CUTS[1]) return ['B','Welcome Back Anytime','Gary wants to fry something with you next year. Biscuit has your scent on file.'];
  if(sc>=GRADE_CUTS[2]) return ['C','Survived It','You made it. The dolls watched. The pie was eaten.'];
  if(sc>=GRADE_CUTS[3]) return ['D','A Learning Experience','Riley says next year will be easier. Riley is an optimist.'];
  return ['F','Store-Bought Energy','There’s always Christmas. (There is not always Christmas.)'];
}
let FINISH_TEXT={h1:'{{name}}, you survived Thanksgiving at the Pembertons’',
  sub:()=>`Wed Nov 25 to Sun Nov 29, 2026, in Beaverton. Grandma’s list: <b>#${S.rank} of 14</b>. ${stFlag('invited')?'You’re invited back next year.':'Linda said “drive safe.”'} Biscuit misses you already.`};
function endRows(){
  const s=S.stats,f=S.fam;
  return [['Difficulty',`${DF().ic} ${DF().n}`],['Grandma’s rank',`#${S.rank} of 14`],['Charm / Riley / Sanity',`${S.charm} / ${S.riley} / ${100-S.stress}`],
    ['Hearts',Object.keys(FAM_N).map(k=>`${FAM_N[k].split(' ').pop()} ${'♥'.repeat(f[k]||0)||'·'}`).join(', ')],
    ['The pie',S.pie.have?S.pie.kind:'forgot it'],['Dinner',stFlag('dinnerMissed')?'missed':S.dinner.late?'late':'on time'],
    ['Family Games',S.games.won?'won 🏆':S.games.done?'played':'—'],['Cash left',$(Math.round(S.money))],
    ['Chores / trips / talks',`${s.chores||0} / ${s.trips||0} / ${s.talks||0}`],['Weird moments survived',s.weird||0]];
}

// ---- achievements: test(ctx) runs after every render ({}), each night ({night,where}) and at the end ({end,lost}) ----
const ACH=[
  {id:'first_night',ic:'🪆',n:'212 Witnesses',d:'Survive your first night with the dolls.',test:c=>c.night},
  {id:'on_time',ic:'⏰',n:'3:00 PM Sharp',d:'Be on time for Thanksgiving dinner.',test:()=>S.dinner.done&&!S.dinner.late},
  {id:'homemade',ic:'🥧',n:'From Scratch',d:'Bring a homemade pie.',test:()=>S.dinner.done&&S.pie.have&&S.pie.kind==='homemade'},
  {id:'champs',ic:'🏆',n:'Gravy Boat Champion',d:'Win the Pemberton Family Games.',test:()=>S.games.won},
  {id:'top3',ic:'📋',n:'Podium',d:'Reach #3 on Grandma’s list.',test:()=>S.rank<=3},
  {id:'number1',ic:'👑',n:'Bigger Than Doug',d:'Reach #1 on Grandma’s list.',test:()=>S.rank===1},
  {id:'everyone',ic:'👪',n:'Something for Everyone',d:'Get at least one heart from every family member.',test:()=>Object.values(S.fam).every(v=>v>=1)},
  {id:'corgi',ic:'🐕',n:'Biscuit’s Person',d:'Get 3 hearts from Biscuit.',test:()=>S.fam.biscuit>=3},
  {id:'upline',ic:'🧴',n:'On Bev’s Team',d:'Buy the starter kit.',test:()=>!!stFlag('kit')},
  {id:'constance',ic:'👋',n:'Constance',d:'Make friends with a doll.',test:()=>!!stFlag('dollFriend')},
  {id:'doorbuster',ic:'🛍️',n:'Doorbuster',d:'Win a Black Friday gift for Linda.',test:()=>!!stFlag('gift')},
  {id:'invited',ic:'💌',n:'See You Next Year',d:'Get invited back for 2027.',test:()=>!!stFlag('invited')},
  {id:'zen',ic:'🧘',n:'Unbothered',d:'Finish with sanity 80 or more.',test:c=>c.end&&!c.lost&&S.stress<=20},
  {id:'grade_a',ic:'🦃',n:'Family Now',d:'Finish with an A.',test:c=>c.end&&!c.lost&&scoreOf()>=GRADE_CUTS[0]},
];

// ---- save migrations (06-save.js reads an array; bump GAME.schema and add {to,run} when S changes shape) ----
const MIGRATIONS=[];
