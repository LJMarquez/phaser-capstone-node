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
  };

export {
    createEnemyAnims
}