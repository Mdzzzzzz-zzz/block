import { _decorator, Node, Vec3, Tween, Sprite, Animation } from "cc";
import { Game } from "../logic/Game";
import { Label } from "cc";
import { biEventId, getItem } from "../../../../Boot";
import { mk } from "../../../../MK";
import { tween } from "cc";
import { EndlessScoreHelper } from "../logic/EndlessScoreHelper";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { AdSdk } from "../../../../sdk/AdSdk";
import { ProcedureToHome } from "../../../../fsm/state/ProcedureToHome";
import PanelBase from "../../../../panel/PanelBase";
import { emAdPath } from "../../../../sdk/emAdPath";
import { emSharePath, emShareType } from "../../../../sdk/wechat/SocialDef";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { BIEventID, emAdStatus, emButtonScene, emButtonType, emScene } from "../../../../define/BIDefine";
import { FlagData } from "../../../../data/FlagData";
import { ProcedureToAdventureLevelSelectV2 } from "../../../../fsm/state/ProcedureToAdventureLevelSelectV2";
import { UserData } from "../../../../data/UserData";
import { Util } from "../logic/Util";
import { ResManager } from "../../../../resource/ResManager";
import { PanelManager } from "../../../../panel/PanelManager";
import * as env from "cc/env";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { UserRemoteDataManager } from "../../../../data/UserRemoteDataManager";
import { BlockEventType } from '../define/Event';
import { ProcedureToAlbum } from "../../../../fsm/state/ProcedureToAlbum";
import { Global } from "../../../../data/Global";
import { emEnterAlbumFrom } from "../../../../define/BIDefine";
import { ToastManager } from "../../../../toast/ToastManager";
const { ccclass, property } = _decorator;
const lessonTmplId = "TDtYpeHJ-y4hbUi-YbEf3QTJkShVEuwR_ROn7chU5e4"
const item = {   // 模板内容
    thing12: {
        value: '新增关卡'
    },
    thing2: {
        value: '关卡已就绪，继续挑战新纪录吧！'
    }
}
const EndlessBestScoreViewSceneID = 8;
@ccclass("EndlessGameOverView")
export class EndlessGameOverView extends PanelBase<{ manager: any; result: number }> {
    @property(Label)
    scoreLabel: Label = null;
    @property(Label)
    scoreLabelBack: Label = null;
    @property(Label)
    maxScoreLabel: Label = null;
    @property(Node)
    guideHand: Node = null;

    @property(Sprite)
    classicPlayTimeIcon: Sprite = null;

    @property(Sprite)
    classicPlayTimeIcon2: Sprite = null;  // ab测试

    @property(Node)
    classicButton: Node = null;

    @property(Node)
    classicButton2: Node = null;

    @property(Node)
    levelButton: Node = null;

    @property(Node)
    returnButton: Node = null;


    @property(Node)
    greyBgBelowScore: Node = null;

    private curScore: number = null; // 本局得分
    private highScore: number = null; // 最高得分

    //private buttonABGroup: number = 0;

    @property(Node)
    mainAnimNode: Node = null;
    @property(Node)
    adventureRedPoint: Node = null;

    protected adFailLoadTimes: number = 0;
    lastRetryTime: number;
    private abgroup: number;
    onLoad() {
        // this.buttonABGroup = ABTestManager.getInstance().getGroup(ABTestParam.ClassicGameOverView)
        // console.log("ABTestParam.ClassicGameOverView group", this.buttonABGroup);

        this.classicButton.active = false;
        this.classicButton2.active = true;
        this.levelButton.active = false;
        this.returnButton.active = true;
        this.adventureRedPoint.active = false;
        mk.regEvent(BlockEventType.EVENT_ACTIVE_NODE_FROM_ALBUM, this.OnReceiveNodeActive, this);
    }

