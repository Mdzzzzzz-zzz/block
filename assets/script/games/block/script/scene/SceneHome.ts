/*
 * @Date: 2023-05-25 15:41:39
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-19 14:16:06
 */
import {
    _decorator, Animation, Component, director, Label, Node, Sprite, SpriteFrame, tween, Tween, Vec3
} from 'cc';
import * as env from 'cc/env';
import { biEventId, global } from '../../../../Boot';
import { AlbumData } from '../../../../data/AlbumData';
import { emStageStickerStatus } from '../../../../data/AlbumDef';
import { LanguageManager } from '../../../../data/LanguageManager';
import { UserAdventureLevelData } from '../../../../data/UserAdventureLevelData';
import { UserDailyChallengeData } from '../../../../data/UserDailyChallengeData';
import { UserData } from '../../../../data/UserData';
import { UserRemoteDataManager } from '../../../../data/UserRemoteDataManager';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
import {
    BIEventID, emAdStatus, emButtonScene, emButtonType, emEnterAlbumFrom, emScene, emttSideBarStatus
} from '../../../../define/BIDefine';
import { buildInfo } from '../../../../define/GameDefine';
import {
    ProcedureToAdventureLevelSelectV2
} from '../../../../fsm/state/ProcedureToAdventureLevelSelectV2';
import { ProcedureToDailyChallengeHome } from '../../../../fsm/state/ProcedureToDailyChallengeHome';
import { ProcedureToGame } from '../../../../fsm/state/ProcedureToGame';
import { ProcedureToHome } from '../../../../fsm/state/ProcedureToHome';
import { dtSdkError, emSdkErrorCode } from '../../../../minigame_sdk/scripts/SdkError';
import { SdkEventManager } from '../../../../minigame_sdk/scripts/SdkEventManager';
import { SdkEventType } from '../../../../minigame_sdk/scripts/SdkEventType';
import { SdkManager } from '../../../../minigame_sdk/scripts/SdkManager';
import { mk } from '../../../../MK';
import { PanelManager } from '../../../../panel/PanelManager';
import { ResManager } from '../../../../resource/ResManager';
import { AdSdk } from '../../../../sdk/AdSdk';
import { emAdPath } from '../../../../sdk/emAdPath';
import { emSharePath, emShareType } from '../../../../sdk/wechat/SocialDef';
import { ToastManager } from '../../../../toast/ToastManager';
import { audioManager } from '../../../../util/MKAudio';
import { NodePoolManager } from '../../../../util/NodePool';
import { kGameMode } from '../define/Enumrations';
import { BlockEventType } from '../define/Event';
import { SceneMode } from '../define/SceneMode';
import { Util } from '../logic/Util';
import { myWorkView } from '../ui/myWorkView';
import { UserLevelData } from 'db://assets/script/data/UserLeveData';
import { ProcedureToLevel } from 'db://assets/script/fsm/state/ProcedureToLevel';
import { Button } from 'cc';
import { UserScoreLevelData } from 'db://assets/script/data/UserScoreLevelData';
import { Global } from 'db://assets/script/data/Global';
import { ABTestManager } from 'db://assets/script/ABTest/ABTestManager';
import { ABTestParam } from 'db://assets/script/ABTest/ABTestDefine';
import { FlagData } from 'db://assets/script/data/FlagData';
const { ccclass, property } = _decorator;

@ccclass("SceneHome")
export class SceneHome extends Component {
    // @property(Node)
    // rootLevelInfo: Node = null;
    // @property(Node)
    // imgLevel: Node = null;
    // @property(Node)
    // labLevel: Node = null;
    // @property(Node)
    // countdownLabel: Node;

    // @property(Animation)
    // bubbleAnim: Animation = null;

    @property(Node)
    bubbleAnimNode: Node = null;

    @property(Animation)
    classicButtonAnim: Animation = null;

    @property(Animation)
    adventureButtonAnim: Animation = null;

    @property(Animation)
    myWorkButtonAnim: Animation = null;

    @property(Animation)
    advenmodeButtonAnim: Animation = null;

    @property(Animation)
    rankButtonAnim: Animation = null;

    @property(Animation)
    scoreButtonAnim: Animation = null;

    @property(Animation)
    challengeButtonAnim: Animation = null;
    @property(Animation)
    skinButtonAnim: Animation = null;

    // @property(Node)
    // shineAnimNode: Node = null;

