import { game } from "cc";
import { Random } from "../../../../util/Random";
import { BlockGenerate001, IBlockGenetateResult } from "./BlockGenerate";
import { ScoreHelper } from "./ScoreHelper";

export class BlockGenetateNative extends BlockGenerate001 {
    private fillHelper: blk.BlkHelper;
    constructor(random: Random, score: ScoreHelper, actionKey: string, configPath: string = "res/configs/score_block") {
        super(random, score, actionKey, configPath);
        let helper = new blk.BlkHelper();
        this.fillHelper = helper;
    }
    public getPreviewBlocks(
        score: number,
        combo: number,
        collect: number,
        hard_level: number,
        hard_type: number,
        tableData: any,
        can_put_block: Function,
        clearAllFillScore:number
    ): Promise<IBlockGenetateResult> {
        this.round++;
        const num = 8;
        const mapData: number[] = [];
        for (let i = 0; i < num; i++) {
            for (let j = 0; j < num; j++) {
                mapData.push(tableData[i][j]);
            }
        }
        return new Promise((resolve, reject) => {
            try {
                this.fillHelper.fillAsync(
                    mapData,
                    combo,
                    score,
                    collect,
                    hard_level,
                    hard_type,
                    (blocks) => {
                        let res = { blockIds: blocks, isRecommendHigh: false };
                        resolve(res);
                    },
                    game.deltaTime,clearAllFillScore
                );
            } catch (error) {
                reject(null);
            }
        });
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
