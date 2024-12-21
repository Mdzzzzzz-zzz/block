import { _decorator, Component, Node, tween, Vec3, Sprite, JsonAsset, Animation, ProgressBar, Label } from 'cc';
import { ResManager } from '../../../../resource/ResManager';
import { Global } from '../../../../data/Global';
import { NodePoolManager } from '../../../../util/NodePool';
import { Util } from '../logic/Util';
import { BlockEntity } from '../boardView/BlockEntity';
import { UserLevelData } from 'db://assets/script/data/UserLeveData';

const { ccclass, property } = _decorator
const DELAY_INCREMENT = 0.05;
const RANDOM_X_RANGE = 100;
const RANDOM_Y_OFFSET = 50;

const SPRITE_SCALE = 1.45
@ccclass('myWorkView')
export class myWorkView extends Component {
    @property(Sprite)
    bgSprte: Sprite = null;

    @property(Node)
    onGoingSpriteNode: Node = null;

    @property(Node)
    whoAmI: Node = null;

    @property(Sprite)
    answer: Sprite = null;

    @property(Sprite)
    animAnswer: Sprite = null;

    @property(Node)
    finishAnimNode: Node = null;

    @property(Sprite)
    StickerBase: Sprite = null;

    @property(ProgressBar)
    myWorkProgress: ProgressBar;

    @property(Label)
    myWorkProgressLabel: Label;

    SavedBlockArray: ILevelShowMyWork[] = null;
    SavedBlockArrayGenerated = false;
    blockEntityMap: Map<number, BlockEntity> = null;;

    levelIndexToUse: number = 0;
    picIndex: number = 0;

    currProgress: number = 0;
    nextProgress: number = 0;
    blockArrSize: number = 0;
    increment: number = 0;

    private _nextPerData: any;
    private _currPerData: any;
    private _changeNum: number = 0

    private allBlocks: Map<number, Node> = new Map<number, Node>();

    start() {


        // if (this.whoAmI) {
        //     this.whoAmI.active = false;
        // }

        if (this.answer) {
            this.answer.node.active = false;
        }



    }



