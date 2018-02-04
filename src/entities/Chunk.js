import * as THREE from 'three';
import planck from 'planck-js';
import { random } from 'lodash';

export default class Chunk extends THREE.Mesh {
	constructor(game, world, position) {
		super();

		this.game = game;
		this.world = world;

		this.delta = 0;
		this.parts = 10;
		this.tile = 20;
		this.width = 15;
		this.size = (this.parts - 1) * this.tile;

		this.position.copy(position || this.position);

		const geometry = new THREE.Geometry();

		this.body = world.createBody();

		const fixtureDef = {
			filterCategoryBits: game.FOREST_CATEGORY,
			filterMaskBits: game.CAR_CATEGORY,
		}

		for (let i = 0; i < this.parts; i++) {
			for (let j = -1; j < 2; j++) {
				geometry.vertices.push(new THREE.Vector3(this.delta + j * this.width, 0, i * this.tile));
			}

			if (i === this.parts - 1) {
				this.end = new THREE.Vector3(this.delta, 0, i * this.tile).add(this.position);
			}

			if (i === 0) {
				continue;
			}

			const index = i * 3;
			geometry.faces.push(new THREE.Face3(index, index - 2, index - 3));
			geometry.faces.push(new THREE.Face3(index, index + 1, index - 2));
			geometry.faces.push(new THREE.Face3(index + 1, index - 1, index - 2));
			geometry.faces.push(new THREE.Face3(index + 1, index + 2, index - 1));

			const pos = this.position;

			this.body.createFixture(planck.Edge(
				planck.Vec2(geometry.vertices[index - 3].x + pos.x, geometry.vertices[index - 3].z + pos.z),
				planck.Vec2(geometry.vertices[index].x + pos.x, geometry.vertices[index].z + pos.z),
			), fixtureDef);

			this.body.createFixture(planck.Edge(
				planck.Vec2(geometry.vertices[index - 1].x + pos.x, geometry.vertices[index - 1].z + pos.z),
				planck.Vec2(geometry.vertices[index + 2].x + pos.x, geometry.vertices[index + 2].z + pos.z),
			), fixtureDef);

			this.delta += random(-10, 10, true) + Math.cos(i * 100) * 3;
		}

		geometry.verticesNeedUpdate = true;
		geometry.normalsNeedUpdate = true;
		geometry.elementsNeedUpdate = true;
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();

		this.mesh = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial({ wireframe: true }));

		this.add(this.mesh);
		this.add(new THREE.BoundingBoxHelper(this.mesh));
	}

	dispose() {
		this.world.destroyBody(this.body);
	}
}