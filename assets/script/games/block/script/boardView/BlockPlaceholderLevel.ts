/*
 * @Date: 2023-05-14 21:02:33
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-06 23:01:09
 */
import { tween } from "cc";
import { BlockEntity } from "./BlockEntity";
import { BlockPlaceholder3 } from "./BlockPlaceholder3";
import { _decorator } from "cc";
import { Vec3 } from "cc";
import { Random } from "../../../../util/Random";
import { BlockConstData } from "../define/BlockConstData";
const { ccclass, property } = _decorator;

@ccclass("BlockPlaceholderLevel")
export class BlockPlaceholderLevel extends BlockPlaceholder3 {
    public refresh(blockIndex: number, historyBlockConfig?: number[][]): void {
        this.blockIndex = blockIndex;
        this.hasPut = false;
        let randomColor = Random.inst.randomInt(1, 7);
        this.blockColor = randomColor;
        this.blockType = randomColor;
        let blockConfig = historyBlockConfig
            ? historyBlockConfig
            : this.gameManager.getBlockSimpleConfig(blockIndex, randomColor); //window["BlockConst"][blockIndex].simple;
        // let block: IBlockType = window["BlockConst"][blockIndex];
        // let simpleData = block.simple;
        //todo 最好在block中加一个color字段
        // let blockColor = 0;
        // blockConfig.forEach((data, index) => {
        //     data.forEach((item, index2) => {
        //         if(item>0&&item<100){
        //             blockColor = item;
        //             return;
        //         }
        //     })
        //     if(blockColor>0){
        //         return;
        //     }
        // });
        this.blocks.forEach((blockEntity) => {
            this.gameManager.getNodePoolWithPoolType("BlockEntityPool").put(blockEntity.node);
        });
        let blockSize = BlockConstData.BlockSpriteSize.x;

        // this.layout.constraintNum = blockConfig.length;
        this.transform.width = blockConfig[0].length * blockSize;
        this.transform.height = blockConfig.length * blockSize;
        this.blocksData = blockConfig;
        this.blocks.length = 0;
        let row = blockConfig.length;
        if (row <= 0) {
            console.error("异常的块配置", blockIndex);
            return;
        }
        let col = blockConfig[0].length;
        let centerX = (col - 1) * 0.5;
        let centerY = (row - 1) * 0.5;
        for (let i = 0; i < blockConfig.length; i++) {
            for (let j = 0; j < blockConfig[i].length; j++) {
                const node = this.gameManager.getNodePoolWithPoolType("BlockEntityPool").get();

                const blockEntity: BlockEntity = node.getComponent(BlockEntity);
                6;
                node.parent = this.blockParent;

                this.blocks.push(blockEntity);
                let posX = (j - centerX) * blockSize;
                let posY = (centerY - i) * blockSize;
                blockEntity.node.setPosition(posX, posY);
                blockEntity.node.active = true;

                const blockType = blockConfig[i][j];
                blockEntity.refreshColor(blockType);
                blockEntity.setLevelBlockColor(this.blockColor);
            }
        }
        this.blockParent.setScale(0.75, 0.75, 1);
        tween(this.blockParent).to(0.3, { scale: Vec3.ONE }).start();
        this.hideAdNode();
        // this.showBlockAni(blockIndex);
    }
}
