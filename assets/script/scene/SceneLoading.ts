import { _decorator, Component, Label, macro, Node } from "cc";
import { Global } from "../data/Global";
import { UserData } from "../data/UserData";
import { ProgressBar, v3 } from "cc";
import { mk } from "../MK";
import { ProcedureToHome } from "../fsm/state/ProcedureToHome";
import { ProcedureToGame } from "../fsm/state/ProcedureToGame";
import { UITweenBarComponent } from "../tween/UITweenBarComponent";
import { GuideData } from "../data/GuideData";
import { buildInfo } from "../Boot";
import { SdkManager } from "../minigame_sdk/scripts/SdkManager";
import { emGaEnv } from "../minigame_sdk/scripts/bi/GaBase";
import { RedPointManager } from "../redpoint/RedPointManager";
import * as env from "cc/env";
import { JYSdkManager } from "../jysdk/JYSdkManager";
import { AdSdk } from "../sdk/AdSdk";
import { ABTestManager } from "../ABTest/ABTestManager";
import { ABEventKey, ABTestParam } from "../ABTest/ABTestDefine";
import { BIEventID } from "../define/BIDefine";
import { ToastManager } from "../toast/ToastManager";
import { emttSideBarStatus } from "../define/BIDefine";
import { TySdkManager } from "../sdk/TySdkManager";
const { ccclass, property } = _decorator;

@ccclass("SceneLoading")
export class SceneLoading extends Component {
    // progress: Label;
    // loadingNode: Node;
    info: Label;
    @property(Node)
    loadingProgressNode: Node;
    @property(Node)
    loadingProgressParticles: Node;
    @property(Node)
    policyViewNode: Node;

    loadingProgress: ProgressBar;
    progressNumber: number;

    startTime: number;
    offset: number = 15;

    onLoad() {
        // this.progress = this.node.getChildByName("progress").getComponent(Label);
        // this.loadingNode = this.node.getChildByName("text_loading");
        this.info = this.node.getChildByName("info").getComponent(Label);
        // this.progress.string = "0";
        this.loadingProgress = this.loadingProgressNode.getComponent(ProgressBar);
        this.progressNumber = 0;
        this.loadingProgress.progress = 0;

        this.startTime = Date.now();
        // this.loadingNode.active = false;
        // this.progress.node.active = false;

        Global.isRestart = false;
        UserData.inst.setLoginNumToday();
        // if (UserData.inst.isFirstLoginToday) {
        //     CrossAdRewardData.inst.clearRewardState();
        // }
        this.startLoadingTimer = Date.now();
        mk.regEvent(mk.eventType.EVENT_PRELOAD_RES, this.onEvtProgress, this);
        mk.regEvent("EVENT_HOT_UPDATE_INFO", this.onEvtHotUpdateInfo, this);
        mk.regEvent(mk.eventType.EVENT_POLICY_SHOW, this.onEvtShowAgree, this);
        mk.regEvent(mk.eventType.EVENT_POLICY_AGREE, this.onAgreePolicy, this);

        this.scheduleOnce(() => {
            ToastManager.getInstance().showToast("网络情况不佳，请耐心等待");
        }, 20);

        // document.addEventListener('ttOnShow', (event) => {
        //     this.checkSideBarStatus() // Output: "bar"
        // });
    }
    protected start(): void {
        mk.sdk.instance.hideSplash();
        this.loadingProgress.progress = 0.01;
        this.startLoadingTimer = Date.now();
        this.currentUseProgress = 0.15;
        this.isArgeePrivacy = true; //SettingData.inst.isAcceptTSP == 1;
        if (this.isArgeePrivacy) {
            this.onStartGame();
            mk.sendEvent(mk.eventType.EVENT_POLICY_SHOW, true);
        } else {
            mk.sendEvent(mk.eventType.EVENT_POLICY_SHOW, true);
        }

    }
    onAgreePolicy(show: boolean): void {
        this.isArgeePrivacy = true;
        this.onBarAnimFinish();
        this.onStartGame();
    }

