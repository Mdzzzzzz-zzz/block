import { instantiate, Prefab, Node } from "cc";
import { ScoreHelper } from "./ScoreHelper";
import { BlockEventType } from "../define/Event";
import { mk } from "../../../../MK";
import { BlockItemConst } from "../define/BlockType";
import { BlockGenerate001, IBlockGenetateResult } from "./BlockGenerate";
import { Random } from "../../../../util/Random";
import { IBlockHintSequence, BlockPlaceholder3 } from "../boardView/BlockPlaceholder3";
import * as env from "cc/env";
import { EndlessScoreHelper } from "./EndlessScoreHelper";
import { GuideData } from "../../../../data/GuideData";
import { BlockGenerateMaster } from "./BlockGenerateMaster";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { NodePool, NodePoolManager } from "../../../../util/NodePool";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { BlockConstData } from "../define/BlockConstData";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { UserChangeData } from "../../../../data/UserChangeData";
import { BlockGenetateNative } from "./BlockGenerateNative";
import { FlagData } from "../../../../data/FlagData";
import { BIEventID, emAdStatus } from "../../../../define/BIDefine";
import { ResManager } from "../../../../resource/ResManager";
import { BlockGenetateWasmEndless } from "./BlockGenetateWasmEndless";
import { UserData } from "../../../../data/UserData";
import { RemoteConfig } from "../../../../RemoteConfig/RemoteConfig";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { Util } from "./Util";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { biEventId } from "../../../../Boot";
import { LanguageManager } from "../../../../data/LanguageManager";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { AdSdk } from "../../../../sdk/AdSdk";
import { emAdPath } from "../../../../sdk/emAdPath";
import { ProcedureToHome } from "../../../../fsm/state/ProcedureToHome";
import { ABTestManager } from "../../../../ABTest/ABTestManager";
import { ABTestParam } from "../../../../ABTest/ABTestDefine";
import { SceneGame } from "../scene/SceneGame";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";

const enhancedInterval: number = 0; // 加强提示 间隔
export class Game {
    private static _inst: Game;
    public static get inst() {
        if (this._inst) return this._inst;
        this._inst = new Game();
        return this._inst;
    }

    readonly RELIFE_EASY_TIMES = 6;

    // 行列数
    public blockNumber = 8;
    public diamonTypeStart = 100;

    public tableData: Array<Array<number>>;

    public blockPlaceholders: Array<Node>;
    public blockPlacesMap: Map<number, Node>;

    public scoreHelper: ScoreHelper;

    protected blockGenerate: BlockGenerate001;

    protected levelData: ILevelData;

    public reviviTimes: number;
    public canMoveBlock: boolean; //是否可以移动状态标记
    private lastShowClearRound: number = 0;
    private showClearRoundInterval: number = 5;

    private lastEnhancedRound: number = 0;


    constructor() {
        this.initNodePool();
    }

    public canShowClearRound() {
        console.log(
            "this.blockGenerate.round " +
            this.blockGenerate.round +
            " this.lastShowClearRound " +
            this.lastShowClearRound
        );
        if (this.blockGenerate.round - this.lastShowClearRound <= this.showClearRoundInterval) {
            console.log("return false");
            return false;
        }
        this.lastShowClearRound = this.blockGenerate.round;
        return true;
    }

    protected getMaxReviviTimes(): number {
        return RemoteConfig.getInstance().ReviviTimesEndless;
    }
    public isCanRevive(): boolean {
        return this.reviviTimes < this.getMaxReviviTimes();
    }

    public getReviveTimes(): number {
        return this.reviviTimes;
    }

    public getNextBlock() {
        return this.blockGenerate.getNextBlockType(this.scoreHelper.score, this.tableData);
    }

