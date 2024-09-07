/** @typedef {import('../world/World').World} World */
/** @typedef {import('three').Object3D} Object3D */
import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import { SimulationFrame } from '../physics/spring_simulation/SimulationFrame';
import { Side } from '../enums/Side';
import { Space } from '../enums/Space';
/**
 * @param {number} [radius=1]
 * @param {number} [height=2]
 * @param {number} [N=32]
 * @returns {THREE.Geometry}
 */
export function createCapsuleGeometry(radius = 1, height = 2, N = 32) {
    const geometry = new THREE.Geometry();
    const TWOPI = Math.PI * 2;
    const PID2 = 1.570796326794896619231322;
    const normals = [];
    // top cap
    for (let i = 0; i <= N / 4; i++) {
        for (let j = 0; j <= N; j++) {
            let theta = j * TWOPI / N;
            let phi = -PID2 + Math.PI * i / (N / 2);
            let vertex = new THREE.Vector3();
            let normal = new THREE.Vector3();
            vertex.x = radius * Math.cos(phi) * Math.cos(theta);
            vertex.y = radius * Math.cos(phi) * Math.sin(theta);
            vertex.z = radius * Math.sin(phi);
            vertex.z -= height / 2;
            normal.x = vertex.x;
            normal.y = vertex.y;
            normal.z = vertex.z;
            geometry.vertices.push(vertex);
            normals.push(normal);
        }
    }
    // bottom cap
    for (let i = N / 4; i <= N / 2; i++) {
        for (let j = 0; j <= N; j++) {
            let theta = j * TWOPI / N;
            let phi = -PID2 + Math.PI * i / (N / 2);
            let vertex = new THREE.Vector3();
            let normal = new THREE.Vector3();
            vertex.x = radius * Math.cos(phi) * Math.cos(theta);
            vertex.y = radius * Math.cos(phi) * Math.sin(theta);
            vertex.z = radius * Math.sin(phi);
            vertex.z += height / 2;
            normal.x = vertex.x;
            normal.y = vertex.y;
            normal.z = vertex.z;
            geometry.vertices.push(vertex);
            normals.push(normal);
        }
    }
    for (let i = 0; i <= N / 2; i++) {
        for (let j = 0; j < N; j++) {
            let vec = new THREE.Vector4(i * (N + 1) + j, i * (N + 1) + (j + 1), (i + 1) * (N + 1) + (j + 1), (i + 1) * (N + 1) + j);
            if (i === N / 4) {
                let face1 = new THREE.Face3(vec.x, vec.y, vec.z, [
                    normals[vec.x],
                    normals[vec.y],
                    normals[vec.z]
                ]);
                let face2 = new THREE.Face3(vec.x, vec.z, vec.w, [
                    normals[vec.x],
                    normals[vec.z],
                    normals[vec.w]
                ]);
                geometry.faces.push(face2);
                geometry.faces.push(face1);
            }
            else {
                let face1 = new THREE.Face3(vec.x, vec.y, vec.z, [
                    normals[vec.x],
                    normals[vec.y],
                    normals[vec.z]
                ]);
                let face2 = new THREE.Face3(vec.x, vec.z, vec.w, [
                    normals[vec.x],
                    normals[vec.z],
                    normals[vec.w]
                ]);
                geometry.faces.push(face1);
                geometry.faces.push(face2);
            }
        }
        // if(i==(N/4)) break; // N/4 is when the center segments are solved
    }
    geometry.rotateX(Math.PI / 2);
    geometry.computeVertexNormals();
    geometry.computeFaceNormals();
    return geometry;
}
//#endregion
//#region Math
/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {THREE.Vector3} a Vector to construct 2D matrix from
 * @param {THREE.Vector3} b Vector to apply basis to
 * @returns {THREE.Vector3}
 */
export function appplyVectorMatrixXZ(a, b) {
    return new THREE.Vector3((a.x * b.z + a.z * b.x), b.y, (a.z * b.z + -a.x * b.x));
}
/**
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {number}
 */
