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

export default class Boss1 extends Phaser.Scene {
  constructor() {
    super("boss1");
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

    const map = this.make.tilemap({ key: "dungeon_tiles_too" });
    const tileset = map.addTilesetImage("dungeon_tiles_too", "tiles2", 16, 16);

    map.createLayer("Ground", tileset);
    map.createLayer("Gracias", tileset);
    const wallsLayer = map.createLayer("Walls", tileset);
    map.createLayer("Open_Door", tileset);
    map.createLayer("Locked_Door", tileset);
    
    wallsLayer.setCollisionByProperty({ collides: true });
    debugDraw(wallsLayer, this);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.player = this.add.player(400, 450, "player", cursors);
    this.player.setKnives(this.knives);

    this.cameras.main.startFollow(this.player, true);

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

    this.bod.get(180, 200, "bod", this.player);

    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.skeletons, wallsLayer);
    this.physics.add.collider(this.bod, wallsLayer);

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
    this.physics.add.collider(
      this.knives,
      this.bod,
      this.knifeBODCollision,
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

  knifeSkeletonCollision(knife, skeleton) {
    skeleton.handleDamage();
    knife.destroy();
  }

  knifeBODCollision(knife, bod) {
    bod.handleDamage();
    // knife.killAndHide();
    knife.destroy();
  }

  playerCollision(player, enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);
    player.handleDamage(dir);
    sceneEvents.emit("player-health-changed", player.health);

    if (player.health <= 0) {
      this.playerEnemyCollider.destroy();
    }
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
      const lungeDistance = 900;
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

      if (distance < skeletonAttackRange && skeleton.canAttack) {
        skeleton.canAttack = false;
        this.skeletonAttack(skeleton);
        this.time.delayedCall(2500, () => {
          skeleton.canAttack = true;
        });
      }
    });

    this.bod.getChildren().forEach((bod) => {
      if (
        !bod.phase2Running &&
        !bod.isDisappearing &&
        bod.canAttack &&
        !this.player.isDead
      ) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          bod.x,
          bod.y
        );

        const bodAttackRange = 60;

        if (distance < bodAttackRange) {
          this.physics.add.collider(
            bod,
            this.player.hitbox,
            () => bod.handleDamage(),
            undefined,
            this
          );

          if (this.player.hitbox) {
            const playerSwordBODOverlap = this.physics.overlap(
              this.player.hitbox,
              bod
            );
            if (playerSwordBODOverlap) {
              bod.handleDamage();
              console.log("hit")
            }
          }

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

  
  }
}
