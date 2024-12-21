import { _decorator, Button, Mat4, Node, Vec3 } from "cc";
import { BoardView } from "../boardView/BoardView";
import { mk } from "../../../../MK";
import { EndlessScoreHelper } from "../logic/EndlessScoreHelper";
import { EndlessScoreView } from "./EndlessScoreView";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { PanelManager } from "../../../../panel/PanelManager";
import { Game } from "../logic/Game";
import { biEventId } from "../../../../Boot";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import { kGameMode } from "../define/Enumrations";
import { AdSdk } from "../../../../sdk/AdSdk";
import { GuideData } from "../../../../data/GuideData";
import { UserData } from "../../../../data/UserData";
import { ResManager } from "../../../../resource/ResManager";
import { EndlessProgressHelper } from "../logic/EndlessProgressHelper";
import { BoardPreviewData } from "../../../../data/BoardPreviewData";
import { BlockPlaceholder3, IBlockHintSequence } from "../boardView/BlockPlaceholder3";
import { BlockEntity } from "../boardView/BlockEntity";
import { NodePoolManager } from "../../../../util/NodePool";
import { BlockConstData } from "../define/BlockConstData";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { SceneMode } from "../define/SceneMode";
import { BlockEventType } from "../define/Event";
import { BIEventID } from "../../../../define/BIDefine";
const { ccclass, property } = _decorator;

@ccclass("EndlessBoardView")
export class EndlessBoardView extends BoardView {
    @property(Node)
    rootScoreView: Node = null;

    @property(Node)
    enhancedButton: Node = null;

    @property(Node)
    clearScreenLabel: Node = null;

    @property(Node)
    clearMultiLabel: Node = null;

    public enhancedHintBlocks: Array<BlockEntity>;

