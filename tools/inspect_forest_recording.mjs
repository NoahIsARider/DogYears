import {spawn} from 'node:child_process';
import {createCanvas,loadImage} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {writeFile} from 'node:fs/promises';
const out='deliverables/forest-v2',ff='D:/Program Files/ffmpeg/ffmpeg-7.0.2-essentials_build/bin/ffmpeg.exe';
function run(args){return new Promise((resolve,reject)=>{const p=spawn(ff,args,{stdio:'ignore',windowsHide:true});p.on('error',reject);p.on('close',n=>n===0?resolve():reject(Error(`ffmpeg ${n}`)));});}
const times=[4,16,27,29.5,31.5,35,42,47,60,72];
for(const t of times)await run(['-y','-ss',String(t),'-i',`${out}/first-interlude.mp4`,'-frames:v','1','-vf','scale=960:540:flags=neighbor',`${out}/recorded-${t}.png`]);
const sheet=createCanvas(1920,2780),g=sheet.getContext('2d');g.fillStyle='#101c21';g.fillRect(0,0,1920,2780);g.imageSmoothingEnabled=false;
for(let i=0;i<times.length;i++){const im=await loadImage(`${out}/recorded-${times[i]}.png`);g.drawImage(im,(i%2)*960,Math.floor(i/2)*556);}
await writeFile(`${out}/recorded-contact.png`,sheet.toBuffer('image/png'));
// Eight successive real playback frames around a complete walk cycle.
for(let i=0;i<8;i++)await run(['-y','-ss',String(10+i*.1478),'-i',`${out}/first-interlude.mp4`,'-frames:v','1','-vf','crop=224:276:512:600,scale=224:276:flags=neighbor',`${out}/recorded-gait-${i}.png`]);
const gait=createCanvas(1792,276),gg=gait.getContext('2d');for(let i=0;i<8;i++)gg.drawImage(await loadImage(`${out}/recorded-gait-${i}.png`),i*224,0);await writeFile(`${out}/recorded-gait.png`,gait.toBuffer('image/png'));
await run(['-y','-ss','26','-t','10','-i',`${out}/first-interlude.mp4`,'-filter_complex','[0:v]fps=12,scale=960:540:flags=neighbor,split[a][b];[a]palettegen[p];[b][p]paletteuse=dither=none','-loop','0',`${out}/leaf-moment.gif`]);
console.log('REAL PLAYBACK CONTACTS EXTRACTED');
