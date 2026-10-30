import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {MemorySequence} from '../src/sequence.js';
function fixture(actions){const camera=new THREE.PerspectiveCamera();camera.position.set(0,1.6,1);camera.lookAt(0,1.2,0);const events=[];const world={visibleTo:()=>true,memoryAction(){}};const sequence=new MemorySequence({id:'model',position:[0,1.2,0],memory:{}},{actions,readingGap:0,beats:[{at:.25,line:'First'},{at:.8,line:'Last'}]},{world,camera,onAction:(a,n,done)=>events.push({n,done}),onDone:()=>events.push('done'),onBeat:line=>events.push(line)});return {sequence,camera,events};}
function run(sequence,holding,seconds){for(let t=0;t<seconds;t+=.02)sequence.update(.02,holding);}
test('separate actions require a new touch and fire their beats once',()=>{const {sequence,events}=fixture([{duration:.5},{duration:.5}]);run(sequence,false,.04);run(sequence,true,1);assert.equal(sequence.index,1);run(sequence,true,3);assert.equal(sequence.index,1);run(sequence,false,.1);run(sequence,true,1);assert.equal(sequence.finished,true);assert.equal(events.filter(v=>v==='First').length,1);assert.equal(events.at(-1),'done');});
test('a distant hand cannot advance a memory',()=>{const {sequence,camera}=fixture([{duration:.5}]);run(sequence,false,.04);camera.position.set(10,1.6,1);run(sequence,true,2);assert.equal(sequence.progress,0);});
test('letting go requires first choosing to hold the object',()=>{const {sequence}=fixture([{duration:.5,gesture:'release'}]);run(sequence,false,2);assert.equal(sequence.progress,0);run(sequence,true,.1);run(sequence,false,1);assert.equal(sequence.finished,true);});
