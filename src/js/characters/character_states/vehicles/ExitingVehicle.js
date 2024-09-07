/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('../../../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
/** @typedef {import('src/ts/vehicles/Vehicle').Vehicle} Vehicle */
import * as THREE from 'three';
import * as Utils from '../../../core/FunctionLibrary';
import { Side } from '../../../enums/Side';
import { Idle } from '../Idle';
import { CloseVehicleDoorOutside } from './CloseVehicleDoorOutside';
import { Falling } from '../Falling';
import { DropRolling } from '../DropRolling';
import { ExitingStateBase } from './ExitingStateBase';
/** @extends ExitingStateBase */
export class ExitingVehicle extends ExitingStateBase {
    /**
     * @param {Character} character
     * @param {VehicleSeat} seat
     */
    constructor(character, seat) {
        super(character, seat);
        this.exitPoint = seat.entryPoints[0];
        this.endPosition.copy(this.exitPoint.position);
        this.endPosition.y += 0.52;
        const side = Utils.detectRelativeSide(seat.seatPointObject, this.exitPoint);
        if (side === Side.Left) {
            this.playAnimation('stand_up_left', 0.1);
        }
        else if (side === Side.Right) {
            this.playAnimation('stand_up_right', 0.1);
        }
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
            this.seat.door.physicsEnabled = true;
            if (!this.character.rayHasHit) {
                this.character.setState(new Falling(this.character));
                this.character.leaveSeat();
            }
            else if (this.vehicle.collision.velocity.length() > 1) {
                this.character.setState(new DropRolling(this.character));
                this.character.leaveSeat();
            }
            else if (this.anyDirection() || this.seat.door === undefined) {
                this.character.setState(new Idle(this.character));
                this.character.leaveSeat();
            }
            else {
                this.character.setState(new CloseVehicleDoorOutside(this.character, this.seat));
            }
        }
        else {
            // Door
            if (this.seat.door) {
                this.seat.door.physicsEnabled = false;
            }
            // Position
            let factor = this.timer / this.animationLength;
            let smoothFactor = Utils.easeInOutSine(factor);
            let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, smoothFactor);
            this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
            // Rotation
            this.updateEndRotation();
            THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, smoothFactor);
        }
    }
}
