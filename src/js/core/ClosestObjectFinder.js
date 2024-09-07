export class ClosestObjectFinder {
    /**
     * @public
     */
    closestObject;
    /**
     * @private
     * @default number
     */
    closestDistance = Number.POSITIVE_INFINITY;
    /**
     * @private
     */
    referencePosition;
    /**
     * @private
     * @default number
     */
    maxDistance = Number.POSITIVE_INFINITY;
    /**
     * @param {THREE.Vector3} referencePosition
     * @param {number} [maxDistance]
     */
    constructor(referencePosition, maxDistance) {
        this.referencePosition = referencePosition;
        if (maxDistance !== undefined)
            this.maxDistance = maxDistance;
    }
    /**
     * @public
     * @param {T} object
     * @param {THREE.Vector3} objectPosition
     * @returns {void}
     */
    consider(object, objectPosition) {
        let distance = this.referencePosition.distanceTo(objectPosition);
        if (distance < this.maxDistance && distance < this.closestDistance) {
            this.closestDistance = distance;
            this.closestObject = object;
        }
    }
}
