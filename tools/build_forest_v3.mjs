import {createCanvas,loadImage} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
const OUT='public/forest/v3',REVIEW='deliverables/forest-v3';await mkdir(OUT,{recursive:true});await mkdir(REVIEW,{recursive:true});
const old=JSON.parse(await readFile('public/forest/v2/sprites.json','utf8')),palette=old.palette,rgb=palette.map(h=>h.slice(1).match(/../g).map(x=>parseInt(x,16))),lut=new Uint8Array(32768);
for(let i=0;i<32768;i++){const r=((i>>10)&31)*255/31,g=((i>>5)&31)*255/31,b=(i&31)*255/31;let best=Infinity;for(let k=0;k<rgb.length;k++){const d=(r-rgb[k][0])**2*.9+(g-rgb[k][1])**2+(b-rgb[k][2])**2;if(d<best){best=d;lut[i]=k;}}}
function canvas(w,h){const c=createCanvas(w,h);c.getContext('2d').imageSmoothingEnabled=false;return c;}
function clean(c,cut=155){const g=c.getContext('2d'),im=g.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){if(d[i+3]<=cut){d[i+3]=0;continue;}const p=rgb[lut[((d[i]>>3)<<10)|((d[i+1]>>3)<<5)|(d[i+2]>>3)]];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=255;}g.putImageData(im,0,0);return c;}
function bounds(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}if(x1<0)throw Error('Empty actor');return{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};}
function crop(im,sx,sy,sw,sh){const c=canvas(sw,sh);c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,sw,sh);return clean(c);}
const W=48,H=64,atlas=canvas(W*4,H*10),g=atlas.getContext('2d'),registration=[];
const walk=await loadImage('reference/forest/v3/hunter-walk.png'),story=await loadImage('reference/forest/v3/hunter-story.png');
// The generated source has different row padding. Slice in the empty gutters,
// never through a rifle. Calibrate row scales against standing references;
// never normalize each crouch to a full standing-height bounding box.
const storyRows=[0,.293,.509,.765,1].map(v=>Math.round(v*story.height)),storyCells=[];
for(let i=0;i<16;i++){const col=i%4,row=Math.floor(i/4),sx=Math.round(col*story.width/4),ex=Math.round((col+1)*story.width/4);storyCells.push(crop(story,sx,storyRows[row],ex-sx,storyRows[row+1]-storyRows[row]));}
const standingHeights=[11,12,13,14,15].map(i=>bounds(storyCells[i]).h).sort((a,b)=>a-b),storyScale=54/standingHeights[2];
function register(cell,index,{scale,fixedCenter=false}={}){const b=bounds(cell),data=cell.getContext('2d').getImageData(0,0,cell.width,cell.height).data,xs=[];for(let y=Math.floor(b.y+b.h*.48);y<Math.min(cell.height,Math.ceil(b.y+b.h*.65));y++)for(let x=b.x;x<b.x+b.w;x++)if(data[(y*cell.width+x)*4+3])xs.push(x);xs.sort((a,b)=>a-b);const anchor=fixedCenter?cell.width/2:xs[Math.floor(xs.length/2)],s=scale??54/b.h,dw=Math.round(b.w*s),dh=Math.round(b.h*s),dx=Math.round(24-(anchor-b.x)*s),dy=61-dh;const frame=canvas(W,H);frame.getContext('2d').drawImage(cell,b.x,b.y,b.w,b.h,dx,dy,dw,dh);clean(frame,1);g.drawImage(frame,(index%4)*W,Math.floor(index/4)*H);registration.push({frame:index,bounds:bounds(frame),source:b,scale:s,anchor});}
for(let i=0;i<8;i++){const sx=Math.round(i%4*walk.width/4),ex=Math.round((i%4+1)*walk.width/4),sy=Math.round(Math.floor(i/4)*walk.height/2),ey=Math.round((Math.floor(i/4)+1)*walk.height/2);register(crop(walk,sx,sy,ex-sx,ey-sy),i);}
const previous=await loadImage('public/forest/v2/hunter-atlas.png');g.drawImage(previous,0,128,192,256,0,128,192,256);
// Source rows have slightly different drawn scales; calibrate by the standing
// reference in each row, preserving the descent rather than normalizing its box.
for(let i=0;i<16;i++)register(storyCells[i],24+i,{scale:storyScale*(i<8?.9:i<12?.93:1),fixedCenter:true});
await writeFile(`${OUT}/hunter-atlas.png`,atlas.toBuffer('image/png'));
const review=canvas(768,2560);review.getContext('2d').drawImage(atlas,0,0,768,2560);await writeFile(`${REVIEW}/hunter-registration.png`,review.toBuffer('image/png'));
for(const name of old.assets.filter(n=>n!=='hunter-atlas'))await copyFile(`public/forest/v2/${name}.png`,`${OUT}/${name}.png`);
const tracks=await loadImage('reference/forest/v3/tracks.png'),tc=canvas(96,24);tc.getContext('2d').drawImage(tracks,0,0,96,24);clean(tc,155);await writeFile(`${OUT}/tracks.png`,tc.toBuffer('image/png'));
const manifest={...old,version:3,duration:94,actor:{...old.actor,frames:40},tracks:{worldX:1002,origin:[48,12]},assets:[...old.assets,'tracks'],registration,rootedCameraFactor:1,authorship:'Original built-in image_gen sprites; v3 balanced walking and track/whistle story frames. Calibrated row scales preserve crouched body height. All scenery roots share ground coordinates.'};await writeFile(`${OUT}/sprites.json`,JSON.stringify(manifest,null,2));console.log('FOREST V3 ASSETS',JSON.stringify({walkSource:[walk.width,walk.height],storySource:[story.width,story.height],rows:storyRows,storyScale,frames:registration.map(r=>[r.frame,r.bounds.w,r.bounds.h])}));