    start(): void {
        if (SceneMode.gameMode == kGameMode.endless) {
            UserData.inst.setPlayClassicTimesToday();
        }
        this.greyBgBelowScore.active = false;
        mk.regEvent(BlockEventType.EVENT_RETURN_HOME, this.onReturnHome, this);
        mk.regEvent(BlockEventType.EVENT_RETRY, this.onRetry, this);

        this.abgroup = ABTestManager.getInstance().getGroup(ABTestParam.FirstGameSubscribe);
        this.refreshBtnState();
        UserData.inst.setThisRoundUsedHammerCount(0);
        UserData.inst.setThisRoundUsedVRocketCount(0);
        UserData.inst.setThisRoundUsedHRocketCount(0);
        UserData.inst.setThisRoundUsedRefreshCount(0);
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
        UserData.inst.isGameOngoing = false;
        AdSdk.inst.hideMainPageBannerAd();
        AdSdk.inst.showPopBannerAd();
        //首次不播放插屏
        if (this.isCanShowInstersitial()) {
            if (FlagData.inst.hasFlag("jump_ad_instertital_endless")) {
                AdSdk.inst.showInsterstital("EndlessGameOverView");
            } else {
                FlagData.inst.recordFlag("jump_ad_instertital_endless");
            }
        }
        // mk.audio.playSubSound(AssetInfoDefine.audio.game_over);
        // director.preloadScene("level_select", () => {});
        // 改为常驻引导
        Tween.stopAllByTarget(this.guideHand);
        // let group = ABTestManager.getInstance().getGroup(ABTestParam.AdventureGuide);
        // if (group == 1) {
        if (FlagData.inst.hasFlag("ab_test_hand_guide_completed") == false) {
            FlagData.inst.recordFlag("ab_test_hand_guide_completed");
            // if (this.buttonABGroup == 0) {
            //     this.PlayAdventureHandGuide();
            // }
            this.adventureRedPoint.active = false;
        } else {
            this.guideHand.active = false;
            let state = UserData.inst.getHasEnteredAdventureToday();
            if (UserAdventureLevelData.inst.isAllLevelFinished == 1) {
                state = true;
            }
            // if (this.buttonABGroup == 0) {
            //     this.adventureRedPoint.active = !state;
            // }
        }

        let num = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        UserData.inst.setScoreProgressSeed(num);

        if (SceneMode.gameMode == kGameMode.endless) {
            if (env.WECHAT) {
                //检查key问题
                // @ts-ignore
                wx.getOpenDataContext().postMessage({
                    event: "check",
                    key: "score",
                });
                // @ts-ignore
                wx.getSetting({
                    success: (res) => {
                        //子域逻辑
                        if (res.authSetting['scope.WxFriendInteraction']) {
                            this.greyBgBelowScore.active = true;
                            this.playAnimWithLeaderRank();
                            // @ts-ignore
                            wx.getOpenDataContext().postMessage({
                                event: "settlement",
                                key: "score",
                                data: this.curScore,
                            });
                        } else {
                            // 主域逻辑
                            this.playAnim()
                        }
                    }
                })
            } else {
                this.playAnim()
            }
        }
    }
    protected playAnim() {
        let animation = this.mainAnimNode.getComponent(Animation);
        animation.play("EndlessGameOverView_02_anim");
    }
    protected playAnimWithLeaderRank() {
        let animation = this.mainAnimNode.getComponent(Animation);
        animation.play("EndlessGameOverView_anim");
    }

