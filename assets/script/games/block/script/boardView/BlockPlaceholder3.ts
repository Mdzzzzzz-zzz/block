import { _decorator, Component, Node, UITransform, Vec3, tween, Tween, UIOpacity, Prefab, instantiate, Sprite } from "cc";
import { Game } from "../logic/Game";
import { BlockEntity } from "./BlockEntity";
import { AdSdk } from "../../../../sdk/AdSdk";
import { biEventId } from "../../../../Boot";
import { mk } from "../../../../MK";
import { emAdStatus } from "../../../../define/BIDefine";
import { SceneMode } from "../define/SceneMode";
import { emAdPath } from "../../../../sdk/emAdPath";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { BlockConstData } from "../define/BlockConstData";
import { Random } from "../../../../util/Random";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { BlockScale } from "../effect/BlockScale";
import { UIPlayEffectParticle } from "../../../../tween/UIPlayEffectParticle";
import { ResManager } from "../../../../resource/ResManager";

const { ccclass, property } = _decorator;

export interface IBlockHintSequence {
    seq: number;
    x: number;
    y: number;
    blockPlaceHolder: BlockPlaceholder3;
    clearType: number; // 1 多消 2 清屏
}

@ccclass("BlockPlaceholder3")
export class BlockPlaceholder3 extends Component {
    @property(Node)
    ad_root: Node = null;
    @property(UIPlayEffectParticle)
    effectApear: UIPlayEffectParticle = null;

    @property(Node)
    hintNode: Node = null;

    @property(Sprite)
    hintStep1: Sprite = null;
    @property(Sprite)
    hintStep2: Sprite = null;
    @property(Sprite)
    hintStep3: Sprite = null;

    private hintSteps = [];

    //从0 开始的
    public blockIndex: number = -1;

    public originalPosition: Vec3;

    @property
    public moveTime1: number = 0.03; // 放置后动画时长

    @property
    public moveTime2: number = 0.09; // 不可放置 回滚状态时长

    protected blockParent: Node;

    public blocks: Array<BlockEntity>;

    private blockScale: BlockScale;

    private blockAlpha: number = 1;

    private bgLightObject: Node = null;
    private lastBgName: string = null;
    private bubbleName: string = null;
    private bubbleObject: Node = null;
    // protected layout: Layout;

    protected transform: UITransform;
    public hasPut: boolean = false;

    public multiClearSequence: Array<number> = [];
    public allClearSequence: Array<number> = [];

    public targetX = -1;
    public targetY = -1;

    public enhancedHintSeq: number = -1;

    onLoad() {
        this.blockParent = this.node.getChildByName("blockParent");
        this.blocks = new Array<BlockEntity>();

        // this.layout = this.blockParent.getComponent(Layout);
        this.transform = this.blockParent.getComponent(UITransform);
        this.hintSteps.length = 0;

        this.hintSteps.push(this.hintStep1);
        this.hintSteps.push(this.hintStep2);
        this.hintSteps.push(this.hintStep3);
    }

    onDestroy() {
        this.blockIndex = -1;
    }
    protected gameManager: Game;

    public init(manager: Game) {
        this.gameManager = manager;
    }

