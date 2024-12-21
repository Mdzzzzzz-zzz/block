import { _decorator, Node } from "cc";
import { PREVIEW } from "cc/env";
import { mk } from "../../../../MK";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BoardView } from "../boardView/BoardView";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { BlockEventType } from "../define/Event";
import { LevelGame } from "../logic/LevelGame";
import { LevelConditionView } from "./LevelConditionView";
import { PanelManager } from "../../../../panel/PanelManager";
import { emComboState } from "../logic/ScoreHelper";
import { biEventId } from "../../../../Boot";
import { UserCollectLevelData } from "../../../../data/UserCollectLevelData";
import { kGameMode } from "../define/Enumrations";
import { AdSdk } from "../../../../sdk/AdSdk";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { Vec3 } from "cc";
import { UserData } from "../../../../data/UserData";
import { emRedPointKeys } from "../../../../redpoint/RedPointDef";
import { RedPointManager } from "../../../../redpoint/RedPointManager";
import { LevelScoreHelper } from "../logic/LevelScoreHelper";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { Game } from "../logic/Game";

const { ccclass, property } = _decorator;

@ccclass("LevelBoardView")
export class LevelBoardView extends BoardView {
    @property(Node)
    rootConditionView: Node = null;
    conditionView: LevelConditionView;
    @property(Node)
    rootConditionViewEnter: Node = null;
    conditionViewEnter: LevelConditionView;
    protected startGame() {
        super.startGame();
        this.refreshCondition();
        mk.sdk.instance.reportBI(biEventId.level_start, {
            level: UserCollectLevelData.inst.getHistoryLevel(),
            theme: UserCollectLevelData.inst.getLevelThemeName(),
        });
    }
    onLoad(): void {
        super.onLoad();
        BlockEventManager.instance
            .listen(BlockEventType.EVENT_SCENE_PLAY_LEVEL_NEXT, this.onLevelChange, this)
            .listen(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, this.showPassView, this);
        mk.sdk.instance.reportBI(biEventId.level_enter, {
            level: UserCollectLevelData.inst.getHistoryLevel(),
            theme: UserCollectLevelData.inst.getLevelThemeName(),
        });

        RedPointManager.getInstance().removePoint(emRedPointKeys.UnclockLevel);
    }
    refreshCondition() {
        //刷新面板
        //刷新条件
        this.conditionView = this.rootConditionView.getComponent(LevelConditionView);
        if (this.conditionView) {
            this.conditionView.initView(this.gameManager as LevelGame);
        }

        this.conditionViewEnter = this.rootConditionViewEnter.getComponent(LevelConditionView);
        if (this.conditionViewEnter) {
            this.conditionViewEnter.initView(this.gameManager as LevelGame);
        }
        if (!this.rootConditionViewEnter.active) {
            this.rootConditionViewEnter.active = true;
        }
    }
    onLevelChange() {
        this.refreshBoardView(this.gameManager.tableData);
        this.refreshCondition();
    }
    protected onRestartGame(isRetry: boolean): void {
        UserData.inst.setThisGameWatchReviveNum(1);
        super.onRestartGame(isRetry);
        //刷新盘面信息
        PanelManager.inst.removeAllPopUpView();
        this.onLevelChange();
        let level_history = UserCollectLevelData.inst.getHistoryLevel();
        let theme_name = UserCollectLevelData.inst.getLevelThemeName();
        if (isRetry) {
            mk.sdk.instance.reportBI(biEventId.level_restart, {
                level: level_history,
                theme: theme_name,
            });
        }
        mk.sdk.instance.reportBI(biEventId.level_start, { level: level_history, theme: theme_name });
    }

    onDestroy() {
        BlockEventManager.instance
            .unlisten(BlockEventType.EVENT_SCENE_PLAY_LEVEL_NEXT, this.onLevelChange, this)
            .unlisten(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, this.showPassView, this);
        if (this.gameManager) {
            mk.sdk.instance.reportBI(biEventId.level_exit, {
                level: UserCollectLevelData.inst.getHistoryLevel(),
                theme: UserCollectLevelData.inst.getLevelThemeName(),
                round: this.gameManager.getRound(),
            });
        }

        super.onDestroy();
        // LevelGame.destroy();
    }
    protected getDelayStartTime(): number {
        return 0.33;
    }
    protected beforeStart() {
        this.gameManager = LevelGame.levlInstance;
    }

