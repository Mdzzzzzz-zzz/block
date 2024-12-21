import { SdkBase } from "../SdkBase";
import { SystemInfo, UserInfo } from "../SdkConfig";
import { SdkUtils } from "../SdkUtils";
import { NativeBase } from "../native/NativeBase";
import { HttpBase } from "../net/HttpBase";

export abstract class GaBase extends SdkBase {
    protected tag: string = "bi and ga";
    abstract getGaSysConfig(): IGaSystemConfig;
    abstract uploadLogTimely(eventId: number | string, logInfoTxt: string);
    abstract uploadClickStatLogTimely(eventId: number | string, logtxt: string);
    abstract clickStat(eventId: number | string, param: any);
    abstract track(eventId: number | string, param: Record<string, any>);
    abstract trackCrossAd(eventId: number | string, param: Record<string, any>,state:number);
    public env: emGaEnv = emGaEnv.None;
    /**
     * 
     * @param scene 场景Id
     * @param adUnitId 广告id
     * @param state emVideoState
     */
    abstract trackAdEvent(scene: string, adUnitId: string, state: number, errInfo: any,code?:number,info?:string)
    constructor(platform: any, ga: GaBase, http: HttpBase, log: ILog, notifer: INotifier,native:NativeBase, env: emGaEnv) {
        super(platform, ga, http, log,notifer,native);
        this.env = env;
        this.http = http;
    }
    private _timetag: number;
    nettype: string;
    rec_type: string;
    rec_id: string;
    cloud_id: number;
    receive_time: string;
    user_id: any;
    game_id: any;
    client_id: any;
    device_id: any;
    ip_addr: string;
    phone_maker: string;
    phone_model: any;
    phone_carrier: string;
    reserved: string;
    /**
     * BIlog拼接
     * @param eventid
     * @param paramsarr
     * @returns {*}
     */
    assemblelog(eventid, paramsarr) {
        var time = new Date().getTime();
        if (time - this._timetag > 60000) {
            this._timetag = time;
            this.nettype = "0";
        }
        var paramstr = paramsarr.join('\t');

        this.getSystemInfo();
        var logStr = this.cloud_id + '\t' + this.rec_type + '\t' + time + '\t' + this.rec_id + '\t' + this.receive_time +
            '\t' + eventid + '\t' + this.user_id + '\t' + this.game_id + '\t' + this.client_id + '\t' + this.device_id + '\t' +
            this.ip_addr + '\t' + this.nettype + '\t' + this.phone_maker + '\t' + this.phone_model + '\t' + this.phone_carrier + '\t' + paramstr + '\t' + this.reserved;

        var str = this.trimTab0(logStr);
        return str;
    }
    trimTab0(str) {
        if (str == null || str == undefined)
            return '';
        var txt = str.replace(/(\t0)*$/, '');
        return txt;
    }
    protected getSystemInfo() {
        this.cloud_id = SystemInfo.cloudId;   //独立服务id
        this.rec_type = '1';   //日志类型
        this.rec_id = '0'; //日志记录id
        this.receive_time = '0'; // 日志接收时间  输出日志时统一填0，BI服务会在接收时添加
        this.user_id = UserInfo.userId || '0';      //用户id
        this.game_id = SystemInfo.gameId;      //游戏id
        this.client_id = SystemInfo.clientId;
        this.device_id = this.device_id || SdkUtils.getLocalUUID();	//device id
        this.ip_addr = '#IP';// ip地址	占位--服务器处理
        this.nettype = "0"; //网络状况
        this.phone_maker = "0"; //手机制造商
        this.phone_model = UserInfo.model; //手机型号
        this.phone_carrier = "0";//手机运营商
        this.reserved = '0';
    }
}
export interface IGaSystemConfig {
    clientId: string;
    intClientId: number;
    cloudId: number;
    version: number;
    loginUrl: string;
    shareManagerUrl: string;
    deviceId: string;
    wxAppId: string;
    appId: number;
    gameId: number;
    biLogServer: string;
    biJsonLogServer: string;
    errorLogServer: string;
    errorTxtServer: string;
}
export enum emGaEnv {
    None = "none",
    /**
     * 线上服
     */
    Online = "online",
    /**
     * 仿真服
     */
    SimOnline = "sim",
    /**
     * 测试服
     */
    Test = "test"
}