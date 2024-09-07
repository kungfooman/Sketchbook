/** @typedef {import('./Path').Path} Path */
/** @typedef {import('three').Object3D} Object3D */
export class PathNode {
    /**
     * @public
     */
    object;
    /**
     * @public
     */
    path;
    /**
     * @public
     */
    nextNode;
    /**
     * @public
     */
    previousNode;
    /**
     * @param {THREE.Object3D} child
     * @param {Path} path
     */
    constructor(child, path) {
        this.object = child;
        this.path = path;
    }
}
