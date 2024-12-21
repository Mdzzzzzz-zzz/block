import { _decorator, game, Node, UITransform, Animation, Button, Tween, tween, v3, animation, Scene } from "cc";
import { PREVIEW } from "cc/env";
import { mk } from "../../../../MK";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BoardView } from "../boardView/BoardView";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { BlockEventType } from "../define/Event";
import { AdventureLevelGame, emLevCondition } from "../logic/AdventureLevelGame";
import { AdventureLevelConditionView } from "./AdventureLevelConditionView";
import { PanelManager } from "../../../../panel/PanelManager";
import { emComboState } from "../logic/ScoreHelper";
import { biEventId } from "../../../../Boot";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { kGameMode } from "../define/Enumrations";
import { AdSdk } from "../../../../sdk/AdSdk";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { Vec3 } from "cc";
import { UserData } from "../../../../data/UserData";
import { emRedPointKeys } from "../../../../redpoint/RedPointDef";
import { RedPointManager } from "../../../../redpoint/RedPointManager";
import { emShakeLevel } from "../../../../shake/ShakeDefine";
import { ShakeManager } from "../../../../shake/ShakeManager";
import { ResManager } from "../../../../resource/ResManager";
import { SceneMode } from "../define/SceneMode";
import { AdventureLevelConditionViewScene } from "./AdventureLevelConditionViewScene";
import { LevelScoreHelper } from "../logic/LevelScoreHelper";
import { FlagData } from "../../../../data/FlagData";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { UserRemoteDataManager } from "../../../../data/UserRemoteDataManager";
import { UserHammerData } from "../../../../data/UserHammerData";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";
import { Game } from "../logic/Game";
import { UserLevelData } from "db://assets/script/data/UserLeveData";
const { ccclass, property } = _decorator;

interface IBlockOnBoard {
    row: number;
    col: number;
    blockType: number;
}

const BlockCellSize: number = 84;
const BoardClearFixHeight: number = 294; //84*3.5

@ccclass("AdventureLevelBoardView")
export class AdventureLevelBoardView extends BoardView {
    @property(Node)
    rootConditionView: Node = null;
    conditionView: AdventureLevelConditionViewScene;
    @property(Node)
    rootConditionViewEnter: Node = null;
    conditionViewEnter: AdventureLevelConditionView;

    withDiamondToClear: Array<IBlockOnBoard> = new Array<IBlockOnBoard>();

    @property(Node)
    itemRoot: Node = null;
    @property(Node)
    propGiftPackIcon: Node = null;

    @property(Node)
    propGiftPackRoot: Node = null;

    batchNum: number = null;
    setBatchNum(stage: number) {
        this.batchNum = stage;
    }
    currPropGiftPack: Node = null;

    private enterDate: Date = new Date();

