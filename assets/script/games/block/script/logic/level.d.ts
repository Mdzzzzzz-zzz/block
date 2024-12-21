/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-05 17:26:41
 */
interface ICollectItem {
    key: number;
    value: number;
}
interface ILevelConfig {
    id: number;
    board: number[][];
    score: number;
    hardNum: number;
    skillScore: number;
    continuousCount: number;
    collect: ICollectItem[];
    hardType: number;
    initDifficulty: number;
    reviviTimes: number;
    refreshTimes: number;
    recommend?: [];
    isGameOver: number;
}
interface IPreviewData {
    /**
     * 0 1 2
     */
    order: number;
    /**
     *  0 未使用 1 使用
     */
    used: number;
    /**
     *  保存下来的 simple 有可能上面随机了宝石
     */
    config: number[][];
    /**
     * 块的索引
     */
    bid: number;
}
interface ILevelData extends ILevelConfig {
    preview: IPreviewData[];
    refreshAllTimes: number;
    changeAllTimes: number;
    round: number;
    diffcult?: { [key: number]: number };
    diffcultScore?: number;
    targetScore?: number;
    targetCollect?: ICollectItem[];
}

interface IBlockFillItem {
    blockIndex: number;
    pc: number;//放置行
    pj: number;//放置列
    res: number;//放置后连续最大子矩阵和
    fillFull: number;//放置后可消除行和列数
    count: number;//占用大小
    simple: any;
}
interface IBlockForAiTip {
    item: IBlockFillItem;
    holder: any;
}
