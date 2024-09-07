/** @typedef {import('./Vehicle').Vehicle} Vehicle */
/** @typedef {import('./VehicleSeat').VehicleSeat} VehicleSeat */
import * as THREE from 'three';
import * as Utils from '../core/FunctionLibrary';
import { Side } from '../enums/Side';
export class VehicleDoor {
    /**
     * @public
     */
    vehicle;
    /**
     * @public
     */
    seat;
    /**
     * @public
     */
    doorObject;
    /**
     * @public
     * @default 0
     */
    doorVelocity = 0;
    /**
     * @public
     * @default any
     */
    doorWorldPos = new THREE.Vector3();
    /**
     * @public
     * @default any
     */
    lastTrailerPos = new THREE.Vector3();
    /**
     * @public
     * @default any
     */
    lastTrailerVel = new THREE.Vector3();
    /**
     * @public
     * @default 0
     */
    rotation = 0;
    /**
     * @public
     * @default false
     */
    achievingTargetRotation = false;
    /**
     * @public
     * @default false
     */
    physicsEnabled = false;
    /**
     * @public
     * @default 0
     */
    targetRotation = 0;
    /**
     * @public
     * @default 5
     */
    rotationSpeed = 5;
    /**
     * @public
     * @default any
     */
    lastVehicleVel = new THREE.Vector3();
    /**
     * @public
     * @default any
     */
    lastVehiclePos = new THREE.Vector3();
    /**
     * @private
     */
    sideMultiplier;
    /**
     * @param {VehicleSeat} seat
     * @param {THREE.Object3D} object
     */
    constructor(seat, object) {
        this.seat = seat;
        this.vehicle = seat.vehicle;
        this.doorObject = object;
        const side = Utils.detectRelativeSide(this.seat.seatPointObject, this.doorObject);
        if (side === Side.Left)
            this.sideMultiplier = -1;
        else if (side === Side.Right)
            this.sideMultiplier = 1;
        else
            this.sideMultiplier = 0;
    }
    /**
     * @public
     * @param {number} timestep
     * @returns {void}
     */
    update(timestep) {
        if (this.achievingTargetRotation) {
            if (this.rotation < this.targetRotation) {
                this.rotation += timestep * this.rotationSpeed;
                if (this.rotation > this.targetRotation) {
                    this.rotation = this.targetRotation;
                    // this.resetPhysTrailer();
                    this.achievingTargetRotation = false;
                    this.physicsEnabled = true;
                }
            }
            else if (this.rotation > this.targetRotation) {
                this.rotation -= timestep * this.rotationSpeed;
                if (this.rotation < this.targetRotation) {
                    this.rotation = this.targetRotation;
                    // this.resetPhysTrailer();
                    this.achievingTargetRotation = false;
                    this.physicsEnabled = false;
                }
            }
        }
        this.doorObject.setRotationFromEuler(new THREE.Euler(0, this.sideMultiplier * this.rotation, 0));
    }
    /**
     * @public
     * @returns {void}
     */
    preStepCallback() {
        if (this.physicsEnabled && !this.achievingTargetRotation) {
            // Door world position
            this.doorObject.getWorldPosition(this.doorWorldPos);
            // Get acceleration
            let vehicleVel = Utils.threeVector(this.vehicle.rayCastVehicle.chassisBody.velocity);
            let vehicleVelDiff = vehicleVel.clone().sub(this.lastVehicleVel);
            // Get vectors
            const quat = Utils.threeQuat(this.vehicle.rayCastVehicle.chassisBody.quaternion);
            const back = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
            const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
            // Get imaginary positions
            let trailerPos = back.clone().applyAxisAngle(up, this.sideMultiplier * this.rotation).add(this.doorWorldPos);
            let trailerPushedPos = trailerPos.clone().sub(vehicleVelDiff);
            // Update last values
            this.lastVehicleVel.copy(vehicleVel);
            this.lastTrailerPos.copy(trailerPos);
            // Measure angle difference
            let v1 = trailerPos.clone().sub(this.doorWorldPos).normalize();
            let v2 = trailerPushedPos.clone().sub(this.doorWorldPos).normalize();
            let angle = Utils.getSignedAngleBetweenVectors(v1, v2, up);
            // Apply door velocity
            this.doorVelocity += this.sideMultiplier * angle * 0.05;
            this.rotation += this.doorVelocity;
            // Bounce door when it reaches rotation limit
            if (this.rotation < 0) {
                this.rotation = 0;
                if (this.doorVelocity < -0.08) {
                    this.close();
                    this.doorVelocity = 0;
                }
                else {
                    this.doorVelocity = -this.doorVelocity / 2;
                }
            }
            if (this.rotation > 1) {
                this.rotation = 1;
                this.doorVelocity = -this.doorVelocity / 2;
            }
            // Damping
            this.doorVelocity = this.doorVelocity * 0.98;
        }
    }
    /**
     * @public
     * @returns {void}
     */
    open() {
        // this.resetPhysTrailer();
        this.achievingTargetRotation = true;
        this.targetRotation = 1;
    }
    /**
     * @public
     * @returns {void}
     */
    close() {
        this.achievingTargetRotation = true;
        this.targetRotation = 0;
    }
    /**
     * @public
     * @returns {void}
     */
    resetPhysTrailer() {
        // Door world position
        this.doorObject.getWorldPosition(this.doorWorldPos);
        // Get acceleration
        this.lastVehicleVel = new THREE.Vector3();
        // Get vectors
        const quat = Utils.threeQuat(this.vehicle.rayCastVehicle.chassisBody.quaternion);
        const back = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
        this.lastTrailerPos.copy(back.add(this.doorWorldPos));
    }
}
