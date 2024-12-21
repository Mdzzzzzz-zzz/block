/*
 * @Date: 2024-05-31 19:58:31
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-31 20:33:48
 */
import { _decorator, Component, Label, Node, Sprite, SpriteAtlas } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AdventureLevelItem")
export class AdventureLevelItem extends Component {
    @property(Node)
    curEffect: Node = null;
    @property(Sprite)
    bg: Sprite = null;
    levelItemLabel: Label;
    levelItemLabelDark: Label;

    start() {}

    bindLabel(labNormal: Label, labDark: Label) {
        this.levelItemLabel = labNormal;
        this.levelItemLabelDark = labDark;
    }

    setState(index: number, state: number) {
        this.curEffect.active = false;
        let imagePath = "buttonbase2";
        switch (state) {
            case 0:
                this.levelItemLabelDark.node.active = false;
                this.levelItemLabel.node.active = true;
                break;
            case 1:
                imagePath = "buttonbase3";
                this.levelItemLabelDark.node.active = false;
                this.levelItemLabel.node.active = true;
                this.curEffect.active = true;
                break;
            case 2:
                imagePath = "buttonbase1";
                this.levelItemLabel.node.active = false;
                this.levelItemLabelDark.node.active = true;
                break;
        }
        let sprite = this.bg.spriteAtlas.getSpriteFrame(imagePath);
        this.bg.spriteFrame = sprite;
        let levName = `${index + 1}`;
        this.levelItemLabel.string = levName;
        this.levelItemLabelDark.string = levName;
    }
}