    // onBtnGoEndless() {
    //     SceneMode.gameMode = kGameMode.endless;
    //     mk.subRes.loadScene("game").then();
    // }
    /***
     * 先行后列的消除顺序  避免重复计算
     */
    private clearnDiamonMap: Map<number, number>;
    protected onBeforeClearBlock() {
        this.clearnDiamonMap = new Map<number, number>();
    }
    protected onClearBlockEntity(row: number, col: number, blockType: number) {
        super.onClearBlockEntity(row, col, blockType);
        let key = row * 100 + col;
        if (!this.clearnDiamonMap.has(key)) {
            if (blockType > this.gameManager.diamonTypeStart) {
                if (PREVIEW) {
                    console.log("消除了宝石：", row, col, blockType);
                }
                let manager = this.gameManager as LevelGame;
                if (this.conditionView) {
                    let cur = manager.currentCollects.get(blockType);
                    let tar = manager.targetCollects.get(blockType);
                    if (cur < tar) {
                        manager.collectItem(blockType, 1);
                        cur = manager.currentCollects.get(blockType);
                        let entity = this.blockMap.get(key);
                        if (entity) {
                            this.conditionView.setCollectFly(
                                entity.node,
                                blockType,
                                cur,
                                tar,
                                () => {
                                    manager.checkIsLevelComplete();
                                },
                                this
                            );
                        } else {
                            this.conditionView.setCollect(blockType, cur, tar);
                            manager.checkIsLevelComplete();
                        }
                    }
                }
                this.clearnDiamonMap.set(key, blockType);
            }
        }
    }
    protected refreshCombo(comboState: emComboState): void { }
    protected showComboAni(show: boolean): void { }
    protected onAfterClearBlockAnim(clearNumber: number, comboState: emComboState) {
        super.onAfterClearBlockAnim(clearNumber, comboState);
        this.clearnDiamonMap = null;
    }
    protected onGameOver(): void {
        super.onGameOver();
        //关卡结束了不用弹出复活界面
        if ((this.gameManager as LevelGame).checkIsLevelComplete()) {
            return;
        }
        BlockEventManager.instance.emit(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, 2);
    }
    // private gamePassNode: Node;
    //完成当前关卡 1 成功 2 失败 3 暂停
    showPassView(result: number) {
        // if (this.gamePassNode && this.gamePassNode.isValid) {
        //     return;
        // }
        // let inst = UserCollectLevelData.inst;
        let scoreHelper = this.gameManager.scoreHelper as LevelScoreHelper;
        if (result == 1) {
            // this.showOverView(result);
            Game.inst.canMoveBlock = false
            this.clearAllBlocks(()=>{
                this.showOverView(result);
                Game.inst.canMoveBlock = true
            })
        } else if (result == 2) {
            let group = ABTestManager.getInstance().getGroup(ABTestParam.Revive);
            let revivepath = AssetInfoDefine.prefab.revive.path;
            // if (group == 1) {
            //     revivepath = AssetInfoDefine.prefab.revivewithouthammer.path;
            // } else if (group == 2) {
            //     revivepath = AssetInfoDefine.prefab.reviveold.path;
            // }

            revivepath = AssetInfoDefine.prefab.revive3.path;
            let group2 = 1;
            // let group2 = ABTestManager.getInstance().getGroup(ABTestParam.Revive2);
            // if (group2 == 1) {
            //     revivepath = AssetInfoDefine.prefab.revive3.path;
            // } 
            if (LevelGame.levlInstance.isCanRevive()) {
                AdSdk.inst
                    .isRewardedVideoAvailable()
                    .then(() => {
                        PanelManager.inst.addPopUpView(revivepath, {
                            manager: LevelGame.levlInstance,
                            onTimeFinish: () => {
                                this.showOverView(result);
                            },
                            holder: this,
                            mode: kGameMode.level,
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
        let inst = UserCollectLevelData.inst;
        let manager = this.gameManager as LevelGame;
        let levelId = manager.getLevelId();
        if (result == 1) {
            let cfg = AssetInfoDefine.prefab.levelPassPre;
            PanelManager.inst.addPopUpView(cfg.path, { manager: manager, result: result, level: levelId });
            inst.resetLevelFail(inst.getLevelThemeName(), inst.getHistoryLevel());
        } else if (result == 2) {
            let cfg = AssetInfoDefine.prefab.levelOverPre;
            PanelManager.inst.addPopUpView(cfg.path, { manager: manager, result: result, level: levelId });
            inst.recordLevelFail(inst.getLevelThemeName(), inst.getHistoryLevel());
        }
        let dataInst = UserData.inst;
        if (dataInst.isFirstPlay) {
            dataInst.isFirstPlay = false;
            dataInst.onlinePlayTimes += 1;
        }
        // let view = mk.subRes.loadAssetSync<Prefab>(cfg.path);
        // let gamePass = instantiate(view);
        // if (gamePass) {
        //     let parent = find("Canvas");
        //     gamePass.setParent(parent);
        //     let cmpt = gamePass.getComponent(LevelGamePass);
        //     if (cmpt) {
        //         cmpt.initView(this.gameManager as LevelGame, result);
        //     }
        //     this.gamePassNode = gamePass;
        // }
    }
    //#region 关卡模式清除分数和展示连击的动画
    // protected showAddClearScoreAnimation(clearRow: number[], clearCol: number[], clearNumber: number): void {

    // }
    protected showComboScore(userId: number, combo: number, clearnCount: number, putPosition: Vec3) {
        mk.sendEvent(BlockEventType.EVENT_COMBO_BLOCK_END, userId, combo, clearnCount);
    }
    //#endregion
    protected getGuideDataInst(): any {
        return LevelGuideData.inst;
    }
}
