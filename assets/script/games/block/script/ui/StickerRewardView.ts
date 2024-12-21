/*
 * @Author: dengchongliiang 958169797@qq.com
 * @Date: 2024-11-18 17:21:10
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-13 10:48:58
 * @FilePath: \pingtu\assets\script\games\block\script\ui\StickerRewardView.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { _decorator, Sprite, Animation } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { AdSdk } from "../../../../sdk/AdSdk";
import { emAdPath } from "../../../../sdk/emAdPath";
import { dtSdkError } from "../../../../minigame_sdk/scripts/SdkError";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { ClassicAlbumData } from "../../../../data/ClassicAlbumData";
import { ResManager } from "../../../../resource/ResManager";

const { ccclass, property } = _decorator;

@ccclass("StickerRewardView")
export class StickerRewardView extends PanelBase<any> {
    @property(Sprite)
    imageLight: Sprite = null;

    @property(Sprite)
    imageUI: Sprite = null;

    private id: number = 0;

    onLoad() {
        this.setMaskLayerEnable(false);
    }

    start() {
        let path = "res/texture/adventure/UI_Stickerreward_fish" + this.id;
        if (this.id > 20000) {
            path = "res/texture/adventure/dailyChallenge/UI_Stickerreward_fish" + this.id
        }

        if(this.id == 1){
            path = "res/texture/ickScore/reward_ice"
        }
        ResManager.getInstance()
            .loadSpriteFrame(path, "block")
            .then((sprite) => {
                this.imageUI.spriteFrame = sprite;
            });
        let path2 = path + "light";
        ResManager.getInstance()
            .loadSpriteFrame(path2, "block")
            .then((sprite) => {
                this.imageLight.spriteFrame = sprite;
            });
        let anim = this.getComponent(Animation);
        if (anim) {
            anim.play("sticker_reward_enter");
        }

    }

    protected onSetData(value: any): void {
        this.id = value.id;
    }

    OnClickClose() {
        let anim = this.getComponent(Animation);
        if (anim) {
            anim.play("sticker_reward_exit");
        }
        anim.once(
            Animation.EventType.FINISHED,
            () => {
                this.closeSelf();
            },
            this
        );
    }

    onDestroy() {
    }
}