    scoreView: EndlessScoreView;
    guideStep1ClickedTimes: number = 0;
    start(): void {
        super.start();
        //mk.sdk.instance.reportBI(biEventId.classic_enter, { best: UserScoreLevelData.inst.getHighestScore() });
        this.preloadViews();
        mk.regEvent(mk.eventType.ON_TOUCH_START, this.onTouchCollectData, this);
    }
    preloadViews() {
        this.scheduleOnce(() => {
            ResManager.getInstance().preloadAsset(
                [
                    AssetInfoDefine.prefab.revive.path,
                    AssetInfoDefine.prefab.reviveold.path,
                    AssetInfoDefine.prefab.revivewithouthammer.path,
                    AssetInfoDefine.prefab.setting.path,
                    AssetInfoDefine.prefab.enlessPreOver.path,
                ],
                "block"
            );
        }, 3);

        this.scheduleOnce(() => {
            this.preloadScenes();
        }, 8);
    }
    preloadScenes() {
        ResManager.getInstance()
            .preloadScene("home", "block")
            .then(() => {
                ResManager.getInstance()
                    .preloadScene("level", "block")
                    .then(() => {
                        ResManager.getInstance().preloadScene("adventure_level_selectv2", "block");
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }
    onDestroy(): void {
        let score = this.gameManager.scoreHelper as EndlessScoreHelper;
        if (score) {
            let isNewRecord = score.isBestScore;
            mk.sdk.instance.reportBI(biEventId.classic_exit, {
                proj_best: UserScoreLevelData.inst.getHighestScore(),
                proj_isnewrecord: isNewRecord,
                proj_is_first_game: score.isFirstChallange,
                proj_round: this.gameManager.getRound(),
            });
        }

        // if (isNewRecord) {
        //     mk.sdk.instance.reportBI(biEventId.classic_newrecord, { best: UserScoreLevelData.inst.getHighestScore(), isNewRecord: isNewRecord });
        // }
        super.onDestroy();
    }
    protected async startGame() {
        await super.startGame();
        this.refreshScoreView();

        mk.sdk.instance.reportBI(biEventId.classic_start, { proj_best: UserScoreLevelData.inst.getHighestScore() });
        //this.UpdateClassicTreausreChestCount();
    }
    private refreshScoreView() {
        //this.refreshThisRoundPropUsedCount();
        this.scoreView = this.rootScoreView.getComponent(EndlessScoreView);
        if (this.scoreView) {
            let scoreHelper = this.gameManager.scoreHelper as EndlessScoreHelper;
            if (scoreHelper) {
                this.scoreView.initData(scoreHelper.score, scoreHelper.historyMaxScore);
            }

        }
    }

    protected onClickBg() {
        this.enhancedButton.active = false;
        this.hasEnhancedHint = false;
    }

    protected onEvtRefreshPreviewBlock(isHistory) {
        super.onEvtRefreshPreviewBlock(isHistory);
        if (this.getGuideDataInst().isGuideFinished()) {
            // this.ShowEnhancedAITips(true);
            this.ShowEnhancedAITips(false);
        }
    }

    private refreshThisRoundPropUsedCount() {
        UserData.inst.setThisRoundUsedHammerCount(0);
        UserData.inst.setThisRoundUsedVRocketCount(0);
        UserData.inst.setThisRoundUsedHRocketCount(0);
        UserData.inst.setThisRoundUsedRefreshCount(0);
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
    }
    // refeshGuideShow() {

    // }
    // protected clearGuideNode() {
    //     if (this.newGuideNode) {
    //         this.newGuideNode.destroy();
    //         this.newGuideNode = null;
    //         let userGuide = this.root_preview_guide.getChildByName('userGuide');
    //         if (userGuide) {
    //             userGuide.destroy();
    //         }
    //     }
    // }
    protected onRestartGame(isRetry: boolean): void {
        super.onRestartGame(isRetry);
        this.refreshScoreView();
        this.refreshBoardView(this.gameManager.tableData);
        this.refreshAllBoardAni(BoardPreviewData.previewBoardData);
        PanelManager.inst.removeAllPopUpView();
        this.showComboAni(false);
        if (isRetry) {
            let best = UserScoreLevelData.inst.getHighestScore();
            mk.sdk.instance.reportBI(biEventId.classic_start, { proj_best: best });
            mk.sdk.instance.reportBI(biEventId.classic_restart, { proj_best: best });
        }

    }
    protected onGameOver(): void {
        super.onGameOver();
        let scoreHelper = this.gameManager.scoreHelper as EndlessScoreHelper;
        this.UpdateClassicTreausreChestCount();
        // let isNewRecord = scoreHelper.isBestScore;
        if (Game.inst.isCanRevive()) {
            let revivepath = AssetInfoDefine.prefab.revive2.path;
            let group = ABTestManager.getInstance().getGroup(ABTestParam.Revive3);
            if (group == 1) {
                revivepath = AssetInfoDefine.prefab.revive3.path;
            }
            //是否有广告
            AdSdk.inst
                .isRewardedVideoAvailable()
                .then(() => {
                    PanelManager.inst.addPopUpView(revivepath, {
                        manager: Game.inst,
                        onTimeFinish: () => {
                            this.showEndlessOverView();
                        },
                        mode: kGameMode.endless,
                        holder: this,
                        reviveTimes: this.gameManager.getReviveTimes(),
                        score: scoreHelper.score,
                        isEndless: true,
                        abTestGroup: group,
                    });
                })
                .catch(() => {
                    this.showEndlessOverView();
                });
            return;
        }
        EndlessProgressHelper.getInstance().resetProgressBar();
        EndlessProgressHelper.getInstance().resetReachPercent();
        EndlessProgressHelper.getInstance().resetReachEnhance();
        this.showEndlessOverView();
    }
    protected showEndlessOverView(): void {
        let cfg = AssetInfoDefine.prefab.enlessPreOver;
        let scoreHelper = this.gameManager.scoreHelper as EndlessScoreHelper;

        PanelManager.inst.addPopUpView(cfg.path, {
            manager: this.gameManager,
            result: {
                isBestScore: scoreHelper.isBestScore,
                score: scoreHelper.score,
                is_first_game: scoreHelper.isFirstChallange,
                round: this.gameManager.getRound(),
            },
        });
        let dataInst = UserData.inst;
        dataInst.isPlayAdventureHandGuide = false;
        if (dataInst.isFirstPlay) {
            dataInst.isFirstPlay = false;
            dataInst.onlinePlayTimes += 1;
            dataInst.isPlayAdventureHandGuide = true;
        }
    }
    protected getGuideDataInst(): any {
        return GuideData.inst;
    }
    // protected onEvtRefreshPreviewBlock(isHistory) {
    //     super.onEvtRefreshPreviewBlock(isHistory);
    // }

    private clearEnhanceHintBlocks() {
        if (this.enhancedHintBlocks) {
            this.enhancedHintBlocks.forEach((blockEntity) => {
                blockEntity.stopOpacityTween(blockEntity.blockType);
                NodePoolManager.inst.getPool("BlockEntityPool").put(blockEntity.node);
            })
            this.enhancedHintBlocks.length = 0;
        }
    }

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


        if (placeholder.IsMoveTargetAsHint(this.targetNodeIndex[1], this.targetNodeIndex[0])) {
            // 继续动画

            // this.ShowEnhancedAITips(true);
            let isRemoved = false;
            this.gameManager.blockPlaceholders.forEach((node) => {
                if (isRemoved) return;

                let placeholder = node.getComponent(BlockPlaceholder3);
                if (placeholder.enhancedHintSeq == 1) {
                    let blockIndex = placeholder.blockIndex;
                    let simpleData = window["BlockConst"][blockIndex].simple;
                    let entityNum = 0;

                    for (let i = 0; i < simpleData.length; i++) {
                        for (let j = 0; j < simpleData[0].length; j++) {
                            if (simpleData[i][j] > 0) {
                                entityNum++;
                            }
                        }
                    }

                    console.log("[moveblockddd] remove " + entityNum.toString());
                    for (let i = 0; i < entityNum; i++) {
                        let blockEntity = this.enhancedHintBlocks[i];
                        if (!blockEntity) continue;
                        blockEntity.stopOpacityTween(blockEntity.blockType);
                        NodePoolManager.inst.getPool("BlockEntityPool").put(blockEntity.node);
                    }
                    isRemoved = true;
                    this.enhancedHintBlocks.splice(0, entityNum);
                }
            });
            this.gameManager.removePlaceHolderOneHint();

        } else {
            this.clearEnhanceHintBlocks();
            this.gameManager.removePlaceHolderAllHints();
            this.hasEnhancedHint = false;

            // 清除全部blockplaceholder提示
        }
        console.log();
    }
    private enhanceTips: Array<IBlockHintSequence> = null;
    private isShowingEnhancedHint: boolean = false;
    onShowEnhancedHint() {
        this.enhancedButton.active = false;
        this.hasEnhancedHint = true;
        // 1. 播放加强提示动画（循环）
        this.playEnhancedHintAnim(this.enhanceTips);
        // 1.1. 在加强提示动画中（判断是否用户是防放置）

        // 1.1.1 用户按照提示放置，继续展示加强动画

        // 1.1.2 用户没按照提示放置
    }


    public ShowEnhancedAITips(show: boolean) {
        if (!show) return;

        //console.log("检查加强ai提示 轮次" + this.gameManager.getRound().toString());

        if (!this.gameManager.scoreHelper.checkIsCanOpenAITips()) {
            //AdSdk.inst.showMainPageBannerAd();
            this.enhancedButton.active = false;
            return;
        }

        this.gameManager.blockPlaceholders.forEach((node) => {
            let placeHolder = node.getComponent(BlockPlaceholder3);
            placeHolder.setHintAvailable(false);
        });

        this.enhanceTips = [];
        let isShowEnhance: boolean = false;
        // 判断展示提示类型
        if (this.gameManager.isShowEnhancedHintRound()) {
            let enhanceTips = this.gameManager.getEnhanceHint();
            this.enhanceTips = enhanceTips ? enhanceTips : [];
            if (this.enhanceTips && this.enhanceTips.length > 0) {
                isShowEnhance = true;
            } else {
                //console.log("加强ai提示内容为空 ")
            }
        } else {
            //console.log("不在加强ai提示轮次")
        }

        if (isShowEnhance) {
            if (!this.hasEnhancedHint) {
                this.hasEnhancedHint = true;
                // AdSdk.inst.hideMainPageBannerAd();
                //console.log("加强ai提示 轮次" + this.gameManager.getRound().toString());
                this.enhancedButton.active = true;
                if (this.enhanceTips[0].clearType == 1) {
                    this.clearScreenLabel.active = false;
                    this.clearMultiLabel.active = true;
                } else {
                    this.clearScreenLabel.active = true;
                    this.clearMultiLabel.active = false;
                }
            } else {
                // this.playEnhancedHintAnim(this.enhanceTips);
            }


        } else {
            //console.log("无加强ai提示 轮次" + this.gameManager.getRound().toString())
            let group = ABTestManager.getInstance().getGroup(ABTestParam.EndlessProp);
            //AdSdk.inst.showMainPageBannerAd();
            this.enhancedButton.active = false;
        }
    }

    public playEnhancedHintAnim(enhanceTips: Array<IBlockHintSequence>) {
        if (!this.enhancedHintBlocks) {
            this.enhancedHintBlocks = [];
        }

        if (!GuideData.inst.isGuideFinished()) {

            return;
        }

        this.enhancedHintBlocks.forEach((blockEntity) => {
            NodePoolManager.inst.getPool("BlockEntityPool").put(blockEntity.node);
        })

        // 清除所有的seq num提示
        this.gameManager.blockPlaceholders.forEach((node) => {
            let placeHolder = node.getComponent(BlockPlaceholder3);
            placeHolder.setHintAvailable(false);
        });

        this.enhancedHintBlocks.length = 0;

        if (this.gameManager.scoreHelper.checkIsCanOpenAITips()) { // this.gameManager.scoreHelper.checkIsCanOpenAITips()
            for (let i = 0; i < enhanceTips.length; i++) {
                let hint = enhanceTips[i];
                hint.blockPlaceHolder.setHintAvailable(true, hint.blockPlaceHolder.enhancedHintSeq);
                console.log("[playEnhancedHintAnim], blockIndex " + hint.blockPlaceHolder.blockIndex.toString() + " " + hint.blockPlaceHolder.enhancedHintSeq.toString());
                this.playOneBlockHolderHintAnim(hint);
            }
        }
    }

    public playOneBlockHolderHintAnim(blockHint: IBlockHintSequence) {
        let blockIndex = blockHint.blockPlaceHolder.blockIndex;
        // let blockConfig = blockHint.blockPlaceHolder.blocksData;
        let simpleData = window["BlockConst"][blockIndex].simple;

        for (let i = 0; i < simpleData.length; i++) {
            for (let j = 0; j < simpleData[0].length; j++) {
                let spawnType = simpleData[i][j];

                if (spawnType == 0) {
                    continue;
                }

                const node = NodePoolManager.inst.getPool("BlockEntityPool").get();
                const blockEntity: BlockEntity = node.getComponent(BlockEntity);
                node.parent = this.node;
                this.enhancedHintBlocks.push(blockEntity);

                let row = simpleData.length;
                if (row <= 0) {
                    console.error("异常的块配置", blockIndex);
                    return;
                }

                let blockSize = BlockConstData.BlockSpriteSize.x;

                let posX = (-3.5 + j + blockHint.x) * blockSize;
                let posY = (3.5 - i - blockHint.y) * blockSize;

                blockEntity.node.setPosition(posX, posY);
                blockEntity.node.active = true;
                blockEntity.onlyRefreshColorWithTween(blockHint.blockPlaceHolder.blockType, true);
            }
        }
    }

    private UpdateClassicTreausreChestCount() {
        UserData.inst.setCanOpenTreasureChestThisGame(1);
        let remainCount = UserData.inst.getClassicTreasureChestCount();
        console.log("[UpdateClassicTreausreChestCount] get remain count = ", remainCount);
        remainCount = remainCount - 1;
        if (remainCount >= 0) {
            UserData.inst.setClassicTreasureChestCount(remainCount);
            console.log("[UpdateClassicTreausreChestCount] set remain count = ", remainCount);
        }
    }

    private onTouchCollectData() {
        if (GuideData.inst.step == 1) {
            //console.log("[onTouchCollectData] Collect Data: " + this.guideStep1ClickedTimes);
            mk.sdk.instance.reportBI(BIEventID.guide_click, {});
            this.guideStep1ClickedTimes++;
        }
    }
}
