import { _decorator, Component, Node, Vec3, UITransform, tween, Animation, instantiate } from "cc";

import { mk } from "../../../../MK";
import { Game } from "../logic/Game";
import { BlockEventType } from "../define/Event";
import { BlockEntity } from "./BlockEntity";
import { BlockPlaceholder3 } from "./BlockPlaceholder3";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { BlockConstData } from "../define/BlockConstData";
import { Mat4 } from "cc";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { emComboState } from "../logic/ScoreHelper";
import { ComboScore } from "../effect/ComboScore";
import { ShaderFrame } from "../effect/ShaderFrame";
import { NodePoolManager } from "../../../../util/NodePool";
import { AddScoreLabel } from "../effect/AddScoreLabel";
import { GuideData } from "../../../../data/GuideData";
import { BIEventID } from "../../../../define/BIDefine";
import { AdSdk } from "../../../../sdk/AdSdk";
import { emAdPath } from "../../../../sdk/emAdPath";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { Label } from "cc";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { UIOpacity, Sprite } from "cc";
import { EventTouch } from "cc";
import { ResManager } from "../../../../resource/ResManager";
import { MutilLineScore } from "../effect/MutilLineScore";
import { BlockItemConst } from "../define/BlockType";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { game } from "cc";
import { FlagData } from "../../../../data/FlagData";
import { UIPlayClearParticle } from "../../../../tween/UIPlayClearParticle";
import { ShakeManager } from "../../../../shake/ShakeManager";
import { emShakeLevel } from "../../../../shake/ShakeDefine";
import { PREVIEW } from "cc/env";
import { EndlessScoreHelper } from "../logic/EndlessScoreHelper";
import { EndlessProgressHelper } from "../logic/EndlessProgressHelper";
import { BoardPreviewData } from "../../../../data/BoardPreviewData";
import { AITipsAnim } from "../effect/AITipsAnim";
import { UserData } from "../../../../data/UserData";
import { ProcedureToHome } from "../../../../fsm/state/ProcedureToHome";
import { UIPlayAnimations } from "../../../../tween/UIPlayAnimations";
import { UIPlayEffectParticle } from "../../../../tween/UIPlayEffectParticle";
import { UserHammerData } from "../../../../data/UserHammerData";
import { UserVRocketData } from "../../../../data/UserVRocketData";
import { UserHRocketData } from "../../../../data/UserHRocketData";
import { UserChangeData } from "../../../../data/UserChangeData";
import { AdventureLevelConditionViewScene } from "../LevelAdventure/AdventureLevelConditionViewScene";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { UserRemoteData } from "../../../../data/UserRemoteData";
import { UserRemoteDataManager } from "../../../../data/UserRemoteDataManager";

const BlockCellSize: number = 84;
const BoardClearFixHeight: number = 294; //84*3.5

const HalfGridSize = BlockCellSize / 2; // 格子的一半，用于找到中心
const BoardHalfSize = (8 * BlockCellSize) / 2; // 棋盘大小的一半，即 336

const { ccclass, property } = _decorator;

@ccclass("BoardView")
export class BoardView extends Component {
    protected blocks: Array<Array<BlockEntity>>;

    public blockMap: Map<number, BlockEntity>;

    public blockPreviewAniMap: Map<number, BlockEntity>;

    private blockParent: Node;

    @property(Node)
    private previewAniBlockParent: Node;

    private blockParentTransform: UITransform;

    protected gameManager: Game;

    @property(Node)
    ndBlockPreview: Node = null;
    @property(Node)
    root_combo: Node = null;
    @property(Node)
    rootRefreshAll: Node = null;
    @property(Node)
    rootRefreshBtn: Node = null;
    @property(Node)
    root_preview_guide: Node = null;
    @property(Node)
    rootEffect: Node = null;
    newGuideNode: Node;
    @property(Node)
    reachPercent: Node = null;

    @property(Node)
    newGuideHint: Node = null;

    @property(Node)
    newGuideStep1: Node = null;
    @property(Node)
    newGuideStep2: Node = null;
    @property(Node)
    newGuideStep3: Node = null;

    @property(Node)
    newUserRound1Frame: Node = null;

    @property(Node)
    enhanceAnimParent: Node = null;
    // 经典模式挑战目标分数
    @property(Label)
    challengeTargetScore: Label = null;
    @property(Sprite)
    challengeText: Sprite = null;

    @property(Node)
    challengeTarget: Node = null;

    @property(Node)
    challengeBrain: Node = null;

    conditionView: AdventureLevelConditionViewScene = null;

    protected hasEnhancedHint: boolean = false;
    private currAFRound: number = 0;
    public static instance: BoardView;
    // 经典模式挑战目标分组
    endlessChallengeGroup: number = 0;
    challengeBrainGroup: number = 0;
    protected isPlayEndEffing: boolean = false;
    start() {
        BoardView.instance = this;
        //this.endlessChallengeGroup = ABTestManager.getInstance().getGroup(ABTestParam.EndlessChallenge);
        this.challengeBrainGroup = ABTestManager.getInstance().getGroup(ABTestParam.ChallengeBrain);
        if (this.newGuideHint) {
            this.newGuideHint.active = false;
        }
        if (this.ndBlockPreview && !this.ndBlockPreview.active) {
            this.ndBlockPreview.active = true;
        }
        this.startGame();
        BlockEventManager.instance.listen(BlockEventType.BLOCK_TOUCH_START, this.onTouchStart, this);
        //BlockEventManager.instance.listen(BlockEventType.EVENT_FAILED_RESTART, this.onReveiveFailRestart, this);
        if (!GuideData.inst.isGuideFinished()) {
            let prefabPath = AssetInfoDefine.prefab;
            NodePoolManager.initPool(prefabPath.adventure_btn.path, prefabPath.adventure_btn.bundle, 60);
            NodePoolManager.initPool(prefabPath.adventure_num_dark.path, prefabPath.adventure_num_dark.bundle, 60);
            NodePoolManager.initPool(prefabPath.adventure_num_normal.path, prefabPath.adventure_num_dark.bundle, 60);
        }

        if (SceneMode.gameMode == kGameMode.endless) {
            this.challengeTarget.active = false;
            this.challengeBrain.active = false;
            if (this.challengeBrainGroup == 1) {
                this.challengeBrain.active = true;
                for (let index = 0; index < 4; index++) {
                    let nd = this.challengeBrain.getChildByPath("challenge" + index);
                    nd.active = index == UserData.inst.getchallengeBrain();
                }

            } else {
                let scoreHelper = this.gameManager.scoreHelper as EndlessScoreHelper;
                let enhancedScoreMap = scoreHelper.getEnhancedScoreMap();
                let i = UserData.inst.getchallengeTarget();
                if (enhancedScoreMap[i]) {
                    this.challengeTarget.active = true;
                    this.challengeTargetScore.string = enhancedScoreMap[i].toString();
                    let path = "res/texture/challengeTarget/target" + i.toString();
                    ResManager.getInstance()
                        .loadSpriteFrame(path, "block")
                        .then((sprite) => {
                            this.challengeText.spriteFrame = sprite;
                        });
                } else {
                    this.challengeTarget.active = false;
                }
            }

        }
        //测试显示连击棋盘效果
        // this.showComboAni(true);
    }

    onReveiveFailRestart() {
        mk.fsm.changeState(ProcedureToHome);
    }

    onTouchStart(event: EventTouch) {
        if (this.newGuideNode) {
            this.newGuideNode.destroy();
            this.newGuideNode = null;
            let userGuide = this.root_preview_guide.getChildByName("userGuide");
            if (userGuide) {
                this.root_preview_guide.getChildByName("userGuide").destroy();
            }
        }
    }
    protected startGame() {
        this.beforeStart();
        this.gameManager.startGame();
        this.initNodeData();
        this.refreshBoardView(this.gameManager.tableData);
        this.refreshAllBoardAni(BoardPreviewData.previewBoardData);
        this.showComboAni(false);
        const win = window as any;
        if (win.BlockView == null) {
            win.BlockView = this;
        }
        tween(this.node).delay(this.getDelayStartTime()).call(this.onStartGame.bind(this)).start();
        this.refreshBtnRefreshAll();
        this.refeshGuideShow();
        mk.sendEvent(BlockEventType.kEvent_Game_Start);
        UserData.inst.setThisGameWatchReviveNum(1);
    }
    //播放开场动画
    private isEnterGame: boolean = false;

    playStartAni(isEnter: boolean) {
        this.isEnterGame = isEnter;
        // 模仿之前的行为
        this.refreshAllBoardAni(BoardPreviewData.previewBoardData);
    }

    protected refreshAllBoardAni(boardData: Array<Array<number>>, isFromClear: boolean = false) {
        // this.showComboAni(false);
        if (boardData.length != this.gameManager.tableData.length) {
            console.error("Failed to compare boardData with table Data");
            return;
        }

        if (boardData[0].length != this.gameManager.tableData[0].length) {
            console.error("Failed to compare boardData[0] with tableData[0]");
            return;
        }
        this.blockPreviewAniMap = this.blockMap;
        let previewData = BoardPreviewData.previewBoardData;
        for (let i = 0; i < boardData.length; i++) {
            for (let j = 0; j < boardData[i].length; j++) {
                let key = i * 100 + j;
                let blockEntity = this.blockPreviewAniMap.get(key);
                let blockSprite = blockEntity.node.getChildByPath("Sprite").getComponent(UIOpacity);
                let blockType = this.gameManager.tableData[i][j];
                let isPreviewBlock = false;
                if (!(blockType > 0 && !isFromClear)) {
                    blockType = previewData[i][j];
                    isPreviewBlock = true;
                }
                blockEntity.onlyRefreshColor(blockType);
                // blockEntity.node.active = true;
                blockSprite.opacity = 0;
                if (isPreviewBlock) {
                    tween(blockSprite)
                        .delay((boardData.length - 1 - i) * 0.05)
                        .to(0.035, { opacity: 255 })
                        .delay(1.05 - 0.1 * (boardData.length - 1 - i))
                        .to(0.035, { opacity: 0 })
                        .start();
                } else {
                    tween(blockSprite)
                        .delay((boardData.length - 1 - i) * 0.05)
                        .to(0.035, { opacity: 255 })
                        .start();
                }
                // tween(blockSprite).delay((i) * 0.1).to(1, {opacity: 255}).to(1, {opacity: 0}).start();
            }
        }
        // await Util.delay(1000);
        // this.refreshBoardView(this.gameManager.tableData);
    }

    // playStartAni(isEnter: boolean) {
    //     this.isEnterGame = isEnter;
    //     let animInfo = AssetInfoDefine.prefab.startAni;
    //     ResManager.getInstance()
    //         .loadAsset<Prefab>(animInfo.path, animInfo.bundle)
    //         .then((startAnimPrefab) => {
    //             if (startAnimPrefab) {
    //                 let node = instantiate(startAnimPrefab);
    //                 let index = this.ndBlockPreview.parent.children.length;
    //                 node.parent = this.ndBlockPreview.parent;
    //                 node.position = new Vec3(0, 30, 0);
    //                 node.setSiblingIndex(index - 2);
    //                 const ani = node.getComponent(Animation);
    //                 ani.playOnLoad = false;
    //                 ani.play();
    //                 mk.audio.playSubSound(AssetInfoDefine.audio.restart);
    //                 if (isEnter) {
    //                     this.ndBlockPreview.active = false;
    //                 }
    //                 ani.once(Animation.EventType.FINISHED, () => {
    //                     node.destroy();
    //                 });
    //             }
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //         });
    // }
    onStartAniEnd() {
        if (!this.isEnterGame) {
            return;
        }
        if (!this.ndBlockPreview.active) {
            this.ndBlockPreview.active = true;
        }
        this.startGame();
        // mk.sendEvent(TetrisEvent.EVENT_LOGIC_START_GAME);
    }

