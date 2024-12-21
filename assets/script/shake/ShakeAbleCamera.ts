import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("ShakeAbleCamera")
export class ShakeAbleCamera extends Component {
    public static inst: ShakeAbleCamera;
    start() {
        ShakeAbleCamera.inst = this;
    }

    onDestroy() {
        ShakeAbleCamera.inst = null;
    }
}
