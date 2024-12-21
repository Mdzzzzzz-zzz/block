import { sys } from "cc";
import { JsbNativeCall } from "../../../sdk/JsbNativeCall";
import { AdBase, emAdPlacement } from "./AdBase";
import { emSdkErrorCode } from "../SdkError";
import { SdkTimerRecord, emTimerRecordKeys } from "../timer/TimerRecord";
import { mk } from "../../../MK";
import { AD_POSITION } from "./AdDef";

export class IronSourceAd extends AdBase {
    IOS_KEY = "190df2a45";
    ANDROID_KEY = "190df2a45";
    _rewardVideoSuccessCallback: any;
    _rewardVideoFailureCallback: any;
    _rewardVideoLoadSuccessCallback: any;
    _rewardVideoLoadFailureCallback: any;
    _rewardVideoRewarded: boolean;
    _interstitialSuccessCallback: any;
    _interstitialFailureCallback: any;
    _interstitialRewarded: boolean;
    _offerwallSuccessCallback: any;
    _offerwallFailureCallback: any;
    _offerwallRewarded: boolean;
    _bannerLoaded: boolean;
    _bannerLoadSuccessCallback: any;
    _bannerLoadFailureCallback: any;
    private bannerParams: any;
    public Init() {
        let params = {
            appKey: sys.platform == sys.Platform.IOS ? this.IOS_KEY : this.ANDROID_KEY,
            // "w": 320,
            // "h": 90,
            debug: false,
            onSuccess: () => {
                //this.logger.log("ironsource", "init..IronSourceAds...onSuccess....");
                /**
                 * ********************* EVENTS ***********************************
                 */

                //Rewarded Video
                window.addEventListener("rewardedVideoFailed", (err) => {
                    //this.logger.log("ironsource", "rewardedVideoFailed");
                    // this.rewardVideoAvailable = false;
                    this._rewardVideoRewarded = false;
                    //播放异常
                    this._rewardVideoSuccessCallback = null;
                    try {
                        //@ts-ignore
                        this._rewardVideoFailureCallback &&
                            this._rewardVideoFailureCallback({
                                errMsg: emSdkErrorCode.Sdk_Ad_On_Error,
                                errData: err,
                                errCode: err.errorCode,
                                errInfo: err.errorMesssage,
                            });
                    } catch (e) {
                        console.error(e);
                    }
                    this._rewardVideoFailureCallback = null;
                    //加载异常
                    this._rewardVideoLoadSuccessCallback = null;
                    try {
                        //@ts-ignore
                        this._rewardVideoLoadFailureCallback &&
                            this._rewardVideoLoadFailureCallback({
                                errMsg: emSdkErrorCode.Sdk_Ad_On_Error,
                                errData: err,
                                errCode: err.errorCode,
                                errInfo: err.errorMesssage,
                            });
                    } catch (e) {
                        console.error(e);
                    }
                    this._rewardVideoLoadFailureCallback = null;
                });

                window.addEventListener("rewardedVideoRewardReceived", (event) => {
                    //this.logger.log("ironsource", "rewardedVideoRewardReceived");
                    this._rewardVideoRewarded = true;
                });

                window.addEventListener("rewardedVideoEnded", () => {
                    //this.logger.log("ironsource", "rewardedVideoEnded")
                });
                window.addEventListener("rewardedVideoStarted", () => {
                    //this.logger.log("ironsource", "rewardedVideoStarted")
                });

                window.addEventListener("rewardedVideoAvailabilityChanged", (data) => {
                    //@ts-ignore
                    //this.logger.log("ironsource", "rewardedVideoAvailabilityChanged", data.available);
                    // this.rewardVideoAvailable = event.available;
                    //@ts-ignore
                    if (data.available) {
                        if (this._rewardVideoLoadSuccessCallback) {
                            this._rewardVideoLoadSuccessCallback();
                        }
                    } else {
                        if (this._rewardVideoLoadFailureCallback) {
                            this._rewardVideoLoadFailureCallback();
                        }
                    }
                });
                window.addEventListener("rewardedVideoClosed", () => {
                    //this.logger.log("ironsource", "rewardedVideoClosed");
                    if (this._rewardVideoRewarded) {
                        this._rewardVideoFailureCallback = null;
                        this._rewardVideoRewarded = false;
                        try {
                            this._rewardVideoSuccessCallback && this._rewardVideoSuccessCallback();
                        } catch (e) {
                            console.error(e);
                        }
                        this._rewardVideoSuccessCallback = null;
                      
                    } else {
                        this._rewardVideoSuccessCallback = null;
                        this._rewardVideoRewarded = false;
                        try {
                            this._rewardVideoFailureCallback &&
                                this._rewardVideoFailureCallback({
                                    errMsg: emSdkErrorCode.Sdk_Ad_Close_Reward,
                                    errData: "",
                                }); // userClosed
                        } catch (e) {
                            console.error(e);
                        }
                        this._rewardVideoFailureCallback = null;
                    }
                });
                window.addEventListener("rewardedVideoOpened", () => {
                    //this.logger.log("ironsource", "rewardedVideoOpened");
                });

                //Interstitial
                window.addEventListener("interstitialLoaded", () => {
                    //this.logger.log("ironsource", "interstitialLoaded");
                });

                window.addEventListener("interstitialShown", () => {
                    //this.logger.log("ironsource", "interstitialShown");
                    this._interstitialRewarded = true;
                });
                window.addEventListener("interstitialShowFailed", () => {
                    //this.logger.log("ironsource", "interstitialShowFailed");
                    this._interstitialRewarded = false;
                    this._interstitialSuccessCallback = null;
                    try {
                        this._interstitialFailureCallback &&
                            this._interstitialFailureCallback({
                                errMsg: emSdkErrorCode.Sdk_Ad_Show_Error,
                                errData: "",
                            });
                    } catch (e) {
                        console.error(e);
                    }
                    this._interstitialFailureCallback = null;
                });
                window.addEventListener("interstitialClicked", () => {
                    //this.logger.log("ironsource", "interstitialClicked");
                });
                window.addEventListener("interstitialClosed", () => {
                    //this.logger.log("ironsource", "interstitialClosed");
                    SdkTimerRecord.getInstance().start(emTimerRecordKeys.Show_Insert_Ad);
                    if (this._interstitialRewarded) {
                        this._interstitialRewarded = false;
                        this._interstitialFailureCallback = null;
                        try {
                            this._interstitialSuccessCallback && this._interstitialSuccessCallback();
                        } catch (e) {
                            console.error(e);
                        }
                        this._interstitialSuccessCallback = null;
                    } else {
                        this._interstitialRewarded = false;
                        this._interstitialSuccessCallback = null;
                        try {
                            this._interstitialFailureCallback &&
                                this._interstitialFailureCallback({
                                    errMsg: emSdkErrorCode.Sdk_Ad_Close_Reward,
                                    errData: "",
                                });
                        } catch (e) {
                            console.error(e);
                        }
                        this._interstitialFailureCallback = null;
                    }
                });
                window.addEventListener("interstitialWillOpen", () => {
                    //this.logger.log("ironsource", "interstitialWillOpen");
                });
                window.addEventListener("interstitialFailedToLoad", () => {
                    //this.logger.log("ironsource", "interstitialFailedToLoad");
                });

                //Offerwall
                window.addEventListener("offerwallClosed", () => {
                    //this.logger.log("ironsource", "offerwallClosed");
                    if (this._offerwallRewarded) {
                        this._offerwallRewarded = false;
                        this._offerwallFailureCallback = null;
                        try {
                            this._offerwallSuccessCallback && this._offerwallSuccessCallback();
                        } catch (e) {
                            console.error(e);
                        }
                        this._offerwallSuccessCallback = null;
                    } else {
                        this._offerwallRewarded = false;
                        this._offerwallSuccessCallback = null;
                        try {
                            this._offerwallFailureCallback && this._offerwallFailureCallback();
                        } catch (e) {
                            console.error(e);
                        }
                        this._offerwallFailureCallback = null;
                    }
                });
                window.addEventListener("offerwallCreditFailed", () => {
                    //this.logger.log("ironsource", "offerwallCreditFailed");
                    this._offerwallRewarded = false;
                    this._offerwallSuccessCallback = null;
                    try {
                        this._offerwallFailureCallback && this._offerwallFailureCallback();
                    } catch (e) {
                        console.error(e);
                    }
                    this._offerwallFailureCallback = null;
                });
                window.addEventListener("offerwallCreditReceived", (event) => {
                    //this.logger.log("ironsource", "offerwallCreditReceived", event);
                    this._offerwallRewarded = true;
                });
                window.addEventListener("offerwallShowFailed", () => {
                    //this.logger.log("ironsource", "offerwallShowFailed");
                    this._offerwallRewarded = false;
                    this._offerwallSuccessCallback = null;
                    try {
                        this._offerwallFailureCallback && this._offerwallFailureCallback();
                    } catch (e) {
                        console.error(e);
                    }
                    this._offerwallFailureCallback = null;
                });
                window.addEventListener("offerwallShown", () => {
                    //this.logger.log("ironsource", "offerwallShown");
                    this._offerwallRewarded = true;
                });
                window.addEventListener("offerwallAvailabilityChanged", (event) => {
                    //@ts-ignore
                    //this.logger.log("ironsource", "offerwallAvailabilityChanged", event.available);
                });

                //Banner
                window.addEventListener("bannerDidLoad", () => {
                    // return;
                    //this.logger.log("ironsource", "bannerDidLoad");
                    this._bannerLoaded = true;
                    this._bannerLoadSuccessCallback && this._bannerLoadSuccessCallback();
                    this._bannerLoadSuccessCallback = null;
                    if (this.canShowBanner) {
                        if (this.isShowingBanner) {
                            return;
                        }
                        this.showBannerAd("", true)
                            .then(() => {})
                            .catch(() => {});
                    } else {
                        this.showBannerAd("", false)
                            .then(() => {})
                            .catch(() => {});
                    }
                    //this.logger.log("ironsource", "bannerDidLoad......end......");
                });
                window.addEventListener("bannerFailedToLoad", () => {
                    //this.logger.log("ironsource", "bannerFailedToLoad");
                    this._bannerLoadFailureCallback && this._bannerLoadFailureCallback();
                    this._bannerLoadFailureCallback = null;
                    this._bannerLoaded = false;
                });
                window.addEventListener("bannerDidClick", () => {
                    //this.logger.log("ironsource", "bannerDidClick");
                    // bi.sendEvent(config.BIConfig.IRONSRC_BANNER_TOUCH, {});
                });
                window.addEventListener("bannerWillPresentScreen", () => {
                    //this.logger.log("ironsource", "bannerWillPresentScreen")
                });
                window.addEventListener("bannerDidDismissScreen", () => {
                    //this.logger.log("ironsource", "bannerDidDismissScreen")
                });
                window.addEventListener("bannerWillLeaveApplication", () => {
                    //this.logger.log("ironsource", "bannerWillLeaveApplication")
                });
                /**
                 * Validate Integration
                 */
                // this.ironSourceAd.validateIntegration();

                /**
                 * Set user Id (optional) todo
                 */
                // this.setDynamicUserId({ 'userId': '' });
            },
            onFailure: (data) => {
                //this.logger.log("ironsource", "onFailure...." + data);
            },
        };
        let userId = mk.utils.deviceId();
        callPlugin(
            "init",
            {
                appKey: params.appKey,
                providedUserId: userId, //params.userId,
                debug: params.debug,
                position: AD_POSITION.BOTTOM_CENTER,
                rewardAdUnitID: sys.platform == sys.Platform.IOS ? "b01acb6f3cef032b" : "b7185d5d9d219277",
                bannerAdUnitID: sys.platform == sys.Platform.IOS ? "64a0a1ecc3f44253" : "8afe63622b877501",
                insertAdUnitID: sys.platform == sys.Platform.IOS ? "0ff8cf8b7e326f28" : "37a302939fe0a904",
                userId: userId,
                x: 0,
                y: 0,
                w: 0,
                h: 0,
            },
            () => {
                if (isFunction(params.onSuccess)) {
                    params.onSuccess();
                }
            },
            params.onFailure
        );
    }
    public UnInit() {}
    /**
     * Sets the user id, used for Offerwall ad units or using
     * server-to-server callbacks to reward your users with our rewarded ad units
     * @param {String} params.userId user id
     * @param {Function} params.onSuccess - optional on success callback
     * @param {Function} params.onFailure - optional on failure callback
     */
    setDynamicUserId(params) {
        params = defaults(params, {});
        if (params.hasOwnProperty("userId") === false) {
            throw new Error("IronSourceAds::setUserId - missing userId IronSourceAds.setUserId({userId:'example'})");
        }
        callPlugin("setDynamicUserId", { userId: params.userId }, params.onSuccess, params.onFailure);
    }

