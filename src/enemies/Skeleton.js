import Phaser from "phaser";

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;
let direction;

const randomDirection = (exclude) => {
    let newDirection = Phaser.Math.Between(0, 3);
    while (newDirection === exclude) {
      newDirection = Phaser.Math.Between(0, 3);
    }
    return newDirection
  }

export default class Skeleton extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.moveEventActive = true;

        this.canAttack = true;
    
        this.anims.play("enemyWalk", true);
    
        scene.physics.world.enable(this);

        this.body.onCollide = true;
    
        scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this)
    
        this.moveEvent = scene.time.addEvent({
          delay: 2000,
          callback: () => {
            if (this.moveEventActive == true)
            this.direction = randomDirection(this.direction);
          },
          loop: true
        })
    
        this.direction = LEFT;
    
        scene.physics.world.enable(this);
        // this.setScale(0.65);
        this.body.setSize(this.width * 0.6, this.height * 0.6);
        this.body.offset.y = 13;
        this.body.offset.x = 5;
      }
    
      destroy(fromScene) {
        this.moveEvent.destroy();
        super.destroy(fromScene)
      }
    
      handleTileCollision(go, tile) {
        if (go !== this) {
          return
        }
    
        // const newDirection = Phaser.Math.Between(0, 3);
        this.direction = randomDirection(this.direction);
      }
      preUpdate(t, dt) {
        super.preUpdate(t, dt);
    
        const speed = 50;
    
        if (this.moveEventActive) {
          switch (this.direction) {
            case UP:
              this.setVelocityY(-50);
              break;
            case DOWN:
              this.setVelocityY(50);
              break;
            case LEFT:
              this.setVelocityX(-50);
              this.setFlipX(true);
              this.body.offset.x = 18;
              break;
            case RIGHT:
              this.setVelocityX(50);
              this.setFlipX(false);
              this.body.offset.x = 5;
              break;
          }
        } else {
          this.setVelocity(0, 0);
        }
      }
}