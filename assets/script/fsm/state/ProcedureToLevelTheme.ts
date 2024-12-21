import { director } from "cc";
import { Fsm } from "../FsmState";

export class ProcedureToLevelTheme extends Fsm.FsmState {
    constructor() {
        super("ProcedureToLevelTheme");
    }

    onEnter() {
        super.onEnter();

        // 切换场景
        // director.loadScene("level_theme", () => {
        //     this.onClearAsset();
        // });
        //新版本直接回主界面
        director.loadScene("home", () => {
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

win.Procedure.toLevelSeclect = ProcedureToLevelTheme;