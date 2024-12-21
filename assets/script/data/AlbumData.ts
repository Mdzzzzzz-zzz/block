import { getItem, setItem } from "../util/MKLocalStorage";
import { emStageStickerStatus } from "./AlbumDef";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
const stage_unlock_status_string = {
    1: "stage_1_unlock_status",
    2: "stage_2_unlock_status",
    3: "stage_3_unlock_status",
    4: "stage_4_unlock_status",
    5: "stage_5_unlock_status"
};

// dailyChallenge key format, 只有 not_started, obtained和missed三种
// challenge_202408_unlock_status

export class AlbumData {
    private static _inst: AlbumData = null;
    public static get inst() {
        if (AlbumData._inst == null) AlbumData._inst = new AlbumData();
        return AlbumData._inst;
    }
    public getStageStickerStatus(stage: number): number {
        let name = "stage_" + stage.toString() + "_unlock_status";

        let retVal = getItem(name, -1);
        if (retVal == -1) {
            let remoteVal = UserRemoteDataManager.inst.getstickerStatus();
            //console.log("Getting Sticker Status from remote", remoteVal);
            if (remoteVal !== undefined && remoteVal !== null) {
                retVal = remoteVal[stage - 1];
            } else {
                retVal = 0;
            }
            setItem(name, retVal);
        }
        return retVal;
    }

    public setStageStickerStatus(stage: number, value: number) {
        //console.log("setStageStickerStatus stage " + stage + "value :" + value);
        let name = "stage_" + stage.toString() + "_unlock_status";
        setItem(name, value);
        UserRemoteDataManager.inst.setstickerStatus();
    }

    public getChallengeStickerStatusById(id: number): emStageStickerStatus {
        let key = "daily_challenge_id_" + id + "_unlock_status";
        let retVal = getItem(key, emStageStickerStatus.not_started);
        return retVal;
    }

    public setChallengeStickerStatusById(id: number, value: emStageStickerStatus) {
        let key = "daily_challenge_id_" + id + "_unlock_status";
        setItem(key, value);
        if (key == undefined || value == undefined) {
            return;
        }
        console.log("[setChallengeStickerStatusById] key = " + key + " value = " + value);
        UserRemoteDataManager.inst.setDailyAlbumData(key, value);
    }


    // 暂不支持
    // public isAllStickerObtained(): boolean {
    //     for (let i = 0; i < UserDailyChallengeData.config.length; i++) {
    //         const themeArr = ClassicAlbumConfig.config[i];
    //         for (let index = 0; index < themeArr.length; index++) {
    //             const element = themeArr[index];
    //             if (this.getStickerStatusById(element.id) != 1) {
    //                 return false;
    //             }
    //         }
    //     }
    //     return true;
    // }

}

export class ChallengeAlbumConfig {
    /**
 * Calculates a unique ID based on the provided year, month, and sequence number.
 *
 * @param {number} year - The year for which the ID is being calculated.
 * @param {number} month - The month for which the ID is being calculated.
 * @param {number} seq - start from 1.
 * @return {number} A unique ID calculated from the provided year, month, and sequence number.
 */
    static calculateIdByMonth(year: number, month: number, seq: number): number {
        // todo 10000 改成 20000
        return 20000 + ((year - 2024) * 12 + month - 7) * 100 + seq;
    }

    // TODO 临时复用
    public static nameConfig = {
        20001: "2024八月",
        20002: "2024八月",
        20003: "2024八月",
        20004: "2024八月",
        20005: "2024八月",
        20006: "2024八月",
        20101: "2024九月",
        20102: "2024九月",
        20103: "2024九月",
        20104: "2024九月",
        20105: "2024九月",
        20106: "2024九月",
        20201: "2024十月",
        20202: "2024十月",
        20203: "2024十月",
        20204: "2024十月",
        20205: "2024十月",
        20206: "2024十月",
        20301: "2024十一月",
        20302: "2024十一月",
        20303: "2024十一月",
        20304: "2024十一月",
        20305: "2024十一月",
        20306: "2024十一月",
        20401: "2024十二月",
        20402: "2024十二月",
        20403: "2024十二月",
        20404: "2024十二月",
        20405: "2024十二月",
        20406: "2024十二月",
        20501: "2025一月",
        20502: "2025一月",
        20503: "2025一月",
        20504: "2025一月",
        20505: "2025一月",
        20506: "2025一月",
    }
}
