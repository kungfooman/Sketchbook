/** @typedef {import('./InfoStack').InfoStack} InfoStack */
export class InfoStackMessage {
    /**
     * @public
     */
    domElement;
    /**
     * @private
     */
    customConsole;
    /**
     * @private
     * @default 0
     */
    elapsedTime = 0;
    /**
     * @private
     * @default false
     */
    removalTriggered = false;
    /**
     * @param {InfoStack} console
     * @param {HTMLElement} domElement
     */
    constructor(console, domElement) {
        this.customConsole = console;
        this.domElement = domElement;
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        this.elapsedTime += timeStep;
        if (this.elapsedTime > this.customConsole.messageDuration && !this.removalTriggered) {
            this.triggerRemoval();
        }
    }
    /**
     * @private
     * @returns {void}
     */
    triggerRemoval() {
        this.removalTriggered = true;
        this.domElement.classList.remove(this.customConsole.entranceAnimation);
        this.domElement.classList.add(this.customConsole.exitAnimation);
        this.domElement.style.setProperty('--animate-duration', '1s');
        this.domElement.addEventListener('animationend', () => {
            this.domElement.parentNode.removeChild(this.domElement);
        });
    }
}
