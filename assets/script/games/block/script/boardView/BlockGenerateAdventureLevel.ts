import { _decorator } from 'cc';
import { BlockGenerate } from './BlockGenerate';
import { BlockPlaceholder3 } from './BlockPlaceholder3';
import { AdventureLevelGame } from '../logic/AdventureLevelGame';
const { ccclass, property } = _decorator;

//84gKuMEplH5JmwWi9nijYn 43008
@ccclass('BlockGenerateAdventureLevel')
export class BlockGenerateAdventureLevel extends BlockGenerate {
    protected onInit() {
        this.blockPlaceholders = new Array<BlockPlaceholder3>();
        this.gameManager =AdventureLevelGame.levlInstance;
    }
    protected getBlockGroupPoolName(){
        return "AdventureLevelBlockGroupPool";
    }
}

