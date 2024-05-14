import Phaser from "phaser";

import { debugDraw } from "../utils/debug";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { createPlayerAnims } from "../anims/PlayerAnims";
import Skeleton from "../enemies/Skeleton";
import "../characters/Player";

import { sceneEvents } from "../events/EventCenter";

let cursors;
let zKey;
let xKey;
let player;
let skeletons;

export default class Start extends Phaser.Scene {
  constructor() {
    super("start");
  }

  preload() {}

  create() {
    createPlayerAnims(this.anims);
    createEnemyAnims(this.anims);
    this.scene.run("game-ui");

    cursors = this.input.keyboard.createCursorKeys();
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    const map = this.make.tilemap({ key: "test" });
    const tileset = map.addTilesetImage("test", "tiles", 16, 16);

    map.createLayer("Ground", tileset);
    const wallsLayer = map.createLayer("Walls", tileset);

    wallsLayer.setCollisionByProperty({ collides: true });

    // debugDraw(wallsLayer, this);

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    // start of player code

    player = this.add.player(128, 128, "player", cursors);
    player.setKnives(this.knives);

    this.cameras.main.startFollow(player, true);

    // end of player code

    // start of enemy code

    this.skeletons = this.physics.add.group({
      classType: Skeleton,
      createCallback: (go) => {
        const skelGo = go;
        skelGo.body.onCollide = true;
      },
    });

    this.skeletons.get(200, 100, "skeleton");
    this.skeletons.get(200, 200, "skeleton");

    // end of enemy code

    this.physics.add.collider(player, wallsLayer);
    this.physics.add.collider(this.skeletons, wallsLayer);

    this.physics.add.collider(
      this.knives,
      wallsLayer,
      this.knifeWallCollision,
      undefined,
      this
    );
    this.physics.add.collider(
      this.knives,
      this.skeletons,
      this.knifeSkeletonCollision,
      undefined,
      this
    );

    this.playerEnemyCollider = this.physics.add.collider(
      player,
      this.skeletons,
      this.playerCollision,
      undefined,
      this
    );
  }

  knifeWallCollision(knife, obj2) {
    this.knives.killAndHide(knife);
  }

  knifeSkeletonCollision(knife, skeleton) {
    this.knives.killAndHide(knife);
    skeleton.disableBody(true, true);
  }

  playerCollision(player, skeleton) {
    const dx = player.x - skeleton.x;
    const dy = player.y - skeleton.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

    player.handleDamage(dir);

    sceneEvents.emit("player-health-changed", player.health);

    if (player.health <= 0) {
      this.playerEnemyCollider.destroy();
    }
  }

  update(d, dt) {
    if (player) {
      player.update(cursors, zKey, xKey);
    }
  }
}
