/*
 * @Date: 2024-05-30 10:25:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-04 21:31:42
 */
interface IShakeConfig {
    duration: number;
    onceDuration: number;
    onceDutations: number[];
    maxNum: number;
    minNum: number;
    factor: number[];
    times: number;
    backNum: number;
}
