import {Scene} from "../Scene.js";

/**
 * @abstract
 */
export class Renderer {
	/**
	 * @type {HTMLCanvasElement|OffscreenCanvas}
	 */
	_canvas;

	/**
	 * @type {?Scene}
	 */
	_scene;

	/**
	 * @param {HTMLCanvasElement|OffscreenCanvas} canvas
	 */
	constructor(canvas) {
		this._canvas = canvas;
		this._scene = null;
	}

	getCanvas() {
		return this._canvas;
	}

	getScene() {
		return this._scene;
	}

	/**
	 * @param {Scene} scene
	 */
	setScene(scene) {
		this._scene = scene;
	}
}