/** @typedef {import('./SimulationFrame').SimulationFrame} SimulationFrame */
import * as THREE from 'three';
import { SimulatorBase } from './SimulatorBase';
import { spring } from '../../core/FunctionLibrary';
/** @extends SimulatorBase */
export class RelativeSpringSimulator extends SimulatorBase {
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
    lastLerp;
    /**
     * @public
     */
    cache;
    /**
     * @param {number} fps
     * @param {number} mass
     * @param {number} damping
     * @param {number} [startPosition=0]
     * @param {number} [startVelocity=0]
     */
    constructor(fps, mass, damping, startPosition = 0, startVelocity = 0) {
        // Construct base
        super(fps, mass, damping);
        // Simulated values
        this.position = startPosition;
        this.velocity = startVelocity;
        // Simulation parameters
        this.target = 0;
        // Last lerped position for relative output
        this.lastLerp = 0;
        // Initialize cache by pushing two frames
        this.cache = []; // At least two frames
        for (let i = 0; i < 2; i++) {
            this.cache.push({
                position: startPosition,
                velocity: startVelocity,
            });
        }
    }
    /**
     * Advances the simulation by given time step
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    simulate(timeStep) {
        this.generateFrames(timeStep);
        // SpringR lerping
        // Lerp from 0 to next frame
        let lerp = THREE.MathUtils.lerp(0, this.cache[1].position, this.offset / this.frameTime);
        // Substract last lerp from current to make output relative
        this.position = (lerp - this.lastLerp);
        this.lastLerp = lerp;
        this.velocity = THREE.MathUtils.lerp(this.cache[0].velocity, this.cache[1].velocity, this.offset / this.frameTime);
    }
    /**
     * Gets another simulation frame
     * @public
     * @param {boolean} isLastFrame
     * @returns {SimulationFrame}
     */
    getFrame(isLastFrame) {
        let newFrame = Object.assign({}, this.lastFrame());
        if (isLastFrame) {
            // Reset position
            newFrame.position = 0;
            // Transition to next frame
            this.lastLerp = this.lastLerp - this.lastFrame().position;
        }
        return spring(newFrame.position, this.target, newFrame.velocity, this.mass, this.damping);
    }
}
