import * as THREE from 'three';

// A memory gives the same room one small physical action. The other person's
// absence is never filled by a character model or a different outcome.
export class MemoryGesture {
 constructor(world,object){
  this.world=world;this.object=object;this.root=new THREE.Group();this.root.position.fromArray(object.position);world.scene.add(this.root);this.origin=this.root.position.clone();this.sources=[];this.copies=[];
  for(const o of world.groups.get(object.id)||[]){
   if(!o.isMesh||o.userData.replacedInk||/circular|stain/i.test(o.name))continue;
   this.sources.push([o,o.visible]);
   const copy=new THREE.Mesh(o.geometry,o.material);copy.castShadow=true;copy.receiveShadow=true;
   copy.matrixAutoUpdate=false;copy.matrix.copy(o.matrixWorld).premultiply(new THREE.Matrix4().makeTranslation(-this.origin.x,-this.origin.y,-this.origin.z));this.root.add(copy);this.copies.push(copy);o.visible=false;
  }
  if(object.id==='model'){
   this.beam=new THREE.Mesh(new THREE.BoxGeometry(.025,.025,.53),new THREE.MeshStandardMaterial({color:0x736049,roughness:.8}));this.root.add(this.beam);this.beam.castShadow=true;
  }
  if(object.id==='calendar'){
   const points=[];for(let i=0;i<=80;i++){const t=i/80*Math.PI*2;points.push(-.03+.037*Math.cos(t),-.04+.037*Math.sin(t),.025);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));this.trace=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x8c6750,transparent:true,opacity:.85}));this.root.add(this.trace);
  }
  if(object.id==='letter'){
   for(const c of this.copies)c.visible=false;
   const g=new THREE.PlaneGeometry(.35,.28,24,20);g.rotateX(-Math.PI/2);this.page=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:world.storyWorld.paperTexture||null,color:world.storyWorld.paperTexture?0xffffff:0xb5aa88,roughness:1,side:THREE.DoubleSide}));this.root.add(this.page);
   this.pagePositions=g.attributes.position.array.slice();
  }
  this.light=new THREE.PointLight(0xffdfaa,.65,2.3,2);this.light.position.copy(this.origin).add(new THREE.Vector3(.1,.5,0));world.scene.add(this.light);
  if(object.id==='cups'&&(world.state?.day||1)<4){
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const c=canvas.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,31);g.addColorStop(0,'rgba(225,224,211,.4)');g.addColorStop(1,'rgba(225,224,211,0)');c.fillStyle=g;c.fillRect(0,0,64,64);this.steamTexture=new THREE.CanvasTexture(canvas);this.steam=[];
   for(let i=0;i<7;i++){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:this.steamTexture,transparent:true,opacity:.08,depthWrite:false}));sprite.scale.set(.065,.08,.065);this.root.add(sprite);this.steam.push(sprite);}
  }
  this.update(0);
 }
 update(p,action=null){
  if(action?.id!==this.actionId){this.actionId=action?.id;this.actionOrigin=this.root.position.clone();}
  const id=this.object.id;this.root.position.copy(this.origin);this.root.rotation.set(0,0,0);this.root.scale.set(1,1,1);
  if(id==='cups'){if(action?.position){const goal=new THREE.Vector3(...action.position);if(action.gesture==='place'&&goal.y<1)goal.y+=.075;this.root.position.lerpVectors(this.actionOrigin||this.origin,goal,p);}this.root.position.y+=Math.sin(p*Math.PI)*.10;this.root.rotation.y=p*.72;}
  if(id==='leash'){this.root.position.y+=Math.sin(p*Math.PI)*.07;this.root.rotation.z=Math.sin(p*Math.PI)*.1;}
  if(id==='pillow'&&(!action||action.gesture==='smooth')){this.root.scale.y=1-Math.sin(p*Math.PI)*.13;}
  if(id==='clothes'){this.root.position.x+=p*.07;this.root.position.z+=p*.055;this.root.rotation.z=-Math.sin(p*Math.PI)*.035;}
  if(this.beam){
   if(action?.gesture==='release'){this.beam.position.set(.015,.28-p*p*.35,.02);this.beam.rotation.z=p*.29;}
   else if(action?.gesture==='brace'||/photograph|request/.test(action?.id||'')){this.beam.position.set(.015,.24+p*.04,.02);this.beam.rotation.z=(1-p)*.04;}
   else{this.beam.position.set(.015,-.08+p*.36,.02);this.beam.rotation.z=(1-p)*.58;}
  }
  if(this.trace)this.trace.geometry.setDrawRange(0,Math.floor(p*80)+1);
  if(this.page){const a=this.page.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=this.pagePositions[i*3],z=this.pagePositions[i*3+2];const u=(x+.175)/.35;a.setXYZ(i,x,Math.sin(u*Math.PI)*.065*(1-p)+.003,z);}a.needsUpdate=true;this.page.geometry.computeVertexNormals();}
  if(id==='bowl'&&action?.gesture==='place'){this.root.position.lerpVectors(this.actionOrigin||this.origin,new THREE.Vector3(...action.position),p);this.root.position.y+=Math.sin(p*Math.PI)*.075;}
  this.world.storyWorld.animate(this.object,p,action);
  if(this.steam)for(const [i,sprite]of this.steam.entries()){const rise=(this.world.clock*.045+i*.028)% .21;sprite.position.set(Math.sin(this.world.clock*.6+i)*.014,.05+rise,.015);sprite.material.opacity=Math.sin(rise/.21*Math.PI)*.09;}
 }
 dispose(){for(const [o,visible]of this.sources)o.visible=visible;this.world.scene.remove(this.root,this.light);for(const o of [this.beam,this.trace,this.page])if(o){o.geometry.dispose();o.material.dispose();}this.steam?.forEach(s=>s.material.dispose());this.steamTexture?.dispose();}
}
