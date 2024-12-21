import { director } from "cc";
import { Fsm } from "../FsmState";

export class ProcedureToLevelSeclect extends Fsm.FsmState {
    constructor() {
        super("ProcedureToLevelSeclect");
    }

    onEnter() {
        super.onEnter();

        // 切换场景
        director.loadScene("level_select", () => {
            this.onClearAsset();
        });

        // 获取数据
    }

    onClearAsset() {
        // mk.subRes.releaseBundle();
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

win.Procedure.toLevelSeclect = ProcedureToLevelSeclect;