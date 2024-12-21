import {
    Component,
    JsonAsset,
    _decorator,
    Node,
    Sprite,
    EditBox,
    Vec3,
    Label,
    tween,
    Button,
    ParticleSystem2D,
    Animation,
} from "cc";
import { ResManager } from "../../../../resource/ResManager";
import * as env from "cc/env";
import { NodePoolManager } from "../../../../util/NodePool";
import { Util } from "../logic/Util";
import { BlockEntity } from "../boardView/BlockEntity";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { SdkEventManager } from "../../../../minigame_sdk/scripts/SdkEventManager";
import { SdkEventType } from "../../../../minigame_sdk/scripts/SdkEventType";
import { AdSdk } from "../../../../sdk/AdSdk";
import { audioManager } from "../../../../util/MKAudio";
import { BIEventID, emButtonType, emButtonScene, emAdStatus, emScene } from "../../../../define/BIDefine";
import { ProcedureToHome } from "../../../../fsm/state/ProcedureToHome";
import { ProcedureToLevel } from "../../../../fsm/state/ProcedureToLevel";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { mk } from "../../../../MK";
import { Global } from "../../../../data/Global";
import { PanelManager } from "../../../../panel/PanelManager";
import { AlbumData } from "../../../../data/AlbumData";
import { ProcedureToAdventureLevelSelectV2 } from "../../../../fsm/state/ProcedureToAdventureLevelSelectV2";
import { AdventureLevelConfigData } from "../define/adventureLevelData";
import { UserData } from "../../../../data/UserData";
import { UserRemoteDataManager } from "../../../../data/UserRemoteDataManager";
import { emEnterAlbumFrom } from "../../../../define/BIDefine";
import { emAdPath } from "../../../../sdk/emAdPath";
import { LanguageManager } from "../../../../data/LanguageManager";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { ToastManager } from "../../../../toast/ToastManager";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { biEventId } from "../../../../Boot";
import { ProcedureToEntryGuide } from "../../../../fsm/state/ProcedureToEntryGuide";
import { emStageStickerStatus } from "../../../../data/AlbumDef";

const { ccclass, property } = _decorator;

@ccclass("SceneAdventureLevelSelectV2")
export class SceneAdventureLevelSelectV2 extends Component {
    @property(Node)
    boardNode: Node = null;

    @property(Node)
    guideHand: Node = null;

    @property(Node)
    btnContent: Node = null;

    @property(Node)
    finishStageContent: Node = null;

    @property(Label)
    daysLeft: Label = null;

    @property(Label)
    hoursLeft: Label = null;

    @property(Label)
    minutesLeft: Label = null;

    @property(Sprite)
    daysLeftSprite = null;

    @property(Sprite)
    hoursLeftSprite = null;

    @property(Sprite)
    minLeftSprite = null;

    @property(Label)
    labCurrentLevel: Label = null;

    @property(Node)
    nextLabelObj: Node = null;

    @property(Sprite)
    normalBtnSprite: Sprite = null;

    @property(Sprite)
    hardGameBtnSprite: Sprite = null;

    @property(Button)
    stickerEnterBtn: Button = null;

    @property(Sprite)
    boardBgSprite: Sprite = null;

    @property(Sprite)
    descriptionSprite: Sprite = null;

    @property(EditBox)
    levelChooseEditBox: EditBox = null;

    @property(EditBox)
    stageEndCountDownEditBox: EditBox = null;

    @property(Node)
    bookNode: Node = null;

    @property(Sprite)
    adsSprite: Sprite = null;

    currentLeftTime: number = -1;

    private adFailLoadTimes: number = 0;
    private lastRetryTime: number = 0;

    private stageBeforeEnterLevel: number = 0;

    // boardConfigMap:Map<number, any>;
    public blocks: Node[] = new Array<Node>();
    onLoad() {
        this.initNodePool();
        //this.processCountDownTime();
        this.setNextLevelButton();
        this.CreateView = this.CreateView.bind(this);

        this.levelChooseEditBox.inputMode = EditBox.InputMode.NUMERIC;
    }

