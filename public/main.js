canvas.width = canvas.height = 512;

if (navigator.gpu == null) throw new Error("WebGPU not supported.");

const adapter = await navigator.gpu.requestAdapter();

if (adapter == null) throw new Error("Couldn't request WebGPU adapter.");

const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu");

const format = navigator.gpu.getPreferredCanvasFormat();

context.configure({device, format});

const encoder = device.createCommandEncoder();

const vertices = new Float32Array([
	-.8,  .8,
	 .8,  .8,
	-.8, -.8,

	 .8,  .8,
	 .8, -.8,
	-.8, -.8,
]);

const vertexBuffer = device.createBuffer({
	label: "Vertex buffer",
	size: vertices.byteLength,
	usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

const vertexBufferLayout = {
	arrayStride: 8,
	attributes: [{
		format: "float32x2",
		offset: 0,
		shaderLocation: 0,
	}],
};

const shaderModule = device.createShaderModule({
	label: "Vertex shader",
	code: await (await fetch("assets/shaders/main.wgsl")).text(),
});

const vertexPipeline = device.createRenderPipeline({
	label: "Vertex pipeline",
	layout: "auto",
	vertex: {
		module: shaderModule,
		entryPoint: "vertex",
		buffers: [vertexBufferLayout],
	},
	fragment: {
		module: shaderModule,
		entryPoint: "fragment",
		targets: [{format}],
	},
});

const renderPass = encoder.beginRenderPass({
	colorAttachments: [{
		view: context.getCurrentTexture().createView(),
		clearValue: [1, .2, 0, 1],
		loadOp: "clear",
		storeOp: "store",
	}],
});

renderPass.setPipeline(vertexPipeline);
renderPass.setVertexBuffer(0, vertexBuffer);
renderPass.draw(vertices.length * .5);

renderPass.end();

device.queue.submit([encoder.finish()]);