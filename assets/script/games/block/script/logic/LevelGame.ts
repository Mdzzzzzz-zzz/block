import { mk } from "../../../../MK";
import { Random } from "../../../../util/Random";
import { Game } from "./Game";
import { LevelScoreHelper } from "./LevelScoreHelper";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BlockEventType } from "../define/Event";
import { BlockItemConst, IBlockType } from "../define/BlockType";
import * as env from "cc/env";
import { BlockPlaceholder3 } from "../boardView/BlockPlaceholder3";
import { UserCollectLevelData } from "../../../../data/UserCollectLevelData";
import { BlockGenerateMasterLevel } from "./BlockGenerateMasterLevel";
import { LevelGuideData } from "../../../../data/LevelGuideData";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { BlockGenetateNative } from "./BlockGenerateNative";
import { BlockGenetateWasm } from "./BlockGenetateWasm";
import { UserData } from "../../../../data/UserData";
export enum emLevCondition {
    None,
    Score,
    Collect,
}
export class LevelGame extends Game {
    private static _instance: LevelGame;
    /**
     * 不要用game inst
     */
    public static get levlInstance() {
        if (LevelGame._instance) return LevelGame._instance;
        LevelGame._instance = new LevelGame();
        return LevelGame._instance;
    }
    public static destroy() {
        LevelGame._instance = null;
    }
    public destroy() {
        this.clear();
        LevelGame._instance = null;
    }
    public startGame() {
        if (this.scoreHelper) {
            this.scoreHelper.clear();
        }
        UserData.inst.setThisGameWatchReviveNum(1);
        this.canMoveBlock = true;
        this.scoreHelper = new LevelScoreHelper();
        this.scoreHelper.loadConfig();
        this.resetGameState();
        this.initLevelData();
        if (this.blockGenerate) {
            this.blockGenerate.clear();
        }
        if (env.NATIVE) {
            this.blockGenerate = new BlockGenetateNative(Random.inst, this.scoreHelper, "level_action_info");
        } else if (env.WECHAT || env.PREVIEW) {
            try {
                this.blockGenerate = new BlockGenetateWasm(null, Random.inst, this.scoreHelper, "level_action_info");
                let initSuccess = this.blockGenerate.initGenetateFill();
                if (!initSuccess) {
                    this.blockGenerate = new BlockGenerateMasterLevel(
                        this.levelConfig,
                        Random.inst,
                        this.scoreHelper,
                        "level_action_info"
                    );
                }
            } catch (error) {
                console.error(error);
                this.blockGenerate = new BlockGenerateMasterLevel(
                    this.levelConfig,
                    Random.inst,
                    this.scoreHelper,
                    "level_action_info"
                );
            }
        } else {
            this.blockGenerate = new BlockGenerateMasterLevel(
                this.levelConfig,
                Random.inst,
                this.scoreHelper,
                "level_action_info"
            );
        }
        this.initTableData();
    }
    protected getMaxRefreshBlockTimes(): number {
        return 2;
    }
    protected getMaxReviviTimes(): number {
        return 2;
    }

    public levelConfig: ILevelConfig;
    public endGame(): void {
        this.tableData = null;
        this.blockGenerate = null;
        this.scoreHelper = null;
    }
    protected currentLevel: number = 0;
    protected maxLevel: number = 0;
    public conditionType: number = 0;
    public targetScore: number = 0;
    public targetCollects: Map<number, number>;
    public currentCollects: Map<number, number>;

    //桌面生成的宝石数量 如果小于当前目标的数量就在推荐块生成
    public tableCollects: Map<number, number>;
    public typeCollects: number[];

