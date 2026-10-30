import {chromium} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const OUT='deliverables/story-checks';await mkdir(OUT,{recursive:true});
const URL=process.argv.includes('--url')?process.argv[process.argv.indexOf('--url')+1]:'http://127.0.0.1:5174';
const heroOnly=process.argv.includes('--hero-only');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:960}});const errors=[],checks=[],scenes=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
const snap=()=>page.evaluate(()=>({mode:dogyears.mode,day:dogyears.state.day,active:dogyears.active?.id,hover:dogyears.hover?.id,ready:dogyears.chapterReady,state:dogyears.state}));
const mode=(name,timeout=15000)=>page.waitForFunction(n=>dogyears.mode===n,name,{timeout});
async function screenshot(name){await page.screenshot({path:`${OUT}/${name}.png`});}
async function approach(target,id=null){
 // Plan through the same capsule collision map used by real movement. The
 // pilot only holds W and looks toward successive reachable floor points.
 const route=await page.evaluate(({target,id})=>{
  const d=dogyears,step=.15,p=d.camera.position.clone();
  const key=(x,z)=>`${x},${z}`;let sx=Math.round(p.x/step),sz=Math.round(p.z/step);
  if(!d.valid(sx*step,sz*step)){let found=false;for(let r=1;r<4&&!found;r++)for(let a=-r;a<=r&&!found;a++)for(let b=-r;b<=r;b++)if(d.valid((sx+a)*step,(sz+b)*step)){sx+=a;sz+=b;found=true;break;}}
  const queue=[[sx,sz]],parents=new Map([[key(sx,sz),null]]);let goal=null;
  for(let i=0;i<queue.length;i++){
   const [x,z]=queue[i],wx=x*step,wz=z*step,dist=Math.hypot(wx-target[0],wz-target[2]);
   if(dist>=.95&&dist<=1.60){d.camera.position.set(wx,1.65,wz);if(d.world.visibleTo(target)){goal=[x,z];break;}}
   for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=z+dz,k=key(a,b);if(!parents.has(k)&&d.valid(a*step,b*step)){parents.set(k,[x,z]);queue.push([a,b]);}}
  }
  d.camera.position.copy(p);if(!goal)return {error:'No floor path',target,id};
  const path=[];for(let at=goal;at;at=parents.get(key(...at)))path.unshift([at[0]*step,at[1]*step]);
  return {path};
 },{target,id});
 if(route.error)throw new Error(JSON.stringify(route));
 await page.keyboard.down('KeyW');
 const moved=await page.evaluate(path=>new Promise(resolve=>{
  const d=dogyears;let i=0,lastDistance=Infinity,stuck=0,last=performance.now(),began=last;
  function tick(now){
   if(i>=path.length){d.control.keys.KeyW=false;resolve({ok:true});return;}
   if(now-began>70000){d.control.keys.KeyW=false;resolve({ok:false,reason:'Walk timeout',at:d.camera.position.toArray(),goal:path.at(-1)});return;}
   const p=d.camera.position,[x,z]=path[i],dist=Math.hypot(x-p.x,z-p.z);
   if(dist<.085){i++;stuck=0;lastDistance=Infinity;requestAnimationFrame(tick);return;}
   if(Math.abs(dist-lastDistance)<.0002)stuck+=now-last;else stuck=0;
   if(stuck>2500){d.control.keys.KeyW=false;resolve({ok:false,reason:'Blocked floor route',at:p.toArray(),waypoint:path[i]});return;}
   const desired=Math.atan2(-(x-p.x),-(z-p.z)),delta=desired-d.control.yaw;d.control.targetYaw=d.control.yaw+Math.atan2(Math.sin(delta),Math.cos(delta));d.control.targetPitch=0;lastDistance=dist;last=now;requestAnimationFrame(tick);
  }requestAnimationFrame(tick);
 }),route.path);
 await page.keyboard.up('KeyW');assert(moved.ok,JSON.stringify(moved));await page.waitForTimeout(250);
 await page.evaluate(target=>{dogyears.control.reset();dogyears.control.lookAt(target)},target);await page.waitForTimeout(180);
 if(id){try{await page.waitForFunction(id=>dogyears.hover?.id===id,id,{timeout:1800});}catch{
  // A nearby discovery may share the viewing cone. Aim at the exact keepsake
  // again from a modest lateral adjustment, still using a valid floor point.
  const result=await page.evaluate(({id,target})=>{const d=dogyears,p=d.camera.position.clone();for(const dx of [-.15,.15,-.30,.30]){if(!d.valid(p.x+dx,p.z))continue;d.camera.position.x=p.x+dx;d.control.lookAt(target);return true;}return false;},{id,target});
  if(result)await page.waitForFunction(id=>dogyears.hover?.id===id,id,{timeout:2000});else throw Error(`No hover ${id}`);
 }}
}
async function aim(id){const object=await page.evaluate(id=>[...dogyears.objects,...dogyears.extras].find(o=>o.id===id),id);assert(object,`Missing ${id}`);await approach(object.position,id);}
async function playScene(id){
 const before=await snap(),key=`${before.day}:${id}`,start=Date.now();console.log('SCENE',key);
 await aim(id);await page.keyboard.press('KeyE');let s=await snap();if(s.mode==='inspect'){await page.keyboard.press('KeyE');await mode('memory');}else assert.equal(s.mode,'memory',`${key} must be an absence memory or inspectable object`);
 const acts=await page.evaluate(()=>dogyears.sequence.actions);const captions=[];
 await page.evaluate(()=>{window.__captions=[];window.__captionObserver?.disconnect();window.__captionObserver=new MutationObserver(()=>window.__captions.push({line:document.querySelector('#memory-line').textContent,at:performance.now()}));window.__captionObserver.observe(document.querySelector('#memory-line'),{childList:true});});
 for(let i=0;i<acts.length;i++){
  const action=acts[i];await approach(action.position);
  await page.keyboard.up('KeyE');await page.waitForTimeout(1600);
  await page.keyboard.down('KeyE');
  if(action.gesture==='release'){await page.waitForTimeout(160);await page.keyboard.up('KeyE');}
  await page.waitForFunction(index=>dogyears.mode!=='memory'||dogyears.sequence?.index>index,i,{timeout:35000});await page.keyboard.up('KeyE');
  if((before.day===5&&id==='model'&&i===1)||(before.day===6&&id==='model'&&i===2)||(before.day===7&&id==='bowl'&&i===1))await screenshot(`${key.replace(':','-')}-action-${i}`);
 }
 await page.keyboard.up('KeyE');await page.waitForFunction(()=>dogyears.mode==='house'||dogyears.mode==='decision',null,{timeout:45000});
 const after=await snap();assert.equal(after.state.sceneProgress[key].completed,true);
 const lines=await page.evaluate(()=>window.__captions);captions.push(...lines);scenes.push({key,elapsedSeconds:(Date.now()-start)/1000,actions:acts.length,captions});
 await screenshot(`${key.replace(':','-')}-finished`);
 if(after.mode==='decision'){const choice=({leash:'carry',cups:'release',pillow:'release',clothes:'carry',calendar:'release',letter:'carry',model:'release',bowl:'release'})[id];await page.click(`[data-choice="${choice}"]`);await mode('house');}else assert.equal(after.mode,'house');
 if(before.day===6&&id==='model'){assert.equal((await snap()).state.helped,true);assert.equal(await page.evaluate(()=>dogyears.world.storyWorld.group.visible),false,'The clamp cannot arrive a day before Mara');}
 if(before.day===7&&id==='bowl'){assert.equal(await page.evaluate(()=>dogyears.world.storyWorld.group.visible),true);assert.equal(await page.evaluate(()=>dogyears.world.storyWorld.bag.visible),true);}
}
try{
 await page.goto(URL);await page.evaluate(heroOnly=>{localStorage.removeItem('dogyears.save.v2');localStorage.removeItem('dogyears.view');localStorage.setItem('dogyears.settings',JSON.stringify({quality:'low',muted:true,volume:0,headMotion:false}));if(heroOnly)localStorage.setItem('dogyears.save.v2',JSON.stringify({day:5,phase:'house',decisions:{model:{choice:'release',day:4,remembered:true,completed:true}}}));},heroOnly);await page.reload();await page.waitForFunction(()=>dogyears?.ready,null,{timeout:120000});await page.evaluate(()=>document.fonts.ready);await screenshot(heroOnly?'hero-title':'00-title');
 assert.equal(await page.evaluate(()=>document.fonts.check('24px HouseBook')&&document.fonts.check('400 32px HouseInk')),true,'Bundled typefaces must load offline');
 await page.click('#begin');await mode('house');assert.equal(await page.evaluate(()=>!!document.pointerLockElement),true);
 if(heroOnly){
  assert(await page.evaluate(()=>dogyears.world.assetPath.includes('Hero')&&dogyears.world.groups.get('model').length>5),'The revised miniature must retain an inspectable model group in the current hero asset');
  assert.equal(await page.evaluate(()=>dogyears.world.storyWorld.door.visible),false,'The packed miniature cannot leave its door floating on the bench');
  await playScene('model');
  await page.keyboard.press('Escape');await mode('pause');
  await page.evaluate(()=>{const state=dogyears.state;Object.assign(state,{day:6,time:0});localStorage.setItem('dogyears.save.v2',JSON.stringify(state));});
  await page.reload();await page.waitForFunction(()=>dogyears?.ready,null,{timeout:120000});await page.click('#begin');await mode('house');await playScene('model');
  assert.equal(await page.evaluate(()=>dogyears.world.storyWorld.door.visible),true,'Unpacking the miniature for the support must restore its door');assert.equal((await snap()).state.helped,true);assert.deepEqual(errors,[]);
  const asset=await page.evaluate(()=>dogyears.world.assetPath);await writeFile(`${OUT}/hero-report.json`,JSON.stringify({asset,errors,scenes,final:await snap()},null,2));console.log('HERO SCENES PASS',JSON.stringify({asset,scenes:scenes.length,errors}));
 }else{
 const chapters=await page.evaluate(()=>dogyears.chapters);
 for(const chapter of chapters){
  console.log('DAY',chapter.day,chapter.title);
  await aim('bed');await page.keyboard.press('KeyE');assert.equal((await snap()).mode,'house','Sleep should wait for a meaningful scene visit');
  for(const id of chapter.required)await playScene(id);
  assert.equal((await snap()).ready,true);checks.push({day:chapter.day,required:chapter.required,ready:true});
  if(chapter.day===2){await page.keyboard.press('Escape');await mode('pause');await page.reload();await page.waitForFunction(()=>dogyears?.ready,null,{timeout:120000});await page.click('#begin');await mode('house');assert.equal((await snap()).ready,true,'Chapter progress must survive a reload');}
  if(chapter.day===6){await page.keyboard.press('KeyP');await mode('phone');await page.click('[data-thread="Mara"]');assert.match(await page.locator('.messages').innerText(),/hold this|Tell me which end/);await page.fill('#reply-text','Thank you. Tomorrow.');await page.click('#reply-form button');assert.equal((await snap()).state.replies.at(-1).delivered,true);await screenshot('06-phone-mara');await page.click('#phone-close');await mode('house');}
  if(chapter.day<7){await aim('bed');await page.keyboard.press('KeyE');await mode('decision');await page.click('#sleep-now');await mode('house');assert.equal((await snap()).day,chapter.day+1);}
 }
 await aim('back');await page.keyboard.press('KeyE');await mode('decision');await page.click('#leave-house');await mode('ending',15000);await page.waitForTimeout(6000);await screenshot('07-ending');assert.equal((await snap()).state.ending,'keys');
 assert.equal(await page.evaluate(()=>/[\u3400-\u9fff]/.test(document.body.innerText)),false);assert.deepEqual(errors,[]);
 await writeFile(`${OUT}/report.json`,JSON.stringify({errors,checks,scenes,final:await snap()},null,2));console.log('STORY PLAYTHROUGH PASS',JSON.stringify({chapters:checks.length,scenes:scenes.length,errors}));
 }
}catch(e){await screenshot('failure');await writeFile(`${OUT}/failure.json`,JSON.stringify({error:String(e),errors,snapshot:await snap(),checks,scenes},null,2));console.error(e);process.exitCode=1;}finally{await browser.close();}
