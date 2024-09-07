/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('../../../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
import { CharacterStateBase, } from '../_stateLibrary';
import { Side } from '../../../enums/Side';
import { Idle } from '../Idle';
import * as Utils from '../../../core/FunctionLibrary';
/** @extends CharacterStateBase */
export class CloseVehicleDoorOutside extends CharacterStateBase {
    /**
     * @private
     */
    seat;
    /**
     * @private
     * @default false
     */
    hasClosedDoor = false;
    /**
     * @param {Character} character
     * @param {VehicleSeat} seat
     */
    constructor(character, seat) {
        super(character);
        this.seat = seat;
        this.canFindVehiclesToEnter = false;
        const side = Utils.detectRelativeSide(seat.seatPointObject, seat.door.doorObject);
        if (side === Side.Left) {
            this.playAnimation('close_door_standing_right', 0.1);
        }
        else if (side === Side.Right) {
            this.playAnimation('close_door_standing_left', 0.1);
        }
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        if (this.timer > 0.3 && !this.hasClosedDoor) {
            this.hasClosedDoor = true;
            this.seat.door.close();
        }
        if (this.animationEnded(timeStep)) {
            this.character.setState(new Idle(this.character));
            this.character.leaveSeat();
        }
    }
}
