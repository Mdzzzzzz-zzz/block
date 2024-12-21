
import { _decorator, Component } from "cc";
import { mk } from "../../../../MK";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { PanelManager } from "../../../../panel/PanelManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { AdventureLevelGame } from "../logic/AdventureLevelGame";
import { AdSdk } from "../../../../sdk/AdSdk";
import { BIEventID, emButtonScene, emButtonType, emPropType } from "../../../../define/BIDefine";
import { emAdPath } from "../../../../sdk/emAdPath";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { emAdStatus } from "../../../../define/BIDefine";
import { BlockEventType } from "../define/Event";
import { UserHammerData } from '../../../../data/UserHammerData';
import { UserVRocketData } from '../../../../data/UserVRocketData';
import { UserHRocketData } from '../../../../data/UserHRocketData';
import { UserChangeData } from '../../../../data/UserChangeData';
import { biEventId, getItem } from "../../../../Boot";
import { UserData } from "../../../../data/UserData";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";


const { ccclass, property } = _decorator;

@ccclass("UsePropHelper")
export class UsePropHelper extends Component {
    isWatching: boolean
    protected onLoad(): void {
        // SceneMode.gameMode = kGameMode.level;
        this.isWatching = false;
    }
    protected start(): void {
    }
    onClickPropHammer() {
        let currLevel = -1;
        if (SceneMode.gameMode != kGameMode.endless) {
            currLevel = AdventureLevelGame.levlInstance.getLevelId();
        } else {
            if (UserData.inst.getThisRoundUsedHammerCount() >= RemoteConfig.getInstance().RoundUsedHammerMaxCount) {
                SdkManager.getInstance().native.showToast("该道具使用次数已达上限");
                return;
            }
        }
        let num = UserHammerData.inst.itemCount;
        let cfg = AssetInfoDefine.prefab.useProp;
        if (num > 0) {
            PanelManager.inst.addPopUpView(cfg.path, emPropType.hammer);
        } else {
            if (this.isWatching) {
                return;
            }
            // 打点广告_使用道具
            mk.sdk.instance.reportBI(biEventId.ad_item, {
                proj_item_type: emPropType.hammer,
                proj_level: currLevel,
                proj_ad_status: emAdStatus.WakeUp
            });
            this.isWatching = true;
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Block_Unlock_Hammer)
                .then((res) => {
                    this.isWatching = false;
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    UserHammerData.inst.addItem(1, false);
                    mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
                    PanelManager.inst.addPopUpView(cfg.path, emPropType.hammer);
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.hammer,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Finished
                    });
                })
                .catch((err: dtSdkError) => {
                    this.isWatching = false;
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                        mk.sdk.instance.reportBI(biEventId.ad_item, {
                            proj_item_type: emPropType.hammer,
                            proj_level: currLevel,
                            proj_ad_status: emAdStatus.Closed
                        });
                        return;
                    }
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.hammer,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Error
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                });
        }
    }

    onClickPropVRocket() {
        let currLevel = -1;
        if (SceneMode.gameMode != kGameMode.endless) {
            currLevel = AdventureLevelGame.levlInstance.getLevelId();
        } else {
            if (UserData.inst.getThisRoundUsedVRocketCount() >= RemoteConfig.getInstance().RoundUsedVRocketMaxCount) {
                SdkManager.getInstance().native.showToast("该道具使用次数已达上限");
                return;
            }
        }
        let num = UserVRocketData.inst.itemCount;
        let cfg = AssetInfoDefine.prefab.useProp;
        if (num > 0) {
            PanelManager.inst.addPopUpView(cfg.path, emPropType.v_rocket);
        } else {
            if (this.isWatching) {
                return;
            }
            // 打点广告_使用道具
            mk.sdk.instance.reportBI(biEventId.ad_item, {
                proj_item_type: emPropType.v_rocket,
                proj_level: currLevel,
                proj_ad_status: emAdStatus.WakeUp
            });
            this.isWatching = true;
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Block_Unlock_Rocket_V)
                .then((res) => {
                    this.isWatching = false;
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    UserVRocketData.inst.addItem(1, false);
                    mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.v_rocket,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Finished
                    });
                    PanelManager.inst.addPopUpView(cfg.path, emPropType.v_rocket);
                })
                .catch((err: dtSdkError) => {
                    this.isWatching = false;
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                        mk.sdk.instance.reportBI(biEventId.ad_item, {
                            proj_item_type: emPropType.v_rocket,
                            proj_level: currLevel,
                            proj_ad_status: emAdStatus.Closed
                        });
                        return;
                    }
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.v_rocket,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Error
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                });
        }
    }
    onClickPropHRocket() {
        let currLevel = -1;
        if (SceneMode.gameMode != kGameMode.endless) {
            currLevel = AdventureLevelGame.levlInstance.getLevelId();
        } else {
            if (UserData.inst.getThisRoundUsedHRocketCount() >= RemoteConfig.getInstance().RoundUsedHRocketMaxCount) {
                SdkManager.getInstance().native.showToast("该道具使用次数已达上限");
                return;
            }
        }
        let num = UserHRocketData.inst.itemCount;
        let cfg = AssetInfoDefine.prefab.useProp;
        if (num > 0) {
            PanelManager.inst.addPopUpView(cfg.path, emPropType.h_rocket);
        } else {
            if (this.isWatching) {
                return;
            }
            // 打点广告_使用道具
            mk.sdk.instance.reportBI(biEventId.ad_item, {
                proj_item_type: emPropType.h_rocket,
                proj_level: currLevel,
                proj_ad_status: emAdStatus.WakeUp
            });
            this.isWatching = true;
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Block_Unlock_Rocket_H)
                .then((res) => {
                    this.isWatching = false;
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    UserHRocketData.inst.addItem(1, false);
                    mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.h_rocket,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Finished
                    });
                    PanelManager.inst.addPopUpView(cfg.path, emPropType.h_rocket);
                })
                .catch((err: dtSdkError) => {
                    this.isWatching = false;
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                        mk.sdk.instance.reportBI(biEventId.ad_item, {
                            proj_item_type: emPropType.h_rocket,
                            proj_level: currLevel,
                            proj_ad_status: emAdStatus.Closed
                        });
                        return;
                    }
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.h_rocket,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Error
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                });
        }
    }

    onClickPropRefresh() {
        let currLevel = -1;
        if (SceneMode.gameMode != kGameMode.endless) {
            currLevel = AdventureLevelGame.levlInstance.getLevelId();
        } else {
            if (UserData.inst.getThisRoundUsedRefreshCount() >= RemoteConfig.getInstance().RoundUsedRefreshMaxCount) {
                SdkManager.getInstance().native.showToast("该道具使用次数已达上限");
                return;
            }
        }
        let num = UserChangeData.inst.itemCount;
        if (num > 0) {
            mk.sendEvent(BlockEventType.EVENT_USE_ITEM_REFRESHBLOCK);
        } else {
            if (this.isWatching) {
                return;
            }
            // 打点广告_使用道具
            mk.sdk.instance.reportBI(biEventId.ad_item, {
                proj_item_type: emPropType.refresh_block,
                proj_level: currLevel,
                proj_ad_status: emAdStatus.WakeUp
            });
            this.isWatching = true;
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Block_Unlock_Refresh)
                .then((res) => {
                    this.isWatching = false;
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.refresh_block,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Finished
                    });
                    mk.sendEvent(BlockEventType.EVENT_USE_ITEM_REFRESHBLOCK);
                })
                .catch((err: dtSdkError) => {
                    this.isWatching = false;
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                        mk.sdk.instance.reportBI(biEventId.ad_item, {
                            proj_item_type: emPropType.refresh_block,
                            proj_level: currLevel,
                            proj_ad_status: emAdStatus.Closed
                        });
                        return;
                    }
                    mk.sdk.instance.reportBI(biEventId.ad_item, {
                        proj_item_type: emPropType.refresh_block,
                        proj_level: currLevel,
                        proj_ad_status: emAdStatus.Error
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                });
        }
    }

    protected onDestroy(): void {
        AdventureLevelGame.levlInstance.destroy();
    }
}
