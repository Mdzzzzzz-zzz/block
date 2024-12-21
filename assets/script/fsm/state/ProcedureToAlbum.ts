import { director } from "cc"
import { Fsm } from "../FsmState"

export class ProcedureToAlbum extends Fsm.FsmState {
    constructor() {
        super("ProcedureToAlbum");
    }

    onEnter() {
        super.onEnter();

        director.loadScene("album", () => {
            this.onClearAsset();
        });
    }

    onClearAsset() {

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

win.Procedure.ProcedureToAlbum = ProcedureToAlbum;