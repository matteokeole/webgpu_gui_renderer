const WORKGROUP_SIZE: u32 = 8;

@binding(0) @group(0) var<uniform> grid: vec2f;
@binding(1) @group(0) var<storage> stateRead: array<u32>;
@binding(2) @group(0) var<storage, read_write> stateWrite: array<u32>;

@compute
@workgroup_size(WORKGROUP_SIZE, WORKGROUP_SIZE, 1)
fn compute(@builtin(global_invocation_id) cell: vec3u) {
	let position: vec2u = cell.xy;
	let i: u32 = getCellIndex(position);
	let neighbors: u32 =
		getCellState(position.x - 1, position.y + 1) +
		getCellState(position.x, position.y + 1) +
		getCellState(position.x + 1, position.y + 1) +
		getCellState(position.x + 1, position.y) +
		getCellState(position.x + 1, position.y - 1) +
		getCellState(position.x, position.y - 1) +
		getCellState(position.x - 1, position.y - 1) +
		getCellState(position.x - 1, position.y);

	switch (neighbors) {
		case 2: {
			stateWrite[i] = stateRead[i];
		}

		case 3: {
			stateWrite[i] = 1;
		}

		default: {
			stateWrite[i] = 0;
		}
	}
}

fn getCellIndex(cell: vec2u) -> u32 {
	return (cell.y % u32(grid.y)) * u32(grid.x) + (cell.x % u32(grid.x));
}

fn getCellState(x: u32, y: u32) -> u32 {
	return stateRead[getCellIndex(vec2u(x, y))];
}