/*
 * @Date: 2024-05-23 22:58:52
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-28 10:48:27
 */
import { _decorator, Animation, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("UIPlayAnimations")
export class UIPlayAnimations extends Component {
    @property({ type: [Animation] })
    public anims: Animation[] = [];
    start() {}

    public play() {
        this.anims.forEach((element) => {
            if (element) {
                element.play();
            }
        });
    }
    public stop() {
        this.anims.forEach((element) => {
            if (element) {
                element.stop();
            }
        });
    }
}
