import {createCanvas,loadImage} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
import {mkdir,writeFile} from 'node:fs/promises';

const OUT='public/forest';await mkdir(OUT,{recursive:true});
const palette=['#17292e','#21383d','#2c4449','#385156','#455f63','#526c70','#607a7c','#70878a','#809698','#91a5a5','#a5b5b2','#bcc7bf','#d0d3c6','#dde0d1','#35433d','#46554b','#596657','#707864','#858b70','#9ba083','#4a4b43','#636051','#7a735e','#92866a','#a49a7b','#bab18d','#8a9284','#3c4c4d','#657a78','#829894','#a4b8b3','#c3d0c6'];
const rgb=palette.map(hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)));
const lut=new Uint8Array(32768);for(let i=0;i<32768;i++){const r=((i>>10)&31)*255/31,g=((i>>5)&31)*255/31,b=(i&31)*255/31;let best=Infinity;for(let k=0;k<rgb.length;k++){const d=(r-rgb[k][0])**2*.9+(g-rgb[k][1])**2+(b-rgb[k][2])**2;if(d<best){best=d;lut[i]=k;}}}
function quantize(c,alpha=false){const g=c.getContext('2d'),im=g.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){if(alpha&&d[i+3]<100){d[i+3]=0;continue;}const p=rgb[lut[((d[i]>>3)<<10)|((d[i+1]>>3)<<5)|(d[i+2]>>3)]];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];if(alpha)d[i+3]=255;}g.putImageData(im,0,0);return c;}
async function save(c,name){await writeFile(`${OUT}/${name}.png`,c.toBuffer('image/png'));}
function canvas(w,h){const c=createCanvas(w,h);c.getContext('2d').imageSmoothingEnabled=false;return c;}
for(const [name,file]of [['background','background-flat-source'],['foreground','foreground-flat-source']]){const image=await loadImage(`reference/forest/${file}.png`),c=canvas(384,216);c.getContext('2d').drawImage(image,0,0,384,216);await save(quantize(c,name==='foreground'),name);}

