import * as THREE from 'three';

export class MemorySequence {
 constructor(object,script,{world,camera,onStage,onBeat,onAction,onDone,onCue}){
  this.object=object;this.script=script;this.world=world;this.camera=camera;
  this.actions=script.actions?.length?script.actions:[{label:object.memory.actionLabel,task:object.memory.task,duration:object.memory.duration,position:object.position}];
  this.onStage=onStage;this.onBeat=onBeat;this.onAction=onAction;this.onDone=onDone;this.onCue=onCue;
  this.index=0;this.progress=0;this.finished=false;this.actionsFinished=false;this.completedActions=0;this.beats=new Set();this.needsRelease=true;this.releaseArmed=false;this.gap=0;this.close=true;this.cued=false;this.elapsed=0;this.readUntil=script.readingGap===0?0:2;this.beatQueue=[];
  this.to=new THREE.Vector3();this.direction=new THREE.Vector3();onStage?.(this.current,0,this.actions.length);
 }
 get current(){return this.actions[Math.min(this.index,this.actions.length-1)];}
 get totalProgress(){return Math.min(1,(this.index+this.progress)/this.actions.length);}
 flushBeat(){if(!this.beatQueue.length||this.elapsed<this.readUntil)return;const line=this.beatQueue.shift();this.onBeat?.(line);this.readUntil=this.elapsed+(this.script.readingGap===0?0:Math.max(2.7,line.split(/\s+/).length*.23+.8));}
 update(dt,holding){
  if(this.finished)return;
  this.elapsed+=dt;
  if(this.actionsFinished){this.flushBeat();this.world.memoryAction(this.object,1,this.current);if(!this.beatQueue.length&&this.elapsed>=this.readUntil+(this.script.readingGap===0?0:.8)&&(this.current.gesture!=='door'||!holding)){this.finished=true;this.onDone?.();}return;}
  const action=this.current;this.to.fromArray(action.position||this.object.position).sub(this.camera.position);this.camera.getWorldDirection(this.direction);
  this.close=this.to.length()<2.65&&this.direction.dot(this.to.normalize())>.82&&this.world.visibleTo(action.position||this.object.position);
  if(!holding)this.needsRelease=false;
  if(this.gap>0){this.gap-=dt;return;}
  let acting=holding&&!this.needsRelease;
  if(action.gesture==='release'){
   if(holding&&!this.needsRelease)this.releaseArmed=true;
   acting=this.releaseArmed&&!holding;
  }
  if(acting&&this.close){const duration=action.gesture==='release'?Math.min(3,action.duration||3):action.duration||8;this.progress=Math.min(1,this.progress+dt/duration);}
  else this.progress=Math.max(0,this.progress-dt*.009);
  this.world.memoryAction(this.object,this.progress,action);
  if(action.gesture==='release'&&this.progress>.7&&!this.cued){this.cued=true;this.onCue?.(this.object.id==='model'?'beamfall':this.object.id==='leash'?'keyturn':'cloth');}
  const total=this.totalProgress;
  for(const [i,beat]of (this.script.beats||[]).entries())if(total>=beat.at&&!this.beats.has(i)){this.beats.add(i);this.beatQueue.push(beat.line);}
  this.flushBeat();
  if(this.progress>=1){
   this.completedActions=this.index+1;this.onAction?.(action,this.completedActions,this.completedActions===this.actions.length);
   this.index++;this.progress=0;this.needsRelease=true;this.releaseArmed=false;this.cued=false;
   if(this.index>=this.actions.length){this.actionsFinished=true;this.onStage?.({...action,gesture:'finish',task:'Let the room settle.',label:'R · Leave this moment'},this.index,this.actions.length);}
   else{this.gap=1.4;this.onStage?.(this.current,this.index,this.actions.length);}
  }
 }
}
