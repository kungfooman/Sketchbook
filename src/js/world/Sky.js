/** @typedef {import('./World').World} World */
/** @typedef {import('../enums/EntityType').EntityType} EntityType */
import { SkyShader } from '../../lib/shaders/SkyShader';
import * as THREE from 'three';
import { default as CSM } from 'three-csm';
/** @extends THREE.Object3D */
export class Sky extends THREE.Object3D {
    /**
     * @public
     * @default 5
     */
    updateOrder = 5;
    /**
     * @public
     * @default any
     */
    sunPosition = new THREE.Vector3();
    /**
     * @public
     */
    csm;
    /**
     * @param {number} value
     */
    set theta(value) {
        this._theta = value;
        this.refreshSunPosition();
    }
    /**
     * @param {number} value
     */
    set phi(value) {
        this._phi = value;
        this.refreshSunPosition();
        this.refreshHemiIntensity();
    }
    /**
     * @private
     * @default 50
     */
    _phi = 50;
    /**
     * @private
     * @default 145
     */
    _theta = 145;
    /**
     * @private
     */
    hemiLight;
    /**
     * @private
     * @default 0.9
     */
    maxHemiIntensity = 0.9;
    /**
     * @private
     * @default 0.3
     */
    minHemiIntensity = 0.3;
    /**
     * @private
     */
    skyMesh;
    /**
     * @private
     */
    skyMaterial;
    /**
     * @private
     */
    world;
    /**
     * @param {World} world
     */
    constructor(world) {
        super();
        this.world = world;
        // Sky material
        this.skyMaterial = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms),
            fragmentShader: SkyShader.fragmentShader,
            vertexShader: SkyShader.vertexShader,
            side: THREE.BackSide
        });
        // Mesh
        this.skyMesh = new THREE.Mesh(new THREE.SphereBufferGeometry(1000, 24, 12), this.skyMaterial);
        this.attach(this.skyMesh);
        // Ambient light
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.0);
        this.refreshHemiIntensity();
        this.hemiLight.color.setHSL(0.59, 0.4, 0.6);
        this.hemiLight.groundColor.setHSL(0.095, 0.2, 0.75);
        this.hemiLight.position.set(0, 50, 0);
        this.world.graphicsWorld.add(this.hemiLight);
        // CSM
        // New version
        // let splitsCallback = (amount, near, far, target) =>
        // {
        // 	for (let i = amount - 1; i >= 0; i--)
        // 	{
        // 		target.push(Math.pow(1 / 3, i));
        // 	}
        // };
        // Legacy
        let splitsCallback = (amount, near, far) => {
            let arr = [];
            for (let i = amount - 1; i >= 0; i--) {
                arr.push(Math.pow(1 / 4, i));
            }
            return arr;
        };
        this.csm = new CSM({
            fov: 80,
            far: 250, // maxFar
            lightIntensity: 2.5,
            cascades: 3,
            shadowMapSize: 2048,
            camera: world.camera,
            parent: world.graphicsWorld,
            mode: 'custom',
            customSplitsCallback: splitsCallback
        });
        this.csm.fade = true;
        this.refreshSunPosition();
        world.graphicsWorld.add(this);
        world.registerUpdatable(this);
    }
    /**
     * @public
     * @param {number} timeScale
     * @returns {void}
     */
    update(timeScale) {
        this.position.copy(this.world.camera.position);
        this.refreshSunPosition();
        this.csm.update(this.world.camera.matrix);
        this.csm.lightDirection = new THREE.Vector3(-this.sunPosition.x, -this.sunPosition.y, -this.sunPosition.z).normalize();
    }
    /**
     * @public
     * @returns {void}
     */
    refreshSunPosition() {
        const sunDistance = 10;
        this.sunPosition.x = sunDistance * Math.sin(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
        this.sunPosition.y = sunDistance * Math.sin(this._phi * Math.PI / 180);
        this.sunPosition.z = sunDistance * Math.cos(this._theta * Math.PI / 180) * Math.cos(this._phi * Math.PI / 180);
        this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition);
        this.skyMaterial.uniforms.cameraPos.value.copy(this.world.camera.position);
    }
    /**
     * @public
     * @returns {void}
     */
    refreshHemiIntensity() {
        this.hemiLight.intensity = this.minHemiIntensity + Math.pow(1 - (Math.abs(this._phi - 90) / 90), 0.25) * (this.maxHemiIntensity - this.minHemiIntensity);
    }
}
