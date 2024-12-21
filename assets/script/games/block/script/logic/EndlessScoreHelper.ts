/*
 * @Date: 2023-02-27 15:13:06
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-06 22:09:06
 */
import { mk } from "../../../../MK";
import { ScoreHelper } from "./ScoreHelper";
import { BlockEventType } from "../define/Event";
import { UserData } from "../../../../data/UserData";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import { biEventId } from "../../../../Boot";
import { BIEventID } from "../../../../define/BIDefine";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { Events } from "../../../../event/EventType";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { PREVIEW } from "cc/env";
import { JsonAsset } from "cc";
import { ResManager } from "../../../../resource/ResManager";
import { FlagData } from "../../../../data/FlagData";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";
const OPEN_LEVEL_SCORE = 0;
export class EndlessScoreHelper extends ScoreHelper {
    public historyMaxScore: number = 0;
    public isFirstChallange: boolean = false;
    public isBestScore: boolean = false;

    public diffcult: { [key: number]: number } = {};
    public diffcultScore: number;
    public diffScoreArr: Array<number>;
    public diffScoreBuffArr: Int32Array;
    public scoreMap: { [key: number]: number };
    public enhancedScoreMap: { [key: number]: number };
    constructor(userId?: number) {
        super(userId);
        let maxScore = UserScoreLevelData.inst.getHighestScore();
        if (!maxScore) {
            this.isFirstChallange = true;
        }
        this.historyMaxScore = maxScore || 0;

        this.diffcult = {};
        let scoreDiff = ABTestManager.getInstance().getGroup(ABTestParam.EndlessHardMode);
        let arr = this.getScoreArray(scoreDiff);

        this.diffScoreArr = arr;
        this.diffcultScore = arr[0];
        this.diffScoreBuffArr = new Int32Array(arr);

        this.enhancedScoreMap = {
            1: 1000,
            2: 5000,
            3: 10000,
            4: 20000,
            5: 30000,
        };

        this.scoreMap = {
            1: 250,
            2: 500,
            3: 750,
            4: 2000,
            5: 3000,
            6: 4000,
            7: 8000,
        };
    }
    public loadConfig(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            ResManager.getInstance()
                .loadAsset<JsonAsset>("res/configs/global", "block")
                .then((res) => {
                    this.configs = res.json.level;
                    resolve(true);
                })
                .catch(reject);
        });
    }
    public setHistoryData(levelData: ILevelData): void {
        super.setHistoryData(levelData);
        this.historyMaxScore = UserScoreLevelData.inst.getHighestScore() || 0;
        this.diffcult = levelData.diffcult || {};
        this.diffcultScore = levelData.diffcultScore || this.diffScoreArr[0];
    }
    private isTupo: boolean = false;
    protected addScore(score: number): void {
        super.addScore(score);
        //更新分数
        if (score == 0) {
            return;
        }
        mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.score);
        UserScoreLevelData.inst.setLastScore(this.score);
        this.checkHistoryMaxScore();
    }
    protected checkHistoryMaxScore() {
        if (this.score > this.historyMaxScore) {
            this.historyMaxScore = this.score;
            this.isBestScore = true;
            if (!this.isTupo) {
                this.isTupo = true;
                // mk.sdk.instance.reportBI(biEventId.classic_newrecord, {
                //     best: UserScoreLevelData.inst.getHighestScore(),
                //     isNewRecord: true,
                //     score: this.score,
                // });
            }
            mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_FLUSH_MAX_SCORE, this.score, this.isFirstChallange);
            UserScoreLevelData.inst.updateHighestScore(this.score);
            this.onUpdateHistoryMaxScore(this.score);
            return true;
        }
        return false;
    }

    public loadHistoryMaxScore(): void {
        this.historyMaxScore = UserScoreLevelData.inst.getHighestScore() || 0;
    }
    protected onUpdateHistoryMaxScore(score: number): void {
        if (score > OPEN_LEVEL_SCORE && !UserData.inst.isOpenLevel) {
            UserData.inst.isOpenLevel = true;
            BlockEventManager.instance.emit(Events.UNLOCK_LEVEL);
        }
    }
    protected onClearAllBlock(currScore: number, round: number): void {
        mk.sdk.instance.reportBI(BIEventID.classic_clear_all, { proj_currscore: currScore, proj_round: round, proj_mode: 2 });
    }

    protected getScoreArray(group: number) {
        // return [4000, 6000, 8000];
        if (group == 1) {
            console.log("using test group");
            return [2000, 3000, 4000, 10000];
        }
        console.log("using origin group");
        return [4000, 6000, 8000, 10000];
        
    }

    /**
     * 检查是否需要提示超越难度
     */
    public checkDiffcultScore() {
        if (PREVIEW) {
            console.log("diffcult score:", this.diffcultScore, "score:", this.score);
        }

        // endless 2000 额外逻辑
        let isNewbie = ABTestManager.getInstance().getGroup(ABTestParam.NewbieEasyBlocks);
        if (this.score <= 2000 && isNewbie == 1) {
            this.diffcultScore = 2000
        }

        if (this.diffcultScore <= this.score) {
            if (this.diffcult[this.diffcultScore] == 1) {
                return false;
            }
            this.diffcult[this.diffcultScore] = 1;
            //查找下一个难度分
            let score = this.diffScoreArr.lastObject();
            for (let index = 0; index < this.diffScoreArr.length; index++) {
                const element = this.diffScoreArr[index];
                if (this.score < element) {
                    score = element;
                    break;
                }
            }
            if (PREVIEW) {
                console.log("diffcult up ", score);
            }
            this.diffcultScore = score;
            let shown = FlagData.inst.hasFlag(`EndlessDiffShow_${score}`);
            if (shown) {
                if (PREVIEW) {
                    console.log("diffcult up has shown ", score);
                }
                return false;
            }
            FlagData.inst.recordFlag(`EndlessDiffShow_${score}`, true);
            return true;
        }
        return false;
    }

    public checkIsCanOpenAITips() {
        if (this.diffScoreArr && this.diffScoreArr.length > 0) {
            if (this.diffcultScore > this.diffScoreArr[0]) {
                return false;
            }
            return true;
        }
        return false;
    }

    public getProgressScoreMap() {
        return this.scoreMap;
    }

    public getEnhancedScoreMap() {
        return this.enhancedScoreMap;
    }

    resetGameRecordState() {
        let arr = this.diffScoreArr;
        if (arr) {
            arr.forEach((element) => {
                FlagData.inst.recordFlag(`EndlessDiffShow_${element}`, false);
            });
        }

        let progressMap = this.scoreMap;
        for (let key in progressMap) {
            let element = progressMap[key];
            FlagData.inst.recordFlag(`kIsPlayedReachPercent_${element}`, false);
        }

        let enhancedMap = this.enhancedScoreMap;
        for (let key in enhancedMap) {
            let element = enhancedMap[key];
            FlagData.inst.recordFlag(`kIsPlayedReachEnhance_${element}`, false);
        }
    }
}
