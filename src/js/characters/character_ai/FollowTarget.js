/** @typedef {import('../../vehicles/Vehicle').Vehicle} Vehicle */
/** @typedef {import('../Character').Character} Character */
/** @typedef {import('../../vehicles/Car').Car} Car */
/** @typedef {import('../../enums/EntityType').EntityType} EntityType */
import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
export class FollowTarget {
    /**
     * @public
     */
    character;
    /**
     * @public
     */
    isTargetReached;
    /**
     * @public
     */
    target;
    /**
     * @private
     */
    stopDistance;
    /**
     * @param {THREE.Object3D} target
     * @param {number} [stopDistance=1.3]
     */
    constructor(target, stopDistance = 1.3) {
        this.target = target;
        this.stopDistance = stopDistance;
    }
    /**
     * @public
     * @param {THREE.Object3D} target
     * @returns {void}
     */
    setTarget(target) {
        this.target = target;
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        if (this.character.controlledObject !== undefined) {
            let source = new THREE.Vector3();
            let target = new THREE.Vector3();
            this.character.getWorldPosition(source);
            this.target.getWorldPosition(target);
            let viewVector = new THREE.Vector3().subVectors(target, source);
            // Follow character
            if (viewVector.length() > this.stopDistance) {
                this.isTargetReached = false;
            }
            else {
                this.isTargetReached = true;
            }
            let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.character.controlledObject.quaternion);
            viewVector.y = 0;
            viewVector.normalize();
            let angle = Utils.getSignedAngleBetweenVectors(forward, viewVector);
            let goingForward = forward.dot(Utils.threeVector(this.character.controlledObject.collision.velocity)) > 0;
            let speed = this.character.controlledObject.collision.velocity.length();
            if (forward.dot(viewVector) < 0.0) {
                this.character.controlledObject.triggerAction('reverse', true);
                this.character.controlledObject.triggerAction('throttle', false);
            }
            else {
                this.character.controlledObject.triggerAction('throttle', true);
                this.character.controlledObject.triggerAction('reverse', false);
            }
            if (Math.abs(angle) > 0.15) {
                if (forward.dot(viewVector) > 0 || goingForward) {
                    if (angle > 0) {
                        this.character.controlledObject.triggerAction('left', true);
                        this.character.controlledObject.triggerAction('right', false);
                    }
                    else {
                        this.character.controlledObject.triggerAction('right', true);
                        this.character.controlledObject.triggerAction('left', false);
                    }
                }
                else {
                    if (angle > 0) {
                        this.character.controlledObject.triggerAction('right', true);
                        this.character.controlledObject.triggerAction('left', false);
                    }
                    else {
                        this.character.controlledObject.triggerAction('left', true);
                        this.character.controlledObject.triggerAction('right', false);
                    }
                }
            }
            else {
                this.character.controlledObject.triggerAction('left', false);
                this.character.controlledObject.triggerAction('right', false);
            }
        }
        else {
            let viewVector = new THREE.Vector3().subVectors(this.target.position, this.character.position);
            this.character.setViewVector(viewVector);
            // Follow character
            if (viewVector.length() > this.stopDistance) {
                this.isTargetReached = false;
                this.character.triggerAction('up', true);
            }
            // Stand still
            else {
                this.isTargetReached = true;
                this.character.triggerAction('up', false);
                // Look at character
                this.character.setOrientation(viewVector);
            }
        }
    }
}
