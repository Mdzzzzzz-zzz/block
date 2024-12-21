import { _decorator, Node, Label, Sprite, AnimationClip, Animation } from "cc";
import { mk } from "../../../../MK";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { emSceneName } from "../scene/SceneDefine";
import { SceneManager } from "../scene/SceneManager";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { AdSdk } from "../../../../sdk/AdSdk";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { emSharePath, emShareType } from "../../../../sdk/wechat/SocialDef";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { Util } from "../logic/Util";
import AdventureLevelGameOver from "../LevelAdventure/AdventureLevelGameOver";
import { emAdPath } from "../../../../sdk/emAdPath";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { biEventId } from "../../../../Boot";
import { emAdStatus } from "../../../../define/BIDefine";
import { BIEventID } from "../../../../define/BIDefine";
import { emButtonType } from "../../../../define/BIDefine";
import { emButtonScene } from "../../../../define/BIDefine";
import { Global } from "db://assets/script/data/Global";
import { ResManager } from "db://assets/script/resource/ResManager";

const { ccclass, property } = _decorator;

@ccclass("DailyChallengeLevelGameOver")
export default class DailyChallengeLevelGameOver extends AdventureLevelGameOver {
    private isWatching: boolean = false;
    private adHereFailLoadTimes: number = 0;

    start() {
        super.start();
        UserDailyChallengeData.inst.setHasPlayedDailyChallengeToday(1);
    }
    onClickBack() {
        SceneMode.gameMode = kGameMode.none;
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.daily_challenge,
            proj_scene: emButtonScene.from_daily_challenge_fail,
        });

        this.closeSelf();
        SceneManager.inst
            .gotoScene(emSceneName.DailyChallengeHome, "block")
            .then(() => {
                //console.log("[DailyChallengeLevelGamePass] go to scene success");   
            })
            .catch(() => {
                //console.log("[DailyChallengeLevelGamePass] go to scene fail");
            });
    }

    onClickRetry() {
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.daily_challenge_restart,
            proj_scene: emButtonScene.from_daily_challenge_fail,
        });
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        if (this.adHereFailLoadTimes > Global.maxAdBeforeShare) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            let startTime = new Date().getTime();
            WechatMiniApi.getInstance().showShare(
                randomShowOffNum,
                emSharePath.revive,
                this,
                () => {
                    UserDailyChallengeData.inst.setHasPlayedDailyChallengeToday(0);
                    this.retryLevel();
                },
                {},
                () => {
                    console.log("failed to share");
                    Util.showShareFailedHint();
                }
            );
        } else {
            let count = UserDailyChallengeData.inst.getTodayWatchAdStartGameCount();
            UserDailyChallengeData.inst.setTodayWatchAdStartGameCount(count + 1);
            // 打点广告_开始每日挑战
            mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                proj_scene: 13,
                proj_begin_num: count,
                proj_ad_status: emAdStatus.WakeUp
            });

            AdSdk.inst
                .showRewardVideoAd(emAdPath.Daily_Challenge_Relife)
                .then((res) => {
                    mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                        proj_scene: 13,
                        proj_begin_num: count,
                        proj_ad_status: emAdStatus.Finished
                    });
                    this.isWatching = false;
                    UserDailyChallengeData.inst.setHasPlayedDailyChallengeToday(0);
                    this.retryLevel();
                })
                .catch((err: dtSdkError) => {
                    this.isWatching = false;
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                        mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                            proj_scene: 13,
                            proj_begin_num: count,
                            proj_ad_status: emAdStatus.Closed
                        });
                        return;
                    } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                        mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                            proj_scene: 13,
                            proj_begin_num: count,
                            proj_ad_status: emAdStatus.Error
                        });
                        this.adHereFailLoadTimes += 1;
                        this.refreshRetryState();
                    }
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                });
        }
    }

    retryLevel() {
        this.manager.retryCurrentLevel();
        this.closeSelf();
    }

    refreshRetryState() {
        if (this.adHereFailLoadTimes > Global.maxAdBeforeShare) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    this.restartSign.node.active = true;
                    this.restartSign.spriteFrame = sprite;
                });
        } else {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    this.restartSign.node.active = true;
                    this.restartSign.spriteFrame = sprite;
                });
        }
    }
}
