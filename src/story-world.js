import * as THREE from 'three';

export class StoryWorld {
 constructor(scene){
  this.scene=scene;this.group=new THREE.Group();this.group.name='Mara | the other end';scene.add(this.group);
  const iron=new THREE.MeshStandardMaterial({color:0x4c5149,roughness:.6,metalness:.65});
  const wood=new THREE.MeshStandardMaterial({color:0x70593f,roughness:.8});
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.04,.07,0),new THREE.Vector3(-.09,.06,0),new THREE.Vector3(-.095,-.06,0),new THREE.Vector3(-.035,-.075,0)]);
  const clamp=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.009,8,false),iron);this.group.add(clamp);
  const screw=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.115,12),iron);screw.position.set(-.025,-.017,0);this.group.add(screw);
  const pad=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.01,16),iron);pad.position.set(-.025,.034,0);this.group.add(pad);
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.07,16),wood);handle.rotation.z=Math.PI/2;handle.position.set(-.025,-.079,0);this.group.add(handle);
  const thread=[];for(let i=0;i<150;i++){const a=i/149*Math.PI*20;thread.push(new THREE.Vector3(-.025+.006*Math.cos(a),-.064+i/149*.088,.006*Math.sin(a)));}
  this.group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(thread),150,.001,4,false),iron));
  this.group.position.set(-4.7,1.15,-2.8);this.group.rotation.z=.12;this.group.visible=false;
  this.group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  const geo=new THREE.PlaneGeometry(.055,.09,1,1);this.note=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xb7aa8a,roughness:1,side:THREE.DoubleSide}));this.note.rotation.x=-Math.PI/2;this.note.position.set(-4.32,.83,-4.57);scene.add(this.note);this.note.visible=false;
  this.door=new THREE.Group();this.door.position.set(-4.9,.87,-2.55);scene.add(this.door);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(.16,.22,.012),wood);panel.position.set(.08,.11,0);this.door.add(panel);
  for(const x of [.012,.148]){const stile=new THREE.Mesh(new THREE.BoxGeometry(.014,.21,.008),wood);stile.position.set(x,.11,.009);this.door.add(stile);}
  for(const y of [.012,.11,.208]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.145,.013,.008),wood);rail.position.set(.08,y,.009);this.door.add(rail);}
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.006,12,8),iron);knob.position.set(.13,.11,.018);this.door.add(knob);
  this.support=new THREE.Mesh(new THREE.ConeGeometry(.025,.045,3,1,true),new THREE.MeshStandardMaterial({color:0xb7aa8a,roughness:1,side:THREE.DoubleSide}));this.support.position.set(-4.78,.88,-2.8);scene.add(this.support);this.support.visible=false;
  this.case=new THREE.Group();const cotton=new THREE.MeshStandardMaterial({color:0xc3bdaa,roughness:.98,side:THREE.DoubleSide});
  for(let layer=0;layer<3;layer++){const cloth=new THREE.PlaneGeometry(.31,.23,20,16);cloth.rotateX(-Math.PI/2);const p=cloth.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.sin(p.getX(i)*37+p.getZ(i)*13)*.0015+layer*.005);cloth.computeVertexNormals();this.case.add(new THREE.Mesh(cloth,cotton));}
  this.case.position.set(3.35,.85,2.7);scene.add(this.case);this.case.visible=false;
  const ceramic=new THREE.MeshStandardMaterial({color:0xada997,roughness:.36});
  const profile=[[0,0],[.049,0],[.055,.01],[.061,.11],[.057,.117],[.050,.11],[.047,.018],[0,.018]].map(a=>new THREE.Vector2(...a));
  this.spareCup=new THREE.Group();this.spareCup.add(new THREE.Mesh(new THREE.LatheGeometry(profile,48),ceramic));
  const loop=new THREE.CatmullRomCurve3([new THREE.Vector3(.055,.09,0),new THREE.Vector3(.095,.095,0),new THREE.Vector3(.098,.045,0),new THREE.Vector3(.055,.036,0)]);this.spareCup.add(new THREE.Mesh(new THREE.TubeGeometry(loop,24,.007,8,false),ceramic));this.spareCup.position.set(-3.10,.853,2.5);scene.add(this.spareCup);this.spareCup.visible=false;
  this.makeBag();this.shadow=this.makeShadow();
 }
 bind(world){this.world=world;this.realDoor=new THREE.Group();this.realDoor.position.set(.8,0,-6.03);this.scene.add(this.realDoor);for(const o of world.find(['Back door']))if(o.isMesh&&!o.userData.batched)this.realDoor.attach(o);}
 async prepareInk(){
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=800;const c=canvas.getContext('2d');c.fillStyle='#c9c1a5';c.fillRect(0,0,1024,800);
  let seed=17;for(let i=0;i<6500;i++){seed=(seed*16807)%2147483647;const x=seed%1024;seed=(seed*16807)%2147483647;const y=seed%800;c.fillStyle=i%2?'rgba(68,61,43,.025)':'rgba(246,241,221,.06)';c.fillRect(x,y,2,1);}
  c.strokeStyle='#6e7163';c.lineWidth=2;c.beginPath();c.moveTo(570,345);c.lineTo(755,190);c.lineTo(940,345);c.moveTo(610,313);c.lineTo(610,540);c.lineTo(900,540);c.lineTo(900,313);c.moveTo(735,540);c.lineTo(735,415);c.lineTo(805,410);c.lineTo(805,540);c.stroke();
  c.fillStyle='#474f46';c.font='400 42px HouseInk';const lines=['Roof section','Front beam — 47 mm','Pin holes, 2 mm','Ask about the hinge','Milk','Lamp bulb','Little brass pins'];for(let i=0;i<lines.length;i++)c.fillText(lines[i],74,100+i*79);
  c.strokeStyle='rgba(85,82,61,.16)';c.lineWidth=4;c.beginPath();c.moveTo(507,0);c.lineTo(514,800);c.stroke();
  this.paperTexture=new THREE.CanvasTexture(canvas);this.paperTexture.colorSpace=THREE.SRGBColorSpace;this.paperTexture.anisotropy=4;
  const material=new THREE.MeshStandardMaterial({map:this.paperTexture,color:0xffffff,roughness:.97,side:THREE.DoubleSide});
  for(const o of this.world.find(['Unfinished letters'])){
   o.material=material;
   // Map the complete sheet rather than inheriting joinery's tiled world UVs.
   // This also makes the same pencil marks readable when the sheet is lifted.
   o.geometry=o.geometry.clone();const positions=o.geometry.attributes.position,points=[];let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity;
   for(let i=0;i<positions.count;i++){const p=new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld);points.push(p);x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);z0=Math.min(z0,p.z);z1=Math.max(z1,p.z);}
   const uv=new Float32Array(positions.count*2);for(let i=0;i<points.length;i++){uv[i*2]=(points[i].x-x0)/Math.max(.001,x1-x0);uv[i*2+1]=(points[i].z-z0)/Math.max(.001,z1-z0);}o.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  }
  for(const o of this.world.find(['Letter | handwritten'])){o.visible=false;o.userData.replacedInk=true;}
 }
 makeBag(){
  this.bag=new THREE.Group();const vs=[],faces=[],nu=48,nv=18;
  for(let j=0;j<=nv;j++){const v=j/nv;for(let i=0;i<nu;i++){const a=i/nu*Math.PI*2,wrinkle=.0025*Math.sin(a*9+v*17);vs.push(Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.55*(.16+wrinkle)*(.88+.12*Math.sin(v*Math.PI)),v*.36,Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.6*(.075+wrinkle));}}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*nu+i,b=j*nu+(i+1)%nu;faces.push(a,b,b+nu,a,b+nu,a+nu);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));g.setIndex(faces);g.computeVertexNormals();const canvas=new THREE.MeshStandardMaterial({color:0x8d927d,roughness:.97,side:THREE.DoubleSide});this.bag.add(new THREE.Mesh(g,canvas));
  for(const z of [-.066,.066]){const c=new THREE.CubicBezierCurve3(new THREE.Vector3(-.105,.35,z),new THREE.Vector3(-.10,.66,z),new THREE.Vector3(.10,.66,z),new THREE.Vector3(.105,.35,z));this.bag.add(new THREE.Mesh(new THREE.TubeGeometry(c,40,.009,8,false),canvas));}
  this.bag.position.set(.54,0,-7.75);this.bag.visible=false;this.scene.add(this.bag);
 }
 makeShadow(){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d');c.filter='blur(7px)';c.fillStyle='rgba(15,19,15,.36)';c.beginPath();c.ellipse(64,32,18,25,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(64,109,30,69,0,0,Math.PI*2);c.fill();for(const x of [44,83]){c.beginPath();c.ellipse(x,201,12,47,0,0,Math.PI*2);c.fill();}const tex=new THREE.CanvasTexture(canvas);const o=new THREE.Mesh(new THREE.PlaneGeometry(.68,2),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:.42}));o.rotation.x=-Math.PI/2;o.position.set(.5,.008,-7.65);o.visible=false;this.scene.add(o);return o;}
 animate(object,p,action){if(!action)return;if(object.id==='model'&&action.gesture==='door')this.door.rotation.y=-p*.65;if(object.id==='pillow'&&/case/.test(action.id))this.case.rotation.z=Math.sin(p*Math.PI)*.025;if(object.id==='bowl'&&action.gesture==='door'&&this.realDoor)this.realDoor.rotation.y=-p*.10;}
 update(dt,state,memory){
  const arrived=Boolean(state.sceneProgress?.['7:bowl']?.completed);
  const modelPutAway=['release','carry'].includes(state.decisions?.model?.choice);
  this.door.visible=!modelPutAway||Boolean(state.sceneProgress?.['6:model']?.action>=1)||Boolean(memory&&this.world?.gesture?.object.id==='model');
  this.group.visible=arrived;this.note.visible=state.day>=6;this.support.visible=Boolean(state.sceneProgress?.['6:model']?.action>=1);this.case.visible=state.day>=2;this.spareCup.visible=Boolean(state.sceneProgress?.['6:cups']?.completed);this.bag.visible=arrived;this.shadow.visible=arrived;
  if(!memory){this.door.rotation.y=state.sceneProgress?.['4:model']?.action>=1?-.65:0;if(this.realDoor)this.realDoor.rotation.y=arrived?-.10:0;}
  // The relief is a tiny practical thing on a workbench, not a celebration effect.
  if(this.group.visible&&!this.wasVisible){this.scene.userData.shadowDirty=true;this.wasVisible=true;}
  if(!this.group.visible)this.wasVisible=false;
 }
}
