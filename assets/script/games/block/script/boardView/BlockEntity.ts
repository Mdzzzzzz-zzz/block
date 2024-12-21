import { _decorator, Component, Sprite, Color, UIOpacity, Node, Label, UITransform, Animation, tween, Tween } from "cc";
import { SpriteAtlas } from "cc";
import { BlockConstData } from "../define/BlockConstData";
import { PREVIEW } from "cc/env";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
import { UserData } from "../../../../data/UserData";

const { ccclass, property } = _decorator;

@ccclass("BlockEntity")
export class BlockEntity extends Component {
    @property(SpriteAtlas)
    atlasBlocks: SpriteAtlas = null;
    @property(SpriteAtlas)
    skin2Blocks: SpriteAtlas = null;
    @property(SpriteAtlas)
    skin3Blocks: SpriteAtlas = null;
    @property(SpriteAtlas)
    skin4Blocks: SpriteAtlas = null;


    @property(SpriteAtlas)
    myWorkAtlasBlocks1: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks2: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks3: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks4: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks5: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks6: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks7: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks8: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks9: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks10: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks1: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks2: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks3: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks4: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks5: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks6: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks7: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks8: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks9: SpriteAtlas = null;

    @property(SpriteAtlas)
    selectAtlasBlocks10: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks11: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks12: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks13: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks14: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks15: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks16: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks17: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks18: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks19: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks20: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks21: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks22: SpriteAtlas = null;

    @property(SpriteAtlas)
    myWorkAtlasBlocks23: SpriteAtlas = null;

    @property(Node)
    shadowNode: Node = null;

    @property(Sprite)
    private bgSprite: Sprite;

    private levelSelectBlockAtlasMap: Map<number, SpriteAtlas>;
    private myWorkSelectBlockAtlasMap: Map<number, SpriteAtlas>;
    public blockType: number = 0; // 颜色
    public blockColor: number = 0; // 真正的颜色
    public row: number = 0;
    public col: number = 0;
    public idx: number = 0;

    public temporary: boolean = false; //√ 临时状态

    public targetNodeIndex: any;

    @property(Sprite)
    private placeholderSprite: Sprite;
    @property(UIOpacity)
    private placeholderOpacity: UIOpacity;
    //宝石或者障碍物使用的层
    @property(Sprite)
    frontSprite: Sprite;

    public canMove = true;
    private currSpriteAtlas:SpriteAtlas = null;

    // @property(Animation)
    // diamondAnimNode: Animation = null;

    // @property(Sprite)
    // gemSd: Sprite = null;
    // @property(Sprite)
    // gemLe: Sprite = null;
    // @property(Sprite)
    // gem: Sprite = null;

    // private borderNode: Node;

    // private topNode: Node;
    // private bottomNode: Node;
    // private leftNode: Node;
    // private rightNode: Node;

