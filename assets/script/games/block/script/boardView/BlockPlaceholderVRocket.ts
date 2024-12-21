/*
 * @Date: 2023-05-14 21:02:33
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-08 19:38:48
 */
import { tween, animation, math } from "cc";
import { BlockEntity } from "./BlockEntity";
import { BlockPlaceholder3 } from "./BlockPlaceholder3";
import { _decorator } from "cc";
import { Vec3 } from "cc";
import { Tween } from "cc";
import { BoardView } from "./BoardView";
import { Animation } from "cc";
import { BlockConst, BlockItemConst } from "../define/BlockType";
import { Node } from "cc";
import { v3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("BlockPlaceholderVRocket")
export class BlockPlaceholderVRocket extends BlockPlaceholder3 {
    @property(Node)
    upRocket: Node = null;
    @property(Node)
    downRocket: Node = null;
    public rocketScale: number;
    private rocketScaleVector: Vec3;
    public rocketPos: number[][];
    public getBlockSpawnScale() {
        if (this.rocketScaleVector) {
            return this.rocketScaleVector;
        }
        this.rocketScaleVector = new Vec3(this.rocketScale, this.rocketScale, 1);
        return this.rocketScaleVector;
    }
    public onUseRocket: () => void;
    public moveToPosition(position: Vec3, callback, lastChooseNodeIndex: number[][]) {
        // console.log('curr position:',this.node.position,'tar position:',position);
        //复制一份销毁的数据
        if (lastChooseNodeIndex) {
            this.rocketPos = JSON.parse(JSON.stringify(lastChooseNodeIndex));
        } else {
            this.rocketPos = null;
        }
        //清除移动标记的道具
        // this.rocketPos && this.rocketPos.forEach((value) => {
        //     for(let i = 0;i<8;i++){
        //         this.gameManager.tableData[value[0]][i] = 0
        //         let key = value[0]*100+i;
        //         const entity: BlockEntity = BoardView.instance.blockMap.get(key);
        //         entity.refreshColor(entity.blockType);
        //     }
        // });
        this.rocketPos &&
            this.rocketPos.forEach((value) => {
                this.gameManager.tableData[value[0]][value[1]] = 0;
                const entity: BlockEntity = BoardView.instance.blockMap.get(value[2]);
                entity.refreshColor(entity.blockType);
            });
        //自身的锤子隐藏下
        this.blocks.forEach((blockEntity) => {
            blockEntity.refreshColor(0);
        });
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .by(this.moveTime1, { position: position })
            .then(
                tween(this.node).call(() => {
                    //播放行消除特效
                    this.scheduleOnce(() => {
                        if (this && this.node.isValid && this.rocketPos && this.rocketPos.length > 0) {
                            BoardView.instance.showClearAniWith(v3(this.rocketPos[0][1] * 80 - 280, 0, 0), 90,1);
                        }
                    }, 0.1);
                    //格子挨个消除
                    this.rocketPos &&
                        this.rocketPos.forEach((value) => {
                            for (let i = 0; i < 8; i++) {
                                setTimeout(() => {
                                    this.gameManager.tableData[i][value[1]] = 0;
                                    let key = value[1] + i * 100;
                                    const entity: BlockEntity = BoardView.instance.blockMap.get(key);
                                    entity.refreshColor(0);
                                }, Math.abs(i - value[0]) * (1 / 8) * 1000);
                            }
                        });

                    this.upRocket.active = true;
                    this.downRocket.active = true;
                    let left = tween(this.upRocket).by(
                        1,
                        { position: this.upRocket.position.clone().add(v3(0, 600, 0)) },
                        { easing: "linear" }
                    );
                    let right = tween(this.downRocket).by(
                        1,
                        { position: this.downRocket.position.clone().add(v3(0, -600, 0)) },
                        { easing: "linear" }
                    );
                    right.start();
                    left.then(
                        tween(this.node).call(() => {
                            this.useRocket();
                            this.upRocket.setPosition(v3(0, 0, 0));
                            this.downRocket.setPosition(v3(0, 0, 0));
                            this.upRocket.active = false;
                            this.downRocket.active = false;
                        })
                    ).start();
                })
            )
            .start();
    }
    useRocket() {
        this.gameManager.putBlock(this.node);
        this.onUseRocket && this.onUseRocket();
    }
    public refresh(blockIndex: number, historyBlockConfig?: number[][]): void {
        this.blockIndex = blockIndex;
        this.hasPut = false;
        let blockConfig = BlockItemConst[blockIndex].simple; //改成配置
        // let block: IBlockType = window["BlockConst"][blockIndex];
        // let simpleData = block.simple;
        //todo 最好在block中加一个color字段
        let blockColor = 0;
        blockConfig.forEach((data, index) => {
            data.forEach((item, index2) => {
                if (item > 0 && item < 100) {
                    blockColor = item;
                    return;
                }
            });
            if (blockColor > 0) {
                return;
            }
        });
        this.blocks.forEach((blockEntity) => {
            this.gameManager.getNodePoolWithPoolType("BlockEntityPool").put(blockEntity.node);
        });
        // this.layout.constraintNum = blockConfig.length;
        this.transform.width = blockConfig[0].length * 80;
        this.transform.height = blockConfig.length * 80;
        this.blocksData = blockConfig;
        this.blocks.length = 0;
        let row = blockConfig.length;
        if (row <= 0) {
            console.error("异常的块配置", blockIndex);
            return;
        }
        // console.log(blockConfig);
        let col = blockConfig[0].length;
        let centerX = (col - 1) * 0.5;
        let centerY = (row - 1) * 0.5;
        for (let i = 0; i < blockConfig.length; i++) {
            for (let j = 0; j < blockConfig[i].length; j++) {
                let spawnType = blockConfig[i][j];
                const node = this.gameManager.getNodePoolWithPoolType("BlockEntityPool").get();

                const blockEntity: BlockEntity = node.getComponent(BlockEntity);
                node.parent = this.blockParent;
                this.blocks.push(blockEntity);
                let posX = (j - centerX) * 80;
                let posY = (centerY - i) * 80;
                blockEntity.node.setPosition(posX, posY);
                blockEntity.node.active = true;
                // console.log(i,j,posX,posY,centerX,centerY);
                const blockType = spawnType;
                blockEntity.refreshColor(blockType);

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
        this.blockParent.setScale(0.75, 0.75, 1);
        tween(this.blockParent).to(0.3, { scale: Vec3.ONE }).start();
        this.hideAdNode();
        // this.showBlockAni(blockIndex);
    }
}
