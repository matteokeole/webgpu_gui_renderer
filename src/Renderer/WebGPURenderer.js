import {Renderer} from "./Renderer.js";
import {Scene} from "../Scene.js";

export class WebGPURenderer extends Renderer {
	/**
	 * @type {?GPUDevice}
	 */
	#device;

	/**
	 * @type {?GPUCanvasContext}
	 */
	#context;

	/**
	 * @type {?GPUBuffer}
	 */
	#vertexBuffer;

	/**
	 * @type {?GPUBuffer}
	 */
	#colorBuffer;

	/**
	 * @type {?GPUBindGroup}
	 */
	#bindGroup;

	/**
	 * @type {?GPURenderPipeline}
	 */
	#renderPipeline;

	/**
	 * @type {HTMLCanvasElement}
	 */
	_canvas = null;

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		super(canvas);

		// What
		this._canvas = canvas;

		this.#device = null;
		this.#context = null;
		this.#vertexBuffer = null;
		this.#colorBuffer = null;
		this.#bindGroup = null;
		this.#renderPipeline = null;
	}

	getCanvas() {
		return this._canvas;
	}

	/**
	 * @throws {Error} if the browser doesn't support WebGPU
	 * @throws {Error} if the adapter couldn't be requested
	 */
	async build() {
		if (navigator.gpu === null) {
			throw new Error("WebGPU is not supported.");
		}

		const adapter = await navigator.gpu.requestAdapter();

		if (adapter === null) {
			throw new Error("Couldn't request a WebGPU adapter.");
		}

		this.#device = await adapter.requestDevice();
		this.#context = this._canvas.getContext("webgpu");

		this._canvas.width = 512;
		this._canvas.height = 512;

		const format = navigator.gpu.getPreferredCanvasFormat();

		this.#context.configure({
			device: this.#device,
			format,
		});

		this.#vertexBuffer = this.#device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * 4 * 3,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});

		this.#colorBuffer = this.#device.createBuffer({
			size: Float32Array.BYTES_PER_ELEMENT * 4 * 3,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});

		const bindGroupLayout = this.#device.createBindGroupLayout({
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

		this.#bindGroup = this.#device.createBindGroup({
			layout: bindGroupLayout,
			entries: [
				{
					binding: 0,
					resource: {
						buffer: this.#colorBuffer,
					},
				},
			],
		});

		const pipelineLayout = this.#device.createPipelineLayout({
			bindGroupLayouts: [bindGroupLayout],
		});

		const vertexShaderModule = this.#device.createShaderModule({
			code: await (await fetch("assets/shaders/vertex.wgsl")).text(),
		});

		const fragmentShaderModule = this.#device.createShaderModule({
			code: await (await fetch("assets/shaders/fragment.wgsl")).text(),
		});

		this.#renderPipeline = this.#device.createRenderPipeline({
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
	}

	render() {
		const encoder = this.#device.createCommandEncoder();

		this.#render(encoder);

		this.#device.queue.submit([encoder.finish()]);
	}

	/**
	 * @param {GPUCommandEncoder} encoder
	 */
	#render(encoder) {
		const mesh = this.getScene().getMesh();

		if (mesh === null) {
			return;
		}

		this.#device.queue.writeBuffer(this.#vertexBuffer, 0, mesh.getDisplacedVertices());
		this.#device.queue.writeBuffer(this.#colorBuffer, 0, mesh.getColor());

		const renderPass = encoder.beginRenderPass({
			colorAttachments: [
				{
					view: this.#context.getCurrentTexture().createView(),
					loadOp: "load",
					storeOp: "store",
				},
			],
		});
		renderPass.setPipeline(this.#renderPipeline);
		renderPass.setVertexBuffer(0, this.#vertexBuffer);
		renderPass.setBindGroup(0, this.#bindGroup);
		renderPass.draw(6);
		renderPass.end();
	};
}