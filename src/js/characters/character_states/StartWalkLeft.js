/** @typedef {import('../Character').Character} Character */
import { StartWalkBase } from './_stateLibrary';
/** @extends StartWalkBase */
export class StartWalkLeft extends StartWalkBase {
    /**
     * @param {Character} character
     */
    constructor(character) {
        super(character);
        this.animationLength = character.setAnimation('start_left', 0.1);
    }
}
