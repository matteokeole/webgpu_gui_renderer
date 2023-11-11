import {Vector2, Vector3} from "../src/math/index.js";
import {Mesh} from "../src/Mesh.js";
import {Renderer} from "../src/Renderer.js";
import {Scene} from "../src/Scene.js";

/**
 * @param {Renderer} renderer
 */
export function test(renderer) {
	const scene = new Scene();

	renderer.setScene(scene);

	// Background mesh
	{
		const backgroundMesh = new Mesh({
			size: new Vector2(2, 2),
			color: new Vector3(1, .2, 0),
		});
		backgroundMesh.setRelativePosition(new Vector2(-1, 1));

		renderer.getScene().setMesh(backgroundMesh);
		renderer.updateAndRender();
	}

	// Orange mesh
	{
		const orangeMesh = new Mesh({
			size: new Vector2(.2, .2),
			color: new Vector3(1, .8, 0),
		});
		orangeMesh.setRelativePosition(new Vector2(-.9, -.7));

		// Draw orange mesh
		renderer.getScene().setMesh(orangeMesh);
		renderer.updateAndRender();

		// Transform orange mesh
		orangeMesh.setRelativePosition(new Vector2(-.4, -.7));

		// Redraw orange mesh
		renderer.getScene().setMesh(orangeMesh);
		renderer.updateAndRender();
	}
}