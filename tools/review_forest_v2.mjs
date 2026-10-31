import {createCanvas,loadImage} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const out='deliverables/forest-v2';await mkdir(`${out}/actor-frames`,{recursive:true});
const atlas=await loadImage('public/forest/v2/hunter-atlas.png');
// An explicit action reel, preserving the same feet and torso anchor in all cuts.
const seq=[8,9,10,11,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,8,12,12,13,13,14,14,15,15,15,15,14,13,12,8,16,16,17,17,18,18,19,19,19,19,20,21,22,23,8];
for(let i=0;i<seq.length;i++){const c=createCanvas(192,256),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#809698';g.fillRect(0,0,192,256);g.fillStyle='#35433d';g.fillRect(0,244,192,12);const f=seq[i];g.drawImage(atlas,(f%4)*48,Math.floor(f/4)*64,48,64,0,0,192,256);await writeFile(`${out}/actor-frames/${String(i).padStart(3,'0')}.png`,c.toBuffer('image/png'));}
await new Promise((resolve,reject)=>{const p=spawn('D:/Program Files/ffmpeg/ffmpeg-7.0.2-essentials_build/bin/ffmpeg.exe',['-y','-framerate','7','-i',`${out}/actor-frames/%03d.png`,'-filter_complex','[0:v]split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=none','-loop','0',`${out}/hunter-actions.gif`],{stdio:'ignore',windowsHide:true});p.on('error',reject);p.on('close',n=>n===0?resolve():reject(Error(`ffmpeg ${n}`)));});
const names=['01-enter','02-walk','04-leaves','05-look-back','06-clearing','07-far-forest'];
const sheet=createCanvas(1440,1263),g=sheet.getContext('2d');g.fillStyle='#101c21';g.fillRect(0,0,sheet.width,sheet.height);g.imageSmoothingEnabled=false;
for(let i=0;i<names.length;i++){const im=await loadImage(`${out}/${names[i]}.png`),x=(i%2)*720,y=Math.floor(i/2)*421;g.drawImage(im,x,y,720,405);}
await writeFile(`${out}/journey-contact.png`,sheet.toBuffer('image/png'));console.log('ACTION REEL AND JOURNEY SHEET READY');
