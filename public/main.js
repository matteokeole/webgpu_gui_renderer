import {Mesh} from "../src/Mesh.js";
import {Renderer} from "../src/Renderer.js";

const renderer = new Renderer();

await renderer.build();

document.body.appendChild(renderer.getCanvas());

let mesh;

{
	mesh = new Mesh();
	mesh.vertices = Float32Array.of(
		-1,  1,
		 1,  1,
		-1, -1,
	);
	mesh.color = Float32Array.of(1, .2, 0);

	renderer.scene = [mesh];
	renderer.updateAndRender();
}

{
	mesh = new Mesh();
	mesh.vertices = Float32Array.of(
		-.2,  .2,
		 .8,  .2,
		-.2, -.8,
	);
	mesh.color = Float32Array.of(1, .8, 0);

	renderer.scene = [mesh];
	renderer.updateAndRender();
}

{
	mesh.vertices = Float32Array.of(
		-.7,  .7,
		-.5,  .7,
		-.7, .5,
	);
	mesh.color = Float32Array.of(1, .8, 0);

	renderer.scene = [mesh];
	renderer.updateAndRender();
}