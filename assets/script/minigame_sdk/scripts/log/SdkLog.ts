/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-03 16:27:00
 */
import { SdkSingleton } from "../common/SdkSingleton";

export class SdkLog extends SdkSingleton implements ILog {
    public Init() {
        return this;
    }
    public UnInit() {
    }
    private isEnable: boolean;
    public setEnableLog(enable: boolean) {
        this.isEnable = enable;
        return this;
    }
    public log(tag, msg, ...data: any[]) {
        if (!this.isEnable) {
            return
        }
        tag = tag || "minisdk";
        var logStr = tag + ' : ' + JSON.stringify(msg);
        if (data) {
            console.log(logStr, data);
        }
        else {
            console.log(logStr);
        }
    }
    public warn(tag, msg, ...data: any[]) {
        if (!this.isEnable) {
            return
        }
        tag = tag || "minisdk";
        var logStr = tag + ' : ' + JSON.stringify(msg);
        if (data) {
            console.warn(logStr, data);
        }
        else {
            console.warn(logStr);
        }
    }
    public error(tag, msg, ...data: any[]) {
        if (!this.isEnable) {
            return
        }
        tag = tag || "minisdk";
        var logStr = tag + ' : ' + JSON.stringify(msg);
        if (data) {
            console.error(logStr, data);
        }
        else {
            console.error(logStr);
        }
    }
}