import { Fsm } from "../FsmState";

class ProcedurePreload extends Fsm.FsmState {
    constructor () {
        super("ProcedurePreload");
    }

    onEnter () {
        super.onEnter();
    }

    onExit () {
        super.onExit();
    }

    // onUpdate () {
    //     super.onUpdate();
    // }
}

// test
const win = window as any;

if (!win.Procedure) {
    win.Procedure = {};
}

win.Procedure.launch = ProcedurePreload;
