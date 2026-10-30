import * as THREE from 'three';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';

// Reflections use a photographed sky; the visible landscape stays fully 3D.
export async function lightEnvironment(renderer,scene){
 const hdr=await new HDRLoader().loadAsync('/environment/house_afternoon.hdr');
 const pmrem=new THREE.PMREMGenerator(renderer);pmrem.compileEquirectangularShader();
 const target=pmrem.fromEquirectangular(hdr);scene.environment=target.texture;scene.environmentIntensity=.55;
 hdr.dispose();pmrem.dispose();return target;
}