    protected startGame() {
        super.startGame();
        this.refreshCondition();
        if (SceneMode.gameMode == kGameMode.adventure_level) {
            if (this.itemRoot != null) {
                this.itemRoot.active = true;
            }
            mk.sdk.instance.reportBI(biEventId.level_start, {
                proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                proj_stage: this.batchNum,
                //theme: UserAdventureLevelData.inst.getLevelBatchNumber(),
            });

            let manager = this.gameManager as AdventureLevelGame;
            manager.batch = this.batchNum;
            this.checkPropGuide();
        } else if (SceneMode.gameMode == kGameMode.level) {
            //关卡模式
            mk.sdk.instance.reportBI(biEventId.levelmode_start, {
                proj_level: UserLevelData.inst.getHistoryLevel(),
            });
            console.log("打点 关卡模式 levelmode_start")
        }

        if (SceneMode.gameMode == kGameMode.level || UserAdventureLevelData.inst.getHistoryLevel() < 3) {
            if (SceneMode.gameMode != kGameMode.daily_challenge) {
                if (this.itemRoot != null) {
                    this.itemRoot.active = false;
                }
            }
        }
    }
    onLoad(): void {
        super.onLoad();
        BlockEventManager.instance
            .listen(BlockEventType.EVENT_SCENE_PLAY_LEVEL_NEXT, this.onLevelChange, this)
            .listen(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, this.showPassView, this);
        // mk.sdk.instance.reportBI(biEventId.level_enter, {
        //     level: UserAdventureLevelData.inst.getHistoryLevel(),
        //     stage: this.batchNum,
        //     // stage: UserAdventureLevelData.inst.getLevelBatchNumber(),
        // });

        mk.regEvent(BlockEventType.EVENT_ROUND_UPDATED, this.onEvtRoundUpdated, this);
        RedPointManager.getInstance().removePoint(emRedPointKeys.UnclockLevel);
    }
    protected refreshAllBoardAni(boardData: Array<Array<number>>, isFromClear: boolean = false) { }
    refreshCondition() {
        //刷新面板
        //刷新条件
        this.conditionView = this.rootConditionView.getComponent(AdventureLevelConditionViewScene);
        if (this.conditionView) {
            this.conditionView.initView(this.gameManager as AdventureLevelGame);
        }

        this.conditionViewEnter = this.rootConditionViewEnter.getComponent(AdventureLevelConditionView);
        if (this.conditionViewEnter) {
            this.conditionViewEnter.initView(this.gameManager as AdventureLevelGame);
        }
        if (!this.rootConditionViewEnter.active) {
            if (SceneMode.gameMode == kGameMode.endless) {
                this.rootConditionViewEnter.active = true;
            }
        }
    }
    checkPropGuide() {
        if (FlagData.inst.hasFlag("prop_guide_completed") || UserRemoteDataManager.inst.getUserItemGuide() == 1) {
            if (!FlagData.inst.hasFlag("prop_guide_completed")) {
                FlagData.inst.recordFlag("prop_guide_completed");
            }
            if (SceneMode.gameMode == kGameMode.adventure_level) {
                if (this.itemRoot != null) {
                    this.itemRoot.active = true;
                }
            }
        } else {
            let level = UserAdventureLevelData.inst.getHistoryLevel();
            let batch = this.batchNum;
            // let batch = UserAdventureLevelData.inst.getLevelBatchNumber();
            if (batch == 1 && level <= 3) {
                // display locked icon
                mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
                if (SceneMode.gameMode != kGameMode.daily_challenge) {
                    if (this.itemRoot != null) {
                        this.itemRoot.active = false;
                    }
                }
            } else {
                FlagData.inst.recordFlag("prop_guide_completed");
                UserRemoteDataManager.inst.setUserItemGuide(1);
                if (SceneMode.gameMode == kGameMode.adventure_level) {
                    if (this.itemRoot != null) {
                        this.itemRoot.active = true;
                    }
                }
            }
            if (batch == 1 && level == 3) {
                if (SceneMode.gameMode == kGameMode.adventure_level) {
                    if (this.itemRoot != null) {
                        this.itemRoot.active = true;
                    }
                }

                let group = ABTestManager.getInstance().getGroup(ABTestParam.EndlessProp);
                // if (group == 1) {
                //     UserHammerData.inst.addItem(1);
                // }
                FlagData.inst.recordFlag("prop_guide_completed");
                UserRemoteDataManager.inst.setUserItemGuide(1);
                // if (group == 0) {
                //     UserHRocketData.inst.addItem(1);
                //     UserVRocketData.inst.addItem(1);
                //     UserChangeData.inst.addItem(1);
                // }
                this.scheduleOnce(() => {
                    PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.guideHammerProp.path, UserHammerData.inst.itemCount);
                }, 0.8);
                mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
            }
        }
    }

    onLevelChange() {
        UserData.inst.setThisRoundPropGiftPack(0);
        this.refreshBoardView(this.gameManager.tableData);
        this.refreshCondition();
        this.checkPropGuide();
    }
    protected onRestartGame(isRetry: boolean): void {
        if (SceneMode.gameMode != kGameMode.daily_challenge) {
            if (this.itemRoot != null) {
                this.itemRoot.active = true;
            }
        }

        if (SceneMode.gameMode == kGameMode.level || UserAdventureLevelData.inst.getHistoryLevel() < 3) {
            if (SceneMode.gameMode != kGameMode.daily_challenge) {
                if (this.itemRoot != null) {
                    this.itemRoot.active = false;
                }
            }
        }
        UserData.inst.setThisRoundPropGiftPack(0);
        UserData.inst.setThisGameWatchReviveNum(1);
        this.withDiamondToClear.length = 0;
        super.onRestartGame(isRetry);
        //刷新盘面信息
        PanelManager.inst.removeAllPopUpView();
        this.onLevelChange();
        let level_history = UserAdventureLevelData.inst.getHistoryLevel();
        let theme_name = this.batchNum;
        // let theme_name = UserAdventureLevelData.inst.getLevelBatchNumber();

        if (SceneMode.gameMode == kGameMode.adventure_level) {
            if (isRetry) {
                mk.sdk.instance.reportBI(biEventId.level_restart, {
                    proj_level: level_history,
                    proj_stage: theme_name,
                });
            }
            mk.sdk.instance.reportBI(biEventId.level_start, { proj_level: level_history, proj_stage: theme_name });
        } else if (SceneMode.gameMode == kGameMode.level) {
            if (isRetry) {
                console.log("打点 关卡模式 levelmode_restart")
                mk.sdk.instance.reportBI(biEventId.levelmode_restart, {
                    proj_level: UserLevelData.inst.getHistoryLevel(),
                });
            }
            mk.sdk.instance.reportBI(biEventId.levelmode_start, {
                proj_level: UserLevelData.inst.getHistoryLevel(),
            });
        }
    }

    onDestroy() {
        BlockEventManager.instance
            .unlisten(BlockEventType.EVENT_SCENE_PLAY_LEVEL_NEXT, this.onLevelChange, this)
            .unlisten(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, this.showPassView, this);
        if (this.gameManager) {
            if (SceneMode.gameMode == kGameMode.adventure_level) {
                mk.sdk.instance.reportBI(biEventId.level_exit, {
                    proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                    proj_stage: this.batchNum,
                    // stage: UserAdventureLevelData.inst.getLevelBatchNumber(),
                    proj_round: this.gameManager.getRound(),
                });
            } else if (SceneMode.gameMode == kGameMode.level) {
                console.log("打点 关卡模式 levelmode_exit")
                mk.sdk.instance.reportBI(biEventId.levelmode_exit, {
                    proj_level: UserLevelData.inst.getHistoryLevel(),
                    proj_round: this.gameManager.getRound(),
                });
            }
        }
        super.onDestroy();
        // LevelGame.destroy();
    }
    protected getDelayStartTime(): number {
        return 1.5;
    }
    protected beforeStart() {
        this.gameManager = AdventureLevelGame.levlInstance;
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
        this.addFlyDiamondsToCondition(row, col, blockType);
    }

    private addFlyDiamondsToCondition(row: number, col: number, blockType: number) {
        let key = row * 100 + col;
        let totalFly = 0;
        if (!this.clearnDiamonMap.has(key)) {
            if (blockType > this.gameManager.diamonTypeStart) {
                if (PREVIEW) {
                    //console.log("消除了宝石：", row, col, blockType);
                }
                let manager = this.gameManager as AdventureLevelGame;
                if (this.conditionView) {
                    let cur = manager.currentCollects.get(blockType);
                    let tar = manager.targetCollects.get(blockType);
                    if (cur < tar) {
                        manager.collectItem(blockType, 1);
                        cur = manager.currentCollects.get(blockType);
                        let userId = mk.msgData?.Login?.userId;
                        mk.sendEvent(BlockEventType.EVENT_COLLECT_ITEM_END, userId, blockType, 1); // TODO: 可能要调节发送的时机，确定增加分数的时机
                        let entity = this.blockMap.get(key);
                        if (entity) {
                            // entity.frontSprite.getComponent(Animation).play("eui_gem_appear_anim")
                            totalFly += 1;

                            this.conditionView.addCollectAnimDiamonds(
                                entity.node,
                                blockType,
                                cur,
                                tar,
                                () => {
                                    manager.checkIsLevelComplete();
                                },
                                this
                            );

                            // this.conditionView.addCollectAnimDiamonds(
                            //             entity.node,
                            //             blockType,
                            //             cur,
                            //             tar,
                            //             () => {
                            //                 manager.checkIsLevelComplete();
                            //             },
                            //             this
                            //         );
                            // setTimeout(() => {
                            //     this.conditionView.setCollectFly(
                            //         entity.node,
                            //         blockType,
                            //         cur,
                            //         tar,
                            //         () => {
                            //             manager.checkIsLevelComplete();
                            //         },
                            //         this
                            //     );
                            // }, 150 * totalFly);
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

    protected refreshCombo(comboState: emComboState, hasClear: boolean): void {
        ShakeManager.getInstance().Shake(emShakeLevel.light);
    }
    protected showComboAni(show: boolean): void { }
    protected onAfterClearBlockAnim(clearNumber: number, comboState: emComboState) {
        super.onAfterClearBlockAnim(clearNumber, comboState);
        this.clearnDiamonMap = null;
    }
    protected onGameOver(): void {
        super.onGameOver();
        //关卡结束了不用弹出复活界面
        if ((this.gameManager as AdventureLevelGame).checkIsLevelComplete()) {
            return;
        }
        BlockEventManager.instance.emit(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, 2);
    }
    // private gamePassNode: Node;
    //完成当前关卡 1 成功 2 失败 3 暂停
    showPassView(result: number) {
        let revivepath = AssetInfoDefine.prefab.revive2.path;
        let group = ABTestManager.getInstance().getGroup(ABTestParam.Revive3);
        if (group == 1) {
            revivepath = AssetInfoDefine.prefab.revive3.path;
        }
        let scoreHelper = this.gameManager.scoreHelper as LevelScoreHelper;
        if (result == 1) {
            Game.inst.canMoveBlock = false
            this.clearAllBlocks(() => {
                this.showOverView(result);
                Game.inst.canMoveBlock = true
            })

            //棋牌上剩余块自动消除动画
            // this.showOverView(result);
        } else if (result == 2) {
            if (AdventureLevelGame.levlInstance.isCanRevive()) {
                AdSdk.inst
                    .isRewardedVideoAvailable()
                    .then(() => {
                        PanelManager.inst.addPopUpView(revivepath, {
                            manager: AdventureLevelGame.levlInstance,
                            onTimeFinish: () => {
                                this.showOverView(result);
                            },
                            holder: this,
                            mode: kGameMode.adventure_level,
                            reviveTimes: AdventureLevelGame.levlInstance.getReviveTimes(),
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
        let inst = UserAdventureLevelData.inst;
        let manager = this.gameManager as AdventureLevelGame;
        let levelId = manager.getLevelId();
        if (result == 1) {
            let cfg = AssetInfoDefine.prefab.levelPassPre;
            if (SceneMode.gameMode == kGameMode.level) {
                cfg = AssetInfoDefine.prefab.levelPassPreNew;
            }
            PanelManager.inst.addPopUpView(cfg.path, { manager: manager, result: result, level: levelId });
            inst.resetLevelFail(inst.getLevelBatchNumber(), inst.getHistoryLevel());
        } else if (result == 2) {
            let cfg = AssetInfoDefine.prefab.levelOverPre;
            PanelManager.inst.addPopUpView(cfg.path, { manager: manager, result: result, level: levelId });
            inst.recordLevelFail(inst.getLevelBatchNumber(), inst.getHistoryLevel());
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
    protected showAddClearScoreAnimation(
        score: number,
        clearRow: number[],
        clearCol: number[],
        clearNumber: number,
        putPosition: Vec3,
        isClearAll: boolean
    ): void {
        if (this.gameManager && (this.gameManager as AdventureLevelGame).conditionType == emLevCondition.Score) {
            super.showAddClearScoreAnimation(score, clearRow, clearCol, clearNumber, putPosition, false);
        }
    }
    showMultipleClearEffect(
        clearNumber: number,
        score: number,
        blockType: number,
        position: Vec3,
        isClearAll: boolean
    ) {
        if (this.gameManager && (this.gameManager as AdventureLevelGame).conditionType == emLevCondition.Score) {
            super.showMultipleClearEffect(clearNumber, score, blockType, position, false);
        }
    }
    protected showComboScore(userId: number, combo: number, clearnCount: number, putPosition: Vec3) {
        mk.sendEvent(BlockEventType.EVENT_COMBO_BLOCK_END, userId, combo, clearnCount);
    }
    //#endregion
    protected getGuideDataInst(): any {
        return LevelGuideData.inst;
    }

    protected onEvtRoundUpdated(roundNum) {
        let group = ABTestManager.getInstance().getGroup(ABTestParam.AdventurePropGiftPack);
        if (group == 0) {
            return;
        }

        console.log("onEvtRoundUpdated round: " + roundNum);
        let level = UserAdventureLevelData.inst.getHistoryLevel();
        let batch = this.batchNum;
        if (batch == 1 && level <= 3) {
            return;
        }
        if (batch == 1) {
            level = level - 4;
        }
        let numOfRoundsAppear1time = RemoteConfig.getInstance().PropGiftNumOfRoundsAppear1Time;
        console.log("[onEvtRoundUpdated] getThisRoundPropGiftPack: ", UserData.inst.getThisRoundPropGiftPack());

        //if (level % numOfRoundsAppear1time == 0) {
        if (roundNum == 5 && UserData.inst.getThisRoundPropGiftPack() != 1) {
            // this.StartGiftPackAnim(v3(0, 0, 0), v3(-390, 0, 0));

            let asset = AssetInfoDefine.prefab.propRewardIcon;
            ResManager.getInstance()
                .loadNode(asset.path, asset.bundle, this.propGiftPackIcon)
                .then((nd) => {
                    this.currPropGiftPack = nd;
                    this.currPropGiftPack.active = true;
                    let ani = this.currPropGiftPack.getComponent(Animation);
                    ani.play("reward_prop_anim_enter");
                    this.scheduleOnce(() => {
                        ani.play("reward_prop_anim_exit")
                    }, 3);
                    this.scheduleOnce(() => {
                        nd.destroy();
                    }, 20);
                });


            UserData.inst.setThisRoundPropGiftPack(1);


        }
        //}

    }

    private OnClickOpenGiftPackView() {
        // this.currPropGiftPack.active = false;
        // PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.giftPackView.path);
    }


}
