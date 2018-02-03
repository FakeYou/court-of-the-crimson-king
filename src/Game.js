import * as THREE from 'three';
import planck from 'planck-js';

import Testbed from './Testbed';
import Camera from './Camera';

import Car from './entities/Car';
import Chunk from './entities/Chunk';
import Forest from './entities/Forest';

if (module.hot) {
	module.hot.dispose(() => {
		window.game.dispose();
	});
}

export default class Game {
	constructor() {

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ antialias: false });
		this.renderer.setSize(1080, 720);
		this.renderer.setClearColor(0xeeeeee);

		this.camera = new Camera(this, this.renderer.domElement);

		this.clock = new THREE.Clock();
		this.clock.start();

		this.world = planck.World();

		this.car = new Car(this, this.world);
		this.scene.add(this.car);
		// this.scene.add(new THREE.GridHelper(2000, 200));

		this.forest = new Forest(this, this.world);
		this.scene.add(this.forest);

		document.body.appendChild(this.renderer.domElement);

		this.render = this.render.bind(this);
		this.update = this.update.bind(this);

		// planck.testbed('debug', () => {
		// 	return this.world;
		// });

		this.addListeners();
		this.render();
	}

	addListeners() {
		this.keys = {};
		
		this.keyDown = (e) => { this.keys[e.keyCode] = true };
		this.keyUp = (e) => { this.keys[e.keyCode] = false }

		addEventListener('keydown', this.keyDown);
		addEventListener('keyup', this.keyUp);
	}

	dispose() {
		const canvas = document.querySelector('canvas');
		canvas.remove();

		this.renderer.forceContextLoss();
		cancelAnimationFrame(this.animationFrame);

		removeEventListener('keydown', this.keyDown);
		removeEventListener('keyup', this.keyUp);
	}

	update() {
		this.world.step(1 / 60);

		this.forest.update();
		this.car.update();
		this.camera.update();
	}

	render() {
		const delta = this.clock.getDelta();
		const elapsedTime = this.clock.getElapsedTime();

		this.update();

		this.car.render();

		this.renderer.render(this.scene, this.camera);

		this.animationFrame = requestAnimationFrame(this.render);
	}
}