    public addBlockScale() {
        this.blockScale = this.node.getComponent(BlockScale);
        if (!this.blockScale) {
            this.blockScale = this.node.addComponent(BlockScale);
        } else {
            this.StartBlockScale();
        }
    }
    /**
     * 记录当前的block 形状信息
     */
    public blocksData: number[][];
    /**
     * 关卡模式不要用blockType 有可能随机宝石 有多个blockType
     */
    public blockType: number;
    /**
     * 方块的颜色
     */
    public blockColor: number;
    public refresh(blockIndex: number, historyBlockConfig?: number[][], colorIndex?: number) {
        if (blockIndex == -1) {
            return;
        }

        this.targetX = -1;
        this.targetY = -1;
        if (this.hintNode) {
            this.hintNode.active = false;
        }

        this.enhancedHintSeq = -1;

        this.blockIndex = blockIndex;
        this.hasPut = false;
        let randomColor = Random.inst.randomInt(1, 7);
        this.blockColor = colorIndex ? colorIndex : randomColor;
        this.blockType = colorIndex ? colorIndex : randomColor;
        // this.blockType = randomColor;
        // this.blockColor = randomColor;

        // let blockConfig = historyBlockConfig ? historyBlockConfig : this.gameManager.getBlockSimpleConfig(blockIndex, randomColor)//window["BlockConst"][blockIndex].simple;
        let blockConfig = historyBlockConfig
            ? historyBlockConfig
            : this.gameManager.getBlockSimpleConfig(blockIndex, this.blockColor); //window["BlockConst"][blockIndex].simple;

        this.blocks.forEach((blockEntity) => {
            this.gameManager.getNodePoolWithPoolType("BlockEntityPool").put(blockEntity.node);
        });
        // console.log("block config:",blockConfig);
        // this.layout.constraintNum = blockConfig.length;
        // this.transform.width = blockConfig[0].length * 80;
        // this.transform.height = blockConfig.length * 80;
        this.blocksData = blockConfig;
        //不要重新new 内存会涨
        this.blocks.length = 0;

        // let changeBorder = false;
        // if (window["BlockConst"][`${blockIndex}`].border == null) {
        //     window["BlockConst"][`${blockIndex}`].border = new Map<string, Array<boolean>>();
        //     changeBorder = true;
        // }
        let row = blockConfig.length;
        if (row <= 0) {
            console.error("异常的块配置", blockIndex);
            return;
        }
        // console.log(blockConfig);
        let col = blockConfig[0].length;
        let centerX = (col - 1) * 0.5;
        let centerY = (row - 1) * 0.5;
        let blockCellSize = BlockConstData.BlockSpriteSize.x;
        for (let i = 0; i < blockConfig.length; i++) {
            for (let j = 0; j < blockConfig[i].length; j++) {
                let spawnType = blockConfig[i][j];
                const node = this.gameManager.getNodePoolWithPoolType("BlockEntityPool").get();

                const blockEntity: BlockEntity = node.getComponent(BlockEntity);

                node.parent = this.blockParent;

                this.blocks.push(blockEntity);
                let posX = (j - centerX) * blockCellSize;
                let posY = (centerY - i) * blockCellSize;
                blockEntity.node.setPosition(posX, posY);
                blockEntity.node.active = true;
                // console.log(i,j,posX,posY,centerX,centerY);
                const blockType = spawnType;

                blockEntity.refreshColor(blockType);
                blockEntity.setAlpha(this.blockAlpha);
                // const top = blockType != 0 && (i == 0 || blockConfig[i - 1][j] == 0);
                // const bottom = blockType != 0 && (i == blockConfig.length - 1 || blockConfig[i + 1][j] == 0);
                // const right = blockType != 0 && (j == blockConfig[i].length - 1 || blockConfig[i][j + 1] == 0);
                // const left = blockType != 0 && (j == 0 || blockConfig[i][j - 1] == 0);

                // const top_left = blockType != 0 && i != 0 && j != 0 && blockConfig[i - 1][j - 1] == 0;
                // const top_right = blockType != 0 && i != 0 && j != blockConfig[i - 1].length - 1 && blockConfig[i - 1][j + 1] == 0;
                // const bottom_left = blockType != 0 && i != blockConfig.length - 1 && j != 0 && blockConfig[i + 1][j - 1] == 0;
                // const bottom_right = blockType != 0 && i != blockConfig.length - 1 && j != blockConfig[i + 1].length - 1 && blockConfig[i + 1][j + 1] == 0;

                // if (changeBorder) {
                //     window["BlockConst"][`${blockIndex}`].border[`${i}-${j}`] = [top, bottom, left, right, top_left, top_right, bottom_left, bottom_right];
                // }
                // let [top, bottom, left, right, top_left, top_right, bottom_left, bottom_right] = window["BlockConst"][`${blockIndex}`].border[`${i}-${j}`];
                // blockEntity.refreshBorder(top, bottom, left, right, top_left, top_right, bottom_left, bottom_right);
            }
        }
        // this.blockParent.getComponent(UIOpacity).opacity = 0;
        // tween(this.blockParent.getComponent(UIOpacity))
        //     .to(0.8, { opacity: 255 })
        //     .start();
        // this.showBlockAni(blockIndex);
        this.blockParent.setScale(0.75, 0.75, 1);
        tween(this.blockParent).to(0.3, { scale: Vec3.ONE }).start();
        this.hideAdNode();
        if (this.effectApear == null) {
            this.effectApear = this.getComponent(UIPlayEffectParticle);
        }
        if (this.effectApear) {
            this.effectApear.node.active = true;
            this.effectApear.play();
        }
    }

