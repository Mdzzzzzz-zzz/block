import { sys } from "cc";
import { AdConfigInfo, StateInfo } from "./SdkConfig";
import { dtSdkError, emSdkErrorCode } from "./SdkError";
import { AdBase, emAdPlacement } from "./ad/AdBase";
import { GaBase } from "./bi/GaBase";
import { SdkSingleton } from "./common/SdkSingleton";
import { SdkTimerRecord, emTimerRecordKeys } from "./timer/TimerRecord";
import { emVideoState } from "./ad/AdDef";
import * as env from "cc/env";
export enum emCacheAdType {
    Reward = 1, //激励视频
    Banner = 2, //banner
    Insert = 4, //插屏
    CustomGrid = 8, //格子广告
}

export class SdkAdManager extends SdkSingleton {
    isRewardAdReady: boolean = false;
    isInsertAdReady: boolean = false;
    isBannerAdReady: boolean = false;
    isCustomAdReady: boolean = false;

    protected cacheAdType: number = 0;

    protected cacheAfterClose: number = 0;

    public Init() {
        this.isRewardAdReady = false;
        this.isInsertAdReady = false;
        this.isBannerAdReady = false;
        this.isCustomAdReady = false;
    }
    public UnInit() {
        this.isRewardAdReady = false;
        this.isInsertAdReady = false;
        this.isBannerAdReady = false;
        this.isCustomAdReady = false;
    }
    private adComponent: AdBase;
    protected ga: GaBase;
    protected logger: ILog;

