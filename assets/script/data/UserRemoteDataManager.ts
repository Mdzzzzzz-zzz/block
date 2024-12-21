import { Util } from "../games/block/script/logic/Util";
import { JYSdkManager } from "../jysdk/JYSdkManager";
import { mk } from "../MK";
import { emStageStickerStatus } from "./AlbumDef";
import { UserRemoteData } from "./UserRemoteData";
import * as env from "cc/env";

interface IRemoteMonthlySticker {
    year: number;
    month: number; // 0-11
    stickers: number
}

export class UserRemoteDataManager {
    private static _inst: UserRemoteDataManager = null;
    private _data: UserRemoteData = null;

    private lastExecutionTime: number = 0;
    private nextExecutionTime: number = 0;

    private lastUpdateData;

    constructor() {
        this.lastUpdateData = {
            highscore: null,
            userGuideStep: null,
            isItemGuideCompleted: null,
            currSeason: null,
            isSeasonFinished: null,
            currLevel: null,
            guankaLv: null,
            scoreFinish:null,
            userSkinId:null,
            stickerStatus: null,
            userHammerData: null,
            userHRocketData: null,
            userVRocketData: null,
            userRefreshData: null,
            classicAlbumData: null,
            monthlyProgress: null,
            lastPlayMonth: null,
            lastPlayYear: null,
            stickerObtainedSequence: null,
            dailyChallengeAlbumData: null,
            gameNumber: null,
            isNewUser: null,
            challengeTargeCompleted: null,
        }
    }

    public static get inst() {
        if (UserRemoteDataManager._inst == null) {
            UserRemoteDataManager._inst = new UserRemoteDataManager();
        }
        if (this._inst._data == null) {
            this._inst._data = UserRemoteData.inst;
        }
        return UserRemoteDataManager._inst;
    }


    private updateUserDataToRemote() {
        if (env.WECHAT) {
            // 首先检查数据是否一致
            if (this.checkDataConsistency()) {
                // 数据一致，无需上传
                console.log('数据未发生变化，无需上传。');
                return;
            }
    
            // 数据不一致，更新 lastUpdateData
            this.lastUpdateData = {
                highscore: this._data.highscore,
                userGuideStep: this._data.userGuideStep,
                isItemGuideCompleted: this._data.isItemGuideCompleted,
                currSeason: this._data.currSeason,
                isSeasonFinished: this._data.isSeasonFinished,
                currLevel: this._data.currLevel,
                guankaLv:this._data.guankaLv,
                scoreFinish:this._data.scoreFinish,
                userSkinId:this._data.userSkinId,
                stickerStatus: this._data.stickerStatus,
                userHammerData: this._data.userHammerData,
                userHRocketData: this._data.userHRocketData,
                userVRocketData: this._data.userVRocketData,
                userRefreshData: this._data.userRefreshData,
                classicAlbumData: this._data.classicAlbumData,
                monthlyProgress: this._data.monthlyProgress,
                lastPlayMonth: this._data.lastPlayMonth,
                lastPlayYear: this._data.lastPlayYear,
                stickerObtainedSequence: this._data.stickerObtainedSequence,
                dailyChallengeAlbumData: this._data.dailyChallengeAlbumData,
                gameNumber: this._data.gameNumber,
                isNewUser: this._data.isNewUser,
                challengeTargeCompleted: this._data.challengeTargeCompleted,
            };
    
            const now = Date.now();
    
            if (now - this.lastExecutionTime >= 3000) {
                // 立即上传
                this.nextExecutionTime = 0;
                JYSdkManager.getInstance().UpdateDataJYGameSDK(this.lastUpdateData);
                this.lastExecutionTime = now;
                console.log("updateUserDataToRemote：立即上传数据", this.lastUpdateData);
            } else {
                // 延迟上传
                // this.nextExecutionTime += 3000;
                setTimeout(() => {
                    // 数据已变化，更新 lastUpdateData
                    this.lastUpdateData = {
                        highscore: this._data.highscore,
                        userGuideStep: this._data.userGuideStep,
                        isItemGuideCompleted: this._data.isItemGuideCompleted,
                        currSeason: this._data.currSeason,
                        isSeasonFinished: this._data.isSeasonFinished,
                        currLevel: this._data.currLevel,
                        guankaLv: this._data.guankaLv,
                        scoreFinish:this._data.scoreFinish,
                        userSkinId: this._data.userSkinId,
                        stickerStatus: this._data.stickerStatus,
                        userHammerData: this._data.userHammerData,
                        userHRocketData: this._data.userHRocketData,
                        userVRocketData: this._data.userVRocketData,
                        userRefreshData: this._data.userRefreshData,
                        classicAlbumData: this._data.classicAlbumData,
                        monthlyProgress: this._data.monthlyProgress,
                        lastPlayMonth: this._data.lastPlayMonth,
                        lastPlayYear: this._data.lastPlayYear,
                        stickerObtainedSequence: this._data.stickerObtainedSequence,
                        dailyChallengeAlbumData: this._data.dailyChallengeAlbumData,
                        gameNumber: this._data.gameNumber,
                        isNewUser: this._data.isNewUser,
                        challengeTargeCompleted: this._data.challengeTargeCompleted,
                    };
    
                    JYSdkManager.getInstance().UpdateDataJYGameSDK(this.lastUpdateData);
                    this.lastExecutionTime = Date.now();
                    console.log("updateUserDataToRemote：延迟后上传数据", this.lastUpdateData);
                }, 3000);
            }
        }
    }


