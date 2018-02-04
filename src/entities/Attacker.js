import * as THREE from 'three';
import planck from 'planck-js';
import { random } from 'lodash';

const AGGRESIVE = 'AGGRESIVE';
const IDLE = 'IDLE';

export default class Attacker extends THREE.Group {
	constructor(game, world) {
		super();

		this.maxForwardSpeed = random(35, 42, true);
		this.maxImpulse = random(0.5, 1, true);

		this.state = Math.random() > 0.2 ? AGGRESIVE : IDLE;

		this.game = game;
		this.world = world;

		this.mesh = new THREE.Mesh(
			new THREE.CylinderGeometry(0.3, 1, 3),
			new THREE.MeshNormalMaterial()
		);

		this.mesh.position.y = 1.5;
		this.add(this.mesh);

		const target = this.game.car.body.getWorldCenter().clone();
		target.x += random(-80, 80, true);
		target.y += random(-80, 80, true);

		this.body = world.createBody({ type: 'dynamic' });
		this.body.createFixture(planck.Circle(1), {
			density: 0.1,
			filterCategoryBits: game.NPC_CATEGORY,
			filterMaskBits: game.CAR_CATEGORY | game.NPC_CATEGORY,
		});

		this.body.createFixture(planck.Circle(random(2, 8, true)), {
			density: 0,
			filterCategoryBits: game.NPC_CATEGORY,
			filterMaskBits: game.NPC_CATEGORY,
		});

		this.body.setPosition(target);
	}

	dispose() {
		this.world.destroyBody(this.body);
	}

	update() {
		const velocity = this.body.getLinearVelocity();

		if (this.state === AGGRESIVE) {
			let vx = this.body.getWorldCenter().x - this.game.car.body.getWorldCenter().x;
			let vy = this.body.getWorldCenter().y - this.game.car.body.getWorldCenter().y;

			const distance = Math.sqrt(vx * vx + vy * vy);
			if (distance != 0) {
					vx = vx / distance;
					vy = vy / distance;
			}

			if (distance > 20 && velocity.length() < this.maxForwardSpeed) {
				const impulse = planck.Vec2(vx * -this.maxImpulse, vy * -this.maxImpulse);
				this.body.applyLinearImpulse(impulse, this.body.getWorldCenter(), true);
			}
		}

		const impulse = velocity.clone().mul(-0.01)
		this.body.applyLinearImpulse(impulse, this.body.getWorldCenter(), true);

		if (Math.random() > 0.99) {
			this.state = this.state === AGGRESIVE ? IDLE : AGGRESIVE;
		}
	}

	render() {
		const position = this.body.getPosition();
		const angle = this.body.getAngle();
		this.position.set(position.x, 0, position.y);
		this.rotation.y = -angle;
	}
}