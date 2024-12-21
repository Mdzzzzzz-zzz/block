
import { Label, UIOpacity, Sprite } from 'cc';
import { Vec3, tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserHammerData } from '../../../../data/UserHammerData';
import { UserVRocketData } from '../../../../data/UserVRocketData';
import { UserHRocketData } from '../../../../data/UserHRocketData';
import { UserChangeData } from '../../../../data/UserChangeData';
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
import { UserData } from '../../../../data/UserData';
import { RemoteConfig } from '../../../../RemoteConfig/RemoteConfig';
import { kGameMode } from '../define/Enumrations';
import { SceneMode } from '../define/SceneMode';
const { ccclass, property } = _decorator;

@ccclass('Props')
export class Props extends Component {
    @property(Node)
    HammerNode: Node = null;
    // @property(Node)
    // VRocketNode: Node = null;
    // @property(Node)
    // HRocketNode: Node = null;
    @property(Node)
    RefreshNode: Node = null;
    @property(Node)
    LabelsNode: Node = null;

    start() {
        mk.regEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, this.refreshProps, this);
        this.refreshProps(SceneMode.gameMode == kGameMode.endless);
    }
    onClose() {
        mk.unRegEvent(this);
    }
    onDestroy() {
        mk.unRegEvent(this);
    }
    refreshProps(isEndlessMode) {
        if (!isEndlessMode) {
            this.setPropState(this.HammerNode, UserHammerData.inst.itemCount, "HammerText", true);
            //this.setPropState(this.VRocketNode, UserVRocketData.inst.itemCount, "vrocketLabel", true);
            //this.setPropState(this.HRocketNode, UserHRocketData.inst.itemCount, "hrocketLabel", true);
            this.setPropState(this.RefreshNode, UserChangeData.inst.itemCount, "RefreshText", true);
            return;
        }
        console.log("[refresh Props ] : ", UserData.inst.getThisRoundUsedHammerCount())
        this.setPropState(this.HammerNode, UserHammerData.inst.itemCount, "HammerText",
            UserData.inst.getThisRoundUsedHammerCount() < RemoteConfig.getInstance().RoundUsedHammerMaxCount);
        // this.setPropState(this.VRocketNode, UserVRocketData.inst.itemCount, "vrocketLabel",
        //     UserData.inst.getThisRoundUsedVRocketCount() < RemoteConfig.getInstance().RoundUsedVRocketMaxCount);
        // this.setPropState(this.HRocketNode, UserHRocketData.inst.itemCount, "hrocketLabel",
        //     UserData.inst.getThisRoundUsedHRocketCount() < RemoteConfig.getInstance().RoundUsedHRocketMaxCount);
        this.setPropState(this.RefreshNode, UserChangeData.inst.itemCount, "RefreshText",
            UserData.inst.getThisRoundUsedRefreshCount() < RemoteConfig.getInstance().RoundUsedRefreshMaxCount);
    }
    setPropState(objNode, num, labelname, canUse) {
        if (!canUse) {
            objNode.getComponent(UIOpacity).opacity = 153;
            objNode.getChildByPath("mainNode/Sprite/haveItemIcon").active = false;
            objNode.getChildByPath("mainNode/Sprite/watchAd").active = false;
            this.LabelsNode.getChildByPath(labelname).active = false;
            objNode.getChildByPath("mainNode/Sprite/lock").active = false;
        } else {
            objNode.getComponent(UIOpacity).opacity = 255;
            objNode.getChildByPath("mainNode/Sprite/lock").active = false;
            if (num == 0) {
                objNode.getChildByPath("mainNode/Sprite/haveItemIcon").active = false;
                objNode.getChildByPath("mainNode/Sprite/watchAd").active = true;
                this.LabelsNode.getChildByPath(labelname).active = false;
            } else if (num > 0) {
                objNode.getChildByPath("mainNode/Sprite/haveItemIcon").active = true;
                objNode.getChildByPath("mainNode/Sprite/watchAd").active = false;
                this.LabelsNode.getChildByPath(labelname).active = true;
                let label = this.LabelsNode.getChildByPath(labelname);
                label.getComponent(Label).string = num.toString();
            }
        }
    }
}

