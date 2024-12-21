import { Component, _decorator, tween, Vec3, Node, v3, Sprite } from "cc";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { audioManager } from "../../../../util/MKAudio";
import { BIEventID, emButtonType, emButtonScene } from "../../../../define/BIDefine";
import { ProcedureToHome } from "../../../../fsm/state/ProcedureToHome";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { mk } from "../../../../MK";
import { PanelManager } from "../../../../panel/PanelManager";
import { emEnterAlbumFrom } from "../../../../define/BIDefine";
import { ProcedureToDailyChallenge } from "../../../../fsm/state/ProcedureToDailyChallenge";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { ProgressBar } from "cc";
import { ProcedureToDailyChallengeHome } from "../../../../fsm/state/ProcedureToDailyChallengeHome";
import { Util } from "../logic/Util";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { emAdPath } from "../../../../sdk/emAdPath";
import { AdSdk } from "../../../../sdk/AdSdk";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { UITweenBarComponent } from "../../../../tween/UITweenBarComponent";
import { AlbumData, ChallengeAlbumConfig } from "../../../../data/AlbumData";
import { biEventId } from "../../../../Boot";
import { emAdStatus } from "../../../../define/BIDefine";
import { Global } from "../../../../data/Global";
import { ProcedureToEntryGuide } from "../../../../fsm/state/ProcedureToEntryGuide";
import { ResManager } from "db://assets/script/resource/ResManager";
const { ccclass, property } = _decorator;

@ccclass("SceneDailyChallengeHome")
export class SceneDailyChallengeHome extends Component {

    @property(Node)
    StartButton: Node = null;
    @property(Node)
    Completed: Node = null;
    @property(Node)
    PlayButtonAdIcon: Node = null;

    @property(Node)
    guideHand: Node;

    @property(Node)
    progress: Node;

    playProgressAnim: boolean = false;
    adFailLoadTimes: number = 0;
    isWatching: boolean = false;

    isAnimTargetReached: boolean = false;
    isProgressStarTargetReached: boolean = false; // reached 1,3,6 ....
    animStarted = false;

    currProgress: number = 0;
    desireProgress: number = 0;
    starProgress: ProgressBar;
    progressBarAnimIndex: number = 0;
    useDate: Date = new Date();
    starCount: number = 0;
    @property(Sprite)
    adsSprite: Sprite = null;

    start() {
        this.useDate = UserDailyChallengeData.inst.getDate();
        // TODO 非测试场景时，每次打开时候更新dailyChallenge日期
        // UserDailyChallengeData.inst.setDate(new Date());
        UserDailyChallengeData.inst.checkIfReset();

        if (mk.fsm.getData(ProcedureToDailyChallengeHome, "defaultKey") == "Ani") {
            this.playProgressAnim = true;
        }

        let isCompletedToday = UserDailyChallengeData.inst.getChallengeProgressByDay(this.useDate.getDate());
        if (isCompletedToday == 0) {
            this.StartButton.active = true;
            this.Completed.active = false;
        } else {
            this.StartButton.active = false;
            this.Completed.active = true;
        }

        audioManager.instance.changeMusic(AssetInfoDefine.audio.tmp_bgm, true);
        let cPos = new Vec3(200, -80, 0);
        tween(this.guideHand)
            .repeatForever(
                tween()
                    .to(
                        0.5,
                        { position: new Vec3(175, -55, 0) },
                        {
                            easing: "circOut",
                        }
                    )
                    .to(0.5, { position: cPos }, { easing: "circOut" })
            )
            .start();



        this.PlayButtonAdIcon.active = false;
        if (UserDailyChallengeData.inst.getHasPlayedDailyChallengeToday() != 0) {
            this.PlayButtonAdIcon.active = true;
        }
        this.setStarProgressBar();
    }

