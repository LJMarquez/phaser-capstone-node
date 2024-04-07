import Phaser from "phaser";

let facingLeft = false;
let currentDirection = "down";
let walkingX;
let walkingUp;
let walkingDown;
let playerAttacking = false;
let damageTime = 0;

let IDLE = 0;
let DAMAGE = 1;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.healthState = IDLE;
    }

    handleDamage(dir) {
        if (this.healthState == DAMAGE) {
            return
        }
        console.log("HIT");
        this.setVelocity(dir.x, dir.y);
        this.setTint(0xff0000);
        this.healthState = DAMAGE;
        this.damageTime = 0;
    }

    preUpdate(t, dt) {
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
        console.log(this.healthState);
        if (facingLeft) {
            this.setFlipX(true);
          } else {
            this.setFlipX(false);
          }
    
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
      
          if (this.healthState == IDLE) {
              if (walkingX && walkingDown) {
                if (!playerAttacking) {
                  this.anims.play("playerWalkDD", true);
                }
                currentDirection = "diagonal down";
                if (facingLeft) {
                  this.setVelocity(-100, 100);
                } else {
                  this.setVelocity(100, 100);
                }
              } else if (walkingX && walkingUp) {
                if (!playerAttacking) {
                  this.anims.play("playerWalkDU", true);
                }
                currentDirection = "diagonal up";
                if (facingLeft) {
                  this.setVelocity(-100, -100);
                } else {
                  this.setVelocity(100, -100);
                }
              } else if (walkingX) {
                if (!playerAttacking) {
                  this.anims.play("playerWalk", true);
                }
                currentDirection = "straight";
                if (facingLeft) {
                  this.setVelocity(-100, 0);
                } else {
                  this.setVelocity(100, 0);
                }
              } else if (walkingUp) {
                if (!playerAttacking) {
                  this.anims.play("playerWalkU", true);
                }
                currentDirection = "up";
                this.setVelocity(0, -100);
              } else if (walkingDown) {
                if (!playerAttacking) {
                  this.anims.play("playerWalkD", true);
                }
                currentDirection = "down";
                this.setVelocity(0, 100);
              }
          
              if (Phaser.Input.Keyboard.JustDown(cursors.space) && !playerAttacking) {
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
                }, 267)
              }
          }
    
      
          if (
            cursors.up.isUp &&
            cursors.down.isUp &&
            cursors.left.isUp &&
            cursors.right.isUp &&
            !playerAttacking && 
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

Phaser.GameObjects.GameObjectFactory.register('player', function(x, y, texture, frame) {
    let sprite = new Player(this.scene, x, y, texture, frame);

    this.displayList.add(sprite);
    this.updateList.add(sprite);

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);

    return sprite
})