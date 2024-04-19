import Phaser from "phaser";
// import { createUIAnims } from '../anims/UIAnims';
import { sceneEvents } from "../events/EventCenter";

// let hearts;
// let hearts = Phaser.GameObjects.Group;
export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: 'game-ui' })
    }


    create() {
        this.hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        });

        this.hearts.createMultiple({
            key: 'uiHeartFull',
            setXY: {
                x: 10,
                y: 10,
                stepX: 20
            },
            quantity: 3
        });

        const heartsStroke= this.add.group({
            classType: Phaser.GameObjects.Image
        });

        heartsStroke.createMultiple({
            key: 'uiHeartStroke',
            setXY: {
                x: 10,
                y: 10,
                stepX: 20
            },
            quantity: 3
        });

        sceneEvents.on('player-health-changed', this.handlePlayerHealthChanged, this)

        this.events.once('shutdown', () => {
            sceneEvents.off('player-health-changed', this.handlePlayerHealthChanged);
        });
    }

    handlePlayerHealthChanged(health) {
        this.hearts.children.each((go, idx) => {
          const heart = go;
          if (idx < health) {
            heart.setTexture('uiHeartFull');
          } else {
            heart.setTexture('uiHeartEmpty');
          }
        })
    }
}