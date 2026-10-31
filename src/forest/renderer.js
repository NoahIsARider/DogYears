import {WIDTH,HEIGHT,FLOOR,WORLD_WIDTH,clamp,worldToScreen} from './timeline.js';
import {EPISODES,episodeProps,episodeAnchors} from './episodes.js';
const image=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error(`Cannot open ${src}`));im.src=src;});
const wildlife={1:[['rabbit',380,211,.7]],2:[['bird',850,209,.7]],3:[['bird',410,210,.6]],4:[['rabbit',1030,211,.65]],6:[['rabbit',1100,211,.65]]};
export class ForestRenderer{
 constructor(canvas){this.canvas=canvas;canvas.width=WIDTH;canvas.height=HEIGHT;this.ctx=canvas.getContext('2d',{alpha:false});this.world=document.createElement('canvas');this.world.width=WIDTH;this.world.height=HEIGHT;this.c=this.world.getContext('2d',{willReadFrequently:true,alpha:false});this.c.imageSmoothingEnabled=false;this.ctx.imageSmoothingEnabled=false;this.camera=0;this.elapsed=0;this.frames=0;}
 async load(){const root='/forest/saga',manifest=await fetch(`${root}/sprites.json`).then(r=>{if(!r.ok)throw Error('Missing forest sprites');return r.json();});this.manifest=manifest;this.sprites=Object.fromEntries(await Promise.all(manifest.assets.map(async name=>[name,await image(`${root}/${name}.png`)])));this.palette=manifest.palette.map(hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16)));this.lut=new Uint8Array(32768);for(let i=0;i<32768;i++){const r=((i>>10)&31)*255/31,g=((i>>5)&31)*255/31,b=(i&31)*255/31;let best=Infinity;for(let k=0;k<this.palette.length;k++){const p=this.palette[k],d=(r-p[0])**2*.9+(g-p[1])**2+(b-p[2])**2;if(d<best){best=d;this.lut[i]=k;}}}return this;}
 sprite(name,x,y,{alpha=1,scale=1}={}){const s=this.sprites[name];this.c.globalAlpha=alpha;this.c.drawImage(s,Math.round(x),Math.round(y),Math.round(s.width*scale),Math.round(s.height*scale));this.c.globalAlpha=1;}
 prop(x,id,cam,{scale=1,base=FLOOR,alpha=1}={}){const name=`prop-${id}`,s=this.sprites[name];this.sprite(name,worldToScreen(x,cam)-s.width*scale/2,base-s.height*scale,{scale,alpha});}
 rooted(name,x,base,cam,options={}){const s=this.sprites[name];this.sprite(name,worldToScreen(x,cam)-s.width/2,base-s.height,options);}
 fog(y,alpha,speed,cam,t){const tile=this.sprites.fog,offset=((t*speed-cam*.24)%tile.width+tile.width)%tile.width;for(let x=offset-tile.width;x<WIDTH;x+=tile.width)this.sprite('fog',x,y,{alpha});}
 animal(name,frame,x,base,cam,scale=1,alpha=1){const m=name==='deer'?this.manifest.wildlife.deer:this.manifest.wildlife.small,[w,h]=m.cell;this.c.globalAlpha=alpha;this.c.drawImage(this.sprites[name==='deer'?'deer-atlas':'wildlife-atlas'],(frame%m.columns)*w,Math.floor(frame/m.columns)*h,w,h,worldToScreen(x,cam)-Math.round(m.anchor*scale),Math.round(base-m.hoof*scale),Math.round(w*scale),Math.round(h*scale));this.c.globalAlpha=1;}
 render(dt,state,{paused=false,snapCamera=false}={}){
  if(!this.sprites)return;if(!paused&&!state.frozen)this.elapsed+=dt;this.frames++;
  const episode=state.episode||1,ep=EPISODES[episode-1],props=episodeProps(episode,state.time??this.elapsed,state.ending),target=clamp(state.cameraTarget??state.x-145,0,WORLD_WIDTH-WIDTH);
  if(snapCamera)this.camera=target;else if(!paused&&!state.frozen)this.camera+=(target-this.camera)*(1-Math.exp(-dt*1.5));
  const cam=Math.round(this.camera),t=state.frozen?72:this.elapsed,c=this.c,s=this.sprites;
  c.globalAlpha=1;c.drawImage(s[`woodland-${ep.background}`],-cam,0);
  this.fog(36,.18*ep.fog,1.4,cam,t);this.fog(88,.12*ep.fog,-.8,cam,t);
  for(const [x,id]of ep.mid)this.prop(x,id,cam,{scale:.79,base:211,alpha:.6});
  c.drawImage(s[ep.background==='long'?'ground-long':`ground-${ep.background}`],-cam,FLOOR);
  for(const [kind,x,base,scale]of wildlife[episode]||[]){const frame=(kind==='rabbit'?2:0)+(Math.floor(t/4+x*.01)%3===1?1:0);this.animal('small',frame,x,base,cam,scale,.74);}
  if(ep.tracks)this.rooted('tracks',ep.tracks,FLOOR+12,cam);
  for(let i=0;i<23;i++){const phase=(t*.43+i*.173)%1;if(phase>.47||i>22*ep.rain)continue;const f=Math.min(7,Math.floor(phase/.47*8));c.globalAlpha=.4;c.drawImage(s['drop-atlas'],f*12,0,12,32,worldToScreen(28+i*67,cam),222+(i%3)*9,12,16);}c.globalAlpha=1;
  if(ep.oak){const oak=this.manifest.oak,ox=worldToScreen(oak.worldRoot,cam)-oak.root[0],oy=FLOOR-oak.root[1];this.sprite('oak-body',ox,oy);c.save();c.translate(ox+oak.pivot[0],oy+oak.pivot[1]);c.rotate(-(state.branch||0)*.012);this.sprite('oak-bough',-oak.pivot[0],128-oak.pivot[1]);c.restore();this.sprite('oak-collar',ox+184,oy+128);if(props.cloth)this.rooted('cloth',645,195,cam);}
  if(ep.shelter){this.rooted('shelter',650,FLOOR,cam);if(!props.cupLift)this.rooted('cup',579,179,cam);this.rooted(props.secondCupUp?'cup':'cup-side',620,179,cam);this.rooted('tin',700,179,cam);}
  if(ep.board){this.rooted('waypost',809,FLOOR,cam);const lift=props.boardLift;if(episode===6&&!props.cordHeld&&!props.tied)this.rooted('cord',735,216,cam);if(props.tied)this.rooted('cord',741,183,cam);c.save();c.translate(worldToScreen(809,cam),182);c.rotate(-.5+lift*.59);c.drawImage(s.plank,0,0,96,8,-68,-4,68,8);c.restore();}
  if(ep.gate){const gx=worldToScreen(960,cam)-72,gy=FLOOR-84;this.sprite('gate-posts',gx,gy);c.drawImage(s['gate-leaf'],0,0,91,45,gx+29,gy+30,Math.max(8,Math.round(91*(1-props.gateOpen*.9))),45);}
  if(episode===7)this.animal('deer',state.deerFrame??0,this.manifest.wildlife.deer.worldX,FLOOR,cam);
  this.sprite('shadow',state.x-12-cam,FLOOR-3,{alpha:.68});const frame=state.frame,a=this.manifest.actor,[aw,ah]=a.cell;c.save();c.translate(worldToScreen(state.x,cam),FLOOR-a.foot);if(state.facing===-1)c.scale(-1,1);c.drawImage(s['hunter-atlas'],(frame%a.columns)*aw,Math.floor(frame/a.columns)*ah,aw,ah,-a.anchor,0,aw,ah);c.restore();
  const grip=a.hands?.[frame],hand=grip?{x:state.x-a.anchor+grip.x,y:FLOOR-a.foot+grip.y}:null;
  if(props.cupLift)this.rooted('cup',hand?hand.x-2:props.cupLift.x,hand?hand.y:props.cupLift.y,cam);if(props.cordHeld)this.rooted('cord',hand?hand.x:props.cordHeld.x,hand?Math.min(216,hand.y+8):props.cordHeld.y,cam);
  for(const [x,id]of ep.plants)this.prop(x,id,cam,{scale:.55,base:240,alpha:.82});
  this.fog(172,.13*ep.fog,.9,cam,t);for(const [x,id]of ep.front)this.prop(x,id,cam,{scale:1.12,base:250,alpha:.88});
  for(let i=0;i<19*ep.rain;i++){const q=(t*(.09+(i%3)*.013)+i*.137)%1,x=worldToScreen(20+i*87,cam);if(q>.75&&x>-12&&x<WIDTH)c.drawImage(s['drop-atlas'],0,0,12,32,x,Math.round(70+(q-.75)*430),4,11);}
  const pixels=c.getImageData(0,0,WIDTH,HEIGHT),d=pixels.data,grade=ep.grade||[1,1,1];for(let i=0;i<d.length;i+=4){const p=this.palette[this.lut[((Math.min(255,d[i]*grade[0])>>3)<<10)|((Math.min(255,d[i+1]*grade[1])>>3)<<5)|(Math.min(255,d[i+2]*grade[2])>>3)]];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=255;}this.ctx.putImageData(pixels,0,0);this.lastState={...state,y:FLOOR,camera:this.camera};this.rootAnchors=episodeAnchors(episode,cam);
 }
}
