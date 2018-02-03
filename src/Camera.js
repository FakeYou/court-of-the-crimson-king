import * as THREE from 'three';

export default class Camera extends THREE.PerspectiveCamera {
	constructor(game, element) {
		const aspect = element.width / element.height;

		super(60, aspect, 0.1, 100000);

		this.game = game;
	}

	update() {
		this.lookAt(this.game.car.position);
		
		this.position.set(this.game.car.position.x, 40, this.game.car.position.z + 60);
	}
}