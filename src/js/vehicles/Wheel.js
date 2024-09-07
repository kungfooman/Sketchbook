/** @typedef {import('cannon').WheelInfo} WheelInfo */
export class Wheel {
    /**
     * @public
     */
    wheelObject;
    /**
     * @public
     */
    position;
    /**
     * @public
     * @default false
     */
    steering = false;
    /**
     * @public
     */
    drive; // Drive type "fwd" or "rwd"
    /**
     * @public
     */
    rayCastWheelInfoIndex; // Linked to a raycast vehicle WheelInfo structure
    /**
     * @param {THREE.Object3D} wheelObject
     */
    constructor(wheelObject) {
        this.wheelObject = wheelObject;
        this.position = wheelObject.position;
        if (wheelObject.hasOwnProperty('userData') && wheelObject.userData.hasOwnProperty('data')) {
            if (wheelObject.userData.hasOwnProperty('steering')) {
                this.steering = (wheelObject.userData.steering === 'true');
            }
            if (wheelObject.userData.hasOwnProperty('drive')) {
                this.drive = wheelObject.userData.drive;
            }
        }
    }
}
