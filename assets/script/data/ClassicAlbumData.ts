import { getItem, setItem } from "../util/MKLocalStorage";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
import { ClassicAlbumConfig } from "./ClassicAlbumConfig";

export class ClassicAlbumData {
    private static _inst: ClassicAlbumData = null;
    public static get inst() {
        if (ClassicAlbumData._inst == null) ClassicAlbumData._inst = new ClassicAlbumData();
        return ClassicAlbumData._inst;
    }
    public getStickerStatusById(id: number): number {
        let key = "classic_id_" + id + "_unlock_status";
        let retVal = getItem(key, -1);
        if (retVal == -1) {
            let remoteVal = UserRemoteDataManager.inst.getClassicAlbumData(key);
            if (remoteVal !== undefined && remoteVal !== null) {
                setItem(key, retVal);
                retVal = remoteVal;
            } else {
                setItem(key, 0);
            }
        }
        return retVal;
    }

    public setStickerStatusById(id: number, value: number) {
        let key = "classic_id_" + id + "_unlock_status";
        setItem(key, value);
        UserRemoteDataManager.inst.setClassicAlbumData(key, value);
        UserRemoteDataManager.inst.updateDataToRemote();
    }


    public isAllStickerObtained(): boolean {
        for (let i = 0; i < ClassicAlbumConfig.config.length; i++) {
            const themeArr = ClassicAlbumConfig.config[i];
            for (let index = 0; index < themeArr.length; index++) {
                const element = themeArr[index];
                if (this.getStickerStatusById(element.id) != 1) {
                    return false;
                }
            }
        }
        return true;
    }

    public generateRandomSticker() {
        const randomSeed = new Date().getTime() % 1000; // Use current time as seed
        return this.getRandomNumber(randomSeed);
    }

    private getRandomNumber(seed: number) {
        let arr = [];
        for (let i = 0; i < ClassicAlbumConfig.config.length; i++) {
            const themeArr = ClassicAlbumConfig.config[i];
            for (let index = 0; index < themeArr.length; index++) {
                const element = themeArr[index];
                if (this.getStickerStatusById(element.id) != 1) {
                    arr.push(element.id);
                }
            }
        }
        const randomIndex = Math.floor(seed / 100 * arr.length) % arr.length;
        let retId = arr[randomIndex];
        let retName = "";
        for (let i = 0; i < ClassicAlbumConfig.config.length; i++) {
            const themeArr = ClassicAlbumConfig.config[i];
            for (let index = 0; index < themeArr.length; index++) {
                const element = themeArr[index];
                if (element.id == retId) {
                    retName = element.name;
                }
            }

        }
        return { id: retId, name: retName };
    }
}