    GetOneBlock(canUpdate) {
        console.log("[GetOneBlock] !!! [nodes length]: ", this.allBlocks.size);

        if (this.SavedBlockArrayGenerated) {
            if (this.SavedBlockArray.length == 0) {

                if (this.levelIndexToUse == 1000) { // 获得新贴纸
                    ResManager.getInstance().loadSpriteFrame(`res/texture/album/whoAmI/UI_Sticker_Name/UI_Sticker_name${this.picIndex}`, "block")
                        .then((asset) => {
                            this.animAnswer.spriteFrame = asset;
                        })
                    this.scheduleOnce(() => {
                        this.node.active = false;
                    }, 0.35)
                    this.finishAnimNode.active = true;
                    //this.finishAnimNode.getComponent(Animation).play();
                    let bgNode = this.finishAnimNode.getChildByPath("UI_StickerPanel/Sticker1_base");
                    bgNode.getComponent(Sprite).spriteFrame = this.bgSprte.spriteFrame;

                    ResManager.getInstance().loadSpriteFrame(`res/texture/album/UI_StickerPanel_Sticker${this.picIndex}`, "block")
                        .then((asset) => {
                            this.StickerBase.spriteFrame = asset;
                        });
                }

                this.SavedBlockArrayGenerated = false;
                return false;
            }
            let data = this.SavedBlockArray[0];
            const key = 100 * data.x + data.y;
            const blockEntity = this.blockEntityMap.get(key);
            if (!blockEntity?.node) return;

            const targetFinalPos = this.calculateBlockposition(
                data.y, 18 + (Global.myWorkShowMaxX - 18) / 2 - data.x
            );

            const randomX = Math.random() * RANDOM_X_RANGE - RANDOM_X_RANGE / 2;
            const randomY = Math.random() * 60 + 50;
            const targetPos1 = new Vec3(
                blockEntity.node.position.x + randomX,
                blockEntity.node.position.y + randomY / SPRITE_SCALE,
                0
            );
            const targetPos2 = new Vec3(
                targetPos1.x + Math.random(),
                blockEntity.node.position.y,
                0
            );

            tween(blockEntity.node).set({ scale: new Vec3(1, 1, 1) })
                .to(
                    0.3,
                    {
                        position: targetFinalPos,
                        scale: new Vec3(1, 1, 1),
                    },
                    { easing: "quartIn" }
                )
                .to(0.08, { scale: new Vec3(1.45, 1.45, 1) }, { easing: "quadOut" })
                .to(0.08, { scale: new Vec3(1, 1, 1) }, { easing: "circIn" })
                .start();
            this.SavedBlockArray.removeObject(data);



            this.currProgress = this.currProgress + (this.nextProgress - this.increment) / this.blockArrSize;
            this.myWorkProgress.progress = this.currProgress;
            this._changeNum = this._changeNum + 1
            this.myWorkProgressLabel.string = this._changeNum + "/" + this._currPerData.num2;
            // tween(this.bgSprte.node)
            //     .delay(0.3)
            //     .repeat(
            //         10,
            //         tween()
            //             .to(0.03, { scale: new Vec3(1.02 * SPRITE_SCALE, 1.02 * SPRITE_SCALE, 1) })
            //             .to(0.05, { scale: new Vec3(SPRITE_SCALE, SPRITE_SCALE, 1) })
            //             .to(0.05, { scale: new Vec3(SPRITE_SCALE, SPRITE_SCALE, 1) })
            //     ).start();


            return true;
        }

        if (canUpdate) {
            //this.clearNodes();
            let currLevel = UserLevelData.inst.getHistoryLevel();
            let prevLevel = currLevel - 1;

            this.updateExactLevelBlocks(currLevel);
        }

        // this.scheduleOnce(()=>{

        // }, 0.1)

    }

    public ShowOnlyMyWork(level, isCurrentLevel = true) {


        let currLevel = level;
        if (level == 0) {
            currLevel = UserLevelData.inst.getHistoryLevel();
        }
        let pool = NodePoolManager.inst.getPool("MyWorkPool");
        this.allBlocks.forEach((node, key) => {
            node.parent = null;
            pool.put(node);
        })
        this.allBlocks.clear();

        // 获取当前作品进度
        this.generateWorkWithLevel(currLevel, isCurrentLevel).then();
    }

