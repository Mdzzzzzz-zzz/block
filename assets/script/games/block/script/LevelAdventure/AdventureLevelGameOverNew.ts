

import { _decorator, Node, Label, Animation, Sprite } from "cc";
import { AdventureLevelGame, emLevCondition } from "../logic/AdventureLevelGame";
import { mk } from "../../../../MK";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { AdventureLevelConditionView } from "./AdventureLevelConditionView";
import { emSceneName } from "../scene/SceneDefine";
import { SceneManager } from "../scene/SceneManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { AdSdk } from "../../../../sdk/AdSdk";
import { ProcedureToAdventureLevelSelectV2 } from "../../../../fsm/state/ProcedureToAdventureLevelSelectV2";
import PanelBase from "../../../../panel/PanelBase";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { emSharePath, emShareType } from "../../../../sdk/wechat/SocialDef";
import { biEventId } from "../../../../Boot";
import { BIEventID, emAdStatus, emButtonScene, emButtonType, emScene } from "../../../../define/BIDefine";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { FlagData } from "../../../../data/FlagData";
import { UserData } from "../../../../data/UserData";
import { Util } from "../logic/Util";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { ResManager } from "../../../../resource/ResManager";
import { emAdPath } from "../../../../sdk/emAdPath";
import { ToastManager } from "../../../../toast/ToastManager";
import * as env from "cc/env"
import { UserLevelData } from "db://assets/script/data/UserLeveData";
import { ProcedureToHome } from "db://assets/script/fsm/state/ProcedureToHome";
import { Global } from "db://assets/script/data/Global";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelGameOverNew")
export default class AdventureLevelGameOverNew extends PanelBase<{ manager: any; result: number }> {
    @property(Node)
    rootConditionView: Node = null;



    private adFailLoadTimes: number = 0;
    private lastRetryTime: number = 0;

    manager: AdventureLevelGame;
    private result: number = 0;


    @property(Label)
    stageNumberLabel: Label = null;

    @property(Node)
    adSign: Node = null;

    @property(Sprite)
    adSignSprite: Sprite = null;

    start(): void {
        super.start();
        AdSdk.inst.hideMainPageBannerAd();
        AdSdk.inst.showPopBannerAd();


        let level = UserLevelData.inst.getHistoryLevel();
        if (level > 5) {
            // if (level < 20) {
            //     if ((level % 2 == 1)) {
            //         AdSdk.inst.showInsterstital("AdventureLevelGameOverNew");
            //     }
            // } else {
            //     AdSdk.inst.showInsterstital("AdventureLevelGameOverNew");
            // }
            AdSdk.inst.showInsterstital("AdventureLevelGameOverNew");
        }

        if (FlagData.inst.hasFlag("jump_ad_instertital_level")) {
            AdSdk.inst.showInsterstital("AdventureLevelGameOver");
        } else {
            FlagData.inst.recordFlag("jump_ad_instertital_level");
        }
        // let animation = this.getComponent(Animation);
        // animation.play("LevelGameOverView_enter");

        // if (UserLevelData.inst.getHistoryLevel() > 5) {
        //     this.adSign.active = true;
        // } else {
        //     this.adSign.active = false;
        // }
        if (UserLevelData.inst.getHistoryLevel() > 5) {
            this.adSign.active = true;
        } else {
            this.adSign.active = false;
        }
        this.stageNumberLabel.string = UserLevelData.inst.getHistoryLevel().toString();

        UserData.inst.isGameOngoing = false;
        UserData.inst.UseStageAttempt(UserLevelData.inst.getHistoryLevel());
        UserData.inst.isStageGameOngoing = false;
    }



