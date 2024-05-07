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
let DEAD;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.healthState = IDLE;
    this.damageTime = 0;
    this._health = 3;
  }

  setKnives(knives) {
    this.knives = knives;
  }

  get health() {
    return this._health;
  }

  handleDamage(dir) {
    if (this._health <= 0) {
      return;
    }
    if (this.healthState === DAMAGE) {
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
    }
  }

  throwKnife() {
    if (!this.knives) {
      return;
    }
    const vec = new Phaser.Math.Vector2(0, 0);
    playerThrowing = true;

    // add throwing anims

    switch (currentDirection) {
      case "down":
        this.anims.play("playerThrowD", true);
        // this.body.setSize(this.width * 0.25, this.height * 0.6);
        // this.body.offset.y = 16;
        vec.y = 1;
        break;
      case "up":
        this.anims.play("playerThrowU");
        // this.body.setSize(this.width * 0.23, this.height * 0.6);
        // this.body.offset.y = 5;
        vec.y = -1;
        break;
      case "straight":
        this.anims.play("playerThrow");
        // this.body.setSize(this.width * 0.6, this.height * 0.5);
        // this.body.offset.y = 10;
        // if (facingLeft) {
        //   this.body.offset.x = 0;
        // vec.x = -1;
        // } else {
        //   this.body.offset.x = 21;
        // vec.x = 1;
        // }
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

  preUpdate(t, dt) {
    super.preUpdate(t, dt);
    switch (this.healthState) {
      case IDLE:
        break;
      case DAMAGE:
        this.damageTime += dt;
        if (this.damageTime >= 250) {
          this.healthState = IDLE;
          this.setTint(0xffffff);
          this.damageTime = 0;
        }
        break;
    }
  }

  update(cursors) {
    console.log(currentDirection);
    if (this.healthState == DAMAGE || this.healthState == DEAD) {
      return;
    }
    if (facingLeft) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    if (this.healthState != DAMAGE) {
      if (!playerAttacking || !playerThrowing) {
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

      if (this.healthState == IDLE) {
        if (walkingX && walkingDown) {
          if (!playerAttacking && !playerThrowing) {
            this.anims.play("playerWalkDD", true);
          }
          currentDirection = "diagonal down";
          if (facingLeft) {
            this.setVelocity(-100, 100);
          } else {
            this.setVelocity(100, 100);
          }
        } else if (walkingX && walkingUp) {
          if (!playerAttacking && !playerThrowing) {
            this.anims.play("playerWalkDU", true);
          }
          currentDirection = "diagonal up";
          if (facingLeft) {
            this.setVelocity(-100, -100);
          } else {
            this.setVelocity(100, -100);
          }
        } else if (walkingX) {
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

        if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
          // if (cursors.space.isDown) {
          this.throwKnife();
          return;
        }

        if (
          Phaser.Input.Keyboard.JustDown(cursors.Z) &&
          !playerAttacking &&
          !playerThrowing
        ) {
          playerAttacking = true;
          switch (currentDirection) {
            case "down":
              this.anims.play("playerAttackD", true);
              this.body.setSize(this.width * 0.25, this.height * 0.6);
              this.body.offset.y = 16;
              break;
            case "up":
              this.anims.play("playerAttackU");
              this.body.setSize(this.width * 0.23, this.height * 0.6);
              this.body.offset.y = 5;
              // potential bug ^
              break;
            case "straight":
              this.anims.play("playerAttack");
              this.body.setSize(this.width * 0.6, this.height * 0.5);
              this.body.offset.y = 10;
              if (facingLeft) {
                this.body.offset.x = 0;
              } else {
                this.body.offset.x = 21;
              }
              break;
            case "diagonal down":
              this.anims.play("playerAttackDD");
              this.body.setSize(this.width * 0.55, this.height * 0.5);
              this.body.offset.y = 10;
              if (facingLeft) {
                this.body.offset.x = 3;
              } else {
                this.body.offset.x = 21;
              }
              break;
            case "diagonal up":
              this.anims.play("playerAttackDU");
              this.body.setSize(this.width * 0.55, this.height * 0.5);
              this.body.offset.y = 10;
              if (facingLeft) {
                this.body.offset.x = 3;
              } else {
                this.body.offset.x = 21;
              }
              break;
          }

          setTimeout(function () {
            playerAttacking = false;
          }, 267);
        }
      }

      if (
        cursors.up.isUp &&
        cursors.down.isUp &&
        cursors.left.isUp &&
        cursors.right.isUp &&
        !playerAttacking &&
        !playerThrowing &&
        this.healthState == IDLE
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
          case "diagonal down":
            this.anims.play("playerIdleDD");
            break;
          case "diagonal up":
            this.anims.play("playerIdleDU");
            break;
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
