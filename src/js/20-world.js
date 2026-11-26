// ============================================================
//  THANKSGIVING AT WEIRD PEOPLE'S HOUSE, part 1: the world.
//  Wed Nov 25 – Sun Nov 29, 2026 at the Pembertons' split-level in Beaverton, OR (Cedar Hills).
//  The shared state, the family, the HUD, the scenery, the nine places, travel, the Here-tab actions,
//  status tags, the alert bar and the Family tab. Events, dinner, the Games, scoring live in 21-story.js.
// ============================================================

// ---- the game-specific part of the save (merged over the engine's fields in baseState()) ----
function newState(){
  return {
    money:250,                // replaced by DF().money at new game
    energy:80,stress:15,      // stress: high is bad (100 = meltdown). The HUD shows Sanity = 100 − stress
    charm:30,                 // 0–100: how much the family likes you (0 = Linda asks you to leave)
    riley:70,                 // 0–100: how Riley is doing (0 = breakup)
    pie:{have:false,kind:null},          // the pie you promised for Thursday: 'store' or 'homemade'
    dinner:{done:false,late:false},      // Thanksgiving dinner, day 1 at 3:00 PM (21-story.js runs it)
    games:{done:false,won:false},        // the Pemberton Family Games, day 3 at 2:00 PM (21-story.js)
    fam:{linda:0,gary:0,marjorie:0,dez:0,bev:0,tanner:0,biscuit:0},   // 0–3 hearts each
    rank:14,                  // Grandma's fridge ranking: 1 is best, 14 is last
    chores:{},                // day → chores done for Linda that day
    flags:{},                 // one-off things: pieKit, photoWall, gift_<id>, starterKit…
    did:{},                   // day → {action key: true}: the once-a-day things (see once/did helpers)
    alarm:480,
    visited:{guest:true},     // place key → true once you've been there
    stats:{chores:0,escapes:0,trips:0,spent:0,weird:0,talks:0,meals:0},
  };
}

// ---- small shared helpers (21-story.js uses these too) ----
const isGrow=()=>false;                                    // no second mode in this game
const rp=c=>Math.round(c*(DF().cost||1));                  // a store price, scaled by the difficulty
function canAfford(c){return S.money>=c}
function spend(c){money(-c);S.stats.spent+=c}
const cap=t=>t[0].toUpperCase()+t.slice(1);
const augDate=d=>`${dayName(d).slice(0,3)} Nov ${25+d}`;   // day index → "Wed Nov 25"
const DINNER_DAY=1,DINNER_T=900;                           // Thursday 3:00 PM sharp
const GAMES_DAY=3,GAMES_T=840;                             // Saturday 2:00 PM
const LEAVE_DAY=4,LEAVE_T=720;                             // Sunday noon
const CHORE_MAX=3;                                         // Linda hands out at most 3 chores a day
const AT_HOUSE=['guest','kitchen','living','garage','backyard'];
const atHouse=(k=S.loc)=>AT_HOUSE.includes(k);
// once-a-day bookkeeping: did('talk_linda') is true if you did it today; mark('talk_linda') records it
const did=k=>!!(S.did&&S.did[day()]&&S.did[day()][k]);
function mark(k){S.did=S.did||{};const d=day();(S.did[d]=S.did[d]||{})[k]=true}
// Unwinding works fully twice a day, then about a third as well.
const CALM_FULL=2;
const calmN=()=>(S.did&&S.did[day()]&&S.did[day()]._calm)||0;
const calmAmt=v=>calmN()<CALM_FULL?v:Math.ceil(v/3);
function calm(v){adj('stress',-calmAmt(v));S.did=S.did||{};const d=day();(S.did[d]=S.did[d]||{})._calm=calmN()+1}
const calmTxt=v=>`stress −${calmAmt(v)}${calmN()>=CALM_FULL?' (you’ve already unwound a lot today)':''}`;
// a weird moment: stress up, scaled by the difficulty, and counted
function weird(n){adj('stress',Math.round(n*(DF().strain||1)));S.stats.weird++}
// a heart with a family member (max 3), plus charm
function heart(id,ch=2){if(S.fam[id]<3)S.fam[id]++;adj('charm',ch)}
const hearts=id=>'❤️'.repeat(S.fam[id])+'🤍'.repeat(3-S.fam[id]);
const heartsTotal=()=>Object.values(S.fam).reduce((a,b)=>a+b,0);
const dinnerSoon=()=>day()===DINNER_DAY&&!S.dinner.done;

// ---- the family (keys fixed by SPEC.md) ----
// at: where you'll usually find them. lines: what a chat sounds like at 0, 1, 2 and 3 hearts.
const FAMILY={
  linda:{n:'Mom Linda',ic:'📋',at:['kitchen'],d:'Runs Thanksgiving like a military operation from a laminated clipboard. Has a color code. You are in yellow.',
    lines:['📋 Linda looks at you, then at the clipboard, then at you. “Riley says you’re helpful.” It sounds like a test.','📋 Linda walks you through the oven schedule: four dishes, one oven, twelve minutes of overlap she has “accounted for.”','📋 Linda shows you the binder of Thanksgivings past. Every year has a seating chart. There’s a pencil spot for you next year.','📋 Linda moves you from yellow to green on the clipboard. She does it with the special pen.']},
  gary:{n:'Dad Gary',ic:'🍗',at:['backyard','living'],d:'Deep-fries everything. The turkey fryer lives in the driveway under a tarp he calls “the garage annex.”',
    lines:['🍗 Gary asks if you’ve ever deep-fried a pickle. You haven’t. He looks genuinely sad for you.','🍗 Gary explains oil temperature like it’s a sacred text. 350, not 351. Never 351.','🍗 Gary fries you a single Oreo as a “test batch.” It is incredible. You don’t tell anyone.','🍗 Gary gives you a turkey-fryer apron with your name already ironed on. “Had a feeling.”']},
  marjorie:{n:'Grandma Marjorie',ic:'👵',at:['living'],d:'Keeps a ranking of every guest ever on the fridge, in marker. Rates handshakes, posture and pie.',
    lines:['👵 Grandma studies your shoes for a full minute and writes something on her notepad.','👵 Grandma tells you guest #3 in 1987 brought a Jell-O salad “with things in it.” He is still #3. Somehow.','👵 Grandma lets you hold her yarn while she knits. She hums. You are, possibly, being evaluated.','👵 Grandma pats your hand. “You’ll do.” In this family that’s a medal.']},
  dez:{n:'Uncle Dez',ic:'📻',at:['garage'],d:'The garage is his ham-radio studio. Current theory: Daylight Saving Time is a hoax by the clock industry.',
    lines:['📻 Dez asks how many clocks you own. He nods slowly at the answer. “That’s what they want.”','📻 Dez lets you say “over” on the radio to a guy in Saskatchewan. The guy agrees about the clocks.','📻 Dez shows you his “evidence board.” It is mostly photos of wristwatches and one of a rooster.','📻 Dez gives you a call sign. It is unofficial and he made it up and you will treasure it forever.']},
  bev:{n:'Aunt Bev',ic:'🫙',at:['kitchen','living'],d:'Essential oils, a home business, a tote bag of tiny bottles. She will try to sell you a starter kit.',
    lines:['🫙 Bev dabs something called “Harvest Calm” on your wrist without asking. You do feel calm. Suspiciously calm.','🫙 Bev explains her “downline.” It has a diagram. Biscuit is somehow on it.','🫙 Bev admits she mostly likes the meetings. “Everybody brings snacks.” You like Bev.','🫙 Bev gives you a free sample of “Pemberton Peace.” It smells like the kitchen. It’s lovely.']},
  tanner:{n:'Cousin Tanner',ic:'🪙',at:['living','garage'],d:'24, lives in the basement, explains crypto whether or not you asked. Very kind underneath it all.',
    lines:['🪙 Tanner explains a coin named after a sandwich. You nod for eleven minutes.','🪙 Tanner shows you his “portfolio.” It is mostly a spreadsheet about a frog.','🪙 Tanner admits he also bakes sourdough. His starter is named Gerald. Gerald is thriving.','🪙 Tanner says you’re the first guest who listened all the way through. He means it. You hug.']},
  biscuit:{n:'Biscuit',ic:'🐕',at:['backyard','living'],d:'The family corgi. Wears a different outfit every meal. Today: a tiny pilgrim hat.',
    lines:['🐕 Biscuit sniffs your shoes, sneezes and leaves. You are under review.','🐕 Biscuit lets you scratch behind one ear. Only one. Don’t push it.','🐕 Biscuit rolls over in the wet grass in a little cardigan. Linda sighs. You laugh.','🐕 Biscuit falls asleep on your feet. Grandma sees it and writes something down.']},
};
const famAt=id=>FAMILY[id].at.map(k=>L[k].name).join(' or ');

