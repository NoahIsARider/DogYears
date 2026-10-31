import {createCanvas,loadImage} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('public/icons',{recursive:true});await mkdir('deliverables/icon',{recursive:true});
// Reuse the approved full-body deer from the final film: frame 2, facing left.
// The entire 64x48 cell is retained, including ears and hooves, on a transparent
// square. Larger desktop sizes preserve the original pixels exactly.
const atlas=await loadImage('public/forest/saga/deer-atlas.png'),source=createCanvas(64,64),sg=source.getContext('2d');
sg.imageSmoothingEnabled=false;sg.drawImage(atlas,0,48,64,48,0,8,64,48);
const sizes=[1024,512,256,192,180,128,64,48,32,16],images=new Map();
for(const size of sizes){const c=createCanvas(size,size),g=c.getContext('2d');g.imageSmoothingEnabled=size<64;g.imageSmoothingQuality='high';g.drawImage(source,0,0,size,size);const png=c.toBuffer('image/png');images.set(size,{c,png});await writeFile(`public/icons/dogyears-${size}.png`,png);}
const icoSizes=[16,32,48,64,128,256],header=Buffer.alloc(6+icoSizes.length*16);header.writeUInt16LE(1,2);header.writeUInt16LE(icoSizes.length,4);let offset=header.length;const payload=[];for(let i=0;i<icoSizes.length;i++){const size=icoSizes[i],png=images.get(size).png,p=6+i*16;header[p]=size===256?0:size;header[p+1]=size===256?0:size;header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(png.length,p+8);header.writeUInt32LE(offset,p+12);offset+=png.length;payload.push(png);}const ico=Buffer.concat([header,...payload]);await writeFile('public/favicon.ico',ico);await writeFile('public/icons/DogYears.ico',ico);
// Keep the old URL compatible without retaining a letter icon or relying on
// external resources inside an SVG-as-image document.
await writeFile('public/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${images.get(64).png.toString('base64')}"/></svg>`);
const preview=createCanvas(768,384),g=preview.getContext('2d');g.fillStyle='#ece9e1';g.fillRect(0,0,384,384);g.fillStyle='#172329';g.fillRect(384,0,384,384);for(const x of [0,384]){g.drawImage(images.get(256).c,x+64,15);g.drawImage(images.get(64).c,x+50,296);g.drawImage(images.get(32).c,x+154,312);g.drawImage(images.get(16).c,x+244,320);}await writeFile('deliverables/icon/light-dark-review.png',preview.toBuffer('image/png'));
const report=[];for(const size of icoSizes){const d=images.get(size).c.getContext('2d').getImageData(0,0,size,size).data;let transparent=0;for(let i=3;i<d.length;i+=4)if(d[i]===0)transparent++;report.push({size,transparent,ratio:transparent/(size*size),corners:[3,(size-1)*4+3,((size-1)*size)*4+3,(size*size-1)*4+3].map(i=>d[i])});}await writeFile('deliverables/icon/alpha-report.json',JSON.stringify(report,null,2));await writeFile('public/icons/icon-sizes.json',JSON.stringify(report,null,2));console.log('TRANSPARENT ICO BUILT',JSON.stringify({bytes:ico.length,report}));
