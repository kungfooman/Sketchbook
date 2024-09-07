/** @typedef {import('../Character').Character} Character */
import { StartWalkBase } from './_stateLibrary';
/** @extends StartWalkBase */
export class StartWalkForward extends StartWalkBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.animationLength = character.setAnimation('start_forward', 0.1);
    }
}