// Native pixel drawing; all runtime layers are PNG sprites, including the actor.
class Pixels{
 constructor(w,h){this.c=canvas(w,h);this.g=this.c.getContext('2d');}
 dot(x,y,col){this.g.fillStyle=col;this.g.fillRect(Math.round(x),Math.round(y),1,1);}
 rect(x,y,w,h,col){this.g.fillStyle=col;this.g.fillRect(Math.round(x),Math.round(y),w,h);}
 poly(points,col){const ys=points.map(p=>p[1]);for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++){const intersections=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))intersections.push(a[0]+(y+.5-a[1])/(b[1]-a[1])*(b[0]-a[0]));}intersections.sort((a,b)=>a-b);for(let i=0;i+1<intersections.length;i+=2)this.rect(Math.ceil(intersections[i]-.5),y,Math.max(1,Math.ceil(intersections[i+1]-.5)-Math.ceil(intersections[i]-.5)),1,col);}}
 line(a,b,width,col){const steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let i=0;i<=steps;i++){const t=steps?i/steps:0;this.rect(a[0]+(b[0]-a[0])*t-width/2,a[1]+(b[1]-a[1])*t-width/2,width,width,col);}}
}
const atlas=canvas(128,288),ag=atlas.getContext('2d');
for(let f=0;f<24;f++){
 const p=new Pixels(32,48),walk=f<8,phase=f*Math.PI/4,bob=walk&&f%4===0?-1:0,reach=f>=12&&f<16?(f-12)/3:0,look=f>=16&&f<20?(f-16)/3:f>=20?1-(f-20)/3:0;
 const leg=(near)=>{let ax=near?18:13,ay=43,kx=near?17:13,ky=34;if(walk){const index=(f+(near?0:4))%8,offset=[0,4,4,2,0,-2,-4,-3][index],lift=[4,2,0,0,0,0,0,3][index];ax=15+offset;ay=43-lift;kx=15+offset*.5+(lift?2:0);ky=34-lift*.4;}p.line([near?17:13,25+bob],[kx,ky],3,near?palette[3]:palette[1]);p.line([kx,ky],[ax,ay-2],3,near?palette[2]:palette[0]);p.poly([[ax-2,ay-3],[ax+1,ay-3],[ax+2,ay-1],[ax+4,ay-1],[ax+4,ay+1],[ax-2,ay+1]],near?palette[0]:'#132329');p.line([ax,ay-2],[ax+2,ay-2],1,palette[4]);};
 leg(false);
 // Far sleeve and hand sit behind the body; limbs keep an adult silhouette.
 const swing=walk?Math.sin(phase)*3:0;p.line([12,13+bob],[10-swing,23+bob],3,palette[15]);p.rect(9-swing,23+bob,2,3,palette[23]);
 // Slung wood-stock rifle and worn leather strap.
 p.line([8,28+bob],[11,3+bob],2,palette[0]);p.line([10,11+bob],[11,3+bob],1,palette[7]);p.poly([[7,23+bob],[10,22+bob],[10,29+bob],[7,31+bob],[6,28+bob]],palette[21]);p.line([8,24+bob],[9,28+bob],1,palette[23]);
 leg(true);
 p.poly([[12,10+bob],[17,10+bob],[20,15+bob],[18,23+bob],[20+(walk?Math.sin(phase-1):0),29+bob],[11+(walk?Math.sin(phase-1):0),30+bob],[10,25+bob],[12,17+bob]],palette[15]);
 p.poly([[14,11+bob],[17,11+bob],[18,16+bob],[16,23+bob],[18,28+bob],[14,28+bob],[13,22+bob]],palette[17]);p.line([18,17+bob],[17,27+bob],1,palette[14]);p.dot(17,18+bob,palette[23]);p.dot(17,23+bob,palette[23]);p.poly([[12,11+bob],[15,10+bob],[18,11+bob],[16,14+bob],[13,13+bob]],palette[18]);
 const bagLag=walk?Math.round(Math.sin(phase-.7)):0;p.line([17,12+bob],[10,25+bob],1,palette[22]);p.poly([[7,22+bob+bagLag],[12,22+bob+bagLag],[13,28+bob+bagLag],[7,29+bob+bagLag],[6,25+bob+bagLag]],palette[21]);p.rect(7,22+bob+bagLag,5,2,palette[23]);p.dot(10,25+bob+bagLag,palette[24]);
 const shoulder=[18,13+bob],elbow=[20+reach*3-swing*.4,19+bob],hand=[18+reach*9-swing,25-reach*4+bob];p.line(shoulder,elbow,3,palette[17]);p.line(elbow,hand,3,palette[16]);p.line([hand[0],hand[1]-1],[hand[0]+1,hand[1]+1],2,palette[23]);if(reach>.6)p.dot(hand[0]+2,hand[1]-1,palette[24]);
 p.rect(15,8+bob,2,3,palette[22]);
 const hx=16-Math.round(look*2);p.poly([[hx-1,3+bob],[hx+2,2+bob],[hx+4,4+bob],[hx+4,7+bob],[hx+2,9+bob],[hx,8+bob],[hx-1,6+bob]],palette[22]);
 p.poly([[hx-2,3+bob],[hx,1+bob],[hx+3,2+bob],[hx+4,4+bob],[hx+1,4+bob],[hx,6+bob],[hx-2,6+bob]],palette[0]);p.line([hx-1,3+bob],[hx+2,2+bob],1,palette[3]);
 if(look>.55){p.dot(hx-2,6+bob,palette[24]);p.dot(hx-1,5+bob,palette[0]);p.line([hx-1,8+bob],[hx+1,8+bob],1,palette[14]);}
 else{p.dot(hx+4,6+bob,palette[24]);p.dot(hx+3,5+bob,palette[0]);p.line([hx+2,8+bob],[hx+3,7+bob],1,palette[14]);}
 ag.drawImage(p.c,(f%4)*32,Math.floor(f/4)*48);
}
await save(atlas,'hunter-atlas');

