@group(0) @binding(0) var<uniform> color: vec3f;

@fragment
fn main() -> @location(0) vec4f {
	return vec4f(color, 1);
}