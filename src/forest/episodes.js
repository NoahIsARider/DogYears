import {sceneAt,clamp,walkFrame,FLOOR,worldToScreen} from './timeline.js';
export const EPISODES=[
 {id:1,title:'The trail',duration:94,background:'long',oak:true,tracks:1002,mid:[[205,0],[456,1],[1044,0],[1330,2]],front:[[-80,2],[430,0],[1145,1],[1560,0]],plants:[[86,3],[337,4],[492,5],[910,4],[1070,3],[1285,4],[1490,5]],fog:1,rain:1,cues:[]},
 {id:2,title:'The second place',duration:72,background:'mist',shelter:true,mid:[[110,1],[910,0],[1390,2]],front:[[-80,0],[1150,1]],plants:[[240,4],[850,3],[1250,5]],fog:1.08,rain:.7,cues:[[27,'cup'],[39,'cup']]},
 {id:3,title:'An answer made of air',duration:68,background:'mist',tracks:690,mid:[[120,0],[450,1],[1120,2]],front:[[-75,2],[1030,0]],plants:[[180,4],[870,5],[1320,4]],fog:1.55,rain:.8,cues:[[39,'distant-rustle']]},
 {id:4,title:'The same mark',duration:68,background:'long',oak:true,tracks:650,mid:[[205,0],[456,1],[1044,0]],front:[[-80,2],[1145,1]],plants:[[337,4],[910,4],[1285,4]],fog:1.4,rain:1.1,cues:[[45,'cloth']]},
 {id:5,title:'Hold this end',duration:78,background:'mist',shelter:true,board:true,mid:[[95,1],[1020,0],[1380,2]],front:[[-60,0],[1290,1]],plants:[[270,4],[1090,3]],fog:1.25,rain:1.7,grade:[.84,.88,.94],cues:[[38,'plank'],[52,'plank']]},
 {id:6,title:'One small thing',duration:76,background:'evening',shelter:true,board:true,mid:[[95,1],[1020,0],[1380,2]],front:[[-60,0],[1290,1]],plants:[[270,4],[1090,3]],fog:.9,rain:.55,cues:[[8,'cloth'],[20,'cloth'],[54,'cup']]},
 {id:7,title:'The other side',duration:78,background:'evening',gate:true,mid:[[205,0],[600,1],[1450,0]],front:[[-75,2],[1500,1]],plants:[[330,4],[710,5],[1410,4]],fog:.8,rain:.25,cues:[[43,'gate'],[50,'other-steps']]},
];
const mix=(a,b,p)=>a+(b-a)*clamp(p,0,1);
// Timed segments keep pose changes discrete; only world movement interpolates.
const walk=(a,b,x0,x1,facing=1)=>({a,b,x0,x1,pose:'walk',facing});
const act=(a,b,x,pose,frames)=>({a,b,x0:x,x1:x,pose,frames});
const scripts={
 2:[act(0,4,120,'idle',[8,9,10,11]),walk(4,24,120,560),act(24,27,560,'reach',[12,13,14,15]),act(27,30,560,'release',[15,14,13,36]),act(30,32,560,'prepare-cup',[36,37]),act(32,36,560,'drink',[38]),act(36,39,560,'lower-cup',[37,36,13,14,15]),act(39,42,560,'release',[15,14,13,12]),act(42,47,560,'turn',[16,17,18,19]),act(47,54,560,'wait',[19]),act(54,56,560,'return',[20,21,22,23]),walk(56,69,560,860),act(69,72,860,'idle',[8,9])],
 3:[act(0,3,120,'idle',[8]),walk(3,26,120,650),act(26,28,650,'idle',[8]),act(28,31,650,'prepare-call',[36,37]),act(31,33,650,'call',[38]),act(33,35,650,'lower-hand',[39]),act(35,37,650,'turn',[16,17,18,19]),act(37,43,650,'wait',[19]),act(43,45,650,'return',[20,21,22,23]),walk(45,52,650,510,-1),{...act(52,55,510,'turn',[16,17,18,19]),facing:-1},{...act(55,60,510,'wait',[19]),facing:-1},walk(60,68,510,700)],
 4:[act(0,3,120,'idle',[8]),walk(3,25,120,622),act(25,29,622,'kneel',[24,25,26,27]),act(29,33,622,'study',[28,29,30,31]),act(33,37,622,'rise',[32,33,34,35]),act(37,40,622,'turn',[16,17,18,19]),act(40,44,622,'wait',[19]),act(44,46,622,'reach',[12,13,14,15]),act(46,49,622,'release',[15,14,13,12]),walk(49,65,622,990),act(65,68,990,'idle',[8,9])],
 5:[act(0,3,120,'idle',[8]),walk(3,28,120,723),act(28,32,723,'reach',[12,13,14,15]),act(32,37,723,'hold',[15]),act(37,40,723,'release',[15,14,13,12]),act(40,44,723,'wait',[8]),act(44,47,723,'reach',[12,13,14,15]),act(47,51,723,'hold',[15]),act(51,54,723,'release',[15,14,13,12]),act(54,58,723,'kneel',[24,25,26,27]),act(58,61,723,'study',[28,29,30,31]),act(61,68,723,'still',[31]),act(68,72,723,'rise',[32,33,34,35]),act(72,78,723,'idle',[8,9])],
 6:[act(0,3,723,'idle',[8]),act(3,7,723,'kneel',[24,25,26,27]),act(7,11,723,'study',[28,29,30,31]),act(11,15,723,'rise',[32,33,34,35]),act(15,19,723,'reach',[12,13,14,15]),act(19,23,723,'hold',[14,15,14,15]),act(23,26,723,'release',[15,14,13,12]),act(26,30,723,'idle',[8]),walk(30,35,723,620,-1),{...act(35,38,620,'turn',[16,17,18,19]),facing:-1},{...act(38,44,620,'wait',[19]),facing:-1},act(44,46,620,'return',[20,21,22,23]),walk(46,48,620,598,-1),act(48,51,598,'idle',[8]),act(51,54,598,'reach',[12,13,14,15]),act(54,57,598,'release',[15,14,13,12]),act(57,62,598,'idle',[8,9]),walk(62,76,598,920)],
 7:[act(0,4,120,'idle',[8]),walk(4,36,120,856),walk(36,39,856,895),act(39,42,895,'reach',[12,13,14,15]),act(42,51,895,'hold',[15]),act(51,54,895,'release',[15,14,13,12]),act(54,56,895,'turn',[16,17,18,19]),act(56,59,895,'wait',[19]),act(59,61,895,'return',[20,21,22,23]),walk(61,70,895,1140),act(70,78,1140,'gaze',[8])],
};
export function episodeState(id,time,{ending='keys'}={}){
 const ep=EPISODES[id-1]||EPISODES[0],t=clamp(time,0,ep.duration);let state;
 if(ep.id===1)state=sceneAt(t);
 else{const segments=scripts[ep.id],s=segments.find(s=>t>=s.a&&t<s.b)||segments.at(-1),p=clamp((t-s.a)/(s.b-s.a),0,1),x=mix(s.x0,s.x1,p);let distance=0;for(const step of segments){if(step.a>=t)break;if(step.pose==='walk')distance+=Math.abs(step.x1-step.x0)*clamp((t-step.a)/(step.b-step.a),0,1);}const moving=s.pose==='walk'&&t<ep.duration,frame=moving?walkFrame(distance):s.frames?.[Math.min(s.frames.length-1,Math.floor(p*s.frames.length))]??8;state={x,y:FLOOR,pose:s.pose,frame,moving,branch:0,facing:s.facing||1};}
 const result={...state,episode:ep.id,time:t,ended:t>=ep.duration,ending};
 if(ep.id===7){result.cameraTarget=t<39?null:t<61?750:Math.max(750,result.x-190);result.deerFrame=t<68?0:t<71?1:2;result.frozen=t>=72;}
 return result;
}
export function episodeProps(id,t,ending='keys'){
 const p={cupLift:null,secondCupUp:false,boardLift:0,tied:false,cordHeld:null,cloth:false,gateOpen:0};
 if(id===2&&t>=27&&t<39){let x=568,y=176;if(t<30){x=mix(584,568,(t-27)/3);y=t<28?mix(179,186,t-27):t<29?mix(186,189,t-28):mix(189,185,t-29);}else if(t<32)y=mix(185,176,(t-30)/2);else if(t>=36&&t<37)y=mix(176,185,t-36);else if(t>=37){x=mix(568,584,(t-37)/2);y=mix(185,179,(t-37)/2);}p.cupLift={x,y};}
 if(id===4)p.cloth=t>=45.5;
 if(id===5){if(t>=28&&t<37)p.boardLift=clamp((t-28)/4,0,1);else if(t>=37&&t<39)p.boardLift=1-clamp((t-37.3)/.7,0,1)**2;else if(t>=44&&t<51)p.boardLift=clamp((t-44)/3,0,1);else if(t>=51&&t<53)p.boardLift=1-clamp((t-51.3)/.7,0,1)**2;}
 if(id===6){p.tied=t>=20;p.boardLift=clamp((t-15)/4,0,1);p.secondCupUp=t>=54;if(t>=9&&t<20){p.cordHeld={x:t<15?735:mix(735,741,(t-15)/4),y:t<11?216:t<15?mix(216,185,(t-11)/4):mix(185,183,(t-15)/4)};}}
 if(id===7)p.gateOpen=clamp((t-42)/4,0,1);
 return p;
}
export function episodeDuration(id){return EPISODES[id-1]?.duration??94;}
export function episodeAnchors(id,camera){const e=EPISODES[id-1];return [...e.mid,...e.front,...e.plants,...(e.shelter?[[650,'shelter']]:[]),...(e.board?[[809,'waypost']]:[]),...(e.gate?[[960,'gate']]:[])].map(([x,kind])=>({kind,worldX:x,screenX:worldToScreen(x,camera)}));}
