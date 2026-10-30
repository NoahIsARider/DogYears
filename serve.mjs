import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const requested=Number(process.argv[process.argv.indexOf('--port')+1]);
const port=Number.isInteger(requested)&&requested>=1024&&requested<=65535?requested:5174;
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.glb':'model/gltf-binary','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const url=`http://localhost:${port}/`,autoOpen=process.argv.includes('--open');
function openBrowser(){const command=process.platform==='win32'?'explorer.exe':process.platform==='darwin'?'open':'xdg-open';const child=spawn(command,[url],{windowsHide:true,detached:true,stdio:'ignore'});child.on('error',()=>console.log(url));child.unref();}
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root)){res.writeHead(403).end();return}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404).end('Not found')}});
server.on('error',error=>{
 if(error.code!=='EADDRINUSE'||!autoOpen){console.error(error.message);process.exitCode=1;return;}
 const request=http.get(url,response=>{let html='';response.setEncoding('utf8');response.on('data',chunk=>html+=chunk);response.on('end',()=>{if(html.includes('<title>DogYears</title>'))openBrowser();else{console.error(`Port ${port} is already in use. Choose another with --port.`);process.exitCode=1;}});});request.setTimeout(2000,()=>request.destroy());request.on('error',()=>{console.error(`Could not open ${url}`);process.exitCode=1;});
});
server.listen(port,'127.0.0.1',()=>{console.log(`DogYears: ${url}`);if(autoOpen)openBrowser();});