    protected refreshBtnState() {
        let freeTimes = UserData.inst.getClassicPlayNumToday;
        let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();
        if (freeTimes < maxFreeTimes) {
            this.classicPlayTimeIcon.node.active = false;
            this.classicPlayTimeIcon2.node.active = false;
        } else if ((UserData.inst.getCanShareReplay() && UserData.inst.getAccountShareCount() > 0) || this.adFailLoadTimes > Global.maxAdBeforeShare) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    // if (this.buttonABGroup == 0) {
                    //     this.classicPlayTimeIcon.node.active = true;
                    //     this.classicPlayTimeIcon.spriteFrame = sprite;
                    // } else {
                    this.classicPlayTimeIcon2.node.active = true;
                    this.classicPlayTimeIcon2.spriteFrame = sprite;
                    // }
                });
        } else {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    // if (this.buttonABGroup == 0) {
                    //     this.classicPlayTimeIcon.node.active = true;
                    //     this.classicPlayTimeIcon.spriteFrame = sprite;
                    // } else {
                    this.classicPlayTimeIcon2.node.active = true;
                    this.classicPlayTimeIcon2.spriteFrame = sprite;
                    //}
                });
        }
    }
    protected isCanShowInstersitial(): boolean {
        return true;
    }
    manager: Game;
    protected onSetData(value: { manager: any; result: number }): void {
        // mk.audio.playSubSound(AssetInfoDefine.audio.fail);
        this.manager = this.data.manager;
        let scoreHelper = this.manager.scoreHelper as EndlessScoreHelper;
        this.setScoreData(scoreHelper.score, scoreHelper.historyMaxScore);
        //每次结束重新计算朋友数据
        SdkManager.getInstance().channel.sendMsg({ method: "load_data" });
        SdkManager.getInstance().channel.setCloudStorage([
            {
                key: "score",
                value: scoreHelper.historyMaxScore.toString(),
            },
        ]);

        let times = FlagData.inst.getTimes(BIEventID.af_classicgame);
        // mk.sdk.instance.reportAf(
        //     BIEventID.af_classicgame,
        //     {
        //         af_classictimes: times,
        //         af_classicscore: scoreHelper.score,
        //         af_classichighest: scoreHelper.historyMaxScore,
        //     },
        //     true
        // );
        FlagData.inst.recordTimes(BIEventID.af_classicgame);
    }
    protected PlayAdventureHandGuide() {
        this.guideHand.active = true;
        let cPos = new Vec3(200, -80, 0);
        tween(this.guideHand)
            .repeatForever(
                tween()
                    .to(
                        0.5,
                        { position: new Vec3(175, -55, 0) },
                        {
                            easing: "circOut",
                        }
                    )
                    .to(0.5, { position: cPos }, { easing: "circOut" })
            )
            .start();
    }

    setScoreData(curScore, highScore) {
        this.curScore = curScore;
        this.highScore = highScore;
        this.maxScoreLabel.string = this.highScore.toString();
        this.setScore(this.scoreLabel, this.curScore);
        this.setScore(this.scoreLabelBack, this.curScore);

        //用于推荐的计算
        const scoreInfo = getItem("game_action_info", { score: 0, playCount: 0 });
        // 未达到最大分数
        if (scoreInfo.score > curScore) {
            scoreInfo.playCount++;
            mk.setItem("game_action_info", scoreInfo);
        } else {
            scoreInfo.playCount = 0;
            scoreInfo.score = highScore;
            mk.setItem("game_action_info", scoreInfo);
            let oldRecord = UserRemoteDataManager.inst.getUserRemoteHighScore();
            if (oldRecord !== undefined && oldRecord !== null) {
                if (highScore > oldRecord && highScore > 0) {
                    UserRemoteDataManager.inst.setUserRemoteHighScore(highScore);
                }
            } else {
                if (highScore > 0) {
                    UserRemoteDataManager.inst.setUserRemoteHighScore(highScore);
                }
            }

        }
    }
    setScore(label: Label, score: number) {
        let tscore = 0;
        let scorecz = score;
        if (scorecz > 0) {
            let call = tween().call(() => {
                tscore = tscore + 1;
                let s = tscore.toString();
                label.string = s;
            });
            let usetime = 1;
            let time = usetime / scorecz;
            let delay = tween().delay(time);
            tween(label).delay(0.533).repeat(scorecz, tween().sequence(delay, call)).start();
            // this.schedule(() => {
            //     mk.audio.playSubSound(AssetDefine.audio.number);
            // }, 1 / 30, 8, 0);
        } else {
            label.string = 0 + "";
        }
    }
    onClickRetry(event, customEventData) {


        let sceneNum = parseInt(customEventData);
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        // console.log("[click_button] btn_click " + emButtonType.enter_classic + " " + emButtonScene.from_fail_classic);
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_classic,
            proj_scene: emButtonScene.from_fail_classic,
        });

        if (SceneMode.gameMode == kGameMode.endless) {
            let freeTimes = UserData.inst.getClassicPlayNumToday;
            let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

            if (freeTimes < maxFreeTimes) {
                this.manager.retryCurrentLevel();
                mk.unRegEvent(this);
                this.closeSelf();
            } else if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                let randomShowOffNum = Util.generateRandomShowOffShare();
                let startTime = new Date().getTime();
                WechatMiniApi.getInstance().showShare(
                    randomShowOffNum,
                    emSharePath.revive,
                    this,
                    () => {
                        this.manager.retryCurrentLevel();
                        mk.unRegEvent(this);
                        this.closeSelf();
                    },
                    {},
                    () => {
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);
                        console.log("failed to share");
                        return;
                    }
                );
                this.refreshBtnState();
            } else {
                // 打点广告_开始游戏
                mk.sdk.instance.reportBI(biEventId.ad_begin, {
                    proj_scene: sceneNum,
                    proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                    proj_ad_status: emAdStatus.WakeUp
                });
                AdSdk.inst
                    .showRewardVideoAd(emAdPath.Score_Relife)
                    .then((res) => {
                        mk.sdk.instance.reportBI(biEventId.ad_begin, {
                            proj_scene: sceneNum,
                            proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                            proj_ad_status: emAdStatus.Finished
                        });
                        this.manager.retryCurrentLevel();
                        mk.unRegEvent(this);
                        this.closeSelf();
                    })
                    .catch((err: dtSdkError) => {
                        if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                            mk.sdk.instance.reportBI(biEventId.ad_begin, {
                                proj_scene: sceneNum,
                                proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                                proj_ad_status: emAdStatus.Closed
                            });
                            SdkManager.getInstance().native.showToast(
                                LanguageManager.translateText("tip_not_finish_watch")
                            );
                            // TODO: emit event to trigger panel view
                            return;
                        } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                            this.adFailLoadTimes += 1;
                            SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                            this.refreshBtnState();
                        }
                        mk.sdk.instance.reportBI(biEventId.ad_begin, {
                            proj_scene: sceneNum,
                            proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                            proj_ad_status: emAdStatus.Error
                        });
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                        // TODO: emit event to trigger panel view
                        return;
                    });
            }
        }
    }
    onClickLevel() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        // console.log("[click_button] btn_click " + emButtonType.enter_adventure + " " + emButtonScene.from_fail_classic);
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_adventure,
            proj_scene: emButtonScene.from_fail_classic,
        });

        SceneMode.gameMode = kGameMode.none;
        mk.unRegEvent(this);
        mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "block");
        this.scheduleOnce(() => {
            this.closeSelf();
        }, 0.25);
    }
    onClickHome() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        mk.fsm.changeState(ProcedureToHome, "block");
        mk.unRegEvent(this);
        this.scheduleOnce(this.closeSelf, 0.15);
        // this.closeSelf();
    }
    onClickRelife() {
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Score_Relife)
            .then(() => {
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                this.node.destroy();
                this.manager.relifeCurrentLevel();
            })
            .catch((err: dtSdkError) => {
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    return;
                }
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }
    onClickShare() {
        let randProp = Math.random();
        if (randProp < 0.25) {
            WechatMiniApi.getInstance().showShare(emShareType.s_10001, emSharePath.start_game, this, null);
        } else if (randProp < 0.5) {
            WechatMiniApi.getInstance().showShare(emShareType.s_10002, emSharePath.start_game, this, null);
        } else if (randProp < 0.75) {
            WechatMiniApi.getInstance().showShare(emShareType.s_10003, emSharePath.start_game, this, null);
        } else {
            WechatMiniApi.getInstance().showShare(emShareType.s_10004, emSharePath.start_game, this, null);
        }
    }
    onClickHelp() {
        WechatMiniApi.getInstance().showShare(emShareType.s_10003, emSharePath.start_game, this, null);
    }
    onWillClose(): void {
        super.onWillClose();
        AdSdk.inst.hidePopBannerAd();
        // AdSdk.inst.showMainPageBannerAd("EndlessGameOverView");
        // if (this.manager) {
        //     this.manager.clearLevelHistoryData();
        // }
    }
    onClickLeaderBoard() {
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_leaderboard,
            proj_scene: emButtonScene.from_fail_classic,
        });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.friendListRank.path);
    }

    onClickBtnShare() {
        WechatMiniApi.getInstance().showShare(emShareType.s_10008, emSharePath.level_fail, this, null);
    }

    onClickStickerBtn() {
        // mk.sdk.instance.reportBI(BIEventID.btn_click, {
        //     btn_type: emButtonType.enter_mysticker,
        //     scene: emButtonScene.from_adventure_choose_level,
        // });
        //this.node.active = false;
        Global.EnterStickerFrom = emEnterAlbumFrom.game_over;
        // this.scheduleOnce(()=>{
        //     this.closeSelf();
        // },0.5);
        // mk.fsm.changeState(ProcedureToAlbum);
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.albumBookView.path, { source: emEnterAlbumFrom.game_over })
    }

    OnReceiveNodeActive() {
        //this.node.active = true;
        //this.setMaskLayerEnable(false);
    }

    closeSelf() {
        if (env.WECHAT) {
            //更新当前的分数
            // @ts-ignore
            wx.getOpenDataContext().postMessage({
                event: "clear",
            });
        }
        super.closeSelf();
        //this..active = false;
    }

    requestSubscribe(blockEventType) {

        mk.sdk.instance.reportBI(biEventId.subscription, {
            proj_subscriptionType: 1,
            proj_subscription_operate: 1
        });
        // @ts-ignore
        wx.requestSubscribeMessage({
            // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请
            tmplIds: [lessonTmplId],
            success(res) {
                // 申请订阅成功
                if (res.errMsg === 'requestSubscribeMessage:ok' && res[lessonTmplId] === 'accept') {
                    // 这里将订阅的课程信息调用云函数存入云开发数据
                    //@ts-ignore
                    wx.cloud.init()
                    // @ts-ignore
                    wx.cloud.callFunction({
                        name: 'subscribe',
                        data: {
                            data: item,
                            templateId: lessonTmplId,
                        },
                    })
                        .then((res) => {
                            console.log(res)
                            // @ts-ignore
                            wx.showToast({
                                title: '订阅成功',
                                icon: 'success',
                                duration: 2000,
                            });
                            mk.sendEvent(blockEventType);

                            mk.sdk.instance.reportBI(biEventId.subscription, {
                                proj_subscriptionType: 1,
                                proj_subscription_operate: 3
                            });
                        })
                        .catch((res) => {
                            console.log(res)
                            // @ts-ignore
                            wx.showToast({
                                title: '订阅失败',
                                icon: 'error',
                                duration: 2000,
                            });
                            mk.sendEvent(blockEventType);
                            mk.sdk.instance.reportBI(biEventId.subscription, {
                                proj_subscriptionType: 1,
                                proj_subscription_operate: 2
                            });
                        });
                } else {
                    // @ts-ignore
                    wx.showToast({
                        title: '订阅失败',
                        icon: 'error',
                        duration: 2000,
                    });
                    console.log(res)
                }
            },
            fail(res) {
                console.error(res)
                // @ts-ignore
                wx.showToast({
                    title: '订阅失败',
                    icon: 'error',
                    duration: 2000,
                });
                mk.sendEvent(blockEventType);
            },
            complete(res) {
                console.log(res)
            }
        });
    }

    onClickRetryWithSubscribe() {
        if (this.abgroup == 1 && (Global.popFirstGameSubscribe == true || !FlagData.inst.hasFlag("kFirstGameSubscribe"))) {
            Global.popFirstGameSubscribe = false;
            FlagData.inst.recordFlag("kFirstGameSubscribe")
            this.requestSubscribe(BlockEventType.EVENT_RETRY);

        } else {
            this.onClickRetry(null, EndlessBestScoreViewSceneID);
        }
    }

    onRetry() {
        this.scheduleOnce(() => {
            this.onClickRetry(null, EndlessBestScoreViewSceneID);
        }, 1.5);
    }

    onClickHomeWithSubscribe() {
        if (this.abgroup == 1 && (Global.popFirstGameSubscribe == true || !FlagData.inst.hasFlag("kFirstGameSubscribe"))) {
            Global.popFirstGameSubscribe = false;
            FlagData.inst.recordFlag("kFirstGameSubscribe")
            this.requestSubscribe(BlockEventType.EVENT_RETURN_HOME);

        } else {
            this.onClickHome();
        }
    }

    onReturnHome() {
        this.scheduleOnce(() => {
            this.onClickHome();
        }, 1.5);
    }
}
