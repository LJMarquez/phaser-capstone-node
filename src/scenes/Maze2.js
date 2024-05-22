import Phaser from "phaser";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { createPlayerAnims } from "../anims/PlayerAnims";
import { createChestAnims } from "../anims/ChestAnims";
import Chest from "../game-items/Chest";
import Skeleton from "../enemies/Skeleton";
import "../characters/Player";
import { sceneEvents } from "../events/EventCenter";

let cursors;
let zKey;
let xKey;
let shiftKey;
let player;

export default class Maze2 extends Phaser.Scene {
  constructor() {
    super("maze2");
    this.player = null;
    this.wallsLayer = null;
    this.lockedDoor = null;
    this.openDoor = null;
    this.healthInitialized = false;
    this.drill = null;
  }

  preload() {
    this.load.audio("bgMusic", "audio/bg-music-2.wav");
    this.load.audio("playerDash", "audio/player-dash.wav");
    this.load.audio("playerAttack", "audio/player-attack.wav");
    this.load.audio("playerThrow", "audio/bodTeleport.wav");
    this.load.audio("chestOpen", "audio/chest-open.wav");
    this.load.audio("skeletonAttack", "audio/bodSwordAttack.wav");
    this.load.audio("skeletonDie", "audio/bodDeath.wav");
    this.load.audio("playerDamage", "audio/player-damage.wav");
    this.load.audio("knifeCollect", "audio/knife-collect.mp3");
    this.load.audio("potionCollect", "audio/health-potion.mp3");
    this.load.audio("gameOver", "audio/game-over.mp3");
  }
  
  create() {
    createPlayerAnims(this.anims);
    createEnemyAnims(this.anims);
    createChestAnims(this.anims);
    this.scene.run("game-ui");
    
    this.bgMusicAudio = this.sound.add("bgMusic", { loop: true });
    this.playerDashAudio = this.sound.add("playerDash", { volume: 0.5 });
    this.playerAttackAudio = this.sound.add("playerAttack", { volume: 0.75 });
    this.chestAudio = this.sound.add("chestOpen", { volume: 0.75 });
    this.playerKnifeAudio = this.sound.add("playerThrow", { volume: 0.5 });
    this.skeletonAttackAudio = this.sound.add("skeletonAttack", {
      volume: 0.75,
    });
    this.skeletonDieAudio = this.sound.add("skeletonDie", { volume: 0.5 });
    this.playerDamageAudio = this.sound.add("playerDamage", { volume: 0.5 });
    this.knifeCollectAudio = this.sound.add("knifeCollect", { volume: 1 });
    this.potionCollectAudio = this.sound.add("potionCollect", { volume: 0.5 });
    this.gameOverAudio = this.sound.add("gameOver", { volume: 0.5 });

    this.bgMusicAudio.play();

    cursors = this.input.keyboard.createCursorKeys();
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    const map = this.make.tilemap({ key: "dungeon-2" });
    const tileset = map.addTilesetImage("dungeon_tiles_quatro", "tiles4", 16, 16);

    map.createLayer("Ground", tileset);
    map.createLayer("Gracias", tileset);
    this.wallsLayer = map.createLayer("Walls", tileset);
    this.openDoor = map.createLayer("Door", tileset);
    this.lockedDoor = map.createLayer("Locked_Door", tileset);

    this.wallsLayer.setCollisionByProperty({ collides: true });
    this.openDoor.setCollisionByProperty({ collides: true });
    this.lockedDoor.setCollisionByProperty({ collides: true });

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.skeletons = this.physics.add.group({
      classType: Skeleton,
      createCallback: (go) => {
        const skelGo = go;
        skelGo.body.onCollide = true;
      },
    });

    this.chests = this.physics.add.group({
      classType: Chest,
      createCallback: (go) => {
        const chestGo = go;
        chestGo.body.onCollide = true;
      },
    });

    this.chests.get(600, 1340, "chest", "knife");
    this.chests.get(690, 1255, "chest", "knife");
    this.chests.get(440, 830, "chest", "knife");
    this.chests.get(1030, 898, "chest", "knife");
    this.chests.get(200, 590, "chest", "knife");
    this.chests.get(540, 290, "chest", "knife");
    this.chests.get(600, 290, "chest", "knife");
    this.chests.get(440, 1190, "chest", "potion");
    this.chests.get(1030, 500, "chest", "potion");
    this.chests.get(570, 290, "chest", "potion");
    
    this.skeletons.get(420, 1350, "skeleton");
    this.skeletons.get(440, 1420, "skeleton");
    this.skeletons.get(360, 1170, "skeleton");
    this.skeletons.get(440, 1258, "skeleton");
    this.skeletons.get(620, 1258, "skeleton");
    this.skeletons.get(770, 1330, "skeleton");
    this.skeletons.get(690, 1150, "skeleton");
    this.skeletons.get(580, 1200, "skeleton");
    this.skeletons.get(510, 1100, "skeleton");
    this.skeletons.get(580, 1000, "skeleton");
    this.skeletons.get(510, 900, "skeleton");
    this.skeletons.get(580, 800, "skeleton");
    this.skeletons.get(520, 1200, "skeleton");
    this.skeletons.get(470, 1100, "skeleton");
    this.skeletons.get(520, 1000, "skeleton");
    this.skeletons.get(470, 900, "skeleton");
    this.skeletons.get(520, 800, "skeleton");
    this.skeletons.get(820, 898, "skeleton");
    this.skeletons.get(870, 870, "skeleton");
    this.skeletons.get(970, 730, "skeleton");
    this.skeletons.get(800, 560, "skeleton");
    this.skeletons.get(940, 580, "skeleton");
    this.skeletons.get(980, 530, "skeleton");
    this.skeletons.get(500, 510, "skeleton");
    this.skeletons.get(480, 600, "skeleton");
    this.skeletons.get(300, 550, "skeleton");
    this.skeletons.get(200, 420, "skeleton");
    this.skeletons.get(320, 340, "skeleton");
    this.skeletons.get(220, 240, "skeleton");
    this.skeletons.get(380, 190, "skeleton");
    this.skeletons.get(500, 260, "skeleton");

    this.player = this.add.player(520, 1525, "player", cursors);
    this.player.setKnives(this.knives);

    if (window.globalPlayerData) {
      this.player.health = window.globalPlayerData.health;
    }

    this.cameras.main.startFollow(this.player, true);

    this.drill = this.physics.add.image(220, 200, "drill-item");
    this.drill.setScale(0.25);
    this.physics.add.collider(
      this.player,
      this.drill,
      this.collectDrill,
      undefined,
      this
    );

    this.physics.add.collider(
      this.player,
      this.openDoor,
      this.nextLevel,
      null,
      this
    );

    this.physics.add.collider(this.player, this.wallsLayer);
    this.playerLockedDoorCollider = this.physics.add.collider(
      this.player,
      this.lockedDoor
    );
    this.physics.add.collider(this.skeletons, this.wallsLayer);

    this.physics.add.collider(
      this.chests,
      this.player,
      this.chestCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.knives,
      this.wallsLayer,
      this.knifeWallCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.knives,
      this.skeletons,
      this.knifeSkeletonCollision,
      undefined,
      this
    );
    this.playerEnemyCollider = this.physics.add.collider(
      this.player,
      this.skeletons,
      this.playerSkeletonCollision,
      undefined,
      this
    );
  }

