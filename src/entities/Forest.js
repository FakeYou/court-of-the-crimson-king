import * as THREE from 'three';

import Chunk from './Chunk';

export default class Forest extends THREE.Group {
	constructor(game, world) {
		super();

		this.game = game;
		this.world = world;

		this.chunks = [];
		this.chunks.push(new Chunk(game, world)),
		this.chunks.push(new Chunk(game, world, this.chunks[0].end));
		this.chunks.push(new Chunk(game, world, this.chunks[1].end));
		this.chunks.push(new Chunk(game, world, this.chunks[2].end));

		this.add(this.chunks[0]);
		this.add(this.chunks[1]);
		this.add(this.chunks[2]);
		this.add(this.chunks[3]);

		this.nextTrigger = this.chunks[0].size * 2.5;
	}

	update() {
		if (this.game.car.position.z > this.nextTrigger) {
			const firstChunk = this.chunks[0];
			const lastChunk = this.chunks[this.chunks.length - 1];

			const chunk = new Chunk(this.game, this.world, lastChunk.end);

			this.chunks.push(chunk);
			this.add(chunk);

			this.nextTrigger += chunk.size;

			firstChunk.dispose();
			this.remove(firstChunk);
			this.chunks = this.chunks.slice(1);
		}
	}
}