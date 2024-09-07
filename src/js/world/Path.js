import { PathNode } from './PathNode';
export class Path {
    /**
     * @public
     * @default {}
     */
    nodes = {};
    /**
     * @private
     */
    rootNode;
    /**
     * @param {THREE.Object3D} root
     */
    constructor(root) {
        this.rootNode = root;
        this.rootNode.traverse((child) => {
            this.addNode(child);
        });
        this.connectNodes();
    }
    /**
     * @public
     * @param {any} child
     * @returns {void}
     */
    addNode(child) {
        if (child.hasOwnProperty('userData') && child.userData.hasOwnProperty('data')) {
            if (child.userData.data === 'pathNode') {
                let node = new PathNode(child, this);
                this.nodes[child.name] = node;
            }
        }
    }
    /**
     * @public
     * @returns {void}
     */
    connectNodes() {
        for (const nodeName in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeName)) {
                const node = this.nodes[nodeName];
                node.nextNode = this.nodes[node.object.userData.nextNode];
                node.previousNode = this.nodes[node.object.userData.previousNode];
            }
        }
    }
}
