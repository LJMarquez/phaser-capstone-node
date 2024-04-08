import Phaser from "phaser";
import { createUIAnims } from '../anims/UIAnims';


export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: 'game-ui' })
    }

    create() {
        createUIAnims(this.anims);

        const hearts = this.add.group({
            classType: Phaser.GameObjects.Image
        });

        hearts.createMultiple({
            key: 'uiHeartFull',
            setXY: {
                x: 10,
                y: 10,
                stepX: 16
            },
            quantity: 3
        })
        console.log("ui");
    }
}