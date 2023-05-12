@vertex
fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f {
	return vec4f(position, 0, 1);
}

@fragment
fn fragment() -> @location(0) vec4f {
	return vec4f(1, .1, 0, 1);
}