    // private top_rightNode: Node;
    // private top_leftNode: Node;
    // private bottom_rightNode: Node;
    // private bottom_leftNode: Node;
    onLoad() {
        // this.placeholderSprite = this.node.getChildByName("Sprite").getComponent(Sprite);
        // this.placeholderOpacity = this.placeholderSprite.getComponent(UIOpacity);
        // this.frontSprite = this.node.getChildByName("Sprite_Front").getComponent(Sprite);
        // this.bgSprite = this.node.getChildByName("Sprite_Bg").getComponent(Sprite);
        // this.borderNode = this.node.getChildByName("borders");
        // this.topNode = this.borderNode.getChildByName("top");
        // this.bottomNode = this.borderNode.getChildByName("bottom");
        // this.leftNode = this.borderNode.getChildByName("left");
        // this.rightNode = this.borderNode.getChildByName("right");
        // this.top_rightNode = this.borderNode.getChildByName("top-right");
        // this.top_leftNode = this.borderNode.getChildByName("top-left");
        // this.bottom_rightNode = this.borderNode.getChildByName("bottom-right");
        // this.bottom_leftNode = this.borderNode.getChildByName("bottom-left");
        // this.refreshBorder(false, false, false, false, false, false, false, false);
        if (!this.myWorkSelectBlockAtlasMap) {
            this.myWorkSelectBlockAtlasMap = new Map<number, SpriteAtlas>();
            this.myWorkSelectBlockAtlasMap.set(1, this.myWorkAtlasBlocks1);
            this.myWorkSelectBlockAtlasMap.set(2, this.myWorkAtlasBlocks2);
            this.myWorkSelectBlockAtlasMap.set(3, this.myWorkAtlasBlocks3);
            this.myWorkSelectBlockAtlasMap.set(4, this.myWorkAtlasBlocks4);
            this.myWorkSelectBlockAtlasMap.set(5, this.myWorkAtlasBlocks5);
            this.myWorkSelectBlockAtlasMap.set(6, this.myWorkAtlasBlocks6);
            this.myWorkSelectBlockAtlasMap.set(7, this.myWorkAtlasBlocks7);
            this.myWorkSelectBlockAtlasMap.set(8, this.myWorkAtlasBlocks8);
            this.myWorkSelectBlockAtlasMap.set(9, this.myWorkAtlasBlocks9);
            this.myWorkSelectBlockAtlasMap.set(10, this.myWorkAtlasBlocks10);
            this.myWorkSelectBlockAtlasMap.set(11, this.myWorkAtlasBlocks11);
            this.myWorkSelectBlockAtlasMap.set(12, this.myWorkAtlasBlocks12);
            this.myWorkSelectBlockAtlasMap.set(13, this.myWorkAtlasBlocks13);
            this.myWorkSelectBlockAtlasMap.set(14, this.myWorkAtlasBlocks14);
            this.myWorkSelectBlockAtlasMap.set(15, this.myWorkAtlasBlocks15);
            this.myWorkSelectBlockAtlasMap.set(16, this.myWorkAtlasBlocks16);
            this.myWorkSelectBlockAtlasMap.set(17, this.myWorkAtlasBlocks17);
            this.myWorkSelectBlockAtlasMap.set(18, this.myWorkAtlasBlocks18);
            this.myWorkSelectBlockAtlasMap.set(19, this.myWorkAtlasBlocks19);
            this.myWorkSelectBlockAtlasMap.set(20, this.myWorkAtlasBlocks20);
            this.myWorkSelectBlockAtlasMap.set(21, this.myWorkAtlasBlocks21);
            this.myWorkSelectBlockAtlasMap.set(22, this.myWorkAtlasBlocks22);
            this.myWorkSelectBlockAtlasMap.set(23, this.myWorkAtlasBlocks23);

        }

        if (!this.levelSelectBlockAtlasMap) {
            this.levelSelectBlockAtlasMap = new Map<number, SpriteAtlas>();
            this.levelSelectBlockAtlasMap.set(1, this.selectAtlasBlocks1);
            this.levelSelectBlockAtlasMap.set(2, this.selectAtlasBlocks2);
            this.levelSelectBlockAtlasMap.set(3, this.selectAtlasBlocks3);
            this.levelSelectBlockAtlasMap.set(4, this.selectAtlasBlocks4);
            this.levelSelectBlockAtlasMap.set(5, this.selectAtlasBlocks5);
            this.levelSelectBlockAtlasMap.set(6, this.selectAtlasBlocks6);
            this.levelSelectBlockAtlasMap.set(7, this.selectAtlasBlocks7);
            this.levelSelectBlockAtlasMap.set(8, this.selectAtlasBlocks8);
            this.levelSelectBlockAtlasMap.set(9, this.selectAtlasBlocks9);
            this.levelSelectBlockAtlasMap.set(10, this.selectAtlasBlocks10);
        }
        this.node.on(Node.EventType.TOUCH_START, this.onClickBlock, this);


        let skinid = UserData.inst.getSkinID();
        this.currSpriteAtlas = this.atlasBlocks
        if (skinid == 1){
            this.currSpriteAtlas = this.atlasBlocks
        }else if(skinid == 2){
            this.currSpriteAtlas = this.skin2Blocks
        }else if(skinid == 3){
            this.currSpriteAtlas = this.skin3Blocks
        }else if(skinid == 4){
            this.currSpriteAtlas = this.skin4Blocks
        }
    }

