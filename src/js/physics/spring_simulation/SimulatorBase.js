export class SimulatorBase {
    /**
     * @public
     */
    mass;
    /**
     * @public
     */
    damping;
    /**
     * @public
     */
    frameTime;
    /**
     * @public
     */
    offset;
    /**
     * @param {number} fps
     * @param {number} mass
     * @param {number} damping
     */
    constructor(fps, mass, damping) {
        this.mass = mass;
        this.damping = damping;
        this.frameTime = 1 / fps;
        this.offset = 0;
    }
    /**
     * @public
     * @param {number} value
     * @returns {void}
     */
    setFPS(value) {
        this.frameTime = 1 / value;
    }
    /**
     * @public
     * @returns {any}
     */
    lastFrame() {
        return this.cache[this.cache.length - 1];
    }
    /**
     * Generates frames between last simulation call and the current one
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    generateFrames(timeStep) {
        // Update cache
        // Find out how many frames needs to be generated
        let totalTimeStep = this.offset + timeStep;
        let framesToGenerate = Math.floor(totalTimeStep / this.frameTime);
        this.offset = totalTimeStep % this.frameTime;
        // Generate simulation frames
        if (framesToGenerate > 0) {
            for (let i = 0; i < framesToGenerate; i++) {
                this.cache.push(this.getFrame(i + 1 === framesToGenerate));
            }
            this.cache = this.cache.slice(-2);
        }
    }
}
