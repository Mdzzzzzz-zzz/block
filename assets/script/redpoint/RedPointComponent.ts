import { Enum } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { emRedPointKeys, evtRedPoint } from './RedPointDef';
import { RedPointManager } from './RedPointManager';
const { ccclass, property } = _decorator;

@ccclass('RedPointComponent')
export class RedPointComponent extends Component {

    @property(Node)
    ndPoint:Node = null;
    
    @property({ type: Enum(emRedPointKeys) })
    pointType: emRedPointKeys = emRedPointKeys.UnclockLevel;

    @property
    removeAfterClick: boolean = false;
    redPointMgr: RedPointManager;

    onLoad() {
        this.redPointMgr = RedPointManager.getInstance();
        this.redPointMgr.listen(evtRedPoint.Refresh,this.onRefreshPoint,this);
        let num = this.redPointMgr.checkPoint(this.pointType);
        this.ndPoint.active = num>0
    }
    onRefreshPoint(key,enable){
        if (key == this.pointType ){
            this.ndPoint.active = enable;
        }
    }
    onClick(){
        this.ndPoint.active = false
        if(this.removeAfterClick){
            this.redPointMgr.removePoint(this.pointType);
        }
    }
}