export function round(value, decimals = 0) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
/**
 * @param {THREE.Vector3} vector
 * @param {number} [decimals=0]
 * @returns {THREE.Vector3}
 */
export function roundVector(vector, decimals = 0) {
    return new THREE.Vector3(this.round(vector.x, decimals), this.round(vector.y, decimals), this.round(vector.z, decimals));
}
/**
 * Finds an angle between two vectors
 * @param {THREE.Vector3} v1
 * @param {THREE.Vector3} v2
 * @param {number} [dotTreshold=0.0005]
 * @returns {number}
 */
export function getAngleBetweenVectors(v1, v2, dotTreshold = 0.0005) {
    let angle;
    let dot = v1.dot(v2);
    // If dot is close to 1, we'll round angle to zero
    if (dot > 1 - dotTreshold) {
        angle = 0;
    }
    else {
        // Dot too close to -1
        if (dot < -1 + dotTreshold) {
            angle = Math.PI;
        }
        else {
            // Get angle difference in radians
            angle = Math.acos(dot);
        }
    }
    return angle;
}
/**
 * Finds an angle between two vectors with a sign relative to normal vector
 * @param {THREE.Vector3} v1
 * @param {THREE.Vector3} v2
 * @param {THREE.Vector3} [normal=new THREE.Vector3(0, 1, 0)]
 * @param {number} [dotTreshold=0.0005]
 * @returns {number}
 */
export function getSignedAngleBetweenVectors(v1, v2, normal = new THREE.Vector3(0, 1, 0), dotTreshold = 0.0005) {
    let angle = this.getAngleBetweenVectors(v1, v2, dotTreshold);
    // Get vector pointing up or down
    let cross = new THREE.Vector3().crossVectors(v1, v2);
    // Compare cross with normal to find out direction
    if (normal.dot(cross) < 0) {
        angle = -angle;
    }
    return angle;
}
/**
 * @param {number} n1
 * @param {number} n2
 * @returns {boolean}
 */
export function haveSameSigns(n1, n2) {
    return (n1 < 0) === (n2 < 0);
}
/**
 * @param {number} n1
 * @param {number} n2
 * @returns {boolean}
 */
export function haveDifferentSigns(n1, n2) {
    return (n1 < 0) !== (n2 < 0);
}
//#endregion
//#region Miscellaneous
/**
 * @param {{}} options
 * @param {{}} defaults
 * @returns {{}}
 */
export function setDefaults(options, defaults) {
    return _.defaults({}, _.clone(options), defaults);
}
/**
 * @param {string} [prefix='']
 * @returns {any[]}
 */
export function getGlobalProperties(prefix = '') {
    let keyValues = [];
    let global = window; // window for browser environments
    for (let prop in global) {
        // check the prefix
        if (prop.indexOf(prefix) === 0) {
            keyValues.push(prop /*+ "=" + global[prop]*/);
        }
    }
    return keyValues; // build the string
}
/**
 * @param {number} source
 * @param {number} dest
 * @param {number} velocity
 * @param {number} mass
 * @param {number} damping
 * @returns {SimulationFrame}
 */
export function spring(source, dest, velocity, mass, damping) {
    let acceleration = dest - source;
    acceleration /= mass;
    velocity += acceleration;
    velocity *= damping;
    let position = source + velocity;
    return new SimulationFrame(position, velocity);
}
/**
 * @param {THREE.Vector3} source
 * @param {THREE.Vector3} dest
 * @param {THREE.Vector3} velocity
 * @param {number} mass
 * @param {number} damping
 * @returns {void}
 */
export function springV(source, dest, velocity, mass, damping) {
    let acceleration = new THREE.Vector3().subVectors(dest, source);
    acceleration.divideScalar(mass);
    velocity.add(acceleration);
    velocity.multiplyScalar(damping);
    source.add(velocity);
}
/**
 * @param {CANNON.Vec3} vec
 * @returns {THREE.Vector3}
 */
