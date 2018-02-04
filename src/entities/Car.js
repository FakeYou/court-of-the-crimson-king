import * as THREE from 'three';
import planck from 'planck-js';
import { KEY_D, KEY_A } from 'keycode-js'

import Wheel from './Wheel';

export default class Car extends THREE.Group {
	constructor(game, world) {
		super();

		this.game = game;
		this.world = world;

		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(5, 3, 10),
			new THREE.MeshNormalMaterial({ wireframe: true })
		);

		this.mesh.position.y = 0.7;
		this.position.y = 2;
		this.add(this.mesh);

		this.body = world.createBody({ type: 'dynamic' });
		this.body.createFixture(planck.Box(3, 5), {
			density: 1,
			filterCategoryBits: game.CAR_CATEGORY,
			filterMaskBits: game.CAR_CATEGORY | game.NPC_CATEGORY | game.FOREST_CATEGORY,
		});

		this.frontLeftWheel = new Wheel(game, world);
		this.frontRightWheel = new Wheel(game, world);
		this.backLeftWheel = new Wheel(game, world);
		this.backRightWheel = new Wheel(game, world);

		this.game.scene.add(this.frontLeftWheel);
		this.game.scene.add(this.frontRightWheel);
		this.game.scene.add(this.backLeftWheel);
		this.game.scene.add(this.backRightWheel);

		this.frontLeftJoint = world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(-3, 3.5)
		}, this.body, this.frontLeftWheel.body, this.frontLeftWheel.body.getPosition()));

		this.frontRightJoint = world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(3, 3.5)
		}, this.body, this.frontRightWheel.body, this.frontRightWheel.body.getPosition()));

		world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(-3, -3.5)
		}, this.body, this.backLeftWheel.body, this.backLeftWheel.body.getPosition()));

		world.createJoint(planck.RevoluteJoint({
			lowerAngle: 0,
			upperAngle: 0,
			enableLimit: true,
			localAnchorA: planck.Vec2(3, -3.5)
		}, this.body, this.backRightWheel.body, this.backRightWheel.body.getPosition()));
		
		this.body.setAngle(-Math.PI);
		this.frontLeftWheel.body.setAngle(-Math.PI);
		this.frontRightWheel.body.setAngle(-Math.PI);
		this.backLeftWheel.body.setAngle(-Math.PI);
		this.backRightWheel.body.setAngle(-Math.PI);
	}

	update() {
		this.frontLeftWheel.update();
		this.frontRightWheel.update();
		this.backLeftWheel.update();
		this.backRightWheel.update();

		const lockAngle = 30 * (Math.PI / 180);
		const turnSpeedPerSec = 60 * (Math.PI / 180);
		const turnPerTimeStep = turnSpeedPerSec / 60;
		
		let desiredAngle = 0;

		if (this.game.keys[KEY_D]) {
			desiredAngle = lockAngle;
		}
		else if (this.game.keys[KEY_A]) {
			desiredAngle = -lockAngle;
		}

		const currentAngle = this.frontLeftJoint.getJointAngle();
		const angleToTurn = planck.Math.clamp(desiredAngle - currentAngle, -turnPerTimeStep, turnPerTimeStep);
		const nextAngle = currentAngle + angleToTurn;

		this.frontLeftJoint.setLimits(nextAngle, nextAngle);
		this.frontRightJoint.setLimits(nextAngle, nextAngle);
	}

	render() {
		this.frontLeftWheel.render();
		this.frontRightWheel.render();
		this.backLeftWheel.render();
		this.backRightWheel.render();

		const position = this.body.getPosition();
		const angle = this.body.getAngle();
		this.position.set(position.x, 0, position.y);
		this.rotation.y = -angle;
	}
}