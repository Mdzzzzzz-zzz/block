import { _decorator, Component, Node, Vec3 } from "cc";
import { Game } from "../logic/Game";
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
import { BlockPlaceholder3 } from "./BlockPlaceholder3";
import * as env from "cc/env";
import { AdSdk } from "../../../../sdk/AdSdk";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { BlockConstData } from "../define/BlockConstData";
import { IBlockGenetateResult } from "../logic/BlockGenerate";
import { UserData } from "../../../../data/UserData";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";

const { ccclass, property } = _decorator;

const enhancedInterval: number = 5;

@ccclass("BlockGenerate")
export class BlockGenerate extends Component {
    protected blockPlaceholders: Array<BlockPlaceholder3>;
    protected gameManager: Game;

    onLoad() {
        this.onInit();
        mk.regEvent(BlockEventType.kEvent_Game_Show_New_Blocks, this.onEvtShowNewBlocks, this);
        mk.regEvent(BlockEventType.kEvent_Game_Show_New_Blocks_History, this.showNewBlocksHistory, this);
        mk.regEvent(BlockEventType.kEvent_Game_Logic_Move_Block_End, this.onEvtMoveBlockEnd, this);
        mk.regEvent(BlockEventType.EVENT_USE_ITEM_END, this.onEvtUsedItem, this);
    }
    protected onInit() {
        this.blockPlaceholders = new Array<BlockPlaceholder3>();
        this.gameManager = Game.inst;
    }
    protected onEvtUsedItem() {
        this.checkCanPut();
    }
    onDestroy() {
        this.blockPlaceholders = null;
        mk.unRegEvent(this);
    }
    protected getBlockGroupPoolName() {
        return "BlockGroupPool";
    }
    protected showNewBlocksHistory(previewBlocks: IPreviewData[]) {
        if (!previewBlocks || previewBlocks.length != 3) {
            if (env.PREVIEW || env.EDITOR) {
                console.error("历史数据不合法，使用新的推荐块");
            }
            this.showNewBlocks();
            return;
        }
        let isCanUse = 0;
        for (let i = 0; i < previewBlocks.length; i++) {
            let value = previewBlocks[i];
            if (value && value.used == 0 && value.bid > -1 && value.config) {
                isCanUse = isCanUse + 1;
            }
        }
        if (isCanUse == 0) {
            this.showNewBlocks();
            return;
        }
        this.blockPlaceholders.forEach((placeholder: BlockPlaceholder3) => {
            this.gameManager.getNodePoolWithPoolType(this.getBlockGroupPoolName()).put(placeholder.node);
        });

        this.blockPlaceholders.length = 0;

        if (this.gameManager.blockPlacesMap) {
            this.gameManager.blockPlacesMap.clear();
        } else {
            this.gameManager.blockPlacesMap = new Map<number, Node>();
        }
        //初始化预览块的状态
        for (let i = 0; i < 3; i++) {
            let previewData = previewBlocks[i];
            if (!previewData || previewData.used || previewData.bid == -1) {
                continue;
            }
            let node = this.gameManager.getNodePoolWithPoolType(this.getBlockGroupPoolName()).get();
            let placeholder: BlockPlaceholder3 = node.getComponent(BlockPlaceholder3);
            node.setPosition(BlockConstData.BlockGenOffsetX[i], 0, 0);
            node.scale = BlockConstData.BlockSpawnVector;
            node.parent = this.node;
            placeholder.originalPosition = node.getPosition();
            placeholder.init(this.gameManager);
            placeholder.refresh(previewData.bid, previewData.config);
            this.blockPlaceholders.push(placeholder);
            this.gameManager.blockPlacesMap.set(i, placeholder.node);
        }
        this.gameManager.blockPlaceholders = this.blockPlaceholders.map((placeholder: BlockPlaceholder3) => {
            return placeholder.node;
        });
        this.checkCanPut();
        mk.sendEvent(BlockEventType.kEvent_Game_Finish_New_Blocks, true);
    }
    private onGenNewBlockSuccess(blockData: IBlockGenetateResult) {
        let results = blockData.blockIds;

        // console.log("onGenNewBlockSuccess getRound ", this.gameManager.getRound());        // 新手第四轮劫持results TODO ab 测试
        // 新手第四轮劫持results TODO ab 测试
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1 && this.gameManager.getRound() == 1 && UserData.inst.gameNumber == 1 && SceneMode.gameMode == kGameMode.endless) {
            results = [6, 6, 2];
        }

        let colorIndexes = blockData.color;
        let multiClearArr = blockData.multiArr;
        let allClearArr = blockData.allcArr;

