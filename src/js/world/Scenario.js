/** @typedef {import('../interfaces/ISpawnPoint').ISpawnPoint} ISpawnPoint */
import { VehicleSpawnPoint } from './VehicleSpawnPoint';
import { CharacterSpawnPoint } from './CharacterSpawnPoint';
export class Scenario {
    /**
     * @public
     */
    id;
    /**
     * @public
     */
    name;
    /**
     * @public
     * @default false
     */
    spawnAlways = false;
    /**
     * @public
     * @default false
     */
    default = false;
    /**
     * @public
     */
    world;
    /**
     * @public
     */
    descriptionTitle;
    /**
     * @public
     */
    descriptionContent;
    /**
     * @private
     */
    rootNode;
    /**
     * @private
     * @default undefined[]
     */
    spawnPoints = [];
    /**
     * @private
     * @default false
     */
    invisible = false;
    /**
     * @private
     */
    initialCameraAngle;
    /**
     * @param {THREE.Object3D} root
     * @param {World} world
     */
    constructor(root, world) {
        this.rootNode = root;
        this.world = world;
        this.id = root.name;
        // Scenario
        if (root.userData.hasOwnProperty('name')) {
            this.name = root.userData.name;
        }
        if (root.userData.hasOwnProperty('default') && root.userData.default === 'true') {
            this.default = true;
        }
        if (root.userData.hasOwnProperty('spawn_always') && root.userData.spawn_always === 'true') {
            this.spawnAlways = true;
        }
        if (root.userData.hasOwnProperty('invisible') && root.userData.invisible === 'true') {
            this.invisible = true;
        }
        if (root.userData.hasOwnProperty('desc_title')) {
            this.descriptionTitle = root.userData.desc_title;
        }
        if (root.userData.hasOwnProperty('desc_content')) {
            this.descriptionContent = root.userData.desc_content;
        }
        if (root.userData.hasOwnProperty('camera_angle')) {
            this.initialCameraAngle = root.userData.camera_angle;
        }
        if (!this.invisible)
            this.createLaunchLink();
        // Find all scenario spawns and enitites
        root.traverse((child) => {
            if (child.hasOwnProperty('userData') && child.userData.hasOwnProperty('data')) {
                if (child.userData.data === 'spawn') {
                    if (child.userData.type === 'car' || child.userData.type === 'airplane' || child.userData.type === 'heli') {
                        let sp = new VehicleSpawnPoint(child);
                        if (child.userData.hasOwnProperty('type')) {
                            sp.type = child.userData.type;
                        }
                        if (child.userData.hasOwnProperty('driver')) {
                            sp.driver = child.userData.driver;
                            if (child.userData.driver === 'ai' && child.userData.hasOwnProperty('first_node')) {
                                sp.firstAINode = child.userData.first_node;
                            }
                        }
                        this.spawnPoints.push(sp);
                    }
                    else if (child.userData.type === 'player') {
                        let sp = new CharacterSpawnPoint(child);
                        this.spawnPoints.push(sp);
                    }
                }
            }
        });
    }
    /**
     * @public
     * @returns {void}
     */
    createLaunchLink() {
        this.world.params[this.name] = () => {
            this.world.launchScenario(this.id);
        };
        this.world.scenarioGUIFolder.add(this.world.params, this.name);
    }
    /**
     * @public
     * @param {LoadingManager} loadingManager
     * @param {World} world
     * @returns {void}
     */
    launch(loadingManager, world) {
        this.spawnPoints.forEach((sp) => {
            sp.spawn(loadingManager, world);
        });
        if (!this.spawnAlways) {
            loadingManager.createWelcomeScreenCallback(this);
            world.cameraOperator.theta = this.initialCameraAngle;
            world.cameraOperator.phi = 15;
        }
    }
}
