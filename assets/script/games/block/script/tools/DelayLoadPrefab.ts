import { _decorator, CCString, Component} from "cc";
import { ResManager } from "../../../../resource/ResManager";


const { ccclass, property } = _decorator;

@ccclass("DelayLoadPrefab")
export class DelayLoadPrefab extends Component {
    @property(CCString)
    public path: string = "";
    @property(CCString)
    public bundle: string = "block";
    onLoad() {
        console.log("DelayLoadPrefab onLoad", this.path, this.bundle);
        if (this.path == null || this.path == "" || this.bundle == null || this.bundle == ""){
            return;
        }
        ResManager.getInstance().loadNode(this.path, this.bundle, this.node)
    }
}