    onEvtShowAgree(show: boolean): void {
        if (this.policyViewNode) {
            this.policyViewNode.active = show;
        }
    }
    protected isJYSDKInited: boolean = false;
    protected hasSendJYSDKLoadingStart: boolean = false;
    protected isArgeePrivacy: boolean = false;
    protected isFinishedLoad: boolean = false;
    protected startLoadingTimer: number = Date.now();
    private currentTarProgress: number = 0.2;
    private currentUseProgress: number = 0.15;
    onEvtProgress(finished, total) {
        if (finished == null || total == null) return;
        // this.loadingNode.active = true;
        // this.progress.node.active = true;
        if (finished == undefined || total == undefined) {
            return;
        }
        // const prg = (finished / total * 100).toFixed(0);
        this.progressNumber = finished / total;
        this.isFinishedLoad = this.progressNumber >= 1;
        if (env.PREVIEW) {
            console.log("事件接受的加载进度", this.progressNumber);
        }
        // if(!this.loadingProgressNode.active){
        //     this.loadingProgress.node.active = true;
        // }
        // if (this.loadingProgress.progress < this.progressNumber) {
        //     // // console.log("startLoadingTimer:", this.startLoadingTimer, " delta:", this.tweenTime * 1000, Date.now());
        //     // if (this.progressNumber >= 0.8) {
        //     //     //加载时间太快了 等0.3秒的一个缓动时间
        //     //     // console.log("加载时间太快了 缓动一会吧！");
        //     //     return;
        //     // }
        //     // console.log("设置进度：",this.progressNumber);
        //     this.loadingProgress.progress = this.progressNumber;
        //     this.progress.string = `...${(this.progressNumber * 100).toFixed(0)}%`;
        // }
    }
    private isTweening: boolean = false;
    protected update(dt: number): void {
        // console.log("check scene loading update: " + this.isJYSDKInited + " " + this.hasSendJYSDKLoadingStart);
        if (this.isJYSDKInited && !this.hasSendJYSDKLoadingStart) {
            this.hasSendJYSDKLoadingStart = true;
            JYSdkManager.getInstance().sendLoadingStartLog();
            JYSdkManager.getInstance().login();
        }
        let targetProgress = this.loadingProgress.progress + dt * 0.2;
        if (targetProgress > 0.98) {
            targetProgress = 0.98;
        }
        this.loadingProgress.progress = targetProgress;
        this.loadingProgressParticles.setPosition(v3((435 * targetProgress) - this.offset, 0, 0));

        if (this.isFinishedLoad && this.isJYSDKInited) {
            if (this.isTweening) {
                return;
            }
            this.isTweening = true;
            if (env.PREVIEW) {
                console.log("加载完成 开始tween bar 动画");
            }
            // console.log("currentTarProgress", this.currentTarProgress, "currentUseProgress", this.currentUseProgress,this.loadingProgress.progress);
            UITweenBarComponent.Begin(this.loadingProgress, this.loadingProgress.progress, 1, 0.3, 0, () => {
                //延迟一帧率进入 bundle加载有出现空的情况
                // this.progress.string = `...${100}%`;
                this.onBarAnimFinish();
            });
        }
        // if(this.progress){
        //     this.progress.string = `...${(this.loadingProgress.progress * 100).toFixed(0)}%`;
        // }
    }
    private isFinish: boolean = false;
    private onBarAnimFinish() {
        if (!this.isArgeePrivacy) {
            // console.error("isArgeePrivacy false");
            return;
        }
        if (!this.isFinishedLoad) {
            // console.error("isFinishedLoad false");
            return;
        }
        if (this.isFinish) {
            return;
        }
        this.isFinish = true;
        let deviceId = mk.utils.deviceId();
        let isGoHome = !UserData.inst.isNewUser && UserData.inst.isOpenLevel && GuideData.inst.isGuideFinished();
        console.log("UserData.inst.isNewUser: ", UserData.inst.isNewUser, " UserData.inst.isOpenLevel: ", UserData.inst.isOpenLevel, " GuideData.inst.isGuideFinished: ", GuideData.inst.isGuideFinished());
        if (isGoHome) {
            mk.fsm.changeState(ProcedureToHome, "loading");
        } else {
            // mk.fsm.changeState(ProcedureToGame, "block");
            // SceneMode.gameMode = kGameMode.level;
            mk.fsm.changeState(ProcedureToGame, "block");
        }
        if (!this.hasSendJYSDKLoadingStart) {

        }
        JYSdkManager.getInstance().sendLoadingEndLog();
    }

