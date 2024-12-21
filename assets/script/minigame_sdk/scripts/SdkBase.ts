/*
 * @Date: 2023-06-14 16:46:44
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-03 16:30:59
 */
import { sys } from "cc";
import { GaBase } from "./bi/GaBase";
import { NativeBase } from "./native/NativeBase";
import { HttpBase } from "./net/HttpBase";

export class SdkBase {
    platform: any;//wx tt qq qg
    protected bi: GaBase;
    protected http: HttpBase;
    protected logger: ILog;
    protected notifer: INotifier;
    protected native: NativeBase;

    constructor(platform: any, ga: GaBase,http:HttpBase, log: ILog, notifer: INotifier,native:NativeBase) {
        this.platform = platform;
        this.bi = ga;
        this.logger = log;
        this.notifer = notifer;
        this.http = http;
        this.native = native;
    }

    // onShow(res) {
        
    // }
    // onHide(res) {

    // }
    public checkIsNetWork() {
        return sys.getNetworkType()==0;
    }
    throwError(code: number) {

    }
}