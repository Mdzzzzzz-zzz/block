import { sys } from "cc";
import { SdkSingleton } from "./common/SdkSingleton";
import { HttpBase } from "./net/HttpBase";
import { AcccountBase, dtSdkLoginResult } from "./account/AccountBase";
import { SdkLog } from "./log/SdkLog";
import { SdkEventManager } from "./SdkEventManager";
import { GaBase, emGaEnv } from "./bi/GaBase";
import { WebbrowserGa } from "./bi/WebbrowserGa";
import { WebbrowserAccount } from "./account/WebbrowserAccount";
import { SdkSystemInfo } from "./SdkSystemInfo";
import { ChannelBase } from "./channel/ChannelBase";
import { NativeBase } from "./native/NativeBase";
import { emSdkErrorCode } from "./SdkError";
import { AdBase } from "./ad/AdBase";
import { SdkAdManager } from "./SdkAdManager";
import { SdkTimerRecord } from "./timer/TimerRecord";
// import { SdkCrossAdManager } from "./SdkCrossAdManager";
import { NativeGa } from "./bi/NativeGa";
import { GooglePlayChannel } from "./channel/GooglePlayChannel";
import { AndroidNative } from "./native/AndroidNative";
import { IronSourceAd } from "./ad/IronSourceAd";
import { VisitorAccount } from "./account/VisitorAccount";
import { JsbNativeCall } from "../../sdk/JsbNativeCall";
import { WechatAccount } from "./account/WechatAccount";
import { WechatMiniAd } from "./ad/WechatMiniAd";
import { WechatGa } from "./bi/WechatGa";
import { WechatChannel } from "./channel/WechatChannel";
import { WechatNative } from "./native/WechatNative";
import { WechatHttp } from "./net/WechatHttp";
import * as env from 'cc/env';
import { Douyinhttp } from "./net/DouyinHttp";
import { DouyinGa } from "./bi/DouyinGa";
import { DouyinAccount } from "./account/DouyinAccount";
import { DouyinChannel } from "./channel/DouyinChannel";
import { DouyinNative } from "./native/DouyinNative";
import { DouyinMiniAd } from "./ad/DouyinMiniAd";

export class SdkManager extends SdkSingleton {
    ga: GaBase;
    http: HttpBase;
    account: AcccountBase;
    channel: ChannelBase;
    native: NativeBase;
    logger: SdkLog;
    notifier: SdkEventManager;

