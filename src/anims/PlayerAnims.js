import Phaser from "phaser";

const createPlayerAnims = (anims) => {
    anims.create({
      key: "playerIdleD",
      frames: [{ key: "playerIdle", frame: 0 }],
    });
  
    anims.create({
      key: "playerIdleDD",
      frames: [{ key: "playerIdle", frame: 1 }],
    });
  
    anims.create({
      key: "playerIdle",
      frames: [{ key: "playerIdle", frame: 2 }],
    });
  
    anims.create({
      key: "playerIdleDU",
      frames: [{ key: "playerIdle", frame: 3 }],
    });
  
    anims.create({
      key: "playerIdleU",
      frames: [{ key: "playerIdle", frame: 4 }],
    });
  
    anims.create({
      key: "playerAttackD",
      frames: anims.generateFrameNumbers("playerAttack", { start: 0, end: 3 }),
      frameRate: 15,
      repeat: 0,
    });
  
    // anims.create({
    //   key: "playerAttackDD",
    //   frames: [{ key: "playerAttack", frame: 1 }],
    // });
  
    // anims.create({
    //   key: "playerAttack",
    //   frames: [{ key: "playerAttack", frame: 2 }],
    // });
  
    // anims.create({
    //   key: "playerAttackDU",
    //   frames: [{ key: "playerAttack", frame: 3 }],
    // });
  
    // anims.create({
    //   key: "playerAttackU",
    //   frames: [{ key: "playerAttack", frame: 4 }],
    // });
  
    anims.create({
      key: "playerWalkD",
      frames: anims.generateFrameNumbers("playerWalk", { start: 0, end: 3 }),
      frameRate: 15,
      repeat: -1,
    });
  
    anims.create({
      key: "playerWalkDD",
      frames: anims.generateFrameNumbers("playerWalk", { start: 4, end: 7 }),
      frameRate: 15,
      repeat: -1,
    });
  
    anims.create({
      key: "playerWalk",
      frames: anims.generateFrameNumbers("playerWalk", { start: 8, end: 11 }),
      frameRate: 15,
      repeat: -1,
    });
  
    anims.create({
      key: "playerWalkDU",
      frames: anims.generateFrameNumbers("playerWalk", { start: 12, end: 15 }),
      frameRate: 15,
      repeat: -1,
    });
  
    anims.create({
      key: "playerWalkU",
      frames: anims.generateFrameNumbers("playerWalk", { start: 16, end: 19 }),
      frameRate: 15,
      repeat: -1,
    });
  };

  export {
    createPlayerAnims
  }