    public moveToPosition(position: Vec3, callback, lastChooseNodeIndex: number[][]) {
        // console.log('curr position:',this.node.position,'tar position:',position);
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .by(this.moveTime1, { position: position })
            .then(
                tween(this.node).call(() => {
                    this.gameManager.putBlock(this.node);
                    callback && callback();
                    // console.log('finish position:',this.node.position,'tar position:',position);
                })
            )
            .start();
    }
    public getBlockSpawnScale() {
        return BlockConstData.BlockSpawnVector;
    }

    public setHintVisible(isVisible: boolean) {
        if (!this.hintNode) return;
        this.hintNode.getComponent(UIOpacity).opacity = isVisible ? 255 : 0;
    }

    public moveToOriginalPosition() {
        this.setHintVisible(true);
        tween(this.node)
            .to(this.moveTime2, { position: this.originalPosition, scale: this.getBlockSpawnScale() })
            .call(() => {
                this.StartBlockScale();
            })
            .start();
        if (this.lastBgName) {
            this.setBgLight(this.lastBgName, this.bubbleName);
        }
    }

    private _isCanPut: boolean = true;
    public get isCanPut(): boolean {
        return this._isCanPut;
    }
    public set isCanPut(value: boolean) {
        this._isCanPut = value;
        if (value) {
            this.setRealColor();
        } else {
            this.setGaryState();
        }
    }
    public setGaryState() {
        this.blocks.forEach((entity) => {
            entity.blockType > 0 && entity.blockType < 100 && entity.onlyRefreshColor(8);
        });
    }

    public setRealColor() {
        this.blocks.forEach((entity) => {
            entity.onlyRefreshColor(entity.blockType, false);
        });
    }

    public destoryAllBgLight() {
        this.removeAllBgLight();
        this.clearLastPrefabPath();
    }

    public clearLastPrefabPath() {
        this.lastBgName = null;
        this.bubbleName = null;
    }

    public setBgLight(bgPrefabPath, topPrefabPath) {
        let effectPath = bgPrefabPath;
        // let effectPath = AssetInfoDefine.prefab.new_guide_1.path
        ResManager.getInstance()
            .loadAsset<Prefab>(effectPath, "block")
            .then((effectPrefab) => {
                let effectNode = instantiate(effectPrefab);
                ResManager.getInstance()
                    .loadAsset<Prefab>(topPrefabPath, "block")
                    .then((topPrefab) => {
                        let topNode = instantiate(topPrefab);

                        effectNode.setParent(this.node);
                        effectNode.setScale(2, 2, 1);
                        effectNode.setSiblingIndex(1);

                        topNode.setParent(this.node);
                        topNode.setScale(2, 2, 1);
                        topNode.setSiblingIndex(this.node.children.length);
                        // effectNode.name = prefabPath;

                        this.bgLightObject = effectNode;
                        this.lastBgName = effectPath;
                        this.bubbleName = topPrefabPath;
                        this.bubbleObject = topNode;
                    });
            });
    }

    public removeAllBgLight() {
        if (this.bgLightObject) {
            this.node.removeChild(this.bgLightObject);
            this.bgLightObject = null;
        }

        if (this.bubbleObject) {
            this.node.removeChild(this.bubbleObject);
            this.bubbleObject = null;
        }
    }