    cacheCustomAd(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            this.isCustomAdReady = false;
            if (!this.adComponent.isCanUseCustomAd()) {
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Support, errData: "不支持的广告类型" });
                return;
            }
            let adUnitId = AdConfigInfo.customGridUnitId;
            this.adComponent
                .loadCustomAd("cache", adUnitId)
                .then(() => {
                    this.isCustomAdReady = true;
                    resolve(true);
                })
                .catch(reject);
        });
    }
    cacheInsertAd() {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            this.isInsertAdReady = false;
            if (!this.adComponent.isCanUseInterstitialAd()) {
                this.logger.error("cacheInsertAd", "isCanUseInterstitialAd false");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Support, errData: "isCanUseInterstitialAd false" });
                return;
            }
            let ads = AdConfigInfo.insertUnitId;
            if (env.BYTEDANCE) {
                ads = AdConfigInfo.douyinInsertUnitid;
            }
            this.adComponent
                .loadInterstitialAd("cache", ads)
                .then(() => {
                    this.isInsertAdReady = true;
                    resolve(true);
                })
                .catch(reject);
        });
    }
    cacheRewardAd(adUnitId?: string) {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            this.isRewardAdReady = false;
            if (!this.adComponent.isCanUseRewardedViedeoAd()) {
                this.logger.error("cacheRewardAd", "isCanUseRewardedViedeoAd false");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Support, errData: "isCanUseRewardedViedeoAd false" });
                return;
            }
            let ads = adUnitId ? adUnitId : this.getRewardUnitId();
            this.adComponent
                .loadRewardedVideoAd("cache", ads)
                .then(() => {
                    this.isRewardAdReady = true;
                    resolve(true);
                })
                .catch(reject);
        });
    }
    cacheBannerAd(placement: emAdPlacement) {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            this.isBannerAdReady = false;
            if (!this.adComponent.isCanUseBannerAd()) {
                this.logger.error("cacheBannerAd", "isCanUseBannerAd false");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Support, errData: "isCanUseBannerAd false" });
                return;
            }
            let bannerAd = AdConfigInfo.bannerUnitId;
            if (env.BYTEDANCE) {
                bannerAd = AdConfigInfo.douyinBannerUnitId;
            }
            this.isBannerAdReady = true;
            // this.adComponent
            //     .loadBannerAd("cache", bannerAd, placement)
            //     .then(() => {
            //         this.isBannerAdReady = true;
            //         resolve(true);
            //     })
            //     .catch(reject);
        });
    }
    public showBannerAd(scene: string, placement: emAdPlacement = emAdPlacement.BOTTOM): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            if (this.isBannerAdReady) {
                this.adComponent.showBannerAd(scene, true).then(resolve).catch(reject);
            } else {
                this.cacheBannerAd(placement)
                    .then(() => {
                        this.showBannerAd(scene).then(resolve).catch(reject);
                    })
                    .catch(reject);
            }
        });
    }
    protected hideBannerAd(scene: string) {
        if (!this.adComponent) {
            console.error("广告组件没有初始化");
            return;
        }
        this.adComponent.isCanUseBannerAd() &&
            this.adComponent
                .showBannerAd(scene, false)
                .then(() => {
                    console.log("隐藏banner广告成功");
                })
                .catch((error) => {
                    console.log("关闭banner广告失败",error);
                });
        this.isBannerAdReady = false;
    }
    protected showInstertAd(scene: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            if (!this.adComponent.isCanUseInterstitialAd()) {
                this.logger.error("showInstertAd", "isCanUseInterstitialAd false");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Support, errData: "isCanUseInterstitialAd false" });
                return;
            }
            let timeSinceStart = SdkTimerRecord.getInstance().get(emTimerRecordKeys.Game_Start);
            {
                //进入游戏一定时间才能调用展示插屏
                if (timeSinceStart < AdConfigInfo.insertCanShowSinceStart) {
                    let tips = `${timeSinceStart} 小于允许首次展示插屏时间 ${AdConfigInfo.insertCanShowSinceStart}`;
                    this.logger.error("showInstertAd", tips);
                    reject({ errMsg: emSdkErrorCode.Sdk_Ad_Time_Error, errData: tips });
                    return;
                }
            }
            let lastShowInstert = SdkTimerRecord.getInstance().get(emTimerRecordKeys.Show_Insert_Ad);
            if (lastShowInstert == -1 || lastShowInstert >= AdConfigInfo.insertDelat) {
                //let ad = APP.channel.getCurrentAd();
                if (this.isInsertAdReady) {
                    this.adComponent
                        .showInterstitialAd(scene)
                        .then(() => {
                            this.cacheInsertAd()
                                .then(() => {})
                                .catch(() => {});
                            SdkTimerRecord.getInstance().start(emTimerRecordKeys.Show_Insert_Ad);
                            resolve(true);
                        })
                        .catch(reject);
                } else {
                    this.cacheInsertAd()
                        .then(() => {
                            this.showInstertAd(scene).then(resolve).catch(reject);
                        })
                        .catch(reject);
                }
            } else {
                let tips = `${lastShowInstert} 间隔小于允许展示插屏时间 ${AdConfigInfo.insertDelat}`;
                this.logger.error("showInstertAd", tips);
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Time_Error, errData: tips });
            }
        });
    }
    public showCustomAd(scene: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            if (this.isCustomAdReady) {
                this.adComponent.showCustomAd(scene, true).then(resolve).catch(reject);
            } else {
                if (this.adComponent.isCanUseCustomAd()) {
                    this.cacheCustomAd()
                        .then(() => {
                            this.showCustomAd(scene).then(resolve).catch(reject);
                        })
                        .catch(reject);
                }
            }
        });
    }
    protected hideCustomAd(scene: string) {
        if (!this.adComponent) {
            this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
            return;
        }
        if (this.adComponent && this.adComponent.isCanUseCustomAd()) {
            this.adComponent
                .showCustomAd(scene, false)
                .then(() => {
                    this.isCustomAdReady = false;
                })
                .catch(() => {
                    this.isCustomAdReady = false;
                });
        }
    }
    //#region 项目组调用接口
    /**
     * 根据缓存广告类型的参数提前拉广告
     * 调用方式：SDKAD.cacheAds(emCacheAdType.Reward|emCacheAdType.Banner|emCacheAdType.CustomGrid｜emCacheAdType.Insert)
     */
    public cacheAds(cacheAd: number) {
        if (!this.adComponent) {
            console.error("广告组件没有初始化");
            return;
        }
        if ((cacheAd & emCacheAdType.Reward) == emCacheAdType.Reward) {
            if (this.adComponent.isCanUseRewardedViedeoAd()) {
                this.cacheRewardAd(this.getRewardUnitId())
                    .then(() => {})
                    .catch(() => {});
            }
        }
        if ((cacheAd & emCacheAdType.Banner) == emCacheAdType.Banner) {
            if (this.adComponent.isCanUseBannerAd()) {
                this.cacheBannerAd(emAdPlacement.BOTTOM)
                    .then(() => {})
                    .catch(() => {});
            }
        }
        if ((cacheAd & emCacheAdType.Insert) == emCacheAdType.Insert) {
            if (this.adComponent.isCanUseInterstitialAd()) {
                this.cacheInsertAd()
                    .then(() => {})
                    .catch(() => {});
            }
        }
        if ((cacheAd & emCacheAdType.CustomGrid) == emCacheAdType.CustomGrid) {
            if (this.adComponent.isCanUseCustomAd()) {
                this.cacheCustomAd()
                    .then(() => {})
                    .catch(() => {});
            }
        }
        return this;
    }

    /**
     * 初始化后需要到SdkConfig.ts文件中设置广告参数 AdConfigInfo
     * @param ad 广告插件
     * @param ga 统计插件
     */
    public Setup(ad: AdBase, ga: GaBase, log: ILog) {
        this.adComponent = ad;
        ad.Init();
        this.ga = ga;
        this.logger = log;
    }

    private isShowing: boolean = false;
    /**
     * 调用方式：
     * SDKAD.showRewardAd("item","adUnitId").then(()=>{
     *       //观看成功发放奖励
     *    }).catch((err:dtSdkError)=>{
     *        if(err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward){
     *            //主动关闭可在此弹窗提示
     *            return;
     *        }
     *        //其他异常情况可通过err.errMsg和errData分析
     *    });
     * @param scene 播放广告的情景id
     * @param adUnitId 广告id
     * @returns
     */
    protected showRewardAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.adComponent) {
                this.logger.error("Sdk_Ad_Not_Init", "广告组件没有初始化");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Init, errData: "" });
                return;
            }
            if (sys.getNetworkType() == 0) {
                this.logger.error("SDK_Net_Error", "网络未连接");
                reject({ errMsg: emSdkErrorCode.SDK_Net_Error, errData: "net is not connect" });
                return;
            }
            if (this.isShowing) {
                // console.error("激励视频正在播放中");
                this.logger.error("Sdk_Ad_Show_Repeat_Error", "有相同广告正在展示");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Repeat_Error, errData: "" });
                return;
            }
            this.isShowing = true;
            this.ga.trackAdEvent(scene, adUnitId, emVideoState.Load, "load");
            this.adComponent
                .showRewardedVideoAd(scene, adUnitId)
                .then(() => {
                    this.isShowing = false;
                    this.ga.trackAdEvent(scene, adUnitId, emVideoState.SeeFinish, "finish");
                    resolve(true);
                    // this.cacheRewardAd(adUnitId).then(() => { }).catch((err:dtSdkError) => {
                    //     this.ga.trackAdEvent(scene, adUnitId, emVideoState.NoAd, err.errMsg,err.errCode,err.errInfo);
                    // });
                })
                .catch((err: dtSdkError) => {
                    this.isShowing = false;
                    //退出或者展示失败后 再次缓存下
                    reject({ errMsg: emSdkErrorCode.Sdk_Ad_Close_Reward, errData: "" });
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        //主动关闭
                        this.ga.trackAdEvent(scene, adUnitId, emVideoState.Close, "close");
                    }
                    // this.cacheRewardAd(adUnitId).then(() => {
                    // }).catch((err:dtSdkError) => {
                    //     //无广告填充
                    //     this.ga.trackAdEvent(scene, adUnitId, emVideoState.NoAd, err.errMsg,err.errCode,err.errInfo);
                    // });
                });
        });
    }

    /**
     * 广告调用
     * @param scene
     * @returns
     */
    public showRewardVideoAd(scene: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            this.showRewardAd(scene, this.getRewardUnitId()).then(resolve).catch(reject);
        });
    }
    public hasRewardVideoAd(): Promise<boolean> {
        if (this.adComponent) {
            return this.adComponent.hasRewardedVideo();
        }
        return new Promise<boolean>((resolve, reject) => {
            reject(false);
        });
    }
    public getRewardUnitId() {
        if (sys.platform == sys.Platform.BYTEDANCE_MINI_GAME) {
            return AdConfigInfo.douyinRewardUnitId;
        }


        if (sys.os == sys.OS.IOS) {
            return AdConfigInfo.rewardUnitIdiOS;
        }
        return AdConfigInfo.rewardUnitId;
    }
    /**
     * 展示插屏 注意插屏广告有两个时间间隔 启动后多久可以展示 和 每次展示间隔最小时间
     * 调用方式： SdkAdManager.getInstance().showInsterstital();
     *
     */
    public showInsterstital(scene: string = "default"): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            SdkAdManager.getInstance().showInstertAd(scene).then(resolve).catch(reject);
        });
    }
    /**
     * 展示格子广告
     * 调用方式： SdkAdManager.getInstance().showCustomGridAd();
     *
     */
    public showCustomGridAd(scene: string = "default") {
        SdkAdManager.getInstance()
            .showCustomAd(scene)
            .then(() => {
                this.logger.log("showCustomGridAd", "success", scene);
            })
            .catch(() => {
                this.logger.error("showCustomGridAd", "fail", scene);
            });
    }
    /**
     * 隐藏格子广告
     * 调用方式： SdkAdManager.getInstance().showCustomGridAd();
     *
     */
    public hideCustomGridAd(scene: string = "default") {
        SdkAdManager.getInstance().hideCustomAd(scene);
    }
    /**
     * 展示banner
     * 调用方式： SdkAdManager.getInstance().showCustomGridAd();
     *
     */
    public showBanner(scene: string = "default", placement: emAdPlacement = emAdPlacement.BOTTOM) {
        SdkAdManager.getInstance()
            .showBannerAd(scene, placement)
            .then(() => {
                this.logger.log("showBanner", "success", scene, placement);
            })
            .catch(() => {
                this.logger.error("showBanner", "fail", scene, placement);
            });
    }
    /**
     * 隐藏banner
     * 调用方式： SdkAdManager.getInstance().showCustomGridAd();
     *
     */
    public hideBanner(scene: string = "default") {
        SdkAdManager.getInstance().hideBannerAd(scene);
    }
    //#endregion
}
export var SDKAD = SdkAdManager.getInstance();