    protected beforeStart() {
        this.gameManager = Game.inst;
    }
    protected getDelayStartTime(): number {
        return 1;
    }
    protected onStartGame() {
        // console.log("666" + JSON.stringify(this.gameManager.scoreHelper))
        if (this.gameManager.historyLevelData) {
            mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks_History, this.gameManager.historyLevelData.preview);
        } else {
            mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
        }
        this.onTouchScreenEnd(null);
    }

    onLoad() {
        mk.regEvent(BlockEventType.kEvent_Game_Refresh_Board, this.refreshBoardView, this);
        mk.regEvent(BlockEventType.kEvent_Game_Move_Block, this.onEvtMoveBlock, this);
        mk.regEvent(BlockEventType.kEvent_Game_Move_Block_End, this.onEvtMoveBlockEnd, this);
        mk.regEvent(BlockEventType.kEvent_Game_Finish_New_Blocks, this.onEvtRefreshPreviewBlock, this);
        mk.regEvent(BlockEventType.EVENT_SCENE_PLAY_RESTART, this.onRestartGame, this);
        mk.regEvent(BlockEventType.EVENT_SCENE_PLAY_RELIFE, this.onRelifeGame, this);
        mk.regEvent(BlockEventType.EVENT_START_ANI_END, this.onStartAniEnd, this);
        mk.regEvent(BlockEventType.kEvent_Game_Show_User_Guide, this.refeshGuideShow, this);

        mk.regEvent(BlockEventType.EVENT_GAME_CREATE_NEWGUIDE_BLOCK, this.PlayNewGuideAnim, this);

        mk.regEvent(mk.eventType.ON_TOUCH_START, this.onTouchScreenStart, this);
        mk.regEvent(mk.eventType.ON_TOUCH_END, this.onTouchScreenEnd, this);

        mk.regEvent(BlockEventType.EVENT_USE_ITEM_HAMMER, this.onUsePropHammer, this);
        mk.regEvent(BlockEventType.EVENT_USE_ITEM_VROCKET, this.onUsePropVRocket, this);
        mk.regEvent(BlockEventType.EVENT_USE_ITEM_HROCKET, this.onUsePropHRocket, this);
        mk.regEvent(BlockEventType.EVENT_USE_ITEM_REFRESHBLOCK, this.onUsePropRefresh, this);
        mk.regEvent(BlockEventType.EVENT_HAMMER_TWO_BLOCKS, this.hammerTwoBlocks, this);
        // this.initStartAni();
    }

    private onTouchScreenStart(evt) {
        this.unschedule(this.checkAiTipTimer);
        this.showAiTips(false);
    }
    private checkAiTipTimer() {
        if (GuideData.inst.isGuideFinished()) {
            this.showAiTips(true);
        }
    }

    private onTouchScreenEnd(evt) {
        if (this.gameManager && this.gameManager.scoreHelper) {
            if (this.gameManager.scoreHelper.checkIsCanOpenAITips()) {
                let delay = 60;
                let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
                if (group == 1 && this.gameManager.scoreHelper.score < 2000 && UserData.inst.gameNumber == 1) {
                    delay = 5;
                }
                this.scheduleOnce(this.checkAiTipTimer, delay);
            }
        }

        if (this.newUserRound1Frame) {
            this.newUserRound1Frame.active = false;
        }
    }

    protected refeshGuideShow() {
        let guideData = this.getGuideDataInst();

        if (!guideData.isGuideFinished()) {
            this.refreshBoardView(this.gameManager.tableData);
            //新手引导的前两步加载引导手 // 第三步之后也加上
            let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);

            if (group == 0 && guideData.step >= guideData.openGuideStep) {
                return;
            }

            if (group == 1 && guideData.step > guideData.openGuideStep) {
                return;
            }

            mk.showView(AssetInfoDefine.prefab.newGuide, this.root_preview_guide).then((node) => {
                node.setSiblingIndex(0);
                this.newGuideNode = node;
            });
        }
    }
    protected PlayNewGuideAnim() {
        let guideData = this.getGuideDataInst();
        // todo fenghe abTest 新手引导第一步
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            if (this.newGuideStep1 && guideData.step == 1) {
                this.newGuideStep1.active = true;
            }
            if (this.newGuideStep2 && guideData.step == 2) {
                this.newGuideStep2.active = true;
            }
            if (this.newGuideStep3 && guideData.step == 3) {
                this.newGuideStep3.active = true;
            }
        } else if (group == 0 && guideData.step == guideData.openGuideStep) {
            return;
        }

        if (this.newGuideNode == null || this.newGuideNode == undefined || !this.newGuideNode.isValid) {
            this.scheduleOnce(() => {
                this.PlayNewGuideAnim();
            }, 0.2);
            return;
        }

        {
            if (guideData.isGuideFinished()) {
                return;
            }
            if (this.newGuideHint) {
                this.newGuideHint.active = guideData.step == 1;
            }
            if (this.newGuideNode && this.newGuideNode.isValid) {
                let hand = this.newGuideNode.getChildByName("img_press");
                if (hand) {
                    hand.active = true;
                    hand.name = "userGuide";
                    hand.parent = this.root_preview_guide;
                    hand.position = this.newGuideNode.position;
                }
                let tips = this.newGuideNode.getChildByName(`guide_${guideData.step}`);
                if (!tips) {
                    console.error("没有对应的引导", guideData.step);
                    return;
                }
                //if (guideData.step != 1) {
                tips.active = false;

                let fillArea = guideData.getGuideFill();
                let pos = new Vec3(0, 0, 0);
                for (let i = 0; i < fillArea.length; i++) {
                    const p = fillArea[i];
                    const row = p[0];
                    const col = p[1];
                    let key = row * 100 + col;
                    const block = this.blockMap.get(key);
                    pos.add(block.node.position);
                }
                pos.multiplyScalar(1 / fillArea.length);
                // pos.add3f(40, 40, 0);
                const trans = this.node.getComponent(UITransform); //root_blocks
                const wPos = trans.convertToWorldSpaceAR(pos);
                wPos.y += 50;
                const trans2 = this.newGuideNode.getComponent(UITransform);
                const lpos = trans2.convertToNodeSpaceAR(wPos);
                tips.position = lpos;

                if (hand && hand.isValid) {
                    const press = hand.getChildByName("img_press");
                    press.active = false;
                    const op = press.getComponent(UIOpacity);
                    const cPos = hand.position.clone();

                    // const lscale = hand.

                    let copyHolders = this.gameManager.blockPlaceholders;
                    if (copyHolders.length == 1) {
                        let node = copyHolders[0].getChildByName("blockParent");
                        let vbn = instantiate(node);

                        let prefabPath = AssetInfoDefine.prefab.new_guide_light_1.path;
                        let topBubblePath = AssetInfoDefine.prefab.new_guide_bubble_1.path;

                        // todo Fenghe ab测试
                        if (guideData.step == 2) {
                            prefabPath = AssetInfoDefine.prefab.new_guide_light_2.path;
                            topBubblePath = AssetInfoDefine.prefab.new_guide_bubble_2.path;
                            let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
                            if (group == 1) {
                                prefabPath = AssetInfoDefine.prefab.new_guide_light_new_2.path;
                                topBubblePath = AssetInfoDefine.prefab.new_guide_bubble_new_2.path;
                            }
                        }

                        if (guideData.step == 3 && group == 1) {
                            prefabPath = AssetInfoDefine.prefab.new_guide_light_new_3.path;
                            topBubblePath = AssetInfoDefine.prefab.new_guide_bubble_new_3.path;
                        }

                        copyHolders[0].getComponent(BlockPlaceholder3).setBgLight(prefabPath, topBubblePath);

                        let opacity = vbn.getComponent(UIOpacity);
                        opacity.opacity = 100;
                        hand.addChild(vbn);
                        vbn.setSiblingIndex(0);
                        vbn.name = "move_block";
                        vbn.setPosition(Vec3.ZERO);
                    }

                    let vbn = hand.getChildByName("move_block");

                    // let colorIndex = null
                    //     if (colorIndexes &&i < colorIndexes.length) {
                    //         colorIndex = colorIndexes[i]
                    //     }

                    //     placeholder.refresh(results[i] - 1, null, colorIndex);

                    tween(hand)
                        .repeatForever(
                            tween()
                                .to(
                                    1,
                                    { position: lpos },
                                    {
                                        easing: "circOut",
                                        // onUpdate(target?, ratio?) {
                                        //     if (!press.active) {
                                        //         press.active = false;
                                        //         op.opacity = 0;
                                        //     }
                                        //     // op.opacity = 2.5 * 255 * ratio;
                                        // },
                                    }
                                )
                                .delay(0.333)
                                .call(() => {
                                    hand.position = cPos;
                                    press.active = false;
                                })
                                .delay(0.01)
                        )
                        .start();

                    if (vbn) {
                        tween(vbn)
                            .repeatForever(
                                tween()
                                    .to(0.167, { scale: new Vec3(1, 1, 1) }, { easing: "sineInOut" })
                                    .delay(1.067)
                                    .to(0.1, { scale: new Vec3(0.4, 0.4, 0.4) }, { easing: "sineInOut" })
                                    .delay(0.01)
                            )
                            .start();
                    }
                }

                if (guideData.step == 1) {
                    if (!FlagData.inst.hasFlag(BIEventID.af_gudie_begin)) {
                        let deviceId = mk.utils.deviceId();
                        //mk.sdk.instance.reportAf(BIEventID.af_gudie_begin, { userId: deviceId }, true);
                        FlagData.inst.recordFlag(BIEventID.af_gudie_begin);
                    }
                }
            }
        }
    }

    protected onRestartGame(isRetry: boolean) {
        // this.playStartAni(false);
        UserData.inst.setThisGameWatchReviveNum(1);
        this.refreshBtnRefreshAll();
    }
    protected onRelifeGame() {
        // this.playStartAni(false);
    }
    onDestroy() {
        //退出后清理下数据
        BlockEventManager.instance.unlisten(BlockEventType.BLOCK_TOUCH_START, this.onTouchStart, this);
        if (this.gameManager) {
            this.gameManager.endGame();
        }
        mk.unRegEvent(this);
    }

    protected onEvtRefreshPreviewBlock(isHistory) {
        this.scheduleOnce(() => {
            this.checkGameover();
        }, 0.5);

        this.addGuideBlockScale();
        // todo Fenghe ab测试
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        console.log("userGamePlayed ", UserData.inst.gameNumber);
        if (
            group == 1 &&
            this.newUserRound1Frame &&
            this.gameManager.getRound() == 1 &&
            UserData.inst.gameNumber == 1
        ) {
            this.newUserRound1Frame.active = true;
        } else {
            if (this.newUserRound1Frame) {
                this.newUserRound1Frame.active = false;
            }
        }
        this.refreshBtnRefreshAll();
    }

    addGuideBlockScale() {
        let guideData = this.getGuideDataInst();
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (!guideData.isGuideFinished()) {
            if (this.gameManager) {
                this.gameManager.blockPlaceholders.forEach((v) => {
                    let blockholder = v.getComponent(BlockPlaceholder3);
                    if (guideData.step < GuideData.inst.openGuideStep) {
                        blockholder.addBlockScale();
                    } else if (group == 1 && guideData.step == GuideData.inst.openGuideStep) {
                        // todo Fenghe ab测试
                        blockholder.addBlockScale();
                    } else {
                        blockholder.removeBlockScale();
                    }
                });
            }
        } else {
            if (this.gameManager) {
                this.gameManager.blockPlaceholders.forEach((v) => {
                    let blockholder = v.getComponent(BlockPlaceholder3);
                    blockholder.removeBlockScale();
                });
            }
        }
    }

    private labRefreshAll: Label;
    private labRefreshBtn: Label;
    // private btnRefreshAll: Button;
    private refreshBtnRefreshAll() {
        if (this.gameManager.isCanRefreshAll() && this.gameManager.changeAllTimes == 0) {
            //本局可以看视频解锁换一换 并且没有换一换次数
            if (this.rootRefreshBtn) {
                if (this.rootRefreshBtn.active) {
                    this.rootRefreshBtn.active = false;
                }
            }
            if (this.rootRefreshAll) {
                if (!this.rootRefreshAll.active) {
                    this.rootRefreshAll.active = true;
                }
                if (!this.labRefreshAll) {
                    let lab = this.rootRefreshAll.getChildByName("Label");
                    if (lab) {
                        this.labRefreshAll = lab.getComponent(Label);
                    }
                }
                if (this.labRefreshAll) {
                    let maxCount = this.gameManager.getMaxChangeAllTimes();
                    this.labRefreshAll.string = `${0} / ${maxCount}`;
                }
            }
            //刷新解锁换一换的次数
        } else {
            if (this.rootRefreshAll) {
                if (this.rootRefreshAll.active) {
                    this.rootRefreshAll.active = false;
                }
            }
            if (this.rootRefreshBtn) {
                if (!this.rootRefreshBtn.active) {
                    this.rootRefreshBtn.active = true;
                }
                if (!this.labRefreshBtn) {
                    let lab = this.rootRefreshBtn.getChildByName("Label");
                    if (lab) {
                        this.labRefreshBtn = lab.getComponent(Label);
                    }
                }
                if (this.labRefreshBtn) {
                    let maxCount = this.gameManager.getMaxChangeAllTimes();
                    this.labRefreshBtn.string = `${this.gameManager.changeAllTimes} / ${maxCount}`;
                }
            }
        }
    }
    public checkGameover() {
        let guideData = this.getGuideDataInst();
        if (!guideData.isGuideFinished()) {
            return false;
        }
        let isOver = this.gameManager.checkGameEnd();
        if (isOver) {
            //等待0.5秒后再弹出面板 有个消除动画过程
            this.scheduleOnce(() => {
                //以防万一再查一次吧
                if (this.gameManager.checkGameEnd()) {
                    this.onGameOver();
                }
            }, 1.5);
            return true;
        }
        return false;
    }
    allcellsanis: { row: number; column: number }[];
    /**
     * @description 初始化格子的数据
     */
    initAllGZ() {
        if (!this.allcellsanis) {
            this.allcellsanis = [];
            let blocks: number[] = [];
            const boardNum = BlockConstData.BoardHeight * BlockConstData.BoardWidth;
            for (let index = 0; index < boardNum; index++) {
                blocks[index] = index;
            }
            for (let index = 0; index < boardNum; index++) {
                const randomIndex = Math.round(Math.random() * (boardNum - 1));
                [blocks[index], blocks[randomIndex]] = [blocks[randomIndex], blocks[index]];
            }

            for (let index = 0; index < boardNum; index++) {
                const v = blocks[index];
                const board = {
                    row: Math.floor(v / BlockConstData.BoardHeight),
                    column: v % BlockConstData.BoardWidth,
                };
                this.allcellsanis.push(board);
            }
        }
    }
    // 置灰所有块
    gameOverAllBlock() { }

    protected lastChooseNodeIndex: Array<Array<number>>;
    protected chooseBlocksData: Map<number, number> = new Map<number, number>();
    protected chooseNodeIndex = new Array<Array<number>>();
    //消除动画颜色的标记 -1 道具  非-1 具体的颜色值
    protected chooseBlockType: number = -1;
    protected onEvtMoveBlock(node: Node, moveDis: number) {
        const blockPlaceholder = node.getComponent(BlockPlaceholder3);
        // node.setSiblingIndex(999);
        // let chooseNodeIndex = new Array<Array<number>>();
        this.chooseBlocksData.clear();
        this.chooseNodeIndex = [];
        this.chooseBlockType = -1;
        let validation = true;
        let chooseBlockType = -1;

        node.getComponent(BlockPlaceholder3).setHintVisible(false);

        blockPlaceholder.StopBlockScale();

        for (const entity of blockPlaceholder.blocks) {
            if (entity.blockType != 0) {
                const nodeCoord = this.getNodeIndexWithPosition(entity.node.worldPosition);
                if (nodeCoord) {
                    let nodeIndex = nodeCoord[2];
                    this.chooseNodeIndex.push(nodeCoord);
                    this.chooseBlocksData.set(nodeIndex, entity.blockType);
                } else {
                    validation = false;
                }
                chooseBlockType = entity.getRealBlockType();
                entity.targetNodeIndex = nodeCoord;
            }
        }

        if (!validation || moveDis < 10) {
            this.refreshBoardView(this.gameManager.tableData);
            this.lastChooseNodeIndex = null;
            // console.log("// 超出边界 不可放置 todo 回归状态")
            return;
        }

        // 和上次一致 不处理
        if (this.checkEqualChooseNodeIndex(this.chooseNodeIndex)) {
            return;
        }

        //刷新移动过程中显示块
        this.refreshBoardView(this.gameManager.tableData);

        let result = true;
        if (
            chooseBlockType == 1001 ||
            chooseBlockType == 1002 ||
            chooseBlockType == 1003 ||
            chooseBlockType == 1101 ||
            chooseBlockType == 1102
        ) {
            //锤子道具作用到块上
            let clearCount = 0;
            let clearMaxCount = BlockItemConst[chooseBlockType].count;
            this.chooseNodeIndex.forEach((value) => {
                let nodeIndex = value[2];
                const entity: BlockEntity = this.blockMap.get(nodeIndex);
                // 有块判断： 非临时 且有颜色存在 且不是收集物
                if (!(entity.temporary || entity.blockType == 0 || entity.blockType > 100)) {
                    clearCount++;
                }
            });
            result = clearCount > 0 && clearCount <= clearMaxCount;
            // 选择区域有块 不可放置 todo 回归状态
            if (!result) {
                this.refreshBoardView(this.gameManager.tableData);
                this.lastChooseNodeIndex = null;
                // console.log("// 选择区域有块 不可放置 todo 回归状态");
                return;
            }
            this.chooseBlockType = -1;
        } else {
            for (const iterator of this.chooseNodeIndex) {
                let nodeIndex = iterator[2];
                const entity = this.blockMap.get(nodeIndex);
                // 有块判断： 非临时 且有颜色存在
                if (!entity.temporary && entity.blockType != 0) {
                    result = false;
                    break;
                }
            }
            // 选择区域有块 不可放置 todo 回归状态
            if (!result) {
                this.refreshBoardView(this.gameManager.tableData);
                this.lastChooseNodeIndex = null;
                // console.log("// 选择区域有块 不可放置 todo 回归状态");
                return;
            }
            this.chooseBlockType = chooseBlockType;
        }
        this.lastChooseNodeIndex = this.chooseNodeIndex;
        this.refreshBoardViewWithChoose(blockPlaceholder.blockIndex, chooseBlockType);
    }
    protected lastPutCoord: number[][];
    private onEvtMoveBlockEnd(node: Node, moveDis: number) {
        if (
            UserData.inst.isFirstPlay &&
            this.currAFRound != this.gameManager.getRound() &&
            this.gameManager.getRound() % 5 == 0 &&
            SceneMode.gameMode == kGameMode.endless
        ) {
            this.currAFRound = this.gameManager.getRound();
            mk.sdk.instance.reportBI(BIEventID.firstEnter_roundNum, {
                proj_round: this.gameManager.getRound(),
                proj_currscore: this.gameManager.scoreHelper.score,
            });
        }
        node.getComponent(BlockPlaceholder3).setHintVisible(true);
        node.getComponent(BlockPlaceholder3).setHintAvailable(false);
        mk.sendEvent(BlockEventType.EVENT_ROUND_UPDATED, this.gameManager.getRound());
        //放置后做个平滑处理
        this.scheduleOnce(() => {
            const placeholder = node.getComponent(BlockPlaceholder3);
            node.setSiblingIndex(1);
            // 未选中区域 todo 回退至原始状态
            if (this.lastChooseNodeIndex == null || moveDis < 10) {
                // console.log("// 未选中区域 todo 回退至原始状态");
                placeholder.moveToOriginalPosition();
                return;
            }
            // 选中位置
            let startIndexX = 9;
            let startIndexY = 9;
            this.lastPutCoord = new Array();
            this.lastChooseNodeIndex.forEach((value) => {
                startIndexX = Math.min(startIndexX, value[0]);
                startIndexY = Math.min(startIndexY, value[1]);
                this.lastPutCoord.push(value);
            });
            let colorType = placeholder.blockColor;
            this.moveBlock(
                placeholder,
                () => {
                    this.clearBlock(colorType);
                    this.onMoveBlockEnd();
                },
                this.lastChooseNodeIndex
            );
            mk.audio.playSubSound(AssetInfoDefine.audio.put);
            // 分数
            this.gameManager.scoreHelper.putBlock(placeholder.blockIndex, startIndexX, startIndexY);
            // 检查剩余块状态 置灰||重新生产块
            this.lastChooseNodeIndex = null;
        });
    }

    // protected onMoveBlockEnd(): void {
    //     this.refreshBoardView(this.gameManager.tableData);
    //     // 检查剩余块状态 置灰||重新生产块
    //     mk.sendEvent(BlockEventType.kEvent_Game_Logic_Move_Block_End);
    //     //放置完成后就刷新一次数据
    //     this.gameManager.updateLevelHistoryData();
    //     // 判断结束
    //     this.checkGameover();
    // }
    protected onGameOver() {
        this.unschedule(this.checkAiTipTimer);
        this.gameManager.updateLevelHistoryData();
    }
    protected newLocalPos = new Vec3();
    protected tempMat4 = new Mat4();
    private nodeAWorldMat4: any;
    protected targetNodeIndex;
    protected targetIndex;
    private sourceNode;
    private targetNode;
    protected moveBlock(placeholder: BlockPlaceholder3, callback, lastChooseNodeIndex: number[][]) {
        for (let i = 0; i < placeholder.blocks.length; i++) {
            this.targetNodeIndex = placeholder.blocks[i].targetNodeIndex;
            if (this.targetNodeIndex) {
                this.targetIndex = i;
                break;
            }
        }
        let key = this.targetNodeIndex[2];
        let sourceNode = this.blockMap.get(key).node;
        let targetNode = placeholder.blocks[this.targetIndex].node;
        // 移动至目标位置的世界坐标矩阵
        // let newLocalPos = new Vec3();
        // let tempMat4 = new Mat4();
        let nodeAWorldMat4 = targetNode.getWorldMatrix();
        //逆矩阵
        Mat4.invert(this.tempMat4, nodeAWorldMat4);
        //目标点的世界坐标转成本地坐标
        Vec3.transformMat4(this.newLocalPos, sourceNode.worldPosition, this.tempMat4);
        placeholder.moveToPosition(this.newLocalPos, callback, this.lastChooseNodeIndex);
    }

    // 消除块
    protected clearBlock(colorType: number) {
        // console.error("clearBlock");
        // 消除
        let scoreHelper = this.gameManager.scoreHelper;
        const [clearRow, clearCol] = this.getClearRowAndCol();
        this.onBeforeClearBlock();
        let hasClearRow = clearRow.length > 0;
        let hasClearCol = clearCol.length > 0;
        let animDuration = 0.1;

        if (hasClearRow) {
            // 消除行 动画
            let clearRowAnimation = 0;
            for (let index = 0; index < clearRow.length; index++) {
                const element = clearRow[index];
                for (let i = 0; i < this.gameManager.blockNumber; i++) {
                    this.onClearBlockEntity(element, i, this.gameManager.tableData[element][i]);
                    this.gameManager.tableData[element][i] = 0;
                }
                // this.gameManager.tableData[value] = [0, 0, 0, 0, 0, 0, 0, 0];
                clearRowAnimation = this.showClearAniWith(
                    new Vec3(0, -element * BlockCellSize + BoardClearFixHeight, 0),
                    0,
                    colorType
                );
                this.scheduleOnce(() => {
                    this.clearBlockWithRow(element);
                }, (2 * index + 1) * game.deltaTime);
            }
            clearRowAnimation += (2 * clearRow.length - 1) * game.deltaTime;
            animDuration = Math.max(clearRowAnimation, animDuration);
        }

        if (hasClearCol) {
            // 消除列 动画
            let clearRowAnimation = 0;
            for (let index = 0; index < clearCol.length; index++) {
                const element = clearCol[index];
                for (let i = 0; i < this.gameManager.blockNumber; i++) {
                    this.onClearBlockEntity(i, element, this.gameManager.tableData[i][element]);
                    this.gameManager.tableData[i][element] = 0;
                }
                clearRowAnimation = this.showClearAniWith(
                    new Vec3(element * BlockCellSize - BoardClearFixHeight, 0, 0),
                    90,
                    colorType
                );
                this.scheduleOnce(() => {
                    this.clearBlockWithCol(element);
                }, (2 * index + 2) * game.deltaTime);
            }
            clearRowAnimation += 2 * clearCol.length * game.deltaTime;
            animDuration = Math.max(clearRowAnimation, animDuration);
        }

        if (this.conditionView) {
            this.conditionView.doDiamondsAnim();
        }

        let clearNumber = clearRow.length + clearCol.length;
        let comboState = emComboState.None;
        if (GuideData.inst.isGuideFinished()) {
            comboState = scoreHelper.checkCombo(clearNumber);
        }
        let isClearAll = false;
        //检查下当前是否清理盘面
        if (SceneMode.gameMode == kGameMode.endless) {
            if (GuideData.inst.step == GuideData.inst.openGuideStep || GuideData.inst.isGuideFinished()) {
                isClearAll = this.gameManager.checkClearAllBlock();
                if (isClearAll) {
                    //清理盘面就缓存当前的分数
                    scoreHelper.recordClearAllFillScore(comboState, clearNumber, this.gameManager.getRound());
                }
            }
        }
        if (PREVIEW) {
            //console.log("消除需要时间：", animDuration * 0.9);
        }

        // this.onAfterClearBlockAnim(clearNumber, comboState);
        //计时等待动画播放完成后
        if (clearNumber > 0) {
            if (comboState == emComboState.Combo && scoreHelper.combo > 1)
                mk.sendEvent(BlockEventType.EVENT_CAMETA_SHAKE);
            this.scheduleOnce(() => {
                this.onClearnAnimationFinished(clearRow, clearCol, clearNumber, comboState, colorType, isClearAll);
                this.onAfterClearBlockAnim(clearNumber, comboState);
            }, animDuration * 0.9);

            mk.audio.playSubSound(AssetInfoDefine.audio.clear_1);
            this.refreshCombo(comboState, true);
            this.recordLineCount(clearNumber);
        } else if (GuideData.inst.step < 4) {
            this.scheduleOnce(() => {
                this.onAfterClearBlockAnim(0, emComboState.None);
            });
        } else {
            this.refreshCombo(comboState, false);
            this.onFinalAddScore();
        }
    }
    protected recordLineCount(clearNumber: number): void {
        if (!clearNumber) {
            return;
        }
        UserData.inst.ClearLineCount += clearNumber;
    }
    // protected comboAnimNode: Node;
    protected showComboAni(show: boolean, comboTimes: number = 0): void {
        BlockEventManager.instance.emit(BlockEventType.BLOCK_COMBO, show, comboTimes);
        // if (show) {
        //     if (this.comboAnimNode == null) {
        //         let comboNode = NodePoolManager.inst.getPool(AssetInfoDefine.prefab.comboAni.path).get();
        //         if (comboNode) {
        //             comboNode.setParent(this.node);
        //             comboNode.setPosition(Vec3.ZERO);
        //             this.comboAnimNode = comboNode;
        //         }
        //     }
        // }
        // else {
        //     if (this.comboAnimNode) {
        //         let originOp: [number, number][] = [];
        //         let colors: [Color, Color][] = [];
        //         const pss = this.comboAnimNode.getComponentsInChildren(ParticleSystem);
        //         for (let index = 0; index < pss.length; index++) {
        //             const ps = pss[index];
        //             colors.push([ps.startColor.colorMin, ps.startColor.colorMax]);
        //             originOp.push([ps.startColor.colorMin.a, ps.startColor.colorMax.a]);
        //         }

        //         tween(this.comboAnimNode).to(1, {}, {
        //             onUpdate(target?, ratio?) {
        //                 const r = 1 - ratio;
        //                 for (let index = 0; index < pss.length; index++) {
        //                     const ps = pss[index];
        //                     ps.startColor.colorMin.a = r * originOp[index][0];
        //                     ps.startColor.colorMax.a = r * originOp[index][1];
        //                 }
        //             },
        //         }).call(() => {
        //             for (let index = 0; index < pss.length; index++) {
        //                 const ps = pss[index];
        //                 ps.startColor.colorMin.a = originOp[index][0];
        //                 ps.startColor.colorMax.a = originOp[index][1];
        //             }
        //             NodePoolManager.inst.getPool(AssetInfoDefine.prefab.comboAni.path).put(this.comboAnimNode);
        //             this.comboAnimNode = null;
        //         }).start();
        //     }
        // }
    }
    /**
     *
     * @param userId
     * @param combo
     */
    protected showComboScore(
        userId: number,
        combo: number,
        clearnCount: number,
        putPosition: Vec3,
        colorType: number,
        isClearAll: boolean
    ) {
        // let score = this.gameManager.scoreHelper.getContinueClearBlockScore(combo, clearnCount);
        let clearScore = this.gameManager.scoreHelper.getClearBlockScore(clearnCount, combo);
        let comboNode = NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.comboScore.path).get();
        if (comboNode) {
            let comboCmpt = comboNode.getComponent(ComboScore);
            if (comboCmpt) {
                // let totalScore = score + clearScore;
                let totalScore = clearScore;
                comboCmpt.showComobScore({ combo: combo, score: totalScore });
                comboNode.setParent(this.rootEffect);
                //计算左右边界
                if (comboCmpt.comboPosFix) {
                    let childuiTrans = comboCmpt.comboPosFix.getComponent(UITransform);
                    let [cw, ch] = [childuiTrans.width, childuiTrans.height];
                    let uiTrans = this.node.getComponent(UITransform);
                    let [w, h] = [uiTrans.width, uiTrans.height];
                    let [limitx, limity] = [w * 0.5 - cw * 0.5, h * 0.5 - ch * 0.5];
                    let p = new Vec3(
                        Math.sign(putPosition.x) * Math.min(Math.abs(putPosition.x), limitx),
                        putPosition.y,
                        0
                    );
                    comboNode.setPosition(p);
                    const ani = comboNode.getComponent(Animation);
                    ani.play();
                    let self = this;
                    ani.once(Animation.EventType.FINISHED, () => {
                        if (this && this.node.isValid) {
                            this.showMultipleClearEffect(clearnCount, totalScore, colorType, p, isClearAll);
                        }
                        mk.sendEvent(BlockEventType.EVENT_COMBO_BLOCK_END, userId, combo, clearnCount);
                        self && self.gameManager && self.gameManager.updateLevelHistoryData();
                        NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.comboScore.path).put(comboNode);
                    });
                }
            }
        }
    }

    protected onBeforeClearBlock() { }
    protected onClearBlockEntity(rol: number, col: number, blockType: number) { }
    protected refreshCombo(comboState: emComboState, hasClear: boolean) {
        let comboTimes = this.gameManager.scoreHelper.getComboTimes();
        // console.log("连击次数：", comboTimes);
        if (comboState == emComboState.Combo_End || comboState == emComboState.Combo_BREAK) {
            ShakeManager.getInstance().Shake(emShakeLevel.light);
            this.showComboAni(false);
        } else {
            if (comboState == emComboState.Combo) {
                if (comboTimes > 1) {
                    this.showComboAni(true, comboTimes);
                }
                if (comboTimes > 2) {
                    ShakeManager.getInstance().Shake(emShakeLevel.medium);
                } else if (comboTimes > 1) {
                    ShakeManager.getInstance().Shake(emShakeLevel.medium);
                } else {
                    ShakeManager.getInstance().Shake(emShakeLevel.light);
                }
                if (comboTimes > 2) {
                    if (comboTimes < 5) {
                        ShakeManager.getInstance().ShakeCamera(emShakeLevel.light);
                    } else {
                        ShakeManager.getInstance().ShakeCamera(emShakeLevel.medium);
                    }
                }
            } else if (comboState == emComboState.Combo_WAIT) {
                ShakeManager.getInstance().Shake(emShakeLevel.light);
            }
        }
    }
    protected onAfterClearBlockAnim(clearNumber: number, comboState: emComboState) {
        if (!this.isGuideFinished) {
            if (!this.isLastGuide) {
                if (SceneMode.gameMode == kGameMode.endless) {
                    this.gameManager.initWithGuideData(true, GuideData.inst.getGuideBoard());
                } else if (SceneMode.gameMode == kGameMode.adventure_level) {
                    this.gameManager.initWithGuideData(true, LevelGuideData.inst.getGuideBoard());
                }
                this.onStepFinished();
            }
        }
    }
    protected onClearnAnimationFinished(
        clearRow,
        clearCol,
        clearNumber: number,
        comboState: emComboState,
        colorType: number,
        isClearAll: boolean
    ) {
        //判断是否展示多行 提示消除行提示加分
        let userId = mk.msgData?.Login?.userId;
        let comboTimes = this.gameManager.scoreHelper.getComboTimes();
        mk.sendEvent(BlockEventType.EVENT_CLEAR_BLOCK_END, userId, clearNumber, comboTimes);
        this.gameManager.updateLevelHistoryData();
        let putPosition = this.getClearPosition(clearRow, clearCol);
        //计算连击
        if (comboState == emComboState.Combo && comboTimes > 1) {
            this.showComboScore(userId, comboTimes - 1, clearNumber, putPosition, colorType, isClearAll);
            // this.showComboAni(true, comboTimes);
            let soundNum = Math.min(comboTimes - 2, 6);
            let soundPath = "combo_" + soundNum;
            // console.log("soundPath:", soundPath);
            mk.audio.playSubSound(AssetInfoDefine.audio[soundPath]);
        } else {
            let score = this.gameManager.scoreHelper.getClearBlockScore(clearNumber, 0);
            if (clearNumber > 1) {
                this.showMultipleClearEffect(clearNumber, score, colorType, putPosition, isClearAll);
            } else {
                this.showAddClearScoreAnimation(score, clearRow, clearCol, clearNumber, putPosition, isClearAll);
            }
        }
    }
    showMultipleClearEffect(
        clearNumber: number,
        score: number,
        blockType: number,
        position: Vec3,
        isClearAll: boolean
    ) {
        // if (clearNumber > 1) {
        //计算左右边界
        if (clearNumber > 1) {
            let soundNum = Math.min(clearNumber, 6);
            let clearPath = "clear_" + soundNum;
            mk.audio.playSubSound(AssetInfoDefine.audio[clearPath]);
        }
        let node = NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.cool.path).get();
        node.parent = this.rootEffect;
        let mutilScore = node.getComponent(MutilLineScore);
        if (mutilScore) {
            mutilScore.showScore({ score: score, clearCnt: clearNumber, blockColor: blockType });
            let anim = node.getComponent(Animation);
            if (anim) {
                anim.once(
                    Animation.EventType.FINISHED,
                    () => {
                        NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.cool.path).put(node);
                        if (isClearAll) {
                            this.checkClearAllAfterAddScore(true);
                        } else {
                            this.onFinalAddScore();
                        }
                    },
                    this
                );
                anim.play();
            }
            let childuiTrans: UITransform = mutilScore.getComboPosFixNode().getComponent(UITransform);
            let [cw, ch] = [childuiTrans.width, childuiTrans.height];
            let uiTrans = this.node.getComponent(UITransform);
            let [w, h] = [uiTrans.width, uiTrans.height];
            let [limitx, limity] = [300 - cw * 0.5, h * 0.5 - ch * 0.5];
            let yoffset: number = 0; //特效相对于分数位置
            let p = new Vec3(Math.sign(position.x) * Math.min(Math.abs(position.x), limitx), position.y - yoffset, 0);
            node.setPosition(p);
        }
        // }
    }
    protected showAddClearScoreAnimation(
        score: number,
        clearRow: number[],
        clearCol: number[],
        clearNumber: number,
        putPosition: Vec3,
        isClearAll: boolean
    ): void {
        //添加分数展示
        let scoreLabel = NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.addScore.path).get();
        if (scoreLabel) {
            scoreLabel.setParent(this.rootEffect);
            scoreLabel.setPosition(putPosition);
            scoreLabel.getComponent(AddScoreLabel).setScore(score);
            scoreLabel.getComponent(AddScoreLabel).show(
                Vec3.ONE,
                (node) => {
                    NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.addScore.path).put(node);
                    if (clearNumber > 1) {
                        //有消除检查是否清屏幕
                        this.checkClearAllAfterAddScore(isClearAll);
                    } else {
                        //无消除检查是否难度变化等
                        this.onFinalAddScore();
                    }
                },
                scoreLabel
            );
        }
    }

    protected checkClearAllAfterAddScore(isClearAll: boolean) {
        //检查是否是清屏 引导期间不提示
        if (SceneMode.gameMode == kGameMode.endless) {
            if (isClearAll && this.gameManager.canShowClearRound()) {
                // this.refreshAllBoardAni(BoardPreviewData.previewBoardData, true);
                let path = AssetInfoDefine.prefab.clear_all.path;
                let clear_all = NodePoolManager.inst.getPoolFromBlock(path).get();
                clear_all.parent = this.rootEffect;
                let { ani, time } = ShaderFrame.playAnimShaderFrame(clear_all);
                ani.play();
                ani.once(
                    Animation.EventType.FINISHED,
                    () => {
                        NodePoolManager.inst.getPool(path).put(clear_all);
                    },
                    this
                );
                this.showAddClearAllScoreAnimation();
                // let qipanPath = AssetInfoDefine.prefab.clear_all_qipan.path;
                // let clear_all_qc = NodePoolManager.inst.getPoolFromBlock(qipanPath).get();
                // clear_all_qc.parent = this.rootEffect;
                // let ani_qc = clear_all_qc.getComponent(Animation);
                // ani_qc.play();
                // clear_all_qc.position = new Vec3(0, 50, 0);
                // ani_qc.once(
                //     Animation.EventType.FINISHED,
                //     () => {
                //         NodePoolManager.inst.getPoolFromBlock(qipanPath).put(clear_all_qc);
                //         let path = AssetInfoDefine.prefab.clear_all.path;
                //         let clear_all = NodePoolManager.inst.getPoolFromBlock(path).get();
                //         clear_all.parent = this.rootEffect;
                //         let { ani, time } = ShaderFrame.playAnimShaderFrame(clear_all);
                //         ani.play();
                //         ani.once(
                //             Animation.EventType.FINISHED,
                //             () => {
                //                 NodePoolManager.inst.getPool(path).put(clear_all);
                //             },
                //             this
                //         );
                //         this.showAddClearAllScoreAnimation();
                //     },
                //     this
                // );
            } else {
                this.onFinalAddScore();
            }
        }
    }
    protected showAddClearAllScoreAnimation(): void {
        let score = this.gameManager.scoreHelper.clearAllScore;
        //添加分数展示
        let scoreLabel = NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.addScore.path).get();
        if (scoreLabel) {
            scoreLabel.setParent(this.rootEffect);
            scoreLabel.setPosition(0, BlockCellSize, 0);
            scoreLabel.getComponent(AddScoreLabel).setScore(score);
            scoreLabel.getComponent(AddScoreLabel).show(
                Vec3.ONE,
                (node) => {
                    NodePoolManager.inst.getPoolFromBlock(AssetInfoDefine.prefab.addScore.path).put(node);
                    let userId = mk.msgData?.Login?.userId;
                    mk.sendEvent(BlockEventType.EVENT_CLEAR_ALL_BLOCK_END, userId);
                    this.onFinalAddScore();
                },
                scoreLabel
            );
        }
    }

    async executeTasksSequentially<T>(tasks: (() => Promise<T>)[], callback: () => void) {
        for (const task of tasks) {
            try {
                await task();
            } catch (error) {
                console.error("Error executing task:", error);
            }
        }
        callback();
    }
    /**
     * 最终加分完成后的任务放到这里
     */
    protected onFinalAddScore() {
        if (SceneMode.gameMode == kGameMode.endless) {
            if (PREVIEW) {
                //console.log("final score:", this.gameManager.scoreHelper.score);
            }
            let scoreHelper = this.gameManager.scoreHelper as EndlessScoreHelper;
            let tasks = [];


            let challengeBrain = [1000, 3000, 5000, 9000000]
            // 锻炼大脑
            let challengeBrainNum = UserData.inst.getchallengeBrain();
            let curPassChallengeBrain = scoreHelper.score > challengeBrain[challengeBrainNum];
            let playAnim = true;
            if (this.challengeBrainGroup == 1 && curPassChallengeBrain) {
                playAnim = false;
                UserData.inst.setchallengeBrain(challengeBrainNum + 1);
                let pathInfo2 = AssetInfoDefine.prefab.passChallengeBrain;
                tasks.push(
                    () =>
                        new Promise<number>((resolve) => {
                            ResManager.getInstance()
                                .loadNode(pathInfo2.path, pathInfo2.bundle, this.enhanceAnimParent)
                                .then((nd) => {
                                    for (let index = 0; index < 4; index++) {
                                        let nd = this.challengeBrain.getChildByPath("challenge" + index);
                                        nd.active = index == UserData.inst.getchallengeBrain();
                                    }
                                    let pathinfo3 = AssetInfoDefine.prefab.passChallengeBrainLevelUp;
                                    ResManager.getInstance()
                                        .loadNode(pathinfo3.path, pathinfo3.bundle, this.challengeBrain)
                                        .then((nd) => {
                                            this.scheduleOnce(() => {
                                                nd.destroy();
                                            }, 3);
                                        });
                                    this.scheduleOnce(() => {
                                        nd.destroy();
                                    }, 3);
                                });

                        })
                );
            }

            //todo FENGHE优化
            if (EndlessProgressHelper.getInstance().currentReachPercent <= 7) {
                let reachPercentMap = scoreHelper.getProgressScoreMap();
                let curScore = reachPercentMap[EndlessProgressHelper.getInstance().currentReachPercent];
                let curPassPercent = scoreHelper.score > curScore;
                let curPassKey = `kIsPlayedReachPercent_${curScore}`;
                let hasShown = FlagData.inst.hasFlag(curPassKey);
                if (curPassPercent && !hasShown) {
                    FlagData.inst.recordFlag(curPassKey, true);
                    if (playAnim) {
                        tasks.push(
                            () =>
                                new Promise<number>((resolve) => {
                                    let pathInfo = AssetInfoDefine.prefab.reachPercent;
                                    let path = pathInfo.path;
                                    let reach_percent = NodePoolManager.inst
                                        .getPoolWithBundleName(path, pathInfo.bundle)
                                        .get();
                                    reach_percent.setParent(this.reachPercent);
                                    reach_percent.setPosition(Vec3.ZERO);
                                    let ani = reach_percent.getComponent(UIPlayAnimations);
                                    reach_percent.getChildByPath("newanim/shellnode/Label").getComponent(Label).string =
                                        curScore.toString();
                                    ani.play();
                                    let particles = reach_percent.getComponent(UIPlayEffectParticle);
                                    particles.play();
                                    reach_percent.getChildByPath("newanim/ef_particle").active = true;
                                    EndlessProgressHelper.getInstance().currentReachPercent++;
                                    this.scheduleOnce(() => {
                                        NodePoolManager.inst
                                            .getPoolWithBundleName(path, pathInfo.bundle)
                                            .put(reach_percent);
                                        resolve(1);
                                    }, 2);
                                })
                        );
                    }

                }
            }
            if (EndlessProgressHelper.getInstance().currentReachEnhance <= 5) {
                let reachEnhanceMap = scoreHelper.getEnhancedScoreMap();
                let curScore = reachEnhanceMap[EndlessProgressHelper.getInstance().currentReachEnhance];
                let curPassEnhance = scoreHelper.score > curScore;
                let curPassKey = `kIsPlayedReachEnhance_${curScore}`;
                let hasShown = FlagData.inst.hasFlag(curPassKey);

                console.log("curPassEnhance:", curPassEnhance, "hasShown:", hasShown);
                if (
                    curPassEnhance &&
                    !hasShown &&
                    this.enhanceAnimParent != undefined &&
                    this.enhanceAnimParent != null
                ) {
                    FlagData.inst.recordFlag(curPassKey, true);
                    if (playAnim) {
                        tasks.push(
                            () =>
                                new Promise<number>((resolve) => {
                                    EndlessProgressHelper.getInstance().currentReachEnhance++;
                                    let i = UserData.inst.getchallengeTarget();
                                    let pathInfo = AssetInfoDefine.prefab.reachEnhance;


                                    // 挑战模式

                                    if (EndlessProgressHelper.getInstance().currentReachEnhance > i) {
                                        UserData.inst.setchallengeTarget(
                                            EndlessProgressHelper.getInstance().currentReachEnhance
                                        );
                                        UserRemoteDataManager.inst.setChallengeTargeCompleted(
                                            EndlessProgressHelper.getInstance().currentReachEnhance
                                        );

                                        if (reachEnhanceMap[EndlessProgressHelper.getInstance().currentReachEnhance]) {
                                            if (this.challengeBrainGroup == 0) {
                                                this.challengeTarget.active = true;
                                                this.challengeTargetScore.string =
                                                    reachEnhanceMap[
                                                        EndlessProgressHelper.getInstance().currentReachEnhance
                                                    ].toString();
                                                let path2 =
                                                    "res/texture/challengeTarget/target" +
                                                    EndlessProgressHelper.getInstance().currentReachEnhance.toString();
                                                ResManager.getInstance()
                                                    .loadSpriteFrame(path2, "block")
                                                    .then((sprite) => {
                                                        this.challengeText.spriteFrame = sprite;
                                                    });

                                                pathInfo = AssetInfoDefine.prefab.reachEnchanceSuccess;
                                                ResManager.getInstance()
                                                    .loadNode(pathInfo.path, pathInfo.bundle, this.enhanceAnimParent)
                                                    .then((nd) => {
                                                        this.scheduleOnce(() => {
                                                            nd.destroy();
                                                        }, 3);
                                                    });
                                            }
                                        } else if (
                                            EndlessProgressHelper.getInstance().currentReachEnhance ==
                                            Object.keys(reachEnhanceMap).length + 1
                                        ) {
                                            this.challengeTarget.active = false;
                                            pathInfo = AssetInfoDefine.prefab.reachEnchanceSuccess;
                                            ResManager.getInstance()
                                                .loadNode(pathInfo.path, pathInfo.bundle, this.enhanceAnimParent)
                                                .then((nd) => {
                                                    this.scheduleOnce(() => {
                                                        nd.destroy();
                                                    }, 3);
                                                });
                                        } else {
                                            this.challengeTarget.active = false;
                                        }
                                    } else {
                                        let path = pathInfo.path;
                                        let reach_enhance = NodePoolManager.inst
                                            .getPoolWithBundleName(path, pathInfo.bundle)
                                            .get();
                                        reach_enhance.setParent(this.enhanceAnimParent);
                                        reach_enhance.setPosition(Vec3.ZERO);
                                        let ani = reach_enhance.getComponent(UIPlayAnimations);
                                        reach_enhance
                                            .getChildByPath("Node/words_animation/score")
                                            .getComponent(Label).string = curScore.toString();
                                        ani.play();
                                        let particles = reach_enhance.getComponent(UIPlayEffectParticle);
                                        particles.play();
                                        reach_enhance.getChildByPath("Node/ef_beyond_friend_end_particle").active = true;

                                        this.scheduleOnce(() => {
                                            NodePoolManager.inst
                                                .getPoolWithBundleName(path, pathInfo.bundle)
                                                .put(reach_enhance);
                                            resolve(1);
                                            // display next target
                                        }, 2);
                                    }
                                }
                                )

                        );
                    }
                }
            }

            if (scoreHelper.isBestScore && !UserData.inst.isNewRecordPlayed && !scoreHelper.isFirstChallange) {
                UserData.inst.isNewRecordPlayed = true;
                tasks.push(
                    () =>
                        new Promise((resolve, reject) => {
                            let node = NodePoolManager.inst
                                .getPoolFromBlock(AssetInfoDefine.prefab.newRecord.path)
                                .get();
                            node.setParent(this.rootEffect);
                            node.setPosition(Vec3.ZERO);
                            let ani = node.getComponent(Animation);
                            // let { ani, time } = ShaderFrame.playAnimShaderFrame(node);
                            ani.play();
                            this.scheduleOnce(() => {
                                mk.audio.playSubSound(AssetInfoDefine.audio.new_record);
                            });
                            ani.once(
                                Animation.EventType.FINISHED,
                                () => {
                                    NodePoolManager.inst
                                        .getPoolFromBlock(AssetInfoDefine.prefab.newRecord.path)
                                        .put(node);
                                    resolve(true);
                                },
                                this
                            );
                        })
                );
            }
            if (scoreHelper.checkDiffcultScore()) {
                tasks.push(
                    () =>
                        new Promise<number>((resolve) => {
                            let pathInfo = AssetInfoDefine.prefab.diffult_change;
                            let path = pathInfo.path;
                            let diff_up = NodePoolManager.inst.getPoolWithBundleName(path, pathInfo.bundle).get();
                            if (diff_up) {
                                diff_up.parent = this.rootEffect;
                                let ani = diff_up.getComponent(Animation);
                                ani.play();
                                ani.once(
                                    Animation.EventType.FINISHED,
                                    () => {
                                        NodePoolManager.inst.getPoolWithBundleName(path, pathInfo.bundle).put(diff_up);
                                        resolve(1);
                                    },
                                    this
                                );
                            }
                        })
                );
            }

            this.executeTasksSequentially(tasks, () => {
                if (PREVIEW) {
                    //console.log("所有加分后的特效任务完成了:", tasks.length);
                }
            });
        }
    }

    protected getClearPosition(clearRow: number[], clearCol: number[]) {
        let rows = clearRow;
        let cols = clearCol;
        let choseIndexes = this.lastPutCoord;
        if (choseIndexes) {
            rows = [];
            cols = [];
            for (let index = 0; index < choseIndexes.length; index++) {
                const element = choseIndexes[index];
                const row = element[0];
                const col = element[1];
                if (clearRow.indexOf(row) > -1 || clearCol.indexOf(col) > -1) {
                    rows.push(row);
                    cols.push(col);
                }
            }
        }

        let { centerRow, centerCol } = this.getClearCenterIndex(rows, cols);
        let entityKey = centerRow * 100 + centerCol;
        let entity = this.blockMap.get(entityKey);
        if (entity) {
            // let entity = this.blockMap.get(entityKey);
            let worldPosition = entity.node.parent
                .getComponent(UITransform)
                .convertToWorldSpaceAR(entity.node.position);
            let trans = this.node.getComponent(UITransform);
            if (trans) {
                let localPos = trans.convertToNodeSpaceAR(worldPosition);
                return localPos;
            }
        }
        return Vec3.ZERO;
    }
    //根据行和列计算位置
    protected getClearCenterIndex(clearRow: number[], clearCol: number[]) {
        clearRow = clearRow || [];
        clearCol = clearCol || [];

        let centerRow = 3;
        if (clearRow.length > 0) {
            let totalRow = 0;
            let effectRow = clearRow.filter((row) => {
                if (row > -1 && row < 8) {
                    totalRow += row;
                    return true;
                }
                return false;
            });
            centerRow = effectRow.length > 0 ? Math.ceil(totalRow / effectRow.length) : 3;
        }

        let centerCol = 3;
        if (clearCol.length > 0) {
            let totalCol = 0;
            let effectCol = clearCol.filter((col) => {
                if (col > -1 && col < 8) {
                    totalCol += col;
                    return true;
                }
                return false;
            });
            centerCol = effectCol.length > 0 ? Math.ceil(totalCol / effectCol.length) : 3;
        }

        return { centerRow, centerCol };
    }
    private clearAnimScale = new Vec3(1.5, 1.5, 1.5);
    // 展示消除动画
    public showClearAniWith(position: Vec3, angle: number = 0, colorType: number) {
        let poolName = angle == 0 ? "BlockClearAni_H" : "BlockClearAni_V";
        // let poolName = angle == 0 ? "BlockClearAni" : "BlockClearAni";
        let aniNode = this.gameManager.getNodePoolWithPoolType(poolName).get();
        aniNode.parent = this.rootEffect;

        aniNode.position = position;
        aniNode.scale = this.clearAnimScale;
        // aniNode.angle = angle;
        let clearComponent = aniNode.getComponent(UIPlayClearParticle);
        let colorIndex = colorType - 1;
        let colorArr = BlockConstData.BlockColor;
        if (colorIndex > -1 && colorIndex < colorArr.length) {
            let color = colorArr[colorIndex];
            // aniNode.getComponent(Sprite).color = color;
            if (clearComponent) {
                clearComponent.setColor(color);
            }
        } else {
            // aniNode.getComponent(Sprite).color = colorArr[0];
            if (clearComponent) {
                clearComponent.setColor(colorArr[0]);
            }
        }
        if (clearComponent) {
            clearComponent.play();
        }

        this.scheduleOnce(() => {
            if (this.gameManager == null) {
                //为什么会有空的情况呢
                return;
            }
            this.gameManager.getNodePoolWithPoolType(poolName).put(aniNode);
            if (clearComponent) {
                clearComponent.stop();
            }
        }, 1);
        // if (poolName == "BlockClearAni") {
        //     let animation = aniNode.getComponent(Animation);
        //     animation.play("show_block_clear");
        //     let self = this;
        //     animation.once(Animation.EventType.FINISHED, () => {
        //         // console.log("回收动画节点:", aniNode.name);
        //     });
        //     if (animation.defaultClip) {
        //         return animation.defaultClip.duration;
        //     }
        // }
        return 0.2;
    }

    protected clearBlockWithRow(row) {
        let key = 0;
        let entity: BlockEntity;
        for (let i = 0; i < this.gameManager.blockNumber; i++) {
            key = row * 100 + i;
            entity = this.blockMap.get(key);
            entity.clearColor();
        }
    }

    protected clearBlockWithCol(col) {
        let key = 0;
        let entity: BlockEntity;
        for (let i = 0; i < this.gameManager.blockNumber; i++) {
            key = i * 100 + col;
            entity = this.blockMap.get(key);
            entity.clearColor();
        }
    }

    // 检查与上次可选区域是否一致
    protected checkEqualChooseNodeIndex(chooseIndex: Array<Array<number>>) {
        if (this.lastChooseNodeIndex == null) {
            return false;
        }

        if (this.lastChooseNodeIndex == chooseIndex) {
            return true;
        }

        if (this.lastChooseNodeIndex.length != chooseIndex.length) {
            return false;
        }

        let result = true;
        this.lastChooseNodeIndex.forEach((value, index) => {
            if (value[0] != chooseIndex[index][0] || value[1] != chooseIndex[index][1]) {
                result = false;
            }
        });
        return result;
    }

    // 选中状态刷新 牌桌
    protected refreshBoardViewWithChoose(blockIndex: number, blockType: number) {
        let startIndexX = 9;
        let startIndexY = 9;

        this.lastChooseNodeIndex &&
            this.lastChooseNodeIndex.forEach((value) => {
                startIndexX = Math.min(startIndexX, value[0]);
                startIndexY = Math.min(startIndexY, value[1]);
            });

        let putPoses = [];
        this.lastChooseNodeIndex &&
            this.lastChooseNodeIndex.forEach((value) => {
                let key = value[2];
                putPoses.push(key);
                let useblockType = blockType;
                if (this.chooseBlocksData.has(key)) {
                    useblockType = this.chooseBlocksData.get(key);
                }
                const entity: BlockEntity = this.blockMap.get(key);
                entity.refreshByMoveBlock(useblockType, true);
                // const valueType = (value[0] - startIndexX) + "-" + (value[1] - startIndexY);
                // let [top, bottom, left, right, top_left, top_right, bottom_left, bottom_right] =
                //     window["BlockConst"][`${blockIndex}`].border[valueType];
                // entity.refreshBorder(top, bottom, left, right, top_left, top_right, bottom_left, bottom_right);
            });

        const [clearRow, clearCol] = this.gameManager.getClearRowAndCol(
            this.blocks.map((_array) => {
                return _array.map((value) => {
                    return value.blockType;
                });
            })
        );

        clearRow?.forEach((value) => {
            for (let i = 0; i < this.gameManager.blockNumber; i++) {
                let key = value * 100 + i;
                const entity: BlockEntity = this.blockMap.get(key);
                let opacity = putPoses.indexOf(key) > -1;
                entity.onlyRefreshColor(blockType, opacity);
                entity.resetScale(blockType);
            }
        });
        clearCol?.forEach((value) => {
            for (let i = 0; i < this.gameManager.blockNumber; i++) {
                let key = i * 100 + value;
                let opacity = putPoses.indexOf(key) > -1;
                const entity: BlockEntity = this.blockMap.get(key);
                entity.onlyRefreshColor(blockType, opacity);
                entity.resetScale(blockType);
            }
        });
    }

    // 获取可消除的行列数
    protected getClearRowAndCol() {
        // 刷新tableData
        this.gameManager.tableData = this.blocks.map((_array) => {
            return _array.map((value) => {
                return value.blockType;
            });
        });

        return this.gameManager.getClearRowAndCol();
    }

    // 根据世界坐标获取对应的块id 行-列
    public getNodeIndexWithPosition(worldPosition: Vec3): Array<number> {
        let position = this.blockParentTransform.convertToNodeSpaceAR(worldPosition);
        let cellSize = BlockConstData.BlockSpriteSize.x;
        let fixPosition = cellSize * 4;
        let col = Math.floor((position.x + fixPosition) / cellSize);
        if (col < 0 || col > 7) return null;
        let row = 7 - Math.floor((position.y + fixPosition) / cellSize);
        if (row < 0 || row > 7) return null;
        return [row, col, row * 100 + col];
    }

    // private async initStartAni() {
    //     this.blockPreviewAniMap = new Map<number, BlockEntity>();
    //     if (!this.gameManager) {
    //         this.gameManager = Game.inst;
    //     }
    //     for (let i = 0; i < this.gameManager.blockNumber; i++) {
    //         for (let j = 0; j < this.gameManager.blockNumber; j++) {
    //             let key = i * 100 + j;
    //             const previewAniNode = this.gameManager.getNodePoolWithPoolType("BlockEntityPreviewAniPool").get();
    //             previewAniNode.parent = this.previewAniBlockParent;
    //             const previewAniBlockEntity = previewAniNode.getComponent(BlockEntity);
    //             previewAniBlockEntity.setCoord(i, j, key);
    //             this.blockPreviewAniMap.set(key, previewAniBlockEntity);
    //         }
    //     }
    // }

    private initNodeData() {
        this.blocks = new Array<Array<BlockEntity>>();
        this.blockMap = new Map<number, BlockEntity>();

        this.blockParent = this.node.getChildByName("blocks");
        this.previewAniBlockParent = this.node.getChildByName("previewAniBlocks");

        this.blockParentTransform = this.blockParent.getComponent(UITransform);

        for (let i = 0; i < this.gameManager.blockNumber; i++) {
            if (this.blocks[i] == null) {
                this.blocks[i] = new Array<BlockEntity>();
            }

            for (let j = 0; j < this.gameManager.blockNumber; j++) {
                const node = this.gameManager.getNodePoolWithPoolType("BlockEntityPool").get();
                const blockEntity: BlockEntity = node.getComponent(BlockEntity);

                node.parent = this.blockParent;
                let key = i * 100 + j;
                blockEntity.setCoord(i, j, key);
                this.blocks[i].push(blockEntity);
                this.blockMap.set(key, blockEntity);
                this.onBlockEntityLoaded(i, j, blockEntity);
                // node.name = `block-${i}-${j}`;
            }
        }
    }
    protected onBlockEntityLoaded(rol: number, col: number, entity: BlockEntity) { }
    protected onLevelRefresh() { }
    public refreshBoardView(boardData: Array<Array<number>>) {
        // this.showComboAni(false);
        for (let i = 0; i < boardData.length; i++) {
            for (let j = 0; j < boardData[i].length; j++) {
                let key = i * 100 + j;
                const blockEntity = this.blockMap.get(key);
                blockEntity.refreshColor(boardData[i][j]);
            }
        }
    }
    onBtnGoLevel() {
        SceneMode.gameMode = kGameMode.adventure_level;
        ResManager.getInstance().gotoScene("level", "block").then();
    }

    onBtnClickRefreshAll() {
        if (!this.gameManager.isCanRefreshAll()) {
            SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_no_change_times"));
            return;
        }
        if (this.gameManager.isGameOver) {
            return;
        }
        mk.audio.playBtnEffect();
        // mk.sdk.instance.reportBI(biEventId.ad_refresh_all_block, {
        //     ad_status: emAdStatus.WakeUp,
        //     ad_mode: SceneMode.gameMode,
        // });
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Block_Refresh_All)
            .then(() => {
                this.gameManager.onAdRefreshAllBlock();
                this.gameManager.addChangeAllTimes();
                this.refreshBtnRefreshAll();
                // mk.sdk.instance.reportBI(biEventId.ad_refresh_all_block, {
                //     ad_status: emAdStatus.Finished,
                //     ad_mode: SceneMode.gameMode,
                // });
            })
            .catch((err: dtSdkError) => {
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    // mk.sdk.instance.reportBI(biEventId.ad_refresh_all_block, {
                    //     ad_status: emAdStatus.Closed,
                    //     ad_mode: SceneMode.gameMode,
                    // });
                    return;
                }
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }

    onBtnClickChangeAll() {
        // if (!this.gameManager.isCanChangeAll()) {
        //     SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_no_change_times"));
        //     return;
        // }
        // if (this.gameManager.isGameOver) {
        //     return;
        // }
        // mk.audio.playBtnEffect();
        // this.gameManager.useChangeAllTimes();
        this.gameManager.relifeCurrentLevel();
        this.refreshBtnRefreshAll();
        // mk.sdk.instance.reportBI(biEventId.item_use_change_all, {
        //     current: this.gameManager.changeAllTimes,
        //     game_mode: SceneMode.gameMode,
        // });
    }

    //#region 引导相关
    private isLastGuide: boolean = false;
    private isGuideFinished: boolean = false;
    protected getGuideDataInst(): any {
        return GuideData.inst;
    }
    protected onMoveBlockEnd(): void {
        let guideData = this.getGuideDataInst();
        this.isGuideFinished = guideData.isGuideFinished();

        if (this.newGuideStep1) {
            this.newGuideStep1.active = false;
        }

        if (this.newGuideStep2) {
            this.newGuideStep2.active = false;
        }

        if (this.newGuideStep3) {
            this.newGuideStep3.active = false;
        }

        if (!this.isGuideFinished) {
            this.isLastGuide = guideData.isLastGuide();

            let step = guideData.step;
            let mode = SceneMode.gameMode;
            let guide_step_key = `${BIEventID.guide_step}_${mode}_${step}_1`;
            if (!FlagData.inst.hasFlag(guide_step_key)) {
                let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
                console.log(
                    "[BoardView] onStepFinished group = ",
                    group == 0 ? BIEventID.guide_step : BIEventID.guide_step_new
                );
                mk.sdk.instance.reportBI(
                    group == 0 ? BIEventID.guide_step : BIEventID.guide_step_new,
                    {
                        // gameNumber: UserData.inst.gameNumber,
                        proj_g_step: guideData.step,
                        proj_g_state: 1,
                    },
                    true
                );
                FlagData.inst.recordFlag(guide_step_key);
            }
            guideData.step += 1;
            if (this.isLastGuide) {
                this.gameManager.initTableData();
                this.onStepFinished();
                if (!FlagData.inst.hasFlag(BIEventID.af_gudie_end)) {
                    //mk.sdk.instance.reportAf(BIEventID.af_gudie_end, {}, true);
                    FlagData.inst.recordFlag(BIEventID.af_gudie_end);
                }
            }
        } else {
            //引导中的刷新放到动画播放结束之后
            this.onStepFinished();
        }
    }
    protected onStepFinished(): void {
        if(this.isPlayEndEffing){
            return
        }
        this.refreshBoardView(this.gameManager.tableData);
        // 检查剩余块状态 置灰||重新生产块
        mk.sendEvent(BlockEventType.kEvent_Game_Logic_Move_Block_End);

        // 判断结束
        this.checkGameover();
    }
    private setPercentImageState(node: Node, state: number) {
        let beforePercent = node.getChildByPath("break/text/Sprite/BeforePercent");
        let afterPercent = node.getChildByPath("break/text/Sprite/AfterPercent");
        let percent80 = node.getChildByPath("break/text/Sprite/Percent/Percent80");
        let percent90 = node.getChildByPath("break/text/Sprite/Percent/Percent90");
        let percent99 = node.getChildByPath("break/text/Sprite/Percent/Percent99");
        let percent100 = node.getChildByPath("break/text/Sprite/Percent/Percent100");
        if (state < 4) {
            beforePercent.active = true;
            afterPercent.active = true;
            percent80.active = false;
            percent90.active = false;
            percent99.active = false;
            percent100.active = false;
            if (state == 1) {
                percent80.active = true;
            } else if (state == 2) {
                percent90.active = true;
            } else if (state == 3) {
                percent99.active = true;
            }
        } else if (state == 4) {
            beforePercent.active = false;
            afterPercent.active = false;
            percent80.active = false;
            percent90.active = false;
            percent99.active = false;
            percent100.active = true;
        }
    }

    update(dt: number): void {
        if (this.gameManager) {
            this.gameManager.onUpdate(dt);
        }
    }
    //#endregion

    protected aiTipNode: AITipsAnim;
    public showAiTips(show: boolean) {
        if (show && !this.hasEnhancedHint) {
            if (GuideData.inst.isGuideFinished()) {
                if (this.gameManager && this.gameManager.scoreHelper) {
                    if (this.gameManager.scoreHelper.checkIsCanOpenAITips()) {
                        this.gameManager
                            .getAiHelpTipCoord()
                            .then((recomend) => {
                                let hodler: BlockPlaceholder3 = recomend.holder;
                                let item = recomend.item;
                                let barr = item.simple;
                                let sc = item.pc;
                                let sj = item.pj;

                                let row = barr.length;
                                // console.log(blockConfig);
                                let col = barr[0].length;
                                let centerCol = (col - 1) * 0.5;
                                let centerRow = (row - 1) * 0.5;

                                let centerCx = sc + centerRow;
                                let centerCy = sj + centerCol;
                                let tipPos = this.coordToWorld(centerCx, centerCy);
                                if (PREVIEW) {
                                    //console.log("推荐块的开始坐标：", this.coordToWorld(sc, sj));
                                    //console.warn("最佳位置：", item, "提示坐标：", tipPos);
                                }
                                if (this.aiTipNode) {
                                    this.onShowAiTipsAnim(hodler, tipPos);
                                } else {
                                    let tip = AssetInfoDefine.prefab.ef_ai_tips_hand;
                                    ResManager.getInstance()
                                        .loadNode(tip.path, tip.bundle, this.rootEffect)
                                        .then((nd) => {
                                            this.aiTipNode = nd.getComponent(AITipsAnim);
                                            this.onShowAiTipsAnim(hodler, tipPos);
                                        });
                                }
                            })
                            .catch((err) => {
                                console.log("推荐失败:", err);
                            });
                    }
                }
            }
        } else {
            if (this.aiTipNode) {
                this.aiTipNode.hide();
            }
        }
    }

    protected onShowAiTipsAnim(hodler: BlockPlaceholder3, tipPos) {
        if (hodler.node && hodler.node.isValid && hodler.node.parent) {
            let startWorldPos = hodler.node.parent
                .getComponent(UITransform)
                .convertToWorldSpaceAR(hodler.node.position);
            let startPos = this.aiTipNode.node.parent.getComponent(UITransform).convertToNodeSpaceAR(startWorldPos);
            this.aiTipNode.node.setPosition(startPos);
            this.aiTipNode.node.active = true;
            this.aiTipNode.showTips(hodler.blockIndex, hodler.blocksData, startPos, tipPos);
        }
    }
    // 笛卡尔坐标到世界坐标的转换
    coordToWorld(row, col) {
        let x = col * BlockCellSize - BoardClearFixHeight;
        let y = BoardClearFixHeight - row * BlockCellSize;
        return new Vec3(x, y, 0);
    }

    // 道具逻辑
    protected onUsePropHammer(row, col, additonalSize) {
        //console.log("onUsePropHammer row : " + row.toString() + " col : " + col.toString());
        mk.audio.playSubSound(AssetInfoDefine.audio.hammer);
        UserHammerData.inst.useItem();

        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
        let block = this.blockMap.get(row * 100 + col);
        let asset = AssetInfoDefine.prefab.useHammerAnim;
        let blockWorldPos = block.node.parent.getComponent(UITransform).convertToWorldSpaceAR(block.node.position);
        let localPos = this.rootEffect.getComponent(UITransform).convertToNodeSpaceAR(blockWorldPos);
        // console.log("local pos:", localPos)
        // console.log("world pos:", blockWorldPos)
        ResManager.getInstance()
            .loadNode(asset.path, asset.bundle, this.rootEffect)
            .then((hammerNode) => {
                hammerNode.setPosition(localPos);
                this.scheduleOnce(() => {
                    hammerNode.destroy();
                }, 3);
            });
        let asset2 = AssetInfoDefine.prefab.useHammerEffect;
        if (additonalSize == 1) {
            asset2 = AssetInfoDefine.prefab.useHammerEffectBig;
        }
        this.scheduleOnce(() => {
            ResManager.getInstance()
                .loadNode(asset2.path, asset2.bundle, this.rootEffect)
                .then((nd) => {
                    nd.setPosition(localPos);
                    this.scheduleOnce(() => {
                        nd.destroy();
                    }, 3);
                });
        }, 0.383);
        this.onBeforeClearBlock();
        this.scheduleOnce(() => {
            let rowStartIndex = row - 1 - additonalSize < 0 ? 0 : row - 1 - additonalSize;
            let colStartIndex = col - 1 - additonalSize < 0 ? 0 : col - 1 - additonalSize;
            let rowEndIndex = row + 1 + additonalSize > 7 ? 7 : row + 1 + additonalSize;
            let colEndIndex = col + 1 + additonalSize > 7 ? 7 : col + 1 + additonalSize;
            let entity: BlockEntity;
            let key = 0;
            let blockRemovedCount = 0;
            for (let i = rowStartIndex; i <= rowEndIndex; i++) {
                for (let j = colStartIndex; j <= colEndIndex; j++) {
                    key = i * 100 + j;
                    entity = this.blockMap.get(key);
                    if (entity.blockType != 0) {
                        blockRemovedCount++;
                        let num = entity.blockType;
                        if (num > 7) {
                            num = Math.floor(Math.random() * (7 - 1 + 1)) + 1;
                        }
                        if (entity.blockType > 100) {
                            this.onClearBlockEntity(i, j, entity.blockType);
                        }
                        let asset3 = AssetInfoDefine.prefab.blockBrokenEffect[num];
                        entity.clearColorAndGem();
                        this.gameManager.tableData[i][j] = 0;
                        ResManager.getInstance()
                            .loadNode(asset3.path, asset3.bundle, entity.node)
                            .then((nd) => {
                                this.scheduleOnce(() => {
                                    nd.destroy();
                                }, 3);
                            });
                    }
                }
            }
            this.refreshBoardView(this.gameManager.tableData);
            mk.sendEvent(BlockEventType.EVENT_SCORE_PROGRESS_POST_OPENCONTEXT);
            if (this.conditionView) {
                this.conditionView.doDiamondsAnim();
                // this.conditionView.doDiamondsAnim();
            }
            this.gameManager.updateLevelHistoryData();
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_END, blockRemovedCount);
        }, 0.5);
    }
    protected onUsePropVRocket(row, col) {
        mk.audio.playSubSound(AssetInfoDefine.audio.rocket);
        UserVRocketData.inst.useItem();
        this.onBeforeClearBlock();
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
        let entity: BlockEntity;
        entity = this.blockMap.get(7 * 100 + col);
        let blockWorldPos = entity.node.parent.getComponent(UITransform).convertToWorldSpaceAR(entity.node.position);
        let localPos = this.rootEffect.getComponent(UITransform).convertToNodeSpaceAR(blockWorldPos);
        let asset1 = AssetInfoDefine.prefab.vrocketEffect;
        ResManager.getInstance()
            .loadNode(asset1.path, asset1.bundle, this.rootEffect)
            .then((nd) => {
                nd.setPosition(localPos);
                this.scheduleOnce(() => {
                    nd.destroy();
                }, 5);
            });
        let key = 0;
        let blockRemovedCount = 0;
        let arr: Array<BlockEntity> = [];
        // inside the loop populate 8 block entity
        // after loop finish it run the effects
        for (let index = 0; index < 8; index++) {
            key = index * 100 + col;
            entity = this.blockMap.get(key);
            arr.push(entity);
            this.gameManager.tableData[index][col] = 0;
        }
        arr = arr.reverse();
        for (let i = 0; i < 8; i++) {
            if (arr[i].blockType != 0) {
                blockRemovedCount++;
                let num = arr[i].blockType;
                let blockType = num;
                if (num > 7) {
                    num = Math.floor(Math.random() * (7 - 1 + 1)) + 1;
                }
                let asset3 = AssetInfoDefine.prefab.blockBrokenEffect[num];
                if (blockType > 100) {
                    this.onClearBlockEntity(7 - i, col, blockType);
                }
                this.scheduleOnce(() => {
                    arr[i].refreshColor(0);

                    ResManager.getInstance()
                        .loadNode(asset3.path, asset3.bundle, arr[i].node)
                        .then((nd) => {
                            this.scheduleOnce(() => {
                                nd.destroy();
                            }, 3);
                        });
                }, 0.05 * (i + 1));
            }
        }
        if (this.conditionView) {
            this.scheduleOnce(() => {
                this.conditionView.doDiamondsAnim();
            }, 0.25);
        }
        this.scheduleOnce(() => {
            this.gameManager.updateLevelHistoryData();
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_END, blockRemovedCount);
        }, 0.05 * (8 + 1));
        //this.gameManager.updateLevelHistoryData();
    }
    protected onUsePropHRocket(row, col) {
        mk.audio.playSubSound(AssetInfoDefine.audio.rocket);
        UserHRocketData.inst.useItem();
        this.onBeforeClearBlock();
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
        let entity: BlockEntity;
        entity = this.blockMap.get(row * 100 + 7);
        let blockWorldPos = entity.node.parent.getComponent(UITransform).convertToWorldSpaceAR(entity.node.position);
        let localPos = this.rootEffect.getComponent(UITransform).convertToNodeSpaceAR(blockWorldPos);
        let asset1 = AssetInfoDefine.prefab.hrocketEffect;
        ResManager.getInstance()
            .loadNode(asset1.path, asset1.bundle, this.rootEffect)
            .then((nd) => {
                nd.setPosition(localPos);
                this.scheduleOnce(() => {
                    nd.destroy();
                }, 5);
            });
        let key = 0;
        let blockRemovedCount = 0;
        let arr: Array<BlockEntity> = [];
        // inside the loop populate 8 block entity
        // after loop finish it run the effects
        for (let index = 0; index < 8; index++) {
            key = row * 100 + index;
            entity = this.blockMap.get(key);
            arr.push(entity);
            this.gameManager.tableData[row][index] = 0;
        }
        arr = arr.reverse();
        for (let i = 0; i < 8; i++) {
            if (arr[i].blockType != 0) {
                blockRemovedCount++;
                let num = arr[i].blockType;
                let blockType = num;
                if (num > 7) {
                    num = Math.floor(Math.random() * (7 - 1 + 1)) + 1;
                }
                let asset3 = AssetInfoDefine.prefab.blockBrokenEffect[num];
                if (blockType > 100) {
                    this.onClearBlockEntity(row, 7 - i, blockType);
                }
                this.scheduleOnce(() => {
                    arr[i].refreshColor(0);
                    ResManager.getInstance()
                        .loadNode(asset3.path, asset3.bundle, arr[i].node)
                        .then((nd) => {
                            this.scheduleOnce(() => {
                                nd.destroy();
                            }, 3);
                        });
                }, 0.05 * (i + 1) + 0.2);
            }
        }
        if (this.conditionView) {
            this.scheduleOnce(() => {
                this.conditionView.doDiamondsAnim();
            }, 0.25);
        }
        this.scheduleOnce(() => {
            this.gameManager.updateLevelHistoryData();
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_END, blockRemovedCount);
        }, 0.05 * (8 + 1));
    }
    protected onUsePropRefresh() {
        mk.audio.playSubSound(AssetInfoDefine.audio.refresh);
        UserChangeData.inst.useItem();
        let count = UserData.inst.getThisRoundUsedRefreshCount();
        UserData.inst.setThisRoundUsedRefreshCount(count + 1);
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
        if (this.gameManager) {
            this.gameManager.relifeCurrentLevel();
        }
        //this.refreshBtnRefreshAll();
    }
    randomNumber(max, min, except) {
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        return num === except ? this.randomNumber(max, min, except) : num;
    }
    applyRandomToStartRowCol(row, col) {
        console.log("applyRandomToStartRowCol row " + row.toString());
        console.log("applyRandomToStartRowCol col " + col.toString());
        let randomIndex1 = this.randomNumber(4, 1, -1);
        if (randomIndex1 == 2) {
            row = row + 1;
        }
        if (randomIndex1 == 3) {
            col = col + 1;
        }
        if (randomIndex1 == 4) {
            row = row + 1;
            col = col + 1;
        }
        return [row, col];
    }
    hammerTwoBlocks() {
        let BlockStartIndex = [
            [1, 1],
            [1, 5],
            [5, 1],
            [5, 5],
        ];

        let randomIndex1 = this.randomNumber(3, 0, -1);
        let randomIndex2 = this.randomNumber(3, 0, randomIndex1);
        let randomRowAndCol = this.applyRandomToStartRowCol(
            BlockStartIndex[randomIndex1][0],
            BlockStartIndex[randomIndex1][1]
        );

        let pos1row = randomRowAndCol[0];
        let pos1col = randomRowAndCol[1];
        let block = this.blockMap.get(pos1row * 100 + pos1col);
        let asset = AssetInfoDefine.prefab.hammerBoxHint;
        let blockWorldPos = block.node.parent.getComponent(UITransform).convertToWorldSpaceAR(block.node.position);
        let localPos = this.rootEffect.getComponent(UITransform).convertToNodeSpaceAR(blockWorldPos);
        // console.log("local pos:", localPos)
        // console.log("world pos:", blockWorldPos)
        ResManager.getInstance()
            .loadNode(asset.path, asset.bundle, this.rootEffect)
            .then((boxhint) => {
                boxhint.setPosition(localPos);
                this.scheduleOnce(() => {
                    boxhint.destroy();
                }, 0.383);
            });

        mk.sendEvent(BlockEventType.EVENT_USE_ITEM_HAMMER, pos1row, pos1col, 0);

        randomRowAndCol = this.applyRandomToStartRowCol(
            BlockStartIndex[randomIndex2][0],
            BlockStartIndex[randomIndex2][1]
        );
        let pos2row = randomRowAndCol[0];
        let pos2col = randomRowAndCol[1];
        this.scheduleOnce(() => {
            let block2 = this.blockMap.get(pos2row * 100 + pos2col);
            let asset = AssetInfoDefine.prefab.hammerBoxHint;
            let blockWorldPos = block.node.parent.getComponent(UITransform).convertToWorldSpaceAR(block2.node.position);
            let localPos = this.rootEffect.getComponent(UITransform).convertToNodeSpaceAR(blockWorldPos);
            // console.log("local pos:", localPos)
            // console.log("world pos:", blockWorldPos)
            ResManager.getInstance()
                .loadNode(asset.path, asset.bundle, this.rootEffect)
                .then((boxhint) => {
                    boxhint.setPosition(localPos);
                    this.scheduleOnce(() => {
                        boxhint.destroy();
                    }, 0.7);
                });
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_HAMMER, pos2row, pos2col, 0);
        }, 0.383);
    }


    public clearAllBlocks(cb?:Function) {
        if (this.isPlayEndEffing){
            return
        }

        this.isPlayEndEffing = true
        let clearRow = []
        let colorTypes = []
        let boardData = this.gameManager.tableData
        for (let i = 0; i < boardData.length; i++) {
            for (let j = 0; j < boardData[i].length; j++) {
                let key = i * 100 + j;
                const blockEntity = this.blockMap.get(key);
                if (boardData[i][j] > 0) {
                    clearRow.push(i)
                    colorTypes.push(blockEntity.getRealBlockType())
                    break
                }
            }
        }

        console.log("------------------------clearAllBlocks:", clearRow)
        for (let index = 0; index < clearRow.length; index++) {
            const element = clearRow[index];
            let colorType = colorTypes[index]
            this.showClearAniWith(
                new Vec3(0, -element * BlockCellSize + BoardClearFixHeight, 0),
                0,
                colorType
            );
            this.scheduleOnce(() => {
                for (let i = 0; i < this.gameManager.blockNumber; i++) {
                    let key = element * 100 + i;
                    let entity = this.blockMap.get(key);
                    entity.hideSelf();
                }
            }, (2 * index + 1) * game.deltaTime);
        }

        this.scheduleOnce(() => {
            if (cb){
              cb()
              this.isPlayEndEffing = false

              let boardData = this.gameManager.tableData
              for (let i = 0; i < boardData.length; i++) {
                  for (let j = 0; j < boardData[i].length; j++) {
                      let key = i * 100 + j;
                      const blockEntity = this.blockMap.get(key);
                      blockEntity.hideSelf();
                  }
              }
            }
        }, 0.7);
    }
}
