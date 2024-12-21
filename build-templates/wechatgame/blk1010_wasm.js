/*
 * @Date: 2024-06-25 11:15:58
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-07-01 14:44:53
 */
let wasm;require("./EncoderDecoderTogether.min"),Object.defineProperty(exports,"__esModule",{value:!0}),exports.BlkHelper=void 0,exports.__wbg_init=__wbg_init,exports.initAsync=initAsync,exports.initSync=initSync,exports.init_hook=init_hook;const heap=new Array(128).fill(void 0);function getObject(e){return heap[e]}heap.push(void 0,null,!0,!1);let heap_next=heap.length;function dropObject(e){e<132||(heap[e]=heap_next,heap_next=e)}function takeObject(e){const t=getObject(e);return dropObject(e),t}function debugString(e){const t=typeof e;if("number"==t||"boolean"==t||null==e)return`${e}`;if("string"==t)return`"${e}"`;if("symbol"==t){const t=e.description;return null==t?"Symbol":`Symbol(${t})`}if("function"==t){const t=e.name;return"string"==typeof t&&t.length>0?`Function(${t})`:"Function"}if(Array.isArray(e)){const t=e.length;let n="[";t>0&&(n+=debugString(e[0]));for(let r=1;r<t;r++)n+=", "+debugString(e[r]);return n+="]",n}const n=/\[object ([^\]]+)\]/.exec(toString.call(e));let r;if(!(n.length>1))return toString.call(e);if(r=n[1],"Object"==r)try{return"Object("+JSON.stringify(e)+")"}catch(e){return"Object"}return e instanceof Error?`${e.name}: ${e.message}\n${e.stack}`:r}let WASM_VECTOR_LEN=0,cachedUint8Memory0=null;function getUint8Memory0(){return null!==cachedUint8Memory0&&0!==cachedUint8Memory0.byteLength||(cachedUint8Memory0=new Uint8Array(wasm.memory.buffer)),cachedUint8Memory0}const cachedTextEncoder="undefined"!=typeof TextEncoder?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},encodeString="function"==typeof cachedTextEncoder.encodeInto?function(e,t){return cachedTextEncoder.encodeInto(e,t)}:function(e,t){const n=cachedTextEncoder.encode(e);return t.set(n),{read:e.length,written:n.length}};function passStringToWasm0(e,t,n){if(void 0===n){const n=cachedTextEncoder.encode(e),r=t(n.length,1)>>>0;return getUint8Memory0().subarray(r,r+n.length).set(n),WASM_VECTOR_LEN=n.length,r}let r=e.length,i=t(r,1)>>>0;const c=getUint8Memory0();let o=0;for(;o<r;o++){const t=e.charCodeAt(o);if(t>127)break;c[i+o]=t}if(o!==r){0!==o&&(e=e.slice(o)),i=n(i,r,r=o+3*e.length,1)>>>0;const t=getUint8Memory0().subarray(i+o,i+r);o+=encodeString(e,t).written,i=n(i,r,o,1)>>>0}return WASM_VECTOR_LEN=o,i}let cachedInt32Memory0=null;function getInt32Memory0(){return null!==cachedInt32Memory0&&0!==cachedInt32Memory0.byteLength||(cachedInt32Memory0=new Int32Array(wasm.memory.buffer)),cachedInt32Memory0}const cachedTextDecoder="undefined"!=typeof TextDecoder?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};function getStringFromWasm0(e,t){return e>>>=0,cachedTextDecoder.decode(getUint8Memory0().subarray(e,e+t))}function addHeapObject(e){heap_next===heap.length&&heap.push(heap.length+1);const t=heap_next;return heap_next=heap[t],heap[t]=e,t}function init_hook(){wasm.init_hook()}function handleError(e,t){try{return e.apply(this,t)}catch(e){wasm.__wbindgen_exn_store(addHeapObject(e))}}"undefined"!=typeof TextDecoder&&cachedTextDecoder.decode();const BlkHelperFinalization="undefined"==typeof FinalizationRegistry?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry((e=>wasm.__wbg_blkhelper_free(e>>>0)));class BlkHelper{__destroy_into_raw(){const e=this.__wbg_ptr;return this.__wbg_ptr=0,BlkHelperFinalization.unregister(this),e}free(){const e=this.__destroy_into_raw();wasm.__wbg_blkhelper_free(e)}constructor(e,t,n){const r=wasm.blkhelper_new(e,t,n);return this.__wbg_ptr=r>>>0,this}setScoreDiff(e){wasm.blkhelper_setScoreDiff(this.__wbg_ptr,addHeapObject(e))}print(){wasm.blkhelper_print(this.__wbg_ptr)}add(e,t){return wasm.blkhelper_add(this.__wbg_ptr,e,t)}fillAsync(e,t,n,r,i,c,o,a,_){wasm.blkhelper_fillAsync(this.__wbg_ptr,addHeapObject(e),t,n,r,i,c,addHeapObject(o),a,_)}fillAsyncRevive(e,t,n,r,i,c){wasm.blkhelper_fillAsyncRevive(this.__wbg_ptr,addHeapObject(e),t,n,addHeapObject(r),i,c)}fillUpdate(){wasm.blkhelper_fillUpdate(this.__wbg_ptr)}fillFree(){wasm.blkhelper_fillFree(this.__wbg_ptr)}}async function __wbg_load(e,t){if("function"==typeof Response&&e instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(e,t)}catch(t){if("application/wasm"==e.headers.get("Content-Type"))throw t}const n=await e.arrayBuffer();return await WebAssembly.instantiate(n,t)}{const n=await WebAssembly.instantiate(e,t);return n instanceof WebAssembly.Instance?{instance:n,module:e}:n}}function __wbg_get_imports(){const e={wbg:{}};return e.wbg.__wbindgen_object_drop_ref=function(e){takeObject(e)},e.wbg.__wbg_log_2a97cd95e4d26063=function(e,t){},e.wbg.__wbg_new_abda76e883ba8a5f=function(){return addHeapObject(new Error)},e.wbg.__wbg_stack_658279fe44541cf6=function(e,t){const n=passStringToWasm0(getObject(t).stack,wasm.__wbindgen_malloc,wasm.__wbindgen_realloc),r=WASM_VECTOR_LEN;getInt32Memory0()[e/4+1]=r,getInt32Memory0()[e/4+0]=n},e.wbg.__wbg_error_f851667af71bcfc6=function(e,t){let n,r;try{n=e,r=t}finally{wasm.__wbindgen_free(n,r,1)}},e.wbg.__wbg_newnoargs_76313bd6ff35d0f2=function(e,t){return addHeapObject(new Function(getStringFromWasm0(e,t)))},e.wbg.__wbg_call_89af060b4e1523f2=function(){return handleError((function(e,t,n,r,i){return addHeapObject(getObject(e).call(getObject(t),getObject(n),getObject(r),getObject(i)))}),arguments)},e.wbg.__wbg_now_b7a162010a9e75b4=function(){return Date.now()},e.wbg.__wbg_buffer_b7b08af79b0b0974=function(e){return addHeapObject(getObject(e).buffer)},e.wbg.__wbg_new_a0719a520adfdb99=function(e){return addHeapObject(new Int32Array(getObject(e)))},e.wbg.__wbg_set_ee1170377d85cfbd=function(e,t,n){getObject(e).set(getObject(t),n>>>0)},e.wbg.__wbg_length_900d0e8e4e2e110d=function(e){return getObject(e).length},e.wbg.__wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9=function(e,t,n){return addHeapObject(new Uint8Array(getObject(e),t>>>0,n>>>0))},e.wbg.__wbg_new_ea1883e1e5e86686=function(e){return addHeapObject(new Uint8Array(getObject(e)))},e.wbg.__wbg_set_d1e79e2388520f18=function(e,t,n){getObject(e).set(getObject(t),n>>>0)},e.wbg.__wbg_length_8339fcf5d8ecd12e=function(e){return getObject(e).length},e.wbg.__wbg_buffer_0710d1b9dbe2eea6=function(e){return addHeapObject(getObject(e).buffer)},e.wbg.__wbindgen_debug_string=function(e,t){const n=passStringToWasm0(debugString(getObject(t)),wasm.__wbindgen_malloc,wasm.__wbindgen_realloc),r=WASM_VECTOR_LEN;getInt32Memory0()[e/4+1]=r,getInt32Memory0()[e/4+0]=n},e.wbg.__wbindgen_throw=function(e,t){throw new Error(getStringFromWasm0(e,t))},e.wbg.__wbindgen_memory=function(){return addHeapObject(wasm.memory)},e}function __wbg_init_memory(e,t){}function __wbg_finalize_init(e,t){return wasm=e.exports,__wbg_init.__wbindgen_wasm_module=t,cachedInt32Memory0=null,cachedUint8Memory0=null,wasm}function initSync(e){if(void 0!==wasm)return wasm;const t=__wbg_get_imports();__wbg_init_memory(t),e instanceof WebAssembly.Module||(e=new WebAssembly.Module(e));return __wbg_finalize_init(new WebAssembly.Instance(e,t),e)}async function __wbg_init(e){if(void 0!==wasm)return wasm;const t=__wbg_get_imports();("string"==typeof e||"function"==typeof Request&&e instanceof Request||"function"==typeof URL&&e instanceof URL)&&(e=fetch(e)),__wbg_init_memory(t);const{instance:n,module:r}=await __wbg_load(await e,t);return __wbg_finalize_init(n,r)}async function initAsync(){if(void 0!==wasm)return wasm;const e=__wbg_get_imports();__wbg_init_memory(e);try{const t=await WXWebAssembly.instantiate("wasm/blk1010_wasm_bg.wasm",e),n=t.instance;return __wbg_finalize_init(n,t.module)}catch(e){throw e}}exports.BlkHelper=BlkHelper;