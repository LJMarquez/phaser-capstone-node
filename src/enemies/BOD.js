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
    this.facingLeft = true;
    this.phase2Running = false;
    this.phase3Running = false;
    this.isDisappearing = false;
    this.health = 30;
    this.maxHealth = 30;
    this.phase2Cycle1Complete = false;
    this.phase2Cycle2Complete = false;
    this.phase3Cycle1Complete = false;
    this.phase3Cycle2Complete = false;

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

    const player = this.scene.player;

    if (this.isAttacking) {
      this.setVelocity(0, 0);
    }

    if (player.isDead) {
      this.setVelocity(0, 0);
    }

    const speed = 30;

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
          if (!this.isAttacking && !this.phase2Running && !this.phase3Running) {
            this.setVelocity(0, -speed);
          }
          break;
        case DOWN:
          if (!this.isAttacking && !this.phase2Running && !this.phase3Running) {
            this.setVelocity(0, speed);
          }
          break;
        case LEFT:
          this.setFlipX(false);
          this.facingLeft = true;
          if (!this.isAttacking && !this.phase2Running && !this.phase3Running) {
            this.body.offset.x = 76;
            this.setVelocity(-speed, 0);
          }
          break;
        case RIGHT:
          this.setFlipX(true);
          this.facingLeft = false;
          if (!this.isAttacking && !this.phase2Running && !this.phase3Running) {
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
      this.scene.bodDamageAudio.stop();
      this.scene.bodDamageAudio.play();

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
      if (!this.phase2Cycle1Complete) {
        this.phase2Behavior(3, 16);
        this.phase2Cycle1Complete = true;
      }
    } else if (this.health <= 16 && this.health > 11) {
      if (!this.phase2Cycle2Complete) {
        this.phase2Behavior(3, 11);
        this.phase2Cycle2Complete = true;
      }
    } else if (this.health <= 10 && this.health > 5) {
      if (!this.phase3Cycle1Complete) {
        this.phase3Behavior(3, 5);
        this.phase3Cycle1Complete = true;
      }
    } else if (this.health <= 5 && this.health > 0) {
      if (!this.phase3Cycle2Complete) {
        this.phase3Behavior(3, 0);
        this.phase3Cycle2Complete = true;
      }
    }
  }

  phase2Behavior(repeats, nextThreshold) {
    if (this.phase2Running) {
      return;
    }
    this.setVelocity(0, 0);
    this.phase2Running = true;

    let spawnLeft = false;

    const disappearAndAttack = (remainingRepeats) => {
      if (remainingRepeats <= 0 || this.health <= nextThreshold) {
        this.phase2Running = false;
        this.isDisappearing = false;
        this.scene.bodWalkAudio.play();
        this.scene.bodTeleportAudio.stop();
        return;
      }

      // this.isAttacking = true;

      this.scene.bodWalkAudio.pause();
      this.isDisappearing = true;
      this.anims.play("bodDisappear", true);
      this.scene.bodTeleportAudio.play();
      this.scene.time.delayedCall(1000, () => {
        this.disableBody(true, true);

        this.scene.time.delayedCall(1000, () => {
          const spawnX = spawnLeft ? this.player.x - 100 : this.player.x + 100;
          this.setPosition(spawnX, this.player.y);
          this.enableBody(true, this.x, this.y, true, true);
          this.anims.play("bodAppear", true);
          this.scene.bodTeleportAudio.play();

          this.scene.time.delayedCall(735, () => {
            this.swordAttack(this.player);
          });
          this.scene.time.delayedCall(1430, () => {
            this.isAttacking = false;
            disappearAndAttack(remainingRepeats - 1);
            this.anims.timeScale = 1;
          });
          spawnLeft = !spawnLeft;
        });
      });
    };

    disappearAndAttack(repeats);
  }

  phase3Behavior(repeats, nextThreshold) {
    if (this.phase3Running) {
      return;
    }
    this.setVelocity(0, 0);
    this.phase3Running = true;
    this.anims.play("bodDisappear", true);

    const disappearAndAttack = (remainingRepeats) => {
      if (remainingRepeats <= 0 || this.health <= nextThreshold) {
        this.setScale(1);
        this.enableBody(true, this.x, this.y, true, true);
        this.anims.play("bodAppear", true);
        this.scene.bodTeleportAudio.play();
        this.scene.time.delayedCall(735, () => {
          this.phase3Running = false;
          this.isDisappearing = false;
          this.anims.play("bodWalk", true);
          this.scene.bodWalkAudio.play();
        this.scene.bodTeleportAudio.stop();
        });
        return;
      }

      this.scene.bodWalkAudio.pause();
      this.isDisappearing = true;
      this.scene.time.delayedCall(1000, () => {
        this.disableBody(true, true);
        this.setScale(2);

        this.scene.time.delayedCall(1000, () => {
          const portalAnim = this.scene.add.sprite(
            this.player.x - 135,
            this.player.y - 160,
            "bodPortal"
          );
          portalAnim.setOrigin(0, 0);
          portalAnim.setScale(2);
          this.scene.bodPortalAudio.play();
          portalAnim.anims.play("bodPortal", true);
          const fistHitbox = this.scene.physics.add
            .image(this.player.x - 10, this.player.y - 30, null)
            .setVisible(false);
          fistHitbox.setSize(this.width * 0.38, this.height * 1.2);
          fistHitbox.setImmovable(true);
          fistHitbox.body.setAllowGravity(false);

          const enableHitboxOverlap = () => {
            const overlapCallback = () => {
              const dx = this.player.x - this.x;
              const dy = this.player.y - this.y;
              const dir = new Phaser.Math.Vector2(dx, dy)
                .normalize()
                .scale(450);

              this.player.handleDamage(dir);
              sceneEvents.emit("player-health-changed", this.player.health);

              if (this.player.health <= 0) {
                this.scene.physics.world.removeCollider(
                  this.scene.playerBODCollider
                );
                this.scene.playerBODCollider = null;
              }
            };
            this.scene.physics.add.overlap(
              fistHitbox,
              this.player,
              overlapCallback,
              null,
              this
            );
          };

          this.scene.time.delayedCall(600, () => {
            this.scene.bodFistAudio.play();
            enableHitboxOverlap();
          });
          this.scene.time.delayedCall(1067, () => {
            this.scene.bodPortalAudio.stop();
            portalAnim.destroy();
            fistHitbox.destroy();
            disappearAndAttack(remainingRepeats - 1);
          });
        });
      });
    };

    disappearAndAttack(repeats);
  }

  die() {
    this.scene.bodWalkAudio.stop();
    this.scene.bodDeathAudio.play();
    this.disableBody(true, true);
    const enemyDeathAnim = this.scene.add.sprite(
      this.x,
      this.y,
      "bodDisappear"
    );
    if (this.facingLeft) {
      enemyDeathAnim.x -= 5;
    } else {
      enemyDeathAnim.setFlipX(true);
      enemyDeathAnim.x += 5;
    }
    enemyDeathAnim.anims.timeScale = 0.8;
    // this.direction = LEFT;
    enemyDeathAnim.anims.play("bodDisappear", true);
    this.scene.time.delayedCall(1250, () => {
      const explosion = this.scene.add.sprite(
        enemyDeathAnim.x + 35,
        enemyDeathAnim.y + 20,
        "bodExplosion"
      );
      enemyDeathAnim.destroy();
      explosion.setScale(1.3);
      if (!this.facingLeft) {
        explosion.x -= 70;
      }
      explosion.anims.play("bodExplosion", true);
    });
  }

  swordAttack(player) {
    if (this) {
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
            this.scene.physics.world.removeCollider(
              this.scene.playerBODCollider
            );
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
        if (this.health > 0) {
          this.scene.bodSwordAttackAudio.play();
          enableHitboxOverlap();
        }
      });

      if (this.phase2Running) {
        this.anims.timeScale = 1.75;
      } else {
        this.anims.timeScale = 1;
      }
      this.anims.play("bodAttack", true);

      this.scene.time.delayedCall(1000, () => {
        if (this) {
          hitbox.destroy();
          this.body.setSize(this.width * 0.4, this.height * 0.6);
          this.body.offset.y = 38;
          this.body.offset.x = this.facingLeft ? 76 : 10;
        }
      });

      this.scene.time.delayedCall(1500, () => {
        if (this) {
          this.setVelocity(0, 0);
          this.isAttacking = false;
          if (!this.phase2Running) {
            this.anims.play("bodWalk", true);
          }
        }
      });
    }
  }
}
