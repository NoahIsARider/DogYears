// Download candidate handwriting fonts (Google Fonts, latin subset woff2) + licenses
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

const OUT='deliverables/font-options/fonts';
await mkdir(OUT,{recursive:true});
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const candidates=[
 {name:'Caveat',css:'Caveat:wght@400..700',dir:'ofl/caveat',lic:'OFL.txt',label:'Caveat (current, bolded)'},
 {name:'ShantellSans',css:'Shantell+Sans:wght@300..800',dir:'ofl/shantellsans',lic:'OFL.txt',label:'Shantell Sans'},
 {name:'Kalam',css:'Kalam:wght@700',dir:'ofl/kalam',lic:'OFL.txt',label:'Kalam Bold'},
 {name:'Mali',css:'Mali:wght@700',dir:'ofl/mali',lic:'OFL.txt',label:'Mali Bold'},
 {name:'CaveatBrush',css:'Caveat+Brush',dir:'ofl/caveatbrush',lic:'OFL.txt',label:'Caveat Brush'},
 {name:'Sriracha',css:'Sriracha',dir:'ofl/sriracha',lic:'OFL.txt',label:'Sriracha'},
 {name:'PermanentMarker',css:'Permanent+Marker',dir:'apache/permanentmarker',lic:'LICENSE.txt',label:'Permanent Marker'},
 {name:'RockSalt',css:'Rock+Salt',dir:'apache/rocksalt',lic:'LICENSE.txt',label:'Rock Salt'},
 {name:'GloriaHallelujah',css:'Gloria+Hallelujah',dir:'ofl/gloriahallelujah',lic:'OFL.txt',label:'Gloria Hallelujah'},
 {name:'PatrickHand',css:'Patrick+Hand',dir:'ofl/patrickhand',lic:'OFL.txt',label:'Patrick Hand'},
 {name:'DeliciousHandrawn',css:'Delicious+Handrawn',dir:'ofl/delicioushandrawn',lic:'OFL.txt',label:'Delicious Handrawn'},
 {name:'Handlee',css:'Handlee',dir:'ofl/handlee',lic:'OFL.txt',label:'Handlee'},
];

function curl(url,bin){
 const args=['-sL','--max-time','45','-A',UA];
 if(bin)return execFileSync('curl',[...args,url]);
 return execFileSync('curl',[...args,url],{encoding:'utf8'});
}
const manifest=[];
for(const c of candidates){
 try{
  const css=curl(`https://fonts.googleapis.com/css2?family=${c.css}&display=swap`);
  const blocks=css.split('@font-face').slice(1);
  let pick=null;
  for(const b of blocks){
   const url=(b.match(/url\((https:[^)]+\.woff2)\)/)||[])[1];
   const range=(b.match(/unicode-range:([^;]+);/)||[])[1]||'';
   if(!url)continue;
   if(!pick||range.includes('U+0000-00FF'))pick=url;
   if(range.includes('U+0000-00FF'))break;
  }
  if(!pick)throw new Error('no woff2 in css');
  const weight=(css.match(/font-weight:\s*([\d ]+);/)||[])[1]?.trim()||'400';
  const bytes=curl(pick,true);
  await writeFile(`${OUT}/${c.name}.woff2`,bytes);
  const lic=curl(`https://raw.githubusercontent.com/google/fonts/main/${c.dir}/${c.lic}`);
  await writeFile(`${OUT}/${c.name}-LICENSE.txt`,lic);
  manifest.push({...c,file:`${c.name}.woff2`,weight,bytes:bytes.length});
  console.log(`${c.name.padEnd(20)} ${String(bytes.length).padStart(7)} B  weight:${weight}`);
 }catch(error){
  console.log(`${c.name.padEnd(20)} FAILED ${error.message}`);
 }
}
await writeFile(`${OUT}/manifest.json`,JSON.stringify(manifest,null,1));
console.log(`\n${manifest.length}/${candidates.length} families downloaded`);
