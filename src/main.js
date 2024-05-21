import Phaser from "phaser";
// import Phaser from '../node_modules/phaser'

import Preloader from "./scenes/Preloader";
import Home from "./scenes/Home";
import Start from "./scenes/Start";
import Maze1 from "./scenes/Maze1";
import Boss1 from "./scenes/Boss1";
import Maze2 from "./scenes/Maze2";
import Puzzle1 from "./scenes/Puzzle1";
import GameUI from "./scenes/GameUI";
import BossEndUI from "./scenes/BossEndUI";
import End from "./scenes/End";

window.globalPlayerData = {
  health: 3,
  hasWrench: false,
  hasDrill: false,
  hasLawnMower: false,
  knives: 0,
  currentScene: 'home'
};

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 400,
  height: 250,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
      // debug: true,
    },
  },
  scene: [Preloader, Home, Start, Maze1, Boss1, Maze2, Puzzle1, End, GameUI, BossEndUI],
  scale: {
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 2.5,
  },
  backgroundColor: "#141412",
});
