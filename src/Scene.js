import {Mesh} from "./Mesh.js";

export class Scene {
	/** @type {?Mesh} */
	#mesh;

	/** @returns {?Mesh} */
	getMesh() {
		return this.#mesh;
	}

	/** @type {?Mesh} */
	setMesh(mesh) {
		this.#mesh = mesh;
	}
}