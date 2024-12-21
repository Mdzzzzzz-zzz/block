import { _decorator, Node, Label, Sprite, AnimationClip, Animation } from "cc";
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
import { BIEventID, emAdStatus, emButtonScene, emButtonType } from "../../../../define/BIDefine";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { FlagData } from "../../../../data/FlagData";
import { Global } from "../../../../data/Global";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { UserCollectLevelData } from "../../../../data/UserCollectLevelData";
import { Util } from "../logic/Util";
import { UserRemoteData } from "../../../../data/UserRemoteData";
import { UserHammerData } from "../../../../data/UserHammerData";
import { UserVRocketData } from "../../../../data/UserVRocketData";
import { UserHRocketData } from "../../../../data/UserHRocketData";
import { UserChangeData } from "../../../../data/UserChangeData";
import { UserRemoteDataManager } from "../../../../data/UserRemoteDataManager";
import { ProcedureToEntryGuide } from "../../../../fsm/state/ProcedureToEntryGuide";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelGamePass")
export default class AdventureLevelGamePass extends PanelBase<{ manager: any; result: number }> {
    @property(Node)
    rootConditionView: Node = null;
    @property(Node)
    diamondRewardBg: Node = null;

    @property(Node)
    ScoreSuccSprite: Node = null;
    @property(Label)
    ScoreSuccNum: Label = null;

    @property(Sprite)
    normalBg: Sprite = null;

    @property(Sprite)
    hardGameBg: Sprite = null;

    @property(Sprite)
    nextLevelSprite: Sprite = null;

    @property(Sprite)
    backHomeSprite: Sprite = null;

    @property(Node)
    scoreImageNode: Node = null;

    @property(Node)
    logoEffectNode: Node = null;

    @property(Node)
    returnHomeButtonNode: Node = null;

    manager: AdventureLevelGame;
    private result: number = 0;
    start(): void {
        super.start();
        AdSdk.inst.hideMainPageBannerAd();
        AdSdk.inst.showPopBannerAd();
        let level = UserAdventureLevelData.inst.getHistoryLevel();
        if (level > 5) {
            // if (level < 21){
            //     if( (level % 2 == 1)){
            //         AdSdk.inst.showInsterstital("AdventureLevelGamePass");
            //     }
            // } else {
            //     AdSdk.inst.showInsterstital("AdventureLevelGamePass");
            // }
            AdSdk.inst.showInsterstital("AdventureLevelGamePass");
        }
        this.logoEffectNode.active = false;
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
            conditionView.initView(manager);
        }
        if (this.diamondRewardBg) {
            this.diamondRewardBg.active = false;
        }

        this.rootConditionView.active = true;
        if (this.manager.conditionType == emLevCondition.Collect) {
            if (this.diamondRewardBg) {
                this.diamondRewardBg.active = true;
            }
            this.scoreImageNode.active = false;
        } else {
            this.scoreImageNode.active = true;
        }
        this.result = result;
        let hammerItemNum = UserHammerData.inst.itemCount;
        let vRocket = UserVRocketData.inst.itemCount;
        let hRocket = UserHRocketData.inst.itemCount
        let refresh = UserChangeData.inst.itemCount
        UserRemoteDataManager.inst.setstickerStatus();
        //console.log("hammerItemNum", hammerItemNum, "vRocket", vRocket, "hRocket", hRocket, "refresh", refresh);
        UserRemoteDataManager.inst.setUserItemData(hammerItemNum, vRocket, hRocket, refresh);
        UserRemoteDataManager.inst.updateDataToRemote();

        //根据过关结果设置推荐参数
        //用于推荐的计算
        const scoreInfo = mk.getItem("level_action_info", { score: 0, playCount: 0 });
        // 未达到最大分数
        if (result == 2) {
            //失败了
            scoreInfo.playCount++;
            mk.setItem("level_action_info", scoreInfo);
        } else if (result == 1) {
            let anim = this.node.getComponent(Animation);
            const clips = anim.clips;
            if (this.manager.conditionType == emLevCondition.Score) {
                this.rootConditionView.active = false;
                if (this.ScoreSuccSprite) {
                    this.ScoreSuccSprite.active = true;
                    this.ScoreSuccNum.string = this.manager.targetScore.toString();
                }
                if (clips.length == 2) {
                    // 播放第一个动画剪辑
                    anim.play(clips[1].name);
                    setTimeout(() => {
                        this.logoEffectNode.active = true;
                    }, 167)
                }
            } else {
                anim.play(clips[0].name);
                setTimeout(() => {
                    this.logoEffectNode.active = true;
                }, 167)
            }
            scoreInfo.playCount = 0;
            scoreInfo.score = 0;
            mk.setItem("level_action_info", scoreInfo);
            mk.setItem("Level_Passed_Last", {
                af_adventure_name: UserCollectLevelData.inst.getLevelThemeName(),
                af_adventure_level: manager.levelConfig.id,
            });
        }

