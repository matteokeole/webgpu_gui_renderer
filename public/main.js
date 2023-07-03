import {Mesh} from "../src/Mesh.js";
import {Renderer} from "../src/Renderer.js";

const renderer = new Renderer();

await renderer.build();

document.body.appendChild(renderer.getCanvas());

const backgroundMesh = new Mesh();
backgroundMesh.vertices = Float32Array.of(
	-1,  1,
	 1,  1,
	-1, -1,
	-1, -1,
	 1,  1,
	 1, -1,
);
backgroundMesh.color = Float32Array.of(1, .2, 0);

const animatedMesh = new Mesh();
animatedMesh.vertices = Float32Array.of(
	-.9, .7,
	-.7, .7,
	-.9, .5,
	-.9, .5,
	-.7, .7,
	-.7, .5,
);
animatedMesh.color = Float32Array.of(1, .8, 0);

// Draw red background
renderer.scene.push(backgroundMesh);
renderer.updateAndRender();

// Draw orange mesh
renderer.scene.length = 0;
renderer.scene.push(animatedMesh);
renderer.updateAndRender();

// Transform orange mesh
animatedMesh.vertices = Float32Array.of(
	.7, .7,
	.9, .7,
	.7, .5,
	.7, .5,
	.9, .7,
	.9, .5,
);

// Redraw orange mesh
renderer.scene.length = 0;
renderer.scene.push(animatedMesh);
renderer.updateAndRender();