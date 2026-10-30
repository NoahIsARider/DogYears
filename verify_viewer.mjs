import { chromium } from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5174');
await page.waitForFunction(()=>window.dogyears?.ready,null,{timeout:120000});
await page.screenshot({path:'deliverables/09_walkthrough.png'});
const report=await page.evaluate(()=>{
 const {valid,spots}=window.dogyears;
 const start=[0,5.4],step=.15;const queue=[start],seen=new Set(['0,36']);let k=0;
 while(k<queue.length){const [x,z]=queue[k++];for(const [dx,dz]of [[step,0],[-step,0],[0,step],[0,-step]]){const a=Math.round((x+dx)/step),b=Math.round((z+dz)/step),key=`${a},${b}`;if(!seen.has(key)&&valid(a*step,b*step)){seen.add(key);queue.push([a*step,b*step])}}}
 return {title:document.title,status:document.querySelector('#status').textContent,reachable:Object.fromEntries(Object.entries(spots).map(([n,s])=>[n,queue.some(([x,z])=>Math.hypot(x-s[0][0],z-s[0][2])<.3)])),nodes:window.dogyears.scene.children.length,walkableSamples:queue.length};
});
console.log(JSON.stringify({errors,...report},null,2));
await page.click('[data-room="hall"]');await page.screenshot({path:'deliverables/10_hall_walkthrough.png'});
await page.click('#walk');
await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.up('KeyW');
console.log('Walk interaction:',await page.evaluate(()=>({pointerLock:!!document.pointerLockElement,position:window.dogyears.camera.position.toArray()})));
await browser.close();
