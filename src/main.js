import Phaser from "phaser"
// import Phaser from '../node_modules/phaser'


import Preloader from './scenes/Preloader'
import Start from './scenes/Start'
import Game from './scenes/Game'
import GameUI from './scenes/GameUI'

export default new Phaser.Game({
	type: Phaser.AUTO,
	width: 400,
	height: 250,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0, x: 0 },
			debug: true
		}
	},
	scene: [Preloader, Start, Game, GameUI],
	scale: {
		zoom: 2
	}
})