  collectDrill() {
    this.knifeCollectAudio.play();
    this.drill.destroy();
    sceneEvents.emit("collect-drill");
    if (this.playerLockedDoorCollider) {
      this.playerLockedDoorCollider.destroy();
      this.playerLockedDoorCollider = null;
    }
    if (this.lockedDoor) {
      this.lockedDoor.destroy();
      this.lockedDoor = null;
    }
    // this.physics.add.collider(
    //   this.player,
    //   this.openDoor,
    //   this.nextLevel,
    //   null,
    //   this
    // );
  }

  chestCollision(player, chest) {
    chest.open();
  }

  knifeWallCollision(knife) {
    knife.destroy();
  }

  knifeSkeletonCollision(knife, skeleton) {
    skeleton.die();
    knife.destroy();
  }

  playerSkeletonCollision(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    player.handleDamage(dir);
    sceneEvents.emit("player-health-changed", player.health);

    if (player.health <= 0) {
      this.gameOverAudio.play();
      this.bgMusicAudio.stop();
      this.playerEnemyCollider.destroy();
      this.time.delayedCall(1000, () => {
        this.showRestartButton();
      });
    }
  }

  showRestartButton() {
    const boxWidth = 200;
    const boxHeight = 50;
    const restartBox = this.add
      .graphics()
      .fillStyle(0x000000, 0.8)
      .fillRect(0, 0, boxWidth, boxHeight);

    restartBox.x = this.player.x - boxWidth / 2;
    restartBox.y = this.player.y - 100;

    const restartButton = this.add
      .text(0, 0, "Restart", {
        fontSize: "32px",
        fill: "#fff",
      })
      .setOrigin(0.5);

    restartButton.setPosition(
      restartBox.x + boxWidth / 2,
      restartBox.y + boxHeight / 2
    );
    restartButton.setInteractive();
    restartButton.on("pointerdown", () => {
      this.gameOverAudio.stop();
      this.healthInitialized = false;
      window.globalPlayerData.health = 3;
      window.globalPlayerData.knives = 8;
      this.scene.start("maze2");
    });
  }

  nextLevel() {
    this.bgMusicAudio.stop();
    window.globalPlayerData.health = this.player.health;
    this.scene.start("boss1");
    // if time ----------------------------------------------------------------------------------------------
    // this.scene.start("puzzle2"); 
  }

  update(d, dt) {
    if (this.player) {
      this.player.update(cursors, zKey, xKey, shiftKey);
    }

    if (!this.healthInitialized) {
      if (window.globalPlayerData.hasLawnMower === true) {
        sceneEvents.emit("collect-lawn-mower");
      }
      if (window.globalPlayerData.hasDrill === true) {
        sceneEvents.emit("collect-drill");
      }
      if (window.globalPlayerData.hasWrench === true) {
        sceneEvents.emit("collect-wrench");
      }
      sceneEvents.emit("player-health-changed", this.player.health);
      this.healthInitialized = true;
    }

    this.skeletons.getChildren().forEach((skeleton) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        skeleton.x,
        skeleton.y
      );

      const skeletonAttackRange = 40;

      if (distance < skeletonAttackRange && skeleton.canAttack) {
        skeleton.canAttack = false;
        skeleton.skeletonAttack(this.player);
        this.time.delayedCall(2500, () => {
          skeleton.canAttack = true;
        });
      }

      if (this.player.hitbox) {
        this.physics.add.overlap(
          this.player.hitbox,
          skeleton,
          () => {
            skeleton.die();
            this.player.hitbox.destroy();
          },
          null,
          this
        );
      }
    });
  }
}