    private updateExactLevelBlocks(currLevel: number) {


        ResManager.getInstance()
            .loadAsset<JsonAsset>("res/configs/myWorkConfig", "block")
            .then((asset) => {
                const configBlocks = asset.json;
                const picVal1 = this.getProgress(currLevel, configBlocks);
                const picVal2 = this.getProgress(currLevel - 1, configBlocks);

                const lastLevelIndex = picVal2.levelIndex;

                let shouldUpdate = false;
                let picIndexToUse: number;
                let levelIndexToUse: number;

                if (picVal1.picIndex > picVal2.picIndex) {
                    shouldUpdate = true;
                    picIndexToUse = picVal2.picIndex;
                    levelIndexToUse = 1000;
                } else if (picVal1.levelIndex > picVal2.levelIndex) {
                    shouldUpdate = true;
                    picIndexToUse = picVal1.picIndex;
                    levelIndexToUse = picVal1.levelIndex;
                }
                this.levelIndexToUse = levelIndexToUse;
                this.picIndex = picVal2.picIndex;
                // console.log("start CurrentTime: ", new Date().getMilliseconds());

                if (shouldUpdate) {
                    this.createViewForAdded(
                        Global.myWorkShowBoard,
                        picIndexToUse,
                        levelIndexToUse,
                        lastLevelIndex,
                        Global.myWorkShowMaxX
                    ).then((blockEntityMap: Map<number, BlockEntity>) => {
                        this.blockEntityMap = blockEntityMap;
                        let delayTime = 0;
                        const blockArray: ILevelShowMyWork[] = [];
                        // Time: ", new Date().getMilliseconds());
                        blockEntityMap.forEach((blockEntity, key) => {
                            if (blockEntity?.node) {
                                const data = Global.myWorkShowBoard.get(key);
                                if (data) blockArray.push(data);
                            }
                        });

                        if (!this.SavedBlockArrayGenerated) {
                            this.SavedBlockArrayGenerated = true;
                            this.SavedBlockArray = blockArray;
                            this.blockArrSize = this.SavedBlockArray.length;
                            this.SavedBlockArray.sort((a, b) => a.id - b.id);
                        }
                        // console.log("before sort: ", new Date().getMilliseconds());

                        // console.log("before run block: ", new Date().getMilliseconds());
                        let data = this.SavedBlockArray[0];
                        const key = 100 * data.x + data.y;
                        const blockEntity = blockEntityMap.get(key);
                        if (!blockEntity?.node) return;

                        const targetFinalPos = this.calculateBlockposition(
                            data.y, 18 + (Global.myWorkShowMaxX - 18) / 2 - data.x
                        );

                        const randomX = Math.random() * RANDOM_X_RANGE - RANDOM_X_RANGE / 2;
                        const randomY = Math.random() * 60 + 50;
                        const targetPos1 = new Vec3(
                            blockEntity.node.position.x + randomX,
                            blockEntity.node.position.y + randomY / SPRITE_SCALE,
                            0
                        );
                        const targetPos2 = new Vec3(
                            targetPos1.x + Math.random(),
                            blockEntity.node.position.y,
                            0
                        );

                        tween(blockEntity.node)
                            .set({ scale: new Vec3(1, 1, 1) })
                            // Combine position and scale animations here
                            .to(
                                0.5,
                                {
                                    position: targetFinalPos,
                                    scale: new Vec3(1, 1, 1),
                                },
                                { easing: "quartIn" }
                            )
                            .to(0.08, { scale: new Vec3(1.45, 1.45, 1) }, { easing: "quadOut" })
                            .to(0.08, { scale: new Vec3(1, 1, 1) }, { easing: "circIn" })
                            .start();
                        this.SavedBlockArray.removeObject(data);
                        return true;


                        tween(this.bgSprte.node)
                            .delay(1)
                            .repeat(
                                Math.floor(delayTime / 0.116),
                                tween()
                                    .to(0.03, { scale: new Vec3(1.02 * SPRITE_SCALE, 1.02 * SPRITE_SCALE, 1) })
                                    .to(0.05, { scale: new Vec3(SPRITE_SCALE, SPRITE_SCALE, 1) })
                                    .to(0.05, { scale: new Vec3(SPRITE_SCALE, SPRITE_SCALE, 1) })
                            )
                            .call(() => {
                                if (levelIndexToUse == 1000) { // 获得新贴纸
                                    ResManager.getInstance().loadSpriteFrame(`res/texture/myWork/whoAmI/UI_Sticker_Name/UI_Sticker_name${picVal2.picIndex}`, "block")
                                        .then((asset) => {
                                            this.animAnswer.spriteFrame = asset;
                                        })
                                    this.scheduleOnce(() => {
                                        this.node.active = false;
                                    }, 0.35)
                                    this.finishAnimNode.active = true;
                                    // this.finishAnimNode.getComponent(Animation).play();
                                    let bgNode = this.finishAnimNode.getChildByPath("UI_StickerPanel/Sticker1_base");
                                    bgNode.getComponent(Sprite).spriteFrame = this.bgSprte.spriteFrame;

                                    ResManager.getInstance().loadSpriteFrame(`res/texture/myWork/UI_StickerPanel_Sticker${picVal2.picIndex}`, "block")
                                        .then((asset) => {
                                            this.StickerBase.spriteFrame = asset;
                                        });
                                }
                            })
                            .start();
                    });
                }
            });
    }
    private generateWorkWithLevel(level: number, isCurrentLevel = true): Promise<void> {
        return ResManager.getInstance()
            .loadAsset<JsonAsset>("res/configs/myWorkConfig", "block")
            .then((asset) => {
                const configBlocks = asset.json;
                if (!configBlocks) return;

                if (!this.onGoingSpriteNode) {
                    console.log("no available board node");
                    return;
                }

                const result = this.getProgress(level, configBlocks);

                if (!result) {
                    console.error("failed to get progress");
                    return;
                }

                let answerSpriteFramePromise: Promise<any> | null = null;

                if (UserLevelData.inst.isAllLevelFinished == 1 && isCurrentLevel == true) {
                    result.picIndex -= 1;
                    result.levelIndex = 1000;
                    this.myWorkProgress.progress = 1;
                    // this.myWorkProgressLabel.string = "100%";
                    let perData = this.getPercentage(configBlocks, result.levelIndex, result.picIndex)
                    this.myWorkProgressLabel.string = perData.num2 + "/" + perData.num2;
                    // this.whoAmI.active = true;
                    // this.answer.node.active = true;

                    // const answerSpritePath = `res/texture/album/whoAmI/UI_Sticker_Name/UI_Sticker_name${result.picIndex}`;
                    // answerSpriteFramePromise = ResManager.getInstance().loadSpriteFrame(answerSpritePath, "block")
                    //     .then((spriteFrame) => {
                    //         this.answer.spriteFrame = spriteFrame;
                    //     });
                } else {
                    //this.whoAmI.active = true;
                    this.answer.node.active = false;
                    let perData = this.getPercentage(configBlocks, result.levelIndex, result.picIndex)
                    this._currPerData = perData
                    this._changeNum = this._currPerData.num1 + 1
                    let progress = perData.num;
                    this.currProgress = progress;
                    if (level + 1 > 215) {
                        this.nextProgress = 1;
                    } else {
                        const result2 = this.getProgress(level + 1, configBlocks);

                        this.increment = this.currProgress
                        this._nextPerData = this.getPercentage(configBlocks, result2.levelIndex, result2.picIndex)
                        this.nextProgress = this._nextPerData.num;

                        if (this.nextProgress < 0.01) {
                            this.nextProgress = 1;
                        }
                    }

                    console.log("[generateWorkWithLevel] NEXT PROGRESSS = " + this.nextProgress.toString());

                    this.myWorkProgress.progress = progress;
                    this.myWorkProgressLabel.string = perData.num1 + "/" + perData.num2;
                }

                const picConfig = `res/configs/myWorkShow${result.picIndex}`;
                const bgPic = `res/texture/album/UI_StickerPanel_Sticker${result.picIndex}_Base`;

                // Load the background sprite frame
                const bgSpriteFramePromise = ResManager.getInstance().loadSpriteFrame(bgPic, "block")
                    .then((spriteFrame) => {
                        this.bgSprte.spriteFrame = spriteFrame;

                        const boardConfigMap = new Map<number, ILevelShowMyWork>();

                        // Load the picture configuration
                        return ResManager.getInstance().loadJson<any>(picConfig, "block")
                            .then((jsonFile) => {
                                const picJson = jsonFile;

                                const ret = this.generateBoardMapping(picJson.board, boardConfigMap);
                                Global.myWorkShowBoard = boardConfigMap;
                                Global.myWorkShowMaxX = ret.maxX;
                                Global.myWorkShowMaxY = ret.maxY;
                                // Create the view
                                this.createView(boardConfigMap, result.picIndex, result.levelIndex, ret.maxX, ret.maxY);
                            });
                    });

                // Combine all promises
                const allPromises = [bgSpriteFramePromise];
                if (answerSpriteFramePromise) {
                    allPromises.push(answerSpriteFramePromise);
                }

                // Return a promise that resolves when all operations are complete
                return Promise.all(allPromises).then(() => {
                    // All asynchronous operations are complete
                });
            })
            .catch((error) => {
                console.error("Error in generateWorkWithLevel:", error);
                throw error; // Re-throw the error to allow caller to handle it if necessary
            });
    }

