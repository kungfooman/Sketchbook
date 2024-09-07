export class SimulationFrame {
    /**
     * @public
     */
    position;
    /**
     * @public
     */
    velocity;
    /**
     * @param {number} position
     * @param {number} velocity
     */
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
    }
}
