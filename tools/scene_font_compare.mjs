// Render the same in-game memory text with each candidate face, in the real scene, and build a montage.
import {chromium} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {OBJECTS} from '../src/game.js';

const OUT='deliverables/font-options';
const URL=process.argv.includes('--url')?process.argv[process.argv.indexOf('--url')+1]:'http://127.0.0.1:5174';
const FONTSDIR=path.resolve(OUT,'fonts');
const LINE=process.env.CMP_LINE||'They stopped at the beginning of a sentence, not the end of a chapter.';
await mkdir(OUT,{recursive:true});

// key, family, css weight, canvas style token, file, note
const VARIANTS=[
 {key:'00-current',label:'04 Cormorant Italic 600 (your pick)',family:'Cormorant Garamond',weight:'600',style:'italic',file:null,note:'bundled now'},
 {key:'01-kleeone',label:'Klee One 600',family:'Klee One',weight:'600',style:'normal',file:'KleeOne.woff2',note:'dense textbook handwriting'},
 {key:'02-mansalva',label:'Mansalva',family:'Mansalva',weight:'400',style:'normal',file:'Mansalva.woff2',note:'thick crowded marker'},
 {key:'03-justanotherhand',label:'Just Another Hand',family:'Just Another Hand',weight:'400',style:'normal',file:'JustAnotherHand.woff2',note:'tall narrow scrawl'},
 {key:'04-cedarville',label:'Cedarville Cursive',family:'Cedarville Cursive',weight:'400',style:'normal',file:'CedarvilleCursive.woff2',note:'tight cursive'},
 {key:'05-homemadeapple',label:'Homemade Apple',family:'Homemade Apple',weight:'400',style:'normal',file:'HomemadeApple.woff2',note:'small cramped script'},
 {key:'06-neucha',label:'Neucha',family:'Neucha',weight:'400',style:'normal',file:'Neucha.woff2',note:'cramped quirky hand'},
 {key:'07-yomogi',label:'Yomogi',family:'Yomogi',weight:'400',style:'normal',file:'Yomogi.woff2',note:'fine dense pen'},
 {key:'08-waitingsunrise',label:'Waiting for the Sunrise',family:'Waiting for the Sunrise',weight:'400',style:'normal',file:'WaitingSunrise.woff2',note:'thin crowded print'},
];

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:960}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));

let current=null;
await page.route('**/src/spatial-text.js',async route=>{
 const res=await route.fetch();
 let body=await res.text();
 if(current&&current.file){
  const spec=current.style==='italic'?`italic ${current.weight}`:current.weight;
  body=body.replaceAll('italic 600 120px HouseInk',`${spec} 120px "${current.family}"`).replaceAll('italic 700 110px HouseInk',`${spec} 110px "${current.family}"`);
 }
 route.fulfill({response:res,body,headers:{...res.headers(),'content-type':'application/javascript'}});
});

const facesCache=new Map();
async function faceCss(f){
 const buf=await readFile(path.join(FONTSDIR,f.file));
 return `@font-face{font-family:"${f.family}";src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');font-weight:${f.weight};font-style:${f.style};font-display:block}`;
}

for(const v of VARIANTS){
 current=v;
 await page.goto(URL,{waitUntil:'domcontentloaded'});
 const target=OBJECTS.find(o=>o.id==='letter').position;
 if(v.file){
  if(!facesCache.has(v.file))facesCache.set(v.file,await faceCss(v));
  await page.addStyleTag({content:facesCache.get(v.file)});
 }
 await page.waitForFunction(()=>dogyears?.ready||document.body.innerText.includes('The house could not open.'),null,{timeout:120000});
 if(!await page.evaluate(()=>dogyears.ready)){console.error('ASSET FAILED',v.key,errors);continue;}
 await page.click('#begin');
 await page.waitForFunction(()=>dogyears.mode==='house');
 await page.evaluate(()=>document.fonts.ready);
 if(v.file)await page.evaluate(async f=>{await document.fonts.load(`${f.style} ${f.weight} 120px "${f.family}"`)},{style:v.style,weight:v.weight,family:v.family});
 await page.evaluate(t=>{window.__cmpTarget=t},target);
 await page.waitForTimeout(11000);
 const shot=await page.evaluate(async({line})=>{
  const d=dogyears;
  const target=window.__cmpTarget;
  d.control.reset();
  d.camera.position.fromArray([-4.1,1.65,-3.9]);
  d.control.lookAt(target);
  d.world.ink.clear();d.world.ink.setAnchor(target);
  await d.world.ink.say(line,{kind:'memory',duration:30});
  await new Promise(r=>setTimeout(r,1400));
  const card=d.world.ink.cards.find(c=>c.kind==='memory');
  const canvas=card.texture.image,c=canvas.getContext('2d');
  const px=c.getImageData(0,0,canvas.width,canvas.height).data;
  let minX=canvas.width,minY=canvas.height,maxX=0,maxY=0;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(px[(y*canvas.width+x)*4+3]>15){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y}
  return {fontUsed:c.font,inkBox:{minX,minY,maxX,maxY},cards:d.world.ink.cards.length};
 },{line:LINE});
 await page.waitForTimeout(700);
 await page.screenshot({path:`${OUT}/scene-${v.key}.png`});
 console.log(v.key.padEnd(20),v.family.padEnd(24),'canvas font:',shot.fontUsed);
}

// montage: text band crops with labels
const bands=[];
for(const v of VARIANTS){
 const file=`${OUT}/scene-${v.key}.png`;
 const buf=await readFile(file);
 bands.push({label:v.label,note:v.note,data:buf.toString('base64')});
}
const rows=bands.map(b=>`<div class="row"><div class="meta"><div class="t">${b.label}</div><div class="n">${b.note}</div></div><img src="data:image/png;base64,${b.data}"></div>`).join('');
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#12150f;color:#d7d1c0;font-family:"Segoe UI",system-ui,sans-serif}
.h{font-size:15px;padding:14px 20px 10px;color:#efe8d6}
.row{display:flex;gap:14px;align-items:flex-start;padding:0 20px 10px}
.meta{width:190px;flex:0 0 190px;padding-top:6px}
.t{font-size:14px;font-weight:600;color:#efe8d6}
.n{font-size:11px;color:#8d8a7c;margin-top:3px}
img{display:block;width:1120px;height:auto;border-radius:2px}
</style><div class="h">DogYears — same memory line, same room, different face. Line: “${LINE}”</div>${rows}`);
await page.waitForTimeout(400);
await page.screenshot({path:`${OUT}/scene-compare-full.png`,fullPage:true});
const rowEls=await page.$$('.row');
for(let g=0;g*3<rowEls.length;g++){
 const grp=rowEls.slice(g*3,(g+1)*3);
 const a=await grp[0].boundingBox(),b=await grp[grp.length-1].boundingBox();
 await page.screenshot({path:`${OUT}/scene-compare-${g+1}.png`,clip:{x:0,y:a.y-8,width:1440,height:(b.y+b.height)-a.y+16},fullPage:true});
}
console.log('errors',errors.length?errors:'none');
await browser.close();
