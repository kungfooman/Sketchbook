import * as THREE from 'three';
import { SimulatorBase } from './SimulatorBase';
import { SimulationFrameVector } from './SimulationFrameVector';
import { springV } from '../../core/FunctionLibrary';
/** @extends SimulatorBase */
export class VectorSpringSimulator extends SimulatorBase {
    /**
     * @public
     */
    position;
    /**
     * @public
     */
    velocity;
    /**
     * @public
     */
    target;
    /**
     * @public
     */
    cache;
    /**
     * @param {number} fps
     * @param {number} mass
     * @param {number} damping
     */
    constructor(fps, mass, damping) {
        // Construct base
        super(fps, mass, damping);
        this.init();
    }
    /**
     * @public
     * @returns {void}
     */
    init() {
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.target = new THREE.Vector3();
        // Initialize cache by pushing two frames
        this.cache = [];
        for (let i = 0; i < 2; i++) {
            this.cache.push(new SimulationFrameVector(new THREE.Vector3(), new THREE.Vector3()));
        }
    }
    /**
     * Advances the simulation by given time step
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    simulate(timeStep) {
        // Generate new frames
        this.generateFrames(timeStep);
        // Return interpolation
        this.position.lerpVectors(this.cache[0].position, this.cache[1].position, this.offset / this.frameTime);
        this.velocity.lerpVectors(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime);
    }
    /**
     * Gets another simulation frame
     * @public
     * @param {boolean} isLastFrame
     * @returns {SimulationFrameVector}
     */
    getFrame(isLastFrame) {
        // Deep clone data from previous frame
        let newSpring = new SimulationFrameVector(this.lastFrame().position.clone(), this.lastFrame().velocity.clone());
        // Calculate new Spring
        springV(newSpring.position, this.target, newSpring.velocity, this.mass, this.damping);
        // Return new Spring
        return newSpring;
    }
}