// ---- HUD ----
let STATS=[
  {l:'Cash',  v:()=>$k(Math.round(S.money)),warn:()=>S.money<15,get title(){return 'Cash: '+$(Math.round(S.money))}},
  {l:'Energy',v:()=>S.energy,m:()=>S.energy,warn:()=>S.energy<20,title:'Energy. Sleep, snacks and rest bring it back.'},
  {l:'Sanity',v:()=>100-S.stress,m:()=>100-S.stress,warn:()=>S.stress>=75,title:'Sanity (100 − stress). At 0 you have a meltdown.'},
  {l:'Charm', v:()=>S.charm,m:()=>S.charm,warn:()=>S.charm<15,title:'How much the family likes you. At 0, Linda politely asks you to leave.'},
  {l:'Riley', v:()=>S.riley,m:()=>S.riley,warn:()=>S.riley<25,title:'How Riley is doing. At 0, it’s over.'},
];

// ---- scenery: late November in Beaverton, grey and wet ----
// Sunrise about 7:25 AM, sunset about 4:35 PM. The engine draws the sky (y 0–140) and the ground (140–170).
let SCENE={sun:[445,995],skyDay:['#8e99a3','#c9cfd2'],skyDusk:['#4f4a6a','#c99a86'],skyNight:['#0d1420','#1d2836'],ground:'#4f6150',groundNight:'#1b2420'};
const win=(n,lit=true)=>n?(lit?'#f7d77a':'#2b3442'):'#d4dde0';
const SVGF='font-family="DM Sans, system-ui, sans-serif" font-weight="700"';
const fir=(x,n,h=60,b=140)=>`<rect x="${x-2}" y="${b-8}" width="4" height="8" fill="${n?'#21170f':'#4a3524'}"/><polygon points="${x},${b-h} ${x-h*.28},${b-8} ${x+h*.28},${b-8}" fill="${n?'#0f2219':'#2c4d3a'}"/><polygon points="${x},${b-h} ${x-h*.18},${b-h*.45} ${x+h*.18},${b-h*.45}" fill="${n?'#14291e':'#3a6249'}"/>`;
const firs=(n,xs,b=140)=>xs.map(([x,h])=>fir(x,n,h,b)).join('');
// string lights along a line: warm bulbs that glow brighter at night
const lights=(x1,x2,y,n)=>{let s=`<path d="M${x1} ${y} Q${(x1+x2)/2} ${y+8} ${x2} ${y}" stroke="#333" stroke-width="1" fill="none"/>`;
  for(let i=0;i<=10;i++){const t=i/10,x=x1+(x2-x1)*t,yy=y+8*4*t*(1-t);s+=`<circle cx="${x}" cy="${yy+2}" r="${n?2.4:1.8}" fill="${['#f7d77a','#ff9a6a','#9fe0a0','#f7d77a'][i%4]}" opacity="${n?1:.7}"/>`}return s};
// the Pembertons' split-level: a low wing, a tall wing, a picture window, the garage door
const splitLevel=(x,n,b=140)=>`<g><rect x="${x}" y="${b-46}" width="110" height="46" fill="${n?'#3a3a36':'#b9ad94'}"/><polygon points="${x-6},${b-46} ${x+55},${b-66} ${x+116},${b-46}" fill="${n?'#22201e':'#5b4a3c'}"/>
  <rect x="${x+110}" y="${b-70}" width="80" height="70" fill="${n?'#33322e':'#a99f88'}"/><polygon points="${x+104},${b-70} ${x+150},${b-92} ${x+196},${b-70}" fill="${n?'#22201e':'#5b4a3c'}"/>
  <rect x="${x+12}" y="${b-36}" width="54" height="22" fill="${win(n)}"/><rect x="${x+122}" y="${b-62}" width="22" height="16" fill="${win(n)}"/><rect x="${x+156}" y="${b-62}" width="22" height="16" fill="${win(n,0)}"/>
  <rect x="${x+122}" y="${b-32}" width="58" height="32" fill="${n?'#4a4840':'#e6e0d0'}"/>${[0,1,2].map(i=>`<path d="M${x+122} ${b-24+i*8} h58" stroke="${n?'#333':'#bdb5a2'}"/>`).join('')}
  <rect x="${x+80}" y="${b-30}" width="16" height="30" fill="${n?'#2a1b14':'#7a3b2a'}"/>${lights(x-4,x+192,b-48,n)}</g>`;
const person=(x,n,c,b=146,h=1,skin='#d9a77c')=>`<circle cx="${x}" cy="${b-22*h}" r="${4*h}" fill="${skin}"/><rect x="${x-4*h}" y="${b-18*h}" width="${8*h}" height="${12*h}" rx="2" fill="${c}"/><rect x="${x-3*h}" y="${b-6*h}" width="${2.5*h}" height="${6*h}" fill="${n?'#222':'#333'}"/><rect x="${x+.5*h}" y="${b-6*h}" width="${2.5*h}" height="${6*h}" fill="${n?'#222':'#333'}"/>`;
// Biscuit, in today's outfit
const corgi=(x,n,b=140,hat='#3a2a1e')=>`<g><ellipse cx="${x}" cy="${b-7}" rx="13" ry="6" fill="#d8893e"/><ellipse cx="${x}" cy="${b-4}" rx="9" ry="3" fill="#f3e6d0"/><circle cx="${x+12}" cy="${b-12}" r="5" fill="#d8893e"/>
  <polygon points="${x+9},${b-16} ${x+11},${b-22} ${x+13},${b-16}" fill="#d8893e"/><polygon points="${x+14},${b-16} ${x+16},${b-22} ${x+17},${b-15}" fill="#d8893e"/><rect x="${x+8}" y="${b-25}" width="9" height="4" fill="${hat}"/><rect x="${x+6}" y="${b-22}" width="13" height="1.5" fill="${hat}"/>
  ${[-8,-3,4,9].map(dx=>`<rect x="${x+dx}" y="${b-3}" width="2.5" height="3" fill="#b06a2a"/>`).join('')}<circle cx="${x+15}" cy="${b-13}" r=".9" fill="#111"/></g>`;
