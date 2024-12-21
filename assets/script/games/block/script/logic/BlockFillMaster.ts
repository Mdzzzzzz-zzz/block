import { IBlockGenWeight } from "../define/BlockType";
import { BlockConstData } from "../define/BlockConstData";
import { PREVIEW } from "cc/env";

export class BlockFillMaster {
    //大于1的数 至少消除几行进入推荐块备选
    // private minClearFullNum: number = 2;
    /**
     * 生成块至少清除几行进入推荐
     * @returns
     */
    protected getMinClearFullNum() {
        return 1;
    }
    /**
     * 子矩阵至少连续几个进入推荐
     * @returns
     */
    protected getMinMatrixRes() {
        return 0;
    }
    private fillMaxResult: { res: number; fillFull: number } = null;
    computeFillMatrixMaxNum(a, n, m) {
        //从第二行开始将每一行中为1的元素改为从该位置往上连续1的个数
        let fillCol = 0;
        let fillRow = 0;
        for (let i = 1; i < n; i++) {
            let clearRow = true;
            for (let j = 0; j < m; j++) {
                if (a[i][j] == 1 && a[i - 1][j] != 0) {
                    //只向上算连续的1的个数
                    a[i][j] += a[i - 1][j];
                    //如果值为n则满足消除行或列 记录行数和列数
                    if (a[i][j] == n) {
                        fillCol++;
                    }
                }
                //如果满行
                clearRow = clearRow && a[i][j] > 0;
            }
            if (clearRow) {
                fillRow++;
            }
        } /*  */
        // console.log("累积矩阵：", a);
        let res = 0; //res为最终结果
        //遍历矩阵每行算各行的符合条件的最大子矩阵，然后取各行结果maxTemp最大的为最终结果res
        for (let i = 0; i < n; i++) {
            let s = [];
            let j = 1;
            let maxTemp = a[i][0];
            s.push(0);

            while (j < m || (j == m && !(s.length == 0))) {
                //未将矩阵当前行所有元素入栈且（栈为空或当前遍历元素>=栈顶元素）时，
                //将当前元素（矩阵该行的元素下标，如a[i][j]，就将j入栈）入栈
                if (j != m && (s.length == 0 || a[i][j] >= a[i][s[s.length - 1]])) {
                    s.push(j);
                    j++;
                }
                //否则记录下栈顶元素对应在矩阵中的值topNum，并弹出栈顶元素
                //若当前栈不空，则当前弹出元素对应的最大子矩阵1的个数为topNum*(j-s.top()-1)
                //若当前栈空了，则说明弹出的元素为最小元素，其对应最大子矩阵1个数就是topNum*j
                //然后更新一下当前行的最大子矩阵1的个数maxTemp值
                else {
                    let topNum = a[i][s[s.length - 1]];
                    s.pop();
                    let currMax = !(s.length == 0) ? topNum * (j - s[s.length - 1] - 1) : topNum * j;
                    maxTemp = Math.max(currMax, maxTemp);
                }
            }
            res = Math.max(maxTemp, res);
        }
        let fillFull = fillRow + fillCol;
        if (this.fillMaxResult) {
            this.fillMaxResult.res = res;
            this.fillMaxResult.fillFull = fillFull;
        } else {
            this.fillMaxResult = { res: res, fillFull: fillFull };
        }
        return this.fillMaxResult;
    }
    newCopyArr(arr: Array<Array<any>>) {
        return arr.slice().map((row) => row.slice());
    }
    private tableMatrix: Array<Array<number>>;
    private tempMatrix: Array<Array<number>>;

