import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
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

export default class Puzzle1 extends Phaser.Scene {
  constructor() {
    super("puzzle1");
    this.player = null;
    this.wallsLayer = null;
    this.lockedDoor = null;
    this.openDoor = null;
    this.healthInitialized = false;
    this.wrench = null;
  }

  preload() {
    this.load.audio("playerDash", "audio/player-dash.wav");
    this.load.audio("playerAttack", "audio/player-attack.wav");
    this.load.audio("playerThrow", "audio/bodTeleport.wav");
    this.load.audio("chestOpen", "audio/chest-open.wav");
    this.load.audio("skeletonAttack", "audio/bodSwordAttack.wav");
    this.load.audio("skeletonDie", "audio/bodDeath.wav");
  }

  create() {
    createPlayerAnims(this.anims);
    createEnemyAnims(this.anims);
    createChestAnims(this.anims);
    this.scene.run("game-ui");

    this.playerDashAudio = this.sound.add("playerDash", { volume: 0.5 });
    this.playerAttackAudio = this.sound.add("playerAttack", { volume: 0.75 });
    this.chestAudio = this.sound.add("chestOpen", { volume: 0.75 });
    this.playerKnifeAudio = this.sound.add("playerThrow", { volume: 0.5 });
    this.skeletonAttackAudio = this.sound.add("skeletonAttack", {
      volume: 0.75,
    });
    this.skeletonDieAudio = this.sound.add("skeletonDie", { volume: 0.5 });

    cursors = this.input.keyboard.createCursorKeys();
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    const map = this.make.tilemap({ key: "puzzle-1" });
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
    this.lockedDoor.setCollisionByProperty({ collision: true });
    // debugDraw(this.wallsLayer, this);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    // this.player = this.add.player(200, 779, "player", cursors);
    this.player = this.add.player(750, 180, "player", cursors);
    this.player.setKnives(this.knives);

    if (window.globalPlayerData) {
      this.player.health = window.globalPlayerData.health;
    }

    this.cameras.main.startFollow(this.player, true);

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

    this.chests.get(520, 1450, "chest", "knife");
    this.chests.get(540, 1480, "chest", "potion");

    this.skeletons.get(300, 200, "skeleton");
    this.skeletons.get(200, 200, "skeleton");

    // this.skeletons.get(520, 1350, "skeleton");

    this.wrench = this.physics.add.image(750, 280, "wrench-item");
    this.wrench.setScale(0.3);
    this.physics.add.collider(
      this.player,
      this.wrench,
      this.collectWrench,
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

  collectWrench() {
    this.wrench.destroy();
    sceneEvents.emit("collect-wrench");
    if (this.playerLockedDoorCollider) {
      this.playerLockedDoorCollider.destroy();
      this.playerLockedDoorCollider = null;
    }
    if (this.lockedDoor) {
      this.lockedDoor.destroy();
      this.lockedDoor = null;
    }
    this.physics.add.collider(
      this.player,
      this.openDoor,
      this.nextLevel,
      null,
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
  }

  playerSkeletonCollision(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    player.handleDamage(dir);
    sceneEvents.emit("player-health-changed", player.health);

    if (player.health <= 0) {
      this.playerEnemyCollider.destroy();
    }
  }

  nextLevel() {
    window.globalPlayerData.health = this.player.health;
    this.scene.start("boss1");
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
