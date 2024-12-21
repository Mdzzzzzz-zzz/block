import { Fsm } from "../FsmState";
import { UserData } from "../../data/UserData";
import { director } from "cc";

export class ProcedureToDailyChallengeHome extends Fsm.FsmState {

    protected subGameName: string;
    constructor(args?) {
        args = args ?? "ProcedureToDailyChallengeHome";
        super(args);
    }
    onEnter() {
        super.onEnter();
        director.loadScene("daily_challenge_home", () => {
            this.onEnterGameScene();
        });
    }
    /**
     * 进入游戏场景后数据处理
     */
    onEnterGameScene() {
    }

    onExit() {
        super.onExit();
    }
}

// test
const win = window as any;

if (!win.Procedure) {
    win.Procedure = {};
}

win.Procedure.ProcedureToDailyChallengeHome = ProcedureToDailyChallengeHome;