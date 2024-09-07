/** @typedef {import('../../world/PathNode').PathNode} PathNode */
/** @typedef {import('../../vehicles/Vehicle').Vehicle} Vehicle */
import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as Utils from '../../core/FunctionLibrary';
import { FollowTarget } from './FollowTarget';
/** @extends FollowTarget */
export class FollowPath extends FollowTarget {
    /**
     * @public
     */
    nodeRadius;
    /**
     * @public
     * @default false
     */
    reverse = false;
    /**
     * @private
     * @default 0
     */
    staleTimer = 0;
    /**
     * @private
     */
    targetNode;
    /**
     * @param {PathNode} firstNode
     * @param {number} nodeRadius
     */
    constructor(firstNode, nodeRadius) {
        super(firstNode.object, 0);
        this.nodeRadius = nodeRadius;
        this.targetNode = firstNode;
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        // Todo only compute once in followTarget
        let source = new THREE.Vector3();
        let target = new THREE.Vector3();
        this.character.getWorldPosition(source);
        this.target.getWorldPosition(target);
        let viewVector = new THREE.Vector3().subVectors(target, source);
        viewVector.y = 0;
        let targetToNextNode = this.targetNode.nextNode.object.position.clone().sub(this.targetNode.object.position);
        targetToNextNode.y = 0;
        targetToNextNode.normalize();
        let slowDownAngle = viewVector.clone().normalize().dot(targetToNextNode);
        let speed = this.character.controlledObject.collision.velocity.length();
        // console.log(slowDownAngle, viewVector.length(), speed);
        if ((slowDownAngle < 0.7 && viewVector.length() < 50 && speed > 10)) {
            this.character.controlledObject.triggerAction('reverse', true);
            this.character.controlledObject.triggerAction('throttle', false);
        }
        if (speed < 1 || this.character.controlledObject.rayCastVehicle.numWheelsOnGround === 0)
            this.staleTimer += timeStep;
        else
            this.staleTimer = 0;
        if (this.staleTimer > 5) {
            let worldPos = new THREE.Vector3();
            this.targetNode.object.getWorldPosition(worldPos);
            worldPos.y += 3;
            this.character.controlledObject.collision.position = Utils.cannonVector(worldPos);
            this.character.controlledObject.collision.interpolatedPosition = Utils.cannonVector(worldPos);
            this.character.controlledObject.collision.angularVelocity = new CANNON.Vec3();
            this.character.controlledObject.collision.quaternion.copy(this.character.controlledObject.collision.initQuaternion);
            this.staleTimer = 0;
        }
        if (viewVector.length() < this.nodeRadius) {
            if (this.reverse) {
                super.setTarget(this.targetNode.previousNode.object);
                this.targetNode = this.targetNode.previousNode;
            }
            else {
                super.setTarget(this.targetNode.nextNode.object);
                this.targetNode = this.targetNode.nextNode;
            }
        }
    }
}
