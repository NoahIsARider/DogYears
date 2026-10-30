// Download an "elegant" roster: literary serif italics + formal scripts (Google Fonts, latin woff2 + licenses)
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const OUT='deliverables/font-options/fonts';
await mkdir(OUT,{recursive:true});
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const roster=[
 {name:'CormorantItalic',url:'Cormorant+Garamond:ital,wght@1,600',dir:'ofl/cormorantgaramond',lic:'OFL.txt'},
 {name:'FrauncesItalic',url:'Fraunces:ital,opsz,SOFT,WONK,wght@1,9..144,0..100,0..1,900',dir:'ofl/fraunces',lic:'OFL.txt'},
 {name:'BodoniItalic',url:'Bodoni+Moda:ital,opsz,wght@1,6..96,700',dir:'ofl/bodonimoda',lic:'OFL.txt'},
 {name:'PlayfairItalic',url:'Playfair+Display:ital,wght@1,700',dir:'ofl/playfairdisplay',lic:'OFL.txt'},
 {name:'NewsreaderItalic',url:'Newsreader:ital,opsz,wght@1,6..72,600',dir:'ofl/newsreader',lic:'OFL.txt'},
 {name:'LoraItalic',url:'Lora:ital,wght@1,700',dir:'ofl/lora',lic:'OFL.txt'},
 {name:'PetitFormalScript',url:'Petit+Formal+Script',dir:'ofl/petitformalscript',lic:'OFL.txt'},
 {name:'MarckScript',url:'Marck+Script',dir:'ofl/marckscript',lic:'OFL.txt'},
 {name:'KaushanScript',url:'Kaushan+Script',dir:'ofl/kaushanscript',lic:'OFL.txt'},
 {name:'GrandHotel',url:'Grand+Hotel',dir:'ofl/grandhotel',lic:'OFL.txt'},
 {name:'AlexBrush',url:'Alex+Brush',dir:'ofl/alexbrush',lic:'OFL.txt'},
 {name:'GreatVibes',url:'Great+Vibes',dir:'ofl/greatvibes',lic:'OFL.txt'},
];

const curl=(u,bin)=>{const a=['-sL','--max-time','60','-A',UA,u];return bin?execFileSync('curl',a):execFileSync('curl',a,{encoding:'utf8'})};

const manifest=[];
for(const f of roster){
 try{
  const css=curl(`https://fonts.googleapis.com/css2?family=${f.url}&display=swap`);
  const blocks=css.split('@font-face').slice(1);
  let pick=null,weight='400';
  for(const b of blocks){
   const url=(b.match(/url\((https:[^)]+\.woff2)\)/)||[])[1];
   if(!url)continue;
   const range=(b.match(/unicode-range:([^;]+);/)||[])[1]||'';
   if(!pick)pick=url;
   if(range.includes('U+0000-00FF')){pick=url;weight=(b.match(/font-weight:\s*([\d ]+);/)||[])[1]?.trim()||weight;break}
  }
  if(!pick)throw new Error('no woff2');
  const bytes=curl(pick,true);
  await writeFile(`${OUT}/${f.name}.woff2`,bytes);
  const lic=curl(`https://raw.githubusercontent.com/google/fonts/main/${f.dir}/${f.lic}`);
  await writeFile(`${OUT}/${f.name}-LICENSE.txt`,lic);
  manifest.push({...f,weight,kb:+(bytes.length/1024).toFixed(1)});
  console.log(`${f.name.padEnd(20)} ${String(bytes.length).padStart(7)} B  weight:${weight}`);
 }catch(e){console.log(`${f.name.padEnd(20)} FAILED ${e.message.split('\n')[0]}`)}
}
await writeFile(`${OUT}/manifest-elegant.json`,JSON.stringify(manifest,null,1));
console.log(`\n${manifest.length}/${roster.length} downloaded`);
