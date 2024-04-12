import Phaser from "phaser";
// import { createUIAnims } from '../anims/UIAnims';


export default class GameUI extends Phaser.Scene {
    constructor() {
        super({ key: 'game-ui' })
    }

    create() {
        
        // createUIAnims(this.anims);
        this.add.image(100, 100, 'uiHeartFull');
        const hearts = this.add.group({
            classType: Phaser.GameObjects.Sprite
        });

        hearts.createMultiple({
            key: 'uiHeartFull',
            setXY: {
                x: 10,
                y: 10,
                stepX: 20
            },
            quantity: 3
        })
    }
}