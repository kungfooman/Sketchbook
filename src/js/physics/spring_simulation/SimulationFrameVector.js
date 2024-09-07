export class SimulationFrameVector {
    /**
     * @public
     */
    position;
    /**
     * @public
     */
    velocity;
    /**
     * @param {THREE.Vector3} position
     * @param {THREE.Vector3} velocity
     */
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
    }
}
