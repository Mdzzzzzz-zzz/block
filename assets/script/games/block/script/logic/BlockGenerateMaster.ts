import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { emShareEvent, emSharePath } from "../../../../sdk/wechat/SocialDef";
import { BlockGenerate001, IBlockGenetateResult } from "./BlockGenerate";
/**
 * 根据块的难度分组 和 补救措施算法
 */
export class BlockGenerateMaster extends BlockGenerate001 {
    public getPreviewBlocks(
        score: number,
        combo: number,
        collect: number,
        hard_level: number,
        hard_type: number,
        tableData: any,
        can_put_block: Function,
        clearAllFillScore:number
    ): Promise<IBlockGenetateResult> {
        this.round++;
        score = 0;
        let emptyCount: number = 0;
        const num = 8;
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < num; j++) {
                if (tableData[i][j] == 0) {
                    emptyCount++;
                }
            }
        }
        let hscore = UserScoreLevelData.inst.getLastScore();
        score = Math.max(hscore, score);
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
        let preIds = [];
        let minClearNum: number = 3;
        let minMatrixNum: number = 0;
        let recommendGetItem = 2;
        let nextPutType = 2;
        // let diff = recommendConfig.diff || [32, 24, 16];
        let scorePropFix = scoreGroupId * 0.5;
        let diff = [36, 24, 12];
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
                minClearNum = this.getMinClearNumFix(3);
                this.recommendSimpleTimes += 1;
                // diffPath = `normal prop:${prop}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            } else {
                recommendGetItem = 1;
                minClearNum = 2;
                nextPutType = 0;
                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            let randomAll = Math.random() * 100;
            fixProp = Math.min(30 + round10Times + scorePropFix - this.randomAllTimes * 30, 40);
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
                minClearNum = this.getMinClearNumFix(3);
                nextPutType = 0;
                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            let randomAll = Math.random() * 100;
            fixProp = Math.min(20 + round10Times + scorePropFix - this.randomAllTimes * 20, 30);
            //最大60% 概率全随机
            if (randomAll < fixProp) {
                //根据难度调整下 0 0 0 最难 1 3 0 简单了
                if (this.randomAllTimes > 0 || this.isFirstPlay) {
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
                recommendGetItem = 2;
                nextPutType = 2;
                minClearNum = 2;
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
            let randomAll = Math.random() * 100;
            fixProp = Math.min(15 + round10Times + scorePropFix - this.randomAllTimes * 15, 25);
            //最大50% 提升难度
            if (randomAll < fixProp) {
                recommendGetItem = 1;
                minClearNum = this.getMinClearNumFix(3);
                nextPutType = 0;
                this.randomAllTimes += 1;
                // randomPath = `random prop:${randomAll}<${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
            } else {
                this.randomAllTimes = 0;
                // randomPath = `not random prop:${randomAll}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.randomAllTimes}`
            }
        } else if (emptyCount < diff[2]) {
            this.enterDangerousTimes++;
            let prop = Math.random() * 100;
            exceptIds = [39, 40, 41];
            let fixProp = Math.min(75 - round10Times - this.recommendSimpleTimes * 30, 65) - scorePropFix;
            if (prop < fixProp) {
                //深度推荐 解除困难
                if (this.randomAllTimes > 0) {
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

                //[39, 40, 41, 33, 34, 14, 15];
            } else {
                minClearNum = 2;
                nextPutType = 2;
                minClearNum = this.getMinClearNumFix(3);
                this.recommendSimpleTimes = 0;
                // diffPath = `normal prop:${prop}>=${fixProp} count:${emptyCount}>${diff[0]} times:${this.recommendSimpleTimes}`
            }
            if (this.enterDangerousTimes > 1) {
                let randomAll = Math.random() * 100;
                fixProp = Math.min(10 + round10Times + scorePropFix - this.randomAllTimes * 10, 20);
                //最大40% 提升难度
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
            } else {
                minClearNum -= 1;
            }
        }
        if (score < 500 && emptyCount < 12) {
            //500分以下 摆当的比较满的时候
            diffPath = "500";
            minClearNum = 2;
            nextPutType = 2;
            minClearNum = 1;
            exceptIds = [39, 40, 41, 33, 34, 14, 15];
        }
        // console.log(diffPath);
        // console.log(randomPath);
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
        // console.log(result);
        SdkEventManager.getInstance().emit(emShareEvent.share_happy, result.isRecommendHigh, emSharePath.score_happy);
        return new Promise((resolve, reject) => {
            resolve(result);
        });
    }
    public getMinClearNumFix(origin: number): number {
        if (this.diffLevel > 8 && this.round > 8) {
            return origin;
        }
        return super.getMinClearNumFix(origin);
    }
}