    private getProgress(currLevel: number, jsonFile: Record<string, any>) {
        let mapData = jsonFile.mapping;
        let total = 0;
        let i = 0;
        let indexInPic = 0;
        let retId = 0; // 小于等于这个id的都要被涂色
        if (UserLevelData.inst.isAllLevelFinished == 1) {
            currLevel += 1;
        }
        for (; i < mapData.length; i++) {
            let rewardList = mapData[i].rewardList
            if (total + rewardList.length >= currLevel) {
                // 说明在这张图里,且indexInPic至少为1
                indexInPic = currLevel - total;
                for (let j = 0; j < indexInPic - 1; j++) { // todo indexInPic - 1
                    retId += rewardList[j];
                }
                break;
            }
            total += rewardList.length;
        }

        console.log("picIndex: ", i + 1, " levelIndex: ", retId);
        return { picIndex: i + 1, levelIndex: retId };
    }

    private getPercentage(jsonFile: Record<string, any>, num1: number, num2: number) {

        let mapData = jsonFile.mapping;
        if (mapData[num2 - 1] == undefined) {
            return { num: 0, num1: 0, num2: 0 };
        }
        let num = 1.0 * num1 / (mapData[num2 - 1].totalLevels)
        return { num: num, num1: num1, num2: mapData[num2 - 1].totalLevels };
    }

