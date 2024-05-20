import Phaser from "phaser";

const createChestAnims = (anims) => {
    anims.create({
        key: "chestClosed",
        frames: [{ key: "chest", frame: 0 }],
    });

    anims.create({
        key: "chestOpened",
        frames: [{ key: "chest", frame: 1 }],
    });

    anims.create({
      key: "chestOpen",
      frames: anims.generateFrameNumbers("chest", { start: 1, end: 2 }),
      frameRate: 5,
      repeat: 0,
    });
}

export {
    createChestAnims
}