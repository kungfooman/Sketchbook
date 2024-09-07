/** @typedef {import('../Character').Character} Character */
import { StartWalkBase } from './_stateLibrary';
/** @extends StartWalkBase */
export class StartWalkBackLeft extends StartWalkBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.animationLength = character.setAnimation('start_back_left', 0.1);
    }
}
