import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";

export default class Chest extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, type) {
    super(scene, x, y, texture);
    this.type = type;

    this.anims.play("chestClosed", true);

    scene.physics.world.enable(this);

    this.body.onCollide = true;

    scene.physics.world.enable(this);
    this.body.setSize(this.width * 0.8, this.height * 0.7);
  }

  open() {
    // const player = this.scene.player;
    this.scene.chestAudio.play();

    this.anims.play("chestOpen", true);
    this.disableBody(true, false);
    if (this.type == "knife") {
      this.scene.knife = this.scene.physics.add.image(
        this.x,
        this.y + 17,
        "knife"
      );
      this.scene.physics.add.collider(
        this.scene.player,
        this.scene.knife,
        this.collectKnives,
        null,
        this
      );
    } else if (this.type == "potion") {
      this.scene.potion = this.scene.physics.add.image(
        this.x,
        this.y + 15,
        "health-potion"
      );
      this.scene.potion.setScale(0.5);
    this.scene.potion.setSize(this.scene.potion.body.width * 0.7, this.scene.potion.body.height * 0.7);
      this.scene.physics.add.collider(
        this.scene.player,
        this.scene.potion,
        this.collectPotion,
        null,
        this
      );
    }
  }
  collectKnives(player, knife) {
    knife.destroy();
    this.scene.knifeCollectAudio.play();
    window.globalPlayerData.knives += 5;
    sceneEvents.emit("update-knives-count");
  }
  collectPotion(player, potion) {
    potion.destroy();
    this.scene.potionCollectAudio.play();
    if (window.globalPlayerData.health < 3) {
      window.globalPlayerData.health++;
      player.health = window.globalPlayerData.health;
      sceneEvents.emit("player-health-changed", player.health);
    }
  }
}