    protected onEnable(): void {
        let skinid = UserData.inst.getSkinID();
        this.currSpriteAtlas = this.atlasBlocks
        if (skinid == 1){
            this.currSpriteAtlas = this.atlasBlocks
        }else if(skinid == 2){
            this.currSpriteAtlas = this.skin2Blocks
        }else if(skinid == 3){
            this.currSpriteAtlas = this.skin3Blocks
        }else if(skinid == 4){
            this.currSpriteAtlas = this.skin4Blocks
        }
    }

    private getSpriteFrameNameWithType(type: number) {
        return this.currSpriteAtlas.getSpriteFrame(`b${type}`);
    }

    private get1000SpriteFrameNameWithType(type: number) {
        return this.atlasBlocks.getSpriteFrame(`b${type}`);
    }

    private get100SpriteFrameNameWithType(type: number) {
        return this.atlasBlocks.getSpriteFrame(`b${type}`);
    }

    private getLevelSelectSpriteFrameName(batch: number, type: number) {
        if (!this.levelSelectBlockAtlasMap) {
            return null;
        }

        if (this.levelSelectBlockAtlasMap.has(batch)) {
            let a = this.levelSelectBlockAtlasMap.get(batch);
            return a.getSpriteFrame(`b${type}`);
        }
        return null;
    }

    private getMyWorkSelectSpriteFrameName(batch: number, type: number) {
        if (!this.myWorkSelectBlockAtlasMap) {
            return null;
        }

        if (this.myWorkSelectBlockAtlasMap.has(batch)) {
            let a = this.myWorkSelectBlockAtlasMap.get(batch);
            return a.getSpriteFrame(`b${type}`);
        }
        return null;
    }

    private getDiamondBgWithType(type: number) {
        return this.atlasBlocks.getSpriteFrame(BlockConstData.BlockDiamondShadow[`b${type}`]);
    }

    public setLevelBlockColor(color: number) {
        this.blockColor = color;
    }
    public setCoord(row: number, col: number, idx: number) {
        this.row = row;
        this.col = col;
        this.idx = idx;
        if (PREVIEW) {
            let label = this.node.getChildByName("Label");
            if (label) {
                label.getComponent(Label).string = this.row + "_" + this.col;
            }
        }
    }
    public refreshByMoveBlock(blockType: number, temporary: boolean = false) {
        if (blockType > 1000) {
            //道具
            this.bgSprite.node.active = false;
            this.placeholderSprite.node.active = true;
            this.frontSprite.node.active = true;
            this.frontSprite.spriteFrame = this.get1000SpriteFrameNameWithType(blockType); 
            if (this.idx == 1101) {
                this.node.angle = 90;
            }
            if (this.blockType > 0) {
                this.placeholderSprite.spriteFrame = this.getSpriteFrameNameWithType(this.blockType);
            } else {
                this.placeholderSprite.spriteFrame = null;
            }
        } else {
            // console.log("refreshByMoveBlock");
            this.refreshColor(blockType, temporary);
        }
    }
    public refreshColor(blockType: number, temporary: boolean = false) {
        this.blockType = blockType;
        this.blockColor = blockType;
        this.shadowNode.active = false;
        this.bgSprite.spriteFrame = this.getSpriteFrameNameWithType(14);
        if (blockType > 1000) {
            this.frontSprite.node.active = false;
            this.bgSprite.node.active = false;
            this.placeholderSprite.node.active = true;
            this.placeholderSprite.spriteFrame = this.get1000SpriteFrameNameWithType(blockType); 
        } else if (blockType > 100 && blockType < 1000) {
            this.placeholderSprite.node.active = false;
            this.bgSprite.node.active = true;
            this.frontSprite.node.active = true;
            this.frontSprite.spriteFrame = this.get100SpriteFrameNameWithType(blockType);
            this.placeholderSprite.node.setScale(
                BlockConstData.BlockDiamondScale.x,
                BlockConstData.BlockDiamondScale.y,
                1
            );
            this.frontSprite.node.setScale(BlockConstData.BlockDiamondScale.x, BlockConstData.BlockDiamondScale.y, 1);

            let shadowSprite: Sprite = this.shadowNode.getComponent(Sprite);
            shadowSprite.spriteFrame = this.getDiamondBgWithType(blockType);
            this.shadowNode.active = true;
            this.shadowNode.setScale(BlockConstData.BlockDiamondScale.x, BlockConstData.BlockDiamondScale.y, 1);

            // this.frontSprite.node.setWorldScale(0.7, 0.7, 1)
            if (this.blockType > 200) {
                //粽子
                // this.frontSprite.node.setScale(0.7, 0.7, 1);
            } else {
                // this.frontSprite.node.setScale(Vec3.ONE);
            }
            // let trans = this.frontSprite.getComponent(UITransform);
            // if (trans) {
            //     let boxBg = this.bgSprite.getComponent(UITransform);
            //     trans.setContentSize(boxBg.width * 0.7, boxBg.height * 0.7);
            // }
        } else {
            this.frontSprite.node.active = false;
            this.bgSprite.node.active = false;
            this.placeholderSprite.node.setScale(1, 1, 1);
            this.placeholderSprite.node.active = true;
            if (blockType > 0) {
                this.placeholderSprite.spriteFrame = this.getSpriteFrameNameWithType(blockType);
            } else {
                this.placeholderSprite.spriteFrame = null;
            }
        }
        // this.placeholderSprite.node.active = true;

        this.temporary = temporary;
        // 临时状态
        if (temporary) {
            this.placeholderSprite.color = BlockConstData.BlockTempColor;
            this.placeholderOpacity.opacity = 150;
            this.bgSprite.node.getComponent(UIOpacity).opacity = 150;
            // console.log("临时状态");
        } else {
            this.placeholderSprite.color = Color.WHITE;
            this.placeholderOpacity.opacity = 255;
            this.bgSprite.node.getComponent(UIOpacity).opacity = 255;
        }
        // this.borderNode.active = false;
    }

