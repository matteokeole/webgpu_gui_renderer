const GRID_DIMENSION = 32;
const WORKGROUP_SIZE = 8;
const WORKGROUP_COUNT = Math.ceil(GRID_DIMENSION / WORKGROUP_SIZE);
const UPDATE_INTERVAL = 200;
let step = 0;

canvas.width = canvas.height = 512;

if (navigator.gpu == null) throw new Error("WebGPU not supported.");

const adapter = await navigator.gpu.requestAdapter();

if (adapter == null) throw new Error("Couldn't request WebGPU adapter.");

const device = await adapter.requestDevice();
const context = canvas.getContext("webgpu");
const format = navigator.gpu.getPreferredCanvasFormat();

context.configure({device, format});

const vertices = new Float32Array([
	-1,  1,
	 1,  1,
	-1, -1,
	 1,  1,
	 1, -1,
	-1, -1,
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

const uniform = new Float32Array([GRID_DIMENSION, GRID_DIMENSION]);

const uniformBuffer = device.createBuffer({
	label: "Uniform buffer",
	size: uniform.byteLength,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(uniformBuffer, 0, uniform);

const state = new Uint32Array(GRID_DIMENSION * GRID_DIMENSION);

const stateStorage = [
	device.createBuffer({
		label: "State storage buffer 1",
		size: state.byteLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	}),
	device.createBuffer({
		label: "State storage buffer 2",
		size: state.byteLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	}),
];

for (let i = 0, l = state.length; i < l; i++) state[i] = +(Math.random() > .5);

device.queue.writeBuffer(stateStorage[0], 0, state);

for (let i = 0, l = state.length; i < l; i++) state[i] = i % 2;

device.queue.writeBuffer(stateStorage[1], 0, state);

const renderShaderModule = device.createShaderModule({
	label: "Vertex & fragment shader module",
	code: await (await fetch("assets/shaders/render.wgsl")).text(),
});

const computeShaderModule = device.createShaderModule({
	label: "Compute shader module",
	code: await (await fetch("assets/shaders/compute.wgsl")).text(),
});

const bindGroupLayout = device.createBindGroupLayout({
	label: "Bind group layout",
	entries: [
		{
			binding: 0,
			visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
			buffer: {
				type: "uniform",
			},
		}, {
			binding: 1,
			visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
			buffer: {
				type: "read-only-storage",
			},
		}, {
			binding: 2,
			visibility: GPUShaderStage.COMPUTE,
			buffer: {
				type: "storage",
			},
		},
	],
});

const bindGroups = [
	device.createBindGroup({
		label: "Bind group 1",
		layout: bindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: {
					buffer: uniformBuffer,
				},
			}, {
				binding: 1,
				resource: {
					buffer: stateStorage[0],
				},
			}, {
				binding: 2,
				resource: {
					buffer: stateStorage[1],
				},
			},
		],
	}),
	device.createBindGroup({
		label: "Bind group 2",
		layout: bindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: {
					buffer: uniformBuffer,
				},
			}, {
				binding: 1,
				resource: {
					buffer: stateStorage[1],
				},
			}, {
				binding: 2,
				resource: {
					buffer: stateStorage[0],
				},
			},
		],
	}),
];

const pipelineLayout = device.createPipelineLayout({
	label: "Pipeline layout",
	bindGroupLayouts: [bindGroupLayout],
});

const renderPipeline = device.createRenderPipeline({
	label: "Render pipeline",
	layout: pipelineLayout,
	vertex: {
		module: renderShaderModule,
		entryPoint: "vertex",
		buffers: [vertexBufferLayout],
	},
	fragment: {
		module: renderShaderModule,
		entryPoint: "fragment",
		targets: [{format}],
	},
});

const computePipeline = device.createComputePipeline({
	label: "Compute pipeline",
	layout: pipelineLayout,
	compute: {
		module: computeShaderModule,
		entryPoint: "compute",
	},
});

function update() {
	const encoder = device.createCommandEncoder();

	const computePass = encoder.beginComputePass();

	computePass.setPipeline(computePipeline);
	computePass.setBindGroup(0, bindGroups[step % 2]);
	computePass.dispatchWorkgroups(WORKGROUP_COUNT, WORKGROUP_COUNT);
	computePass.end();

	step++;

	const renderPass = encoder.beginRenderPass({
		colorAttachments: [{
			view: context.getCurrentTexture().createView(),
			clearValue: [
				0x20 / 255,
				0x21 / 255,
				0x24 / 255,
				1,
			],
			loadOp: "clear",
			storeOp: "store",
		}],
	});

	renderPass.setPipeline(renderPipeline);
	renderPass.setVertexBuffer(0, vertexBuffer);
	renderPass.setBindGroup(0, bindGroups[step % 2]);
	renderPass.draw(vertices.length * .5, GRID_DIMENSION * GRID_DIMENSION);

	renderPass.end();

	device.queue.submit([encoder.finish()]);
}

setInterval(update, UPDATE_INTERVAL);