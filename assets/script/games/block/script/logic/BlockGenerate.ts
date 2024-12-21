/**
 * 大逃杀 块生成 逻辑
 */
import { ScoreHelper } from "./ScoreHelper";
import {
    BigBlocks,
    EasyBlocks,
    HardBlocks,
    HardExBlocks,
    IBlockGenWeight,
    ReviviBlocks,
    RoundCdBlocks,
    SimpleBlocks,
} from "../define/BlockType";
import { Random } from "../../../../util/Random";
import { BlockFillMaster } from "./BlockFillMaster";
import { mk } from "../../../../MK";
import * as env from "cc/env";
import { UserData } from "../../../../data/UserData";
import { PREVIEW } from "cc/env";
export interface IBlockGenetateResult {
    blockIds: Array<number>;
    isRecommendHigh: boolean;
    color: Array<number>; // set color for block
    multiArr: Array<number>;
    allcArr: Array<number>;
}
export class BaseBlockGenerate {
    protected random: Random;
    protected scHelper: ScoreHelper;
    // protected recomend:BlockRecommend;
    constructor(random: Random, score: ScoreHelper, actionKey: string) {
        this.random = random;
        this.scHelper = score;
        // this.recomend = new BlockRecommend(score,actionKey);
    }

    public getNextBlockType(score: number, tableData: any) {
        return 1;
    }
    public getNextPreviewBlocks(score: number, tableData: any) {
        return 1; //this.recomend.generateRecommendBlock(tableData);
    }
    public getPreviewBlocks(
        score: number,
        combo: number,
        collect: number,
        hard_level: number,
        hard_type: number,
        tableData: any,
        can_put_block: Function,
        clearAllFillScore: number
    ): Promise<IBlockGenetateResult> {
        return null;
    }
    public setHistoryData(levelData: ILevelData) {}
    public getPreviewBlocksAfterRelife(
        score: number,
        combo: number,
        tableData: any,
        can_put_block: Function
    ): IBlockGenetateResult {
        return null;
    }
    public getAdRefreshBlockIndex(score: number, combo: number, tableData: any, exceptIds: Array<number>): number {
        return 1;
    }
    protected checkData(score?: number) {}
}