    protected showBlockAni(blockIndex: number) {
        return;
        // const aniNode = Game.inst.getNodePoolWithPoolType("BlockShowAni").get();
        // aniNode.parent = this.node;

        // aniNode.angle = window["BlockConst"][blockIndex].ani.angle;
        // const scale = window["BlockConst"][blockIndex].ani.scale;
        // aniNode.scale = new Vec3(scale[0], scale[1], scale[2]);

        // const offset = window["BlockConst"][blockIndex].ani.offset;
        // aniNode.getChildByName("show").position = new Vec3(offset[0], offset[1], offset[2]);

        // const animation = aniNode.getComponentInChildren(Animation);

        // animation.play(`show_block_${window["BlockConst"][blockIndex].ani.name}`);
        // animation.once(Animation.EventType.FINISHED, () => {
        //     Game.inst.getNodePoolWithPoolType("BlockShowAni").put(aniNode);
        // });
    }
    public showAdNode(): boolean {
        if (this.ad_root && !this.ad_root.active) {
            this.ad_root.active = true;
            return true;
        }
    }
    public hideAdNode(): void {
        if (this.ad_root && this.ad_root.active) {
            this.ad_root.active = false;
        }
    }
    protected onHandlerRefresh: Function;
    protected onHanderRefreshTarget: any;
    public registerRefreshHandler(handler: Function, target: any): void {
        this.onHanderRefreshTarget = target;
        this.onHandlerRefresh = handler;
    }

    public SetScale(maxScale: Vec3, minScale: Vec3) {
        if (!this.blockScale) {
            return;
        }
        this.blockScale.SetMaxScale(maxScale);
        this.blockScale.SetMinScale(minScale);
    }

    public StartBlockScale() {
        if (!this.blockScale) {
            return;
        }
        this.blockScale.startScaling();
    }

    public StopBlockScale() {
        this.node.setScale(Vec3.ONE);
        if (!this.blockScale) {
            return;
        }
        this.blockScale.stopScaling();
    }

    public removeBlockScale() {
        this.node.setScale(BlockConstData.BlockSpawnVector);
        if (!this.blockScale) {
            return;
        }
        this.blockScale.destroy();
        this.blockScale = null;
    }

    public SetBlockAlpha() {
        this.blockParent.getComponent(UIOpacity).opacity = 150;
    }

    isShowing: boolean;
    onClickRefreshBlock(): void {
        // mk.sdk.instance.reportBI(biEventId.ad_refresh_block, {
        //     ad_status: emAdStatus.WakeUp,
        //     ad_mode: SceneMode.gameMode,
        // });
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Block_Refresh_Single)
            .then(() => {
                // mk.sdk.instance.reportBI(biEventId.ad_refresh_block, {
                //     ad_status: emAdStatus.Finished,
                //     ad_mode: SceneMode.gameMode,
                // });
                this.onHandlerRefresh && this.onHandlerRefresh.call(this.onHanderRefreshTarget, this);
                this.onHandlerRefresh = null;
                this.onHanderRefreshTarget = null;
            })
            .catch((err: dtSdkError) => {
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    // mk.sdk.instance.reportBI(biEventId.ad_refresh_block, {
                    //     ad_status: emAdStatus.Closed,
                    //     ad_mode: SceneMode.gameMode,
                    // });
                    return;
                }
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }

    public resetHintArray() {
        this.allClearSequence = [];
        this.multiClearSequence = [];
    }

    // 判断是否是移动到enhanced hint目标位置，如果没有目标位置，则没有按照enhanced hint的规则处理，一样return false
    public IsMoveTargetAsHint(x, y) {
        if (this.targetX == -1 || this.targetY == -1) {
            return false;
        }

        if (this.targetX == x && this.targetY == y) {
            return true;
        }

        //console.log("Compare Move Coord targetX: " + this.targetX.toString() + " targetY: " + this.targetY.toString() + "  x: " + x.toString() + " y: " + y.toString());

        return false;
    }