    public getNextPreviewBlocks() {
        return this.blockGenerate.getNextPreviewBlocks(this.scoreHelper.score, this.tableData);
    }
    public getRelifePreviewBlocks(): IBlockGenetateResult {
        return this.blockGenerate.getPreviewBlocksAfterRelife(0, 0, this.tableData, (index) => {
            return this.canPutBlock(index);
        });
    }
    public getPreviewBlocks(): Promise<IBlockGenetateResult> {
        return new Promise<IBlockGenetateResult>((resolve, reject) => {
            //引导期间返回的引导
            if (SceneMode.gameMode == kGameMode.endless) {
                if (!GuideData.inst.isGuideFinished()) {
                    // resolve({ blockIds: GuideData.inst.getGuidePreviews(), isRecommendHigh: false, color: 4 });
                    let previewData = GuideData.inst.getNewUserGuidePreviews();
                    this.lastShowClearRound = 3; // 强行刷新新手引导期间的清屏轮次
                    resolve({ blockIds: previewData.blockIds, isRecommendHigh: false, color: previewData.colors, multiArr: [], allcArr: [] });
                    return;
                }
            } else if (SceneMode.gameMode == kGameMode.level) {
                if (!LevelGuideData.inst.isGuideFinished()) {
                    let previewData = GuideData.inst.getNewUserGuidePreviews();
                    resolve({ blockIds: previewData.blockIds, isRecommendHigh: false, color: previewData.colors, multiArr: [], allcArr: [] });
                    return;
                }
            } else if (SceneMode.gameMode == kGameMode.adventure_level) {
                if (!LevelGuideData.inst.isGuideFinished()) {
                    let previewData = GuideData.inst.getNewUserGuidePreviews();
                    resolve({ blockIds: previewData.blockIds, isRecommendHigh: false, color: previewData.colors, multiArr: [], allcArr: [] });
                    return;
                }
            }

            let res: IBlockGenetateResult = null;
            if (this.afterRelifeTimes == this.RELIFE_EASY_TIMES) {
                this.afterRelifeTimes--;
                if (env.PREVIEW || env.EDITOR) {
                    console.log("复活后 采用简单的出块策略");
                }
                res = this.blockGenerate.getPreviewBlocksAfterRelife(0, 0, this.tableData, (index) => {
                    return this.canPutBlock(index);
                });
                resolve(res);
                return;
            }
            if (env.PREVIEW) {
                console.log("use clear all fill score: " + this.scoreHelper.clearAllFillScore);
            }
            if (this.afterRelifeTimes > 0) {
                console.log("Game getPreviewBlocks in revive")
                this.afterRelifeTimes--;
                let hard_type = 0;
                let isNewbie = ABTestManager.getInstance().getGroup(ABTestParam.NewbieEasyBlocks);
                console.log("Game Data " + isNewbie + " " + UserData.inst.gameNumber + " " + RemoteConfig.getInstance().newbieGameNumber  + " " + GuideData.inst.isGuideFinished())
                if (isNewbie == 1 && GuideData.inst.isGuideFinished() == true) {
                    console.log("Game Score " ,this.scoreHelper, " ", this.scoreHelper.score)
                    if (this.scoreHelper && this.scoreHelper.score < 2000) {
                        hard_type = 3;
                    }
                }

                this.blockGenerate
                    .getPreviewBlocks(
                        this.scoreHelper.score,
                        this.scoreHelper.getComboTimes(),
                        this.scoreHelper.collectNum,
                        -1,
                        hard_type,
                        this.tableData,
                        (index) => {
                            return this.canPutBlock(index);
                        },
                        this.scoreHelper.clearAllFillScore
                    )
                    .then(resolve)
                    .catch(reject);
            } else {
                let hard_type = 0;
                console.log("Game getPreviewBlocks in normal")
                let isNewbie = ABTestManager.getInstance().getGroup(ABTestParam.NewbieEasyBlocks);
                console.log("Game Data " + isNewbie + " " + UserData.inst.gameNumber + " " + RemoteConfig.getInstance().newbieGameNumber + " " + GuideData.inst.isGuideFinished())
                if (isNewbie == 1 && GuideData.inst.isGuideFinished() == true && SceneMode.gameMode == kGameMode.endless) {
                    console.log("Game Score ", this.scoreHelper, " ", this.scoreHelper.score)
                    if (this.scoreHelper && this.scoreHelper.score < 2000) {
                        hard_type = 3;
                    }
                }

                this.blockGenerate
                    .getPreviewBlocks(
                        this.scoreHelper.score,
                        this.scoreHelper.getComboTimes(),
                        this.scoreHelper.collectNum,
                        0,
                        hard_type,
                        this.tableData,
                        (index) => {
                            return this.canPutBlock(index);
                        },
                        this.scoreHelper.clearAllFillScore
                    )
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
    public getAdRefreshBlock(): number {
        let tableIds = [];
        for (let index = 0; index < 3; index++) {
            let element = this.blockPlacesMap.get(index);
            if (element && element.isValid) {
                let cmpt = element.getComponent(BlockPlaceholder3);
                if (cmpt) {
                    tableIds.push(cmpt.blockIndex + 1);
                }
            }
        }
        return this.blockGenerate.getAdRefreshBlockIndex(this.scoreHelper.score, this.tableData, tableIds);
    }
    public getNodePoolWithPoolType(poolType: string): NodePool {
        return NodePoolManager.inst.getPool(poolType);
    }
    // private isHasHistory:boolean = false;
    // public checkHistoryLevelData() {
    //     let item = mk.getItem(this.getLevelDataStorageKey());
    //     if (item) {
    //         this.levelData = item;
    //         this.isHasHistory =  true;
    //     }else{
    //         //初始化一个默认的历史数据
    //         this.levelData = {id:0,board:null,preview:[],score:0,collect:[],skillScore:0,continuousCount:0};
    //         this.isHasHistory =  false;
    //     }
    // }
    public historyLevelData: ILevelData;

    // checkCanStartGame() {
    //     return new Promise<boolean>((resolve, reject) => {
    //         let freeTimes = UserData.inst.getClassicPlayNumToday;
    //         let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

    //         if (freeTimes == maxFreeTimes) {
    //             let randomShowOffNum = Util.generateRandomShowOffShare();
    //             WechatMiniApi.getInstance().showShare(randomShowOffNum, emSharePath.revive, this, ()=> {
    //                 mk.audio.playSubSound(AssetInfoDefine.audio.touch);
    //                 resolve(true);
    //             }, {}, () => {
    //                 console.log("failed to share")
    //                 resolve(false);
    //             });
    //         } else if (freeTimes > maxFreeTimes) {
    //             AdSdk.inst
    //             .showRewardVideoAd(emAdPath.Score_Relife)
    //             .then((res) => {
    //                 mk.audio.playSubSound(AssetInfoDefine.audio.touch);
    //                 resolve(true);
    //             })
    //             .catch((err: dtSdkError) => {
    //                
    //                 // SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
    //                 resolve(false);
    //             });
    //         }
    //         else {
    //             resolve(true);
    //         }       
    //     }
    //     );
    // }

    public startGame() {
        this.canMoveBlock = true;
        if (this.scoreHelper) {
            this.scoreHelper.clear();
        }

        let freeTimes = UserData.inst.getClassicPlayNumToday;
        let maxFreeTimes = UserData.inst.getMaxFreePlayNumToday();

        let classicTime = UserData.inst.getClassicPlayNumToday;
        this.scoreHelper = new EndlessScoreHelper();
        this.scoreHelper.loadConfig();
        this.lastEnhancedRound = 0;
        if (this.blockGenerate) {
            this.blockGenerate.clear();
        }
        if (env.NATIVE) {
            this.blockGenerate = new BlockGenetateNative(Random.inst, this.scoreHelper, "game_action_info");
            console.log("1111111")
        } else if (env.WECHAT || env.PREVIEW) {
            try {
                console.log("222222")
                this.blockGenerate = new BlockGenetateWasmEndless(null, Random.inst, this.scoreHelper, "game_action_info");
                let initSuccess = this.blockGenerate.initGenetateFill();
                if (!initSuccess) {
                    console.log("333333")
                    this.blockGenerate = new BlockGenerateMaster(Random.inst, this.scoreHelper, "game_action_info");
                }
            } catch (e) {
                console.log("444444")
                this.blockGenerate = new BlockGenerateMaster(Random.inst, this.scoreHelper, "game_action_info");
            }
        } else {
            console.log("555555")
            this.blockGenerate = new BlockGenerateMaster(Random.inst, this.scoreHelper, "game_action_info");
        }
        //this.initItemData();
        this.resetGameState();
        this.initTableData();
        this.initNodePool();
        if (SceneMode.gameMode == kGameMode.endless) {
            mk.sendEvent(BlockEventType.EVENT_SWITCH_SUB_CONTEXT_VIEW, true);
        }

        UserData.inst.isGameOngoing = true;
        UserData.inst.setThisGameWatchReviveNum(1);
        // console.log("addUserGamePlayed ", UserData.inst.gameNumber);
        UserData.inst.gameNumber = UserData.inst.gameNumber + 1;
        // UserAdventureLevelData.inst.recordLevelStartByDay();
    }
    /**
     * 进入场景后 初始化道具
     */
    protected initItemData() {
        if (UserChangeData.inst.isCanUseItem()) {
            UserChangeData.inst.useItem();
            this.addChangeAllTimes();
        }
    }
    protected adRefreshBlockTimes: number = 0;
    protected getMaxRefreshBlockTimes(): number {
        return 2;
    }
    public isCanRefreshBlock(): boolean {
        return false;
        // if(this.isCanRefreshAll())
        // {
        //     return false;
        // }
        // return this.adRefreshBlockTimes < this.getMaxRefreshBlockTimes();
    }

    public onAdRefreshBlock(): void {
        this.adRefreshBlockTimes += 1;
        this.updateLevelHistoryData();
    }
    public changeAllTimes: number = 0;
    public getMaxChangeAllTimes(): number {
        return 3;
    }
    public isCanChangeAll() {
        return this.changeAllTimes > 0;
    }
    public addChangeAllTimes() {
        this.changeAllTimes = this.getMaxChangeAllTimes();
    }
    public useChangeAllTimes() {
        this.changeAllTimes -= 1;
    }

    public refreshAllTimes: number = 0;
    public getMaxRefreshAllTimes(): number {
        return 1;
    }
    public isCanRefreshAll() {
        return this.refreshAllTimes < this.getMaxRefreshAllTimes();
    }
    public onAdRefreshAllBlock() {
        this.refreshAllTimes += 1;
    }
    /**
     * 记录当前关的状态字段
     */
    protected resetGameState(): void {
        this.reviviTimes = 0;
        this.afterRelifeTimes = 0;
        this.adRefreshBlockTimes = 0;
        this.refreshAllTimes = 0;
    }
    protected onBeginByHistory() { }
    protected onBeginNewGame() {
        this.resetGameRecordState();
    }
    protected resetGameRecordState(): void {
        UserData.inst.isNewRecordPlayed = false;
        this.scoreHelper.resetGameRecordState();
    }

    protected clear() {
        if (this.scoreHelper) {
            this.scoreHelper.clear();
        }
        this.scoreHelper = null;
        if (this.blockGenerate) {
            this.blockGenerate.clear();
        }
        this.blockGenerate = null;
        this.tableData = null;
    }
    public destroy() {
        this.clear();
        Game._inst = null;
    }

    // public checkGameEnd() {
    //     const end = this.blockPlaceholders.filter(node => {
    //         let blockIndex = node.getComponent(BlockPlaceholder3).blockIndex;
    //         return this.canPutBlock(blockIndex);
    //     }).length == 0;
    //     return end;
    // }
    public isGameOver: boolean = false;
    public checkGameEnd() {
        let holders = this.blockPlaceholders;
        if (holders.length == 0) {
            return false;
        }
        for (let index = 0; index < holders.length; index++) {
            const element = holders[index];
            let block = element.getComponent(BlockPlaceholder3);
            if (this.canPutBlock(block.blockIndex)) {
                this.isGameOver = false;
                return false;
            }
        }
        this.isGameOver = true;
        this.lastShowClearRound = 0;

        return true;
    }
    /**
     * 单个块的最佳放置位置提示
     */
    public getAiHelpTipCoord(): Promise<IBlockForAiTip> {
        return new Promise<IBlockForAiTip>((resolve, reject) => {
            let holders = this.blockPlaceholders;
            if (!holders) {
                reject(null);
                return;
            }
            if (holders.length == 0) {
                reject(null);
                return;
            }
            for (let index = 0; index < holders.length; index++) {
                const element = holders[index];
                let block = element.getComponent(BlockPlaceholder3);
                if (this.canPutBlock(block.blockIndex)) {
                    //获取块的提示位置
                    this.blockGenerate
                        .getBlockAiTipCoord(this.tableData, block.blockIndex + 1, 1)
                        .then((item) => {
                            resolve({ item: item, holder: block });
                        })
                        .catch(reject);
                    return;
                }
            }
            reject(null);
        });
    }

    public endGame() {
        this.tableData = null;
        this.blockGenerate = null;
        if (this.scoreHelper) {
            this.scoreHelper.clear();
        }
        this.scoreHelper = null;
    }
    protected getBlockGroupPoolName() {
        return "BlockGroupPool";
    }

    public putBlock(node: Node) {
        // //放置完成后检查下是否游戏结束
        // this.checkGameEnd();
        let cmpt = node.getComponent(BlockPlaceholder3);
        if (cmpt) {
            let blockIndex = cmpt.blockIndex;
            let count = 0;
            if (blockIndex < 1000) {
                //放置的是块
                this.getNodePoolWithPoolType(this.getBlockGroupPoolName()).put(node);
                let index = this.blockPlaceholders?.indexOf(node);
                if (index > -1) {
                    this.blockPlaceholders.splice(index, 1);
                    //刷新预览块的状态
                    if (this.blockPlacesMap.has(index)) {
                        this.blockPlacesMap.set(index, null);
                    }
                }
                cmpt.hasPut = true;
                count = window["BlockConst"][blockIndex].count;
                mk.sendEvent(BlockEventType.EVENT_PUT_BLOCK_END, mk.msgData?.Login?.userId, count);
            } else {
                //放置的是道具
                if (blockIndex == 1001 || blockIndex == 1002 || blockIndex == 1003) {
                    this.getNodePoolWithPoolType("HammerBlockGroupPool").put(node);
                }
                count = BlockItemConst[blockIndex].count;
            }
        }
    }

    public getClearRowAndCol(tableData: Array<Array<number>> = null) {
        tableData = tableData ?? this.tableData;

        const clearH = [];
        for (let i = 0; i < this.blockNumber; i++) {
            let clear = true;
            for (let j = 0; j < this.blockNumber; j++) {
                clear = clear && tableData[i][j] > 0;
                if (!clear) break;
            }
            if (clear) {
                clearH.push(i);
            }
        }

        const clearL = [];
        for (let i = 0; i < this.blockNumber; i++) {
            let clear = true;
            for (let j = 0; j < this.blockNumber; j++) {
                clear = clear && tableData[j][i] > 0;
                if (!clear) break;
            }
            if (clear) {
                clearL.push(i);
            }
        }
        return [clearH, clearL];
    }

    public canPutBlock(blockType: number) {
        if (blockType == -1) {
            return false;
        }
        let blockConst = window["BlockConst"];
        for (let i = 0; i < this.blockNumber; i++) {
            for (let j = 0; j < this.blockNumber; j++) {
                let blockData = blockConst[blockType];
                if (!blockData) {
                    console.error(blockConst, "找不到block->", blockType);
                    return false;
                }
                const result = this._mergeData(blockData.block, this.tableData, i, j);
                if (result) {
                    return true;
                }
            }
        }
        return false;
    }

    public initNodePool() {
        // mk.log("开始增加 缓存");
        this.createPool("BlockEntityPool", "res/prefab/blocks/blockEntity", 100);
        this.createPool("BlockGroupPool", "res/prefab/blocks/block-normal", 1);
        this.createPool("BlockClearAni_H", "res/prefab/blocks/ef_cleaarup_heng_pb", 6);
        this.createPool("BlockClearAni_V", "res/prefab/blocks/ef_cleaarup_shu_pb", 6);
        // this.createPool("BlockEntityPreviewAniPool", "res/prefab/blocks/blockEntity", 64); // 一共需要64个方块
        let prefabPath = AssetInfoDefine.prefab;
        let cool = prefabPath.cool;
        NodePoolManager.initPool(cool.path, cool.bundle, 1);
        let scorePool = prefabPath.addScore;
        NodePoolManager.initPool(scorePool.path, scorePool.bundle, 1);

        //连击
        // let combo = AssetInfoDefine.prefab.comboAni.path;
        // this.createPool(combo, combo, 1);

        let comboScore = prefabPath.comboScore;
        NodePoolManager.initPool(comboScore.path, comboScore.bundle, 1);

        //突破最高分
        let newRecord = prefabPath.newRecord;
        NodePoolManager.initPool(newRecord.path, newRecord.bundle, 1);

        //clear_all
        let clear_all = prefabPath.clear_all;
        NodePoolManager.initPool(clear_all.path, clear_all.bundle, 1);

        // let clear_all_qingpan = prefabPath.clear_all_qipan;
        // NodePoolManager.initPool(clear_all_qingpan.path, clear_all_qingpan.bundle, 1);

        let diff_up = prefabPath.diffult_change;
        NodePoolManager.initPool(diff_up.path, diff_up.bundle, 1);

        //突破最高分
        let reachPercent = prefabPath.reachPercent;
        NodePoolManager.initPool(reachPercent.path, reachPercent.bundle, 1);
        // mk.log("增加缓存 完成");

        let reachEnhance = prefabPath.reachEnhance;
        NodePoolManager.initPool(reachEnhance.path, reachEnhance.bundle, 1);
    }

    // public createAddScoreAni() {
    //     return this.getNodePool(this.nodePoolAddScoreAni, this.prbAddScoreAni);
    // }

    // public recycleAddScoreAni(node: Node) {
    //     this.recycleNode(this.nodePoolAddScoreAni, node);
    // }

    protected createPool(poolType: string, prefabPath: string, count: number, assetBundle: string = "block") {
        let node = ResManager.getInstance().loadAssetSync<Prefab>(prefabPath, assetBundle);
        if (node == null) {
            if (env.PREVIEW) {
                console.warn("null pool node ", prefabPath);
            }
            NodePoolManager.initPool(poolType, assetBundle, count);
            return;
        }
        const pool = NodePoolManager.inst.createPool(poolType);
        if (node) {
            pool.cloneNode = instantiate(node);
            pool.size = count;
        }
    }
    protected zeroTableData(num: number) {
        if (!this.tableData) {
            this.tableData = Array.from({ length: num }, () => Array.from({ length: num }, () => 0));
        } else {
            let arr = this.tableData;
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].length; j++) {
                    arr[i][j] = 0;
                }
            }
        }
    }
    public initTableData(): ILevelData {
        const num = this.blockNumber;
        this.zeroTableData(num);
        if (SceneMode.gameMode == kGameMode.endless) {
            if (!GuideData.inst.isGuideFinished()) {
                this.initWithGuideData(false, GuideData.inst.getGuideBoard());
                return null;
            }
        }
        // this.tableData = [
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [0, 0, 0, 0, 0, 0, 0, 0],
        //     [1, 1, 1, 1, 1, 1, 1, 0],
        //     [1, 1, 1, 1, 1, 1, 1, 0]];
        let historyLevelData = this.getHistoryLevelData();
        if (historyLevelData) {
            this.historyLevelData = historyLevelData;
            if (env.PREVIEW || env.EDITOR) {
                console.log("历史关卡进入：", historyLevelData);
            }
            this.scoreHelper.setHistoryData(historyLevelData);
            this.blockGenerate.setHistoryData(historyLevelData);
            this.reviviTimes = historyLevelData.reviviTimes || 0;
            this.adRefreshBlockTimes = historyLevelData.refreshTimes || 0;
            this.refreshAllTimes = historyLevelData.refreshAllTimes || 0;
            this.changeAllTimes = historyLevelData.changeAllTimes || 0;
            let board = historyLevelData.board;
            if (board) {
                for (let i = 0; i < num; i++) {
                    for (let j = 0; j < num; j++) {
                        let boardType = board[i][j];
                        this.tableData[i][j] = boardType;
                    }
                }
            }
            this.onBeginByHistory();
            return historyLevelData;
        } else {
            //加载下历史最高分
            this.scoreHelper.loadHistoryMaxScore();
        }
        this.onBeginNewGame();
        return null;
    }
    /**
     * 初始化的时候不用通知出去
     * @param notify
     */
    public initWithGuideData(notify: boolean = true, board: number[][]) {
        // let board = GuideData.inst.getGuideBoard();
        const num = this.blockNumber;
        if (board) {
            for (let i = 0; i < num; i++) {
                for (let j = 0; j < num; j++) {
                    let boardType = board[i][j];
                    let stat = -3;
                    if (boardType > 0) {
                        stat = boardType;
                    } else if (boardType == 0) {
                        stat = -3;
                    } else {
                        stat = 0;
                    }
                    this.tableData[i][j] = stat;
                }
            }
        }
        if (SceneMode.gameMode == kGameMode.endless) {
            let step = GuideData.inst.step;
            let mode = SceneMode.gameMode;
            let guide_step_key = `${BIEventID.guide_step}_${mode}_${step}_0`;
            if (!FlagData.inst.hasFlag(guide_step_key)) {
                let group = ABTestManager.getInstance().getGroup(ABTestParam.NewUserGuide);
                mk.sdk.instance.reportBI(
                    group == 0? BIEventID.guide_step: BIEventID.guide_step_new,
                    {
                        // gameNumber: UserData.inst.gameNumber,
                        proj_g_step: step,
                        proj_g_state: 0,
                    },
                    true
                );
                FlagData.inst.recordFlag(guide_step_key);
            }
        }
        // else {
        //     mk.sdk.instance.reportBI(mk.biEventId.guide_step, {
        //         // gameNumber: UserData.inst.gameNumber,
        //         g_step: LevelGuideData.inst.step,
        //         g_mode: SceneMode.gameMode,
        //         g_state: 0,
        //     });
        // }

        if (notify) {
            mk.sendEvent(BlockEventType.kEvent_Game_Show_User_Guide);
        }
    }
    public getHistoryLevelData(): ILevelData {
        let historyData = UserScoreLevelData.inst.getHistoryLevelData();
        if (historyData && historyData.isGameOver == 1) {
            UserScoreLevelData.inst.clearLevelHistoryData();
            return null;
        }
        return historyData;
    }

    private _mergeData(block, _tableData: Array<Array<number>>, source_i = 0, source_j = 0) {
        for (let i = 0; i < block.length; i++) {
            for (let j = 0; j < block[i].length; j++) {
                if (block[i][j] == 0) continue;

                const table_i = i + source_i - 2;
                const table_j = j + source_j - 2;

                // 超出边界
                if (table_i < 0 || table_i >= this.blockNumber) {
                    return false;
                }

                if (table_j < 0 || table_j >= this.blockNumber) {
                    return false;
                }

                if (_tableData[table_i][table_j] != 0) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * 这个位置进行随机颜色
     * @param blockIndex
     * @returns
     */
    public getBlockSimpleConfig(blockIndex: number, color: number): number[][] {
        if (blockIndex > 1000) {
            return BlockItemConst[blockIndex].simple;
        }
        let randomClolor = color;
        let useSimpleData = [[]];
        let simpleData = window["BlockConst"][blockIndex].simple;
        useSimpleData = new Array(simpleData.length);
        for (let i = 0; i < simpleData.length; i++) {
            let data = simpleData[i];
            useSimpleData[i] = new Array(data.length);
            for (let index = 0; index < data.length; index++) {
                let element = data[index];
                useSimpleData[i][index] = element > 0 ? randomClolor : 0;
            }
        }
        return useSimpleData;
    }

    //#region 本地数据存储相关
    public clearLevelHistoryData() {
        UserScoreLevelData.inst.clearLevelHistoryData();
    }
    public updateLevelHistoryData() {
        //新手引导期间不存关卡数据
        if (SceneMode.gameMode == kGameMode.endless) {
            if (!GuideData.inst.isGuideFinished()) {
                return;
            }
        }

        this.levelData = {
            hardNum: 0, hardType: 0, initDifficulty: 0,
            id: 0,
            board: this.tableData,
            score: this.scoreHelper.score,
            skillScore: this.scoreHelper.skillScore,
            continuousCount: this.scoreHelper.continuousCount,
            collect: null,
            preview: this.getPreviewsStoreData(),
            reviviTimes: this.reviviTimes,
            refreshTimes: this.adRefreshBlockTimes,
            refreshAllTimes: this.refreshAllTimes,
            changeAllTimes: this.changeAllTimes,
            isGameOver: this.isGameOver ? 1 : 0,
            round: this.blockGenerate.round || 0
        };
        //无尽模式需要记录的难度
        if (SceneMode.gameMode == kGameMode.endless) {
            let scoreHelper = this.scoreHelper as EndlessScoreHelper;
            this.levelData.diffcult = scoreHelper.diffcult;
            this.levelData.diffcultScore = scoreHelper.diffcultScore;
        }
        UserScoreLevelData.inst.updateLevelHistoryData(this.levelData);
    }
    protected getPreviewsStoreData() {
        let previews = [];
        for (let index = 0; index < 3; index++) {
            let previewBlock = {};
            let element = this.blockPlacesMap.get(index);
            if (element && element.isValid) {
                let cmpt = element.getComponent(BlockPlaceholder3);
                if (cmpt && !cmpt.hasPut) {
                    previewBlock = {
                        order: index,
                        used: 0,
                        config: cmpt.blocksData,
                        bid: cmpt.blockIndex,
                    };
                } else {
                    previewBlock = {
                        order: index,
                        used: 1,
                        config: null,
                        bid: -1,
                    };
                }
            } else {
                previewBlock = {
                    order: index,
                    used: 1,
                    config: null,
                    bid: -2,
                };
            }
            previews.push(previewBlock);
        }
        return previews;
    }
    //#endregion
    //当前关复活
    public relifeCurrentLevel() {
        this.onRelifeCurrentLevelBefore();
        mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
    }
    // private relifeTimes: number = 0;
    private afterRelifeTimes: number = 0;
    /**
     * 复活刷新新块之前的处理
     */
    protected onRelifeCurrentLevelBefore() {
        // this.relifeTimes++;
        //复活后 最多出三次简单块 并且一定概率出可消除块
        // this.afterRelifeTimes = Math.min(this.relifeTimes, 3);
        this.afterRelifeTimes = this.RELIFE_EASY_TIMES;
        this.reviviTimes++;
        mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_RELIFE);
    }
    public retryCurrentLevel() {
        this.clearLevelHistoryData();

        this.startGame();
        mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
        mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_RESTART, true);
    }
    checkClearAllBlock() {
        for (let i = 0; i < BlockConstData.BoardHeight; i++) {
            for (let j = 0; j < BlockConstData.BoardWidth; j++) {
                if (this.tableData[i][j] > 0) {
                    return false;
                }
            }
        }
        return true;
    }
    public getRound() {
        if (this.blockGenerate) {
            return this.blockGenerate.round;
        }
        return;
    }

    public onUpdate(dt) {
        if (this.blockGenerate) {
            this.blockGenerate.onUpdate(dt);
        }
    }

    // 检查是否show enhance hint
    public isShowEnhancedHintRound() {
        if (!this.blockGenerate) {
            return false;
        }

        let currRound = this.getRound();
        if (currRound - this.lastEnhancedRound >= enhancedInterval || currRound == this.lastEnhancedRound) {
            // this.lastEnhancedRound = currRound;
            return true;
        }
        return false;
    }

    // 搭配isShowEnhancedHintRound使用，更新lastEnhancedRound
    public getEnhanceHint() {
        if (!this.blockGenerate) {
            return false;
        }
        let ret = new Array<IBlockHintSequence>();
        this.blockPlacesMap.forEach((value, key) => {
            if (!value) return;
            let blockPlaceHolder = value.getComponent(BlockPlaceholder3);
            if (blockPlaceHolder && !blockPlaceHolder.hasPut) {
                let blockHolderHint = blockPlaceHolder.parseHint()
                if (blockHolderHint) {
                    ret.push(blockHolderHint);
                }
            }
        });

        if (ret.length > 0) {
            ret.sort((a, b) => {
                return a.seq - b.seq;
            })
            this.lastEnhancedRound = this.getRound();
        }

        for (let i = 0; i < ret.length - 1; i++) {
            if (ret[i].seq == ret[i + 1].seq) {
                ret.splice(i, 1);
                i--;
            }
        }

        return ret;
    }

    public removePlaceHolderOneHint() {
        if (!this.blockGenerate) {
            return false;
        }

        this.blockPlacesMap.forEach((value, key) => {
            if (!value) return;
            let blockPlaceHolder = value.getComponent(BlockPlaceholder3);
            blockPlaceHolder.removeOneHint();
        })
    }

    public removePlaceHolderAllHints() {
        if (!this.blockGenerate) {
            return false;
        }

        this.blockPlacesMap.forEach((value, key) => {
            if (!value) return;
            let blockPlaceHolder = value.getComponent(BlockPlaceholder3);
            blockPlaceHolder.removeAllHints();
        })
    }
}

// const win = window as any;

// if (win.Game == null) {
//     win.Game = Game;
// }