// 无尽模式
export class BlockGenerate001 extends BaseBlockGenerate {
    protected configs;
    public round: number = 0;
    protected scoreGroups: Array<number>; //[300,500..9999]
    // protected scoreBlockWeights: Array<Array<number>>;
    protected blockWightsTable: Map<number, Array<IBlockGenWeight>>;
    protected blockTotalWightsTable: Map<number, number>;
    // protected recomendMaster: BlockRecommendMaster;
    protected blockFill: BlockFillMaster;
    protected randomAllTimes: number = 0;
    protected recommendSimpleTimes: number = 0;
    protected enterDangerousTimes: number = 0;
    protected diffLevel: number = 0;
    protected failLevelTimes: number = 0;
    protected isFirstPlay: boolean = false;
    public setHistoryData(levelData: ILevelData) {
        this.round = levelData.round || 0;
    }
    protected isRoundControllBlock(id: number): boolean {
        return (
            HardBlocks.indexOf(id) > -1 ||
            HardExBlocks.indexOf(id) > -1 ||
            BigBlocks.indexOf(id) > -1 ||
            EasyBlocks.indexOf(id) > -1
        );
    }
    protected isCanWeightUpBlock(index: number): boolean {
        return SimpleBlocks.indexOf(index) > -1;
    }
    public initGenetateFill() {
        return true;
    }
    constructor(random: Random, score: ScoreHelper, actionKey: string, configPath: string = "res/configs/score_block") {
        super(random, score, actionKey);
        this.round = 0;
        this.blockFill = new BlockFillMaster();
        let scoreArray = mk.subRes.loadJsonConfig(configPath);
        this.scoreGroups = new Array<number>(scoreArray.length);
        this.blockWightsTable = new Map<number, Array<{ index: number; weight: number }>>();
        this.blockTotalWightsTable = new Map<number, number>();
        let dataInst = UserData.inst;
        this.isFirstPlay = dataInst.isFirstPlay || (dataInst.isFirstLoginToday && dataInst.onlinePlayTimes == 0);

        for (let index = 0; index < scoreArray.length; index++) {
            const element = scoreArray[index];
            this.scoreGroups[index] = element.score;
            let socreWeight = new Array<IBlockGenWeight>(element.count);
            let totalWeight = 0;
            for (let i = 0; i < element.count; i++) {
                let id = i + 1;
                let round = this.isRoundControllBlock(id) ? 3 : 0;
                let weight = element[`${id}`];
                if (weight > 0) {
                    totalWeight += weight;
                    socreWeight[i] = { index: id, weight: weight, cdRound: round, genRound: -1 };
                }
            }
            this.blockWightsTable.set(index, socreWeight);
            this.blockTotalWightsTable.set(index, totalWeight);
        }
        this.configs = scoreArray;
    }
    /**
     * 复活后推荐
     * @param score
     * @param tableData
     * @param can_put_block
     * @returns
     */
    public getPreviewBlocksAfterRelife(
        score: number,
        combo: number,
        tableData: any,
        can_put_block: Function
    ): IBlockGenetateResult {
        this.round++;
        console.log("当前调难度依据：复活 当前难度: 复活算法" );
        //根据当前的score和是否复活计算一下难度的概率
        let scoreGroupId = 0;
        for (let i = 0; i < this.scoreGroups.length; i++) {
            const scoreConfig = this.scoreGroups[i];
            if (score < scoreConfig) {
                scoreGroupId = i;
                break;
            }
        }
        let exceptPos = [];
        let exceptIds = [];
        let preIds = [];
        let minClearNum: number = 1;
        let minMatrixNum: number = 0;
        let recommendGetItem = 2;
        let nextPutType = 1;
        // let minClearNum: number = emptyCount > 32 ? 2 : 1;
        // let minMatrixNum: number = 0;
        let result = this.computePreviwBlocks(
            tableData,
            can_put_block,
            scoreGroupId,
            recommendGetItem,
            nextPutType,
            exceptPos,
            exceptIds,
            preIds,
            minClearNum,
            minMatrixNum
        );
        return result;
    }
    /**
     * 广告刷新后推荐
     * @param score
     * @param tableData
     * @returns
     */
    public getAdRefreshBlockIndex(score: number, tableData: any, exceptIds: Array<number>): number {
        let scoreGroupId = 0;
        for (let i = 0; i < this.scoreGroups.length; i++) {
            const scoreConfig = this.scoreGroups[i];
            if (score < scoreConfig) {
                scoreGroupId = i;
                break;
            }
        }
        let blocks = this.blockWightsTable.get(scoreGroupId);

        let useGenBlocks = blocks.filter((block) => {
            let blockIndex = block.index;
            // if (this.isRoundControllBlock(blockIndex)) {
            //     let genRound = block.genRound || -1;
            //     let cdRound = block.cdRound || 1;
            //     return this.round - genRound > cdRound && block.weight > 0;
            // }
            return block.weight > 0;
        });
        let clearIndex = this.blockFill.generateRecommendBlock(tableData, useGenBlocks, 1, 0, [], exceptIds, 1, 0);
        if (clearIndex.length > 0) {
            if (env.PREVIEW || env.EDITOR) {
                console.log("广告最优推荐了：", clearIndex);
            }
            return clearIndex.shift().blockIndex;
        }
        return 1;
    }
    protected randByWeight(sid: number, arr: Array<IBlockGenWeight>): number {
        let totalWeight = 0;
        for (let index = 0; index < arr.length; index++) {
            const element: IBlockGenWeight = arr[index];
            if (element.roundWeight != undefined && element.roundWeight != -1) {
                totalWeight += element.roundWeight;
            } else {
                totalWeight += element.weight;
            }
        }
        let randIndex = 0;
        if (totalWeight <= 0) {
            return randIndex;
        } else {
            let randVal: number = this.getRandomIntInclusive(1, totalWeight);
            for (let index = 0; index < arr.length; index++) {
                const element: IBlockGenWeight = arr[index];
                const weight =
                    element.roundWeight != undefined && element.roundWeight != -1
                        ? element.roundWeight
                        : element.weight;
                if (randVal <= weight) {
                    randIndex = index;
                    break;
                } else {
                    randVal -= weight;
                }
            }
        }
        return randIndex;
    }

