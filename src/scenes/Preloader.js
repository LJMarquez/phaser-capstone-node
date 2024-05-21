import Phaser from "phaser";
// import Phaser from '../node_modules/phaser'

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.audio("dungeonBackgroundMusic", "audio/background-music.mp3");
    this.load.audio("bodMusic", "audio/bod-music.mp3");
    this.load.audio("levelWin", "audio/level_win.mp3");
    this.load.audio("gameOver", "audio/game-over.mp3");

    this.load.image("tiles", "tiles/dungeon_tiles.png");
    this.load.image("tiles2", "tiles/dungeon_tiles_too.png");
    this.load.image("tiles4", "tiles/dungeon_tiles_quatro.png");

    this.load.tilemapTiledJSON("dungeon-1", "./tiles/dungeon-1.json");
    this.load.tilemapTiledJSON("boss-room-1", "./tiles/boss-room-1.json");
    this.load.tilemapTiledJSON(
      "dungeon-2",
      "./tiles/dungeon-2.json"
    );
    this.load.tilemapTiledJSON("entry-room", "./tiles/entry-room.json");
    this.load.tilemapTiledJSON("puzzle-1", "./tiles/large_maze.json");

    this.load.image("uiHeartFull", "ui/heart.png");
    this.load.image("uiHeartEmpty", "ui/heart_background.png");
    this.load.image("uiHeartStroke", "ui/heart_border.png");

    this.load.image("drill-outline", "ui/drill-outline.png");
    this.load.image("lawn-mower-outline", "ui/lawn-mower-outline.png");
    this.load.image("wrench-outline", "ui/wrench-outline.png");

    this.load.image("drill", "ui/drill.png");
    this.load.image("lawn-mower", "ui/lawn-mower.png");
    this.load.image("wrench", "ui/wrench.png");

    this.load.image("drill-item", "items/drill-item.png");
    this.load.image("lawn-mower-item", "items/lawn-mower-item.png");
    this.load.image("wrench-item", "items/wrench-item.png");

    this.load.spritesheet("chest", "items/treasure.png", {
      frameWidth: 20,
      frameHeight: 18,
    });
    this.load.image("health-potion", "items/health-potion.png");

    this.load.image("knife", "weapons/knife.png");

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

    this.load.spritesheet("morshu", "enemies/morshu-spritesheet.png", {
      frameWidth: 78,
      frameHeight: 88,
    });
    this.load.image("bomb", "enemies/bomb.png");
    // this.load.image("bomb", "enemies/bomb-outline.png");

    this.load.spritesheet("bod", "enemies/Bringer-of-Death-Spritesheet.png", {
      frameWidth: 140,
      frameHeight: 93,
    });
    this.load.spritesheet("explosions", "enemies/explosion-spritesheet.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  create() {
    this.scene.start("puzzle1");
  }
}
