/*
 * @Date: 2024-06-05 16:33:59
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-06 21:09:55
 */
import { _decorator, Component, Node, Tween, tween } from "cc";
import { NodePoolManager } from "../../../../util/NodePool";
import { BlockEntity } from "../boardView/BlockEntity";
import { BlockConstData } from "../define/BlockConstData";
const { ccclass, property } = _decorator;

@ccclass("AITipsAnim")
export class AITipsAnim extends Component {
    @property(Node)
    blockParent: Node = null;
    public blocks: Array<BlockEntity>;

    start() {}
    public showTips(blockIndex, blockConfig: number[][], startPos, endPos) {
        if (!this.blocks) {
            this.blocks = [];
        }
        if (this.blocks) {
            this.blocks.forEach((blockEntity) => {
                NodePoolManager.inst.getPool("BlockEntityPool").put(blockEntity.node);
            });
        }
        this.blocks.length = 0;
        let row = blockConfig.length;
        if (row <= 0) {
            console.error("异常的块配置", blockIndex);
            return;
        }
        let col = blockConfig[0].length;
        let centerX = (col - 1) * 0.5;
        let centerY = (row - 1) * 0.5;
        let blockSize = BlockConstData.BlockSpriteSize.x;
        for (let i = 0; i < blockConfig.length; i++) {
            for (let j = 0; j < blockConfig[i].length; j++) {
                let spawnType = blockConfig[i][j];
                const node = NodePoolManager.inst.getPool("BlockEntityPool").get();
                const blockEntity: BlockEntity = node.getComponent(BlockEntity);
                node.parent = this.blockParent;
                this.blocks.push(blockEntity);
                let posX = (j - centerX) * blockSize;
                let posY = (centerY - i) * blockSize;
                blockEntity.node.setPosition(posX, posY);
                blockEntity.node.active = true;
                blockEntity.refreshColor(spawnType, true);
            }
        }
        this.moveToTargetPosition(startPos, endPos);
    }

    protected moveToTargetPosition(startPos, endPos) {
        Tween.stopAllByTarget(this.node);
        this.node.setPosition(startPos);
        tween(this.node)
            .repeatForever(
                tween()
                    .to(
                        1,
                        { position: endPos },
                        {
                            easing: "circOut",
                        }
                    )
                    .delay(0.333)
                    .call(() => {
                        this.node.setPosition(startPos);
                    })
                    .delay(0.01)
            )
            .start();
    }

    public hide() {
        this.node.active = false;
        if (this.blocks) {
            this.blocks.forEach((blockEntity) => {
                NodePoolManager.inst.getPool("BlockEntityPool").put(blockEntity.node);
            });
        }
        this.blocks.length = 0;
    }
}
