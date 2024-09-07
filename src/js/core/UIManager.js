export class UIManager {
    /**
     * @public
     * @static
     * @param {boolean} value
     * @returns {void}
     */
    static setUserInterfaceVisible(value) {
        document.getElementById('ui-container').style.display = value ? 'block' : 'none';
    }
    /**
     * @public
     * @static
     * @param {boolean} value
     * @returns {void}
     */
    static setLoadingScreenVisible(value) {
        document.getElementById('loading-screen').style.display = value ? 'flex' : 'none';
    }
    /**
     * @public
     * @static
     * @param {boolean} value
     * @returns {void}
     */
    static setFPSVisible(value) {
        document.getElementById('statsBox').style.display = value ? 'block' : 'none';
        document.getElementById('dat-gui-container').style.top = value ? '48px' : '0px';
    }
}
