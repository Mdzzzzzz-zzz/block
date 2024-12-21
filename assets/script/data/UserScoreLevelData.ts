/*
 * @Date: 2023-03-09 16:49:37
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-27 08:20:13
 */
import { mk } from "../MK";
import { SdkManager } from "../minigame_sdk/scripts/SdkManager";
import { UserRemoteData } from "./UserRemoteData";
import { UserRemoteDataManager } from "./UserRemoteDataManager";

export class UserScoreLevelData {
    private static _inst: UserScoreLevelData = null;
    public static get inst() {
        if (UserScoreLevelData._inst == null) UserScoreLevelData._inst = new UserScoreLevelData();
        return UserScoreLevelData._inst;
    }
    protected getLevelDataStorageKey() {
        return "GAME_SNAP_SHOT";
    }

    private HighestScoreKey = "SCORE_ENDLESS_MAX";
    public updateLevelHistoryData(data: ILevelData): void {
        mk.setItem(this.getLevelDataStorageKey(), data);
    }
    public getHistoryLevelData(): ILevelData {
        return mk.getItem(this.getLevelDataStorageKey());
    }
    public clearLevelHistoryData() {
        mk.removeItem(this.getLevelDataStorageKey());
    }

    public getHighestScore(): number {
        let val = mk.getItem(this.HighestScoreKey, 0);
        if (val == 0) {
            let remoteVal = UserRemoteDataManager.inst.getUserRemoteHighScore();
            console.log("getHighestScore remote value: ", remoteVal);
            if (remoteVal !== undefined && remoteVal !== null) {
                val = remoteVal;
                mk.setItem(this.HighestScoreKey, val);
            }
        }
        return val;
    }
    public updateHighestScore(score: number) {
        mk.setItem(this.HighestScoreKey, score);
        SdkManager.getInstance().channel.setCloudStorage(
            [{
                key: "score",
                value: score.toString()
            }]
        )
    }

    private LastScoreKey = "LAST_SCORE";
    public getLastScore(): number {
        return mk.getItem(this.LastScoreKey, 0);
    }
    public setLastScore(score: number) {
        return mk.setItem(this.LastScoreKey, score);
    }
}