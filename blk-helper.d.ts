/*
 * @Date: 2024-02-22 15:16:10
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-07-29 14:26:52
 */
declare namespace blk {
    class BlkHelper {
        constructor();
        fillAsync(data: Array<number>, combo: number, score: number, collection: number, hard_level: number, hard_type: number, callBack: Function, deltaTime: number,clear_all_score:number);
        print(): void;
        pass(data: Array<number>);
        init(task_per_frame: number, row: number, col: number);
    }
}
declare var CryptoJS;
