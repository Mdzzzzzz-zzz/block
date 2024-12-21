import init, { BlkHelper } from "./pkg/blk1010_wasm.js";
let wasm = await init()
window.BlkHelper = BlkHelper;