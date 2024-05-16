import Phaser from "phaser";

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
let directionChanged = false;

const randomDirection = (exclude) => {
  let newDirection = Phaser.Math.Between(0, 3);
  while (newDirection === exclude) {
    newDirection = Phaser.Math.Between(0, 3);
  }
  return newDirection;
};

export default class BOD extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, player) {
    super(scene, x, y, texture);

    this.canAttack = true;

    this.isAttacking = false;

    this.player = player;

    this.facingLeft = null;
    // this.xDirection = null;

    this.health = 30;

    this.anims.play("bodWalk", true);

    scene.physics.world.enable(this);

    this.body.onCollide = true;

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );

    this.moveEvent = scene.time.addEvent({
      delay: 2000,
      callback: () => {
        this.direction = randomDirection(this.direction);
      },
      loop: true,
    });

    this.direction = LEFT;

    scene.physics.world.enable(this);
    // this.setScale(1.2);
    this.body.setSize(this.width * 0.4, this.height * 0.6);
    this.body.offset.y = 38;
    this.body.offset.x = 76;
  }

  destroy(fromScene) {
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  handleTileCollision(go, tile) {
    if (go !== this) {
      return;
    }

    const newDirection = Phaser.Math.Between(0, 3);
    this.direction = randomDirection(this.direction);
  }
  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    const speed = 30;
    const player = this.scene.player;

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
      // Adjust the x position only once when the sprite flips
      if (this.flipX) {
        this.x += 70;
        this.body.offset.x = 10;
      } else {
        this.x -= 70;
        this.body.offset.x = 76;
      }
    }
  }
}
