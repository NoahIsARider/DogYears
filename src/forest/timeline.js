export const WIDTH=480,HEIGHT=270,FLOOR=216,DURATION=94,WORLD_WIDTH=1584;
export const START=120,BRANCH_STOP=622,INSPECT_STOP=970,LOOK_STOP=INSPECT_STOP,END=1250,SPEED=24,STRIDE=3;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mix=(a,b,p)=>a+(b-a)*clamp(p,0,1);
export const walkFrame=distance=>Math.floor(distance/STRIDE)%8;
// All rooted scenery uses this transform, including the distant painting's floor.
export const worldToScreen=(x,camera)=>Math.round(x)-Math.round(camera);
export function sceneAt(t){
 t=clamp(t,0,DURATION);
 let x=START,pose='idle',frame=8+Math.floor(t*.7)%4,moving=false,branch=0;
 if(t>=4&&t<24){x=mix(START,580,(t-4)/20);pose='walk';moving=true;}
 else if(t>=24&&t<27){const p=(t-24)/3;x=mix(580,BRANCH_STOP,1-(1-p)**2);pose='walk';moving=true;}
 else if(t>=27&&t<30){x=BRANCH_STOP;pose='reach';branch=(t-27)/3;frame=12+Math.min(3,Math.floor(branch*4));}
 else if(t>=30&&t<32.5){x=BRANCH_STOP;pose='hold';branch=1;frame=15;}
 else if(t>=32.5&&t<34){x=BRANCH_STOP;pose='release';branch=1-(t-32.5)/1.5;frame=15-Math.min(3,Math.floor((t-32.5)/1.5*4));}
 else if(t>=34&&t<48){x=mix(BRANCH_STOP,946,(t-34)/14);pose='walk';moving=true;}
 else if(t>=48&&t<50){const p=(t-48)/2;x=mix(946,INSPECT_STOP,1-(1-p)**2);pose='walk';moving=true;}
 else if(t>=50&&t<54){x=INSPECT_STOP;pose='kneel';frame=24+Math.min(3,Math.floor(t-50));}
 else if(t>=54&&t<58){x=INSPECT_STOP;pose='study';frame=28+Math.min(3,Math.floor(t-54));}
 else if(t>=58&&t<62){x=INSPECT_STOP;pose='rise';frame=32+Math.min(3,Math.floor(t-58));}
 else if(t>=62&&t<64){x=INSPECT_STOP;pose='prepare-call';frame=36+Math.min(1,Math.floor(t-62));}
 else if(t>=64&&t<65.5){x=INSPECT_STOP;pose='call';frame=38;}
 else if(t>=65.5&&t<67){x=INSPECT_STOP;pose='lower-hand';frame=39;}
 else if(t>=67&&t<69){x=INSPECT_STOP;pose='turn';frame=16+Math.min(3,Math.floor((t-67)*2));}
 else if(t>=69&&t<76){x=INSPECT_STOP;pose='wait';frame=19;}
 else if(t>=76&&t<78){x=INSPECT_STOP;pose='return';frame=20+Math.min(3,Math.floor((t-76)*2));}
 else if(t>=78&&t<90){x=mix(INSPECT_STOP,END,(t-78)/12);pose='walk';moving=true;}
 else if(t>=90){x=END;pose='idle';frame=8+Math.floor((t-90)*.7)%4;}
 if(moving)frame=walkFrame(x-START);
 return {x,y:FLOOR,pose,frame,moving,branch,facing:1,time:t,ended:t>=DURATION};
}
export class ForestClock{
 constructor(){this.time=0;this.playing=false;this.ended=false;}
 reset(){this.time=0;this.ended=false;this.playing=true;}
 tick(dt){if(this.playing&&!this.ended&&Number.isFinite(dt)&&dt>0){this.time=Math.min(DURATION,this.time+Math.min(dt,.05));this.ended=this.time>=DURATION;if(this.ended)this.playing=false;}return sceneAt(this.time);}
}
