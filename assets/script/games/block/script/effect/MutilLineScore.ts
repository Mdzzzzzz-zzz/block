/*
 * @Date: 2023-06-03 10:54:10
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-24 19:45:24
 */
import { Label, Sprite } from "cc";
import { _decorator, Component, Node } from "cc";
import { BlockConstData } from "../define/BlockConstData";
import { ResManager } from "../../../../resource/ResManager";
const { ccclass, property } = _decorator;

@ccclass("MutilLineScore")
export class MutilLineScore extends Component {
    @property(Label)
    combo_score: Label = null;
    @property(Node)
    combo_desc: Node = null;
    @property(Sprite)
    font_bg: Sprite = null;

    start() {}
    clearCnt: number = 0;
    public getComboPosFixNode(): Node {
        return this.clearCnt > 1 ? this.combo_desc : this.combo_score.node;
    }
    showScore(param) {
        // const combo = param.combo;
        const score = param.score;
        const clearCnt = param.clearCnt;
        const blockColor: number = param.blockColor || 1;
        this.combo_score.string = "+" + score;
        if (clearCnt > 1) {
            // let outlineLabel = this.combo_desc.node.getComponent(LabelOutline);
            // let outlineLabel2 = this.combo_score.node.getComponent(LabelOutline);

            this.combo_desc.active = true;
            // this.combo_score.node.setPosition(0, 100, 0);
            let colorIndex = blockColor - 1;
            let colorArr = BlockConstData.BlockColor;
            if (colorIndex < -1 || colorIndex > colorArr.length - 1) {
                colorIndex = 0;
            }
            let descIndex = clearCnt - 2;
            let descArr = BlockConstData.BlockScoreDesc;
            if (descIndex > -1) {
                if (descIndex >= descArr.length) {
                    descIndex = descArr.length - 1;
                }
            }
            this.font_bg.changeSpriteFrameFromAtlas(`${BlockConstData.BlockScoreDescPic[descIndex]}_${colorIndex+1}`);
        } else {
            this.combo_desc.active = false;
            this.combo_score.node.setPosition(0, 0, 0);
        }
        // this.combo_score.string = '+' + score;
    }
}
