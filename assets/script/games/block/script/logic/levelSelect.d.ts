interface ILevelSelectBoardCell {
    x: number,
    y: number,
    blockType: number,
    level: number,
    isHard: boolean,
}

interface ILevelShowMyWork {
    x: number,
    y: number,
    blockType: number,
    id: number  // 这个id其实是出现顺序
}

interface ILevelSelectConfig {
    stage: number,
    board: ILevelSelectBoardCell[],
}