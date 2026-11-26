// ---------------- "📲 Install app" on the title screen, and the install bar above it ----------------
// 08-settings.js puts installButton() right under ❓ Help on the title screen, and installBar() at the very top: a slim
// "📲 Play offline: install the app [Install] [✕]" line for phones and tablets in a browser (and any browser that has offered an
// install). ✕ hides the bar for 30 days. The Install app button is always there, except in the single-file offline build
// (SINGLE_FILE: no server, nothing to install). What it does depends on the device:
//   Chrome / Edge / Samsung Internet (Android and computers): when the browser has offered an install (beforeinstallprompt),
//     the button opens the browser's own install prompt; after appinstalled it says thanks.
//   No offer (Firefox, a browser that hasn't decided the page is installable, already installed, …): a short sheet with the menu steps.
//   iPhone / iPad (incl. iPadOS that reports as a Mac with touch): the step-by-step page install/ios.html, with a video.
//   Already running as the installed app: a short note saying so.
let deferredInstall=null;
const INSTALLED_KEY=KEY('installed');   // set after appinstalled: a browser tab of an installed app shows no button
const isStandalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true}catch(e){return false}};
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const SINGLE_FILE=false;   // tools/build-offline.py turns this on in the one-file offline copy
const canInstallHere=()=>!SINGLE_FILE&&/^https?:$/.test(location.protocol)&&!isStandalone();
function installShown(){
  if(!canInstallHere())return false;
  if(deferredInstall||isIOS())return true;
  try{return localStorage.getItem(INSTALLED_KEY)!=='1'}catch(e){return true}
}
const installVisible=()=>!SINGLE_FILE;
function installButton(){if(!installVisible())return '';
  const sub=isStandalone()?'You’re playing the installed app':'Put it on your home screen. Plays offline.';
  return `<button id="installBtn" class="t-btn t-inst" onclick="doInstall()"><span class="t-ic" aria-hidden="true">📲</span><span class="t-tx"><b>Install app</b><span>${sub}</span></span></button>`}
const isPhoneOrTablet=()=>isIOS()||/android|mobi|silk|kindle|tablet/i.test(navigator.userAgent)||!!(navigator.userAgentData&&navigator.userAgentData.mobile);
const BAR_KEY=KEY('installBarHidden'),BAR_DAYS=30;   // when ✕ was tapped (ms)
function installBarDismissed(){try{const t=+localStorage.getItem(BAR_KEY);return t>0&&Date.now()-t<BAR_DAYS*864e5}catch(e){return false}}
function installBarShown(){return installShown()&&(isPhoneOrTablet()||!!deferredInstall)&&!installBarDismissed()}
function installBar(){return installBarShown()?`<div class="inst-bar" id="installBar" role="region" aria-label="Install the app"><span class="ib-t">📲 Play offline: install the app</span>
  <button id="installBarBtn" class="ib-go" onclick="doInstall()">Install</button><button class="ib-x" onclick="dismissInstallBar()" aria-label="Dismiss">✕</button></div>`:''}
window.dismissInstallBar=()=>{try{localStorage.setItem(BAR_KEY,String(Date.now()))}catch(e){}
  const b=document.getElementById('installBar');if(b)b.remove();
  const f=document.querySelector('.title .big');if(f)f.focus();
  if(typeof fitTitle==='function')fitTitle()};
function syncInstallBtn(){const bar=document.getElementById('installBar');
  if(bar&&!installBarShown()){bar.remove();if(typeof fitTitle==='function')fitTitle()}
  else if(document.querySelector('.title')&&!bar&&installBarShown())titleScreen()}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;try{localStorage.removeItem(INSTALLED_KEY)}catch(x){}syncInstallBtn()});
window.addEventListener('appinstalled',()=>{deferredInstall=null;try{localStorage.setItem(INSTALLED_KEY,'1')}catch(e){}syncInstallBtn();
  installToast('✅ Thanks for installing Thanksgiving at Weird People’s House! Find it on your home screen. It plays offline, too.')});
// A short note at the bottom of the screen (the title screen has no event tiles).
function installToast(msg){
  document.querySelectorAll('.inst-toast').forEach(e=>e.remove());
  const el=document.createElement('div');el.className='inst-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.textContent=msg;
  document.body.appendChild(el);setTimeout(()=>el.remove(),6000);
}
// The other browsers' menu steps, by what this browser looks like.
function installSteps(){
  const ua=navigator.userAgent,mobile=/android|mobile/i.test(ua);
  if(/SamsungBrowser/i.test(ua))return ['Tap the menu button (☰) at the bottom of the screen.','Tap <b>Add page to</b>, then <b>Home screen</b>.','Tap <b>Add</b>. Thanksgiving at Weird People’s House is now on your home screen.'];
  if(/Firefox|FxiOS/i.test(ua)&&mobile)return ['Tap the browser menu (⋮).','Tap <b>Add app to Home screen</b> (or <b>Install</b>).','Tap <b>Add</b>. Thanksgiving at Weird People’s House is now on your home screen.'];
  if(/Firefox/i.test(ua))return ['Firefox on a computer can’t install web apps. Open this page in Chrome or Edge to install it.','Or simply bookmark it: once loaded, the game also plays offline in this browser.'];
  if(!mobile&&/Safari/i.test(ua)&&!/Chrome|Chromium|Edg/i.test(ua))return ['In Safari’s menu bar, choose <b>File → Add to Dock…</b> (macOS Sonoma or later).','Click <b>Add</b>. Thanksgiving at Weird People’s House opens from the Dock in its own window.'];
  if(!mobile)return ['Click the install icon (a screen with a down arrow) at the right end of the address bar,','or open the browser menu (⋮ or …) and choose <b>Install Thanksgiving at Weird People’s House</b> (Edge: <b>Apps → Install this site as an app</b>).','Click <b>Install</b>. Thanksgiving at Weird People’s House gets its own window and a desktop icon.'];
  return ['Open the browser menu (⋮), at the top right.','Tap <b>Install app</b> or <b>Add to Home screen</b>.','Tap <b>Install</b> (or <b>Add</b>). Thanksgiving at Weird People’s House is now on your home screen.'];
}
function installSheet(){
  const steps=installSteps();
  modal('📲 Install Thanksgiving at Weird People’s House',`<p>Put the game on your home screen: it opens full screen, like an app, and plays offline.</p>
  <ol class="inst-steps">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>
  <p style="font-size:13px;color:var(--mute)">Don’t see it in the menu? Use the game for a minute and look again: some browsers only offer it after a short visit. On Android and computers the installed app keeps this browser’s saved games.</p>`,
  [{l:'Got it',fn:()=>{}}]);
}
window.doInstall=async()=>{
  if(deferredInstall){const ev=deferredInstall;deferredInstall=null;
    try{ev.prompt();const c=await ev.userChoice;if(c&&c.outcome==='accepted'){try{localStorage.setItem(INSTALLED_KEY,'1')}catch(e){}}}catch(e){}
    syncInstallBtn();return}
  if(isStandalone()){installToast('✅ You’re already playing the installed app. Find Thanksgiving at Weird People’s House on your home screen any time.');return}
  if(isIOS()){if(typeof saveGame==='function'&&S&&!S.over)saveGame();location.href='install/ios.html';return}
  installSheet();
};
