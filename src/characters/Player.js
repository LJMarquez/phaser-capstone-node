import Phaser from "phaser";

let facingLeft = false;
let currentDirection = "down";
let walkingX;
let walkingUp;
let walkingDown;
let playerAttacking = false;
let playerThrowing = false;

let IDLE = 0;
let DAMAGE = 1;
let INVINCIBLE = 2;
// let ATTACKING = 2;
// let isAttacking;
let DEAD;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.healthState = IDLE;
    this.damageTime = 0;
    this.invincibilityTime = 0;
    this._health = 3;
    this.isAttacking = false;
    this.invincibilityDuration = 1500;
    this.canDash = true;
    this.dashCooldown = 2000;
    this.dashSpeed = 2500;
    this.dashDuration = 7500;
    this.hitbox = null;
  }

  dash() {
    if (!this.canDash) {
      return;
    }

    this.canDash = false;
    // this.setTint(0x0000ff); // Optional: Change color to indicate dash (for debugging)

    let dashVector = new Phaser.Math.Vector2();
    switch (currentDirection) {
      case "down":
        dashVector.set(0, this.dashSpeed);
        break;
      case "up":
        dashVector.set(0, -this.dashSpeed);
        break;
      case "straight":
        dashVector.set(facingLeft ? -this.dashSpeed : this.dashSpeed, 0);
        break;
      default:
        break;
    }

    this.setVelocity(dashVector.x, dashVector.y);

    this.scene.time.delayedCall(this.dashDuration, () => {
      this.setVelocity(0, 0);
      // this.setTint(0xffffff); // Reset color
    });

    this.scene.time.delayedCall(this.dashCooldown, () => {
      this.canDash = true;
    });
  }

  setKnives(knives) {
    this.knives = knives;
  }

  get health() {
    return this._health;
  }

  // get isAttacking() {
  //   return this._isAttacking;
  // }

  handleDamage(dir) {
    if (this._health <= 0) {
      return;
    }
    if (this.healthState === DAMAGE || this.healthState === INVINCIBLE) {
      return;
    }

    this._health--;
    if (this._health <= 0) {
      // die
      this.healthState = DEAD;
      this.setVelocity(dir.x, dir.y);
      this.anims.play("playerHit", true);
      this.damageTime = 0;
      setTimeout(() => {
        this.anims.play("playerFaint", true);
        this.setVelocity(0, 0);
      }, 250);
    } else {
      this.setVelocity(dir.x, dir.y);
      this.setTint(0xff0000);
      this.anims.play("playerHit", true);
      this.healthState = DAMAGE;
      this.damageTime = 0;

      // this.healthState = INVINCIBLE;
      // this.invincibilityTime = 0;
      // this.startFlashing();
    }
  }

  startFlashing() {
    this.flashTimer = this.scene.time.addEvent({
      delay: 100, // 100 ms between flashes
      callback: () => {
        // this.setVisible(!this.visible);
        if (this.tintTopLeft === 0xffffff) {
          this.setTint(0x000000); // Flash to black
        } else {
          this.setTint(0xffffff); // Flash to white
        }
      },
      repeat: this.invincibilityDuration / 100 - 1, // Number of flashes
    });

    this.scene.time.delayedCall(this.invincibilityDuration, () => {
      this.healthState = IDLE;
      // this.setVisible(true);
      this.setTint(0xffffff);
      this.flashTimer.remove();
    });
  }

  throwKnife() {
    if (!this.knives) {
      return;
    }

    if (!playerThrowing) {
      if (
        currentDirection == "down" ||
        currentDirection == "up" ||
        currentDirection == "straight"
      ) {
        const vec = new Phaser.Math.Vector2(0, 0);
        playerThrowing = true;

        switch (currentDirection) {
          case "down":
            this.anims.play("playerThrowD", true);
            vec.y = 1;
            break;
          case "up":
            this.anims.play("playerThrowU");
            vec.y = -1;
            break;
          case "straight":
            this.anims.play("playerThrow");
            vec.x = facingLeft ? -1 : 1;
            break;
        }
        const angle = vec.angle();
        const knife = this.knives.get(this.x, this.y, "knife");

        setTimeout(function () {
          knife.setActive(true);
          knife.setVisible(true);

          knife.setRotation(angle);

          knife.x += vec.x * 16;
          knife.y += vec.y * 16;

          knife.setVelocity(vec.x * 300, vec.y * 300);
        }, 180);

        setTimeout(function () {
          playerThrowing = false;
        }, 267);
      }
    }
  }

  swordAttack() {
    playerAttacking = true;
    this.isAttacking = true;

    this.hitbox = this.scene.physics.add.image(this.x, this.y, null).setVisible(false);

    switch (currentDirection) {
      case "down":
        this.anims.play("playerAttackD", true);
        // this.body.setSize(this.width * 0.25, this.height * 0.6);
        this.body.offset.y = 16;
        this.hitbox.setSize(this.width * 0.27, this.height * 0.6);
        break;
      case "up":
        this.anims.play("playerAttackU");
        // this.body.setSize(this.width * 0.23, this.height * 0.6);
        this.body.offset.y = 10;
        // potential bug ^
        this.hitbox.setSize(this.width * 0.25, this.height * 0.6);
        break;
      case "straight":
        this.anims.play("playerAttack");
        // this.body.setSize(this.width * 0.6, this.height * 0.5);
        this.body.offset.y = 10;
        if (facingLeft) {
          this.body.offset.x = 0;
        } else {
          this.body.offset.x = 21;
        }
        this.hitbox.setSize(this.width * 0.62, this.height * 0.5);
        break;
    }

    this.hitbox.setImmovable(true);
    this.hitbox.body.setAllowGravity(false);

    this.hitbox.x = this.x;
    this.hitbox.y = this.y;

    

    setTimeout(() => {
      playerAttacking = false;
      this.isAttacking = !this.isAttacking;
      if (this.hitbox) {
        this.hitbox.destroy();
      }
    }, 267);
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);
    switch (this.healthState) {
      case IDLE:
        break;
      case DAMAGE:
        this.damageTime += dt;
        if (this.damageTime >= 250) {
          this.healthState = INVINCIBLE;
          this.invincibilityTime = 0;
          this.startFlashing();
          // this.setTint(0xffffff);
          // this.damageTime = 0;
        }
        break;
      case INVINCIBLE:
        this.invincibilityTime += dt;
        if (this.invincibilityTime >= this.invincibilityDuration) {
          this.healthState = IDLE;
          // this.setVisible(true);
          this.setTint(0xffffff);
          this.invincibilityTime = 0;
        }
        break;
    }
  }

  update(cursors, zKey, xKey, shiftKey) {
    if (this.healthState == DAMAGE || this.healthState == DEAD) {
      return;
    }
    if (facingLeft) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    if (this.healthState != DAMAGE) {
      if (!playerAttacking) {
        this.body.setSize(this.width * 0.23, this.height * 0.39);
        this.body.offset.x = 21;
        this.body.offset.y = 16;
      }

      if (cursors.left.isDown) {
        facingLeft = true;
        walkingX = true;
      } else if (cursors.right.isDown) {
        facingLeft = false;
        walkingX = true;
      } else if (cursors.right.isUp && cursors.left.isUp) {
        walkingX = false;
      }

      if (cursors.up.isDown) {
        walkingUp = true;
        walkingDown = false;
      } else if (cursors.down.isDown) {
        walkingDown = true;
        walkingUp = false;
      }
      if (cursors.up.isUp) {
        walkingUp = false;
      }
      if (cursors.down.isUp) {
        walkingDown = false;
      }

      if (this.healthState == IDLE || this.healthState == INVINCIBLE) {
        // if (walkingX && walkingDown) {
        //   if (!playerAttacking && !playerThrowing) {
        //     this.anims.play("playerWalkDD", true);
        //   }
        //   currentDirection = "diagonal down";
        //   if (facingLeft) {
        //     this.setVelocity(-100, 100);
        //   } else {
        //     this.setVelocity(100, 100);
        //   }
        // } else if (walkingX && walkingUp) {
        //   if (!playerAttacking && !playerThrowing) {
        //     this.anims.play("playerWalkDU", true);
        //   }
        //   currentDirection = "diagonal up";
        //   if (facingLeft) {
        //     this.setVelocity(-100, -100);
        //   } else {
        //     this.setVelocity(100, -100);
        //   }
        // } else

        if (walkingX) {
          if (!playerAttacking && !playerThrowing) {
            this.anims.play("playerWalk", true);
          }
          currentDirection = "straight";
          if (facingLeft) {
            this.setVelocity(-100, 0);
          } else {
            this.setVelocity(100, 0);
          }
        } else if (walkingUp) {
          if (!playerAttacking && !playerThrowing) {
            this.anims.play("playerWalkU", true);
          }
          currentDirection = "up";
          this.setVelocity(0, -100);
        } else if (walkingDown) {
          if (!playerAttacking && !playerThrowing) {
            this.anims.play("playerWalkD", true);
          }
          currentDirection = "down";
          this.setVelocity(0, 100);
        }

        // if (walkingX) {
        //   if (!playerAttacking && !playerThrowing) {
        //     this.anims.play("playerWalk", true);
        //     this.anims.stop("playerWalkU");
        //     this.anims.stop("playerWalkD");
        //     if (facingLeft) {
        //       this.setVelocity(-90, 0);
        //     } else {
        //       this.setVelocity(90, 0);
        //     }
        //   }
        //   currentDirection = "straight";
        // }
        // if (walkingUp) {
        //   if (!playerAttacking && !playerThrowing) {
        //     this.anims.play("playerWalkU", true);
        //     this.anims.stop("playerWalk");
        //     this.anims.stop("playerWalkD");
        //     this.setVelocity(0, -90);
        //   }
        //   currentDirection = "up";
        // }
        // if (walkingDown) {
        //   if (!playerAttacking && !playerThrowing) {
        //     this.anims.play("playerWalkD", true);
        //     this.anims.stop("playerWalkU");
        //     this.anims.stop("playerWalk");
        //     this.setVelocity(0, 90);
        //   }
        //   currentDirection = "down";
        // }

        xKey.on("down", () => {
          if (Phaser.Input.Keyboard.JustDown(xKey)) {
            this.throwKnife();
            return;
          }
        });

        zKey.on("down", () => {
          if (
            Phaser.Input.Keyboard.JustDown(zKey) &&
            !playerAttacking &&
            !playerThrowing
          ) {
            this.swordAttack();

            // this.setVelocity(0, 0);
            // playerAttacking = true;
            // switch (currentDirection) {
            //   case "down":
            //     this.anims.play("playerAttackD", true);
            //     this.body.setSize(this.width * 0.25, this.height * 0.6);
            //     this.body.offset.y = 16;
            //     break;
            //   case "up":
            //     this.anims.play("playerAttackU");
            //     this.body.setSize(this.width * 0.23, this.height * 0.6);
            //     this.body.offset.y = 5;
            //     // potential bug ^
            //     break;
            //   case "straight":
            //     this.anims.play("playerAttack");
            //     this.body.setSize(this.width * 0.6, this.height * 0.5);
            //     this.body.offset.y = 10;
            //     if (facingLeft) {
            //       this.body.offset.x = 0;
            //     } else {
            //       this.body.offset.x = 21;
            //     }
            //     break;

            // case "diagonal down":
            //   this.anims.play("playerAttackDD");
            //   this.body.setSize(this.width * 0.55, this.height * 0.5);
            //   this.body.offset.y = 10;
            //   if (facingLeft) {
            //     this.body.offset.x = 3;
            //   } else {
            //     this.body.offset.x = 21;
            //   }
            //   break;
            // case "diagonal up":
            //   this.anims.play("playerAttackDU");
            //   this.body.setSize(this.width * 0.55, this.height * 0.5);
            //   this.body.offset.y = 10;
            //   if (facingLeft) {
            //     this.body.offset.x = 3;
            //   } else {
            //     this.body.offset.x = 21;
            //   }
            //   break;
            //     }

            //     setTimeout(function () {
            //       playerAttacking = false;
            //       this.healthState = IDLE;
            //     }, 267);
          }
        });

        shiftKey.on("down", () => {
          if (Phaser.Input.Keyboard.JustDown(shiftKey)) {
            this.dash();
          }
        });
      }

      if (
        cursors.up.isUp &&
        cursors.down.isUp &&
        cursors.left.isUp &&
        cursors.right.isUp &&
        !playerAttacking &&
        !playerThrowing &&
        (this.healthState == IDLE || this.healthState == INVINCIBLE)
      ) {
        this.setVelocity(0);
        walkingDown = false;
        walkingUp = false;
        walkingX = false;
        switch (currentDirection) {
          case "down":
            this.anims.play("playerIdleD", true);
            break;
          case "up":
            this.anims.play("playerIdleU");
            break;
          case "straight":
            this.anims.play("playerIdle");
            break;
          // case "diagonal down":
          //   this.anims.play("playerIdleDD");
          //   break;
          // case "diagonal up":
          //   this.anims.play("playerIdleDU");
          //   break;
        }
      }
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "player",
  function (x, y, texture, frame) {
    let sprite = new Player(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(
      sprite,
      Phaser.Physics.Arcade.DYNAMIC_BODY
    );

    return sprite;
  }
);
