import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { createPlayerAnims } from "../anims/PlayerAnims";
import Skeleton from "../enemies/Skeleton";
import BOD from "../enemies/BOD";
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

  preload() {}

  create() {
    createPlayerAnims(this.anims);
    createEnemyAnims(this.anims);
    this.scene.run("game-ui");

    cursors = this.input.keyboard.createCursorKeys();
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    const map = this.make.tilemap({ key: "dungeon_tiles_quatro" });
    const tileset = map.addTilesetImage(
      "dungeon_tiles_quatro",
      "tiles4",
      16,
      16
    );

    map.createLayer("Ground", tileset);
    // map.createLayer("Gracias", tileset);
    this.wallsLayer = map.createLayer("Walls", tileset);
    // this.openDoor = map.createLayer("Open_Door", tileset);
    // this.lockedDoor = map.createLayer("Locked_Door", tileset);

    this.wallsLayer.setCollisionByProperty({ collides: true });
    // this.openDoor.setCollisionByProperty({ collision: true });
    // this.lockedDoor.setCollisionByProperty({ collision: true });
    // debugDraw(this.wallsLayer, this);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.player = this.add.player(520, 1530, "player", cursors);
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

    this.skeletons.get(300, 150, "skeleton");

    this.skeletons.get(520, 1350, "skeleton");
    this.skeletons.get(200, 150, "skeleton");

    this.physics.add.collider(this.player, this.wallsLayer);
    // this.playerLockedDoorCollider = this.physics.add.collider(
    //   this.player,
    //   this.lockedDoor
    // );
    this.physics.add.collider(this.skeletons, this.wallsLayer);

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
