import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";

export default class GameUI extends Phaser.Scene {
  constructor() {
    super({ key: "boss-end-ui" });
  }

  create(data) {sceneEvents.on("bod-intro", this.bodIntro, this);
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

  bodIntro() {
    const gameWidth = this.scale.width;
    this.bossIntroText = this.add.text(
      0,
      20,
      "So, you've come for the legendary lawn mower. Foolish. You don't know the power you seek.",
      {
        fontSize: "16px",
        fill: "#fff",
        align: "center",
        wordWrap: { width: 300 },
      }
    );
    this.bossIntroText.setX(gameWidth / 2 - this.bossIntroText.width / 2);
    this.bossIntroText.setDepth(1);
    this.time.delayedCall(6000, () => {
      this.bossIntroText.setText(
        "This relic is mine to protect, and yours to fear. You'll never take it from me."
      );
    });
    this.time.delayedCall(12000, () => {
      this.bossIntroText.setText(
        "Your journey ends here, and your doom is sealed by your own hubris."
      );
    });
    this.time.delayedCall(18000, () => {
      this.bossIntroText.setText(
        "If you think you're walking out of here with this sacred relic, you are gravely mistaken."
      );
    });
    this.time.delayedCall(24000, () => {
      this.bossIntroText.setText(
        "You'll have to rip it off my dead body! Prepare to meet your end mortal scum!"
      );
    });
    this.time.delayedCall(29000, () => {
      this.tweens.add({
        targets: [this.bossIntroText],
        alpha: 0,
        duration: 2000,
        ease: "Power2",
      });
    });
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
}
