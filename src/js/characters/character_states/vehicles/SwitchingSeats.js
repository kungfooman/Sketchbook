/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('../../../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
import * as THREE from 'three';
import { CharacterStateBase, } from '../_stateLibrary';
import { Side } from '../../../enums/Side';
import { SeatType } from '../../../enums/SeatType';
import { Driving } from './Driving';
import { Sitting } from './Sitting';
import * as Utils from '../../../core/FunctionLibrary';
import { Space } from '../../../enums/Space';
/** @extends CharacterStateBase */
export class SwitchingSeats extends CharacterStateBase {
    /**
     * @private
     */
    toSeat;
    /**
     * @private
     * @default any
     */
    startPosition = new THREE.Vector3();
    /**
     * @private
     * @default any
     */
    endPosition = new THREE.Vector3();
    /**
     * @private
     * @default any
     */
    startRotation = new THREE.Quaternion();
    /**
     * @private
     * @default any
     */
    endRotation = new THREE.Quaternion();
    /**
     * @param {Character} character
     * @param {VehicleSeat} fromSeat
     * @param {VehicleSeat} toSeat
     */
    constructor(character, fromSeat, toSeat) {
        super(character);
        this.toSeat = toSeat;
        this.canFindVehiclesToEnter = false;
        this.canLeaveVehicles = false;
        character.leaveSeat();
        this.character.occupySeat(toSeat);
        const right = Utils.getRight(fromSeat.seatPointObject, Space.Local);
        const viewVector = toSeat.seatPointObject.position.clone().sub(fromSeat.seatPointObject.position).normalize();
        const side = right.dot(viewVector) > 0 ? Side.Left : Side.Right;
        if (side === Side.Left) {
            this.playAnimation('sitting_shift_left', 0.1);
        }
        else if (side === Side.Right) {
            this.playAnimation('sitting_shift_right', 0.1);
        }
        this.startPosition.copy(fromSeat.seatPointObject.position);
        this.startPosition.y += 0.6;
        this.endPosition.copy(toSeat.seatPointObject.position);
        this.endPosition.y += 0.6;
        this.startRotation.copy(fromSeat.seatPointObject.quaternion);
        this.endRotation.copy(toSeat.seatPointObject.quaternion);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        if (this.animationEnded(timeStep)) {
            if (this.toSeat.type === SeatType.Driver) {
                this.character.setState(new Driving(this.character, this.toSeat));
            }
            else if (this.toSeat.type === SeatType.Passenger) {
                this.character.setState(new Sitting(this.character, this.toSeat));
            }
        }
        else {
            let factor = this.timer / this.animationLength;
            let sineFactor = Utils.easeInOutSine(factor);
            let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, sineFactor);
            this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
            THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, sineFactor);
        }
    }
}
