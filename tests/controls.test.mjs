import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {HouseControls,canWalk} from '../src/controls.js';
test('looking across the angle boundary takes the short turn rather than spinning',()=>{
 const canvas={};globalThis.document={addEventListener(){},pointerLockElement:canvas};globalThis.window={addEventListener(){}};
 const c=new HouseControls(new THREE.PerspectiveCamera(),canvas,{smoothing:true,sensitivity:1,headMotion:false});c.enabled=true;c.yaw=-Math.PI+.01;c.targetYaw=Math.PI-.01;c.camera.position.set(0,1.65,0);c.keys.KeyW=true;c.update(.016);
 assert(Math.abs(c.yaw+Math.PI)<.02);assert(c.camera.position.z>0,'Forward should stay in the direction the player sees');
});
test('the entrance console is on the right and the centre corridor remains passable',()=>{assert.equal(canWalk(0,5.2),true);assert.equal(canWalk(.55,5.2),false);assert.equal(canWalk(0,-6.1),true);});
