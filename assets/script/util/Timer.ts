/**
 * 对scheduler进行封装
 */

import { director, macro } from "cc";

export class Timer {
    /**
     * 开始定时器
     * 参数的含义依次是：回调的obj、回调函数、tick的间隔、不算这次还要重复的次数，开始tick的delay时间
     */
    static setTimer (obj:Object, callback:(dt?: number) => void, interval:number, repeatNum:number, delay:number) {
        var scheduler = director.getScheduler();
        scheduler.schedule(callback, obj, interval, repeatNum, delay);
    }

    /**
     * 取消定时器
     */
    static cancelTimer (obj:Object, callback:(dt?: number) => void) {
        var scheduler = director.getScheduler();
        scheduler.unschedule(callback, obj);
    }

    /**
     * 取消所有该对象的timer事件
     * @param obj : 对象
     */
    static cancelAllTimer (obj:Object) {
        if (obj) {
            var scheduler = director.getScheduler();
            scheduler.unscheduleAllForTarget(obj);
        }
    }

    /**
     * 判断定时器

     */
    static isScheduledTimer (obj:Object, callback:(dt?: number) => void) {
        var scheduler = director.getScheduler();
        return scheduler.isScheduled(callback, obj);
    }

    static unixTime () {
        return Math.floor(this.unixTimeMS() / 1000);
    }

    static unixTimeMS () {
        return new Date().getTime();
    }

    // 后端当前时间戳
    static serverUnixTime() {
        return this.unixTime();
    }
};
