import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {OBJECTS} from './game.js';
import {MemoryGesture} from './memories.js';
import {StoryWorld} from './story-world.js';
import {SpatialText} from './spatial-text.js';
import {lightEnvironment} from './environment.js';

const v3=(a)=>new THREE.Vector3(...a);
export class HouseWorld{
 constructor(canvas,settings){
  this.settings=settings;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#b2b3ab');this.scene.fog=new THREE.FogExp2('#b2b3ab',.014);
  this.camera=new THREE.PerspectiveCamera(settings.fov,innerWidth/innerHeight,.035,170);
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setSize(innerWidth,innerHeight);this.renderer.setPixelRatio(Math.min(devicePixelRatio,settings.quality==='low'?.85:1.15));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.9;
  this.hemi=new THREE.HemisphereLight(0xbecbd0,0x564c3c,1.1);this.scene.add(this.hemi);
  this.sun=new THREE.DirectionalLight(0xffd9a0,2.2);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9,near:.5,far:55});this.sun.shadow.bias=-.0002;this.sun.shadow.normalBias=.018;this.scene.add(this.sun,this.sun.target);
  this.bounces=[];
  const fill=new THREE.PointLight(0xd6cebb,12,8,2);fill.position.set(0,2.65,3);this.scene.add(fill);this.bounces.push(fill);
  this.windows=[];const windowFill=new THREE.PointLight(0xe7dcc1,28,9,2);windowFill.position.set(-5.25,2,3.5);this.scene.add(windowFill);this.windows.push(windowFill);
  this.meshes=[];this.occluders=[];this.groups=new Map();this.resolved=new Set();this.ray=new THREE.Raycaster();this.memory=false;this.clock=0;this.shadowClock=0;this.slowFrames=0;this.adaptiveAO=true;this.frameAverage=1/60;
  const target=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{samples:2});
  this.composer=new EffectComposer(this.renderer,target);this.composer.addPass(new RenderPass(this.scene,this.camera));
  this.ao=new SSAOPass(this.scene,this.camera,innerWidth,innerHeight,12);this.ao.kernelRadius=.18;this.ao.minDistance=.001;this.ao.maxDistance=.055;this.composer.addPass(this.ao);
  this.film=new ShaderPass({uniforms:{tDiffuse:{value:null},time:{value:0},memory:{value:0},fade:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D tDiffuse;uniform float time,memory,fade;varying vec2 vUv;void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float vig=smoothstep(.9,.15,length((vUv-.5)*vec2(.9,1.)));c*=mix(.85,1.,vig);c=mix(c,c*vec3(1.035,1.0,.93),memory*.55);gl_FragColor=vec4(c*(1.-fade),1.);}`});this.composer.addPass(this.film);this.composer.addPass(new OutputPass());
  this.addSky();this.addDust();this.storyWorld=new StoryWorld(this.scene);this.ink=new SpatialText(this.scene,this.camera);this.environmentTask=lightEnvironment(this.renderer,this.scene).catch(()=>null);
 }
 addSky(){
  const g=new THREE.SphereGeometry(110,32,16);const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#879eaa')},bottom:{value:new THREE.Color('#d4c8aa')}},vertexShader:'varying vec3 pos;void main(){pos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 pos;uniform vec3 top,bottom;void main(){float h=clamp(normalize(pos).y*.9+.05,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.7)),1.);}'});this.sky=new THREE.Mesh(g,m);this.scene.add(this.sky);
 }
 addDust(){
  const pts=[];for(let i=0;i<180;i++)pts.push((Math.random()-.5)*10,Math.random()*2.8,(Math.random()-.5)*11);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  const mat=new THREE.PointsMaterial({color:0xe0d4ab,size:.009,transparent:true,opacity:.26,depthWrite:false});this.dust=new THREE.Points(geo,mat);this.scene.add(this.dust);
 }
 async load(onProgress){
  const loader=new GLTFLoader();let gltf;
  this.assetPath='/models/DogYears_ArtPass_Hero.glb';gltf=await loader.loadAsync(this.assetPath,onProgress);
  this.model=gltf.scene;this.scene.add(this.model);this.model.updateMatrixWorld(true);
  this.model.traverse(o=>{if(o.isMesh){this.meshes.push(o);const mats=Array.isArray(o.material)?o.material:[o.material];o.castShadow=!o.userData.noShadow&&!/Garden|grass|leaf|distant.woodland|Landscape/i.test(o.name)&&!mats.some(m=>/leaves/i.test(m.name));o.receiveShadow=true;for(const m of mats){m.envMapIntensity=.65;if(m.map){m.map.anisotropy=4;}if(/cotton|linen|wool|paper|plaster/i.test(m.name))m.roughness=.94;if(o.userData.pressureMark)m.depthWrite=false;if(o.userData.impostor){m.alphaTest=.25;m.transparent=false;m.depthWrite=true;}}
   if(o.userData.impostor)o.onBeforeRender=(renderer,scene,camera,geometry)=>geometry.setDrawRange(0,scene.overrideMaterial?0:Infinity);
   if(/Partition|Room_division|End_wall|Door_.*jamb|Wardrobe_.*back/.test(o.name))this.occluders.push(o);
  }});
  // Consolidate identical bindings before batching (many inherited book spines
  // had separate material instances with the same colour and surface values).
  const shared=new Map();for(const o of this.meshes){if(Array.isArray(o.material))continue;const m=o.material;const maps=['map','normalMap','roughnessMap','metalnessMap','aoMap','alphaMap','emissiveMap'].map(k=>m[k]?.uuid);const key=[m.type,m.color?.getHexString(),m.emissive?.getHexString(),m.emissiveIntensity,m.roughness,m.metalness,...maps,m.normalScale?.toArray(),m.aoMapIntensity,m.side,m.opacity,m.transparent,m.alphaTest,m.depthWrite].join(':');if(shared.has(key))o.material=shared.get(key);else shared.set(key,m);}
  // Keep a named source list for diegetic interactions; merge only plain static parts.
  this.batchStatic();this.model.updateMatrixWorld(true);this.storyWorld.bind(this);
  await Promise.all([this.environmentTask,this.storyWorld.prepareInk()]);return this;
 }
 batchStatic(){
  const clean=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  const prefixes=OBJECTS.flatMap(o=>o.meshPrefixes).map(clean);
  const keep=/Key_|Back_door|Mirror|Duvet|Throw_/;
  const batches=new Map();
  for(const o of this.meshes){if(o.userData.noShadow||o.userData.pressureMark||keep.test(o.name)||prefixes.some(p=>clean(o.name).startsWith(p))||Array.isArray(o.material)||o.isSkinnedMesh)continue;const mat=o.material;o.geometry.computeBoundingBox();const center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);const outside=Math.abs(center.x)>6||center.z< -8||center.z>7;const cell=outside?`${Math.floor(center.x/12)},${Math.floor(center.z/12)}`:'interior';const key=mat.uuid+':'+cell;let list=batches.get(key);if(!list)batches.set(key,list=[]);list.push(o);}
  for(const list of batches.values()){
   if(list.length<2)continue;const geos=[];let failed=false;
   for(const o of list){let g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);for(const name of Object.keys(g.attributes))if(!['position','normal','uv'].includes(name))g.deleteAttribute(name);if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!g.attributes.normal)g.computeVertexNormals();if(!g.index){const ix=[];for(let j=0;j<g.attributes.position.count;j++)ix.push(j);g.setIndex(ix);}geos.push(g);}
   let geo;try{geo=mergeGeometries(geos,false);}catch{failed=true;}if(geo&&!failed){const merged=new THREE.Mesh(geo,list[0].material);merged.name='Static | '+list[0].material.name;merged.castShadow=list.some(o=>o.castShadow);merged.receiveShadow=true;this.scene.add(merged);for(const o of list){o.visible=false;o.userData.batched=true;}}geos.forEach(g=>g.dispose());
  }
 }
 find(prefixes){const clean=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');return this.meshes.filter(o=>prefixes.some(p=>clean(o.name).startsWith(clean(p))));}
 register(objects){for(const obj of objects){const names=obj.meshPrefixes||[];this.groups.set(obj.id,this.find(names));}}
 applyState(state){
  for(const [id,entry] of Object.entries(state.decisions||{})){
   const choice=typeof entry==='string'?entry:entry.choice;
   const unpacked=id==='model'&&state.sceneProgress?.['6:model']?.action>=1;
   const hide=!unpacked&&(choice==='release'||choice==='carry');for(const o of this.groups.get(id)||[])o.visible=!hide&&!o.userData.replacedInk;
  }
  if(this.gesture)for(const [o] of this.gesture.sources)o.visible=false;
  if(this.inspectionSources)for(const [o] of this.inspectionSources)o.visible=false;
  this.state=state;
 }
 visibleTo(position){
  const dir=v3(position).sub(this.camera.position);const d=dir.length();this.ray.set(this.camera.position,dir.normalize());this.ray.far=Math.max(0,d-.18);
  return !this.ray.intersectObjects(this.occluders,false).some(i=>i.distance<this.ray.far);
 }
 inspect(object){
  this.clearInspection();const source=this.groups.get(object.id)||[];if(!source.length)return;
  const group=new THREE.Group();this.inspectionSources=source.map(o=>[o,o.visible]);for(const o of source){if(!o.isMesh||o.userData.replacedInk)continue;const c=new THREE.Mesh(o.geometry,o.material);c.matrixAutoUpdate=false;c.matrix.copy(o.matrixWorld);group.add(c);o.visible=false;}
  if(!group.children.length)return;group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(group);const size=bounds.getSize(new THREE.Vector3());const center=bounds.getCenter(new THREE.Vector3());
  for(const c of group.children){c.matrix.premultiply(new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z));}
  const scale=.32/Math.max(size.x,size.y,size.z);group.scale.setScalar(scale);this.camera.add(group);group.position.set(.24,-.17,-.65);group.rotation.set(.12,-.25,.05);this.scene.add(this.camera);this.inspection=group;
  this.inspectLight=new THREE.PointLight(0xffe4bd,.35,1.5,1);this.inspectLight.position.set(0,.1,-.3);this.camera.add(this.inspectLight);
 }
 clearInspection(){if(this.inspectionSources){for(const [o,visible]of this.inspectionSources)o.visible=visible;this.inspectionSources=null;}if(this.inspection){this.camera.remove(this.inspection);this.inspection=null;}if(this.inspectLight){this.camera.remove(this.inspectLight);this.inspectLight=null;}}
 startMemory(object){this.clearMemory();this.memory=true;this.gesture=new MemoryGesture(this,object);}
 memoryAction(object,progress,action=null){this.gesture?.update(progress,action);}
 clearMemory(){this.memory=false;this.gesture?.dispose();this.gesture=null;}
 update(dt,state){
  this.clock+=dt;this.shadowClock+=dt;this.ink.update(dt);
  if(this.shadowClock>(this.memory?.2:1.2)){this.renderer.shadowMap.needsUpdate=true;this.shadowClock=0;}
  this.frameAverage=THREE.MathUtils.lerp(this.frameAverage,dt,.025);if(this.frameAverage>.024)this.slowFrames++;else this.slowFrames=Math.max(0,this.slowFrames-1);if(this.slowFrames>100)this.adaptiveAO=false;
  const t=state.time||0,mem=this.memory?1:0;
  this.storyWorld.update(dt,state,this.memory);if(this.scene.userData.shadowDirty){this.renderer.shadowMap.needsUpdate=true;this.scene.userData.shadowDirty=false;}
  // Light crosses the house over one day; grief changes the pace, not the UI's colour.
  const phase=.22+t*.68;const angle=phase*Math.PI;
  this.sun.position.set(-16*Math.cos(t*.8),Math.max(1.4,9*Math.sin(angle)),7-11*t);this.sun.target.position.set(0,0,0);
  const dusk=THREE.MathUtils.smoothstep(t,.60,1);this.sun.color.setRGB(1,.89-dusk*.22,.69-dusk*.23);this.sun.intensity=THREE.MathUtils.lerp(2.2,.65,dusk)+mem*.35;
  this.hemi.intensity=THREE.MathUtils.lerp(1.05,.55,dusk)+mem*.08;
  this.renderer.toneMappingExposure=THREE.MathUtils.damp(this.renderer.toneMappingExposure,this.memory?1.03:.88-dusk*.06,2,dt);
  const p=this.camera.position,side=p.x< -1?-1:p.x>1?1:0,roomZ=p.z>0?3.4:-3.1;
  const fillTarget=new THREE.Vector3(side*3,2.65,p.z< -6?-7:roomZ);this.bounces[0].position.lerp(fillTarget,1-Math.exp(-dt*2));this.bounces[0].intensity=p.z< -6?2:side?12:6;
  const windowTarget=new THREE.Vector3(side*5.25,2,roomZ);
  for(const l of this.windows){l.position.lerp(windowTarget,1-Math.exp(-dt*2));l.intensity=(side&&p.z> -6?1:0)*THREE.MathUtils.lerp(25,9,dusk);l.color.copy(this.sun.color);}
  this.film.uniforms.time.value=this.clock;this.film.uniforms.memory.value=THREE.MathUtils.damp(this.film.uniforms.memory.value,mem,3,dt);
  this.dust.position.y=Math.sin(this.clock*.12)*.025;this.dust.rotation.y=Math.sin(this.clock*.03)*.002;
 }
 resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.composer.setSize(innerWidth,innerHeight);}
 render(){const low=this.settings.quality==='low',ratio=Math.min(devicePixelRatio,low?.85:1.15),shadowSize=low?1024:2048;if(this.renderer.getPixelRatio()!==ratio){this.renderer.setPixelRatio(ratio);this.composer.setPixelRatio(ratio);}if(this.sun.shadow.mapSize.x!==shadowSize){this.sun.shadow.mapSize.set(shadowSize,shadowSize);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.renderer.shadowMap.needsUpdate=true;}this.ao.enabled=!low&&this.adaptiveAO;this.composer.render();}
}
