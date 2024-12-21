import { PREVIEW } from "cc/env";
import { FlagData } from "../data/FlagData";
import { BIEventID } from "../define/BIDefine";
import { mk } from "../MK";
import { AdConfigInfo } from "../minigame_sdk/scripts/SdkConfig";
import { SdkManager } from "../minigame_sdk/scripts/SdkManager";
import { emSdkErrorCode } from "../minigame_sdk/scripts/SdkError";
import { biEventId } from "../Boot";
import * as env from "cc/env";
const JYSDK = window["JYSDK"];
// 广告动作枚举
export enum AdAction {
    PreLoadPull = "pre_load_pull", // 开始预加载
    PreLoadSuccess = "pre_load_success", // 预加载成功
    PreLoadFail = "pre_load_fail", // 预加载失败
    Pull = "pull", // 拉起
    LoadSuccess = "load_success", // 加载成功
    LoadFail = "load_fail", // 加载失败
    Show = "show", // 显示成功
    PlayComplete = "play_complete", // 播放完成
    Close = "close", // 用户取消
    Click = "click", // 点击
    Skip = "skip", // 跳过
    Hide = "hide", // 隐藏
    LoadTimeOut = "load_timeout", // 拉取超时
    Error = "error", // 触发异常
}
export class AdSdk {
    private static _inst: AdSdk = null;
    public static get inst() {
        if (AdSdk._inst == null) AdSdk._inst = new AdSdk();
        return AdSdk._inst;
    }
    public isRewardedVideoAvailable(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            resolve(true);
        });
    }
    public cacheRewardVideoAd() {
        if (PREVIEW) {
            return;
        }
        if (env.WECHAT) {
            JYSDK.preLoadRewardVideo({ adUnitId: AdConfigInfo.rewardUnitId });
        }

        if (env.BYTEDANCE) {
            JYSDK.preLoadRewardVideo({ adUnitId: AdConfigInfo.douyinRewardUnitId })
        }
        
    }
    public showRewardVideoAd(path: string, adUnitId?: string) {
        return new Promise((resolve, reject) => {
            if (PREVIEW) {
                this.recordWatchRewardFinish();
                resolve(true);
                return;
            }
            let rewardId = AdConfigInfo.rewardUnitId;
            if (env.BYTEDANCE) {
                rewardId = AdConfigInfo.douyinRewardUnitId;
            }

            JYSDK.showRewardVideo(path, { adUnitId: rewardId }, (adaction, aderror) => {
                switch (adaction) {
                    case "show":
                        console.log("显示激励成功, 不做任何处理");
                        break;
                    case "load_timeout":
                        console.log("拉取超时,关闭加载进度条");
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_Close_Reward, errData: aderror });
                        break;
                    case "play_complete":
                        console.log("播放完成, 发放奖励");
                        this.recordWatchRewardFinish();
                        resolve(true);
                        break;
                    case "skip":
                        console.log("中途关闭，不发放奖励, 关闭加载进度条");
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_Close_Reward, errData: aderror });
                        break;
                    case "error":
                        console.log("出现异常, 关闭加载进度条", aderror);
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_On_Error, errData: aderror });
                        break;
                }
            });

            // SdkAdManager.getInstance()
            //     .showRewardVideoAd(path)
            //     .then(() => {
            //         this.recordWatchRewardFinish();
            //         resolve(true);
            //     })
            //     .catch(reject);
            // this.isRewardedVideoAvailable().then(() => {
            //     SdkAdManager.getInstance().showRewardVideoAd(path).then(resolve).catch(reject);

            // }).catch(() => {
            //     reject({ errMsg: emSdkErrorCode.Sdk_Ad_Load_Error, errData: '' });
            // })
        });
    }
    protected recordWatchAdFinish() {
        FlagData.inst.recordTimes(BIEventID.af_ad_watch_times);
        if (FlagData.inst.isTimesEnough(BIEventID.af_ad_watch_times, 5)) {
            if (!FlagData.inst.hasFlag(BIEventID.af_ad_5times)) {
                //mk.sdk.instance.reportAf(BIEventID.af_ad_5times, {}, true);
                FlagData.inst.recordFlag(BIEventID.af_ad_5times);
            }
        }
        if (FlagData.inst.isTimesEnough(BIEventID.af_ad_watch_times, 10)) {
            if (!FlagData.inst.hasFlag(BIEventID.af_ad_10times)) {
                //mk.sdk.instance.reportAf(BIEventID.af_ad_10times, {}, true);
                FlagData.inst.recordFlag(BIEventID.af_ad_10times);
            }
        }
    }
    protected recordWatchRewardFinish() {
        let times = FlagData.inst.recordTimes(BIEventID.af_ad_reward_finish);
        //mk.sdk.instance.reportAf(BIEventID.af_ad_reward_finish, { times: times }, true);
        this.recordWatchAdFinish();
    }

    public showInsterstital(scene: string = "default") {
        if (PREVIEW) {
            return;
        }
        let ads = AdConfigInfo.insertUnitId;
        if (env.BYTEDANCE) {
            ads = AdConfigInfo.douyinInsertUnitid;
        }
        JYSDK.showInterstitialAd(scene, { adUnitId: ads }, (adaction, aderror) => {
            console.log("interstitialAd result:", adaction, aderror);
            switch (adaction) {
                case "show":
                    console.log("显示插屏成功");
                    let times = FlagData.inst.recordTimes(BIEventID.af_ad_interstitial_finish);
                    //mk.sdk.instance.reportAf(BIEventID.af_ad_interstitial_finish, { times: times }, true);
                    this.recordWatchAdFinish();
                    mk.sdk.instance.reportBI(BIEventID.af_ad_interstitial, { pro_ad_status: 1, proj_times: times });
                    break;
                case "load_timeout":
                    console.log("拉取超时,关闭加载进度条");
                    mk.sdk.instance.reportBI(BIEventID.af_ad_interstitial, { pro_ad_status: 4, proj_times: times });
                    break;
                case "play_complete":
                    console.log("播放完成, 发放奖励");
                    mk.sdk.instance.reportBI(BIEventID.af_ad_interstitial, { pro_ad_status: 3, proj_times: times });
                    break;
                case "skip":
                    console.log("中途关闭，不发放奖励, 关闭加载进度条");
                    mk.sdk.instance.reportBI(BIEventID.af_ad_interstitial, { pro_ad_status: 2, proj_times: times });
                    break;
                case "error":
                    console.log("出现异常, 关闭加载进度条", aderror);
                    mk.sdk.instance.reportBI(BIEventID.af_ad_interstitial, { pro_ad_status: 4, proj_times: times });
                    break;
            }
        });
        // SdkAdManager.getInstance()
        //     .showInsterstital()
        //     .then(() => {
        //         let times = FlagData.inst.recordTimes(BIEventID.af_ad_interstitial_finish);
        //         mk.sdk.instance.reportAf(BIEventID.af_ad_interstitial_finish, { times: times }, true);
        //         this.recordWatchAdFinish();
        //     })
        //     .catch((err) => {
        //         console.error("watch interstitial failed", err);
        //     });
    }
    public mainPageAdType: number = 1; //1 custom 2 banner
    bannerTimerId: number = 0;
    customTimerId: number = 0;
    public showMainPageBannerAd(scene: string = "main") {
        if (PREVIEW) {
            return;
        }
        let native = SdkManager.getInstance().native;
        let sys = null;
        if (env.WECHAT) {
            sys = window["wx"].getSystemInfoSync();
        } else if (env.BYTEDANCE) {
            sys = window["tt"].getSystemInfoSync();
        }
        
        let s_w = sys.screenWidth;
        let s_h = sys.screenHeight; // 220
        let is_ipx = native.isIpx() || native.is2To1();
        let is_pad = native.isPad();
        let bannerId = AdConfigInfo.bannerUnitId;
        if (env.BYTEDANCE) {
            bannerId = AdConfigInfo.douyinBannerUnitId
        }
        JYSDK.showBanner(scene, {
            adUnitId: bannerId,
            style: { left: 0, top: 0, width: is_ipx ? s_w * 0.7 : is_pad ? s_w * 0.6 : s_w * 0.75, height: 50 },
            adIntervals: 30,
            onResize: (bannerAd, res, defaultStyle) => {
                // 自定义处理尺寸变化事件
                console.log("bannnerAd", bannerAd, res, defaultStyle);
                let top = s_h - res.height;
                bannerAd.style.left = (s_w - res.width) / 2;
                bannerAd.style.top = top;
            },
        });
    }
    public hideMainPageBannerAd() {
        if (PREVIEW) {
            return;
        }
        JYSDK.hideBanner();
    }
    public cacheBannerAd() {
        if (PREVIEW) {
            return;
        }
        let native = SdkManager.getInstance().native;
        let sys = null;
        if (env.WECHAT) {
            sys = window["wx"].getSystemInfoSync();
        } else if (env.BYTEDANCE) {
            sys = window["tt"].getSystemInfoSync();
        }
        let s_w = sys.screenWidth;
        let s_h = sys.screenHeight; // 220
        let is_ipx = native.isIpx() || native.is2To1();
        let is_pad = native.isPad();
        let bannerId = AdConfigInfo.bannerUnitId;
        if (env.BYTEDANCE) {
            bannerId = AdConfigInfo.douyinBannerUnitId
        }
        // JYSDK.preLoadBanner({
        //     adUnitId: bannerId,
        //     style: { left: 0, top: 0, width: is_ipx ? s_w * 0.7 : is_pad ? s_w * 0.6 : s_w * 0.75, height: 50 },
        // });
    }

    public showPopBannerAd() {}
    public popPageAdType: number = 0;
    public hidePopBannerAd() {}
}