    public Init() {
        this.notifier = SdkEventManager.getInstance().Init();
        SdkSystemInfo.getInstance().Init();
        SdkTimerRecord.getInstance().Init();
        return this;
    }
    public UnInit() {}
    private isInit: boolean = false;
    public Setup(env: emGaEnv, gameVersion: string) {
        SdkSystemInfo.getInstance().Setup(env, gameVersion);
        console.log("sys.Platform " + sys.platform);
        switch (sys.platform) {
            case sys.Platform.DESKTOP_BROWSER:
            case sys.Platform.EDITOR_CORE:
            case sys.Platform.EDITOR_PAGE:
                {
                    this.logger = SdkLog.getInstance().Init().setEnableLog(true);
                    this.native = new NativeBase(window, this.ga, this.http, this.logger, this.notifier, null);
                    this.http = new HttpBase(window, null, null, this.logger, this.notifier, this.native);
                    this.ga = new WebbrowserGa(window, null, this.http, this.logger, this.notifier, this.native, env);
            this.account = new WebbrowserAccount(
                        window,
                        this.ga,
                        this.http,
                        this.logger,
                        this.notifier,
                        this.native
                    );
                    this.channel = new ChannelBase(window, this.ga, this.http, this.logger, this.notifier, this.native);
                    //初始化广告
                    let ad = new AdBase(window, this.ga, this.http, this.logger, this.notifier, this.native);
                    SdkAdManager.getInstance().Setup(ad, this.ga, this.logger);
                    // SdkCrossAdManager.getInstance().Setup(this.ga, this.logger, this.channel, this.http);
                }

                break;
            case sys.Platform.WECHAT_GAME:
                {
                    this.logger = SdkLog.getInstance().Init().setEnableLog(false);
                    let wx = window["wx"];
                    this.http = new WechatHttp(wx, null, null, this.logger, this.notifier, this.native);
                    this.ga = new WechatGa(wx, null, this.http, this.logger, this.notifier, this.native, env);
                    this.account = new WechatAccount(wx, this.ga, this.http, this.logger, this.notifier, this.native);
                    this.channel = new WechatChannel(wx, this.ga, this.http, this.logger, this.notifier, this.native);
                    this.channel.Init();
                    this.native = new WechatNative(wx, this.ga, this.http, this.logger, this.notifier, this.native);
                    //初始化广告
                    let ad = new WechatMiniAd(wx, this.ga, this.http, this.logger, this.notifier, this.native);
                    SdkAdManager.getInstance().Setup(ad, this.ga, this.logger);
                    // SdkCrossAdManager.getInstance().Setup(this.ga, this.logger, this.channel, this.http);
                }
                break;
            case sys.Platform.BYTEDANCE_MINI_GAME:{
                    this.logger = SdkLog.getInstance().Init().setEnableLog(false);
                    let bd = window["tt"];
                    this.http = new Douyinhttp(bd, null, null, this.logger, this.notifier, this.native);
                    this.ga = new DouyinGa(bd, null, this.http, this.logger, this.notifier, this.native, env);
                    this.account = new DouyinAccount(bd, null, this.http, this.logger, this.notifier, this.native);
                    this.channel = new DouyinChannel(bd, null, this.http, this.logger, this.notifier, this.native);
                    this.channel.Init();
                    this.native = new DouyinNative(bd, this.ga, this.http, this.logger, this.notifier, this.native);
                    //初始化广告
                    let ad = new DouyinMiniAd(bd, this.ga, this.http, this.logger, this.notifier, this.native);
                    SdkAdManager.getInstance().Setup(ad, this.ga, this.logger);
                    // SdkCrossAdManager.getInstance().Setup(this.ga, this.logger, this.channel, this.http);
                }
                break;
            case sys.Platform.ANDROID:
            case sys.Platform.IOS:
                {
                    JsbNativeCall.init();
                    this.logger = SdkLog.getInstance().Init().setEnableLog(true);
                    this.http = new HttpBase(window, null, null, this.logger, this.notifier, this.native);
                    this.ga = new NativeGa(window, null, this.http, this.logger, this.notifier, this.native, env);
                    this.account = new VisitorAccount(
                        window,
                        this.ga,
                        this.http,
                        this.logger,
                        this.notifier,
                        this.native
                    );
                    this.channel = new GooglePlayChannel(
                        window,
                        this.ga,
                        this.http,
                        this.logger,
                        this.notifier,
                        this.native
                    );
                    this.channel.Init();
                    this.native = new AndroidNative(
                        window,
                        this.ga,
                        this.http,
                        this.logger,
                        this.notifier,
                        this.native
                    );
                    //初始化广告
                    let ad = new IronSourceAd(window, this.ga, this.http, this.logger, this.notifier, this.native);
                    SdkAdManager.getInstance().Setup(ad, this.ga, this.logger);
                    // SdkCrossAdManager.getInstance().Setup(this.ga, this.logger, this.channel, this.http);
                }
                break;
        }
        // this.logger.log("sdk", "setup完成");
        this.isInit = true;
        // this.Excute();
        return this;
    }
    /**
     *项目组选择自己的实际情况执行下面的操作
     */
    public Excute() {
        if (this.account) {
            this.account
                .ReqIpLocInfo(1)
                .then((ipInfo) => {
                    this.logger.log("ipinfo:", ipInfo);
                })
                .catch((err) => {
                    this.logger.error("ipinfo error:", err);
                });
        }

        // //sdk初始化 设置 emGaEnv(测试、仿真、线上) 会自动替换三种环境的参数
        // SdkManager.getInstance().Init().Setup(emGaEnv.Test);

        // //登录调用方式
        // SdkManager.getInstance().loginSnsAndSdk().then((res: dtSdkLoginResult) => {
        //     //登录成功
        // }).catch((err: dtSdkError) => {
        //     //登录失败
        // });

        // //Ga调用方式
        // SdkManager.getInstance().track(eventId,eventData);
    }

    /**
     * 登录 先登录渠道login换取code 再登录sdk换userid
     * 调用方式 SdkManager.getInstance().loginSnsAndSdk().then((res:dtSdkLoginResult)=>{
     *       //登录成功
     *  }).catch((err:dtSdkError)=>{
     *       //登录失败
     *  });
     * @returns
     */
    public loginSnsAndSdk(): Promise<dtSdkLoginResult> {
        return new Promise((resolve, reject) => {
            if(env.PREVIEW){
                resolve(true);
                return
            }
            if (sys.getNetworkType() == 0) {
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "网络未连接" });
                return;
            }
            if (this.isInit && this.account) {
                this.account.login().then(resolve).catch(reject);
            } else {
                reject({ errMsg: emSdkErrorCode.SDK_INIT_Account_Error, errData: "sdk或者账号组件未初始化" });
            }
        });
    }
    /**
     * ga 打点
     * 调用方式：SdkManager.getInstance().track(GAEvent.gsm_login_sdk,{param:1})
     * @param eventId 事件Id
     * @param data 事件属性
     */
    public track(eventId: number | string, data: Record<string, any>) {
        console.log("sdkManager isInit " + this.isInit + " isGa " + (this.ga));
        if (this.isInit && this.ga) {
            this.ga.track(eventId, data);
        }
        return this;
    }
    /**
     * 日志开启和关闭接口
     * 调用方式：SdkManager.getInstance().setEnableLog(true);
     * @param enable true 开启日志 fasle 关闭日志
     */
    public setEnableLog(enable: boolean) {
        this.logger.setEnableLog(enable);
        return this;
    }
}
// export var SDK = SdkManager.getInstance().Init().Setup(emGaEnv.Test);
