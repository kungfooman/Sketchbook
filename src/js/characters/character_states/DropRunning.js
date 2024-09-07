/** @typedef {import('../Character').Character} Character */
import { CharacterStateBase, EndWalk, JumpRunning, Sprint, Walk, } from './_stateLibrary';
/** @extends CharacterStateBase */
export class DropRunning extends CharacterStateBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.character.setArcadeVelocityTarget(0.8);
        this.playAnimation('drop_running', 0.1);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        super.update(timeStep);
        this.character.setCameraRelativeOrientationTarget();
        if (this.animationEnded(timeStep)) {
            this.character.setState(new Walk(this.character));
        }
    }
    /**
     * @public
     * @returns {void}
     */
    onInputChange() {
        super.onInputChange();
        if (this.noDirection()) {
            this.character.setState(new EndWalk(this.character));
        }
        if (this.anyDirection() && this.character.actions.run.justPressed) {
            this.character.setState(new Sprint(this.character));
        }
        if (this.character.actions.jump.justPressed) {
            this.character.setState(new JumpRunning(this.character));
        }
    }
}
