import Phaser from "phaser";

const createEnemyAnims = (anims) => {
    anims.create({
      key: "enemyWalk",
      frames: anims.generateFrameNumbers("enemyWalk", { start: 0, end: 17 }),
      frameRate: 15,
      repeat: -1,
    });
    anims.create({
      key: "enemyIdle",
      frames: anims.generateFrameNumbers("enemyIdle", { start: 0, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: "enemyDeath",
      frames: anims.generateFrameNumbers("enemyDeath", { start: 0, end: 12 }),
      frameRate: 10,
      repeat: 0,
    });
    anims.create({
      key: "enemyAttack",
      frames: anims.generateFrameNumbers("enemyAttack", { start: 0, end: 19 }),
      frameRate: 12,
      repeat: 0,
    });

    anims.create({
      key: "bodIdle",
      frames: anims.generateFrameNumbers("bod", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: "bodWalk",
      frames: anims.generateFrameNumbers("bod", { start: 8, end: 15 }),
      frameRate: 7,
      repeat: -1,
    });
    anims.create({
      key: "bodAttack",
      frames: anims.generateFrameNumbers("bod", { start: 16, end: 25 }),
      frameRate: 7,
      repeat: 0,
    });
    anims.create({
      key: "bodDisappear",
      frames: anims.generateFrameNumbers("bod", { start: 28, end: 38 }),
      frameRate: 8,
      repeat: 0,
    });

  };

export {
    createEnemyAnims
}