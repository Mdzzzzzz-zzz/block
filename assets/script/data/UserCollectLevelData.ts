import { mk } from "../MK";
export enum emLevelTheme {
    cat = "cat",
    bear = "bear",
    sheep = "sheep",
    fruit = "fruit",
    qixi = "qixi",
    kaixue = "kaixue",
    moon = "moon",
    fish = "fish",
}
export class UserCollectLevelData {
    private static _inst: UserCollectLevelData = null;
    public static get inst() {
        if (UserCollectLevelData._inst == null) UserCollectLevelData._inst = new UserCollectLevelData();
        return UserCollectLevelData._inst;
    }
    private _k_LevelDataStorage = "LEVEL_GAME_SNAP_SHOT";
    public get k_LevelDataStorage() {
        let theme = this.getLevelThemeName();
        if (theme == emLevelTheme.cat) {
            return this._k_LevelDataStorage;
        }
        return this._k_LevelDataStorage + "_" + theme;
    }
    // public set k_LevelDataStorage(value) {
    //     this._k_LevelDataStorage = value;
    // }
    //当前选择的关卡
    private _k_LevelProgressStorage = "LEVEL_GAME_PROGRESS";
    public get k_LevelProgressStorage() {
        let theme = this.getLevelThemeName();
        if (theme == emLevelTheme.cat) {
            return this._k_LevelProgressStorage;
        }
        return this._k_LevelProgressStorage + "_" + theme;
    }
    // public set k_LevelProgressStorage(value) {
    //     this._k_LevelProgressStorage = value;
    // }
    private _k_LevelFinishState = "LevelFinishState";
    public get k_LevelFinishState() {
        let theme = this.getLevelThemeName();
        if (theme == emLevelTheme.cat) {
            return this._k_LevelFinishState;
        }
        return this._k_LevelFinishState + "_" + theme;
    }
    // public set k_LevelFinishState(value) {
    //     this._k_LevelFinishState = value;
    // }
    private _k_LevelGameTheme = "LEVEL_GAME_THEME";
    public get k_LevelGameTheme() {
        return this._k_LevelGameTheme;
    }
    // public set k_LevelGameTheme(value) {
    //     this._k_LevelGameTheme = value;
    // }
    //当前最大的关卡
    private _k_LevelMAXProgress = "k_LevelMAXProgress";
    public get k_LevelMAXProgress() {
        let theme = this.getLevelThemeName();
        if (theme == emLevelTheme.cat) {
            return this._k_LevelMAXProgress;
        }
        return this._k_LevelMAXProgress + "_" + theme;
    }
    // public set k_LevelMAXProgress(value) {
    //     this._k_LevelMAXProgress = value;
    // }
    // protected getLevelDataStorageKey() {
    //     return ;
    // }
    // protected getLevelProgressStorageKey() {
    //     return "LEVEL_GAME_PROGRESS";
    // }

