import { mk } from "../MK";
import { AdventureLevelConfigData } from "../games/block/script/define/adventureLevelData";
import { ABTestParam } from "../ABTest/ABTestDefine";
import { ABTestManager } from "../ABTest/ABTestManager";
import { UserRemoteDataManager } from "./UserRemoteDataManager";

// 当前新冒险关卡数据
export class UserLevelData {
    private static _inst: UserLevelData = null;
    public static get inst() {
        if (UserLevelData._inst == null) UserLevelData._inst = new UserLevelData();
        return UserLevelData._inst;
    }

    getLevelBlockConfigPath() {
        return "res/configs/score_new_block";
    }
    // private _currentLevel: number = 0;
    // public get currentLevel() {
    //     return this._currentLevel;
    // }
    private _k_LevelFinishState = "LevelFinishStateNew";
    public get k_LevelFinishState() {
        let theme = this.getLevelBatchNumber();
        return this._k_LevelFinishState + "_" + theme.toString();
    }

    public get isAllLevelFinished(): number {
        let finishState = mk.getItem(this.k_LevelFinishState, 0);
        // if (this.getMaxHistoryLevel() != AdventureLevelConfigData.maxLevel) {
        //     finishState = 0;
        // }
        return finishState;
    }
    public set isAllLevelFinished(value: number) {
        mk.setItem(this.k_LevelFinishState, value);
    }

    private _k_LevelDataStorage = "LEVEL_GAME_SNAP_SHOT_NEW";
    public get k_LevelDataStorage() {
        let batchNum = this.getLevelBatchNumber();
        return this._k_LevelDataStorage + "_" + batchNum.toString();
    }


    private _k_LevelProgressStorage = "LEVEL_GAME_PROGRESS_NEW";
    public get k_LevelProgressStorage() {
        let batch = this.getLevelBatchNumber();
        return this._k_LevelProgressStorage + "_" + batch.toString();
    }

    private _k_LevelGameBatch = "LEVEL_GAME_BATCH_NEW";
    public get k_LevelGameBatchNumber() {
        return this._k_LevelGameBatch;
    }

    //当前最大的关卡
    private _k_LevelMAXProgress = "k_LevelMAXProgress_NEW";
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
        UserRemoteDataManager.inst.setUserGuankaLevel(lev)
    }
    public getHistoryLevelData(): ILevelData {
        return mk.getItem(this.k_LevelDataStorage);
    }

    private _k_BatchDeadline = "BATCH_TIME_DEADLINE_NEW"
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

    public getHistoryLevel(needRomote?: boolean): number {
        let level = 1;

        level = UserRemoteDataManager.inst.getUserGuankaLevel();

        if (level !== undefined && level !== null) {
            return level;
        }

        level = mk.getItem(this.k_LevelProgressStorage);
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
        batch = 1; // 方块世界中batch永远是1
        let level = mk.getItem(s, 1);
        console.log("[getHistoryLevelWithBatchNumber] level: " + level)
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
        return 1;
    }

    public setLevelBatchNumber(batch: number): void {
        mk.setItem(this.k_LevelGameBatchNumber, batch);
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
        return "res/configs/level_blockLevel";
    }

    public ResetBatch() {
        let batchNum = this.getLevelBatchNumber();
        this.updateHistoryLevel(1);
        this.updateMaxHistoryLevelForce(1);
        this.clearLevelHistoryData();
        this.clearLevelFinishdData();

        batchNum = (batchNum) % AdventureLevelConfigData.LevelTotalNumer + 1
        this.setLevelBatchNumber(batchNum);
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

    k_levelStartRecordsByDay = "k_levelStartRecordsByDay_NEW"
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
        let group = ABTestManager.getInstance().getGroup(ABTestParam.AdventureLevelAds);
        if (group == 0) {
            console.log("[getLevelStartTimesByDay] group == 0")
            return 0;
        }

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

    private _k_firstStartBatchOneLevelOne = "k_firstStartBatchOneLevelOne_NEW"
    public get firstStartBatchOneLevelOne() {
        return mk.getItem(this._k_firstStartBatchOneLevelOne, 0);
    }
    public set firstStartBatchOneLevelOne(value: number) {
        mk.setItem(this._k_firstStartBatchOneLevelOne, value);
    }

    private _k_firstStartBatchOneLevelTwo = "k_firstStartBatchOneLevelTwo_NEW"
    public get firstStartBatchOneLevelTwo() {
        return mk.getItem(this._k_firstStartBatchOneLevelTwo, 0);
    }
    public set firstStartBatchOneLevelTwo(value: number) {
        mk.setItem(this._k_firstStartBatchOneLevelTwo, value);
    }

    private _k_currentMyWorkIndex = "_k_currentMyWorkindex_NEW"

    public get myWorkIndex() {
        return mk.getItem(this._k_currentMyWorkIndex);
    }

    public set myWorkIndex(index: number) {
        mk.setItem(this._k_currentMyWorkIndex, index);
    }

    private _currLevelTotalBlocks = 0;

    public get currLevelTotalBlocks() {
        return this._currLevelTotalBlocks;
    }

    public set currLevelTotalBlocks(num: number) {
        this._currLevelTotalBlocks = num;
    }
}