    /**
     *
     * @param tableData 桌面原数据
     * @param blockGroups 可用的组合
     * @param minGetItem 至少需要几个推荐块
     * @param nextPutType 连续推荐分方式 1 深度优先：在第一个基础上继续推荐 2 广度优先：在桌面原数据基础上推荐两个位置不重复的块
     * @param exceptPos 排除的位置
     * @param exceptIds 排除的id
     * @returns
     */
    recommendFillMatrix(
        tableData: Array<Array<number>>,
        blockGroups: Array<IBlockGenWeight>,
        minGetItem: number,
        nextPutType: number,
        exceptPos: Array<number>,
        exceptIds: Array<number>,
        minClearNum: number,
        minMatrixNum: number
    ): Array<IBlockFillItem> {
        var n = BlockConstData.BoardWidth;
        var lastIndex = n - 1;
        if (!this.tableMatrix) {
            this.tableMatrix = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
            this.tempMatrix = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                let tb = tableData[i][j];
                this.tableMatrix[i][j] = tb > 0 ? 1 : 0;
            }
        }
        //将block放置到矩阵里 计算新的最大连续子序列
        let results = [];
        let blockConst = window["BlockConst"];
        blockGroups.forEach((blockGroup) => {
            if (exceptIds.indexOf(blockGroup.index) > -1) {
                return;
            }
            let blockIndex = blockGroup.index - 1;
            if (exceptIds && exceptIds.indexOf(blockGroup.index) > -1) {
                return;
            }
            const block = blockConst[blockIndex];
            if (!block) {
                return;
            }
            let barr = block.simple;
            let bid = block.id;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    let sc = i;
                    let sj = j;
                    //每次放置copy现在的tablle
                    let matrix = this.tableMatrix;
                    let tempMatrix = this.newCopyArr(matrix);
                    let isCanput = true;
                    for (let brow = 0; brow < barr.length; brow++) {
                        let bcolArr = barr[brow];
                        for (let bcol = 0; bcol < bcolArr.length; bcol++) {
                            let tc = sc + brow;
                            let tj = sj + bcol;
                            let tb = bcolArr[bcol];
                            if (tc > lastIndex || tj > lastIndex || (matrix[tc][tj] != 0 && tb > 0)) {
                                isCanput = false;
                                break;
                            }
                            //互斥位置
                            if (exceptPos) {
                                let pindex = tc * 100 + tj;
                                if (exceptPos.indexOf(pindex) > -1) {
                                    isCanput = false;
                                }
                            }
                        }
                        if (!isCanput) {
                            break;
                        }
                    }
                    if (!isCanput) {
                        continue;
                    }
                    //可以放置的位置 刷新下原始matrix 再计算连续子矩阵数量
                    for (let brow = 0; brow < barr.length; brow++) {
                        let bcolArr = barr[brow];
                        for (let bcol = 0; bcol < bcolArr.length; bcol++) {
                            let tc = sc + brow;
                            let tj = sj + bcol;
                            let tb = bcolArr[bcol];
                            if (tb > 0) {
                                tempMatrix[tc][tj] = tb;
                            }
                        }
                    }
                    //可以放置的 计算放置后的连续子序列
                    var data = this.computeFillMatrixMaxNum(tempMatrix, n, n);
                    let res = data.res;
                    let fillFull = data.fillFull;
                    if (res >= minMatrixNum || fillFull >= minClearNum) {
                        //放置没有意义 不能提高连续
                        // console.log( `block ${bid}  放置 ${sc} ${sj} 意义不大 res ${tempRes}}`,)
                        results.push({
                            blockIndex: bid,
                            pc: sc,
                            pj: sj,
                            res: res,
                            fillFull: fillFull,
                            simple: block.simple,
                            count: block.count,
                        });
                        minMatrixNum = Math.max(res, minMatrixNum);
                        minClearNum = Math.max(minClearNum, fillFull);
                    }
                }
            }
        });
        return results;
    }

    /**
     *
     * @param tableData 桌面原数据
     * @param blockGroups 可用的组合
     * @param minGetItem 至少需要几个推荐块
     * @param nextPutType 连续推荐分方式 1 深度优先：在第一个基础上继续推荐 2 广度优先：在桌面原数据基础上推荐两个位置不重复的块
     * @param exceptPos 排除的位置索引 cow*100+col
     * @param exceptIds 排除的id
     * @returns
     */
    public generateRecommendBlock(
        tableData: Array<Array<number>>,
        blockGroups: Array<IBlockGenWeight>,
        minGetItem: number,
        nextPutType: number,
        exceptPos: Array<number>,
        exceptIds: Array<number>,
        minClearNum: number,
        minMatrixNum: number
    ): Array<IBlockFillItem> {
        let results = this.recommendFillMatrix(
            tableData,
            blockGroups,
            minGetItem,
            nextPutType,
            exceptPos,
            exceptIds,
            minClearNum,
            minMatrixNum
        );
        if (results.length == 0) {
            return null;
        }
        if (PREVIEW) {
            console.log("推荐系统总筛选：", results);
        }
        let item = this.computeRecommendBlock(results, minClearNum, minMatrixNum);
        if (item == null) {
            return null;
        }
        //如果计算两个连续
        let recomend = [item];
        if (minGetItem == 1) {
            return recomend;
        }
        if (minGetItem == 2) {
            //再计算深度计算一个
            if (nextPutType == 1) {
                //递进最优
                let tempMatrix = this.tempMatrix; //this.newCopyArr(tableData);
                for (let i = 0; i < tableData.length; i++) {
                    for (let j = 0; j < tableData[i].length; j++) {
                        tempMatrix[i][j] = tableData[i][j];
                    }
                }
                let sc = item.pc;
                let sj = item.pj;
                let barr = item.simple;
                //可以放置的位置 刷新下原始matrix 再计算连续子矩阵数量
                for (let brow = 0; brow < barr.length; brow++) {
                    let bcolArr = barr[brow];
                    for (let bcol = 0; bcol < bcolArr.length; bcol++) {
                        let tc = sc + brow;
                        let tj = sj + bcol;
                        let tb = bcolArr[bcol];
                        if (tb > 0) {
                            tempMatrix[tc][tj] = tb;
                        }
                    }
                }
                //todo 这个位置会合并两次
                let excepts = [item.blockIndex];
                if (exceptIds) {
                    excepts = excepts.concat(exceptIds);
                }
                //利用放置后的矩阵计算一个新的item
                let item2 = this.generateRecommendBlock(
                    tempMatrix,
                    blockGroups,
                    1,
                    0,
                    [],
                    excepts,
                    minClearNum,
                    minMatrixNum
                );
                if (item2) {
                    return recomend.concat(item2);
                }
            } else if (nextPutType == 2) {
                //互斥位置最优 新推荐的放置位置不能和上一个有交集
                let exceptPos = []; //= rol*100+col;
                let sc = item.pc;
                let sj = item.pj;
                let barr = item.simple;
                for (let brow = 0; brow < barr.length; brow++) {
                    let bcolArr = barr[brow];
                    for (let bcol = 0; bcol < bcolArr.length; bcol++) {
                        let tc = sc + brow;
                        let tj = sj + bcol;
                        let tb = bcolArr[bcol];
                        if (tb > 0) {
                            exceptPos.push(tc * 100 + tj);
                        }
                    }
                }
                //todo 这个位置会合并两次
                let excepts = [item.blockIndex];
                if (exceptIds) {
                    excepts = excepts.concat(exceptIds);
                }
                let item2 = this.generateRecommendBlock(
                    tableData,
                    blockGroups,
                    1,
                    0,
                    exceptPos,
                    excepts,
                    minClearNum,
                    minMatrixNum
                );
                if (item2) {
                    return recomend.concat(item2);
                }
            }
        }
        return recomend;
    }
    computeRecommendBlock(results: IBlockFillItem[], minClearNum, minMatrixNum) {
        let clearResult = minClearNum > 0 ? results.filter((item) => item.fillFull >= minClearNum) : [];
        if (clearResult.length > 0) {
            clearResult.sort((a, b) => {
                if (b.fillFull !== a.fillFull) {
                    return b.fillFull - a.fillFull;
                } else {
                    return b.res - a.res;
                }
            });
            let item = this.randomResultWhenResSame(clearResult, 1);
            if (item) {
                if (PREVIEW) {
                    //console.log("推荐系统总筛选 多消除：", clearResult);
                    //console.log("填充推荐的最优 多消除：", item);
                }
                return item;
            }
        }
        let matrixResult = minMatrixNum > 0 ? results.filter((item) => item.res >= minMatrixNum) : results;
        matrixResult.sort((a, b) => {
            if (b.fillFull !== a.fillFull) {
                return b.fillFull - a.fillFull;
            } else {
                return b.res - a.res;
            }
        });
        let item = this.randomResultWhenResSame(matrixResult, 2);
        if (item) {
            if (PREVIEW) {
                console.log("填充推荐 子矩阵和最大：", item);
            }
            return item;
        }
        return null;
    }
    private sameResArr: Array<IBlockFillItem>;
    /**
     *
     * @param arr
     * @param resType 1 按行多消除 2 按连续子矩阵和最大值
     * @returns
     */
    protected randomResultWhenResSame(arr: Array<IBlockFillItem>, resType: number): IBlockFillItem {
        if (arr.length == 0) {
            return null;
        }
        if (arr.length == 1) {
            return arr.shift();
        }
        let maxRes = arr[0];
        if (!this.sameResArr) {
            this.sameResArr = new Array<IBlockFillItem>();
        }
        let sameResArr = this.sameResArr;
        if (resType == 1) {
            arr.forEach((item) => {
                if (item.fillFull == maxRes.fillFull) {
                    sameResArr.push(item);
                }
            });
        } else if (resType == 2) {
            arr.forEach((item) => {
                if (item.res == maxRes.res) {
                    sameResArr.push(item);
                }
            });
        }
        if (sameResArr.length == 1) {
            return sameResArr.shift();
        }
        sameResArr.sort((a, b) => {
            return a.count - b.count;
        });
        let item = sameResArr.shift();
        this.sameResArr.length = 0;
        return item;
    }
    reloadArray(arr, width) {
        let list = [];
        for (let i = 0; i < width; i++) {
            let index = width > arr.length ? arr.length : width;
            let tmpList = arr.splice(0, index);
            list.push(tmpList);
        }
        return list;
    }
    clear() {
        this.tableMatrix = null;
        this.sameResArr = null;
        this.fillMaxResult = null;
    }
}
