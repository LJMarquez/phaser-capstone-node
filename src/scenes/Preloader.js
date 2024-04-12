import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
    }

    preload() {
        this.load.image("tiles", "tiles/dungeon_tiles.png");
        this.load.tilemapTiledJSON("dungeon", "./tiles/dungeon-01.json");

        this.load.spritesheet("uiHeart", "ui/heart_animated.png", {
          frameWidth: 17,
          frameHeight: 17,
        });
    
        this.load.spritesheet("playerIdle", "player/Knight_Idle.png", {
          frameWidth: 52,
          frameHeight: 52,
        });
        this.load.spritesheet("playerWalk", "player/Knight_Move.png", {
          frameWidth: 52,
          frameHeight: 52,
        });
        this.load.spritesheet("playerAttack", "player/Knight_Attack.png", {
          frameWidth: 52,
          frameHeight: 52,
        });
        this.load.spritesheet("enemyWalk", "enemies/undead_walk.png", {
          frameWidth: 56,
          frameHeight: 48,
        });
        this.load.spritesheet("enemyIdle", "enemies/undead_idle.png", {
          frameWidth: 48,
          frameHeight: 32,
        });
    }

    create() {
        this.scene.start("game");
      }
}