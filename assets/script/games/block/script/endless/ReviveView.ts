/*
 * @Date: 2023-05-22 10:44:08
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-20 21:04:30
 */
import { _decorator, Node, ProgressBar, Sprite, Label, SubContextView } from "cc";
import { AdSdk } from "../../../../sdk/AdSdk";
import { mk } from "../../../../MK";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import PanelBase from "../../../../panel/PanelBase";
import { UITweenBarComponent } from "../../../../tween/UITweenBarComponent";
import { Game } from "../logic/Game";
import { Animation } from "cc";
import { emAdStatus } from "../../../../define/BIDefine";
import { biEventId } from "../../../../Boot";
import { kGameMode } from "../define/Enumrations";
import { emAdPath } from "../../../../sdk/emAdPath";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { LevelGame } from "../logic/LevelGame";
import { AdventureLevelGame } from "../logic/AdventureLevelGame";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { emShareType, emSharePath } from "../../../../sdk/wechat/SocialDef";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { ResManager } from "../../../../resource/ResManager";
import { Util } from "../logic/Util";
import { UserData } from "../../../../data/UserData";
import { BlockEventType } from "../define/Event";
import * as env from "cc/env";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { ToastManager } from "../../../../toast/ToastManager";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";
import { DailyChallengeLevelGame } from "../logic/DailyChallengeLevelGame";
import { Global } from "db://assets/script/data/Global";
const { ccclass, property } = _decorator;

@ccclass("ReviveView")
export class ReviveView extends PanelBase<any> {

    @property(Sprite)
    reviveSign: Sprite = null;
    @property(Node)
    motivationText: Node = null;
    @property(Label)
    motivationTextStr: Label = null;
    @property(Label)
    remainReviveTimesStr: Label = null;

    protected manager: Game;
    protected onTimeFinish: Function;
    protected holder: any;
    protected mode: kGameMode;
    protected reviveTimes: number = 0;
    protected score: number = 0;
    protected isEndless: boolean = false;
    private scene: number = 2;
    private subViewKey: string;
    private abTestGroup: number = 0;

    private adFailLoadTimes: number = 0;


