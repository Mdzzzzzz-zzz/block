import { BlockEventType } from "../define/Event";
import { Label, tween, Tween, ProgressBar, Node, Slider, v3 } from "cc";
import { _decorator, Component } from "cc";
import { mk } from "../../../../MK";
import { parseNode } from "../../../../util/MKNodeBind";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { Game } from "../logic/Game";
import { EndlessProgressHelper } from "../logic/EndlessProgressHelper";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { SdkEventType } from "../../../../minigame_sdk/scripts/SdkEventType";
import * as env from "cc/env";
import { UserData } from "../../../../data/UserData";
import { ClassicAlbumData } from "../../../../data/ClassicAlbumData";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { UserRemoteDataManager } from "../../../../data/UserRemoteDataManager";
const { ccclass, property } = _decorator;
const scoreMap = {
    1: 0,
    2: 250,
    3: 500,
    4: 750,
    5: 1000,
    6: 1000,
    7: 2000,
    8: 3000,
    9: 4000,
    10: 5000,
    11: 5000,
    12: 6000,
    13: 7000,
    14: 8000,
    15: 10000,
    16: 10000,
    17: 12000,
    18: 14000,
    19: 16000,
    20: 20000,
    21: 20000,
    22: 22000,
    23: 24000,
    24: 26000,
    25: 30000,
    // 26:30000,
    // 27:100000,
    // 28:200000,
    // 29:300000,
    // 30:500000,
};
const treasureChestScoreMapIndex: number = 5;
@ccclass("EndlessScoreView")
export class EndlessScoreView extends Component {
    @property(Label)
    historyscoreLabel: Label;
    @property(Label)
    scoreLabel: Label;
    score: number;
    maxScore: number;

    @property(ProgressBar)
    scoreProgress: ProgressBar;

    @property(Node)
    progress: Node = null;
    @property(Node)
    progressFinish: Node = null;

    @property(Label)
    target1Label: Label = null;
    @property(Label)
    target2Label: Label = null;
    @property(Label)
    target3Label: Label = null;
    @property(Label)
    target4Label: Label = null;
    @property(Label)
    target5Label: Label = null;

    @property(Node)
    target1NotCompleted: Node = null;
    @property(Node)
    target2NotCompleted: Node = null;
    @property(Node)
    target3NotCompleted: Node = null;
    @property(Node)
    target4NotCompleted: Node = null;
    @property(Node)
    target5NotCompleted: Node = null;

    @property(Node)
    target1Completed: Node = null;
    @property(Node)
    target2Completed: Node = null;
    @property(Node)
    target3Completed: Node = null;
    @property(Node)
    target4Completed: Node = null;
    @property(Node)
    target5Completed: Node = null;

    @property(Node)
    progressParticle: Node = null;
    @property(Slider)
    progressSlider: Slider = null;
    // @property(Node)
    // reachPercent: Node = null;

    @property(Node)
    subContxtView: Node = null;

    @property(Node)
    treasureChest: Node = null;

    // 测试工具
    testAddScore: number = 0;

    @property(Node)
    chestparticles1: Node = null;
    // @property(Node)
    // chestparticles2: Node = null;

    // 经典模式挑战目标分组
    endlessChallengeGroup: number = 0;