    @property(Node)
    guideHand: Node = null;


    @property(Sprite)
    classicPlayTimeIcon: Sprite = null;

    @property(Sprite)
    classicAdIcon: Sprite = null;

    @property(Sprite)
    classicShareIcon: Sprite = null;


    @property(Sprite)
    classicButtonCharSprite: Sprite = null;

    @property(Sprite)
    classicButtonContinueSprite: Sprite = null;
    @property(Sprite)
    classicButtonArrowSprite: Sprite = null;

    @property(Node)
    ttSideBar: Node = null;

    @property(Node)
    ttSideBarRedDot: Node = null;

    @property(Node)
    leaderBoardNode: Node = null;

    @property(Node)
    adventureRedPoint: Node = null;

    currentLeftTime: number = -1;

    private adFailLoadTimes: number = 0;
    private adGuanKaFailLoadTimes: number = 0;
    lastRetryTime: number;

    @property(Node)
    dailyChallengeRedDot: Node = null;

    private dailyChallengeUseDate: Date = new Date();
    @property(myWorkView)
    myWorkViewNode: myWorkView = null;

    @property(Node)
    btnRoot: Node = null;

    @property(Node)
    btnFireBlock: Node = null;

    accumluateTime: number = 0.01;
    pressedButton: boolean = false;
    inArea: boolean = false;

    UpdateOnceTrigger = false;

    @property(Label)
    newLevelNum: Label = null;

    @property(Button)
    testbutton: Button = null;

    @property(Label)
    blockRemains: Label = null;

    @property(Node)
    stageAdSign: Node = null;
    @property(Node)
    stageShareSign: Node = null;

    @property(Sprite)
    stageArrowSprite: Sprite = null;
    @property(Sprite)
    stageAdSprite: Sprite = null;

    @property(Node)
    adventurebtn: Node = null;
    @property(Node)
    adventurefinishedbtn: Node = null;

    @property(Node)
    scoreChallengeBtn: Node = null;

    touchStart() {
        this.pressedButton = true;
    }

    touchEnd() {
        this.pressedButton = false;
    }


    update(dt) {

        if (this.pressedButton == true) {
            this.accumluateTime += dt;
            if (this.accumluateTime > 0.03) {

                this.accumluateTime = 0;
                let retbool = this.myWorkViewNode.GetOneBlock(this.UpdateOnceTrigger);
                this.UpdateOnceTrigger = false;
                UserLevelData.inst.currLevelTotalBlocks--;
                if (UserLevelData.inst.currLevelTotalBlocks <= 0) {
                    UserLevelData.inst.currLevelTotalBlocks = 0;
                }
                this.blockRemains.string = UserLevelData.inst.currLevelTotalBlocks.toString();

                if (retbool == false) {
                    this.blockRemains.string = "0";
                    this.btnRoot.active = true;
                    this.btnFireBlock.active = false;
                    this.pressedButton = false;
                    if (UserLevelData.inst.isAllLevelFinished) {
                        this.myWorkViewNode.ShowOnlyMyWork(0);
                    }

                    this.adventureButtonAnim.stop()
                    this.classicButtonAnim.stop()
                    this.myWorkButtonAnim.stop()
                    this.advenmodeButtonAnim.stop()
                    this.rankButtonAnim.stop()
                    this.challengeButtonAnim.stop()
                    this.skinButtonAnim.stop()
                    this.scoreButtonAnim.stop()
                }

            }
        }
    }

