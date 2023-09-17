import {Renderer} from "../src/Renderer.js";
import {test} from "./test.js";

const renderer = new Renderer(null);
await renderer.build();
document.body.appendChild(renderer.getCanvas());

test(renderer);