    /**
     * describe: 在范围内获取随机整数值 [min, max]
     * @param min : 最小值
     * @param max : 最大值
     */
    protected getRandomIntInclusive(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    public getBlockAiTipCoord(tableData, blockIndex, minClear: number = 0): Promise<IBlockFillItem> {
        return new Promise<IBlockFillItem>((resolve, reject) => {
            let results = this.blockFill.generateRecommendBlock(
                tableData,
                [{ index: blockIndex, weight: 100 }],
                1,
                0,
                [],
                [],
                minClear,
                0
            );
            if (results.length == 0) {
                reject(null);
                return;
            }
            // results.sort((a, b) => {
            //     if (b.fillFull !== a.fillFull) {
            //         return b.fillFull - a.fillFull;
            //     } else {
            //         return b.res - a.res;
            //     }
            // });
            // if (PREVIEW) {
            //     console.log("推荐系统总筛选：", results);
            // }
            // resolve(results[0]);
            let item = this.blockFill.computeRecommendBlock(results,minClear,0);
            resolve(item);
        });
    }

    protected computePreviwBlocks(
        tableData: any,
        can_put_block: Function,
        scoreGroupId: number,
        recommendGetItem: number,
        nextPutType: number,
        exceptPos: Array<number>,
        exceptIds: Array<number>,
        preIds: Array<number>,
        minClearNum: number,
        minMatrixNum: number
    ): IBlockGenetateResult {
        let blocks = this.blockWightsTable.get(scoreGroupId);
        let useGenBlocks = blocks.filter((block) => {
            if (this.isRoundControllBlock(block.index)) {
                return block.weight > 0 && this.round - block.genRound > block.cdRound;
            }
            return block.weight > 0;
        });
        let mini_blks = [];
        if (preIds && preIds.length > 0) {
            mini_blks = preIds;
        }
        //有preIds的不进入推荐计算
        //推荐多消除三行 或者连续子序列24个提示高光
        let isRecommendHigh: boolean = false;
        if (mini_blks.length == 0) {
            if (recommendGetItem > 0) {
                let clearItems = this.blockFill.generateRecommendBlock(
                    tableData,
                    useGenBlocks,
                    recommendGetItem,
                    nextPutType,
                    exceptPos,
                    exceptIds,
                    minClearNum,
                    minMatrixNum
                );
                if (clearItems && clearItems.length > 0) {
                    if (env.PREVIEW || env.EDITOR) {
                        console.log("最优推荐了：", clearItems);
                    }
                    clearItems.forEach((item) => {
                        if (mini_blks.length < 3) {
                            mini_blks.push(item.blockIndex);
                            if (!isRecommendHigh) {
                                isRecommendHigh = item.fillFull > 3 || item.res > 32;
                            }
                        }
                    });
                }
                // console.log("推荐块：", clearItems);
            }
        } else if (mini_blks.length == 2) {
            //关卡有推荐快的情况
            recommendGetItem = 1;
            exceptIds = exceptIds.concat(mini_blks);
            let clearItems = this.blockFill.generateRecommendBlock(
                tableData,
                useGenBlocks,
                recommendGetItem,
                nextPutType,
                exceptPos,
                exceptIds,
                minClearNum,
                minMatrixNum
            );
            if (clearItems && clearItems.length > 0) {
                if (env.PREVIEW || env.EDITOR) {
                    console.log("最优推荐了：", clearItems);
                }
                clearItems.forEach((item) => {
                    if (mini_blks.length < 3) {
                        mini_blks.push(item.blockIndex);
                        if (!isRecommendHigh) {
                            isRecommendHigh = item.fillFull > 3 || item.res > 32;
                        }
                    }
                });
            }
            // console.log("关卡前置块+推荐块：", clearItems);
        }
        let randomCount = 3 - mini_blks.length;
        //过滤掉已经在推荐组合中的块并且不满足cd的块
        useGenBlocks = useGenBlocks.filter((block) => {
            return !(
                mini_blks.indexOf(block.index) > -1 ||
                exceptIds.indexOf(block.index) > -1 ||
                (block.cdRound > 0 && this.round - block.genRound < block.cdRound)
            );
        });
        mini_blks.forEach((blockIndex) => {
            if (this.isRoundControllBlock(blockIndex)) {
                //不同时出现难块
                exceptIds = exceptIds.concat(RoundCdBlocks);
            }
        });
        let rand_blks = [];
        for (let i = 0; i < randomCount; i++) {
            //保证不同时出现相同的块
            useGenBlocks = useGenBlocks.filter((block) => {
                return !(rand_blks.indexOf(block.index) > -1 || exceptIds.indexOf(block.index) > -1);
            });
            let arrIndex = this.randByWeight(scoreGroupId, useGenBlocks);
            let block = useGenBlocks[arrIndex];
            // block.genRound = this.round;
            //有难度的块不同时出现
            if (this.isRoundControllBlock(block.index)) {
                block.roundWeight = 0;
                //不同时出现难块
                exceptIds = exceptIds.concat(RoundCdBlocks);
            }
            // else if (EasyBlocks.indexOf(block.index) > -1) {
            //     block.roundWeight = 0;
            //     //不同时出现简单块
            //     exceptIds = exceptIds.concat(EasyBlocks);
            // }
            let blockIndex = block.index;
            rand_blks.push(blockIndex);
            // console.log("随机块：", blockIndex);
        }
        //重制这个回合设置的roundweight 可以控制不同时出现一样的块
        useGenBlocks.forEach((block) => {
            block.roundWeight = -1;
        });

        //计算拯救块
        let deadCount = 0;
        let deadIndexes = [];
        let arr = ReviviBlocks;
        for (let i = 0; i < rand_blks.length; i++) {
            let blockIndex = rand_blks[i];
            if (can_put_block(blockIndex - 1)) {
                continue;
            }
            deadCount++;
            deadIndexes.push(i);
        }
        let reviviBlockIndexes = -1;
        if (deadCount > 1) {
            //换一换功能可以换三个 拯救的位置先就只换一个块
            let replaceCount = 1; //deadCount - 1;
            for (let j = 0; j < replaceCount; j++) {
                //使用1个简单块替换掉
                for (let i = 0; i < arr.length; i++) {
                    let index = arr[i];
                    if (can_put_block(index - 1)) {
                        reviviBlockIndexes = index;
                        break;
                    }
                }
                rand_blks[j] = reviviBlockIndexes;
                console.log("拯救块 " + j, reviviBlockIndexes);
            }
        }
        mini_blks = mini_blks.concat(rand_blks);
        mini_blks.forEach((blockIndex) => {
            blocks.forEach((item) => {
                if (item.index) {
                    if (item && item.index == blockIndex) {
                        item.genRound = this.round;
                    }
                }
            });
        });
        //检查是否有多消
        let result = this.random.shuffleArray(mini_blks);
        return { blockIds: result, isRecommendHigh: isRecommendHigh, color: null, multiArr: [], allcArr: [] };
    }
    /**
     * 全随机以后难度变大 推荐多消行数降低
     * @param origin
     * @returns
     */
    public getMinClearNumFix(origin: number) {
        if (this.randomAllTimes > 0 || this.isFirstPlay) {
            return Math.max(origin - 1, 1);
        }
        return origin;
    }
    public onUpdate(dt: number) {}
    clear() {
        this.scoreGroups.length = 0;
        this.scoreGroups = null;
        this.blockWightsTable.clear();
        this.blockWightsTable = null;
        this.blockTotalWightsTable.clear();
        this.blockTotalWightsTable = null;
    }
}
