import {chromium} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

const page_=process.argv[2]||'elegant.html';
const prefix=process.argv[3]||'elegant';
const per=Number(process.argv[4]||4);
const root=path.resolve('deliverables');
const types={'.html':'text/html;charset=utf-8','.png':'image/png','.woff2':'font/woff2','.css':'text/css','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 try{const p=decodeURIComponent(new URL(req.url,'http://x').pathname);const file=path.resolve(root,'.'+p);
  if(!file.startsWith(root)){res.writeHead(403).end();return}
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404).end('nope')}});
await new Promise(r=>server.listen(5199,'127.0.0.1',r));

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1520,height:1000},deviceScaleFactor:2});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/404/.test(m.text()))errors.push(m.text())});
await page.goto(`http://127.0.0.1:5199/font-options/${page_}`,{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.ready===true,{timeout:40000});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(700);
const rows=await page.$$('.row');
console.log('rows',rows.length,'errors',errors.length?errors:'none');
for(let g=0;g*per<rows.length;g++){
 const group=rows.slice(g*per,(g+1)*per);
 const a=await group[0].boundingBox(), b=await group[group.length-1].boundingBox();
 await page.screenshot({path:`deliverables/font-options/${prefix}-${g+1}.png`,clip:{x:0,y:a.y-6,width:1520,height:(b.y+b.height)-a.y+12},fullPage:true});
}
await browser.close();server.close();