    protected onLoad(): void {

        this.testbutton.node.on(Node.EventType.TOUCH_START, this.touchStart, this);
        this.testbutton.node.on(Node.EventType.TOUCH_END, this.touchEnd, this);


        // this.btnFireBlock.on(Node.EventType.TOUCH_START, this.touchStart, this);
        // this.btnFireBlock.on(Node.EventType.TOUCH_MOVE, this.touchEnd, this);
        // let isOpenLevel = UserData.inst.isCanShowLevelInHomeScene();
        // this.rootLevelInfo.active = isOpenLevel;
        // if (isOpenLevel) {
        //     let imageSpr = this.imgLevel.getComponent(Sprite);
        //     let levelTheme = UserCollectLevelData.inst.getLevelThemeName();
        //     let curLevel = UserCollectLevelData.inst.getHistoryLevel();
        //     let imageIndex = Math.floor(curLevel / 6 + 1);
        //     let imagePath = `res/level/${levelTheme}/${imageIndex}/spriteFrame`;
        //     imageSpr.spriteFrame = mk.subRes.loadAssetSync<SpriteFrame>(imagePath);
        //     if (this.labLevel) {
        //         this.labLevel.getComponent(Label).string = mk.i18n.lt("level") + curLevel;
        //     }
        // }
        //SdkCrossAdManager.getInstance().AddAd("list_play",this.node,new Vec3(0,0,0))


        if (env.BYTEDANCE) {
            this.leaderBoardNode.active = false;
            if (UserData.inst.getHasSideBar == true) {
                this.ttSideBar.active = true;
                this.ttSideBarRedDot.active = true;
                if (UserData.inst.getHasReceivedTtSideBarRewardToday()) {
                    this.ttSideBarRedDot.active = false;
                }
            } else {
                this.ttSideBar.active = false;
            }
            // console.log("ttsidebar before onshow");
            // // @ts-ignore
            // tt.onShow((res) => {//判断是否从侧边栏进入
            //     let isFromSideBar = (res.launch_from == 'homepage' && res.location == 'sidebar_card');
            //     if (isFromSideBar) {
            //         console.log("ttsidebar is FromSideBar");
            //         if (UserData.inst.getHasReceivedTtSideBarRewardToday()) {
            //             UserData.inst.setSideBarStatus = emttSideBarStatus.collected;
            //         } else {
            //             UserData.inst.setSideBarStatus = emttSideBarStatus.not_collected;
            //         }
            //     } else {
            //         console.log("ttsidebar not FromSideBar");
            //         // @ts-ignore
            //         tt.checkScene({
            //             scene: "sidebar",
            //             success: (res) => { UserData.inst.setSideBarStatus = emttSideBarStatus.go_side_bar },
            //             fail: (res) => { this.ttSideBar.active = false; }
            //         });

            //     }
            // })
        } else {
            this.ttSideBar.active = false;
        }
        mk.regEvent(BlockEventType.EVENT_TTSIDEBAR_REDDOT_STATUS, this.onSetSideBarRedDot, this);
        mk.regEvent(BlockEventType.EVENT_DAILY_CHALLENGE_REDDOT_STATUS, this.onSetDailyChallengeRedDot, this);
    }



    onDestroy() {
        //this.unschedule(this.updateCountdown);
        mk.unRegEvent(this);
    }

    start() {
        // this.labelVersion.string = LanguageManager.translateText("tip_version") + mk.buildInfo.bundle.block.version;
        // AdSdk.inst.showMainPageBannerAd();
        this.guideHand.active = false;
        Tween.stopAllByTarget(this.guideHand);
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_SHOW,
            () => {
                audioManager.instance.playMusic(true);
            },
            this
        );

        AdSdk.inst.hideMainPageBannerAd();
        //this.shineAnimNode.active = true;
        // this.bubbleAnimNode.active = false;
        if (mk.fsm.getData(ProcedureToHome, "defaultKey") == "loading") {
            mk.fsm.setData(ProcedureToHome, "defaultKey", null);
            //this.shineAnimNode.active = false;
            // this.bubbleAnimNode.active = true;

            audioManager.instance.playSoundWithCallback(
                AssetInfoDefine.audio.login_effect,
                () => {
                    audioManager.instance.changeMusic(AssetInfoDefine.audio.tmp_bgm, true);
                },
                3
            );

            // this.bubbleAnim.play();
            // this.classicButtonAnim.play();
            // this.adventureButtonAnim.play();

            // this.scheduleOnce(() => {
            //     //this.shineAnimNode.active = true;
            //     // this.bubbleAnimNode.active = false;
            //     //this.PlayAdventureHandGuide();
            // }, 1);
            // }, 1.333)
        } else {
            audioManager.instance.changeMusic(AssetInfoDefine.audio.tmp_bgm, true);
            this.scheduleOnce(() => {
                //this.PlayAdventureHandGuide();
            }, 1);
        }

