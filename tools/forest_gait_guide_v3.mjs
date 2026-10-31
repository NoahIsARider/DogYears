import {createCanvas} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('reference/forest/v3',{recursive:true});
const c=createCanvas(192,128),g=c.getContext('2d');g.fillStyle='#dce0d5';g.fillRect(0,0,192,128);
const heels=[[30,60],[27,60],[24,60],[21,60],[16,60],[18,56],[23,54],[28,57]];
function line(a,b,col,w=3){g.strokeStyle=col;g.lineWidth=w;g.lineCap='butt';g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();}
for(let i=0;i<8;i++){g.save();g.translate((i%4)*48,Math.floor(i/4)*64);g.fillStyle='#b0b9ac';g.fillRect(2,61,44,1);const near=heels[i],far=heels[(i+4)%8],hip=[23,38];for(const [heel,col]of [[far,'#69859a'],[near,'#9d6448']]){const k=[(23+heel[0])*.5+(heel[1]<60?2:0),49-(60-heel[1])*.5];line(hip,k,col,4);line(k,heel,col,3);line(heel,[heel[0]+4,heel[1]],col,2);}line([27,22],hip,'#293e46',8);g.fillStyle='#293e46';g.fillRect(26,9,6,8);line([27,22],[27+Math.sin(i*Math.PI/4)*4,35],'#617b8c',3);line([27+Math.sin(i*Math.PI/4)*4,35],[27+Math.sin(i*Math.PI/4)*6,42],'#617b8c',2);g.restore();}
const out=createCanvas(1536,1024),og=out.getContext('2d');og.imageSmoothingEnabled=false;og.drawImage(c,0,0,1536,1024);await writeFile('reference/forest/v3/gait-guide.png',out.toBuffer('image/png'));
