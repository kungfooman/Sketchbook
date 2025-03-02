/** @typedef {import('../Character').Character} Character */
import { CharacterStateBase, EndWalk, JumpRunning, Walk, } from './_stateLibrary';
/** @extends CharacterStateBase */
export class Sprint extends CharacterStateBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.canEnterVehicles = true;
        this.character.velocitySimulator.mass = 10;
        this.character.rotationSimulator.damping = 0.8;
        this.character.rotationSimulator.mass = 50;
        this.character.setArcadeVelocityTarget(1.4);
        this.playAnimation('sprint', 0.1);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        this.character.setCameraRelativeOrientationTarget();
        this.fallInAir();
    }
    /**
     * @public
     * @returns {void}
     */
    onInputChange() {
        super.onInputChange();
        if (!this.character.actions.run.isPressed) {
            this.character.setState(new Walk(this.character));
        }
        if (this.character.actions.jump.justPressed) {
            this.character.setState(new JumpRunning(this.character));
        }
        if (this.noDirection()) {
            this.character.setState(new EndWalk(this.character));
        }
    }
}
