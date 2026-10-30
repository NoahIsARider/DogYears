import * as THREE from 'three';

export const BLOCKS=[];
function block(x0,x1,z0,z1){BLOCKS.push([x0,x1,z0,z1]);}
for(const x of [-1,1])for(const [a,b]of [[-6,-4.15],[-2.85,2],[3.3,6]])block(x-.08,x+.08,-b,-a);
block(-5.5,-1,-.08,.08);block(1,5.5,-1.48,-1.32);
block(-5.3,-1.35,5.1,5.98);block(-4,-2.2,2,3);block(2.3,4.4,2.3,4.9);block(3.65,5.35,.2,1.05);
block(-4.85,-2.25,-5.2,-4.2);block(-5.25,-4.35,-3.6,-2);block(.26,.88,4.6,5.8);
block(2.1,4.3,-3.85,-2.6);block(2.65,3.75,-5.05,-4.35);
// The console is on the right of the entrance; the left-hand shoes are shallow.
block(-.83,-.3,4.98,5.6);block(-5.48,-4.62,-1.08,-.45);block(-2.06,-1.24,-1.08,-.45);
block(-3.40,-2.85,1.45,1.94);block(-3.65,-3.08,3.12,3.65);block(-3.86,-3.25,-4.05,-3.50);
// The inherited hutch and bedside chests use the final furniture footprints.
block(-4.87,-2.89,.15,.79);block(1.485,2.015,3.99,4.51);block(4.585,5.115,3.99,4.51);
export function canWalk(x,z){
 const r=.19;
 if(z>5.84||z< -16.2)return false;
 if(z< -6.2){if(Math.abs(x)>4.6)return false;}else if(Math.abs(x)>5.30)return false;
 if(Math.abs(z+6.1)<r+.1&&Math.abs(x)>.43)return false;
 if(z< -6.1&&z> -8.1&&Math.abs(x)>1.9)return false;
 if(x>.58&&x<.99&&z< -6.0&&z> -7.3)return false;
 return !BLOCKS.some(b=>x>b[0]-r&&x<b[1]+r&&z>b[2]-r&&z<b[3]+r);
}
export function roomAt(p){if(p.z< -6)return 'porch';if(Math.abs(p.x)<1.12)return 'entry';if(p.x<0)return p.z>0?'kitchen':'study';return p.z> -1.4?'bedroom':'nook';}

export class HouseControls{
 constructor(camera,canvas,settings){
  this.camera=camera;this.canvas=canvas;this.settings=settings;this.keys={};this.velocity=new THREE.Vector2();this.enabled=false;this.moving=false;this.yaw=0;this.pitch=0;this.targetYaw=0;this.targetPitch=0;this.dragging=false;this.elapsed=0;
  camera.rotation.order='YXZ';camera.position.set(0,1.65,5.35);
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||!this.enabled)return;this.targetYaw-=e.movementX*.00125*settings.sensitivity;this.targetPitch=THREE.MathUtils.clamp(this.targetPitch-e.movementY*.00125*settings.sensitivity,-1.3,1.3);});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;this.keys[e.code]=true;if(['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
  document.addEventListener('keyup',e=>this.keys[e.code]=false);
  window.addEventListener('blur',()=>this.reset());
 }
 reset(){this.keys={};this.velocity.set(0,0);this.moving=false;}
 lookAt(target){this.camera.lookAt(...target);this.targetYaw=this.yaw=this.camera.rotation.y;this.targetPitch=this.pitch=this.camera.rotation.x;}
 async lock(){try{await this.canvas.requestPointerLock();return document.pointerLockElement===this.canvas;}catch{return false;}}
 update(dt){
  if(!this.enabled||document.pointerLockElement!==this.canvas){this.velocity.set(0,0);this.moving=false;return;}
  const k=this.keys;const forward=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0);const side=(k.KeyD?1:0)-(k.KeyA?1:0);
  if(k.ArrowLeft)this.targetYaw+=dt*.7;if(k.ArrowRight)this.targetYaw-=dt*.7;
  const s=this.settings.smoothing?1-Math.exp(-dt*28):1;
  const turn=this.targetYaw-this.yaw;this.yaw+=Math.atan2(Math.sin(turn),Math.cos(turn))*s;this.pitch+=(this.targetPitch-this.pitch)*s;
  const desired=new THREE.Vector2(side,forward);if(desired.lengthSq()>1)desired.normalize();desired.multiplyScalar((k.ShiftLeft||k.ShiftRight)?.66:1.25);
  this.velocity.lerp(desired,1-Math.exp(-dt*(desired.lengthSq()?9:14)));
  const dx=(Math.cos(this.yaw)*this.velocity.x-Math.sin(this.yaw)*this.velocity.y)*dt;
  const dz=(-Math.sin(this.yaw)*this.velocity.x-Math.cos(this.yaw)*this.velocity.y)*dt;
  const p=this.camera.position,oldX=p.x,oldZ=p.z;
  // Small substeps prevent tunnelling at door frames and allow natural wall sliding.
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.04));
  for(let i=0;i<steps;i++){if(canWalk(p.x+dx/steps,p.z))p.x+=dx/steps;if(canWalk(p.x,p.z+dz/steps))p.z+=dz/steps;}
  this.moving=Math.hypot(p.x-oldX,p.z-oldZ)>.0003;
  const porch=p.z< -8.1?-.20:0;p.y=THREE.MathUtils.damp(p.y,1.65+porch,10,dt);
  this.elapsed+=dt;
  if(this.settings.headMotion&&this.moving)p.y+=Math.sin(this.elapsed*7)*.0025;
  this.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');
 }
}
