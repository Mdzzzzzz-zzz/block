import { PREVIEW } from "cc/env";
import { getItem, setItem } from "../util/MKLocalStorage";
import { RemoteConfig } from "../RemoteConfig/RemoteConfig";
import { UserRemoteDataManager } from "./UserRemoteDataManager";

const kIsGuided = "isGuided";
const kGameNumber = "gameNumber";
const kGameNumberToday = "gameNumberToday";
const kLoginDay = "loginDay";
const kLastDay = "lastDay";
const kLoginNumToday = "loginNumToday";
const kIsNewUser = "isNewUser";
const kIsOpenLevel = "isOpenLevel";
const kHasGotLoginReward = "kHasGotLoginReward";
const kIsFirstPlay = "kIsFirstPlay";
const kIsNewRecordPlayed = "kIsNewRecordPlayed";
const kIsPlayedReachPercent = "kIsPlayedReachPercent";
const kLastLoginVersion = "kLastLoginVersion";
const kLastClassicPlayDay = "lastPlayDay";
const kClassicPlayNum = "classicPlayNum";
const kLastShareReplayDay = "kLastShareReplayDay";
const kTodayShareReplayNum = "kTodayShareReplayNum";
const kIsGameOngoing = "isGameOngoing"; // 游戏是在进行中 还是已经结束

const kLastShareReviveDay = "kLastShareReviveDay";
const kTodayShareReviveNum = "kTodayShareReviveNum";

const kLastWatchAdCountDay = "kLastWatchAdCountDay"; //今日第n次看广告开始key（打点）
const kTodayWatchAdStartGameCount = "kTodayWatchAdStartGameCount"; //今日看广告次数

const kThisGameWatchReviveNum = "kThisGameWatchReviveNum"; //本局第n次看广告复活（打点）

const kWxAgreePolicy = "kWxAgreePolicy"; //用户是否已同意隐私保护提示

const kClearLineCount = "kClearLineCount"; //用户消除行数统计
const kClearLineAdventureCount = "kClearLineAdventureCount"; //用户消除行数统计

const kttLastSideBarDay = "kttLastSideBarDay";
const ktthasSideBar = "ktthasSideBar";
const kttSideBarStatus = "kttSideBarStatus";
const ktthasCollectedReward = "ktthasCollectedReward";

const kAccountShareCount = "kAccountShareCount"; //账号分享次数

const kHasEnteredAdventureDate = "kHasEnteredAdventureDate"; //最近进入过冒险模式日期
const kHasEnteredAdventureToday = "kHasEnteredAdventureToday"; //今日有没有进入过冒险模式
const kScoreProgressSeed = "kScoreProgressSeed"; //账号分享次数

const kDailyClassicTreasureDay = "kDailyClassicTreasureDay";               //每日经典模式宝箱日期
const kDailyClassicTreasureChestCount = "kDailyClassicTreasureChestCount"; //每日经典模式宝箱出现次数

const kCanOpenTreasureChest = "kCanOpenTreasureChest";    //能否打开宝箱

const kthisRoundUsedHammerCount = "kthisRoundUsedHammerCount";
const kthisRoundUsedVRocketCount = "kthisRoundUsedVRocketCount";
const kthisRoundUsedHRocketCount = "kthisRoundUsedHRocketCount";
const kthisRoundUsedRefreshCount = "kthisRoundUsedRefreshCount";

const kthisRoundPropGiftPack = "kthisRoundPropGiftPack";

const kchallengeTarget = "kchallengeTarget";        // 经典模式挑战目标

const kchallengeBrain = "kchallengeBrain";             // 挑战大脑
const kchallengeBrainDay = "kchallengeBrainDay";

const kStageFreeAttempt = "kStageFreeAttempt";
const kStageFreeAttemptDay = "kStageFreeAttemptDay";

const kIsStageGameOngoing = "kIsStageGameOngoing";
const kSkinId = "kSkinId";//当前使用皮肤 1经典 2石头 3果冻
const kScoreFinish = "kScoreFinish";//积分挑战是否完成 0未完成 1完成

export class PlayerData {
    id: number = 0;
    blood: number = 0;
    bloodMax: number = 100;
    scroe: number = 0;
    pos: number = 0;
}

export class UserData {
    private static _inst: UserData = null;
    public static get inst() {
        if (UserData._inst == null) UserData._inst = new UserData();
        return UserData._inst;
    }

