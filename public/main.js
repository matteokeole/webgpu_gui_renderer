try {
	if (!("gpu" in navigator)) throw "WebGPU not supported.";

	const gpu = navigator.gpu;
	const adapter = await gpu.requestAdapter();

	if (adapter == null) throw "Couldn't request WebGPU adapter.";

	const device = await adapter.requestDevice();

	if (device == null) throw "Couldn't request WebGPU adapter.";

	const VIEWPORT_WIDTH = 500;
	const VIEWPORT_HEIGHT = 500;
	const BALLS = 6;
	const BUFFER_SIZE = Float32Array.BYTES_PER_ELEMENT * BALLS * 6;
	const MIN_RADIUS = 4;
	const MAX_RADIUS = 10;

	canvas.width = VIEWPORT_WIDTH;
	canvas.height = VIEWPORT_HEIGHT;

	const ctx = canvas.getContext("2d");

	const source = await (await fetch("public/compute.wgsl")).text();
	const module = device.createShaderModule({code: source});

	const bindGroupLayout = device.createBindGroupLayout({
		entries: [
			{
				binding: 0,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			}, {
				binding: 1,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "storage",
				},
			}, {
				binding: 2,
				visibility: GPUShaderStage.COMPUTE,
				buffer: {
					type: "read-only-storage",
				},
			},
		],
	});

	const pipeline = device.createComputePipeline({
		layout: device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		}),
		compute: {
			module,
			entryPoint: "main",
		},
	});

	const scene = device.createBuffer({
		size: Float32Array.BYTES_PER_ELEMENT * 2,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const input = device.createBuffer({
		size: BUFFER_SIZE,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
	});

	const output = device.createBuffer({
		size: BUFFER_SIZE,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
	});

	const stagingBuffer = device.createBuffer({
		size: BUFFER_SIZE,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	});

	const bindGroup = device.createBindGroup({
		layout: bindGroupLayout,
		entries: [
			{
				binding: 0,
				resource: {
					buffer: input,
				},
			}, {
				binding: 1,
				resource: {
					buffer: output,
				},
			}, {
				binding: 2,
				resource: {
					buffer: scene,
				},
			},
		],
	});

	const inputBalls = new Float32Array(new ArrayBuffer(BUFFER_SIZE));

	for (let i = 0, l = inputBalls.length; i < l; i++) {
		inputBalls[i * 6] = ((Math.random() * MAX_RADIUS - MIN_RADIUS + 1) | 0) + MIN_RADIUS;
		inputBalls[i * 6 + 2] = ((Math.random() * VIEWPORT_WIDTH + 1) | 0);
		inputBalls[i * 6 + 3] = ((Math.random() * VIEWPORT_HEIGHT + 1) | 0);
		inputBalls[i * 6 + 4] = 0;
		inputBalls[i * 6 + 5] = 0;
	}

	device.queue.writeBuffer(scene, 0, new Float32Array([VIEWPORT_WIDTH, VIEWPORT_HEIGHT]));
	device.queue.writeBuffer(input, 0, inputBalls);

	const commandEncoder = device.createCommandEncoder();
	const passEncoder = commandEncoder.beginComputePass();

	passEncoder.setPipeline(pipeline);
	passEncoder.setBindGroup(0, bindGroup);
	passEncoder.dispatchWorkgroups(Math.ceil(BALLS / 64));
	passEncoder.end();

	commandEncoder.copyBufferToBuffer(output, 0, stagingBuffer, 0, BUFFER_SIZE);

	device.queue.submit([commandEncoder.finish()]);

	await stagingBuffer.mapAsync(GPUMapMode.READ, 0, BUFFER_SIZE);

	const copyArrayBuffer = stagingBuffer.getMappedRange(0, BUFFER_SIZE);
	const outputBalls = new Float32Array(copyArrayBuffer.slice());

	stagingBuffer.unmap();

	ctx.fillStyle = "orange";

	for (let i = 0, l = outputBalls.length; i < l; i++) {
		ctx.beginPath();
		ctx.arc(outputBalls[i * 6 + 2], outputBalls[i * 6 + 3], outputBalls[i * 6], 0, 2 * Math.PI);
		ctx.fill();
	}
} catch (error) {
	console.error(error);
}