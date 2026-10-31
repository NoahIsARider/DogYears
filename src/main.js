import * as THREE from 'three';
import {HouseWorld} from './world.js';
import {HouseControls,canWalk,roomAt,BLOCKS} from './controls.js';
import {HouseAudio} from './audio.js';
import {OBJECTS,CHOICES,newGame,loadGame,saveGame,choose,wait,sleep,advanceTime,markMemory,canChoose,getMessages,markMessagesRead,reply,ending,finish,recordScene,discover} from './game.js';
import {CHAPTERS,SCENES,DISCOVERIES,getScene,chapterReady,hasSceneVisit} from './story.js';
import {MemorySequence} from './sequence.js';
import {ForestFilm} from './forest/player.js';
import {startInterlude,recordInterlude,closeInterlude} from './forest/journal.js';
import './style.css';
import './type.css';
const $=s=>document.querySelector(s),escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let settings={sensitivity:.8,fov:64,smoothing:true,headMotion:false,volume:.32,muted:false,quality:'high'};
try{settings={...settings,...JSON.parse(localStorage.getItem('dogyears.settings')||'{}')};}catch{}
for(const [key,fallback,min,max] of [['sensitivity',.8,.25,2],['fov',64,55,85],['volume',.32,0,.75]])settings[key]=Number.isFinite(settings[key])?THREE.MathUtils.clamp(settings[key],min,max):fallback;
for(const key of ['smoothing','headMotion','muted'])settings[key]=settings[key]===true;
settings.quality=settings.quality==='low'?'low':'high';
document.title='DogYears';
$('#app').innerHTML=`<canvas id="world" aria-label="DogYears. An old house, late afternoon."></canvas><div id="vignette"></div><div id="fade"></div><div id="reticle" aria-hidden="true"></div><div id="counter"><span>0</span><small>dog years</small></div><div id="thought" role="status" aria-live="polite"></div><div id="prompt"></div><div id="memory-line"></div><div id="memory-hint"></div><div id="hold"><i></i></div><div id="hint"></div><div id="overlay"></div><div id="choices"></div><div id="phone"></div><div id="day-card"></div><div id="save-light" aria-label="Progress saved"></div>`;
let world,control,audio,state=loadGame(),mode='title',ready=false,active=null,hover=null,holding=false,progress=0,thoughtTimer,hintTimer,started=false,memoryPaused=false,storyTimer=0,previousYears=state.years,wasLocked=false,memoryLineTimer;
let sequence=null,sceneScript=null,phoneThread='Ellis';
const chapter=()=>CHAPTERS[state.day-1];
const sceneKey=id=>`${state.day}:${id}`;
const storyNeeded=o=>Boolean(SCENES[sceneKey(o.id)]&&!state.sceneProgress?.[sceneKey(o.id)]?.completed);
const storyDayReady=()=>chapterReady(state)&&(state.day===5||state.day===6?state.sceneProgress?.[sceneKey('model')]?.completed:state.day===7?state.sceneProgress?.['7:bowl']?.completed:true);
function unfinishedHint(){const id=chapter().required.find(id=>!hasSceneVisit(state,sceneKey(id)));if(id)return `Before I lie down, there is still ${OBJECTS.find(o=>o.id===id).title.toLowerCase()}.`;if((state.day===5||state.day===6)&&!state.sceneProgress?.[sceneKey('model')]?.completed)return state.day===6?'I have not sent Mara the photograph.':'The loose roof beam is still on the workbench.';if(state.day===7&&!state.sceneProgress?.['7:bowl']?.completed)return 'I could look at the worn circle by the bowl again.';return chapter().restHint;}
const extras=[{id:'bed',kind:'rest',title:'The bed',prompt:'Rest until morning',position:[3.35,.72,3.58]},{id:'front',kind:'wait',title:'The front door',prompt:'Wait for the key',position:[0,1.3,5.9]},{id:'back',kind:'exit',title:'The back door',prompt:'Step outside',position:[0,1.3,-6.05]},{id:'mirror',kind:'mirror',title:'The mirror',prompt:'Look',position:[.81,1.64,4.88]},{id:'seat',kind:'wait',title:'The quiet chair',prompt:'Sit for a while',position:[3.2,.8,-3.2]}];
try{world=new HouseWorld($('#world'),settings);control=new HouseControls(world.camera,$('#world'),settings);audio=new HouseAudio(settings);}catch(e){$('#overlay').innerHTML='<section class="menu visible"><h1>DogYears</h1><p>This house needs a browser with WebGL.</p><button onclick="location.reload()">Try again</button></section>';$('#overlay').classList.add('visible');throw e;}
const camera=world.camera;
let interludeBusy=false;
const forestFilm=new ForestFilm({volume:settings.volume,muted:settings.muted,onProgress:({time})=>{if(mode==='interlude'&&state.pendingInterlude){state=recordInterlude(state,time);saveGame(state);}}});
forestFilm.load().catch(error=>console.warn('Forest preload will retry when needed.',error.message));
function setMode(m){mode=m;control.enabled=['house','memory'].includes(m);if(!control.enabled)control.reset();document.body.dataset.mode=m;}
function unlock(){if(document.pointerLockElement)document.exitPointerLock();}
function persist(){saveGame(state);try{localStorage.setItem('dogyears.view',JSON.stringify({position:camera.position.toArray(),yaw:control.yaw,pitch:control.pitch,day:state.day}));}catch{}$('#save-light').classList.add('on');setTimeout(()=>$('#save-light').classList.remove('on'),900);world.applyState(state);updateCounter();}
function updateCounter(){$('#counter span').textContent=state.years;$('#counter').classList.toggle('changed',state.years!==previousYears);if(state.years!==previousYears){setTimeout(()=>$('#counter').classList.remove('changed'),1600);previousYears=state.years;}}
function thought(line,seconds=5){clearTimeout(thoughtTimer);$('#thought').textContent=line;world.ink.say(line,{kind:'thought',duration:seconds,position:mode==='house'&&hover?hover.position:null});}
function hint(line,seconds=7){clearTimeout(hintTimer);$('#hint').textContent=line;$('#hint').classList.add('show');hintTimer=setTimeout(()=>$('#hint').classList.remove('show'),seconds*1000);}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function fade(work,ms=650){$('#fade').style.transitionDuration=`${ms}ms`;$('#fade').classList.add('black');await delay(ms);await work?.();$('#fade').classList.remove('black');await delay(ms);}
function overlay(html){$('#overlay').innerHTML=html;$('#overlay').classList.toggle('visible',!!html);}
function title(){setMode('title');unlock();$('#counter').hidden=true;$('#reticle').hidden=true;overlay(`<section class="title-menu"><h1>DogYears</h1><p class="title-line">Some afternoons last longer than others.</p><nav><button id="begin" ${ready?'':'disabled'}>${state.day>1||state.history.length||state.waits?'Continue':'Enter the house'}</button><button id="title-settings">Settings</button></nav><p class="loading">${ready?'':'Opening the house…'}</p></section>`);$('#begin').onclick=begin;$('#title-settings').onclick=()=>settingsMenu('title');}
function restoreView(){try{const v=JSON.parse(localStorage.getItem('dogyears.view')||'null');if(v?.day===state.day&&Array.isArray(v.position)&&v.position.length===3&&v.position.every(Number.isFinite)&&Number.isFinite(v.yaw)&&Number.isFinite(v.pitch)&&canWalk(v.position[0],v.position[2])){camera.position.fromArray(v.position);camera.position.y=1.65;control.yaw=control.targetYaw=v.yaw;control.pitch=control.targetPitch=THREE.MathUtils.clamp(v.pitch,-1.25,1.25);camera.rotation.set(control.pitch,control.yaw,0,'YXZ');return;}}catch{}camera.position.set(0,1.65,5.35);control.lookAt([0,1.55,-5]);}
async function begin(){if(!ready)return;overlay('');$('#counter').hidden=false;$('#reticle').hidden=false;updateCounter();restoreView();started=true;audio.unlock();if(state.pendingInterlude){continueInterlude();return;}if(state.phase==='ending'){showEnding(ending(state));return;}setMode('house');await control.lock();if(!document.pointerLockElement){pause('Click Resume to look around.');return;}if(!state.history.length&&!state.waits&&state.day===1){dayCard();hint('W A S D  move     Mouse  look     E  touch     Esc  pause',11);await delay(6500);if(mode==='house'&&state.day===1&&!state.seenMemories.length)thought('You said you would be back before the light changed.',6);}else hint('E  touch     P  phone     Esc  pause',5);}
function dayCard(){const el=$('#day-card');el.innerHTML=`<small>Day ${['one','two','three','four','five','six','seven'][state.day-1]}</small><span>${escapeHTML(chapter().title)}</span>`;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),4500);}
function pause(note=''){if(['transition','interlude','ending','title','decision'].includes(mode))return;if(mode==='phone'){$('#phone').classList.remove('visible');$('#phone').innerHTML='';}if(mode==='inspect'){world.clearInspection();active=null;}if(mode==='memory')memoryPaused=true;holding=false;setMode('pause');unlock();persist();$('#prompt').textContent='';overlay(`<section class="pause-menu"><small>DAY ${state.day}</small><h2>A moment.</h2>${note?`<p>${escapeHTML(note)}</p>`:''}<nav><button id="resume">Resume</button><button id="settings">Settings</button><button id="new">Begin again</button></nav><p class="controls-note">W A S D · Move<br>Mouse · Look<br>E · Touch / hold<br>R · Leave a memory<br>P · Phone<br>Esc · Pause</p></section>`);$('#resume').onclick=resume;$('#settings').onclick=()=>settingsMenu('pause');$('#new').onclick=confirmNew;}
async function resume(){overlay('');setMode(memoryPaused?'memory':'house');memoryPaused=false;await control.lock();if(!document.pointerLockElement)pause('The mouse is not captured. Click Resume again.');}
function confirmNew(){
 overlay(`<section class="pause-menu"><h2>Begin again?</h2><p>The days in this house will start over.</p><nav><button id="confirm-new">Begin again</button><button id="cancel-new">Stay here</button></nav></section>`);
 $('#cancel-new').onclick=()=>state.phase==='ending'?showEnding(ending(state)):pause();
 $('#confirm-new').onclick=()=>{
  state=newGame();world.clearMemory();world.clearInspection();world.ink.clear();active=null;memoryPaused=false;progress=0;holding=false;sequence=null;sceneScript=null;phoneThread='Ellis';
  clearTimeout(memoryLineTimer);clearTimeout(thoughtTimer);clearTimeout(hintTimer);
  for(const id of ['memory-line','memory-hint','hold','thought','hint','day-card'])$('#'+id).classList.remove('show','visible');
  $('#choices').classList.remove('visible');$('#phone').classList.remove('visible');$('#prompt').textContent='';$('#hold i').style.width='0%';
  try{localStorage.removeItem('dogyears.view');}catch{}
  for(const meshes of world.groups.values())meshes.forEach(o=>o.visible=true);world.applyState(state);saveGame(state);title();
 };
}
function settingsMenu(back){unlock();setMode('settings');overlay(`<section class="settings-menu"><h2>Settings</h2><label>Look sensitivity <output id="sens-value">${settings.sensitivity.toFixed(1)}</output><input id="sensitivity" type="range" min="0.25" max="2" step="0.05" value="${settings.sensitivity}"></label><label>Field of view <output id="fov-value">${settings.fov}°</output><input id="fov" type="range" min="55" max="85" step="1" value="${settings.fov}"></label><label>Sound <output id="vol-value">${Math.round(settings.volume*100)}%</output><input id="volume" type="range" min="0" max="0.75" step="0.01" value="${settings.volume}"></label><label class="toggle"><input id="smoothing" type="checkbox" ${settings.smoothing?'checked':''}> Gentle mouse smoothing</label><label class="toggle"><input id="headMotion" type="checkbox" ${settings.headMotion?'checked':''}> Subtle head movement</label><label class="toggle"><input id="muted" type="checkbox" ${settings.muted?'checked':''}> Mute sound</label><label class="toggle"><input id="low" type="checkbox" ${settings.quality==='low'?'checked':''}> Reduced graphics</label><button id="settings-back">Back</button></section>`);
 for(const id of ['sensitivity','fov','volume','smoothing','headMotion','muted','low'])$('#'+id).oninput=e=>{if(id==='low')settings.quality=e.target.checked?'low':'high';else settings[id]=e.target.type==='checkbox'?e.target.checked:Number(e.target.value);$('#sens-value').value=settings.sensitivity.toFixed(1);$('#fov-value').value=settings.fov+'°';$('#vol-value').value=Math.round(settings.volume*100)+'%';camera.fov=settings.fov;camera.updateProjectionMatrix();audio.setVolume(settings.volume);audio.setMuted(settings.muted);try{localStorage.setItem('dogyears.settings',JSON.stringify(settings));}catch{}};
 $('#settings-back').onclick=()=>back==='title'?title():pause();
}
function available(obj){if(obj.kind==='discovery')return obj.day<=state.day;if(obj.kind!=='keepsake')return true;const record=state.decisions[obj.id];return storyNeeded(obj)||!record||record.choice==='keep';}
const dir=new THREE.Vector3(),to=new THREE.Vector3();
const discoveries=DISCOVERIES.map(o=>({...o,id:'detail-'+o.id,discoveryId:o.id,kind:'discovery',prompt:'Notice'}));
function findHover(){camera.getWorldDirection(dir);let best=null,score=-99;for(const o of [...OBJECTS,...extras,...discoveries]){if(!available(o))continue;to.fromArray(o.position).sub(camera.position);const d=to.length();if(d>(o.id==='bed'?2.5:o.kind==='discovery'?1.9:2.35)||d<.08)continue;const dot=dir.dot(to.normalize());if(dot<(o.id==='bed'?.89:o.kind==='discovery'?.985:.967)||!world.visibleTo(o.position))continue;const priority=dot-d*.035+(o.kind==='keepsake'&&storyNeeded(o)?.018:0);if(priority>score){score=priority;best=o;}}return best;}
function prompt(){if(mode==='house'){hover=findHover();world.ink.point(hover?.position||null);$('#prompt').innerHTML=hover?'<span class="key">E</span>':'';$('#reticle').classList.toggle('near',Boolean(hover));}else if(mode!=='memory'&&mode!=='inspect')$('#prompt').textContent='';}
async function interact(){
 if(mode==='inspect'){enterMemory(active);return;}if(mode!=='house'||!hover)return;
 const obj=hover;active=obj;audio.cue(cueFor(obj.id));
 if(obj.kind==='discovery'){state=discover(state,obj.discoveryId);persist();thought(obj.line,7);return;}
 if(obj.kind==='phone'){openPhone();return;}if(obj.kind==='rest'){rest();return;}if(obj.kind==='wait'){waitHere(obj);return;}
 if(obj.kind==='exit'){if(state.years>=49||state.day>=7&&storyDayReady())confirmExit();else thought(state.day>=7?unfinishedHint():'The air is cooler on this side of the door.');return;}
 if(obj.kind==='mirror'){thought(state.years>=21?'For a second, you do not recognise the person who has been waiting.':state.years>=7?'Your face looks tired in a way sleep has not helped.':'The mirror gives the room back.');return;}
 if(!canChoose(state,obj.id)&&!storyNeeded(obj)){thought(state.decisions[obj.id]?.day===state.day?'You have done enough with this for today.':'There is not much daylight left.');return;}
 const previous=state.decisions[obj.id];if(previous&&previous.choice!=='keep'){enterMemory(obj);return;}
 setMode('inspect');world.inspect(obj);thought(getScene(state.day,obj.id)?.line||obj.line,9);$('#prompt').innerHTML='<span class="key">E</span><span>Remember</span><small>R · Put it down</small>';hint('Drag to turn it in your hands.',4);
}
function cueFor(id){return ({leash:'key',cups:'cup',calendar:'paper',pillow:'cloth',clothes:'cloth',model:'paper',letter:'paper',bowl:'cup',phone:'phone',front:'door',back:'door',bed:'cloth'})[id]||'paper';}
function memoryBeat(line){clearTimeout(memoryLineTimer);$('#memory-line').textContent=line;world.ink.say(line,{kind:'memory',duration:6.3});}
function enterMemory(obj){
 if(!obj)return;world.clearInspection();state=markMemory(state,obj.id);persist();setMode('memory');world.startMemory(obj);
 sceneScript=getScene(state.day,obj.id)||{...obj.memory,actions:[]};progress=0;holding=false;world.ink.hide('thought');world.ink.setAnchor(obj.position);$('#thought').classList.remove('show');$('#prompt').textContent='';memoryBeat(sceneScript.line);
 if(obj.id==='model'&&state.day>=6&&state.decisions.model?.choice&&state.decisions.model.choice!=='keep')memoryBeat('I take the little house out again.');
 sequence=new MemorySequence(obj,sceneScript,{world,camera,
  onStage:action=>{world.ink.setAnchor(action.position||obj.position);world.ink.point(action.gesture==='finish'?null:action.position);$('#memory-hint').textContent=action.gesture==='release'?'Hold E, then let go':action.gesture==='finish'?'Release when ready':'Hold E';if(action.gesture!=='finish')world.ink.say(action.label,{kind:'label',duration:8,position:action.position});},
  onBeat:memoryBeat,onCue:name=>audio.cue(name),
  onAction:(action,count,completed)=>{
   state=recordScene(state,sceneKey(obj.id),completed,count);
   if(action.gesture==='send'){state={...state,helped:true};audio.cue('message');phoneThread='Mara';}
   else if(action.gesture==='door')audio.cue('door');else if(action.gesture==='brace')audio.cue('brace');else audio.cue(cueFor(obj.id));
   if(completed){const ratio=chapter().required.filter(id=>hasSceneVisit(state,sceneKey(id))).length/chapter().required.length;state=advanceTime(state,Math.max(0,ratio*.65-state.time));}
   persist();
  },onDone:()=>leaveMemory(true)
 });
 const saved=state.sceneProgress?.[sceneKey(obj.id)];if(saved&&!saved.completed&&saved.action>0){sequence.index=Math.min(saved.action,sequence.actions.length-1);for(const [i,beat]of (sceneScript.beats||[]).entries())if(beat.at<sequence.totalProgress)sequence.beats.add(i);sequence.onStage?.(sequence.current,sequence.index,sequence.actions.length);}
 $('#memory-hint').classList.add('show');$('#hold').classList.add('visible');
}
async function leaveMemory(completed=false){
 if(mode!=='memory')return;completed=completed||Boolean(sequence?.actionsFinished);const obj=active,script=sceneScript;holding=false;setMode('transition');world.clearMemory();sequence=null;world.ink.hide();world.ink.setAnchor(null);world.ink.point(null);
 $('#memory-line').classList.remove('show');$('#memory-hint').classList.remove('show');$('#hold').classList.remove('visible');if(completed)state=markMemory(state,obj.id,true);persist();
 await fade(null,450);if(completed)thought(script?.completionLine||obj.memory.completionLine,7);
 if(canChoose(state,obj.id))showDecision(obj);else{setMode('house');active=null;if(!document.pointerLockElement){await control.lock();if(!document.pointerLockElement)pause();}}
}
function showDecision(obj){setMode('decision');unlock();$('#choices').innerHTML=`<div class="decision"><p>${escapeHTML(obj.decision)}</p><div>${Object.entries(CHOICES).map(([key,value])=>`<button data-choice="${key}">${escapeHTML(value.label)}</button>`).join('')}</div><button class="quiet" id="not-yet">Not yet</button></div>`;$('#choices').classList.add('visible');document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>decide(obj,b.dataset.choice));$('#not-yet').onclick=closeDecision;}
async function closeDecision(){$('#choices').classList.remove('visible');$('#choices').innerHTML='';active=null;setMode('house');await control.lock();if(!document.pointerLockElement)pause();}
async function decide(obj,choice){const before=state;state=choose(state,obj.id,choice);if(state===before){thought('That can wait until morning.');closeDecision();return;}audio.cue('choice');$('#choices').classList.remove('visible');$('#choices').innerHTML='';setMode('transition');await fade(()=>{world.applyState(state);persist();},450);thought(obj.outcomes[choice],6);active=null;setMode('house');await control.lock();if(!document.pointerLockElement)pause();if(state.time>=1)hint('The day has gone. I could lie down.',7);if(state.years>=49){audio.cue('phone');thought('The afternoon has stopped moving.',7);}}
async function waitHere(obj){if(state.time>=1||state.years>=49){thought('The light has not moved.');return;}setMode('transition');audio.cue('key');thought(obj.id==='front'?'You listen.':'For a while, you do nothing.');await delay(1900);state=wait(state);persist();setMode('house');if(state.time>=1)hint('I could lie down for a while.',6);}
function rest(){
 if(state.years<49&&!storyDayReady()){thought(unfinishedHint(),7);return;}
 setMode('decision');unlock();const last=state.day>=7||state.years>=49;
 $('#choices').innerHTML=`<div class="decision"><p>${last?'The house is quiet.':'Close your eyes for a while?'}</p><div><button id="sleep-now">${last?'Let the afternoon end':'Sleep'}</button><button id="stay-awake">Not yet</button></div></div>`;
 $('#choices').classList.add('visible');$('#stay-awake').onclick=closeDecision;
 $('#sleep-now').onclick=async()=>{
  $('#choices').classList.remove('visible');$('#choices').innerHTML='';if(last){endGame(false);return;}
  audio.cue('sleep');state=startInterlude(state,'sleep');persist();forestFilm.audio.unlock();continueInterlude();
 };
}
function confirmExit(){setMode('decision');unlock();$('#choices').innerHTML='<div class="decision"><p>The key is in your pocket.</p><div><button id="leave-house">Open the door</button><button id="not-today">Stay a little longer</button></div></div>';$('#choices').classList.add('visible');$('#not-today').onclick=closeDecision;$('#leave-house').onclick=()=>{$('#choices').classList.remove('visible');$('#choices').innerHTML='';endGame(true);};}
function endGame(outside){if(interludeBusy)return;audio.cue('door');state=startInterlude(state,'ending',outside);persist();forestFilm.audio.unlock();continueInterlude();}
async function continueInterlude(){
 if(interludeBusy||!state.pendingInterlude)return;interludeBusy=true;
 const pending={...state.pendingInterlude};setMode('interlude');unlock();overlay('');world.ink.clear();holding=false;
 clearTimeout(thoughtTimer);clearTimeout(hintTimer);clearTimeout(memoryLineTimer);
 for(const id of ['choices','phone','day-card','hint','memory-hint','hold'])$('#'+id).classList.remove('show','visible');
 $('#prompt').textContent='';$('#fade').classList.add('black');audio.setMuted(true);forestFilm.audio.setVolume(settings.volume);forestFilm.audio.setMuted(settings.muted);
 try{await forestFilm.play(pending.episode,{time:pending.time,ending:ending(state,pending.outside)?.id||'keys'});}
 catch(error){interludeBusy=false;$('#fade').classList.remove('black');overlay('<section class="pause-menu"><h2>The forest could not open.</h2><button id="retry-forest">Try again</button></section>');$('#retry-forest').onclick=continueInterlude;console.error(error);return;}
 state=closeInterlude(state);audio.setMuted(settings.muted);setMode('transition');
 if(pending.target==='sleep'){state=sleep(state);camera.position.set(1.65,1.65,3.5);control.lookAt([3.5,.9,3.9]);$('#day-card').innerHTML='';}
 else{state=finish(state,pending.outside);const result=ending(state);camera.position.set(0,1.65,result?.id==='porch'?-7.7:result?.outside?-10.5:4.9);control.lookAt(result?.outside||result?.id==='porch'?[0,1.4,-20]:[0,1.6,-5]);}
 persist();await delay(80);$('#fade').classList.remove('black');await delay(650);interludeBusy=false;
 if(pending.target==='ending'){showEnding(ending(state));return;}
 setMode('house');await control.lock();dayCard();if(state.day===7)audio.cue('knock');const morning=state.day;await delay(6500);if(mode==='house'&&state.day===morning)thought(chapter().opening,7);
}
async function showEnding(result){if(!result)return;setMode('ending');unlock();$('#counter').hidden=true;$('#reticle').hidden=true;overlay('');if(result.outside){state.time=1;audio.cue('phone');}await delay(1400);thought(result.line,7);await delay(4000);overlay(`<section class="ending-menu"><small>DOGYEARS</small><h2>${escapeHTML(result.title)}</h2><p>${escapeHTML(result.after)}</p><nav><button id="ending-phone">Read the message</button><button id="ending-again">Begin again</button></nav></section>`);$('#ending-phone').onclick=()=>openPhone(true);$('#ending-again').onclick=confirmNew;}
function openPhone(fromEnding=false){
 if(!ready)return;world.clearInspection();if(fromEnding){overlay('');phoneThread='Mara';}setMode('phone');unlock();state=markMessagesRead(state);persist();
 const all=getMessages(state),living=phoneThread==='Mara';
 const messages=all.filter(m=>living?m.kind==='living':m.kind==='old');
 const replies=state.replies.filter(m=>living?m.to==='Mara':m.to==='Ellis'||m.to==='Them');
 $('#phone').innerHTML=`<section class="handset" role="dialog" aria-label="Old phone"><div class="speaker"></div><div class="phone-screen"><header><div class="phone-tabs"><button data-thread="Ellis" class="${living?'':'selected'}">Ellis</button><button data-thread="Mara" class="${living?'selected':''}">Mara</button></div><button id="phone-close" aria-label="Put phone away">×</button></header><div class="messages">${messages.map(m=>`<div class="message ${m.from==='You'?'sent':''}"><small>${escapeHTML(m.time)} · ${escapeHTML(m.from)}</small><p>${escapeHTML(m.text)}</p></div>`).join('')}${replies.map(m=>`<div class="message sent"><p>${escapeHTML(m.text)}</p><small>${m.delivered?'Delivered':'Not delivered'}</small></div>`).join('')}</div><form id="reply-form"><input id="reply-text" maxlength="180" autocomplete="off" placeholder="${living?'Write to Mara…':'Say something…'}" aria-label="Reply"><button type="submit" aria-label="Send reply">↑</button></form></div><div class="home-button"></div></section>`;
 $('#phone').classList.add('visible');$('#phone-close').onclick=()=>closePhone(fromEnding);
 document.querySelectorAll('[data-thread]').forEach(b=>b.onclick=()=>{phoneThread=b.dataset.thread;openPhone(false);});
 $('#reply-form').onsubmit=e=>{e.preventDefault();const text=$('#reply-text').value;if(!text.trim())return;state=reply(state,text,phoneThread);persist();audio.cue('message');openPhone(false);};
 $('.messages').scrollTop=$('.messages').scrollHeight;
}
async function closePhone(fromEnding=false){$('#phone').classList.remove('visible');$('#phone').innerHTML='';if(fromEnding||state.phase==='ending'){showEnding(ending(state));return;}setMode('house');await control.lock();if(!document.pointerLockElement)pause();}
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea')){if(e.code==='Escape'){e.target.blur();closePhone(state.phase==='ending');}return;}if(e.repeat)return;if(e.code==='KeyE'){if(mode==='memory')holding=true;else interact();}if(e.code==='KeyR'){if(mode==='memory')leaveMemory(false);else if(mode==='inspect'){world.clearInspection();active=null;setMode('house');$('#prompt').textContent='';}}if(e.code==='KeyP'){if(mode==='house')openPhone();else if(mode==='phone')closePhone(state.phase==='ending');}if(e.code==='Escape'){if(mode==='phone')closePhone(state.phase==='ending');else if(mode==='inspect'){world.clearInspection();active=null;pause();}else if(mode==='pause')resume();else if(mode==='memory'||mode==='house')pause();}});
document.addEventListener('keyup',e=>{if(e.code==='KeyE')holding=false;});let inspectionDrag=false;document.addEventListener('mousedown',e=>{if(mode==='inspect'&&e.button===0)inspectionDrag=true;});document.addEventListener('mouseup',()=>inspectionDrag=false);document.addEventListener('mousemove',e=>{if(mode==='inspect'&&inspectionDrag&&world.inspection){world.inspection.rotation.y+=e.movementX*.007;world.inspection.rotation.x+=e.movementY*.007;}});
document.addEventListener('pointerlockchange',()=>{const locked=document.pointerLockElement===$('#world');if(wasLocked&&!locked&&['house','memory','inspect'].includes(mode))pause();wasLocked=locked;});
$('#world').addEventListener('click',()=>{if(mode==='house'||mode==='memory')control.lock();});window.addEventListener('beforeunload',()=>{if(started)persist();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&['house','memory'].includes(mode))pause();});window.addEventListener('resize',()=>world.resize());
title();control.lookAt([0,1.55,-5]);world.load(e=>{const el=$('.loading');if(el)el.textContent=e.total?`Opening the house · ${Math.round(e.loaded/e.total*100)}%`:'Opening the house…';}).then(()=>{world.register(OBJECTS);world.applyState(state);ready=true;title();}).catch(e=>{overlay('<section class="pause-menu"><h2>The house could not open.</h2><p>Please check the local server and try again.</p><button onclick="location.reload()">Try again</button></section>');console.error(e);});
let last=performance.now(),hoverClock=0,saveClock=0,lastRender=0;
function frame(now){
 requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;control.update(dt);if(mode==='interlude')return;
 if(mode==='house'){
  hoverClock+=dt;if(hoverClock>.07){prompt();hoverClock=0;}
  storyTimer+=dt;if(storyTimer>1){state=advanceTime(state,storyTimer/900);storyTimer=0;}
  saveClock+=dt;if(saveClock>30){persist();saveClock=0;}
 }
 if(mode==='memory'&&sequence){sequence.update(dt,holding);progress=sequence?.totalProgress||0;const a=sequence?.current;world.ink.point(sequence&&!sequence.actionsFinished?a?.position:null,sequence?.progress||0);$('#hold i').style.width=`${progress*100}%`;if(sequence)$('#memory-hint').textContent=sequence.actionsFinished?'Release when ready':sequence.needsRelease&&holding?'Release E':a?.gesture==='release'?'Hold E, then let go':'Hold E';}
 world.update(dt,state);audio.update({dt,position:camera.position,moving:control.moving,room:roomAt(camera.position),memory:mode==='memory',time:state.time,years:state.years,day:state.day});
 const live=['house','memory','inspect','transition'].includes(mode);if(!document.hidden&&(live||now-lastRender>100)){world.render();lastRender=now;}
}
requestAnimationFrame(frame);
window.dogyears={forestFilm,get ready(){return ready;},get state(){return state;},get mode(){return mode;},world,scene:world.scene,camera,control,objects:OBJECTS,extras,discoveries,chapters:CHAPTERS,valid:canWalk,blocks:BLOCKS,get hover(){return hover;},get active(){return active;},get progress(){return progress;},get sequence(){return sequence;},get sceneScript(){return sceneScript;},get chapterReady(){return storyDayReady();}};
