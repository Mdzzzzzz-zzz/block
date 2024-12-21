import { _decorator, Component, Node, Enum } from 'cc';
import { emShareEvent, emSharePath } from '../SocialDef';
import { WechatMiniApi } from '../WechatMiniApi';
import { SdkEventManager } from '../../../minigame_sdk/scripts/SdkEventManager';
import { SdkManager } from '../../../minigame_sdk/scripts/SdkManager';
import * as env from "cc/env"
const { ccclass, property } = _decorator;

@ccclass('ShareHappyComponent')
export class ShareHappyComponent extends Component {

    @property({ type: Enum(emSharePath) })
    sharePath: emSharePath = emSharePath.none;
    @property(Node)
    root: Node = null;
    onLoad() {
        if(SdkManager.getInstance().channel.isSupportShare()){
            SdkEventManager.getInstance().register(emShareEvent.share_happy, this.onChangeShareHappyState, this);
        }
    }
    onChangeShareHappyState(show: boolean, path: emSharePath) {
        if (path == this.sharePath) {
            if (this.root) {
                this.root.active = WechatMiniApi.getInstance().isSupportShare() && show;
            }
        }
    }
    onClickShareHappy() {
        if (env.WECHAT) {
            WechatMiniApi.getInstance().showShareHapppy(this.sharePath);
        }
    }
    onDestroy() {
        if(SdkManager.getInstance().channel.isSupportShare()){
            SdkEventManager.getInstance().unregister(emShareEvent.share_happy, this.onChangeShareHappyState, this);
        }
    }
}

