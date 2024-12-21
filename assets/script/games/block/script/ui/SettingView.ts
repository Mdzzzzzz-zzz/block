import { _decorator, Toggle, Node, Scene, Sprite, Animation } from "cc";
import { mk } from "../../../../MK";
import { SettingData } from "../../../../data/SettingData";
import { UserData } from "../../../../data/UserData";
import PanelBase from "../../../../panel/PanelBase";
import { AdSdk } from "../../../../sdk/AdSdk";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { Game } from "../logic/Game";
import { ResManager } from "../../../../resource/ResManager";
import { sys } from "cc";
import { biEventId } from "../../../../Boot";
import { LanguageManager } from "../../../../data/LanguageManager";
import { emAdStatus } from "../../../../define/BIDefine";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { emAdPath } from "../../../../sdk/emAdPath";
import { BIEventID, emButtonScene, emButtonType, emScene } from "../../../../define/BIDefine";
import { audioManager } from "../../../../util/MKAudio";
import { ToastManager } from "../../../../toast/ToastManager";
import { EndlessProgressHelper } from "../logic/EndlessProgressHelper";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { BlockEventType } from "../define/Event";
import * as env from "cc/env"
import { Util } from "../logic/Util";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { UserLevelData } from "db://assets/script/data/UserLeveData";
import { Global } from "db://assets/script/data/Global";
const { ccclass, property } = _decorator;

@ccclass("SettingView")
export class SettingView extends PanelBase<Game> {
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    @property(Node)
    ndToggleEffect: Node = null;
    // @property(Node)
    // ndEffectGuan: Node = null;

    @property(Node)
    ndToggleMusic: Node = null;
    // @property(Node)
    // ndMusciGuan: Node = null;

    @property(Node)
    ndToggleTurble: Node = null;

    @property(Node)
    ndToggleTurbleCamera: Node = null;

    @property(Node)
    ndBtnReport: Node = null;

    @property(Sprite)
    retryShareSign: Sprite = null;

    private togEffect: Toggle;
    private togMusic: Toggle;
    private togTurble: Toggle;
    private togTurbleCamera: Toggle;

    private adFailLoadTimes: number = 0;
    private lastRetryTime: number = 0;

    start() {
        this.node.getComponent(Animation).play("settingview_enter")
        if (this.ndToggleEffect) {
            this.togEffect = this.ndToggleEffect.getComponent(Toggle);
            if (this.togEffect) {
                if (SettingData.inst.isMuteEffect == 1) {
                    this.togEffect.isChecked = false;
                } else {
                    this.togEffect.isChecked = true;
                }
            }
        }
        if (this.ndToggleMusic) {
            this.togMusic = this.ndToggleMusic.getComponent(Toggle);
            if (this.togMusic) {
                if (SettingData.inst.isMuteMusic == 1) {
                    this.togMusic.isChecked = false;
                } else {
                    this.togMusic.isChecked = true;
                }
            }
        }

        if (this.ndToggleTurble) {
            this.togTurble = this.ndToggleTurble.getComponent(Toggle);
            if (this.togTurble) {
                if (SettingData.inst.isOpenShake == 1) {
                    this.togTurble.isChecked = true;
                } else {
                    this.togTurble.isChecked = false;
                }
            }
        }

        if (this.ndToggleTurbleCamera) {
            this.togTurbleCamera = this.ndToggleTurbleCamera.getComponent(Toggle);
            if (this.togTurbleCamera) {
                if (SettingData.inst.isOpenShakeCamera == 1) {
                    this.togTurbleCamera.isChecked = true;
                } else {
                    this.togTurbleCamera.isChecked = false;
                }
            }
        }
        this.refreshRetryState();
        // AdSdk.inst.hideMainPageBannerAd();
        // AdSdk.inst.showPopBannerAd();
        // director.preloadScene("level_select", () => {});
    }

