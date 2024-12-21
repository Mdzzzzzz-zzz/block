
export class EndlessProgressHelper {

    public static _instance: EndlessProgressHelper;

    public progressStageNumber: number;
    public currentCompleted: number;
    public currentReachPercent: number; //超过百分比玩家动画boardview
    public currentReachEnhance: number; //超过enhance动画分数boardview

    constructor(userId?: number) {
        this.progressStageNumber = 1;
        this.currentCompleted = 0;
        this.currentReachPercent = 1;
        this.currentReachEnhance = 1;
    }

    public static getInstance(): EndlessProgressHelper {
        if (EndlessProgressHelper._instance == null) {
            EndlessProgressHelper._instance = new EndlessProgressHelper();
        }
        return EndlessProgressHelper._instance;
    }

    public resetProgressBar() {
        this.progressStageNumber = 1;
        this.currentCompleted = 0;
    }

    public resetReachPercent() {
        this.currentReachPercent = 1;
    }

    public resetReachEnhance() {
        this.currentReachEnhance = 1;
    }

}