    private extractNumberFromKey(key) {
        // 定义一个正则表达式，匹配中间的数字
        const regex = /\D+(\d+)\D+/;

        // 使用正则表达式进行匹配
        const match = key.match(regex);

        // 如果匹配成功，返回匹配到的数字部分
        return match ? match[1] : null;
    }

    public getUserRemoteHighScore(): number {
        return this._data.highscore;
    }
    public setUserRemoteHighScore(highscore) {
        this._data.highscore = highscore;
        this.updateUserDataToRemote();
    }

    public getUserGuideStep(): number {
        return this._data.userGuideStep;
    }
    public setUserGuideStep(guideStep) {
        this._data.userGuideStep = guideStep;
        this.updateUserDataToRemote();
    }

    public setUserItemGuide(status) {
        this._data.isItemGuideCompleted = status;
        this.updateUserDataToRemote();
    }

    public getUserItemGuide(): number {
        return this._data.isItemGuideCompleted;
    }

    public setUserCurrSeason(season) {
        this._data.currSeason = season;
        this.updateUserDataToRemote();
    }

    public getUserCurrSeason(): number {
        return this._data.currSeason;
    }

    public setIsSeasonFinished(isFinish: number) {
        this._data.isSeasonFinished = isFinish;
        this.updateUserDataToRemote();
    }
    public getIsSeasonFinished() {
        return this._data.isSeasonFinished;
    }

    public setUserCurrLevel(level) {
        this._data.currLevel = level;
        this.updateUserDataToRemote();
    }

    public getUserCurrLevel(): number {
        return this._data.currLevel;
    }

    public setUserGuankaLevel(level) {
        this._data.guankaLv = level;
        this.updateUserDataToRemote();
    }

    public getUserGuankaLevel(): number {
        return this._data.guankaLv;
    }

    public setUserScoreFinish(scoreFinish) {
        this._data.scoreFinish = scoreFinish;
        this.updateUserDataToRemote();
    }

    public getUserScoreFinish(): number {
        return this._data.scoreFinish;
    }

    public setUserSkinId(skinId) {
        this._data.userSkinId = skinId;
        this.updateUserDataToRemote();
    }

    public getUserSkinId(): number {
        return this._data.userSkinId;
    }


    public getseasonEndTimeStamp(): number {
        if (env.WECHAT) {
            return this._data.seasonEndTimeStamp;
        }
        return null;
    }

    public getstickerStatus(): number[] {
        return this._data.stickerStatus;
    }

