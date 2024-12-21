/*
 * @Date: 2023-03-02 15:30:56
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-23 23:59:20
 */
import { Node } from "cc";
import { _decorator, Component, Label } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ComboScore")
export class ComboScore extends Component {
    @property({ type: [Node] })
    combo_nums: Node[] = [];
    @property(Label)
    combo_num: Label = null;
    // @property(Label)
    // combo_score: Label = null;
    @property(Node)
    comboPosFix: Node = null;

    showComobScore(param) {
        const combo = param.combo;
        const score = param.score;
        this.combo_nums.forEach((element) => {
            element.active = combo > 1;
        });
        this.combo_num.string = `${combo}`;
    }
}
