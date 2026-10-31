import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const filename=process.argv[2]||'public/models/DogYears_ArtPass_Hero.glb';
const data=await readFile(filename);
assert.equal(data.readUInt32LE(0),0x46546c67,'Asset must be glTF binary');
assert.equal(data.readUInt32LE(8),data.length,'GLB length must match the complete export');
const json=JSON.parse(data.toString('utf8',20,20+data.readUInt32LE(12)));
const invalid=[];
for(const [index,texture]of (json.textures||[]).entries()){
 const source=texture.source??texture.extensions?.EXT_texture_webp?.source??texture.extensions?.KHR_texture_basisu?.source;
 const image=json.images?.[source];
 if(!image||!(image.uri||Number.isInteger(image.bufferView))){
  const bindings=[];
  function visit(value,path){if(!value||typeof value!=='object')return;for(const[k,v]of Object.entries(value)){if(k.endsWith('Texture')&&v?.index===index)bindings.push(path+'.'+k);else visit(v,path+'.'+k);}}
  for(const material of json.materials||[])visit(material,material.name);
  invalid.push({index,texture,bindings});
 }
}
console.log(JSON.stringify({filename,bytes:data.length,meshes:json.meshes?.length,textures:json.textures?.length,images:json.images?.length,invalid},null,2));
assert.equal(invalid.length,0,'Every exported texture needs a valid embedded image or source URI');