    private generateBoardMapping(boardData: Array<ILevelShowMyWork>, boardConfigMap: Map<number, ILevelShowMyWork>) {
        let maxX = 1;
        for (let i = 0; i < boardData.length; i++) {
            if (boardData[i].x + 1 > maxX) {
                maxX = boardData[i].x + 1;
            }
            let key = 100 * boardData[i].x + boardData[i].y;
            boardConfigMap.set(key, boardData[i]);
        }

        let maxY = 1;
        for (let i = 0; i < boardData.length; i++) {
            if (boardData[i].y + 1 > maxY) {
                maxY = boardData[i].y + 1;
            }
        }
        return { maxX: maxX, maxY: maxY };
    }

    private async createViewForAdded(
        boardConfigMap: Map<number, ILevelShowMyWork>,
        picNum: number,
        levelIndex: number,
        lastLevelIndex: number,
        maxX: number
    ): Promise<Map<number, BlockEntity>> {
        let pool = NodePoolManager.inst.getPool("MyWorkPool");
        if (!pool) {
            return new Map();  // 如果池不存在，返回一个空的 Map
        }
        let seqNum = 0;
        const promises: Promise<[number, BlockEntity | null]>[] = []; // 用于存储每个异步块获取任务
        if (maxX === undefined || maxX === null || maxX <= 0) {
            maxX = 18; //第一个的x
        }
        // 遍历所有的块，并发起异步请求
        for (let i = 0; i < 18; i++) {
            for (let j = 0; j < maxX; j++) {
                let key = 100 * j + i;

                // 检查该块是否在配置中
                if (boardConfigMap.has(key)) {
                    const aboardData = boardConfigMap.get(key);
                    if (aboardData.id > levelIndex || aboardData.id <= lastLevelIndex) {
                        continue;
                    }

                    // 将异步任务放入 promises 数组
                    promises.push(
                        pool.getAsync().then((block) => {
                            if (!this.node) {
                                pool.put(block);
                                return [key, null];  // 如果节点不存在，返回 [key, null]
                            }

                            let blockEntity = block.getComponent(BlockEntity);

                            // 检查块是否在有效的级别范围内
                            // if (aboardData.id > levelIndex || aboardData.id <= lastLevelIndex) {
                            //     pool.put(block);
                            //     return [key, null];  // 超过范围时返回 [key, null]
                            // }

                            // 更新块的父级和显示
                            block.parent = this.onGoingSpriteNode;
                            blockEntity.refreshColorOnMyWork(aboardData.blockType, picNum, aboardData.id);

                            // 更新块的位置
                            block.setPosition(new Vec3(0, -260, 0));
                            block.setScale(new Vec3(0, 0, 1));
                            //block.setPosition(new Vec3(100 + 21 * (seqNum % 15), -400 + 21 * Math.floor(seqNum / 15), 0));
                            this.allBlocks.set(aboardData.id, block);

                            seqNum++;
                            //console.log("init CurrentTime: ", new Date().getMilliseconds());
                            return [key, blockEntity];  // 返回 [key, BlockEntity]
                        })
                    );
                }
            }
        }

        // 等待所有的异步操作完成
        const keyBlockPairs = await Promise.all(promises);

        // 创建一个新的 Map，过滤掉 null 值，并返回有效的块
        const resultMap = new Map<number, BlockEntity>(
            keyBlockPairs.filter(([key, blockEntity]) => blockEntity !== null) as [number, BlockEntity][]
        );

        return resultMap;
    }

