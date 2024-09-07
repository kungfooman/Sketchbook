/** @typedef {import('../enums/SeatType').SeatType} SeatType */
/** @typedef {import('../enums/Side').Side} Side */
/** @typedef {import('../interfaces/IControllable').IControllable} IControllable */
import { VehicleDoor } from './VehicleDoor';
export class VehicleSeat {
    /**
     * @public
     */
    vehicle;
    /**
     * @public
     */
    seatPointObject;
    // String of names of connected seats
    /**
     * @public
     */
    connectedSeatsString;
    // Actual seatPoint objects, need to be identified
    // by parsing connectedSeatsString *after* all seats are imported
    /**
     * @public
     * @default undefined[]
     */
    connectedSeats = [];
    /**
     * @public
     */
    type;
    /**
     * @public
     * @default undefined[]
     */
    entryPoints = [];
    /**
     * @public
     */
    door;
    /**
     * @public
     * @default null
     */
    occupiedBy = null;
    /**
     * @param {IControllable} vehicle
     * @param {THREE.Object3D} object
     * @param {any} gltf
     */
    constructor(vehicle, object, gltf) {
        this.vehicle = vehicle;
        this.seatPointObject = object;
        if (object.hasOwnProperty('userData') && object.userData.hasOwnProperty('data')) {
            if (object.userData.hasOwnProperty('door_object')) {
                this.door = new VehicleDoor(this, gltf.scene.getObjectByName(object.userData.door_object));
            }
            if (object.userData.hasOwnProperty('entry_points')) {
                let entry_points = object.userData.entry_points.split(';');
                for (const entry_point of entry_points) {
                    if (entry_point.length > 0) {
                        this.entryPoints.push(gltf.scene.getObjectByName(entry_point));
                    }
                }
            }
            else {
                console.error('Seat object ' + object + ' has no entry point reference property.');
            }
            if (object.userData.hasOwnProperty('seat_type')) {
                this.type = object.userData.seat_type;
            }
            else {
                console.error('Seat object ' + object + ' has no seat type property.');
            }
            if (object.userData.hasOwnProperty('connected_seats')) {
                this.connectedSeatsString = object.userData.connected_seats;
            }
        }
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        if (this.door !== undefined) {
            this.door.update(timeStep);
        }
    }
}
