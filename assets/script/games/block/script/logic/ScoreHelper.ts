import { PREVIEW } from "cc/env";
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
export enum emComboState {
    None,
    Combo,
    Combo_WAIT,
    Combo_BREAK,
    Combo_End, //end 和 break的区别是 一个combo至少2次end 一次也没有连上的是break
}
export class ScoreHelper {
    public putBlock(blockIndex: number, row: number, col: number) {
        // console.log("放置块", blockIndex, "位置 行:", row, "列:", col);
    }
    public loadConfig(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            resolve(true);
        })
    }

    public continuousCount = 0; // 连消除次数
    public score = 0; // 当前分数 实际分数
    public skillScore = 0; // 技能分数控制
    public collectNum = 0; // 收集物数量
    public userId = 0;
    public combo = 0;
    protected comboBreak = 3;
    //清台时候的分数
    public clearAllFillScore: number = 0;

    // 当前技能数量
    public get skillCount() {
        return Math.ceil(this.skillScore / this.singleSkillScore);
    }

    // 使用技能
    public useSKill() {
        this.usedSkillCount += 1;
        this.skillScore -= this.singleSkillScore;
        const progress = (this.skillScore % this.singleSkillScore) / this.singleSkillScore;
        mk.sendEvent(BlockEventType.EVENT_OP_SKILL_DATA, progress, this.skillCount);
    }

    private usedSkillCount = 0; // 使用过的技能数量

    protected configs: any;

    constructor(userId?: number) {

        this.userId = userId;
        this.score = 0;
        this.collectNum = 0;
        this.skillScore = 0;
        this.comboBreak = 3;

        mk.regEvent(BlockEventType.EVENT_PUT_BLOCK_END, this.onEvtPutBlock, this);
        mk.regEvent(BlockEventType.EVENT_CLEAR_BLOCK_END, this.onEvtClearBlock, this);
        mk.regEvent(BlockEventType.EVENT_COMBO_BLOCK_END, this.onEvtCombo, this);
        mk.regEvent(BlockEventType.EVENT_CLEAR_ALL_BLOCK_END, this.onEvtClearAll, this);
        mk.regEvent(BlockEventType.EVENT_OP_USE_SKILL_ANI_END, this.onEvtSkillClearBlock, this);
        mk.regEvent(BlockEventType.EVENT_COLLECT_ITEM_END, this.onEvtCollectItem, this);
        mk.regEvent(BlockEventType.EVENT_USE_ITEM_END, this.onEvtUsedItem, this);
    }

    private onEvtPutBlock(userId: number, blockCount: number) {
        let score = blockCount * this.putBlockScore;
        if (PREVIEW) {
            console.log("放置得分:", score);
        }
        this.addScore(score);
    }

    private onEvtClearBlock(userId: number, clearCount: number, comboCount: number) {
        let scoreCombo = comboCount - 1;
        let score = this.getClearBlockScore(clearCount, comboCount - 1);
        if (PREVIEW) {
            console.log(
                "计算消除行数:",
                clearCount,
                " 连击数:",
                comboCount,
                "加分连击数:",
                scoreCombo,
                "清行得分:",
                score
            );
        }
        this.addScore(score);
    }

    public getComboTimes() {
        return this.combo > 0 ? this.combo : 0;
    }

    public getClearBlockScore(clearCount: number, comboCount: number) {
        comboCount = comboCount || 0;
        if (comboCount < 0) {
            comboCount = 0;
        }
        // i. 消除得分=（消除行数 * 10）*（连消数+1）+额外消除分
        // return this.clearBlockScore * this.getClearMultipleBlockScore(clearCount);
        let addExtraScore = 0;
        // 1. 一次消除1行：额外消除分0分
        // 2. 一次消除2行：额外消除分0分
        // 3. 一次消除3行：额外消除分30分
        // 4. 一次消除4行：额外消除分80分
        // 5. 一次消除5行：额外消除分150分
        // 6. 一次消除6行及以上：额外消除分240分
        switch (clearCount) {
            case 3:
                addExtraScore = 30;
                break;
            case 4:
                addExtraScore = 80;
                break;
            case 5:
            case 6:
                addExtraScore = 150;
                break;
            default:
                break;
        }
        return clearCount * this.clearBlockScore * (comboCount + 1) + addExtraScore;
    }

    private onEvtCombo(userId: number, comboCount: number, clearCount: number) {
        // this.addScore(this.getContinueClearBlockScore(comboCount, clearCount));
    }

    private onEvtClearAll(userId: number) {
        this.addScore(this.clearAllScore);
        // mk.log("clear all block - score :", this.score);
    }
    public recordClearAllFillScore(comboState: emComboState, clearNumber: number, round: number) {
        if (this.clearAllFillScore == 0) {
            let currScore = this.score;
            let comboTimes = this.getComboTimes();
            if (comboState == emComboState.Combo && comboTimes > 1) {
                // currScore += this.getContinueClearBlockScore(comboTimes, clearNumber);
                currScore += this.getClearBlockScore(clearNumber, comboTimes - 1);
            } else {
                currScore += this.getClearBlockScore(clearNumber, 0);
            }
            currScore += this.clearAllScore;
            this.clearAllFillScore = currScore;
            if (PREVIEW) {
                console.log("record clear all fill score :", this.clearAllFillScore);
            }
            this.onClearAllBlock(currScore, round);
        }
    }
    protected onClearAllBlock(currScore: number, round: number) { }
    public checkResetClearAllFillScore() {
        if (this.clearAllFillScore == 0) {
            return;
        }
        if (PREVIEW) {
            console.log("check reset clear all fill score :", this.clearAllFillScore, this.score);
        }
        if (this.clearAllFillScore + 200 < this.score) {
            this.clearAllFillScore = 0;
            if (PREVIEW) {
                console.log("reset success clear all fill score :", 0);
            }
        }
    }
    private onEvtSkillClearBlock(userId: number, clearCount: number) {
        this.addScore(this.skillClearBlock * clearCount);
    }
    private onEvtCollectItem(userId: number, blockType: number, collectNumber: number) {
        this.collectNum += collectNumber
        if (PREVIEW) {
            console.log("收集物种类:",
                blockType,
                " 收集物种数:",
                collectNumber,
                " 收集物种总数:",
                this.collectNum
            );
        }
    }

    private onEvtUsedItem(clearCount: number) {
        this.addScore(clearCount);
    }
    /**
     * 连击后三次以内消除可以算连击
     */
    private comboFixNumber = 2;
    private clearContinueTimes = 0;
    public checkCombo(clearCount: number): emComboState {
        //进行连击的判定 3次以内可以持续连击
        if (clearCount > 0) {
            this.clearContinueTimes += 1;
            if (this.clearContinueTimes >= 1) {
                this.comboBreak = this.comboFixNumber;
                this.combo += 1;
                return emComboState.Combo;
            }
            this.comboBreak = this.comboFixNumber;
            //消除一次后下一次是连击
            return emComboState.Combo_WAIT;
        } else {
            if (this.clearContinueTimes >= 1) {
                if (this.comboBreak > 0) {
                    this.comboBreak -= 1;
                    return emComboState.Combo_WAIT;
                } else {
                    //取消 combo
                    if (PREVIEW) {
                        console.log("连击结束:", this.combo);
                    }
                    this.clearContinueTimes = 0;
                    this.combo = 0;
                    this.comboBreak = this.comboFixNumber;
                    return emComboState.Combo_End;
                }
            } else {
                if (PREVIEW) {
                    console.log("打断连击:", this.combo);
                }
                this.clearContinueTimes = 0;
                this.combo = 0;
                this.comboBreak = this.comboFixNumber;
                return emComboState.Combo_BREAK;
            }
        }
    }

    protected addScore(score: number) {
        //0应该return下
        if (score <= 0) {
            return;
        }
        this.score += score;
        // this.skillScore += score;
        // this.skillScore = Math.min(this.skillScore, this.singleSkillScore * this.maxSkillCount);
        // const progress = this.skillScore % this.singleSkillScore / this.singleSkillScore;
        // mk.sendEvent(BlockEventType.EVENT_OP_SKILL_DATA, progress, this.skillCount);
        this.checkResetClearAllFillScore();
    }

    // 获取消行/列时的分数
    private get clearBlockScore(): number {
        return this.configs?.ClearBlockLine || 10;
    }

    // 获取消除多行时 对应倍数
    private getClearMultipleBlockScore(count: number): number {
        const config = this.configs.ClearBlockMultiple;
        const index = count > config.length ? config.length : count;
        if (index == 0) return 0;
        return config[index - 1];
    }

    // 获取连续消除时 对应分数
    public getContinueClearBlockScore(count: number, clearCount: number): number {
        let comboScore = count * this.getClearMultipleBlockScore(clearCount) * this.clearBlockScore;
        // console.log("连击次数：", count, "连接额外得分：", comboScore);
        return comboScore;
    }

    // 获取放置单个块的对应分数
    private get putBlockScore(): number {
        return this.configs.PutBlockScore;
    }

    // 清场分数
    public get clearAllScore(): number {
        return this.configs?.ClearAll || 300;
    }

    // 分数兑换技能 比例
    private get singleSkillScore(): number {
        return this.configs?.SkillNeed || 300;
    }

    // 最大持有技能数
    private get maxSkillCount(): number {
        return this.configs?.SkillMax || 5;
    }

    // 技能消除块得分
    private get skillClearBlock(): number {
        return this.configs?.SkillClearBlock || 1;
    }

    public setHistoryData(levelData: ILevelData) {
        this.score = levelData.score || 0;
        this.skillScore = levelData.skillScore || 0;
        this.continuousCount = levelData.continuousCount || 0;

    }
    public loadHistoryMaxScore() { }
    public reset() {
        this.continuousCount = 0;
        this.score = 0;
        this.skillScore = 0;
        this.userId = 0;
    }
    clear() {
        this.reset();
        mk.unRegEvent(this);
    }
    resetGameRecordState() {

    }
    public checkIsCanOpenAITips() {
        return false;
    }
}
