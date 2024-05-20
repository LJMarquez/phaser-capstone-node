import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { createPlayerAnims } from "../anims/PlayerAnims";
import BOD from "../enemies/BOD";
import "../characters/Player";
import { sceneEvents } from "../events/EventCenter";

let cursors;
let zKey;
let xKey;
let shiftKey;
let player;

export default class Boss2 extends Phaser.Scene {
  constructor() {
    super("boss2");
    this.player = null;
    this.wallsLayer = null;
    this.lockedDoor = null;
    this.openDoor = null;
    this.healthInitialized = false;
    this.bossHealthBar = null;
    this.bossNameText = null;
    this.bossIntroComplete = false;
    this.hasBossIntro = true;
    this.bossUICreated = false;
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

    const map = this.make.tilemap({ key: "dungeon_tiles_too" });
    const tileset = map.addTilesetImage("dungeon_tiles_too", "tiles2", 16, 16);

    map.createLayer("Ground", tileset);
    map.createLayer("Gracias", tileset);
    this.wallsLayer = map.createLayer("Walls", tileset);
    this.openDoor = map.createLayer("Open_Door", tileset);
    this.lockedDoor = map.createLayer("Locked_Door", tileset);

    this.wallsLayer.setCollisionByProperty({ collision: true });
    this.openDoor.setCollisionByProperty({ collision: true });
    this.lockedDoor.setCollisionByProperty({ collision: true });
    debugDraw(this.wallsLayer, this);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.player = this.add.player(1001, 610, "player", cursors);

    this.player.setKnives(this.knives);

    if (window.globalPlayerData) {
      this.player.health = window.globalPlayerData.health;
    }

    this.cameras.main.startFollow(this.player, true);

    this.bod = this.physics.add.group({
      classType: BOD,
      createCallback: (go) => {
        const bodGo = go;
        bodGo.body.onCollide = true;
      },
    });

    this.time.delayedCall(6000, () => {
      const bodAppearAnim = this.add.sprite(970, 450, "bodAppear");
      bodAppearAnim.anims.play("bodAppear", true);
      this.time.delayedCall(1000, () => {
        bodAppearAnim.destroy();
        this.bod.get(970, 450, "bod", this.player);
      });
    });

    this.physics.add.collider(this.player, this.wallsLayer);
    this.playerLockedDoorCollider = this.physics.add.collider(
      this.player,
      this.lockedDoor
    );
    this.physics.add.collider(this.bod, this.wallsLayer);

    this.physics.add.collider(
      this.knives,
      this.wallsLayer,
      this.knifeWallCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.knives,
      this.bod,
      this.knifeBODCollision,
      undefined,
      this
    );

    this.playerBODCollider = this.physics.add.collider(
      this.player,
      this.bod,
      this.playerBODCollision,
      undefined,
      this
    );
  }

  knifeWallCollision(knife) {
    knife.destroy();
  }

  knifeBODCollision(knife, bod) {
    if (!bod.isDisappearing) {
      bod.health--;
      bod.handleDamage();
    }
    knife.destroy();
    bod.setVelocity(0, 0);
    sceneEvents.emit("update-boss-health-bar", bod.health, bod.maxHealth);
  }

  playerBODCollision(player, bod) {
    const dx = player.x - bod.x;
    const dy = player.y - bod.y;
    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(450);
    player.handleDamage(dir);
    sceneEvents.emit("player-health-changed", player.health);

    if (player.health <= 0) {
      this.playerBODCollider.destroy();
    }
  }

  nextLevel() {
    window.globalPlayerData.health = this.player.health;
    this.scene.start("maze2");
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

    this.bod.getChildren().forEach((bod) => {
      if (bod.health <= 0) {
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

        sceneEvents.emit("fade-out-boss-ui");

        this.time.delayedCall(1250, () => {
          if (bod) {
            bod.destroy();
          }
        });
      } else if (
        !bod.phase2Running &&
        !bod.isDisappearing &&
        !this.player.isDead
      ) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          bod.x,
          bod.y
        );

        const bodAttackRange = 60;

        if (this.player.hitbox && !bod.isDisappearing) {
          this.physics.add.overlap(
            this.player.hitbox,
            bod,
            () => {
              bod.health -= 2;
              bod.handleDamage();
              this.player.hitbox.destroy();
              sceneEvents.emit(
                "update-boss-health-bar",
                bod.health,
                bod.maxHealth
              );
            },
            null,
            this
          );
        }

        if (distance < bodAttackRange) {
          if (bod.canAttack) {
            bod.canAttack = false;
            bod.swordAttack(this.player);
            this.time.delayedCall(3000, () => {
              bod.canAttack = true;
            });
          }
        }
      }
    });
    if (!this.bossUICreated) {
      sceneEvents.emit("create-boss-ui");
      sceneEvents.emit("fade-in-boss-ui");
      this.bossUICreated = true;
    }
  }
}
