import { chromium } from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const OUT='deliverables/game-checks';await mkdir(OUT,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text())});
page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(`HTTP ${r.status()} ${r.url()}`)});
await page.goto('http://127.0.0.1:5174');
if(process.argv.includes('--metrics')){
 const metrics=[];
 for(const quality of ['high','low']){
  await page.evaluate(q=>{localStorage.removeItem('dogyears.save.v2');localStorage.removeItem('dogyears.view');localStorage.setItem('dogyears.settings',JSON.stringify({quality:q,headMotion:false,volume:0,muted:true}))},quality);
  await page.reload();await page.waitForFunction(()=>window.dogyears?.ready,null,{timeout:120000});await page.click('#begin');
  await page.waitForTimeout(6500);
  const m=await page.evaluate(async q=>{
   const d=window.dogyears,r=d.world.renderer;const gl=r.getContext();const ext=gl.getExtension('WEBGL_debug_renderer_info');
   const times=[];await new Promise(resolve=>{let last=performance.now();function tick(t){times.push(t-last);last=t;if(times.length<120)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});
   r.info.autoReset=false;r.info.reset();await new Promise(requestAnimationFrame);const render={...r.info.render};r.info.autoReset=true;
   return {quality:q,fps:1000/(times.reduce((a,b)=>a+b)/times.length),maxFrame:Math.max(...times),gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),render,adaptiveAO:d.world.adaptiveAO,aoEnabled:d.world.ao.enabled,groups:Object.fromEntries([...d.world.groups].map(([id,g])=>[id,g.length])),vertices:d.world.meshes.reduce((a,o)=>a+o.geometry.attributes.position.count,0)};
  },quality);metrics.push(m);
 }
 await page.waitForTimeout(6000);
 for(const [name,position,target]of [
  ['08-kitchen-wide',[-1.45,1.65,.75],[-3.4,1.05,4.7]],
  ['09-bedroom-wide',[1.5,1.65,-.8],[3.35,.9,3.5]],
  ['10-outside',[0,1.55,-10.8],[.8,1.4,-22]],
 ]){await page.evaluate(({position,target})=>{const d=window.dogyears;d.control.reset();d.camera.position.fromArray(position);d.control.lookAt(target)}, {position,target});await page.waitForTimeout(300);await page.screenshot({path:`${OUT}/${name}.png`});}
 console.log(JSON.stringify({metrics,errors},null,2));await writeFile(`${OUT}/performance.json`,JSON.stringify({metrics,errors},null,2));await browser.close();process.exit(errors.length?1:0);
}
await page.evaluate(()=>{localStorage.removeItem('dogyears.save.v2');localStorage.removeItem('dogyears.view')});await page.reload();
await page.waitForFunction(()=>window.dogyears?.ready,null,{timeout:120000});
const metrics=await page.evaluate(async()=>{const d=window.dogyears;const frames=[];await new Promise(resolve=>{let last=performance.now();function tick(t){frames.push(t-last);last=t;if(frames.length<100)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});return {groups:Object.fromEntries([...d.world.groups].map(([id,items])=>[id,items.map(o=>({name:o.name,batched:!!o.userData.batched,visible:o.visible}))])),occluders:d.world.occluders.map(o=>({name:o.name,visible:o.visible,batched:!!o.userData.batched})),names:d.world.meshes.slice(0,30).map(o=>o.name),drawCalls:d.world.renderer.info.render.calls,triangles:d.world.renderer.info.render.triangles,fps:1000/(frames.reduce((a,b)=>a+b)/frames.length),maxFrame:Math.max(...frames)}});
console.log('INITIAL METRICS',JSON.stringify({groups:Object.fromEntries(Object.entries(metrics.groups).map(([id,g])=>[id,g.length])),fps:metrics.fps,maxFrame:metrics.maxFrame}));await writeFile(`${OUT}/metrics.json`,JSON.stringify(metrics,null,2));
await page.screenshot({path:`${OUT}/01-title.png`});
await page.evaluate(()=>localStorage.setItem('dogyears.view',JSON.stringify({day:1,position:[],yaw:null,pitch:null})));
await page.click('#begin');await page.waitForTimeout(500);
console.log('BEGIN',await page.evaluate(()=>({mode:window.dogyears.mode,pointerLock:!!document.pointerLockElement,position:window.dogyears.camera.position.toArray()})));
assert(await page.evaluate(()=>window.dogyears.camera.position.toArray().every(Number.isFinite)),'Malformed saved view must recover to finite camera coordinates');
await page.keyboard.down('KeyW');await page.waitForTimeout(800);await page.keyboard.up('KeyW');
console.log('WALK',await page.evaluate(()=>({mode:window.dogyears.mode,pointerLock:!!document.pointerLockElement,position:window.dogyears.camera.position.toArray()})));
const checks=[];
const snapshot=()=>page.evaluate(()=>({mode:window.dogyears.mode,state:window.dogyears.state,active:window.dogyears.active?.id,hover:window.dogyears.hover?.id,locked:!!document.pointerLockElement}));
async function mode(name,timeout=20000){await page.waitForFunction(n=>window.dogyears.mode===n,name,{timeout});}
async function aim(id){
 const result=await page.evaluate(id=>{
  const d=window.dogyears,o=[...d.objects,...d.extras].find(o=>o.id===id);
  if(!o)return {ok:false,reason:'missing'};
  const candidates=[];
  for(const radius of [.65,.85,1.05,1.3,1.6,1.9])for(let a=0;a<Math.PI*2;a+=Math.PI/16){const x=o.position[0]+Math.cos(a)*radius,z=o.position[2]+Math.sin(a)*radius;if(!d.valid(x,z))continue;d.camera.position.set(x,1.65,z);if(!d.world.visibleTo(o.position))continue;candidates.push({x,z,radius});}
  if(!candidates.length)return {ok:false,reason:'no reachable visible viewpoint'};
  const chosen=candidates[Math.floor(candidates.length*.35)];d.control.reset();d.camera.position.set(chosen.x,1.65,chosen.z);d.control.lookAt(o.position);return {ok:true,...chosen};
 },id);
 if(!result.ok)throw new Error(`Cannot approach ${id}: ${result.reason}`);
 await page.waitForFunction(id=>window.dogyears.hover?.id===id,id,{timeout:5000});return result;
}
const approaches={};for(const id of await page.evaluate(()=>[...window.dogyears.objects,...window.dogyears.extras].map(o=>o.id))){try{approaches[id]=await aim(id)}catch(e){approaches[id]={ok:false,error:e.message}}}
console.log('APPROACHES',JSON.stringify(approaches));checks.push({approaches});
const routes=await page.evaluate(positions=>{const d=window.dogyears,step=.1,queue=[[0,5.3]],seen=new Set(['0,53']);for(let i=0;i<queue.length;i++){const[x,z]=queue[i];for(const[dx,dz]of [[step,0],[-step,0],[0,step],[0,-step]]){const a=Math.round((x+dx)/step),b=Math.round((z+dz)/step),key=`${a},${b}`;if(!seen.has(key)&&d.valid(a*step,b*step)){seen.add(key);queue.push([a*step,b*step])}}}return Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,p.ok&&queue.some(([x,z])=>Math.hypot(x-p.x,z-p.z)<.21)]))},approaches);
assert(Object.values(routes).every(Boolean),'All target viewpoints must connect to the entrance');checks.push({routes});
await aim('cups');await page.waitForTimeout(800);await page.screenshot({path:`${OUT}/02-kitchen.png`});
await page.keyboard.press('KeyE');await mode('inspect');await page.waitForTimeout(500);await page.screenshot({path:`${OUT}/03-inspection.png`});
await page.keyboard.press('KeyE');await mode('memory');await page.screenshot({path:`${OUT}/04-memory.png`});
const memoryView=await page.evaluate(()=>({position:window.dogyears.camera.position.toArray(),target:window.dogyears.active.position}));
await page.evaluate(()=>{const d=window.dogyears;d.camera.position.set(0,1.65,2);d.control.lookAt([0,1.4,-5])});await page.keyboard.down('KeyE');await page.waitForTimeout(1200);await page.keyboard.up('KeyE');assert.equal((await page.evaluate(()=>window.dogyears.progress)),0,'Memory must not advance from across the house');
await page.evaluate(v=>{const d=window.dogyears;d.camera.position.fromArray(v.position);d.control.lookAt(v.target)},memoryView);checks.push({memoryProximityGate:true});
await page.keyboard.down('KeyE');await mode('decision',25000);await page.keyboard.up('KeyE');
assert.equal((await snapshot()).state.memoryActions.cups,true);await page.screenshot({path:`${OUT}/05-decision.png`});
await page.click('[data-choice="release"]');await mode('house');assert.equal((await snapshot()).state.decisions.cups.choice,'release');
checks.push({release:(await snapshot()).state.decisions.cups});
// Early departure is still a valid memory decision, with no fake completion flag.
await aim('leash');await page.keyboard.press('KeyE');await mode('inspect');await page.keyboard.press('KeyE');await mode('memory');await page.keyboard.press('KeyR');await mode('decision');await page.click('[data-choice="keep"]');await mode('house');
assert.equal((await snapshot()).state.decisions.leash.choice,'keep');assert.equal((await snapshot()).state.memoryActions.leash,undefined);
await aim('letter');await page.keyboard.press('KeyE');await mode('inspect');await page.keyboard.press('KeyE');await mode('memory');await page.keyboard.press('KeyR');await mode('decision');await page.click('[data-choice="carry"]');await mode('house');
assert((await snapshot()).state.inventory.includes('letter'));checks.push({keepCarry:(await snapshot()).state.years});
await aim('pillow');await page.screenshot({path:`${OUT}/06-bedroom.png`});
await page.keyboard.press('KeyP');await mode('phone');await page.fill('#reply-text','<img src=x onerror="window.__injected=true">');await page.click('#reply-form button');
assert.equal(await page.evaluate(()=>!!window.__injected),false);assert.equal(await page.locator('.messages img').count(),0);checks.push({phoneEscapesMarkup:true});await page.click('#phone-close');await mode('house');
await page.keyboard.press('Escape');await mode('pause');await page.click('#settings');await mode('settings');await page.fill('#sensitivity','0.65');await page.dispatchEvent('#sensitivity','input');await page.click('#settings-back');await mode('pause');await page.click('#resume');await mode('house');checks.push({settingsPersisted:await page.evaluate(()=>JSON.parse(localStorage.getItem('dogyears.settings')).sensitivity)});
await aim('bed');await page.keyboard.press('KeyE');await mode('decision');await page.click('#sleep-now');await mode('house');assert.equal((await snapshot()).state.day,2);checks.push({sleepDay2:true});
await aim('leash');await page.keyboard.press('KeyE');await mode('inspect');await page.keyboard.press('KeyE');await mode('memory');await page.keyboard.press('Escape');await mode('pause');
const pausedSources=await page.evaluate(()=>{const g=window.dogyears.world.gesture;return {visibleSources:g.sources.filter(([o])=>o.visible).map(([o])=>o.name),copies:g.copies.length}});console.log('PAUSED MEMORY SOURCES',JSON.stringify(pausedSources));checks.push({pausedMemorySources:pausedSources});assert.equal(pausedSources.visibleSources.length,0,'Pausing a repeated memory must not unhide the originals under its animated copies');
await page.click('#resume');await mode('memory');await page.keyboard.press('KeyR');await mode('decision');await page.click('#not-yet');await mode('house');
// Save and reload through the actual Continue button.
await page.keyboard.press('Escape');await mode('pause');await page.reload();await page.waitForFunction(()=>window.dogyears?.ready,null,{timeout:120000});assert.equal((await snapshot()).state.day,2);await page.click('#begin');await mode('house');assert((await snapshot()).state.inventory.includes('letter'));checks.push({reloadSave:true});
for(let day=3;day<=7;day++){await aim('bed');await page.keyboard.press('KeyE');await mode('decision');await page.click('#sleep-now');await mode('house');assert.equal((await snapshot()).state.day,day);}
await page.keyboard.press('KeyP');await mode('phone');assert(await page.locator('.messages').innerText().then(s=>s.includes('I am outside')));await page.fill('#reply-text','I am coming.');await page.click('#reply-form button');assert.equal((await snapshot()).state.replies.at(-1).delivered,true);await page.click('#phone-close');await mode('house');
await aim('back');await page.keyboard.press('KeyE');await mode('decision');await page.click('#leave-house');await mode('ending',20000);await page.waitForTimeout(6000);await page.screenshot({path:`${OUT}/07-ending.png`});
assert.equal((await snapshot()).state.phase,'ending');checks.push({sevenDayEnding:(await snapshot()).state.ending});
const runtime=await page.evaluate(async()=>{const d=window.dogyears;const r=d.world.renderer;r.info.autoReset=false;r.info.reset();await new Promise(requestAnimationFrame);const fullFrame={calls:r.info.render.calls,triangles:r.info.render.triangles};r.info.autoReset=true;return {fullFrame,englishOnly:!/[\u3400-\u9fff]/.test(document.body.innerText),materials:r.info.memory,batchedDynamic:[...d.world.groups].flatMap(([id,g])=>g.filter(o=>o.userData.batched).map(o=>({id,name:o.name})))}});
checks.push(runtime);console.log('CHECKS',JSON.stringify(checks));assert.equal(runtime.englishOnly,true);
await page.reload();await page.waitForFunction(()=>window.dogyears?.ready,null,{timeout:120000});await page.click('#begin');await mode('ending');await page.waitForTimeout(5800);assert.equal(await page.locator('.ending-menu').count(),1,'Continuing a finished game must show the ending, not a pointer-lock pause');checks.push({continueEnding:true});
// Restart from a paused memory must remove its hold bar, text, animated copy,
// and leave the new playthrough in ordinary house mode.
await page.click('#ending-again');await page.click('#confirm-new');await mode('title');await page.click('#begin');await mode('house');await aim('leash');await page.keyboard.press('KeyE');await mode('inspect');await page.keyboard.press('KeyE');await mode('memory');await page.keyboard.press('Escape');await mode('pause');await page.click('#new');await page.click('#confirm-new');await mode('title');
const restart=await page.evaluate(()=>({gesture:!!window.dogyears.world.gesture,hint:document.querySelector('#memory-hint').classList.contains('show'),hold:document.querySelector('#hold').classList.contains('visible'),line:document.querySelector('#memory-line').classList.contains('show'),day:window.dogyears.state.day}));
assert.deepEqual(restart,{gesture:false,hint:false,hold:false,line:false,day:1});checks.push({restartFromMemory:restart});
assert.deepEqual(errors,[],'Browser runtime and asset responses must be error-free');
await writeFile(`${OUT}/report.json`,JSON.stringify({errors,checks,metrics},null,2));
await writeFile(`${OUT}/errors.json`,JSON.stringify(errors,null,2));
await browser.close();
