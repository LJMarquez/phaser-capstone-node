import Phaser from 'phaser'
// import Phaser from '../node_modules/phaser'


export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader');
    }

    preload() {
        this.load.image("tiles", "tiles/dungeon_tiles.png");
        this.load.image("tiles2", "tiles/dungeon_tiles_too.png");
        this.load.image("tiles4", "tiles/dungeon_tiles_quatro.png");

        this.load.tilemapTiledJSON("dungeon", "./tiles/dungeon-01.json");
        this.load.tilemapTiledJSON("dungeon_tiles_too", "./tiles/boss-room-1.json");

        this.load.image("uiHeartFull", "ui/heart.png");
        this.load.image("uiHeartEmpty", "ui/heart_background.png");
        this.load.image("uiHeartStroke", "ui/heart_border.png");

        this.load.image('knife', 'weapons/knife.png');

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
        this.load.spritesheet("playerThrow", "player/Knight_Throw.png", {
          frameWidth: 52,
          frameHeight: 52,
        });
        this.load.spritesheet("playerFaint", "player/Knight_Faint.png", {
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
        this.load.spritesheet("enemyDeath", "enemies/undead_death.png", {
          frameWidth: 72,
          frameHeight: 32,
        });
        this.load.spritesheet("enemyAttack", "enemies/undead_attack.png", {
          frameWidth: 56,
          frameHeight: 48,
        });

        this.load.spritesheet("morshuWalk", "enemies/morshu-sprites.png", {
          frameWidth: 48,
          frameHeight: 32,
        });

        this.load.spritesheet("bod", "enemies/Bringer-of-Death-Spritesheet.png", {
          frameWidth: 140,
          frameHeight: 93,
        });
    }

    create() {
        this.scene.start("boss1");
      }
}