        if (Global.LevelSelectBoard) {
            let stage = UserAdventureLevelData.inst.getLevelBatchNumber();
            if (Global.LevelSelectBoard.has(stage)) {
                let stageConfigMap = Global.LevelSelectBoard.get(stage);

                if (result == 2) return;

                if (UserAdventureLevelData.inst.isAllLevelFinished == 1) {

                    this.backHomeSprite.node.active = true;
                    this.nextLevelSprite.node.active = false;
                    this.returnHomeButtonNode.active = false;
                    return;
                } else {
                    this.backHomeSprite.node.active = false;
                    this.nextLevelSprite.node.active = true;
                    this.returnHomeButtonNode.active = true;
                }


                let level = UserAdventureLevelData.inst.getHistoryLevel();
                let levelSelectConfig = null;

                stageConfigMap.forEach((value, key) => {
                    if (value.level == level) {
                        levelSelectConfig = value;
                        return;
                    }
                })

                if (levelSelectConfig) {
                    if (!levelSelectConfig.isHard) {
                        this.normalBg.node.active = true;
                        this.hardGameBg.node.active = false;
                    } else {
                        this.normalBg.node.active = false;
                        this.hardGameBg.node.active = true;
                    }
                }
            }
        }
        // let times = FlagData.inst.getTimes(BIEventID.af_adventuregame);
        // mk.sdk.instance.reportAf(BIEventID.af_adventuregame, {
        //     af_adventure_name: UserCollectLevelData.inst.getLevelThemeName(),
        //     af_adventure_result: result == 1 ? 0 : 1,
        //     af_adventure_level: manager.levelConfig.id,
        //     af_adventure_times: times,
        // },true);
        // FlagData.inst.recordTimes(BIEventID.af_adventuregame);
    }

    onClickNextLevel() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        // 首先检查是否需要展示新手引导
        if (UserAdventureLevelData.inst.firstStartBatchOneLevelTwo == 0 && UserAdventureLevelData.inst.getHistoryLevel() == 2 && this.manager.batch == 1) {
            this.closeSelf();
            mk.fsm.changeState(ProcedureToEntryGuide, { source: "adventure_level_select", batch: this.manager.batch });
            return;
        }

        // console.log("[click_button] btn_click " + emButtonType.click_adventure_next_level + " " + emButtonScene.from_adventure_pass)
        if (UserAdventureLevelData.inst.isAllLevelFinished == 1) {
            this.closeSelf();
            mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, { finished: true, batch: this.manager.batch });
        } else {
            mk.sdk.instance.reportBI(BIEventID.btn_click, { proj_btn_type: emButtonType.click_adventure_next_level, proj_scene: emButtonScene.from_adventure_pass })
            this.manager.gotoNextLevel();
            this.closeSelf();
        }
    }
    onClickRetry() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        // console.log("[click_button] btn_click " + emButtonType.click_adventrue_rechallenge + " " + emButtonScene.from_adventrue_fail)
        mk.sdk.instance.reportBI(BIEventID.btn_click, { proj_btn_type: emButtonType.click_adventrue_rechallenge, proj_scene: emButtonScene.from_adventrue_fail })
        this.manager.retryCurrentLevel();
        this.closeSelf();
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
    onClickLevelSelect() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        if (UserAdventureLevelData.inst.isAllLevelFinished == 1) {
            SceneMode.gameMode = kGameMode.none;
            mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "finished");
            this.closeSelf();
        } else {
            mk.fsm.changeState(ProcedureToAdventureLevelSelectV2, "block");
            this.closeSelf();
        }

    }
    onClickShare() {
        let randProp = Math.random();
        if (randProp < 0.25) {
            Util.shareMsg(emShareType.s_10001, emSharePath.start_game, this, null);
        } else if (randProp < 0.5) {
            Util.shareMsg(emShareType.s_10002, emSharePath.start_game, this, null);
        } else if (randProp < 0.75) {
            Util.shareMsg(emShareType.s_10003, emSharePath.start_game, this, null);
        } else {
            Util.shareMsg(emShareType.s_10004, emSharePath.start_game, this, null);
        }
    }
    onClickHelp() {
        Util.shareMsg(emShareType.s_10003, emSharePath.start_game, this, null);
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
}
