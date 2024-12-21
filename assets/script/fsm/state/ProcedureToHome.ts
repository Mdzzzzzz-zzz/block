/*
 * @Date: 2024-06-04 11:49:03
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-06 22:26:05
 */
import { director } from "cc";
import { Fsm } from "../FsmState";

export class ProcedureToHome extends Fsm.FsmState {
    constructor() {
        super("ProcedureToHome");
    }

    onEnter() {
        super.onEnter();

        // 切换场景
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

win.Procedure.toHome = ProcedureToHome;