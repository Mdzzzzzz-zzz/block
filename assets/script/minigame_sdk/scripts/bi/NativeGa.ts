/*
 * @Date: 2023-06-15 15:41:45
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-02-19 16:06:23
 */
import { JsbNativeCall } from "../../../sdk/JsbNativeCall";
import { GaBase, IGaSystemConfig } from "./GaBase";

export class NativeGa extends GaBase {
    getGaSysConfig(): IGaSystemConfig {
        return null;
    }
    uploadLogTimely(eventId: string | number, logInfoTxt: string) {
        // throw new Error("Method not implemented.");
    }
    uploadClickStatLogTimely(eventId: string | number, logtxt: string) {
        // throw new Error("Method not implemented.");
    }
    clickStat(eventId: string | number, param: any) {
        // throw new Error("Method not implemented.");
    }
    track(eventId: string | number, params: Record<string, any>) {
        // throw new Error("Method not implemented.");
        JsbNativeCall.exec("TaPlugin", "track", {
            params: params,
            eventId: eventId
        }, (result) => {

        }, (error) => {

        });
    }
    trackCrossAd(eventId: string | number, param: Record<string, any>, state: number) {
        // throw new Error("Method not implemented.");
        param["state"] = state;
        this.track(eventId, param);
    }
    trackAdEvent(scene: string, adUnitId: string, state: number, errInfo: any, code?: number, info?: string) {
        // throw new Error("Method not implemented.");
        let errMsg: string = errInfo;
        if (code == null || code == undefined) {
            code = 0;
        }
        info = info || "";
        try {
            if (typeof (errInfo) == "number") {
                errMsg = errInfo.toString();
            }
            else {
                if (errInfo && errInfo.errMsg) {
                    if (typeof (errInfo.errData) == "number") {
                        errMsg = errInfo.errData.toString();
                    }
                    else {
                        errMsg = errInfo.errMsg
                    }
                }
            }
            this.track("ad_reward", {
                adscene: scene,
                adunitid: adUnitId,
                adstate: state,
                aderrcode: errMsg,
                adcode: code,
                errpfinfo: info
            })
        } catch (error) {
            if (error) {
                let catchMsg = errMsg;
                try {
                    catchMsg = error.toString();
                } catch (error2) {
                }
                console.error(error);
                this.track("ad_reward", {
                    adscene: scene,
                    adunitid: adUnitId,
                    adstate: state,
                    aderrcode: "track_error",
                    adcode: code,
                    errpfinfo: info
                })
            }
        }
    }

}