import {WebGPURenderer} from "../src/WebGPURenderer.js";
import {test} from "./test.js";

const renderer = new WebGPURenderer();
await renderer.build();

document.body.appendChild(renderer.getCanvas());

test(renderer);