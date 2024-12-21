// import { JsbNativeCall } from "./JsbNativeCall";
import * as env from "cc/env";
import { JsbNativeCall } from "./JsbNativeCall";
import { TySdkManager } from "./TySdkManager";

export class SDK {
    static get instance() {
        if (!this._instance) {
            this._instance = new SDK();
        }
        return this._instance;
    }

    private static _instance: SDK;

    constructor() {}

    public login(successCallback?: Function, failureCallback?: Function) {
        // JsbNativeCall.exec(
        //     "LoginSDK",
        //     "login",
        //     {},
        //     (result) => {
        //         successCallback && successCallback(result);
        //     },
        //     (error) => {
        //         failureCallback && failureCallback(error);
        //     });
    }
    public loginWithGuest(deviceId: string) {
        this.loginAf(deviceId);
        this.loginBI(deviceId);
    }
    public loginBI(userId: string) {
        if (env.NATIVE) {
            JsbNativeCall.exec(
                "TaPlugin",
                "login",
                {
                    userId: userId,
                },
                (result) => {},
                (error) => {}
            );
        } else {
            if (window["TDAnalytics"]){
                window["TDAnalytics"].login(userId);
            }
        }
    }
    public initBI(appId: string, serverUrl: string) {
        JsbNativeCall.exec(
            "TaPlugin",
            "init",
            {
                appId: appId,
                serverUrl: serverUrl,
            },
            (result) => {},
            (error) => {}
        );
    }
    public reportBI(eventId: string, params: object, logAf: boolean = false) {
        if (env.NATIVE || env.PREVIEW) {
            JsbNativeCall.exec(
                "TaPlugin",
                "track",
                {
                    params: params,
                    eventId: eventId,
                    logAf: false,
                },
                (result) => {},
                (error) => {}
            );
            if (logAf) {
                this.reportAf(eventId, params, false);
            }
        } else {
            this.TrackEventWithTySdk(eventId, params)
        }
    }
    public initAf(eventId: string, params: object, logTa: boolean = false) {
        JsbNativeCall.exec(
            "AppsFlyer",
            "init",
            {
                eventData: params,
                eventId: eventId,
                logTa: false,
            },
            (result) => {},
            (error) => {}
        );
    }
    public reportAf(eventId: string, params: object = null, logTa: boolean = false) {
        let data = params || {};
        data["evt_time"] = Date.now();
        if(env.NATIVE){
            JsbNativeCall.exec(
                "AppsFlyer",
                "report",
                {
                    eventData: data,
                    eventId: eventId,
                    logTa: false,
                },
                (result) => {},
                (error) => {}
            );
            if (logTa) {
                this.reportBI(eventId, data, false);
            }
        }
        else{
            this.TrackEventWithTySdk(eventId, params);
        }
    }
    public loginAf(userId: string) {
        JsbNativeCall.exec(
            "AppsFlyer",
            "login",
            {
                userId: userId,
            },
            (result) => {},
            (error) => {}
        );
    }

    public putUserData(key: string, value: string) {
        JsbNativeCall.exec(
            "Bugly",
            "putUserData",
            {
                key: key,
                value: value,
            },
            (result) => {},
            (error) => {}
        );
    }

    public putDeviceId(deviceId: string) {
        JsbNativeCall.exec(
            "Bugly",
            "deviceId",
            {
                deviceId: deviceId,
            },
            (result) => {},
            (error) => {}
        );
    }
    public putLocalUserId(userId: string) {
        this.loginBI(userId);
        // this.loginAf(userId);
        // JsbNativeCall.exec("LoginSDK", "localUserId", {
        //     deviceId: userId,
        // }, (result) => {

        // }, (error) => {
        // });
    }
    public toast(content: string, duration = 1) {
        // SdkManager.getInstance().native.showToast(content);
        JsbNativeCall.exec("Toast", "show", { msg: content, duration: duration });
    }

    public showSplash() {
        JsbNativeCall.exec("SplashPlugin", "show", { path: "" });
    }
    public hideSplash() {
        JsbNativeCall.exec("SplashPlugin", "hide", { path: "" });
    }

    private TrackEventWithTySdk(eventId: string, params: object ){
        let rec:Record<string, string> = {};
        Object.keys(params).map(key =>{rec[key] = params[key]})
        TySdkManager.getInstance().trackEvent(eventId, rec);
    }
}
