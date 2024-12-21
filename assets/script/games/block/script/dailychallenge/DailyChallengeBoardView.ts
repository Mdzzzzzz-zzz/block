import { _decorator, game, Node, UITransform, Animation, Button, Tween, tween, v3, animation } from "cc";
import { PREVIEW } from "cc/env";
import { mk } from "../../../../MK";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BoardView } from "../boardView/BoardView";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { BlockEventType } from "../define/Event";
import { AdventureLevelGame, emLevCondition } from "../logic/AdventureLevelGame";
import { PanelManager } from "../../../../panel/PanelManager";
import { kGameMode } from "../define/Enumrations";
import { AdSdk } from "../../../../sdk/AdSdk";
import { LevelScoreHelper } from "../logic/LevelScoreHelper";
import { FlagData } from "../../../../data/FlagData";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { UserRemoteData } from "../../../../data/UserRemoteData";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";
import { AdventureLevelBoardView } from "../LevelAdventure/AdventureLevelBoardView";
import { DailyChallengeLevelGame } from "../logic/DailyChallengeLevelGame";
import { AdventureLevelConditionViewScene } from "../LevelAdventure/AdventureLevelConditionViewScene";
import { AdventureLevelConditionView } from "../LevelAdventure/AdventureLevelConditionView";
import { SceneMode } from "../define/SceneMode";
import { biEventId } from "../../../../Boot";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { Game } from "../logic/Game";
const { ccclass, property } = _decorator;



@ccclass("DailyChallengeBoardViews")
export class DailyChallengeBoardView extends AdventureLevelBoardView {

    protected startGame() {
        super.startGame();
        let d = new Date();
        mk.sdk.instance.reportBI(biEventId.daily_start, {
            proj_level: d.getDate(),
            proj_month: d.getMonth() + 1,
            proj_star: UserDailyChallengeData.inst.getFinishedDays(),
        });
    }

    protected beforeStart() {
        this.gameManager = DailyChallengeLevelGame.levlInstance;
    }


    refreshCondition() {
        //刷新面板
        //刷新条件
        this.conditionView = this.rootConditionView.getComponent(AdventureLevelConditionViewScene);
        if (this.conditionView) {
            this.conditionView.initView(this.gameManager as DailyChallengeLevelGame);
        }

        this.conditionViewEnter = this.rootConditionViewEnter.getComponent(AdventureLevelConditionView);
        if (this.conditionViewEnter) {
            this.conditionViewEnter.initView(this.gameManager as DailyChallengeLevelGame);
        }
        if (!this.rootConditionViewEnter.active) {
            if (SceneMode.gameMode == kGameMode.endless) {
                this.rootConditionViewEnter.active = true;
            }
        }
    }
    showPassView(result: number) {

        let revivepath = AssetInfoDefine.prefab.revive2.path;
        let group = ABTestManager.getInstance().getGroup(ABTestParam.Revive3);
        if (group == 1) {
            revivepath = AssetInfoDefine.prefab.revive3.path;
        }

        let scoreHelper = this.gameManager.scoreHelper as LevelScoreHelper;
        if (result == 1) {
            Game.inst.canMoveBlock = false
            this.clearAllBlocks(()=>{
                this.showOverView(result);
                Game.inst.canMoveBlock = true
            })
        } else if (result == 2) {
            if (DailyChallengeLevelGame.levlInstance.isCanRevive()) {
                AdSdk.inst
                    .isRewardedVideoAvailable()
                    .then(() => {
                        PanelManager.inst.addPopUpView(revivepath, {
                            manager: DailyChallengeLevelGame.levlInstance,
                            onTimeFinish: () => {
                                this.showOverView(result);
                            },
                            holder: this,
                            mode: kGameMode.daily_challenge,
                            reviveTimes: DailyChallengeLevelGame.levlInstance.getReviveTimes(),
                            score: scoreHelper.score,
                            isEndless: false,
                        });
                    })
                    .catch(() => {
                        this.showOverView(result);
                    });
                return;
            }
            this.showOverView(result);
        }
    }

    protected showOverView(result: number) {
        let manager = this.gameManager as DailyChallengeLevelGame;
        let levelId = manager.getLevelId();
        if (result == 1) {
            let cfg = AssetInfoDefine.prefab.levelPassPre;
            PanelManager.inst.addPopUpView(cfg.path, { manager: manager, result: result, level: levelId });
        } else if (result == 2) {
            let cfg = AssetInfoDefine.prefab.levelOverPre;
            PanelManager.inst.addPopUpView(cfg.path, { manager: manager, result: result, level: levelId });
        }
    }

    public checkPropGuide() {

    }
    protected onRestartGame(isRetry: boolean): void {
        if (isRetry) {
            let d = new Date();
            mk.sdk.instance.reportBI(biEventId.daily_restart, {
                proj_level: d.getDate(),
                proj_month: d.getMonth() + 1,
                proj_star: UserDailyChallengeData.inst.getFinishedDays(),
            });
        }

        let d = new Date();
        mk.sdk.instance.reportBI(biEventId.daily_start, {
            proj_level: d.getDate(),
            proj_month: d.getMonth() + 1,
            proj_star: UserDailyChallengeData.inst.getFinishedDays(),
        });
        super.onRestartGame(isRetry);
    }
    onDestroy() {
        let d = new Date();
        mk.sdk.instance.reportBI(biEventId.daily_exit, {
            proj_level: d.getDate(),
            proj_month: d.getMonth() + 1,
            proj_star: UserDailyChallengeData.inst.getFinishedDays(),
        });
        super.onDestroy();
    }
}
