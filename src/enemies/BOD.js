import Phaser from "phaser";

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
// let health = 30;
let direction;

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

    this.player = player;

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
    this.setScale(1.2);
    this.body.setSize(this.width * 0.4, this.height * 0.61);
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

    // const newDirection = Phaser.Math.Between(0, 3);
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

    switch (this.direction) {
      case UP:
        this.setVelocity(0, -speed);
        break;
      case DOWN:
        this.setVelocity(0, speed);
        break;
      case LEFT:
        this.setFlipX(false);
        this.body.offset.y = 38;
        this.body.offset.x = 76;
        this.x -= 66;
        this.setVelocity(-speed, 0);
        break;
      case RIGHT:
        this.setFlipX(true);
        this.body.offset.y = 38;
        this.body.offset.x = 10;
        this.x += 66;
        this.setVelocity(speed, 0);
        break;
    }

    // switch (this.direction) {
    //   case UP:
    //     this.setVelocityY(-50);
    //     break;
    //   case DOWN:
    //     this.setVelocityY(50);
    //     break;
    //   case LEFT:
    //     this.setVelocityX(-50);
    //     this.body.offset.x = 18;
    //     break;
    //   case RIGHT:
    //     this.setFlipX(true);
    //     this.setVelocityX(50);
    //     this.setFlipX(false);
    //     this.body.offset.x = 5;
    //     break;
    // }
  }
}