    setStarProgressBar() {
        let currStars = UserDailyChallengeData.inst.getFinishedDays();
        this.starCount = currStars;

        let progressBarPath = "ProgressBars/ProgressBar";
        for (let i = 1; i <= 6; i++) {
            let pb = this.progress.getChildByPath(progressBarPath + i);
            let comp = pb.getComponent(ProgressBar);
            comp.progress = 0;
        }
        if (currStars > 24) {
            this.playProgressAnim = false;
        }
        if (currStars == 0) {
            return;
        }



        let completed = 0;
        let arr = UserDailyChallengeData.inst.getStarObtained();

        let path = "Node";
        let path2 = "Text/NodeLabel"

        for (let i = 0; i < arr.length; i++) {
            if (currStars >= arr[i]) {
                completed++;
                if (currStars == arr[i] && this.playProgressAnim) {
                    this.isProgressStarTargetReached = true;
                } else {
                    this.isProgressStarTargetReached = false;
                    let ii = i + 1;
                    let completedNode = this.progress.getChildByPath(path + ii + "/Completed");
                    completedNode.active = true;
                    completedNode.scale = v3(1, 1, 1);
                    let textNode = this.progress.getChildByPath(path2 + ii);
                    textNode.active = false;
                    let pb = this.progress.getChildByPath(progressBarPath + ii);
                    pb.getComponent(ProgressBar).progress = 1;
                }
            }
        }

        this.progressBarAnimIndex = completed;
        let lastScore = 0;
        let nextScore = 0
        let scoreDiff = 1;
        if (completed == 1 && this.isProgressStarTargetReached) {
            this.desireProgress = 0.99;
        } else if (this.starCount == 1) {
            this.desireProgress = 0;
        } else {
            lastScore = arr[completed - 1]
            nextScore = arr[completed]
            scoreDiff = nextScore - lastScore;
            this.desireProgress = (currStars - lastScore) / scoreDiff;
        }

        if (this.isProgressStarTargetReached) {
            this.desireProgress = 0.99;
            if (currStars > 2) {
                lastScore = arr[completed - 1 - 1]
                nextScore = arr[completed - 1]
                scoreDiff = nextScore - lastScore;
            }
        }

        if (currStars < 24) {
            let pbnode = this.progress.getChildByPath(progressBarPath + (completed + 1));


            let pb = pbnode.getComponent(ProgressBar);
            this.starProgress = pb;
            this.currProgress = pb.progress;
        }
        let num = 0;
        if (currStars < 24) {
            let pbnode2 = this.progress.getChildByPath(progressBarPath + (completed + 1));
            let pb2 = pbnode2.getComponent(ProgressBar);
            let num = ((currStars - 1) - lastScore) / scoreDiff;
            if (num < 0) {
                num = 0;
            }
        }
        // pb.progress = num;
        // pb2.progress = num;
        if (currStars < 24) {
            if (this.playProgressAnim) {
                //pb2.progress = num;
                this.currProgress = num;
            }
        }
        if (this.playProgressAnim && !this.isProgressStarTargetReached) {

            // this.currProgress = pb.progress;
            //this.desireProgress = 0.5;
            this.progressBarAnimIndex = completed + 1;
        } else if (!this.playProgressAnim) {
            let pbnode = this.progress.getChildByPath(progressBarPath + (completed + 1));
            let pb = pbnode.getComponent(ProgressBar);
            pb.progress = this.desireProgress;

            for (let i = 1; i <= completed; i++) {
                let pbnode = this.progress.getChildByPath(progressBarPath + i);
                let pb = pbnode.getComponent(ProgressBar);
                pb.progress = 1;
            }
        }

        if (this.playProgressAnim && currStars == 24) {
            this.progressBarAnimIndex = 6;
            this.currProgress = 0.89;
            this.desireProgress = 0.999;
        }
        this.animStarted = true;
    }

