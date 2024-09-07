/** @typedef {import('three').Object3D} Object3D */
import * as CANNON from 'cannon';
import * as Utils from '../../core/FunctionLibrary';
import { threeToCannon } from '../../../lib/utils/three-to-cannon';
export class TrimeshCollider {
    /**
     * @public
     */
    mesh;
    /**
     * @public
     */
    options;
    /**
     * @public
     */
    body;
    /**
     * @public
     */
    debugModel;
    /**
     * @param {Object3D} mesh
     * @param {any} options
     */
    constructor(mesh, options) {
        this.mesh = mesh.clone();
        let defaults = {
            mass: 0,
            position: mesh.position,
            rotation: mesh.quaternion,
            friction: 0.3
        };
        options = Utils.setDefaults(options, defaults);
        this.options = options;
        let mat = new CANNON.Material('triMat');
        mat.friction = options.friction;
        // mat.restitution = 0.7;
        let shape = threeToCannon(this.mesh, { type: threeToCannon.Type.MESH });
        // shape['material'] = mat;
        // Add phys sphere
        let physBox = new CANNON.Body({
            mass: options.mass,
            position: options.position,
            quaternion: options.rotation,
            shape: shape
        });
        physBox.material = mat;
        this.body = physBox;
    }
}