    protected onSetData(value: { manager: any; result: number }): void {
        (this.manager = value.manager), (this.result = value.result);
        this.initView(this.manager, this.result);
    }
    /**
     *
     * @param manager
     * @param result 1 成功 2 失败 3 暂停
     */
    initView(manager: AdventureLevelGame, result: number) {
        this.manager = manager;
        let conditionView = this.rootConditionView.getComponent(AdventureLevelConditionView);
        if (conditionView) {
            conditionView.SetFromGameOver(true);
            conditionView.initView(manager);
        }


        this.rootConditionView.active = true;

        this.result = result;
        //根据过关结果设置推荐参数
        //用于推荐的计算
        const scoreInfo = mk.getItem("level_action_info", { score: 0, playCount: 0 });
        // 未达到最大分数
        if (result == 2) {
            //失败了
            scoreInfo.playCount++;
            mk.setItem("level_action_info", scoreInfo);

            // let anim = this.node.getComponent(Animation);
            // if (this.manager.conditionType == emLevCondition.Score) {
            //     anim.play("LevelGameOver_score_anim");
            // } else {
            //     anim.play("LevelGameOver_diamond_anim");
            // }
        }
    }
    onClickNextLevel() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        this.manager.gotoNextLevel();
        this.closeSelf();
    }
    onClickClose() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToHome, "block");
        this.closeSelf();
    }
    refreshBtnState() {
        if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    this.adSignSprite.node.active = true;
                    this.adSignSprite.spriteFrame = sprite;
                });
        } else {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    this.adSignSprite.node.active = true;
                    this.adSignSprite.spriteFrame = sprite;
                });
        }

    }
    onClickRetry() {



        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        // console.log("[click_button] btn_click " + emButtonType.click_adventrue_rechallenge + " " + emButtonScene.from_adventrue_fail)

        if (UserLevelData.inst.getHistoryLevel() > 5) {


            if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                let randomShowOffNum = Util.generateRandomShowOffShare();
                let startTime = new Date().getTime();
                Util.shareMsg(
                    randomShowOffNum,
                    emSharePath.start_game,
                    this,
                    () => {
                        this.manager.retryCurrentLevel();
                        this.closeSelf();
                        UserData.inst.isStageGameOngoing = true;
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
                AdSdk.inst
                    .showRewardVideoAd(emAdPath.Score_Relife)
                    .then((res) => {
                        this.manager.retryCurrentLevel();
                        this.closeSelf();
                        UserData.inst.isStageGameOngoing = true;
                    })
                    .catch((err: dtSdkError) => {
                        console.log("dtSdkError ", JSON.stringify(err));
                        if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {

                            SdkManager.getInstance().native.showToast(
                                LanguageManager.translateText("tip_not_finish_watch")
                            );
                            mk.sdk.instance.reportBI(biEventId.af_ad_levelbegin, {
                                proj_scene: emScene.adventure_level_game_over,
                                proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                                proj_ad_status: emAdStatus.Closed
                            });
                            // TODO: emit event to trigger panel view
                            return;
                        } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                            this.adFailLoadTimes += 1;
                            this.refreshBtnState();
                            mk.sdk.instance.reportBI(biEventId.af_ad_levelbegin, {
                                proj_scene: emScene.adventure_level_game_over,
                                proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                                proj_ad_status: emAdStatus.Error
                            });
                        }
                    });
            }
        } else {
            this.manager.retryCurrentLevel();
            this.closeSelf();
        }

    }
    onClickHome() {
        //放弃复活返回主界面
        // this.isNeedClearing = true;
        // SceneMode.gameMode = kGameMode.none;
        // mk.subRes.loadScene("home").then();
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        if (this.manager.checkIsLevelComplete()) {
            SceneMode.gameMode = kGameMode.none;
            this.manager.clearLevelHistoryData();
            SceneManager.inst
                .gotoScene(emSceneName.Home, "block")
                .then(() => { })
                .catch(() => { });
        } else {
            /**
             * 没完成是否放弃复活
             */
            const param = {
                content: LanguageManager.translateText("tip_give_up"),
                title: LanguageManager.translateText("tip_tittle"),
                cancelBtnLabel: LanguageManager.translateText("btn_super"),
                confirmBtnLabel: LanguageManager.translateText("btn_cancel"),
                confirmCallback: () => {
                    SceneMode.gameMode = kGameMode.none;
                    this.manager.clearLevelHistoryData();
                    SceneManager.inst
                        .gotoScene(emSceneName.Home, "block")
                        .then(() => { })
                        .catch(() => { });
                    this.closeSelf();
                },
                cancelCallback: () => {
                    // this.onClickRelife();
                },
            };
            mk.showView(mk.uiCfg.prefab.dialog, null, param);
        }
    }
    onClickRelife() {
        AdSdk.inst
            .showRewardVideoAd("level_relife")
            .then((res) => {
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                this.manager.relifeCurrentLevel();
                this.closeSelf();
            })
            .catch((err: dtSdkError) => {
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    return;
                }
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }
    onClickLevelSelect() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "block");
        this.closeSelf();
    }
    onClickShare() {
        let randProp = Math.random();
        if (randProp < 0.25) {
            Util.shareMsg(emShareType.s_10001, emSharePath.revive, this, null);
        } else if (randProp < 0.5) {
            Util.shareMsg(emShareType.s_10002, emSharePath.revive, this, null);
        } else if (randProp < 0.75) {
            Util.shareMsg(emShareType.s_10003, emSharePath.revive, this, null);
        } else {
            Util.shareMsg(emShareType.s_10004, emSharePath.revive, this, null);
        }
    }
    onClickHelp() {
        Util.shareMsg(emShareType.s_10003, emSharePath.revive, this, null);
    }
    onWillClose(): void {
        super.onWillClose();
        AdSdk.inst.hidePopBannerAd();
        // AdSdk.inst.showMainPageBannerAd();
        // if (this.result == 2) {
        //     //失败退出的话直接清理关卡数据
        //     if (this.manager) {
        //         this.manager.clearLevelHistoryData();
        //     }
        // }
    }

    wxShareResumeGame() {
        if (env.PREVIEW || env.EDITOR || env.WECHAT) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            let startTime = new Date().getTime();
            Util.shareMsg(
                randomShowOffNum,
                emSharePath.start_game,
                this,
                () => {
                    let endTime = new Date().getTime();
                    mk.sdk.instance.reportBI(BIEventID.btn_click, {
                        proj_btn_type: emButtonType.click_adventrue_rechallenge,
                        proj_scene: emButtonScene.from_adventrue_fail,
                    });
                    if ((endTime - startTime) > 2000) {
                        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                        this.manager.retryCurrentLevel();
                        this.closeSelf();
                    } else {
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);

                    }
                },
                {},
                () => {
                    Util.showShareFailedHint();
                    UserData.inst.setTryShareRePlayToday(0);

                    return;
                }
            );
        } else {

        }

    }
}