const branchAtlas=canvas(576,48),bc=branchAtlas.getContext('2d');
for(let f=0;f<4;f++){const p=new Pixels(144,48),bend=f*.6;const points=[[0,37+bend],[16,29+bend*.7],[30,21+bend*.4],[47,18+bend*.2],[66,8],[91,5],[117,9],[143,14]];for(let i=0;i<points.length-1;i++)p.line(points[i],points[i+1],i>3?3:1,palette[2]);p.line([15,30+bend*.7],[18,19+bend*.7],1,palette[3]);p.line([31,21+bend*.4],[35,9+bend*.4],1,palette[2]);p.line([45,18+bend*.2],[56,22],1,palette[2]);for(const[x,y]of [[4,34+bend],[14,24+bend*.7],[20,18+bend*.7],[34,11+bend*.4],[47,17],[55,21],[79,6],[106,7]]){p.poly([[x-2,y],[x,y-2],[x+3,y-1],[x+1,y+1]],palette[15]);p.dot(x,y-1,palette[18]);}for(const[x,y]of [[9,35+bend],[25,24+bend*.5],[51,19]])p.dot(x,y,palette[10]);bc.drawImage(p.c,f*144,0);}
await save(branchAtlas,'branch-atlas');
const fog=canvas(512,96),fc=fog.getContext('2d'),fi=fc.createImageData(512,96);for(let y=0;y<96;y++)for(let x=0;x<512;x++){const edge=15+6*Math.sin(x*.025)+3*Math.sin(x*.079),band=Math.max(0,1-Math.abs(y-48)/35),wave=.68+.21*Math.sin(x*.011+y*.07)+.11*Math.cos(x*.037-y*.04);const a=y>edge?Math.floor(Math.max(0,band*wave)*7)/7:0;const i=(y*512+x)*4;fi.data.set([154,176,179,Math.round(a*116)],i);}fc.putImageData(fi,0,0);await save(fog,'fog');
const drops=canvas(96,32),dc=drops.getContext('2d');for(let f=0;f<8;f++){dc.strokeStyle=palette[f<4?9:6];dc.lineWidth=1;dc.beginPath();dc.ellipse(f*12+6,23,Math.max(1,f*.65),Math.max(.5,f*.15),0,0,Math.PI*2);dc.stroke();if(f<2){dc.fillStyle=palette[11];dc.fillRect(f*12+6,17+f*3,1,2);} }await save(quantize(drops,true),'drop-atlas');
const shadow=canvas(24,8),sc=shadow.getContext('2d');sc.fillStyle='rgba(18,37,40,.24)';sc.beginPath();sc.ellipse(12,4,10,2,0,0,Math.PI*2);sc.fill();await save(shadow,'shadow');
const leaf=new Pixels(12,4);for(let f=0;f<3;f++){leaf.poly([[f*4,2],[f*4+1,0],[f*4+3,1],[f*4+2,3]],palette[18]);leaf.dot(f*4+1,1,palette[23]);}await save(leaf.c,'leaf-atlas');
await writeFile(`${OUT}/sprites.json`,JSON.stringify({native:[384,216],floor:164,actor:{cell:[32,48],columns:4,frames:24,foot:44,headPixels:6},palette,assets:['background','foreground','hunter-atlas','branch-atlas','fog','drop-atlas','shadow','leaf-atlas'],authorship:'Background and foreground generated with image_gen using INDIKA only as visual-language reference; original hunter and effect atlases drawn at native pixel resolution by the project. No INDIKA pixels are shipped.'},null,2));
console.log('FOREST SPRITES BUILT',JSON.stringify({native:[384,216],floor:164,frames:24,palette:palette.length}));
