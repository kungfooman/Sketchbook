/** @typedef {import('../world/World').World} World */
import { InfoStackMessage } from './InfoStackMessage';
import { EntityType } from '../enums/EntityType';
export class InfoStack {
    /**
     * @public
     * @default 3
     */
    updateOrder = 3;
    /**
     * @public
     * @default EntityType.System
     */
    entityType = EntityType.System;
    /**
     * @public
     * @default undefined[]
     */
    messages = [];
    /**
     * @public
     * @default "animate__slideInLeft"
     */
    entranceAnimation = 'animate__slideInLeft';
    /**
     * @public
     * @default "animate__backOutDown"
     */
    exitAnimation = 'animate__backOutDown';
    /**
     * @public
     * @default 3
     */
    messageDuration = 3;
    /**
     * @public
     * @param {string} text
     * @returns {void}
     */
    addMessage(text) {
        let messageElement = document.createElement('div');
        messageElement.classList.add('console-message', 'animate__animated', this.entranceAnimation);
        messageElement.style.setProperty('--animate-duration', '0.3s');
        let textElement = document.createTextNode(text);
        messageElement.appendChild(textElement);
        document.getElementById('console').prepend(messageElement);
        this.messages.push(new InfoStackMessage(this, messageElement));
    }
    /**
     * @public
     * @param {number} timeStep
     * @returns {void}
     */
    update(timeStep) {
        for (const message of this.messages) {
            message.update(timeStep);
        }
    }
    /**
     * @public
     * @param {World} world
     * @returns {void}
     */
    addToWorld(world) {
    }
    /**
     * @public
     * @param {World} world
     * @returns {void}
     */
    removeFromWorld(world) {
    }
}
