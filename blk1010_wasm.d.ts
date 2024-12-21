/**
 */
declare class BlkHelper {
    free(): void;
    /**
     * @param {number} task_per_frame
     * @param {number} row
     * @param {number} col
     */
    constructor(task_per_frame: number, row: number, col: number);
    /**
     * @param {Int32Array} arr
     */
    setScoreDiff(arr: Int32Array): void;
    /**
     */
    print(): void;
    /**
     * @param {number} a
     * @param {number} b
     * @returns {number}
     */
    add(a: number, b: number): number;
    /**
     * @param {Uint8Array} map_array
     * @param {number} combo
     * @param {number} score
     * @param collection
     * @param hard_level
     * @param hard_type
     * @param {Function} cb
     * @param {number} _delta_time
     * @param {number} clear_all_score
     */
    fillAsync(
        map_array: Uint8Array,
        combo: number,
        score: number,
        collection: number,
        hard_level: number,
        hard_type: number,
        cb: Function,
        _delta_time: number,
        clear_all_score: number
    ): void;
    /**
     */
    fillUpdate(): void;
    /**
     */
    fillFree(): void;
}

declare type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

declare interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_blkhelper_free: (a: number) => void;
    readonly blkhelper_new: (a: number, b: number, c: number) => number;
    readonly blkhelper_setScoreDiff: (a: number, b: number) => void;
    readonly blkhelper_print: (a: number) => void;
    readonly blkhelper_add: (a: number, b: number, c: number) => number;
    readonly blkhelper_fillAsync: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly blkhelper_fillUpdate: (a: number) => void;
    readonly blkhelper_fillFree: (a: number) => void;
    readonly init_hook: () => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
}

declare type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
declare function initSync(module: SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
declare function __wbg_init(module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