    public playerData: Map<number, PlayerData>;

    private _id = 0;
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }

    public isMe(value: number) {
        return this._id == value;
    }

    private _attackId = 0;
    get attackId() {
        return this._attackId;
    }
    set attackId(value) {
        this._attackId = value;
    }

    /**
     * 是否新手引导
     */
    private _isGuided = true;
    get isGuided() {
        return this._isGuided;
    }
    set isGuided(val) {
        this._isGuided = val;
        setItem(kIsGuided, val);
    }

    _maxScore = 0; //最高得分
    get maxScore() {
        return this._maxScore;
    }
    set maxScore(value) {
        this._maxScore = value;
    }

    private _isNewUser: boolean = true;
    public get isNewUser(): boolean {
        let isNew = getItem(kIsNewUser);
        if (isNew == undefined || isNew == null) {
            this._isNewUser = UserRemoteDataManager.inst.getUserIsNewUser();

            if (this._isNewUser == false) {
                return false;
            }
            this._isNewUser = true;
            return this._isNewUser;
        }
        this._isNewUser = isNew;
        return this._isNewUser;
    }
    public set isNewUser(value: boolean) {
        this._isNewUser = value;
        setItem(kIsNewUser, value);
        UserRemoteDataManager.inst.setUserIsNewUser(value);
    }
    private _isFirstPlay: boolean = true;
    public get isFirstPlay(): boolean {
        let isNew = getItem(kIsFirstPlay);
        if (isNew == undefined || isNew == null) {
            this._isFirstPlay = true;
            return this._isFirstPlay;
        }
        this._isFirstPlay = isNew;
        return this._isFirstPlay;
    }
    public set isFirstPlay(value: boolean) {
        this._isFirstPlay = value;
        setItem(kIsFirstPlay, value);
    }

    public isNewRegister: boolean = false;
    public get isOpenLevel(): boolean {
        let isOpen = getItem(kIsOpenLevel, false);
        return isOpen;
    }
    public set isOpenLevel(value: boolean) {
        setItem(kIsOpenLevel, value);
    }
    public isCanShowLevelInHomeScene(): boolean {
        return !this.isNewUser && this.isOpenLevel;
    }

    private _isNewRecordPlayed: boolean = false;
    public get isNewRecordPlayed(): boolean {
        let isNewRecord = getItem(kIsNewRecordPlayed);
        if (isNewRecord == undefined || isNewRecord == null) {
            this._isNewRecordPlayed = false;
            return this._isNewRecordPlayed;
        }
        this._isNewRecordPlayed = isNewRecord;
        return this._isNewRecordPlayed;
    }

    public set isNewRecordPlayed(value: boolean) {
        setItem(kIsNewRecordPlayed, value);
    }

    //无尽清屏行数
    private _clearLineCount: number = 0;
    public get ClearLineCount(): number {
        let clearCount = getItem(kClearLineCount);
        if (clearCount == undefined || clearCount == null) {
            clearCount = 0;
            return clearCount;
        }
        this._clearLineCount = clearCount;
        return this._clearLineCount;
    }
    public set ClearLineCount(value: number) {
        if (PREVIEW) {
            //console.log("clearLineCount endless:", value);
        }
        setItem(kClearLineCount, value);
    }

    private _clearLineAdventureCount: number = 0;
    public get ClearLineAdventureCount(): number {
        let clearCount = getItem(kClearLineAdventureCount);
        if (clearCount == undefined || clearCount == null) {
            clearCount = 0;
            return clearCount;
        }
        this._clearLineAdventureCount = clearCount;
        return this._clearLineAdventureCount;
    }
    public set ClearLineAdventureCount(value: number) {
        if (PREVIEW) {
            //console.log("clearLineCount adventure:", value);
        }
        setItem(kClearLineAdventureCount, value);
    }

    replayTimes: number = 0;
    constructor() {
        this._maxScore = 0;
        this.replayTimes = 0;
        this.playerData = new Map<number, PlayerData>();

        this._isGuided = getItem(kIsGuided, false);
        this._gameNumber = Number(getItem(kGameNumber, -1));
        this._gameNumberToday = Number(getItem(kGameNumberToday, 0));
        this._loginDay = Number(getItem(kLoginDay, 0));
        this._hasGotLoginReward = getItem(kHasGotLoginReward, false);
        this.loginNumToday = Number(getItem(kLoginNumToday, 0));

        this._isNewUser = getItem(kIsNewUser, true);
        this.isOpenLevel = getItem(kIsOpenLevel, false);
        this.isOpenLevel = true;
    }

    private _gameNumber = 0;
    get gameNumber() {
        if (this._gameNumber == -1) {
            let remoteVal = UserRemoteDataManager.inst.getUserGameNumber();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._gameNumber = remoteVal;
            } else {
                this._gameNumber = 0;
            }
            setItem(kGameNumber, this._gameNumber);
        }
        return this._gameNumber;
    }
    set gameNumber(val) {
        this._gameNumber = val;
        UserRemoteDataManager.inst.setUserGameNumber(this._gameNumber);
        setItem(kGameNumber, this._gameNumber);
    }
    private _gameNumberToday = 0;
    get gameNumberToday() {
        return this._gameNumberToday;
    }
    set gameNumberToday(val) {
        this._gameNumberToday += val;
        setItem(kGameNumberToday, this._gameNumberToday);
    }

    private _hasGotLoginReward = false;
    get hasGotLoginReward() {
        return this._hasGotLoginReward;
    }
    set hasGotLoginReward(val) {
        this._hasGotLoginReward = val;
        setItem(kHasGotLoginReward, this._hasGotLoginReward);
    }

    private _loginDay = 0;
    public loginNumToday: number = 0;
    public isFirstLoginToday: boolean = false;
    public onlinePlayTimes: number = 0;
    public isPlayAdventureHandGuide: boolean = false;
    setLoginNumToday() {
        const date = new Date();
        const nowData = date.getDate();
        const lastDate = getItem(kLastDay, 0);
        if (lastDate !== nowData) {
            setItem(kLastDay, nowData);
            this._loginDay += 1;
            setItem(kLoginDay, this._loginDay);
            setItem(kLoginNumToday, 1);
            setItem(kGameNumberToday, 0);
            setItem(kHasGotLoginReward, false);
            this.isFirstLoginToday = true;
        } else {
            const num = getItem(kLoginNumToday, 0);
            setItem(kLoginNumToday, num + 1);
            this.loginNumToday = num + 1;
            this.isFirstLoginToday = false;
        }
    }
    public set lastLoginVersion(version: string) {
        setItem(kLastLoginVersion, version);
    }

    public get lastLoginVersion() {
        return getItem(kLastLoginVersion, "");
    }

    private _classicPlayNumToday: number = 0;
    setPlayClassicTimesToday() {
        const date = new Date();
        const nowDate = date.getDate();
        const lastDate = getItem(kLastClassicPlayDay, 0);
        if (lastDate !== nowDate) {
            setItem(kLastClassicPlayDay, nowDate);
            setItem(kClassicPlayNum, 0);
            this._classicPlayNumToday = 0;
        } else {
            const num = getItem(kClassicPlayNum, 0);
            this._classicPlayNumToday = num + 1;
            setItem(kClassicPlayNum, this._classicPlayNumToday);
        }
    }

    public get getClassicPlayNumToday() {
        const lastDate = getItem(kLastClassicPlayDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kLastClassicPlayDay, nowDate);
            setItem(kClassicPlayNum, 0);
            this._classicPlayNumToday = 0;
        }
        this._classicPlayNumToday = getItem(kClassicPlayNum, 0);
        return this._classicPlayNumToday;
    }

    public getMaxFreePlayNumToday() {
        return 3;
    }

    public getShareReplayTimesToday() {
        return 1;
    }

    private _tryShareReplayToday: number = 0;
    setTryShareRePlayToday(num: number) {
        this._tryShareReplayToday = num;
        setItem(kTodayShareReplayNum, num);
    }

    tryShareReplay(): boolean {
        const lastDate = getItem(kLastShareReplayDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kLastShareReplayDay, nowDate);
            setItem(kTodayShareReplayNum, 1);
            this._tryShareReplayToday = 1;
        } else {
            this._tryShareReplayToday = getItem(kTodayShareReplayNum, 1);
            this._tryShareReplayToday += 1;
            setItem(kTodayShareReplayNum, this._tryShareReplayToday);
        }

        return this._tryShareReplayToday <= this.getShareReplayTimesToday();
    }

    getCanShareReplay(): boolean {
        const lastDate = getItem(kLastShareReplayDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        this._tryShareReplayToday = getItem(kTodayShareReplayNum, 0);
        if (lastDate != nowDate) {
            setItem(kLastShareReplayDay, nowDate);
            setItem(kTodayShareReplayNum, 0);
            this._tryShareReplayToday = 0;
        }
        return this._tryShareReplayToday < this.getShareReplayTimesToday();
    }

    addShareReplay() {
        const lastDate = getItem(kLastShareReplayDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kLastShareReplayDay, nowDate);
            setItem(kTodayShareReplayNum, 1);
            this._tryShareReplayToday = 1;
        } else {
            this._tryShareReplayToday = getItem(kTodayShareReplayNum, 1);
            this._tryShareReplayToday += 1;
            setItem(kTodayShareReplayNum, this._tryShareReplayToday);
        }
    }

    get isGameOngoing(): boolean {
        return getItem(kIsGameOngoing, false);
    }

    set isGameOngoing(value: boolean) {
        setItem(kIsGameOngoing, value);
    }

    private _tryShareReviveToday: number = 0;
    setTryShareReviveToday(num: number) {
        this._tryShareReviveToday = num;
        setItem(kTodayShareReviveNum, num);
    }
    getMaxShareReviveTimeToday() {
        return 1;
    }

    tryShareRevive(nomodifystate: boolean): boolean {
        const lastDate = getItem(kLastShareReviveDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (nomodifystate) {
            if (lastDate != nowDate) {
                setItem(kLastShareReviveDay, nowDate);
                setItem(kTodayShareReviveNum, 1);
                this._tryShareReviveToday = 1;
                return true;
            } else {
                this._tryShareReviveToday = getItem(kTodayShareReviveNum, 1);
                return this._tryShareReviveToday <= this.getMaxShareReviveTimeToday();
            }
        } else {
            let retVal = false;
            if (lastDate != nowDate) {
                setItem(kLastShareReviveDay, nowDate);
                setItem(kTodayShareReviveNum, 2);
                this._tryShareReviveToday = 2;
                return true;
            } else {
                this._tryShareReviveToday = getItem(kTodayShareReviveNum, 1);
                if (this._tryShareReviveToday == 1) {
                    retVal = true;
                }
                this._tryShareReviveToday += 1;
                setItem(kTodayShareReviveNum, this._tryShareReviveToday);
            }
            return retVal;
        }
    }

    getCanShareRevive(): boolean {
        const lastDate = getItem(kLastShareReviveDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        this._tryShareReplayToday = getItem(kTodayShareReviveNum, 0);
        if (lastDate != nowDate) {
            setItem(kLastShareReviveDay, nowDate);
            setItem(kTodayShareReviveNum, 0);
            this._tryShareReviveToday = 0;
        }
        return this._tryShareReviveToday < this.getMaxShareReviveTimeToday();
    }

    addShareRevive() {
        const lastDate = getItem(kLastShareReviveDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kLastShareReviveDay, nowDate);
            setItem(kTodayShareReviveNum, 1);
            this._tryShareReviveToday = 1;
        } else {
            this._tryShareReviveToday = getItem(kTodayShareReviveNum, 1);
            this._tryShareReviveToday += 1;
            setItem(kTodayShareReviveNum, this._tryShareReviveToday);
        }
    }

    getTodayWatchAdStartGameCount(): number {
        const lastDate = getItem(kLastWatchAdCountDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kLastWatchAdCountDay, nowDate);
            setItem(kTodayWatchAdStartGameCount, 0);
            return 1;
        } else {
            let count = getItem(kTodayWatchAdStartGameCount, 0);
            return count;
        }
    }
    setTodayWatchAdStartGameCount(value: number) {
        setItem(kTodayWatchAdStartGameCount, value);
    }

    getThisGameWatchReviveNum(): number {
        let count = getItem(kThisGameWatchReviveNum, 1);
        return count;
    }

    setThisGameWatchReviveNum(value: number) {
        setItem(kThisGameWatchReviveNum, value);
    }

    private _wxUserAgreePolicy: boolean = false;
    public get wxUserAgreePolicy(): boolean {
        let isUserAgreePolicy = getItem(kWxAgreePolicy);
        if (isUserAgreePolicy == undefined || isUserAgreePolicy == null) {
            this._wxUserAgreePolicy = false;
            return this._wxUserAgreePolicy;
        }
        this._wxUserAgreePolicy = isUserAgreePolicy;
        return this._wxUserAgreePolicy;
    }
    public set wxUserAgreePolicy(value: boolean) {
        this._wxUserAgreePolicy = value;
        setItem(kWxAgreePolicy, value);
    }

    getHasReceivedTtSideBarRewardToday(): boolean {
        const lastDate = getItem(kttLastSideBarDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        let retValue = false;
        if (lastDate != nowDate) {
            setItem(kttLastSideBarDay, nowDate);
            setItem(ktthasCollectedReward, false);
            return false;
        } else {
            retValue = getItem(ktthasCollectedReward, false);
        }
        return retValue;
    }
    setHasReceivedTtSideBarRewardToday(value: boolean) {
        const lastDate = getItem(kttLastSideBarDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kttLastSideBarDay, nowDate);
        }
        setItem(ktthasCollectedReward, value);
    }

    get getSideBarStatus(): number {
        return getItem(kttSideBarStatus, 0);
    }
    set setSideBarStatus(value: number) {
        setItem(kttSideBarStatus, value);
    }
    get getHasSideBar(): boolean {
        return getItem(ktthasSideBar, true);
    }

    set setHasSideBar(value: boolean) {
        setItem(ktthasSideBar, value);
    }

    getAccountShareCount(): number {
        let count = getItem(kAccountShareCount, -1);
        if (count == -1) {
            console.log("first time getAccountShareCount ============", RemoteConfig.getInstance().AccountShareCount);
            setItem(kAccountShareCount, RemoteConfig.getInstance().AccountShareCount);
            return RemoteConfig.getInstance().AccountShareCount;
        }
        console.log("not first time getAccountShareCount ============", count);
        return count;
    }

    setAccountShareCount(value: number) {
        setItem(kAccountShareCount, value);
    }

    getHasEnteredAdventureToday(): boolean {
        const lastDate = getItem(kHasEnteredAdventureDate, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kHasEnteredAdventureDate, nowDate);
            setItem(kHasEnteredAdventureToday, false);
            return false;
        } else {
            let status = getItem(kHasEnteredAdventureToday, false);
            return status;
        }
    }
    setHasEnteredAdventureToday(value: boolean) {
        const date = new Date();
        const nowDate = date.getDate();
        setItem(kHasEnteredAdventureDate, nowDate);
        setItem(kHasEnteredAdventureToday, value);
    }

    getScoreProgressSeed(): number {
        let value = getItem(kScoreProgressSeed, 3);
        return value;
    }

    setScoreProgressSeed(value: number) {
        setItem(kScoreProgressSeed, value);
    }


    getClassicTreasureChestCount(): number {
        const lastDate = getItem(kDailyClassicTreasureDay, 0);
        const date = new Date();
        const nowDate = date.getDate();

        if (lastDate != nowDate) {
            setItem(kDailyClassicTreasureDay, nowDate);
            setItem(kDailyClassicTreasureChestCount, RemoteConfig.getInstance().DailyClassicTreasureChestCount);
            return RemoteConfig.getInstance().DailyClassicTreasureChestCount;
        }
        return getItem(kDailyClassicTreasureChestCount);
    }

    setClassicTreasureChestCount(count: number) {
        const lastDate = getItem(kDailyClassicTreasureDay, 0);
        const date = new Date();
        const nowDate = date.getDate();

        if (lastDate != nowDate) {
            setItem(kDailyClassicTreasureDay, nowDate);
        }
        setItem(kDailyClassicTreasureChestCount, count);
    }

    getCanOpenTreasureChestThisGame() {
        return getItem(kCanOpenTreasureChest, 1);
    }
    setCanOpenTreasureChestThisGame(status) {
        setItem(kCanOpenTreasureChest, status);
    }

    getThisRoundUsedHammerCount() {
        return getItem(kthisRoundUsedHammerCount, 0);
    }

    setThisRoundUsedHammerCount(value) {
        setItem(kthisRoundUsedHammerCount, value);
    }

    getThisRoundUsedHRocketCount() {
        return getItem(kthisRoundUsedHRocketCount, 0);
    }

    setThisRoundUsedHRocketCount(value) {
        setItem(kthisRoundUsedHRocketCount, value);
    }

    getThisRoundUsedVRocketCount() {
        return getItem(kthisRoundUsedVRocketCount, 0);
    }

    setThisRoundUsedVRocketCount(value) {
        setItem(kthisRoundUsedVRocketCount, value);
    }

    getThisRoundUsedRefreshCount() {
        return getItem(kthisRoundUsedRefreshCount, 0);
    }

    setThisRoundUsedRefreshCount(value) {
        setItem(kthisRoundUsedRefreshCount, value);
    }

    getThisRoundPropGiftPack(): number {
        return getItem(kthisRoundPropGiftPack, 0);
    }

    setThisRoundPropGiftPack(value) {
        setItem(kthisRoundPropGiftPack, value);
    }

    getchallengeTarget(): number {
        let val = getItem(kchallengeTarget, 0);
        if (val == 0) {
            let remoteVal = UserRemoteDataManager.inst.getChallengeTargeCompleted();
            if (remoteVal !== undefined && remoteVal !== null && remoteVal > 0) {
                val = remoteVal;
                setItem(kchallengeTarget, remoteVal);
            } else {
                val = 1;
            }
        }
        return val;
    }

    setchallengeTarget(value) {
        setItem(kchallengeTarget, value);
    }

    getchallengeBrain(): number {
        const lastDate = getItem(kchallengeBrainDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        if (lastDate != nowDate) {
            setItem(kchallengeBrainDay, nowDate);
            setItem(kchallengeBrain, 0);
            return 0;
        } else {
            let num = getItem(kchallengeBrain, 0);
            return num;
        }
    }
    setchallengeBrain(value: number) {
        setItem(kchallengeBrain, value);
    }

    IsStageHasFreeAttempt(stageNum) {
        if (stageNum < 6) {
            return true;
        }
        const lastDate = getItem(kStageFreeAttemptDay, 0);
        const date = new Date();
        const nowDate = date.getDate();
        // 跨天
        if (lastDate != nowDate) {
            setItem(kStageFreeAttemptDay, nowDate);
            setItem(kStageFreeAttempt, 0);
            return true;
        }

        let num = getItem(kStageFreeAttempt, 0);
        let savedStageNum = Math.floor(num / 1000);
        if (savedStageNum != stageNum) {
            return true;
        }

        if (num % 1000 < 2) {
            return true;
        }
        return false;
    }

    UseStageAttempt(stageNum, useNum = 1) {
        if (stageNum < 6) {
            return;
        }
        const date = new Date();
        const nowDate = date.getDate();
        setItem(kStageFreeAttemptDay, nowDate);

        let num = getItem(kStageFreeAttempt, 0);
        let savedStageNum = Math.floor(num / 1000);
        let numToSave = 0
        if (stageNum == savedStageNum) {
            let usedNum = (num % 1000) + useNum;
            if (usedNum > 2) {
                usedNum = 2;
            }
            numToSave = stageNum * 1000 + usedNum;
        } else {
            numToSave = stageNum * 1000 + useNum;
        }
        setItem(kStageFreeAttempt, numToSave);
    }
    get isStageGameOngoing(): boolean {
        return getItem(kIsStageGameOngoing, false);
    }

    set isStageGameOngoing(value: boolean) {
        setItem(kIsStageGameOngoing, value);
    }

    getSkinID():number{
        let id = UserRemoteDataManager.inst.getUserSkinId()
        if (id !== undefined && id !== null) {
            return id
        }
        let value = getItem(kSkinId, 1);
        return value;
    }

    setSkinID(value:number){
        setItem(kSkinId,value)
        UserRemoteDataManager.inst.setUserSkinId(value)
    }

    getScoreFinishNum():number{
        let scoreFinishNum = UserRemoteDataManager.inst.getUserScoreFinish()
        if (scoreFinishNum !== undefined && scoreFinishNum !== null) {
            return scoreFinishNum
        }

        let value = getItem(kScoreFinish, 0);
        return value;
    }

    setScoreFinishNum(value:number){
        setItem(kScoreFinish,value)
        UserRemoteDataManager.inst.setUserScoreFinish(value)
    }

    private openID:string= ""
    setOpenID(id){
        this.openID = id
    }

    getOpenID(){
        return this.openID
    }

    private scoreChallengeData:any = null
    setScoreChallengeData(data){
        this.scoreChallengeData = data
    }

    getScoreChallengeData(){
        return this.scoreChallengeData
    }

}
