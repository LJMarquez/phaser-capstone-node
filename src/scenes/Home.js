import Phaser from "phaser";

export default class Home extends Phaser.Scene {
  constructor() {
    super("home");
    this.fontApplied = false;
  }

  preload() {
    this.load.audio("music", "audio/bg-music-1.wav");
  }

  create() {
    this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "home-bg")
      .setOrigin(0.5)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.music = this.sound.add("music", { loop: true, volume: 0.3 });
    this.music.play();

    const title = this.add.image(this.cameras.main.centerX, 45, "title");
    title.setOrigin(0.5);

    const logo = this.add.image(
      this.cameras.main.centerX,
      135,
      "lawn-mower-item"
    );
    logo.setOrigin(0.5);
    logo.setScale(0.5);

    const startButton = this.add.image(
      this.cameras.main.centerX,
      210,
      "start-button"
    );
    startButton.setOrigin(0.5);
    startButton.setScale(0.5);

    startButton.setInteractive();

    startButton.on("pointerdown", () => {
      this.music.pause();
      this.scene.start("start");
    });
  }
}