    /**
     * 棋盘移动变色
     * @param blockType
     */
    public onlyRefreshColor(blockType: number, opacity: boolean = false) {
        if (this.blockType > 100) {
            this.placeholderSprite.node.active = true;
            // this.placeholderSprite.spriteFrame = this.getSpriteFrameNameWithType(blockType);
            // this.placeholderSprite.node.setScale(1, 1, 1);
        }
        this.placeholderSprite.spriteFrame = this.getSpriteFrameNameWithType(blockType);

        this.placeholderSprite.color = Color.WHITE;
        if (opacity) {
            this.placeholderOpacity.opacity = 150;
        } else {
            this.placeholderOpacity.opacity = 255;
        }
        this.canMove = true;
        // 不能放的方块
        if (blockType == 8) {
            this.canMove = false;
            this.placeholderOpacity.opacity = 153;
        }
    }

    private opacityTween: Tween<UIOpacity> = null;
    public onlyRefreshColorWithTween(blockType: number, opacity: boolean = false) {
        this.onlyRefreshColor(blockType, opacity);
        this.opacityTween = tween(this.placeholderOpacity).repeatForever(
            tween().to(1, { opacity: 200 }, { easing: "circOut" })
                .delay(0.2)
                .to(1, { opacity: 0 }, { easing: "circOut" }).delay(0.2)
        );
        this.opacityTween.start();
    }

    public stopOpacityTween(blockType: number, opacity: boolean = false) {
        this.opacityTween.stop();
        this.onlyRefreshColor(blockType);
    }


    public resetScale(blockType: number) {
        if (this.placeholderSprite.node.active) {
            this.placeholderSprite.node.setScale(1, 1, 1);
        }
    }
    public refreshBorder(top, bottom, left, right, top_left, top_right, bottom_left, bottom_right) {
        // if (this.borderNode.isValid) {
        //     this.borderNode.active = true;
        //     this.borderNode.getComponent(UIOpacity).opacity = 255;
        // }
        // this.topNode.active = top;
        // this.bottomNode.active = bottom;
        // this.leftNode.active = left;
        // this.rightNode.active = right;
        // this.top_rightNode.active = top_right;
        // this.top_leftNode.active = top_left;
        // this.bottom_rightNode.active = bottom_right;
        // this.bottom_leftNode.active = bottom_left;
    }

    public clearColor() {
        this.placeholderSprite.node.active = false;
        this.frontSprite.node.active = false;
        // this.borderNode.active = true;
        // this.borderNode.getComponent(UIOpacity).opacity = 255;

        // tween(this.borderNode.getComponent(UIOpacity))
        //     .to(0.34, { opacity: 0 })
        //     .call(() => {
        //         this.clearState();
        //     })
        //     .start();
    }

