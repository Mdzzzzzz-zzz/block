/*
 * @Date: 2024-09-21 11:26:02
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 20:38:39
 */
import { Singleton } from "../Singleton";
import * as env from "cc/env";
// import { mk } from "../MK";
import { BIEventID } from "../define/BIDefine";
import { FlagData } from "../data/FlagData";
export var GA_TYPE = { TRACK: "track", LOGIN: "login", PAY: "pay" };
export class TySdkManager extends Singleton {
    tywx: any;
    isLogined: boolean;

    public Init() {
        if (env.WECHAT) {
            let tywx = window["tywx"];
            this.tywx = tywx;
            tywx.NotificationCenter.listen(tywx.EventType.SDK_LOGIN_SUCCESS, this.onLoginSuccess.bind(this));
            tywx.NotificationCenter.listen(tywx.EventType.SDK_LOGIN_FAIL, this.onLoginFailure.bind(this));
            tywx.NotificationCenter.listen(tywx.EventType.WEIXIN_LOGIN_FAIL, this.onWxLoginFailure.bind(this));
            // let systemInfo = {
            //     clientId: "H5_2.0_weixin.weixin.0-hall20197.weixin.elsfkptnew",
            //     intClientId: 38096,
            //     cloudId: 8,
            //     version: 1.01,
            //     webSocketUrl: "",
            //     loginUrl: "https://xyxsf.nalrer.cn/",
            //     shareManagerUrl: "https://market.tuyoo.com/",
            //     deviceId: "wechatGame",
            //     wxAppId: "wx45e02fc734c7b568",
            //     appId: 20197,
            //     gameId: 20197,
            //     hall_version: "hall37",
            //     cdnPath: "",
            //     remotePackPath: "",
            //     biLogServer: "https://cbi.tuyoo.com/api/bilog5/text",
            //     gaLogServer: "https://cbi.tuyoo.com/api/bilog5/ga",
            //     errorLogServer: "https://clienterr.tuyoo.com/api/bilog5/text/error",
            //     tywxVersion: "1.7.5_20240701_release",
            //     openFeatureFilter: !1,
            //     wxPayVersion: "2.0",
            // };
            // if (tywx.fkIsSim) {
            //     systemInfo.loginUrl = "https://ztfz.nalrer.cn/";
            // }
            // tywx.SystemInfo = systemInfo;
        }
        return this;
    }
    public onLoginSuccess(loginResult) {
        this.isLogined = true;
        // console.error("onLoginSuccess", loginResult);
        // console.log("#########  打点登陆 #########");
        this.reportBI(BIEventID.af_login, {});
        //mk.sdk.instance.reportAf(BIEventID.af_login, {}, true);

        if (!FlagData.inst.hasFlag(BIEventID.af_complete_registration)) {
            this.reportBI(BIEventID.af_complete_registration, {});
            FlagData.inst.recordFlag(BIEventID.af_complete_registration);
        }
    }
    public reportBI(eventId: string, params: object) {
        let rec: Record<string, string> = {};
        Object.keys(params).map((key) => {
            rec[key] = params[key];
        });
        this.trackEvent(eventId, rec);
    }
    public onLoginFailure(loginResult) {
        this.isLogined = false;
        console.error("onLoginFailure", loginResult);
    }

    public onWxLoginFailure(loginResult) {
        this.isLogined = false;
        console.error("onWxLoginFailure", loginResult);
    }

    public UnInit() {}

    public login() {
        if (this.tywx) {
            this.tywx.TuyooSDK.login();
        }
    }
    /**
     * data 不可以嵌套json
     * @param eventId
     * @param data
     */
    public trackEvent(eventId: string, data: Record<string, string>) {
        if (this.tywx && this.isLogined) {
            this.tywx.GALog.track(eventId, data);
        }
    }

    public trackWithEventType(gaType: string, eventId: string, data: Record<string, string>) {
        if (this.tywx && this.isLogined) {
            this.tywx.GALog.trackWithType(gaType, eventId, data);
        }
    }
}
