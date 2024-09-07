/** @typedef {import('../../Character').Character} Character */
/** @typedef {import('../../../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
/** @typedef {import('../../../interfaces/IControllable').IControllable} IControllable */
/** @typedef {import('src/ts/vehicles/Vehicle').Vehicle} Vehicle */
import * as THREE from 'three';
import * as Utils from '../../../core/FunctionLibrary';
import { CharacterStateBase, } from '../_stateLibrary';
/** @extends CharacterStateBase */
export class ExitingStateBase extends CharacterStateBase {
    /**
     * @protected
     */
    vehicle;
    /**
     * @protected
     */
    seat;
    /**
     * @protected
     * @default any
     */
    startPosition = new THREE.Vector3();
    /**
     * @protected
     * @default any
     */
    endPosition = new THREE.Vector3();
    /**
     * @protected
     * @default any
     */
    startRotation = new THREE.Quaternion();
    /**
     * @protected
     * @default any
     */
    endRotation = new THREE.Quaternion();
    /**
     * @protected
     */
    exitPoint;
    /**
     * @protected
     */
    dummyObj;
    /**
     * @param {Character} character
     * @param {VehicleSeat} seat
     */
    constructor(character, seat) {
        super(character);
        this.canFindVehiclesToEnter = false;
        this.seat = seat;
        this.vehicle = seat.vehicle;
        this.seat.door?.open();
        this.startPosition.copy(this.character.position);
        this.startRotation.copy(this.character.quaternion);
        this.dummyObj = new THREE.Object3D();
    }
    /**
     * @public
     * @returns {void}
     */
    detachCharacterFromVehicle() {
        this.character.controlledObject = undefined;
        this.character.resetOrientation();
        this.character.world.graphicsWorld.attach(this.character);
        this.character.resetVelocity();
        this.character.setPhysicsEnabled(true);
        this.character.setPosition(this.character.position.x, this.character.position.y, this.character.position.z);
        this.character.inputReceiverUpdate(0);
        this.character.characterCapsule.body.velocity.copy(this.vehicle.rayCastVehicle.chassisBody.velocity);
        this.character.feetRaycast();
    }
    /**
     * @public
     * @returns {void}
     */
    updateEndRotation() {
        const forward = Utils.getForward(this.exitPoint);
        forward.y = 0;
        forward.normalize();
        this.character.world.graphicsWorld.attach(this.dummyObj);
        this.exitPoint.getWorldPosition(this.dummyObj.position);
        let target = this.dummyObj.position.clone().add(forward);
        this.dummyObj.lookAt(target);
        this.seat.seatPointObject.parent.attach(this.dummyObj);
        this.endRotation.copy(this.dummyObj.quaternion);
    }
}