    public hideSelf() {
        this.placeholderSprite.node.active = false;
        this.frontSprite.node.active = false;
        this.bgSprite.node.active = false;
        this.shadowNode.active = false;
    }




    public clearColorAndGem() {
        // use refreshColor(0)
    }

    public setAlpha(alpha: number) {
        alpha = alpha < 0 ? 0 : alpha;
        alpha = alpha > 1 ? 1 : alpha;
        this.placeholderSprite.color = new Color(255, 255, 255, alpha * 255);
    }

    onDestroy() {
        // this.clearState();
        this.resetData();
    }

    private resetData() {
        this.targetNodeIndex = null;
        this.temporary = false;
        this.blockType = 0;
    }
    setGrey() {
        this.placeholderSprite.spriteFrame = this.atlasBlocks.getSpriteFrame(`b${13}`); 
    }
    /**
     * 变色的时候取的是color值
     * @returns
     */
    public getRealBlockType(): number {
        return this.blockColor;
    }

    public refreshColorSelectLevel(blockType: number) {
        let batch = UserAdventureLevelData.inst.getLevelBatchNumber();

        this.blockType = blockType;
        this.blockColor = blockType;
        this.shadowNode.active = false;
        this.bgSprite.spriteFrame = this.getSpriteFrameNameWithType(14);


        this.bgSprite.node.active = false;
        this.node.getComponent(UITransform).setContentSize(32, 32);
        this.placeholderSprite.node.getComponent(UITransform).setContentSize(32, 32);
        this.placeholderSprite.node.active = true;
        this.placeholderSprite.spriteFrame = this.getLevelSelectSpriteFrameName(batch, blockType);
        this.placeholderSprite.color = Color.WHITE;
        this.placeholderOpacity.opacity = 255;
        this.bgSprite.node.getComponent(UIOpacity).opacity = 255;
    }

    public onClickBlock() {
        mk.sendEvent(BlockEventType.EVENT_BLOCK_CLICKED, this.row, this.col);
    }

    public refreshColorOnMyWork(blockType: number, picIndex: number, id: number) {
        this.blockType = blockType;
        this.blockColor = blockType;
        this.shadowNode.active = false;
        this.bgSprite.spriteFrame = this.getSpriteFrameNameWithType(14);


        this.bgSprite.node.active = false;
        this.node.getComponent(UITransform).setContentSize(21, 21);
        this.placeholderSprite.node.getComponent(UITransform).setContentSize(21, 21);
        this.placeholderSprite.node.active = true;
        this.placeholderSprite.spriteFrame = this.getMyWorkSelectSpriteFrameName(picIndex, blockType);
        this.placeholderSprite.color = Color.WHITE;
        this.placeholderOpacity.opacity = 255;
        this.bgSprite.node.getComponent(UIOpacity).opacity = 255;
    }

    public refreshColorOnMyWorkWithType(blockType: number, picIndex: number, id: number) {
        this.blockType = blockType;
        this.blockColor = blockType;
        this.shadowNode.active = false;
        this.bgSprite.spriteFrame = this.getSpriteFrameNameWithType(14);


        this.bgSprite.node.active = false;
        this.node.getComponent(UITransform).setContentSize(21, 21);
        this.placeholderSprite.node.getComponent(UITransform).setContentSize(21, 21);
        this.placeholderSprite.node.active = true;
        this.placeholderSprite.spriteFrame = this.getMyWorkSelectSpriteFrameName(picIndex, blockType);
        this.placeholderSprite.color = Color.WHITE;
        this.placeholderOpacity.opacity = 255;
        this.bgSprite.node.getComponent(UIOpacity).opacity = 255;

        let seqNode = this.placeholderSprite.node.getChildByName("seqNode")
        if (seqNode != null || seqNode != undefined) {
            this.placeholderSprite.node.removeChild(seqNode)
        }
        seqNode = new Node("seqNode");
        seqNode.addComponent(Label);
        seqNode.getComponent(Label).string = id.toString();
        seqNode.getComponent(Label).fontSize = 11;
        this.placeholderSprite.node.addChild(seqNode);
    }
}