    public updateLevelHistoryData(data: ILevelData): void {
        mk.setItem(this.k_LevelDataStorage, data);
    }
    /**
     * 更新历史进入关卡
     * @param lev
     */
    public updateHistoryLevel(lev: number) {
        let level = mk.setItem(this.k_LevelProgressStorage, lev);
    }
    public getHistoryLevelData(): ILevelData {
        return mk.getItem(this.k_LevelDataStorage);
    }
    /**
     * 更新历史最大关卡
     * @param lev
     */
    public updateMaxHistoryLevel(lev: number) {
        let maxLevel = this.getMaxHistoryLevel();
        if (lev > maxLevel) {
            mk.setItem(this.k_LevelMAXProgress, lev);
        }
    }
    public getMaxHistoryLevel(): number {
        let maxLevel = mk.getItem(this.k_LevelMAXProgress);
        if (maxLevel == null || maxLevel == undefined) {
            maxLevel = this.getHistoryLevel() || 1;
            mk.setItem(this.k_LevelMAXProgress, maxLevel);
        }
        return maxLevel;
    }
    public getMaxHistoryLevelByTheme(theme: string) {
        let key = "";
        if (theme == emLevelTheme.cat) {
            key = this._k_LevelMAXProgress;
        } else {
            key = this._k_LevelMAXProgress + "_" + theme;
        }
        let maxLevel = mk.getItem(key);
        if (maxLevel == null || maxLevel == undefined) {
            maxLevel = this.getHistoryLevelWithTheme(theme) || 1;
            mk.setItem(key, maxLevel);
        }
        return maxLevel;
    }
    public getHistoryLevel(): number {
        let level = mk.getItem(this.k_LevelProgressStorage);
        if (!level) {
            // this.updateHistoryLevel(1);
            //test data
            return 1;
        }
        return level;
    }
    public getHistoryLevelWithTheme(theme: string): number {
        let s = this._k_LevelProgressStorage;
        if (theme != emLevelTheme.cat) {
            s = this._k_LevelProgressStorage + "_" + theme;
        }
        let level = mk.getItem(s);
        if (!level) {
            // this.updateHistoryLevel(1);
            //test data
            return 1;
        }
        return level;
    }
    public get isAllLevelFinished(): number {
        return mk.getItem(this.k_LevelFinishState, 0);
    }
    public set isAllLevelFinished(value: number) {
        mk.setItem(this.k_LevelFinishState, value);
    }
    public getIsAllLevelFinishedByTheme(theme: string) {
        let key = "";
        if (theme == emLevelTheme.cat) {
            key = this._k_LevelFinishState;
        } else {
            key = this._k_LevelFinishState + "_" + theme;
        }
        return mk.getItem(key, 0);
    }
    public clearLevelHistoryData() {
        mk.removeItem(this.k_LevelDataStorage);
    }
    public clearLevelFinishdData() {
        mk.removeItem(this.k_LevelFinishState);
    }
    /**
     * 获取主名称
     * @returns 主题名称["cat","bear"]
     */
    public getLevelThemeName(): string {
        return mk.getItem(this.k_LevelGameTheme, emLevelTheme.fish);
    }
    /**
     * 设置主题名称
     * @param theme
     */
    public setLevelThemeName(theme: string) {
        mk.setItem(this.k_LevelGameTheme, theme);
    }
    /**
     * 根据主题获取关卡配置的路径
     * @returns
     */
    public getLevelConfigPath(): string {
        let levelInfo = mk.buildInfo.bundle.level;
        let themeName = this.getLevelThemeName();
        let path = levelInfo[themeName];
        if (path) {
            return path;
        }
        return "res/configs/level";
    }
    public getLevelBlockConfigPath(): string {
        //level_block level_bear_lock
        return this.getLevelConfigPath() + "_block";
    }

    //#region 统计在线时关卡失败次数 失败三次的关卡推荐行的筛选难度降低一下
    protected levelFailRecords: Record<string, Record<number, number>>;
    public resetLevelFail(theme: string, lev: number) {
        if (!this.levelFailRecords) {
            this.levelFailRecords = {};
        }
        if (!this.levelFailRecords[theme]) {
            this.levelFailRecords[theme] = {};
        }
        this.levelFailRecords[theme][lev.toString()] = 0;
    }
    public recordLevelFail(theme: string, lev: number) {
        if (!this.levelFailRecords) {
            this.levelFailRecords = {};
        }
        if (!this.levelFailRecords[theme]) {
            this.levelFailRecords[theme] = {};
        }
        let lastCount = this.levelFailRecords[theme][lev.toString()] || 0;
        this.levelFailRecords[theme][lev.toString()] = lastCount + 1;
    }
    public getLevelFailTimes() {
        let theme: string = this.getLevelThemeName();
        let lev: number = this.getHistoryLevel();
        if (!this.levelFailRecords) {
            return 0;
        }
        if (!this.levelFailRecords[theme]) {
            return 0;
        }
        return this.levelFailRecords[theme][lev.toString()] || 0;
    }
    //#endregion
}
