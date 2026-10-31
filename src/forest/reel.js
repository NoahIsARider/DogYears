import {ForestFilm} from './player.js';
import {EPISODES} from './episodes.js';
import './reel.css';
const params=new URLSearchParams(location.search),menu=document.querySelector('#reel-menu'),select=document.querySelector('#episode'),film=new ForestFilm({host:document.querySelector('#reel')});let current=Math.max(1,Math.min(7,Number(params.get('chapter'))||2));
select.innerHTML=EPISODES.map(e=>`<option value="${e.id}">${e.id} · ${e.title}</option>`).join('');select.value=current;
async function watch(id){menu.hidden=true;current=id;select.value=id;await film.play(id,{ending:params.get('ending')||'keys'});if(params.get('reel')==='1'&&id<7)watch(id+1);else menu.hidden=false;}
document.querySelector('#again').onclick=()=>watch(current);document.querySelector('#watch').onclick=()=>watch(Number(select.value));document.addEventListener('keydown',e=>{if(e.code==='KeyR'&&!film.running)watch(current);});
film.load().then(()=>watch(current)).catch(e=>{menu.hidden=false;console.error(e);});window.forestReel={film,watch,get current(){return current;},get ready(){return !!film.renderer.sprites;}};
