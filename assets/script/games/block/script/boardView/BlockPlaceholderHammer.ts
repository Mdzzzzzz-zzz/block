/*
 * @Date: 2023-05-14 21:02:33
 * @LastEditors: lzb 2589358976@qq.com
 * @LastEditTime: 2023-09-22 09:50:38
 */
import { tween, animation } from 'cc';
import { BlockEntity } from './BlockEntity';
import { BlockPlaceholder3 } from './BlockPlaceholder3';
import { _decorator } from 'cc';
import { Vec3 } from 'cc';
import { Tween } from 'cc';
import { BoardView } from './BoardView';
import { Animation } from 'cc';
import { BlockItemConst } from '../define/BlockType';
const { ccclass, property } = _decorator;

@ccclass('BlockPlaceholderHammer')
export class BlockPlaceholderHammer extends BlockPlaceholder3 {
    @property(Animation)
    anim: Animation = null;
    public hammerScale: number;
    private hammerScaleVector: Vec3;
    public hammerPos: number[][];
    public getBlockSpawnScale() {
        if (this.hammerScaleVector) {
            return this.hammerScaleVector;
        }
        this.hammerScaleVector = new Vec3(this.hammerScale, this.hammerScale, 1);
        return this.hammerScaleVector;
    }
    public onUseHammer: () => void;
    public moveToPosition(position: Vec3, callback, lastChooseNodeIndex: number[][]) {
        // console.log('curr position:',this.node.position,'tar position:',position);
        //复制一份销毁的数据
        if (lastChooseNodeIndex) {
            this.hammerPos = JSON.parse(JSON.stringify(lastChooseNodeIndex));
        }
        else {
            this.hammerPos = null;
        }
        //清除移动标记的道具
        this.hammerPos && this.hammerPos.forEach((value) => {
            this.gameManager.tableData[value[0]][value[1]] = 0;
            const entity: BlockEntity = BoardView.instance.blockMap.get(value[2]);
            entity.refreshColor(entity.blockType);
        });
        //自身的锤子隐藏下
        this.blocks.forEach((blockEntity) => {
            blockEntity.refreshColor(0);
        })
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .by(this.moveTime1, { position: position }).then(tween(this.node).call(() => {
                if (this.anim) {
                    this.anim.once(Animation.EventType.FINISHED, this.useHammer, this);
                    this.anim.play();
                }
                else {
                    this.useHammer();
                }
            }))
            .start();
    }
    useHammer() {
        this.gameManager.putBlock(this.node);
        this.hammerPos && this.hammerPos.forEach((value) => {
            //使用锤子 锤一下
            this.gameManager.tableData[value[0]][value[1]] = 0;
            const entity: BlockEntity = BoardView.instance.blockMap.get(value[2]);
            entity.refreshColor(0, true);
        });
        this.onUseHammer && this.onUseHammer();
    }
    public refresh(blockIndex: number, historyBlockConfig?: number[][]): void {
        this.blockIndex = blockIndex;
        this.hasPut = false;
        let blockConfig = BlockItemConst[blockIndex].simple;
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
            })
            if (blockColor > 0) {
                return;
            }
        });
        this.blocks.forEach((blockEntity) => {
            this.gameManager.getNodePoolWithPoolType("BlockEntityPool").put(blockEntity.node);
        })
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
                let posY = (centerY - i) * 80
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
        tween(this.blockParent)
            .to(0.3, { scale: Vec3.ONE })
            .start();
        this.hideAdNode();
        // this.showBlockAni(blockIndex);
    }
}