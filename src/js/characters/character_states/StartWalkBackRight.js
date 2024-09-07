/** @typedef {import('../Character').Character} Character */
import { StartWalkBase } from './_stateLibrary';
/** @extends StartWalkBase */
export class StartWalkBackRight extends StartWalkBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.animationLength = character.setAnimation('start_back_right', 0.1);
    }
}
