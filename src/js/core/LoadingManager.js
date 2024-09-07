/** @typedef {import('../world/Scenario').Scenario} Scenario */
/** @typedef {import('../world/World').World} World */
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LoadingTrackerEntry } from './LoadingTrackerEntry';
import { UIManager } from './UIManager';
import Swal from 'sweetalert2';
export class LoadingManager {
    /**
     * @public
     * @default true
     */
    firstLoad = true;
    /**
     * @public
     */
    onFinishedCallback;
    /**
     * @private
     */
    world;
    /**
     * @private
     */
    gltfLoader;
    /**
     * @private
     * @default undefined[]
     */
    loadingTracker = [];
    /**
     * @param {World} world
     */
    constructor(world) {
        this.world = world;
        this.gltfLoader = new GLTFLoader();
        this.world.setTimeScale(0);
        UIManager.setUserInterfaceVisible(false);
        UIManager.setLoadingScreenVisible(true);
    }
    /**
     * @public
     * @param {string} path
     * @param {(gltf: any) => void} onLoadingFinished
     * @returns {void}
     */
    loadGLTF(path, onLoadingFinished) {
        let trackerEntry = this.addLoadingEntry(path);
        this.gltfLoader.load(path, (gltf) => {
            onLoadingFinished(gltf);
            this.doneLoading(trackerEntry);
        }, (xhr) => {
            if (xhr.lengthComputable) {
                trackerEntry.progress = xhr.loaded / xhr.total;
            }
        }, (error) => {
            console.error(error);
        });
    }
    /**
     * @public
     * @param {string} path
     * @returns {LoadingTrackerEntry}
     */
    addLoadingEntry(path) {
        let entry = new LoadingTrackerEntry(path);
        this.loadingTracker.push(entry);
        return entry;
    }
    /**
     * @public
     * @param {LoadingTrackerEntry} trackerEntry
     * @returns {void}
     */
    doneLoading(trackerEntry) {
        trackerEntry.finished = true;
        trackerEntry.progress = 1;
        if (this.isLoadingDone()) {
            if (this.onFinishedCallback !== undefined) {
                this.onFinishedCallback();
            }
            else {
                UIManager.setUserInterfaceVisible(true);
            }
            UIManager.setLoadingScreenVisible(false);
        }
    }
    /**
     * @public
     * @param {Scenario} scenario
     * @returns {void}
     */
    createWelcomeScreenCallback(scenario) {
        if (this.onFinishedCallback === undefined) {
            this.onFinishedCallback = () => {
                this.world.update(1, 1);
                Swal.fire({
                    title: scenario.descriptionTitle,
                    html: scenario.descriptionContent,
                    confirmButtonText: 'Play',
                    buttonsStyling: false,
                    onClose: () => {
                        this.world.setTimeScale(1);
                        UIManager.setUserInterfaceVisible(true);
                    }
                });
            };
        }
    }
    /**
     * @private
     * @returns {number}
     */
    getLoadingPercentage() {
        let done = true;
        let total = 0;
        let finished = 0;
        for (const item of this.loadingTracker) {
            total++;
            finished += item.progress;
            if (!item.finished)
                done = false;
        }
        return (finished / total) * 100;
    }
    /**
     * @private
     * @returns {boolean}
     */
    isLoadingDone() {
        for (const entry of this.loadingTracker) {
            if (!entry.finished)
                return false;
        }
        return true;
    }
}
