import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";

export default class GameUI extends Phaser.Scene {
  constructor() {
    super({ key: "game-ui" });
  }

  create(data) {
    const initialHealth = data.health;

    this.hearts = this.add.group({
      classType: Phaser.GameObjects.Image,
    });

    this.hearts.createMultiple({
      key: "uiHeartFull",
      setXY: {
        x: 10,
        y: 10,
        stepX: 20,
      },
      quantity: 3,
    });

    const heartsStroke = this.add.group({
      classType: Phaser.GameObjects.Image,
    });

    heartsStroke.createMultiple({
      key: "uiHeartStroke",
      setXY: {
        x: 10,
        y: 10,
        stepX: 20,
      },
      quantity: 3,
    });

    this.knife = this.add.image(15, 27, "knife");
    this.knife.setScale(1.3);
    this.knifeCountText = this.add.text(30, 20, `${window.globalPlayerData.knives}`, {
      fontSize: "14px",
      fill: "#fff",
    });

    sceneEvents.on("update-knives-count", this.updateKnivesCount, this);

    this.lawnMowerOutline = this.add.image(270, 230, "lawn-mower-outline");
    this.lawnMowerOutline.setScale(0.2);

    this.drillOutline = this.add.image(320, 230, "drill-outline");
    this.drillOutline.setScale(0.2);

    this.wrenchOutline = this.add.image(370, 230, "wrench-outline");
    this.wrenchOutline.setScale(0.2);

    sceneEvents.on("collect-lawn-mower", this.collectLawnMower, this);

    sceneEvents.on("collect-drill", this.collectDrill, this);

    sceneEvents.on("collect-wrench", this.collectWrench, this);

    sceneEvents.on(
      "player-health-changed",
      this.handlePlayerHealthChanged,
      this
    );

    sceneEvents.on("bod-create-boss-ui", this.createBossUIBOD, this);
    sceneEvents.on("bod-fade-in-boss-ui", this.fadeInBossUIBOD, this);
    sceneEvents.on("bod-fade-out-boss-ui", this.fadeOutBossUIBOD, this);

    sceneEvents.on(
      "bod-update-boss-health-bar",
      (currentHealth, maxHealth) => {
        this.updateBossHealthBarBOD(currentHealth, maxHealth);
      },
      this
    );

    this.events.once("shutdown", () => {
      sceneEvents.off("player-health-changed", this.handlePlayerHealthChanged);
    });
  }

  updateKnivesCount() {
      this.knifeCountText.setText(window.globalPlayerData.knives);
  }

  collectLawnMower() {
    window.globalPlayerData.hasLawnMower = true;
    this.lawnMower = this.add.image(270, 230, "lawn-mower");
    this.lawnMower.setScale(0.2);
  }

  collectDrill() {
    window.globalPlayerData.hasDrill = true;
    this.drill = this.add.image(320, 230, "drill");
    this.drill.setScale(0.2);
  }

  collectWrench() {
    window.globalPlayerData.hasWrench = true;
    this.wrench = this.add.image(370, 230, "wrench");
    this.wrench.setScale(0.2);
  }

  createBossUIBOD() {
    const gameWidth = this.scale.width;

    this.bossHealthBar = this.add.graphics();
    this.updateBossHealthBarBOD(100, 100);
    this.bossHealthBar.setPosition(gameWidth / 2 - 100, 32);
    this.bossHealthBar.setDepth(1);

    this.bossNameText = this.add.text(0, 3, "KRALIN", {
      fontSize: "16px",
      fill: "#fff",
    });
    this.bossNameText.setX(gameWidth / 2 - this.bossNameText.width / 2);
    this.bossNameText.setDepth(1);

    this.bossTitleText = this.add.text(0, 17, "GUARDIAN OF THE LAWN MOWER", {
      fontSize: "11px",
      fill: "#fff",
    });
    this.bossTitleText.setX(gameWidth / 2 - this.bossTitleText.width / 2);
    this.bossTitleText.setDepth(1);

    this.bossHealthBar.setAlpha(0);
    this.bossNameText.setAlpha(0);
    this.bossTitleText.setAlpha(0);
  }

  fadeInBossUIBOD() {
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: [this.bossNameText],
        alpha: 1,
        duration: 2000,
        ease: "Power2",
      });
    });
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: [this.bossTitleText],
        alpha: 1,
        duration: 2000,
        ease: "Power2",
      });
    });
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: [this.bossHealthBar],
        alpha: 1,
        duration: 2000,
        ease: "Power2",
      });
    });
    this.time.delayedCall(6000, () => {
      this.bossIntroComplete = true;
    });
  }

  fadeOutBossUIBOD() {
    this.tweens.add({
      targets: [this.bossHealthBar, this.bossNameText, this.bossTitleText],
      alpha: 0,
      duration: 2000,
      ease: "Power2",
    });
  }

  updateBossHealthBarBOD(currentHealth, maxHealth) {
    const healthRatio = currentHealth / maxHealth;
    this.bossHealthBar.clear();

    this.bossHealthBar.fillStyle(0x000000, 0.5);
    this.bossHealthBar.fillRect(0, 0, 200, 13);

    this.bossHealthBar.fillStyle(0xff0000, 1);
    this.bossHealthBar.fillRect(0, 0, 200 * healthRatio, 10);
    this.bossHealthBar.setDepth(1);
  }

  handlePlayerHealthChanged(health) {
    this.hearts.children.each((heart, idx) => {
      if (idx < health) {
        heart.setTexture("uiHeartFull");
      } else {
        heart.setTexture("uiHeartEmpty");
      }
    });
  }
}
