import Phaser from "phaser";
import { createEnemyAnims } from "../anims/EnemyAnims";
import { createPlayerAnims } from "../anims/PlayerAnims";
import "../characters/Player";
import { sceneEvents } from "../events/EventCenter";

let cursors;
let zKey;
let xKey;
let shiftKey;
let player;

export default class End extends Phaser.Scene {
  constructor() {
    super("end");
    this.player = null;
    this.wallsLayer = null;
    this.lockedDoor = null;
    this.openDoor = null;
    this.healthInitialized = false;
  }

  preload() {
    this.load.audio("playerDash", "audio/player-dash.wav");
    this.load.audio("playerAttack", "audio/player-attack.wav");
    this.load.audio("playerThrow", "audio/bodTeleport.wav");
    this.load.audio("endMusic", "audio/end.mp3");
  }

  create() {
    createPlayerAnims(this.anims);
    createEnemyAnims(this.anims);

    this.scene.stop("game-ui");

    this.playerDashAudio = this.sound.add("playerDash", { volume: 0.5 });
    this.playerAttackAudio = this.sound.add("playerAttack", { volume: 0.75 });
    this.endAudio = this.sound.add("endMusic", { loop: true, volume: 0.3 });

    this.endAudio.play();

    cursors = this.input.keyboard.createCursorKeys();
    zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    const map = this.make.tilemap({ key: "end-room" });
    const tileset = map.addTilesetImage(
      "dungeon_tiles_quatro",
      "tiles4",
      16,
      16
    );

    map.createLayer("Ground", tileset);
    map.createLayer("Gracias", tileset);
    this.wallsLayer = map.createLayer("Walls", tileset);
    this.openDoor = map.createLayer("Door", tileset);

    this.wallsLayer.setCollisionByProperty({ collides: true });
    this.openDoor.setCollisionByProperty({ collides: true });

    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
    });

    this.oldMan = this.physics.add.sprite(190, 100, "oldMan");
    this.oldMan.anims.play("oldManIdle", true);
    this.oldMan.setScale(1);
    this.oldMan.setFlipX(true);

    this.player = this.add.player(159, 255, "player", cursors);
    this.player.setKnives(this.knives);

    if (window.globalPlayerData) {
      this.player.health = window.globalPlayerData.health;
    }

    this.cameras.main.startFollow(this.player, true);

    this.physics.add.collider(this.player, this.wallsLayer);

    this.physics.add.collider(
      this.player,
      this.openDoor,
      this.nextLevel,
      null,
      this
    );

    this.oldManCollider = this.physics.add.collider(
      this.player,
      this.oldMan,
      this.oldManTalk,
      null,
      this
    );

    this.physics.add.collider(
      this.knives,
      this.wallsLayer,
      this.knifeWallCollision,
      undefined,
      this
    );
  }

  oldManTalk() {
    this.oldManCollider.destroy();
    this.oldMan.disableBody(true, false);
    this.controlsText = this.add.text(
      this.oldMan.x,
      this.oldMan.y + 20,
      "You're alive! Did you find the mystical lawn mower of the realms?",
      {
        fontSize: "13px",
        fill: "#fff",
        align: "center",
        wordWrap: { width: 250 },
      }
    );
    this.controlsText.x = this.controlsText.x - this.controlsText.width / 2;
    this.time.delayedCall(6000, () => {
      this.controlsText.setText(
        "Congratulations my friend, you did it! You got the lawn mower and will restore peace to society!"
      );
    });
    this.time.delayedCall(12000, () => {
      this.controlsText.setText(
        "However my good friend, your journey has only just begun!"
      );
    });
    this.time.delayedCall(18000, () => {
      this.controlsText.setText(
        "As the chapter to this story comes to a close, many more will begin to open for you."
      );
    });
    this.time.delayedCall(24000, () => {
      this.controlsText.setText(
        "You've learned so much over your journey, and if you continue to put forth that same heart into your future travels, you'll be a force to be reckoned with!"
      );
    });
    this.time.delayedCall(33000, () => {
      this.controlsText.setText(
        "But for now, goodbye dear friend. Until we meet again..."
      );
    });
    this.time.delayedCall(37000, () => {
      this.tweens.add({
        targets: [this.controlsText],
        alpha: 0,
        duration: 2000,
        ease: "Power2",
      });
    });
  }

  knifeWallCollision(knife) {
    knife.destroy();
  }

  nextLevel() {
    window.location.reload();
  }

  update(d, dt) {
    if (this.player) {
      this.player.update(cursors, zKey, xKey, shiftKey);
    }

    if (!this.healthInitialized) {
      if (window.globalPlayerData.hasLawnMower === true) {
        sceneEvents.emit("collect-lawn-mower");
      }
      if (window.globalPlayerData.hasDrill === true) {
        sceneEvents.emit("collect-drill");
      }
      if (window.globalPlayerData.hasWrench === true) {
        sceneEvents.emit("collect-wrench");
      }
      sceneEvents.emit("player-health-changed", this.player.health);
      this.healthInitialized = true;
    }
  }
}