        if (results.length > 0) {
            let posIndex = 0;
            for (let i = 0; i < results.length; i++) {
                if (results[i] == -1) {
                    posIndex++;
                    continue;
                }
                let node = this.gameManager.getNodePoolWithPoolType(this.getBlockGroupPoolName()).get();
                if (!node.active) {
                    node.active = true;
                }
                // let pos = new Vec3(, 0, 0);
                let placeholder: BlockPlaceholder3 = node.getComponent(BlockPlaceholder3);
                node.setPosition(BlockConstData.BlockGenOffsetX[posIndex], 0, 0);
                node.scale = BlockConstData.BlockSpawnVector;
                node.parent = this.node;
                placeholder.destoryAllBgLight();
                placeholder.originalPosition = node.getPosition();
                placeholder.init(this.gameManager);

                let colorIndex = null
                if (colorIndexes && i < colorIndexes.length) {
                    colorIndex = colorIndexes[i]
                }

                placeholder.refresh(results[i] - 1, null, colorIndex);
                placeholder.multiClearSequence = multiClearArr;
                placeholder.allClearSequence = allClearArr;
                posIndex++;
                this.blockPlaceholders.push(placeholder);
            }
            this.afterGenNewBlocks();
        } else {
            this.onGenNewBlockFail();
        }
    }
    /**
     * 生成异常时候的兼容处理
     */
    private onGenNewBlockFail() {
        let res = this.gameManager.getRelifePreviewBlocks();
        this.onGenNewBlockSuccess(res);
    }

    private afterGenNewBlocks() {
        this.gameManager.blockPlaceholders = this.blockPlaceholders.map((placeholder: BlockPlaceholder3) => {
            return placeholder.node;
        });

        if (this.gameManager.blockPlacesMap) {
            this.gameManager.blockPlacesMap.clear();
        } else {
            this.gameManager.blockPlacesMap = new Map<number, Node>();
        }
        if (this.gameManager.blockPlaceholders) {
            this.gameManager.blockPlaceholders.length = 0;
        } else {
            this.gameManager.blockPlaceholders = new Array<Node>();
        }
        let holders = this.blockPlaceholders;
        for (let index = 0; index < this.blockPlaceholders.length; index++) {
            let element = holders[index].node;
            this.gameManager.blockPlaceholders.push(element);
            this.gameManager.blockPlacesMap.set(index, element);
        }
        this.gameManager.updateLevelHistoryData();
        this.checkCanPut();
        mk.sendEvent(BlockEventType.kEvent_Game_Finish_New_Blocks, false);
        mk.sendEvent(BlockEventType.EVENT_GAME_CREATE_NEWGUIDE_BLOCK);
    }

    protected showNewBlocks(testIndex: number = -1) {
        this.blockPlaceholders.forEach((placeholder: BlockPlaceholder3) => {
            this.gameManager.getNodePoolWithPoolType(this.getBlockGroupPoolName()).put(placeholder.node);
        });

        this.blockPlaceholders.length = 0;
        //console.log("this.gameManager scoreHelper " + JSON.stringify(this.gameManager.scoreHelper))

        this.gameManager
            .getPreviewBlocks()
            .then(this.onGenNewBlockSuccess.bind(this))
            .catch((error) => {
                console.error(error);
                this.onGenNewBlockFail.bind(this);
            });
    }

    private onEvtShowNewBlocks(testIndex) {
        //console.log("blockGenerateUUID " + this.uuid);
        this.showNewBlocks(testIndex);
    }

    protected checkCanPut() {
        //let adRefreshWait = 0;
        if (!this.blockPlaceholders) {
            return;
        }
        this.blockPlaceholders.forEach((placeholder) => {
            if (placeholder.node.parent) {
                let isCanPut = this.gameManager.canPutBlock(placeholder.blockIndex);
                placeholder.isCanPut = isCanPut;
                // if (isCanPut) {
                //     placeholder.hideAdNode();
                // } else {
                //     if (this.gameManager.isCanRefreshBlock() && adRefreshWait == 0) {
                //         adRefreshWait++;
                //         AdSdk.inst
                //             .isRewardedVideoAvailable()
                //             .then(() => {
                //                 placeholder.showAdNode();
                //                 placeholder.registerRefreshHandler((holder) => {
                //                     let blockIndex = this.gameManager.getAdRefreshBlock();
                //                     holder.refresh(blockIndex - 1);
                //                     this.gameManager.onAdRefreshBlock();
                //                     this.checkCanPut();
                //                 }, this);
                //             })
                //             .catch((err: dtSdkError) => {
                //                 if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                //                 }
                //             });
                //     } else if (!this.gameManager.isCanRefreshBlock()) {
                //         placeholder.hideAdNode();
                //         return;
                //     }
                // }
            }
        });
    }
    /**
     * 移动结束后检查有效的节点
     */
    private onEvtMoveBlockEnd() {
        if (this.node.children.length == 1) {
            this.showNewBlocks();
        } else {
            this.gameManager.updateLevelHistoryData();
            this.checkCanPut();
        }
    }

    public checkEnhancedHint() {

    }
}
