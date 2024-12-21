import { setItem, getItem } from "../util/MKLocalStorage";
import { UserRemoteDataManager } from "./UserRemoteDataManager";
import { mk } from "../MK";
import { BlockEventType } from "../games/block/script/define/Event";
import { ABTestManager } from "../ABTest/ABTestManager";
import { ABTestParam } from "../ABTest/ABTestDefine";
const kGuide_Finish_Step = "kGuide_Finish_Step";

export interface IGuidePreviewData {
    blockIds: number[];
    colors: number[];
}

export class GuideData {
    private static _inst: GuideData = null;
    public static get inst() {
        if (GuideData._inst == null) GuideData._inst = new GuideData();
        return GuideData._inst;
    }

    constructor() {
        this._step = getItem(kGuide_Finish_Step, 1);

        // check if step is finished in the remote
        if (this._step == 1) {
            let remoteVal = UserRemoteDataManager.inst.getUserGuideStep();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._step = remoteVal;
                setItem(kGuide_Finish_Step, this._step);
            }
        }
    }
    public openGuideStep = 3;
    // public openGuideStep = 4;
    /**
     * 扩展步骤需要修改下面的结束判定
     */
    public static Boards = {
        "1": {
            id: 1,
            board: [
                [0, 0, 0, 5, 5, 5, 0, 0], //红
                [0, 0, 0, 4, 4, 4, 0, 0], //橙
                [0, 0, 0, 2, 2, 2, 0, 0], //黄
                [0, 0, 0, 6, 6, 6, 0, 0], //绿
                [0, 0, 0, -3, -3, -3, 0, 0],
                [0, 0, 0, 7, 7, 7, 0, 0], // 青
                [0, 0, 0, 1, 1, 1, 0, 0], // 蓝
                [0, 0, 0, 3, 3, 3, 0, 0], // 紫
            ],
            score: 30,
            collect: [],
            preview: [-1, 6, -1],
            fill: [[4, 4]],
            color: 4
        },
        "2": {
            id: 2,
            board: [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [5, 4, -3, 2, 6, 7, 1, 3],
                [5, 4, -3, 2, 6, 7, 1, 3],
                [5, 4, -3, 2, 6, 7, 1, 3],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ],
            score: 0,
            collect: [],
            preview: [-1, 7, -1],
            fill: [[3, 2]],
            color: 4
        },
        "3": {
            id: 3,
            board: [
                [0, 0, 0, 5, 5, 0, 0, 0],
                [0, 0, 0, 5, 5, 0, 0, 0],
                [0, 0, 0, 2, 2, 0, 0, 0],
                [5, 5, 2, -3, -3, 2, 5, 5],
                [5, 5, 2, -3, -3, 2, 5, 5],
                [0, 0, 0, 2, 2, 0, 0, 0],
                [0, 0, 0, 5, 5, 0, 0, 0],
                [0, 0, 0, 5, 5, 0, 0, 0],
            ],
            score: 0,
            collect: [],
            preview: [-1, 16, -1],
            fill: [
                [3, 3],
                [3, 4],
                [4, 3],
                [4, 4],
            ],
            color: 1
        },
    };

    public static newGuideBoards = {
        "1": {
            id: 1,
            board: [
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [4, 4, 4, -3, -3, -3, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
            ],
            score: 3,
            collect: [],
            preview: [-1, 6, -1],
            fill: [[4, 4]],
            color: 4
        },
        "2": {
            id: 2,
            board: [
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [4, 4, 4, 4, 4, 4, -3, -3],
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0], 
            ],
            score: 0,
            collect: [],
            preview: [-1, 2, -1],
            fill: [[4, 6], [4, 7]],
            color: 1
        },
        "3": {
            id: 3,
            board: [
                [0, 0, 0, 0, 5, 5, 0, 0],
                [0, 0, 0, 0, 4, 4, 0, 0],
                [0, 0, 0, 0, 2, 2, 0, 0],
                [0, 0, 0, 0, -3, -3, 0, 0],
                [0, 0, 0, 0, -3, -3, 0, 0],
                [0, 0, 0, 0, -3, -3, 0, 0],
                [0, 0, 0, 0, 1, 1, 0, 0],
                [0, 0, 0, 0, 3, 3, 0, 0],
            ],
            score: 0,
            collect: [],
            preview: [-1, 40, -1],
            fill: [
                [3, 4],
                [3, 5],
                [4, 4],
                [4, 5],
                [5, 4],
                [5, 5],
            ],
            color: 1
        }
    }


    private _step: number;
    public get step(): number {
        return this._step;
    }
    public set step(value: number) {
        //console.log("[GuideData] Step = ", value);
        this._step = value;
        setItem(kGuide_Finish_Step, value);
        UserRemoteDataManager.inst.setUserGuideStep(value);
        if (this._step == 4) {
            mk.sendEvent(BlockEventType.EVENT_GUIDE_COMPLETED);
        }

    }
    public isGuideFinished(): boolean {
        // if(env.PREVIEW||env.EDITOR){
        //     return true;
        // }
        // check if step is finished in the remote
        if (this._step == 1) {
            let remoteVal = UserRemoteDataManager.inst.getUserGuideStep();
            if (remoteVal !== undefined && remoteVal !== null) {
                this._step = remoteVal;
                setItem(kGuide_Finish_Step, this._step);
                console.log("remoteVal guideFinished " + remoteVal)
            }
        }

        // console.log("ddddd " + this._step + " " + this.openGuideStep + " " + this._step > GuideData.Boards[this.openGuideStep].id)
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            console.log("this._step", this._step);
            console.log("GuideData.newGuideBoards[this.openGuideStep].id", GuideData.newGuideBoards[this.openGuideStep].id);
            return this._step > GuideData.newGuideBoards[this.openGuideStep].id;
        }
        return this._step > GuideData.Boards[this.openGuideStep].id;
    }
    public isLastGuide(): boolean {
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            return this._step == GuideData.newGuideBoards[this.openGuideStep].id;
        }
        return this._step == GuideData.Boards[this.openGuideStep].id;
    }
    public getGuidePreviews(): number[] {
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            let key = this.step;
            if (GuideData.newGuideBoards.hasOwnProperty(key)) {
                return GuideData.newGuideBoards[key].preview;
            }
            return [-1, 1, -1];
        }
        let key = this.step;
        if (GuideData.Boards.hasOwnProperty(key)) {
            return GuideData.Boards[key].preview;
        }
        return [-1, 1, -1];
    }

    public getNewUserGuidePreviews(): IGuidePreviewData {
        let key = this.step;
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            if (GuideData.newGuideBoards.hasOwnProperty(key)) {
                return { blockIds: GuideData.newGuideBoards[key].preview, colors: [-1, GuideData.newGuideBoards[key].color, -1] };
            }
            return { blockIds: [-1, 1, -1], colors: [-1, 4, -1] };
        }
        if (GuideData.Boards.hasOwnProperty(key)) {
            return { blockIds: GuideData.Boards[key].preview, colors: [-1, GuideData.Boards[key].color, -1] };
        }
        return { blockIds: [-1, 1, -1], colors: [-1, 4, -1] };
    }

    public getGuideBoard(): number[][] {
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            let key = this.step;
            if (GuideData.newGuideBoards.hasOwnProperty(key)) {
                return GuideData.newGuideBoards[key].board;
            }
            return GuideData.newGuideBoards[1].board;
        }
        let key = this.step;
        if (GuideData.Boards.hasOwnProperty(key)) {
            return GuideData.Boards[key].board;
        }
        return GuideData.Boards[1].board;
    }
    public getGuideFill(): number[][] {
        let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
        if (group == 1) {
            let key = this.step;
            if (GuideData.newGuideBoards.hasOwnProperty(key)) {
                return GuideData.newGuideBoards[key].fill;
            }
            return GuideData.newGuideBoards[1].fill;
        }
        let key = this.step;
        if (GuideData.Boards.hasOwnProperty(key)) {
            return GuideData.Boards[key].fill;
        }
        return GuideData.Boards[1].fill;
    }
}
