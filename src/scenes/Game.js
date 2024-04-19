import Phaser from 'phaser'

import { debugDraw } from '../utils/debug';
import { createEnemyAnims } from '../anims/EnemyAnims';
import { createPlayerAnims } from '../anims/PlayerAnims';
import Skeleton from '../enemies/Skeleton';
import '../characters/Player'

import { sceneEvents } from '../events/EventCenter';

let cursors;
let player;
let skeletons;

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
      this.scene.run('game-ui');
  
      cursors = this.input.keyboard.createCursorKeys();
  
      const map = this.make.tilemap({ key: "dungeon" });
      const tileset = map.addTilesetImage("dungeon", "tiles", 16, 16);
  
      map.createLayer("Ground", tileset);
      const wallsLayer = map.createLayer("Walls", tileset);
  
      wallsLayer.setCollisionByProperty({ collides: true });
  
      debugDraw(wallsLayer, this);
  
      // start of player code
  
      player = this.add.player(128, 128, 'player');
  
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

        
        skeletons.get(200, 200, "skeleton");
  
      // end of enemy code
  
      this.physics.add.collider(player, wallsLayer);
      this.physics.add.collider(skeletons, wallsLayer);

      this.playerEnemyCollider = this.physics.add.collider(player, skeletons, this.playerCollision, undefined, this);

    }

    playerCollision(obj1, obj2) {
      const skeleton = obj2;
      const dx = player.x - skeleton.x;
      const dy = player.y - skeleton.y;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

      player.handleDamage(dir);

      sceneEvents.emit('player-health-changed', player.health);

      if (player.health <= 0) {
        this.playerEnemyCollider.destroy();
      }
    }
  
    update(d, dt) {

      if (player) {
        player.update(cursors);
      }
      
    }
}
