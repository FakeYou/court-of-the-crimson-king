import * as THREE from 'three';
import planck from 'planck-js';
import { KEY_W, KEY_S } from 'keycode-js'

export default class Wheel extends THREE.Group {
	constructor(game, world) {
		super();

		this.game = game;
		this.world = world;

		this.maxForwardSpeed = 300;
		this.maxBackwardSpeed = -40;
		this.maxDriveForce = 200;
		this.maxLateralImpulse = 15;

		this.mesh = new THREE.Mesh(
			new THREE.CylinderGeometry(1.25, 1.25, 1, 8),
			new THREE.MeshNormalMaterial({ wireframe: true })
		);

		this.rotation.z += Math.PI / 2;

		this.add(this.mesh);

		this.body = world.createBody({ type: 'dynamic' });
		this.body.createFixture(planck.Box(0.5, 1.25), {
			density: 1,
			filterCategoryBits: game.CAR_CATEGORY,
			filterMaskBits: game.CAR_CATEGORY | game.NPC_CATEGORY | game.FOREST_CATEGORY,
		});
	}

	getForwardVelocity() {
		const forwardNormal = this.body.getWorldVector(planck.Vec2(0, 1));
		return forwardNormal.mul(planck.Vec2.dot(forwardNormal, this.body.getLinearVelocity()));
	}

	getLateralVelocity() {
		const rightNormal = this.body.getWorldVector(planck.Vec2(1, 0));
		return rightNormal.mul(planck.Vec2.dot(rightNormal, this.body.getLinearVelocity()));
	}

	updateFriction() {
		const impulse = this.getLateralVelocity().mul(-this.body.getMass());

		if (impulse.length() > this.maxLateralImpulse) {
			impulse.mul(this.maxLateralImpulse / impulse.length());
		}

		this.body.applyLinearImpulse(impulse, this.body.getWorldCenter());
		this.body.applyAngularImpulse(0.1 * this.body.getInertia() * -this.body.getAngularVelocity());

		const forwardNormal = this.getForwardVelocity();
		const forwardSpeed = forwardNormal.normalize();
		const dragForce = forwardSpeed * -0.02;
		this.body.applyForce(forwardNormal.mul(dragForce), this.body.getWorldCenter());
	}

	updateDrive() {
		let desiredSpeed = 0;

		if (this.game.keys[KEY_W]) {
			desiredSpeed = this.maxForwardSpeed;
		}
		else if (this.game.keys[KEY_S]) {
			desiredSpeed = this.maxBackwardSpeed;
		}

		const forwardNormal = this.body.getWorldVector(planck.Vec2(0, 1));
		const currentSpeed = planck.Vec2.dot(this.getForwardVelocity(), forwardNormal);

		if (desiredSpeed > currentSpeed) {
			this.body.applyForce(forwardNormal.mul(this.maxDriveForce), this.body.getWorldCenter(), true);
		}
		else if (desiredSpeed < currentSpeed) {
			this.body.applyForce(forwardNormal.mul(-this.maxDriveForce), this.body.getWorldCenter(), true);
		}
	}

	update() {
		this.updateFriction();
		this.updateDrive();
	}

	render() {
		const position = this.body.getPosition();
		const angle = this.body.getAngle();
		this.position.set(position.x, 0, position.y);
		this.rotation.y = -angle;

		const forwardNormal = this.body.getWorldVector(planck.Vec2(0, 1));
		const speed = planck.Vec2.dot(this.getForwardVelocity(), forwardNormal);

		this.mesh.rotation.y -= speed / 110;
	}
}