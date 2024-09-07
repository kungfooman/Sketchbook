/** @typedef {import('../world/World').World} World */
/** @typedef {import('../characters/Character').Character} Character */
import * as THREE from 'three';
import * as Utils from './FunctionLibrary';
import { KeyBinding } from './KeyBinding';
export class CameraOperator {
    /**
     * @public
     * @default 4
     */
    updateOrder = 4;
    /**
     * @public
     */
    world;
    /**
     * @public
     */
    camera;
    /**
     * @public
     */
    target;
    /**
     * @public
     */
    sensitivity;
    /**
     * @public
     * @default 1
     */
    radius = 1;
    /**
     * @public
     */
    theta;
    /**
     * @public
     */
    phi;
    /**
     * @public
     */
    onMouseDownPosition;
    /**
     * @public
     */
    onMouseDownTheta;
    /**
     * @public
     */
    onMouseDownPhi;
    /**
     * @public
     * @default 1
     */
    targetRadius = 1;
    /**
     * @public
     */
    movementSpeed;
    /**
     * @public
     */
    actions;
    /**
     * @public
     * @default 0
     */
    upVelocity = 0;
    /**
     * @public
     * @default 0
     */
    forwardVelocity = 0;
    /**
     * @public
     * @default 0
     */
    rightVelocity = 0;
    /**
     * @public
     * @default false
     */
    followMode = false;
    /**
     * @public
     */
    characterCaller;
    /**
     * @param {World} world
     * @param {THREE.Camera} camera
     * @param {number} [sensitivityX=1]
     * @param {number} [sensitivityY=sensitivityX * 0.8]
     */
    constructor(world, camera, sensitivityX = 1, sensitivityY = sensitivityX * 0.8) {
        this.world = world;
        this.camera = camera;
        this.target = new THREE.Vector3();
        this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);
        this.movementSpeed = 0.06;
        this.radius = 3;
        this.theta = 0;
        this.phi = 0;
        this.onMouseDownPosition = new THREE.Vector2();
        this.onMouseDownTheta = this.theta;
        this.onMouseDownPhi = this.phi;
        this.actions = {
            'forward': new KeyBinding('KeyW'),
            'back': new KeyBinding('KeyS'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'up': new KeyBinding('KeyE'),
            'down': new KeyBinding('KeyQ'),
            'fast': new KeyBinding('ShiftLeft'),
        };
        world.registerUpdatable(this);
    }
    /**
     * @public
     * @param {number} sensitivityX
     * @param {number} [sensitivityY=sensitivityX]
     * @returns {void}
     */
    setSensitivity(sensitivityX, sensitivityY = sensitivityX) {
        this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);
    }
    /**
     * @public
     * @param {number} value
     * @param {boolean} [instantly=false]
     * @returns {void}
     */
    setRadius(value, instantly = false) {
        this.targetRadius = Math.max(0.001, value);
        if (instantly === true) {
            this.radius = value;
        }
    }
    /**
     * @public
     * @param {number} deltaX
     * @param {number} deltaY
     * @returns {void}
     */
    move(deltaX, deltaY) {
        this.theta -= deltaX * (this.sensitivity.x / 2);
        this.theta %= 360;
        this.phi += deltaY * (this.sensitivity.y / 2);
        this.phi = Math.min(85, Math.max(-85, this.phi));
    }
    /**
     * @public
     * @param {number} timeScale
     * @returns {void}
     */
    update(timeScale) {
        if (this.followMode === true) {
            this.camera.position.y = THREE.MathUtils.clamp(this.camera.position.y, this.target.y, Number.POSITIVE_INFINITY);
            this.camera.lookAt(this.target);
            let newPos = this.target.clone().add(new THREE.Vector3().subVectors(this.camera.position, this.target).normalize().multiplyScalar(this.targetRadius));
            this.camera.position.x = newPos.x;
            this.camera.position.y = newPos.y;
            this.camera.position.z = newPos.z;
        }
        else {
            this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, 0.1);
            this.camera.position.x = this.target.x + this.radius * Math.sin(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
            this.camera.position.y = this.target.y + this.radius * Math.sin(this.phi * Math.PI / 180);
            this.camera.position.z = this.target.z + this.radius * Math.cos(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
            this.camera.updateMatrix();
            this.camera.lookAt(this.target);
        }
    }
    /**
     * @public
     * @param {KeyboardEvent} event
     * @param {string} code
     * @param {boolean} pressed
     * @returns {void}
     */
    handleKeyboardEvent(event, code, pressed) {
        // Free camera
        if (code === 'KeyC' && pressed === true && event.shiftKey === true) {
            if (this.characterCaller !== undefined) {
                this.world.inputManager.setInputReceiver(this.characterCaller);
                this.characterCaller = undefined;
            }
        }
        else {
            for (const action in this.actions) {
                if (this.actions.hasOwnProperty(action)) {
                    const binding = this.actions[action];
                    if (_.includes(binding.eventCodes, code)) {
                        binding.isPressed = pressed;
                    }
                }
            }
        }
    }
    /**
     * @public
     * @param {WheelEvent} event
     * @param {number} value
     * @returns {void}
     */
    handleMouseWheel(event, value) {
        this.world.scrollTheTimeScale(value);
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @param {string} code
     * @param {boolean} pressed
     * @returns {void}
     */
    handleMouseButton(event, code, pressed) {
        for (const action in this.actions) {
            if (this.actions.hasOwnProperty(action)) {
                const binding = this.actions[action];
                if (_.includes(binding.eventCodes, code)) {
                    binding.isPressed = pressed;
                }
            }
        }
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @param {number} deltaX
     * @param {number} deltaY
     * @returns {void}
     */
    handleMouseMove(event, deltaX, deltaY) {
        this.move(deltaX, deltaY);
    }
    /**
     * @public
     * @returns {void}
     */
    inputReceiverInit() {
        this.target.copy(this.camera.position);
        this.setRadius(0, true);
        // this.world.dirLight.target = this.world.camera;
        this.world.updateControls([
            {
                keys: ['W', 'S', 'A', 'D'],
                desc: 'Move around'
            },
            {
                keys: ['E', 'Q'],
                desc: 'Move up / down'
            },
            {
                keys: ['Shift'],
                desc: 'Speed up'
            },
            {
                keys: ['Shift', '+', 'C'],
                desc: 'Exit free camera mode'
            },
        ]);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    inputReceiverUpdate(timeStep) {
        // Set fly speed
        let speed = this.movementSpeed * (this.actions.fast.isPressed ? timeStep * 600 : timeStep * 60);
        const up = Utils.getUp(this.camera);
        const right = Utils.getRight(this.camera);
        const forward = Utils.getBack(this.camera);
        this.upVelocity = THREE.MathUtils.lerp(this.upVelocity, +this.actions.up.isPressed - +this.actions.down.isPressed, 0.3);
        this.forwardVelocity = THREE.MathUtils.lerp(this.forwardVelocity, +this.actions.forward.isPressed - +this.actions.back.isPressed, 0.3);
        this.rightVelocity = THREE.MathUtils.lerp(this.rightVelocity, +this.actions.right.isPressed - +this.actions.left.isPressed, 0.3);
        this.target.add(up.multiplyScalar(speed * this.upVelocity));
        this.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
        this.target.add(right.multiplyScalar(speed * this.rightVelocity));
    }
}
