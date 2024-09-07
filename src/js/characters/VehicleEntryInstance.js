/** @typedef {import('../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
/** @typedef {import('./Character').Character} Character */
import * as THREE from 'three';
export class VehicleEntryInstance {
    /**
     * @public
     */
    character;
    /**
     * @public
     */
    targetSeat;
    /**
     * @public
     */
    entryPoint;
    /**
     * @public
     * @default false
     */
    wantsToDrive = false;
    /**
     * @param {Character} character
     */
    constructor(character) {
        this.character = character;
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        let entryPointWorldPos = new THREE.Vector3();
        this.entryPoint.getWorldPosition(entryPointWorldPos);
        let viewVector = new THREE.Vector3().subVectors(entryPointWorldPos, this.character.position);
        this.character.setOrientation(viewVector);
        let heightDifference = viewVector.y;
        viewVector.y = 0;
        if (this.character.charState.canEnterVehicles && viewVector.length() < 0.2 && heightDifference < 2) {
            this.character.enterVehicle(this.targetSeat, this.entryPoint);
        }
    }
}
