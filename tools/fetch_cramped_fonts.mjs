// Cramped / dense handwriting candidates (Google Fonts, latin woff2 + licenses)
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const OUT='deliverables/font-options/fonts';
await mkdir(OUT,{recursive:true});
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const roster=[
 {name:'KleeOne',url:'Klee+One:wght@600',dir:'ofl/kleeone',lic:'OFL.txt'},
 {name:'JustAnotherHand',url:'Just+Another+Hand',dir:'apache/justanotherhand',lic:'LICENSE.txt'},
 {name:'CedarvilleCursive',url:'Cedarville+Cursive',dir:'apache/cedarvillegcursive',lic:'LICENSE.txt'},
 {name:'HomemadeApple',url:'Homemade+Apple',dir:'apache/homemadeapple',lic:'LICENSE.txt'},
 {name:'Mansalva',url:'Mansalva',dir:'ofl/mansalva',lic:'OFL.txt'},
 {name:'Neucha',url:'Neucha',dir:'ofl/neucha',lic:'OFL.txt'},
 {name:'Yomogi',url:'Yomogi',dir:'ofl/yomogi',lic:'OFL.txt'},
 {name:'WaitingSunrise',url:'Waiting+for+the+Sunrise',dir:'ofl/waitingforthesunrise',lic:'OFL.txt'},
];

const curl=(u,bin)=>{const a=['-sL','--max-time','60','-A',UA,u];return bin?execFileSync('curl',a):execFileSync('curl',a,{encoding:'utf8'})};

const manifest=[];
for(const f of roster){
 try{
  const css=curl(`https://fonts.googleapis.com/css2?family=${f.url}&display=swap`);
  let pick=null,weight='400';
  for(const b of css.split('@font-face').slice(1)){
   const url=(b.match(/url\((https:[^)]+\.woff2)\)/)||[])[1];
   if(!url)continue;
   const range=(b.match(/unicode-range:([^;]+);/)||[])[1]||'';
   if(!pick)pick=url;
   if(range.includes('U+0000-00FF')){pick=url;weight=(b.match(/font-weight:\s*([\d ]+);/)||[])[1]?.trim()||weight;break}
  }
  if(!pick)throw new Error('no woff2');
  const bytes=curl(pick,true);
  await writeFile(`${OUT}/${f.name}.woff2`,bytes);
  try{
   const lic=curl(`https://raw.githubusercontent.com/google/fonts/main/${f.dir}/${f.lic}`);
   await writeFile(`${OUT}/${f.name}-LICENSE.txt`,lic);
  }catch{console.log(`  (license fetch failed for ${f.name})`)}
  manifest.push({...f,weight,kb:+(bytes.length/1024).toFixed(1)});
  console.log(`${f.name.padEnd(20)} ${String(bytes.length).padStart(7)} B  weight:${weight}`);
 }catch(e){console.log(`${f.name.padEnd(20)} FAILED ${e.message.split('\n')[0]}`)}
}
await writeFile(`${OUT}/manifest-cramped.json`,JSON.stringify(manifest,null,1));
console.log(`\n${manifest.length}/${roster.length} downloaded`);
