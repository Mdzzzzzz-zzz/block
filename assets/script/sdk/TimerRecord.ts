import { Singleton } from "../Singleton";
export enum emTimerRecordKey{
    game_start="game_start"
}
export class TimerRecord extends Singleton {

    private timers: Map<string, number>;

    public Init() {
        this.timers = new Map();
        this.start("game_start");
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
}