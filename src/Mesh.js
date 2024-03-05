import {Vector2, Vector3} from "../src/math/index.js";

/**
 * @typedef {Object} MeshDescriptor
 * @property {Vector2} size
 * @property {Vector3} color
 */

export class Mesh {
	/**
	 * @type {Float32Array}
	 */
	#vertices;

	/**
	 * @type {Float32Array}
	 */
	#displacedVertices;

	/**
	 * @type {Vector2}
	 */
	#size;

	/**
	 * @type {Vector3}
	 */
	#color;

	/**
	 * @param {MeshDescriptor} descriptor
	 */
	constructor(descriptor) {
		const [w, h] = descriptor.size;

		this.#vertices = Float32Array.of(
			0,  0,
			w,  0,
			0, -h,
			0, -h,
			w,  0,
			w, -h,
		);
		this.#size = descriptor.size;
		this.#color = descriptor.color;
	}

	getDisplacedVertices() {
		return this.#displacedVertices;
	}

	getSize() {
		return this.#size;
	}

	getColor() {
		return this.#color;
	}

	/**
	 * @param {Vector2} position
	 */
	setRelativePosition(position) {
		const [x, y] = position;

		this.#displacedVertices = Float32Array.of(
			x, y,
			x, y,
			x, y,
			x, y,
			x, y,
			x, y,
		);

		for (let i = 0; i < 12; i++) {
			this.#displacedVertices[i] += this.#vertices[i];
		}
	}
}