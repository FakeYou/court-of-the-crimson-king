import planck from 'planck-js';
import { KEY_W, KEY_A, KEY_S, KEY_D } from 'keycode-js';

window.planck = planck;

if (module.hot) {
	module.hot.dispose(() => {
		const canvas = document.querySelector('canvas');
		canvas.remove();
	});
}

export default class Testbed {
	constructor(game) {
		this.game = game;

		planck.testbed('VaryingRestitution', function(testbed) {
			const world = new planck.World(planck.Vec2(0, 0))

			// const wheel = new Wheel(game, world);
			const car = new Car(game, world);

			testbed.step = function() {
				car.update();
			}

			return world;
		});
	}
}

class Car {
	constructor(game, world) {
		this.game = game;
		this.world = world;

		window.car = this;

		this.body = world.createBody({ type: 'dynamic' });
		this.body.createFixture(planck.Polygon([
			planck.Vec2(1.5, 0),
			planck.Vec2(3, 2.5),
			planck.Vec2(2.8, 5.5),
			planck.Vec2(1, 10),
			planck.Vec2(-1, 10),
			planck.Vec2(-2.8, 5.5),
			planck.Vec2(-3, 2.5),
			planck.Vec2(-1.5, 0),
		]), 0.1);

		this.frontLeftWheel = new Wheel(game, world);
		this.frontRightWheel = new Wheel(game, world);
		this.backLeftWheel = new Wheel(game, world);
		this.backRightWheel = new Wheel(game, world);

		this.frontLeftJoint = world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(-3, 8.5)
		}, this.body, this.frontLeftWheel.body, this.frontLeftWheel.body.getPosition()));

		this.frontRightJoint = world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(3, 8.5)
		}, this.body, this.frontRightWheel.body, this.frontRightWheel.body.getPosition()));

		world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(-3, 0.75)
		}, this.body, this.backLeftWheel.body, this.backLeftWheel.body.getPosition()));

		world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(3, 0.75)
		}, this.body, this.backRightWheel.body, this.backRightWheel.body.getPosition()));
	}

	update() {
		this.frontLeftWheel.updateFriction();
		this.frontLeftWheel.updateDrive();

		this.frontRightWheel.updateFriction();
		this.frontRightWheel.updateDrive();

		this.backLeftWheel.updateFriction();
		this.backLeftWheel.updateDrive();

		this.backRightWheel.updateFriction();
		this.backRightWheel.updateDrive();

		const lockAngle = 30 * (Math.PI / 180);
		const turnSpeedPerSec = 320 * (Math.PI / 180);
		const turnPerTimeStep = turnSpeedPerSec / 60;
		
		let desiredAngle = 0;

		if (this.game.keys[KEY_D]) {
			desiredAngle = -lockAngle;
		}
		else if (this.game.keys[KEY_A]) {
			desiredAngle = lockAngle;
		}

		const currentAngle = this.frontLeftJoint.getJointAngle();
		const angleToTurn = planck.Math.clamp(desiredAngle - currentAngle, -turnPerTimeStep, turnPerTimeStep);
		const nextAngle = currentAngle + angleToTurn;

		this.frontLeftJoint.setLimits(nextAngle, nextAngle);
		this.frontRightJoint.setLimits(nextAngle, nextAngle);
	}
}

class Wheel {
	constructor(game, world) {
		this.game = game;
		this.world = world;

		this.maxForwardSpeed = 250;
		this.maxBackwardSpeed = -40;
		this.maxDriveForce = 300;
		this.maxLateralImpulse = 6;

		this.body = world.createBody({ type: 'dynamic' });
		this.fixture = this.body.createFixture(planck.Box(0.5, 1.25), 1);
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
		const dragForce = forwardSpeed * -2;
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
}
