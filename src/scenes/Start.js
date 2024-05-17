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
let skeletons;
let skeletonAttackCooldown = 1667;

export default class Start extends Phaser.Scene {
  constructor() {
    super("start");
    this.player = null;
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

    const map = this.make.tilemap({ key: "dungeon" });
    const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16);

    map.createLayer("Ground", tileset);
    const wallsLayer = map.createLayer("Walls", tileset);

    wallsLayer.setCollisionByProperty({ collides: true });

    debugDraw(wallsLayer, this);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    // start of player code

    // player = this.add.player(128, 128, "player", cursors);
    this.player = this.add.player(128, 128, "player", cursors);
    this.player.setKnives(this.knives);

    this.cameras.main.startFollow(this.player, true);

    // end of player code

    // start of enemy code

    this.skeletons = this.physics.add.group({
      classType: Skeleton,
      createCallback: (go) => {
        const skelGo = go;
        skelGo.body.onCollide = true;
      },
    });

    this.bod = this.physics.add.group({
      classType: BOD,
      createCallback: (go) => {
        const bodGo = go;
        bodGo.body.onCollide = true;
      },
    });

    // this.skeletons.get(200, 250, "skeleton");

    // end of enemy code

    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.skeletons, wallsLayer);

    this.physics.add.collider(
      this.knives,
      wallsLayer,
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
      this.playerCollision,
      undefined,
      this
    );
  }

  knifeWallCollision(knife, obj2) {
    // this.knives.killAndHide(knife);
    knife.destroy();
  }

  knifeSkeletonCollision(knife, skeleton) {
    // this.knives.killAndHide(knife);
    knife.destroy();
    skeleton.disableBody(true, true);
    const enemyDeathAnim = this.add.sprite(
      skeleton.x - 45,
      skeleton.y - 15,
      "enemyDeath"
    );
    if (skeleton.direction == 2) {
      enemyDeathAnim.setFlipX(true);
    }
    enemyDeathAnim.setOrigin(0, 0);
    enemyDeathAnim.anims.play("enemyDeath", true);
    setTimeout(() => {
      this.tweens.add({
        targets: enemyDeathAnim,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          enemyDeathAnim.destroy();
        },
      });
    }, 1300);
  }


  playerCollision(player, skeleton) {
    if (player.isAttacking == true) {
      skeleton.disableBody(true, true);
      skeleton.anims.play("enemyDeath");
      const enemyDeathAnim = this.add.sprite(
        skeleton.x - 45,
        skeleton.y - 15,
        "enemyDeath"
      );
      if (skeleton.direction == 2) {
        enemyDeathAnim.setFlipX(true);
      }
      enemyDeathAnim.setOrigin(0, 0);
      enemyDeathAnim.anims.play("enemyDeath", true);
      setTimeout(() => {
        this.tweens.add({
          targets: enemyDeathAnim,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            enemyDeathAnim.destroy();
          },
        });
      }, 1300);
    } else {
      const dx = this.player.x - skeleton.x;
      const dy = this.player.y - skeleton.y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

      this.player.handleDamage(dir);

      sceneEvents.emit("player-health-changed", this.player.health);

      if (this.player.health <= 0) {
        this.playerEnemyCollider.destroy();
      }
    }
  }

  skeletonAttack(skeleton) {
    if (this.player.x > skeleton.x) {
      skeleton.setFlipX(false);
    } else {
      skeleton.setFlipX(true);
    }
    this.time.delayedCall(600, () => {
      const dx = this.player.x - skeleton.x;
      const dy = this.player.y - skeleton.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      const lungeDistance = 900; // Adjust as needed
      const lungeDx = normalizedDx * lungeDistance;
      const lungeDy = normalizedDy * lungeDistance;
      skeleton.setVelocity(lungeDx, lungeDy);

      skeleton.body.setSize(skeleton.width * 0.6, skeleton.height * 0.71);
      skeleton.body.offset.y = 10;
      if (this.player.x > skeleton.x) {
        skeleton.body.offset.x = 15;
      } else {
        skeleton.body.offset.x = 5;
      }
    });
    skeleton.moveEventActive = false;
    skeleton.setVelocity(0, 0);
    skeleton.anims.play("enemyAttack", true);
    this.time.delayedCall(1667, () => {
      skeleton.moveEventActive = true;
      skeleton.anims.play("enemyWalk", true);
      skeleton.body.setSize(skeleton.width * 0.6, skeleton.height * 0.6);
      skeleton.body.offset.y = 13;
      skeleton.body.offset.x = 5;
    });
  }


  update(d, dt) {
    if (this.player) {
      this.player.update(cursors, zKey, xKey, shiftKey);
    }

    this.skeletons.getChildren().forEach((skeleton) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        skeleton.x,
        skeleton.y
      );

      const skeletonAttackRange = 40;

      if (distance < skeletonAttackRange && skeleton.canAttack == true) {
        skeleton.canAttack = false;
        this.skeletonAttack(skeleton);
        this.time.delayedCall(2500, () => {
          skeleton.canAttack = true;
        });
      }
    });
  }
}
