/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('../../../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
/** @typedef {import('../../../vehicles/Vehicle').Vehicle} Vehicle */
import * as THREE from 'three';
import * as Utils from '../../../core/FunctionLibrary';
import { Falling } from '../Falling';
import { ExitingStateBase } from './ExitingStateBase';
/** @extends ExitingStateBase */
export class ExitingAirplane extends ExitingStateBase {
    /**
     * @param {Character} character
     * @param {VehicleSeat} seat
     */
    constructor(character, seat) {
        super(character, seat);
        this.endPosition.copy(this.startPosition);
        this.endPosition.y += 1;
        const quat = Utils.threeQuat(seat.vehicle.collision.quaternion);
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
        this.exitPoint = new THREE.Object3D();
        this.exitPoint.lookAt(forward);
        this.exitPoint.position.copy(this.endPosition);
        this.playAnimation('jump_idle', 0.1);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        if (this.animationEnded(timeStep)) {
            this.detachCharacterFromVehicle();
            this.character.setState(new Falling(this.character));
            this.character.leaveSeat();
        }
        else {
            let beginningCutoff = 0.3;
            let factor = THREE.MathUtils.clamp(((this.timer / this.animationLength) - beginningCutoff) * (1 / (1 - beginningCutoff)), 0, 1);
            let smoothFactor = Utils.easeOutQuad(factor);
            let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, smoothFactor);
            this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
            // Rotation
            this.updateEndRotation();
            THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, smoothFactor);
        }
    }
}