    public removeOneHint() {
        if (this.allClearSequence.length >= 3) {
            this.allClearSequence = this.allClearSequence.splice(0, 3);
            this.enhancedHintSeq -= 1;
            if (this.enhancedHintSeq <= 0) {
                this.enhancedHintSeq = -1;
            }
        } else if (this.multiClearSequence.length >= 3) {
            this.multiClearSequence = this.multiClearSequence.splice(0, 3);
            this.enhancedHintSeq -= 1;
            if (this.enhancedHintSeq <= 0) {
                this.enhancedHintSeq = -1;
            }
        }
    }

    public removeAllHints() {
        this.allClearSequence = [];
        this.multiClearSequence = [];
        this.enhancedHintSeq = -1;
    }

    public setHintAvailable(isAvailable: boolean, seqNum: number = -1) {
        if (!this.hintNode) return;

        if (!isAvailable) {
            this.hintNode.active = false;
            for (let i = 0; i < this.hintSteps.length; i++) {
                this.hintSteps[i].node.active = false;
            }
        } else {
            this.hintNode.active = true;
            for (let i = 0; i < this.hintSteps.length; i++) {
                if (i + 1 == seqNum) {
                    this.hintSteps[i].node.active = true;
                } else {
                    this.hintSteps[i].node.active = false;
                }
            }
        }
    }

    public parseHint(): IBlockHintSequence {
        if (this.allClearSequence.length > 2) {
            if (this.allClearSequence[0] == this.blockIndex + 1) {
                this.targetX = this.allClearSequence[1]
                this.targetY = this.allClearSequence[2]
                this.enhancedHintSeq = 1;
                //this.setHintAvailable(true, seq);

                return { seq: this.enhancedHintSeq, x: this.targetX, y: this.targetY, blockPlaceHolder: this, clearType: 2 };
            } else if (this.allClearSequence.length > 5 && this.allClearSequence[3] == this.blockIndex + 1) {
                this.targetX = this.allClearSequence[4]
                this.targetY = this.allClearSequence[5]
                this.enhancedHintSeq = 2;
                //this.setHintAvailable(true, seq);
                return { seq: this.enhancedHintSeq, x: this.targetX, y: this.targetY, blockPlaceHolder: this, clearType: 2 };
            } else if (this.allClearSequence.length > 8 && this.allClearSequence[6] == this.blockIndex + 1) {
                this.targetX = this.allClearSequence[7]
                this.targetY = this.allClearSequence[8]
                //this.setHintAvailable(true, seq);
                this.enhancedHintSeq = 3;
                return { seq: this.enhancedHintSeq, x: this.targetX, y: this.targetY, blockPlaceHolder: this, clearType: 2 };
            } else {
                this.setHintAvailable(false);
            }

        } else if (this.multiClearSequence.length > 2) {
            if (this.multiClearSequence[0] == this.blockIndex + 1) {
                this.targetX = this.multiClearSequence[1]
                this.targetY = this.multiClearSequence[2]
                this.enhancedHintSeq = 1;

                //this.setHintAvailable(true, seq);
                return { seq: this.enhancedHintSeq, x: this.targetX, y: this.targetY, blockPlaceHolder: this, clearType: 1 };
            } else if (this.multiClearSequence.length > 5 && this.multiClearSequence[3] == this.blockIndex + 1) {
                this.targetX = this.multiClearSequence[4]
                this.targetY = this.multiClearSequence[5]
                this.enhancedHintSeq = 2;

                //this.setHintAvailable(true, seq);
                return { seq: this.enhancedHintSeq, x: this.targetX, y: this.targetY, blockPlaceHolder: this, clearType: 1 };
            } else if (this.multiClearSequence.length > 8 && this.multiClearSequence[6] == this.blockIndex + 1) {
                this.targetX = this.multiClearSequence[7]
                this.targetY = this.multiClearSequence[8]
                this.enhancedHintSeq = 3;
                //this.setHintAvailable(true, seq);
                return { seq: this.enhancedHintSeq, x: this.targetX, y: this.targetY, blockPlaceHolder: this, clearType: 1 };
            } else {
                this.setHintAvailable(false);
            }

        }
        return null;
    }
}
