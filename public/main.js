import {WebGPURenderer} from "../src/Renderer/WebGPURenderer.js";
import {test} from "./test.js";

const canvas = document.createElement("canvas");

const renderer = new WebGPURenderer(canvas);
await renderer.build();

document.body.appendChild(renderer.getCanvas());

test(renderer);