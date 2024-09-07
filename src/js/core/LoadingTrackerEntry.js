export class LoadingTrackerEntry {
    /**
     * @public
     */
    path;
    /**
     * @public
     * @default 0
     */
    progress = 0;
    /**
     * @public
     * @default false
     */
    finished = false;
    /**
     * @param {string} path
     */
    constructor(path) {
        this.path = path;
    }
}
