import { _decorator } from 'cc';
import { BlockGenerate } from './BlockGenerate';
import { BlockPlaceholder3 } from './BlockPlaceholder3';
import { DailyChallengeLevelGame } from '../logic/DailyChallengeLevelGame';
const { ccclass, property } = _decorator;

//84gKuMEplH5JmwWi9nijYn 43008
@ccclass('BlockGenerateDailyChallenge')
export class BlockGenerateDailyChallenge extends BlockGenerate {
    protected onInit() {
        this.blockPlaceholders = new Array<BlockPlaceholder3>();
        this.gameManager = DailyChallengeLevelGame.levlInstance;
    }
    protected getBlockGroupPoolName(){
        return "AdventureLevelBlockGroupPool";
    }
}