/*
 * @Date: 2024-05-31 15:30:27
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-31 15:33:05
 */
import { BlockGenetateWasm } from "./BlockGenetateWasm";
import { EndlessScoreHelper } from "./EndlessScoreHelper";
import {Random} from "db://assets/script/util/Random";
import {ScoreHelper} from "db://assets/script/games/block/script/logic/ScoreHelper";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { UserData } from "../../../../data/UserData";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";

export class BlockGenetateWasmEndless extends BlockGenetateWasm {
    constructor(levelConfig: ILevelConfig, random: Random, score: ScoreHelper, actionKey: string, configPath: string = "res/configs/score_block") {
        super(levelConfig, random, score, actionKey, configPath);
        this.levelConfig.hardType = 1 //无尽模式需按分数调高难度
        console.log("game Num ", UserData.inst.gameNumber, " newbieGame " , RemoteConfig.getInstance().newbieGameNumber);
    }
   protected onInitFillHelper(): void {
       let scoreHelper = this.scHelper  as EndlessScoreHelper;
       if(scoreHelper){
         this.fillHelper.setScoreDiff(scoreHelper.diffScoreBuffArr)
       }
   }
}
