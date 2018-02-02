import * as THREE from 'three';
import Game from './Game';

if (module.hot) {
	module.hot.accept('./Game', () => {
		window.game = new Game();
	});
}

window.game = new Game();
window.THREE = THREE;
