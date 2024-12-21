import { setItem, getItem } from '../util/MKLocalStorage';
import { UserCollectLevelData } from './UserCollectLevelData';
import { UserData } from './UserData';
const kGuide_Finish_Step_Level = "kGuide_Finish_Step_Level";

export class LevelGuideData {
    private static _inst: LevelGuideData = null;
    public static get inst() {
        if (LevelGuideData._inst == null) LevelGuideData._inst = new LevelGuideData();
        return LevelGuideData._inst;
    }


    constructor() {
        this._step = getItem(kGuide_Finish_Step_Level, 1);
    }
    public openGuideStep = 1;
    /**
     * 扩展步骤需要修改下面的结束判定
     */
    public static Boards = {
        // "1": {
        //     "id": 1,
        //     "board": [
        //         [0, 0, 1, 0, 0, 0, 0, 0],
        //         [0, 0, 1, 0, 0, 0, 0, 0],
        //         [0, 0, 1, 0, 0, 0, 0, 0],
        //         [6, 6, -3, 2, 2, 2, 2, 2],
        //         [0, 0, 1, 0, 0, 0, 0, 0],
        //         [0, 0, 1, 0, 0, 0, 0, 0],
        //         [0, 0, 1, 0, 0, 0, 0, 0],
        //         [0, 0, 1, 0, 0, 0, 0, 0]
        //     ],
        //     "score": 30,
        //     "collect": [],
        //     "preview": [-1, 1, -1],
        //     "fill": [[3, 2]],
        // },
        // "2": {
        //     "id": 2,
        //     "board": [
        //         [0, 0, 0, 0, 0, 0, 0, 0],
        //         [0, 0, 0, 0, 0, 0, 0, 0],
        //         [0, 0, 0, 0, 0, 0, 0, 0],
        //         [0, 0, 0, 0, 0, 0, 0, 0],
        //         [6, 6, -3, 2, 2, 2, 2, 2],
        //         [6, 6, -3, -3, -3, 2, 2, 2],
        //         [0, 0, 0, 0, 0, 0, 0, 0],
        //         [0, 0, 0, 0, 0, 0, 0, 0]
        //     ],
        //     "score": 0,
        //     "collect": [],
        //     "preview": [-1, 26, -1],
        //     "fill": [[5, 2]],
        // },
        // "3": {
        //     "id": 3,
        //     "board": [
        //         [0, 0, 0, 2, 2, 0, 0, 0],
        //         [0, 0, 0, 2, 2, 0, 0, 0],
        //         [0, 0, 0, 4, 4, 0, 0, 0],
        //         [2, 2, 4, -3, -3, 4, 2, 2],
        //         [2, 2, 4, -3, -3, 4, 2, 2],
        //         [0, 0, 0, 4, 4, 0, 0, 0],
        //         [0, 0, 0, 2, 2, 0, 0, 0],
        //         [0, 0, 0, 2, 2, 0, 0, 0],
        //     ],
        //     "score": 0,
        //     "collect": [],
        //     "preview": [-1, 16, -1],
        //     "fill": [[3, 3], [3, 4], [4, 3], [4, 4]]
        // }
    }
    private _step: number;
    public get step(): number {
        return this._step;
    }
    public set step(value: number) {
        this._step = value;
        setItem(kGuide_Finish_Step_Level, value);
    }
    public isGuideFinished(): boolean {
        return true;
        // let histoyMaxLevel = UserCollectLevelData.inst.getMaxHistoryLevel();
        // if (histoyMaxLevel>1) {
        //     return true;
        // }
        // return this._step > LevelGuideData.Boards[this.openGuideStep].id;
    }
    public isLastGuide(): boolean {
        return this._step == LevelGuideData.Boards[this.openGuideStep].id;
    }
    public getGuidePreviews(): number[] {
        let key = this.step;
        if (LevelGuideData.Boards.hasOwnProperty(key)) {
            return LevelGuideData.Boards[key].preview;
        }
        return [-1, 1, -1];
    }


    public getGuideBoard(): number[][] {
        let key = this.step;
        if (LevelGuideData.Boards.hasOwnProperty(key)) {
            return LevelGuideData.Boards[key].board;
        }
        return LevelGuideData.Boards[1].board;
    }
    public getGuideFill(): number[][] {
        let key = this.step;
        if (LevelGuideData.Boards.hasOwnProperty(key)) {
            return LevelGuideData.Boards[key].fill;
        }
        return LevelGuideData.Boards[1].fill;
    }
}