import { Fsm } from "../FsmState";
import { UserData } from "../../data/UserData";
import { director } from "cc";
import { UserHammerData } from "../../data/UserHammerData";
import { UserChangeData } from "../../data/UserChangeData";

export class ProcedureToGame extends Fsm.FsmState {

    protected subGameName: string;
    constructor(args?) {
        args = args ?? "ProcedureToGame";
        super(args);
    }
    onEnter() {
        super.onEnter();
        director.loadScene("game", () => {
            this.onEnterGameScene();
        });
    }
    /**
     * 进入游戏场景后数据处理
     */
    onEnterGameScene() {
        if (UserData.inst.isNewUser) {
            UserHammerData.inst.addItem(1);
            UserChangeData.inst.addItem(1);
            UserData.inst.isNewUser = false;
        }
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

win.Procedure.toTetris = ProcedureToGame;