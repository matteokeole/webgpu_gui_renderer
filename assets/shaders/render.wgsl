struct VertexInput {
	@builtin(instance_index) instance: u32,
	@location(0) position: vec2f,
}

struct VertexOutput {
	@builtin(position) position: vec4f,
	@location(0) cell: vec2f,
}

@binding(0) @group(0) var<uniform> grid: vec2f;
@binding(1) @group(0) var<storage> state: array<u32>;

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
	let i: f32 = f32(input.instance);
	let cell: vec2f = vec2f(i % grid.x, floor(i / grid.x));
	let cellState: f32 = f32(state[input.instance]);
	let offset: vec2f = cell / grid * 2;
	var output: VertexOutput;

	output.position = vec4f((input.position * cellState + 1) / grid + offset - 1, 0, 1);
	output.cell = cell;

	return output;
}

@fragment
fn fragment(input: VertexOutput) -> @location(0) vec4f {
	let color: vec2f = vec2f(input.cell / grid);

	return vec4f(color, 1 - color.x, 1);
	// return vec4f(73, 76, 80, 1) / 255;
}