/*
 * @Date: 2024-03-08 15:31:30
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2024-04-02 13:24:50
 */
import { getItem, setItem } from "../util/MKLocalStorage";

export class FlagData {
    private static _inst: FlagData = null;
    public static get inst() {
        if (FlagData._inst == null) FlagData._inst = new FlagData();
        return FlagData._inst;
    }
    constructor() {
        this.updateTimes("OpenSettingView", 0);
    }

    hasFlag(event: string): boolean {
        let isSend = getItem(event);
        if (isSend == undefined || isSend == null) {
            return false;
        }
        return isSend;
    }

    recordFlag(event: string, value: boolean = true) {
        setItem(event, value);
    }

    getTimes(event: string) {
        let times = getItem(event);
        if (times == undefined || times == null) {
            return 0;
        }
        return times;
    }
    recordTimes(event: string) {
        let times = this.getTimes(event) + 1;
        setItem(event, times);
        return times;
    }
    updateTimes(event: string, times: number) {
        setItem(event, times);
    }
    isTimesEnough(event: string, times: number) {
        return this.getTimes(event) >= times;
    }
}
