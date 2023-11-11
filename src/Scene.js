import {Mesh} from "./Mesh.js";

export class Scene {
	/**
	 * @type {?Mesh}
	 */
	#mesh;

	getMesh() {
		return this.#mesh;
	}

	/**
	 * @param {Mesh} mesh
	 */
	setMesh(mesh) {
		this.#mesh = mesh;
	}
}