// an interior: a wall with a rainy window cut out (so the engine's sky shows through), and a floor
const room=(n,wall,floor,wx=190,wy=24,ww=100,wh=60)=>`<path fill-rule="evenodd" d="M0 0 H480 V150 H0 Z M${wx} ${wy} h${ww} v${wh} h-${ww} Z" fill="${n?'#2e2a28':wall}"/>
  <rect x="${wx-4}" y="${wy-4}" width="${ww+8}" height="${wh+8}" fill="none" stroke="${n?'#4a423a':'#f4efe4'}" stroke-width="6"/><path d="M${wx+ww/2} ${wy} v${wh} M${wx} ${wy+wh/2} h${ww}" stroke="${n?'#4a423a':'#f4efe4'}" stroke-width="3"/>
  ${firs(n,[[wx+18,40],[wx+70,52]],wy+wh)}<rect y="140" width="480" height="30" fill="${n?'#2a211b':floor}"/>`;
const lamp=(x,n,b=150)=>`<rect x="${x}" y="${b-44}" width="2.5" height="44" fill="#3c4248"/><path d="M${x+1} ${b-44} q8 -4 14 0" stroke="#3c4248" stroke-width="2.5" fill="none"/><rect x="${x+11}" y="${b-44}" width="7" height="3" fill="${n?'#f7d77a':'#cfd5d8'}"/>${n?`<polygon points="${x+11},${b-41} ${x+18},${b-41} ${x+30},${b} ${x-2},${b}" fill="#f7d77a" opacity=".12"/>`:''}`;
// rain over the outdoor places (and a little in the windows): deterministic streaks
SCENE_FX.push(({night})=>{if(!L[S.loc]||!L[S.loc].out)return '';let s='';for(let i=0;i<46;i++){const x=(i*53)%480,y=(i*37)%150;s+=`<path d="M${x} ${y} l-4 12" stroke="${night?'#8aa0b8':'#eef3f6'}" stroke-width="1" opacity=".45"/>`}return s});

