import Phaser from 'phaser'

import { debugDraw } from './utils/debug';
import { createEnemyAnims } from '../anims/EnemyAnims';
import { createPlayerAnims } from '../anims/PlayerAnims';
import Skeleton from '../enemies/Skeleton';

let cursors;
let player;
let skeletons;
let facingLeft = false;
let currentDirection = "down";
let walkingX;
let walkingUp;
let walkingDown;
let playerAttacking = false;

export default class Game extends Phaser.Scene
{
	constructor()
	{
		super('game')
	}

    preload() {}

    create() {
      createPlayerAnims(this.anims);
      createEnemyAnims(this.anims);
  
      cursors = this.input.keyboard.createCursorKeys();
  
      const map = this.make.tilemap({ key: "dungeon" });
      const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16);
  
      map.createLayer("Ground", tileset);
      const wallsLayer = map.createLayer("Walls", tileset);
  
      wallsLayer.setCollisionByProperty({ collides: true });
  
      debugDraw(wallsLayer, this);
  
      // start of player code
  
      player = this.physics.add.sprite(128, 128, "playerIdle");
      player.body.setSize(player.width * 0.25, player.height * 0.4);
      // player.setScale(2);
      // player.body.offset.x = 40;
      // player.body.offset.y = 38;
  
      this.cameras.main.startFollow(player, true);
  
      // end of player code
  
      // start of enemy code
      
      skeletons = this.physics.add.group({
          classType: Skeleton,
          createCallback: (go) => {
              const skelGo = go;
              skelGo.body.onCollide = true;
            }
        })
        
        skeletons.get(150, 150, "skeleton");
  
      // end of enemy code
  
      this.physics.add.collider(player, wallsLayer);
      this.physics.add.collider(skeletons, wallsLayer);
      this.physics.add.collider(player, skeletons);

    }
  
    update() {
      // start of player logic
      if (facingLeft) {
        player.setFlipX(true);
      } else {
        player.setFlipX(false);
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
  
      if (walkingX && walkingDown) {
        player.anims.play("playerWalkDD", true);
        currentDirection = "diagonal down";
        if (facingLeft) {
          player.setVelocity(-100, 100);
        } else {
          player.setVelocity(100, 100);
        }
      } else if (walkingX && walkingUp) {
        player.anims.play("playerWalkDU", true);
        currentDirection = "diagonal up";
        if (facingLeft) {
          player.setVelocity(-100, -100);
        } else {
          player.setVelocity(100, -100);
        }
      } else if (walkingX) {
        player.anims.play("playerWalk", true);
        currentDirection = "straight";
        if (facingLeft) {
          player.setVelocity(-100, 0);
        } else {
          player.setVelocity(100, 0);
        }
      } else if (walkingUp) {
        player.anims.play("playerWalkU", true);
        currentDirection = "up";
        player.setVelocity(0, -100);
      } else if (walkingDown) {
        player.anims.play("playerWalkD", true);
        currentDirection = "down";
        player.setVelocity(0, 100);
      }
  
      if (Phaser.Input.Keyboard.JustDown(cursors.space) && !playerAttacking) {
        playerAttacking = true;
        switch (currentDirection) {
          case "down":
            player.anims.play("playerAttackD", true);
            console.log("Attacking")
            break;
          case "up":
            player.anims.play("playerAttackU");
            break;
          case "straight":
            player.anims.play("playerAttack");
            break;
          case "diagonal down":
            player.anims.play("playerAttackDD");
            break;
          case "diagonal up":
            player.anims.play("playerAttackDU");
            break;
        }

        setTimeout(function () {
            playerAttacking = false;
        }, 267)
      }
  
      console.log(playerAttacking);


  
      if (
        cursors.up.isUp &&
        cursors.down.isUp &&
        cursors.left.isUp &&
        cursors.right.isUp &&
        !playerAttacking
      ) {
        player.setVelocity(0);
        walkingDown = false;
        walkingUp = false;
        walkingX = false;
        switch (currentDirection) {
          case "down":
            player.anims.play("playerIdleD", true);
            break;
          case "up":
            player.anims.play("playerIdleU");
            break;
          case "straight":
            player.anims.play("playerIdle");
            break;
          case "diagonal down":
            player.anims.play("playerIdleDD");
            break;
          case "diagonal up":
            player.anims.play("playerIdleDU");
            break;
        }
      }
      // end of player logic
    }
}