    private onEvtHotUpdateInfo(msg: string) {
        this.info.string = msg;
    }
    private onStartGame() {
        let deviceId = mk.utils.deviceId();
        this.initSdk();
        this.initAds(deviceId);
        this.initBi();
        mk.sdk.instance.putDeviceId(deviceId);
        mk.sdk.instance.putLocalUserId(deviceId);
        RedPointManager.getInstance().Init();

        if (UserData.inst.wxUserAgreePolicy == false) {
            SdkManager.getInstance()
                .channel.aggreePrivacy()
                .then(() => {
                    UserData.inst.wxUserAgreePolicy = true;
                })
                .catch((res) => { });
        }
        // @ts-ignore
        env.WECHAT && wx.getSetting({
            success: (res) => {
                if (!res.authSetting['scope.WxFriendInteraction']) {
                    // @ts-ignore
                    wx.authorize({
                        scope: 'scope.WxFriendInteraction',
                        success: () => {
                        },
                        fail: () => {
                        }
                    })
                }
            }
        })
        if (env.BYTEDANCE) {
            this.checkSideBarStatus();
        }

    }


    private checkSideBarStatus() {
        UserData.inst.setHasSideBar = true;
        if (window["isFromSideBar"] == undefined || window["isFromSideBar"] == null) {
            console.log("ifFromSideBar undefined");
            // @ts-ignore
            tt.checkScene({
                scene: "sidebar",
                success: (res) => {
                    console.log("sidebar exist");
                    UserData.inst.setSideBarStatus = emttSideBarStatus.go_side_bar;
                },
                fail: (res) => {
                    console.log("sidebar not exist");
                    UserData.inst.setHasSideBar = false;
                }
            });
        } else {
            console.log("ifFromSideBar? " + window["isFromSideBar"]);
            if (window["isFromSideBar"]) {
                console.log("ttsidebar is FromSideBar");
                if (UserData.inst.getHasReceivedTtSideBarRewardToday() == true) {
                    UserData.inst.setSideBarStatus = emttSideBarStatus.collected;
                } else {
                    UserData.inst.setSideBarStatus = emttSideBarStatus.not_collected;
                }
            } else {
                console.log("ttsidebar not FromSideBar");
                // @ts-ignore
                tt.checkScene({
                    scene: "sidebar",
                    success: (res) => {
                        console.log("sidebar exist");
                        UserData.inst.setSideBarStatus = emttSideBarStatus.go_side_bar;
                    },
                    fail: (res) => {
                        console.log("sidebar not exist");
                        UserData.inst.setHasSideBar = false;
                    }
                });
            }

        }
    }

