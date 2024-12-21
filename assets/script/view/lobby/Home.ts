import { _decorator, Component,Vec3, ProgressBar, Label } from 'cc';
import { Global } from '../../data/Global';
import { mk } from '../../MK';
const { ccclass, property } = _decorator;

@ccclass('Home')
export class Home extends Component {
    
    @property(ProgressBar)
    loadingProgress: ProgressBar;
    @property(Label)
    loadingLabel: Label;
    @property(Label)
    labelVersion: Label;
    progressNumber: number;

    constructor(){
        super();
    }
    
    onLoad(){
        if (Global.initHome !== true) {
            Global.initHome = true;
        }

        this.progressNumber = 0;
        this.loadingProgress.progress = 0;

        mk.regEvent(mk.eventType.EVENT_PRELOAD_RES, this.onEvtProgress, this);
        this.labelVersion.string = "version : " + mk.buildInfo.bundle['2048'].version;
    }
    
    start() {
        // mk.showView(mk.uiCfg.prefab.menuLayer).then((node)=>{
        //     node.setPosition(Vec3.ZERO);
        // });
    }

    // update(deltaTime: number) {
        
    // }

    onDestroy(){
        mk.unRegEvent(this);
    }

    private onEvtProgress (finished, total) {
        this.progressNumber = finished / total;
        if (this.loadingProgress.progress < this.progressNumber) {
            this.loadingProgress.progress = this.progressNumber;
        }
    }

}

