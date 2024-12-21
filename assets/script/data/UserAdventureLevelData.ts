import { mk } from "../MK";
import { SdkManager } from "../minigame_sdk/scripts/SdkManager";
import { AdventureLevelConfigData } from "../games/block/script/define/adventureLevelData";
import { UserRemoteData } from "./UserRemoteData";
import { ABTestParam } from "../ABTest/ABTestDefine";
import { ABTestManager } from "../ABTest/ABTestManager";
import { UserRemoteDataManager } from "./UserRemoteDataManager";

export class BatchLevelData {
    constructor() {

    }
}

// 当前新冒险关卡数据
export class UserAdventureLevelData {
    private static _inst: UserAdventureLevelData = null;
    public static get inst() {
        if (UserAdventureLevelData._inst == null) UserAdventureLevelData._inst = new UserAdventureLevelData();
        return UserAdventureLevelData._inst;
    }

    getLevelBlockConfigPath() {
        return "res/configs/score_new_block";
    }
    // private _currentLevel: number = 0;
    // public get currentLevel() {
    //     return this._currentLevel;
    // }
    private _k_LevelFinishState = "LevelFinishState";
    public get k_LevelFinishState() {
        let theme = this.getLevelBatchNumber();
        return this._k_LevelFinishState + "_" + theme.toString();
    }

    public get isAllLevelFinished(): number {
        let finishState = mk.getItem(this.k_LevelFinishState, -1);
        console.log("finishState1 ", finishState)
        // if (finishState == -1) {
        //     let remoteVal = UserRemoteDataManager.inst.getstickerStatus();
        //     if (remoteVal !== undefined && remoteVal !== null) {
        //         let level = this.getLevelBatchNumber();
        //         if (remoteVal[level - 1] == 2) {
        //             mk.setItem(this.k_LevelFinishState, 1);
        //             finishState = 1;
        //         }
        //     } else {
        //         finishState = 0;
        //     }
        // }
        if (finishState == -1) {
            let remoteVal = UserRemoteDataManager.inst.getIsSeasonFinished();
            if (remoteVal !== undefined && remoteVal !== null) {
                mk.setItem(this.k_LevelFinishState, remoteVal);
                finishState = remoteVal;
                console.log("finishState2 ", finishState)
            }
        }
        return finishState;
    }
    public set isAllLevelFinished(value: number) {
        mk.setItem(this.k_LevelFinishState, value);
        UserRemoteDataManager.inst.setIsSeasonFinished(value);
    }

    private _k_LevelDataStorage = "ADVENTURE_LEVEL_GAME_SNAP_SHOT";
    public get k_LevelDataStorage() {
        let batchNum = this.getLevelBatchNumber();
        return this._k_LevelDataStorage + "_" + batchNum.toString();
    }


    private _k_LevelProgressStorage = "ADVENTURE_LEVEL_GAME_PROGRESS";
    public get k_LevelProgressStorage() {
        let batch = this.getLevelBatchNumber();
        return this._k_LevelProgressStorage + "_" + batch.toString();
    }

    private _k_LevelGameBatch = "ADVENTURE_LEVEL_GAME_BATCH";
    public get k_LevelGameBatchNumber() {
        return this._k_LevelGameBatch;
    }

    //当前最大的关卡
    private _k_LevelMAXProgress = "k_LevelMAXProgress";
    public get k_LevelMAXProgress() {
        let batch = this.getLevelBatchNumber();
        return this._k_LevelMAXProgress + "_" + batch.toString();;
    }

    public getIsAllLevelFinishedByBatchNumber(batch: number) {
        let key = "";
        key = this._k_LevelFinishState + "_" + batch.toString();
        return mk.getItem(key, 0);
    }

    public updateHistoryLevel(lev: number) {
        let level = mk.setItem(this.k_LevelProgressStorage, lev);
        UserRemoteDataManager.inst.setUserCurrLevel(lev);
    }
    public getHistoryLevelData(): ILevelData {
        return mk.getItem(this.k_LevelDataStorage);
    }

    private _k_BatchDeadline = "BATCH_TIME_DEADLINE"
    public updateBatchDeadline(timestamp: number) {
        let batch = this.getLevelBatchNumber();
        let ts = mk.setItem(this._k_BatchDeadline + "_" + batch.toString(), timestamp);
    }

