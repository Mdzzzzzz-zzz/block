/*
 * @Date: 2023-05-22 10:44:08
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-07-22 21:04:30
 */
import { _decorator, Node, ProgressBar, Sprite } from "cc";
import { AdSdk } from "../../../../sdk/AdSdk";
import { mk } from "../../../../MK";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import PanelBase from "../../../../panel/PanelBase";
import { UITweenBarComponent } from "../../../../tween/UITweenBarComponent";
import { Game } from "../logic/Game";
import { Animation } from "cc";
import { emAdStatus } from "../../../../define/BIDefine";
import { biEventId } from "../../../../Boot";
import { kGameMode } from "../define/Enumrations";
import { emAdPath } from "../../../../sdk/emAdPath";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { LevelGame } from "../logic/LevelGame";
import { AdventureLevelGame } from "../logic/AdventureLevelGame";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { emShareType, emSharePath } from "../../../../sdk/wechat/SocialDef";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { ResManager } from "../../../../resource/ResManager";
import { Util } from "../logic/Util";
import { UserData } from "../../../../data/UserData";
import { BlockEventType } from "../define/Event";
const { ccclass, property } = _decorator;

@ccclass("ReviveViewOld")
export class ReviveViewOld extends PanelBase<any> {
    @property(ProgressBar)
    timeBar: ProgressBar = null;
    @property(Node)
    timeAnim: Node = null;

    @property(Sprite)
    reviveSign: Sprite = null;

    protected manager: Game;
    protected onTimeFinish: Function;
    protected holder: any;
    protected mode: kGameMode;
    protected reviveTimes: number = 0;
    private scene: number = 2;
    start(): void {
        super.start();
        mk.sendEvent(BlockEventType.EVENT_SWITCH_SUB_CONTEXT_VIEW, false);
        if (this.timeAnim) {
            this.timeAnim.getComponent(Animation).play();
        }
        UITweenBarComponent.Begin(this.timeBar, 0, 1, 5.1, 0, () => {
            if (this && !this.isWatching && this.node && this.node.isValid) {
                this.onTimeFinish.call(this.holder);
                this.closeSelf();
            }
        }).addProgressListener((value) => {
            this.timeBar.progress = value;
        }, this);
        AdSdk.inst.showPopBannerAd();
        this.scheduleOnce(() => {
            this.refreshBtnState();
        }, 0.1);
        this.scene = 2;
        if (this.mode == kGameMode.adventure_level) {
            this.scene = 3;
            if (this.manager && (this.manager as AdventureLevelGame).checkIsLevelComplete()) {
                this.closeSelf();
                //复活检测是延迟检测 有可能误判 这里关闭下
                return;
            }
        }
        mk.sdk.instance.reportBI(biEventId.ui_revive, {
            proj_revive_operate: 1,
            proj_scene: this.scene,
        });
    }
    protected refreshBtnState() {
        if (UserData.inst.tryShareRevive(true) && UserData.inst.getAccountShareCount() > 0) {
            // TODO： 加载分享图标
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    this.reviveSign.spriteFrame = sprite;
                });
        } else {
            // TODO:  加载看广告图标
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    if (this.reviveSign) {
                        this.reviveSign.spriteFrame = sprite;
                    }

                });
        }
    }
    protected onWillClose(): void {
        super.onWillClose();
        AdSdk.inst.hidePopBannerAd();
    }
    protected onSetData(value: any): void {
        this.manager = value.manager;
        this.onTimeFinish = value.onTimeFinish;
        this.holder = value.holder;
        this.mode = value.mode;
        this.reviveTimes = value.reviveTimes;
    }
    private isWatching: boolean = false;
    onClickRelife() {
        if (this.isWatching) {
            return;
        }
        mk.sdk.instance.reportBI(biEventId.ui_revive, {
            revive_operate: 2,
            scene: this.scene,
        });
        if (this.mode == kGameMode.adventure_level) {
            if (this.manager && (this.manager as LevelGame).checkIsLevelComplete()) {
                this.closeSelf();
                //复活检测是延迟检测 有可能误判 这里关闭下
                return;
            }
        }

        if (UserData.inst.tryShareRevive(false) && UserData.inst.getAccountShareCount() > 0) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            WechatMiniApi.getInstance().showShare(
                randomShowOffNum,
                emSharePath.revive,
                this,
                () => {
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    this.manager.relifeCurrentLevel();
                    this.closeSelf();
                },
                {},
                () => {
                    console.log("failed to share");
                }
            );
            this.refreshBtnState();
            return;
        }
        mk.sdk.instance.reportBI(biEventId.ad_revivie, {
            proj_ad_status: emAdStatus.WakeUp,
            proj_scene: this.scene,
            proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
        });
        this.isWatching = true;
        AdSdk.inst
            .showRewardVideoAd(this.mode == kGameMode.adventure_level ? emAdPath.Level_Relife : emAdPath.Score_Relife)
            .then((res) => {
                this.isWatching = false;
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                this.manager.relifeCurrentLevel();
                let num = UserData.inst.getThisGameWatchReviveNum();
                UserData.inst.setThisGameWatchReviveNum(num + 1);
                this.closeSelf();
                mk.sdk.instance.reportBI(biEventId.ad_revivie, {
                    proj_ad_status: emAdStatus.Finished,
                    proj_scene: this.scene,
                    proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
                });
            })
            .catch((err: dtSdkError) => {
                this.isWatching = false;
                this.onTimeFinish.call(this.holder);
                this.closeSelf();
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    mk.sdk.instance.reportBI(biEventId.ad_revivie, {
                        proj_ad_status: emAdStatus.Closed,
                        proj_scene: this.scene,
                        proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                    return;
                }
                mk.sdk.instance.reportBI(biEventId.ad_revivie, {
                    proj_ad_status: emAdStatus.Error,
                    proj_scene: this.scene,
                    proj_revive_num: UserData.inst.getThisGameWatchReviveNum(),
                });
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }
}
