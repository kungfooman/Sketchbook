/** @typedef {import('../world/World').World} World */
/** @typedef {import('../interfaces/IInputReceiver').IInputReceiver} IInputReceiver */
/** @typedef {import('../enums/EntityType').EntityType} EntityType */
export class InputManager {
    /**
     * @public
     * @default 3
     */
    updateOrder = 3;
    /**
     * @public
     */
    world;
    /**
     * @public
     */
    domElement;
    /**
     * @public
     */
    pointerLock;
    /**
     * @public
     */
    isLocked;
    /**
     * @public
     */
    inputReceiver;
    /**
     * @public
     */
    boundOnMouseDown;
    /**
     * @public
     */
    boundOnMouseMove;
    /**
     * @public
     */
    boundOnMouseUp;
    /**
     * @public
     */
    boundOnMouseWheelMove;
    /**
     * @public
     */
    boundOnPointerlockChange;
    /**
     * @public
     */
    boundOnPointerlockError;
    /**
     * @public
     */
    boundOnKeyDown;
    /**
     * @public
     */
    boundOnKeyUp;
    /**
     * @param {World} world
     * @param {HTMLElement} domElement
     */
    constructor(world, domElement) {
        this.world = world;
        this.pointerLock = world.params.Pointer_Lock;
        this.domElement = domElement || document.body;
        this.isLocked = false;
        // Bindings for later event use
        // Mouse
        this.boundOnMouseDown = (evt) => this.onMouseDown(evt);
        this.boundOnMouseMove = (evt) => this.onMouseMove(evt);
        this.boundOnMouseUp = (evt) => this.onMouseUp(evt);
        this.boundOnMouseWheelMove = (evt) => this.onMouseWheelMove(evt);
        // Pointer lock
        this.boundOnPointerlockChange = (evt) => this.onPointerlockChange(evt);
        this.boundOnPointerlockError = (evt) => this.onPointerlockError(evt);
        // Keys
        this.boundOnKeyDown = (evt) => this.onKeyDown(evt);
        this.boundOnKeyUp = (evt) => this.onKeyUp(evt);
        // Init event listeners
        // Mouse
        this.domElement.addEventListener('mousedown', this.boundOnMouseDown, false);
        document.addEventListener('wheel', this.boundOnMouseWheelMove, false);
        document.addEventListener('pointerlockchange', this.boundOnPointerlockChange, false);
        document.addEventListener('pointerlockerror', this.boundOnPointerlockError, false);
        // Keys
        document.addEventListener('keydown', this.boundOnKeyDown, false);
        document.addEventListener('keyup', this.boundOnKeyUp, false);
        world.registerUpdatable(this);
    }
    /**
     * @public
     * @param {number} timestep
     * @param {number} unscaledTimeStep
     * @returns {void}
     */
    update(timestep, unscaledTimeStep) {
        if (this.inputReceiver === undefined && this.world !== undefined && this.world.cameraOperator !== undefined) {
            this.setInputReceiver(this.world.cameraOperator);
        }
        this.inputReceiver?.inputReceiverUpdate(unscaledTimeStep);
    }
    /**
     * @public
     * @param {IInputReceiver} receiver
     * @returns {void}
     */
    setInputReceiver(receiver) {
        this.inputReceiver = receiver;
        this.inputReceiver.inputReceiverInit();
    }
    /**
     * @public
     * @param {boolean} enabled
     * @returns {void}
     */
    setPointerLock(enabled) {
        this.pointerLock = enabled;
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @returns {void}
     */
    onPointerlockChange(event) {
        if (document.pointerLockElement === this.domElement) {
            this.domElement.addEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false);
            this.isLocked = true;
        }
        else {
            this.domElement.removeEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false);
            this.isLocked = false;
        }
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @returns {void}
     */
    onPointerlockError(event) {
        console.error('PointerLockControls: Unable to use Pointer Lock API');
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseDown(event) {
        if (this.pointerLock) {
            this.domElement.requestPointerLock();
        }
        else {
            this.domElement.addEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false);
        }
        if (this.inputReceiver !== undefined) {
            this.inputReceiver.handleMouseButton(event, 'mouse' + event.button, true);
        }
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseMove(event) {
        if (this.inputReceiver !== undefined) {
            this.inputReceiver.handleMouseMove(event, event.movementX, event.movementY);
        }
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @returns {void}
     */
    onMouseUp(event) {
        if (!this.pointerLock) {
            this.domElement.removeEventListener('mousemove', this.boundOnMouseMove, false);
            this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false);
        }
        if (this.inputReceiver !== undefined) {
            this.inputReceiver.handleMouseButton(event, 'mouse' + event.button, false);
        }
    }
    /**
     * @public
     * @param {KeyboardEvent} event
     * @returns {void}
     */
    onKeyDown(event) {
        if (this.inputReceiver !== undefined) {
            this.inputReceiver.handleKeyboardEvent(event, event.code, true);
        }
    }
    /**
     * @public
     * @param {KeyboardEvent} event
     * @returns {void}
     */
    onKeyUp(event) {
        if (this.inputReceiver !== undefined) {
            this.inputReceiver.handleKeyboardEvent(event, event.code, false);
        }
    }
    /**
     * @public
     * @param {WheelEvent} event
     * @returns {void}
     */
    onMouseWheelMove(event) {
        if (this.inputReceiver !== undefined) {
            this.inputReceiver.handleMouseWheel(event, event.deltaY);
        }
    }
}