    protected gameManager: Game;
    onLoad() {
        parseNode(this);
        SceneMode.gameMode = kGameMode.endless;
        // SkinCfg.initSkinStats();
        this.score = 0;

        this.scoreProgress.progress = 0;
        this.gameManager = Game.inst;
        this.setScoreProgress(0, true);
        mk.regEvent(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.setScore, this);
        mk.regEvent(BlockEventType.EVENT_SCENE_PLAY_FLUSH_MAX_SCORE, this.flushMaxScore, this);
        mk.regEvent(BlockEventType.EVENT_SCENE_PLAY_SHOW_NEW_SCORE, this.showNewScoreAct, this);

        mk.regEvent(BlockEventType.kEvent_Game_Start, this.loadData, this);
        mk.regEvent(BlockEventType.EVENT_SCORE_PROGRESS_POST_OPENCONTEXT, this.setNextFriendScoreOpenDataContext, this);
        mk.regEvent(BlockEventType.EVENT_SWITCH_SUB_CONTEXT_VIEW, this.switchSubContextView, this);
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_SHOW,
            () => {
                this.loadData();
            },
            this
        );
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_HIDE,
            () => {
                this.hideUI();
            },
            this
        );
    }
    start() {

        // this.endlessChallengeGroup = ABTestManager.getInstance().getGroup(ABTestParam.EndlessChallenge);
        // // later this change to 1
        // if (this.endlessChallengeGroup == 1) {

        //     return;
        // }

        // if (env.WECHAT) {
        //     this.switchSubContextView(true);
        //     //检查key问题
        //     // @ts-ignore
        //     wx.getOpenDataContext().postMessage({
        //         event: "check",
        //         key: "score",
        //     });

        //     let historyData = this.gameManager.getHistoryLevelData();
        //     if (historyData) {
        //         this.gameManager.scoreHelper.setHistoryData(historyData);
        //     }
        //     this.setNextFriendScoreOpenDataContext();
        // }
        //this.SetTreasureChestIconStatus();

    }


    public switchSubContextView(status) {

        if (status == true) {
            this.scheduleOnce(() => {


                this.subContxtView.active = true;
                this.setNextFriendScoreOpenDataContext();
            }, 0.3);
        } else {
            this.subContxtView.active = false;
        }
    }
    public hideUI() {
        this.progress.active = false;
        this.progressFinish.active = false;
    }
    public loadData() {
        // this.setScoreProgress(0, true);
        this.setScoreProgress(this.gameManager.scoreHelper.score, true);

        if (EndlessProgressHelper.getInstance().progressStageNumber > 5) {
            this.progress.active = false;
            this.progressFinish.active = true;
        } else {
            this.progress.active = true;
            this.progressFinish.active = false;
        }
    }

    public initData(score: number, maxNum: number) {
        if (this.historyscoreLabel) {
            this.historyscoreLabel.string = maxNum + "";
        }
        if (this.scoreLabel) {
            this.scoreLabel.string = "" + score;
        }
        this.score = 0;
        this.maxScore = maxNum;
        this.loadData();
        //this.SetTreasureChestIconStatus();
    }

    private SetTreasureChestIconStatus() {
        this.chestparticles1.active = false;
        //this.chestparticles2.active = false;
        if (UserData.inst.getCanOpenTreasureChestThisGame() == 1 &&
            UserData.inst.getClassicTreasureChestCount() > 0 &&
            ClassicAlbumData.inst.isAllStickerObtained() == false) {
            this.treasureChest.active = true;
        } else {
            this.treasureChest.active = false;
        }
    }

    setNextFriendScoreOpenDataContext() {
        // testing code

        // later change to 1
        // if (this.endlessChallengeGroup == 1)
        //     return;

        // if (env.WECHAT && this.subContxtView) {
        //     // @ts-ignore
        //     wx.getOpenDataContext().postMessage({
        //         event: "nextFriendScore",
        //         key: "score",
        //         data: this.gameManager.scoreHelper.score,
        //         selfMaxScore: this.maxScore
        //     });
        // }
    }

    // scoreProgressPostOpenDataContext() {
    //     if (env.WECHAT) {
    //         // @ts-ignore
    //         wx.getOpenDataContext().postMessage({
    //             event: "scoreProgress",
    //             key: "score",
    //             data: this.gameManager.scoreHelper.score,
    //             seed: UserData.inst.getScoreProgressSeed(),
    //             selfMaxScore: this.maxScore
    //         });
    //     }
    // }

    // scoreProgresClearOpenDataContext() {
    //     if (env.WECHAT) {
    //         // @ts-ignore
    //         wx.getOpenDataContext().postMessage({
    //             event: "clearlayout",
    //             key: "score",
    //             data: 0,
    //         });
    //     }
    // }

    getRewardPos() {
        return this.scoreLabel.node.worldPosition;
    }

    onDestroy() {
        if (env.WECHAT) {
            // @ts-ignore
            wx.getOpenDataContext().postMessage({
                event: "clear",
            });
        }
        mk.unRegEvent(this);
    }

    // private isShowedNewRecoredScore: boolean = false;
    /**
     * @description 刷新最高分
     */
    flushMaxScore(score: number, isFirstPlay: boolean) {
        this.historyscoreLabel.string = "" + score;
        UserRemoteDataManager.inst.setUserRemoteHighScore(score);
    }

    // show分数缩放动画
    showNewScoreAct() {
        // tween(this.historyscoreLabel.node)
        //     .to(0.1, { scale: v3(0.8, 0.8, 1) })
        //     .delay(0.1)
        //     .to(0.1, { scale: v3(1.1, 1.1, 1) })
        //     .to(0.1, { scale: v3(1, 1, 1) })
        //     .start()
        // tween(this.scoreLabel.node)
        //     .to(0.1, { scale: v3(0.8, 0.8, 1) })
        //     .delay(0.1)
        //     .to(0.1, { scale: v3(1.1, 1.1, 1) })
        //     .to(0.1, { scale: v3(1, 1, 1) })
        //     .start()
        // mk.showView(AssetDefine.prefab.scoreAni, this.scoreLabel.node).then((node) => {
        //     const script = node.getComponent(ScoreNode);
        //     script.init(this.score);
        // });
    }

    setScore(score: number) {
        // request subcontext view, pass in score
        // this.setNextFriendScoreOpenDataContext();
        // if (env.WECHAT) {
        //     // @ts-ignore
        //     wx.getOpenDataContext().postMessage({
        //         event: "scoreProgress",
        //         key: "score",
        //         data: score,
        //         seed: UserData.inst.getScoreProgressSeed(),
        //         selfMaxScore: this.maxScore
        //     });
        // }
        // // @ts-ignore
        // wx.getOpenDataContext().postMessage({
        //     event: "scoreProgressAnim",
        //     key: "score",
        //     data: score,
        // });
        let tscore = this.score;
        let scorecz = score - this.score;
        Tween.stopAllByTarget(this.scoreLabel.node);

        if (scorecz > 0) {
            this.score = score;
            let call = tween().call(() => {
                tscore = tscore + 1;
                let s = tscore.toString();
                this.scoreLabel.string = s;
            });
            let usetime = 0.5;
            let time = usetime / scorecz;
            let delay = tween().delay(time);
            tween(this.scoreLabel.node).repeat(scorecz, tween().sequence(delay, call)).start();
        }
        //  else {
        //     this.scoreLabel.string = 0 + "";
        // }
        this.score = score;

        // 屏蔽 1000 分的宝箱

        // if (score >= scoreMap[treasureChestScoreMapIndex] &&
        //     UserData.inst.getCanOpenTreasureChestThisGame() == 1 &&
        //     UserData.inst.getClassicTreasureChestCount() > 0 &&
        //     ClassicAlbumData.inst.isAllStickerObtained() == false) {
        //     UserData.inst.setCanOpenTreasureChestThisGame(0);

        //     this.chestparticles1.active = true;
        //     //this.chestparticles2.active = true;
        //     this.scheduleOnce(() => {
        //         PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.foundTreasureView.path);
        //         this.treasureChest.active = false;
        //     }, 0.5)
        // }
        this.setScoreProgress(score, false);
    }

    //阶段性目标
    setScoreProgress(score: number, isStart: boolean) {
        this.setProgressBarValue(score, isStart);
        this.setLabelString();
    }

    setLabelString() {
        let startIndex = (EndlessProgressHelper.getInstance().progressStageNumber - 1) * 5;
        let labelList = {
            1: this.target1Label,
            2: this.target2Label,
            3: this.target3Label,
            4: this.target4Label,
            5: this.target5Label,
        };
        for (let index = 1; index < 6; index++) {
            let i = startIndex + index;
            if (scoreMap[i] === undefined || scoreMap[i] === null) {
                break;
            }

            let scoreString = scoreMap[i] >= 1000 ? (scoreMap[i] / 1000).toString() + "K" : scoreMap[i].toString();
            labelList[index].string = scoreString;
        }
    }

    setProgressBarValue(score: number, isStart: boolean) {
        if (EndlessProgressHelper.getInstance().progressStageNumber > 5) {
            this.progress.active = false;
            this.progressFinish.active = true;
            return;
        } else {
            this.progress.active = true;
            this.progressFinish.active = false;
        }

        let startIndex = (EndlessProgressHelper.getInstance().progressStageNumber - 1) * 5 + 1;
        let completed = 0;
        this.progressParticle.active = false;
        let targetCompletedList = {
            1: this.target1Completed,
            2: this.target2Completed,
            3: this.target3Completed,
            4: this.target4Completed,
            5: this.target5Completed,
        };
        let targetNotCompletedList = {
            1: this.target1NotCompleted,
            2: this.target2NotCompleted,
            3: this.target3NotCompleted,
            4: this.target4NotCompleted,
            5: this.target5NotCompleted,
        };
        for (let index = startIndex; index < startIndex + 5; index++) {
            if (scoreMap[index] === null || scoreMap[index] === undefined) {
                break;
            }

            if (score >= scoreMap[index]) {
                completed++;
            }
        }

        if (isStart) {
            for (let index = 1; index < 6; index++) {
                targetCompletedList[index].active = false;
                targetCompletedList[index].scale = v3(0.5, 0.5, 1);
                targetNotCompletedList[index].active = true;
                targetNotCompletedList[index].scale = v3(1, 1, 1);
            }

            for (let index = 1; index < completed; index++) {
                targetCompletedList[index].active = true;
                targetCompletedList[index].scale = v3(1, 1, 1);
                targetNotCompletedList[index].active = false;
            }
            if (completed > 0 && completed <= 5) {
                targetCompletedList[completed].active = true;
                targetCompletedList[completed].scale = v3(1, 1, 1);
                targetNotCompletedList[completed].active = false;
            }
        }

        if (completed == 5) {
            EndlessProgressHelper.getInstance().progressStageNumber++;
            EndlessProgressHelper.getInstance().currentCompleted = 0;
            //刷新下新的进度提示状态
            // UserData.inst.isPlayedReachPercent = false;
            for (let index = 1; index < 6; index++) {
                targetCompletedList[index].active = false;
                targetCompletedList[index].scale = v3(0.5, 0.5, 1);
                targetNotCompletedList[index].active = true;
                targetNotCompletedList[index].scale = v3(1, 1, 1);
            }
            if (EndlessProgressHelper.getInstance().progressStageNumber > 5) {
                this.progress.active = false;
                this.progressFinish.active = true;
            }
            completed = 0;
        } else {
            for (let index = 1; index < completed; index++) {
                targetNotCompletedList[index].active = false;
                targetCompletedList[index].active = true;
                targetCompletedList[index].scale = v3(1, 1, 1);
            }
        }

        if (completed == 0) {
            this.scoreProgress.progress = 0;
            this.progressSlider.progress = 0;
            return;
        }
        let currCompleted = EndlessProgressHelper.getInstance().currentCompleted;
        if (completed > currCompleted) {
            let target = targetNotCompletedList[completed];
            let target2 = targetCompletedList[completed];
            tween(target)
                .to(0.5, { scale: v3(0.5, 0.5, 1) })
                .start();
            target2.active = true;
            tween(target2)
                .delay(0.5)
                .to(0.5, { scale: v3(1, 1, 1) })
                .start();
            EndlessProgressHelper.getInstance().currentCompleted = completed;
        }

        let lastScore = scoreMap[startIndex + completed - 1];
        let nextScore = scoreMap[startIndex + completed];

        if (lastScore == null || lastScore == undefined || nextScore == null || nextScore == undefined) {
            this.progressParticle.active = false;
            return;
        }

        let scoreDiff = nextScore - lastScore;
        let percentage = (score - lastScore) / scoreDiff;
        let progressValue = (completed - 1) * 0.25 + 0.25 * percentage;
        this.scoreProgress.progress = progressValue;
        let particleProgressValue = progressValue;
        if (particleProgressValue < 0) {
            particleProgressValue = 0;
        }
        if (particleProgressValue > 0) {
            this.progressParticle.active = true;
        }
        //this.progressSlider.progress = particleProgressValue;
        this.progressSlider.progress = particleProgressValue;

        // UITweenBarComponent.Begin(this.scoreProgress, this.scoreProgress.progress, progressValue, 1, 0, () => {
        // });
    }

    OnEditTestAddScore(score) {
        console.log("test add score ======== ", score)
        this.testAddScore = Number(score);
    }

    OnClickTestAddScoreBtn() {

        mk.sendEvent(BlockEventType.EVENT_USE_ITEM_END, this.testAddScore);
    }
}