    start() {
        let batchNum = UserAdventureLevelData.inst.getLevelBatchNumber();
        this.stageBeforeEnterLevel = batchNum;
        let currLevel = UserAdventureLevelData.inst.getHistoryLevelWithBatchNumber(batchNum);
        console.log("[adventureSelectLevel] currLevel: " + currLevel, " batchNum: ", batchNum);
        this.checkisAllLevelFinished();

        let val = mk.fsm.getData(ProcedureToAdventureLevelSelectV2, "defaultKey");

        if (val && val.finished && val.finished == true) {
            mk.fsm.setData(ProcedureToAdventureLevelSelectV2, "defaultKey", null);
            AlbumData.inst.setStageStickerStatus(val.batch, emStageStickerStatus.obtained);
            PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.adventureFinishAll.path, {
                bookNode: this.bookNode,
                batch: val.batch,
            });
        } else if (val && val.finished && val.finished == false) {
            mk.fsm.setData(ProcedureToAdventureLevelSelectV2, "defaultKey", null);
            AlbumData.inst.setStageStickerStatus(val.batch, emStageStickerStatus.missed);
        }

        this.createSelectBoardBlocks(batchNum, currLevel);
        let nextLevelLabel: Label = this.nextLabelObj.getComponent(Label);
        nextLevelLabel.string = UserAdventureLevelData.inst.getHistoryLevel().toString();

        AdSdk.inst.hideMainPageBannerAd();
        SdkEventManager.getInstance().register(
            SdkEventType.GAME_SHOW,
            () => {
                audioManager.instance.playMusic(true);
            },
            this
        );
        audioManager.instance.changeMusic(AssetInfoDefine.audio.tmp_bgm, true);

