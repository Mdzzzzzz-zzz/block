
import { mk } from "../MK";
import { ClassicAlbumConfig } from "./ClassicAlbumConfig";

interface IRemoteMonthlySticker {
    year: number;
    month: number; // 0-11
    stickers: number
}

export class UserRemoteData {
    private static _inst: UserRemoteData = null;
    public static get inst() {
        if (UserRemoteData._inst == null) {
            UserRemoteData._inst = new UserRemoteData();
            UserRemoteData._inst.classicAlbumData = new Map<string, number>();
            //UserRemoteData._inst.dailyChallengeAlbumData = new Map<string, number>();
        }
        return UserRemoteData._inst;
    }

    // 冒险数据
    public currSeason: number = 1;
    public isSeasonFinished: number = 0;
    public currLevel: number = 1;
    public seasonEndTimeStamp: number = 0;
    public stickerStatus: number[];
    // 经典数据
    public highscore: number = 0;
    // UserInfo数据
    public userGuideStep: number = 1;
    public isItemGuideCompleted: number = 0;
    public userHammerData: number = 0;
    public userHRocketData: number = 0;
    public userVRocketData: number = 0;
    public userRefreshData: number = 0;
    public userSkinId: number = null;

    //关卡数据
    public guankaLv:number = null;
    //挑战任务
    public scoreFinish:number = null;



    public classicAlbumData: Map<string, number>;

    // 每日挑战
    public monthlyProgress: number[] = null;
    public lastPlayMonth: number;
    public lastPlayYear: number;
    public stickerObtainedSequence: IRemoteMonthlySticker[] = new Array<IRemoteMonthlySticker>();

    public dailyChallengeAlbumData: Map<string, number> = new Map<string, number>();

    public gameNumber: number = 0;
    public isNewUser: boolean = true;

    //经典模式挑战目标 
    public challengeTargeCompleted: number = 0;

    public setUserRemoteDataToLocal(data) {
        console.log("UserRemoteData setUserRemoteData =====>", data);
        data = JSON.parse(data);
        this.highscore = data.highscore;
        this.userGuideStep = data.userGuideStep;
        this.isItemGuideCompleted = data.isItemGuideCompleted;
        this.currSeason = data.currSeason;
        this.isSeasonFinished = data.isSeasonFinished;
        this.currLevel = data.currLevel;
        this.guankaLv = data.guankaLv;
        this.scoreFinish =  data.scoreFinish;
        this.userSkinId = data.userSkinId;
        this.seasonEndTimeStamp = data.seasonEndTimeStamp;
        this.userHammerData = data.userHammerData;
        this.userHRocketData = data.userHRocketData;
        this.userVRocketData = data.userVRocketData;
        this.userRefreshData = data.userRefreshData;
        let stickerStatus = data.stickerStatus;
        this.gameNumber = data.gameNumber;
        this.isNewUser = data.isNewUser
        this.challengeTargeCompleted = data.challengeTargeCompleted;
        this.stickerStatus = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        if (stickerStatus) {
            for (let index = 0; index < 10; index++) {
                // console.log("setUserRemoteDataToLocal this.stickerStatus=====>", Number(data.stickerStatus[index]));
                this.stickerStatus[index] = Number(data.stickerStatus[index]);
            }
        }

        mk.setItem("kGuide_Finish_Step", this.userGuideStep);
        let classicAlbumData = data.classicAlbumData;


        for (let i = 0; i < ClassicAlbumConfig.config.length; i++) {
            const themeArr = ClassicAlbumConfig.config[i];
            for (let index = 0; index < themeArr.length; index++) {
                const element = themeArr[index];
                let key = "classic_id_" + element.id + "_unlock_status"
                this.classicAlbumData[key] = classicAlbumData[key];
            }
        }
        this.monthlyProgress = data.monthlyProgress;
        this.lastPlayMonth = data.lastPlayMonth;
        this.lastPlayYear = data.lastPlayYear;
        this.stickerObtainedSequence = data.stickerObtainedSequence;
        //this.dailyChallengeAlbumData = data.dailyChallengeAlbumData;
        // console.log("[setUserRemoteDataToLocal] this.dailyChallengeAlbumData = " + JSON.stringify(data.dailyChallengeAlbumData));

        for (const key in data.dailyChallengeAlbumData) {
            if (data.dailyChallengeAlbumData.hasOwnProperty(key)) {
                let id = this.extractNumberFromKey(key);
                this.setChallengeStickerStatusById(id, data.dailyChallengeAlbumData[key]);
            }
        }
        this.challengeTargeCompleted = data.challengeTargeCompleted;
        //console.log("[setUserRemoteDataToLocal] this.dailyChallengeAlbumData = " + this.dailyChallengeAlbumData);
        // for (const key of data.dailyChallengeAlbumData.keys()) {
        //     console.log("iterate [dailyChallengeAlbumData] map" + key);
        // }
    }


    private extractNumberFromKey(key) {
        // 定义一个正则表达式，匹配中间的数字
        const regex = /\D+(\d+)\D+/;

        // 使用正则表达式进行匹配
        const match = key.match(regex);

        // 如果匹配成功，返回匹配到的数字部分
        return match ? match[1] : null;
    }

   

    private setChallengeStickerStatusById(id: number, value: number) {
        let key = "daily_challenge_id_" + id + "_unlock_status";
        mk.setItem(key, value);
        this.dailyChallengeAlbumData[key] = value;
        console.log("[UserRemoteData setChallengeStickerStatusById] key = " + key + " value = " + value);
    }

    // private getStageStickerStatus(stage: number): number {
    //     let name = "stage_" + stage.toString() + "_unlock_status";
    //     let retVal = mk.getItem(name, -1);
    //     return retVal;
    // }
}