    /**
     * Sets the user consent, used for displaying personalized ads and GDPR terms
     * @param {Boolean} params.consent - consent
     * @param {Function} params.onSuccess - optional on success callback
     * @param {Function} params.onFailure - optional on failure callback
     */
    setConsent(params) {
        params = defaults(params, {});
        if (params.hasOwnProperty("consent") === false) {
            throw new Error("IronSourceAds::setConsent - missing consent IronSourceAds.setConsent({consent:true})");
        }
        callPlugin("setConsent", { consent: params.consent }, params.onSuccess, params.onFailure);
    }
    /**
     * Validate Integration
     * @param {Function} params.onSuccess - optional on success callback
     * @param {Function} params.onFailure - optional on failure callback
     */
    validateIntegration(params) {
        params = defaults(params, {});
        callPlugin("validateIntegration", {}, params.onSuccess, params.onFailure);
    }
    loadRewardedVideoAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            callPlugin(
                "loadRewardedVideo",
                {},
                () => {
                    this._rewardVideoLoadSuccessCallback = resolve;
                    this._rewardVideoLoadFailureCallback = reject;
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }
    showRewardedVideoAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // 监听用户点击 关闭广告 按钮的事件
            if (this.isPlayVideoAd == true) {
                this.logger.error("showRewardedVideoAd:", "同时多次拉取");
                reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Repeat_Error, errData: "" });
                return;
            }
            this.isPlayVideoAd = true;
            this._rewardVideoSuccessCallback = () => {
                this.isPlayVideoAd = false;
                resolve(true);
            };
            this._rewardVideoFailureCallback = reject;
            callPlugin(
                "showRewardedVideo",
                { placement: "DefaultRewardedVideo" },
                () => {},
                (err) => {
                    this.isPlayVideoAd = false;
                    reject(err);
                }
            );
        });
    }

    public hasRewardedVideo(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            callPlugin(
                "hasRewardedVideo",
                {},
                (data) => {
                    if (data == "true") {
                        resolve(true);
                    } else {
                        reject();
                    }
                },
                reject
            );
        });
    }
    loadBannerAd(scene: string, adUnitId: string, placement: emAdPlacement): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            let params = { placement: "DefaultBanner", position: "bottom", size: "smart" };
            this._bannerLoadFailureCallback = reject;
            this._bannerLoadSuccessCallback = resolve;
            callPlugin(
                "loadBanner",
                {
                    placement: params.placement,
                    size: params.size,
                    position: params.position,
                },
                () => {},
                () => {}
            );
        });
    }
    /**
     * 广告延迟加载可能导致显示在其他界面中 加个状态保护下
     */
    private canShowBanner: boolean = true;
    showBannerAd(scene: string, show: boolean): Promise<any> {
        return new Promise((resolve, reject) => {
            if (show) {
                this.canShowBanner = true;
                if (this.isShowingBanner) {
                    this.logger.error("重复展示banner", "");
                    reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Repeat_Error, errData: "" });
                } else {
                    let params = { position: 0, x: 0, y: 0 };
                    callPlugin(
                        "showBanner",
                        {
                            position: params.position,
                            x: params.x,
                            y: params.y,
                        },
                        () => {
                            if (this.canShowBanner) {
                                this.isShowingBanner = true;
                                resolve(true);
                            } else {
                                this.logger.error("bannerAd显示失败", "广告延迟导致显示发生在上次隐藏之后");
                                this.bannerAd.hide();
                                reject({
                                    errMsg: emSdkErrorCode.Sdk_Ad_Show_Error,
                                    errData: "广告延迟导致显示发生在上次隐藏之后",
                                });
                            }
                        },
                        (err) => {
                            this.isShowingBanner = false;
                            this.logger.error("bannerAd显示失败", err);
                            reject({ errMsg: emSdkErrorCode.Sdk_Ad_Show_Error, errData: err });
                        }
                    );
                }
            } else {
                this.canShowBanner = false;
                callPlugin("hideBanner", {}, resolve, reject);
                this.isShowingBanner = false;
            }
        });
    }
    /**
     * Checks if offerwall is available
     * @param {Function} params.onSuccess - function to call the result to
     * @param {Function} params.onFailure
     */
    hasOfferwall(params) {
        params = defaults(params, {});
        callPlugin("hasOfferwall", {}, params.onSuccess, params.onFailure);
    }
    /**
     * Shows the offerwall if available
     * @param {string} params.placement
     * @param {Function} params.onSuccess
     * @param {Function} params.onFailure
     */
    showOfferwall(params) {
        params = defaults(params, { placement: "DefaultOfferWall" });

        callPlugin("showOfferwall", { placement: params.placement }, params.onSuccess, params.onFailure);
    }
    /**
     * load 只负责加载但不知道加载有没有成功 播放前用hasInterstitial进行判断
     * @param scene
     * @param adUnitId
     * @returns
     */
    loadInterstitialAd(scene: string, adUnitId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            callPlugin("loadInterstitial", {}, resolve, reject);
        });
    }
    public showInterstitialAd(scene: string): Promise<any> {
        return new Promise((resolve, reject) => {
            callPlugin(
                "showInterstitial",
                { placement: "DefaultInterstitial" },
                () => {
                    this._interstitialFailureCallback = reject;
                    this._interstitialSuccessCallback = resolve;
                },
                reject
            );
        });
    }
    hasInterstitial(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            callPlugin("hasInterstitial", {}, resolve, reject);
        });
    }
    /**
     * Checks if rewarded video is capped for placement.
     * This should be used before showing the state of the button for rewarded video.
     * User may have capped their usage
     */
    isRewardedVideoCappedForPlacement(params) {
        params = defaults(params, { placement: "DefaultRewardedVideo" });
        callPlugin(
            "isRewardedVideoCappedForPlacement",
            { placement: params.placement },
            params.onSuccess,
            params.onFailure
        );
    }
}