// ---- places ----
// L keys are fixed by SPEC.md. out: outdoors (rain). hours: d=>[open,close] or null (closed that day).
let L={
  guest:{name:'The guest room',ic:'🛏️',desc:'Linda’s craft room: a futon, a glue gun, and 212 porcelain dolls on shelves, all facing the futon',
    art:({night:n})=>`${room(n,'#d9c7c9','#8a6f5e',300,26,90,56)}${[0,1,2].map(r=>`<rect x="20" y="${30+r*30}" width="230" height="4" fill="${n?'#4a3a30':'#8a6448'}"/>${Array.from({length:14},(_,i)=>`<circle cx="${30+i*16}" cy="${22+r*30}" r="4" fill="#f4e6dc"/><rect x="${27+i*16}" y="${25+r*30}" width="6" height="6" fill="${['#c0607a','#6a8ac0','#e0c060','#80b080'][(i+r)%4]}"/>`).join('')}`).join('')}
      <rect x="60" y="112" width="170" height="22" rx="4" fill="${n?'#3a3a50':'#5a6fa0'}"/><rect x="60" y="132" width="170" height="8" fill="${n?'#2a2218':'#4a3a2a'}"/><rect x="70" y="104" width="40" height="12" rx="5" fill="#f4efe4"/>
      <rect x="320" y="108" width="80" height="32" fill="${n?'#3a2e26':'#b08a60'}"/><rect x="340" y="98" width="30" height="10" fill="#e05a7a"/><text x="360" y="126" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">CRAFTS</text>`},
  kitchen:{name:'The kitchen',ic:'🍳',desc:'Linda’s command center. Four timers, one oven, a laminated clipboard on a nail by the fridge',
    art:({night:n})=>`${room(n,'#e8dcb0','#b3a58a',170,20,120,50)}<rect x="0" y="96" width="480" height="44" fill="${n?'#3a3026':'#f0ece2'}"/><rect x="0" y="92" width="480" height="6" fill="${n?'#4a4038':'#9a8a70'}"/>
      ${[0,1,2,3,4,5].map(i=>`<rect x="${12+i*78}" y="104" width="68" height="32" fill="none" stroke="${n?'#555':'#c8c0ae'}"/>`).join('')}
      <rect x="320" y="70" width="56" height="70" fill="${n?'#444':'#d8d8d8'}"/><rect x="326" y="78" width="44" height="26" fill="${n?'#1a1a1a':'#3a3a3a'}"/><circle cx="334" cy="74" r="2" fill="#e05a2a"/><circle cx="346" cy="74" r="2" fill="#e05a2a"/>
      <rect x="400" y="24" width="56" height="116" fill="${n?'#3c3c3c':'#e9e9e2'}"/><rect x="414" y="44" width="22" height="30" fill="#f4f0c8" stroke="#888"/><text x="425" y="56" text-anchor="middle" font-size="5" ${SVGF} fill="#333">RANK</text>
      <rect x="120" y="30" width="34" height="44" fill="#f2f2f2" stroke="${n?'#666':'#7a5a3a'}" stroke-width="2"/><rect x="132" y="26" width="10" height="6" fill="#999"/>${[0,1,2,3].map(i=>`<path d="M124 ${40+i*8} h26" stroke="${['#e05a2a','#e0c040','#40a060','#4060c0'][i]}" stroke-width="2"/>`).join('')}
      <ellipse cx="230" cy="90" rx="36" ry="8" fill="${n?'#5a3a20':'#c8782e'}"/>`},
  living:{name:'The living room',ic:'🛋️',desc:'The TV, the football, Grandma’s armchair, the family photo wall, and the long table where dinner is served',
    art:({night:n})=>`${room(n,'#c8b89a','#6e5440',30,22,110,60)}${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${176+(i%4)*34}" y="${20+Math.floor(i/4)*30}" width="26" height="22" fill="${n?'#3a3a3a':'#efe6d0'}" stroke="${n?'#666':'#7a5a3a'}" stroke-width="2"/><circle cx="${189+(i%4)*34}" cy="${29+Math.floor(i/4)*30}" r="4" fill="#d9a77c"/>`).join('')}
      <rect x="330" y="54" width="110" height="64" fill="#111"/><rect x="334" y="58" width="102" height="56" fill="${n?'#2a6a3a':'#3a8a4a'}"/><path d="M385 58 v56" stroke="#fff" opacity=".6"/><ellipse cx="385" cy="86" rx="5" ry="3" fill="#8a4a2a"/><rect x="370" y="118" width="30" height="22" fill="#333"/>
      <rect x="40" y="112" width="240" height="8" fill="${n?'#4a3424':'#8a5a3a'}"/><rect x="48" y="120" width="5" height="20" fill="#5a3a2a"/><rect x="268" y="120" width="5" height="20" fill="#5a3a2a"/><rect x="40" y="108" width="240" height="4" fill="#e9dfc8"/>
      <path d="M440 140 v-40 q0 -14 14 -14 h12 q14 0 14 14 v40 z" fill="${n?'#4a2a3a':'#8a3a5a'}"/>${n?'':person(456,n,'#a080b0',128,.9,'#f0d0b8')}`},
  garage:{name:'The garage',ic:'📻',desc:'Uncle Dez’s ham-radio studio, an evidence board about clocks, and Dad’s second fridge',
    art:({night:n})=>`<rect width="480" height="150" fill="${n?'#22252a':'#8a8f94'}"/><rect y="140" width="480" height="30" fill="${n?'#2a2c2e':'#6a6e70'}"/>${[0,1,2,3,4].map(i=>`<path d="M0 ${20+i*24} H480" stroke="${n?'#2c3036':'#7a7f84'}"/>`).join('')}
      <rect x="40" y="90" width="150" height="10" fill="#5a4a3a"/><rect x="50" y="100" width="6" height="40" fill="#4a3a2a"/><rect x="174" y="100" width="6" height="40" fill="#4a3a2a"/>
      <rect x="56" y="62" width="56" height="28" fill="#2a2a2a"/>${[0,1,2,3].map(i=>`<circle cx="${66+i*12}" cy="80" r="3" fill="#888"/>`).join('')}<rect x="62" y="66" width="30" height="8" fill="${n?'#7fe0a0':'#5ac080'}"/><rect x="120" y="68" width="40" height="22" fill="#3a3a3a"/>
      <path d="M150 62 v-44 M140 22 h20 M143 30 h14" stroke="#444" stroke-width="2"/><rect x="220" y="30" width="110" height="70" fill="#a88a5a"/>${[[236,44],[270,40],[300,60],[250,74],[290,84]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#f4f0e0" stroke="#333"/><path d="M${x} ${y} v-4 M${x} ${y} h3" stroke="#333"/>`).join('')}
      <path d="M236 44 L270 40 L300 60 L250 74 L290 84" stroke="#c03030" fill="none"/><text x="275" y="27" text-anchor="middle" font-size="7" ${SVGF} fill="${n?'#bbb':'#222'}">WAKE UP, AMERICA</text>
      <rect x="380" y="50" width="56" height="90" fill="${n?'#bdbdbd':'#f2f2ee'}"/><path d="M380 84 h56" stroke="#999"/><rect x="428" y="60" width="3" height="16" fill="#888"/>${person(120,n,'#4a6a4a',140,1,'#c89070')}`},
  backyard:{name:'The backyard',ic:'🌲',out:true,desc:'The turkey fryer under its tarp, the hot tub that doesn’t work, string lights, firs, and Biscuit',
    art:({night:n})=>`${firs(n,[[20,80],[60,100],[440,96],[470,70]])}${splitLevel(120,n,120)}<rect y="120" width="480" height="20" fill="${n?'#1e2a20':'#557055'}"/>
      <rect x="60" y="112" width="36" height="28" fill="${n?'#2a3a4a':'#5a7a9a'}" rx="3"/><text x="78" y="130" text-anchor="middle" font-size="5" ${SVGF} fill="#fff">OUT OF ORDER</text>
      <rect x="350" y="112" width="20" height="24" rx="3" fill="#777"/><rect x="346" y="134" width="28" height="6" fill="#444"/>${n?'':'<circle cx="358" cy="104" r="5" fill="#ddd" opacity=".5"/><circle cx="364" cy="96" r="7" fill="#ddd" opacity=".35"/>'}
      ${corgi(260,n,142,'#2a2a2a')}${person(330,n,'#8a2a2a',142,1,'#e0b090')}`},
  oldtown:{name:'Old Town Beaverton',ic:'☕',out:true,desc:'A few blocks of brick storefronts, a café with fogged windows, and a breather from the house',
    hours:d=>d===1?null:[420,1140],
    art:({night:n})=>`${firs(n,[[460,70]])}${[['CAFÉ','#6a3a2a',20],['BOOKS','#2a4a6a',150],['BAKERY','#4a6a3a',280]].map(([t,c,x])=>`<rect x="${x}" y="56" width="120" height="84" fill="${n?'#3a2e2a':'#a8604a'}"/><rect x="${x}" y="70" width="120" height="12" fill="${c}"/><text x="${x+60}" y="79" text-anchor="middle" font-size="8" ${SVGF} fill="#fff">${t}</text>
      <rect x="${x+10}" y="92" width="44" height="30" fill="${win(n)}"/><rect x="${x+66}" y="92" width="22" height="48" fill="${n?'#1e1612':'#3a2618'}"/><rect x="${x+94}" y="92" width="18" height="30" fill="${win(n)}"/>`).join('')}
      <rect y="140" width="480" height="8" fill="${n?'#3a3a3a':'#8a8a86'}"/>${person(130,n,'#3a6a8a')}${person(268,n,'#e0a030',146,.9)}<path d="M120 126 q10 -12 20 0" fill="#c03a3a"/>${lamp(410,n)}`},
  fredmeyer:{name:'The grocery store',ic:'🛒',out:true,desc:'The big grocery store on Cedar Hills Blvd: pie, pie ingredients, emergency cranberry sauce',
    hours:d=>d===1?[360,960]:[360,1380],
    art:({night:n})=>`${firs(n,[[30,70],[455,80]])}<rect x="70" y="50" width="340" height="90" fill="${n?'#3a3a40':'#d8d4cc'}"/><rect x="70" y="50" width="340" height="18" fill="${n?'#2a3a5a':'#2a5a9a'}"/>
      <text x="240" y="63" text-anchor="middle" font-size="10" ${SVGF} fill="#fff">GROCERY · PHARMACY · FUEL</text><rect x="180" y="90" width="120" height="50" fill="${win(n)}"/><path d="M240 90 v50" stroke="#888"/>
      ${[0,1,2,3].map(i=>`<rect x="${90+i*20}" y="128" width="16" height="12" fill="none" stroke="#999"/>`).join('')}<rect x="320" y="96" width="70" height="20" fill="#f4e6c0"/><text x="355" y="109" text-anchor="middle" font-size="7" ${SVGF} fill="#a0401a">PIES $12.99</text>
      <rect y="140" width="480" height="10" fill="${n?'#2a2a2a':'#5a5a5a'}"/>${person(150,n,'#4a8a4a')}${person(330,n,'#8a4a8a',150)}`},
  mall:{name:'Washington Square',ic:'🛍️',out:true,desc:'The big mall off Hwy 217. On Black Friday it opens at 6 AM and becomes a weather system',
    hours:d=>d===1?null:d===2?[360,1320]:d===4?[660,1080]:[600,1260],
    art:({night:n})=>`<rect x="30" y="40" width="420" height="100" fill="${n?'#34343c':'#c6c0b4'}"/><rect x="170" y="24" width="140" height="30" fill="${n?'#2a2a34':'#a8a296'}"/><text x="240" y="44" text-anchor="middle" font-size="10" ${SVGF} fill="${n?'#ddd':'#3a3a3a'}">WASHINGTON SQUARE</text>
      <rect x="190" y="80" width="100" height="60" fill="${win(n)}"/>${[50,110,320,380].map(x=>`<rect x="${x}" y="70" width="40" height="40" fill="${win(n)}"/>`).join('')}<rect x="60" y="54" width="70" height="12" fill="#c03030"/><text x="95" y="63" text-anchor="middle" font-size="7" ${SVGF} fill="#fff">DOORBUSTERS</text>
      ${[120,140,160,300,330,350,370].map((x,i)=>person(x,n,['#c03a3a','#3a6a9a','#e0a030','#4a8a4a'][i%4],150,.9)).join('')}<rect y="146" width="480" height="4" fill="#ddd" opacity=".4"/>`},
  nature:{name:'Tualatin Hills Nature Park',ic:'🌿',out:true,desc:'Boardwalks through firs and ferns, a creek, and nobody asking you anything',
    hours:d=>d===1?null:[450,1000],
    art:({night:n})=>`${firs(n,[[20,110],[70,130],[120,96],[360,120],[410,136],[460,100]])}<path d="M0 130 Q120 120 240 128 T480 124 V140 H0 Z" fill="${n?'#1a2a22':'#3f5e48'}"/>
      <path d="M150 140 L210 112 H270 L330 140 Z" fill="${n?'#3a2e24':'#8a6a48'}"/>${[0,1,2,3].map(i=>`<path d="M${170+i*14} ${132-i*6} h${100-i*28}" stroke="${n?'#2a2018':'#6a4e34'}"/>`).join('')}
      <path d="M0 150 Q100 144 220 150 T480 148" stroke="${n?'#2a4050':'#7aa0b0'}" stroke-width="4" fill="none"/>${person(240,n,'#3a5a7a',116,.8)}<circle cx="300" cy="100" r="3" fill="#a05a2a"/>`},
};
// Minutes between places (symmetric). The house is one building; everything else is a short drive.
const TRAVEL={'oldtown|fredmeyer':12,'oldtown|mall':12,'oldtown|nature':10,'fredmeyer|mall':14,'fredmeyer|nature':12,'mall|nature':16};
const FROM_HOUSE={oldtown:12,fredmeyer:10,mall:15,nature:18};
function travelMins(a,b){
  if(a===b) return 0;
  if(atHouse(a)&&atHouse(b)) return a==='garage'||b==='garage'?2:1;
  if(atHouse(a)) return FROM_HOUSE[b]||15;
  if(atHouse(b)) return FROM_HOUSE[a]||15;
  return TRAVEL[a+'|'+b]??TRAVEL[b+'|'+a]??15;
}

// ---- actions ----
// Each: {ic, l, s, fn, cat (an ACT_CATS key), cls:'primary'|'danger', dis:true}. fn changes S, calls pass(min) and say('…').
let ACT_CATS={event:'🦃 Right now',fam:'👪 Family',chores:'📋 Chores',food:'🍽️ Food',pie:'🥧 The pie',shop:'🛍️ Shopping',rest:'🛋️ Rest & recharge',here:'📍 Around here'};
// talk to a family member: once a day each, a heart and a little charm
function talkAct(id){
  const F=FAMILY[id],k='talk_'+id,h=S.fam[id];
  return {ic:F.ic,l:id==='biscuit'?'Make friends with Biscuit':`Talk with ${F.n}`,s:did(k)?'You’ve already talked today. Try again tomorrow.':`20 min. ${hearts(id)}${h<3?' A heart and charm +2.':' Charm +1.'}`,cat:'fam',dis:did(k),
    fn:()=>{mark(k);pass(20);S.stats.talks++;say(F.lines[Math.min(h,3)]);heart(id,h<3?2:1);if(id==='biscuit')calm(4);if(id==='tanner'||id==='dez')weird(2);fireHook('talk',{who:id,sub:`With ${F.n}`})}};
}
// Riley: once a day, anywhere at the house
function rileyAct(){
  return {ic:'💞',l:'Check in with Riley',s:did('riley')?'You already had your moment today.':'15 min. A quiet “you okay?” in the hallway. Riley +8, stress −4.',cat:'fam',dis:did('riley'),
    fn:()=>{mark('riley');pass(15);adj('riley',8);adj('stress',-4);say(pick(['💞 Riley squeezes your hand. “You’re doing great. Grandma moved her chair closer to you. That’s huge.”','💞 You and Riley hide behind the coat closet for one full minute of peace. Best minute of the day.','💞 Riley whispers, “I told you they were weird.” You whisper, “You undersold it.” You both laugh too loud.']))}};
}
function choreAct(){
  const d=day(),n=S.chores[d]||0,full=n>=CHORE_MAX;
  return {ic:'📋',l:`Take a chore off Linda’s clipboard (${n}/${CHORE_MAX} today)`,s:full?'Linda says you’ve done enough today. She means it as a compliment.':S.energy<12?'You’re too tired. Rest first.':'40 min. Energy −10, charm +4, stress +2.',cat:'chores',cls:dinnerSoon()&&!full?'primary':'',dis:full||S.energy<12,
    fn:()=>{S.chores[d]=n+1;S.stats.chores++;pass(40);adj('energy',-10);adj('charm',4);adj('stress',2);if(S.chores[d]===CHORE_MAX&&S.fam.linda<3)S.fam.linda++;
      say(pick(['📋 You fold 40 napkins into swans. Linda inspects one, holds it to the light, and puts a check on the clipboard.','📋 You peel eleven pounds of potatoes. Biscuit supervises in a tiny chef’s hat.','📋 You polish the “good silver,” which is reserved for Thanksgiving and one funeral in 2004.','📋 You label the leftover containers. Linda has a label maker. It has a font setting called “Firm.”','📋 You move the folding chairs from the garage. Dez makes you promise not to look at the clocks.'])+(S.chores[d]===CHORE_MAX?' Linda gives you a curt nod: a ❤️ from Linda.':''))}};
}
function restAct(){
  return {ic:'😴',l:'Rest for an hour',s:`Energy +12, ${calmTxt(5)}.`,cat:'rest',dis:S.energy>=100&&S.stress<=0,
    fn:()=>{pass(60);adj('energy',12);calm(5);say(pick(['😴 You lie on the futon. 212 dolls watch over you. It is weirdly restful.','😴 An hour of the rain on the window. Somewhere downstairs, a timer goes off. Not your problem.','😴 You nap. You dream Grandma ranks your dream. You’re #9 in the dream. Progress.']))}};
}
function worldWait(){
  const m=tod(),o=[30,60,120].filter(x=>m+x<1439);
  modal('⏳ Wait a while',`<p style="font-size:13px;color:var(--mute)">It’s ${fmt(S.t)}. Time passes and nothing else happens.</p>`,
    o.map(x=>({l:`${x} minutes`,s:`Until ${fmt(S.t+x)}.`,fn:()=>{pass(x);say(`⏳ You wait ${x} minutes in ${L[S.loc].name.replace(/^The /,'the ')}.`)}})).concat([{l:'Never mind',fn:()=>{}}]));
}
function actionsHere(){
  const d=day(),m=tod(),a=[],at=(lo,hi)=>m>=lo&&m<hi,loc=S.loc;
  // the big scheduled moments: 21-story.js may define dinnerScene / gamesScene / leaveScene to run them
  if(loc==='living'&&d===DINNER_DAY&&!S.dinner.done&&at(DINNER_T-30,DINNER_T+120)&&typeof dinnerScene==='function')
    a.push({ic:'🦃',l:'Sit down for Thanksgiving dinner',s:m<=DINNER_T?'3:00 PM sharp. Linda is ringing a little bell.':'You’re late. Everyone is staring at the turkey, and then at you.',cat:'event',cls:'primary',fn:()=>dinnerScene()});
  if(loc==='living'&&d===GAMES_DAY&&!S.games.done&&at(GAMES_T-30,GAMES_T+120)&&typeof gamesScene==='function')
    a.push({ic:'🏆',l:'The Pemberton Family Games',s:'Charades, trivia and a lot of yelling. 2:00 PM.',cat:'event',cls:'primary',fn:()=>gamesScene()});
  if(atHouse()&&d===LEAVE_DAY&&typeof leaveScene==='function')
    a.push({ic:'🚗',l:'Say your goodbyes and head home',s:'Ends the weekend. Riley wants to leave by noon.',cat:'event',cls:m>=LEAVE_T-60?'primary':'',fn:()=>leaveScene()});
  if(atHouse()) a.push(rileyAct());
  Object.keys(FAMILY).filter(id=>FAMILY[id].at.includes(loc)).forEach(id=>a.push(talkAct(id)));
  if(loc==='guest'){
    a.push({ic:'🛏️',l:'Go to bed',s:`Ends the day on the futon. Alarm ${fmt(S.alarm)}.`,cat:'rest',cls:m>=1290?'primary':'',fn:()=>endDay('home')});
    a.push({ic:'⏰',l:`Alarm: ${fmt(S.alarm)}`,s:'Tap to cycle 6:00 → 7:00 → 8:00 → 9:00 → 10:00.',cat:'rest',fn:()=>{const o=[360,420,480,540,600];S.alarm=o[(o.indexOf(S.alarm)+1)%o.length];say(`⏰ Alarm set for ${fmt(S.alarm)}.`)}});
    a.push(restAct());
    a.push({ic:'🙈',l:'Hide in here for a bit',s:`30 min. ${cap(calmTxt(10))}. Someone will notice you’re gone (charm −1, Riley −2).`,cat:'rest',
      fn:()=>{pass(30);calm(10);adj('charm',-1);adj('riley',-2);S.stats.escapes++;say(pick(['🙈 You sit very still on the futon. Someone calls your name downstairs. You let the dolls answer.','🙈 You scroll your phone in the dark like a raccoon in a dumpster. It’s wonderful.','🙈 Riley texts “where r u.” You text back “bathroom.” You are not in the bathroom.']))}});
    if(!did('text')) a.push({ic:'📱',l:'Text a friend back home',s:'15 min. Stress −8. Once a day.',cat:'rest',
      fn:()=>{mark('text');pass(15);adj('stress',-8);say(pick(['📱 You send your best friend a photo of the dolls. She replies with eleven skull emojis and “blink twice.”','📱 “How’s it going?” “The uncle has a clock theory.” “WHAT theory.” You type for twenty minutes.','📱 Your friend sends a voice memo of just screaming. Supportive screaming.']))}});
    if(!did('dolls')) a.push({ic:'🎎',l:'Count the dolls',s:'10 min. Once a day. Just to be sure.',cat:'here',
      fn:()=>{mark('dolls');pass(10);const c=212+(S.flags.dollsMoved?1:0);weird(3);say(c===212?'🎎 212. All present. One of them is wearing a tiny Seahawks jersey. You don’t remember that yesterday.':'🎎 213. You count again. 213. You decide not to count anymore.')}});
  }
  if(loc==='kitchen'){
    a.push(choreAct());
    a.push({ic:'🥨',l:'Sneak a snack',s:'5 min. Energy +6. Linda may notice the missing cheese cube.',cat:'food',
      fn:()=>{pass(5);adj('energy',6);if(Math.random()<.25){adj('charm',-1);say('🥨 You take a cheese cube from the platter. Linda says “That platter is for <i>later</i>” without turning around.')}else say(pick(['🥨 A handful of Chex mix from the giant bowl. Nobody saw. Nobody.','🥨 A dinner roll, still warm. You eat it in the pantry like a criminal.']))}});
    if(d>=2&&!did('leftovers')) a.push({ic:'🍱',l:'Claim the good leftovers',s:'20 min. Energy +18, stress −4. Once a day, if you get there before Tanner.',cat:'food',
      fn:()=>{mark('leftovers');S.stats.meals++;pass(20);adj('energy',18);adj('stress',-4);say(pick(['🍱 The last of the fried turkey, stuffing and a smear of cranberry on a roll. Elite.','🍱 You find the container Linda labeled “DO NOT.” You do. It’s Gary’s deep-fried mac and cheese.','🍱 Tanner arrives one second late. You lock eyes over the stuffing. He lets you have it. Family.']))}});
    if(S.flags.pieKit&&!S.pie.have&&d<=DINNER_DAY) a.push({ic:'🥧',l:'Bake your pie',s:dinnerSoon()&&m>DINNER_T-120?'It needs 2 hours. Not enough time before dinner.':'2 hours with the oven (Linda allots you a window). Energy −12. A homemade pie impresses everyone.',cat:'pie',cls:'primary',dis:dinnerSoon()&&m>DINNER_T-120,
      fn:()=>{pass(120);adj('energy',-12);S.pie={have:true,kind:'homemade'};adj('charm',3);say('🥧 A pumpkin pie, a little lopsided, smelling like the whole holiday. Gary says “Could fry that.” Linda says “No.” Grandma looks at it for a long time.')}});
  }
  if(loc==='living'){
    if(!did('football')) a.push({ic:'🏈',l:'Watch the football game',s:'1 hour. Energy +4, stress −6. Everybody yells at the TV. Once a day.',cat:'here',
      fn:()=>{mark('football');pass(60);adj('energy',4);adj('stress',-6);if(Math.random()<.5)heart('gary',1);say(pick(['🏈 Gary explains the rules by frying an imaginary turkey with his hands. You understand football less, and Gary more.','🏈 Grandma knows every player’s stats. She’s been quiet all day. Now she is screaming.','🏈 Tanner bets Dez a “frog coin” on the game. No one knows what that means. Dez wins anyway.']))}});
    if(!S.flags.photoWall) a.push({ic:'🖼️',l:'Look at the family photo wall',s:'15 min. Charm +3. Ask questions. Families love questions.',cat:'here',
      fn:()=>{S.flags.photoWall=true;pass(15);adj('charm',3);say('🖼️ Every Thanksgiving since 1979, plus one of Biscuit dressed as a lobster. Riley at nine with a bowl cut. You ask about it. Linda tells you the whole story, delighted. Riley is mortified. Worth it.')}});
    if(d===DINNER_DAY&&!S.dinner.done&&!did('table')&&m<DINNER_T) a.push({ic:'🍽️',l:'Help set the long table',s:'30 min. Charm +3, Linda notices.',cat:'chores',
      fn:()=>{mark('table');pass(30);adj('charm',3);S.stats.chores++;say('🍽️ Fourteen place settings, each with a laminated name card. Yours says “Riley’s Friend.” Somebody has crossed out “Friend” and written your name in pen. Grandma’s handwriting.')}});
  }
  if(loc==='garage'){
    a.push({ic:'🥤',l:'Raid Dad’s second fridge',s:'5 min. Energy +5. Mostly soda and an alarming amount of lard.',cat:'food',fn:()=>{pass(5);adj('energy',5);say(pick(['🥤 A root beer from 2019. Still good. Probably.','🥤 You find a tray labeled “FRY LATER.” You close the fridge gently.']))}});
    if(!did('radio')) a.push({ic:'🎙️',l:'Help Dez on the radio',s:'45 min. Dez ❤️ more likely, stress +4. Once a day.',cat:'here',
      fn:()=>{mark('radio');pass(45);weird(4);if(Math.random()<.6)heart('dez',1);say(pick(['🎙️ You read the weather to a man in Idaho. Dez nods proudly: “You’ve got a voice for the truth.”','🎙️ A woman in Japan asks if it’s really already Thursday. Dez says “Is it, though?” and winks at you.','🎙️ You log six contacts in Dez’s book. He writes your name in the margin with a star.']))}});
  }
  if(loc==='backyard'){
    if(!did('fryer')) a.push({ic:'🔥',l:'Stand near the turkey fryer with Gary',s:'30 min. In the rain, under a golf umbrella. Gary ❤️ likely. Stress +3.',cat:'here',
      fn:()=>{mark('fryer');pass(30);weird(3);if(Math.random()<.6)heart('gary',1);say(pick(['🔥 Gary checks the oil with a thermometer the size of a sword. “Respect the oil,” he says. You respect the oil.','🔥 Gary fries a test potato. It comes out perfect. He holds it up like a trophy. You applaud. The neighbors applaud.','🔥 A small flare-up. Gary calmly puts a lid on it and says, “That’s just the fryer saying hi.”']))}});
    if(!did('hottub')) a.push({ic:'♨️',l:'Inspect the hot tub that doesn’t work',s:'10 min. Once a day. Everyone has a theory about it.',cat:'here',
      fn:()=>{mark('hottub');pass(10);weird(2);say(pick(['♨️ It’s full of rainwater and one floating pool noodle. It has been “almost fixed” since 2017.','♨️ A frog lives in it. Tanner has named the frog. It is the frog from his spreadsheet.','♨️ Dez says the hot tub is “fine, it just runs on a different clock.”']))}});
    a.push({ic:'🌧️',l:'Stand in the rain for a minute',s:`10 min. ${cap(calmTxt(5))}. Very Oregon.`,cat:'rest',fn:()=>{pass(10);calm(5);say(pick(['🌧️ Cold, soft rain. The firs smell like Christmas trees. Inside, someone laughs at a joke you didn’t hear. It’s nice out here.','🌧️ You breathe. The string lights drip. Biscuit watches you from the door like you’ve lost your mind.']))}});
  }
  if(loc==='oldtown'){
    const open=isOpen('oldtown'),c=rp(6);
    if(!did('coffee')) a.push({ic:'☕',l:`A coffee at the café — ${$(c)}`,s:open?'30 min. Energy +10, stress −8. Once a day.':'Closed right now.',cat:'food',dis:!open||!canAfford(c),
      fn:()=>{mark('coffee');spend(c);pass(30);adj('energy',10);adj('stress',-8);say(pick(['☕ A latte in a big mug, a window seat, the rain doing its thing. No one asks you about crypto for thirty whole minutes.','☕ The barista draws a turkey in your foam. It looks like a hand. Classic.']))}});
    a.push({ic:'🚶',l:'Walk around Old Town',s:`30 min. ${cap(calmTxt(8))}.`,cat:'rest',fn:()=>{pass(30);calm(8);say(pick(['🚶 Brick storefronts, wet sidewalks, holiday wreaths going up on the lampposts. Normal people doing normal things.','🚶 You pass a shop window full of clocks. You think of Dez. You keep walking, faster.']))}});
    if(!S.flags.gift_marjorie) a.push({ic:'🎁',l:`A little gift for Grandma — ${$(rp(14))}`,s:open?'15 min. Grandma likes a guest who brings something. Rank help.':'The shops are closed right now.',cat:'shop',dis:!open||!canAfford(rp(14)),
      fn:()=>{S.flags.gift_marjorie=true;spend(rp(14));pass(15);heart('marjorie',2);say('🎁 A tin of butter cookies with a lighthouse on it. Grandma will say she doesn’t need anything. Grandma will keep the tin forever.')}});
    if(!did('riley_out')) a.push({ic:'💞',l:'Take Riley for a walk',s:'45 min. Riley +12, stress −6. Once a day.',cat:'here',
      fn:()=>{mark('riley_out');pass(45);adj('riley',12);adj('stress',-6);say('💞 You and Riley share a pastry and talk about anything except the family. Riley says this is their favorite part of coming home. You think they mean the town. They mean you.')}});
  }
  if(loc==='fredmeyer'){
    const open=isOpen('fredmeyer'),sp=rp(14),kit=rp(18),cr=rp(4);
    if(!S.pie.have) a.push({ic:'🥧',l:`Buy a store-bought pie — ${$(sp)}`,s:open?'15 min. It’s a pie. It counts. Grandma may have notes.':'The store is closed right now.',cat:'pie',cls:dinnerSoon()?'primary':'',dis:!open||!canAfford(sp),
      fn:()=>{spend(sp);pass(15);S.pie={have:true,kind:'store'};say('🥧 A pumpkin pie in a plastic dome, $12.99 plus a sticker that says “Baked Fresh!” You decide not to think about when.')}});
    if(!S.pie.have&&!S.flags.pieKit&&d<=DINNER_DAY) a.push({ic:'🧈',l:`Buy pie ingredients — ${$(kit)}`,s:open?'20 min. Then bake it in the kitchen (2 hours) before dinner. Homemade wins hearts.':'The store is closed right now.',cat:'pie',dis:!open||!canAfford(kit),
      fn:()=>{spend(kit);pass(20);S.flags.pieKit=true;say('🧈 Canned pumpkin, a crust, eggs, evaporated milk, nutmeg. You stand in the baking aisle feeling like a grown-up.')}});
    if(!S.flags.cranberry) a.push({ic:'🫐',l:`Grab cranberry sauce for Linda — ${$(cr)}`,s:open?'10 min. The canned kind, with the ridges. Linda ❤️.':'Closed.',cat:'shop',dis:!open||!canAfford(cr),
      fn:()=>{S.flags.cranberry=true;spend(cr);pass(10);heart('linda',3);say('🫐 Two cans, ridges intact. Linda will pretend she had backup. She did not have backup.')}});
    a.push({ic:'🍪',l:`A snack for the car — ${$(rp(3))}`,s:open?'5 min. Energy +6.':'Closed.',cat:'food',dis:!open||!canAfford(rp(3)),fn:()=>{spend(rp(3));pass(5);adj('energy',6);say('🍪 A bag of cookies eaten in Riley’s car, rain on the windshield. Freedom.')}});
  }
  if(loc==='mall'){
    const open=isOpen('mall'),bf=d===2;
    if(bf&&!did('doorbuster')) a.push({ic:'🏷️',l:`Brave the Black Friday doorbusters — ${$(rp(30))}`,s:open?'1 hour. Stress +12, energy −10. A gift for everyone in the family (charm +8).':'Opens at 6 AM.',cat:'shop',cls:open&&m<720?'primary':'',dis:!open||!canAfford(rp(30)),
      fn:()=>{mark('doorbuster');spend(rp(30));pass(60);adj('energy',-10);weird(12);adj('charm',8);say('🏷️ You come out of a crowd holding a slow cooker, seven fuzzy socks and someone else’s scarf. You return the scarf. The family will love the socks. Biscuit gets the smallest pair.')}});
    a.push({ic:'🎁',l:`Buy a nice gift for Riley — ${$(rp(25))}`,s:open?'20 min. Riley +10.':'The mall is closed right now.',cat:'shop',dis:!open||!canAfford(rp(25))||!!S.flags.gift_riley,
      fn:()=>{S.flags.gift_riley=true;spend(rp(25));pass(20);adj('riley',10);say('🎁 A soft scarf in the exact green Riley wore on your first date. You hide it in your coat like a spy.')}});
    a.push({ic:'👀',l:'People-watch from a bench',s:`20 min. ${cap(calmTxt(4))}.`,cat:'rest',dis:!open,fn:()=>{pass(20);calm(4);say(pick(['👀 A man carries a TV the size of a door to his car alone. Nobody helps. Everybody watches.','👀 A family of six in matching turkey sweaters. They look exhausted. You feel seen.']))}});
  }
  if(loc==='nature'){
    const open=isOpen('nature');
    if(!did('trail')) a.push({ic:'🌲',l:'A long walk on the boardwalk trail',s:open?'1 hour. Stress −18, energy −6. Once a day. The best quiet in Beaverton.':'The park is open 7:30 AM to dusk.',cat:'rest',cls:open&&S.stress>=50?'primary':'',dis:!open,
      fn:()=>{mark('trail');pass(60);adj('stress',-18);adj('energy',-6);say(pick(['🌲 Firs, ferns, a creek loud with rain. A heron stands perfectly still. You try it. You almost manage.','🌲 Moss on everything. A deer looks at you, unimpressed, and walks off. Nobody ranks you here.','🌲 You walk until you can’t hear the house in your head anymore. Then you walk back, ready.']))}});
    a.push({ic:'🦆',l:'Watch the ducks',s:`20 min. ${cap(calmTxt(5))}.`,cat:'rest',dis:!open,fn:()=>{pass(20);calm(5);say('🦆 Mallards on the pond, ignoring the rain completely. Role models.')}});
  }
  if(!(loc==='guest'&&m>=1290)) a.push({ic:'⏳',l:'Wait a while…',s:'Skip ahead 30, 60 or 120 minutes.',cat:'rest',fn:()=>worldWait()});
  return a;
}

// ---- small extras on the Here tab ----
function statusTags(){
  const t=[],d=day(),m=tod();
  t.push(S.pie.have?`<span class="tag">🥧 ${S.pie.kind==='homemade'?'homemade pie ready':'store pie ready'}</span>`:d<=DINNER_DAY?`<span class="tag ${d===DINNER_DAY?'bad':''}">🥧 you still owe a pie${S.flags.pieKit?' (ingredients bought)':''}</span>`:'');
  if(d===DINNER_DAY&&!S.dinner.done) t.push(`<span class="tag ${m>=DINNER_T-60?'bad':''}">🦃 dinner ${fmt(DINNER_T)} sharp</span>`);
  if(d===GAMES_DAY&&!S.games.done) t.push(`<span class="tag">🏆 Family Games ${fmt(GAMES_T)}</span>`);
  if(d===LEAVE_DAY) t.push(`<span class="tag">🚗 leaving at ${fmt(LEAVE_T)}</span>`);
  t.push(`<span class="tag">👵 Grandma’s rank: #${S.rank} of 14</span>`);
  if(S.energy<25) t.push('<span class="tag bad">🥱 running on empty</span>');
  if(S.stress>=70) t.push('<span class="tag bad">😵 losing it</span>');
  if(S.riley<30) t.push('<span class="tag bad">💔 Riley needs you</span>');
  return t.filter(Boolean);
}
function alertBar(){
  const d=day(),m=tod();
  if(d===DINNER_DAY&&!S.dinner.done&&m>=DINNER_T-90&&m<DINNER_T+120) return {t:`🦃 Dinner is at ${fmt(DINNER_T)} sharp in the living room.${S.pie.have?'':' And you don’t have the pie.'}${S.loc!=='living'?` You’re ${travelMins(S.loc,'living')} min away.`:''}`,kind:m>DINNER_T?'':'info'};
  if(d===DINNER_DAY&&!S.pie.have&&!S.dinner.done&&m<DINNER_T) return {t:`🥧 You promised a pie for dinner at 3:00 PM. The grocery store is open until 4 PM today${S.flags.pieKit?', or bake yours in the kitchen':''}.`,kind:'info'};
  if(d===GAMES_DAY&&!S.games.done&&m>=GAMES_T-90&&m<GAMES_T+120) return {t:`🏆 The Pemberton Family Games start at ${fmt(GAMES_T)} in the living room.`,kind:'info'};
  if(d===LEAVE_DAY&&m>=LEAVE_T-90) return {t:`🚗 Riley wants to leave at ${fmt(LEAVE_T)}. Say your goodbyes.`,kind:'info'};
  if(d===2&&m<720&&S.loc!=='mall') return {t:'🏷️ Black Friday: Washington Square opened at 6 AM.',kind:'info'};
  if(S.riley<25) return {t:'💔 Riley seems down. Check in with them at the house.'};
  return null;
}

// ---- extra tabs ----
let EXTRA_TABS=[{k:'fam',ic:'👪',l:'Family',view:()=>famView()}];
function famView(){
  return `<div class="sect">The Pembertons · charm ${S.charm}/100</div>`
    +`<div class="rules">👵 Grandma’s fridge ranking: you are <b>#${S.rank} of 14</b> guests ever. She re-ranks every night, from charm and hearts. 💞 Riley: ${S.riley}/100.</div>`
    +Object.entries(FAMILY).map(([id,F])=>`<div class="todo"><span class="ck">${F.ic}</span><div><b>${F.n} ${hearts(id)}</b><span>${F.d} Usually in ${famAt(id)}.</span></div></div>`).join('')
    +`<div class="rules">Talk with each of them once a day for a heart. Chores, gifts and the right answers at dinner help too. ${heartsTotal()} of 21 hearts so far.</div>`;
}

// ---- engine shims ----
// The engine (02–09) still calls a few Guide Master helpers without typeof guards (40-art.js, 45-names.js, the morning report).
// These no-op versions only fill in names nobody else defines: a real function or const elsewhere always wins.
(function(){
  const w=window,def=(k,v)=>{if(typeof w[k]==='undefined')w[k]=v};
  def('artOn',()=>false);def('artPref',()=>false);def('artScene',()=>'');def('artFirst',()=>'');def('artSlot',()=>'');def('artEventCtx',()=>null);
  def('artMorning',D=>({top:'',night:(D&&D.night)||''}));
  def('artNarrEvent',()=>null);def('ART',{any:()=>false});def('ART_NARR',null);def('LOGSUB','log');
  def('cabinName',()=>'Home');
  def('dlabel',d=>augDate(d));
  def('reqKey',r=>{if(!r)return 'a trip';const n=(r.party&&r.party.n)||r.n;return `${r.type||'trip'}${n?` for ${n}`:''}${typeof r.start==='number'?` at ${fmt(r.start)}`:''}`});
})();
