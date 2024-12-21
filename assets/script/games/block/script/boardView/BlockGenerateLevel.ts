import { _decorator } from 'cc';
import { BlockGenerate } from './BlockGenerate';
import { BlockPlaceholder3 } from './BlockPlaceholder3';
import { LevelGame } from '../logic/LevelGame';
const { ccclass, property } = _decorator;

@ccclass('BlockGenerateLevel')
export class BlockGenerateLevel extends BlockGenerate {
    protected onInit() {
        this.blockPlaceholders = new Array<BlockPlaceholder3>();
        this.gameManager =LevelGame.levlInstance;
    }
    protected getBlockGroupPoolName(){
        return "LevelBlockGroupPool";
    }
}