        this.refreshRetryState();

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
        UserData.inst.setHasEnteredAdventureToday(true);
    }

    refreshRetryState() {
        if (UserAdventureLevelData.inst.getLevelStartTimesByDay() == 0) {
            this.adsSprite.node.active = false;
        } else {
            let historyData = UserAdventureLevelData.inst.getHistoryLevelData();
            if (historyData && historyData.isGameOver == 0) {
                this.adsSprite.node.active = false;
            } else {
                this.adsSprite.node.active = true;
                if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                    ResManager.getInstance()
                        .loadSpriteFrame("res/texture/revive/UI_Stickerfinish_btn_icon_share", "block")
                        .then((sprite) => {
                            this.adsSprite.spriteFrame = sprite;
                        });
                } else {
                    ResManager.getInstance()
                        .loadSpriteFrame("res/texture/revive/UI_Restart_icon_ad", "block")
                        .then((sprite) => {
                            this.adsSprite.spriteFrame = sprite;
                        });
                }
            }
        }
    }

    private checkisAllLevelFinished() {
        let isFinish = UserAdventureLevelData.inst.isAllLevelFinished;
        let batch = UserAdventureLevelData.inst.getLevelBatchNumber();
        if (isFinish != 1) {
            this.btnContent.active = true;
            this.finishStageContent.active = false;
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/adventure/UI_AdventureSticker_content2", "block")
                .then((sprite) => {
                    this.descriptionSprite.spriteFrame = sprite;
                });

            AlbumData.inst.setStageStickerStatus(batch, emStageStickerStatus.not_obtained);
        } else {
            this.btnContent.active = false;
            this.finishStageContent.active = true;
            // if (UserAdventureLevelData.inst.getLevelBatchNumber() == AdventureLevelConfigData.LevelTotalNumer) {
            //     this.finishStageContent.getChildByPath("restNodes").active = false;
            // } else {
            //     this.finishStageContent.getChildByPath("restNodes").active = true;
            // }

            ResManager.getInstance()
                .loadSpriteFrame("res/texture/adventure/UI_AdventureSticker_content1", "block")
                .then((sprite) => {
                    this.descriptionSprite.spriteFrame = sprite;
                });
            //兜底逻辑
            AlbumData.inst.setStageStickerStatus(batch, emStageStickerStatus.obtained);
        }
    }

    public initNodePool() {
        Util.createPool("SelectBoardPool", "res/prefab/blocks/blockEntity", 21 * 17);
    }

    private setNextLevelButton() {
        let nextLevelLabel: Label = this.nextLabelObj.getComponent(Label);

        nextLevelLabel.string = UserAdventureLevelData.inst.getHistoryLevel().toString();
    }

    createSelectBoardBlocks(batch: number, currentLevel: number) {
        let configPath = "res/configs/level_select_stage" + batch.toString();
        let aboardConfigMap = new Map<number, ILevelSelectBoardCell>();
        if (Global.LevelSelectBoard && Global.LevelSelectBoard.size > 0) {
            if (Global.LevelSelectBoard.has(batch)) {
                aboardConfigMap = Global.LevelSelectBoard.get(batch);
            }
        }
        let bgConfigPath = "res/texture/adventure/UI_AdventureSticker_fish" + batch.toString() + "background";
        ResManager.getInstance()
            .loadSpriteFrame(bgConfigPath, "block")
            .then((sprite) => {
                this.boardBgSprite.spriteFrame = sprite;
            })
            .then(() => {
                if (!aboardConfigMap || aboardConfigMap.size === 0) {
                    ResManager.getInstance()
                        .loadAsset<any>(configPath, "block")
                        .then((asset) => {
                            let configBoardBlocks = asset.json;
                            if (!configBoardBlocks) return;

                            if (!this.boardNode) {
                                console.error("board node not found");
                                return;
                            }

                            let boardData = configBoardBlocks.board;
                            for (let i = 0; i < boardData.length; i++) {
                                let key = 100 * boardData[i].x + boardData[i].y;
                                aboardConfigMap.set(key, boardData[i]);
                            }
                            Global.LevelSelectBoard.set(configBoardBlocks.stage, aboardConfigMap);
                        })
                        .then(() => {
                            console.log("[createSelectBoardBlocks1] currentLevel " + currentLevel);
                            this.CreateView(aboardConfigMap, currentLevel);
                        });
                } else {
                    console.log("[createSelectBoardBlocks2] currentLevel " + currentLevel);
                    this.CreateView(aboardConfigMap, currentLevel);
                }
            });
    }

    private CreateView(aboardConfigMap: Map<number, ILevelSelectBoardCell>, currentLevel) {
        let pool = NodePoolManager.inst.getPool("SelectBoardPool");
        if (!pool) {
            console.error("failed to get the pool");
            return;
        }
        aboardConfigMap.forEach((value, key) => {
            if (value.level === currentLevel) {
                if (value.isHard) {
                    if (aboardConfigMap.get(key).isHard) {
                        this.normalBtnSprite.node.active = false;
                        this.hardGameBtnSprite.node.active = true;
                    } else {
                        this.hardGameBtnSprite.node.active = false;
                        this.normalBtnSprite.node.active = true;
                    }
                }
                return;
            }
        });
        let lastLevel = -1;
        let passsInfo = mk.getItem("Level_Passed_Last");
        if (passsInfo) {
            lastLevel = passsInfo.af_adventure_level;
        }
        for (let i = 0; i < 21; i++) {
            for (let j = 0; j < 17; j++) {
                let key = 100 * j + i;
                let blockType = 0;
                if (aboardConfigMap.has(key)) {
                    pool.getAsync().then((block) => {
                        if (!this.node) {
                            return;
                        }
                        this.blocks.push(block);
                        block.parent = this.boardNode;
                        let blockEntity = block.getComponent(BlockEntity);
                        let aboardData = aboardConfigMap.get(key);
                        let mLevel = aboardData.level;
                        if (
                            currentLevel - 1 >= mLevel ||
                            (currentLevel === mLevel && UserAdventureLevelData.inst.isAllLevelFinished == 1)
                        ) {
                            // console.log("[createView] update block type, currentLevel: " + currentLevel + " mLevel: " + mLevel)
                            blockType = aboardData.blockType;
                        }
                        blockEntity.refreshColorSelectLevel(blockType);
                        block.setPosition(this.calculateBlockposition(aboardData.y, 16 - aboardData.x));
                        if (mLevel == lastLevel) {
                            //新解锁的关卡
                            let bundleInfo = AssetInfoDefine.prefab.ef_AdventureSticker_fk_light;
                            ResManager.getInstance()
                                .loadNode(bundleInfo.path, bundleInfo.bundle, blockEntity.node)
                                .then((nd) => {
                                    nd.setPosition(Vec3.ZERO);
                                    let ps = nd.getComponent(ParticleSystem2D);
                                    if (ps) {
                                        ps.resetSystem();
                                    }
                                    let anim = nd.getComponent(Animation);
                                    if (anim) {
                                        anim.play();
                                    }
                                    mk.removeItem("Level_Passed_Last");
                                });
                            blockEntity.node.setScale(0, 0, 1);
                            tween(blockEntity.node).to(0.5, { scale: Vec3.ONE }, { easing: "quadOut" }).start();
                        }
                    });
                }
            }
        }
    }

    private calculateBlockposition(x: number, y: number) {
        if (!this.boardBgSprite.spriteFrame) {
            return;
        }

        let minX = -this.boardBgSprite.spriteFrame.originalSize.x / 2;
        let maxY = this.boardBgSprite.spriteFrame.originalSize.y / 2;

        return new Vec3(x * 32 + minX + 16, (y - 13) * 32 + maxY - 125.5 + 16);
    }

    private processCountDownTime() {
        let currTime = Date.now();
        let deadline = UserAdventureLevelData.inst.getBatchDeadlineData();
        console.log("[processCountDownTime] deadline = ", deadline);
        if (deadline < 0) {
            let currBatchDeadline = UserAdventureLevelData.inst.getBatchDeadlineData();
            let period = 7 * 24 * 3600 * 1000;
            if (currBatchDeadline < Date.now()) {
                currBatchDeadline = new Date().getTime() + period;
                UserAdventureLevelData.inst.updateBatchDeadline(currBatchDeadline);
            }
            deadline = currBatchDeadline;
        }

        let countDownTime = deadline - currTime;

        // if (countDownTime > 0) {
        //     this.setCountDownTimeFormat(countDownTime / 1000);
        //     this.startCountdown(countDownTime / 1000);
        // } else {
        //     this.onCountdownEnd();
        // }
    }

    private setCountDownTimeFormat(countDownSeconds: number) {
        const days = Math.floor(countDownSeconds / (24 * 3600));
        const hours = Math.floor((countDownSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((countDownSeconds % 3600) / 60);

        if (days > 0) {
            this.daysLeftSprite.node.active = true;
            this.daysLeft.string = days.toString();
            this.hoursLeftSprite.node.active = true;
            this.hoursLeft.string = hours.toString();
            this.minLeftSprite.node.active = false;
            this.minutesLeft.string = "";
        } else if (hours > 0) {
            this.daysLeftSprite.node.active = false;
            this.daysLeftSprite.string = "";
            this.hoursLeftSprite.node.active = true;
            this.hoursLeft.string = hours.toString();
            this.minLeftSprite.node.active = true;
            this.minutesLeft.string = minutes.toString();
        } else if (minutes >= 0) {
            this.daysLeftSprite.node.active = false;
            this.daysLeftSprite.string = "";
            this.hoursLeftSprite.node.active = false;
            this.hoursLeft.string = "";
            this.minLeftSprite.node.active = true;
            this.minutesLeft.string = minutes.toString();
        }
    }

    private startCountdown(countdownTime: number) {
        this.currentLeftTime = countdownTime;
        console.log("uploadAdventureModeDataToRemote, currentLeftTime : ", this.currentLeftTime * 1000);
        UserRemoteDataManager.inst.uploadAdventureModeDataToRemote(this.currentLeftTime * 1000);
        //this.schedule(this.updateCountdown, 1);
    }

    // private onCountdownEnd() {
    //     // 倒计时结束时的操作
    //     console.log("Countdown ended!");
    //     let finishState = UserAdventureLevelData.inst.isAllLevelFinished;
    //     if (finishState != 1) {
    //         AlbumData.inst.setStageStickerStatus(
    //             UserAdventureLevelData.inst.getLevelBatchNumber(),
    //             emStageStickerStatus.missed
    //         );
    //     }
    //     UserRemoteDataManager.inst.setstickerStatus();
    //     UserAdventureLevelData.inst.ResetBatch();
    //     this.setNextLevelButton();
    // }
    private updateCountdown() {
        if (this.currentLeftTime > 0) {
            this.currentLeftTime--;
            this.setCountDownTimeFormat(this.currentLeftTime);
        } else {
            this.unschedule(this.updateCountdown);
            //this.onCountdownEnd();
        }
    }

    onClickHome() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToHome, "adventure_level_select");
        // this.removeItems();
    }

    onClickNextLevel() {

        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.click_adventure_start,
            proj_scene: emButtonScene.from_adventure_choose_level,
        });
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        // this.stageBeforeEnterLevel
        let level = UserAdventureLevelData.inst.getMaxHistoryLevel();

        //首先检查是否需要展示新手引导
        if (UserAdventureLevelData.inst.firstStartBatchOneLevelOne == 0 && this.stageBeforeEnterLevel == 1) {
            SceneMode.gameMode = kGameMode.adventure_level;
            mk.fsm.changeState(ProcedureToEntryGuide, {
                source: "adventure_level_select",
                batch: this.stageBeforeEnterLevel,
            });
            return;
        }

        if (
            UserAdventureLevelData.inst.firstStartBatchOneLevelTwo == 0 &&
            this.stageBeforeEnterLevel == 1 &&
            level == 2
        ) {
            SceneMode.gameMode = kGameMode.adventure_level;
            mk.fsm.changeState(ProcedureToEntryGuide, {
                source: "adventure_level_select",
                batch: this.stageBeforeEnterLevel,
            });
            return;
        }

        let needAds = UserAdventureLevelData.inst.getLevelStartTimesByDay();

        let historyData = UserAdventureLevelData.inst.getHistoryLevelData();
        if (historyData && historyData.isGameOver == 0) {
            needAds = 0;
        }

        if (needAds > 0) {
            console.log("this.adFailLoadTimes = ", this.adFailLoadTimes);
            if (this.adFailLoadTimes > Global.maxAdBeforeShare) {
                let randomShowOffNum = Util.generateRandomShowOffShare();
                Util.shareMsg(
                    randomShowOffNum,
                    emSharePath.start_game,
                    this,
                    () => {
                        let currentLevel = UserAdventureLevelData.inst.getMaxHistoryLevel();
                        SceneMode.gameMode = kGameMode.adventure_level;
                        UserAdventureLevelData.inst.updateHistoryLevel(currentLevel);
                        mk.fsm.changeState(ProcedureToLevel, {
                            source: "adventure_level_select",
                            batch: this.stageBeforeEnterLevel,
                        });
                    },
                    {},
                    () => {
                        console.log("failed to share");
                        Util.showShareFailedHint();
                        UserData.inst.setTryShareRePlayToday(0);
                        return;
                    }
                );
            }
            mk.sdk.instance.reportBI(biEventId.af_ad_levelbegin, {
                proj_scene: emScene.scene_adventure_level_select,
                proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                proj_ad_status: emAdStatus.WakeUp,
            });
            AdSdk.inst
                .showRewardVideoAd(emAdPath.Score_Relife)
                .then((res) => {
                    mk.sdk.instance.reportBI(biEventId.af_ad_levelbegin, {
                        proj_scene: emScene.adventure_level_game_over,
                        proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                        proj_ad_status: emAdStatus.Finished,
                    });
                    let currentLevel = UserAdventureLevelData.inst.getMaxHistoryLevel();
                    SceneMode.gameMode = kGameMode.adventure_level;
                    UserAdventureLevelData.inst.updateHistoryLevel(currentLevel);
                    mk.fsm.changeState(ProcedureToLevel, {
                        source: "adventure_level_select",
                        batch: this.stageBeforeEnterLevel,
                    });
                })
                .catch((err: dtSdkError) => {
                    console.log("dtSdkError ", JSON.stringify(err));
                    if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                        SdkManager.getInstance().native.showToast(
                            LanguageManager.translateText("tip_not_finish_watch")
                        );
                        mk.sdk.instance.reportBI(biEventId.af_ad_levelbegin, {
                            proj_scene: emScene.scene_adventure_level_select,
                            proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                            proj_ad_status: emAdStatus.Closed,
                        });
                        // TODO: emit event to trigger panel view
                        return;
                    } else if (err.errMsg == emSdkErrorCode.Sdk_Ad_On_Error) {
                        this.adFailLoadTimes += 1;
                        this.refreshRetryState();
                    }
                    mk.sdk.instance.reportBI(biEventId.af_ad_levelbegin, {
                        proj_scene: emScene.scene_adventure_level_select,
                        proj_level: UserAdventureLevelData.inst.getHistoryLevel(),
                        proj_ad_status: emAdStatus.Error,
                    });
                    SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
                    // TODO: emit event to trigger panel view
                    return;
                });
        } else {
            let currentLevel = UserAdventureLevelData.inst.getMaxHistoryLevel();
            SceneMode.gameMode = kGameMode.adventure_level;
            UserAdventureLevelData.inst.updateHistoryLevel(currentLevel);
            mk.fsm.changeState(ProcedureToLevel, {
                source: "adventure_level_select",
                batch: this.stageBeforeEnterLevel,
            });
        }

        // this.removeItems();
    }

    onClickSticker() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        // mk.sdk.instance.reportBI(BIEventID.btn_click, {
        //     btn_type: emButtonType.enter_mysticker,
        //     scene: emButtonScene.from_adventure_choose_level,
        // });
        // Global.EnterStickerFrom = emEnterAlbumFrom.adventure_level_select;
        // mk.fsm.changeState(ProcedureToAlbum, "adventure_level_select");
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.albumBookView.path, {
            source: emEnterAlbumFrom.adventure_level_select,
        });
    }

    onSetCurrLevel(event) {
        let level = UserAdventureLevelData.inst.getHistoryLevel();
        const text = event.string;
        const num = parseInt(text, 10);

        if (Number.isInteger(num) && num >= 1 && num <= 300) {
            UserAdventureLevelData.inst.updateHistoryLevel(num);
            UserAdventureLevelData.inst.updateMaxHistoryLevelForce(num);
            this.nextLabelObj.getComponent(Label).string = text;
            UserAdventureLevelData.inst.clearLevelHistoryData();
            UserAdventureLevelData.inst.clearLevelFinishdData();
        }
    }

    onSetCurrStageCountDown(event) {
        const text = event.string;
        const num = parseInt(text, 10);

        if (Number.isInteger(num) && num >= 0) {
            UserAdventureLevelData.inst.updateBatchDeadline(Date.now() + 1000 * num);
            //this.unschedule(this.updateCountdown);
            this.processCountDownTime();
        }
    }

    onClickClearRemoteData() {
        if (env.WECHAT) {
            UserRemoteDataManager.inst.clearRemoteData();
            UserData.inst.wxUserAgreePolicy == false
        }
    }

    protected onDestroy(): void {
        //this.unschedule(this.updateCountdown);
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

                    mk.sdk.instance.reportBI(BIEventID.btn_click, {
                        proj_btn_type: emButtonType.click_adventrue_rechallenge,
                        proj_scene: emButtonScene.from_adventrue_fail,
                    });
                    mk.audio.playSubSound(AssetInfoDefine.audio.touch);
                    let currentLevel = UserAdventureLevelData.inst.getMaxHistoryLevel();
                    SceneMode.gameMode = kGameMode.adventure_level;
                    UserAdventureLevelData.inst.updateHistoryLevel(currentLevel);
                    mk.fsm.changeState(ProcedureToLevel, {
                        source: "adventure_level_select",
                        batch: this.stageBeforeEnterLevel,
                    });
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

    OnClickGoToNextSeason() {
        let pool = NodePoolManager.inst.getPool("SelectBoardPool");
        for (let index = 0; index < this.blocks.length; index++) {
            const block = this.blocks[index];
            pool.put(block);
        }
        this.normalBtnSprite.node.active = true;
        this.hardGameBtnSprite.node.active = false;
        UserAdventureLevelData.inst.ResetBatch();
        let batchNum = UserAdventureLevelData.inst.getLevelBatchNumber();
        this.stageBeforeEnterLevel = batchNum;
        let currLevel = UserAdventureLevelData.inst.getHistoryLevelWithBatchNumber(batchNum);
        this.createSelectBoardBlocks(batchNum, currLevel);
        let nextLevelLabel: Label = this.nextLabelObj.getComponent(Label);
        nextLevelLabel.string = UserAdventureLevelData.inst.getHistoryLevel().toString();
        this.refreshRetryState();
        this.finishStageContent.active = false;
        this.btnContent.active = true;
        ResManager.getInstance()
            .loadSpriteFrame("res/texture/adventure/UI_AdventureSticker_content2", "block")
            .then((sprite) => {
                this.descriptionSprite.spriteFrame = sprite;
            });

        AlbumData.inst.setStageStickerStatus(batchNum, emStageStickerStatus.not_obtained);
    }
}
