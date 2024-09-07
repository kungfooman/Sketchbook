/** @typedef {import('../Character').Character} Character */
import { StartWalkBase } from './_stateLibrary';
/** @extends StartWalkBase */
export class StartWalkRight extends StartWalkBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.animationLength = character.setAnimation('start_right', 0.1);
    }
}