    public getBatchDeadlineData(): number {
        let batch = this.getLevelBatchNumber();
        let ret = mk.getItem(this._k_BatchDeadline + "_" + batch.toString(), -1);
        // if (ret == -1) {
        //     let remoteVal = UserRemoteData.inst.getseasonEndTimeStamp();
        //     if (remoteVal !== undefined && remoteVal !== null) {
        //         ret = remoteVal;
        //         mk.setItem(this._k_BatchDeadline + "_" + batch.toString(), ret);
        //     }
        // }

        if (batch == AdventureLevelConfigData.LevelTotalNumer) {
            this.updateBatchDeadline(new Date().getTime() + 36500 * 24 * 3600 * 1000)
        } else {
            let now = Date.now();
            if (ret - now > 7 * 24 * 3600 * 1000 + 1) {
                ret = 1;
                this.updateBatchDeadline(new Date().getTime() + 7 * 24 * 3600 * 1000)
            }
        }

        return ret;
    }

    public getHistoryLevel(): number {
        let level = mk.getItem(this.k_LevelProgressStorage);
        if (!level) {
            // this.updateHistoryLevel(1);
            //test data
            return 1;
        }
        return level;
    }

    public getMaxHistoryLevel(): number {
        let maxLevel = mk.getItem(this.k_LevelMAXProgress);
        if (maxLevel == null || maxLevel == undefined) {
            maxLevel = this.getHistoryLevel() || 1;
            mk.setItem(this.k_LevelMAXProgress, maxLevel);
        }
        return maxLevel;
    }

    public getMaxHistoryLevelByBatchNumber(batch: number): number {
        let key = "";
        key = this._k_LevelMAXProgress + "_" + batch.toString();
        let maxLevel = mk.getItem(key);
        if (maxLevel == null || maxLevel == undefined) {
            maxLevel = this.getHistoryLevelWithBatchNumber(batch) || 1;
            mk.setItem(key, maxLevel);
        }
        return maxLevel;
    }

    public getHistoryLevelWithBatchNumber(batch: number): number {
        let s = this._k_LevelProgressStorage;

        s = this._k_LevelProgressStorage + "_" + batch.toString();

        let level = mk.getItem(s, -1);
        console.log("[getHistoryLevelWithBatchNumber] level: " + level)
        if (level == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserCurrLevel();
            console.log("[getHistoryLevelWithBatchNumber] remoteVal: " + remoteVal)
            if (remoteVal !== undefined && remoteVal !== null) {
                mk.setItem(s, remoteVal);
                return remoteVal;
            }
            return 1;
        }
        return level;
    }

    /**
     * 更新历史最大关卡
     * @param lev
     */
    public updateMaxHistoryLevel(lev: number) {
        let maxLevel = this.getMaxHistoryLevel();
        if (lev > maxLevel) {
            mk.setItem(this.k_LevelMAXProgress, lev);
        }
    }

    public updateMaxHistoryLevelForce(lev: number) {
        let maxLevel = this.getMaxHistoryLevel();
        mk.setItem(this.k_LevelMAXProgress, lev);
    }


    public getLevelBatchNumber(): number {
        let ret = mk.getItem(this.k_LevelGameBatchNumber, -1); //暂时用batch 1 2 3 4 表示不同的batch
        if (ret == -1 || ret == 1) {
            let remoteVal = UserRemoteDataManager.inst.getUserCurrSeason();
            if (remoteVal !== undefined && remoteVal !== null) {
                ret = remoteVal;
                mk.setItem(this.k_LevelGameBatchNumber, ret);
            } else {
                ret = 1;
            }
        }
        return ret
    }

    public setLevelBatchNumber(batch: number): void {
        mk.setItem(this.k_LevelGameBatchNumber, batch);
        console.log("new batch num set: ", batch);
        UserRemoteDataManager.inst.setUserCurrSeason(batch);
    }

    public updateLevelHistoryData(data: ILevelData): void {
        mk.setItem(this.k_LevelDataStorage, data);
    }

    public clearLevelHistoryData() {
        mk.removeItem(this.k_LevelDataStorage);
    }
    public clearLevelFinishdData() {
        mk.removeItem(this.k_LevelFinishState);
    }

    public getLevelConfigPath(): string {
        // todo 按照batch来放置关卡
        let batchNum = this.getLevelBatchNumber();
        // todo 换去配置
        return "res/configs/level_stage" + batchNum.toString();
        // return "res/configs/level_stage_test" + batchNum.toString();
    }

    public ResetBatch() {
        let batchNum = this.getLevelBatchNumber();
        this.updateHistoryLevel(1);
        this.updateMaxHistoryLevelForce(1);
        this.clearLevelHistoryData();
        this.clearLevelFinishdData();
        batchNum = (batchNum) % AdventureLevelConfigData.LevelTotalNumer + 1
        this.isAllLevelFinished = 0;
        this.setLevelBatchNumber(batchNum);
        this.resetLevelStartByDay(batchNum, 1);
    }

