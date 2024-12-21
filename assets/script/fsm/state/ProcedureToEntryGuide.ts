import { director } from "cc";
import { Fsm } from "../FsmState";
import { UserData } from "../../data/UserData";

export class ProcedureToEntryGuide extends Fsm.FsmState {
    constructor() {
        super("ProcedureToEntryGuide");
    }

    onEnter() {
        super.onEnter();

        director.loadScene("entry_guide", () => {   
            this.onClearAsset();
        });
    }

    onClearAsset() {

    }

    onExit() {
        super.onExit();
    }
}

const win = window as any;

if (!win.Procedure) {
    win.Procedure = {};
}

win.Procedure.ProcedureToEntryGuide = ProcedureToEntryGuide;
