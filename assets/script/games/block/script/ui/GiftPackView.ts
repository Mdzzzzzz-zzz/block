import { _decorator, Label, Sprite, Animation } from "cc";
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
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";


const { ccclass, property } = _decorator;

@ccclass("GiftPackView")
export class GiftPackView extends PanelBase<any> {

    @property(Sprite)
    imageLight: Sprite = null;

    @property(Sprite)
    imageUI: Sprite = null;

    @property(Label)
    nameLabel: Label = null;

    isWatching: boolean = false;

    onLoad() {
        this.setMaskLayerEnable(false);
    }

    start() {
        // mk.sdk.instance.reportBI(biEventId.ui_itempackage,
        //     {
        //         itempackage_operate: 1,
        //         scene: 3,
        //     });
    }
    OnClickClose() {
        let ani = this.getComponent(Animation);
        ani.play("LibaoWindow_exit");
        ani.once(Animation.EventType.FINISHED, () => {
            this.closeSelf();
        });
        // mk.sdk.instance.reportBI(biEventId.ui_itempackage,
        //     {
        //         itempackage_operate: 3,
        //         scene: 3,
        //     });
    }

    OnClickObtainItem() {
        if (this.isWatching) {
            return;
        }
        // mk.sdk.instance.reportBI(biEventId.ui_itempackage,
        //     {
        //         itempackage_operate: 2,
        //         scene: 3,
        //     });
        // mk.sdk.instance.reportBI(biEventId.af_ad_itempackage,
        //     {
        //         level: UserAdventureLevelData.inst.getHistoryLevel(),
        //         ad_status: emAdStatus.WakeUp,
        //     });
        this.isWatching = true;
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Block_Unlock_Hammer)
            .then((res) => {
                this.isWatching = false;
                // mk.sdk.instance.reportBI(biEventId.af_ad_itempackage,
                //     {
                //         level: UserAdventureLevelData.inst.getHistoryLevel(),
                //         ad_status: emAdStatus.Finished,
                //     });
                PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.propRewardView.path);
                this.closeSelf();
            })
            .catch((err: dtSdkError) => {
                this.isWatching = false;
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                    // mk.sdk.instance.reportBI(biEventId.ad_item, {
                    //     item_type: emPropType.hammer,
                    //     level: currLevel,
                    //     ad_status: emAdStatus.Closed
                    // });
                    // mk.sdk.instance.reportBI(biEventId.af_ad_itempackage,
                    //     {
                    //         level: UserAdventureLevelData.inst.getHistoryLevel(),
                    //         ad_status: emAdStatus.Closed,
                    //     });
                    return;
                }

                // mk.sdk.instance.reportBI(biEventId.af_ad_itempackage,
                //     {
                //         level: UserAdventureLevelData.inst.getHistoryLevel(),
                //         ad_status: emAdStatus.Error,
                //     });
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }
}




