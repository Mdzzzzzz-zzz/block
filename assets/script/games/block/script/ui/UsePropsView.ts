import { _decorator, Toggle, Node } from "cc";
import { mk } from "../../../../MK";
import PanelBase from "../../../../panel/PanelBase";
import { Game } from "../logic/Game";
import { BlockEventType } from "../define/Event";
import { emPropType } from "../../../../define/BIDefine";
import { UserData } from "../../../../data/UserData";
const { ccclass, property } = _decorator;

@ccclass("UsePropsView")
export class UsePropsView extends PanelBase<Game> {
    @property(Node)
    HammerNode: Node = null;
    @property(Node)
    VRocketNode: Node = null;
    @property(Node)
    HRocketNode: Node = null;
    @property(Node)
    RefreshNode: Node = null;

    @property(Node)
    HammerTitle: Node = null;
    @property(Node)
    VRocketTitle: Node = null;
    @property(Node)
    HRocketTitle: Node = null;
    propType: number
    onLoad() {
        //this.setMaskLayerEnable(false);
    }
    start() {
        mk.regEvent(BlockEventType.EVENT_BLOCK_CLICKED, this.onBlockClicked, this);
    }
    protected onSetData(value: any): void {
        this.propType = value;
        this.HammerNode.active = (this.propType == emPropType.hammer);
        this.HammerTitle.active = (this.propType == emPropType.hammer);
        this.VRocketNode.active = (this.propType == emPropType.v_rocket);
        this.VRocketTitle.active = (this.propType == emPropType.v_rocket);
        this.HRocketNode.active = (this.propType == emPropType.h_rocket);
        this.HRocketTitle.active = (this.propType == emPropType.h_rocket);
        this.RefreshNode.active = false;
    }

    onBlockClicked(row, col) {
        if (this.propType == emPropType.hammer) {
            let count = UserData.inst.getThisRoundUsedHammerCount();
            UserData.inst.setThisRoundUsedHammerCount(count + 1);
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_HAMMER, row, col, 1);
        } else if (this.propType == emPropType.v_rocket) {
            let count = UserData.inst.getThisRoundUsedVRocketCount();
            UserData.inst.setThisRoundUsedVRocketCount(count + 1);
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_VROCKET, row, col);
        } else if (this.propType == emPropType.h_rocket) {
            let count = UserData.inst.getThisRoundUsedHRocketCount();
            UserData.inst.setThisRoundUsedHRocketCount(count + 1);
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_HROCKET, row, col);
        }
        this.onClickClose();
    }

    onClickClose() {
        mk.unRegEvent(this);
        this.closeSelf();
    }
    onClose() {
        mk.unRegEvent(this);
    }

}

