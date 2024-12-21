/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-06 16:32:15
 */
import { SdkSingleton } from "../common/SdkSingleton";

export enum emTimerRecordKeys {
    Game_Start = "game_start",
    Show_Insert_Ad = "show_insert_ad",
}
export class SdkTimerRecord extends SdkSingleton {

    private timers: Map<string, number>;

    public Init() {
        this.timers = new Map();
        this.start(emTimerRecordKeys.Game_Start);
    }
    public UnInit() {
        this.timers = null;
    }
    
    /**
     * 开始一个计时器，若计时器已存在则重新计时
     * @param key 键
     * @returns 成功返回true, 失败返回false
     */
    public start(key: string): boolean {
        this.timers.set(key, Date.now());
        return true;
    }

    /**
     * 获取指定计时器的计时, 不会影响计时器的状态
     * @param key 键
     * @returns 成功返回毫秒数, 失败返回-1
     */
    public get(key: string): number {
        let timeStart = 0;
        if (this.timers.has(key)) {
            timeStart = this.timers.get(key);
        }
        return Date.now() - timeStart;
    }

    /**
     * 停止指定计时器，并返回计时
     * @param key 键
     * @returns 成功返回毫秒数，失败返回-1
     */
    public stop(key: string): number {
        let result = this.get(key);
        if (this.timers.has(key)) this.timers.delete(key);
        return result;
    }
    public getTimeSinceStart():number{
        return Math.ceil(this.get(emTimerRecordKeys.Game_Start)*0.001);
    }
}