    protected levelTables: ILevelConfig[];
    public initNodePool(): void {
        super.initNodePool();
        this.createPool("LevelBlockGroupPool", "res/prefab/blocks/block-normal-level", 3);
    }
    protected getBlockGroupPoolName() {
        return "LevelBlockGroupPool";
    }
    public initLevelData() {
        let configPath = UserCollectLevelData.inst.getLevelConfigPath();
        //@ts-ignore
        this.levelTables = mk.subRes.loadJsonConfig(configPath);
        this.maxLevel = this.levelTables.length;
        this.currentLevel = this.getHistoryLevel();
        if (this.currentLevel > this.maxLevel) {
            this.currentLevel = this.maxLevel;
        }
        this.historyLevelData = null;
        let useLevelIndex = Math.min(this.currentLevel - 1, this.levelTables.length - 1);
        let useConfig = this.levelTables[useLevelIndex];
        this.levelConfig = useConfig;
    }
    public getLevelId() {
        return this.currentLevel;
    }
    public initTableData(): ILevelData {
        const num = this.blockNumber;
        this.zeroTableData(num);

        if (SceneMode.gameMode == kGameMode.level) {
            if (!LevelGuideData.inst.isGuideFinished()) {
                this.initWithGuideData(false, LevelGuideData.inst.getGuideBoard());
                this.loadLevelById(false);
                return null;
            }
        }
        //加载配置信息
        let historyLevelData = this.getHistoryLevelData();
        if (historyLevelData && this.currentLevel == historyLevelData.id) {
            this.historyLevelData = historyLevelData;
            if (env.PREVIEW || env.EDITOR) {
                console.log("历史关卡进入：", historyLevelData);
            }
            this.scoreHelper.setHistoryData(historyLevelData);
            this.reviviTimes = historyLevelData.reviviTimes || 0;
            this.adRefreshBlockTimes = historyLevelData.refreshTimes || 0;
            this.refreshAllTimes = historyLevelData.refreshAllTimes || 0;
            this.changeAllTimes = historyLevelData.changeAllTimes || 0;

            this.loadLevelByHistory(this.currentLevel, historyLevelData);
            return historyLevelData;
        }
        if (env.PREVIEW || env.EDITOR) {
            console.log("非历史关卡进入：", this.currentLevel);
        }

        this.loadLevelById(true);
        return null;
    }

    public checkIsLevelComplete() {
        let isComplete: boolean;
        if (this.conditionType == emLevCondition.Score) {
            isComplete = this.scoreHelper.score >= this.targetScore;
        }
        if (this.conditionType == emLevCondition.Collect) {
            isComplete = true;
            this.targetCollects.forEach((value, key) => {
                if (this.currentCollects.has(key)) {
                    if (this.currentCollects.get(key) < value) {
                        isComplete = false;
                        return;
                    }
                }
            });
        }
        if (isComplete) {
            if (this.currentLevel < this.maxLevel) {
                let nextLevel = this.currentLevel + 1;
                if (nextLevel > this.maxLevel) {
                    nextLevel = this.maxLevel;
                }
                this.updateHistoryLevel(nextLevel);
                this.updateMaxHistoryLevel(nextLevel);
            } else {
                UserCollectLevelData.inst.isAllLevelFinished = 1;
                this.updateHistoryLevel(this.maxLevel);
                this.updateMaxHistoryLevel(this.maxLevel);
            }
            BlockEventManager.instance.emit(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, 1);
        }
        return isComplete;
    }
    /**
     * 放弃关卡复活 1.重试本关 或者失败后 退出了结算界面
     */
    // public giveUpRelife(){
    //     this.clearData();
    // }
    /**
     * 当前关卡复活
     */

