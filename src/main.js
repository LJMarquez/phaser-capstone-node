import Phaser from "phaser";
// import Phaser from '../node_modules/phaser'

import Preloader from "./scenes/Preloader";
import Start from "./scenes/Start";
import Maze1 from "./scenes/Maze1";
import Boss1 from "./scenes/Boss1";
import Maze2 from "./scenes/Maze2";
import Boss2 from "./scenes/Boss2";
import GameUI from "./scenes/GameUI";

window.globalPlayerData = {
  health: 3,
  hasWrench: false,
  hasDrill: false,
  hasLawnMower: false,
  knives: 100,
};

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 400,
  height: 250,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: true,
    },
  },
  scene: [Preloader, Start, Maze1, Boss1, Maze2, Boss2, GameUI],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 2.5,
  },
  backgroundColor: "#141412",
});