/**
 * Helper function to call plugin
 * @param {String} action - function name to call
 * @param {Object} params - optional params
 * @param {Function} onSuccess - optional on sucess function
 * @param {Function} onFailure - optional on failure functioin
 */
function callPlugin(action, params, onSuccess, onFailure) {
    JsbNativeCall.exec(
        "AdMaxPlugin",
        action,
        params,
        function callPluginSuccess(result) {
            if (isFunction(onSuccess)) {
                onSuccess(result);
            }
        },
        function callPluginFailure(error) {
            if (isFunction(onFailure)) {
                onFailure(error);
            }
        }
    );
}

/**
 * Helper function to check if a function is a function
 * @param {Object} functionToCheck - function to check if is function
 */
function isFunction(functionToCheck) {
    var getType = {};
    var isFunction = functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
    return isFunction === true;
}

/**
 * Helper function to do a shallow defaults (merge). Does not create a new object, simply extends it
 * @param {Object} o - object to extend
 * @param {Object} defaultObject - defaults to extend o with
 */
function defaults(o, defaultObject) {
    if (typeof o === "undefined") {
        return defaults({}, defaultObject);
    }

    for (var j in defaultObject) {
        if (defaultObject.hasOwnProperty(j) && o.hasOwnProperty(j) === false) {
            o[j] = defaultObject[j];
        }
    }

    return o;
}
