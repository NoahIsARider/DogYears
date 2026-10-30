import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Package only the current playable asset. Earlier Blender review revisions
// remain in the project rather than adding hundreds of MB to the game folder.
const output=path.resolve('release/DogYears');
const model='DogYears_ArtPass_Hero.glb';
await mkdir(path.join(output,'dist/models'),{recursive:true});
await copyFile('dist/index.html',path.join(output,'dist/index.html'));
await copyFile('dist/favicon.svg',path.join(output,'dist/favicon.svg'));
for(const folder of ['assets','fonts','environment'])await cp(path.join('dist',folder),path.join(output,'dist',folder),{recursive:true});
await copyFile(path.join('public/models',model),path.join(output,'dist/models',model));
for(const file of ['serve.mjs','启动游戏.cmd','README.md','THIRD_PARTY_ART.md'])await copyFile(file,path.join(output,file));
const bytes=await readFile(path.join(output,'dist/models',model));
const manifest={game:'DogYears',version:'0.3.0',built:new Date().toISOString(),model,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
await writeFile(path.join(output,'build.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({output,...manifest},null,2));