    refreshRetryState() {
        if (SceneMode.gameMode == kGameMode.endless) {
            let freeTimes = UserData.inst.getClassicPlayNumToday;
            let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

            if (freeTimes < maxFreeTimes - 1) {
                this.retryShareSign.node.active = false;
            } else if ((UserData.inst.getCanShareReplay() && UserData.inst.getAccountShareCount() > 0 && (env.PREVIEW || env.EDITOR || env.WECHAT)) || this.adFailLoadTimes > Global.maxAdBeforeShare) {
                ResManager.getInstance()
                    .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                    .then((sprite) => {
                        this.retryShareSign.node.active = true;
                        this.retryShareSign.spriteFrame = sprite;
                    });
            } else {
                ResManager.getInstance()
                    .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                    .then((sprite) => {
                        this.retryShareSign.node.active = true;
                        this.retryShareSign.spriteFrame = sprite;
                    });
            }
        } else if (SceneMode.gameMode == kGameMode.daily_challenge) {
            this.retryShareSign.node.active = true;
        } else if (SceneMode.gameMode == kGameMode.adventure_level) {
            if (UserAdventureLevelData.inst.getHistoryLevel() > 5) {
                let retryTimes = UserAdventureLevelData.inst.getLevelStartTimesByDay();
                console.log("[SettingView] view retryTimes = ", retryTimes);
                if (retryTimes > 0) {
                    if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                        ResManager.getInstance()
                            .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                            .then((sprite) => {
                                this.retryShareSign.node.active = true;
                                this.retryShareSign.spriteFrame = sprite;
                            });
                    } else {
                        ResManager.getInstance()
                            .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                            .then((sprite) => {
                                this.retryShareSign.node.active = true;
                                this.retryShareSign.spriteFrame = sprite;
                            });
                    }
                    this.retryShareSign.node.active = true;
                }
            } else {
                this.retryShareSign.node.active = false;
            }
        } else if (SceneMode.gameMode == kGameMode.level) {
            if (UserLevelData.inst.getHistoryLevel() > 5) {
                this.retryShareSign.node.active = true;
            } else {
                this.retryShareSign.node.active = false;
            }
        } else {
            this.retryShareSign.node.active = false;
        }
    }
    onEffectToggleChange(toggle: Toggle, customEventData) {
        if (toggle.isChecked) {
            // this.ndEffectGuan.active = false;
            SettingData.inst.isMuteEffect = 0;
            mk.audio.playSubSound(AssetInfoDefine.audio.touch);
            // SoundManager.getInstance().resumeAllEffect();
        } else {
            mk.audio.playSubSound(AssetInfoDefine.audio.touch);
            // this.ndEffectGuan.active = true;
            SettingData.inst.isMuteEffect = 1;
            // SoundManager.getInstance().muteAllEffect();
        }
        // if(env.PREVIEW||env.EDITOR){
        //   console.log("BGM 设置：",SettingData.inst.isMuteEffect);
        // }
    }

    onMusicToggleChange(toggle: Toggle, customEventData) {
        if (toggle.isChecked) {
            mk.audio.playSubSound(AssetInfoDefine.audio.touch);
            // this.ndMusciGuan.active = false;
            SettingData.inst.isMuteMusic = 0;
            audioManager.instance.changeMusic(AssetInfoDefine.audio.block_game_bgm, true);
            audioManager.instance.playMusic(true);
            // SoundManager.getInstance().resumeAllMusic();
        } else {
            // this.ndMusciGuan.active = true;
            SettingData.inst.isMuteMusic = 1;
            audioManager.instance.stopMusic();
            // SoundManager.getInstance().muteAllMusic();
        }
        // if(env.PREVIEW||env.EDITOR){
        //   console.log("BGM 设置：",SettingData.inst.isMuteMusic);
        // }
    }

    onTurbleToggleChage(toggle: Toggle, customEventData) {
        if (toggle.isChecked) {
            mk.audio.playSubSound(AssetInfoDefine.audio.touch);
            // this.ndMusciGuan.active = false;
            SettingData.inst.isOpenShake = 1;
            // SoundManager.getInstance().resumeAllMusic();
        } else {
            // this.ndMusciGuan.active = true;
            SettingData.inst.isOpenShake = 0;
            // SoundManager.getInstance().muteAllMusic();
        }
    }

    onTurbleCameraToggleChage(toggle: Toggle, customEventData) {
        if (toggle.isChecked) {
            mk.audio.playSubSound(AssetInfoDefine.audio.touch);
            // this.ndMusciGuan.active = false;
            SettingData.inst.isOpenShakeCamera = 1;
            // SoundManager.getInstance().resumeAllMusic();
        } else {
            // this.ndMusciGuan.active = true;
            SettingData.inst.isOpenShakeCamera = 0;
            // SoundManager.getInstance().muteAllMusic();
        }
    }

    wxShareResumeGame() {
        if (env.PREVIEW || env.EDITOR || env.WECHAT) {
            let randomShowOffNum = Util.generateRandomShowOffShare();
            let startTime = new Date().getTime();
            Util.shareMsg(
                randomShowOffNum,
                emSharePath.start_game,
                this,
                () => {
                    let endTime = new Date().getTime();
                    console.log("tryShareRevive start time = " + startTime);
                    console.log("tryShareRevive end time = " + endTime);
                    if ((endTime - startTime) > 2000) {
                        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                        UserData.inst.setPlayClassicTimesToday();
                        this.retry();
                        let count = UserData.inst.getAccountShareCount();
                        UserData.inst.setAccountShareCount(count - 1);
                    } else {
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);
                        this.refreshRetryState();
                    }
                },
                {},
                () => {
                    Util.showShareFailedHint();
                    UserData.inst.setTryShareRePlayToday(0);
                    this.refreshRetryState();
                    return;
                }
            );
        } else {

        }

        this.refreshRetryState();
    }


    onClickRetry() {

        if (SceneMode.gameMode == kGameMode.endless) {
            let freeTimes = UserData.inst.getClassicPlayNumToday;
            let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

            if (freeTimes < maxFreeTimes - 1) {
                UserData.inst.setPlayClassicTimesToday();
                this.retry();
                this.refreshUsedItemCount();
            } else if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                let randomShowOffNum = Util.generateRandomShowOffShare();
                Util.shareMsg(
                    randomShowOffNum,
                    emSharePath.start_game,
                    this,
                    () => {
                        this.retry();
                    },
                    {},
                    () => {
                        console.log("failed to share");
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);
                        return;
                    }
                );
            } else {
                AdSdk.inst
                    .showRewardVideoAd(emAdPath.Score_Relife)
                    .then((res) => {
                        this.retry();
                    })
                    .catch((err: dtSdkError) => {
                        console.log("dtSdkError ", JSON.stringify(err));
                        if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                            SdkManager.getInstance().native.showToast(
                                LanguageManager.translateText("tip_not_finish_watch")
                            );
                            // TODO: emit event to trigger panel view
                            return;
                        } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                            SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                            this.adFailLoadTimes += 1;
                            this.refreshBtnState();
                        }
                    });
            }
        } else if (SceneMode.gameMode == kGameMode.daily_challenge) {

            mk.sdk.instance.reportBI(BIEventID.btn_click, {
                proj_btn_type: emButtonType.daily_challenge_restart,
                proj_scene: emButtonScene.from_settings,
            });

            if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                let randomShowOffNum = Util.generateRandomShowOffShare();
                Util.shareMsg(
                    randomShowOffNum,
                    emSharePath.start_game,
                    this,
                    () => {
                        this.retry();
                    },
                    {},
                    () => {
                        console.log("failed to share");
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);
                        return;
                    }
                );
            } else {
                AdSdk.inst
                    .showRewardVideoAd(emAdPath.Score_Relife)
                    .then((res) => {
                        this.retry();
                    })
                    .catch((err: dtSdkError) => {
                        console.log("dtSdkError ", JSON.stringify(err));
                        if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                            SdkManager.getInstance().native.showToast(
                                LanguageManager.translateText("tip_not_finish_watch")
                            );
                            // TODO: emit event to trigger panel view
                            return;
                        } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                            SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                            this.adFailLoadTimes += 1;
                            this.refreshBtnState();
                        }
                    });
            }
        } else if (SceneMode.gameMode == kGameMode.adventure_level) {
            if (UserAdventureLevelData.inst.getHistoryLevel() > 5) {
                if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                    let randomShowOffNum = Util.generateRandomShowOffShare();
                    Util.shareMsg(
                        randomShowOffNum,
                        emSharePath.start_game,
                        this,
                        () => {
                            this.retry();
                        },
                        {},
                        () => {
                            console.log("failed to share");
                            Util.showShareFailedHint();
                            UserData.inst.setTryShareRePlayToday(0);
                            return;
                        }
                    );
                } else {
                    AdSdk.inst
                        .showRewardVideoAd(emAdPath.Score_Relife)
                        .then((res) => {
                            this.retry();
                        })
                        .catch((err: dtSdkError) => {
                            console.log("dtSdkError ", JSON.stringify(err));
                            if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                                SdkManager.getInstance().native.showToast(
                                    LanguageManager.translateText("tip_not_finish_watch")
                                );
                                // TODO: emit event to trigger panel view
                                return;
                            } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                                this.adFailLoadTimes += 1;
                                this.refreshBtnState();
                            }
                        });
                }
            } else {
                this.retry();
            }
        } else if (SceneMode.gameMode == kGameMode.level) {
            if (UserLevelData.inst.getHistoryLevel() > 5) {
                if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                    let randomShowOffNum = Util.generateRandomShowOffShare();
                    Util.shareMsg(
                        randomShowOffNum,
                        emSharePath.start_game,
                        this,
                        () => {
                            this.retry();
                        },
                        {},
                        () => {
                            console.log("failed to share");
                            Util.showShareFailedHint();
                            UserData.inst.setTryShareRePlayToday(0);
                            return;
                        }
                    );
                } else {
                    AdSdk.inst
                        .showRewardVideoAd(emAdPath.Score_Relife)
                        .then((res) => {
                            this.retry();
                        })
                        .catch((err: dtSdkError) => {
                            console.log("dtSdkError ", JSON.stringify(err));
                            if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                                SdkManager.getInstance().native.showToast(
                                    LanguageManager.translateText("tip_not_finish_watch")
                                );
                                // TODO: emit event to trigger panel view
                                return;
                            } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                                this.adFailLoadTimes += 1;
                                this.refreshBtnState();
                            }
                        });
                }
            } else {
                this.retry();
            }
        }
        else {
            this.retry();
        }



    }

    refreshBtnState() {
        if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    this.retryShareSign.node.active = true;
                    this.retryShareSign.spriteFrame = sprite;
                });
        } else {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    this.retryShareSign.node.active = true;
                    this.retryShareSign.spriteFrame = sprite;
                });
        }
    }
    DoAdRetry(callback: () => void) {
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Score_Relife)
            .then((res) => {
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                callback && callback();
                this.retry();
            })
            .catch((err: dtSdkError) => {
                console.log("settingView dtSdkError ", JSON.stringify(err));
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {

                    SdkManager.getInstance().native.showToast(
                        LanguageManager.translateText("tip_not_finish_watch")
                    );
                    mk.sdk.instance.reportBI(biEventId.ad_begin, {
                        proj_scene: emScene.setting_scene,
                        proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                        proj_ad_status: emAdStatus.Closed
                    });
                    // TODO: emit event to trigger panel view
                    return;
                } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                    this.adFailLoadTimes += 1;
                    this.refreshRetryState();
                }
                mk.sdk.instance.reportBI(biEventId.ad_begin, {
                    proj_scene: emScene.setting_scene,
                    proj_begin_num: UserData.inst.getTodayWatchAdStartGameCount(),
                    proj_ad_status: emAdStatus.Error
                });
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                // TODO: emit event to trigger panel view
                return;
            });
    }

    retry() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        // console.log(
        //     "[click_button] btn_click " + emButtonType.click_settings_replay + " " + emButtonScene.from_settings
        // );
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.click_settings_replay,
            proj_scene: emButtonScene.from_settings,
        });
        if (SceneMode.gameMode == kGameMode.endless) {
            EndlessProgressHelper.getInstance().resetReachPercent();
            EndlessProgressHelper.getInstance().resetProgressBar();
            EndlessProgressHelper.getInstance().resetReachEnhance();
            // this.node.destroy();
            UserData.inst.setCanOpenTreasureChestThisGame(1);
            let remainCount = UserData.inst.getClassicTreasureChestCount();
            console.log("[SettingView] get remain count = ", remainCount);
            remainCount = remainCount - 1;
            if (remainCount >= 0) {
                UserData.inst.setClassicTreasureChestCount(remainCount);
                console.log("[SettingView] set remain count = ", remainCount);
            }
        }
        mk.sendEvent(mk.eventType.ON_TOUCH_START); // 模拟点击盘面，重置AI提示
        this.data && this.data.retryCurrentLevel();
        mk.sendEvent(BlockEventType.EVENT_SCORE_PROGRESS_POST_OPENCONTEXT);
        this.closeSelf();
        // UserData.inst.replayTimes++;
        // if (UserData.inst.replayTimes > 3) {
        //     AdSdk.inst.showInsterstital("SettingViewRetry");
        // }
    }

    private isLoadingScene: boolean = false;
    onClickHome() {
        // console.log("[click_button] btn_click " + emButtonType.click_settings_home + " " + emButtonScene.from_settings);
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.click_settings_home,
            proj_scene: emButtonScene.from_settings,
        });
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        this.node.getComponent(Animation).play("settingview_exit");

        if (this.isLoadingScene) {
            return;
        }
        SceneMode.gameMode = kGameMode.none;
        this.isLoadingScene = true;
        ResManager.getInstance()
            .gotoScene("home", "block")
            .then(() => {
                this.isLoadingScene = false;
                this.closeSelf();
            })
            .catch(() => {
                this.isLoadingScene = false;
            });


    }
    onDestroy(): void {
        // AdSdk.inst.hidePopBannerAd();
        // AdSdk.inst.showMainPageBannerAd("");
    }
    onClickClose() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        this.node.getComponent(Animation).play("settingview_exit");
        this.scheduleOnce(() => {
            this.closeSelf();
        }, 0.5);

    }
    onClickReport() {
        let data = {};
        for (let i = 0; i < sys.localStorage.length; i++) {
            let key = sys.localStorage.key(i);
            if (key.startsWith("GAME_SNAP_SHOT")) {
                let value = sys.localStorage.getItem(key);
                data[key] = value;
                data["userId"] = mk.utils.deviceId();
                mk.sdk.instance.reportBI(key, data);
                console.log("上传无尽模式数据");
            } else if (key.startsWith("LEVEL_GAME_SNAP_SHOT")) {
                let value = sys.localStorage.getItem(key);
                data[key] = value;
                data["userId"] = mk.utils.deviceId();
                mk.sdk.instance.reportBI(key, data);
                console.log("上传收集模式数据");
            } else if (key.startsWith("ADVENTURE_LEVEL_GAME_SNAP_SHOT")) {
                let value = sys.localStorage.getItem(key);
                data[key] = value;
                data["userId"] = mk.utils.deviceId();
                mk.sdk.instance.reportBI(key, data);
                console.log("上传冒险模式数据");
            } else if (key == "isMuteMusic" || key == "isMuteEffect") {
                let value = sys.localStorage.getItem(key);
                data[key] = value;
                data["userId"] = mk.utils.deviceId();
                mk.sdk.instance.reportBI(key, data);
                console.log("上传：", key, value);
            }
        }
        ToastManager.getInstance().showToast("上传成功");
    }
    onClickTerms() {
        sys.openURL("https://arksgame.com/terms.html");
    }
    onClickPrivacy() {
        sys.openURL("https://arksgame.com/ps.html");
    }
    private isWatching: boolean = false;
    onClickRelife() {
        if (this.isWatching) {
            return;
        }
        this.isWatching = true;
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Level_Relife)
            .then((res) => {
                this.isWatching = false;
                mk.audio.playSubSound(AssetInfoDefine.audio.touch);
            })
            .catch((err: dtSdkError) => {
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                    return;
                }
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }

    refreshUsedItemCount() {
        UserData.inst.setThisRoundUsedHammerCount(0);
        UserData.inst.setThisRoundUsedVRocketCount(0);
        UserData.inst.setThisRoundUsedHRocketCount(0);
        UserData.inst.setThisRoundUsedRefreshCount(0);
        mk.sendEvent(BlockEventType.EVENT_REFRESH_ITEM_NUM, SceneMode.gameMode == kGameMode.endless);
    }
    // update (dt) {}
}
