/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('../../../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
import { CharacterStateBase, } from '../_stateLibrary';
import { Side } from '../../../enums/Side';
import { Driving } from './Driving';
import { SeatType } from '../../../enums/SeatType';
import { Sitting } from './Sitting';
import * as Utils from '../../../core/FunctionLibrary';
/** @extends CharacterStateBase */
export class CloseVehicleDoorInside extends CharacterStateBase {
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
        this.canLeaveVehicles = false;
        const side = Utils.detectRelativeSide(seat.seatPointObject, seat.door.doorObject);
        if (side === Side.Left) {
            this.playAnimation('close_door_sitting_left', 0.1);
        }
        else if (side === Side.Right) {
            this.playAnimation('close_door_sitting_right', 0.1);
        }
        this.seat.door?.open();
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        if (this.timer > 0.4 && !this.hasClosedDoor) {
            this.hasClosedDoor = true;
            this.seat.door?.close();
        }
        if (this.animationEnded(timeStep)) {
            if (this.seat.type === SeatType.Driver) {
                this.character.setState(new Driving(this.character, this.seat));
            }
            else if (this.seat.type === SeatType.Passenger) {
                this.character.setState(new Sitting(this.character, this.seat));
            }
        }
    }
}
