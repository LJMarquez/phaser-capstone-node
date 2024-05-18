import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

export default class BOD extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, player) {
    super(scene, x, y, texture);

    this.canAttack = true;
    this.isDamaged = false;
    this.isAttacking = false;
    this.player = player;
    this.facingLeft = null;
    this.health = 30;

    this.anims.play("bodWalk", true);

    scene.physics.world.enable(this);

    this.body.onCollide = true;

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );

    this.direction = LEFT;

    scene.physics.world.enable(this);
    this.body.setSize(this.width * 0.4, this.height * 0.6);
    this.body.offset.y = 38;
    this.body.offset.x = 76;
  }

  handleTileCollision(go, tile) {
    if (go !== this) {
      return;
    }
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    const speed = 30;
    const player = this.scene.player;

    if (!player.isDead) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx > 0 ? RIGHT : LEFT;
      } else {
        this.direction = dy > 0 ? DOWN : UP;
      }

      const previousFlipX = this.flipX;

      switch (this.direction) {
        case UP:
          if (!this.isAttacking) {
            this.setVelocity(0, -speed);
          }
          break;
        case DOWN:
          if (!this.isAttacking) {
            this.setVelocity(0, speed);
          }
          break;
        case LEFT:
          this.setFlipX(false);
          this.facingLeft = true;
          if (!this.isAttacking) {
            this.body.offset.x = 76;
            this.setVelocity(-speed, 0);
          }
          break;
        case RIGHT:
          this.setFlipX(true);
          this.facingLeft = false;
          if (!this.isAttacking) {
            this.body.offset.x = 10;
            this.setVelocity(speed, 0);
          }
          break;
      }

      if (this.flipX !== previousFlipX) {
        if (this.flipX) {
          this.x += 70;
          this.body.offset.x = 10;
        } else {
          this.x -= 70;
          this.body.offset.x = 76;
        }
      }
    } else {
      this.anims.play("bodIdle", true);
    }
  }

  handleDamage() {
    if (!this.phase2Running && !this.isDisappearing) {
      this.health -= 2;
      this.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => {
        this.clearTint();
      });
  
      if (this.health <= 0) {
        this.die();
      } else {
        this.checkPhase();
      }
    }
  }

  checkPhase() {
    if (this.health <= 20 && this.health > 16) {
      this.phase2Behavior(3, 16);
    } else if (this.health <= 16 && this.health > 11) {
      this.phase2Behavior(3, 11);
    }
  }
  
  phase2Behavior(repeats, nextThreshold) {
    if (this.phase2Running) {
      return;
    }
    this.phase2Running = true;
  
    const disappearAndAttack = (remainingRepeats) => {
      if (remainingRepeats <= 0 || this.health <= nextThreshold) {
        this.phase2Running = false;
        return;
      }
  
      this.isAttacking = true;
      this.anims.play("bodDisappear", true);
      this.scene.time.delayedCall(1000, () => {
        this.setVisible(false);
        this.scene.time.delayedCall(1000, () => {
          const spawnLeft = Phaser.Math.Between(0, 1) === 0;
          const offset = 100;
          if (spawnLeft) {
            this.setPosition(this.player.x - offset, this.player.y);
          } else {
            this.setPosition(this.player.x + offset, this.player.y);
          }
          this.setVisible(true);
          this.anims.play("bodAttack", true);
          this.scene.time.delayedCall(1000, () => {
            this.isAttacking = false;
            disappearAndAttack(remainingRepeats - 1);
          });
        });
      });
    };
  
    disappearAndAttack(repeats);
  }

  disappear() {
    this.isDisappearing = true;
    this.setActive(false);
    this.setVisible(false);
    this.hitbox.destroy();
    this.scene.time.delayedCall(1000, () => {
      this.reappear();
    });
  }
  
  reappear() {
    this.isDisappearing = false;
    this.setActive(true);
    this.setVisible(true);
    // Add the hitbox back
    this.hitbox = this.scene.physics.add.sprite(this.x, this.y, null).setVisible(false);
    this.hitbox.setSize(this.width * 0.4, this.height * 0.6);
    this.hitbox.setImmovable(true);
    this.hitbox.body.setAllowGravity(false);
  }

  die() {
    this.disableBody(true, true);
    const enemyDeathAnim = this.scene.add.sprite(
      this.x - 45,
      this.y - 15,
      "enemyDeath"
    );
    if (this.facingLeft) {
      enemyDeathAnim.setFlipX(true);
    }
    enemyDeathAnim.setOrigin(0, 0);
    enemyDeathAnim.anims.play("enemyDeath", true);
    this.scene.time.delayedCall(1300, () => {
      this.scene.tweens.add({
        targets: enemyDeathAnim,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          enemyDeathAnim.destroy();
        },
      });
    });
  }

  swordAttack(player) {
    this.isAttacking = true;
    this.setVelocity(0, 0);

    const hitbox = this.scene.physics.add
      .image(this.x, this.y, null)
      .setVisible(false);
    hitbox.setSize(this.width * 0.9, this.height * 0.9);
    hitbox.setImmovable(true);
    hitbox.body.setAllowGravity(false);

    const enableHitboxOverlap = () => {
      const overlapCallback = () => {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(450);

        player.handleDamage(dir);
        sceneEvents.emit("player-health-changed", player.health);

        if (player.health <= 0) {
          this.scene.physics.world.removeCollider(this.scene.playerBODCollider);
          this.scene.playerBODCollider = null;
        }
      };
      this.scene.physics.add.overlap(
        hitbox,
        player,
        overlapCallback,
        null,
        this
      );
    };

    this.scene.time.delayedCall(600, () => {
      enableHitboxOverlap();
    });

    this.anims.play("bodAttack", true);

    this.scene.time.delayedCall(1000, () => {
      hitbox.destroy();
      this.body.setSize(this.width * 0.4, this.height * 0.6);
      this.body.offset.y = 38;
      this.body.offset.x = this.facingLeft ? 76 : 10;
    });

    this.scene.time.delayedCall(1500, () => {
      this.setVelocity(0, 0);
      this.anims.play("bodWalk", true);
      this.isAttacking = false;
    });
  }
}
