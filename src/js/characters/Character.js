/** @typedef {import('../interfaces/ICharacterAI').ICharacterAI} ICharacterAI */
/** @typedef {import('../world/World').World} World */
/** @typedef {import('../interfaces/IControllable').IControllable} IControllable */
/** @typedef {import('../interfaces/ICharacterState').ICharacterState} ICharacterState */
/** @typedef {import('../vehicles/VehicleSeat').VehicleSeat} VehicleSeat */
/** @typedef {import('../vehicles/Vehicle').Vehicle} Vehicle */
/** @typedef {import('three').Object3D} Object3D */
import * as THREE from 'three';
import * as CANNON from 'cannon';
import * as _ from 'lodash';
import * as Utils from '../core/FunctionLibrary';
import { KeyBinding } from '../core/KeyBinding';
import { VectorSpringSimulator } from '../physics/spring_simulation/VectorSpringSimulator';
import { RelativeSpringSimulator } from '../physics/spring_simulation/RelativeSpringSimulator';
import { Idle } from './character_states/Idle';
import { EnteringVehicle } from './character_states/vehicles/EnteringVehicle';
import { ExitingVehicle } from './character_states/vehicles/ExitingVehicle';
import { OpenVehicleDoor as OpenVehicleDoor } from './character_states/vehicles/OpenVehicleDoor';
import { Driving } from './character_states/vehicles/Driving';
import { ExitingAirplane } from './character_states/vehicles/ExitingAirplane';
import { CollisionGroups } from '../enums/CollisionGroups';
import { CapsuleCollider } from '../physics/colliders/CapsuleCollider';
import { VehicleEntryInstance } from './VehicleEntryInstance';
import { SeatType } from '../enums/SeatType';
import { GroundImpactData } from './GroundImpactData';
import { ClosestObjectFinder } from '../core/ClosestObjectFinder';
import { EntityType } from '../enums/EntityType';
/** @extends THREE.Object3D */
export class Character extends THREE.Object3D {
    /**
     * @public
     * @default 1
     */
    updateOrder = 1;
    /**
     * @public
     * @default EntityType.Character
     */
    entityType = EntityType.Character;
    /**
     * @public
     * @default 0
     */
    height = 0;
    /**
     * @public
     */
    tiltContainer;
    /**
     * @public
     */
    modelContainer;
    /**
     * @public
     * @default undefined[]
     */
    materials = [];
    /**
     * @public
     */
    mixer;
    /**
     * @public
     */
    animations;
    // Movement
    /**
     * @public
     * @default any
     */
    acceleration = new THREE.Vector3();
    /**
     * @public
     * @default any
     */
    velocity = new THREE.Vector3();
    /**
     * @public
     * @default any
     */
    arcadeVelocityInfluence = new THREE.Vector3();
    /**
     * @public
     * @default any
     */
    velocityTarget = new THREE.Vector3();
    /**
     * @public
     * @default false
     */
    arcadeVelocityIsAdditive = false;
    /**
     * @public
     * @default 0.8
     */
    defaultVelocitySimulatorDamping = 0.8;
    /**
     * @public
     * @default 50
     */
    defaultVelocitySimulatorMass = 50;
    /**
     * @public
     */
    velocitySimulator;
    /**
     * @public
     * @default 4
     */
    moveSpeed = 4;
    /**
     * @public
     * @default 0
     */
    angularVelocity = 0;
    /**
     * @public
     * @default any
     */
    orientation = new THREE.Vector3(0, 0, 1);
    /**
     * @public
     * @default any
     */
    orientationTarget = new THREE.Vector3(0, 0, 1);
    /**
     * @public
     * @default 0.5
     */
    defaultRotationSimulatorDamping = 0.5;
    /**
     * @public
     * @default 10
     */
    defaultRotationSimulatorMass = 10;
    /**
     * @public
     */
    rotationSimulator;
    /**
     * @public
     */
    viewVector;
    /**
     * @public
     */
    actions;
    /**
     * @public
     */
    characterCapsule;
    // Ray casting
    /**
     * @public
     * @default any
     */
    rayResult = new CANNON.RaycastResult();
    /**
     * @public
     * @default false
     */
    rayHasHit = false;
    /**
     * @public
     * @default 0.57
     */
    rayCastLength = 0.57;
    /**
     * @public
     * @default 0.03
     */
    raySafeOffset = 0.03;
    /**
     * @public
     * @default false
     */
    wantsToJump = false;
    /**
     * @public
     * @default -1
     */
    initJumpSpeed = -1;
    /**
     * @public
     * @default GroundImpactData
     */
    groundImpactData = new GroundImpactData();
    /**
     * @public
     */
    raycastBox;
    /**
     * @public
     */
    world;
    /**
     * @public
     */
    charState;
    /**
     * @public
     */
    behaviour;
    // Vehicles
    /**
     * @public
     */
    controlledObject;
    /**
     * @public
     * @default null
     */
    occupyingSeat = null;
    /**
     * @public
     * @default null
     */
    vehicleEntryInstance = null;
    /**
     * @private
     * @default true
     */
    physicsEnabled = true;
    /**
     * @param {any} gltf
     */
    constructor(gltf) {
        super();
        this.readCharacterData(gltf);
        this.setAnimations(gltf.animations);
        // The visuals group is centered for easy character tilting
        this.tiltContainer = new THREE.Group();
        this.add(this.tiltContainer);
        // Model container is used to reliably ground the character, as animation can alter the position of the model itself
        this.modelContainer = new THREE.Group();
        this.modelContainer.position.y = -0.57;
        this.tiltContainer.add(this.modelContainer);
        this.modelContainer.add(gltf.scene);
        this.mixer = new THREE.AnimationMixer(gltf.scene);
        this.velocitySimulator = new VectorSpringSimulator(60, this.defaultVelocitySimulatorMass, this.defaultVelocitySimulatorDamping);
        this.rotationSimulator = new RelativeSpringSimulator(60, this.defaultRotationSimulatorMass, this.defaultRotationSimulatorDamping);
        this.viewVector = new THREE.Vector3();
        // Actions
        this.actions = {
            'up': new KeyBinding('KeyW'),
            'down': new KeyBinding('KeyS'),
            'left': new KeyBinding('KeyA'),
            'right': new KeyBinding('KeyD'),
            'run': new KeyBinding('ShiftLeft'),
            'jump': new KeyBinding('Space'),
            'use': new KeyBinding('KeyE'),
            'enter': new KeyBinding('KeyF'),
            'enter_passenger': new KeyBinding('KeyG'),
            'seat_switch': new KeyBinding('KeyX'),
            'primary': new KeyBinding('Mouse0'),
            'secondary': new KeyBinding('Mouse1'),
        };
        // Physics
        // Player Capsule
        this.characterCapsule = new CapsuleCollider({
            mass: 1,
            position: new CANNON.Vec3(),
            height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0.0
        });
        // capsulePhysics.physical.collisionFilterMask = ~CollisionGroups.Trimesh;
        this.characterCapsule.body.shapes.forEach((shape) => {
            // tslint:disable-next-line: no-bitwise
            shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
        });
        this.characterCapsule.body.allowSleep = false;
        // Move character to different collision group for raycasting
        this.characterCapsule.body.collisionFilterGroup = 2;
        // Disable character rotation
        this.characterCapsule.body.fixedRotation = true;
        this.characterCapsule.body.updateMassProperties();
        // Ray cast debug
        const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new THREE.MeshLambertMaterial({
            color: 0xff0000
        });
        this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
        this.raycastBox.visible = false;
        // Physics pre/post step callback bindings
        this.characterCapsule.body.preStep = (body) => { this.physicsPreStep(body, this); };
        this.characterCapsule.body.postStep = (body) => { this.physicsPostStep(body, this); };
        // States
        this.setState(new Idle(this));
    }
    /**
     * @public
     * @param {[]} animations
     * @returns {void}
     */
    setAnimations(animations) {
        this.animations = animations;
    }
    /**
     * @public
     * @param {number} x
     * @param {number} [y=x]
     * @param {number} [z=x]
     * @returns {void}
     */
    setArcadeVelocityInfluence(x, y = x, z = x) {
        this.arcadeVelocityInfluence.set(x, y, z);
    }
    /**
     * @public
     * @param {THREE.Vector3} vector
     * @returns {void}
     */
    setViewVector(vector) {
        this.viewVector.copy(vector).normalize();
    }
    /**
     * Set state to the player. Pass state class (function) name.
     * @public
     * @param {ICharacterState} state
     * @returns {void}
     */
    setState(state) {
        this.charState = state;
        this.charState.onInputChange();
    }
    /**
     * @public
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {void}
     */
    setPosition(x, y, z) {
        if (this.physicsEnabled) {
            this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z);
            this.characterCapsule.body.position = new CANNON.Vec3(x, y, z);
            this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(x, y, z);
        }
        else {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
        }
    }
    /**
     * @public
     * @returns {void}
     */
    resetVelocity() {
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.velocity.z = 0;
        this.characterCapsule.body.velocity.x = 0;
        this.characterCapsule.body.velocity.y = 0;
        this.characterCapsule.body.velocity.z = 0;
        this.velocitySimulator.init();
    }
    /**
     * @public
     * @param {number} velZ
     * @param {number} [velX=0]
     * @param {number} [velY=0]
     * @returns {void}
     */
    setArcadeVelocityTarget(velZ, velX = 0, velY = 0) {
        this.velocityTarget.z = velZ;
        this.velocityTarget.x = velX;
        this.velocityTarget.y = velY;
    }
    /**
     * @public
     * @param {THREE.Vector3} vector
     * @param {boolean} [instantly=false]
     * @returns {void}
     */
    setOrientation(vector, instantly = false) {
        let lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
        this.orientationTarget.copy(lookVector);
        if (instantly) {
            this.orientation.copy(lookVector);
        }
    }
    /**
     * @public
     * @returns {void}
     */
    resetOrientation() {
        const forward = Utils.getForward(this);
        this.setOrientation(forward, true);
    }
    /**
     * @public
     * @param {ICharacterAI} behaviour
     * @returns {void}
     */
    setBehaviour(behaviour) {
        behaviour.character = this;
        this.behaviour = behaviour;
    }
    /**
     * @public
     * @param {boolean} value
     * @returns {void}
     */
    setPhysicsEnabled(value) {
        this.physicsEnabled = value;
        if (value === true) {
            this.world.physicsWorld.addBody(this.characterCapsule.body);
        }
        else {
            this.world.physicsWorld.remove(this.characterCapsule.body);
        }
    }
    /**
     * @public
     * @param {any} gltf
     * @returns {void}
     */
    readCharacterData(gltf) {
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                Utils.setupMeshProperties(child);
                if (child.material !== undefined) {
                    this.materials.push(child.material);
                }
            }
        });
    }
    /**
     * @public
     * @param {KeyboardEvent} event
     * @param {string} code
     * @param {boolean} pressed
     * @returns {void}
     */
    handleKeyboardEvent(event, code, pressed) {
        if (this.controlledObject !== undefined) {
            this.controlledObject.handleKeyboardEvent(event, code, pressed);
        }
        else {
            // Free camera
            if (code === 'KeyC' && pressed === true && event.shiftKey === true) {
                this.resetControls();
                this.world.cameraOperator.characterCaller = this;
                this.world.inputManager.setInputReceiver(this.world.cameraOperator);
            }
            else if (code === 'KeyR' && pressed === true && event.shiftKey === true) {
                this.world.restartScenario();
            }
            else {
                for (const action in this.actions) {
                    if (this.actions.hasOwnProperty(action)) {
                        const binding = this.actions[action];
                        if (_.includes(binding.eventCodes, code)) {
                            this.triggerAction(action, pressed);
                        }
                    }
                }
            }
        }
    }
    /**
     * @public
     * @param {MouseEvent} event
     * @param {string} code
     * @param {boolean} pressed
     * @returns {void}
     */
    handleMouseButton(event, code, pressed) {
        if (this.controlledObject !== undefined) {
            this.controlledObject.handleMouseButton(event, code, pressed);
        }
        else {
            for (const action in this.actions) {
                if (this.actions.hasOwnProperty(action)) {
                    const binding = this.actions[action];
                    if (_.includes(binding.eventCodes, code)) {
                        this.triggerAction(action, pressed);
                    }
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
        if (this.controlledObject !== undefined) {
            this.controlledObject.handleMouseMove(event, deltaX, deltaY);
        }
        else {
            this.world.cameraOperator.move(deltaX, deltaY);
        }
    }
    /**
     * @public
     * @param {WheelEvent} event
     * @param {number} value
     * @returns {void}
     */
    handleMouseWheel(event, value) {
        if (this.controlledObject !== undefined) {
            this.controlledObject.handleMouseWheel(event, value);
        }
        else {
            this.world.scrollTheTimeScale(value);
        }
    }
    /**
     * @public
     * @param {string} actionName
     * @param {boolean} value
     * @returns {void}
     */
    triggerAction(actionName, value) {
        // Get action and set it's parameters
        let action = this.actions[actionName];
        if (action.isPressed !== value) {
            // Set value
            action.isPressed = value;
            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;
            // Set the 'just' attributes
            if (value)
                action.justPressed = true;
            else
                action.justReleased = true;
            // Tell player to handle states according to new input
            this.charState.onInputChange();
            // Reset the 'just' attributes
            action.justPressed = false;
            action.justReleased = false;
        }
    }
    /**
     * @public
     * @returns {void}
     */
    takeControl() {
        if (this.world !== undefined) {
            this.world.inputManager.setInputReceiver(this);
        }
        else {
            console.warn('Attempting to take control of a character that doesn\'t belong to a world.');
        }
    }
    /**
     * @public
     * @returns {void}
     */
    resetControls() {
        for (const action in this.actions) {
            if (this.actions.hasOwnProperty(action)) {
                this.triggerAction(action, false);
            }
        }
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        this.behaviour?.update(timeStep);
        this.vehicleEntryInstance?.update(timeStep);
        // console.log(this.occupyingSeat);
        this.charState?.update(timeStep);
        // this.visuals.position.copy(this.modelOffset);
        if (this.physicsEnabled)
            this.springMovement(timeStep);
        if (this.physicsEnabled)
            this.springRotation(timeStep);
        if (this.physicsEnabled)
            this.rotateModel();
        if (this.mixer !== undefined)
            this.mixer.update(timeStep);
        // Sync physics/graphics
        if (this.physicsEnabled) {
            this.position.set(this.characterCapsule.body.interpolatedPosition.x, this.characterCapsule.body.interpolatedPosition.y, this.characterCapsule.body.interpolatedPosition.z);
        }
        else {
            let newPos = new THREE.Vector3();
            this.getWorldPosition(newPos);
            this.characterCapsule.body.position.copy(Utils.cannonVector(newPos));
            this.characterCapsule.body.interpolatedPosition.copy(Utils.cannonVector(newPos));
        }
        this.updateMatrixWorld();
    }
    /**
     * @public
     * @returns {void}
     */
    inputReceiverInit() {
        if (this.controlledObject !== undefined) {
            this.controlledObject.inputReceiverInit();
            return;
        }
        this.world.cameraOperator.setRadius(1.6, true);
        this.world.cameraOperator.followMode = false;
        // this.world.dirLight.target = this;
        this.displayControls();
    }
    /**
     * @public
     * @returns {void}
     */
    displayControls() {
        this.world.updateControls([
            {
                keys: ['W', 'A', 'S', 'D'],
                desc: 'Movement'
            },
            {
                keys: ['Shift'],
                desc: 'Sprint'
            },
            {
                keys: ['Space'],
                desc: 'Jump'
            },
            {
                keys: ['F', 'or', 'G'],
                desc: 'Enter vehicle'
            },
            {
                keys: ['Shift', '+', 'R'],
                desc: 'Respawn'
            },
            {
                keys: ['Shift', '+', 'C'],
                desc: 'Free camera'
            },
        ]);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    inputReceiverUpdate(timeStep) {
        if (this.controlledObject !== undefined) {
            this.controlledObject.inputReceiverUpdate(timeStep);
        }
        else {
            // Look in camera's direction
            this.viewVector = new THREE.Vector3().subVectors(this.position, this.world.camera.position);
            this.getWorldPosition(this.world.cameraOperator.target);
        }
    }
    /**
     * @public
     * @param {string} clipName
     * @param {number} fadeIn
     * @returns {number}
     */
    setAnimation(clipName, fadeIn) {
        if (this.mixer !== undefined) {
            // gltf
            let clip = THREE.AnimationClip.findByName(this.animations, clipName);
            let action = this.mixer.clipAction(clip);
            if (action === null) {
                console.error(`Animation ${clipName} not found!`);
                return 0;
            }
            this.mixer.stopAllAction();
            action.fadeIn(fadeIn);
            action.play();
            return action.getClip().duration;
        }
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    springMovement(timeStep) {
        // Simulator
        this.velocitySimulator.target.copy(this.velocityTarget);
        this.velocitySimulator.simulate(timeStep);
        // Update values
        this.velocity.copy(this.velocitySimulator.position);
        this.acceleration.copy(this.velocitySimulator.velocity);
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    springRotation(timeStep) {
        // Spring rotation
        // Figure out angle between current and target orientation
        let angle = Utils.getSignedAngleBetweenVectors(this.orientation, this.orientationTarget);
        // Simulator
        this.rotationSimulator.target = angle;
        this.rotationSimulator.simulate(timeStep);
        let rot = this.rotationSimulator.position;
        // Updating values
        this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        this.angularVelocity = this.rotationSimulator.velocity;
    }
    /**
     * @public
     * @returns {THREE.Vector3}
     */
    getLocalMovementDirection() {
        const positiveX = this.actions.right.isPressed ? -1 : 0;
        const negativeX = this.actions.left.isPressed ? 1 : 0;
        const positiveZ = this.actions.up.isPressed ? 1 : 0;
        const negativeZ = this.actions.down.isPressed ? -1 : 0;
        return new THREE.Vector3(positiveX + negativeX, 0, positiveZ + negativeZ).normalize();
    }
    /**
     * @public
     * @returns {THREE.Vector3}
     */
    getCameraRelativeMovementVector() {
        const localDirection = this.getLocalMovementDirection();
        const flatViewVector = new THREE.Vector3(this.viewVector.x, 0, this.viewVector.z).normalize();
        return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
    }
    /**
     * @public
     * @returns {void}
     */
    setCameraRelativeOrientationTarget() {
        if (this.vehicleEntryInstance === null) {
            let moveVector = this.getCameraRelativeMovementVector();
            if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
                this.setOrientation(this.orientation);
            }
            else {
                this.setOrientation(moveVector);
            }
        }
    }
    /**
     * @public
     * @returns {void}
     */
    rotateModel() {
        this.lookAt(this.position.x + this.orientation.x, this.position.y + this.orientation.y, this.position.z + this.orientation.z);
        this.tiltContainer.rotation.z = (-this.angularVelocity * 2.3 * this.velocity.length());
        this.tiltContainer.position.setY((Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) / 2) - 0.5);
    }
    /**
     * @public
     * @param {number} [initJumpSpeed=-1]
     * @returns {void}
     */
    jump(initJumpSpeed = -1) {
        this.wantsToJump = true;
        this.initJumpSpeed = initJumpSpeed;
    }
    /**
     * @public
     * @param {boolean} wantsToDrive
     * @returns {void}
     */
    findVehicleToEnter(wantsToDrive) {
        // reusable world position variable
        let worldPos = new THREE.Vector3();
        // Find best vehicle
        let vehicleFinder = new ClosestObjectFinder(this.position, 10);
        this.world.vehicles.forEach((vehicle) => {
            vehicleFinder.consider(vehicle, vehicle.position);
        });
        if (vehicleFinder.closestObject !== undefined) {
            let vehicle = vehicleFinder.closestObject;
            let vehicleEntryInstance = new VehicleEntryInstance(this);
            vehicleEntryInstance.wantsToDrive = wantsToDrive;
            // Find best seat
            let seatFinder = new ClosestObjectFinder(this.position);
            for (const seat of vehicle.seats) {
                if (wantsToDrive) {
                    // Consider driver seats
                    if (seat.type === SeatType.Driver) {
                        seat.seatPointObject.getWorldPosition(worldPos);
                        seatFinder.consider(seat, worldPos);
                    }
                    // Consider passenger seats connected to driver seats
                    else if (seat.type === SeatType.Passenger) {
                        for (const connSeat of seat.connectedSeats) {
                            if (connSeat.type === SeatType.Driver) {
                                seat.seatPointObject.getWorldPosition(worldPos);
                                seatFinder.consider(seat, worldPos);
                                break;
                            }
                        }
                    }
                }
                else {
                    // Consider passenger seats
                    if (seat.type === SeatType.Passenger) {
                        seat.seatPointObject.getWorldPosition(worldPos);
                        seatFinder.consider(seat, worldPos);
                    }
                }
            }
            if (seatFinder.closestObject !== undefined) {
                let targetSeat = seatFinder.closestObject;
                vehicleEntryInstance.targetSeat = targetSeat;
                let entryPointFinder = new ClosestObjectFinder(this.position);
                for (const point of targetSeat.entryPoints) {
                    point.getWorldPosition(worldPos);
                    entryPointFinder.consider(point, worldPos);
                }
                if (entryPointFinder.closestObject !== undefined) {
                    vehicleEntryInstance.entryPoint = entryPointFinder.closestObject;
                    this.triggerAction('up', true);
                    this.vehicleEntryInstance = vehicleEntryInstance;
                }
            }
        }
    }
    /**
     * @public
     * @param {VehicleSeat} seat
     * @param {THREE.Object3D} entryPoint
     * @returns {void}
     */
    enterVehicle(seat, entryPoint) {
        this.resetControls();
        if (seat.door?.rotation < 0.5) {
            this.setState(new OpenVehicleDoor(this, seat, entryPoint));
        }
        else {
            this.setState(new EnteringVehicle(this, seat, entryPoint));
        }
    }
    /**
     * @public
     * @param {Vehicle} vehicle
     * @param {VehicleSeat} seat
     * @returns {void}
     */
    teleportToVehicle(vehicle, seat) {
        this.resetVelocity();
        this.rotateModel();
        this.setPhysicsEnabled(false);
        vehicle.attach(this);
        this.setPosition(seat.seatPointObject.position.x, seat.seatPointObject.position.y + 0.6, seat.seatPointObject.position.z);
        this.quaternion.copy(seat.seatPointObject.quaternion);
        this.occupySeat(seat);
        this.setState(new Driving(this, seat));
        this.startControllingVehicle(vehicle, seat);
    }
    /**
     * @public
     * @param {IControllable} vehicle
     * @param {VehicleSeat} seat
     * @returns {void}
     */
    startControllingVehicle(vehicle, seat) {
        if (this.controlledObject !== vehicle) {
            this.transferControls(vehicle);
            this.resetControls();
            this.controlledObject = vehicle;
            this.controlledObject.allowSleep(false);
            vehicle.inputReceiverInit();
            vehicle.controllingCharacter = this;
        }
    }
    /**
     * @public
     * @param {IControllable} entity
     * @returns {void}
     */
    transferControls(entity) {
        // Currently running through all actions of this character and the vehicle,
        // comparing keycodes of actions and based on that triggering vehicle's actions
        // Maybe we should ask input manager what's the current state of the keyboard
        // and read those values... TODO
        for (const action1 in this.actions) {
            if (this.actions.hasOwnProperty(action1)) {
                for (const action2 in entity.actions) {
                    if (entity.actions.hasOwnProperty(action2)) {
                        let a1 = this.actions[action1];
                        let a2 = entity.actions[action2];
                        a1.eventCodes.forEach((code1) => {
                            a2.eventCodes.forEach((code2) => {
                                if (code1 === code2) {
                                    entity.triggerAction(action2, a1.isPressed);
                                }
                            });
                        });
                    }
                }
            }
        }
    }
    /**
     * @public
     * @returns {void}
     */
    stopControllingVehicle() {
        if (this.controlledObject?.controllingCharacter === this) {
            this.controlledObject.allowSleep(true);
            this.controlledObject.controllingCharacter = undefined;
            this.controlledObject.resetControls();
            this.controlledObject = undefined;
            this.inputReceiverInit();
        }
    }
    /**
     * @public
     * @returns {void}
     */
    exitVehicle() {
        if (this.occupyingSeat !== null) {
            if (this.occupyingSeat.vehicle.entityType === EntityType.Airplane) {
                this.setState(new ExitingAirplane(this, this.occupyingSeat));
            }
            else {
                this.setState(new ExitingVehicle(this, this.occupyingSeat));
            }
            this.stopControllingVehicle();
        }
    }
    /**
     * @public
     * @param {VehicleSeat} seat
     * @returns {void}
     */
    occupySeat(seat) {
        this.occupyingSeat = seat;
        seat.occupiedBy = this;
    }
    /**
     * @public
     * @returns {void}
     */
    leaveSeat() {
        if (this.occupyingSeat !== null) {
            this.occupyingSeat.occupiedBy = null;
            this.occupyingSeat = null;
        }
    }
    /**
     * @public
     * @param {CANNON.Body} body
     * @param {Character} character
     * @returns {void}
     */
    physicsPreStep(body, character) {
        character.feetRaycast();
        // Raycast debug
        if (character.rayHasHit) {
            if (character.raycastBox.visible) {
                character.raycastBox.position.x = character.rayResult.hitPointWorld.x;
                character.raycastBox.position.y = character.rayResult.hitPointWorld.y;
                character.raycastBox.position.z = character.rayResult.hitPointWorld.z;
            }
        }
        else {
            if (character.raycastBox.visible) {
                character.raycastBox.position.set(body.position.x, body.position.y - character.rayCastLength - character.raySafeOffset, body.position.z);
            }
        }
    }
    /**
     * @public
     * @returns {void}
     */
    feetRaycast() {
        // Player ray casting
        // Create ray
        let body = this.characterCapsule.body;
        const start = new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
        const end = new CANNON.Vec3(body.position.x, body.position.y - this.rayCastLength - this.raySafeOffset, body.position.z);
        // Raycast options
        const rayCastOptions = {
            collisionFilterMask: CollisionGroups.Default,
            skipBackfaces: true /* ignore back faces */
        };
        // Cast the ray
        this.rayHasHit = this.world.physicsWorld.raycastClosest(start, end, rayCastOptions, this.rayResult);
    }
    /**
     * @public
     * @param {CANNON.Body} body
     * @param {Character} character
     * @returns {void}
     */
    physicsPostStep(body, character) {
        // Get velocities
        let simulatedVelocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
        // Take local velocity
        let arcadeVelocity = new THREE.Vector3().copy(character.velocity).multiplyScalar(character.moveSpeed);
        // Turn local into global
        arcadeVelocity = Utils.appplyVectorMatrixXZ(character.orientation, arcadeVelocity);
        let newVelocity = new THREE.Vector3();
        // Additive velocity mode
        if (character.arcadeVelocityIsAdditive) {
            newVelocity.copy(simulatedVelocity);
            let globalVelocityTarget = Utils.appplyVectorMatrixXZ(character.orientation, character.velocityTarget);
            let add = new THREE.Vector3().copy(arcadeVelocity).multiply(character.arcadeVelocityInfluence);
            if (Math.abs(simulatedVelocity.x) < Math.abs(globalVelocityTarget.x * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)) {
                newVelocity.x += add.x;
            }
            if (Math.abs(simulatedVelocity.y) < Math.abs(globalVelocityTarget.y * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)) {
                newVelocity.y += add.y;
            }
            if (Math.abs(simulatedVelocity.z) < Math.abs(globalVelocityTarget.z * character.moveSpeed) || Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)) {
                newVelocity.z += add.z;
            }
        }
        else {
            newVelocity = new THREE.Vector3(THREE.MathUtils.lerp(simulatedVelocity.x, arcadeVelocity.x, character.arcadeVelocityInfluence.x), THREE.MathUtils.lerp(simulatedVelocity.y, arcadeVelocity.y, character.arcadeVelocityInfluence.y), THREE.MathUtils.lerp(simulatedVelocity.z, arcadeVelocity.z, character.arcadeVelocityInfluence.z));
        }
        // If we're hitting the ground, stick to ground
        if (character.rayHasHit) {
            // Flatten velocity
            newVelocity.y = 0;
            // Move on top of moving objects
            if (character.rayResult.body.mass > 0) {
                let pointVelocity = new CANNON.Vec3();
                character.rayResult.body.getVelocityAtWorldPoint(character.rayResult.hitPointWorld, pointVelocity);
                newVelocity.add(Utils.threeVector(pointVelocity));
            }
            // Measure the normal vector offset from direct "up" vector
            // and transform it into a matrix
            let up = new THREE.Vector3(0, 1, 0);
            let normal = new THREE.Vector3(character.rayResult.hitNormalWorld.x, character.rayResult.hitNormalWorld.y, character.rayResult.hitNormalWorld.z);
            let q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            let m = new THREE.Matrix4().makeRotationFromQuaternion(q);
            // Rotate the velocity vector
            newVelocity.applyMatrix4(m);
            // Compensate for gravity
            // newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;
            // Apply velocity
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;
            // Ground character
            body.position.y = character.rayResult.hitPointWorld.y + character.rayCastLength + (newVelocity.y / character.world.physicsFrameRate);
        }
        else {
            // If we're in air
            body.velocity.x = newVelocity.x;
            body.velocity.y = newVelocity.y;
            body.velocity.z = newVelocity.z;
            // Save last in-air information
            character.groundImpactData.velocity.x = body.velocity.x;
            character.groundImpactData.velocity.y = body.velocity.y;
            character.groundImpactData.velocity.z = body.velocity.z;
        }
        // Jumping
        if (character.wantsToJump) {
            // If initJumpSpeed is set
            if (character.initJumpSpeed > -1) {
                // Flatten velocity
                body.velocity.y = 0;
                let speed = Math.max(character.velocitySimulator.position.length() * 4, character.initJumpSpeed);
                body.velocity = Utils.cannonVector(character.orientation.clone().multiplyScalar(speed));
            }
            else {
                // Moving objects compensation
                let add = new CANNON.Vec3();
                character.rayResult.body.getVelocityAtWorldPoint(character.rayResult.hitPointWorld, add);
                body.velocity.vsub(add, body.velocity);
            }
            // Add positive vertical velocity 
            body.velocity.y += 4;
            // Move above ground by 2x safe offset value
            body.position.y += character.raySafeOffset * 2;
            // Reset flag
            character.wantsToJump = false;
        }
    }
    /**
     * @public
     * @param {World} world
     * @returns {void}
     */
    addToWorld(world) {
        if (_.includes(world.characters, this)) {
            console.warn('Adding character to a world in which it already exists.');
        }
        else {
            // Set world
            this.world = world;
            // Register character
            world.characters.push(this);
            // Register physics
            world.physicsWorld.addBody(this.characterCapsule.body);
            // Add to graphicsWorld
            world.graphicsWorld.add(this);
            world.graphicsWorld.add(this.raycastBox);
            // Shadow cascades
            this.materials.forEach((mat) => {
                world.sky.csm.setupMaterial(mat);
            });
        }
    }
    /**
     * @public
     * @param {World} world
     * @returns {void}
     */
    removeFromWorld(world) {
        if (!_.includes(world.characters, this)) {
            console.warn('Removing character from a world in which it isn\'t present.');
        }
        else {
            if (world.inputManager.inputReceiver === this) {
                world.inputManager.inputReceiver = undefined;
            }
            this.world = undefined;
            // Remove from characters
            _.pull(world.characters, this);
            // Remove physics
            world.physicsWorld.remove(this.characterCapsule.body);
            // Remove visuals
            world.graphicsWorld.remove(this);
            world.graphicsWorld.remove(this.raycastBox);
        }
    }
}