        // 倒计时
        // let deadline = UserAdventureLevelData.inst.getBatchDeadlineData();
        // let countdownTime = deadline - new Date().getTime();
        // if (countdownTime < 0) {
        //     if (UserRemoteDataManager.inst.getseasonEndTimeStamp() !== null || UserRemoteDataManager.inst.getseasonEndTimeStamp() > 0) {
        //         countdownTime = UserRemoteDataManager.inst.getseasonEndTimeStamp();
        //     }
        // }
        // console.log("uploadAdventureModeDataToRemote, currentLeftTime : ", countdownTime);
        // UserRemoteDataManager.inst.uploadAdventureModeDataToRemote(countdownTime);
        // if (countdownTime > 0) {
        //     //this.startCountdown(countdownTime / 1000);
        //     this.countdownLabel.active = true;
        // } else {
        //     this.countdownLabel.active = false;
        // }
        //let group = ABTestManager.getInstance().getGroup(ABTestParam.AdventureGuide);
        //if (group == 1) {
        console.log("AB 测试组！");
        let state = UserData.inst.getHasEnteredAdventureToday();
        if (UserAdventureLevelData.inst.isAllLevelFinished == 1) {
            this.adventurebtn.active = false;
            this.adventurefinishedbtn.active = true;
        }
        // this.adventureRedPoint.active = !state;
        // } else {
        //     console.log("AB 非测试！");
        //     this.scheduleOnce(() => {
        //         this.PlayAdventureHandGuide();
        //     }, 1);
        //     this.adventureRedPoint.active = false;
        // }

        this.refreshBtnState();
        this.refreshGuanKaBtnState();
        //UserData
        let lastLoginVersion = UserData.inst.lastLoginVersion;
        if (lastLoginVersion != '' && lastLoginVersion != buildInfo.gameVersion) {
            //覆盖安装场景
            //如果这次打开游戏是新版本，清空当前关卡的存档，重新打当前关
            UserAdventureLevelData.inst.clearLevelHistoryData();
            UserLevelData.inst.clearLevelHistoryData();
            UserScoreLevelData.inst.clearLevelHistoryData();

            UserData.inst.lastLoginVersion = buildInfo.gameVersion;
            if (lastLoginVersion < "6.4.9") {
                let batchNum = UserAdventureLevelData.inst.getLevelBatchNumber();
                for (let i = 1; i < batchNum; i++) {
                    AlbumData.inst.setStageStickerStatus(i, emStageStickerStatus.obtained);
                }
            }
        }
        // this.scheduleOnce(() => {
        //     //每天首次登录提示获取锤子
        //     let maxGetHammer = UserHammerData.inst.getMaxItemCount();
        //     if (!UserData.inst.hasGotLoginReward && UserHammerData.inst.itemCount < maxGetHammer) {
        //         UserHammerData.inst.addItem(maxGetHammer, false);
        //         UserData.inst.hasGotLoginReward = true;
        //         PanelManager.inst.removeAllPopUpView();
        //         PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.loginReward.path);
        //     }
        // });
        this.scheduleOnce(() => {
            director.preloadScene("adventure_level_selectv2", () => { });
            director.preloadScene("game");
            // if (GuideData.inst.isGuideFinished()) {
            //     director.preloadScene("game");
            // }
        }, 3);
        this.scheduleOnce(() => {
            let prefabPath = AssetInfoDefine.prefab;
            NodePoolManager.initPool(prefabPath.adventure_btn.path, prefabPath.adventure_btn.bundle, 60);
            NodePoolManager.initPool(prefabPath.adventure_num_dark.path, prefabPath.adventure_num_dark.bundle, 60);
            NodePoolManager.initPool(prefabPath.adventure_num_normal.path, prefabPath.adventure_num_normal.bundle, 60);
        });

        this.newLevelNum.string = UserLevelData.inst.getHistoryLevel().toString();
        // director.preloadScene("adventure_level_select", () => {});
        if (mk.fsm.getData(ProcedureToHome, "defaultKey") == "levelPass") {
            mk.fsm.setData(ProcedureToHome, "defaultKey", null);
            //this.myWorkViewNode.clearNodes();
            this.btnRoot.active = false;
            this.UpdateOnceTrigger = true;
            this.btnFireBlock.active = true;
            this.blockRemains.string = UserLevelData.inst.currLevelTotalBlocks.toString();
            this.myWorkViewNode.ShowOnlyMyWork(UserLevelData.inst.getHistoryLevel() - 1, false);
        } else {
            //this.myWorkViewNode.clearNodes();
            this.myWorkViewNode.ShowOnlyMyWork(0);
        }

