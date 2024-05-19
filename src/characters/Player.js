import Phaser from "phaser";

let facingLeft = false;
let currentDirection = "up";
let walkingX;
let walkingUp;
let walkingDown;
let playerAttacking = false;
let playerThrowing = false;

const IDLE = 0;
const DAMAGE = 1;
const INVINCIBLE = 2;
const DEAD = 3;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);

    this.healthState = IDLE;
    this.damageTime = 0;
    this.invincibilityTime = 0;
    this.isAttacking = false;
    this.invincibilityDuration = 1500;
    this.canDash = true;
    this.dashCooldown = 750;
    this.dashSpeed = 3000;
    this.dashDuration = 100;
    this.hitbox = null;
    this.isDead = false;
    this._health = 3;

    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
  }

  dash() {
    if (!this.canDash) {
      return;
    }

    this.canDash = false;

    const originalPosition = { x: this.x, y: this.y };

    switch (currentDirection) {
      case "down":
        this.setVelocity(0, this.dashSpeed);
        break;
      case "up":
        this.setVelocity(0, -this.dashSpeed);
        break;
      case "straight":
        this.setVelocity(facingLeft ? -this.dashSpeed : this.dashSpeed, 0);
        break;
    }

    this.scene.time.delayedCall(this.dashDuration, () => {
      this.setVelocity(0, 0);

      const tileX = this.scene.wallsLayer.worldToTileX(this.x);
      const tileY = this.scene.wallsLayer.worldToTileY(this.y);
      const tiles = this.scene.wallsLayer.getTilesWithinWorldXY(
        this.x,
        this.y,
        1,
        1
      );

      const collidingTile = tiles.find(
        (tile) => tile.properties.collision === true
      );

      if (collidingTile) {
        this.setPosition(originalPosition.x, originalPosition.y);
      }

      this.scene.time.delayedCall(this.dashCooldown, () => {
        this.canDash = true;
      });
    });
  }

  setKnives(knives) {
    this.knives = knives;
  }

  get health() {
    return this._health;
  }

  set health(value) {
    this._health = value;
  }

  handleDamage(dir) {
    if (this._health <= 0) {
      return;
    }
    if (this.healthState === DAMAGE || this.healthState === INVINCIBLE) {
      return;
    }

    this._health--;
    window.globalPlayerData.health = this._health;
    if (this._health <= 0) {
      this.isDead = true;
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

    this.hitbox = this.scene.physics.add
      .image(this.x, this.y, null)
      .setVisible(false);

    switch (currentDirection) {
      case "down":
        this.anims.play("playerAttackD", true);
        this.hitbox.setOffset(0, 16);
        this.hitbox.setSize(this.width * 0.25, this.height * 0.74);
        break;
      case "up":
        this.anims.play("playerAttackU");
        this.hitbox.setOffset(0, 10);
        this.hitbox.setSize(this.width * 0.23, this.height * 0.6);
        break;
      case "straight":
        this.anims.play("playerAttack");
        if (facingLeft) {
          this.hitbox.setOffset(0, 10);
        } else {
          this.hitbox.setOffset(21, 10);
        }
        this.hitbox.setSize(this.width * 0.6, this.height * 0.5);
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
        }
        break;
      case INVINCIBLE:
        this.invincibilityTime += dt;
        if (this.invincibilityTime >= this.invincibilityDuration) {
          this.healthState = IDLE;
          this.setTint(0xffffff);
          this.invincibilityTime = 0;
        }
        break;
    }
  }

  update(cursors, zKey, xKey, shiftKey) {
    if (this.scene.physics.world.collide(this, this.scene.wallsLayer)) {
      console.log("collide");
    }
    if (this.healthState == DAMAGE || this.healthState == DEAD) {
      return;
    }
    if (facingLeft) {
      this.setFlipX(true);
    } else {
      this.setFlipX(false);
    }

    if (this.hitbox) {
      switch (currentDirection) {
        case "down":
          this.hitbox.x = this.x;
          this.hitbox.y = this.y + 7;
          break;
        case "up":
          this.hitbox.x = this.x;
          this.hitbox.y = this.y - 8;
          break;
        case "straight":
          if (facingLeft) {
            this.hitbox.x = this.x - 14;
            this.hitbox.y = this.y;
          } else {
            this.hitbox.x = this.x + 14;
            this.hitbox.y = this.y;
          }
          break;
      }
    }

    if (this.healthState != DAMAGE && this._health > 0) {
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

        xKey.on("down", () => {
          if (Phaser.Input.Keyboard.JustDown(xKey) && !this.isDead) {
            this.throwKnife();
            return;
          }
        });

        zKey.on("down", () => {
          if (
            Phaser.Input.Keyboard.JustDown(zKey) &&
            !playerAttacking &&
            !playerThrowing &&
            !this.isDead
          ) {
            this.swordAttack();
          }
        });

        shiftKey.on("down", () => {
          if (Phaser.Input.Keyboard.JustDown(shiftKey) && !this.isDead) {
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
