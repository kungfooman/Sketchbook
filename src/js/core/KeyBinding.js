export class KeyBinding {
    /**
     * @public
     */
    eventCodes;
    /**
     * @public
     * @default false
     */
    isPressed = false;
    /**
     * @public
     * @default false
     */
    justPressed = false;
    /**
     * @public
     * @default false
     */
    justReleased = false;
    /**
     * @param {...string} [code]
     */
    constructor(...code) {
        this.eventCodes = code;
    }
}
