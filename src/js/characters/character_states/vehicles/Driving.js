/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('src/ts/vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
import { CharacterStateBase, } from '../_stateLibrary';
import { CloseVehicleDoorInside } from './CloseVehicleDoorInside';
/** @extends CharacterStateBase */
export class Driving extends CharacterStateBase {
    /**
     * @private
     */
    seat;
    /**
     * @param {Character} character
     * @param {VehicleSeat} seat
     */
    constructor(character, seat) {
        super(character);
        this.seat = seat;
        this.canFindVehiclesToEnter = false;
        this.playAnimation('driving', 0.1);
        this.character.startControllingVehicle(seat.vehicle, this.seat);
        this.seat.vehicle.onInputChange();
        this.character.vehicleEntryInstance = null;
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        if (!this.seat.door?.achievingTargetRotation && this.seat.door?.rotation > 0 && this.seat.vehicle.noDirectionPressed()) {
            this.character.setState(new CloseVehicleDoorInside(this.character, this.seat));
        }
    }
}
