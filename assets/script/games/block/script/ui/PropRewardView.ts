import { _decorator, Label, Sprite, Animation } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { ResManager } from "../../../../resource/ResManager";
import { emPropType } from "../../../../define/BIDefine";
import { UserHammerData } from "../../../../data/UserHammerData";
import { UserVRocketData } from "../../../../data/UserVRocketData";
import { UserHRocketData } from "../../../../data/UserHRocketData";
import { UserChangeData } from "../../../../data/UserChangeData";
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";



const { ccclass, property } = _decorator;

@ccclass("PropRewardView")
export class PropRewardView extends PanelBase<any> {

    @property(Sprite)
    Reward1Light: Sprite = null;

    @property(Sprite)
    Reward1: Sprite = null;

    @property(Sprite)
    Reward2Light: Sprite = null;

    @property(Sprite)
    Reward2: Sprite = null;

    randNum1: number = 0;
    randNum2: number = 0;
    onLoad() {
        this.setMaskLayerEnable(false);
    }

    start() {
        this.getTwoRandomNumber();
    }

    randomNumber(max, min, except) {
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        return num === except ? this.randomNumber(max, min, except) : num;
    }

    OnClickClose() {
        // let ani = this.getComponent(Animation);
        // console.log("[OnClickClose] animation playing ")
        // ani.play("sticker_reward_exit");
        // ani.once(Animation.EventType.FINISHED, () => {
        //     console.log("[OnClickClose] anim finished")
        //     mk.sendEvent(BlockEventType.EVENT_PROP_GIFT_PACK_FLY_PROP, { prop1: this.randNum1, prop2: this.randNum2 })
        //     this.closeSelf();
        // });
        mk.sendEvent(BlockEventType.EVENT_PROP_GIFT_PACK_FLY_PROP, { prop1: this.randNum1, prop2: this.randNum2 })
        this.closeSelf();
    }

    getTwoRandomNumber() {

        this.randNum1 = this.randomNumber(4, 1, -1);
        this.randNum2 = this.randomNumber(4, 1, this.randNum1);

        this.addProp(this.randNum1);
        this.addProp(this.randNum2);
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, false);
        let base_path = "res/texture/props/UI_Props_New/UI_Congrats_icon_";

        let reward1Path = base_path + this.randNum1;
        ResManager.getInstance()
            .loadSpriteFrame(reward1Path, "block")
            .then((sprite) => {
                this.Reward1.spriteFrame = sprite;
            });
        ResManager.getInstance()
            .loadSpriteFrame(reward1Path + "_light", "block")
            .then((sprite) => {
                this.Reward1Light.spriteFrame = sprite;
            });

        let reward2Path = base_path + this.randNum2;
        ResManager.getInstance()
            .loadSpriteFrame(reward2Path, "block")
            .then((sprite) => {
                this.Reward2.spriteFrame = sprite;
            });
        ResManager.getInstance()
            .loadSpriteFrame(reward2Path + "_light", "block")
            .then((sprite) => {
                this.Reward2Light.spriteFrame = sprite;
            });

    }

    addProp(propNum) {
        if (propNum == emPropType.hammer) {
            UserHammerData.inst.addItem(1);
        }
        if (propNum == emPropType.v_rocket) {
            UserVRocketData.inst.addItem(1);
        }
        if (propNum == emPropType.h_rocket) {
            UserHRocketData.inst.addItem(1);
        }
        if (propNum == emPropType.refresh_block) {
            UserChangeData.inst.addItem(1);
        }
    }
}




