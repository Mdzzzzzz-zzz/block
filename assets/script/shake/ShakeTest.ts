/*
 * @Date: 2024-05-31 16:35:31
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 11:57:16
 */
import { _decorator, Component, Node } from "cc";
import { emShakeLevel } from "./ShakeDefine";
import { ShakeManager } from "./ShakeManager";

const { ccclass, property } = _decorator;

@ccclass("ShakeTest")
export class ShakeTest extends Component {
    start() { }

    onClickShake(evt, param) {
        //console.log(param);
        if (param == 1) {
            ShakeManager.getInstance().ShakeCamera(emShakeLevel.light);
        } else {
            ShakeManager.getInstance().ShakeCamera(emShakeLevel.medium);
        }
    }
}
