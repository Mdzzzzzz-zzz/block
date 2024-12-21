import { mk } from "../MK";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
import { AlbumData, ChallengeAlbumConfig } from "./AlbumData";
import { Util } from "../games/block/script/logic/Util";
import { emStageStickerStatus } from "./AlbumDef";

const starObtain: number[] = [1, 3, 6, 10, 15, 24];

export interface IMonthlySticker {
    year: number;
    month: number; // 0-11
    stickers: number
}

export interface IStarObtained {
    count: number;
    isExact: boolean;
}

export class UserDailyChallengeData {
    private static _inst: UserDailyChallengeData = null;

    public static get inst() {
        if (UserDailyChallengeData._inst == null) {
            UserDailyChallengeData._inst = new UserDailyChallengeData();
        }
        // UserDailyChallengeData._inst.checkIfReset();
        return UserDailyChallengeData._inst;
    }

    private _k_lastPlayYear = "k_lastPlayYear";
    private _k_lastPlayMonth = "k_lastPlayMonth";
    private _k_DailyChallengeStatus = "k_DailyChallengeStatus";

    private _lastPlayYear: number = -1;
    private _lastPlayMonth: number = -1;

    get lastPlayYear() {
        this._lastPlayYear = mk.getItem(this._k_lastPlayYear, -1);
        if (this._lastPlayYear == -1) {
            let remoteVal = UserRemoteDataManager.inst.getLastPlayedYear();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._lastPlayYear = remoteVal;
                this.lastPlayYear = remoteVal;
            }
        }
        return this._lastPlayYear;
    }

    set lastPlayYear(year: number) {
        mk.setItem(this._k_lastPlayYear, year);
        this._lastPlayYear = year;
    }

    get lastPlayMonth() {
        this._lastPlayMonth = mk.getItem(this._k_lastPlayMonth, -1);
        if (this._lastPlayMonth == -1) {
            let remoteVal = UserRemoteDataManager.inst.getLastPlayedMonth();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._lastPlayMonth = remoteVal;
                this.lastPlayMonth = remoteVal;
            }
        }
        return this._lastPlayMonth;
    }

    set lastPlayMonth(month: number) {
        mk.setItem(this._k_lastPlayMonth, month);
        this._lastPlayMonth = month;
    }

    private date = new Date();
    private currMonth = this.date.getMonth(); // 0-11;
    private currYear = this.date.getFullYear(); //

    setDate(date: Date) {
        this.date = date;
        this.currMonth = this.date.getMonth(); // 0-11;
        this.currYear = this.date.getFullYear();
    }

    getDate(): Date {
        return this.date;
    }

    checkIfReset() {
        if (this.lastPlayYear == -1) {
            let retVal = UserRemoteDataManager.inst.getLastPlayedYear();
            if (retVal !== undefined && retVal !== null) {
                this.lastPlayYear = retVal;
            }
        }
        if (this.lastPlayMonth == -1) {
            let retVal = UserRemoteDataManager.inst.getLastPlayedMonth();
            if (retVal !== undefined && retVal !== null) {
                this.lastPlayMonth = retVal;
            }
        }
        console.log("[checkIfReset] this.currYear: " + this.currYear + " this._lastPlayYear: " +
            this._lastPlayYear + " this.currMonth: " + this.currMonth + " this._lastPlayMonth: " + this._lastPlayMonth);
        if (this.currYear != this._lastPlayYear || (this.currYear == this._lastPlayYear && this.currMonth != this._lastPlayMonth)) {
            this.reset();
        }
    }
    private _k_StickerObtainedSeq = "k_StickerObtainedSeq";
    private _stickerObtainedSeq = new Array<IMonthlySticker>();

    get stickerObtainedSeq(): Array<IMonthlySticker> {
        this._stickerObtainedSeq = mk.getItem(this._k_StickerObtainedSeq, new Array<IMonthlySticker>());
        if (this._stickerObtainedSeq.length == 0) {
            let remoteVal = UserRemoteDataManager.inst.getStickerObtainedSequence();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._stickerObtainedSeq = remoteVal;
                mk.setItem(this._k_StickerObtainedSeq, this._stickerObtainedSeq);
            }
        }
        return this._stickerObtainedSeq;
    }

    updateStickerObtainedSeq() {
        mk.setItem(this._k_StickerObtainedSeq, this._stickerObtainedSeq);
        UserRemoteDataManager.inst.setStickerObtainedSequence(this._stickerObtainedSeq);
    }

    reset() {
        let stars = this.getCalculatedStarObtained();
        if (stars.count > 0) {
            // 逻辑上这个应该加进stickerObtainedSeq里了
            let total = 0;
            if (this.stickerObtainedSeq.length != 0 && this.stickerObtainedSeq[this.stickerObtainedSeq.length - 1].stickers) {
                total = this.stickerObtainedSeq[this.stickerObtainedSeq.length - 1].stickers
            }
            for (let i = 0; i < total; i++) {
                let id = ChallengeAlbumConfig.calculateIdByMonth(this._lastPlayYear, this._lastPlayMonth, i + 1);
                if (AlbumData.inst.getChallengeStickerStatusById(id) != emStageStickerStatus.obtained) {
                    AlbumData.inst.setChallengeStickerStatusById(id, emStageStickerStatus.missed);
                }

            }
        }
        this.monthlyProgress.length = 0;
        mk.setItem(this.k_MonthProgressKey, this.monthlyProgress);
        UserRemoteDataManager.inst.setMonthlyProgress(this.monthlyProgress);

        this._lastPlayMonth = this.currMonth;
        this._lastPlayYear = this.currYear;
        UserRemoteDataManager.inst.setLastPlayedMonth(this._lastPlayMonth);
        UserRemoteDataManager.inst.setLastPlayedYear(this._lastPlayYear);
        UserRemoteDataManager.inst.updateDataToRemote();
    }

    // only for test
    resetSticker() {
        if (this._stickerObtainedSeq.length > 0) {
            let lastObtained = this._stickerObtainedSeq[this.stickerObtainedSeq.length - 1];
            if (lastObtained.year == this.currYear && lastObtained.month == this.currMonth) {
                this._stickerObtainedSeq.removeIndex(this._stickerObtainedSeq.length - 1);
            }
        }
        mk.setItem(this._k_StickerObtainedSeq, this._stickerObtainedSeq);
        UserRemoteDataManager.inst.setStickerObtainedSequence(this._stickerObtainedSeq);
        for (let i = 0; i < 6; i++) {
            let id = ChallengeAlbumConfig.calculateIdByMonth(this._lastPlayYear, this._lastPlayMonth, i + 1);
            AlbumData.inst.setChallengeStickerStatusById(id, emStageStickerStatus.not_started);
        }
    }



    private _k_monthProgress = "MonthProgress"
    public get k_MonthProgressKey() {
        let month = this.currMonth;
        let year = this.currYear;

        return this._k_monthProgress + "_" + year.toString() + "_" + month.toString();
    }

    private monthlyProgress: Array<number> = new Array<number>();
    getChallengeProgress() {
        if (!this.monthlyProgress || this.monthlyProgress.length === 0) {

            this.monthlyProgress = mk.getItem(this.k_MonthProgressKey, new Array<number>());
            if (this.monthlyProgress.length == 0) {
                if (UserRemoteDataManager.inst.getMonthlyProgress() !== undefined && UserRemoteDataManager.inst.getMonthlyProgress() !== null) {
                    this.monthlyProgress = UserRemoteDataManager.inst.getMonthlyProgress();
                    mk.setItem(this.k_MonthProgressKey, this.monthlyProgress);
                }
            }
        }
        console.log("[getChallengeProgress] this monthlyprogress" + this.monthlyProgress);
        if (this.monthlyProgress.length == 0) {
            this.monthlyProgress.length = new Date(this.currYear, this.currMonth + 1, 0).getDate();
            for (let i = 0; i < this.monthlyProgress.length; i++) {
                this.monthlyProgress[i] = 0;
            }
        }
        return this.monthlyProgress;
    }

    getChallengeProgressByDay(day: number): number {
        if (!this.monthlyProgress || this.monthlyProgress.length === 0) {
            this.monthlyProgress = this.getChallengeProgress();
        }
        return this.monthlyProgress[day - 1];
    }

    // 必须调用，用于上传progress,每一天都要设置！
    setChallengeProgress(month: number, day: number, state: number) { // 从第0天开始是1号, state 0是没完成，1是完成

        if (month != this.currMonth) {
            console.log("Month has changed");
            return;
        }

        if (state == 0) {
            return;
        }

        if (this.monthlyProgress.length == 0) {
            this.monthlyProgress.length = new Date(this.currYear, this.currMonth + 1, 0).getDate();
            for (let i = 0; i < this.monthlyProgress.length; i++) {
                this.monthlyProgress[i] = 0;
            }
        }
        this.monthlyProgress[day - 1] = state;
        mk.setItem(this.k_MonthProgressKey, this.monthlyProgress);
        UserRemoteDataManager.inst.setMonthlyProgress(this.monthlyProgress);
        //判断星星
        let stars = this.getCalculatedStarObtained();
        if (stars.count == 0) {
            return;
        }
        // @ts-ignorejs-ignore
        if (stars.isExact) {

            if (stars.count == 1) {
                // 检查 last element
                if (this.stickerObtainedSeq.length > 0) {
                    let lastObtained = this.stickerObtainedSeq[this.stickerObtainedSeq.length - 1];
                    if (lastObtained.year == this.currYear && lastObtained.month == this.currMonth) {
                        return;
                    }
                }

                let monthlySticker = { year: this.currYear, month: this.currMonth, stickers: 6 };
                this.stickerObtainedSeq.push(monthlySticker);
                this.updateStickerObtainedSeq();
            }

            let id = ChallengeAlbumConfig.calculateIdByMonth(this.currYear, this.currMonth, stars.count)
            AlbumData.inst.setChallengeStickerStatusById(id, emStageStickerStatus.obtained);
        }
        this.lastPlayYear = this._lastPlayYear;
        this.lastPlayMonth = this._lastPlayMonth;
    }

    getCalculatedStarObtained(): IStarObtained {
        if (this.monthlyProgress.length == 0) {
            return { count: 0, isExact: false };
        } else {
            let stars = 0;

            for (let i = 0; i < this.monthlyProgress.length; i++) {
                if (this.monthlyProgress[i] == 1) {
                    stars += 1;
                }
            }


            for (let i = starObtain.length - 1; i >= 0; i--) {
                if (stars > starObtain[i]) {
                    return { count: i + 1, isExact: false };
                } else if (stars == starObtain[i]) {
                    return { count: i + 1, isExact: true };
                }

            }
            return { count: starObtain.length, isExact: false };
        }
    }

    getFinishedDays(): number {
        let tmp = this.getChallengeProgress();
        let ret = 0;
        for (let i = 0; i < tmp.length; i++) {
            if (tmp[i] == 1) {
                ret++;
            }

        }
        return ret;
    }

    getStickerObtainedSeq() {
        return Util.deepCopy(this.stickerObtainedSeq);
    }

    private _k_DailyChallengeDataStorage = "DAILY_CHALLENGE_GAME_SNAP_SHOT";
    private _k_DailyChallengeDate = "DAILY_CHALLENGE_DATE";
    public get k_DailyChallengeDataStorage() {
        let dailyMonthNum = this.getdailyMonthNum();
        return this._k_DailyChallengeDataStorage + "_" + dailyMonthNum;
    }

    public getdailyMonthNum(): string {
        let ret = mk.getItem(this._k_DailyChallengeDate, "-1");
        if (ret == "-1") {
            let str = this.currMonth.toString() + "_" + this.date.getDate().toString();
            mk.setItem(this._k_DailyChallengeDate, str);
            return str
        }
        return ret
    }

    public setdailyMonthNum(month, day) {
        let str = month + "_" + day;
        mk.setItem(this._k_DailyChallengeDate, str);
    }
    public getHistoryLevelData(): ILevelData {
        return mk.getItem(this.k_DailyChallengeDataStorage);
    }
    public updateLevelHistoryData(data: ILevelData): void {
        mk.setItem(this.k_DailyChallengeDataStorage, data);
    }
    public clearLevelHistoryData() {
        mk.removeItem(this.k_DailyChallengeDataStorage);
    }

    public getStarObtained() {
        return starObtain;
    }

    private _k_HasPlayedDailyChallengeToday = "HasPlayedDailyChallengeToday";
    private _k_DailyChallengeTodayDate = "kDailyChallengeDateTodayDate";
    public getHasPlayedDailyChallengeToday() {
        const lastDate = mk.getItem(this._k_DailyChallengeTodayDate, 0);
        // const date = new Date();
        const nowDate = this.date.getDate();

        if (lastDate != nowDate) {
            mk.setItem(this._k_DailyChallengeTodayDate, nowDate);
            mk.setItem(this._k_HasPlayedDailyChallengeToday, 0);
            return 0;
        }

        return mk.getItem(this._k_HasPlayedDailyChallengeToday, 0);
    }
    public setHasPlayedDailyChallengeToday(num) {
        mk.setItem(this._k_HasPlayedDailyChallengeToday, num);
    }

    private _kLastWatchAdCountDay = "_kDCLastWatchAdCountDay";
    private _kTodayWatchAdStartGameCount = "_kDCTodayWatchAdStartGameCount"
    getTodayWatchAdStartGameCount(): number {
        const lastDate = mk.getItem(this._kLastWatchAdCountDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            mk.setItem(this._kLastWatchAdCountDay, nowDate);
            mk.setItem(this._kTodayWatchAdStartGameCount, 1);
            return 1;
        } else {
            let count = mk.getItem(this._kTodayWatchAdStartGameCount, 1);
            return count;
        }
    }
    setTodayWatchAdStartGameCount(value: number) {
        mk.setItem(this._kTodayWatchAdStartGameCount, value);
    }

    private _k_firstDailyChallenge = "_k_firstDailyChallenge"
    public get firstDailyChallengeFinish() {
        return mk.getItem(this._k_firstDailyChallenge, 0);
    }
    public set firstDailyChallengeFinish(value: number) {
        mk.setItem(this._k_firstDailyChallenge, value);
    }
}