    /**
     * 从新挑战关卡
     */
    public retryCurrentLevel() {
        this.clearLevelHistoryData();
        this.startGame();
        mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
        mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_RESTART, true);
        // this.clearLevelHistoryData();
        // this.gotoLevel(this.currentLevel);
    }
    protected getNextLevelNum(): number {
        if (this.currentLevel < this.maxLevel) {
            return this.currentLevel + 1;
        }
        return this.currentLevel;
    }
    /**
     * 进入下一关
     *
     */
    public gotoNextLevel(): boolean {
        this.clearLevelHistoryData();
        if (this.currentLevel >= this.maxLevel) {
            console.log("恭喜全部通关！");
            this.retryCurrentLevel();
            return;
        }
        this.currentLevel = this.getNextLevelNum();
        this.startGame();
        mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
        mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_RESTART, false);
        return true;
    }
    // /**
    //  * 进入指定关卡
    //  * @param lev
    //  */
    // protected gotoLevel(lev: number) {
    //     this.scoreHelper = new LevelScoreHelper();
    //     this.blockGenerate = new BlockGenerate001(Random.inst)
    //     this.loadLevelById(lev);
    //     BlockEventManager.instance.emit(BlockEventType.EVENT_SCENE_PLAY_LEVEL_NEXT);
    //     mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
    // }
    /**
     * 收集道具
     * @param itemId 道具的id
     * @param itemNum 道具的数量
     */
    public collectItem(itemId: number, itemNum: number) {
        if (this.targetCollects.has(itemId)) {
            let max = this.targetCollects.get(itemId);
            let curr = this.currentCollects.get(itemId);
            this.currentCollects.set(itemId, Math.min(max, curr + itemNum));
            // this.checkIsLevelComplete();
        }
    }
    /**
     * 加载关卡的配置 初始化过关条件
     * @param levId
     */
    protected loadLevelById(setTableData: boolean) {
        //校验关卡合法性
        let useConfig = this.levelConfig;
        let board = useConfig.board;
        let rol = this.blockNumber;
        //加载通关条件

        this.targetScore = useConfig.score || 0;
        if (this.targetScore > 0) {
            this.conditionType = emLevCondition.Score;
        }
        if (useConfig.collect.length > 0) {
            this.conditionType = emLevCondition.Collect;
            this.currentCollects = new Map<number, number>();
            this.targetCollects = new Map<number, number>();
            this.tableCollects = new Map<number, number>();
            this.typeCollects = [];
            let arr = useConfig.collect;
            for (let index = 0; index < arr.length; index++) {
                let element = arr[index];
                this.targetCollects.set(element.key, element.value);
                this.currentCollects.set(element.key, 0);
                this.tableCollects.set(element.key, 0);
                if (!this.typeCollects.includes(element.key)) {
                    this.typeCollects.push(element.key);
                }
            }
        }
        // console.log(board);
        //引导的时候不设置桌面数据
        if (setTableData) {
            this.tableData = new Array<Array<number>>();
            for (let i = 0; i < rol; i++) {
                if (this.tableData[i] == null) {
                    this.tableData[i] = new Array<number>();
                }
                for (let j = 0; j < rol; j++) {
                    let boardType = board[i][j];
                    this.tableData[i][j] = boardType;
                    //记录桌面宝石的数量
                    if (this.conditionType == emLevCondition.Collect && boardType > this.diamonTypeStart) {
                        let count = this.tableCollects.get(boardType);
                        this.tableCollects.set(boardType, count + 1);
                    }
                }
            }
        }
    }
    protected loadLevelByHistory(levId: number, levelData: ILevelData) {
        //校验关卡合法性
        let useLevelIndex = Math.min(levId - 1, this.levelTables.length - 1);
        let useConfig = this.levelTables[useLevelIndex];
        this.levelConfig = useConfig;
        let board = levelData.board ? levelData.board : useConfig.board;
        let rol = this.blockNumber;
        //加载通关条件

        this.targetScore = useConfig.score;
        if (this.targetScore > 0) {
            this.conditionType = emLevCondition.Score;
        }
        if (useConfig.collect.length > 0) {
            this.conditionType = emLevCondition.Collect;
            this.currentCollects = new Map<number, number>();
            this.targetCollects = new Map<number, number>();
            this.tableCollects = new Map<number, number>();
            this.typeCollects = [];
            let arr = useConfig.collect;
            for (let index = 0; index < arr.length; index++) {
                let element = arr[index];
                this.targetCollects.set(element.key, element.value);
                this.currentCollects.set(element.key, 0);
                this.tableCollects.set(element.key, 0);
                if (!this.typeCollects.includes(element.key)) {
                    this.typeCollects.push(element.key);
                }
            }
            //根据历史信息初始化收集进度
            let collects = this.historyLevelData.collect;
            if (collects) {
                for (let index = 0; index < collects.length; index++) {
                    let element = collects[index];
                    if (this.currentCollects.has(element.key)) {
                        this.currentCollects.set(element.key, element.value);
                    }
                }
            }
        }
        // console.log(board);
        this.tableData = new Array<Array<number>>();
        for (let i = 0; i < rol; i++) {
            if (this.tableData[i] == null) {
                this.tableData[i] = new Array<number>();
            }
            for (let j = 0; j < rol; j++) {
                let boardType = board[i][j];
                this.tableData[i][j] = boardType;
                //记录桌面宝石的数量
                if (this.conditionType == emLevCondition.Collect && boardType > this.diamonTypeStart) {
                    let count = this.tableCollects.get(boardType);
                    this.tableCollects.set(boardType, count + 1);
                }
            }
        }
    }
    /**
     * 生成块 宝石规则
     * @param blockIndex
     * @param color
     * @returns
     */
    public getBlockSimpleConfig(blockIndex: number, color: number): number[][] {
        if (blockIndex > 1000) {
            return BlockItemConst[blockIndex].simple;
        }
        let block: IBlockType = window["BlockConst"][blockIndex];
        // let simpleData = block.simple;
        //复制一份数据
        let blockConfig = super.getBlockSimpleConfig(blockIndex, color);
        if (block.count < 2) {
            //只有一个不进行随机
            return blockConfig;
        }
        if (this.conditionType == emLevCondition.Collect) {
            let randomKeys = [];
            let fixNum = 3; //todo 盘面宝石生成比目标宝石多的数量和概率
            // if(env.PREVIEW||env.EDITOR){
            //     fixNum  = 100;
            // }
            for (let index = 0; index < this.typeCollects.length; index++) {
                let key = this.typeCollects[index];
                let tarNum = this.targetCollects.get(key);
                let curNum = this.currentCollects.get(key);
                let genNum = this.tableCollects.get(key) || 0;
                if (genNum < tarNum + fixNum) {
                    randomKeys.push(key);
                }
            }
            let isRandomGen: boolean = false;
            if (randomKeys.length > 0) {
                let genKey = randomKeys.length == 1 ? randomKeys[0] : randomKeys.randomObject();
                let rolNum = blockConfig.length;
                for (let i = 0; i < rolNum; i++) {
                    let colNum = blockConfig[i].length;
                    // if(env.PREVIEW||env.EDITOR){
                    //     blockConfig[ rolNum - 1][colNum - 1] = genKey;
                    // }
                    for (let j = 0; j < colNum; j++) {
                        let originType = blockConfig[i][j];
                        if (originType > 0) {
                            let random = Math.random();
                            if (random < 0.5) {
                                blockConfig[i][j] = genKey;
                                isRandomGen = true;
                                this.updateTableCollectNum(genKey, 1);
                                return blockConfig;
                            }
                            if (i == rolNum - 1 && j == colNum - 1) {
                                //最后一个了 直接转换 有可能出现最后一个不是方块的 进入下一次再生成
                                blockConfig[i][j] = genKey;
                                isRandomGen = true;
                                this.updateTableCollectNum(genKey, 1);
                                return blockConfig;
                            }
                        }
                    }
                }
            }
            if (!isRandomGen) {
                //做个保护 如果没有随机过宝石 检查下是不是还有需要收集的 有的话再随机生成下
                for (let index = 0; index < this.typeCollects.length; index++) {
                    let key = this.typeCollects[index];
                    let tarNum = this.targetCollects.get(key);
                    let curNum = this.currentCollects.get(key);
                    if (curNum < tarNum) {
                        randomKeys.push(key);
                    }
                }
                if (randomKeys.length > 0) {
                    let genKey = randomKeys.length == 1 ? randomKeys[0] : randomKeys.randomObject();
                    let rolNum = blockConfig.length;
                    for (let i = 0; i < rolNum; i++) {
                        let colNum = blockConfig[i].length;
                        // if(env.PREVIEW||env.EDITOR){
                        //     blockConfig[ rolNum - 1][colNum - 1] = genKey;
                        // }
                        for (let j = 0; j < colNum; j++) {
                            let originType = blockConfig[i][j];
                            if (originType > 0 && originType < 100) {
                                //找到第一个色块 直接就变成宝石
                                blockConfig[i][j] = genKey;
                                isRandomGen = true;
                                this.updateTableCollectNum(genKey, 1);
                                return blockConfig;
                            }
                        }
                    }
                }
            }
        }
        return blockConfig;
    }

    /**
     * 更新桌面现有宝石的数量
     * @param genKey 宝石的id
     * @param count 宝石的数量
     */
    protected updateTableCollectNum(genKey: number, count: number): void {
        let lastNum = this.tableCollects.get(genKey);
        let curNum = lastNum + count;
        curNum = curNum < 0 ? 0 : curNum;
        this.tableCollects.set(genKey, curNum);
    }
    /**
     * 复活后重新刷推荐块 需要刷新下桌面宝石的状态
     */
    protected onRelifeCurrentLevelBefore(): void {
        super.onRelifeCurrentLevelBefore();
        if (this.conditionType == emLevCondition.Collect) {
            for (let index = 0; index < 3; index++) {
                let element = this.blockPlacesMap.get(index);
                if (element && element.isValid) {
                    let cmpt = element.getComponent(BlockPlaceholder3);
                    let blockData = cmpt.blocksData;
                    blockData &&
                        blockData.forEach((block) => {
                            block.forEach((item) => {
                                if (item > this.diamonTypeStart) {
                                    this.updateTableCollectNum(item, -1);
                                }
                            });
                        });
                }
            }
        }
    }
    //#region  数据处理相关
    public clearLevelHistoryData() {
        UserCollectLevelData.inst.clearLevelHistoryData();
    }
    public updateLevelHistoryData(): void {
        if (SceneMode.gameMode == kGameMode.level) {
            if (!LevelGuideData.inst.isGuideFinished()) {
                return;
            }
        }
        let collect = [];
        if (this.conditionType == emLevCondition.Collect && this.currentCollects) {
            this.currentCollects.forEach((value, key) => {
                collect.push({ key: key, value: value });
            });
        }
        let previews = this.getPreviewsStoreData();
        this.levelData = {
            hardNum: 0, hardType: 0, initDifficulty: 0,
            id: this.currentLevel,
            board: this.tableData,
            score: this.scoreHelper.score,
            skillScore: this.scoreHelper.skillScore,
            continuousCount: this.scoreHelper.continuousCount,
            collect: collect,
            preview: previews,
            reviviTimes: this.reviviTimes,
            refreshTimes: this.adRefreshBlockTimes,
            refreshAllTimes: this.refreshAllTimes,
            changeAllTimes: this.changeAllTimes,
            isGameOver: this.isGameOver ? 1 : 0,
            round: this.blockGenerate.round || 0
        };
        UserCollectLevelData.inst.updateLevelHistoryData(this.levelData);
    }
    public updateHistoryLevel(lev: number) {
        UserCollectLevelData.inst.updateHistoryLevel(lev);
    }
    public getHistoryLevelData(): ILevelData {
        let historyData = UserCollectLevelData.inst.getHistoryLevelData();
        if (historyData && historyData.isGameOver == 1) {
            UserCollectLevelData.inst.clearLevelHistoryData();
            return null;
        }
        return historyData;
    }
    public updateMaxHistoryLevel(lev: number) {
        return UserCollectLevelData.inst.updateMaxHistoryLevel(lev);
    }
    public getHistoryLevel(): number {
        return UserCollectLevelData.inst.getHistoryLevel();
    }
    //#endregion
    public isCanRefreshBlock(): boolean {
        return false;
        // return this.adRefreshBlockTimes < this.getMaxRefreshBlockTimes();
    }
}