        if (UserData.inst.IsStageHasFreeAttempt(UserLevelData.inst.getHistoryLevel()) || UserData.inst.isStageGameOngoing) {
            this.stageAdSign.active = false;
            this.stageShareSign.active = false
            this.stageArrowSprite.node.active = true
        } else {
            this.refreshGuanKaBtnState();
        }

        if (UserLevelData.inst.isAllLevelFinished) {
            this.adventurebtn.active = false;
            this.adventurefinishedbtn.active = true;
        }

        let group = ABTestManager.getInstance().getGroup(ABTestParam.ScoreChallenge);
        if (group == 0) {
            this.scoreChallengeBtn.active = false;
        }
        if (!FlagData.inst.hasFlag("kFirstGameSubscribe")) {
            Global.popFirstGameSubscribe = true;
        }
        // this.initScoreChallengeData()

        this.adventureButtonAnim.play()
        this.classicButtonAnim.play()
        this.myWorkButtonAnim.play()
        this.advenmodeButtonAnim.play()
        this.rankButtonAnim.play()
        this.challengeButtonAnim.play()
        this.skinButtonAnim.play()
        this.scoreButtonAnim.play()
    }

    initScoreChallengeData() {
        if (!env.WECHAT) {
            return
        }
        let openid = UserData.inst.getOpenID()
        //@ts-ignore
        wx.cloud.init()
        //@ts-ignore
        wx.cloud.callFunction({
            name: 'get',
            data: {
                from_app_user_id: openid
            },
            success: res => {
                console.log("-----------------initScoreChallengeData:", res.result)
                UserData.inst.setScoreChallengeData(res.result)
            },
            fail: err => {
                console.error('获取三国冰河进度错误：', err)
            }
        })
    }

    onFireBlock() {
        // let retbool = this.myWorkViewNode.ProcessMyWorkWithAnim();
        // if (retbool == false) {
        //     this.btnRoot.active = true;
        //     this.btnFireBlock.active = false;
        // }
        // this.myWorkViewNode.ProcessMyWorkWithAnim(false);
        // this.btnRoot.active = true;
        // this.btnFireBlock.active = false;
    }

    refreshBtnState() {
        let freeTimes = UserData.inst.getClassicPlayNumToday;
        let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

        if (UserData.inst.isGameOngoing) {
            this.classicPlayTimeIcon.node.active = false;
            // this.classicButtonCharSprite.node.active = false;
            this.classicButtonArrowSprite.node.active = true;
            this.classicShareIcon.node.active = false;
            this.classicAdIcon.node.active = false;
            // this.classicButtonContinueSprite.node.active = true;
        } else {

            // this.classicButtonContinueSprite.node.active = false;

            if (freeTimes < maxFreeTimes) {
                this.classicButtonArrowSprite.node.active = true;
                this.classicShareIcon.node.active = false;
                this.classicAdIcon.node.active = false;
            } else if ((UserData.inst.getCanShareReplay() && UserData.inst.getAccountShareCount() > 0) || this.adFailLoadTimes > Global.maxAdBeforeShare) {
                this.classicButtonArrowSprite.node.active = false;
                this.classicShareIcon.node.active = true;
                this.classicAdIcon.node.active = false;
            } else {
                this.classicButtonArrowSprite.node.active = false;
                this.classicShareIcon.node.active = false;
                this.classicAdIcon.node.active = true;
            }
        }
        this.dailyChallengeRedDot.active = false;
        if (UserDailyChallengeData.inst.getChallengeProgressByDay(this.dailyChallengeUseDate.getDate()) != 1) {
            this.dailyChallengeRedDot.active = true;
        }
    }

    refreshGuanKaBtnState() {
        if (UserData.inst.isStageGameOngoing || UserData.inst.IsStageHasFreeAttempt(UserLevelData.inst.getHistoryLevel())) {
            this.stageAdSign.active = false;
            this.stageShareSign.active = false;
            this.stageArrowSprite.node.active = true;
        } else {

            this.stageArrowSprite.node.active = false;

            if (this.adGuanKaFailLoadTimes > Global.maxAdBeforeShare) {
                this.stageAdSign.active = false;
                this.stageShareSign.active = true;
            } else {
                this.stageAdSign.active = true;
                this.stageShareSign.active = false;
            }
        }
    }
    // timePass: number = 0;
    // protected lateUpdate(dt: number): void {
    //     this.timePass += dt;
    //     if (this.timePass > 5) {
    //         this.timePass = 0;
    //         //每隔两秒检测一次
    //         AdSdk.inst.hidePopBannerAd();
    //         AdSdk.inst.hideMainPageBannerAd();
    //     }
    // }
    onClickClassical() {
        if (!FlagData.inst.hasFlag("kFirstGameSubscribe")) {
            Global.popFirstGameSubscribe = true;
        }
        let time = Date.now();
        if (time - this.lastRetryTime < 2000) {
            ToastManager.getInstance().showToast("点击过快，请稍后");
            return;
        }
        this.lastRetryTime = time;


        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.endless;

        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_classic,
            proj_scene: emButtonScene.from_home,
        });

        let freeTimes = UserData.inst.getClassicPlayNumToday;
        let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

        if (freeTimes < maxFreeTimes || UserData.inst.isGameOngoing) {
            mk.fsm.changeState(ProcedureToGame, "block");
        } else if ((UserData.inst.tryShareReplay() && UserData.inst.getAccountShareCount() > 0) || this.adFailLoadTimes > Global.maxAdBeforeShare) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            let startTime = new Date().getTime();
            Util.shareMsg(
                randomShowOffNum,
                emSharePath.start_game,
                this,
                () => {
                    let endTime = new Date().getTime();
                    console.log("tryShareRevive start time = " + startTime);
                    console.log("tryShareRevive end time = " + endTime);
                    if ((endTime - startTime) > 2000) {
                        mk.fsm.changeState(ProcedureToGame, "block");
                        let count = UserData.inst.getAccountShareCount();
                        UserData.inst.setAccountShareCount(count - 1);
                    } else {
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);
                    }
                },
                {},
                () => {
                    console.log("failed to share");
                    Util.showShareFailedHint();
                    UserData.inst.setTryShareRePlayToday(0);
                    return;
                }
            );
            this.refreshBtnState();
        } else {
            // 打点广告_开始游戏
            let num = UserData.inst.getTodayWatchAdStartGameCount();
            UserData.inst.setTodayWatchAdStartGameCount(num + 1);
            mk.sdk.instance.reportBI(biEventId.ad_begin, {
                proj_scene: emScene.main_scene,
                proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                proj_ad_status: emAdStatus.WakeUp
            });
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Score_Relife)
                .then((res) => {
                    UserData.inst.setPlayClassicTimesToday();
                    mk.fsm.changeState(ProcedureToGame, "block");
                    mk.sdk.instance.reportBI(biEventId.ad_begin, {
                        proj_scene: emScene.main_scene,
                        proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                        proj_ad_status: emAdStatus.Finished
                    });
                })
                .catch((err: dtSdkError) => {
                    console.log("Failed to watch ads, reason: " + err.errMsg)
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {

                        mk.sdk.instance.reportBI(biEventId.ad_begin, {
                            proj_scene: emScene.main_scene,
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
                        proj_scene: emScene.main_scene,
                        proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                        proj_ad_status: emAdStatus.Error
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                    // TODO: emit event to trigger panel view
                    return;
                });
        }
        // console.log("[click_button] btn_click " + emButtonType.enter_classic + " " + emButtonScene.from_home)
    }
    onClickLevel() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;

        // console.log("[click_button] btn_click " + emButtonType.enter_adventure + " " + emButtonScene.from_home)
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_adventure,
            proj_scene: emButtonScene.from_home,
        });
        mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "block");
    }

    onClickSkin() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        // console.log("[click_button] btn_click " + emButtonType.enter_adventure + " " + emButtonScene.from_home)
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_skin,
            proj_scene: emButtonScene.from_home,
        });
        // mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "block");

        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.skinSelect.path)
    }



    onClickNewLevel() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        if (UserData.inst.isStageGameOngoing || UserData.inst.IsStageHasFreeAttempt(UserLevelData.inst.getHistoryLevel())) {

            console.log(" Stage Has Free Attempt");

            UserData.inst.isStageGameOngoing = true;
            UserData.inst.UseStageAttempt(UserLevelData.inst.getHistoryLevel());
            SceneMode.gameMode = kGameMode.level;
            mk.fsm.changeState(ProcedureToLevel, "block");
            return;
        }



        if ((UserData.inst.tryShareReplay() && UserData.inst.getAccountShareCount() > 0) || this.adGuanKaFailLoadTimes > Global.maxAdBeforeShare) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            Util.shareMsg(
                randomShowOffNum,
                emSharePath.start_game,
                this,
                () => {
                    let count = UserData.inst.getAccountShareCount();
                    UserData.inst.setAccountShareCount(count - 1);
                    UserData.inst.isStageGameOngoing = true;
                    SceneMode.gameMode = kGameMode.level;
                    mk.fsm.changeState(ProcedureToLevel, "block");
                },
                {},
                () => {
                    console.log("failed to share");
                    Util.showShareFailedHint();
                    UserData.inst.setTryShareRePlayToday(0);
                    return;
                }
            );
            this.refreshBtnState();
        } else {
            // 打点广告_开始游戏
            let num = UserData.inst.getTodayWatchAdStartGameCount();
            UserData.inst.setTodayWatchAdStartGameCount(num + 1);
            mk.sdk.instance.reportBI(biEventId.af_ad_levelmodebegin, {
                proj_scene: emScene.main_scene,
                proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                proj_ad_status: emAdStatus.WakeUp
            });
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Score_Relife)
                .then((res) => {
                    UserData.inst.isStageGameOngoing = true;
                    SceneMode.gameMode = kGameMode.level;
                    mk.fsm.changeState(ProcedureToLevel, "block");
                    mk.sdk.instance.reportBI(biEventId.af_ad_levelmodebegin, {
                        proj_scene: emScene.main_scene,
                        proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                        proj_ad_status: emAdStatus.Finished
                    });

                })
                .catch((err: dtSdkError) => {
                    console.log("Failed to watch ads, reason: " + err.errMsg)
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {

                        mk.sdk.instance.reportBI(biEventId.af_ad_levelmodebegin, {
                            proj_scene: emScene.main_scene,
                            proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                            proj_ad_status: emAdStatus.Closed
                        });
                        SdkManager.getInstance().native.showToast(
                            LanguageManager.translateText("tip_not_finish_watch")
                        );
                        // TODO: emit event to trigger panel view
                        return;
                    } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                        mk.sdk.instance.reportBI(biEventId.af_ad_levelmodebegin, {
                            proj_scene: emScene.main_scene,
                            proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                            proj_ad_status: emAdStatus.Error
                        });
                        this.adGuanKaFailLoadTimes += 1;
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                        this.refreshGuanKaBtnState();
                    }

                    // mk.sdk.instance.reportBI(biEventId.ad_begin, {
                    //     proj_scene: emScene.main_scene,
                    //     proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                    //     proj_ad_status: emAdStatus.Error
                    // });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                    // TODO: emit event to trigger panel view
                    return;
                });
        }

        // AdSdk.inst
        //     .showRewardVideoAd(emAdPath.Score_Relife)
        //     .then((res) => {
        //         UserData.inst.isStageGameOngoing = true;
        //         SceneMode.gameMode = kGameMode.level;
        //         //this.myWorkViewNode.clearNodes();
        //         mk.fsm.changeState(ProcedureToLevel, "block");

        //     })
        //     .catch((err: dtSdkError) => {
        //         console.log("Failed to watch ads, reason: " + err.errMsg)
        //         if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
        //             SdkManager.getInstance().native.showToast(
        //                 LanguageManager.translateText("tip_not_finish_watch")
        //             );
        //             return;
        //         }
        //         SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
        //         return;
        //     });
    }

    onClickDailyChallengeHome() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.daily_challenge,
            proj_scene: emButtonScene.from_home,
        });

        mk.fsm.changeState(ProcedureToDailyChallengeHome, "block");
    }


    onClickLeaderBoard() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_leaderboard,
            proj_scene: emButtonScene.from_home,
        });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.friendListRank.path);
    }

    onClickTtSideBar() {
        if (env.BYTEDANCE) {
            PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.ttSideBarView.path, UserData.inst.getSideBarStatus);
        }
    }

    onClickSticker() {
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_mysticker,
            proj_scene: emButtonScene.from_home,
        });

        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.albumBookView.path, { source: emEnterAlbumFrom.scene_home })
    }


    // in second
    startCountdown(countdownTime: number) {
        this.currentLeftTime = countdownTime;
        this.updateLabel();
        console.log("[startCountdown], this.currentLeftTime = ", this.currentLeftTime);
        this.schedule(this.updateCountdown, 1);
    }

    updateCountdown() {
        if (this.currentLeftTime > 0) {
            this.currentLeftTime--;
            this.updateLabel();
        } else {
            this.unschedule(this.updateCountdown);
            this.onCountdownEnd();
        }
    }

    updateLabel() {
        // if (this.countdownLabel) {
        //     let countDownLabel = this.countdownLabel.getComponent(Label);
        //     if (UserAdventureLevelData.inst.getLevelBatchNumber() == AdventureLevelConfigData.LevelTotalNumer) {
        //         countDownLabel.string = ""
        //     }
        //     else if (this.currentLeftTime > 86400) {
        //         // 显示天和小时
        //         const days = Math.floor(this.currentLeftTime / 86400);
        //         const hours = Math.floor((this.currentLeftTime % 86400) / 3600);
        //         countDownLabel.string = `剩余时间：${days}天${hours}时`;
        //     } else if (this.currentLeftTime > 3600) {
        //         // 显示小时和分钟
        //         const hours = Math.ceil(this.currentLeftTime / 3600);
        //         const minutes = Math.ceil((this.currentLeftTime % 3600) / 60);
        //         countDownLabel.string = `剩余时间：${hours}时${minutes}分`;
        //     } else {
        //         // 显示分钟
        //         const minutes = Math.ceil(this.currentLeftTime / 60);
        //         countDownLabel.string = `剩余时间：${minutes}分`;
        //     }
        // }
    }

    onCountdownEnd() {
        // 倒计时结束时的操作
        console.log("Countdown ended!");
        //this.countdownLabel.active = false;
        let finishState = UserAdventureLevelData.inst.isAllLevelFinished;
        if (finishState != 1) {
            AlbumData.inst.setStageStickerStatus(
                UserAdventureLevelData.inst.getLevelBatchNumber(),
                emStageStickerStatus.missed
            );
        }
        let deadline = UserAdventureLevelData.inst.getBatchDeadlineData();
        UserRemoteDataManager.inst.updateDataToRemote();
        // UserAdventureLevelData.inst.ResetBatch();
    }

    PlayAdventureHandGuide() {
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

    onSetSideBarRedDot(status) {
        this.ttSideBarRedDot.active = status;
    }

    onSetDailyChallengeRedDot(status) {
        this.dailyChallengeRedDot.active = status;
    }

    onEditTestDate(event) {
        const text = event.string;
        let dateNum = parseInt(text, 10);
        let year = Math.floor(dateNum / 10000);
        if (year < 2024 || year > 2030) {
            return;
        }

        dateNum = dateNum % 10000;
        let month = Math.floor(dateNum / 100);
        if (month < 1 || month > 12) {
            return;
        }

        let day = dateNum % 100;
        if (day < 1 || day > 31) {
            return;
        }

        this.dailyChallengeUseDate = new Date(year, month - 1, day);
        console.log("year: ", year, "month: ", month, "day: ", day)
        UserDailyChallengeData.inst.clearLevelHistoryData();
        UserDailyChallengeData.inst.setDate(this.dailyChallengeUseDate);

    }

    onEditCurrMonthFinishDays(event) {
        const text = event.string;
        let dateNum = parseInt(text, 10);
        if (dateNum < 0 || dateNum > 31) {
            return;
        }

        UserDailyChallengeData.inst.clearLevelHistoryData();
        UserDailyChallengeData.inst.reset(); // 清零
        UserDailyChallengeData.inst.resetSticker();
        for (let i = 0; i < dateNum; i++) {
            let month = UserDailyChallengeData.inst.getDate().getMonth();
            UserDailyChallengeData.inst.setChallengeProgress(month, i + 1, 1);
        }
    }
    onClickMyWork() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_mywork,
            proj_scene: emButtonScene.from_home,
        });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.myWorkShowView.path);
    }

    onClickScore() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.enter_score,
            proj_scene: emButtonScene.from_home,
        });
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.scoreChallenge.path);
    }


    // 测试工具
    onSetCurrLevel(event) {
        const text = event.string;
        const num = parseInt(text, 10);

        if (Number.isInteger(num) && num >= 1 && num <= 300) {
            UserLevelData.inst.updateHistoryLevel(num);
            this.newLevelNum.string = num.toString();
            UserAdventureLevelData.inst.clearLevelFinishdData();
            UserAdventureLevelData.inst.clearLevelHistoryData();
            this.myWorkViewNode.ShowOnlyMyWork(UserLevelData.inst.getHistoryLevel());
        }
        this.refreshGuanKaBtnState();
    }
}