    private initSdk() {
        SdkManager.getInstance().Init().Setup(emGaEnv.Online, buildInfo.gameVersion).setEnableLog(false);
        TySdkManager.getInstance().Init().login();
        JYSdkManager.getInstance()
            .Init()
            .setInitCallback((isSuccess, retryTimes) => {
                this.isJYSDKInited = isSuccess;
                if (!isSuccess) {
                    this.isJYSDKInited = retryTimes > 2;
                }
                this.onBarAnimFinish();
            })
            .initSdk(buildInfo.gameVersion, false);
        // if (UserData.inst.isNewRegister) {
        //     SdkManager.getInstance().channel.reportABEvent(ABEventKey.expt_registration, 1);
        // }
        SdkManager.getInstance().channel.reportPlatformEvent("registration", 1);
        this.initABGroup();
        // 是否拉起隐私协议
        // SdkManager.getInstance()
        //     .channel.aggreePrivacy()
        //     .then()
        //     .catch((res) => {});

        // SdkEventManager.getInstance().register(SdkEventType.GO_TO_MINIGAME_SUCCESS, this.onEvtGotoMiniGameSuccess, this)
        //     .register(SdkEventType.CROSS_AD_REWARD_EXCHANGE_CHANGE, this.onEvtCrossAdExChangeReward, this)
        //     .register(SdkEventType.CROSS_AD_REWARD_STATE_CHANGE, this.onEvtRewardStateChange, this);
    }
    private initABGroup() {
        let channel = SdkManager.getInstance().channel;
        let group = channel.getABExpGroup(ABTestParam.Diffcult);
        ABTestManager.getInstance().setGroup(ABTestParam.Diffcult, group);

        // 23/8 冒险引导AB测试全量使用实验组

        // let adventure_guide_group = channel.getABExpGroup(ABTestParam.AdventureGuide);
        // ABTestManager.getInstance().setGroup(ABTestParam.AdventureGuide, adventure_guide_group);

        let revive_group = channel.getABExpGroup(ABTestParam.Revive);
        ABTestManager.getInstance().setGroup(ABTestParam.Revive, revive_group);

        let revive_group2 = channel.getABExpGroup(ABTestParam.Revive2);
        ABTestManager.getInstance().setGroup(ABTestParam.Revive2, revive_group2);

        let endlessgroup = channel.getABExpGroup(ABTestParam.EndlessProp);
        ABTestManager.getInstance().setGroup(ABTestParam.EndlessProp, endlessgroup);

        let adventure_giftpack_group = channel.getABExpGroup(ABTestParam.AdventurePropGiftPack);
        ABTestManager.getInstance().setGroup(ABTestParam.AdventurePropGiftPack, adventure_giftpack_group);

        let newbie_easyblock_group = channel.getABExpGroup(ABTestParam.NewbieEasyBlocks);
        ABTestManager.getInstance().setGroup(ABTestParam.NewbieEasyBlocks, newbie_easyblock_group);

        let remove_lefttimes_display_group = channel.getABExpGroup(ABTestParam.RemoveLeftTimesDisplay);
        ABTestManager.getInstance().setGroup(ABTestParam.RemoveLeftTimesDisplay, remove_lefttimes_display_group);

        let newuser_guide_group = channel.getABExpGroup(ABTestParam.NewUserGuide);
        ABTestManager.getInstance().setGroup(ABTestParam.NewUserGuide, newuser_guide_group);

        let adventure_level_ads_group = channel.getABExpGroup(ABTestParam.AdventureLevelAds);
        ABTestManager.getInstance().setGroup(ABTestParam.AdventureLevelAds, adventure_level_ads_group);

        let classic_gameover_view_group = channel.getABExpGroup(ABTestParam.ClassicGameOverView);
        ABTestManager.getInstance().setGroup(ABTestParam.ClassicGameOverView, classic_gameover_view_group);

        let revive_group3 = channel.getABExpGroup(ABTestParam.Revive3);
        ABTestManager.getInstance().setGroup(ABTestParam.Revive3, revive_group3);

        let endless_challenge_group = channel.getABExpGroup(ABTestParam.EndlessChallenge);
        ABTestManager.getInstance().setGroup(ABTestParam.EndlessChallenge, endless_challenge_group);

        let endless_hard_group = channel.getABExpGroup(ABTestParam.EndlessHardMode);
        ABTestManager.getInstance().setGroup(ABTestParam.EndlessHardMode, endless_hard_group);

        let challenge_brain_group = channel.getABExpGroup(ABTestParam.ChallengeBrain);
        ABTestManager.getInstance().setGroup(ABTestParam.ChallengeBrain, challenge_brain_group);

        let change_ad_to_share = channel.getABExpGroup(ABTestParam.ChangeAdToShare);
        ABTestManager.getInstance().setGroup(ABTestParam.ChangeAdToShare, change_ad_to_share);


        let first_subscribe_game = channel.getABExpGroup(ABTestParam.FirstGameSubscribe);
        ABTestManager.getInstance().setGroup(ABTestParam.FirstGameSubscribe, first_subscribe_game);

        let score_challenge = channel.getABExpGroup(ABTestParam.ScoreChallenge);
        ABTestManager.getInstance().setGroup(ABTestParam.ScoreChallenge, score_challenge);

        if (change_ad_to_share == 1) {
            Global.maxAdBeforeShare = 0;
        }

    }
    private initAds(userId: string) {
        if (env.NATIVE) {
            return;
        }
        this.scheduleOnce(() => {
            // SdkManager.getInstance().loginSnsAndSdk();
            AdSdk.inst.cacheRewardVideoAd();
        }, 10);
        this.scheduleOnce(() => {
            // SdkAdManager.getInstance().cacheAds(emCacheAdType.Banner);
            AdSdk.inst.cacheBannerAd();
        }, 15);
    }
    private initBi() {
        // mk.sdk.instance.initBI("b4b7284580ba4c6f9eb7ee79276d4b8c", "https://122-slg-online01.qijihdhk.com:8991");
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
        // console.log("[scene_loading] destory scene loading " + WechatMiniApi.getInstance().showDeviceInfo().toString());
        //加载销毁 进入游戏再上报
        let memorySize = "0";
        if (env.WECHAT) {
            //@ts-ignore
            if (typeof wx.getDeviceInfo == "function") {
                //@ts-ignore
                let deviceInfo = wx.getDeviceInfo();
                if (deviceInfo) {
                    memorySize = deviceInfo.memorySize || "0";
                }
            }
        }
        mk.sdk.instance.reportBI(mk.biEventId.loading_done, {
            proj_loginnum_today: UserData.inst.loginNumToday,
            proj_version: mk.buildInfo.gameVersion,
            proj_is_first_login: UserData.inst.isFirstPlay,
            proj_loading_duration: Date.now() - this.startTime,
        });
        mk.unRegEvent(this);
    }
}