    protected update(dt: number): void {
        if (this.isAnimTargetReached) {
            return;
        }
        if (!this.playProgressAnim) {
            return;
        }
        if (!this.animStarted) {
            return;
        }

        let targetProgress = this.currProgress + dt * 0.5;
        this.currProgress = targetProgress;
        if (targetProgress > 0.99) {
            targetProgress = 0.99;
        }

        if (targetProgress > this.desireProgress) {
            targetProgress = this.desireProgress
        }
        // if (this.currProgress >= this.desireProgress) {
        //     this.isUpdateStarProgress = false;
        // }
        let progressBarPath = "ProgressBars/ProgressBar";
        let pbnode = this.progress.getChildByPath(progressBarPath + this.progressBarAnimIndex);


        let pb = pbnode.getComponent(ProgressBar);
        if (pb.progress > this.desireProgress) {
            this.isAnimTargetReached = true;
            this.onProgressBarMovementAnimFinished();
        }
        UITweenBarComponent.Begin(pb, this.currProgress, targetProgress, 0.3, 0, () => {
            //this.onBarAnimFinish();
        });
    }
    onProgressBarMovementAnimFinished() {
        if (this.isProgressStarTargetReached) {

            let path = "Node";
            let path2 = "Text/NodeLabel"
            let ii = this.progressBarAnimIndex;
            path = path + ii + "/Completed";
            let completedNode = this.progress.getChildByPath(path);
            completedNode.active = true;
            completedNode.scale = v3(1, 1, 1);
            path2 = path2 + ii;
            let textNode = this.progress.getChildByPath(path2);
            textNode.active = false;

            let d = UserDailyChallengeData.inst.getDate();
            let currId = ChallengeAlbumConfig.calculateIdByMonth(d.getFullYear(), d.getMonth(), UserDailyChallengeData.inst.getCalculatedStarObtained().count);
            // AlbumData.inst.setChallengeStickerStatusById(currId, emStageStickerStatus.obtained);
            PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.stickerRewardView.path,
                { id: currId }
            );
        }
    }
    onClickHome() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToHome, "daily_challenge_select");
    }

    onClickDailyChallenge() {
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.daily_challenge_start,
            proj_scene: emButtonScene.from_daily_challenge_choose_level,
        });
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        // 首先检查是否需要展示新手引导
        if (UserDailyChallengeData.inst.firstDailyChallengeFinish == 0) {
            SceneMode.gameMode = kGameMode.daily_challenge;
            mk.fsm.changeState(ProcedureToEntryGuide, { source: "dailyChallenge", batch: 1 }); // 1 不作数
            return;
        }

        if (UserDailyChallengeData.inst.getHasPlayedDailyChallengeToday() != 0) {
            if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                let randomShowOffNum = Util.generateRandomShowOffShare();
                Util.shareMsg(
                    randomShowOffNum,
                    emSharePath.start_game,
                    this,
                    () => {
                        UserDailyChallengeData.inst.setHasPlayedDailyChallengeToday(0);
                        SceneMode.gameMode = kGameMode.daily_challenge;
                        mk.fsm.changeState(ProcedureToDailyChallenge, "block");
                        return;
                    },
                    {},
                    () => {
                        Util.showShareFailedHint();
                    }
                );
            }

            if (this.isWatching) {
                return;
            }
            this.isWatching = true;

            let count = UserDailyChallengeData.inst.getTodayWatchAdStartGameCount();
            UserDailyChallengeData.inst.setTodayWatchAdStartGameCount(count + 1);
            // 打点广告_开始每日挑战
            mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                proj_scene: 11,
                proj_begin_num: count,
                proj_ad_status: emAdStatus.WakeUp
            });

            AdSdk.inst
                .showRewardVideoAd(emAdPath.Daily_Challenge_Relife)
                .then((res) => {
                    this.isWatching = false;
                    mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                        proj_scene: 11,
                        proj_begin_num: count,
                        proj_ad_status: emAdStatus.Finished
                    });
                    UserDailyChallengeData.inst.setHasPlayedDailyChallengeToday(0);
                    SceneMode.gameMode = kGameMode.daily_challenge;
                    mk.fsm.changeState(ProcedureToDailyChallenge, "block");
                })
                .catch((err: dtSdkError) => {
                    this.isWatching = false;
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                            proj_scene: 11,
                            proj_begin_num: count,
                            proj_ad_status: emAdStatus.Closed
                        });
                        SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_not_finish_watch"));
                        return;
                    } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                        mk.sdk.instance.reportBI(biEventId.af_ad_dailybegin, {
                            proj_scene: 11,
                            proj_begin_num: count,
                            proj_ad_status: emAdStatus.Error
                        });
                        this.adFailLoadTimes += 1;
                        this.refreshBtnState();
                    }
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                });
        } else {
            SceneMode.gameMode = kGameMode.daily_challenge;
            mk.fsm.changeState(ProcedureToDailyChallenge, "block");
        }
    }
    refreshBtnState() {
        if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                .then((sprite) => {
                    this.adsSprite.node.active = true;
                    this.adsSprite.spriteFrame = sprite;
                });
        } else {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                .then((sprite) => {
                    this.adsSprite.node.active = true;
                    this.adsSprite.spriteFrame = sprite;
                });
        }

    }
    onClickSticker() {
        // Global.EnterStickerFrom = emEnterAlbumFrom.adventure_level_select;
        // mk.fsm.changeState(ProcedureToAlbum, "adventure_level_select");
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.albumBookView.path, { source: emEnterAlbumFrom.daily_challenge_home })
    }

}