    private createView(boardConfigMap: Map<number, ILevelShowMyWork>, picNum: number, levelIndex: number, maxX: number, maxY: number) {
        let pool = NodePoolManager.inst.getPool("MyWorkPool");
        if (!pool) {
            return;
        }
        for (let i = 0; i < maxY; i++) { // rows
            for (let j = 0; j < maxX; j++) { //column
                let key = 100 * j + i;
                let blockType = 0;
                if (boardConfigMap.has(key)) {
                    let aboardData = boardConfigMap.get(key);
                    if (aboardData.id > levelIndex) {
                        continue;
                    }
                    pool.getAsync().then((block) => {
                        if (!this.node) {
                            pool.put(block);
                            return;
                        }

                        let blockEntity = block.getComponent(BlockEntity);

                        block.parent = this.onGoingSpriteNode;
                        // console.log("[createView] update block type, levelIndex: " + levelIndex + " myId: " + aboardData.id)
                        blockType = aboardData.blockType;
                        blockEntity.refreshColorOnMyWork(blockType, picNum, aboardData.id);
                        block.setPosition(this.calculateBlockposition(aboardData.y, 18 + (maxX - 18) / 2 - aboardData.x));
                        this.allBlocks.set(aboardData.id, block);
                    });
                }
            }
        }
    }

    private calculateBlockposition(x: number, y: number) {
        let minX = -this.bgSprte.spriteFrame.originalSize.x / 2;
        let maxY = this.bgSprte.spriteFrame.originalSize.y / 2;

        return new Vec3((x + 1) * 21 - 2 + minX, (y - 9.3) * 21);
    }

    onClickSave() {
        // 稍后改为play exit
        //this.finishAnimNode.getComponent(Animation).play("cw_sticker_reward_exit");
        //this.clearNodes();
        this.onGoingSpriteNode.destroyAllChildren();
        if (UserLevelData.inst.isAllLevelFinished == 0) {
            this.ShowOnlyMyWork(0);
        }

        if (UserLevelData.inst.isAllLevelFinished == 1) {
            this.ShowOnlyMyWork(0);
        }
        this.node.active = true;
        this.finishAnimNode.active = false;
        // this.scheduleOnce(() => {
        //     this.finishAnimNode.active = false;
        // }, 0.8);

    }

    clearNodes() {
        //console.log("[clearNodes] !!! [nodes length]: ", this.allBlocks.size);
        let pool = NodePoolManager.inst.getPool("MyWorkPool");
        //console.log("[clearNodes] !!! [Pool Size]: ", pool.size)
        this.allBlocks.forEach((node, key) => {
            pool.put(node);
        })
        this.allBlocks.clear();

    }

    protected onDisable(): void {
        this.clearNodes();
    }
}