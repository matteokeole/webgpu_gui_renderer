export function Renderer() {
	/** @type {?GPUDevice} */
	let device;

	/** @type {?HTMLCanvasElement} */
	let canvas;

	/** @type {?GPUCanvasContext} */
	let context;

	/** @type {?GPUBuffer} */
	let vertexBuffer;

	/** @type {?GPUBuffer} */
	let colorBuffer;

	/** @type {?GPUBindGroup} */
	let bindGroup;

	/** @type {?GPURenderPipeline} */
	let renderPipeline;

	/** @type {Mesh[]} */
	this.scene = [];

	/** @returns {?HTMLCanvasElement} */
	this.getCanvas = () => canvas;

	this.build = async function() {
		if (navigator.gpu == null) throw new Error("WebGPU not supported.");

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter == null) throw new Error("Couldn't request WebGPU adapter.");

		device = await adapter.requestDevice();
		canvas = document.createElement("canvas");
		context = canvas.getContext("webgpu");
		canvas.width = canvas.height = 512;
		const format = navigator.gpu.getPreferredCanvasFormat();

		context.configure({device, format});

		vertexBuffer = device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * 4 * 3,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		colorBuffer = device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * 4 * 3,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const bindGroupLayout = device.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: {
						type: "uniform",
					},
				},
			],
		});

		bindGroup = device.createBindGroup({
			layout: bindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: colorBuffer,
					},
				},
			],
		});

		const pipelineLayout = device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		});

		const vertexShaderModule = device.createShaderModule({
			code: await (await fetch("assets/shaders/vertex.wgsl")).text(),
		});

		const fragmentShaderModule = device.createShaderModule({
			code: await (await fetch("assets/shaders/fragment.wgsl")).text(),
		});

		renderPipeline = device.createRenderPipeline({
			layout: pipelineLayout,
			vertex: {
				module: vertexShaderModule,
				entryPoint: "main",
				buffers: [
					{
						arrayStride: 8,
						attributes: [{
							format: "float32x2",
							offset: 0,
							shaderLocation: 0,
						}],
					},
				],
			},
			fragment: {
				module: fragmentShaderModule,
				entryPoint: "main",
				targets: [{format}],
			},
		});
	};

	this.updateAndRender = function() {
		const encoder = device.createCommandEncoder();

		this.update(encoder);
		this.render(encoder);

		device.queue.submit([encoder.finish()]);
	};

	/** @param {GPUCommandEncoder} _ */
	this.update = _ => {};

	/** @param {GPUCommandEncoder} encoder */
	this.render = function(encoder) {
		const mesh = this.scene[0];
		const vertices = mesh.vertices;

		device.queue.writeBuffer(vertexBuffer, 0, vertices);
		device.queue.writeBuffer(colorBuffer, 0, mesh.color);

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: context.getCurrentTexture().createView(),
					loadOp: "load",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(renderPipeline);
		renderPass.setVertexBuffer(0, vertexBuffer);
		renderPass.setBindGroup(0, bindGroup);
		renderPass.draw(6);
		renderPass.end();
	};
}