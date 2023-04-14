async function createShaderModule(device, path) {
	const source = await (await fetch(path)).json();

	return device.createShaderModule({code: source});
}

try {
	const gpu = navigator.gpu;

	if (gpu == null) throw "WebGPU not supported.";

	const adapter = await gpu.requestAdapter();

	if (adapter == null) throw "Couldn't request WebGPU adapter.";

	const device = await adapter.requestDevice();

	const source = await (await fetch("public/example.wgsl")).text();
	const shaderModule = device.createShaderModule({code: source});

	const preferredCanvasFormat = gpu.getPreferredCanvasFormat();
	const context = canvas.getContext("webgpu");

	context.configure({
		device,
		format: preferredCanvasFormat,
	});

	const vertices = new Float32Array([0, .6, 0, 1, 1, 0, 0, 1, -.5, -.6, 0, 1, 0, 1, 0, 1, .5, -.6, 0, 1, 0, 0, 1, 1]);

	const vertexBuffer = device.createBuffer({
		size: vertices.byteLength,
		usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
	});

	device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

	const renderPipeline = device.createRenderPipeline({
		vertex: {
			module: shaderModule,
			entryPoint: "vertex_main",
			buffers: [{
				attributes: [{
					shaderLocation: 0,
					offset: 0,
					format: "float32x4",
				}, {
					shaderLocation: 1,
					offset: 16,
					format: "float32x4",
				}],
				arrayStride: 32,
				stepMode: "vertex",
			}],
		},
		fragment: {
			module: shaderModule,
			entryPoint: "fragment_main",
			targets: [{
				format: preferredCanvasFormat,
			}],
		},
		primitives: {
			topology: "triangle-list",
		},
		layout: "auto",
	});

	// Setup done

	const commandEncoder = device.createCommandEncoder();
	const passEncoder = commandEncoder.beginRenderPass({
		colorAttachments: [{
			clearValue: {r: 1, g: .2, b: 0, a: 1},
			loadOp: "clear",
			storeOp: "store",
			view: context.getCurrentTexture().createView(),
		}],
	});

	passEncoder.setPipeline(renderPipeline);
	passEncoder.setVertexBuffer(0, vertexBuffer);
	passEncoder.draw(3);
	passEncoder.end();

	device.queue.submit([commandEncoder.finish()]);
} catch (error) {
	console.error(error);
}