import Phaser from "phaser";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { createPlayerAnims } from "../anims/PlayerAnims";
import { createChestAnims } from "../anims/ChestAnims";
import Skeleton from "../enemies/Skeleton";
import Chest from "../game-items/Chest";
import "../characters/Player";
import { sceneEvents } from "../events/EventCenter";

let cursors;
let zKey;
let xKey;
let shiftKey;
let player;

export default class Maze1 extends Phaser.Scene {
  constructor() {
    super("maze1");
    this.player = null;
    this.wallsLayer = null;
    this.lockedDoor = null;
    this.openDoor = null;
    this.healthInitialized = false;
  }

  preload() {
    this.load.audio("bgMusic", "audio/bg-music-1.wav");
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

    this.bgMusicAudio = this.sound.add("bgMusic", { loop: true, volume: 0.3 });
    this.playerDashAudio = this.sound.add("playerDash", { volume: 0.5 });
    this.playerAttackAudio = this.sound.add("playerAttack", { volume: 0.75 });
    this.chestAudio = this.sound.add("chestOpen", { volume: 0.75 });
    this.playerKnifeAudio = this.sound.add("playerThrow", { volume: 0.5 });
    this.skeletonAttackAudio = this.sound.add("skeletonAttack", {
      volume: 0.5,
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

    const map = this.make.tilemap({ key: "dungeon-1" });
    const tileset = map.addTilesetImage(
      "dungeon_tiles_quatro",
      "tiles4",
      16,
      16
    );

    map.createLayer("Ground", tileset);
    // map.createLayer("Gracias", tileset);
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

    this.chests.get(540, 135, "chest", "knife");
    this.chests.get(860, 155, "chest", "potion");

    this.skeletons.get(730, 260, "skeleton");
    this.skeletons.get(770, 310, "skeleton");

    this.skeletons.get(855, 260, "skeleton");
    this.skeletons.get(840, 310, "skeleton");
    this.skeletons.get(740, 165, "skeleton");

    this.player = this.add.player(472, 270, "player", cursors);
    this.player.setKnives(this.knives);

    if (window.globalPlayerData) {
      this.player.health = window.globalPlayerData.health;
    }

    this.cameras.main.startFollow(this.player, true);

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

  chestCollision(player, chest) {
    chest.open();
  }

  knifeWallCollision(knife) {
    knife.destroy();
  }

  knifeSkeletonCollision(knife, skeleton) {
    skeleton.die();
    knife.destroy();
    if (this.skeletons.countActive(true) === 0) {
      this.physics.add.collider(
        this.player,
        this.openDoor,
        this.nextLevel,
        null,
        this
      );
      this.lockedDoor.destroy();
      this.playerLockedDoorCollider.destroy();
      this.playerLockedDoorCollider = null;
    }
  }

  playerSkeletonCollision(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    player.handleDamage(dir);
    sceneEvents.emit("player-health-changed", player.health);

    if (player.health <= 0) {
      this.gameOverAudio.play();
      this.bgMusicAudio.pause();
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
      this.player.health = 3;
      window.globalPlayerData.health = 3;
      window.globalPlayerData.knives = 5;
      this.scene.start("maze1");
    });
  }

  nextLevel() {
    this.bgMusicAudio.stop();
    window.globalPlayerData.health = this.player.health;
    this.scene.start("puzzle1");
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
            if (this.skeletons.countActive(true) === 0) {
              this.physics.add.collider(
                this.player,
                this.openDoor,
                this.nextLevel,
                null,
                this
              );
              this.lockedDoor.destroy();
              this.playerLockedDoorCollider.destroy();
              this.playerLockedDoorCollider = null;
            }
          },
          null,
          this
        );
      }
    });
  }
}
