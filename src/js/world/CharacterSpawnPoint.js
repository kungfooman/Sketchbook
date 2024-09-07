/** @typedef {import('./World').World} World */
import * as THREE from 'three';
import { Character } from '../characters/Character';
import * as Utils from '../core/FunctionLibrary';
export class CharacterSpawnPoint {
    /**
     * @private
     */
    object;
    /**
     * @param {THREE.Object3D} object
     */
    constructor(object) {
        this.object = object;
    }
    /**
     * @public
     * @param {LoadingManager} loadingManager
     * @param {World} world
     * @returns {void}
     */
    spawn(loadingManager, world) {
        loadingManager.loadGLTF('build/assets/boxman.glb', (model) => {
            let player = new Character(model);
            let worldPos = new THREE.Vector3();
            this.object.getWorldPosition(worldPos);
            player.setPosition(worldPos.x, worldPos.y, worldPos.z);
            let forward = Utils.getForward(this.object);
            player.setOrientation(forward, true);
            world.add(player);
            player.takeControl();
        });
    }
}
