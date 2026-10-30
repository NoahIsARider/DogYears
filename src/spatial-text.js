import * as THREE from 'three';

export class SpatialText {
 constructor(scene,camera){
  this.scene=scene;this.camera=camera;this.elapsed=0;this.cards=[];this.anchor=null;this.requests={};
  this.cue=new THREE.Group();scene.add(this.cue);this.cue.visible=false;
  const points=new THREE.EllipseCurve(0,0,.019,.019,0,Math.PI*2).getPoints(40).map(p=>new THREE.Vector3(p.x,p.y,0));
  this.ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xe6ddc5,transparent:true,opacity:.6}));this.cue.add(this.ring);
  this.dot=new THREE.Mesh(new THREE.CircleGeometry(.0035,12),new THREE.MeshBasicMaterial({color:0xf0e8d1,transparent:true,opacity:.6,depthWrite:false}));this.cue.add(this.dot);
 }
 setAnchor(position){this.anchor=position?new THREE.Vector3(...position):null;}
 async say(line,{kind='memory',duration=6.3,position=null}={}){
  if(!line)return;const token=(this.requests[kind]||0)+1;this.requests[kind]=token;
  await document.fonts.ready;await document.fonts.load('400 120px HouseInk').catch(()=>{});if(token!==this.requests[kind])return;
  const old=this.cards.find(c=>c.kind===kind&&!c.retiring);if(old){old.retiring=true;old.life=Math.min(old.life,.4);}
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=640;const c=canvas.getContext('2d');
  c.font=kind==='label'?'400 110px HouseInk':'400 120px HouseInk';c.fillStyle='#272a23';c.strokeStyle='rgba(227,218,193,.45)';c.lineWidth=2;c.lineJoin='round';c.textAlign='center';c.textBaseline='middle';c.shadowColor='rgba(224,215,190,.3)';c.shadowBlur=7;c.shadowOffsetY=0;
  const words=line.split(/\s+/),lines=[];let current='';
  for(const word of words){const next=current?current+' '+word:word;if(c.measureText(next).width>1830&&current){lines.push(current);current=word;}else current=next;}if(current)lines.push(current);
  for(let i=0;i<lines.length;i++){const y=320+(i-(lines.length-1)/2)*142;c.strokeText(lines[i],1024,y);c.fillText(lines[i],1024,y);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.generateMipmaps=false;
  const mat=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,depthTest:true,opacity:0,side:THREE.DoubleSide});
  const forward=new THREE.Vector3();this.camera.getWorldDirection(forward);const target=position?new THREE.Vector3(...position):this.anchor?.clone();let where,width;
  if(target){const distance=this.camera.position.distanceTo(target),toward=this.camera.position.clone().sub(target).normalize(),up=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion);where=target.clone().addScaledVector(toward,distance*.5).addScaledVector(up,Math.min(.27,distance*.18));width=Math.min(1.8,Math.max(.55,distance*.72));if(Math.abs(target.x)<1&&target.z> -6)width=Math.min(width,.75);width=Math.min(width,2*this.camera.position.distanceTo(where)*Math.tan(this.camera.fov*Math.PI/360)*this.camera.aspect*.68);}
  else{where=this.camera.position.clone().addScaledVector(forward,2.1);where.y-=.12;width=1.75;}
  if(kind==='label'){const distance=this.camera.position.distanceTo(target),up=new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion);where=target.clone().lerp(this.camera.position,.5).addScaledVector(up,-Math.min(.1,distance*.1));width=Math.min(.72,2*this.camera.position.distanceTo(where)*Math.tan(this.camera.fov*Math.PI/360)*this.camera.aspect*.46);}
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*640/2048),mat);mesh.position.copy(where);mesh.quaternion.copy(this.camera.quaternion);mesh.rotateZ(kind==='memory'?-.018:0);
  mesh.onBeforeRender=(renderer,scene,camera,geometry)=>geometry.setDrawRange(0,scene.overrideMaterial?0:Infinity);
  this.scene.add(mesh);
  this.cards.push({mesh,texture,kind,age:0,life:duration,retiring:false});
 }
 hide(kind){for(const k of kind?[kind]:Object.keys(this.requests))this.requests[k]=(this.requests[k]||0)+1;for(const card of this.cards)if(!kind||card.kind===kind){card.retiring=true;card.life=Math.min(.4,card.life);}}
 point(position,progress=0){this.cue.visible=Boolean(position);if(!position)return;this.cue.position.fromArray(position);this.cue.quaternion.copy(this.camera.quaternion);this.dot.scale.setScalar(1+progress*2);}
 update(dt){this.elapsed+=dt;for(let i=this.cards.length-1;i>=0;i--){const card=this.cards[i];card.age+=dt;card.life-=dt;card.mesh.material.opacity=Math.min(1,card.age,Math.max(0,card.life/.65))*(card.kind==='label'?.72:.9);if(card.life<=0){this.scene.remove(card.mesh);card.mesh.geometry.dispose();card.mesh.material.dispose();card.texture.dispose();this.cards.splice(i,1);}}this.ring.material.opacity=.38+Math.sin(this.elapsed*1.5)*.12;}
 clear(){this.hide();for(const c of this.cards){this.scene.remove(c.mesh);c.mesh.geometry.dispose();c.mesh.material.dispose();c.texture.dispose();}this.cards=[];this.cue.visible=false;this.anchor=null;}
}
