import {Vector2, Vector3} from "../src/math/index.js";
import {Mesh} from "../src/Mesh.js";
import {Scene} from "../src/Scene.js";
import {WebGPURenderer} from "../src/Renderer/WebGPURenderer.js";

/**
 * @param {WebGPURenderer} renderer
 */
export function test(renderer) {
	const scene = new Scene();

	renderer.setScene(scene);

	// Orange/red mesh
	{
		const orangeRedMesh = new Mesh({
			size: new Vector2(2, 2),
			color: new Vector3(1, .2, 0),
		});
		orangeRedMesh.setRelativePosition(new Vector2(-1, 1));

		renderer.getScene().setMesh(orangeRedMesh);
		renderer.render();
	}

	// Yellow mesh
	{
		const yellowMesh = new Mesh({
			size: new Vector2(.2, .2),
			color: new Vector3(1, .8, 0),
		});
		yellowMesh.setRelativePosition(new Vector2(-.9, -.7));

		// Draw orange mesh
		renderer.getScene().setMesh(yellowMesh);
		renderer.render();

		// Transform orange mesh
		yellowMesh.setRelativePosition(new Vector2(-.4, -.7));

		// Redraw orange mesh
		renderer.getScene().setMesh(yellowMesh);
		renderer.render();
	}
}