import { _decorator, Component, Node } from 'cc';
import { SdkManager } from '../SdkManager';
const { ccclass, property } = _decorator;

@ccclass('ShareEnableComponent')
export class ShareEnableComponent extends Component {
    @property(Node)
    root: Node = null;
    protected onLoad(): void {
        if (this.root) {
            let inst = SdkManager.getInstance();
            this.root.active = inst && inst.channel && inst.channel.isSupportShare();
        }
    }
}

