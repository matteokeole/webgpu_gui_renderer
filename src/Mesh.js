import {Vector2, Vector3} from "../src/math/index.js";

export class Mesh {
	/** @type {Float32Array} */
	#vertices;

	/** @type {Float32Array} */
	#displacedVertices;

	/** @type {Vector2} */
	#size;

	/** @type {Vector3} */
	#color;

	/**
	 * @param {Object} options
	 * @param {Vector2} options.size
	 * @param {Vector3} options.color
	 */
	constructor({size, color}) {
		const [w, h] = size;

		this.#vertices = Float32Array.of(
			0,  0,
			w,  0,
			0, -h,
			0, -h,
			w,  0,
			w, -h,
		);
		this.#size = size;
		this.#color = color;
	}

	/** @returns {Float32Array} */
	getDisplacedVertices() {
		return this.#displacedVertices;
	}

	/** @returns {Vector2} */
	getSize() {
		return this.#size;
	}

	/** @returns {Vector3} */
	getColor() {
		return this.#color;
	}

	/** @param {Vector2} position */
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