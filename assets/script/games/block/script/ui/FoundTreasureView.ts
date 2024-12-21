import { _decorator, Label, Sprite,Animation } from "cc";
import PanelBase from "../../../../panel/PanelBase";
import { AdSdk } from "../../../../sdk/AdSdk";
import { emAdPath } from "../../../../sdk/emAdPath";
import { dtSdkError } from "../../../../minigame_sdk/scripts/SdkError";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { ClassicAlbumData } from "../../../../data/ClassicAlbumData";
import { ResManager } from "../../../../resource/ResManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { mk } from "../../../../MK";
import { biEventId } from "../../../../Boot";
import { emAdStatus } from "../../../../define/BIDefine";
import { emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { UserData } from "../../../../data/UserData";


const { ccclass, property } = _decorator;

@ccclass("FoundTreasureView")
export class FoundTreasureView extends PanelBase<any> {


    private isWatching: boolean = false;
    private currId: number = 0;
    private currName: String;

    @property(Sprite)
    imageLight: Sprite = null;

    @property(Sprite)
    imageUI: Sprite = null;

    @property(Label)
    nameLabel: Label = null;

    private adFailLoadTimes: number = 0;

    onLoad() {
        this.setMaskLayerEnable(false);
    }

    start() {
        let anim = this.getComponent(Animation);
        if (anim) {
            anim.play("treasureWindow_enter");
        }
        let obj = ClassicAlbumData.inst.generateRandomSticker();
        this.currId = obj.id;
        this.currName = obj.name;
        console.log("[FoundTreasureView] start: id " + obj.id + " name: " + obj.name);

        // mk.sdk.instance.reportBI(biEventId.ui_treasure,
        //     {
        //         treasure_operate: 1,
        //         treasure_id: this.currId,
        //         scene: 2,
        //     });

        this.nameLabel.string = obj.name;

        let path = "res/texture/adventure/UI_Stickerreward_fish" + obj.id;
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
    }


    OnClickClose() {
        // mk.sdk.instance.reportBI(biEventId.ui_treasure,
        //     {
        //         treasure_operate: 3,
        //         treasure_id: this.currId,
        //         scene: 2,
        //     });

        let anim = this.getComponent(Animation);
        if (anim) {
            anim.play("treasureWindow_exit");
        }
        anim.once(
            Animation.EventType.FINISHED,
            () => {
                this.closeSelf();
            },
            this
        );
    }

    OnClickCollect() {
        if (this.isWatching) {
            return;
        }
        // mk.sdk.instance.reportBI(biEventId.ui_treasure,
        //     {
        //         treasure_operate: 2,
        //         treasure_id: this.currId,
        //         scene: 2,
        //     });
        // mk.sdk.instance.reportBI(biEventId.af_ad_treasure,
        //     {
        //         treasure_id: this.currId,
        //         ad_status: emAdStatus.WakeUp,
        //     });
        this.isWatching = true;
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Collect_Sticker)
            .then((res) => {
                this.isWatching = false;
                // mk.sdk.instance.reportBI(biEventId.af_ad_treasure,
                //     {
                //         treasure_id: this.currId,
                //         ad_status: emAdStatus.Finished,
                //     });
                ClassicAlbumData.inst.setStickerStatusById(this.currId, 1);
                PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.stickerRewardView.path,
                    { id: this.currId }
                );
                this.closeSelf();
            })
            .catch((err: dtSdkError) => {
                this.isWatching = false;
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    // mk.sdk.instance.reportBI(biEventId.af_ad_treasure,
                    //     {
                    //         treasure_id: this.currId,
                    //         ad_status: emAdStatus.Closed,
                    //     });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                    return;
                }
                // mk.sdk.instance.reportBI(biEventId.af_ad_treasure,
                //     {
                //         treasure_id: this.currId,
                //         ad_status: emAdStatus.Error,
                //     });
            });
    }



    onDestroy() {
    }
}