    @property(Node)
    subcontextView: Node = null;
    lastRetryTime: number;
    start(): void {
        super.start();
        let group = ABTestManager.getInstance().getGroup(ABTestParam.Revive3);
        if (group == 0) {
            this.subcontextView.getComponent(SubContextView).enabled = true;
            this.motivationText.active = false;
            if (this.isEndless) {
                this.subcontextView.active = true;
            } else {
                this.subcontextView.active = false;
            }
        }
        mk.sendEvent(BlockEventType.EVENT_SWITCH_SUB_CONTEXT_VIEW, false);


        // AdSdk.inst.showPopBannerAd();
        this.scheduleOnce(() => {
            this.refreshBtnState();
        }, 0.1);
        this.scene = 2; //2=经典对局界面
        if (this.mode == kGameMode.adventure_level) {
            this.scene = 3; //3=冒险对局界面 
            if (this.manager && (this.manager as AdventureLevelGame).checkIsLevelComplete()) {
                this.closeSelf();
                //复活检测是延迟检测 有可能误判 这里关闭下
                return;
            }
        } else if (this.mode == kGameMode.daily_challenge) {
            this.scene = 10; //3=冒险对局界面 
            if (this.manager && (this.manager as DailyChallengeLevelGame).checkIsLevelComplete()) {
                this.closeSelf();
                //复活检测是延迟检测 有可能误判 这里关闭下
                return;
            }
        } else if (this.mode == kGameMode.level) {
            console.log("打点 关卡模式 复活")
            this.scene = 14; // 关卡模式
        }
        mk.sdk.instance.reportBI(biEventId.ui_revive, {
            proj_revive_operate: 1,
            proj_scene: this.scene,
        });

        if (env.WECHAT && this.isEndless && group == 0) {
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
                        // @ts-ignore
                        wx.getOpenDataContext().postMessage({
                            event: this.subViewKey,
                            key: "score",
                            data: this.score,
                        });
                    } else {
                        // 主域逻辑
                        this.motivationText.active = true;
                        if (this.score < UserScoreLevelData.inst.getHighestScore()) {
                            let diff = UserScoreLevelData.inst.getHighestScore() - this.score;
                            this.motivationTextStr.string = "还差" + diff.toString() + "分打破纪录!";
                        } else {
                            this.motivationTextStr.string = "冲击历史最高分吧！";
                        }
                    }
                }
            })
        } else if (this.isEndless && group == 0) {
            this.motivationText.active = true;
            if (this.score < UserScoreLevelData.inst.getHighestScore()) {
                let diff = UserScoreLevelData.inst.getHighestScore() - this.score;
                this.motivationTextStr.string = "还差" + diff.toString() + "分打破纪录!";
            } else {
                this.motivationTextStr.string = "冲击历史最高分吧！";
            }
        }
        console.log("this.isEndless : ", this.isEndless);
        // if (this.isEndless == false && this.abTestGroup != 0) {
        //     this.motivationText.active = true;
        //     this.motivationTextStr.string = "马上过关啦！";
        // }

        if (this.isEndless == false && group == 0) {
            this.motivationText.active = true;
            this.motivationTextStr.string = "马上过关啦！";
        }

        if (this.isEndless == true && group == 0) {
            this.remainReviveTimesStr.string = "本局剩余" + (RemoteConfig.getInstance().ReviviTimesEndless - this.reviveTimes) + "次";
        } else {
            this.remainReviveTimesStr.string = "本局剩余" + (RemoteConfig.getInstance().ReviviTimesAdventure - this.reviveTimes) + "次";
        }
        // if (this.abTestGroup != 0) {
        //     if (this.isEndless == true) {
        //         this.remainReviveTimesStr.string = "本局剩余" + (RemoteConfig.getInstance().ReviviTimesEndless - this.reviveTimes) + "次";
        //     } else {
        //         this.remainReviveTimesStr.string = "本局剩余" + (RemoteConfig.getInstance().ReviviTimesAdventure - this.reviveTimes) + "次";
        //     }

        // }
    }
    protected refreshBtnState() {
        if ((UserData.inst.tryShareRevive(true) && UserData.inst.getAccountShareCount() > 0) || this.adFailLoadTimes > Global.maxAdBeforeShare) {
            // TODO： 加载分享图标
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    this.reviveSign.spriteFrame = sprite;
                });
        } else {
            // TODO:  加载看广告图标
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    if (this.reviveSign) {
                        this.reviveSign.spriteFrame = sprite;
                    }

                });
        }
    }
    protected onWillClose(): void {
        super.onWillClose();
        AdSdk.inst.hidePopBannerAd();
    }
    protected onSetData(value: any): void {
        this.manager = value.manager;
        this.onTimeFinish = value.onTimeFinish;
        this.holder = value.holder;
        this.mode = value.mode;
        this.reviveTimes = value.reviveTimes;
        this.score = value.score;
        this.isEndless = value.isEndless;
        this.abTestGroup = value.abTestGroup;

        // 代码控制均使用实验组数据
        this.subViewKey = "revive3";

        // if (this.abTestGroup == 0) {
        //     this.subViewKey = "revive";
        // } else {
        //     this.subViewKey = "revive3";
        // }
    }
    onClickClose() {
        mk.sdk.instance.reportBI(biEventId.ui_revive, {
            proj_revive_operate: 3,
            proj_scene: this.scene,
        });
        this.onTimeFinish.call(this.holder);
        this.playCloseAnim();
    }

    playCloseAnim() {
        let anim = this.getComponent(Animation);
        if (anim) {
            anim.play("ReviveView_exit_anim");
        }
        anim.once(
            Animation.EventType.FINISHED,
            () => {
                this.closeSelf();
            },
            this
        );
    }

    private isWatching: boolean = false;
    onClickRelife() {


        if (this.isWatching) {
            return;
        }
        mk.sdk.instance.reportBI(biEventId.ui_revive, {
            proj_revive_operate: 2,
            proj_scene: this.scene,
        });
        if (this.mode == kGameMode.adventure_level) {
            if (this.manager && (this.manager as LevelGame).checkIsLevelComplete()) {
                this.closeSelf();
                //复活检测是延迟检测 有可能误判 这里关闭下
                return;
            }
        }

        if ((UserData.inst.tryShareRevive(false) && UserData.inst.getAccountShareCount() > 0) || this.adFailLoadTimes > Global.maxAdBeforeShare) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            let startTime = new Date().getTime();
            WechatMiniApi.getInstance().showShare(
                randomShowOffNum,
                emSharePath.revive,
                this,
                () => {
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    this.manager.relifeCurrentLevel();
                    let count = UserData.inst.getAccountShareCount();
                    UserData.inst.setAccountShareCount(count - 1);
                    mk.sendEvent(BlockEventType.EVENT_HAMMER_TWO_BLOCKS);
                    mk.sendEvent(BlockEventType.EVENT_SWITCH_SUB_CONTEXT_VIEW, true);
                    this.playCloseAnim();
                },
                {},
                () => {
                    console.log("failed to share");
                    Util.showShareFailedHint();
                    UserData.inst.setTryShareReviveToday(1);
                    this.refreshBtnState();
                }
            );
            this.refreshBtnState();
            return;
        }
        mk.sdk.instance.reportBI(biEventId.ad_revivie, {
            proj_ad_status: emAdStatus.WakeUp,
            proj_scene: this.scene,
            proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
        });
        this.isWatching = true;
        AdSdk.inst
            .showRewardVideoAd(this.mode == kGameMode.adventure_level ? emAdPath.Level_Relife : emAdPath.Score_Relife)
            .then((res) => {
                this.isWatching = false;
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                this.manager.relifeCurrentLevel();
                mk.sendEvent(BlockEventType.EVENT_HAMMER_TWO_BLOCKS);
                mk.sendEvent(BlockEventType.EVENT_SWITCH_SUB_CONTEXT_VIEW, true);
                this.playCloseAnim();
                mk.sdk.instance.reportBI(biEventId.ad_revivie, {
                    proj_ad_status: emAdStatus.Finished,
                    proj_scene: this.scene,
                    proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
                });
                let num = UserData.inst.getThisGameWatchReviveNum();
                UserData.inst.setThisGameWatchReviveNum(num + 1);
            })
            .catch((err: dtSdkError) => {
                console.log("复活界面 Failed to watch ads, reason: " + err.errMsg)
                this.isWatching = false;
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    mk.sdk.instance.reportBI(biEventId.ad_revivie, {
                        proj_ad_status: emAdStatus.Closed,
                        proj_scene: this.scene,
                        proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                    return;
                } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                    this.adFailLoadTimes += 1;
                    this.refreshBtnState();
                }
                mk.sdk.instance.reportBI(biEventId.ad_revivie, {
                    proj_ad_status: emAdStatus.Error,
                    proj_scene: this.scene,
                    proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
                });
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }

    closeSelf() {
        let group = ABTestManager.getInstance().getGroup(ABTestParam.Revive3);
        if (group == 0) {
            this.subcontextView.getComponent(SubContextView).enabled = false;
            if (env.WECHAT) {
                //更新当前的分数
                // @ts-ignore
                wx.getOpenDataContext().postMessage({
                    event: "clear",
                });
            }
        }

        super.closeSelf();
    }
}
