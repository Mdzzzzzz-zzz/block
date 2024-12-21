import { emSdkErrorCode } from "../SdkError";
import { SdkTimerRecord, emTimerRecordKeys } from "../timer/TimerRecord";
import { AdBase, emAdPlacement } from "./AdBase";
import { emVideoState } from "./AdDef";

export class WechatMiniAd extends AdBase {
    loadBannerAd(scene: string, adUnitId: string, placement: emAdPlacement = emAdPlacement.BOTTOM): Promise<any> {
        return new Promise((resolve, reject) => {
            let sys = this.platform.getSystemInfoSync();
            // let windowWidth = sys.windowWidth;
            // let windowHeight = sys.windowHeight;
            let s_w = sys.screenWidth;
            let s_h = sys.screenHeight; // 220
            let is_ipx = this.native.isIpx() || this.native.is2To1();
            // ! 强制适配 pad(宽屏设备)
            let is_pad = this.native.isPad();
            if (this.bannerAd) {
                console.error("重复加载和创建banner");
                this.bannerAd.offError();
                this.bannerAd.offResize();
                this.bannerAd.destroy();
            }
            this.bannerAd = this.platform.createBannerAd({
                adUnitId: adUnitId,
                adIntervals: 30,
                style: {
                    left: 0,
                    top: 0,
                    width: is_ipx ? s_w * 0.7 : is_pad ? s_w * 0.6 : s_w * 0.75,
                },
            });
            this.bannerAd.onLoad(() => {
                if (this.bannerAd) {
                    this.bannerAd.offLoad();
                    this.bannerAd.hide();
                    resolve(true);
                }
            });
            this.bannerAd.onResize((size) => {
                if (this.bannerAd) {
                    switch (placement) {
                        case emAdPlacement.TOP:
                            this.bannerAd.style.top = 0;
                            break;
                        case emAdPlacement.MIDDLE:
                            this.bannerAd.style.top = (s_w - size.height) / 2;
                            break;
                        case emAdPlacement.BOTTOM:
                            // this.bannerAd.style.top = windowHeight - size.height + 10;
                            let top = s_h - size.height;
                            this.bannerAd.style.left = (s_w - size.width) / 2;
                            this.bannerAd.style.top = top;
                            break;
                    }
                    this.bannerAd.style.left = (s_w - size.width) / 2;
                }
            });
            this.bannerAd.onError((res) => {
                this.logger.error("获取banner广告失败", res);
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_On_Error, errData: res });
                this.bannerAd = null;
            });
        });
    }
    /**
     * 广告延迟加载可能导致显示在其他界面中 加个状态保护下
     */
    private canShowBanner: boolean = true;
    showBannerAd(scene: string, show: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.bannerAd == null) {
                return;
            }
            if (show) {
                this.canShowBanner = true;
                if (this.isShowingBanner) {
                    this.logger.error("重复展示banner", "");
                    reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Repeat_Error, errData: "" });
                } else {
                    this.bannerAd
                        .show()
                        .then(() => {
                            if (this.canShowBanner) {
                                this.isShowingBanner = true;
                                resolve(true);
                            } else {
                                this.logger.error("bannerAd显示失败", "广告延迟导致显示发生在上次隐藏之后");
                                let _self = this;
                                setTimeout(() => {
                                    _self.isShowingBanner = false;
                                    if (_self.bannerAd) {
                                        _self.bannerAd.hide();
                                    }
                                }, 10);
                                resolve(true);
                                // reject({
                                //     errMsg: emSdkErrorCode.Sdk_Ad_Show_Error,
                                //     errData: "广告延迟导致显示发生在上次隐藏之后",
                                // });
                            }
                        })
                        .catch((err) => {
                            this.isShowingBanner = false;
                            this.logger.error("bannerAd显示失败", err);
                            reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Error, errData: err });
                        });
                }
            } else {
                this.canShowBanner = false;
                // console.log("hide banner 1");
                if (this.bannerAd) {
                    // console.log("hide banner 2");
                    this.bannerAd.offError();
                    this.bannerAd.offResize();
                    // this.bannerAd.hide();
                    this.bannerAd.destroy();
                    console.log("隐藏改为销毁banner");
                    this.bannerAd = null;
                    this.isShowingBanner = false;
                    // console.log("hide banner 3");
                }
            }
        });
    }

    loadRewardedVideoAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.rewardedVideoAd = this.platform.createRewardedVideoAd({
                adUnitId: adUnitId,
            });
            // 监听激励视频广告加载事件
            // this.rewardedVideoAd.onLoad(() => {
            //   if (this.rewardedVideoAd) {
            //     this.rewardedVideoAd.offLoad();
            //     resolve(true);
            //   }
            //   console.warn("load ad call onload", this.rewardedVideoAd);
            // });
            // // 监听激励视频错误事件
            this.rewardedVideoAd.onError((err) => {
                if (err) {
                    this.isPlayVideoAd = false;
                    this.logger.error("loadRewardedVideoAd:", err);
                    reject({
                        errMsg: emSdkErrorCode.Sdk_Ad_On_Error,
                        errData: err,
                        errCode: err.errCode,
                        errInfo: err.errMsg,
                    });
                }
                if (this.rewardedVideoAd) {
                    this.rewardedVideoAd.offError();
                    this.rewardedVideoAd.destroy();
                }
                this.rewardedVideoAd = null;
            });

            this.rewardedVideoAd
                .load()
                .then((result) => {
                    // console.warn("load ad call then", result);
                    resolve(true);
                })
                .catch((err: any) => {
                    // console.warn("load ad call catch", err);
                    this.isPlayVideoAd = false;
                    this.logger.error("loadRewardedVideoAd:", err);
                    reject({
                        errMsg: emSdkErrorCode.Sdk_Ad_Load_Error,
                        errData: err,
                        errCode: err.errCode,
                        errInfo: err.errMsg,
                    });
                });
        });
    }
    showRewardedVideoAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.rewardedVideoAd) {
                // 监听用户点击 关闭广告 按钮的事件
                if (this.isPlayVideoAd == true) {
                    this.logger.error("showRewardedVideoAd:", "同时多次拉取");
                    reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Repeat_Error, errData: "" });
                    return;
                }
                this.isPlayVideoAd = true;
                this.rewardedVideoAd.onClose((res) => {
                    this.isPlayVideoAd = false;
                    // TimerRecord.getInstance().start("show_instert_ad");
                    if ((res && res.isEnded) || res === undefined) {
                        resolve(true);
                    } else {
                        this.logger.error("showRewardedVideoAd:", "主动关闭广告，不发奖");
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_Close_Reward, errData: "" });
                    }
                    if (this.rewardedVideoAd) {
                        this.rewardedVideoAd.offClose();
                    }
                });
                this.rewardedVideoAd
                    .show()
                    .then(() => {
                        this.bi.trackAdEvent(scene, adUnitId, emVideoState.ShowSuccess, 0);
                    })
                    .catch((err) => {
                        this.isPlayVideoAd = false;
                        // console.log("展示激励视频失败");
                        this.logger.error("showRewardedVideoAd:", err);
                        this.bi.trackAdEvent(scene, adUnitId, emVideoState.NoAd, 0);
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Error, errData: err });
                    });
            } else {
                // console.log("展示激励视频为空");
                this.loadRewardedVideoAd(scene, adUnitId)
                    .then(() => {
                        this.showRewardedVideoAd(scene, adUnitId).then(resolve).catch(reject);
                    })
                    .catch(() => {
                        this.logger.error("showRewardedVideoAd:", "广告实例化对象不可用");
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Instantiate, errData: "广告实例化对象不可用" });
                    });
            }
        });
    }
    loadInterstitialAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.interstitialAd = this.platform.createInterstitialAd({
                adUnitId: adUnitId,
            });

            // // 监听激励视频广告加载事件
            // this.interstitialAd.onLoad(() => {
            //   // console.log('插屏视频 广告加载成功');
            //   if (this.interstitialAd) {
            //     this.interstitialAd.offLoad();
            //     //WXInterface.getInstance().hideLoading();
            //   }
            // });

            // 监听激励视频错误事件
            this.interstitialAd.onError((err) => {
                this.logger.error("loadInterstitialAd", err);
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_On_Error, errData: err, errCode: err.errCode });
                if (this.interstitialAd) {
                    this.interstitialAd.offError();
                }
                this.interstitialAd = null;
            });

            this.interstitialAd
                .load()
                .then(() => {
                    // TimerRecord.getInstance().start("show_instert_ad");
                    // console.log("插屏加载成功");
                    resolve(true);
                })
                .catch((err: any) => {
                    // console.error("插屏加载失败:", err);
                    this.logger.error("loadInterstitialAd", err);
                    this.bi.trackAdEvent("af_ad_interstitial", adUnitId, 4, err.errCode);
                    reject({ errMsg: emSdkErrorCode.Sdk_Ad_Load_Error, errData: err, errCode: err.errCode });
                });
        });
    }
    public showInterstitialAd(scene: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.interstitialAd) {
                // 监听用户点击 关闭广告 按钮的事件
                this.interstitialAd.onClose((res) => {
                    SdkTimerRecord.getInstance().start(emTimerRecordKeys.Show_Insert_Ad);
                    if (this.interstitialAd) {
                        this.interstitialAd.offClose();
                    }
                    this.bi.trackAdEvent("af_ad_interstitial", "", 2, 0);
                    resolve(true);
                });
                this.interstitialAd
                    .show()
                    .then(() => {
                        // console.log("插屏显示成功");
                        this.bi.trackAdEvent("af_ad_interstitial", "", 1, 0);
                        //resolve(true);
                    })
                    .catch((err2) => {
                        // console.error("插屏显示失败:", err2);
                        this.logger.error("showInterstitialAd", err2);
                        this.bi.trackAdEvent("af_ad_interstitial", "", 4, err2.errCode);
                        reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Error, errData: err2 });
                    });
            } else {
                // console.error("插屏显示为空");
                this.logger.error("showInterstitialAd:interstitialAd", "广告实例化对象不可用");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Instantiate, errData: "广告实例化对象不可用" });
            }
        });
    }

    // 文档参考地址：https://ad.weixin.qq.com/pdf.html?post_id=U2FsdGVkX19ll2hBY/i9/XyTZ3U858nPUczgOnREpy0=
    // 水平布局默认画布为 360×106 像素 5格子
    // 垂直布局默认画布为 72×410 像素 5格子
    // 可在编辑器自定义修改 80-100%
    public loadCustomAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            let sys = this.platform.getSystemInfoSync();
            let windowWidth = sys.windowWidth;
            let windowHeight = sys.windowHeight;
            this.customAd = this.platform.createCustomAd({
                adUnitId: adUnitId,
                style: {
                    left: Math.floor(windowWidth * 0.5) - 144,
                    top: windowHeight - 80,
                },
            });
            this.customAd.onLoad(() => {
                if (this.customAd) {
                    this.customAd.offLoad();
                    resolve(true);
                }
            });

            this.customAd.onError((res) => {
                if (this.customAd) {
                    this.customAd.offError();
                }
                this.customAd = null;
                this.logger.error("loadCustomAd:", res);
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Load_Error, errData: res, errCode: res.errCode });
            });
            this.customAd.onHide(() => {
                // console.error("customAd 隐藏");
                if (this.customAd) {
                    this.customAd.offHide();
                }
            });
        });
    }
    isCustomAdShow() {
        if (this.customAd) {
            return this.customAd.isShow();
        }
    }
    private canShowCustom = true;
    showCustomAd(scene: string, show: boolean): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (this.customAd) {
                if (show) {
                    this.canShowCustom = true;
                    if (this.isCustomAdShow()) {
                        resolve(true);
                    } else {
                        this.customAd
                            .show()
                            .then(() => {
                                if (this.canShowCustom) {
                                    resolve(true);
                                } else {
                                    this.logger.error("模板显示失败", "广告延迟导致显示发生在上次隐藏之后");
                                    reject({
                                        errMsg: emSdkErrorCode.Sdk_Ad_Show_Error,
                                        errData: "广告延迟导致显示发生在上次隐藏之后",
                                    });
                                }
                            })
                            .catch((err) => {
                                this.logger.error("showCustomAd:", err);
                                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Error, errData: err });
                            });
                    }
                } else {
                    this.canShowCustom = false;
                    if (this.customAd) {
                        this.customAd.destroy();
                    }
                    this.customAd = null;
                    resolve(true);
                }
            } else {
                if (!show) {
                    resolve(true);
                    return;
                }
                this.logger.error("showCustomAd:customAd", "广告实例化对象不可用");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Not_Instantiate, errData: "广告实例化对象不可用" });
            }
        });
    }
    destroy() {
        if (this.bannerAd != null) {
            this.bannerAd.destroy();
            this.bannerAd = null;
        }
        if (this.rewardedVideoAd != null) {
            this.rewardedVideoAd.destroy();
            this.rewardedVideoAd = null;
        }
        if (this.interstitialAd != null) {
            this.interstitialAd.destroy();
            this.interstitialAd = null;
        }
        if (this.customAd != null) {
            this.customAd.destroy();
            this.customAd = null;
        }
    }
}