    // batch number, <levelNum, failNum>
    protected levelFailRecords: Record<number, Record<number, number>>;
    public resetLevelFail(batchNumber: number, lev: number) {
        if (!this.levelFailRecords) {
            this.levelFailRecords = {};
        }
        if (!this.levelFailRecords[batchNumber]) {
            this.levelFailRecords[batchNumber] = {};
        }
        this.levelFailRecords[batchNumber][lev.toString()] = 0;
    }
    public recordLevelFail(batchNumber: number, lev: number) {
        if (!this.levelFailRecords) {
            this.levelFailRecords = {};
        }
        if (!this.levelFailRecords[batchNumber]) {
            this.levelFailRecords[batchNumber] = {};
        }
        let lastCount = this.levelFailRecords[batchNumber][lev.toString()] || 0;
        this.levelFailRecords[batchNumber][lev.toString()] = lastCount + 1;
    }

    k_levelStartRecordsByDay = "k_levelStartRecordsByDay"
    protected levelStartRecordsByDay: Record<number, Record<number, number>>; // 按天记录的失败次数
    public resetLevelStartByDay(batchNumber: number = this.getLevelBatchNumber(), lev: number = this.getHistoryLevel()) {
        if (!this.levelStartRecordsByDay) {
            this.levelStartRecordsByDay = {};
        }
        if (!this.levelStartRecordsByDay[batchNumber]) {
            this.levelStartRecordsByDay[batchNumber] = {};
        }
        this.levelStartRecordsByDay[batchNumber][lev.toString()] = -1; // 表示未记录
        mk.setItem(this.k_levelStartRecordsByDay, this.levelStartRecordsByDay);
    }

    public recordLevelStartByDay(batchNumber: number = this.getLevelBatchNumber(), lev: number = this.getHistoryLevel()) {
        if (!this.levelStartRecordsByDay) {
            this.levelStartRecordsByDay = {};
        }
        if (!this.levelStartRecordsByDay[batchNumber]) {
            this.levelStartRecordsByDay[batchNumber] = {};
        }
        this.levelStartRecordsByDay[batchNumber][lev.toString()] = new Date().getDate();
        mk.setItem(this.k_levelStartRecordsByDay, this.levelStartRecordsByDay);
    }

    // return 0 if not started today, 1 if started
    public getLevelStartTimesByDay(batchNumber: number = this.getLevelBatchNumber(), lev: number = this.getHistoryLevel()): number {
        if (batchNumber == 1 && lev < 6) {
            console.log("[getLevelStartTimesByDay] batchNumber == 1 && lev < 6, lev = " + lev)
            return 0; // 第1章前5关不记录失败次数
        }
        this.levelStartRecordsByDay = mk.getItem(this.k_levelStartRecordsByDay, {});

        if (!this.levelStartRecordsByDay[batchNumber]) {
            console.log("[getLevelStartTimesByDay] !this.levelStartRecordsByDay[batchNumber]")
            return 0;
        }
        if (!this.levelStartRecordsByDay[batchNumber][lev.toString()]) {
            console.log("[getLevelStartTimesByDay] !this.levelStartRecordsByDay[batchNumber][lev.toString()]")
            return 0;
        }

        if (this.levelStartRecordsByDay[batchNumber][lev.toString()] == new Date().getDate()) {
            console.log("[getLevelStartTimesByDay]")
            return 1;
        }
        return 0;
    }

    public getLevelFailTimes() {
        let batch: number = this.getLevelBatchNumber();
        let lev: number = this.getHistoryLevel();
        if (!this.levelFailRecords) {
            return 0;
        }
        if (!this.levelFailRecords[batch]) {
            return 0;
        }
        return this.levelFailRecords[batch][lev.toString()] || 0;
    }

    private _k_firstStartBatchOneLevelOne = "k_firstStartBatchOneLevelOne"
    public get firstStartBatchOneLevelOne() {
        return mk.getItem(this._k_firstStartBatchOneLevelOne, 0);
    }
    public set firstStartBatchOneLevelOne(value: number) {
        mk.setItem(this._k_firstStartBatchOneLevelOne, value);
    }

    private _k_firstStartBatchOneLevelTwo = "k_firstStartBatchOneLevelTwo"
    public get firstStartBatchOneLevelTwo() {
        return mk.getItem(this._k_firstStartBatchOneLevelTwo, 0);
    }
    public set firstStartBatchOneLevelTwo(value: number) {
        mk.setItem(this._k_firstStartBatchOneLevelTwo, value);
    }
}