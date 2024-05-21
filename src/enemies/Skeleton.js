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
  return newDirection;
};

export default class Skeleton extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.physics.world.enable(this);

    this.isVisibleToPlayer = false;
    this.moveEventActive = true;
    this.canAttack = true;
    this.body.onCollide = true;
    this.isDead = false;

    this.anims.play("enemyWalk", true);

    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );

    this.moveEvent = scene.time.addEvent({
      delay: 2000,
      callback: () => {
        if (this.moveEventActive == true)
          this.direction = randomDirection(this.direction);
      },
      loop: true,
    });

    this.direction = LEFT;

    scene.physics.world.enable(this);
    this.body.setSize(this.width * 0.6, this.height * 0.6);
    this.body.offset.y = 13;
    this.body.offset.x = 5;
  }

  destroy(fromScene) {
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  handleTileCollision(go, tile) {
    if (go !== this) {
      return;
    }

    this.direction = randomDirection(this.direction);
  }

  skeletonAttack(player) {
    if (!this.isDead) {
      if (player.x > this.x) {
        this.setFlipX(false);
      } else {
        this.setFlipX(true);
      }
      
      this.scene.time.delayedCall(600, () => {
        if (!this.isDead) {
          this.scene.skeletonAttackAudio.play();
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;
          const lungeDistance = 900;
          const lungeDx = normalizedDx * lungeDistance;
          const lungeDy = normalizedDy * lungeDistance;
          this.setVelocity(lungeDx, lungeDy);

          this.body.setSize(this.width * 0.6, this.height * 0.71);
          this.body.offset.y = 10;
          if (player.x > this.x) {
            this.body.offset.x = 15;
          } else {
            this.body.offset.x = 5;
          }
        }
      });

      this.moveEventActive = false;
      this.setVelocity(0, 0);
      this.anims.play("enemyAttack", true);

      this.scene.time.delayedCall(1667, () => {
        if (!this.isDead) {
          this.moveEventActive = true;
          this.anims.play("enemyWalk", true);
          this.body.setSize(this.width * 0.6, this.height * 0.6);
          this.body.offset.y = 13;
          this.body.offset.x = 5;
        }
      });
    }
  }

  die() {
    this.isDead = true;
    this.scene.skeletonDieAudio.play();
    this.disableBody(true, true);
    const enemyDeathAnim = this.scene.add.sprite(
      this.x - 45,
      this.y - 15,
      "enemyDeath"
    );
    if (this.direction == 2) {
      enemyDeathAnim.setFlipX(true);
    }
    enemyDeathAnim.setOrigin(0, 0);
    enemyDeathAnim.anims.play("enemyDeath", true);
    setTimeout(() => {
      this.scene.tweens.add({
        targets: enemyDeathAnim,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          enemyDeathAnim.destroy();
        },
      });
      this.destroy();
    }, 1300);
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    const speed = 50;

    const inViewport = this.scene.cameras.main.worldView.contains(
      this.x + this.body.width,
      this.y + this.body.height
    );
    if (inViewport) {
      this.isVisibleToPlayer = true;
    }

    if (this.moveEventActive && this.isVisibleToPlayer) {
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