    public setstickerStatus() {
        this._data.stickerStatus = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let index = 1; index <= 10; index++) {
            let status = this.getStageStickerStatus(index)
            this._data.stickerStatus[index - 1] = status;
        }
        console.log("setting this.stickerStatus, status =====>", this._data.stickerStatus);
        this.updateUserDataToRemote();
    }

    public getUserHammerData(): number {
        return this._data.userHammerData;
    }

    public setUserHammerData(cnt: number) {
        this._data.userHammerData = cnt;
        this.updateUserDataToRemote();
    }

    public getUserHRocketData(): number {
        return this._data.userHRocketData;
    }

    public getUserVRocketData(): number {
        return this._data.userVRocketData;
    }

    public getUserRefreshData(): number {
        return this._data.userRefreshData;
    }

    public setUserRefreshData(cnt: number) {
        this._data.userRefreshData = cnt;
        this.updateUserDataToRemote();
    }

    public setUserItemData(hammer, vRocket, hRocket, refresh) {
        this._data.userHammerData = hammer;
        this._data.userVRocketData = vRocket;
        this._data.userHRocketData = hRocket;
        this._data.userRefreshData = refresh;
        this.updateUserDataToRemote();
    }

    public uploadAdventureModeDataToRemote(deadline) {
        this._data.seasonEndTimeStamp = deadline;
        this.updateUserDataToRemote();

    }

    public updateDataToRemote() {
        this.updateUserDataToRemote();
    }

    public clearRemoteData() {
        if (env.WECHAT) {
            const now = Date.now();
            if (now - this.lastExecutionTime >= 3000) {
                this.lastExecutionTime = now;
                this.nextExecutionTime = 0;
                JYSdkManager.getInstance().ClearDataJYGameSDK();
            } else {
                this.nextExecutionTime += 3000;
                setTimeout(() => {
                    JYSdkManager.getInstance().ClearDataJYGameSDK();
                    this.lastExecutionTime = Date.now();
                }, this.nextExecutionTime);
            }
        }

    }

    public setClassicAlbumData(key, value) {
        this._data.classicAlbumData[key] = value;
    }

    public getClassicAlbumData(key) {
        return this._data.classicAlbumData[key];
    }

    public setMonthlyProgress(progress) {
        console.log("[setMonthlyProgress] " + progress);
        this._data.monthlyProgress = progress;
        this.updateUserDataToRemote();
    }

    public getMonthlyProgress() {
        console.log("[UserRemoteData] this monthlyprogress " + this._data.monthlyProgress);
        return this._data.monthlyProgress;
    }

    public getLastPlayedYear() {
        return this._data.lastPlayYear;
    }

    public getLastPlayedMonth() {
        return this._data.lastPlayMonth;
    }

    public setLastPlayedYear(value) {
        this._data.lastPlayYear = value;
    }

    public setLastPlayedMonth(value) {
        this._data.lastPlayMonth = value;
    }

    public setStickerObtainedSequence(data) {
        this._data.stickerObtainedSequence = data;
        this.updateUserDataToRemote();
    }

    public getStickerObtainedSequence() {
        return this._data.stickerObtainedSequence;
    }

    public getDailyAlbumData(key) {
        if (this._data.dailyChallengeAlbumData[key] == undefined || this._data.dailyChallengeAlbumData[key] == null) {
            return emStageStickerStatus.not_started;
        }
        return this._data.dailyChallengeAlbumData[key];
    }

    public setDailyAlbumData(key, value) {
        console.log("[setDailyAlbumData] key", key, "value", value);
        if (key == undefined || value == undefined) {
            return;
        }
        this._data.dailyChallengeAlbumData[key] = value;
        this.updateUserDataToRemote();
    }

    getUserGameNumber() {
        return this._data.gameNumber;
    }

    setUserGameNumber(val) {
        this._data.gameNumber = val;
        this.updateUserDataToRemote();
    }

    getUserIsNewUser() {
        return this._data.isNewUser;
    }

    setUserIsNewUser(val) {
        this._data.isNewUser = val;
        this.updateUserDataToRemote();
    }

    // private setChallengeStickerStatusById(id: number, value: number) {
    //     let key = "daily_challenge_id_" + id + "_unlock_status";
    //     mk.setItem(key, value);

    //     //console.log("[setChallengeStickerStatusById] key = " + key + " value = " + value);
    // }

    private getStageStickerStatus(stage: number): number {
        let name = "stage_" + stage.toString() + "_unlock_status";
        let retVal = mk.getItem(name, -1);
        return retVal;
    }

    getChallengeTargeCompleted(): number {
        return this._data.challengeTargeCompleted;
    }
    setChallengeTargeCompleted(val: number) {
        this._data.challengeTargeCompleted = val;
        this.updateUserDataToRemote();
    }

    private checkDataConsistency(): boolean {
        const inconsistentKeys: string[] = [];
    
        for (const key in this.lastUpdateData) {
            if (this.lastUpdateData.hasOwnProperty(key)) {
                const lastUpdateValue = this.lastUpdateData[key];
                const currentValue = this._data[key];
    
                // 如果值是对象，进行深度比较
                if (typeof lastUpdateValue === 'object' && lastUpdateValue !== null) {
                    if (!Util.deepEqualAllTypes(lastUpdateValue, currentValue)) {
                        inconsistentKeys.push(key);
                    }
                } else {
                    // 直接比较基本类型的值
                    if (lastUpdateValue !== currentValue) {
                        inconsistentKeys.push(key);
                    }
                }
            }
        }
    
        if (inconsistentKeys.length > 0) {
            console.warn(`以下属性的数据不一致: ${inconsistentKeys.join(', ')}`);
            return false;
        } else {
            console.log('所有待上传的数据与当前数据一致。');
            return true;
        }
    }
}