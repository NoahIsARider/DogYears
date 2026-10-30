import fs from 'node:fs/promises';
import path from 'node:path';
import {createCanvas,loadImage} from 'file:///C:/Users/Lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas/index.js';
const input=process.argv[2]||'public/models/DogYears_ArtPass.glb';const output=process.argv[3]||'public/models/DogYears_ArtPass_Fixed.glb';
const b=await fs.readFile(input),len=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+len).toString());let binary=Buffer.from(b.subarray(28+len));
const originals=new Map();
for(const dir of await fs.readdir('reference/assets',{withFileTypes:true})){if(!dir.isDirectory())continue;const base=path.join('reference/assets',dir.name);try{const g=JSON.parse(await fs.readFile(path.join(base,dir.name+'.gltf'),'utf8'));for(const m of g.materials||[])originals.set(m.name,{g,m,base});}catch{}}
const cache=new Map(),repairs=[];
function valid(t){return Number.isInteger(t.source)||Number.isInteger(t.extensions?.EXT_texture_webp?.source)}
async function appendImage(file){if(cache.has(file))return cache.get(file);const im=await loadImage(file),scale=Math.min(1,1024/Math.max(im.width,im.height)),c=createCanvas(Math.round(im.width*scale),Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);const bytes=c.encodeSync('jpeg',88);const pad=(4-binary.length%4)%4;binary=Buffer.concat([binary,Buffer.alloc(pad)]);const bv=j.bufferViews.length;j.bufferViews.push({buffer:0,byteOffset:binary.length,byteLength:bytes.length});binary=Buffer.concat([binary,bytes]);const idx=j.images.length;j.images.push({name:'Restored artist PBR '+path.basename(file),bufferView:bv,mimeType:'image/jpeg'});cache.set(file,idx);return idx;}
for(let ti=0;ti<j.textures.length;ti++){
 if(valid(j.textures[ti]))continue;
 let found;
 for(const m of j.materials){const orig=originals.get(m.name);if(!orig)continue;const slots=[['normal',m.normalTexture,orig.m.normalTexture],['MR',m.pbrMetallicRoughness?.metallicRoughnessTexture,orig.m.pbrMetallicRoughness?.metallicRoughnessTexture],['color',m.pbrMetallicRoughness?.baseColorTexture,orig.m.pbrMetallicRoughness?.baseColorTexture]];for(const[type,ref,raw]of slots){if(ref?.index!==ti||!raw)continue;const tex=orig.g.textures[raw.index],im=orig.g.images[tex.source??tex.extensions?.EXT_texture_webp?.source];if(!im?.uri)continue;found={file:path.join(orig.base,im.uri),name:m.name,type};if(type==='MR'){m.pbrMetallicRoughness.metallicFactor=orig.m.pbrMetallicRoughness?.metallicFactor??1;}break;}if(found)break;}
 if(!found)throw Error('No original artist PBR image for texture '+ti);
 const index=await appendImage(found.file);j.textures[ti].source=index;if(j.textures[ti].extensions){delete j.textures[ti].extensions.EXT_texture_webp;if(!Object.keys(j.textures[ti].extensions).length)delete j.textures[ti].extensions;}repairs.push({texture:ti,material:found.name,slot:found.type,file:found.file});
}
const bad=j.textures.map((t,i)=>valid(t)?null:i).filter(x=>x!==null);if(bad.length)throw Error('Invalid textures remain '+bad);
j.buffers[0].byteLength=binary.length;const raw=Buffer.from(JSON.stringify(j)),jp=(4-raw.length%4)%4,json=Buffer.concat([raw,Buffer.alloc(jp,32)]),bp=(4-binary.length%4)%4;binary=Buffer.concat([binary,Buffer.alloc(bp)]);const header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);await fs.writeFile(output,Buffer.concat([header,jh,json,bh,binary]));console.log(JSON.stringify({output,bytes:28+json.length+binary.length,repairs},null,2));
