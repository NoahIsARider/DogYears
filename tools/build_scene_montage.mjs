// Build a readable montage from the cropped in-scene text bands.
import {chromium} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFile} from 'node:fs/promises';

const OUT='deliverables/font-options';
const VARIANTS=[
 ['00-current','04 Cormorant Italic 600 — your pick','the bundled face now'],
 ['01-kleeone','Klee One 600','dense textbook handwriting'],
 ['02-mansalva','Mansalva','thick crowded marker'],
 ['03-justanotherhand','Just Another Hand','tall narrow scrawl'],
 ['04-cedarville','Cedarville Cursive','tight cursive'],
 ['05-homemadeapple','Homemade Apple','small cramped script'],
 ['06-neucha','Neucha','cramped quirky hand'],
 ['07-yomogi','Yomogi','fine dense pen'],
 ['08-waitingsunrise','Waiting for the Sunrise','thin crowded print'],
];

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1560,height:1000},deviceScaleFactor:2});
const rows=[];
for(const [k,label,note] of VARIANTS){
 const b=await readFile(`${OUT}/crop-${k}.png`);
 rows.push(`<div class="row"><div class="meta"><div class="t">${label}</div><div class="n">${note}</div></div><img src="data:image/png;base64,${b.toString('base64')}"></div>`);
}
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#101309;color:#d7d1c0;font-family:"Segoe UI",system-ui,sans-serif}
.h{font-size:15px;padding:16px 22px 4px;color:#efe8d6;letter-spacing:.2px}
.s{font-size:12px;padding:0 22px 12px;color:#8b8a7c}
.row{display:flex;gap:16px;align-items:flex-start;padding:6px 22px 8px;border-top:1px solid #232719}
.meta{width:210px;flex:0 0 210px;padding-top:8px}
.t{font-size:13.5px;font-weight:600;color:#efe8d6;line-height:1.3}
.n{font-size:11px;color:#8d8a7c;margin-top:3px}
img{display:block;width:1240px;height:auto;border-radius:2px}
</style>
<div class="h">DogYears — the same memory line in the same room, nine faces</div>
<div class="s">Each band is the real in-game render, cropped and enlarged 1.5×. Line: “They stopped at the beginning of a sentence, not the end of a chapter.”</div>
${rows.join('')}`);
await page.waitForTimeout(400);
const rowEls=await page.$$('.row');
for(let g=0;g*3<rowEls.length;g++){
 const grp=rowEls.slice(g*3,(g+1)*3);
 const a=await grp[0].boundingBox(),b=await grp[grp.length-1].boundingBox();
 await page.screenshot({path:`${OUT}/cmp-band-${g+1}.png`,clip:{x:0,y:a.y-10,width:1560,height:(b.y+b.height)-a.y+20},fullPage:true});
}
console.log('montage rows',rowEls.length);
await browser.close();
