import { director } from "cc";
import { Fsm } from "../FsmState";
import { UserData } from "../../data/UserData";
import { UserHammerData } from "../../data/UserHammerData";
import { UserChangeData } from "../../data/UserChangeData";

export class ProcedureToLevel extends Fsm.FsmState {
    constructor() {
        super("ProcedureToLevel");
    }

    onEnter() {
        super.onEnter();
        // 切换场景
        director.loadScene("level", () => {
            // this.onClearAsset();
            this.onEnterGameScene();
        });

        // 获取数据
    }

    // onClearAsset() {
    //     // mk.subRes.releaseBundle();
    // }
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

    // onUpdate() {
    //     super.onUpdate();
    // }
}

// test
const win = window as any;

if (!win.Procedure) {
    win.Procedure = {};
}

win.Procedure.toLevel = ProcedureToLevel;