import * as THREE from 'three';
import planck from 'planck-js';

import Testbed from './Testbed';
import Camera from './Camera';

import Car from './entities/Car';
import Chunk from './entities/Chunk';
import Forest from './entities/Forest';
import Attacker from './entities/Attacker';

if (module.hot) {
	module.hot.dispose(() => {
		window.game.dispose();
	});
}

export default class Game {
	constructor() {

		this.CAR_CATEGORY = 0b0001;
		this.FOREST_CATEGORY = 0b0010;
		this.NPC_CATEGORY = 0b0100;

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

		this.forest = new Forest(this, this.world);
		this.scene.add(this.forest);

		this.attackers = [];

		for (let i = 0; i < 40; i++) {
			const attacker = new Attacker(this, this.world);
			this.attackers.push(attacker);
			this.scene.add(attacker);
		}


		document.body.appendChild(this.renderer.domElement);

		this.render = this.render.bind(this);
		this.update = this.update.bind(this);

		// planck.testbed('debug', (testbed) => {
		// 	this.testbed = testbed;
		// 	testbed.width = 200;
		// 	testbed.height = 160;
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

		this.attackers.forEach(x => x.update());
	}

	render() {
		const delta = this.clock.getDelta();
		const elapsedTime = this.clock.getElapsedTime();

		this.update();

		this.car.render();
		this.attackers.forEach(x => x.render());

		if (this.testbed) {
			this.testbed.y = -this.car.position.z;
			this.testbed.x = this.car.position.x;
		}

		this.renderer.render(this.scene, this.camera);

		this.animationFrame = requestAnimationFrame(this.render);
	}
}