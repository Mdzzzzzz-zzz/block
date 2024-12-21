import { game } from "cc";
import { Random } from "../../../../util/Random";
import { BlockGenerate001, IBlockGenetateResult } from "./BlockGenerate";
import { ScoreHelper } from "./ScoreHelper";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";

export class BlockGenetateWasm extends BlockGenerate001 {
    protected fillHelper: BlkHelper;
    protected levelConfig: ILevelConfig;
    private timer: number = 0;
    constructor(
        levelConfig: ILevelConfig,
        random: Random,
        score: ScoreHelper,
        actionKey: string,
        configPath: string = "res/configs/score_block"
    ) {
        super(random, score, actionKey, configPath);
        if (levelConfig == null) {
            // 无尽模式的入口，根据分数调难度，diffScore在
            this.levelConfig = {
                board: [],
                collect: [],
                continuousCount: 0,
                hardNum: 0,
                hardType: 0,
                id: 0,
                initDifficulty: 0,
                isGameOver: 0,
                refreshTimes: 0,
                reviviTimes: 0,
                score: 0,
                skillScore: 0,
            };
        } else {
            this.levelConfig = levelConfig;
        }
        this.timer = 0;
    }
    public initGenetateFill(): boolean {
        if (window["blk1010_wasm"] && window["blk1010_wasm"].BlkHelper) {
            let helper = new window["blk1010_wasm"].BlkHelper(15, 8, 8);
            this.fillHelper = helper;
            this.onInitFillHelper();
            return true;
        }
        if (window["BlkHelper"]) {
            let helper = new window["BlkHelper"](15, 8, 8);
            this.fillHelper = helper;
            this.onInitFillHelper();
            return true;
        }
        return false;
    }
    protected onInitFillHelper() {
        // 和EndlessScoreHelper.getScoreArray保持一致。开放4个难度，最后一个难度预留给全消
        let x = new Int32Array([4000, 6000, 8000, 10000]);
        let scoreDiff = ABTestManager.getInstance().getGroup(ABTestParam.EndlessHardMode);
        if (scoreDiff == 1) {
            x = new Int32Array([2000, 3000, 4000, 10000]);
        } else {
        }
        
        if (this.levelConfig.hardType != undefined) {
            if (this.levelConfig.hardType == 1 && this.levelConfig.hardNum != undefined) {
                x[0] = this.levelConfig.hardNum;
            } else if (this.levelConfig.hardType == 2 && this.levelConfig.hardNum != undefined) {
                x[0] = this.levelConfig.hardNum;
            } else {
                this.levelConfig.hardType = 0;
            }
        } else {
            this.levelConfig.hardType = 0;
            
        }       

        if (this.levelConfig.initDifficulty == undefined) {
            this.levelConfig.initDifficulty = 0;
        }
        this.fillHelper.setScoreDiff(x);
    }

    public getPreviewBlocks(
        score: number,
        combo: number,
        collect: number,
        hard_level: number,
        hard_type: number,
        tableData: any,
        can_put_block: Function,
        clearAllFillScore: number
    ): Promise<IBlockGenetateResult> {
        this.round++;
        if (hard_type == 0) {
            hard_type = this.levelConfig.hardType;
        }
        if (hard_level == 0) {
            hard_level = this.levelConfig.initDifficulty;
        } else {
            hard_level = this.levelConfig.initDifficulty + hard_level;
        }
        console.log("[blockGenetateWasm getPreviewBlocks] 当前调难度依据：" + hard_type + " 当前难度:" + hard_level);
        const num = 8;
        const mapData: number[] = [];
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < num; j++) {
                mapData.push(tableData[i][j]);
            }
        }
        const mapArray: Uint8Array = Uint8Array.from(mapData);
        return new Promise((resolve, reject) => {
            try {
                // let timeRecord = Date.now();
                this.fillHelper.fillAsync(
                    mapArray,
                    combo,
                    score,
                    collect,
                    hard_level,
                    hard_type,
                    (blocks, allc, multi) => {
                        if (this.timer != 0) {
                            // clearInterval(this.timer);
                            this.timer = 0;
                        }
                        let arr = Array.from(new Uint8Array(blocks));
                        let allcArr = Array.from(new Uint8Array(allc));
                        let multiArr = Array.from(new Uint8Array(multi));
                        let res = { blockIds: arr, isRecommendHigh: false, allcArr: allcArr, multiArr: multiArr, color: null };
                        // console.log("gen comsume:", Date.now() - timeRecord);
                        this.onGenPreviews(arr);
                        console.log("rust库加强ai提示： " + JSON.stringify(res.allcArr, null, undefined) + " " + JSON.stringify(res.multiArr, null, undefined));
                        resolve(res);
                    },
                    game.deltaTime,
                    clearAllFillScore
                );
                this.timer = 1;
                // if (this.timer != 0) {
                //     clearInterval(this.timer);
                // }
                // this.timer = setInterval(() => {
                //     if (this.fillHelper) {
                //         this.fillHelper.fillUpdate();
                //     }
                // }, 3);
            } catch (error) {
                reject(null);
            }
        });
    }
    protected onGenPreviews(ids: Array<number>): void {}
    onUpdate() {
        if (this.timer > 0) {
            if (this.fillHelper) {
                this.fillHelper.fillUpdate();
            }
        }
    }
    clear() {
        super.clear();
        if (this.timer != 0) {
            clearInterval(this.timer);
        }
        if (this.fillHelper) {
            this.fillHelper.fillFree();
            this.fillHelper = null;
        }
    }
    // public getPreviewBlocksSync(
    //     score: number,
    //     combo: number,
    //     tableData: any,
    //     can_put_block: Function
    // ): Promise<IBlockGenetateResult> {
    //     this.round++;
    //     const num = 8;
    //     const mapData: number[] = [];
    //     for (let i = 0; i < num; i++) {
    //         for (let j = 0; j < num; j++) {
    //             mapData.push(tableData[i][j]);
    //         }
    //     }
    //     let blocks = this.fillHelper.fill(mapData, combo, score);
    //     let res = { blockIds: blocks, isRecommendHigh: false };
    //     return new Promise((resolve, reject) => {
    //         resolve(res);
    //     });
    // }
}
