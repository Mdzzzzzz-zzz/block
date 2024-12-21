import { AdventureLevelGame } from "./AdventureLevelGame";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { emLevCondition } from "./LevelGame";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BlockEventType } from "../define/Event";
import { mk } from "../../../../MK";

export class DailyChallengeLevelGame extends AdventureLevelGame {

    private static _dailychallengeInstance: DailyChallengeLevelGame;

    public static CurrGameDay: number = 0;
    public static CurrGameMonth: number = 0;

    public static get levlInstance() {
        if (DailyChallengeLevelGame._dailychallengeInstance) return DailyChallengeLevelGame._dailychallengeInstance;
        DailyChallengeLevelGame._dailychallengeInstance = new DailyChallengeLevelGame();
        return DailyChallengeLevelGame._dailychallengeInstance;
    }

    public initTableData(): ILevelData {
        const num = this.blockNumber;
        this.zeroTableData(num);

        // if (SceneMode.gameMode == kGameMode.adventure_level) {
        //     if (!LevelGuideData.inst.isGuideFinished()) {
        //         this.initWithGuideData(false, LevelGuideData.inst.getGuideBoard());
        //         this.loadLevelById(false);
        //         return null;
        //     }
        // }
        //加载配置信息
        let historyLevelData = this.getHistoryLevelData();
        //const d = new Date();
        const d = UserDailyChallengeData.inst.getDate();
        let monthDayID = d.getMonth() * 1000 + d.getDate();
        if (historyLevelData && monthDayID == historyLevelData.id) {
            this.historyLevelData = historyLevelData;

            this.scoreHelper.setHistoryData(historyLevelData);
            this.reviviTimes = historyLevelData.reviviTimes || 0;
            this.adRefreshBlockTimes = historyLevelData.refreshTimes || 0;
            this.refreshAllTimes = historyLevelData.refreshAllTimes || 0;
            this.changeAllTimes = historyLevelData.changeAllTimes || 0;

            this.loadLevelByHistory(this.currentLevel, historyLevelData);
            this.onBeginByHistory();
            return historyLevelData;
        }
        this.loadLevelById(true);
        this.onBeginNewGame();
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
            this.canMoveBlock = false;
            BlockEventManager.instance.emit(BlockEventType.EVENT_SCENE_PLAY_LEVEL_COMPLETE, 1);
        }
        return isComplete;
    }
    protected loadLevelByHistory(levId: number, levelData: ILevelData) {
        // //校验关卡合法性
        // let useLevelIndex = Math.min(levId - 1, this.levelTables.length - 1);
        // let useConfig = this.levelTables[useLevelIndex];
        // this.levelConfig = useConfig;

        //const d = new Date();
        const d = UserDailyChallengeData.inst.getDate();
        DailyChallengeLevelGame.CurrGameDay = d.getDate();
        DailyChallengeLevelGame.CurrGameMonth = d.getMonth();
        let m = DailyChallengeLevelGame.CurrGameMonth + 1;
        let configPath = "res/configs/level_month" + m;
        //@ts-ignore
        this.levelTables = mk.subRes.loadJsonConfig(configPath);
        let useConfig = this.levelTables[DailyChallengeLevelGame.CurrGameDay - 1];

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
    public updateLevelHistoryData(): void {
        let collect = [];
        if (this.conditionType == emLevCondition.Collect && this.currentCollects) {
            this.currentCollects.forEach((value, key) => {
                collect.push({ key: key, value: value });
            });
        }
        //const d = new Date();
        const d = UserDailyChallengeData.inst.getDate();
        let monthDayID = d.getMonth() * 1000 + d.getDate();
        let previews = this.getPreviewsStoreData();
        this.levelData = {
            hardNum: 0,
            hardType: 0,
            initDifficulty: 0,
            id: monthDayID,
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
            round: this.blockGenerate.round || 0,
        };
        let test = this.levelData;
        console.log(test);
        UserDailyChallengeData.inst.updateLevelHistoryData(this.levelData);
    }

    public getHistoryLevelData(): ILevelData {
        let historyData = UserDailyChallengeData.inst.getHistoryLevelData();
        if (historyData && historyData.isGameOver == 1) {
            UserDailyChallengeData.inst.clearLevelHistoryData();
            return null;
        }
        return historyData;
    }

    public initLevelData() {
        //const d = new Date();
        const d = UserDailyChallengeData.inst.getDate();
        DailyChallengeLevelGame.CurrGameDay = d.getDate();
        DailyChallengeLevelGame.CurrGameMonth = d.getMonth();
        let m = DailyChallengeLevelGame.CurrGameMonth + 1;
        let configPath = "res/configs/level_month" + m;
        //@ts-ignore
        this.levelTables = mk.subRes.loadJsonConfig(configPath);
        let useConfig = this.levelTables[DailyChallengeLevelGame.CurrGameDay - 1];
        this.levelConfig = useConfig;


    }

    public clearLevelHistoryData() {
        UserDailyChallengeData.inst.clearLevelHistoryData();
    }

    // public retryCurrentLevel() {
    //     this.clearLevelHistoryData();
    //     this.startGame();
    //     mk.sendEvent(BlockEventType.kEvent_Game_Show_New_Blocks);
    //     mk.sendEvent(BlockEventType.EVENT_SCENE_PLAY_RESTART, true);
    //     // this.clearLevelHistoryData();
    //     // this.gotoLevel(this.currentLevel);
    // }
}