import { _decorator, Component, ProgressBar, Label, director } from 'cc';
import { mk } from '../../../../MK';
import { ProcedureToGame } from '../../../../fsm/state/ProcedureToGame';
import { ResManager } from '../../../../resource/ResManager';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';

const { ccclass, property } = _decorator;

@ccclass('loading')
export class loading extends Component {
    @property(ProgressBar)
    loadingProgress: ProgressBar;
    @property(Label)
    loadingLabel: Label;
    @property(Label)
    labelVersion: Label;
    progressNumber: number;

    onLoad () {

        if (mk.fsm.currentState == null) {
            mk.fsm.changeState(ProcedureToGame, "block");
            return;
        }

        this.loadingLabel.string = "";

        this.loadingProgress.node.active = false;

        this.progressNumber = 0;
        this.loadingProgress.progress = 0;

        mk.regEvent(mk.eventType.EVENT_PRELOAD_RES, this.onEvtProgress, this);
        this.labelVersion.string = "version : " + mk.buildInfo.bundle.block.version;
    }

    onDestroy () {
        mk.unRegEvent(this);
    }

    private onEvtProgress (args) {
        this.loadingProgress.node.active = true;
        this.progressNumber = args.finished / args.total;
        if (this.loadingProgress.progress < this.progressNumber) {
            this.loadingProgress.progress = this.progressNumber;
        }
    }
}

