import { Random } from "../../../../util/Random";
import { BlockGenerate001, IBlockGenetateResult } from "./BlockGenerate";
import { ScoreHelper } from "./ScoreHelper";
import { IBlockGenWeight } from "../define/BlockType";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { emShareEvent, emSharePath } from "../../../../sdk/wechat/SocialDef";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { ResManager } from "../../../../resource/ResManager";
import { JsonAsset } from "cc";
import { mk } from "../../../../MK";

/**
 * 根据块的难度分组 和 补救措施算法
 */
export class BlockGenerateMasterLevel extends BlockGenerate001 {
    // protected scoreBlockWeights: Array<Array<number>>;
    protected levelConfig: ILevelConfig;
    private simpleRound = 4;

    /**
     * 加载权重的配置
     * @param random 

     * @param score 
     * @param actionKey 
     */
    constructor(levelConfig: ILevelConfig, random: Random, score: ScoreHelper, actionKey: string) {
        super(random, score, actionKey);
        this.levelConfig = levelConfig;
        let inst = UserAdventureLevelData.inst;
        let blockConfig = inst.getLevelBlockConfigPath();
        let scoreArray = mk.subRes.loadJsonConfig(blockConfig);
        this.scoreGroups = new Array<number>(scoreArray.length);
        // this.scoreBlockWeights = new Array<Array<number>>(scoreArray.length);
        this.blockWightsTable = new Map<number, Array<{ index: number; weight: number }>>();
        this.blockTotalWightsTable = new Map<number, number>();
        this.failLevelTimes = inst.getLevelFailTimes();
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

        let imageIndex = Math.floor(this.levelConfig.id / 6 + 1);
        this.simpleRound += imageIndex;
        this.simpleRound = Math.max(this.simpleRound, 8);
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
        this.round++;
        score = 0;
        console.log("[blockGenerateMasterLevel] get Preview blocks")
        //关卡模式根据关卡的等级划分权重
        score = UserAdventureLevelData.inst.getHistoryLevel();
        let emptyCount: number = 0;
        const num = 8;
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < num; j++) {
                if (tableData[i][j] == 0) {
                    emptyCount++;
                }
            }
        }
        //根据当前的score和是否复活计算一下难度的概率
        let scoreGroupId = 0;
        for (let i = 0; i < this.scoreGroups.length; i++) {
            const scoreConfig = this.scoreGroups[i];
            if (score <= scoreConfig) {
                scoreGroupId = i;
                break;
            }
        }
        this.diffLevel = scoreGroupId;
        // let recommendConfig = this.configs[scoreGroupId];
        // let props = recommendConfig.props;
        // let recommendGetItems = recommendConfig.recommendGetItems;
        // let nextPutTypes = recommendConfig.nextPutTypes;
        // let minClearNums = recommendConfig.minClearNums;
        let exceptPos = [];
        let exceptIds = [];
        let minClearNum: number = 3;
        let minMatrixNum: number = 0;
        let recommendGetItem = 1;
        let nextPutType = 0;

        //第一回合使用关卡的干预块填充
        let preIds = this.levelConfig.recommend;
        preIds = preIds && this.round == 1 ? preIds : [];
        let scorePropFix = scoreGroupId * 0.5;
        let diff = [36, 24, 16];
        let diffPath = "";
        let randomPath = "";

        //动态根据round和多消除调整难度
        let round10Times = Math.floor(this.round / 3);
        if (emptyCount >= 48) {
            recommendGetItem = 0;
            minClearNum = 0;
            nextPutType = 0;
        } else if (emptyCount >= diff[0] && emptyCount < 48) {
            //空旷的时候
            // let targetProp = props[0];
            let prop = Math.random() * 100;
            let fixProp = Math.min(60 - round10Times - this.recommendSimpleTimes * 30, 50) - scorePropFix;
            if (prop < fixProp) {
                recommendGetItem = 2;
                nextPutType = 2;
                minClearNum = 3;
                this.recommendSimpleTimes += 1;
                // diffPath = `normal prop:${prop}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            } else {
                recommendGetItem = 1;
                minClearNum = 3;
                nextPutType = 0;

                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            let randomAll = Math.random() * 100;
            fixProp =
                Math.min(20 + round10Times + scorePropFix - this.randomAllTimes * 20, 30) - this.failLevelTimes * 5;
            //最大70% 概率全随机
            if (randomAll < fixProp) {
                recommendGetItem = 0;
                minClearNum = 0;
                nextPutType = 0;
                this.randomAllTimes += 1;
                // randomPath = `random prop:${randomAll}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
            } else {
                this.randomAllTimes = 0;
                // randomPath = `not random prop:${randomAll}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
            }
            // exceptIds = recommendConfig.exceptIds1 || [];
        } else if (emptyCount < diff[0] && emptyCount >= diff[1]) {
            let prop = Math.random() * 100;
            let fixProp = Math.min(70 - round10Times - this.recommendSimpleTimes * 30, 60) - scorePropFix;
            if (prop < fixProp) {
                recommendGetItem = 2;
                nextPutType = 2;
                minClearNum = this.getMinClearNumFix(3);
                this.recommendSimpleTimes += 1;
                // diffPath = `normal prop:${prop}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
                // exceptIds = recommendConfig.exceptIds2 || [];
            } else {
                recommendGetItem = 1;
                minClearNum = 3;
                nextPutType = 0;
                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            let randomAll = Math.random() * 100;
            fixProp =
                Math.min(15 + round10Times + scorePropFix - this.randomAllTimes * 15, 25) - this.failLevelTimes * 3;
            //最大25% 概率全随机
            if (randomAll < fixProp) {
                if (this.randomAllTimes > 0 || this.failLevelTimes > 2 || this.isFirstPlay) {
                    recommendGetItem = 1;
                    minClearNum = 3;
                    nextPutType = 0;
                } else {
                    recommendGetItem = 0;
                    minClearNum = 0;
                    nextPutType = 0;
                }
                this.randomAllTimes += 1;
                // randomPath = `random prop:${randomAll}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
            } else {
                this.randomAllTimes = 0;
                // randomPath = `not random prop:${randomAll}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
            }
        } else if (emptyCount < diff[1] && emptyCount >= diff[2]) {
            // let targetProp = props[2];
            let prop = Math.random() * 100;
            let fixProp = Math.min(70 - round10Times - this.recommendSimpleTimes * 30, 60) - scorePropFix;
            if (prop < fixProp) {
                //深度推荐 解除困难
                if (this.randomAllTimes > 0 || this.failLevelTimes > 2 || this.isFirstPlay) {
                    recommendGetItem = 2;
                    nextPutType = 1;
                    minClearNum = 2;
                } else {
                    recommendGetItem = 2;
                    nextPutType = 2;
                    minClearNum = 2;
                }
                this.recommendSimpleTimes += 1;
                // diffPath = `normal prop:${prop}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
                // exceptIds = recommendConfig.exceptIds3 || []; //[39, 40, 41, 33, 34];
            } else {
                minClearNum = 2;
                nextPutType = 2;
                minClearNum = this.getMinClearNumFix(3);
                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            if (this.isRoundCanRandomAll()) {
                let randomAll = Math.random() * 100;
                fixProp =
                    Math.min(10 + round10Times + scorePropFix - this.randomAllTimes * 10, 20) - this.failLevelTimes * 3;
                //最大20% 提升难度
                if (randomAll < fixProp) {
                    recommendGetItem = 1;
                    minClearNum = 2;
                    nextPutType = 0;
                    this.randomAllTimes += 1;
                    // randomPath = `random prop:${randomAll}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
                } else {
                    this.randomAllTimes = 0;
                    // randomPath = `not random prop:${randomAll}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
                }
            }
        } else if (emptyCount < diff[2]) {
            this.enterDangerousTimes++;
            let prop = Math.random() * 100;
            exceptIds = [39, 40, 41];
            let fixProp = Math.min(75 - round10Times - this.recommendSimpleTimes * 30, 65) - scorePropFix;
            if (prop < fixProp) {
                //深度推荐 解除困难
                recommendGetItem = 2;
                nextPutType = 1;
                minClearNum = 2;
                this.recommendSimpleTimes += 1;
                // diffPath = `normal prop:${prop}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`

                //[39, 40, 41, 33, 34, 14, 15];
            } else {
                minClearNum = 2;
                nextPutType = 2;
                minClearNum = this.getMinClearNumFix(3);
                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            if (this.enterDangerousTimes == 1) {
                minClearNum -= 1;
            } else {
                if (this.isRoundCanRandomAll()) {
                    let randomAll = Math.random() * 100;
                    fixProp =
                        Math.min(5 + round10Times + scorePropFix - this.randomAllTimes * 5, 10) -
                        this.failLevelTimes * 3;
                    //最大10% 提升难度
                    if (randomAll < fixProp) {
                        recommendGetItem = 2;
                        minClearNum = 2;
                        nextPutType = 3;
                        this.randomAllTimes += 1;
                        // randomPath = `random prop:${randomAll}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
                    } else {
                        this.randomAllTimes = 0;
                        // randomPath = `not random prop:${randomAll}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
                    }
                }
            }
        }

        // console.log(diffPath);
        // console.log(randomPath);

        if (this.round < 3 && emptyCount < 20) {
            //500分以下 摆当的比较满的时候
            minClearNum = 2;
            nextPutType = 2;
            minClearNum = 1;
            exceptIds = [39, 40, 41, 33, 34, 14, 15];
        }
        // //失败多次以后加个保护
        // if(this.failLevelTimes>2&& emptyCount < 20){
        //     minClearNum = Math.max(1,minClearNum-1);
        //     exceptIds = [39, 40, 41, 33, 34, 14, 15];
        // }
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
        SdkEventManager.getInstance().emit(emShareEvent.share_happy, result.isRecommendHigh, emSharePath.level_happy);
        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }

    isRoundCanRandomAll() {
        if (this.diffLevel < 6) {
            return true;
        }
        if (this.diffLevel < 16) {
            return this.round > 3;
        }
        return this.round > 8;
    }
}