export function threeVector(vec) {
    return new THREE.Vector3(vec.x, vec.y, vec.z);
}
/**
 * @param {THREE.Vector3} vec
 * @returns {CANNON.Vec3}
 */
export function cannonVector(vec) {
    return new CANNON.Vec3(vec.x, vec.y, vec.z);
}
/**
 * @param {CANNON.Quaternion} quat
 * @returns {THREE.Quaternion}
 */
export function threeQuat(quat) {
    return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
}
/**
 * @param {THREE.Quaternion} quat
 * @returns {CANNON.Quaternion}
 */
export function cannonQuat(quat) {
    return new CANNON.Quaternion(quat.x, quat.y, quat.z, quat.w);
}
/**
 * @param {any} child
 * @returns {void}
 */
export function setupMeshProperties(child) {
    child.castShadow = true;
    child.receiveShadow = true;
    if (child.material.map !== null) {
        let mat = new THREE.MeshPhongMaterial();
        mat.shininess = 0;
        mat.name = child.material.name;
        mat.map = child.material.map;
        mat.map.anisotropy = 4;
        mat.aoMap = child.material.aoMap;
        mat.transparent = child.material.transparent;
        mat.skinning = child.material.skinning;
        // mat.map.encoding = THREE.LinearEncoding;
        child.material = mat;
    }
}
/**
 * @param {Object3D} from
 * @param {Object3D} to
 * @returns {Side}
 */
export function detectRelativeSide(from, to) {
    const right = getRight(from, Space.Local);
    const viewVector = to.position.clone().sub(from.position).normalize();
    return right.dot(viewVector) > 0 ? Side.Left : Side.Right;
}
/**
 * @param {number} x
 * @returns {number}
 */
export function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}
/**
 * @param {number} x
 * @returns {number}
 */
export function easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
}
/**
 * @param {THREE.Object3D} obj
 * @param {Space} [space=Space.Global]
 * @returns {THREE.Vector3}
 */
export function getRight(obj, space = Space.Global) {
    const matrix = getMatrix(obj, space);
    return new THREE.Vector3(matrix.elements[0], matrix.elements[1], matrix.elements[2]);
}
/**
 * @param {THREE.Object3D} obj
 * @param {Space} [space=Space.Global]
 * @returns {THREE.Vector3}
 */
export function getUp(obj, space = Space.Global) {
    const matrix = getMatrix(obj, space);
    return new THREE.Vector3(matrix.elements[4], matrix.elements[5], matrix.elements[6]);
}
/**
 * @param {THREE.Object3D} obj
 * @param {Space} [space=Space.Global]
 * @returns {THREE.Vector3}
 */
export function getForward(obj, space = Space.Global) {
    const matrix = getMatrix(obj, space);
    return new THREE.Vector3(matrix.elements[8], matrix.elements[9], matrix.elements[10]);
}
/**
 * @param {THREE.Object3D} obj
 * @param {Space} [space=Space.Global]
 * @returns {THREE.Vector3}
 */
export function getBack(obj, space = Space.Global) {
    const matrix = getMatrix(obj, space);
    return new THREE.Vector3(-matrix.elements[8], -matrix.elements[9], -matrix.elements[10]);
}
/**
 * @param {THREE.Object3D} obj
 * @param {Space} space
 * @returns {THREE.Matrix4}
 */
export function getMatrix(obj, space) {
    switch (space) {
        case Space.Local: return obj.matrix;
        case Space.Global: return obj.matrixWorld;
    }
}
/**
 * @returns {any}
 */
export function countSleepyBodies() {
    // let awake = 0;
    // let sleepy = 0;
    // let asleep = 0;
    // this.physicsWorld.bodies.forEach((body) =>
    // {
    //     if (body.sleepState === 0) awake++;
    //     if (body.sleepState === 1) sleepy++;
    //     if (body.sleepState === 2) asleep++;
    // });
}
//#endregio
n;
